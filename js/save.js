// ZAPIS GRY (localStorage). Osobny zapis dla trybu DEV i dla zwykłej gry, więc przełączanie DEV nie kasuje postępu.
// Zapisywane: postać (me), oba zestawy ekwipunku, plecak, złoto, drzewko skilli, cały stan łowienia (w tym Fishpedia),
// postęp Wyprawy / Lochów, aktywne zwoje i przedmiot w slocie Tackle Upgrade.
// t = czas zapisu – po powrocie do gry liczymy z niego postęp offline (ui.js → processOffline).
import { DEV, FIXED_ITEMS } from './data.js';
import { ROD_TIERS, HOOK_TIERS } from './fishing.js';
import {
  me, eq1, eq2, inv, up, upgTree, fishing, upgradeItem, locUnlocked, actsUnlocked, dprog, buffStrEnd, buffDexEnd, dunMsgClosed, foodBuff,
  setLocUnlocked, setActsUnlocked, setDprog, setBuffStrEnd, setBuffDexEnd, setUpgradeItem, setDunMsgClosed
} from './state.js';

export const SAVE_KEY = DEV ? 'arena_save_dev' : 'arena_save';
const SAVE_VER = 1;
const SAVE_EVERY = 5000;   // autozapis co 5 s (+ przy zamknięciu / zminimalizowaniu karty)

// Stare zapisy: FP sprzętu rybackiego przeliczane z AKTUALNYCH tabel (po zmianach balansu przedmioty w zapisie mają stare FP).
// fixed → FIXED_ITEMS, wędka → ROD_TIERS, haczyk → HOOK_TIERS, Uncommon Ring / Amulet z craftingu → 25 (CRAFT_FISH_FP w ui.js). Unikaty bez zmian.
const syncFp = i => {
  if (!i || !i.isFishGear || i.unique) return;
  if (i.fixed && FIXED_ITEMS[i.fixed]) i.fp = FIXED_ITEMS[i.fixed].fp;
  else if (i.sl === 'weapon' && ROD_TIERS[i.r]) { i.fp = ROD_TIERS[i.r].fp; i.name = ROD_TIERS[i.r].name; }   // nazwa też z tabeli (Common Rod → Uncommon Rod)
  else if (i.sl === 'hook' && HOOK_TIERS[i.r]) { i.fp = HOOK_TIERS[i.r].fp; i.name = HOOK_TIERS[i.r].name; }
  else if ((i.sl === 'ring' || i.sl === 'amulet') && i.r === 1) i.fp = 25;
};
// podmienia zawartość obiektu, zachowując TEN SAM obiekt (inne moduły trzymają do niego referencję)
const fill = (dst, src) => { Object.keys(dst).forEach(k => delete dst[k]); Object.assign(dst, src || {}); };

let disabled = false;   // po „New game” nie zapisujemy już nic przed przeładowaniem strony

export function saveGame() {
  if (disabled) return;
  const s = {
    v: SAVE_VER, t: Date.now(),
    me, eq1, eq2, inv, gold: window.G_GLOBAL, up, upgTree, fishing, upgradeItem,
    locUnlocked, actsUnlocked, dprog, buffStrEnd, buffDexEnd, dunMsgClosed, foodBuff
  };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) { console.warn('Save failed', e); }
}

// Wczytuje zapis (jeśli jest). Zwraca czas poprzedniego zapisu (ms) albo 0, gdy to nowa gra.
export function loadGame() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { console.warn('Save is corrupted – starting a new game', e); }
  if (!s || !s.v) return 0;
  fill(foodBuff, s.foodBuff || { kind: null, pct: 0, end: 0 });
  fill(me, s.me); fill(eq1, s.eq1); fill(eq2, s.eq2); fill(up, s.up); fill(upgTree, s.upgTree); fill(fishing, s.fishing);
  inv.length = 0; (s.inv || []).forEach(i => inv.push(i));
  if (typeof s.gold === 'number') window.G_GLOBAL = s.gold;
  setUpgradeItem(s.upgradeItem || null);
  [...inv, ...Object.values(eq1), ...Object.values(eq2), s.upgradeItem].forEach(syncFp);
  setLocUnlocked(s.locUnlocked || 0); setActsUnlocked(!!s.actsUnlocked); setDprog(s.dprog || 0);
  setBuffStrEnd(s.buffStrEnd || 0); setBuffDexEnd(s.buffDexEnd || 0); setDunMsgClosed(!!s.dunMsgClosed);
  return s.t || 0;
}

// Nowa gra: kasuje zapis TEGO trybu (DEV albo zwykłego) i przeładowuje stronę
export function resetSave() {
  disabled = true;
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  location.reload();
}

export function startAutosave() {
  setInterval(saveGame, SAVE_EVERY);
  window.addEventListener('beforeunload', saveGame);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveGame(); });
}
