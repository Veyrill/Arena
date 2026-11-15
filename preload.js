// Electron – most między oknem a grą (bez dostępu gry do Node.js): window.arenaApp
//   isFullscreen()      – czy okno jest teraz na pełnym ekranie
//   setFullscreen(true) – pełny ekran (false = okno)
//   onFullscreen(fn)    – wywołuje fn(true / false) przy każdej zmianie trybu (także F11)
const { contextBridge, ipcRenderer } = require('electron');
let full = ipcRenderer.sendSync('arena:isFullscreen');
const cbs = [];
ipcRenderer.on('arena:fullscreen', (_, v) => { full = v; cbs.forEach(f => { try { f(v); } catch (e) {} }); });
contextBridge.exposeInMainWorld('arenaApp', {
  isFullscreen: () => full,
  setFullscreen: v => ipcRenderer.send('arena:setFullscreen', !!v),
  onFullscreen: f => { cbs.push(f); }
});
