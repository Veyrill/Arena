// Electron: otwiera grę (index.html) w osobnym oknie, bez menu i bez skrótów przeglądarki.
// TRYB WYŚWIETLANIA: Windowed / Fullscreen – przełączany w grze (Settings) albo klawiszem F11; zapamiętywany w pliku
// arena-settings.json w folderze danych aplikacji (np. %APPDATA%/arena) i przywracany przy następnym uruchomieniu.
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const SETTINGS = () => path.join(app.getPath('userData'), 'arena-settings.json');
const loadSettings = () => { try { return JSON.parse(fs.readFileSync(SETTINGS(), 'utf8')); } catch (e) { return {}; } };
const saveSettings = s => { try { fs.writeFileSync(SETTINGS(), JSON.stringify(s)); } catch (e) {} };

function createWindow() {
  const settings = loadSettings();
  const win = new BrowserWindow({
    width: 1600, height: 950,          // rozmiar startowy okna
    minWidth: 1280, minHeight: 720,    // mniejsze okno rozjeżdżałoby układ gry
    fullscreen: !!settings.fullscreen, // ostatnio wybrany tryb
    backgroundColor: '#1d1812',        // ciemne tło od razu (bez białego błysku przy starcie)
    autoHideMenuBar: true,
    title: 'Arena',
    webPreferences: {
      devTools: !app.isPackaged,       // narzędzia deweloperskie tylko w trakcie pracy, nie w wersji dla gracza
      preload: path.join(__dirname, 'preload.js')   // most do gry: window.arenaApp (tryb pełnoekranowy)
    }
  });
  win.setMenu(null);                   // bez menu Plik / Edycja / Widok
  win.loadFile('index.html');

  // zmiana trybu (z gry, F11 albo systemu) → zapis w pliku ustawień + informacja dla gry (przyciski w Settings)
  const sync = () => { const v = win.isFullScreen(); saveSettings(Object.assign(loadSettings(), { fullscreen: v })); win.webContents.send('arena:fullscreen', v); };
  win.on('enter-full-screen', sync);
  win.on('leave-full-screen', sync);

  // blokada zachowań przeglądarki: przeładowanie (F5, Ctrl+R), zoom (Ctrl + / - / 0); F11 = pełny ekran / okno
  win.webContents.on('before-input-event', (e, input) => {
    const k = input.key.toLowerCase();
    if (k === 'f5' || (input.control && ['r', '=', '+', '-', '0'].includes(k))) e.preventDefault();
    if (k === 'f11' && input.type === 'keyDown') { e.preventDefault(); win.setFullScreen(!win.isFullScreen()); }
  });
  win.webContents.setZoomFactor(1);
  win.webContents.on('zoom-changed', () => win.webContents.setZoomFactor(1));   // blokada zoomu Ctrl + kółko myszy
}

// gra pyta o tryb i prosi o zmianę (Settings → Display mode)
ipcMain.on('arena:isFullscreen', e => { const w = BrowserWindow.fromWebContents(e.sender); e.returnValue = !!(w && w.isFullScreen()); });
ipcMain.on('arena:setFullscreen', (e, v) => { const w = BrowserWindow.fromWebContents(e.sender); if (w) w.setFullScreen(!!v); });

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
