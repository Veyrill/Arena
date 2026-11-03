import { DEV, SL, NAMES, RAR, ST, LOCS, ACTS, ALL_LOCS, ACT_START, DUN, UPG, SKILL_ICON_CENTER, MATS, FISH, FISH_LOCKED, R, I, P, UNIQUES, makeUnique, FIXED_ITEMS, makeFixed, FISH_SETS, GEAR_SETS, namesFor, devFlag, DEV_TIME, PANEL_KEY, setTimeOff } from './data.js';
import { me, eq1, eq2, inv, G, up, upgTree, fishing, upgradeItem, equipPage, currentZoom, panX, panY, panMoved, panDrag, view, eloc, esel, dloc, dprog, busy, cdEnd, sellMode, drag, lastMob, showInfo, showDunUnlockMsg, dunMsgClosed, showNoRodMsg, buffStrEnd, lastMouseE, setEquipPage, setView, setEloc, setEsel, setDloc, setDprog, setBusy, setSellMode, setLastMouseE, setDrag, setPanDrag, setPanMoved, setPanX, setPanY, setCurrentZoom, setShowInfo, setLastMob, setShowDunUnlockMsg, setDunMsgClosed, setShowNoRodMsg, setCdEnd, setBuffStrEnd, buffDexEnd, setBuffDexEnd, foodBuff, setUpgradeItem, eact, actsUnlocked, setEact, setActsUnlocked, locUnlocked, setLocUnlocked, gear, der, ub, mstats, HP_MUL, ENEMY_HP, CRIT_K, CRIT_C, CRIT_CAP } from './state.js';
import { hasRod, buyRod, upgradeRod, upgradeGear, upgradeCost, makeRod, makeHook, isRod, isUpgradable, gearLevel, gearMaxLevel, previewGear, fishPower, canFish, ROD_TIERS, HOOK_TIERS } from './fishing.js';
import { hit, armorRed, ARMOR_K } from './combat.js';
import { loadGame, saveGame, resetSave, startAutosave, SAVE_KEY } from './save.js';

// Nazwa folderu z grafikami (obok index.html). Jeśli u Ciebie to "assety", zmień tutaj.
const ASSETS_DIR = 'assets';
// Grafiki broni w assets/weapon (nazwy plików bez .png): pixel art 16×16 (plik 64×64) – miecz, buława, topór.
// Grafika wynika z nazwy broni (Sword → miecz, Mace → młot, Axe → dwustronny topór; Dagger usunięty – stare → miecz); stare zapisy (sword_iron itp.) też dostają nową grafikę wg nazwy
const WEAPON_SPRITES = ['weapon_sword', 'weapon_mace', 'weapon_axe'];
const weaponSprite = i => WEAPON_SPRITES.includes(i.ic) ? i.ic : /Axe/.test(i.name || '') ? 'weapon_axe' : /Mace|Hammer/.test(i.name || '') ? 'weapon_mace' : 'weapon_sword';   // stary Dagger → miecz
// Grafiki amuletów w assets/amulet (nazwy plików bez .png). Amulet z dropu losuje jedną z nich.
const AMULET_SPRITES = ['amulet_emerald', 'amulet_frost', 'amulet_ruby'];
// Grafiki zbroi w assets/armor (nazwy plików bez .png) – pixel art 16×16, jak reszta przedmiotów.
// AKT 1: pixel art 16×16 (plik 64×64); grafika wynika z nazwy zbroi (Tunic / Chainmail / Cuirass), stare zapisy też dostają nową grafikę wg nazwy.
const ARMOR_SPRITES = ['armor_tunic', 'armor_chainmail', 'armor_cuirass', 'armor_plate', 'armor_scale', 'armor_brigandine'];   // akt 2: Plate Armor / Scale Mail / Brigandine
// Grafiki hełmów w assets/helm – AKT 1, pixel art 16×16; grafika wg nazwy (Hood / Cap / Helmet), stare zapisy (tile000…) też wg nazwy.
const HELM_SPRITES = ['helm_hood', 'helm_cap', 'helm_helmet', 'helm_knight', 'helm_drake', 'helm_shadow'];   // akt 2: Knight / Drake / Shadow Helm
// Grafiki pierścieni w assets/ring – AKT 1, pixel art 16×16; grafika wg nazwy (Band / Ring / Signet), stare zapisy (tile390…) też wg nazwy.
const RING_SPRITES = ['ring_band', 'ring_ring', 'ring_signet'];
// Grafiki talizmanów w assets/trinket – pixel art 16×16; grafika wg nazwy (Chalice / Stone of Hope / Lucky Clover).
// Stare zapisy (Talisman, Relic, Amulet of Fate – nazwy już nie losowane) dostają kamień.
const TRINKET_SPRITES = ['trinket_chalice', 'trinket_stone', 'trinket_clover'];
const trinketSprite = i => TRINKET_SPRITES.includes(i.ic) ? i.ic : /Chalice/.test(i.name || '') ? 'trinket_chalice' : /Clover/.test(i.name || '') ? 'trinket_clover' : 'trinket_stone';
const ringSprite = i => RING_SPRITES.includes(i.ic) ? i.ic : /Band/.test(i.name || '') ? 'ring_band' : /Signet/.test(i.name || '') ? 'ring_signet' : 'ring_ring';
const helmSprite = i => HELM_SPRITES.includes(i.ic) ? i.ic : /Knight Helm/.test(i.name || '') ? 'helm_knight' : /Drake Helm/.test(i.name || '') ? 'helm_drake' : /Shadow Helm/.test(i.name || '') ? 'helm_shadow' : /Hood/.test(i.name || '') ? 'helm_hood' : /Cap/.test(i.name || '') ? 'helm_cap' : 'helm_helmet';
const armorSprite = i => ARMOR_SPRITES.includes(i.ic) ? i.ic : /Plate Armor/.test(i.name || '') ? 'armor_plate' : /Scale Mail/.test(i.name || '') ? 'armor_scale' : /Brigandine/.test(i.name || '') ? 'armor_brigandine' : /Chainmail/.test(i.name || '') ? 'armor_chainmail' : /Cuirass/.test(i.name || '') ? 'armor_cuirass' : 'armor_tunic';
// Grafiki butów w assets/boots (nazwy plików bez .png). Buty z dropu losują jedną z nich.
const BOOTS_SPRITES = ['boots_leather', 'boots_steel', 'boots_fur'];
// Grafiki rękawic w assets/gloves (nazwy plików bez .png). Rękawice z dropu losują jedną z nich.
const GLOVES_SPRITES = ['gloves_leather', 'gloves_steel', 'gloves_fur'];
// Grafiki tarcz w assets/shield (nazwy plików bez .png). Tarcza z dropu losuje jedną z nich.
const SHIELD_SPRITES = ['shield_wood', 'shield_ruby', 'shield_emerald', 'shield_knight', 'shield_drake', 'shield_shadow'];   // akt 2: Knight / Drake / Shadow Shield

const $ = id => document.getElementById(id);
// Własne ikony interfejsu (pixel art 16×16, plik 64×64) z assets/ui; gdy pliku brak – emoji. 32 px = ×2, ostre piksele.
// ZŁOTO: ikona monety (pixel art 16×16, assets/ui/ui_gold.png) – przy cenach, Value, panelu Gold, przycisku Sell; brak pliku → 💰
const goldIco = (px = 16) => `<img src="${ASSETS_DIR}/ui/ui_gold.png" alt="" draggable="false" style="width:${px}px;height:${px}px;image-rendering:pixelated;vertical-align:-3px" onerror="this.outerHTML='💰'">`;
// SKILL POINT: ikona gwiazdy (pixel art 16×16, assets/ui/ui_sp.png) – panel Skill Points, koszt skilla w dymku, animacja level-upu.
// Atrybuty w apostrofach, żeby ikonę dało się wstawić do data-tip="…"; brak pliku → ikona znika.
const spIco = (px = 16) => `<img src='${ASSETS_DIR}/ui/ui_sp.png' alt='' draggable='false' style='width:${px}px;height:${px}px;image-rendering:pixelated;vertical-align:-3px' onerror='this.remove()'>`;
const uiIco = (f, e, px = 32, extra = '') => `<img src="${ASSETS_DIR}/ui/${f}.png" alt="" style="display:block;width:${px}px;height:${px}px;image-rendering:pixelated;${extra}" onerror="this.outerHTML='<span class=\\'ic\\' style=\\'font-size:28px\\'>${e}</span>'">`;
const slp = ms => new Promise(r => setTimeout(r, ms));

window.G_GLOBAL = G;
// ZAPIS GRY: wczytanie zapisu (save.js) zanim cokolwiek się narysuje; savedAt = czas poprzedniego zapisu (0 = nowa gra) – do postępu offline
const savedAt = loadGame();
// stary zapis: Fire Lord pokonany, gdy Akt 2 jeszcze nie istniał → od razu odblokuj pierwszą lokację Aktu 2
if (actsUnlocked && locUnlocked < ACT_START[1]) setLocUnlocked(ACT_START[1]);
// POSTĘP W LOKACJI: me.eprog[indeks lokacji] = ilu przeciwników po kolei pokonano; przeciwnik i dostępny, gdy i <= eprog.
// Stary zapis (bez eprog): wszystkie odblokowane dotąd lokacje w całości dostępne. Nowa gra: od pierwszego przeciwnika.
if (!me.eprog) { me.eprog = {}; if (savedAt) for (let li = 0; li <= locUnlocked; li++) me.eprog[li] = ALL_LOCS[li] ? ALL_LOCS[li].mobs.length : 0; }
// DEV: „Unlock all content” (panel DEV) – wszystkie akty, lokacje, przeciwnicy i loch dostępne od razu
const UNLOCK = () => devFlag('unlockall', false);
const locOpen = i => UNLOCK() || i <= locUnlocked;
const actsOn = () => UNLOCK() || actsUnlocked;
const mobOpen = (li, i) => UNLOCK() || i <= ((me.eprog || {})[li] || 0);
const dunProg = () => UNLOCK() ? DUN.mobs.length : dprog;
const dunLvlOk = () => UNLOCK() || me.lvl >= 10;
// stary zapis: w lochu było 10 przeciwników, teraz jest 1 → postęp nie większy niż liczba przeciwników
if (dprog > DUN.mobs.length) setDprog(DUN.mobs.length);
// przedmioty o stałych statystykach: wymagany poziom zawsze aktualny z FIXED_ITEMS (np. komplet Forgotten: 10 → 12)
[eq1, eq2].forEach(e => Object.values(e).forEach(i => { if (i && i.fixed && FIXED_ITEMS[i.fixed] && FIXED_ITEMS[i.fixed].req) i.req = FIXED_ITEMS[i.fixed].req; }));
inv.forEach(i => { if (i && i.fixed && FIXED_ITEMS[i.fixed] && FIXED_ITEMS[i.fixed].req) i.req = FIXED_ITEMS[i.fixed].req; });
// stary zapis: bronie z obrażeniami jako mnożnik (np. ×1.4–2.0) albo ze starym wzorem → nowe obrażenia wg poziomu postaci (Rusty Sword: 3-6)
{ const fixW = i => {
    if (i && i.d && !i.fixed && !i.rust && i.dv === 2) { i.d = [Math.max(1, Math.round(i.d[0] * 0.9)), Math.max(2, Math.round(i.d[1] * 0.9))]; i.dv = 3; }   // broń z poprzedniej wersji: −10% obrażeń
    if (i && i.d && !i.fixed && (i.d[1] <= 5 || i.d[0] % 1 || (i.dv !== 3 && !i.rust))) { i.d = i.rust ? [4, 6] : wpnDmg(me.lvl); i.dv = 3; }
    if (i && i.rust && i.d) i.d = [4, 6]; };   // Rusty Sword: zawsze 4-6
  [eq1, eq2].forEach(e => Object.values(e).forEach(fixW)); inv.forEach(fixW); }

// zmiana setu ekwipunku zablokowana podczas walki
window.setEquipPage = p => { if (busy) return; setEquipPage(p); render(); };
window.closeDunMsg = () => { setDunMsgClosed(true); render(); };
window.closeQuestMsg = () => { me.questMsgClosed = 1; render(); };   // popup „Quests unlocked!” (od 5 poziomu) – zamknięcie zapisane w postaci
window.closeNoRodMsg = () => { setShowNoRodMsg(false); render(); };
window.buyRod = () => { buyRod(render, t => say(t)); };
window.upgradeRod = () => { upgradeRod(render, t => say(t)); };
// ulepszenie wędki albo haczyka ze slotu ulepszania (zakładka Tackle Upgrade)
window.upgradeGear = () => { upgradeGear(render, (t, c) => say(t, c)); };
window.removeUpgradeItem = () => {
  if (upgradeItem) {
    inv.push(upgradeItem);
    setUpgradeItem(null);
    render();
  }
};

// ZWOJE: kind = rodzaj zwoju. Każdy daje +10% statystyki na 30 min. Stare zwoje bez "kind" traktujemy jako siły.
const SCROLLS = {
  str: { name: 'Scroll of Strength', stat: 'Strength', e: '📜', img: 'scrolls/scroll_str.png', mats: [['meat', 2], ['claw', 1]], gold: 200 },
  dex: { name: 'Scroll of Dexterity', stat: 'Dexterity', e: '📃', img: 'scrolls/scroll_dex.png', mats: [['bone', 2], ['skull', 1]], gold: 500 }
};
// grafika zwoju: pixel art 24×24 (plik 96 px) → wyświetlać w wielokrotności 24 (24 / 48 px), bez wygładzania; brak pliku → emoji
const scrollIco = (k, px) => `<img src="${ASSETS_DIR}/${SCROLLS[k].img}" alt="" draggable="false" style="width:${px}px;height:${px}px;image-rendering:pixelated;vertical-align:middle" onerror="this.outerHTML='<span class=\\'ic\\' style=\\'font-size:${Math.round(px * 0.7)}px\\'>${SCROLLS[k].e}</span>'">`;
const scrollKind = i => i.kind || 'str';
const canCraftScroll = k => { const d = SCROLLS[k]; return d.mats.every(([m, q]) => matQty(m) >= q) && window.G_GLOBAL >= d.gold; };

window.craftScroll = (k = 'str') => {
  const d = SCROLLS[k];
  if (busy || !d || !canCraftScroll(k)) return;
  d.mats.forEach(([m, q]) => { const it = inv.find(x => x.mat && x.sl === m); it.qty -= q; if (it.qty <= 0) inv.splice(inv.indexOf(it), 1); });
  window.G_GLOBAL -= d.gold;
  const existingScroll = inv.find(x => x.isScroll && scrollKind(x) === k);
  if (existingScroll) {
    existingScroll.qty = (existingScroll.qty || 1) + 1;
    existingScroll.fresh = 1;
  } else {
    inv.push({ isScroll: true, kind: k, name: d.name, val: 0, noSell: true, qty: 1, fresh: 1 });
  }
  say(`Crafted: <b class="t2">${d.name}</b>!`, 'crit');
  render();
  flyToInv('scroll:' + k, inv.find(x => x.isScroll && scrollKind(x) === k));   // zwój wlatuje do plecaka
};

// aktywna zakładka w Wytwarzaniu
let craftTab = 'scrolls';

// Sprzęt wędkarski z Wytwarzania (Niezwykły, 25 FP – było 20, zakładany na stronie 2). Zawsze ta sama grafika co na ikonie przepisu.
// mats = potrzebne materiały [id, ilość], gold = koszt w złocie
const CRAFT_FISH = {
  ring:   { name: 'Uncommon Ring', ic: 390, mats: [['meat', 10], ['fish_carp', 10]], gold: 1000 },
  amulet: { name: 'Uncommon Amulet', ic: 'amulet_frost', mats: [['bone', 10], ['fish_carp', 10]], gold: 1000 }
};
const CRAFT_FISH_FP = 25;   // FP Uncommon Ring / Amulet z craftingu (save.js ma tę samą wartość do przeliczania starych zapisów)
function makeCraftFish(sl) {
  const d = CRAFT_FISH[sl];
  return { sl, r: 1, name: d.name, isFishGear: 1, fp: CRAFT_FISH_FP, s: {}, d: null, ic: d.ic };
}
const matQty = k => (inv.find(x => x.mat && x.sl === k) || {}).qty || 0;
const canCraftFish = sl => { const d = CRAFT_FISH[sl]; return d.mats.every(([k, q]) => matQty(k) >= q) && window.G_GLOBAL >= d.gold; };

// CRAFTING – Fishing Gear: przepisy sprzętu. Każdy przepis: from = przedmiot z plecaka (zużywany; brak = przepis tylko z materiałów),
// to = wynik, mats = lista [materiał, ilość]. Przepis widać i działa dopiero po nauce projektu Crafting Design dla wyniku (to).
//   Seasoned Angler (rare) = część Angler (uncommon) + 5 Catfish Scale
//   Sea Raider (epic)      = część Seasoned Angler (rare) + 5 Light of Anglerfish
//   Ring of the Tide (epic) = 9 Eye of Cod + 9 Catfish Scale + 9 Barracuda Fang + 9 Light of Anglerfish (bez przedmiotu bazowego)
const GEAR_RECIPES = [
  { from: 'boonie', to: 'seasoned_cap', mats: [['catfish_scale', 5]] },
  { from: 'parka', to: 'seasoned_parka', mats: [['catfish_scale', 5]] },
  { from: 'wellies', to: 'seasoned_wellies', mats: [['catfish_scale', 5]] },
  { from: 'lantern', to: 'seasoned_lantern', mats: [['catfish_scale', 5]] },
  { from: 'seasoned_cap', to: 'hunter_helmet', mats: [['light_of_anglerfish', 5]] },
  { from: 'seasoned_parka', to: 'hunter_parka', mats: [['light_of_anglerfish', 5]] },
  { from: 'seasoned_wellies', to: 'hunter_wellies', mats: [['light_of_anglerfish', 5]] },
  { from: 'seasoned_lantern', to: 'hunter_lantern', mats: [['light_of_anglerfish', 5]] },
  { to: 'tide_ring', mats: [['eye_of_cod', 9], ['catfish_scale', 9], ['barracuda_fang', 9], ['light_of_anglerfish', 9]] }   // po 9 (6 + 50%, zaokr. w górę)
];
const gearRecipeOf = to => GEAR_RECIPES.find(r => r.to === to);
const hasFixed = k => inv.some(x => x.fixed === k);   // składnik musi leżeć w plecaku (założony na stronie 2 się nie liczy)
const canCraftGear = to => { const r = gearRecipeOf(to); return !!r && knowsDesign(to) && (!r.from || hasFixed(r.from)) && r.mats.every(([m, q]) => matQty(m) >= q); };
window.craftGear = to => {
  if (busy || !canCraftGear(to)) return;
  const r = gearRecipeOf(to);
  if (r.from) inv.splice(inv.findIndex(x => x.fixed === r.from), 1);    // stary odpowiednik znika z plecaka
  r.mats.forEach(([k, q]) => { const m = inv.find(x => x.mat && x.sl === k); m.qty -= q; if (m.qty <= 0) inv.splice(inv.indexOf(m), 1); });
  const it = makeFixed(to); it.fresh = 1; inv.push(it);
  say(`Crafted: <b class="t${it.r}">${it.name}</b>!`, 'crit');
  render();
  flyToInv('gear:' + to, it);   // przedmiot wlatuje do plecaka
};
window.craftFish = sl => {
  const d = CRAFT_FISH[sl];
  if (busy || !d || !canCraftFish(sl)) return;
  d.mats.forEach(([k, q]) => { const m = inv.find(x => x.mat && x.sl === k); m.qty -= q; if (m.qty <= 0) inv.splice(inv.indexOf(m), 1); });
  window.G_GLOBAL -= d.gold;
  const it = makeCraftFish(sl); it.fresh = 1; inv.push(it);
  say(`Crafted: <b class="t${it.r}">${it.name}</b>!`, 'crit');
  render();
};

function useScroll(n) {
  const i = inv[n];
  if (!i || !i.isScroll) return;

  if (i.qty && i.qty > 1) {
    i.qty--;
  } else {
    inv.splice(n, 1);
  }

  const k = scrollKind(i);
  if (k === 'dex') setBuffDexEnd(Date.now() + 30 * 60 * 1000); else setBuffStrEnd(Date.now() + 30 * 60 * 1000);
  say(`Scroll used! ${SCROLLS[k].stat} increased by 10% for 30 minutes.`, 'crit');
  render();
}

// jak giveMat, ale bez wpisu „Loot” w logu (np. otwieranie Sunken Chest – jeden zbiorczy wpis)
function giveMatQuiet(k) { const m = sayMute; sayMute = true; try { giveMat(k); } finally { sayMute = m; } }
function giveMat(k) {
  const d = MATS[k], mt = inv.find(x => x.mat && x.sl == d.sl);
  if (mt) { mt.qty++; mt.fresh = 1; }
  else {
    // nowy materiał trafia zaraz za ostatnim materiałem z tej samej grupy (ulepszacze obok ulepszaczy, ryby obok ryb)
    const item = { sl: d.sl, r: d.r || 0, name: d.name, mat: 1, qty: 1, val: d.val, s: {}, fresh: 1 };
    let at = -1;
    inv.forEach((x, n) => { if (x.mat && MATS[x.sl] && MATS[x.sl].grp === d.grp) at = n; });
    if (at >= 0) inv.splice(at + 1, 0, item); else inv.push(item);
  }
  say(`Loot: <b class="t${d.r || 0}">${d.name}</b>`);
}

// SPECIAL DROPS (panel łowienia): dodatkowe łupy z danej ryby – każdy można otrzymać tylko RAZ. pct = szansa w %, item() = przedmiot do opisu w dymku, got() = czy już wyłowiony
// PRZEPISY (zwoje): nie są materiałem ani ekwipunkiem – na razie nic nie robią (w przyszłości gotowanie jedzenia z ryb). Można je sprzedać.
// wspólny sprite zwoju: przepisy kulinarne (RECIPES) i projekty Crafting Design
const DESIGN_IMG = 'materials/crafting_design.png';
const RECIPES = {
  cooked_carp: { name: 'Recipe: Cooked Crucian Carp', r: 1, val: 50, img: DESIGN_IMG, e: '📜' },
  cooked_cod: { name: 'Recipe: Cooked Cod', r: 1, val: 50, img: DESIGN_IMG, e: '📜' },
  grilled_catfish: { name: 'Recipe: Grilled Catfish', r: 2, val: 100, img: DESIGN_IMG, e: '📜' },
  // przepis z Barrakudy (rare) – 5%, jednorazowo
  steamed_barracuda: { name: 'Recipe: Grilled Barracuda', r: 2, val: 100, img: DESIGN_IMG, e: '📜' },
  // przepisy z Żabnicy i Rekina (epic) oraz Lewiatana (legendary) – po 5%, jednorazowo
  anglerfish_stew: { name: 'Recipe: Anglerfish Stew', r: 3, val: 200, img: DESIGN_IMG, e: '📜' },
  shark_steak: { name: 'Recipe: Shark Stew', r: 3, val: 200, img: DESIGN_IMG, e: '📜' },
  abyssal_broth: { name: 'Recipe: Abyssal Broth', r: 4, val: 400, img: DESIGN_IMG, e: '📜' }
};
// LISTA PRZEPISÓW (Crafting i Cooking): przepisy jeden pod drugim w przewijanej liście (.rlist), każdy jako wiersz:
// ikona wyniku | nazwa + składniki (ikona i „masz/potrzeba”) | przycisk. Za mało materiałów → wiersz i nazwa na czerwono.
// Dymek wiersza: wynik (nazwa, opis) i lista materiałów z ilościami (zielone = wystarczy, czerwone = brakuje), koszt w złocie.
// newRecipes: świeżo wyuczone przepisy (klucz 'cook:kind' / 'gear:kind') – przy pierwszym pokazaniu przez wiersz przelatuje przebłysk.
const newRecipes = new Set(), newRecipeTimers = new Set();
document.head.insertAdjacentHTML('beforeend', '<style>'
  + '.rlist{display:flex;flex-direction:column;gap:6px;max-height:330px;overflow-y:auto;padding-right:4px}'
  // Cooking i Crafting: lista ma od razu pełną (maksymalną) wysokość – okno nie rośnie przy nauce kolejnych przepisów, nowe dochodzą w środku
  + '.rlist.rfix{height:330px;box-sizing:border-box}'
  + '.rrow{position:relative;overflow:hidden;display:flex;align-items:center;gap:10px;padding:6px 8px;border:1px solid var(--bd);border-radius:8px;background:var(--card);cursor:help;flex:none}'
  // brak składników: stonowana czerwień (--lack = czerwień zmieszana z kolorem tekstu), delikatna ramka i ledwo widoczne tło
  + ':root{--lack:color-mix(in srgb,#e53935 55%,var(--tx))}'
  + '.rrow.lack{border-color:color-mix(in srgb,#e53935 30%,var(--bd));background:color-mix(in srgb,#e53935 3%,var(--card))}'
  + '.rrow button{margin-left:auto;flex:none}'
  // pasek przewijania listy w stylu gry: wąski, zaokrąglony, kolor ramek (var(--bd)), po najechaniu akcent (var(--ac)); tło przezroczyste
  + '.rlist{padding-right:6px}.rlist::-webkit-scrollbar-button{display:none;width:0;height:0}'   // bez strzałek na końcach paska
  // standardowe scrollbar-color tylko tam, gdzie nie ma ::-webkit-scrollbar (Firefox) – w Chrome nadpisałoby styl i przywróciło strzałki
  + '@supports not selector(::-webkit-scrollbar){.rlist{scrollbar-width:auto;scrollbar-color:var(--bd) transparent}}'
  + '.rlist::-webkit-scrollbar{width:14px}.rlist::-webkit-scrollbar-track{background:color-mix(in srgb,var(--bd) 25%,transparent);border-radius:8px}'
  + '.rlist::-webkit-scrollbar-thumb{background:var(--bd);border-radius:8px;border:2px solid color-mix(in srgb,var(--bd) 60%,#000);min-height:30px}'
  + '.rlist::-webkit-scrollbar-thumb:hover{background:var(--ac)}'
  // wiersz kompaktowy (Cooking i Crafting): sama ikona wyniku, składniki po prawej (każdy z własnym dymkiem), przycisk
  + '.rrow.rlock>.cell{filter:grayscale(.8);opacity:.6}'
  + '.rrow.compact{cursor:default}.rrow.compact .rmats{margin-left:auto;display:flex;gap:10px;align-items:center}'
  + '.rrow.compact .rmats>span{display:inline-flex;align-items:center;gap:4px;font-weight:700;cursor:help}.rrow.compact button{margin-left:12px}'
  + '.rrow.rnew::after{content:"";position:absolute;top:-20%;bottom:-20%;left:-10%;width:14px;pointer-events:none;'
  + 'background:linear-gradient(90deg,transparent,rgba(255,255,255,.95) 45%,#fff6d0 50%,rgba(255,255,255,.95) 55%,transparent);'
  + 'filter:drop-shadow(0 0 4px #fff3b0);transform:skewX(-20deg);animation:rowshine 1s ease-in-out 2}'
  + '@keyframes rowshine{from{left:-10%}to{left:108%}}'
  + '</style>');
// o = { key, r, ico, name, desc, mats: [{ ico, name, have, need }], gold, can, btn, onclick, vis (czy zakładka jest widoczna) }
function recipeRow(o) {
  if (o.compact) return recipeRowCompact(o);
  const enough = o.mats.every(m => m.have >= m.need) && (!o.gold || window.G_GLOBAL >= o.gold);
  const isNew = newRecipes.has(o.key);
  // licznik do zgaszenia przebłysku startuje dopiero, gdy wiersz jest naprawdę widoczny (otwarta zakładka); do tego czasu czeka
  if (isNew && o.vis && !newRecipeTimers.has(o.key)) { newRecipeTimers.add(o.key); setTimeout(() => { newRecipes.delete(o.key); newRecipeTimers.delete(o.key); }, 2100); }
  const tip = `<b class='t${o.r}'>${o.name}</b>${o.desc || ''}<br><br><b>Materials:</b>`
    + o.mats.map(m => `<br><span style='color:${m.have >= m.need ? '#3fdc3f' : '#e53935'}'>${m.name}: ${Math.min(m.have, m.need)}/${m.need}</span>`).join('')
    + (o.gold ? `<br><span style='color:${window.G_GLOBAL >= o.gold ? '#3fdc3f' : '#e53935'}'>Gold: ${o.gold}</span>` : '');
  return `<div class="rrow${enough ? '' : ' lack'}${isNew ? ' rnew' : ''}" data-tip="${tip}">`
    + `<div class="cell r${o.r}" style="width:52px;height:52px;flex:none;display:flex;align-items:center;justify-content:center">${o.ico}</div>`
    + `<div style="min-width:0"><b class="${enough ? 't' + o.r : ''}" style="${enough ? '' : 'color:#e53935'}">${o.name}</b>`
    + `<div style="display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:4px;font-size:12px">`
    + o.mats.map(m => `<span style="display:inline-flex;align-items:center;gap:3px;${m.have >= m.need ? '' : 'color:#e53935'}">${m.ico}${Math.min(m.have, m.need)}/${m.need}</span>`).join('')
    + (o.gold ? `<span style="${window.G_GLOBAL >= o.gold ? '' : 'color:#e53935'}">${goldIco(16)} ${o.gold}</span>` : '') + `</div></div>`
    + `<button data-btn="${o.key}" onclick="${o.onclick}"${o.can && !busy ? '' : ' disabled'}>${o.btn}</button></div>`;
}
const matRow = (k, need) => ({ ico: matIco(k, 22, 18), name: MATS[k].name, have: matQty(k), need, it: 'mat:' + k });
// wiersz kompaktowy: ikona wyniku (dymek wyniku przez data-it) i jego nazwa, po prawej składniki – ikona 32 px + „masz/potrzeba”,
// każdy z dymkiem materiału (data-it); brak materiałów → wiersz i liczba na czerwono
function recipeRowCompact(o) {
  const enough = o.mats.every(m => m.have >= m.need) && (!o.gold || window.G_GLOBAL >= o.gold);
  const isNew = newRecipes.has(o.key);
  if (isNew && o.vis && !newRecipeTimers.has(o.key)) { newRecipeTimers.add(o.key); setTimeout(() => { newRecipes.delete(o.key); newRecipeTimers.delete(o.key); }, 2100); }
  const gold = o.gold ? `<span data-tip="<b>Gold</b>Cost: ${o.gold}<br>You have: ${window.G_GLOBAL}" style="${window.G_GLOBAL >= o.gold ? '' : 'color:var(--lack)'}">${goldIco(16)} ${o.gold}</span>` : '';
  return `<div class="rrow compact${enough && !o.req ? '' : ' lack'}${o.req ? ' rlock' : ''}${isNew ? ' rnew' : ''}">`
    + `<div class="cell r${o.r}" style="width:52px;height:52px;flex:none;display:flex;align-items:center;justify-content:center;cursor:help" data-it="${o.it}">${o.ico}</div>`
    + `<b class="${enough && !o.req ? 't' + o.r : ''}" style="min-width:0;${enough && !o.req ? '' : 'color:var(--lack)'}">${o.name}${o.xp ? ` <small style="color:var(--mut);font-weight:400">+${o.xp} XP</small>` : ''}`
    + `${o.req ? `<br><small style="color:var(--lack);font-weight:700">${o.req}</small>` : ''}</b>`   // nazwa w pustym miejscu (kolor rarity; brak materiałów – czerwona)
    + `<div class="rmats">` + o.mats.map(m => `<span data-it="${m.it}" style="${m.have >= m.need ? '' : 'color:var(--lack)'}">${m.big}${Math.min(m.have, m.need)}/${m.need}</span>`).join('') + gold + `</div>`
    + `<button data-btn="${o.key}" onclick="${o.onclick}"${o.can && !busy ? '' : ' disabled'}>${o.btn}</button></div>`;
}
// COOKING (zakładka pod Tackle Upgrade): przepis z ryby (Recipe: …) kliknięty w plecaku uczy gotowania dania (fishing.recipes[kind]).
// Każde danie = COOK_QTY (10) sztuk odpowiadającej ryby. Danie: przedmiot isFood, łączy się w stos (qty), rzadkość jak przepis.
// Wartość sprzedaży = wartość 10 ryb × 1.2. e = emoji (placeholder grafiki).
// EFEKT: kliknięcie dania w plecaku = zjedzenie → +hp% maks. Health na FOOD_MIN minut (foodBuff w state.js, liczone w der()).
// Kolejne przepisy dają po +5% więcej (5 / 10 / … / 35%). Aktywny jest tylko JEDEN buff z jedzenia – nowe danie zastępuje poprzednie.
const COOK_QTY = 10, FOOD_MIN = 30;
// POZIOM GOTOWANIA 1–50 (fishing.cookLvl, fishing.cookXp – zapisywane z grą). Każde ugotowane danie daje DISHES[].xp.
// XP na kolejny poziom: 20 × poziom^1.5 (1→2: 20, 10→11: 632, 49→50: 6860; razem ~134 000 XP). Na 50 pasek pełny, XP się nie zbiera.
const COOK_MAX = 50;
const cookLvl = () => fishing.cookLvl || 1, cookXp = () => fishing.cookXp || 0;
const cookNeed = l => Math.round(20 * l ** 1.5);
function addCookXp(x) {
  if (cookLvl() >= COOK_MAX) return;
  fishing.cookXp = cookXp() + x; fishing.cookLvl = cookLvl();
  while (fishing.cookLvl < COOK_MAX && fishing.cookXp >= cookNeed(fishing.cookLvl)) {
    fishing.cookXp -= cookNeed(fishing.cookLvl); fishing.cookLvl++;
    say(`<b>Cooking level up!</b> You are now level <b>${fishing.cookLvl}</b>.`, 'crit'); flashNav('cook');
  }
  if (fishing.cookLvl >= COOK_MAX) fishing.cookXp = 0;
}
// PASEK POZIOMU w nagłówku karty Cooking (obok napisu „Cooking”, przez całą szerokość, wypełnia się w prawo):
// „Lv 3” | gruby pasek z napisem „93 / 104 XP” w środku (na 50: „Max level”). Element #cook-head jest w <h2> karty (index.html).
// Budowany RAZ – potem tylko zmiana szerokości (płynna animacja), liczby XP „doliczają się”, przy awansie pasek dobiega do końca,
// błyska i startuje od zera; nad paskiem wylatuje „+160 XP” albo „Level 4!”.
let cookShown = null;   // { l, xp } – to, co aktualnie pokazuje pasek (do animacji)
function updateCookBar() {
  const head = $('cook-head'); if (!head) return;
  if (!head.querySelector('.cbar')) head.innerHTML = `<b class="clv">Lv 1</b><span class="cbar"><i></i><span class="ctxt"></span></span>`;
  const cbar = head.querySelector('.cbar'), bar = cbar.querySelector('i'), txt = head.querySelector('.ctxt'), lvEl = head.querySelector('.clv');
  const l = cookLvl(), x = cookXp(), max = l >= COOK_MAX;
  const pctOf = (lv, xp) => lv >= COOK_MAX ? 100 : Math.min(100, xp / cookNeed(lv) * 100);
  const label = (lv, xp) => lv >= COOK_MAX ? 'Max level' : `${Math.round(xp)} / ${cookNeed(lv)} XP`;
  const prev = cookShown; cookShown = { l, xp: x };
  if (!prev || (prev.l === l && prev.xp === x)) {
    if (!prev || !cbar.dataset.anim) { bar.style.transition = 'none'; bar.style.width = pctOf(l, x) + '%'; txt.textContent = label(l, x); lvEl.textContent = `Lv ${l}`; }
    return;
  }
  // liczby XP doliczają się przez 0.6 s
  const countTo = (lv, from, to) => { const t0 = performance.now(); const step = t => { const k = Math.min(1, (t - t0) / 600); txt.textContent = label(lv, from + (to - from) * k); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); };
  cbar.dataset.anim = 1; setTimeout(() => { delete cbar.dataset.anim; }, l > prev.l ? 1200 : 650);
  if (l > prev.l) {
    // awans: dobicie do końca → złoty błysk → od zera do nowej wartości
    bar.style.transition = 'width .5s ease-out'; bar.style.width = '100%'; countTo(prev.l, prev.xp, cookNeed(prev.l));
    setTimeout(() => {
      cbar.classList.remove('lvup'); void cbar.offsetWidth; cbar.classList.add('lvup');
      lvEl.textContent = `Lv ${l}`; bar.style.transition = 'none'; bar.style.width = '0%'; void bar.offsetWidth;
      bar.style.transition = 'width .6s ease-out'; bar.style.width = pctOf(l, x) + '%'; if (max) txt.textContent = label(l, x); else countTo(l, 0, x);
    }, 520);
  } else { bar.style.transition = 'width .6s ease-out'; bar.style.width = pctOf(l, x) + '%'; countTo(l, prev.xp, x); }
  // „+XP” / „Level X!” wylatuje nad paskiem
  const r = cbar.getBoundingClientRect();
  if (r.width) floatText(`<span style="color:#3fdc3f">${l > prev.l ? `Level ${l}!` : `+${x - prev.xp} XP`}</span>`, r.left + r.width / 2, r.top - 6);
}
document.head.insertAdjacentHTML('beforeend', '<style>'
  + '#cook-head .clv{font-size:15px;white-space:nowrap}'
  + '#cook-head .cbar{position:relative;flex:1;height:20px;border-radius:10px;background:color-mix(in srgb,var(--bd) 55%,transparent);overflow:hidden;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--bd) 80%,#000)}'
  + '#cook-head .cbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#3fdc3f,#a8e05f);border-radius:10px;box-shadow:0 0 8px #3fdc3f66}'
  + '#cook-head .ctxt{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:var(--tx);text-shadow:0 0 3px var(--card),0 0 3px var(--card)}'
  + '#cook-head .cbar.lvup{animation:cbarup .7s ease-out}@keyframes cbarup{0%{box-shadow:0 0 0 0 #f2c200}40%{box-shadow:0 0 14px 4px #f2c200}100%{box-shadow:0 0 0 0 #f2c20000}}'
  // kliknięcie „Cook”: lekkie wciśnięcie i odbicie z zieloną poświatą
  + '.rrow button.cookpress{animation:cookpress .35s ease-out}@keyframes cookpress{0%{transform:scale(1)}35%{transform:scale(.88)}70%{transform:scale(1.08);box-shadow:0 0 10px 2px #3fdc3f88}100%{transform:scale(1)}}'
  + '</style>');
const DISHES = {
  cooked_carp: { name: 'Cooked Crucian Carp', fish: 'fish_carp', e: '🍳', img: 'food/cooked_carp.png', hp: 5, xp: 10, lvl: 1 },
  cooked_cod: { name: 'Cooked Cod', fish: 'fish_cod', e: '🍽️', img: 'food/cooked_cod.png', hp: 10, xp: 25, lvl: 3 },
  grilled_catfish: { name: 'Grilled Catfish', fish: 'fish_catfish', e: '🍢', img: 'food/grilled_catfish.png', hp: 15, xp: 45, lvl: 6 },
  steamed_barracuda: { name: 'Grilled Barracuda', fish: 'fish_barracuda', e: '🥘', img: 'food/grilled_barracuda.png', hp: 20, xp: 75, lvl: 10 },
  anglerfish_stew: { name: 'Anglerfish Stew', fish: 'fish_anglerfish', e: '🍲', img: 'food/anglerfish_stew.png', hp: 25, xp: 110, lvl: 15 },
  shark_steak: { name: 'Shark Stew', fish: 'fish_shark', e: '🥩', img: 'food/shark_stew.png', hp: 30, xp: 160, lvl: 20 },
  abyssal_broth: { name: 'Abyssal Broth', fish: 'fish_leviathan', e: '🥣', img: 'food/abyssal_broth.png', hp: 35, xp: 250, lvl: 25 }
};
// NAZWY DAŃ: uncommon = „Cooked …”, rare = „Grilled …”, epic = „… Stew” (klucz shark_steak zostaje – nazwa to Shark Stew) (klucz steamed_barracuda zostaje dla zgodności zapisów – nazwa to Grilled Barracuda).
// Przedmioty w zapisie mają nazwę w sobie – po wczytaniu bierzemy aktualną z RECIPES / DISHES (np. Steamed Barracuda → Grilled Barracuda).
[...inv, upgradeItem].forEach(i => { if (!i) return; if (i.isRecipe && RECIPES[i.kind]) i.name = RECIPES[i.kind].name; if (i.isFood && DISHES[i.kind]) i.name = DISHES[i.kind].name; });
// zjedzenie dania: zużywa 1 sztukę, ustawia (lub zastępuje) buff z jedzenia na 30 min
function eatFood(n) {
  const i = inv[n], d = DISHES[i.kind]; if (!d) return;
  const had = Date.now() < foodBuff.end ? foodBuff.kind : null;
  if (i.qty > 1) i.qty--; else inv.splice(n, 1);
  Object.assign(foodBuff, { kind: i.kind, pct: d.hp, end: Date.now() + FOOD_MIN * 60 * 1000 });
  say(`Ate <b class="t${i.r}">${d.name}</b>: +${d.hp}% max Health for ${FOOD_MIN} minutes.` + (had && had !== i.kind ? ` (replaces ${DISHES[had].name})` : ''), 'crit');
  render();
}
const knowsRecipe = k => !!(fishing.recipes && fishing.recipes[k]);
// WYMAGANY POZIOM GOTOWANIA (DISHES[].lvl): 1 / 3 / 6 / 10 / 15 / 20 / 25. Przepis da się poznać zawsze, ugotować – dopiero od tego poziomu.
const cookLvlOk = k => (fishing.cookLvl || 1) >= (DISHES[k].lvl || 1);
const makeDish = k => ({ isFood: 1, kind: k, sl: 'food', r: RECIPES[k].r, name: DISHES[k].name, qty: 1, val: Math.round(MATS[DISHES[k].fish].val * COOK_QTY * 1.2), s: {} });
// ikona dania: pixel art z assets/food/ (16×16, plik 64×64), jeśli danie ma img; inaczej (albo gdy brak pliku) emoji
const dishIco = (k, px = 48) => { const d = DISHES[k], em = `<span class="ic" style="font-size:${Math.round(px * 0.68)}px;line-height:1">${d.e}</span>`;
  return d.img ? `<img class="px" src="${ASSETS_DIR}/${d.img}" alt="" style="width:${px}px;height:${px}px;image-rendering:pixelated" onerror="this.outerHTML=this.dataset.em" data-em='${em.replace(/'/g, '&#39;')}'>` : em; };
const canCook = k => knowsRecipe(k) && cookLvlOk(k) && matQty(DISHES[k].fish) >= COOK_QTY;
window.cook = k => {
  if (busy || !canCook(k)) return;
  const f = DISHES[k].fish, m = inv.find(x => x.mat && x.sl === f);
  m.qty -= COOK_QTY; if (m.qty <= 0) inv.splice(inv.indexOf(m), 1);
  const have = inv.find(x => x.isFood && x.kind === k);
  if (have) { have.qty = (have.qty || 1) + 1; have.fresh = 1; } else { const d = makeDish(k); d.fresh = 1; inv.push(d); }
  say(`Cooked: <b class="t${RECIPES[k].r}">${DISHES[k].name}</b>! +${DISHES[k].xp} Cooking XP`, 'crit');
  addCookXp(DISHES[k].xp);
  render();
  flyToInv('cook:' + k, inv.find(x => x.isFood && x.kind === k));   // danie wlatuje do plecaka
  const btn = document.querySelector(`[data-btn="cook:${k}"]`);   // render() przebudował listę – animacja na nowym przycisku
  if (btn) { btn.classList.add('cookpress'); setTimeout(() => btn.classList.remove('cookpress'), 400); }
};
// zakładka Cooking: wyuczone przepisy w przewijanej liście – sama ikona dania, po prawej 10 ryb (z dymkiem), przycisk Cook
function renderCook() {
  const el = $('body-cook'); if (!el) return;
  const st = (el.querySelector('.rlist') || {}).scrollTop || 0;   // pozycja przewinięcia – przywracana po przebudowie listy (klik „Cook”)
  const known = Object.keys(DISHES).filter(knowsRecipe);
  el.innerHTML = known.length ? `<div class="rlist rfix">` + known.map(k => recipeRow({
    compact: 1, key: 'cook:' + k, r: RECIPES[k].r, ico: dishIco(k, 44), it: 'dish:' + k, name: DISHES[k].name, xp: DISHES[k].xp,
    req: cookLvlOk(k) ? '' : `Requires Cooking level ${DISHES[k].lvl}`,
    mats: [{ ...matRow(DISHES[k].fish, COOK_QTY), big: matIco(DISHES[k].fish, 32, 26) }], can: canCook(k), btn: 'Cook', onclick: `window.cook('${k}')`, vis: view === 'cook'
  })).join('') + `</div>`
    : `<div class="rlist rfix"><small style="color:var(--mut)">No recipes learned yet. Find recipes while fishing.</small></div>`;
  const nl = el.querySelector('.rlist'); if (nl) nl.scrollTop = st;
}
// FISHING GUIDE (rare, grafika assets/materials/fishing_guide.png; gdy brak pliku – emoji 📖): kliknięcie w plecaku zużywa 1 sztukę i daje +1 Fishing Skill Point (fishing.sp).
// Łączy się w stos (qty). Na razie bez źródła zdobycia (tylko plecak DEV) i bez zastosowania punktów.
const GUIDE = { name: 'Fishing Guide', r: 2, val: 50, e: '📖', img: 'materials/fishing_guide.png' };
// PULSUJĄCA RYBA (panel łowienia): przy każdym braniu sprite ryby nad paskiem zaczyna pulsować w losowym momencie
// między PULSE_FROM a PULSE_TO paska (0.2–0.8) i pulsuje aż do złowienia ryby. Kliknięcie w pulsującą rybę = +1 Fishing Guide.
// PULSE_CHANCE = szansa, że w danym braniu ryba w ogóle zapulsuje (0.5 = 50% cykli łowienia).
const PULSE_FROM = 0.2, PULSE_TO = 0.8, PULSE_CHANCE = 0.5;
// LIMIT Fishing Guide z jednej ryby: 10 z każdej (razem 70).
// Po osiągnięciu limitu ta ryba już nie pulsuje. Licznik: fishing.guides[id ryby].
const guideCap = fid => 10;   // limit Fishing Guide: 10 z każdej ryby (7 ryb = 70 guidów)
const guidesGot = fid => (fishing.guides && fishing.guides[fid]) || 0;
function giveGuide() {
  const g = inv.find(x => x.isGuide);
  if (g) { g.qty = (g.qty || 1) + 1; g.fresh = 1; }
  else inv.push({ isGuide: 1, sl: 'guide', r: GUIDE.r, name: GUIDE.name, qty: 1, val: GUIDE.val, s: {}, fresh: 1 });
  say(`Found: <b class="t${GUIDE.r}">${GUIDE.name}</b>!`, 'crit');
}
// czy ryba właśnie pulsuje (można kliknąć po Fishing Guide)
const fishGlowing = () => fishing.active && !!fishing.pulseAt && !fishing.pulseDone && Date.now() >= fishing.pulseAt && guidesGot(fishing.sel) < guideCap(fishing.sel);
// KLIK W DUŻĄ RYBĘ: nie łowisz → start łowienia; ryba pulsuje → Fishing Guide; łowisz, ryba nie pulsuje → stop łowienia
window.clickFishAvatar = () => {
  if (!fishGlowing()) { toggleFishing(); return; }
  fishing.pulseDone = true;
  fishing.guides = fishing.guides || {}; fishing.guides[fishing.sel] = guidesGot(fishing.sel) + 1;
  giveGuide();
  render();
};
document.head.insertAdjacentHTML('beforeend', '<style>'
  + '.fdrops-lbl{font-size:11px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.05em;margin:4px 0 4px}'
  + '.fdrops{display:flex;flex-wrap:wrap;gap:8px}.fdrop{display:flex;flex-direction:column;align-items:center;gap:2px;cursor:help}'
  + '.fdrop .cell{width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:help}.fdrop .cell.undisc{border-style:dashed}'
  + '.fdrop small{font-size:11px;font-weight:700;color:var(--c2)}'
  + '</style>');
document.head.insertAdjacentHTML('beforeend', '<style>@keyframes fishpulse{0%,100%{transform:scale(1);filter:drop-shadow(0 0 0 #f2c20000)}50%{transform:scale(1.12);filter:drop-shadow(0 0 10px #f2c200)}}'
  + '#fish-avatar{display:flex;justify-content:center;width:100%;padding:6px 0;user-select:none}#fish-avatar img,#fish-avatar .ic{transition:opacity .2s}'
  + '#fish-avatar.idle img,#fish-avatar.idle .ic{opacity:.55}'
  // ramka ryby (180 px, sprite 160 px = ×10 siatki 16×16 – większa ryba, wypełnia stałą wysokość karty): jak komórka plecaka (tło karty, zaokrąglona obwódka w kolorze rzadkości ryby); kursor zawsze „palec wskazujący”
  + '#fish-avatar .fish-av-frame{width:180px;height:180px;flex:none;border-radius:12px;cursor:pointer}#fish-avatar.pulse img,#fish-avatar.pulse .ic{animation:fishpulse .6s ease-in-out infinite}</style>');
// ===== EFEKTY ŁOWIENIA (lecąca ryba, liczby nad rybą, „x2!”, baner rzadkiego dropu, napięty pasek) =====
// fishTick() wrzuca zdarzenia do fxQueue, a playFx() odtwarza je PO render() (żeby komórki plecaka już istniały).
let fxQueue = [], offlineLog = null, sayMute = false;
const RCOL = r => r >= 5 ? '#e53935' : r === 4 ? '#f2c200' : `var(--c${r || 0})`;
const RNAME = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
document.head.insertAdjacentHTML('beforeend', '<style>'
  + '#fx-layer{position:fixed;inset:0;pointer-events:none;z-index:300;overflow:hidden}'
  + '.fx-fly{position:absolute;width:64px;height:64px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 4px 6px #0008)}'
  + '.fx-float{position:absolute;transform:translate(-50%,0);font-weight:800;font-size:16px;white-space:nowrap;text-align:center;text-shadow:0 1px 0 #000,0 0 6px #000;animation:fxup 2.2s ease-out forwards}'
  + '.fx-float.big{font-size:34px;color:#f2c200;font-weight:900}'
  + '.xporb{display:block;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff 0 18%,#c49cfa 35%,#8c54d4 70%,#582e8c 100%);box-shadow:0 0 8px 3px #8c54d4aa}'
  + '.rwpop{animation:rwpop .45s ease-out}@keyframes rwpop{0%{transform:scale(1);box-shadow:none}35%{transform:scale(1.05);box-shadow:0 0 14px 3px #f2c20088}100%{transform:scale(1);box-shadow:none}}'
  + '@keyframes fxup{0%{opacity:0;transform:translate(-50%,10px) scale(.6)}15%{opacity:1;transform:translate(-50%,0) scale(1.18)}30%{transform:translate(-50%,-6px) scale(1)}75%{opacity:1;transform:translate(-50%,-44px)}100%{opacity:0;transform:translate(-50%,-64px)}}'
  + '.fx-flash{position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,color-mix(in srgb,var(--fc) 55%,transparent),transparent 65%);animation:fxflash 1s ease-out forwards}'
  + '@keyframes fxflash{0%{opacity:0}15%{opacity:1}100%{opacity:0}}'
  + '.fx-banner{position:absolute;left:50%;top:38%;display:flex;align-items:center;gap:16px;padding:14px 24px;background:var(--card);border:2px solid var(--fc);border-radius:14px;box-shadow:0 0 34px var(--fc),0 8px 30px #000a;animation:fxban 1.9s ease-out forwards}'
  + '.fx-banner.big{animation-duration:2.6s;padding:18px 30px}.fx-banner.big .fx-b-ico{animation:fxglow .5s ease-in-out infinite alternate}'
  + '@keyframes fxban{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}12%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}22%{transform:translate(-50%,-50%) scale(1)}85%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-62%) scale(.95)}}'
  + '@keyframes fxglow{from{box-shadow:0 0 6px var(--fc)}to{box-shadow:0 0 22px 4px var(--fc)}}'
  + '.fx-b-head{font-size:26px;font-weight:900;letter-spacing:2px;color:var(--fc);text-shadow:0 1px 0 #000,0 0 8px #0008}'
  + '.fx-b-ico{width:76px;height:76px;flex:none;display:flex;align-items:center;justify-content:center}'
  + '.cell.fx-pop{animation:fxpop .35s ease-out}@keyframes fxpop{0%{transform:scale(1)}40%{transform:scale(1.28)}100%{transform:scale(1)}}'
  + '#fish-live .xpbar.tense{animation:fxtense .11s linear infinite;box-shadow:0 0 8px var(--ac)}'
  + '@keyframes fxtense{0%,100%{transform:translate(0,0)}25%{transform:translate(-1px,0)}75%{transform:translate(1px,0)}}'
  + '#fish-avatar.catch .fish-av-frame{animation:fxcatch .4s ease-out}@keyframes fxcatch{0%{transform:scale(1)}30%{transform:scale(.86)}65%{transform:scale(1.08)}100%{transform:scale(1)}}'
  // okno While you were away
  + '#offline-ov{position:fixed;inset:0;z-index:250;background:#000b;display:flex;align-items:center;justify-content:center}'
  + '.off-box{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:18px 22px;max-width:540px;width:calc(100% - 32px);max-height:86vh;overflow:auto;box-shadow:0 10px 40px #000c;animation:fxin .35s ease-out both}'
  + '.off-box h2{margin:0 0 4px}.off-sec{margin:14px 0 6px;font-weight:700}.off-grid{display:flex;flex-wrap:wrap;gap:6px}'
  + '.off-grid .cell{width:52px;height:52px;position:relative;display:flex;align-items:center;justify-content:center;cursor:help}'
  + '.off-grid .cell.rare{box-shadow:0 0 10px 2px var(--fc)}'
  + '.fx-setglow{position:absolute;border-radius:10px;border:2px solid #3fdc3f;box-shadow:0 0 10px 2px #3fdc3f99,inset 0 0 8px #3fdc3f66;animation:fxsetg 1.4s ease-out both}'
  + '.fx-setglow.full{border:3px solid #f2c200;box-shadow:0 0 14px 4px #f2c200aa,inset 0 0 10px #f2c20077;animation:fxsetf 2s ease-out both}'
  + '.fx-setfull{font-size:20px;color:#f2c200;animation:fxshine .5s ease-in-out 3 alternate}@keyframes fxshine{from{text-shadow:0 1px 0 #000,0 0 6px #000}to{text-shadow:0 1px 0 #000,0 0 14px #f2c200}}'
  + '.fx-spark{position:absolute;color:#f2c200;font-size:14px;text-shadow:0 0 6px #f2c200;transform:translate(-50%,-50%);animation:fxspark .9s ease-out forwards}@keyframes fxspark{0%{opacity:1;transform:translate(-50%,-50%) scale(.6)}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1.1)}}'
  + '@keyframes fxsetg{0%{opacity:0;transform:scale(1.25)}20%{opacity:1;transform:scale(1)}70%{opacity:1}100%{opacity:0}}'
  + '@keyframes fxsetf{0%{opacity:0;transform:scale(1.25)}15%{opacity:1;transform:scale(1)}35%{transform:scale(1.05)}50%{transform:scale(1)}80%{opacity:1}100%{opacity:0}}'
  + '.fx-in{animation:fxin .35s ease-out both}@keyframes fxin{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}'
  + '</style>');
function fxLayer() { let l = $('fx-layer'); if (!l) { l = document.createElement('div'); l.id = 'fx-layer'; document.body.appendChild(l); } return l; }
// tekst wylatujący w górę (x, y = środek, współrzędne okna)
function floatText(html, x, y, big, delay = 0) {
  setTimeout(() => {
    const e = document.createElement('div'); e.className = 'fx-float' + (big ? ' big' : ''); e.innerHTML = html;
    e.style.left = x + 'px'; e.style.top = y + 'px'; fxLayer().appendChild(e); setTimeout(() => e.remove(), 2300);   // napis widoczny 2.2 s (było 1.5 s)
  }, delay);
}
// ryba leci łukiem z dużego okna do swojej komórki w plecaku; komórka „podskakuje”
// small = bycatch: mniejsza ryba (40 px) startuje z prawego dolnego rogu okna ryby, leci niższym łukiem
function flyFish(id, delay, small) {
  const fr = document.querySelector('#fish-avatar .fish-av-frame'); if (!fr || !fr.offsetParent) return;
  const n = inv.findIndex(x => x.mat && x.sl === id), cell = n >= 0 ? document.querySelector(`#inv [data-n="${n}"]`) : null;
  const a = fr.getBoundingClientRect(), b = (cell || $('invcard')).getBoundingClientRect(), h = small ? 20 : 32;
  const sx = (small ? a.right - 24 : a.left + a.width / 2) - h, sy = (small ? a.bottom - 24 : a.top + a.height / 2) - h, tx = b.left + b.width / 2 - h, ty = b.top + b.height / 2 - h;
  const e = document.createElement('div'); e.className = 'fx-fly'; e.innerHTML = matIco(id, h * 2, small ? 30 : 48);
  if (small) { e.style.width = e.style.height = h * 2 + 'px'; }
  e.style.left = sx + 'px'; e.style.top = sy + 'px'; e.style.opacity = '0'; fxLayer().appendChild(e);
  const mx = (tx - sx) / 2, my = Math.min(0, ty - sy) / 2 - (small ? 50 : 90);
  e.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${mx}px,${my}px) scale(.9)`, opacity: 1, offset: .45 }, { transform: `translate(${tx - sx}px,${ty - sy}px) scale(.45)`, opacity: .3 }],
    { duration: 750, delay, easing: 'ease-in', fill: 'both' }).onfinish = () => {
    e.remove();
    const c = n >= 0 ? document.querySelector(`#inv [data-n="${n}"]`) : null;
    if (c) { c.classList.remove('fx-pop'); void c.offsetWidth; c.classList.add('fx-pop'); }
  };
}
// NAGRODA ZA WALKĘ: z przeciwnika (#fm) wylatują monety do panelu Gold i kulki XP do paska doświadczenia (prosto do celu).
// Liczba monet / kulek rośnie z nagrodą (2–7). Cel po trafieniu „podskakuje” i świeci; obok wylatuje napis +złoto / +XP.
// holdGold / holdXp = wartości pokazywane do czasu dolecenia nagrody (null = pokazuj aktualne)
let holdGold = null, holdXp = null;
const releaseGold = () => { if (holdGold !== null) { holdGold = null; render(); } };
const releaseXp = () => { if (holdXp !== null) { holdXp = null; render(); } };
// from = opcjonalny prostokąt startu (DOMRect), np. przycisk Complete questa; domyślnie przeciwnik w oknie walki
function flyReward(gold, xp, from) {
  setTimeout(() => { releaseGold(); releaseXp(); }, 1500);   // zabezpieczenie: zawsze pokaż aktualne wartości najpóźniej po 1,5 s
  const src = $('fm'); if (!from && (!src || !src.offsetParent)) { releaseGold(); releaseXp(); return; }
  const a = from || src.getBoundingClientRect(), sx0 = a.left + a.width / 2, sy0 = a.top + a.height / 2;
  const shoot = (n, target, make, size, onHit, delay0, right) => {   // right = cel przy prawej krawędzi (liczba złota)
    if (!target || !target.offsetParent) { onHit(null); return; }
    const b = target.getBoundingClientRect(), tx0 = right ? b.right - 28 : b.left + b.width / 2, ty0 = b.top + b.height / 2;
    for (let k = 0; k < n; k++) {
      const e = document.createElement('div'); e.className = 'fx-fly'; e.style.width = e.style.height = size + 'px'; e.innerHTML = make();
      const jx = (Math.random() - .5) * 50, jy = (Math.random() - .5) * 30;   // rozrzut startu – monety „wysypują się” z przeciwnika
      const sx = sx0 + jx - size / 2, sy = sy0 + jy - size / 2, tx = tx0 - size / 2 + (Math.random() - .5) * 16, ty = ty0 - size / 2;
      e.style.left = sx + 'px'; e.style.top = sy + 'px'; e.style.opacity = '0'; fxLayer().appendChild(e);
      // lot prosto do celu (bez łuku i odbicia w górę), 30% szybciej niż wcześniej
      e.animate([{ transform: 'translate(0,0) scale(.8)', opacity: 0 }, { transform: `translate(${(tx - sx) * .08}px,${(ty - sy) * .08}px) scale(1)`, opacity: 1, offset: .1 },
        { transform: `translate(${tx - sx}px,${ty - sy}px) scale(.7)`, opacity: .9 }],
        { duration: 595, delay: delay0 + k * 49, easing: 'ease-in', fill: 'both' }).onfinish = () => { e.remove(); if (k === n - 1) onHit(b); };
    }
  };
  const pop = el => { el.classList.remove('rwpop'); void el.offsetWidth; el.classList.add('rwpop'); };
  const nG = Math.max(2, Math.min(7, Math.round(2 + gold / 25))), nX = Math.max(2, Math.min(7, Math.round(2 + xp / 120)));
  if (gold > 0) shoot(nG, $('gold'), () => goldIco(32), 32, b => { releaseGold(); if (b) { pop($('gold')); floatText(`<span style="color:#f2c200">+${gold}</span>`, b.right - 40, b.top - 4); } }, 0, true); else releaseGold();
  const bar = $('xpf') && $('xpf').parentElement;
  if (xp > 0) shoot(nX, bar, () => '<i class="xporb"></i>', 22, b => { releaseXp(); if (b) { pop($('xpf').parentElement); floatText(`<span style="color:#b98cff">+${xp} XP</span>`, b.left + b.width / 2, b.top - 26); } }, 126); else releaseXp();
}
// CRAFTING / COOKING: wytworzony przedmiot spada z ikony przepisu (wiersz z przyciskiem data-btn=key) prosto w dół do swojej komórki w plecaku; komórka „podskakuje”, nad przepisem wylatuje napis „+1 nazwa” w kolorze rzadkości. Wywoływać PO render().
function flyToInv(key, item) {
  if (!item) return;
  const btn = document.querySelector(`[data-btn="${key}"]`), src = btn && btn.closest('.rrow') ? btn.closest('.rrow').querySelector('.cell') : null;
  if (!src || !src.offsetParent) return;
  const n = inv.indexOf(item), cell = n >= 0 ? document.querySelector(`#inv [data-n="${n}"]`) : null;
  const a = src.getBoundingClientRect(), b = (cell || $('invcard')).getBoundingClientRect(), h = 24;
  const sx = a.left + a.width / 2 - h, sy = a.top + a.height / 2 - h, tx = b.left + b.width / 2 - h, ty = b.top + b.height / 2 - h;
  const e = document.createElement('div'); e.className = 'fx-fly'; e.style.width = e.style.height = h * 2 + 'px'; e.innerHTML = sizeIco(item, h * 2);
  e.style.left = sx + 'px'; e.style.top = sy + 'px'; e.style.opacity = '0'; fxLayer().appendChild(e);
  // lot prosto w dół do komórki (bez łuku w górę jak przy rybie) – przyspiesza jak spadający przedmiot
  e.animate([{ transform: 'translate(0,0) scale(1.1)', opacity: 1 }, { transform: `translate(${tx - sx}px,${ty - sy}px) scale(.6)`, opacity: .4 }],
    { duration: 600, easing: 'cubic-bezier(.55,0,1,.6)', fill: 'both' }).onfinish = () => {
    e.remove();
    const c = n >= 0 ? document.querySelector(`#inv [data-n="${n}"]`) : null;
    if (c) { c.classList.remove('fx-pop'); void c.offsetWidth; c.classList.add('fx-pop'); }
  };
  floatText(`<span style="color:${item.r ? RCOL(item.r) : '#fff'}">+1 ${item.name}</span>`, a.left + a.width / 2 + 60, a.top + a.height / 2, false, 250);   // obok ikony, z opóźnieniem – nie nachodzi na „+XP” nad paskiem Cooking
}
// BANER RZADKIEGO DROPU (epic i lepsze, tylko jednorazowe – nie materiały): błysk w kolorze rzadkości + karta „EPIC DROP!” na środku ekranu; kolejka – po jednym
const bannerQ = []; let bannerBusy = false;
function rareBanner(it) { bannerQ.push(it); if (!bannerBusy) nextBanner(); }
function nextBanner() {
  const it = bannerQ.shift(); if (!it) { bannerBusy = false; return; }
  bannerBusy = true;
  const r = it.r || 0, big = r >= 4 || it.big, L = fxLayer();
  const fl = document.createElement('div'); fl.className = 'fx-flash'; fl.style.setProperty('--fc', RCOL(r)); L.appendChild(fl);
  const b = document.createElement('div'); b.className = 'fx-banner' + (big ? ' big' : ''); b.style.setProperty('--fc', RCOL(r));
  b.innerHTML = it.html || `<div class="fx-b-ico cell r${r}">${sizeIco(it, 64)}</div><div><div class="fx-b-head">${RNAME[r]} DROP!</div><b class="t${r}" style="font-size:18px">${it.name}</b></div>`;   // it.html = własna treść (np. SET COMPLETE!)
  L.appendChild(b);
  setTimeout(() => fl.remove(), 1000);
  setTimeout(() => { b.remove(); nextBanner(); }, big ? 2600 : 1900);
}
// EFEKT BONUSU SETOWEGO: po założeniu części, która przekracza próg bonusu setu.
//  • próg częściowy (np. 2/4): delikatna zielona poświata na slotach części setu + zielony napis nad ekwipunkiem „Angler (2/4)” i bonus
//  • komplet (4/4): to samo, ale bardziej „flashy” – złota pulsująca poświata, większy złoty napis z listą wszystkich bonusów (bez gwiazdek, banera i błysku ekranu)
// Stan poprzedni (setTierPrev) zapamiętany przy pierwszym render() – wczytanie zapisu nie wywołuje efektu.
let setTierPrev = null;
function checkSetFx() {
  const now = {}; for (const k in ALL_SETS) now[k] = setCount(k);
  if (setTierPrev) for (const k in ALL_SETS) {
    const S = ALL_SETS[k], c = now[k], p = setTierPrev[k] || 0;
    const hit = S.bonus.filter(b => p < b.n && c >= b.n).pop();
    if (hit) setFxShow(k, c >= S.pieces.length);
  }
  setTierPrev = now;
}
function setFxShow(k, full) {
  const S = ALL_SETS[k], c = setCount(k), L = fxLayer(), E = setEq(k);
  // poświata na slotach (nakładka w warstwie efektów – przetrwa przebudowę slotów przy kolejnym render())
  if (equipPage === (GEAR_SETS[k] ? 1 : 2)) S.pieces.forEach((p, i) => {
    const sl = FIXED_ITEMS[p].sl, cell = E[sl] && E[sl].fixed === p ? document.querySelector(`#slots [data-it="eq:${sl}"]`) : null;
    if (!cell) return;
    const r = cell.getBoundingClientRect(), g = document.createElement('div');
    g.className = 'fx-setglow' + (full ? ' full' : ''); g.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;animation-delay:${i * 90}ms`;
    L.appendChild(g); setTimeout(() => g.remove(), full ? 2100 : 1500);
  });
  // napis nad ekwipunkiem (jak przy 2/4); przy komplecie większy, złoty, z listą wszystkich bonusów
  const box = $('slots'), r = box ? box.getBoundingClientRect() : null;
  if (!r) return;
  const x = r.left + r.width / 2, y = r.top + 20;
  if (full) {
    const lines = S.bonus.map(b => `<br><span style="color:#3fdc3f;font-size:14px">Set: ${b.d}</span>`).join('');
    floatText(`<span class="fx-setfull">${S.name} (${c}/${S.pieces.length})</span>${lines}`, x, y, false);
  } else {
    floatText(`<span style="color:#e69500">${S.name} (${c}/${S.pieces.length})</span><br><span style="color:#3fdc3f;font-size:14px">Set: ${S.bonus.filter(b => c >= b.n).pop().d}</span>`, x, y);
  }
}
// odtwarza zdarzenia z fxQueue (wywoływane po render())
function playFx() {
  let q = fxQueue; fxQueue = [];
  if (!q.length) return;
  // karta była w tle i nadrobiła wiele ryb naraz → bez setek lecących ryb: jeden zbiorczy napis na gatunek, rzadkie dropy i Fishpedia zostają
  if (q.filter(e => e.k === 'fish').length > 3) {
    const sum = {};
    q.filter(e => e.k === 'fish').forEach(e => { sum[e.id] = sum[e.id] || { ...e, n: 0 }; sum[e.id].n += e.n; });
    q = [...Object.values(sum).map(e => ({ ...e, bulk: 1 })), ...q.filter(e => (e.k === 'item' && (e.it.r || 0) >= 3 && !e.it.mat) || e.k === 'pedia')];   // bycatch w tle: bez animacji
  }
  const fr = document.querySelector('#fish-avatar .fish-av-frame'), a = fr && fr.offsetParent ? fr.getBoundingClientRect() : null;
  let k = 0;   // kolejne napisy jeden po drugim (co 0.3 s), żeby się nie nakładały
  q.forEach(e => {
    if (e.k === 'fish') {
      if (!a) return;
      if (!e.bulk) for (let i = 0; i < e.n; i++) flyFish(e.id, i * 180);
      const av = $('fish-avatar'); av.classList.remove('catch'); void av.offsetWidth; av.classList.add('catch');
      clearTimeout(av._catchT); av._catchT = setTimeout(() => av.classList.remove('catch'), 450);   // zdejmij klasę po animacji – inaczej po powrocie z zakładki (display:none → flex) animacja odpala się ponownie
      floatText(`<span style="color:${e.r ? RCOL(e.r) : '#fff'}">+${e.n} ${e.name}</span>`, a.left + a.width / 2, a.top - 8, false, 300 * k++);
      if (e.n > 1 && !e.bulk) floatText('x2!', a.right + 26, a.top + 30, true);
    } else if (e.k === 'bycatch') {
      // BYCATCH: mniejsza ryba leci do plecaka chwilę po głównej + napis „Bycatch! +1 Cod”
      if (!a) return;
      flyFish(e.id, 260, true);
      floatText(`<span style="color:#3fdc3f">Bycatch!</span> <span style="color:${e.r ? RCOL(e.r) : '#fff'}">+1 ${e.name}</span>`, a.left + a.width / 2, a.bottom - 30, false, 260);   // niżej niż „+1 Shark”, żeby się nie nakładały
    } else if (e.k === 'item') {
      // duży popup tylko dla JEDNORAZOWYCH dropów (sety, przepisy, designy, unikaty); materiały (wypadają wielokrotnie) – napis nad rybą
      if ((e.it.r || 0) >= 3 && !e.it.mat) rareBanner(e.it);
      else if (a) floatText(`<span style="color:${e.it.r ? RCOL(e.it.r) : '#fff'}">+${e.qty} ${e.it.name}</span>`, a.left + a.width / 2, a.top - 8, false, 300 * k++);
    } else if (e.k === 'pedia' && a) {
      floatText(`<span style="color:#f2c200">${e.txt}</span><br><span style="font-size:13px;color:#fff">${e.sub}</span>`, a.left + a.width / 2, a.top + a.height / 2, false, 300 * k++);
    }
  });
}
const makeRecipe = k => ({ isRecipe: 1, kind: k, sl: 'recipe', r: RECIPES[k].r, name: RECIPES[k].name, val: RECIPES[k].val, s: {} });
// CRAFTING DESIGNS (zwoje, rare): kliknięcie w plecaku uczy przepisu w Crafting → Fishing Gear i zużywa zwój.
// kind = klucz przedmiotu wynikowego (FIXED_ITEMS); nauczone przepisy: fishing.designs[kind] = true. Special drop z Suma (10%, jednorazowo, każdy osobno).
const DESIGN_KINDS = ['seasoned_cap', 'seasoned_parka', 'seasoned_wellies', 'seasoned_lantern'];
// rzadkość projektu = rzadkość przedmiotu, którego uczy (Seasoned Angler: rare, Sea Raider: epic); wartość: rare 100, epic 200
const makeDesign = k => ({ isDesign: 1, kind: k, sl: 'design', r: FIXED_ITEMS[k].r, name: `Crafting Design: ${FIXED_ITEMS[k].name}`, val: FIXED_ITEMS[k].r >= 3 ? 200 : 100, s: {} });
const knowsDesign = k => !!(fishing.designs && fishing.designs[k]);
// komplet Sea Raider (epic) – z Żabnicy (Anglerfish) wypadają PROJEKTY Crafting Design do tych przedmiotów (po 10%, każdy jednorazowo, flaga: fishing['design_' + klucz]),
// tak jak projekty Seasoned Angler z Suma. Przedmioty wykonuje się potem w Crafting → Fishing Gear: część Seasoned Angler + 5 Light of Anglerfish (GEAR_RECIPES).
const HUNTER_SET = ['hunter_helmet', 'hunter_parka', 'hunter_wellies', 'hunter_lantern'];
// komplet Sea King (legendary) – special drop z Lewiatana: [klucz przedmiotu, flaga „już wyłowiony”], każda część 2%, jednorazowo
const KING_SET = [['king_crown', 'kingCrown'], ['king_plate', 'kingPlate'], ['king_boots', 'kingBoots'], ['king_lantern', 'kingLantern']];
const SPECIAL_DROPS = {
  fish_carp: [
    { name: 'Fishing Hook', r: 0, img: 'fishing_hook/fhook1.png', e: '🪝', pct: 100, item: () => makeHook(), got: () => fishing.hookGiven },
    { name: RECIPES.cooked_carp.name, r: RECIPES.cooked_carp.r, img: RECIPES.cooked_carp.img, e: '📜', pct: 5, item: () => makeRecipe('cooked_carp'), got: () => fishing.recipeCarp }
  ],
  fish_cod: [
    { name: FIXED_ITEMS.boonie.name, r: FIXED_ITEMS.boonie.r, img: FIXED_ITEMS.boonie.img, e: FIXED_ITEMS.boonie.e, pct: 2, item: () => makeFixed('boonie'), got: () => fishing.boonie },
    { name: FIXED_ITEMS.wellies.name, r: FIXED_ITEMS.wellies.r, img: FIXED_ITEMS.wellies.img, e: FIXED_ITEMS.wellies.e, pct: 2, item: () => makeFixed('wellies'), got: () => fishing.wellies },
    { name: FIXED_ITEMS.parka.name, r: FIXED_ITEMS.parka.r, img: FIXED_ITEMS.parka.img, e: FIXED_ITEMS.parka.e, pct: 2, item: () => makeFixed('parka'), got: () => fishing.parka },
    { name: FIXED_ITEMS.lantern.name, r: FIXED_ITEMS.lantern.r, img: FIXED_ITEMS.lantern.img, e: FIXED_ITEMS.lantern.e, pct: 2, item: () => makeFixed('lantern'), got: () => fishing.lantern },
    { name: RECIPES.cooked_cod.name, r: RECIPES.cooked_cod.r, img: RECIPES.cooked_cod.img, e: '📜', pct: 5, item: () => makeRecipe('cooked_cod'), got: () => fishing.recipeCod },
    // materiał Eye of Cod (uncommon) – 5%, wielokrotnie (na liście odkrywa się po pierwszym dropie)
    { name: MATS.eye_of_cod.name, r: MATS.eye_of_cod.r, img: MATS.eye_of_cod.img, e: MATS.eye_of_cod.e, pct: 5, item: () => ({ sl: 'eye_of_cod', r: 1, name: MATS.eye_of_cod.name, mat: 1, qty: 1, val: MATS.eye_of_cod.val, s: {} }), got: () => fishing.codEye }
  ],
  // SUM (Catfish) – kolejność: od najczęstszego; w grupach: projekty, przepis, materiał, komplet Catfish Whisker (talizman, amulet, pierścień)
  fish_catfish: [
    ...DESIGN_KINDS.map(k => ({ name: makeDesign(k).name, r: 2, img: DESIGN_IMG, e: '📘', pct: 10, item: () => makeDesign(k), got: () => !!fishing['design_' + k] })),
    { name: RECIPES.grilled_catfish.name, r: RECIPES.grilled_catfish.r, img: RECIPES.grilled_catfish.img, e: '📜', pct: 5, item: () => makeRecipe('grilled_catfish'), got: () => fishing.recipeCatfish },
    { name: MATS.catfish_scale.name, r: MATS.catfish_scale.r, img: MATS.catfish_scale.img, e: MATS.catfish_scale.e, pct: 6, item: () => ({ sl: 'catfish_scale', r: 2, name: MATS.catfish_scale.name, mat: 1, qty: 1, val: MATS.catfish_scale.val, s: {} }), got: () => fishing.catfishScale },
    { name: FIXED_ITEMS.whisker_charm.name, r: FIXED_ITEMS.whisker_charm.r, img: FIXED_ITEMS.whisker_charm.img, e: FIXED_ITEMS.whisker_charm.e, pct: 2, item: () => makeFixed('whisker_charm'), got: () => fishing.whiskerCharm },
    { name: FIXED_ITEMS.whisker_amulet.name, r: FIXED_ITEMS.whisker_amulet.r, img: FIXED_ITEMS.whisker_amulet.img, e: FIXED_ITEMS.whisker_amulet.e, pct: 2, item: () => makeFixed('whisker_amulet'), got: () => fishing.whiskerAmulet },
    { name: FIXED_ITEMS.whisker_ring.name, r: FIXED_ITEMS.whisker_ring.r, img: FIXED_ITEMS.whisker_ring.img, e: FIXED_ITEMS.whisker_ring.e, pct: 2, item: () => makeFixed('whisker_ring'), got: () => fishing.whiskerRing }
  ],
  // BARRAKUDA (Barracuda) – od najczęstszego: przepis (5%, jednorazowo), materiał Barracuda Fang (2%, wielokrotnie – na liście odkrywa się po pierwszym dropie),
  // projekt Crafting Design: Ring of the Tide (2%, jednorazowo)
  fish_barracuda: [
    { name: RECIPES.steamed_barracuda.name, r: RECIPES.steamed_barracuda.r, img: RECIPES.steamed_barracuda.img, e: '📜', pct: 5, item: () => makeRecipe('steamed_barracuda'), got: () => fishing.recipeBarracuda },
    { name: MATS.barracuda_fang.name, r: MATS.barracuda_fang.r, img: MATS.barracuda_fang.img, e: MATS.barracuda_fang.e, pct: 2, item: () => ({ sl: 'barracuda_fang', r: 2, name: MATS.barracuda_fang.name, mat: 1, qty: 1, val: MATS.barracuda_fang.val, s: {} }), got: () => fishing.barracudaFang },
    // projekt Crafting Design: Ring of the Tide (epic) – 2%, jednorazowo
    { name: makeDesign('tide_ring').name, r: FIXED_ITEMS.tide_ring.r, img: DESIGN_IMG, e: '📘', pct: 2, item: () => makeDesign('tide_ring'), got: () => !!fishing.design_tide_ring }
  ],
  // ŻABNICA (Anglerfish) – od najczęstszego: 4 projekty Crafting Design (epic) do kompletu Sea Raider (po 10%, każdy jednorazowo),
  // naszyjnik Anglerfish Lure Necklace (5%, jednorazowo), materiał Light of Anglerfish (3%, wielokrotnie)
  fish_anglerfish: [
    ...HUNTER_SET.map(k => ({ name: makeDesign(k).name, r: FIXED_ITEMS[k].r, img: DESIGN_IMG, e: '📘', pct: 10, item: () => makeDesign(k), got: () => !!fishing['design_' + k] })),
    // przepis Anglerfish Stew (epic) – 5%, jednorazowo
    { name: RECIPES.anglerfish_stew.name, r: RECIPES.anglerfish_stew.r, img: RECIPES.anglerfish_stew.img, e: '📜', pct: 5, item: () => makeRecipe('anglerfish_stew'), got: () => fishing.recipeAnglerfish },
    // naszyjnik Anglerfish Lure Necklace (epic) – 5%, jednorazowo
    { name: FIXED_ITEMS.lure_necklace.name, r: FIXED_ITEMS.lure_necklace.r, img: FIXED_ITEMS.lure_necklace.img, e: FIXED_ITEMS.lure_necklace.e, pct: 5, item: () => makeFixed('lure_necklace'), got: () => fishing.lureNecklace },
    // materiał Light of Anglerfish (3%, wielokrotnie – na liście odkrywa się po pierwszym dropie)
    { name: MATS.light_of_anglerfish.name, r: MATS.light_of_anglerfish.r, img: MATS.light_of_anglerfish.img, e: MATS.light_of_anglerfish.e, pct: 3, item: () => ({ sl: 'light_of_anglerfish', r: 3, name: MATS.light_of_anglerfish.name, mat: 1, qty: 1, val: MATS.light_of_anglerfish.val, s: {} }), got: () => fishing.anglerLight }
  ],
  // REKIN (Shark) – materiał Shark Fin (epic, 5%, wielokrotnie – na liście odkrywa się po pierwszym dropie); ulepszenie wędki i haczyka rare → epic
  fish_shark: [
    // przepis Shark Stew (epic) – 5%, jednorazowo
    { name: RECIPES.shark_steak.name, r: RECIPES.shark_steak.r, img: RECIPES.shark_steak.img, e: '📜', pct: 5, item: () => makeRecipe('shark_steak'), got: () => fishing.recipeShark },
    { name: MATS.shark_fin.name, r: MATS.shark_fin.r, img: MATS.shark_fin.img, e: MATS.shark_fin.e, pct: 5, item: () => ({ sl: 'shark_fin', r: 3, name: MATS.shark_fin.name, mat: 1, qty: 1, val: MATS.shark_fin.val, s: {} }), got: () => fishing.sharkFin },
    // talizman Shark Eye Trophy (epic, 70 FP) – 3%, jednorazowo
    { name: FIXED_ITEMS.shark_eye.name, r: FIXED_ITEMS.shark_eye.r, img: FIXED_ITEMS.shark_eye.img, e: FIXED_ITEMS.shark_eye.e, pct: 3, item: () => makeFixed('shark_eye'), got: () => fishing.sharkEye }
  ],
  fish_leviathan: [
    // przepis Abyssal Broth (legendary) – 5%, jednorazowo
    { name: RECIPES.abyssal_broth.name, r: RECIPES.abyssal_broth.r, img: RECIPES.abyssal_broth.img, e: '📜', pct: 5, item: () => makeRecipe('abyssal_broth'), got: () => fishing.recipeLeviathan },
    // materiał Pearl of the Deep (legendary) – 5%, wielokrotnie (na liście odkrywa się po pierwszym dropie)
    { name: MATS.pearl_of_the_deep.name, r: MATS.pearl_of_the_deep.r, img: MATS.pearl_of_the_deep.img, e: MATS.pearl_of_the_deep.e, pct: 5, item: () => ({ sl: 'pearl_of_the_deep', r: 4, name: MATS.pearl_of_the_deep.name, mat: 1, qty: 1, val: MATS.pearl_of_the_deep.val, s: {} }), got: () => fishing.deepPearl },
    // komplet Sea King (legendary) – każda część 2%, jednorazowo
    ...KING_SET.map(([k, flag]) => ({ name: FIXED_ITEMS[k].name, r: FIXED_ITEMS[k].r, img: FIXED_ITEMS[k].img, e: FIXED_ITEMS[k].e, pct: 2, item: () => makeFixed(k), got: () => fishing[flag] })),
    // Abyssal Lure Hood (unikat, 1%) – TYMCZASOWO usunięty z gry (nie wypada i nie ma go na liście Special drops)
  ]
};
const LURE_HOOD_ON = false;   // Abyssal Lure Hood tymczasowo usunięty z gry (true = przywraca drop)
let sdOpen = false;   // czy okienko "Special drops" jest otwarte
window.toggleSpecialDrops = v => { sdOpen = v === undefined ? !sdOpen : v; if (sdOpen) { ftOpen = false; fbOpen = false; } render(); };
// (USUNIĘTE) mnożnik z nadwyżki FP – FP służy już tylko do odblokowywania ryb; bonusy w „i” to czyste wartości z drzewka i setów.
const pct1 = v => +v.toFixed(1);   // ładny zapis liczb: 1.2, 36, 0.6

// FISHING SKILL TREE (zakładka z ikoną drzewka w panelu łowienia): plansza jak w zwykłych Skills – przeciąganie myszką, przybliżanie kółkiem.
// Węzły FUPG (jak UPG w data.js): x, y = pozycja na planszy (0,0 = środek), max = liczba rang, req = wymagany wymaksowany węzeł,
// eff = efekt JEDNEJ rangi (sumuje się: ranga × eff, liczy fub()). Każda ranga kosztuje 1 Fishing Skill Point (fishing.sp).
// Kupione rangi: fishing.skills[id].
const GUIDE_ICO = `<img src="${ASSETS_DIR}/${GUIDE.img}" alt="" style="display:block;width:32px;height:32px;image-rendering:pixelated" onerror="this.outerHTML='<span class=\\'ic\\'>${GUIDE.e}</span>'">`;
// UKŁAD „FISHBONE” (ość): Basic Training to ogon po lewej; w prawo biegnie KRĘGOSŁUP z samych KEYSTONES (k: 'key', pomarańczowa ramka)
// co 250 px – 4 kręgi (skrócone: 70 guidów + 1 za pierwszego karpia + 14 z Fishpedii = 85 punktów = Basic Training + 4 × 21). Każdy keystone ma 3 rangi.
// Wymagania keystone: poprzedni keystone wymaksowany (req) ORAZ wydane punkty w tym drzewku (minSpent): key0 – 0, key1 – 15, key2 – 30, key3 – 45.
// Z każdego kręgu wychodzą dwa ŻEBRA po 3 węzły, skośnie w tył: w górę ścieżka Tide (lane: 't'), w dół Treasure (lane: 'g') – żółte ramki.
// Wszystkie węzły działają: Basic Training, 4 keystones (AFK Fishing, Swift Angler, Night Shift, Swift Angler II) i ich żebra (85 punktów = całe drzewko).
// Pozycje: x w prawo od Basic Training, y = 0 to kręgosłup (ujemne = w górę).
const F_LANE = { t: 'Tide', g: 'Treasure', key: 'Keystone' };
const F_KEY_STEP = 15;   // co ile wydanych punktów odblokowuje się kolejny keystone
const FUPG = [
  { id: 'basic', x: 0, y: 0, n: 'Basic Training', max: 1, ic: GUIDE_ICO, center: 1, d: () => 'Unlocks glowing fish.<br>Click a glowing fish to get a Fishing Guide.', eff: { glowUnlock: 1 } }
];
(() => {
  const ph = (id, req, x, y, k, lane, extra) => FUPG.push({ id, req, x, y, k, lane, ph: 1, n: 'Locked', max: 1, ic: '🔒', d: () => `${F_LANE[lane]} – coming soon`, eff: {}, ...extra });
  let x = 0, prev = 'basic';
  for (let v = 0; v < 4; v++) {
    x += 250; ph(`key${v}`, prev, x, 0, 'key', 'key', { max: 3, minSpent: F_KEY_STEP * v }); prev = `key${v}`;   // krąg (keystone), 3 rangi
    [['t', -1], ['g', 1]].forEach(([lane, sg]) => {                                                                // żebra: góra Tide, dół Treasure
      let p = `key${v}`;
      for (let r = 0; r < 3; r++) { const id = `rib${v}${lane}${r}`; ph(id, p, x - 48 * (r + 1), sg * 78 * (r + 1), 'b', lane); p = id; }
    });
  }
  // PIERWSZY KEYSTONE (key0): AFK Fishing – postęp łowienia offline: 1 h za rangę (1/3 → 1 h, 2/3 → 2 h, 3/3 → 3 h)
  Object.assign(FUPG.find(n => n.id === 'key0'), { ph: 0, n: 'AFK Fishing', ic: '<span class="ic" style="font-size:26px">💤</span>',
    d: r => `Unlocks AFK fishing.<br>Fishing continues while you are away (up to ${r} h).`, eff: { afk: 1 } });
  // ŻEBRA KRĘGÓW 0–2 (AFK Fishing, Swift Angler, Night Shift) – każdy węzeł 3 rangi, wymaga wymaksowania poprzedniego (pierwszy – AFK Fishing 3/3):
  //   góra (Tide):     Double Catch (+0.5%/r, maks. 1.5%) → Triple Catch (+0.2%/r, maks. 0.6%) → AFK Time (+20 min/r, maks. +1 h)
  //   dół (Treasure):  Double Catch (+0.5%/r, maks. 1.5%) → Triple Catch (+0.2%/r, maks. 0.6%) → Sunken Chest (+0.33%/r, maks. 1%)
  const ftImg = (f, e, badge) => `<span style="position:relative;display:inline-flex"><img src="${ASSETS_DIR}/ui/${f}.png" alt="" style="width:32px;height:32px;image-rendering:pixelated" onerror="this.outerHTML='<span class=\\'ic\\'>${e}</span>'">`
    + (badge ? `<b style="position:absolute;right:-8px;top:-8px;font-size:10px;line-height:12px;padding:0 3px;border-radius:5px;background:#120d08;color:#f2c200">${badge}</b>` : '') + `</span>`;
  const fx2 = x => +x.toFixed(2);
  const NODES = {
    dbl: { n: 'Double Catch', ic: ftImg('ft_double', '🐟', '×2'), d: r => `+${fx2(0.5 * r)}% chance to catch two fish`, eff: { dbl: 0.5 } },
    triple: { n: 'Triple Catch', ic: ftImg('ft_double', '🐟', '×3'), d: r => `+${fx2(0.2 * r)}% chance to catch three fish`, eff: { triple: 0.2 } },
    afk: { n: 'AFK Time', ic: ftImg('ft_time', '⏳'), d: r => `+${20 * r} min AFK fishing time`, eff: { afk: 1 / 3 } },
    bycatch: { n: 'Bycatch', ic: ftImg('ft_lowerfish', '🐟'), d: r => `+${r}% chance to also catch a random lower fish`, eff: { bycatch: 1 } },
    chest: { n: 'Sunken Chest', ic: `<img class="px" src="${ASSETS_DIR}/materials/sunken_chest.png" alt="" style="width:32px;height:32px;image-rendering:pixelated">`, d: r => `+${fx2(r / 3)}% chance to find a Sunken Chest`, eff: { treasure: 1 / 3 } }
  };
  // ten sam układ żeber dla kręgów 0, 1 i 2 (AFK Fishing, Swift Angler, Night Shift)
  // krąg 2 (Night Shift): na końcu górnego żebra Bycatch (+1%/r, maks. 3%) zamiast AFK Time
  // krąg 3 (Swift Angler II): żebra takie same jak w kręgu 1 (góra: Double → Triple → AFK Time, dół: Double → Triple → Sunken Chest)
  [0, 1, 2, 3].forEach(v => [[`rib${v}t0`, 'dbl'], [`rib${v}t1`, 'triple'], [`rib${v}t2`, v === 2 ? 'bycatch' : 'afk'], [`rib${v}g0`, 'dbl'], [`rib${v}g1`, 'triple'], [`rib${v}g2`, 'chest']]
    .forEach(([id, k]) => Object.assign(FUPG.find(n => n.id === id), { ph: 0, max: 3, ...NODES[k] })));
  // DRUGI KEYSTONE (key1): Swift Angler – Fishing time -3% za rangę (3 / 6 / 9%); wymaga AFK Fishing 3/3 i 15 wydanych punktów
  Object.assign(FUPG.find(n => n.id === 'key1'), { ph: 0, n: 'Swift Angler', ic: ftImg('ft_time', '⏳'),
    d: r => `Fishing time -${3 * r}%`, eff: { time: 3 } });
  // TRZECI KEYSTONE (key2): Night Shift – +1 h AFK fishing za rangę (maks. 3/3 = +3 h); wymaga Swift Angler 3/3 i 30 wydanych punktów
  Object.assign(FUPG.find(n => n.id === 'key2'), { ph: 0, n: 'Night Shift', ic: '<span class="ic" style="font-size:26px">🌙</span>',
    d: r => `+${r} h AFK fishing time`, eff: { afk: 1 } });
  // CZWARTY KEYSTONE (key3): Swift Angler II – Fishing time -5% za rangę (5 / 10 / 15%); wymaga Night Shift 3/3 i 45 wydanych punktów
  Object.assign(FUPG.find(n => n.id === 'key3'), { ph: 0, n: 'Swift Angler II', ic: ftImg('ft_time', '⏳'),
    d: r => `Fishing time -${5 * r}%`, eff: { time: 5 } });
})();
// suma efektów kupionych węzłów (jak ub() w state.js). dbl = % podwójnego połowu, glow = % do szansy na pulsowanie, time = −s czasu brania, fp = +FP
const fub = () => {
  const t = { glowUnlock: 0, dbl: 0, glow: 0, time: 0, fp: 0, afk: 0, bycatch: 0, triple: 0, treasure: 0 };   // afk = limit łowienia offline w godzinach (0 = brak AFK)
  FUPG.forEach(n => { const r = (fishing.skills && fishing.skills[n.id]) || 0; if (r) for (const k in n.eff) t[k] += n.eff[k] * r; });
  return t;
};
const fRank = id => (fishing.skills && fishing.skills[id]) || 0;
const fMaxed = n => fRank(n.id) >= (n.max || 1);
const fReqOk = n => (!n.req || fMaxed(FUPG.find(x => x.id === n.req))) && fSpent() >= (n.minSpent || 0);   // + wymagane wydane punkty (keystones)
const fCanBuy = n => !n.ph && !fMaxed(n) && fReqOk(n) && (fishing.sp || 0) >= 1;   // zablokowane zapowiedzi (ph) nie do kupienia
// czerwona kropka (ikona drzewka i zakładka Fishing): jest punkt do wydania i coś, na co da się go wydać
// ikony panelu łowienia i drzewko dostępne po pierwszym złowionym Crucian Carp (DEV: od razu)
const fishTabsOn = () => DEV || !!(fishing.caught && fishing.caught.fish_carp);
const fishSpDot = () => fishTabsOn() && FUPG.some(fCanBuy);
const fSpent = () => FUPG.reduce((a, n) => a + fRank(n.id), 0);
const doubleCatch = () => pct1(fub().dbl + setFx().dbl + gearFx().dbl);   // % podwójnego połowu z drzewka i bonusów setowych
// zapis ze starego drzewka (Chain of rings): rangi węzłów, których już nie ma, wracają jako Fishing Skill Points
if (fishing.skills) for (const id in fishing.skills) if (!FUPG.some(n => n.id === id)) { fishing.sp = (fishing.sp || 0) + fishing.skills[id]; delete fishing.skills[id]; }
fishing.treeFp = fub().fp;   // start gry: FP z już kupionych węzłów
let ftOpen = false;   // czy zakładka Skill tree jest otwarta (zamiast zwykłego widoku łowienia)
window.toggleFishTree = v => { ftOpen = v === undefined ? !ftOpen : v; if (ftOpen) sdOpen = false; render(); };
window.buyFishNode = id => {
  const n = FUPG.find(x => x.id === id);
  if (!n || fPanMoved || !fCanBuy(n)) return;
  fishing.sp--; fishing.skills = fishing.skills || {}; fishing.skills[id] = fRank(id) + 1;
  fishing.treeFp = fub().fp;   // FP z drzewka (liczone w fishPower() w fishing.js)
  say(`Learned: <b>${n.n}</b>${(n.max || 1) > 1 ? ` (rank ${fRank(id)})` : ''}`, 'crit');
  render();
};
window.resetFishTree = () => {
  const n = fSpent(); if (!n) return;
  fishing.sp = (fishing.sp || 0) + n; fishing.skills = {}; fishing.treeFp = 0;
  say(`Fishing skills reset. Refunded <b>${n}</b> Fishing Skill Point${n === 1 ? '' : 's'}.`, 'crit'); render();
};

// FISHING BONUSES: okienko z tabelą aktualnych bonusów do łowienia (przycisk „i” w prawym górnym rogu panelu łowienia)
let fbOpen = false;
// ===== FISHPEDIA =====
// fishing.count[id] = ile sztuk danej ryby złowiono (z double catch), fishing.pedia[id] = ile progów już odebrano.
// Progi (każda ryba osobno): 10 szt. → +1 Fishing Skill Point, 50 → +2 FP, 250 → +3 FP, 1000 → +1 Fishing Skill Point i +5 FP.
// Razem 14 Fishing Skill Points (z 70 guidami i pierwszym karpiem: 85 = całe drzewko) i 70 FP (fishing.pediaFp, liczone w fishPower()).
const PEDIA_TIERS = [{ n: 10, sp: 1 }, { n: 50, fp: 2 }, { n: 250, fp: 3 }, { n: 1000, sp: 1, fp: 5 }];
const pediaCount = id => (fishing.count && fishing.count[id]) || 0;
const pediaStep = id => (fishing.pedia && fishing.pedia[id]) || 0;
const rewardTxt = t => [t.sp ? `+${t.sp} Fishing Skill Point` : '', t.fp ? `+${t.fp} FP` : ''].filter(Boolean).join(', ');
// dolicza n złowionych sztuk i od razu przyznaje osiągnięte progi
function addCatch(id, n) {
  fishing.count = fishing.count || {}; fishing.pedia = fishing.pedia || {};
  fishing.count[id] = pediaCount(id) + n;
  let t;
  while ((t = PEDIA_TIERS[pediaStep(id)]) && pediaCount(id) >= t.n) {
    fishing.pedia[id] = pediaStep(id) + 1;
    if (t.sp) fishing.sp = (fishing.sp || 0) + t.sp;
    if (t.fp) fishing.pediaFp = (fishing.pediaFp || 0) + t.fp;
    const nm = FISH.find(x => x.id === id).name;
    say(`<b>Fishpedia:</b> ${t.n} ${nm} caught! ${rewardTxt(t)}`, 'crit');
    fxQueue.push({ k: 'pedia', txt: `Fishpedia: ${t.n} ${nm}`, sub: rewardTxt(t) });
    if (offlineLog) offlineLog.pedia.push(`<b>${t.n} ${nm}</b>: ${rewardTxt(t)}`);
  }
}
// FISHPEDIA w bocznej liście „Fish selection”: pod każdą złowioną rybą licznik i cienki pasek do następnego progu.
// Dymek: wszystkie progi z ✔ i nagrodami. Ryby nigdy nie złowione – bez paska (dalej „???”).
function pediaLine(f) {
  if (!fishTabsOn() || !pediaCount(f.id)) return '';
  const c = pediaCount(f.id), st = pediaStep(f.id), t = PEDIA_TIERS[st], prev = st ? PEDIA_TIERS[st - 1].n : 0;
  const tip = `<b>Fishpedia: ${f.name}</b>Caught: ${c}` + PEDIA_TIERS.map((x, i) => `<br>${i < st ? '<span style=\'color:#3fdc3f\'>✔</span>' : '<span style=\'color:var(--mut)\'>○</span>'} ${x.n} caught: ${rewardTxt(x)}`).join('');
  return `<div data-tip="${tip}" style="cursor:help;margin-top:3px;width:120px">`
    + (t ? `<div class="xpbar" style="height:5px;margin:0"><i style="width:${Math.min(100, (c - prev) / (t.n - prev) * 100)}%;background:var(--ac)"></i></div><small style="color:var(--mut);font-size:11px">📖 ${c} / ${t.n}</small>`
         : `<small style="color:#f2c200;font-weight:700;font-size:11px">📖 ${c} · Complete</small>`) + `</div>`;
}
window.toggleFishBonuses = v => { fbOpen = v === undefined ? !fbOpen : v; if (fbOpen) sdOpen = false; render(); };
// CZAS ŁOWIENIA: losowo w zakresie ryby (FISH[].t, np. Carp 10–20 s, Leviathan 25–35 s) × (1 − % skrócenia z drzewka i setów); min. MIN_CATCH s.
// Skrócenie „Fishing time -X%” jest PROCENTOWE (działa tak samo na każdej rybie); łącznie maks. 90%.
// Wędki NIE skracają czasu. BASE_MIN / BASE_MAX – zapas, gdyby ryba nie miała t.
const BASE_MIN = 7, BASE_MAX = 14, MIN_CATCH = 2;   // czasy ryb (FISH[].t) skrócone o 30% (zaokrąglone do pełnych sekund)
const fishT = f => (f && f.t) || [BASE_MIN, BASE_MAX];
const timeCut = () => Math.min(90, fub().time + setFx().time + gearFx().time);   // −% czasu łowienia z drzewka i bonusów setowych
const catchSecs = (base, f) => Math.max(MIN_CATCH, base * (1 - timeCut() / 100));
// zakres czasu łowienia ryby, np. „6.4–12.8 s” (tabela „i”)
const catchRange = f => { const a = pct1(catchSecs(fishT(f)[0], f)), b = pct1(catchSecs(fishT(f)[1], f)); return a === b ? `${a} s` : `${a}–${b} s`; };
// szanse PO bonusie FP (maks. 100%). Pulsowanie wymaga Basic Training (bez niego 0%).
const effDouble = () => Math.min(100, doubleCatch());
// BYCATCH: szansa, że przy braniu wpadnie DODATKOWO losowa GORSZA ryba (niżej na liście FISH niż łowiona).
// Bazowo 0%; źródła: drzewko (fub().bycatch) i bonusy setowe (setFx().bycatch). Na Crucian Carp zawsze 0% (nie ma gorszej ryby).
// Bycatch NIE losuje special dropów tej ryby; liczy się do Fishpedii.
const bycatchBase = () => fub().bycatch + setFx().bycatch + gearFx().bycatch;
const effBycatch = f => !f || FISH.indexOf(f) <= 0 ? 0 : Math.min(100, bycatchBase());
// TRIPLE CATCH: szansa na 3 sztuki łowionej ryby naraz (losowana przed Double Catch; jeśli wypadnie – Double Catch już nie). Bazowo 0%.
const effTriple = () => Math.min(100, fub().triple + setFx().triple + gearFx().triple);
// TREASURE CHANCE: szansa przy braniu na Sunken Chest (skrzynia z rybami, otwierana kliknięciem w plecaku). Bazowo 0%.
const effTreasure = () => Math.min(100, fub().treasure + setFx().treasure + gearFx().treasure);
// SUNKEN CHEST: przedmiot (stos qty). Otwarcie: 1–3 losowe gatunki ryb, każdy po 5–10 sztuk – tylko do NAJLEPSZEJ ryby, jaką gracz
// KIEDYKOLWIEK ZŁOWIŁ (fishing.caught; samo FP się nie liczy – kto nie złowił Catfisha, nie dostanie go ze skrzyni; brak złowionych = Crucian Carp).
// Ryby ze skrzyni nie liczą się do Fishpedii i nie losują dropów. Otwarcie: animacja – ryby wylatują z komórki skrzyni do swoich komórek.
const CHEST = { name: 'Sunken Chest', r: 2, val: 100, e: '🧰', img: 'materials/sunken_chest.png' };   // pixel art 16×16 (plik 64×64); emoji = zapas, gdy brak pliku
const chestIco = px => `<img class="px" src="${ASSETS_DIR}/${CHEST.img}" alt="" style="width:${px}px;height:${px}px;image-rendering:pixelated" onerror="this.outerHTML='<span class=\\'ic\\' style=\\'font-size:${Math.round(px * 0.68)}px\\'>${CHEST.e}</span>'">`;
const makeChest = () => ({ isChest: 1, sl: 'chest', r: CHEST.r, name: CHEST.name, qty: 1, val: CHEST.val, s: {} });
function giveChest() {
  const have = inv.find(x => x.isChest);
  if (have) { have.qty = (have.qty || 1) + 1; have.fresh = 1; } else { const c = makeChest(); c.fresh = 1; inv.push(c); }
}
const CHEST_MAT_CHANCE = 0.2;
const CHEST_MATS = { fish_cod: 'eye_of_cod', fish_catfish: 'catfish_scale', fish_barracuda: 'barracuda_fang', fish_anglerfish: 'light_of_anglerfish', fish_shark: 'shark_fin', fish_leviathan: 'pearl_of_the_deep' };
function openChest(n) {
  const i = inv[n];
  const top = Math.max(0, ...FISH.map((g, j) => fishing.caught && fishing.caught[g.id] ? j : 0)), pool = FISH.slice(0, top + 1);
  const kinds = Math.min(pool.length, 1 + Math.floor(Math.random() * 3)), pick = [...pool].sort(() => Math.random() - 0.5).slice(0, kinds);
  const cell = document.querySelector(`#inv [data-n="${n}"]`), from = cell ? cell.getBoundingClientRect() : null;   // pozycja skrzyni przed przebudową plecaka
  if (i.qty > 1) i.qty--; else inv.splice(n, 1);
  const res = pick.map(f => { const q = 5 + Math.floor(Math.random() * 6); for (let j = 0; j < q; j++) giveMatQuiet(f.id); return { f, q }; });
  // 20%: dodatkowo 1 materiał z ryby – tylko z ryb złowionych choć raz (Eye of Cod, Catfish Scale, Barracuda Fang, Light of Anglerfish, Shark Fin, Pearl of the Deep)
  const mats = Object.keys(CHEST_MATS).filter(fid => fishing.caught && fishing.caught[fid]).map(fid => CHEST_MATS[fid]);
  if (mats.length && Math.random() < CHEST_MAT_CHANCE) { const m = mats[Math.floor(Math.random() * mats.length)]; giveMatQuiet(m); res.push({ f: { id: m, name: MATS[m].name }, q: 1 }); }
  say(`Opened <b class="t${CHEST.r}">${CHEST.name}</b>: ${res.map(({ f, q }) => `+${q} <b class="t${MATS[f.id].r || 0}">${f.name}</b>`).join(', ')}`, 'crit');
  render();
  if (from) chestBurst(from, res);
}
// ANIMACJA OTWARCIA: skrzynia podskakuje i błyska, z jej komórki wystrzeliwują ryby (do 4 na gatunek) – najpierw w górę wachlarzem,
// potem lecą do swoich komórek w plecaku (komórka podskakuje); nad skrzynią po kolei napisy „+7 Cod”.
function chestBurst(from, res) {
  const L = fxLayer(), cx = from.left + from.width / 2, cy = from.top + from.height / 2;
  const flash = document.createElement('div'); flash.className = 'fx-chestopen'; flash.innerHTML = chestIco(56);
  flash.style.left = cx + 'px'; flash.style.top = cy + 'px'; L.appendChild(flash); setTimeout(() => flash.remove(), 700);
  let k = 0;
  res.forEach(({ f, q }, gi) => {
    const n = inv.findIndex(x => x.mat && x.sl === f.id), cell = n >= 0 ? document.querySelector(`#inv [data-n="${n}"]`) : null;
    const b = (cell || $('invcard')).getBoundingClientRect(), tx = b.left + b.width / 2, ty = b.top + b.height / 2;
    for (let j = 0; j < Math.min(q, 4); j++, k++) {
      const e = document.createElement('div'); e.className = 'fx-fly'; e.style.width = e.style.height = '40px'; e.innerHTML = matIco(f.id, 40, 30);
      e.style.left = (cx - 20) + 'px'; e.style.top = (cy - 20) + 'px'; e.style.opacity = '0'; L.appendChild(e);
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, dist = 60 + Math.random() * 50, px = Math.cos(ang) * dist, py = Math.sin(ang) * dist;
      e.animate([
        { transform: 'translate(0,0) scale(.3) rotate(0deg)', opacity: 0 },
        { transform: `translate(${px}px,${py}px) scale(1) rotate(${(Math.random() - 0.5) * 60}deg)`, opacity: 1, offset: .4 },
        { transform: `translate(${tx - cx}px,${ty - cy}px) scale(.5) rotate(0deg)`, opacity: .3 }
      ], { duration: 900, delay: k * 70, easing: 'ease-in-out', fill: 'both' }).onfinish = () => {
        e.remove(); const c = n >= 0 ? document.querySelector(`#inv [data-n="${n}"]`) : null;
        if (c) { c.classList.remove('fx-pop'); void c.offsetWidth; c.classList.add('fx-pop'); }
      };
    }
    floatText(`<span style="color:${MATS[f.id].r ? RCOL(MATS[f.id].r) : '#fff'}">+${q} ${f.name}</span>`, cx, from.top - 6 - gi * 22, false, 150 + gi * 250);
  });
}
document.head.insertAdjacentHTML('beforeend', '<style>.fx-chestopen{position:absolute;transform:translate(-50%,-50%);font-size:40px;filter:drop-shadow(0 0 10px #f2c200);animation:chestopen .7s ease-out forwards}'
  + '@keyframes chestopen{0%{transform:translate(-50%,-50%) scale(1)}25%{transform:translate(-50%,-60%) scale(1.35) rotate(-8deg)}45%{transform:translate(-50%,-50%) scale(1.2) rotate(8deg)}100%{transform:translate(-50%,-50%) scale(1.6);opacity:0}}</style>');
const effPulse = () => fub().glowUnlock ? Math.min(1, PULSE_CHANCE + fub().glow / 100) : 0;
// LISTA BONUSÓW: [nazwa, wartość, dymek z rozbiciem]. Nowy bonus = nowy wiersz tutaj.
// BONUSY SETOWE: ile części danego setu jest założonych (strona 2 ekwipunku) i suma aktywnych efektów
// ALL_SETS = sety wędkarskie (FISH_SETS, strona 2 – eq2) + bojowe (GEAR_SETS, strona 1 – eq1)
const ALL_SETS = Object.assign({}, FISH_SETS, GEAR_SETS);
const setEq = k => GEAR_SETS[k] ? eq1 : eq2;
const setOf = i => i && i.fixed ? Object.keys(ALL_SETS).find(k => ALL_SETS[k].pieces.includes(i.fixed)) : null;
const setCount = k => ALL_SETS[k].pieces.filter(p => Object.values(setEq(k)).some(i => i && i.fixed === p)).length;
// BONUSY Z PRZEDMIOTÓW (strona 2 ekwipunku): fx z FIXED_ITEMS / UNIQUES (data.js) oraz ROD_TIERS / HOOK_TIERS (fishing.js, wg rzadkości)
const itemFx = i => !i || !i.isFishGear ? null : i.fixed ? FIXED_ITEMS[i.fixed] && FIXED_ITEMS[i.fixed].fx : i.unique ? UNIQUES[i.unique] && UNIQUES[i.unique].fx
  : i.sl === 'weapon' ? ROD_TIERS[i.r] && ROD_TIERS[i.r].fx : i.sl === 'hook' ? HOOK_TIERS[i.r] && HOOK_TIERS[i.r].fx : null;
const gearFx = () => {
  const t = { time: 0, dbl: 0, bycatch: 0, triple: 0, treasure: 0 };
  Object.values(eq2).forEach(i => { const f = itemFx(i); if (f) for (const e in f) t[e] += f[e]; });
  return t;
};
// linie bonusów w dymku przedmiotu (zielone, pod FP)
const FX_TXT = { time: v => `Fishing time -${v}%`, dbl: v => `+${v}% Double Catch`, triple: v => `+${v}% Triple Catch`, treasure: v => `+${v}% Treasure chance`, bycatch: v => `+${v}% Bycatch chance` };
const fxLines = i => { const f = itemFx(i); return f ? Object.keys(f).map(e => `<br><span style="color:#3fdc3f">${FX_TXT[e](f[e])}</span>`).join('') : ''; };
const setFx = () => {
  const t = { time: 0, dbl: 0, bycatch: 0, triple: 0, treasure: 0 };
  for (const k in FISH_SETS) { const c = setCount(k); FISH_SETS[k].bonus.forEach(b => { if (c >= b.n) for (const e in b.eff) t[e] += b.eff[e]; }); }
  return t;
};
// dymek przedmiotu z setu (styl WoW): nazwa setu (x/4), części (założone – kolor tekstu, brakujące – szare), bonusy (aktywne zielone, nieaktywne szare)
const setTip = i => {
  const k = setOf(i); if (!k) return '';
  const S = ALL_SETS[k], c = setCount(k), worn = p => Object.values(setEq(k)).some(x => x && x.fixed === p);
  return `<br><br><b style="color:#e69500">${S.name} (${c}/${S.pieces.length})</b>`
    + S.pieces.map(p => `<br><span style="color:${worn(p) ? 'var(--tx)' : 'var(--mut)'};${worn(p) ? '' : 'opacity:.7'}">${FIXED_ITEMS[p].name}</span>`).join('')
    + '<br>' + S.bonus.map(b => `<br><span style="color:${c >= b.n ? '#3fdc3f' : 'var(--mut)'}">(${b.n}) Set: ${b.d}</span>`).join('');
};
// CZAS BRANIA wybranej ryby – NIE bonus, tylko informacja: osobny blok NAD tabelą bonusów (inny wygląd: ikona ⏱, neutralny kolor)
const catchTimeTip = f => `<b>Time per catch</b>Base (${f ? f.name : ''}): ${fishT(f)[0]}–${fishT(f)[1]} s`
  + (timeCut() ? `<br>Fishing time reduction: -${pct1(timeCut())}%` : '') + `<br><span style='color:var(--mut)'>Minimum ${MIN_CATCH} s</span>`;
const fishBonusRows = () => {
  const f = FISH.find(x => x.id === fishing.sel), mut = t => `<br><span style='color:var(--mut)'>${t}</span>`;
  const split = (name, base, src, eff, cap) => `<b>${name}</b>${pct1(base)}% (${src})` + (pct1(base) > pct1(eff) ? mut(`Capped at ${cap}%`) : '');
  return [
    // osobny wiersz: łączne procentowe skrócenie czasu łowienia (drzewko + sety), z rozbiciem w dymku
    ['Fishing time reduction', timeCut() ? `-${pct1(timeCut())}%` : '0%', `<b>Fishing time reduction</b>Shortens every catch by this percent.`
      + `<br>Skill Tree: -${pct1(fub().time)}%<br>Gear: -${pct1(gearFx().time)}%<br>Set bonus: -${pct1(setFx().time)}%` + mut('Max -90%')],
    ['Double catch', `${pct1(effDouble())}%`, split('Double catch', doubleCatch(), 'Skill Tree + gear + set bonus', effDouble(), 100)],
    ['Triple catch', `${pct1(effTriple())}%`, `<b>Triple catch</b>Chance to catch three fish at once.<br>${pct1(effTriple())}% (Skill Tree + gear + set bonus)` + mut('Rolled before Double catch.')],
    ['Treasure chance', `${pct1(effTreasure())}%`, `<b>Treasure chance</b>Chance to find a Sunken Chest with each catch.<br>${pct1(effTreasure())}% (Skill Tree + gear + set bonus)` + mut('A chest holds 1–3 kinds of fish, 5–10 each.')],
    ['Bycatch chance', `${pct1(effBycatch(f))}%`, `<b>Bycatch chance</b>Chance to also catch a random lower fish.<br>${FISH.indexOf(f) <= 0 ? `<span style='color:var(--mut)'>Not possible on ${f ? f.name : 'this fish'} (no lower fish).</span>` : `${pct1(bycatchBase())}% (Skill Tree + gear + set bonus)`}`
      + mut('Bycatch fish do not roll special drops.<br>Counts toward Fishpedia.')],
    // wiersz pulsowania widać dopiero po Basic Training (Fishing Guide = niespodzianka)
    ...(fub().glowUnlock ? [['Glowing fish chance', `${pct1(effPulse() * 100)}%`, split('Glowing fish chance', PULSE_CHANCE * 100 + fub().glow, 'base', effPulse() * 100, 100)]] : [])
  ];
};

// PLANSZA DRZEWKA ŁOWIENIA – kopia zwykłych Skills: kontener .upg-tree-container (380 px), przeciąganie myszką, przybliżanie kółkiem.
// Plansza ma rozmiar ości (F_BW × F_BH); na start Basic Training jest przy lewej krawędzi okna. Własny stan przesuwania / przybliżenia.
// Budowana RAZ, potem tylko aktualizacja stanów nodów.
const F_PAD = 90, F_BW = Math.max(...FUPG.map(n => n.x)) + 2 * F_PAD, F_BH = 2 * (Math.max(...FUPG.map(n => Math.abs(n.y))) + F_PAD);
const F_OX = F_PAD, F_OY = F_BH / 2;   // pozycja (0,0) na planszy
let fPanX = 0, fPanY = 0, fZoom = 1, fDrag = null, fPanMoved = false, fPanInit = false;
// zasięg przesuwania (px przy zoomie 1): cała ość + zapas, żeby skrajne węzły (Basic Training, głowa) dało się przewinąć aż na środek okna i dalej
const F_EXT = { x: F_BW / 2 + 100, y: F_BH / 2 + 60 };
const fClamp = () => { fPanX = Math.max(-F_EXT.x * fZoom, Math.min(F_EXT.x * fZoom, fPanX)); fPanY = Math.max(-F_EXT.y * fZoom, Math.min(F_EXT.y * fZoom, fPanY)); };
const fApply = () => { const c = $('ftContent'); if (c) c.style.transform = `translate(${fPanX}px,${fPanY}px) scale(${fZoom})`; };
document.addEventListener('mousemove', e => {
  if (!fDrag) return;
  const dx = e.clientX - fDrag.x, dy = e.clientY - fDrag.y;
  if (Math.abs(dx) + Math.abs(dy) > 4) fPanMoved = true;
  fPanX = fDrag.px + dx; fPanY = fDrag.py + dy; fClamp(); fApply();
  const tip = $('tip'); if (tip) tip.style.display = 'none'; tip2.style.display = 'none';
});
document.addEventListener('mouseup', () => { if (fDrag) { fDrag = null; setTimeout(() => { fPanMoved = false; }, 0); } });
// klasy węzła: center (Basic Training), fkey (keystone – kręgosłup), fl-t / fl-g (żebra)
// RAMKI: wszystko, co idzie środkiem (kręgosłup i keystones) – pomarańczowe; żebra w górę i w dół – żółte
const fNodeCls = n => `upg-node${n.center ? ' center-node' : ''}${n.k === 's' ? ' small' : ''}${n.k === 'key' ? ' fkey' : ''}${n.lane === 't' || n.lane === 'g' ? ' fl-' + n.lane : ''}`;
document.head.insertAdjacentHTML('beforeend', '<style>'
  + '#fish-tree .upg-node.fkey{border-color:#e8793a!important;box-shadow:0 0 12px 2px #e8793a77}'
  + '#fish-tree .upg-node.fl-t,#fish-tree .upg-node.fl-g{border-color:#f2c200!important}'
  + '</style>');
function renderFishTree() {
  let box = $('fish-tree');
  if (!box) {
    box = document.createElement('div'); box.id = 'fish-tree'; box.style.marginTop = '8px';
    const X = F_OX, Y = F_OY;
    const nodes = FUPG.map(n => `<div class="${fNodeCls(n)}" data-fid="${n.id}" style="left:${X + n.x}px;top:${Y + n.y}px"><span class="ic">${n.ic}</span>`
      // licznik rang przy Basic Training i węzłach do kupienia (zapowiedzi i kręgosłup bez licznika)
      + (n.k === 's' || (n.ph && n.k !== 'key') ? '</div>' : `<div class="rkb" style="position:absolute;right:-9px;bottom:-9px;min-width:26px;padding:1px 4px;border-radius:7px;background:#120d08;border:1.5px solid #a39880;color:#a39880;font-size:12px;font-weight:800;line-height:14px;text-align:center;box-shadow:0 0 4px #000;z-index:1"></div></div>`)).join('');
    // linie: prosto od węzła wymaganego (req) do węzła; wszystkie w jednym kolorze (jak w zwykłych Skills)
    const lines = FUPG.filter(n => n.req).map(n => { const q = FUPG.find(x => x.id === n.req);
      return `<line data-fln="${q.id}|${n.id}" x1="${X + q.x}" y1="${Y + q.y}" x2="${X + n.x}" y2="${Y + n.y}" class="upg-line off"></line>`; }).join('');
    box.innerHTML = `<small style="color:var(--mut)">Mouse wheel: zoom · drag: pan the board</small><div class="upg-tree-container" id="ftContainer" style="margin-top:6px"><div class="upg-tree-content" id="ftContent" style="left:50%;top:50%;width:${F_BW}px;height:${F_BH}px;margin:${-F_BH / 2}px 0 0 ${-F_BW / 2}px"><svg class="upg-svg-lines" viewBox="0 0 ${F_BW} ${F_BH}">${lines}</svg>${nodes}</div></div>`;
    ($('fish-live') || $('body-fish')).after(box);
    const cont = $('ftContainer');
    cont.onmousedown = e => { e.preventDefault(); fPanMoved = false; fDrag = { x: e.clientX, y: e.clientY, px: fPanX, py: fPanY }; };
    cont.onwheel = e => {
      e.preventDefault();
      // przybliżanie względem środka widoku (jak w zwykłych Skills)
      const z0 = fZoom; fZoom = e.deltaY < 0 ? Math.min(2.5, fZoom + 0.15) : Math.max(0.5, fZoom - 0.15);
      const k = fZoom / z0; fPanX *= k; fPanY *= k; fClamp(); fApply();
    };
    fApply();
  }
  box.style.display = view === 'fish' && ftOpen ? 'block' : 'none';
  if (box.style.display === 'none') return;
  // pierwsze otwarcie: Basic Training przy lewej krawędzi okna (110 px od brzegu)
  if (!fPanInit) { const cw = $('ftContainer').clientWidth; if (cw) { fPanInit = true; fPanX = 110 - cw / 2 - (F_OX - F_BW / 2); fClamp(); fApply(); } }
  // stany nodów (jak w zwykłych Skills): bought = wymaksowany, avail = można kupić, disabled = brak punktów / wymagań
  const skTitle = t => `<b style='font-size:23px;margin-bottom:2px'>${t}</b>`, skRank = t => `<div style='color:#a39880;font-size:15px;margin-bottom:6px'>${t}</div>`;
  FUPG.forEach(n => {
    const el = box.querySelector(`[data-fid="${n.id}"]`); if (!el) return;
    const r = fRank(n.id), mx = n.max || 1, st = fMaxed(n) ? 'bought' : fCanBuy(n) ? 'avail' : (r ? 'bought' : 'disabled');
    el.className = `${fNodeCls(n)} ${st}`;
    el.onclick = fCanBuy(n) ? () => window.buyFishNode(n.id) : null;
    const b = el.querySelector('.rkb');
    if (b) { const c = r >= mx ? '#f2c200' : r ? '#ffffff' : '#a39880'; b.textContent = `${r}/${mx}`; b.style.borderColor = c; b.style.color = c; }
    // wymóg wydanych punktów (keystones): na zielono, gdy spełniony, na czerwono, gdy nie
    const spentReq = n.minSpent ? `<div style='margin-top:8px;color:${fSpent() >= n.minSpent ? '#3fdc3f' : '#e53935'}'>Requires ${n.minSpent} points spent in this tree (${Math.min(fSpent(), n.minSpent)}/${n.minSpent})</div>` : '';
    // zapowiedź: tylko nazwa ścieżki i „coming soon” (+ wymóg punktów przy keystone)
    if (n.ph) { el.dataset.tip = skTitle(n.n) + (mx > 1 ? skRank(`Rank 0/${mx}`) : '') + `<div style='color:#a39880'>${n.d()}</div>` + spentReq; return; }
    // dymek w stylu WoW: nazwa, ranga (duże), obecny efekt, „Next rank:”, koszt
    el.dataset.tip = skTitle(n.n) + (mx > 1 ? skRank(`Rank ${r}/${mx}`) : '') + `<div style='color:#ffd100'>${n.d(Math.max(1, r))}</div>`
      + (r && r < mx ? `<div style='margin-top:12px;font-weight:700;color:#fff'>Next rank:</div><div style='color:#ffd100'>${n.d(r + 1)}</div>` : '')
      + spentReq + (fMaxed(n) ? '' : `<div style='margin-top:12px;color:#3fdc3f'>Cost: 1 Fishing Skill Point</div>`);
  });
  // linia świeci, gdy oba końce są kupione
  box.querySelectorAll('[data-fln]').forEach(l => { const [a, b] = l.dataset.fln.split('|'), on = fRank(a) > 0 && fRank(b) > 0; l.classList.toggle('on', on); l.classList.toggle('off', !on); });
}

const isBoss = m => ALL_LOCS.some(l => l.mobs[l.mobs.length - 1] === m);
// IKONY DEBUFFÓW w prawym górnym rogu okna walki (zamiast wpisów w logu). Curse of Frailty nie ma ikony.
// st = stosy (liczba w prawym dolnym rogu, tylko dla debuffów, które się kumulują), tip = opis w dymku
const DEBUFFS = {
  sunder: ['curse_sunder', 'Curse of Frailty'], exhaust: ['curse_cripple', 'Curse of Withering'], expose: ['curse_exposed', 'Exposed Weakness'], mark: ['curse_shadow_mark', 'Curse of the Void'], agony: ['curse_agony', 'Torment'], warcry: ['skill_war_cry', 'War Cry', '📯'], rage: ['skill_rage_within', 'Rage Within', '😤'], fervor: ['skill_battle_fervor', 'Battle Fervor', '🔥'],
  reap: ['curse_terror', 'Terror'], fire: ['skill_combustion', 'Fire Energy', '🔥'], water: ['skill_tidal_renewal', 'Water Energy', '💧'], tide: ['skill_soothing_tide', 'Soothing Tide', '🌊'], burn: ['skill_lingering_flames', 'Burning', '♨️'], bolt: ['skill_lightning_bolt', 'Lightning Energy', '⚡'], bleed: ['curse_lacerate', 'Bleeding'], doom: ['curse_death', 'Death Sentence']
};
// id = 'debuffs' (wróg, prawy górny róg) albo 'pbuffs' (gracz, lewy górny róg) – ta sama ikona, stosy i dymek
function renderAuras(id, list) {
  let el = $(id);
  if (!el) {
    el = document.createElement('div'); el.id = id;
    el.style.cssText = `position:absolute;top:6px;${id === 'pbuffs' ? 'left' : 'right'}:8px;display:flex;gap:4px;z-index:2`;
    $('fightbox').appendChild(el);
  }
  // pod wierszem Back / Victory (wyprawa) – ikony nie zasłaniają przycisku; bez tego wiersza (lochy) jak dawniej 6 px od góry
  { const fr = $('fbackrow'); el.style.top = (fr && fr.style.display !== 'none' ? fr.offsetTop + fr.offsetHeight + 4 : 6) + 'px'; }
  // obwódka: czerwona = debuff na wrogu, zielona = buff gracza
  const bc = id === 'pbuffs' ? '#3fbf4f' : '#e53935';
  // ikony to pixel art 32×32 (plik 128 px = ×4) → wyświetlane dokładnie 32×32 (skala całkowita) bez wygładzania, żeby piksele były równe
  // STAŁA KOLEJNOŚĆ ikon (buffy i debuffy): ikona pojawiająca się / znikająca nie przestawia pozostałych
  const ORD = ['warcry', 'rage', 'fervor', 'reap', 'bolt', 'fire', 'water', 'tide', 'sunder', 'exhaust', 'expose', 'mark', 'burn', 'bleed', 'doom', 'agony'];
  const pos = k => { const i = ORD.indexOf(k); return i < 0 ? 99 : i; };
  el.innerHTML = Object.entries(list || {}).sort((a, b) => pos(a[0]) - pos(b[0])).map(([k, v]) => `<div data-tip="<b>${DEBUFFS[k][1]}</b>${v.tip}" style="position:relative;box-sizing:content-box;width:32px;height:32px;border:2px solid ${bc};border-radius:4px;overflow:hidden;box-shadow:0 0 4px #0008">`
    + `<img src="${ASSETS_DIR}/skills/curses/${DEBUFFS[k][0]}.png" alt="" style="display:block;width:32px;height:32px;image-rendering:pixelated" onerror="this.outerHTML='<span style=&quot;display:flex;align-items:center;justify-content:center;height:100%;font-size:18px&quot;>${DEBUFFS[k][2] || '✨'}</span>'">`
    + (v.st ? `<span style="position:absolute;right:2px;bottom:0;font-size:11px;font-weight:800;color:#fff;text-shadow:0 0 2px #000,0 0 3px #000,1px 1px 0 #000">${v.st}</span>` : '') + `</div>`).join('');
  refreshTip();   // jeśli kursor stoi na ikonie, dymek od razu pokazuje nowe wartości (bez ruszania myszką)
}
const renderDebuffs = deb => renderAuras('debuffs', deb);
const renderPBuffs = buf => renderAuras('pbuffs', buf);
// Curse of Frailty: HP, z którym wróg zaczyna walkę (maks. HP zostaje pełne, np. 196/205)
const frailHp = max => Math.max(1, Math.round(max * (1 - (ub().efrail || 0) / 100)));
// KUPOWANIE STATYSTYK: cena wielomianowa 15 + 3 × n² (n = ile razy ta statystyka była już kupiona): 15, 18, 27, 42, 63 … 10. ≈ 315, 20. ≈ 1215, 30. ≈ 2715
const cost = k => 15 + 3 * up[k] ** 2;
// XP za przeciwnika: poziom×20+10 (Lynx = 30)
const xpOf = m => m.l * 20 + 10;   // także w DEV (Lynx = 30 XP; dawne 1000 XP w DEV usunięte – poziom ustawia się w panelu DEV)
// WARTOŚĆ przedmiotu (sprzedaż, Value w dymku) = 50% wartości bazowej (priceBase); sklep liczy cenę od wartości bazowej, więc ceny w sklepie bez zmian
const priceBase = i => i.val !== undefined ? i.val : Math.round((4 + me.lvl * 5) * RAR[i.r][1] ** 2);
const price = i => Math.max(1, Math.round(priceBase(i) * 0.5));
let dsel = -1;   // wybrany przeciwnik w lochu (można wybrać tylko kolejnego niepokonanego = dprog)
const FIGHTBOX = document.getElementById('fightbox');   // stała referencja – okno walki bywa przenoszone do karty lochu
let dfight = false, dJustBeat = false;   // dfight = okno lochu zamienione w walkę; dJustBeat = właśnie pokonany pierwszy raz (po Back → wybór następnego)
let dview = 0;
// LEWY PANEL LOCHU: special dropy (jak u ryb: „?” do pierwszego zdobycia, potem grafika; DEV – wszystko odkryte), losowy przedmiot wg rzadkości, XP i złoto
// ===== SKLEP =====
// 6 losowych przedmiotów (dowolny slot ekwipunku) z poziomu gracza w chwili odświeżenia; RZADKOŚĆ każdego przedmiotu losowana
// z tymi samymi szansami co drop z najdalej pokonanego przeciwnika na wyprawie (lochy się nie liczą), np. najdalej Sphinx →
// 51% szare / 49% zielone. Nic jeszcze nie pokonane → same szare. Odświeżenie co 20 h (me.shop.t = czas następnego odświeżenia).
// Cena kupna = 4 × wartość sprzedaży z chwili odświeżenia. Kupiony przedmiot znika do następnego odświeżenia („Sold”).
const SHOP_REFRESH = 20 * 3600e3, SHOP_N = 6, SHOP_MUL = 4;
function shopTierNow() {
  if (me.shopTier === undefined) {   // stary zapis: rzadkość z lokacji, których bossowie są już pokonani
    let t = 0; ALL_LOCS.slice(0, locUnlocked).forEach(l => l.mobs.forEach(m => { if (m.drop && m.drop.length) t = Math.max(t, Math.min(4, Math.max(...m.drop))); }));
    me.shopTier = t;
  }
  return me.shopTier;
}
// najdalej pokonany przeciwnik wyprawy: ostatnia lokacja z postępem (me.eprog) → ostatni pokonany w niej przeciwnik
function bestBeatenMob() {
  const ep = me.eprog || {};
  for (let li = ALL_LOCS.length - 1; li >= 0; li--) { const n = Math.min(ep[li] || 0, ALL_LOCS[li].mobs.length); if (n > 0) return ALL_LOCS[li].mobs[n - 1]; }
  return null;
}
function shopPool() {   // tablica rzadkości jak mob.drop (losowanie P() = te same procenty); brak / pusty drop → same szare
  const m = bestBeatenMob();
  return m && m.drop && m.drop.length ? m.drop : [0];
}
function genShop() {
  const pool = shopPool();   // każdy przedmiot losuje rzadkość osobno
  const items = Array.from({ length: SHOP_N }, () => { const it = mk(pool, undefined, undefined, shopAct()); it.cost = priceBase(it) * SHOP_MUL; return it; });
  me.shop = { t: Date.now() + SHOP_REFRESH, items };
}
function ensureShop() { if (!me.shop || !me.shop.items || Date.now() >= me.shop.t) genShop(); }

// ===== QUESTY =====
// Co 2 h nowa pula 3–5 questów (me.quests.t = czas resetu). Quest: pokonaj X (3–10) razy wybranego przeciwnika wyprawy
// z poziomem gracza −3…+4 (tylko odblokowani przeciwnicy). Nagroda: ×3 złota i ×3 XP najlepszego pokonanego przeciwnika (× losowo 0.9–1.1)
// oraz losowy przedmiot o rzadkości jak w sklepie (szanse dropu najlepszego pokonanego przeciwnika).
// Aktywny może być tylko 1 quest; po ukończeniu można wziąć kolejny. Porzucony quest przepada do resetu. Reset kasuje wszystkie (także aktywny).
const QUEST_RESET = 2 * 3600e3, QUEST_LVL = 5;   // questy dostępne od 5 poziomu
const qMob = q => ALL_LOCS[q.li] && ALL_LOCS[q.li].mobs[q.mi];
function genQuests() {
  const L = me.lvl, avail = [];
  ALL_LOCS.forEach((loc, li) => { if (locOpen(li)) loc.mobs.forEach((m, mi) => { if (mobOpen(li, mi)) avail.push([li, mi]); }); });
  let pool = avail.filter(([li, mi]) => { const l = ALL_LOCS[li].mobs[mi].l; return l >= L - 3 && l <= L + 4; });
  if (pool.length < 3) pool = avail.slice().sort((a, b) => Math.abs(ALL_LOCS[a[0]].mobs[a[1]].l - L) - Math.abs(ALL_LOCS[b[0]].mobs[b[1]].l - L)).slice(0, 5);   // za mało w przedziale → najbliżsi poziomem
  for (let i = pool.length - 1; i > 0; i--) { const j = I(0, i); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const b = bestBeatenMob() || ALL_LOCS[0].mobs[0], bx = xpOf(b), bg = Math.round(b.l * 3);
  me.quests = { t: Date.now() + QUEST_RESET, active: null,
    list: pool.slice(0, I(3, 5)).map(([li, mi]) => ({ li, mi, need: I(3, 10), got: 0, st: 'open', xp: Math.round(3 * bx * R(0.9, 1.1)), gold: Math.round(3 * bg * R(0.9, 1.1)), item: mk(shopPool(), undefined, undefined, actOfMob(ALL_LOCS[li].mobs[mi])) })) };   // wygląd: akt przeciwnika z questa   // item: nagroda znana od początku (widać w dymku)
}
function ensureQuests() { if (!me.quests || !me.quests.list || Date.now() >= me.quests.t) genQuests(); }
// XP z nagrody (poza walką też): awanse jak po walce (+1 do statystyk, +1 skill point)
function addXp(x) {
  if (me.lvl >= MAX_LVL) return 0;
  me.xp += x;
  while (me.lvl < MAX_LVL && me.xp >= xpNeed(me.lvl)) { me.xp -= xpNeed(me.lvl); me.lvl++; me.str += 1; me.dex += 1; me.con += 1; me.sp++; spDot = true; say(`<b>Level up: ${me.lvl}!</b> +1 skill point`, 'crit'); }
  return x;
}
window.acceptQuest = k => { ensureQuests(); const Q = me.quests, q = Q.list[k]; if (busy || Q.active != null || !q || q.st !== 'open') return; q.st = 'active'; Q.active = k; render(); };
window.abandonQuest = () => { const Q = me.quests; if (busy || !Q || Q.active == null) return; Q.list[Q.active].st = 'gone'; Q.active = null; say('Quest abandoned.', 'miss'); render(); };
// pokonany przeciwnik (wyprawa) → postęp aktywnego questa; ukończenie: złoto, XP i przedmiot (przedmiot trafia do łupu pod Collect)
function questKill(mob, loot) {
  const Q = me.quests; if (me.lvl < QUEST_LVL || !Q || Q.active == null || Date.now() >= Q.t) return null;
  const q = Q.list[Q.active]; if (!q || q.st !== 'active' || qMob(q) !== mob) return null;
  q.got++;
  if (q.got < q.need) { say(`Quest: ${mob.n} ${q.got}/${q.need}`, 'miss'); return null; }
  q.st = 'ready';   // cel osiągnięty – nagrodę odbiera się przyciskiem Complete w panelu Quests
  say(`<b>Quest objective complete!</b> Claim your reward in Quests.`, 'crit');
  return null;
}
// COMPLETE: odbiór nagrody ukończonego questa – złoto, XP (awanse jak po walce) i przedmiot prosto do plecaka; potem wracają pozostałe questy
window.completeQuest = () => {
  const Q = me.quests; if (busy || !Q || Q.active == null) return;
  const q = Q.list[Q.active]; if (!q || q.st !== 'ready') return;
  const btn = document.querySelector('#quest-side button[onclick*="completeQuest"]'), from = (btn || $('quest-side')).getBoundingClientRect();   // start animacji: przycisk Complete
  holdGold = window.G_GLOBAL; holdXp = { lvl: me.lvl, xp: me.xp };   // panel Gold i pasek XP czekają, aż dolecą monety i kulki XP
  q.st = 'done'; Q.active = null;
  window.G_GLOBAL += q.gold; const gx = addXp(q.xp);
  const it = Object.assign({}, q.item || mk(shopPool())); it.fresh = 1; inv.push(it);   // dokładnie ten przedmiot, który pokazywał dymek
  say(`<b>Quest complete!</b> +${q.gold} gold, +${gx} XP, <b class="t${it.r}">${it.name}</b>`, 'crit');
  render();
  setTimeout(() => flyReward(q.gold, gx, from), 60);   // animacja jak po walce: monety do panelu Gold, kulki XP do paska doświadczenia
};
function renderQuestSide() {
  const side = $('quest-side'); if (!side) return;
  side.hidden = view !== 'exp' || me.lvl < QUEST_LVL; if (side.hidden) return;   // od 5 poziomu
  ensureQuests();
  const act = $('act-side'); side.style.top = act && !act.hidden && getComputedStyle(act).position === 'absolute' ? (act.offsetTop + act.offsetHeight + 10) + 'px' : '10px';
  const Q = me.quests, cd = side.querySelector('[data-questcd]'); if (cd) cd.textContent = fmtCd(Q.t - Date.now());
  const rows = Q.list.map((q, k) => {
    if (q.st === 'gone' || q.st === 'done') return '';   // porzucone i ukończone (odebrane) questy nie wracają na listę
    if (Q.active != null && k !== Q.active) return '';   // aktywny quest – pozostałe schowane (wracają po porzuceniu lub ukończeniu)
    const m = qMob(q); if (!m) return '';
    if (!q.item) q.item = mk(shopPool());   // stary zapis questów bez przedmiotu
    const btn = q.st === 'open' ? `<button onclick="window.acceptQuest(${k})"${Q.active != null || busy ? ' disabled' : ''}>Accept</button>`
      : q.st === 'active' ? `<button onclick="window.abandonQuest()"${busy ? ' disabled' : ''} title="The quest is lost until the next reset">Abandon</button>`
      : q.st === 'ready' ? `<button onclick="window.completeQuest()"${busy ? ' disabled' : ''} style="background:var(--ac);color:#fff;border-color:var(--ac);font-weight:700">Complete</button>`   // cel osiągnięty – odbierz nagrodę
      : '<span style="color:#3fdc3f;font-weight:700">✓</span>';
    const prog = q.st === 'active' || q.st === 'ready' ? `<div class="qbar"><i style="width:${q.got / q.need * 100}%"></i></div><small>${q.got}/${q.need}</small> ` : '';
    // bez ikony, poziomu, lokacji i nagród w wierszu – nagroda (XP, złoto, przedmiot) w dymku po najechaniu
    return `<div class="qrow ${q.st}" data-it="questrw:${k}"><div class="qtx"><b>Kill ${q.need}× ${m.n}</b>${prog ? '<br>' + prog : ''}</div>${btn}</div>`;
  }).join('');
  $('body-quest-side').innerHTML = rows || '<small style="color:var(--mut)">All quests done. New quests after the reset.</small>';
}
window.refreshShop = () => { genShop(); render(); };   // tylko DEV
window.buyShop = (n, equipIt) => {   // equipIt = przeciągnięty prosto na postać: kup i od razu załóż (jeśli poziom pozwala)
  const it = me.shop && me.shop.items[n];
  if (!it || busy || window.G_GLOBAL < it.cost) return;
  window.G_GLOBAL -= it.cost;
  const o = Object.assign({}, it); delete o.cost; o.fresh = 1; inv.push(o);
  me.shop.items[n] = null;
  say(`Bought: <b class="t${o.r}">${o.name}</b> for ${it.cost} gold`);
  if (equipIt) { delete o.fresh; swapIn(inv.length - 1, eq1, o); return; }   // swapIn sprawdza wymagany poziom i odświeża
  render();
};
// przycisk Fight pod Special drops: aktywny dla wybranego przeciwnika (pokonanego albo kolejnego niepokonanego), z licznikiem przerwy po wygranej
function dunFightBtn(i) {
  const ok = dsel === i && dsel >= 0, cd = ok ? dunCd(i) : 0;   // przycisk zawsze na dole panelu dropów (margin-top:auto), w tym samym miejscu dla każdego przeciwnika
  return `<button class="dfbtn" data-a="dfight"${!ok || cd || busy || fishing.active ? ' disabled' : ''}>${cd ? `<span class="dcd" data-cd="${i}">${fmtCd(cd)}</span>` : 'Fight!'}</button>`;
}
function dunDrops(m, mi) {
  const sd = m.sd || [];
  const cells = sd.length ? `<div class="fdrops-lbl">Special drops</div><div class="fdrops">` + sd.map((x, n) => {
    const u = FIXED_ITEMS[x.k], k = true;   // przedmioty z lochów zawsze widoczne (bez „?”)
    const pic = k ? `<img src="${ASSETS_DIR}/${u.img}" alt="" draggable="false" style="width:32px;height:32px;image-rendering:pixelated" onerror="this.outerHTML='<span style=&quot;font-size:22px&quot;>${u.e}</span>'">` : uiIco('ui_question', '❔', 32, 'opacity:.4');
    return `<div class="fdrop" ${k ? `data-it="dsd:${mi}:${n}"` : `data-tip="<b>???</b>Not discovered yet<br>Chance: ${x.pct}%"`}><div class="cell${k ? ' r' + u.r : ' undisc'}${k && u.req && me.lvl < u.req ? ' noreq' : ''}">${pic}</div><small>${x.pct}%</small></div>`;
  }).join('') + `</div>` : `<div class="fdrops-lbl">Special drops</div><small style="color:var(--mut)">None</small>`;
  return cells;   // bez nagłówka z nazwą przeciwnika
}   // przeciwnik, którego dropy widać w lewym panelu lochu (można kliknąć każdego)
const curMob = () => view == 'exp' ? (eloc != null && esel >= 0 && mobOpen(eloc, esel) ? ALL_LOCS[eloc].mobs[esel] : null) : view == 'dun' ? (dloc != null && dsel >= 0 && dsel <= dunProg() && dsel < DUN.mobs.length ? DUN.mobs[dsel] : null) : null;
// LOCH – powtarzanie walk: każdy pokonany (i kolejny niepokonany) przeciwnik może być atakowany wielokrotnie.
// Zwykły tryb: po WYGRANEJ 1 h przerwy dla tego przeciwnika (me.dcd[i] = koniec przerwy, zapisywane w save). DEV: bez przerw.
const DUN_CD = 3600e3;
const dunCd = i => DEV && !devFlag('dcd', false) ? 0 : Math.max(0, ((me.dcd || {})[i] || 0) - Date.now());
const fmtCd = ms => { const t = Math.ceil(ms / 1000), h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0'); };

// NAZWA → GRAFIKA (akt 1): jedna grafika na nazwę z NAMES (data.js)
const NAME_SPRITE = {
  Sword: 'weapon_sword', Axe: 'weapon_axe', Mace: 'weapon_mace',
  Tunic: 'armor_tunic', Chainmail: 'armor_chainmail', Cuirass: 'armor_cuirass',
  'Plate Armor': 'armor_plate', 'Scale Mail': 'armor_scale', Brigandine: 'armor_brigandine',   // akt 2
  Hood: 'helm_hood', Cap: 'helm_cap', Helmet: 'helm_helmet',
  'Knight Helm': 'helm_knight', 'Drake Helm': 'helm_drake', 'Shadow Helm': 'helm_shadow',   // akt 2
  Band: 'ring_band', Ring: 'ring_ring', Signet: 'ring_signet',
  Chalice: 'trinket_chalice', 'Stone of Hope': 'trinket_stone', 'Lucky Clover': 'trinket_clover',
  'Leather Boots': 'boots_leather', 'Steel Boots': 'boots_steel', 'Fur Boots': 'boots_fur',
  'Leather Gloves': 'gloves_leather', 'Steel Gauntlets': 'gloves_steel', 'Fur Mittens': 'gloves_fur',
  'Wooden Shield': 'shield_wood', 'Ruby Shield': 'shield_ruby', 'Emerald Shield': 'shield_emerald',
  'Knight Shield': 'shield_knight', 'Drake Shield': 'shield_drake', 'Shadow Shield': 'shield_shadow',   // akt 2
  'Emerald Amulet': 'amulet_emerald', 'Frost Amulet': 'amulet_frost', 'Ruby Amulet': 'amulet_ruby'
};
// OBRAŻENIA BRONI: średnia = (5 + poziom × 1.5) × 1.3 × losowo 0.8–1.2; ROZRZUT losowy: max = min × 1.05…1.9
// (np. 34-36 albo 34-65 przy tym samym poziomie). Średnia nie zależy od rozrzutu – wąska broń ma wyższe minimum, szeroka niższe.
function wpnDmg(lvl) { const avg = (5 + lvl * 1.5) * 1.3 * 0.9 * R(0.8, 1.2),   /* ×0.9: broń −10% obrażeń (poza bronią z lochów) */ k = R(1.05, 1.9), mn = 2 * avg / (1 + k); return [Math.max(1, Math.round(mn)), Math.max(2, Math.round(mn * k))]; }   // deklaracja funkcji – dostępna też w migracji na górze pliku
const ARM_TIER = [1, 1.8, 2.8, 4.2, 5.9];   // mnożnik pancerza za rzadkość: common, uncommon, rare, epic, legendary
// AKT PRZEDMIOTU (tylko wygląd): akt lokacji przeciwnika; przeciwnik spoza wyprawy (loch) / brak → akt najlepszego pokonanego przeciwnika
const actOfMob = m => { const li = m ? ALL_LOCS.findIndex(l => l.mobs.includes(m)) : -1; return li < 0 ? (m === bestBeatenMob() ? 0 : actOfMob(bestBeatenMob())) : ACT_START.filter(s => s <= li).length - 1; };
const shopAct = () => actOfMob(bestBeatenMob());   // sklep i nagrody z questów bez przeciwnika: akt najdalszego pokonanego przeciwnika
function mk(pool, fSl, fBase, act) {   // fSl / fBase = wymuszony slot i nazwa bazowa (spawn po ID w panelu DEV); act = akt (0 = akt 1) – decyduje o nazwie i grafice
  let r = Math.min(4, P(pool)), sl = fSl || P(Object.keys(SL));   // losowe przedmioty: maks. legendarne – mityczne są tylko unikaty
  const onlyCommon = pool.length === 1 && pool[0] === 0;
  while (!fSl && onlyCommon && (sl === 'amulet' || sl === 'ring' || sl === 'trinket')) sl = P(Object.keys(SL));
  while (!fSl && (sl == 'amulet' || sl == 'ring' || sl == 'trinket') && r === 0) sl = P(Object.keys(SL));
  const mult = RAR[r][1], s = {}, j = () => R(0.8, 1.2); let d = null;   // losowy mnożnik 0.8–1.2 (jak pula statystyk) – obrażenia broni i pancerz
  if (sl == 'weapon') {
    // obrażenia broni rosną z POZIOMEM, ale NIE z rzadkością (losowo 0.8–1.2); Strength mnoży je: × (1 + STR/100)
    d = wpnDmg(me.lvl);
  } else if (sl !== 'amulet' && sl !== 'ring' && sl !== 'trinket') {
    // pancerz: własny mnożnik za rzadkość (szary 1 → złoty 5.9) – pełny złoty zestaw na 80 poziomie ≈ 3000 pancerza
    s.arm = Math.max(1, Math.round((2 + me.lvl * 1.3) * { helm: 1, armor: 1.4, shield: 1.1, boots: .6, gloves: .7 }[sl] * j() * ARM_TIER[r]));
  }
  // STATYSTYKI Z PULI: szare – brak; zielone / niebieskie / fioletowe / złote – 1, 2 albo 3 losowe statystyki, które DZIELĄ wspólną pulę
  // (np. zielony z pulą 10: 10 Vitality albo 5 Vitality + 5 Strength). Pula = (1 + poziom × 0.9) × mnożnik rzadkości × POOL[r]
  // – o 50% mniej niż dawna suma statystyk (dawniej: 1 / 2 / 3 / 3 statystyki po pełnej wartości).
  const POOL = [0, 0.5, 1, 1.5, 1.5];
  if (r > 0) {
    // losowy mnożnik puli 0.8–1.2: przedmioty z tego samego poziomu i rzadkości różnią się siłą (nie każdy kolejny to pewny upgrade)
    const pool = Math.max(1, Math.round((1 + me.lvl * .9) * mult * POOL[r] * j()));
    const keys = ['str', 'dex', 'con'].sort(() => Math.random() - .5).slice(0, Math.min(I(1, 3), pool));
    const w = keys.map(() => 0.4 + Math.random()), sw = w.reduce((a, b) => a + b, 0);
    let left = pool;
    keys.forEach((k, n) => { const v = n === keys.length - 1 ? left : Math.max(1, Math.min(left - (keys.length - 1 - n), Math.round(pool * w[n] / sw))); s[k] = v; left -= v; });
  }
  // po angielsku przymiotnik stoi przed rzeczownikiem: "Rare Sword"
  const base = fBase || P(namesFor(act, sl)), o = { sl, r, name: (r ? RAR[r][0] + ' ' : '') + base, s, d };
  if (d) o.dv = 3;   // wersja wzoru obrażeń broni (migracja starych zapisów); 3 = −10% obrażeń
  o.ic = NAME_SPRITE[base] || 0;   // grafika zgodna z nazwą (tabela NAME_SPRITE)
  return o;
}

// Ikona materiału: grafika z assets, jeśli materiał ma "img" w MATS (np. Crucian Carp → assets/fish/1.png),
// w przeciwnym razie emoji. Gdy pliku nie ma, w jego miejscu pojawia się emoji. px = rozmiar grafiki, fs = rozmiar emoji.
// Sprite'y materiałów to pixel art 16×16 (plik 64×64), więc skalujemy je ostro (pixelated) – w 48 px to dokładnie ×3.
const matIco = (k, px = 48, fs = 32) => {
  const d = MATS[k];
  if (!d.img) return `<span class="ic" style="font-size:${fs}px">${d.e}</span>`;
  return `<img class="px" src="${ASSETS_DIR}/${d.img}" alt="" style="width:${px}px;height:${px}px;image-rendering:pixelated" onerror="this.outerHTML='<span class=\\'ic\\' style=\\'font-size:${fs}px\\'>${d.e}</span>'">`;
};

const ico = (i, size) => {
  if (i.mat) return matIco(i.sl, 48, 32);
  if (i.isScroll) return scrollIco(scrollKind(i), 48);
  if (i.isGuide) return `<img class="px" src="${ASSETS_DIR}/${GUIDE.img}" alt="" style="width:48px;height:48px;image-rendering:pixelated" onerror="this.outerHTML='<span class=\\'ic\\' style=\\'font-size:32px\\'>${GUIDE.e}</span>'">`;   // pixel art 16×16 (plik 64×64)
  if (i.isFood) return dishIco(i.kind, size || 48);   // danie z Cooking: emoji (placeholder)
  if (i.isChest) return chestIco(size || 48);   // Sunken Chest: pixel art assets/materials/sunken_chest.png
  // przepis: grafika z assets/recipes/ (jeśli brak pliku – emoji zwoju)
  if (i.isDesign) return `<img class="px" src="${ASSETS_DIR}/${DESIGN_IMG}" alt="" style="width:${size || 48}px;height:${size || 48}px" onerror="this.outerHTML='<span class=\\'ic\\' style=\\'font-size:32px\\'>📘</span>'">`;
  if (i.isRecipe) { const d = RECIPES[i.kind]; return `<img class="px" src="${ASSETS_DIR}/${d.img}" alt="" style="width:${size || 48}px;height:${size || 48}px" onerror="this.outerHTML='<span class=\\'ic\\' style=\\'font-size:32px\\'>${d.e}</span>'">`; }
  // unikat: własna grafika z assets/unique/ (pixel art 16×16 jak haczyk → 48 px = ×3, w slocie 64 px = ×4, zawsze ostro)
  if (i.unique) { const u = UNIQUES[i.unique]; return `<img class="px" src="${ASSETS_DIR}/${u.img}" alt="" style="width:48px;height:48px;image-rendering:pixelated" onerror="this.outerHTML='<span class=\\'ic\\' style=\\'font-size:32px\\'>${u.e}</span>'">`; }
  // przedmiot o stałych statystykach: własna grafika (pixel art 16×16 jak haczyk → 48 px = ×3, 64 px = ×4, zawsze ostro)
  if (i.fixed) { const u = FIXED_ITEMS[i.fixed]; return `<img class="px" src="${ASSETS_DIR}/${u.img}" alt="" style="width:48px;height:48px;image-rendering:pixelated" onerror="this.outerHTML='<span class=\\'ic\\' style=\\'font-size:32px\\'>${u.e}</span>'">`; }
  if (i.isFishGear && i.sl === 'hook') {
    // grafiki haczyka: fhook1..fhook6 = zwykły, niezwykły, rzadki, epicki, legendarny, mityczny
    const n = Math.min(6, (i.r || 0) + 1);
    return `<img class="px" src="${ASSETS_DIR}/fishing_hook/fhook${n}.png" alt="" style="width:${size || 48}px;height:${size || 48}px" onerror="this.outerHTML='<span class=\\'ic\\' style=\\'font-size:32px\\'>🪝</span>'">`;
  }
  if (i.isFishGear && i.sl === 'weapon') {
    // grafiki wędek: rod1..rod6 = zwykła, niezwykła, rzadka, epicka, legendarna, mityczna
    // 48 px w plecaku (siatka 16×16 → ×3), 56 px w slocie broni (odrobinę mniejsza niż miecz)
    const n = Math.min(6, (i.r || 0) + 1), px = size || 48;
    return `<img class="px" src="${ASSETS_DIR}/fishing_rods/rod${n}.png" alt="" style="width:${px}px;height:${px}px;image-rendering:pixelated" onerror="this.outerHTML='<span class=\\'ic\\' style=\\'font-size:32px\\'>🎣</span>'">`;
  }
  if (i.sl === 'trinket') return `<img class="px" src="${ASSETS_DIR}/trinket/${trinketSprite(i)}.png" alt="" style="width:48px;height:48px;image-rendering:pixelated" onerror="this.outerHTML='<span class=\\'ic\\' style=\\'font-size:32px\\'>${SL.trinket[0]}</span>'">`;   // talizman: pixel art 16×16 (assets/trinket)
  let folder = i.sl, filename = '';
  if (folder === 'amulet') filename = `${AMULET_SPRITES.includes(i.ic) ? i.ic : AMULET_SPRITES[0]}.png`;   // assets/amulet/amulet_*.png (stare numery → pierwsza grafika)
  else if (folder === 'boots') filename = `${BOOTS_SPRITES.includes(i.ic) ? i.ic : BOOTS_SPRITES[0]}.png`;   // assets/boots/boots_*.png (stare numery → pierwsza grafika)
  else if (folder === 'gloves') filename = `${GLOVES_SPRITES.includes(i.ic) ? i.ic : GLOVES_SPRITES[0]}.png`;   // assets/gloves/gloves_*.png (stare numery → pierwsza grafika)
  else if (folder === 'ring') filename = `${ringSprite(i)}.png`;   // assets/ring/ring_*.png (16×16)
  else if (folder === 'armor') filename = `${armorSprite(i)}.png`;   // assets/armor/armor_*.png (16×16)
  else if (folder === 'shield') filename = `${SHIELD_SPRITES.includes(i.ic) ? i.ic : SHIELD_SPRITES[0]}.png`;   // assets/shield/shield_*.png (stare numery → pierwsza grafika)
  else if (folder === 'helm') filename = `${helmSprite(i)}.png`;   // assets/helm/helm_*.png (16×16)
  else if (folder === 'weapon') filename = `${weaponSprite(i)}.png`;   // assets/weapon/weapon_*.png (16×16)
  else filename = `tile${i.ic}.png`;
  // broń (miecz, buława, topór) to pixel art 16×16 – w 48 px skala ×3, ostro (pixelated)
  // rękawice też są na siatce 32×32 – pokazujemy je w 64 px (dokładnie ×2), żeby piksele były równe i sprite nie „drgał”
  const imgStyle = folder === 'gloves' ? 'width:64px;height:64px;image-rendering:pixelated' : folder === 'weapon' || folder === 'armor' ? 'width:48px;height:48px;image-rendering:pixelated' : 'width:48px;height:48px';
  return `<img class="px${i.rust ? ' rust' : ''}" src="${ASSETS_DIR}/${folder}/${filename}" alt="" style="${imgStyle}" onerror="this.outerHTML='<span class=\\'ic\\' style=\\'font-size:32px\\'>${SL[i.sl] ? SL[i.sl][0] : '🎒'}</span>'">`;
};

// ROZMIARY SPRITE'ÓW – jeden standard:
//  • EKWIPUNEK (sloty): 64 px – lekko większe niż w plecaku. Siatka 16×16 → ×4, 32×32 → ×2: zawsze ostre piksele.
//  • PLECAK: 48 px dla WSZYSTKICH przedmiotów (także zbroja i rękawice) → równe kafelki i równe wiersze.
//    Siatka 32×32 (zbroja, rękawice, miecze, unikaty) w 48 px = ×1,5 → skalowanie gładkie (bez nierównych pikseli); reszta ostra.
// !important nadpisuje regułę miecza 64 px z index.html. Emoji (placeholdery) bez zmian.
const GRID32 = i => !i.fixed && !i.unique && i.sl === 'gloves';   // broń i zbroje są już 16×16 (ostre w 48 / 64 px)   // stałe przedmioty i unikaty są 16×16
const sizeIco = (i, base) => {
  const px = base;
  const sharp = !GRID32(i) || px % 32 === 0;
  return ico(i).replace(/width:\d+px;\s*height:\d+px(;\s*image-rendering:\w+)?/, `width:${px}px!important;height:${px}px!important;image-rendering:${sharp ? 'pixelated' : 'auto'}`);
};
const slotIco = i => sizeIco(i, 64);
const invIco = i => sizeIco(i, 48);
// czerwona kropka „nowy” w plecaku: mniejsza i wewnątrz kafelka (nie wychodzi na sąsiednie)
document.head.insertAdjacentHTML('beforeend', '<style>#lvl{display:inline-block;transform-origin:left center}#lvl.lvlpop{animation:lvlpop 1.3s ease-out}@keyframes lvlpop{0%{transform:scale(1)}15%{transform:scale(1.18);color:#f2c200;text-shadow:0 0 10px #f2c200aa}55%{transform:scale(1.05);color:#f2c200;text-shadow:0 0 6px #f2c20077}100%{transform:scale(1)}}</style>');
document.head.insertAdjacentHTML('beforeend', '<style>.shopwrap{display:grid;grid-template-columns:auto 1fr auto;gap:12px 16px;align-items:start}.shopgrid{display:grid;grid-template-columns:repeat(3,84px);gap:10px}.shopslot{display:flex;flex-direction:column;align-items:center;gap:4px}.shopslot .cell{width:84px;height:84px}.shopslot button{width:84px;padding:3px 0;font-size:12px;font-weight:700}.shopsold{border-style:dashed!important;color:var(--mut);font-size:12px;cursor:default!important}.shopmid{grid-column:1/-1;grid-row:1;text-align:center;white-space:nowrap}.shopgrid{grid-column:1;grid-row:2}.shopoffer{grid-column:3;grid-row:2}.shoptimer{font-size:12px;font-weight:700;color:var(--mut);letter-spacing:.04em}.shoptimer b{color:var(--ac);font-size:14px}.shopoffer{display:flex;flex-direction:column;align-items:center;gap:6px;width:170px;padding:12px;border:2px solid var(--ac);border-radius:12px;text-align:center}.shopoffer .cell{display:flex;align-items:center;justify-content:center}.shopoffer button{width:100%;font-weight:700}.shopofflbl{font-size:11px;font-weight:800;color:var(--ac);text-transform:uppercase;letter-spacing:.08em}@media(max-width:700px){.shopwrap{grid-template-columns:1fr}.shopoffer{width:auto}.shopgrid,.shopoffer{grid-column:1;grid-row:auto}}</style>');
document.head.insertAdjacentHTML('beforeend', '<style>.cell.new::after{top:3px;right:3px;width:8px;height:8px}</style>');
// poziom przeciwnika w prawym górnym rogu kafelka (wyprawa, loch) i panelu przeciwnika w oknie walki; boss – czerwony
document.head.insertAdjacentHTML('beforeend', '<style>.tile{position:relative}.arena>div:last-child{position:relative}.mlvl{position:absolute;top:4px;right:6px;font-size:11px;font-weight:700;color:var(--mut);line-height:1}.mlvl.b{color:#e0524a}.tile.mlock{filter:grayscale(1);opacity:.45;cursor:default}.mwin{position:absolute;bottom:4px;right:6px;font-size:11px;font-weight:800;line-height:1}.arena .mlvl{top:-2px;right:0}.dunwrap{display:flex;gap:12px;align-items:stretch;margin-top:8px}.dundrops{flex:1;min-width:0;border:1px solid var(--bd);border-radius:10px;padding:10px 12px;min-height:200px;display:flex;flex-direction:column}.dunlore{margin:12px 0 10px;padding-top:10px;border-top:1px solid var(--bd);font-size:13px;line-height:1.5;font-style:italic;color:#b08d57}.bkac{background:var(--ac);color:#fff;border-color:var(--ac);font-weight:700}.dunmobs{display:flex;flex-direction:column;gap:8px;width:190px;flex:none}.tile.dmob{min-height:96px}.tile.dmob .ic{font-size:40px}.tile.dmob.dlock{filter:grayscale(1);opacity:.45}.tile.dmob.dcool{opacity:.7}.tile.dmob.dcool small{color:var(--ac);font-weight:700}.cell.noreq::before{content:"";position:absolute;inset:0;border-radius:6px;background:rgba(217,75,75,.38);box-shadow:inset 0 0 10px rgba(217,75,75,.8);pointer-events:none;z-index:1}.dfbtn{display:block;margin:auto auto 0;flex:none;min-width:96px;padding:5px 14px;font-weight:800;font-size:13px;background:var(--ac);color:#fff;border-color:var(--ac)}.dfbtn:disabled{opacity:.55}#dunfight-slot{margin-top:8px}#dunfight-slot #fightbox{border:0;box-shadow:none;padding:0;margin:0;background:none}.dunline{display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-top:1px solid var(--bd);font-size:13px}@media(max-width:600px){.dunwrap{flex-direction:column}.dunmobs{width:100%}}</style>');
// poziom przeciwnika w rogu kafelka i okna walki – w kolorze trudności (diffColor); boss rozpoznawalny po czerwonej ramce kafelka
const lvlTag = (m, boss) => `<span class="mlvl" style="color:${diffColor(m)}">Lv ${m.l}</span>`;

const dl = i => i.d ? i.d[0] + '-' + i.d[1] + ' Damage' + (Object.values(i.s).some(v => v) ? '<br>' : '') : '';   // bez średniej w nawiasie
// statystyki przedmiotu zawsze w tej samej kolejności: Armor, Strength, Dexterity, Vitality
const STAT_ORDER = ['arm', 'str', 'dex', 'con'];
const sgn = k => k === 'arm' ? '' : '+';   // pancerz bez „+” („4 Armor”), pozostałe statystyki z plusem („+3 Strength”)
const stxt = s => STAT_ORDER.concat(Object.keys(s).filter(k => !STAT_ORDER.includes(k))).filter(k => s[k]).map(k => sgn(k) + s[k] + ' ' + ST[k]).join('<br>');

// CYTATY przedmiotów mitycznych (kursywa na dole dymka): unikaty – z UNIQUES, mityczna wędka i haczyk – tutaj
const UNIQUE_COLOR = '#f0b44c';   // kolor napisu "Unique" (inny niż czerwona nazwa mitycznego przedmiotu)
// NAPIS "Unique" pod nazwą KAŻDEGO mitycznego przedmiotu (r = 5): unikaty, mityczna wędka, mityczny haczyk i każdy przyszły mityczny przedmiot
const uniqueTag = i => i.r === 5 ? `<span style="color:${UNIQUE_COLOR};font-weight:700">Unique</span>` : '';
const quoteOf = i => i.unique ? UNIQUES[i.unique].quote
  : i.r === 5 && i.isFishGear && i.sl === 'weapon' ? 'Even the abyss bites, if you wait long enough.'
  : i.r === 5 && i.isFishGear && i.sl === 'hook' ? 'Once it bites, it never lets go.' : '';
const quoteLine = i => quoteOf(i) ? `<br><i style="color:${UNIQUE_COLOR};opacity:.9">"${quoteOf(i)}"</i>` : '';
const cardRaw = i => i.mat ? `<b class="t${i.r || 0}">${i.name}${i.qty > 1 ? ' ×' + i.qty : ''}</b><br>Material${MATS[i.sl].desc ? '<br>' + MATS[i.sl].desc : ''}<br>Source: ${MATS[i.sl].source}<br>Value: ${price(i)}` :
  i.isGuide ? `<b class="t${i.r}">${i.name}${i.qty > 1 ? ' ×' + i.qty : ''}</b><br>Use: gain 1 Fishing Skill Point<br><span style="color:var(--mut)">Spend it in the Fishing Skill Tree</span><br>Value: ${price(i)}` :
  i.isScroll ? `<b class="t2">${i.name}</b>${i.qty > 1 ? ' ×' + i.qty : ''}<br>Increases ${SCROLLS[scrollKind(i)].stat} by 10% for 30 minutes<br>Cannot be sold` :
  i.isDesign ? `<b class="t${i.r}">${i.name}</b><br>Crafting Design<br>Use: learn to craft (Crafting → Fishing Gear)${designTip(i.kind)}${knowsDesign(i.kind) ? '<br><span style="color:var(--mut)">Already learned</span>' : ''}<br><br>Value: ${price(i)}` :
  i.isChest ? `<b class="t${i.r}">${i.name}</b><br>Chest<br><span style="color:#3fdc3f">Use: open to get 1–3 kinds of fish, 5–10 each</span><br><span style="color:#3fdc3f">20% chance: 1 fish material</span><br><span style="color:var(--mut)">Only fish (and their materials) you have caught at least once.</span><br>Value: ${price(i)}` :
  i.isFood ? `<b class="t${i.r}">${i.name}</b><br>Food<br><span style="color:#3fdc3f">Use: +${DISHES[i.kind].hp}% max Health for ${FOOD_MIN} minutes</span><br><span style="color:var(--mut)">Only one food buff can be active.</span><br>Value: ${price(i)}` :
  i.isRecipe ? `<b class="t${i.r}">${i.name}</b><br>Recipe<br>Use: learn to cook (Cooking)<br><br><b class="t${i.r}" style="display:inline">${DISHES[i.kind].name}</b><br>Ingredients: ${COOK_QTY}× ${MATS[DISHES[i.kind].fish].name}<br><span style="color:${cookLvlOk(i.kind) ? 'var(--tx)' : 'var(--lack)'}">Requires Cooking level ${DISHES[i.kind].lvl}</span>${knowsRecipe(i.kind) ? '<br><span style="color:var(--mut)">Already learned</span>' : ''}<br><br>Value: ${price(i)}` :
  i.unique ? `<b class="t${i.r}">${i.name}</b>${uniqueTag(i)}<br>${i.isFishGear ? 'Fishing ' : ''}${SL[i.sl] ? SL[i.sl][1] : ''}<br>FP: <b class="t2" style="display:inline">${i.fp || 0}</b>${fxLines(i)}<br>Value: ${price(i)}${quoteLine(i)}` :
  i.isFishGear && i.sl !== 'weapon' ? `<b class="t${i.r}">${i.name}</b>${uniqueTag(i)}<br>FP: <b class="t2" style="display:inline">${i.fp || 0}</b>${fxLines(i)}${setTip(i)}${setOf(i) ? '<br>' : ''}<br>Value: ${price(i)}${quoteLine(i)}` :
  i.isFishGear ? `<b class="t${i.r}">${i.name}</b>${uniqueTag(i)}<br>FP: <b class="t2" style="display:inline">${i.fp || 0}</b>${fxLines(i)}<br>Value: ${price(i)}${quoteLine(i)}` :
  `<b class="t${i.r}">${i.name}</b>${uniqueTag(i)}${i.req ? `<br><span style="color:${me.lvl >= i.req ? 'var(--tx)' : 'var(--lack)'}">Requires level ${i.req}</span>` : ''}<br>${dl(i)}${stxt(i.s)}${setTip(i)}${setOf(i) ? '<br>' : ''}<br>Value: ${price(i)}`;

// SKILL POINTS: każdy skill w drzewku kosztuje dokładnie 1 skill point (złoto nie jest już używane)
const SKILL_COST = 1;
const MAX_LVL = 80;
// XP NA AWANS: 120 × poziom + 3 × poziom² − 70 – Lv1: 53 (2 × Lynx = 60 → 2 poziom z lekką nadwyżką), Lv10: 1430, Lv40: 9530, Lv79: ≈28 130
// (przy przeciwniku z własnego poziomu: 1–10 ≈ 50 walk, 70–80 ≈ 171 walk – ok. 3× dłużej)
const xpNeed = L => 120 * L + 3 * L * L - 70;
window.buyUpg = (id) => {
  if (busy || panMoved || me.sp < SKILL_COST || (id === 'centerHp' && upgTree.centerHp)) return;
  me.sp -= SKILL_COST;
  if (id === 'centerHp') {
    upgTree.centerHp = 1;
  } else {
    upgTree.nodes[id] = 1;
  }
  render();
};

// czy węzeł jest kupiony; 'center' = "Surprise Attack" (trzymane osobno w upgTree.centerHp)
const hasNode = id => id === 'center' ? upgTree.centerHp > 0 : !!upgTree.nodes[id];
// RANGI: upgTree.nodes[id] = kupiona ranga (0..max). maxOf = liczba rang noda (domyślnie 1).
const rankOf = id => id === 'center' ? (upgTree.centerHp ? 1 : 0) : (upgTree.nodes[id] || 0);
const maxOf = id => id === 'center' ? 1 : ((UPG.find(u => u.id === id) || {}).max || 1);
const isMaxed = id => rankOf(id) >= maxOf(id);
// opis noda dla danej rangi (d może być tekstem albo funkcją rangi)
const descAt = (n, r) => typeof n.d === 'function' ? n.d(Math.max(1, r)) : n.d;
// wymagania: poprzedni node WYMAKSOWANY (req) albo co najmniej reqN wymaksowanych z listy reqAny (Death Sentence: 2 z 3)
const reqOk = n => n.reqAny ? n.reqAny.filter(isMaxed).length >= (n.reqN || 1) : (!n.req || isMaxed(n.req));

// zwrot przy resecie: po 1 skill poincie za każdy kupiony skill (łącznie z "Surprise Attack")
const skillRefund = () => ((upgTree.centerHp ? 1 : 0) + UPG.reduce((a, n) => a + (upgTree.nodes[n.id] || 0), 0)) * SKILL_COST;   // 1 SP za każdą rangę

window.buyNode = id => {
  if (panMoved || busy) return;
  const node = UPG.find(n => n.id === id), T = upgTree.nodes;
  // wymagany wymaksowany poprzedni node, brak zablokowanych (ph), ranga poniżej maksimum, co najmniej 1 skill point
  if (!node || node.ph || isMaxed(id) || !reqOk(node) || me.sp < SKILL_COST) return;
  me.sp -= SKILL_COST;
  T[id] = (T[id] || 0) + 1;   // +1 ranga
  render();
};

const NAV = [['exp', 'Expedition'], ['shop', 'Shop'], ['craft', 'Crafting'], ['upg', 'Skills'], ['dun', 'Dungeons'], ['fish', 'Fishing'], ['upgrade', 'Tackle Upgrade'], ['cook', 'Cooking']];   // Tackle = sprzęt wędkarski (wędka + haczyk)
// spDot: czerwona kropka przy zakładce Skills, gdy są skill pointy do wydania. Znika po najechaniu myszką,
// wraca, gdy gracz dostanie nowe skill pointy (awans, reset skilli).
let spDot = false;
// przebłysk zakładki w lewym menu (np. Crafting po nauce Crafting Design): cienki, błyszczący pasek światła
// przelatuje skośnie przez cały przycisk od lewej do prawej (2 przejścia). Pasek to ::after z gradientem (biel → przezroczystość).
document.head.insertAdjacentHTML('beforeend', '<style>'
  + '#nav button.navflash{position:relative;overflow:hidden}'
  + '#nav button.navflash::after{content:"";position:absolute;top:-20%;bottom:-20%;left:-20%;width:12px;pointer-events:none;'
  + 'background:linear-gradient(90deg,transparent,rgba(255,255,255,.95) 45%,#fff6d0 50%,rgba(255,255,255,.95) 55%,transparent);'
  + 'filter:drop-shadow(0 0 4px #fff3b0);transform:skewX(-20deg);animation:navshine .9s ease-in-out 2}'
  + '@keyframes navshine{from{left:-20%}to{left:115%}}'
  + '</style>');
function flashNav(v) {
  const b = document.querySelector(`#nav button[data-v=${v}]`); if (!b) return;
  b.classList.remove('navflash'); void b.offsetWidth; b.classList.add('navflash');
  setTimeout(() => b.classList.remove('navflash'), 1850);
}
// dymek Crafting Design: co dokładnie powstanie – nazwa, slot, FP, set (z bonusami) i przepis
function designTip(k) {
  const it = FIXED_ITEMS[k], rc = gearRecipeOf(k), slot = it.sl === 'lantern' ? 'Lantern' : (SL[it.sl] ? SL[it.sl][1] : it.sl);
  const sk = Object.keys(FISH_SETS).find(x => FISH_SETS[x].pieces.includes(k)), S = sk ? FISH_SETS[sk] : null;
  return `<br><br><b class="t${it.r}" style="display:inline">${it.name}</b><br>Fishing ${slot}<br>FP: <b class="t2" style="display:inline">${it.fp}</b>`
    + (S ? `<br><span style="color:#e69500">Set: ${S.name}</span>` + S.bonus.map(b => `<br><span style="color:#3fdc3f">(${b.n}) Set: ${b.d}</span>`).join('') : '')
    + (rc ? `<br><br>Recipe:${rc.from ? `<br>• ${FIXED_ITEMS[rc.from].name}` : ''}` + rc.mats.map(([m, q]) => `<br>• ${q}× ${MATS[m].name}`).join('') : '');
}
function buildNav() {
  $('nav').innerHTML = NAV.map(([k, n]) => `<button data-v="${k}">${n}</button>`).join('');
  const sb = document.querySelector('#nav button[data-v=upg]');
  if (sb) sb.addEventListener('mouseenter', () => { spDot = false; sb.classList.remove('new'); });
}

let lastLvl = me.lvl, lvlWait = null, lvlGo = false;   // lvlWait / lvlGo – opóźnienie animacji level-upu (0,5 s)

function renderBuffs() {
  // aktywny zwój pod ekwipunkiem: ikona + nazwa + czas w JEDNEJ linii (bez zawijania); szczegóły w dymku po najechaniu
  // BEZ MIGANIA: wiersze budujemy od nowa tylko, gdy zmienia się zestaw buffów; co sekundę podmieniamy wyłącznie tekst czasu (.buff-t)
  const now = Date.now(), fmt = end => { const t = Math.max(0, Math.ceil((end - now) / 1000)), m = Math.floor(t / 60), sc = t % 60; return `${m}:${sc < 10 ? '0' : ''}${sc}`; };
  const row = (k, end) => {
    const d = SCROLLS[k];
    return `<div data-tip="<b>${d.name}</b>Increases ${d.stat} by 10%" style="background:color-mix(in srgb,var(--c2) 15%,var(--card));border:1px solid var(--bd);border-radius:6px;padding:4px 8px;font-size:12px;display:flex;align-items:center;gap:6px;margin-bottom:4px;white-space:nowrap;cursor:help">${scrollIco(k, 24)}<b style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis">${d.name}</b><span class="t2 buff-t" data-end="${end}">${fmt(end)}</span></div>`;
  };
  // buff z jedzenia: ikona dania (32 px = dokładnie ×2 siatki 16×16 – ostry pixel art) + nazwa + czas; dymek: +% maks. HP
  const food = () => { const d = DISHES[foodBuff.kind];
    return `<div data-tip="<b>${d.name}</b>Increases maximum Health by ${foodBuff.pct}%" style="background:color-mix(in srgb,#3fdc3f 12%,var(--card));border:1px solid var(--bd);border-radius:6px;padding:2px 8px;font-size:12px;display:flex;align-items:center;gap:6px;margin-bottom:4px;white-space:nowrap;cursor:help">${dishIco(foodBuff.kind, 32)}<b style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis">${d.name}</b><span class="t2 buff-t" data-end="${foodBuff.end}">${fmt(foodBuff.end)}</span></div>`; };
  const strOn = now < buffStrEnd, dexOn = now < buffDexEnd, foodOn = now < foodBuff.end && DISHES[foodBuff.kind];
  const key = [strOn ? buffStrEnd : 0, dexOn ? buffDexEnd : 0, foodOn ? foodBuff.kind + ':' + foodBuff.end : 0].join('|');
  const box = $('buffs-container');
  if (box.dataset.key !== key) {
    box.dataset.key = key;
    box.innerHTML = (strOn ? row('str', buffStrEnd) : '') + (dexOn ? row('dex', buffDexEnd) : '') + (foodOn ? food() : '');
  } else box.querySelectorAll('.buff-t').forEach(e => { const t = fmt(+e.dataset.end); if (e.textContent !== t) e.textContent = t; });
}

// boczne menu wyboru ryby (na prawo od karty Łowienie)
function renderFishSide() {
  const side = $('fish-side');
  if (!side) return;
  side.hidden = view !== 'fish';
  if (view !== 'fish') return;
  const fp = fishPower();
  // placeholder ? (ta sama grafika ui_question co w Tackle Upgrade) – ryba, do której brakuje FP (nazwa i ikona ukryte), oraz jeszcze niewymyślone ryby; wymagane FP na czerwono
  const lockRow = need => `<div class="fish-row"><div class="cell lock">${uiIco('ui_question', '❔', 32, 'opacity:.4')}</div><div><small style="color:var(--hp)">Requires ${need} FP</small></div></div>`;
  // ryba złowiona choć raz, ale za mało FP: widać sprite i nazwę (wyszarzone), wymagane FP na czerwono; nie da się jej wybrać
  const knownLockRow = f => { const rr = MATS[f.id].r || 0; return `<div class="fish-row" style="opacity:.55"><div class="cell r${rr}" data-it="fishsel:${f.id}" style="cursor:not-allowed;filter:grayscale(.85)">${matIco(f.id, 48, 32)}</div><div><b class="t${rr}">${f.name}</b><br><small style="color:var(--hp)">Requires ${f.fp} FP</small>${pediaLine(f)}</div></div>`; };
  const rows = FISH.map(f => {
    if (!canFish(f)) return fishing.caught && fishing.caught[f.id] ? knownLockRow(f) : lockRow(f.fp);   // za mało FP: złowiona kiedyś → wyszarzona, nigdy → ??? (DEV: zawsze odblokowana)
    const rr = MATS[f.id].r || 0;
    // podczas łowienia ryby nie da się zmienić (brak data-fish = brak kliknięcia), dopóki gracz sam nie zatrzyma łowienia
    const lk = fishing.active && fishing.sel !== f.id;
    return `<div class="fish-row"><div class="cell r${rr}${fishing.sel === f.id ? ' sel' : ''}"${fishing.active ? '' : ` data-fish="${f.id}"`} data-it="fishsel:${f.id}"${lk ? ' style="opacity:.45;cursor:not-allowed"' : ''}>${matIco(f.id, 48, 32)}</div><div><b class="t${rr}">${f.name}</b><br><small>Requires: <b class="t2">${f.fp} FP</b></small>${pediaLine(f)}</div></div>`;
  }).join('') + FISH_LOCKED.map(lockRow).join('');
  $('body-fish-side').innerHTML = `<div class="fish-list">${rows}</div>`;
}

// boczne menu wyboru aktu (na prawo, jak wybór ryby) – tylko w Wyprawie i dopiero po pokonaniu Fire Lorda
function renderActSide() {
  const side = $('act-side');
  if (!side) return;
  side.hidden = !(view === 'exp' && actsOn());
  if (side.hidden) return;
  const cur = eact ?? 0, lock = busy || fishing.active;
  // akt dostępny, gdy odblokowana jest jego pierwsza lokacja (Akt 2 – po pokonaniu Fire Lorda, Akt 3 – po pokonaniu Abyss Lorda)
  $('body-act-side').innerHTML = `<div class="fish-list">` + ACTS.map((a, i) => { const open = UNLOCK() || ACT_START[i] <= locUnlocked, pl = ALL_LOCS[ACT_START[i] - 1], pb = pl ? pl.mobs[pl.mobs.length - 1] : null;
    return `<div class="fish-row"><div class="cell${i === cur ? ' sel' : ''}${lock || !open ? ' lock' : ''}"${lock || !open ? '' : ` data-act="${i}"`}>${open ? `<span class="ic" style="font-size:28px">${a.e}</span>` : uiIco('ui_question', '❔', 32, 'opacity:.4')}</div><div><b>${a.n}</b><br><small${open ? '' : ' style="color:var(--hp)"'}>${open ? a.locs.length + ' locations' : `Defeat: ${pb.e} ${pb.n}`}</small></div></div>`; }).join('') + `</div>`;
}

// INFO PRZECIWNIKA (ℹ️): w walce pokazuje AKTUALNE statystyki wroga (klątwy: Withering, Sunder…).
// live = stan bieżącej / ostatniej walki z tym przeciwnikiem.
let live = null;
// DRZEWKO SKILLI: treeKey = zestaw widocznych nodów z ostatniej pełnej budowy planszy; treeExt = zasięg planszy (px, przy zoomie 1)
let treeKey = '', treeExt = { x: 1200, y: 400 };
// pozycja planszy przycięta tak, żeby dało się dojechać do każdego noda (zasięg rośnie z przybliżeniem)
function clampPan() {
  const mx = treeExt.x * currentZoom, my = treeExt.y * currentZoom;
  setPanX(Math.max(-mx, Math.min(mx, panX))); setPanY(Math.max(-my, Math.min(my, panY)));
}
function renderInfo(m) {
  const r = Math.round, d = der(), s = mstats(m);
  const L = live && live.mob === m ? live : null, c = L ? L.M : s;
  const B = (l, v) => `<span>${l} <b>${v}</b></span>`;
  const ch = (base, now) => r(now);   // tylko aktualna wartość (bez dopisku z różnicą)
  const matsTxt = (m.mats || []).map(([k, p]) => `${MATS[k].name} ${Math.round(p * 100)}%`).join(', ') || '—';
  // szanse na rzadkość przedmiotu z tego przeciwnika (z puli drop): np. „Common 70%, Uncommon 30%”
  const dropTxt = (m.drop && m.drop.length) ? [0, 1, 2, 3, 4].map(r => [r, m.drop.filter(x => Math.min(4, x) === r).length]).filter(([, n]) => n).map(([r, n]) => `<span class='t${r}' style='display:inline'>${RAR[r][0]} ${Math.round(n / m.drop.length * 100)}%</span>`).join(', ') : '—';
  const eCon = Math.max(1, r((s.hp / HP_MUL / ENEMY_HP - 40 - (m.sl ?? m.l) * 10) / 4));   // Vitality przeciwnika: HP bez mnożnika HP_MUL
  const hit = v => Math.max(1, r(v * (1 - armorRed(d.arm, m.l))));   // pancerz: % redukcji wg poziomu przeciwnika (maks. 50%)
  $('info').innerHTML = '<div>' + B('Strength', ch(s.str, c.str)) + B('Dexterity', r(s.dex)) + B('Vitality', eCon) +
    B('Materials', matsTxt) + B('Item drop', dropTxt) + '</div><div>' +
    B('Damage', ch(s.min, c.min) + '–' + ch(s.max, c.max)) + B('Armor', ch(s.arm, c.arm)) + B('Crit chance', r(s.crit) + '%') +
    B('Hits you for', ch(hit(s.min), hit(c.min)) + '–' + ch(hit(s.max), hit(c.max))) + '</div>';
}

// SLOTY EKWIPUNKU (aktualna strona 1 / 2) + przyciski stron. Wydzielone z render(), żeby przy podniesieniu sprzętu wędkarskiego
// (przeciąganie) dało się przełączyć stronę bez przebudowy plecaka – inaczej przeciągany przedmiot zniknąłby spod kursora.
function renderSlots() {
  const currentEq = (equipPage === 1) ? eq1 : eq2;
  const fpVal = fishPower();
  const fpTip = `<b>FP</b>Fishing power. Comes from fishing gear on page 2 and the Fishing Skill Tree. Each fish requires a minimum amount of FP to be caught.<br>Now: ${fpVal} FP`;
  // na stronie 2 (rybak) slot pod wędką to slot haczyka zamiast rękawic
  const slotNames = { hook: 'Hook', lantern: 'Lantern' };
  $('slots').innerHTML = ['', 'helm', 'amulet', 'weapon', 'armor', equipPage === 2 ? 'lantern' : 'shield', equipPage === 2 ? 'hook' : 'gloves', 'ring', '', 'boots', 'trinket'].map((k, idx) => {   // prawa kolumna: amulet, tarcza/latarnia, pierścień, talizman (prawy dolny)
    if (!k) return (idx === 0 && equipPage === 2) ? `<div class="ph fpbox"><span class="lb" data-tip="${fpTip}">FP: ${fpVal}</span></div>` : '<div class="ph"></div>';
    const i = currentEq[k];
    return `<div class="slot${k == 'armor' ? ' tall' : ''}${i ? ' r' + i.r : ''}"${i ? '' : ` title="${slotNames[k] || SL[k][1]}${equipPage === 2 ? ' (Fishing)' : ''}"`} data-t="${k}" data-slot="${k}"${i ? ` draggable="true" data-it="eq:${k}"` : ''}>${i ? slotIco(i) : ''}</div>`;   // przedmioty w slotach: 64 px
  }).join('');

  document.querySelectorAll('.eq-page-btn').forEach((btn, idx) => { btn.classList.toggle('on', equipPage === idx + 1); btn.disabled = busy; });
}

function render() {
  const d = der(), g = gear(), r = Math.round;

  document.querySelectorAll('#nav button').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.v === view);
    if (btn.dataset.v === 'upg') btn.classList.toggle('new', spDot && me.sp > 0);
    if (btn.dataset.v === 'fish') btn.classList.toggle('new', fishSpDot());   // Fishing Skill Points do wydania
    btn.disabled = busy || (fishing.active && btn.dataset.v === 'exp');
  });

  ['exp', 'shop', 'upg', 'upgrade', 'dun', 'craft', 'fish', 'cook'].forEach(k => {
    const el = $('v-' + k);
    if (el) el.style.display = (k === view) ? 'block' : 'none';
  });

  const popupContainer = $('popup-container');
  let popupHtml = '';
  if (me.lvl >= QUEST_LVL && !me.questMsgClosed) popupHtml += `<div class="popup-msg"><span>📜 <b>Quests</b> unlocked!</span><button onclick="window.closeQuestMsg()">X</button></div>`;
  if (me.lvl >= 10 && !dunMsgClosed) popupHtml += `<div class="popup-msg"><span>🕳️ <b>Dungeons</b> unlocked!</span><button onclick="window.closeDunMsg()">X</button></div>`;
  if (showNoRodMsg) popupHtml += `<div class="popup-msg"><span>🎣 ${hasRod() ? 'Equip a rod on equipment page 2!' : 'You do not have a fishing rod!'}</span><button onclick="window.closeNoRodMsg()">X</button></div>`;

  if (popupContainer.innerHTML !== popupHtml) {
    popupContainer.innerHTML = popupHtml;
  }

  renderSlots();

  renderBuffs();

  // MAKS. POZIOM 80: pasek pełny, fioletowy, napis „MAX”
  // HOLD: po wygranej pasek XP / poziom pokazują stare wartości, dopóki nie dolecą kulki XP (holdXp), potem dopiero aktualne
  let showLvl = holdXp ? holdXp.lvl : me.lvl, showXp = holdXp ? holdXp.xp : me.xp;
  // LEVEL UP z opóźnieniem 0,5 s: najpierw pasek XP dobija do pełna na starym poziomie, po chwili nowy poziom i animacja
  if (showLvl > lastLvl && !lvlGo) {
    if (!lvlWait) lvlWait = setTimeout(() => { lvlWait = null; lvlGo = true; render(); }, 500);
    showLvl = lastLvl; showXp = xpNeed(lastLvl);
  }
  lvlGo = false;
  if (showLvl >= MAX_LVL) { me.xp = 0; $('lvl').textContent = `Level ${showLvl} · MAX`; $('xpf').style.width = '100%'; $('xpf').style.background = 'var(--c3)'; }
  else { $('lvl').textContent = `Level ${showLvl} · XP ${showXp}/${xpNeed(showLvl)}`; $('xpf').style.width = Math.min(100, showXp / xpNeed(showLvl) * 100) + '%'; $('xpf').style.background = ''; }
  if (showLvl > lastLvl) {
    const bar = $('xpf').parentElement;
    bar.classList.remove('lvlup'); void bar.offsetWidth; bar.classList.add('lvlup');
    setTimeout(() => bar.classList.remove('lvlup'), 1100);
    // mała animacja przy napisie „Level N”: złote pulsowanie napisu + wylatujące w górę „LVL UP! +1 Skill Point”
    const L = $('lvl'); L.classList.remove('lvlpop'); void L.offsetWidth; L.classList.add('lvlpop');
    setTimeout(() => L.classList.remove('lvlpop'), 1400);
    const rc = L.getBoundingClientRect();
    floatText(`<span style="color:#f2c200">LVL UP!</span> <span style="color:#3fdc3f">+${showLvl - lastLvl} ${spIco(16)} Skill Point${showLvl - lastLvl > 1 ? 's' : ''}</span>`, rc.left + 120, rc.top - 34, false);   // nad napisem, nie zasłania go
  }
  lastLvl = showLvl;

  const UB = ub(), G0 = window.G_GLOBAL;
  const tips = {
    'Strength': `Each point: +${+(d.strDmg * 100).toFixed(2)}% weapon damage (now +${Math.round((d.strMul - 1) * 100)}%, ×${d.strMul.toFixed(2)}). From items: +${g.str}, from upgrades: +${UB.str}. Scroll of Strength: +10%.`,
    'Dexterity': `Raises critical hit chance: Dexterity / (Dexterity + ${CRIT_K} × level + ${CRIT_C}). Now: ${+d.crit.toFixed(1)}%, max ${CRIT_CAP}%${d.critSet ? ` (+${d.critSet}% from set bonus)` : ''}. Every point above ${CRIT_K * me.lvl + CRIT_C} (50% at your level) adds +0.1% critical damage instead (now ${d.critOver} points, ×${d.critMul.toFixed(2)}).`
      + `  The higher your level, the more Dexterity you need. Higher Dexterity than the enemy = you attack first. Scroll of Dexterity: +10%.${UB.dexPct ? ` Unholy Grace: +${+UB.dexPct.toFixed(2)}%.` : ''}`,
    'Vitality': `Each point: +${+d.hpPer.toFixed(2)} health (now +${Math.round(d.con * d.hpPer)}).`,
    'Health': `(40 + Vitality×${+d.hpPer.toFixed(2)} + level×10) ×${HP_MUL}${UB.hpPct ? `, +${+UB.hpPct.toFixed(2)}% from skills` : ''}${d.foodPct ? `, +${d.foodPct}% from food` : ''} = ${d.hp}.`,
    'Damage': `${g.dmin ? 'Weapon' : 'Fists'} ${d.wmin}-${d.wmax} × ${d.strMul.toFixed(2)} (${d.str} Strength)${UB.edmg ? `, +${UB.edmg}% from upgrades` : ''}. Each hit is a random value in this range, crit ×${d.critMul.toFixed(2)}.`,
    'Armor': `Reduces damage taken by Armor / (Armor + ${ARMOR_K} × enemy level), max 50%. Against a level ${me.lvl} enemy: ${Math.round(armorRed(d.arm, me.lvl) * 100)}%.${UB.armPct ? ` Thick Skin: +${UB.armPct}% armor from items.` : ''}${d.armSet ? ` Set bonus: +${d.armSet} Armor.` : ''}`,
    'Crit chance': `Chance for a hit dealing ×${d.critMul.toFixed(2)} damage. Dexterity / (Dexterity + ${CRIT_K} × level + ${CRIT_C}) = ${+(d.crit - d.critSet).toFixed(1)}%, max ${CRIT_CAP}%.${d.critSet ? ` Set bonus: +${d.critSet}% (above the limit).` : ''}`,
    'Crit damage': `Critical hits deal ${Math.round(d.critMul * 100)}% damage: base 180% + 0.1% for every point of Dexterity above ${CRIT_K * me.lvl + CRIT_C} (the amount needed for 50% crit chance at your level). Now ${d.critOver} points above.${d.critDmgSet ? ` Set bonus: +${d.critDmgSet}%.` : ''}${UB.critBonus ? ` Bloodlust: +${UB.critBonus}% on top.` : ''}`
  };
  $('stats').innerHTML = [['str', 'Strength', d.str], ['dex', 'Dexterity', d.dex], ['con', 'Vitality', d.con], [0, 'Health', d.hp], [0, 'Damage', r(d.min) + '-' + r(d.max)], [0, 'Armor', d.arm], [0, 'Crit chance', r(d.crit) + '%'], [0, 'Crit damage', Math.round(d.critMul * 100) + '%']].map(([k, n, v]) => {
    const c = k && cost(k), ok = k && G0 >= c;
    // przycisk (+) owinięty w <span data-tip>, żeby dymek działał też na wyłączonym przycisku
    return `<div><span class="lb" data-tip="<b>${n}</b>${tips[n]}">${n}</span><span><b>${v}</b>${k ? `<span class="plusw" data-tip="${ok ? 'Cost: ' + c : 'Missing ' + (c - G0) + ' (cost: ' + c + ')'}"><button class="plus" data-k="${k}"${busy || !ok ? ' disabled' : ''}>+</button></span>` : ''}</span></div>`;
  }).join('');
  // skill pointy nad złotem – widoczne tylko, gdy gracz ma co najmniej 1
  const spEl = $('sp');
  { const spShow = Math.max(0, me.sp - Math.max(0, me.lvl - lastLvl));   // punkty z poziomów jeszcze niepokazanych (XP leci / opóźnienie level-upu) dochodzą razem z animacją
    if (spEl) { spEl.hidden = spShow < 1; spEl.innerHTML = `<b>${spShow} ${spIco(16)}</b>`; } }   // tylko liczba + gwiazda (bez napisu)
  $('gold').innerHTML = `<b>${holdGold ?? window.G_GLOBAL} ${goldIco(16)}</b>`;   // tylko liczba + moneta (bez napisu)   // holdGold: stara kwota, dopóki nie dolecą monety   // panel pod ekwipunkiem: ikona monety
  $('inv').innerHTML = inv.map((i, n) => `<div class="cell r${i.r || 0}${i.fresh ? ' new' : ''}${i.req && me.lvl < i.req ? ' noreq' : ''}" draggable="true" data-n="${n}" data-it="inv:${n}">${invIco(i)}${(i.qty && i.qty > 1) || (i.isScroll && i.qty > 1) ? `<span class="qty">${i.qty}</span>` : ''}</div>`).join('');
  $('sellbtn').classList.toggle('on', sellMode);$('sellbtn').innerHTML = goldIco(16) + (sellMode ? ' Click an item' : ' Sell');

  const meatCount = (inv.find(x => x.mat && x.sl == 'meat') || {}).qty || 0;
  const clawCount = (inv.find(x => x.mat && x.sl === 'claw') || {}).qty || 0;
  const canCraft = meatCount >= 2 && clawCount >= 1 && window.G_GLOBAL >= 200;
  const alreadyOwnedRod = hasRod();

  // koszt ulepszenia wędki / haczyka (materiał i ilość z upgradeCost, liczone od poziomu przedmiotu w slocie)
  const upLvl = isUpgradable(upgradeItem) ? gearLevel(upgradeItem) : 0;
  const upCost = upgradeCost(upLvl), upMat = MATS[upCost.mat], requiredFish = upCost.qty;
  const carpCount = (inv.find(x => x.mat && x.sl === upCost.mat) || {}).qty || 0;
  const canUpgradeRod = isUpgradable(upgradeItem) && carpCount >= requiredFish;

  // SKLEP: u góry wyśrodkowany licznik do odświeżenia, pod nim po lewej 6 przedmiotów (3 kolumny × 2 rzędy), po prawej „Special offer” (wędka)
  ensureShop();
  const shopCells = me.shop.items.map((it, n) => it
    ? `<div class="shopslot"><div class="cell r${it.r}" data-it="shopi:${n}" draggable="true" style="cursor:grab">${sizeIco(it, 64)}</div><button onclick="window.buyShop(${n})"${window.G_GLOBAL < it.cost || busy ? ' disabled' : ''}>${goldIco(16)} ${it.cost}</button></div>`
    : `<div class="shopslot"><div class="cell shopsold"></div><button disabled style="visibility:hidden">·</button></div>`).join('');   // kupiony: pusty kafelek bez napisów (ukryty przycisk trzyma układ)
  $('body-shop').innerHTML = `<div class="shopwrap"><div class="shopgrid">${shopCells}</div>`
    + `<div class="shopmid"><div class="shoptimer">SHOP REFRESHES IN <b data-shopcd>${fmtCd(me.shop.t - Date.now())}</b></div>${DEV ? `<button onclick="window.refreshShop()" style="margin-top:8px">↻ Refresh (DEV)</button>` : ''}</div>`
    + `<div class="shopoffer"><div class="cell r0" data-it="shop:rod" style="width:88px;height:88px">${sizeIco(makeRod(), 64)}</div><b class="t0">${makeRod().name}</b><small style="color:var(--mut)">Lets you catch Crucian Carp</small>`
    + `<button onclick="window.buyRod()"${alreadyOwnedRod || window.G_GLOBAL < 500 || busy ? ' disabled' : ''}>${alreadyOwnedRod ? 'Owned' : goldIco(16) + ' 500'}</button><div class="shopofflbl">Special offer</div></div></div>`;
  // WYTWARZANIE – zakładki: Scrolls i Fishing Gear (Pierścień i Amulet, po 25 FP)
  // zwój: wynik + materiały + złoto (wiersz recipeRow)
  const scrollRecipeOf = k => { const dd = SCROLLS[k]; return recipeRow({ compact: 1, key: 'scroll:' + k, r: 2, ico: scrollIco(k, 48), it: 'craft:scroll_' + k, name: dd.name,
    mats: dd.mats.map(([m, q]) => ({ ...matRow(m, q), big: matIco(m, 32, 26) })), gold: dd.gold, can: canCraftScroll(k), btn: 'Craft', onclick: `window.craftScroll('${k}')`, vis: view === 'craft' && craftTab === 'scrolls' }); };
  const scrollRecipe = `<div class="rlist rfix">${scrollRecipeOf('str')}${scrollRecipeOf('dex')}</div>`;
  // jeden przepis sprzętu wędkarskiego (pierścień / amulet) – bez podpisu pod ikoną; brakujące składniki na czerwono
  const fishRecipe = sl => { const dd = CRAFT_FISH[sl]; return `<div class="recipe"><div class="cell r1" style="width:64px;height:64px" data-it="craft:${sl}">${ico(makeCraftFish(sl))}</div><div style="display:flex;flex-direction:column;gap:6px;margin-top:4px">${dd.mats.map(([k, q]) => `<div style="display:flex;align-items:center;gap:4px;${matQty(k) < q ? 'color:#e53935' : ''}"><span data-it="mat:${k}" style="display:inline-flex;cursor:help">${matIco(k, 32, 30)}</span><span>×${q}</span></div>`).join('')}</div><div style="${window.G_GLOBAL < dd.gold ? 'color:#e53935' : ''};margin-top:2px;font-weight:700">Cost: ${dd.gold}</div><button onclick="window.craftFish('${sl}')"${!canCraftFish(sl) || busy ? ' disabled' : ''} style="margin-top:4px">Craft</button></div>`; };
  // przepis sprzętu (Seasoned Angler, Sea Raider, Ring of the Tide): wynik (64 px) + składniki: przedmiot niższego tieru ×1 (jeśli jest) i materiały ×ilość (brakujące na czerwono)
  const fixedIco = (k, px) => ico(makeFixed(k)).replace(/width:\d+px;height:\d+px/, `width:${px}px;height:${px}px`);
  const gearRecipeHtml = ({ from, to, mats }) => {
    return recipeRow({ compact: 1, key: 'gear:' + to, r: FIXED_ITEMS[to].r, ico: fixedIco(to, 48), it: 'fixed:' + to, name: FIXED_ITEMS[to].name,
      mats: [...(from ? [{ big: fixedIco(from, 32), it: 'fixed:' + from, name: FIXED_ITEMS[from].name, have: hasFixed(from) ? 1 : 0, need: 1 }] : []), ...mats.map(([m, q]) => ({ ...matRow(m, q), big: matIco(m, 32, 26) }))],
      can: canCraftGear(to), btn: 'Craft', onclick: `window.craftGear('${to}')`, vis: view === 'craft' && craftTab === 'gear' }); };
  // zielone przepisy (pierścień i amulet za materiały) usunięte z zakładki; zostają tylko przepisy odblokowane projektami Crafting Design
  // kolejność: najpierw Seasoned Angler (rare), potem Sea Raider (epic), na końcu Ring of the Tide – jak w GEAR_RECIPES
  const learnedGear = GEAR_RECIPES.filter(r => knowsDesign(r.to));
  const gearRecipe = learnedGear.length ? `<div class="rlist rfix">${learnedGear.map(gearRecipeHtml).join('')}</div>`
    : `<div class="rlist rfix"><small style="color:var(--mut)">No crafting designs learned yet. Find Crafting Designs while fishing.</small></div>`;   // przepisy widoczne dopiero po nauce z Crafting Design
  const craftSt = (($('body-craft') || document).querySelector('.rlist') || {}).scrollTop || 0;   // pozycja przewinięcia listy Crafting
  $('body-craft').innerHTML = `<div class="ctabs"><button data-ctab="scrolls" class="${craftTab === 'scrolls' ? 'on' : ''}">Scrolls</button><button data-ctab="gear" class="${craftTab === 'gear' ? 'on' : ''}">Fishing Gear</button></div>` + (craftTab === 'gear' ? gearRecipe : scrollRecipe);
  { const nl = $('body-craft').querySelector('.rlist'); if (nl) nl.scrollTop = craftSt; }
  renderCook(); updateCookBar();

  const rodMax = isUpgradable(upgradeItem) && upLvl >= gearMaxLevel(upgradeItem);   // mityczny = koniec ulepszania
  const prev = isUpgradable(upgradeItem) && !rodMax ? previewGear(upgradeItem) : null;
  // TACKLE UPGRADE podczas łowienia: wędka łowi (nie da się jej zdjąć ani włożyć do slotu ulepszania) – komunikat wyjaśnia dlaczego
  const fishingNote = fishing.active ? `
      <div style="width:100%;padding:6px 8px;border:1px solid var(--ac);border-radius:8px;background:color-mix(in srgb,var(--ac) 12%,var(--card));text-align:center">
        <b style="color:var(--ac)">Currently fishing...</b><br><small style="color:var(--mut)">Stop fishing to upgrade your rod.</small>
      </div>` : '';
  $('body-upgrade').innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">
      <div style="display:flex;align-items:flex-start;justify-content:center;gap:12px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <div class="slot upgrade-drop-slot${upgradeItem ? ' r' + upgradeItem.r : ''}" data-upgrade-slot="1" ${upgradeItem ? 'data-it="upgrade" draggable="true"' : ''} style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative" ${upgradeItem ? `onclick="window.removeUpgradeItem()"` : 'title="Drag a rod or hook here"'}>
            ${upgradeItem ? ico(upgradeItem) : uiIco('ui_plus', '➕')}
          </div>
          <small style="color:var(--mut)">Current</small>
        </div>
        <div style="height:64px;display:flex;align-items:center">${uiIco('ui_arrow', '➡️')}</div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <div class="slot${prev ? ' r' + prev.r : ''}" ${prev ? 'data-it="upgprev"' : ''} style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;cursor:default">
            ${prev ? ico(prev) : rodMax ? '<span class="ic" style="font-size:28px;opacity:.4">🔒</span>' : uiIco('ui_question', '❔', 32, 'opacity:.4')}
          </div>
          <small style="color:var(--mut)">Upgraded</small>
        </div>
      </div>${fishingNote}
      ${upgradeItem && rodMax ? `
        <div style="width:100%;margin-top:4px;padding-top:8px;border-top:1px solid var(--bd);display:flex;flex-direction:column;gap:6px">
          <div class="t5" style="text-align:center;font-weight:700">Max level</div>
          <button disabled style="width:100%">Upgrade</button>
        </div>
      ` : upgradeItem ? `
        <div style="width:100%;margin-top:4px;padding-top:8px;border-top:1px solid var(--bd);display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;align-items:center;gap:4px;${carpCount < requiredFish ? 'color:#e53935' : ''}">${matIco(upCost.mat, 26, 26)}<span>${upMat.name} ${carpCount} / ${requiredFish}</span></div>
          <button onclick="window.upgradeGear()"${!canUpgradeRod || busy ? ' disabled' : ''} style="width:100%">Upgrade</button>
        </div>
      ` : ''}
    </div>`;

  // SPECIAL DROPS: klikany przycisk w prawym górnym rogu panelu łowienia (przy zaznaczonej rybie, która ma specjalne dropy).
  // Kliknięcie otwiera/zamyka okienko z listą dodatkowych łupów z tej ryby (jak z regionu) i szansą w %; okienko zamyka też "X".
  // Drop jest ukryty ("???"), dopóki gracz go nie wyłowi. Najechanie na pozycję: wyłowiony → pełny opis przedmiotu, ukryty → "???".
  // za mało FP na zaznaczoną rybę (np. zdjęty sprzęt) → zaznaczenie przeskakuje na najlepszą rybę, którą nadal można łowić
  // (tylko gdy nie trwa łowienie; łowienie i tak zatrzyma się przy następnym braniu). Brak żadnej dostępnej – zaznaczenie zostaje.
  if (!fishing.active) {
    const cur = FISH.find(x => x.id === fishing.sel), best = [...FISH].reverse().find(canFish);
    if (cur && !canFish(cur) && best && best.id !== cur.id) { fishing.sel = best.id; sdOpen = false; }
  }
  const sd = SPECIAL_DROPS[fishing.sel];
  // szansa po mnożniku ryby (FISH[].dr), np. 2% × 0.45 = 0.9%; 100% (np. haczyk z pierwszego karpia) bez zmian
  const sdF = FISH.find(x => x.id === fishing.sel), dropPct = p => p >= 100 ? p : +(p * ((sdF && sdF.dr) || 1)).toFixed(2);
  // SPECIAL DROPS POD RYBĄ (zawsze widoczne, bez zakładki): rząd komórek – odkryty drop = ikona w ramce rzadkości (dymek przedmiotu),
  // nieodkryty = przerywana ramka ze znakiem „?”; pod każdą komórką szansa w %
  const sdCells = sd ? `<div class="fdrops-lbl">Special drops</div><div class="fdrops">` + sd.map((x, n) => {
    const k = DEV || x.got();   // DEV: wszystkie dropy odkryte (tylko podgląd – losowanie dropów bez zmian)
    const pic = k ? `<img src="${ASSETS_DIR}/${x.img}" alt="" draggable="false" style="width:32px;height:32px;image-rendering:pixelated" onerror="this.outerHTML='<span style=&quot;font-size:22px&quot;>${x.e}</span>'">` : uiIco('ui_question', '❔', 32, 'opacity:.4');
    return `<div class="fdrop" ${k ? `data-it="sdrop:${fishing.sel}:${n}"` : `data-tip="<b>???</b>Not discovered yet<br>Chance: ${dropPct(x.pct)}%"`}>`
      + `<div class="cell${k ? ' r' + x.r : ' undisc'}">${pic}</div><small>${dropPct(x.pct)}%</small></div>`;
  }).join('') + `</div>` : '';
  // ZAKŁADKI jako kwadratowe ikony (nazwa w dymku po najechaniu): 1) „i” – Fishing Bonuses, 2) miniaturka drzewka – Skill tree, 3) haczyk (zwykły, common – fhook1) – Special drops
  // dot = czerwona kropka w prawym górnym rogu (np. drzewko: są Fishing Skill Points do wydania)
  const tabBtn = (on, txt, fn, icon, dot) => `<span data-tip="<b>${txt}</b>" style="display:inline-flex;position:relative">${dot ? '<i style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:#e53935;box-shadow:0 0 5px 2px #e5393588;animation:newglow .9s infinite alternate;pointer-events:none;z-index:1"></i>' : ''}<button onclick="${fn}" aria-label="${txt}" style="width:40px;height:40px;padding:0;display:flex;align-items:center;justify-content:center;border:1px solid ${on ? 'var(--ac)' : 'var(--bd)'};border-radius:8px;background:${on ? 'color-mix(in srgb,var(--ac) 35%,var(--card))' : 'var(--card)'}">${icon}</button></span>`;   // jak reszta UI: neutralna ramka, aktywny / najechany = pomarańczowy akcent
  const hookIco = `<img src="${ASSETS_DIR}/fishing_hook/fhook1.png" alt="" style="display:block;width:32px;height:32px;image-rendering:pixelated" onerror="this.outerHTML='<span class=\\'ic\\' style=\\'font-size:22px\\'>🪝</span>'">`;
  // zakładki w prawym górnym rogu panelu łowienia: Skill tree (drzewko umiejętności łowienia) i Special drops
  // ikony (i, drzewko, Special drops) widać dopiero po pierwszym złowionym Crucian Carp (DEV: od razu)
  const sdTab = !fishTabsOn() ? '' : `<div style="position:absolute;top:6px;right:8px;display:flex;gap:6px">${ftOpen ? `<button onclick="window.toggleFishTree(false)" style="height:40px;padding:0 14px;font-weight:800;font-size:14px;border-radius:8px;background:var(--ac);color:#fff;border:1px solid var(--ac);box-shadow:0 2px 8px color-mix(in srgb,var(--ac) 45%,transparent)">← Back to fishing</button>` : ''}${tabBtn(fbOpen, 'Fishing Bonuses', 'window.toggleFishBonuses()', uiIco('ui_info', 'ℹ️', 32))}${tabBtn(ftOpen, 'Fishing Skill Tree', 'window.toggleFishTree()', uiIco('ui_skills', '⭐', 32), fishSpDot())}</div>`;   // zakładka Special drops usunięta – dropy są na stałe pod rybą (sdCells)
  // panel łowienia: zamiast poziomu i XP – Twoje FP i wymagane FP zaznaczonej ryby (na czerwono, gdy za mało)
  const selFish = FISH.find(x => x.id === fishing.sel);
  const fpOk = canFish(selFish);
  // pasek łowienia: transition:none – szerokość ustawia płynnie pętla requestAnimationFrame (updateFishUI), bez animacji CSS „cofającej” pasek
  // okienko Fishing Bonuses (pod przyciskami, jak Special drops): tabela nazwa – wartość – źródło
  const fbBox = fbOpen ? `<div style="position:absolute;top:52px;right:8px;z-index:5;min-width:240px;background:var(--card);border:1px solid var(--bd);border-radius:10px;padding:8px 10px 10px;box-shadow:0 4px 14px #0006">`
    + `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px"><b>Fishing Bonuses</b><button onclick="window.toggleFishBonuses(false)" title="Close" style="padding:0 7px;font-weight:700;line-height:20px">X</button></div>`
    + (() => { const f = FISH.find(x => x.id === fishing.sel);
      return `<div data-tip="${catchTimeTip(f)}" style="display:flex;align-items:center;gap:8px;padding:6px 8px;margin-bottom:8px;border-radius:8px;background:color-mix(in srgb,var(--bd) 35%,var(--card));cursor:help">`
        + `<span style="font-size:18px">⏱</span><div style="flex:1;line-height:1.25"><small style="color:var(--mut)">Time per catch · ${f ? f.name : ''}</small><br><b style="font-size:15px">${catchRange(f)}</b></div></div>`; })()
    + `<div style="font-size:11px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px">Bonuses</div>`
    + `<table style="width:100%;border-collapse:collapse;font-size:12px">` + fishBonusRows().map(([n, v, tip]) => `<tr data-tip="${tip}" style="border-top:1px solid var(--bd);cursor:help"><td style="padding:4px 6px 4px 0"><b>${n}</b></td><td style="padding:4px 0;text-align:right;font-weight:700;color:#e69500;white-space:nowrap">${v}</td></tr>`).join('') + `</table></div>` : '';
  // zakładka Skill tree: nagłówek z punktami, łączną szansą na podwójny połów i resetem; plansza w renderFishTree()
  // przycisk „Back to fishing” jest w rzędzie ikon (obok „i”) – patrz sdTab
  const treeHead = `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding-right:330px"><div><b>Fishing Skill Tree</b></div>`
    + `<div><b>Fishing Skill Points:</b> <b class="t2" style="display:inline">${fishing.sp || 0}</b></div>`
    + `<span data-tip="<b>Reset fishing skills</b>Refunds all purchased skills.<br>Refund: ${fSpent()} Fishing Skill Point${fSpent() === 1 ? '' : 's'}" style="display:inline-flex"><button onclick="window.resetFishTree()"${fSpent() ? '' : ' disabled'} style="font-size:12px">↺ Reset</button></span></div>`;
  if (ftOpen) $('body-fish').innerHTML = sdTab + fbBox + treeHead; else
  // blok z tekstem ma min. wysokość pod ikonami (i / drzewko / haczyk), żeby „Go fishing” (100% szerokości) zawsze zaczynał się PONIŻEJ nich
  $('body-fish').innerHTML = sdTab + fbBox + `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:8px"><div style="display:flex;flex-direction:column;gap:8px;${fishTabsOn() ? 'min-height:44px' : ''}"><div><span class="lb" data-tip="<b>Fishing Skill Points</b>Spend them in the Fishing Skill Tree.<br>Gained by reading a Fishing Guide."><b>Fishing Skill Points:</b></span> <b class="t2" style="display:inline">${fishing.sp || 0}</b></div>${fub().glowUnlock ? `<div><span class="lb" data-tip="<b>Fishing Guides</b>Click the fish when it glows to get a Fishing Guide.<br>Each fish gives a limited number."><b>${selFish ? guidesGot(selFish.id) : 0} / ${selFish ? guideCap(selFish.id) : 0}</b> Fishing Guides</span></div>` : ''}</div><button id="fish-toggle-btn" style="background:${fishing.active ? 'var(--ac)' : 'var(--card)'};color:${fishing.active ? '#fff' : 'var(--tx)'};border-color:${fishing.active ? 'var(--ac)' : 'var(--bd)'};font-weight:700;width:100%">${fishing.active ? 'Fishing...' : 'Go fishing'}</button></div>`;
  // RYBA + PASEK + LICZNIK: stały kontener pod #body-fish – NIE jest przebudowywany przy render() (np. klik w „Special drops”),
  // więc animacja pulsowania i pasek postępu nie restartują się. Sprite w ramce podmienia się tylko przy zmianie ryby.
  let fishLive = $('fish-live');
  if (!fishLive) {
    fishLive = document.createElement('div'); fishLive.id = 'fish-live';
    fishLive.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;gap:8px;margin-top:8px';
    fishLive.innerHTML = `<div id="fish-avatar"></div><div class="xpbar" style="width:100%"><i id="fish-prog" style="width:0;background:var(--ac);transition:none"></i></div><small id="fish-info" style="color:var(--mut)"></small><div id="fish-drops" style="width:100%"></div>`;
    $('body-fish').after(fishLive);
  }
  // data-avfish (NIE data-fish – ten atrybut obsługuje kliknięcie „wybierz rybę” w bocznym menu)
  // dopóki gracz NIE założy pierwszej wędki (strona 2 ekwipunku), w dużym oknie zamiast ryby jest „?” (ta sama grafika co nieodkryte dropy).
  // fishing.rodSeen ustawia się raz, przy pierwszym założeniu – potem zostaje, nawet gdy wędka zostanie zdjęta.
  if (!fishing.rodSeen && Object.values(eq2).some(isRod)) fishing.rodSeen = true;
  const avKey = selFish ? selFish.id + (fishing.rodSeen ? '' : ':?') : '';
  const avEl = $('fish-avatar');
  if (avEl.dataset.avfish !== avKey) {
    avEl.dataset.avfish = avKey;
    avEl.innerHTML = !selFish ? '' : `<div class="cell${fishing.rodSeen ? ' r' + (MATS[selFish.id].r || 0) : ''} fish-av-frame" onclick="window.clickFishAvatar()"${fishing.rodSeen ? '' : ' style="display:flex;align-items:center;justify-content:center"'}>${fishing.rodSeen ? matIco(selFish.id, 160, 120) : uiIco('ui_question', '❔', 112, 'opacity:.5')}</div>`;
  }
  avEl.classList.toggle('idle', !fishing.active);
  const avFr = avEl.querySelector('.fish-av-frame'); if (avFr) avFr.title = fishing.active ? 'Click to stop fishing' : 'Click to start fishing';
  // dropy pod rybą: przebudowa tylko przy zmianie (bez migania ikon przy każdym braniu)
  let fdEl = $('fish-drops'); if (!fdEl) { fdEl = document.createElement('div'); fdEl.id = 'fish-drops'; fdEl.style.width = '100%'; fishLive.appendChild(fdEl); }
  if (fdEl.dataset.html !== sdCells) { fdEl.dataset.html = sdCells; fdEl.innerHTML = sdCells; }
  fishLive.style.display = ftOpen ? 'none' : 'flex';   // w zakładce Skill tree chowamy rybę i pasek (łowienie trwa dalej w tle)
  renderFishTree();
  const fishToggleBtn = $('fish-toggle-btn');
  if (fishToggleBtn) fishToggleBtn.onclick = toggleFishing;
  updateFishUI();
  renderFishSide();
  renderActSide();
  renderQuestSide();   // questy (tylko w Expedition, po prawej)

  const isBought = upgTree.centerHp > 0;
  // elementy dymka skilli (kolory jak w WoW: złoty opis, biały nagłówek "Next rank:", zielony koszt)
  const skTitle = t => `<b style='font-size:23px;margin-bottom:2px'>${t}</b>`;
  const skRank = t => `<div style='color:#a39880;font-size:15px;margin-bottom:6px'>${t}</div>`;
  const skDesc = t => `<div style='color:#ffd100'>${t}</div>`;
  const skNext = t => `<div style='margin-top:12px;font-weight:700;color:#fff'>Next rank:</div><div style='color:#ffd100'>${t}</div>`;
  const skCost = `<div style='margin-top:12px;color:#3fdc3f'>Cost: ${SKILL_COST} ${spIco(16)} skill point</div>`;
  const T = upgTree.nodes, X = 1400, Y = 400,   // X = połowa szerokości planszy (2800 px – miejsce na 3 dodatkowe małe nody w ścieżkach)
  P0 = { center: { x: 0, y: 0 } };
  UPG.forEach(n => P0[n.id] = n);
  const shown = UPG;   // całe drzewko widoczne od początku (dawniej ścieżki odkrywały się dopiero po kupieniu Shatter / Determination – pole vis zostaje w data.js, ale nie jest już używane)
  const corners = [[-210, -106]];   // zablokowany róg (lewa góra); prawy dół i lewy dół zajęły nowe odnogi
  const lockTip = '<b>Locked</b><br>Coming in future updates';
  // node jest dostępny dopiero po kupieniu poprzedniego (req), przy wystarczającej ilości złota
  const nst = n => isMaxed(n.id) ? 'bought' : (n.ph || !reqOk(n) || me.sp < SKILL_COST || busy) ? (T[n.id] ? 'bought' : 'disabled') : 'avail';
  const ln = (a, b, cls) => `<line x1="${X + a.x}" y1="${Y + a.y}" x2="${X + b.x}" y2="${Y + b.y}" class="upg-line ${cls}"></line>`;
  // MACKI: linie od finałów do Torment oplatają dwie splecione, fioletowe macki (sinusoidy po obu stronach linii,
  // zbiegające się przy końcach). Przygaszone, dopóki Torment nie jest kupiony; po zakupie świecą.
  const tentacle = (a, b, on) => {
    const x1 = X + a.x, y1 = Y + a.y, x2 = X + b.x, y2 = Y + b.y, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
    const nx = -dy / L, ny = dx / L, waves = Math.max(2, Math.round(L / 45)), N = 60;
    const path = (ph, amp) => Array.from({ length: N + 1 }, (_, i) => {
      const t = i / N, env = Math.sin(Math.PI * t) ** 0.7, o = amp * env * Math.sin(2 * Math.PI * waves * t + ph);
      return (i ? 'L' : 'M') + (x1 + dx * t + nx * o).toFixed(1) + ' ' + (y1 + dy * t + ny * o).toFixed(1);
    }).join(' ');
    const col = on ? '#c58bff' : '#7a4fb0', glow = on ? 'filter:drop-shadow(0 0 3px #b06cff)' : 'opacity:.75';
    return `<g style="${glow}" fill="none" stroke-linecap="round"><path d="${path(0, 7)}" stroke="${col}" stroke-width="3"/><path d="${path(Math.PI, 7)}" stroke="${col}" stroke-width="2.5"/><path d="${path(Math.PI / 2, 3)}" stroke="#2a1840" stroke-width="1.5"/></g>`;
  };
  // STRUGI KRWI: linie od finałów do Endure oplatają dwie falujące strugi krwi (grubsza i cieńsza) z ciemną żyłką
  // i kroplami skapującymi w dół. Przygaszone, dopóki Endure nie jest kupiony; po zakupie jasnoczerwone z poświatą.
  const bloodVein = (a, b, on) => {
    const x1 = X + a.x, y1 = Y + a.y, x2 = X + b.x, y2 = Y + b.y, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
    const nx = -dy / L, ny = dx / L, waves = Math.max(1.5, L / 70), N = 60;
    const pt = (t, ph, amp) => { const env = Math.sin(Math.PI * t) ** 0.6, o = amp * env * (Math.sin(2 * Math.PI * waves * t + ph) + 0.35 * Math.sin(2 * Math.PI * waves * 2.3 * t + ph * 1.7)); return [x1 + dx * t + nx * o, y1 + dy * t + ny * o]; };
    const path = (ph, amp) => Array.from({ length: N + 1 }, (_, i) => { const [x, y] = pt(i / N, ph, amp); return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }).join(' ');
    const col = on ? '#e3342b' : '#6e1212', dark = on ? '#7a0c0c' : '#3a0808', fx = on ? 'filter:drop-shadow(0 0 3px #ff3b2f)' : 'opacity:.8';
    // krople: co ~55 px wisząca kropla pod grubszą strugą (kształt łezki skierowanej w dół)
    const drops = Array.from({ length: Math.max(1, Math.floor(L / 55)) }, (_, k) => {
      const t = (k + 0.6) / Math.max(1, Math.floor(L / 55) + 0.2); if (t >= 0.95) return '';
      const [x, y] = pt(t, 0, 6), h = 5 + (k % 3) * 2;
      return `<path d="M${x.toFixed(1)} ${(y + 2).toFixed(1)} q2.6 ${h * 0.6} 0 ${h} q-2.6 ${-h * 0.4} 0 ${-h}" fill="${col}"/>`;
    }).join('');
    return `<g style="${fx}" fill="none" stroke-linecap="round"><path d="${path(0, 6)}" stroke="${col}" stroke-width="4"/><path d="${path(Math.PI * 0.8, 4)}" stroke="${col}" stroke-width="2"/><path d="${path(0, 6)}" stroke="${dark}" stroke-width="1.2"/>${drops}</g>`;
  };
  // LASERY: linie od finałów ścieżek maga do Master of All Elements – widoczne DOPIERO po kupieniu Master of All Elements
  // (wcześniej zwykła przerywana linia). Jasne promienie w kolorze ścieżki, z której wychodzą (Lightning – żółty, Fire – czerwono-
  // pomarańczowy, Water – turkusowy): pulsująca szeroka poświata + promień + biały rdzeń + płynące „pakiety energii” i iskry na końcach.
  const LASER_COL = { l0_8: ['#ffd84a', '#fff6c0'], l1_8: ['#ff6a1a', '#ffd0a0'], l2_8: ['#2ad0c0', '#d4fff0'] };
  const laser = (a, b, on, f) => {
    if (!on) return '';
    const [col, core] = LASER_COL[f] || ['#c8aaff', '#ffffff'], x1 = X + a.x, y1 = Y + a.y, x2 = X + b.x, y2 = Y + b.y;
    const L = (w, c, o, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity="${o}" ${extra}/>`;
    const spark = (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="${core}" class="laserspark" style="filter:drop-shadow(0 0 8px ${col})"/>`;
    return `<g style="filter:drop-shadow(0 0 10px ${col}) drop-shadow(0 0 4px ${col})">`
      + L(26, col, .25, 'class="laserpulse"') + L(12, col, .9) + L(5, core, 1)
      + L(5, '#ffffff', .95, 'stroke-dasharray="6 34" class="laserflow"')   // płynące pakiety energii (od finału ścieżki do Master of All Elements)
      + spark(x1, y1) + spark(x2, y2) + `</g>`;
  };
  const lines = corners.map(([x, y]) => ln(P0.center, { x, y }, 'off')).join('') +
    shown.map(n => [n.from].concat(n.fromX || []).map(f => ln(P0[f], n, T[n.id] && isMaxed(f) ? 'on' : 'off') + (n.id === 'ag' ? tentacle(P0[f], n, !!T[n.id]) : n.id === 'dj' ? bloodVein(P0[f], n, !!T[n.id]) : n.id === 'lj' ? laser(P0[f], n, !!T[n.id], f) : '')).join('')).join('');
  // dymek: przy nodach z rangami – ranga, obecny efekt i efekt następnej rangi; wymagania mówią o wymaksowaniu poprzedniego
  // DYMEK SKILLA w stylu WoW: większa nazwa, szara ranga, opis działania na złoto,
  // wyraźnie oddzielona sekcja "Next rank:", koszt na zielono (tylko gdy można jeszcze dokupić)
  const tipOf = n => {
    if (n.ph) return lockTip;
    const r = rankOf(n.id), mx = n.max || 1, big = n.k === 'b';
    // etykieta w prawym górnym rogu dymka: "Debuff" (fioletowa – Sunder, Withering, Curse of the Void) albo "Buff" (zielona – Terror)
    const lab = n.debuff ? ['Debuff', '#c58bff'] : n.buff ? ['Buff', '#5fcf70'] : null;
    const tag = lab ? `<span style='position:absolute;top:12px;right:14px;font-size:14px;font-weight:700;color:${lab[1]}'>${lab[0]}</span>` : '';
    let t = tag + (lab ? `<b style='font-size:23px;margin-bottom:2px;padding-right:72px'>${n.n}</b>` : skTitle(n.n)) + (big ? skRank(`Rank ${r}/${mx}`) : '');
    t += skDesc(descAt(n, Math.max(1, r)));
    if (r && r < mx && typeof n.d === 'function') t += skNext(descAt(n, r + 1));
    return isMaxed(n.id) ? t : t + skCost;   // bez dopisków "Requires ..." – wymagania widać po zablokowanym nodzie
  };
  const nodes = shown.map(n => {
    const st = nst(n);
    // licznik rang (np. 1/3, 1/1) w prawym dolnym rogu każdego dużego noda: ciemne tło, wyraźna obwódka;
    // złoty = wymaksowany, biały = częściowo kupiony, szary = nic nie kupione
    const rk = rankOf(n.id), mx = n.max || 1, bcol = rk >= mx ? '#f2c200' : rk ? '#ffffff' : '#a39880';
    const badge = n.k === 'b' && !n.ph ? `<div class="rkb" style="position:absolute;right:-9px;bottom:-9px;min-width:26px;padding:1px 4px;border-radius:7px;background:#120d08;border:1.5px solid ${bcol};color:${bcol};font-size:12px;font-weight:800;line-height:14px;text-align:center;box-shadow:0 0 4px #000;z-index:1">${rk}/${mx}</div>` : '';
    return `<div class="upg-node${n.k == 's' ? ' small' : ''} ${st}" data-id="${n.id}" style="left:${X + n.x}px;top:${Y + n.y}px" data-tip="${tipOf(n)}"${st == 'avail' ? ` onclick="window.buyNode('${n.id}')"` : ''}><span class="ic">${n.ph ? '🔒' : n.ic}</span>${badge}</div>`;
  }).join('') + corners.map(([x, y]) => `<div class="upg-node disabled" style="left:${X + x}px;top:${Y + y}px" data-tip="${lockTip}"><span class="ic">🔒</span></div>`).join('');
  const centerState = isBought ? 'bought' : (me.sp < SKILL_COST || busy ? 'disabled' : 'avail');
  const centerTip = skTitle('Surprise Attack') + skRank(`Rank ${isBought ? 1 : 0}/1`) + skDesc('You always strike first in combat.<br>Without this skill, whoever has more Dexterity attacks first.') + (isBought ? '' : skCost);

  // przycisk resetu skilli: aktywny tylko, gdy coś jest kupione (i nie trwa walka)
  const rb = $('skillreset'), refund = skillRefund();
  if (rb) {
    rb.disabled = busy || refund === 0;
    // dymek w stylu opisów przedmiotów (obsługiwany przez wspólny system data-tip, działa też na wyłączonym przycisku)
    $('skillresetw').dataset.tip = `<b>Reset skills</b>Refunds all purchased skills, including "Surprise Attack".<br>Refund: ${refund} skill point${refund === 1 ? '' : 's'}` + (busy ? '<br>Unavailable during combat' : refund ? '' : '<br>No skills purchased');
  }

  // ikona środkowego skilla (piorun) z assets/skills – SKILL_ICON_CENTER z data.js (gdy brak pliku: ⚡)
  // zasięg przeciągania planszy = rozmiar widocznego drzewka (+ zapas) – przeliczany z przybliżeniem przy każdym ruchu
  treeExt = { x: Math.max(300, ...shown.map(n => Math.abs(n.x))) + 120, y: Math.max(200, ...shown.map(n => Math.abs(n.y))) + 120 };
  const key = shown.map(n => n.id).join(',');
  const tcOld = $('treeContent');
  if (tcOld && key === treeKey) {
    // AKTUALIZACJA W MIEJSCU: zmieniamy tylko stan nodów, dymki, liczniki rang i linie – obrazki ikon zostają nietknięte
    $('treeLines').innerHTML = lines;
    shown.forEach(n => {
      const el = tcOld.querySelector(`[data-id="${n.id}"]`); if (!el) return;
      const st = nst(n);
      el.className = `upg-node${n.k == 's' ? ' small' : ''} ${st}`;
      el.dataset.tip = tipOf(n);
      el.removeAttribute('onclick'); el.onclick = st == 'avail' ? () => window.buyNode(n.id) : null;
      const b = el.querySelector('.rkb');
      if (b) { const rk = rankOf(n.id), mx = n.max || 1, c = rk >= mx ? '#f2c200' : rk ? '#ffffff' : '#a39880'; b.textContent = `${rk}/${mx}`; b.style.borderColor = c; b.style.color = c; }
    });
    const ce = tcOld.querySelector('[data-id="center"]');
    if (ce) {
      ce.className = `upg-node center-node ${centerState}`; ce.dataset.tip = centerTip;
      ce.removeAttribute('onclick'); ce.onclick = centerState == 'avail' ? () => window.buyUpg('centerHp') : null;
      const ub0 = ce.querySelector('.upg-badge'); if (ub0) ub0.style.display = isBought ? 'none' : '';
    }
    tcOld.style.transform = `translate(${panX}px,${panY}px) scale(${currentZoom})`;
  } else {
  treeKey = key;
  $('body-upg').innerHTML = `<div class="upg-tree-container" id="treeContainer"><div class="upg-tree-content" id="treeContent" style="left:50%;top:50%;width:2800px;height:800px;margin:-400px 0 0 -1400px;transform:translate(${panX}px,${panY}px) scale(${currentZoom})"><svg class="upg-svg-lines" id="treeLines" viewBox="0 0 2800 800">${lines}</svg><div class="upg-node center-node ${centerState}" data-id="center" style="top:50%;left:50%" data-tip="${centerTip}"${centerState == 'avail' ? ` onclick="window.buyUpg('centerHp')"` : ''}><span class="ic">${SKILL_ICON_CENTER}</span><div class="upg-badge"${isBought ? ' style="display:none"' : ''}>1</div></div>${nodes}</div></div>`;
  }

  const container = $('treeContainer');
  if (container) {
    container.onmousedown = e => {
      e.preventDefault();
      setPanMoved(false);
      setPanDrag({ x: e.clientX, y: e.clientY, px: panX, py: panY });
    };
    container.onwheel = e => {
      e.preventDefault();
      // przybliżanie względem ŚRODKA obecnego widoku: punkt planszy na środku ekranu zostaje na miejscu
      // (pozycja na ekranie = pan + punkt × zoom, więc przy zmianie zoomu pan skalujemy tym samym współczynnikiem)
      const z0 = currentZoom;
      setCurrentZoom(e.deltaY < 0 ? Math.min(2.5, currentZoom + 0.15) : Math.max(0.5, currentZoom - 0.15));
      const k = currentZoom / z0; setPanX(panX * k); setPanY(panY * k);
      clampPan();
      const tc = $('treeContent');
      if (tc) tc.style.transform = `translate(${panX}px,${panY}px) scale(${currentZoom})`;
    };
  }

  const back = (a, t) => `<div class="row"><button data-a="${a}"${a === 'dfback' ? ' class="bkac"' : ''}${busy ? ' disabled' : ''}>← Back</button><b>${t}</b></div>`, N = DUN.mobs.length;   // Back z walki w lochu (dfback) – pomarańczowy, jak Fight i Back na wyprawie
  // lista lokacji Aktu 1 (dokładnie jak wcześniej)
  // lokacja jest zablokowana, dopóki nie pokonasz bossa (czerwona poświata) poprzedniej lokacji
  // lokacje wybranego aktu; data-i = indeks w ALL_LOCS (wspólny dla wszystkich aktów: Akt 1 = 0–4, Akt 2 = 5–9, Akt 3 = 10–14)
  const actI = actsOn() ? (eact ?? 0) : 0, off = ACT_START[actI];
  const locTiles = `<div class="tiles">` + ACTS[actI].locs.map((l, j) => { const i = off + j; return !locOpen(i)
    ? (() => { const pl = ALL_LOCS[i - 1], pb = pl.mobs[pl.mobs.length - 1]; return `<div class="tile lock"><span class="ic">${l.e}</span><b>${l.n}</b><small>Defeat: ${pb.e} ${pb.n}</small></div>`; })()
    : `<button class="tile" data-a="eloc" data-i="${i}"${fishing.active ? ' disabled' : ''}><span class="ic">${l.e}</span><b>${l.n}</b></button>`; }).join('') + `</div>`;
  // placeholdery Aktu 2 i 3: 5 zablokowanych lokacji
  const lockedLocs = `<div class="tiles">` + Array.from({ length: 5 }, () => `<div class="tile lock"><span class="ic">🔒</span><b>???</b><small>Coming soon</small></div>`).join('') + `</div>`;
  $('body-exp').innerHTML = eloc == null ? (
      ACTS[actI].locs ? locTiles : lockedLocs
    ) : back('eback', `${ALL_LOCS[eloc].e} ${ALL_LOCS[eloc].n}`) + `<div class="tiles">` + ALL_LOCS[eloc].mobs.map((m, i) => `<button class="tile${i == esel ? ' sel' : ''}${i == ALL_LOCS[eloc].mobs.length - 1 ? ' boss' : ''}${mobOpen(eloc, i) ? '' : ' mlock'}" data-a="esel" data-i="${i}"${busy || fishing.active || !mobOpen(eloc, i) ? ' disabled' : ''}>${lvlTag(m, i == ALL_LOCS[eloc].mobs.length - 1)}${winTag(m)}${mobIco(m, 64)}<b>${m.n}</b><small>+${xpOf(m)} XP</small></button>`).join('') + `</div>`;
  $('body-dun').innerHTML = dloc == null ? `<div class="grid9">` + Array.from({ length: 9 }, (_, i) => i === 0 ? (!dunLvlOk() ? `<div class="tile lock"><span class="ic">${DUN.e}</span><b>${DUN.n}</b><small style="color:var(--ac);font-weight:700">From level 10</small></div>` : `<button class="tile" data-a="dloc"><span class="ic">${DUN.e}</span><b>${DUN.n}</b><small>${dprog}/${N}</small></button>`) : `<div class="tile lock"><span class="ic">🔒</span></div>`).join('') + `</div>` : (dfight ? back('dfback', `${DUN.e} ${DUN.n}`) : back('dback', `${DUN.e} ${DUN.n} · ${Math.min(dprog, N)}/${N}`))
      // LEWO: dropy oglądanego przeciwnika (dview), PRAWO: kolumna przeciwników (każdego można kliknąć, żeby zobaczyć dropy;
      // walczyć można tylko z kolejnym niepokonanym = dprog, dalsi zablokowani do czasu pokonania poprzedniego)
      + (dfight ? `<div id="dunfight-slot"></div>` : `<div class="dunwrap"><div class="dunmobs">` + DUN.mobs.map((m, i) => {
        const dP = dunProg(), cd = i <= dP ? dunCd(i) : 0, st = i > dP ? 'lock' : cd ? 'cool' : 'open', on = i === Math.min(dview, N - 1);
        // bez XP i bez kłódki: zablokowani są tylko wyszarzeni; pod nazwą jedynie licznik przerwy; ostatni przeciwnik bez czerwonej obwódki
        const sub = st === 'cool' ? `<small class="dcd" data-cd="${i}">${fmtCd(cd)}</small>` : '';
        return `<button class="tile dmob${on ? ' sel' : ''}${st === 'lock' ? ' dlock' : ''}${st === 'cool' ? ' dcool' : ''}" data-a="dsel" data-i="${i}"${busy ? ' disabled' : ''}>${lvlTag(m, false)}${winTag(m)}${mobIco(m, 64)}<b>${m.n}</b>${sub}</button>`;
      }).join('') + `</div><div class="dundrops">${dunDrops(DUN.mobs[Math.min(dview, N - 1)], Math.min(dview, N - 1))}${DUN.mobs[Math.min(dview, N - 1)].lore ? `<p class="dunlore">${DUN.mobs[Math.min(dview, N - 1)].lore}</p>` : ''}${dunFightBtn(Math.min(dview, N - 1))}</div></div>`);
  // okno walki: w trybie walki lochu przeniesione DO karty lochu (zamiast listy przeciwników), w pozostałych przypadkach na swoim miejscu nad plecakiem
  if (view == 'dun' && dloc != null && dfight && $('dunfight-slot')) $('dunfight-slot').appendChild(FIGHTBOX);
  else if (FIGHTBOX.parentNode !== $('invcard').parentNode || FIGHTBOX.nextElementSibling !== $('invcard')) $('invcard').before(FIGHTBOX);

  const m = curMob(); FIGHTBOX.hidden = !m || (view == 'dun' && !dfight);   // loch: okno walki tylko po kliknięciu Fight
  // WYPRAWA: po kliknięciu przeciwnika znikają plecak i karta wyboru przeciwnika (zostaje samo okno walki z Back w lewym górnym rogu);
  // wracają po Collect / Back. Podczas łowienia wszystko zostaje (złowione ryby lecą do plecaka).
  if ((view != 'exp' || !m) && expRes) { endExp(); setTimeout(render, 0); }   // wyjście z ekranu wyniku bez Collect: łup i tak trafia do plecaka
  // (plecak zostaje widoczny pod oknem walki)
  const expFight = view == 'exp' && !!m && !fishing.active;
  if (expFight) $('v-exp').style.display = 'none';
  $('fbackrow').style.display = view == 'exp' && m ? 'flex' : 'none';
  $('fbackrow').firstChild.disabled = busy;   // w trakcie walki nieaktywny
  // po walce: Back znika, w jego miejscu napis wyniku – Victory! (zielony) / Defeat (czerwony)
  const showRes = !!(expRes && !fightOn);
  $('fbackrow').firstChild.style.display = showRes ? 'none' : '';
  $('fres').innerHTML = showRes ? (expRes.win ? '<span style="color:#2fae3f">Victory!</span>' : '<span style="color:#e53935">Defeat</span>') : '';
  $('loot').hidden = !(expRes && expRes.win && !fightOn);
  if (!$('loot').hidden) $('loot').innerHTML = (expRes.loot.length
    ? expRes.loot.map((i, n) => `<div class="cell r${i.r || 0}" data-it="loot:${n}">${invIco(i)}</div>`).join('')   // tylko podgląd (dymek, Shift = porównanie) – bez zakładania
    : expRes.had ? '' : `<small>No loot</small>`)
    + `<div class="rw">${expRes.xp ? `<span style="color:#8e44ad">+${expRes.xp} XP</span>` : ''}<span style="color:#e69500">+${expRes.gold} ${goldIco(16)}</span></div>`   // pod łupem: +XP i +złoto
    + (expRes.quest ? `<div class="rw"><span style="color:#3fdc3f">Quest complete!</span><span style="color:#8e44ad">+${expRes.quest.xp} XP</span><span style="color:#e69500">+${expRes.quest.gold} ${goldIco(16)}</span></div>` : '');   // nagroda z questa (przedmiot – w łupie wyżej)
  // walka niżej: pas na górze okna walki zarezerwowany na ikony buffów (lewo) i debuffów (prawo) – 6 px odstępu + 36 px kafelek,
  // żeby nie zasłaniały postaci ani nazwy przeciwnika
  const arenaEl = $('fightbox').querySelector('.arena'); if (arenaEl) arenaEl.style.paddingTop = '38px';
  if (m) {
    const fmEl = $('fm');
    if (fmEl) {
      fmEl.innerHTML = mobIco(m, 128);   // grafika przeciwnika (pixel art) albo emoji
      const fpEl = $('fp'); if (fpEl && !fpEl.dataset.hero) { fpEl.dataset.hero = 1; fpEl.innerHTML = heroIco(128); }   // postać gracza (raz – nie miga przy odświeżaniu)
      fmEl.classList.toggle('boss', isBoss(m));
    }
    $('nm').innerHTML = `${m.n} <button class="ib" data-a="info">ℹ️</button>${lvlTag(m, isBoss(m))}`;
    const s = mstats(m);
    $('info').style.display = showInfo ? 'flex' : 'none';
    if (lastMob !== m && !busy) live = null;   // inny przeciwnik → panel znów pokazuje statystyki bazowe
    renderInfo(m);
    // przycisk „Show battle log” (absolutnie pod przeciwnikiem) zjeżdża pod panel ℹ️, gdy ten jest otwarty
    { const lw = $('logwrap'); if (lw) lw.style.marginTop = (showInfo ? $('info').offsetHeight + 24 : 24) + 'px'; }
    if (lastMob !== m && !busy) { setLastMob(m); setShowInfo(false); renderDebuffs({}); const h0 = frailHp(s.hp);
      // Elemental Barrier widoczna już przed walką: niebieska końcówka paska i HP + tarcza / maks. HP (bez ikony buffa)
      const sh0 = Math.round(d.hp * (ub().barrier || 0) / 100), tot = d.hp + sh0;
      { const u0 = ub(), N = u0.elemMaster ? 4 : 5, pv = {};   // podgląd przed walką: ikony energii z ich stosami startowymi (wszystkie 1)
        if (u0.bolt) pv.bolt = { st: 1, tip: `Stacks: 1/${N}<br>At ${N} stacks a lightning bolt strikes your enemy` };
        if (u0.fire) pv.fire = { st: 1, tip: `Stacks: 1/${N}<br>At ${N} stacks they detonate for ${+u0.fire.toFixed(2)}% of the enemy maximum health` };
        if (u0.water) pv.water = { st: 1, tip: `Stacks: 1/${N}<br>At ${N} stacks you heal for ${+u0.water.toFixed(2)}% of your maximum health` };
        renderPBuffs(pv); }
      $('hp1').style.width = d.hp / tot * 100 + '%'; $('sh1').style.left = d.hp / tot * 100 + '%'; $('sh1').style.width = sh0 / tot * 100 + '%';
      $('hp2').style.width = (h0 / Math.round(s.hp) * 100) + '%'; $('ht1').textContent = tot + '/' + d.hp; $('ht2').textContent = h0 + '/' + Math.round(s.hp); }
  }
  { const dcd = view == 'dun' && m && dsel >= 0 ? dunCd(dsel) : 0;   // loch: przerwa po wygranej → przycisk z licznikiem
    const done = expRes && !fightOn;   // wyprawa po walce: Collect (wygrana) / Back (przegrana)
    $('go').disabled = done ? busy : fightOn ? skipFight : (busy || fishing.active || dcd > 0);
    $('go').textContent = done ? (expRes.win ? 'Collect' : 'Back') : fightOn ? 'Skip ⏭' : dcd > 0 ? `Next fight in ${fmtCd(dcd)}` : 'Fight!'; }   // w trakcie walki: Skip
  refreshTip();
  checkSetFx();   // efekt po osiągnięciu progu bonusu setowego (2/4, 4/4)
}

function scheduleCatch(from = Date.now()) {
  // czas brania: losowo w zakresie ryby (FISH[].t), skrócony przez drzewko i sety, min. 2 s – ten sam wzór co catchRange()
  const fs = FISH.find(x => x.id === fishing.sel), sec = catchSecs(I(...fishT(fs)), fs);
  fishing.startAt = from; fishing.nextAt = from + sec * 1000;
  // moment pulsowania ryby: losowo między 20% a 80% paska (albo brak, jeśli nie trafi w PULSE_CHANCE)
  // brak pulsowania, gdy z tej ryby zdobyto już limit Fishing Guide
  fishing.pulseAt = guidesGot(fishing.sel) < guideCap(fishing.sel) && Math.random() < effPulse() ? from + sec * 1000 * (PULSE_FROM + Math.random() * (PULSE_TO - PULSE_FROM)) : 0;
  fishing.pulseDone = false;
}

// UKRYTY PITY COUNTER (gracz go nie widzi): każdy losowany drop z ryby ma licznik nieudanych prób (fishing.pity[klucz]).
// Gdy licznik dojdzie do 3 × średniej liczby prób (100 / szansa), drop jest gwarantowany: 2% → najpóźniej przy 150. próbie,
// 5% → 60, 10% → 30, 1% → 300. Po każdym dropie (naturalnym lub z pity) licznik wraca do 0. Działa też offline.
const PITY_MULT = 3;
let dropMult = 1;   // mnożnik szans łowionej ryby (FISH[].dr) – ustawiany w fishTick przed losowaniem dropów
function roll(key, pct) {
  pct *= dropMult;   // np. Shark: 5% × 0.45 = 2.25%; pity liczy się od tej obniżonej szansy (3 × średnia)
  fishing.pity = fishing.pity || {};
  const n = (fishing.pity[key] || 0) + 1;
  if (Math.random() * 100 < pct || n >= Math.ceil(PITY_MULT * 100 / pct)) { fishing.pity[key] = 0; return true; }
  fishing.pity[key] = n; return false;
}

// działa niezależnie od zakładki; po powrocie do karty nadrabia zaległe ryby.
// Każde "branie" = 100% sukcesu: zaznaczona ryba zawsze trafia do plecaka (bez XP i poziomu łowienia).
// Jeśli FP spadnie poniżej wymagań ryby (np. zdjęty haczyk), łowienie się zatrzymuje (DEV: bez wymagań).
// upTo = do kiedy liczymy brania (offline: czas powrotu, maks. 8 h po zapisie); offline = bez efektów i z dużym limitem pętli
function fishTick(upTo = Date.now(), offline = false) {
  if (!fishing.active) return false;
  let caught = false, guard = 0;
  while (upTo >= fishing.nextAt && guard++ < (offline ? 50000 : 500)) {
    caught = true;
    const f = FISH.find(x => x.id === fishing.sel);
    dropMult = (f && f.dr) || 1;
    const snap = offline ? null : new Map(inv.map(x => [x, x.qty || 1]));   // stan plecaka przed braniem – do efektów (co nowego wpadło)
    let nFish = 1, byId = null;   // byId = ryba z bycatchu (do efektu)
    if (!canFish(f)) {
      fishing.active = false;
      say(`Not enough FP to catch ${f ? f.name : 'this fish'} (requires ${f ? f.fp : 0} FP). Fishing stopped.`, 'miss');
      break;
    }
    {
      giveMat(f.id);
      fishing.caught = fishing.caught || {};
      // pierwszy złowiony Crucian Carp: odblokowuje ikony panelu łowienia (i, drzewko, Special drops) i daje 1 Fishing Skill Point
      if (f.id === 'fish_carp' && !fishing.caught.fish_carp) {
        fishing.sp = (fishing.sp || 0) + 1;
        say('<b>First catch!</b> +1 Fishing Skill Point. The Fishing Skill Tree is now available.', 'crit');
      }
      fishing.caught[f.id] = true;   // złowiona choć raz
      // Fishing Skill Tree: szansa na podwójny połów – druga sztuka tej samej ryby (special dropy losowane tylko raz)
      if (Math.random() * 100 < effTriple()) { giveMat(f.id); giveMat(f.id); nFish = 3; say(`<b>Triple catch!</b> +2 ${f.name}`, 'crit'); }   // Triple Catch (przed Double)
      else if (Math.random() * 100 < effDouble()) { giveMat(f.id); nFish = 2; say(`<b>Double catch!</b> +1 ${f.name}`, 'crit'); }
      // Treasure chance: Sunken Chest do plecaka
      if (Math.random() * 100 < effTreasure()) { giveChest(); say(`<b>Treasure!</b> Found a <b class="t${CHEST.r}">${CHEST.name}</b>!`, 'crit'); }
      addCatch(f.id, nFish);   // Fishpedia: licznik i progi
      // BYCATCH: dodatkowa losowa gorsza ryba (bez special dropów), liczona do Fishpedii
      if (Math.random() * 100 < effBycatch(f)) {
        const low = FISH.slice(0, FISH.indexOf(f)), bf = low[Math.floor(Math.random() * low.length)]; byId = bf.id;
        giveMat(bf.id); addCatch(bf.id, 1);
        fishing.caught = fishing.caught || {}; fishing.caught[bf.id] = true;
        say(`<b>Bycatch!</b> +1 <b class="t${MATS[bf.id].r || 0}">${bf.name}</b>`, 'crit');
      }
      // jednorazowo: pierwszy złowiony karaś daje Haczyk wędkarski
      if (f.id === 'fish_carp' && !fishing.hookGiven) {
        fishing.hookGiven = true;
        const h = makeHook(); h.fresh = 1; inv.push(h);
        say(`Found: <b class="t${h.r}">${h.name}</b>!`, 'crit');
      }
      // special drop: przepis Cooked Crucian Carp – 5% przy złowionym karasiu, JEDNORAZOWO (special dropy wypadają tylko raz)
      if (f.id === 'fish_carp' && !fishing.recipeCarp && roll('recipeCarp', 5)) {
        fishing.recipeCarp = true;
        const rc = makeRecipe('cooked_carp'); rc.fresh = 1; inv.push(rc);
        say(`Found: <b class="t${rc.r}">${rc.name}</b>!`, 'crit');
      }
      // special drop: kapelusz Angler Boonie – 2% przy złowionym Dorszu, jednorazowo
      if (f.id === 'fish_cod' && !fishing.boonie && roll('boonie', 2)) {
        fishing.boonie = true;
        const bh = makeFixed('boonie'); bh.fresh = 1; inv.push(bh);
        say(`Found: <b class="t${bh.r}">${bh.name}</b>!`, 'crit');
      }
      // special drop: kalosze Angler Wellies – 2% przy złowionym Dorszu, jednorazowo
      if (f.id === 'fish_cod' && !fishing.wellies && roll('wellies', 2)) {
        fishing.wellies = true;
        const wl = makeFixed('wellies'); wl.fresh = 1; inv.push(wl);
        say(`Found: <b class="t${wl.r}">${wl.name}</b>!`, 'crit');
      }
      // special drop: płaszcz Angler Parka – 2% przy złowionym Dorszu, jednorazowo
      if (f.id === 'fish_cod' && !fishing.parka && roll('parka', 2)) {
        fishing.parka = true;
        const pk = makeFixed('parka'); pk.fresh = 1; inv.push(pk);
        say(`Found: <b class="t${pk.r}">${pk.name}</b>!`, 'crit');
      }
      // special drop: latarnia Angler Lantern – 2% przy złowionym Dorszu, jednorazowo
      if (f.id === 'fish_cod' && !fishing.lantern && roll('lantern', 2)) {
        fishing.lantern = true;
        const lt = makeFixed('lantern'); lt.fresh = 1; inv.push(lt);
        say(`Found: <b class="t${lt.r}">${lt.name}</b>!`, 'crit');
      }
      // special drop: przepis Cooked Cod – 5% przy złowionym Dorszu, jednorazowo
      if (f.id === 'fish_cod' && !fishing.recipeCod && roll('recipeCod', 5)) {
        fishing.recipeCod = true;
        const rc = makeRecipe('cooked_cod'); rc.fresh = 1; inv.push(rc);
        say(`Found: <b class="t${rc.r}">${rc.name}</b>!`, 'crit');
      }
      // materiał: Eye of Cod (uncommon) – 5% przy KAŻDYM złowionym Dorszu (wielokrotnie, łączy się w stos)
      if (f.id === 'fish_cod' && roll('eye_of_cod', 5)) { fishing.codEye = true; giveMat('eye_of_cod'); }
      // special drop: przepis Grilled Catfish (rare) – 5% przy złowionym Sumie, jednorazowo
      if (f.id === 'fish_catfish' && !fishing.recipeCatfish && roll('recipeCatfish', 5)) {
        fishing.recipeCatfish = true;
        const rc = makeRecipe('grilled_catfish'); rc.fresh = 1; inv.push(rc);
        say(`Found: <b class="t${rc.r}">${rc.name}</b>!`, 'crit');
      }
      // special drop: talizman Catfish Whisker Charm (rare) – 2% przy złowionym Sumie, jednorazowo
      if (f.id === 'fish_catfish' && !fishing.whiskerCharm && roll('whiskerCharm', 2)) {
        fishing.whiskerCharm = true;
        const wc = makeFixed('whisker_charm'); wc.fresh = 1; inv.push(wc);
        say(`Found: <b class="t${wc.r}">${wc.name}</b>!`, 'crit');
      }
      // materiał: Łuska suma – 2% przy KAŻDYM złowionym Sumie (wielokrotnie, łączy się w stos)
      if (f.id === 'fish_catfish' && roll('catfish_scale', 6)) {   // 6% × dr 0.5 = 3% (było 1%)
        fishing.catfishScale = true; giveMat('catfish_scale'); }
      // special dropy: 4 projekty Crafting Design (rare) – po 10% przy złowionym Sumie, każdy jednorazowo
      for (const k of DESIGN_KINDS) {
        if (f.id === 'fish_catfish' && !fishing['design_' + k] && roll('design_' + k, 10)) {
          fishing['design_' + k] = true;
          const dz = makeDesign(k); dz.fresh = 1; inv.push(dz);
          say(`Found: <b class="t${dz.r}">${dz.name}</b>!`, 'crit');
        }
      }
      // special dropy: Catfish Whisker Amulet i Ring (rare) – po 2% przy złowionym Sumie, każdy jednorazowo
      for (const [key, flag] of [['whisker_amulet', 'whiskerAmulet'], ['whisker_ring', 'whiskerRing']]) {
        if (f.id === 'fish_catfish' && !fishing[flag] && roll(flag, 2)) {
          fishing[flag] = true;
          const it = makeFixed(key); it.fresh = 1; inv.push(it);
          say(`Found: <b class="t${it.r}">${it.name}</b>!`, 'crit');
        }
      }
      // special drop: przepis Grilled Barracuda (rare) – 5% przy złowionej Barrakudzie, jednorazowo
      if (f.id === 'fish_barracuda' && !fishing.recipeBarracuda && roll('recipeBarracuda', 5)) {
        fishing.recipeBarracuda = true;
        const rc = makeRecipe('steamed_barracuda'); rc.fresh = 1; inv.push(rc);
        say(`Found: <b class="t${rc.r}">${rc.name}</b>!`, 'crit');
      }
      // materiał: Kieł barrakudy (rare) – 2% przy KAŻDEJ złowionej Barrakudzie (wielokrotnie, łączy się w stos)
      if (f.id === 'fish_barracuda' && roll('barracuda_fang', 2)) { fishing.barracudaFang = true; giveMat('barracuda_fang'); }
      // special drop: projekt Crafting Design: Ring of the Tide (epic) – 2% przy złowionej Barrakudzie, jednorazowo
      if (f.id === 'fish_barracuda' && !fishing.design_tide_ring && roll('design_tide_ring', 2)) {
        fishing.design_tide_ring = true;
        const dz = makeDesign('tide_ring'); dz.fresh = 1; inv.push(dz);
        say(`Found: <b class="t${dz.r}">${dz.name}</b>!`, 'crit');
      }
      // special dropy: przepisy Anglerfish Stew (epic), Shark Stew (epic), Abyssal Broth (legendary) – po 5%, każdy jednorazowo
      for (const [fid, rk, flag] of [['fish_anglerfish', 'anglerfish_stew', 'recipeAnglerfish'], ['fish_shark', 'shark_steak', 'recipeShark'], ['fish_leviathan', 'abyssal_broth', 'recipeLeviathan']]) {
        if (f.id === fid && !fishing[flag] && roll(flag, 5)) {
          fishing[flag] = true;
          const rc = makeRecipe(rk); rc.fresh = 1; inv.push(rc);
          say(`Found: <b class="t${rc.r}">${rc.name}</b>!`, 'crit');
        }
      }
      // special drop: naszyjnik Anglerfish Lure Necklace (epic) – 5% przy złowionej Żabnicy, jednorazowo
      if (f.id === 'fish_anglerfish' && !fishing.lureNecklace && roll('lureNecklace', 5)) {
        fishing.lureNecklace = true;
        const nk = makeFixed('lure_necklace'); nk.fresh = 1; inv.push(nk);
        say(`Found: <b class="t${nk.r}">${nk.name}</b>!`, 'crit');
      }
      // materiał: Light of Anglerfish (epic) – 3% przy KAŻDEJ złowionej Żabnicy (wielokrotnie, łączy się w stos)
      if (f.id === 'fish_anglerfish' && roll('light_of_anglerfish', 3)) { fishing.anglerLight = true; giveMat('light_of_anglerfish'); }
      // special dropy: 4 projekty Crafting Design (epic) do kompletu Sea Raider – po 10% przy złowionej Żabnicy (Anglerfish), każdy jednorazowo (jak projekty z Suma)
      for (const k of HUNTER_SET) {
        if (f.id === 'fish_anglerfish' && !fishing['design_' + k] && roll('design_' + k, 10)) {
          fishing['design_' + k] = true;
          const dz = makeDesign(k); dz.fresh = 1; inv.push(dz);
          say(`Found: <b class="t${dz.r}">${dz.name}</b>!`, 'crit');
        }
      }
      // materiał: Shark Fin (epic) – 5% przy KAŻDYM złowionym Rekinie (wielokrotnie, łączy się w stos); ulepszenie wędki i haczyka rare → epic
      if (f.id === 'fish_shark' && roll('shark_fin', 5)) { fishing.sharkFin = true; giveMat('shark_fin'); }
      // special drop: talizman Shark Eye Trophy (epic) – 3% przy złowionym Rekinie, jednorazowo (pity: najpóźniej 100. Rekin)
      if (f.id === 'fish_shark' && !fishing.sharkEye && roll('sharkEye', 3)) {
        fishing.sharkEye = true;
        const se = makeFixed('shark_eye'); se.fresh = 1; inv.push(se);
        say(`Found: <b class="t${se.r}">${se.name}</b>!`, 'crit');
      }
      // materiał: Pearl of the Deep (legendary) – 5% przy KAŻDYM złowionym Lewiatanie (wielokrotnie, łączy się w stos)
      if (f.id === 'fish_leviathan' && roll('pearl_of_the_deep', 5)) { fishing.deepPearl = true; giveMat('pearl_of_the_deep'); }
      // special dropy: komplet Sea King (legendary) – po 2% przy złowionym Lewiatanie, każda część jednorazowo
      for (const [key, flag] of KING_SET) {
        if (f.id === 'fish_leviathan' && !fishing[flag] && roll(flag, 2)) {
          fishing[flag] = true;
          const it = makeFixed(key); it.fresh = 1; inv.push(it);
          say(`Found: <b class="t${it.r}">${it.name}</b>!`, 'crit');
        }
      }
      // special drop: unikat Abyssal Lure Hood – 1% przy złowionym Lewiatanie, jednorazowo
      if (LURE_HOOD_ON && f.id === 'fish_leviathan' && !fishing.lureHood && roll('lureHood', 1)) {   // TYMCZASOWO wyłączony
        fishing.lureHood = true;
        const st = makeUnique('lure_hood'); st.fresh = 1; inv.push(st);
        say(`Found: <b class="t${st.r}">${st.name}</b>!`, 'crit');
      }
      say(`Caught: <b class="t${MATS[f.id].r || 0}">${f.name}</b>`);
      // efekty: najpierw ryba, potem wszystko inne, co przybyło w plecaku (special dropy, materiały, haczyk…)
      if (snap) {
        const ev = [{ k: 'fish', id: f.id, n: nFish, name: f.name, r: MATS[f.id].r || 0 }];
        inv.forEach(x => { if (x.mat && x.sl === f.id) return; const q = (x.qty || 1) - (snap.has(x) ? snap.get(x) : 0); if (q <= 0) return;
          if (byId && x.mat && x.sl === byId) { ev.push({ k: 'bycatch', id: byId, name: x.name, r: x.r || 0 }); if (q > 1) ev.push({ k: 'item', it: x, qty: q - 1 }); }   // bycatch: osobny efekt (mała lecąca ryba)
          else ev.push({ k: 'item', it: x, qty: q }); });
        fxQueue.unshift(...ev);
      }
    }
    // następna ryba: przy łowieniu na żywo (spóźnienie < 1 s) pasek startuje od zera TERAZ;
    // przy nadrabianiu zaległych ryb (karta była w tle) liczymy dalej od czasu poprzedniego brania, żeby nie zgubić ryb
    scheduleCatch(!offline && Date.now() - fishing.nextAt < 1000 ? Date.now() : fishing.nextAt);
  }
  return caught;
}

function updateFishUI() {
  const bar = $('fish-prog'), info = $('fish-info');
  if (!bar || !info) return;
  if (fishing.active) {
    const p = Math.min(1, Math.max(0, (Date.now() - fishing.startAt) / (fishing.nextAt - fishing.startAt)));
    bar.style.width = (p * 100) + '%';
    bar.parentElement.classList.toggle('tense', p > 0.9);   // ostatnie 10% paska: „napięta żyłka” (drganie)
    const txt = `Next fish in: ${Math.max(0, Math.ceil((fishing.nextAt - Date.now()) / 1000))} s`;
    if (info.textContent !== txt) info.textContent = txt;
    // ryba pulsuje od wylosowanego momentu do złowienia (chyba że gracz już ją kliknął)
    const av = $('fish-avatar'), on = !!fishing.pulseAt && !fishing.pulseDone && Date.now() >= fishing.pulseAt;
    if (av && av.classList.contains('pulse') !== on) { av.classList.toggle('pulse', on); const fr = av.querySelector('.fish-av-frame'); if (fr) fr.title = on ? 'Click to get a Fishing Guide!' : 'Click to stop fishing'; }
  } else {
    bar.style.width = '0';
    bar.parentElement.classList.remove('tense');
    const av = $('fish-avatar'); if (av) av.classList.remove('pulse');   // bez łowienia ryba nigdy nie świeci
    info.textContent = '';
  }
}

function toggleFishing() {
  if (!eq2['weapon'] || !eq2['weapon'].isFishGear) {
    // powiadomienie zostaje do kliknięcia X (jak przy Lochach)
    setShowNoRodMsg(true); render();
    return;
  }
  // start łowienia tylko przy wystarczającym FP dla zaznaczonej ryby (DEV: bez wymagań)
  const selF = FISH.find(x => x.id === fishing.sel);
  if (!fishing.active && !canFish(selF)) {
    say(`Not enough FP to catch ${selF ? selF.name : 'this fish'} (requires ${selF ? selF.fp : 0} FP, you have ${fishPower()} FP).`, 'miss');
    return;
  }
  fishing.active = !fishing.active;
  if (fishing.active) { setShowNoRodMsg(false); scheduleCatch(); say('Started fishing...', 'miss'); }
  else say('Stopped fishing.', 'miss');
  render();
}

// nowy przedmiot trafia do slotu, a stary wraca w to samo miejsce plecaka
function swapIn(n, eqObj, i) {
  if (i.req && me.lvl < i.req) { say(`<b class="t${i.r}">${i.name}</b> requires level ${i.req}.`, 'miss'); render(); return; }   // wymagany poziom postaci
  const old = eqObj[i.sl];
  eqObj[i.sl] = i;
  if (old) inv.splice(n, 1, old); else inv.splice(n, 1);
  render();
}

function equip(n) {
  if (busy) return; const i = inv[n]; if (!i || i.mat) return;
  if (i.isScroll) { useScroll(n); return; }
  if (i.isFood) { eatFood(n); return; }   // danie: zjedzenie = buff do maks. HP
  if (i.isChest) { openChest(n); return; }   // Sunken Chest: otwarcie (1 sztuka)
  if (i.isRecipe) {   // przepis: uczy gotowania dania w zakładce Cooking i znika z plecaka (jeśli już znany – nic się nie dzieje)
    if (knowsRecipe(i.kind)) { say(`You already know this recipe.`, 'miss'); return; }
    fishing.recipes = fishing.recipes || {}; fishing.recipes[i.kind] = true; newRecipes.add('cook:' + i.kind);   // przebłysk na wierszu przepisu
    inv.splice(n, 1);
    say(`Learned: <b class="t${i.r}">${DISHES[i.kind].name}</b> – now cookable in Cooking!`, 'crit');
    render(); flashNav('cook'); return;
  }
  if (i.isGuide) {   // Fishing Guide: zużywa 1 sztukę, +1 Fishing Skill Point
    if (i.qty > 1) i.qty--; else inv.splice(n, 1);
    fishing.sp = (fishing.sp || 0) + 1;
    say(`Read: <b class="t${i.r}">${i.name}</b> – +1 Fishing Skill Point (now ${fishing.sp}).`, 'crit');
    render(); return;
  }
  if (i.isDesign) {   // projekt: uczy przepisu w craftingu i znika z plecaka (jeśli już znany – nic się nie dzieje)
    if (knowsDesign(i.kind)) { say(`You already know this design.`, 'miss'); return; }
    fishing.designs = fishing.designs || {}; fishing.designs[i.kind] = true; newRecipes.add('gear:' + i.kind);   // przebłysk na wierszu przepisu
    inv.splice(n, 1);
    say(`Learned: <b class="t${FIXED_ITEMS[i.kind].r}">${FIXED_ITEMS[i.kind].name}</b> – now craftable in Crafting → Fishing Gear!`, 'crit');
    render(); flashNav('craft'); return;
  }
  delete i.fresh;
  if (equipPage === 2) {
    if (!i.isFishGear) return;
    swapIn(n, eq2, i); return;
  }
  // sprzęt wędkarski kliknięty na stronie 1 → przełącz ekwipunek na stronę 2 (kolejne kliknięcie zakłada przedmiot)
  if (i.isFishGear) { setEquipPage(2); render(); return; }
  swapIn(n, eq1, i);
}

function unequip(s) {
  if (busy || (fishing.active && equipPage === 2 && s === 'weapon')) {
    if (fishing.active && equipPage === 2 && s === 'weapon') {
      say('You cannot remove the rod while fishing!', 'miss');
    }
    return;
  }
  const currentEq = (equipPage === 1) ? eq1 : eq2;
  if (!currentEq[s]) return; inv.push(currentEq[s]); delete currentEq[s]; render();
}

function sell(n, from) {   // from = miejsce sprzedaży: przycisk Sell przy upuszczeniu; przy kliknięciu w trybie Sell – komórka przedmiotu
  const i = inv[n]; if (!i || i.noSell) return;
  const cell = document.querySelector(`#inv [data-n="${n}"]`), rc = from || (cell ? cell.getBoundingClientRect() : null), g = price(i);   // pozycja przed odświeżeniem plecaka
  if (rc) holdGold = holdGold ?? window.G_GLOBAL;   // panel Gold czeka, aż monety dolecą
  window.G_GLOBAL += g; if (i.qty > 1) i.qty--; else inv.splice(n, 1); render();
  if (rc) flyCoins(rc, g);
}
// SPRZEDAŻ: monety wylatują z miejsca sprzedanego przedmiotu prosto do panelu Gold (jak nagroda za walkę); panel podskakuje, „+złoto”
function flyCoins(rc, gold) {
  const target = $('gold'); if (!target || !target.offsetParent) { releaseGold(); return; }
  const b = target.getBoundingClientRect(), n = Math.max(1, Math.min(5, Math.round(1 + gold / 40))), size = 32;
  setTimeout(releaseGold, 1500);
  for (let k = 0; k < n; k++) {
    const e = document.createElement('div'); e.className = 'fx-fly'; e.style.width = e.style.height = size + 'px'; e.innerHTML = goldIco(32);
    const sx = rc.left + rc.width / 2 - size / 2 + (Math.random() - .5) * 20, sy = rc.top + rc.height / 2 - size / 2 + (Math.random() - .5) * 20;
    const tx = b.right - 28 - size / 2 + (Math.random() - .5) * 16, ty = b.top + b.height / 2 - size / 2;
    e.style.left = sx + 'px'; e.style.top = sy + 'px'; e.style.opacity = '0'; fxLayer().appendChild(e);
    e.animate([{ transform: 'translate(0,0) scale(.8)', opacity: 0 }, { transform: `translate(${(tx - sx) * .08}px,${(ty - sy) * .08}px) scale(1)`, opacity: 1, offset: .1 },
      { transform: `translate(${tx - sx}px,${ty - sy}px) scale(.7)`, opacity: .9 }], { duration: 595, delay: k * 49, easing: 'ease-in', fill: 'both' }).onfinish = () => {
      e.remove();
      if (k === n - 1) { releaseGold(); const el = $('gold'); el.classList.remove('rwpop'); void el.offsetWidth; el.classList.add('rwpop'); floatText(`<span style="color:#f2c200">+${gold}</span>`, b.right - 40, b.top - 4); }
    };
  }
}

function buy(k) {
  const c = cost(k); if (busy || window.G_GLOBAL < c) return;
  window.G_GLOBAL -= c; up[k]++; me[k]++; render();
}

function say(t, c) {
  if (sayMute) return;   // postęp offline: bez setek wpisów w logu (podsumowanie pokazuje okno While you were away)
  const p = document.createElement('p'); p.className = c || ''; p.innerHTML = t;
  $('log').appendChild(p);$('log').scrollTop = 1e9;
}

// ===== RDZEŃ WALKI =====
// Jedna logika walki dla prawdziwej walki i dla symulacji (szansa wygranej w DEV). Generator: `yield ms` = pauza animacji.
// io.sim = true → bez ekranu, logu i animacji, przeciwnik zawsze z prawdziwym HP; wynik w io.res = { ph, mh, rounds }.
const sayOut = (t, c) => say(t, c), rPBOut = b => renderPBuffs(b), rDBOut = d => renderDebuffs(d);
function* fightGen(mob, io) {
    const UI = !io.sim, p = der(io.over), M = mstats(mob, io.sim), fp = UI ? $('fp') : null, fm = UI ? $('fm') : null;
    const say = UI ? sayOut : () => {}, renderPBuffs = UI ? rPBOut : () => {}, renderDebuffs = UI ? rDBOut : () => {};   // symulacja: bez ekranu i logu
    p.lvl = me.lvl; M.lvl = mob.l;   // poziomy do wzoru pancerza (redukcja liczona od poziomu atakującego)
    // kto zaczyna: "Surprise Attack" = zawsze Ty; inaczej większa Zręczność (remis = losowo)
    let turn;
    if (upgTree.centerHp) { turn = 0; }
    else if (p.dex !== M.dex) { turn = p.dex > M.dex ? 0 : 1; }
    else { turn = Math.random() < .5 ? 0 : 1; }
    let ph = p.hp, mh = frailHp(M.hp), rounds = 0;   // Curse of Frailty: wróg zaczyna z obniżonym HP (maks. HP bez zmian)
    // ELEMENTAL BARRIER: tarcza = % maks. HP (3.33% za rangę); obrażenia od wroga najpierw zdejmują tarczę, potem zdrowie
    let sh = Math.round(p.hp * (ub().barrier || 0) / 100);
    const barTot = p.hp + sh;   // skala paska HP gracza na całą walkę: maks. HP + tarcza ze startu (tarcza = dodatkowe zdrowie)
    if (UI) live = { mob, M, hp: mh };   // panel ℹ️ czyta stąd aktualne statystyki wroga
    // pasek HP gracza: stała skala = maks. HP + tarcza ze startu – tarcza działa jak dodatkowe zdrowie (niebieska końcówka skraca się jak HP);
    // napis = HP + tarcza / maks. HP (np. 1100/1000)
    const upd = !UI ? () => {} : () => { if (live) { live.hp = Math.max(0, mh); renderInfo(mob); } { const hw = Math.max(0, ph) / barTot * 100; $('hp1').style.width = hw + '%'; $('sh1').style.left = hw + '%'; $('sh1').style.width = sh / barTot * 100 + '%'; } $('hp2').style.width = Math.max(0, mh / M.hp * 100) + '%'; $('ht1').textContent = Math.max(0, Math.round(ph + sh)) + '/' + p.hp; $('ht2').textContent = Math.max(0, Math.round(mh)) + '/' + Math.round(M.hp); };
    upd(); say(`Fight against: ${mob.e} ${mob.n}!`);
    // KLĄTWY (Curses): stan na czas tej jednej walki
    const U = ub(), baseArm = M.arm;
    let sunder = 0, bleed = 0, bleedT = 0, doomSaid = false, firstHit = true;   // firstHit – Determination
    let warcry = U.warcry ? 4 : 0, endured = false;   // War Cry: 4 pierwsze ataki (+15% obrażeń); Endure: raz na walkę
    p.critBonus = U.critBonus || 0;   // Bloodlust: krytyk +10% / 20% / 30% obrażeń
    // SUNDER: zmniejszenie pancerza na cios i limit (w %), liczba stosów = limit / zmniejszenie na cios
    const sPer = U.sunder ? 2 * U.sunder - 1 : 0, sCap = sPer ? 3 * sPer + (U.sunderCap || 0) : 0, sMax = sPer ? Math.floor(sCap / sPer) : 0;
    // EXHAUSTION: po każdym ataku wroga zabiera mu 1% AKTUALNEJ siły. Liczymy tylko, ile razy zadziałało (stosy),
    // a odjętą siłę liczymy na bieżąco. Obrażenia wroga = Siła×0.6 + 2, więc ciosy słabną proporcjonalnie.
    // TERROR (kontynuacja Withering): cała siła zabrana przez Withering trafia do bohatera (buff gracza).
    const eStr0 = M.str, eMin0 = M.min, eMax0 = M.max, pMin0 = p.min, pMax0 = p.max;
    let exhaust = 0;
    const strNow = () => eStr0 * (1 - (U.exhaust || 0) / 100) ** exhaust;   // aktualna siła wroga (Withering: 0.33% za rangę)
    const exLost = () => eStr0 - strNow();          // ile siły zabrało Withering
    const applyStr = () => {
      if (U.reap) { p.min = pMin0 + exLost() * p.strDmg * p.wmin; p.max = pMax0 + exLost() * p.strDmg * p.wmax; }   // Terror: obrażenia za punkt siły jak Twoja Strength
    };
    const fmt = v => v.toFixed(1);
    const pbuf = {};   // buffy gracza w walce (lewy górny róg okna walki)
    if (warcry) pbuf.warcry = { st: warcry, tip: `Damage +15%<br>Attacks left: ${warcry}` };   // War Cry widoczny od początku walki
    if (sh > 0) say(`<b>Elemental Barrier:</b> shield of ${sh}.`, 'miss');
    // LIGHTNING BOLT: Lightning Energy – 1 stos na start, +1 po każdym Twoim ataku; przy 5 – piorun i powrót do 1
    // COMBUSTION: Fire Energy – +1 stos po każdym Twoim krytyku; przy 5 wybuch (5% / 10% / 15% maks. HP wroga) i 0 stosów.
    // LINGERING FLAMES: wybuch podpala wroga – Burning: 1% maks. HP wroga na początku każdej jego tury, przez 5 tur (nowy wybuch odnawia 5 tur)
    let fire = ub().fire ? 1 : 0, burnT = 0;   // Fire Energy: 1 stos na start (jak Lightning), po wybuchu wraca do 1
    // TIDAL RENEWAL: Water Energy – +1 stos za każdy atak wroga; przy 5 leczenie (2% / 4% / 6% maks. HP), stosy wracają do 0.
    // SOOTHING TIDE: leczenie daje +40% pancerza na 2 kolejne ataki wroga (tideT = ile ataków zostało)
    let water = ub().water ? 1 : 0, tideT = 0;   // Water Energy: 1 stos na start, po leczeniu wraca do 1
    const pArm0 = p.arm;
    // MASTER OF ALL ELEMENTS: Incantations (Lightning / Fire / Water) przy 4 stosach zamiast 5
    const EN = ub().elemMaster ? 4 : 5;
    const waterTip = () => `Stacks: ${water}/${EN}<br>At ${EN} stacks you heal for ${+(ub().water || 0).toFixed(2)}% of your maximum health`;
    const fireTip = () => `Stacks: ${fire}/${EN}<br>At ${EN} stacks they detonate for ${+(ub().fire || 0).toFixed(2)}% of the enemy maximum health`;
    let bolt = ub().bolt ? 1 : 0, boltN = 0, boltTip = () => `Stacks: ${bolt}/${EN}<br>At ${EN} stacks a lightning bolt strikes your enemy`;
    if (bolt) pbuf.bolt = { st: bolt, tip: boltTip() };
    // Fire / Water Energy: ikona od początku walki (0 stosów), po wybuchu / leczeniu wraca do „0” zamiast znikać – nic nie przeskakuje
    if (U.fire) pbuf.fire = { st: fire, tip: fireTip() };
    if (U.water) pbuf.water = { st: water, tip: waterTip() };
    renderPBuffs(pbuf);
    // odświeża ikonę Withering na wrogu i (jeśli kupiony) Terror na graczu – te same stosy, ta sama siła
    const strTips = () => {
      deb.exhaust = { st: exhaust, tip: `Strength: -${fmt(exLost())}` };
      curses();
      if (U.reap) { pbuf.reap = { st: exhaust, tip: `Strength: +${fmt(exLost())}` }; renderPBuffs(pbuf); }
    };
    const bleedMax = U.fester ? 3 : 1, bleedDur = U.fester ? 4 : 3;   // Festering Wounds: do 3 stosów, +1 tura
    const bleedInfo = () => ({ st: bleedMax > 1 ? bleed : 0, tip: `Loses ${3 * bleed}% of max health per turn<br>Turns left: ${bleedT}` });
    p.critPen = U.rend ? 0.5 : 0;   // Soul Sunder: krytyk ignoruje 50% pancerza
    // MARK OF SHADOWS: każdy Twój cios +U.mark% szansy na krytyk (maks. 5 stosów), może przekroczyć limit 50%
    // szansa na krytyk w walce = min(limit 50%, wzór z Dexterity i poziomu) + Curse of the Void
    // RAGE WITHIN: rage = liczba Twoich krytyków w tej walce; każdy daje +U.rage% obrażeń broni (1% / 2% / 3% za rangę)
    let mark = 0, critCap = CRIT_CAP, rage = 0, fervor = 0;
    const updCrit = () => { p.crit = Math.min(critCap, p.critRaw) + (p.critSet || 0) + (U.mark || 0) * mark; };   // + bonus setowy (ponad limit)
    // aktywne debuffy na wrogu (ikony w rogu okna walki)
    const deb = {};
    // STATYSTYKI WROGA liczone od nowa po każdej zmianie klątw: Sunder (pancerz), Withering (siła → obrażenia), Torment (wszystko)
    // AGONY: za każdą klątwę na wrogu (ikona debuffu) −10% jego statystyk: Strength, obrażenia, Dexterity, Armor, Crit chance
    // MIST VEIL: szansa wroga na krytyk −3 / −6 / −9 pkt proc. (min. 0%) – od początku walki
    M.crit = Math.max(0, M.crit - (U.critDown || 0));
    const eDex0 = M.dex, eCrit0 = M.crit;
    const agF = () => U.agony ? Math.max(0, 1 - 0.1 * Object.keys(deb).filter(k => k !== 'expose').length) : 1;   // ikona Exposed Weakness nie jest klątwą
    const recalcEnemy = () => {
      const ag = agF(), k = (strNow() * 0.6 + 2) / (eStr0 * 0.6 + 2);
      M.arm = baseArm * (1 - sPer * sunder / 100) * ag;
      M.min = eMin0 * k * ag; M.max = eMax0 * k * ag;
      M.str = strNow() * ag; M.dex = eDex0 * ag; M.crit = eCrit0 * ag;   // M.str / M.dex – dla panelu ℹ️
    };
    // po każdej zmianie klątw: przelicz wroga i odśwież ikony debuffów (Torment działa bez własnej ikony na pasku buffów)
    const curses = () => { recalcEnemy(); renderDebuffs(deb); };
    renderDebuffs(deb);
    say(upgTree.centerHp ? 'You strike first (Surprise Attack).' : turn === 0 ? `You strike first (Dexterity ${p.dex} vs ${Math.round(M.dex)}).` : `${mob.n} strikes first (Dexterity ${Math.round(M.dex)} vs ${p.dex}).`, 'miss');
    while (ph > 0 && mh > 0 && rounds++ < 200) {   // limit 200 rund (było 120) – długie walki z przeciwnikami Aktu 3
      yield 325;
      if (turn == 0) {
        // Death Sentence: wróg poniżej 20% HP – każdy Twój cios ma szansę go zabić (6.67% za rangę, 20% przy 3/3)
        const doom = U.doom && mh < M.hp * 0.2;
        if (doom && !doomSaid) { doomSaid = true; deb.doom = { tip: `${+U.doom.toFixed(2)}% chance to kill on hit` }; curses(); }
        const execute = doom && Math.random() * 100 < U.doom;
        let A = execute ? Object.assign({}, p, { force: Math.ceil(mh), forceTag: 'DEATH SENTENCE!' }) : p;
        // Determination: pierwszy Twój atak w walce zadaje +10% / 20% / 30% obrażeń
        // War Cry: +15% obrażeń przy 4 pierwszych atakach
        if (warcry > 0) {
          A = Object.assign({}, A, { min: A.min * 1.15, max: A.max * 1.15 }); warcry--;
          if (warcry) pbuf.warcry = { st: warcry, tip: `Damage +15%<br>Attacks left: ${warcry}` }; else delete pbuf.warcry;
          renderPBuffs(pbuf);
        }
        if (firstHit && U.firstDmg) { const f = 1 + U.firstDmg / 100; A = Object.assign({}, A, { min: A.min * f, max: A.max * f }); }
        // Battle Fervor: +U.fervor% obrażeń za każdy wcześniejszy cios w walce (maks. 5 stosów)
        if (rage && U.rage) { const f = 1 + U.rage * rage / 100; A = Object.assign({}, A, { min: A.min * f, max: A.max * f }); }   // Rage Within
        if (fervor) { const f = 1 + U.fervor * fervor / 100; A = Object.assign({}, A, { min: A.min * f, max: A.max * f }); }
        // Exposed Weakness: min. 2 klątwy na wrogu (Burning się nie liczy) → +U.expose% obrażeń; ikona na wrogu, gdy aktywne
        if (U.expose) {
          const on = Object.keys(deb).filter(k => k !== 'expose' && k !== 'burn').length >= 2;
          if (on && !deb.expose) { deb.expose = { tip: `Takes ${U.expose}% more damage from you (2+ curses)` }; curses(); }
          else if (!on && deb.expose) { delete deb.expose; curses(); }
          if (on) { const f = 1 + U.expose / 100; A = Object.assign({}, A, { min: A.min * f, max: A.max * f }); }
        }
        firstHit = false;
        { const dm = hit('You', mob.n, A, M, fp, (t, c) => say(t, c)); mh -= dm; if (UI) dmgPop(fm, dm, hit.crit, 'out'); }   // fp = Twoja postać wyskakuje do ataku; liczba obrażeń nad wrogiem
        // Rage Within: każdy Twój krytyk +U.rage% obrażeń broni do końca walki (działa od następnego ciosu)
        if (U.rage && hit.crit && U.rage * (rage + 1) <= 30) { rage++; pbuf.rage = { st: rage, tip: `Weapon damage +${U.rage * rage}% (max 30%)` }; renderPBuffs(pbuf); }   // limit +30%
        // Lightning Bolt: +1 stos po ataku; przy 5 stosach piorun (15% / 30% / 45% średnich obrażeń, bez redukcji pancerza), potem 1 stos
        if (bolt && mh > 0) {
          bolt++;
          if (bolt >= EN) {
            // KOLEJNOŚĆ: najpierw zwykły cios (liczba + pasek HP wroga), lekka pauza, dopiero potem piorun
            upd(); pbuf.bolt = { st: EN, tip: boltTip() }; renderPBuffs(pbuf);
            yield 450;   // gracz widzi skutek zwykłego ataku i pełne stosy, zanim uderzy piorun
            // Overcharge: każdy kolejny piorun o U.boltGrow% mocniejszy od POPRZEDNIEGO (mnoży się: przy 1/3 – ×1, ×1.2, ×1.44 …)
            const bd = Math.max(1, Math.round((p.min + p.max) / 2 * U.bolt / 100 * (1 + (U.boltGrow || 0) / 100) ** boltN)); boltN++;
            if (UI) { boltFx(fm); yield 55; }   // animacja pioruna (2× szybsza) – obrażenia w chwili trafienia
            mh -= bd; if (UI) dmgPop(fm, bd, false, 'bolt');
            say(`<b>Lightning Incantation</b> strikes ${mob.n} for <b>${bd}</b> damage!`, 'crit');
            bolt = 1; upd();
            yield 210;   // piorun gaśnie (~0.25 s), zanim walka pójdzie dalej
          }
          pbuf.bolt = { st: bolt, tip: boltTip() }; renderPBuffs(pbuf);
        }
        // Fire Incantation: krytyk → +1 Fire Energy; przy 5 (4 z Master of All Elements) – wybuch za U.fire% maks. HP wroga, potem 1 stos (+ Lingering Flames: Burning na 5 tur)
        if (U.fire && hit.crit && mh > 0) {
          fire++;
          if (fire >= EN) {
            // KOLEJNOŚĆ: zwykły cios (krytyk) → lekka pauza → wybuch Fire Energy (po piorunie, jeśli oba w tej samej turze)
            upd(); pbuf.fire = { st: EN, tip: fireTip() }; renderPBuffs(pbuf);
            yield 450;
            const fd = Math.max(1, Math.round(M.hp * U.fire / 100));
            mh -= fd; if (UI) { fireFx(fm); dmgPop(fm, fd, false, 'fire'); }
            say(`<b>Fire Energy detonates</b> on ${mob.n} for <b>${fd}</b> damage!`, 'crit');
            fire = 1;
            if (U.burn && mh > 0) { burnT = 5; deb.burn = { st: burnT, tip: `Loses 1% of max health per turn<br>Turns left: ${burnT}` }; curses(); say(`${mob.n} is <b>Burning</b>!`, 'crit'); }
            upd();
            yield 480;   // kula ognia (~0.55 s)
          }
          pbuf.fire = { st: fire, tip: fireTip() };
          renderPBuffs(pbuf);
        }
        // Battle Fervor: stos po każdym ciosie (działa od następnego)
        if (U.fervor && fervor < 5) { fervor++; pbuf.fervor = { st: fervor, tip: `Damage +${U.fervor * fervor}% (${fervor}/5)` }; renderPBuffs(pbuf); }
        // Sunder: każdy Twój cios zdejmuje sPer% pancerza wroga (ranga 1/2/3: 1% / 3% / 5%), maks. 3 stosy (3% / 9% / 15%);
        // (Exposed Weakness nie zmienia już limitu – daje +15% obrażeń przy min. 2 klątwach)
        if (sPer && sunder < sMax && mh > 0) { sunder++; deb.sunder = { st: sunder, tip: `Armor -${sPer * sunder}% (${sunder}/${sMax})` }; curses(); }
        // Curse of the Void: stos po każdym Twoim ciosie (działa od następnego ciosu)
        if (U.mark && mark < 5 && mh > 0) { mark++; updCrit(); deb.mark = { st: mark, tip: `Your critical hit chance against the enemy: +${U.mark * mark}% (${mark}/5)` }; curses(); }
        // Lacerate: krytyk = krwawienie (z Festering Wounds stosy się sumują)
        if (U.lacerate && hit.crit && mh > 0) { bleed = Math.min(bleedMax, bleed + 1); bleedT = bleedDur; deb.bleed = bleedInfo(); renderDebuffs(deb); }

      } else {
        // krwawienie zadaje obrażenia na początku tury wroga: 3% maks. HP za każdy stos
        // Burning (Lingering Flames): 1% maks. HP wroga na początku jego tury, 5 tur
        if (burnT > 0) {
          const bd = Math.max(1, Math.round(M.hp * 0.01));
          mh -= bd; burnT--; if (UI) dmgPop(fm, bd, false, 'burn');
          if (burnT) deb.burn = { st: burnT, tip: `Loses 1% of max health per turn<br>Turns left: ${burnT}` }; else delete deb.burn;
          curses(); upd();
          if (mh <= 0) break;
          yield 280;   // liczba Burning widoczna, zanim wróg zaatakuje
        }
        if (bleedT > 0) {
          const bd = Math.max(1, Math.round(M.hp * 0.03 * bleed));
          mh -= bd; bleedT--; if (!bleedT) bleed = 0; if (UI) dmgPop(fm, bd, false, 'bleed');
          if (bleed) deb.bleed = bleedInfo(); else delete deb.bleed;   // krwawienie minęło – ikona znika
          renderDebuffs(deb); upd();
          if (mh <= 0) break;
        }
        { const dm = hit(mob.n, 'You', M, p, fm, (t, c) => say(t, c));
          // Elemental Barrier: tarcza pochłania obrażenia (najpierw tarcza, potem zdrowie)
          const ab = Math.min(sh, dm); if (ab > 0) { sh -= ab; say(`Elemental Barrier absorbs <b>${ab}</b>${sh ? ` (${sh} left)` : ' – the shield breaks!'}`, 'miss'); }
          ph -= dm - ab;
          if (UI) { if (ab) dmgPop(fp, ab, false, 'shield'); if (!ab || dm > ab) dmgPop(fp, dm - ab, hit.crit, 'in'); } }   // pochłonięte – niebieska liczba   // fm = wróg wyskakuje do ataku; liczba obrażeń nad Tobą
        // Endure: pierwszy raz, gdy HP spadnie do zera – powrót z 30% maks. HP (raz na walkę)
        if (ph <= 0 && U.endure && !endured) {
          endured = true; ph = 0; upd();                    // pasek zatrzymuje się na 0…
          yield 500;
          say('<b>Endure!</b> You rise again with 30% of your health.', 'crit');
          const target = Math.round(p.hp * 0.3);              // …i stopniowo wypełnia się do 30%
          for (let i = 1; i <= 8; i++) { ph = Math.round(target * i / 8); upd(); yield 35; }
        }
        // Soothing Tide: po każdym ataku wroga −1 tura buffa; koniec → pancerz wraca do normy
        if (tideT > 0) { tideT--; if (tideT) pbuf.tide = { st: tideT, tip: `Armor +${U.tide}%<br>Turns left: ${tideT}` }; else { delete pbuf.tide; p.arm = pArm0; } renderPBuffs(pbuf); }
        // Water Incantation: atak wroga → +1 Water Energy; przy 5 (4 z Master of All Elements) – leczenie (nie ponad maks. HP), potem 1 stos
        if (U.water && ph > 0) {
          water++;
          if (water >= EN) {
            // KOLEJNOŚĆ: atak wroga (liczba + pasek HP) → lekka pauza → leczenie
            upd(); pbuf.water = { st: EN, tip: waterTip() }; renderPBuffs(pbuf);
            yield 450;
            const hv = Math.max(0, Math.min(p.hp - ph, Math.max(1, Math.round(p.hp * U.water / 100))));
            if (UI) { healFx(fp); dmgPop(fp, hv, false, 'heal'); }
            // pasek HP i liczba wypełniają się stopniowo (8 kroków, ~0.3 s) – jak przy Endure; symulacja od razu
            { const h0 = ph; if (UI) for (let i = 1; i <= 8; i++) { ph = Math.round(h0 + hv * i / 8); upd(); yield 35; } ph = h0 + hv; }
            say(`<b>Water Energy</b> heals you for <b>${Math.max(0, hv)}</b> health.`, 'crit');
            water = 1;
            if (U.tide) { tideT = 2; p.arm = pArm0 * (1 + U.tide / 100); pbuf.tide = { st: tideT, tip: `Armor +${U.tide}%<br>Turns left: ${tideT}` }; }   // Soothing Tide: +40% pancerza
            upd();
            yield 380;   // poświata leczenia
          }
          pbuf.water = { st: water, tip: waterTip() };
          renderPBuffs(pbuf);
        }
        // Withering: po każdym swoim ataku wróg traci 1% aktualnej siły
        if (U.exhaust && ph > 0) {
          exhaust++; applyStr(); strTips();
        }
      }
      turn ^= 1; upd();
    }
    io.res = { ph, mh, rounds }; io.upd = upd;
}

// SZANSA WYGRANEJ (tylko DEV): 300 symulowanych walk tą samą logiką co prawdziwa walka (fightGen), przeciwnik z prawdziwym HP.
// Wynik zapamiętany, dopóki nie zmienią się Twoje statystyki / skille / buffy (klucz = statystyki + drzewko).
let winCache = {}, winKey = '', winHp = {};
function winChance(mob, over) {   // over = podmieniony slot (porównywarka przedmiotów w DEV)
  const d = der(), key = JSON.stringify([d, me.lvl, upgTree]);
  if (key !== winKey) { winKey = key; winCache = {}; winHp = {}; }
  const id = mob.n + '|' + mob.l + (over ? '|' + JSON.stringify(over) : '');
  if (winCache[id] !== undefined) return winCache[id];
  const N = 300, maxHp = der(over).hp; let w = 0, hpLeft = 0;
  for (let n = 0; n < N; n++) { const io = { sim: true, over }; for (const _ of fightGen(mob, io)); if (io.res.ph > 0) { w++; hpLeft += Math.min(1, io.res.ph / maxHp); } }
  winHp[id] = w ? hpLeft / w : 0;   // średnio ile HP zostaje po wygranej (0–1) – do koloru „szary”
  return (winCache[id] = Math.round(w / N * 100));
}
// TRUDNOŚĆ (kolor poziomu „Lv X”): szary – bardzo słaby (≥99% wygranych i średnio >80% HP zostaje), zielony ≥80%, żółty 40–80%, czerwony <40%
function diffColor(mob) {
  const w = winChance(mob), h = winHp[mob.n + '|' + mob.l] || 0;
  return w >= 99 && h > 0.8 ? 'var(--mut)' : w >= 80 ? '#2fae3f' : w >= 40 ? '#d49a00' : '#e53935';
}
const winTag = m => DEV ? (() => { const w = winChance(m); return `<span class="mwin" style="color:${w >= 80 ? '#3fdc3f' : w >= 40 ? '#e6a700' : '#e53935'}">${w}%</span>`; })() : '';

// LICZBY OBRAŻEŃ: nad trafioną postacią wylatuje „37” (bez minusa) i znika w górę. Twoje ciosy – białe, ciosy wroga w Ciebie – czerwone,
// krwawienie – małe ciemnoczerwone. KRYTYK: „37!”, większy i grubszy, w kolorze zwykłego ciosu (żółty = piorun), widoczny dłużej (1,6 s zamiast 1 s). Przy Skip – bez liczb.
// LASERY do Master of All Elements (drzewko skilli): pulsująca poświata kupionych promieni
document.head.insertAdjacentHTML('beforeend', '<style>.laserpulse{animation:laserpulse 1.4s ease-in-out infinite}@keyframes laserpulse{0%,100%{opacity:.2;stroke-width:20px}50%{opacity:.5;stroke-width:32px}}'
  + '.laserflow{animation:laserflow .6s linear infinite}@keyframes laserflow{to{stroke-dashoffset:-40}}'
  + '.laserspark{animation:laserspark .9s ease-in-out infinite}@keyframes laserspark{0%,100%{opacity:.6}50%{opacity:1}}</style>');
// ANIMACJA PIORUNA (Lightning Bolt): zygzak z góry okna walki prosto w przeciwnika – żółto-biały, z poświatą;
// 2 mignięcia, potem gaśnie (~0.5 s). Przeciwnik na moment rozbłyskuje na biało. Przy Skip – bez animacji.
document.head.insertAdjacentHTML('beforeend', '<style>'
  + '.boltfx{position:fixed;pointer-events:none;z-index:69;overflow:visible;animation:boltfx .25s linear forwards}'   // 2× szybciej (było 0.5 s)
  + '@keyframes boltfx{0%{opacity:0}8%{opacity:1}22%{opacity:.25}34%{opacity:1}70%{opacity:.9}100%{opacity:0}}'
  + '.boltflash{position:fixed;pointer-events:none;z-index:68;border-radius:50%;background:radial-gradient(circle,#fffbe0cc 0%,#ffe45c66 35%,transparent 70%);animation:boltflash .23s ease-out forwards}'
  + '@keyframes boltflash{0%{opacity:0;transform:scale(.4)}15%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.3)}}'
  + '.fig.zap{filter:brightness(2.6) saturate(.3) drop-shadow(0 0 8px #ffe45c);transition:filter .05s}'
  + '</style>');
// WYBUCH FIRE ENERGY (Combustion): pomarańczowo-czerwona kula ognia rozszerzająca się na przeciwniku + czerwony błysk sprite'a
document.head.insertAdjacentHTML('beforeend', '<style>'
  + '.firefx{position:fixed;pointer-events:none;z-index:68;border-radius:50%;background:radial-gradient(circle,#fff3c4 0%,#ffb12b 25%,#ff5a1a 50%,#c0180088 68%,transparent 75%);animation:firefx .55s ease-out forwards}'
  + '@keyframes firefx{0%{opacity:0;transform:scale(.2)}15%{opacity:1;transform:scale(.8)}100%{opacity:0;transform:scale(1.5)}}'
  + '.fig.burnfx{filter:brightness(1.6) sepia(1) saturate(4) hue-rotate(-20deg);transition:filter .05s}'
  + '</style>');
// LECZENIE (Water Energy): zielono-niebieska poświata na postaci gracza
document.head.insertAdjacentHTML('beforeend', '<style>.fig.healfx{filter:drop-shadow(0 0 10px #3fdc6f) drop-shadow(0 0 4px #5aa9ff) brightness(1.25);transition:filter .1s}</style>');
function healFx(fig) {
  if (!fig || !fig.offsetParent || skipFight) return;
  fig.classList.add('healfx'); setTimeout(() => fig.classList.remove('healfx'), 380);
}
function fireFx(fig) {
  if (!fig || !fig.offsetParent || skipFight) return;
  const r = (fig.querySelector('img, .ic') || fig).getBoundingClientRect(), e = document.createElement('div'), fs = Math.max(r.width, r.height) * 1.5;   // rozmiar od sprite'a, nie od całej kolumny
  e.className = 'firefx'; e.style.width = e.style.height = fs + 'px';
  e.style.left = (r.left + r.width / 2 - fs / 2) + 'px'; e.style.top = (r.top + r.height / 2 - fs / 2) + 'px';
  fxLayer().appendChild(e); setTimeout(() => e.remove(), 580);
  fig.classList.add('burnfx'); setTimeout(() => fig.classList.remove('burnfx'), 180);
}
function boltFx(fig) {
  if (!fig || !fig.offsetParent || skipFight) return;
  const r = fig.getBoundingClientRect(), box = $('fightbox').getBoundingClientRect();
  const x = r.left + r.width / 2, yEnd = r.top + r.height * 0.45, yTop = Math.max(box.top + 4, r.top - 120), H = yEnd - yTop, W = 90;
  // zygzak: 7 odcinków z losowym wychyleniem w bok, ostatni punkt dokładnie w przeciwniku; 1 krótka odnoga
  const pts = [[W / 2, 0]];
  for (let i = 1; i < 7; i++) pts.push([W / 2 + (Math.random() - .5) * 46, H * i / 7]);
  pts.push([W / 2, H]);
  const path = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
  const b = pts[3], br = `M${b[0].toFixed(1)} ${b[1].toFixed(1)} L${(b[0] + (Math.random() < .5 ? -1 : 1) * 22).toFixed(1)} ${(b[1] + H * 0.16).toFixed(1)} L${(b[0] + (Math.random() - .5) * 30).toFixed(1)} ${(b[1] + H * 0.27).toFixed(1)}`;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'boltfx'); svg.setAttribute('width', W); svg.setAttribute('height', H);
  svg.style.left = (x - W / 2) + 'px'; svg.style.top = yTop + 'px';
  svg.innerHTML = `<g fill="none" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 6px #ffd84a) drop-shadow(0 0 2px #fff)">`
    + `<path d="${path}" stroke="#3a2600" stroke-width="9" opacity=".55"/><path d="${br}" stroke="#3a2600" stroke-width="6" opacity=".45"/>`   // ciemny obrys – widoczny też na jasnym tle
    + `<path d="${path}" stroke="#ffc400" stroke-width="6"/><path d="${br}" stroke="#ffc400" stroke-width="3.5"/>`
    + `<path d="${path}" stroke="#fffbe0" stroke-width="3"/><path d="${br}" stroke="#fffbe0" stroke-width="1.6"/></g>`;
  const fl = document.createElement('div'); fl.className = 'boltflash';
  const fs = Math.max(r.width, r.height) * 1.2; fl.style.width = fl.style.height = fs + 'px'; fl.style.left = (x - fs / 2) + 'px'; fl.style.top = (yEnd - fs / 2) + 'px';
  fxLayer().appendChild(fl); fxLayer().appendChild(svg);
  fig.classList.add('zap'); setTimeout(() => fig.classList.remove('zap'), 70);
  setTimeout(() => { svg.remove(); fl.remove(); }, 260);
}
const popStack = new Map();   // postać → [czas ostatniej liczby, ile liczb w serii]
function dmgPop(fig, v, crit, kind) {
  if (!fig || !fig.offsetParent || skipFight) return;
  const r = fig.getBoundingClientRect(), e = document.createElement('div');
  // kilka liczb nad tą samą postacią w odstępie < 0.5 s – każda kolejna 24 px wyżej (zamiast nakładać się na siebie)
  const now = performance.now(), ps = popStack.get(fig) || [0, 0], lvl = now - ps[0] < 500 ? Math.min(ps[1] + 1, 4) : 0; popStack.set(fig, [now, lvl]);
  e.className = 'dmgnum ' + (crit ? 'crit ' : '') + kind; e.textContent = (kind === 'heal' ? '+' : '') + Math.round(v) + (crit ? '!' : '');   // bez znaku minus; leczenie z plusem
  e.style.left = (r.left + r.width / 2 + (Math.random() - .5) * 34) + 'px'; e.style.top = (r.top - 14 - lvl * 24) + 'px';   // tuż nad postacią (kolejne w serii wyżej)
  fxLayer().appendChild(e); setTimeout(() => e.remove(), crit ? 1700 : 1100);
}
document.head.insertAdjacentHTML('beforeend', '<style>.dmgnum{position:fixed;z-index:70;transform:translate(-50%,0);font-weight:900;font-size:22px;pointer-events:none;white-space:nowrap;text-shadow:0 2px 0 #000,0 0 4px #000,1px 0 0 #000,-1px 0 0 #000;animation:dmgup 1s ease-out forwards}.dmgnum.out{color:#fff}.dmgnum.shield{color:#5aa9ff}.dmgnum.bolt{color:#ffd84a}.dmgnum.fire{color:#ff7a1a}.dmgnum.burn{color:#ff9a3c;font-size:16px}.dmgnum.heal{color:#3fdc6f}.dmgnum.in{color:#ff5a4f}.dmgnum.bleed{color:#c0392b;font-size:16px}.dmgnum.crit{font-size:34px;letter-spacing:1px;-webkit-text-stroke:1.5px #000;paint-order:stroke fill;text-shadow:0 3px 0 #000,0 0 6px #000,2px 0 0 #000,-2px 0 0 #000;animation:dmgcrit 1.6s ease-out forwards}@keyframes dmgup{0%{opacity:0;transform:translate(-50%,6px) scale(.8)}15%{opacity:1;transform:translate(-50%,-6px) scale(1.05)}70%{opacity:1}100%{opacity:0;transform:translate(-50%,-46px) scale(1)}}@keyframes dmgcrit{0%{opacity:0;transform:translate(-50%,6px) scale(.6)}12%{opacity:1;transform:translate(-50%,-10px) scale(1.35)}25%{transform:translate(-50%,-14px) scale(1.1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-56px) scale(1)}}</style>');

// GRAFIKI PRZECIWNIKÓW: każdy przeciwnik szuka pliku assets/enemies/enemy_<nazwa>.png – nazwa małymi literami,
// spacje i inne znaki → „_” (Falcon → enemy_falcon, Ice Dragon → enemy_ice_dragon, Spider Servant → enemy_spider_servant).
// m.img (jeśli ustawione) ma pierwszeństwo. Brak pliku → stare emoji (m.e); nieudane pliki zapamiętane w MOB_MISS,
// żeby przy kolejnych odświeżeniach ekranu nie pytać serwera ponownie (od razu emoji, bez mrugania).
const mobImg = m => m.img || `enemies/enemy_${m.n.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}.png`;
window.MOB_MISS = window.MOB_MISS || new Set();
// BOHATER: pixel art 32×32 z assets/hero/basic_hero.png (w oknie walki 128 px = ×4, ostre piksele); brak pliku → 🧙
const heroIco = px => `<img src="${ASSETS_DIR}/hero/basic_hero.png" alt="" draggable="false" style="display:block;margin:0 auto;width:${px}px;height:${px}px;object-fit:contain;image-rendering:pixelated" onerror="this.outerHTML='🧙'">`;
const mobIco = (m, px) => MOB_MISS.has(mobImg(m))
  ? `<span class="ic">${m.e}</span>`
  : `<img src="${ASSETS_DIR}/${mobImg(m)}" alt="" draggable="false" style="display:block;margin:0 auto;width:${px}px;height:${px}px;object-fit:contain;image-rendering:pixelated" onerror="MOB_MISS.add('${mobImg(m)}');this.outerHTML='<span class=\\'ic\\'>${m.e}</span>'">`;

// SKIP: w trakcie walki przycisk „Fight!” zamienia się w „Skip ⏭” – reszta walki liczy się natychmiast (bez pauz i bez wpisów ciosów w logu),
// paski HP pokazują wynik końcowy (przegrany 0 HP, zwycięzca – pozostałe HP), potem normalnie nagrody / porażka
let fightOn = false, skipFight = false;
// WYPRAWA – wynik ostatniej walki: { win, loot: [przedmioty], had }. Póki jest ustawiony, nad przyciskiem widać łup,
// a przycisk to „Collect” (wygrana) / „Back” (przegrana): kliknięcie odznacza przeciwnika → wraca wybór przeciwnika.
// Łup trafia do plecaka dopiero po Collect (albo przy każdym innym wyjściu z ekranu wyniku: Back, inny przeciwnik, inna zakładka).
// Do tego czasu leży w me.pendLoot (zapisywane razem z postacią) – po odświeżeniu strony trafia do plecaka przy wczytaniu gry.
let expRes = null;
function deliverLoot(list) {   // łup → plecak: sprzęt jako przedmiot, materiały przez giveMat (doliczane do stosu, bez wpisu w logu)
  for (const it of list || []) { if (it._mk) giveMatQuiet(it._mk); else inv.push(it); }
}
function endExp() {   // zamyka ekran wyniku i oddaje niezebrany łup do plecaka
  if (expRes) deliverLoot(expRes.loot);
  delete me.pendLoot; expRes = null;
}
$('go').onclick = async () => {
  if (fightOn) { if (!skipFight) { skipFight = true; sayMute = true; $('go').disabled = true; } return; }
  if (expRes && view == 'exp') { endExp(); setEsel(-1); setLastMob(null); render(); return; }   // Collect (łup → plecak) / Back; lastMob = null → przy następnym wyborze pełne HP i tarcza
  const mob = curMob(); if (!mob || busy || fishing.active || Date.now() < cdEnd) return;
  if (view == 'dun' && dunCd(DUN.mobs.indexOf(mob)) > 0) return;   // loch: przerwa 1 h po wygranej
  setBusy(true); fightOn = true; skipFight = false; $('log').innerHTML = ''; live = null;   // nowa walka – panel ℹ️ startuje od wartości bazowych
  // try/finally: nawet jeśli w trakcie walki pojawi się błąd, gra zawsze odblokuje klikanie (busy = false)
  try {
    render();
    const io = { sim: false };
    for (const ms of fightGen(mob, io)) if (!skipFight) await slp(ms);   // pauzy między ciosami; po Skip – bez pauz
    const { ph } = io.res, upd = io.upd;
    if (skipFight) { sayMute = false; say('<i>Fight skipped.</i>', 'miss'); upd(); }   // koniec pominiętej walki: log znowu działa
    fightOn = false;
    const loot = [];   // łup tej walki (pokazywany pod przyciskiem Collect na wyprawie)
    let rwXp = 0, rwGold = 0, qDone = null;   // nagroda tej walki (napis pod łupem); qDone = nagroda z ukończonego questa
    if (ph > 0) {
      const xp = xpOf(mob), rewardGold = Math.round(mob.l * 3);
      const gainXp = me.lvl >= MAX_LVL ? 0 : xp;   // na 80 poziomie XP już się nie zbiera
      holdGold = window.G_GLOBAL; holdXp = { lvl: me.lvl, xp: me.xp };   // panel Gold i pasek XP czekają na animację
      rwXp = gainXp; rwGold = rewardGold;
      window.G_GLOBAL += rewardGold; me.xp += gainXp; say(`<b>Victory!</b> ${gainXp ? `+${xp} XP, ` : ''}+${rewardGold} gold`);
      setTimeout(() => flyReward(rewardGold, gainXp), 60);   // animacja: złoto do panelu Gold, XP do paska doświadczenia (po odświeżeniu ekranu)
      while (me.lvl < MAX_LVL && me.xp >= xpNeed(me.lvl)) { me.xp -= xpNeed(me.lvl); me.lvl++; me.str += 1; me.dex += 1; me.con += 1; me.sp++;   /* awans: +1 do każdej statystyki (było +2) */ spDot = true; say(`<b>Level up: ${me.lvl}!</b> +1 skill point`, 'crit'); }
      if (me.lvl >= 10 && !showDunUnlockMsg) setShowDunUnlockMsg(true);
      // SKLEP: pokonanie przeciwnika, który może dać rzadkość X, odblokowuje X w sklepie (od następnego odświeżenia wszystkie przedmioty w tej rzadkości)
      if (mob.drop && mob.drop.length) { const mr = Math.min(4, Math.max(...mob.drop)); if (mr > (me.shopTier || 0)) me.shopTier = mr; }
      // poniżej 10 poziomu: +10 pkt proc. szansy, że łup z walki to broń (dodatkowe losowanie przed zwykłym wyborem slotu)
      if (mob.drop && mob.drop.length) { const it = mk(mob.drop, me.lvl < 10 && Math.random() < 0.10 ? 'weapon' : undefined, undefined, actOfMob(mob)); it.fresh = 1; if (view == 'exp') loot.push(it); else inv.push(it); say(`Loot: <b class="t${it.r}">${it.name}</b>`); }   // wyprawa: do plecaka dopiero po Collect   // Akty 2 i 3: na razie bez dropów
      for (const [k, ch] of mob.mats || []) if (Math.random() < ch) {
        if (view != 'exp') { giveMat(k); continue; }
        const d = MATS[k]; loot.push({ sl: d.sl, r: d.r || 0, name: d.name, mat: 1, qty: 1, val: d.val, s: {}, _mk: k });   // _mk: klucz materiału (po Collect → giveMat)
        say(`Loot: <b class="t${d.r || 0}">${d.name}</b>`);
      }
      // special dropy z lochu (stałe przedmioty, np. Forgotten Edge z pierwszego przeciwnika lochu – Spiderling)
      // MAKS. JEDEN special drop na walkę: jedno losowanie, szanse się sumują (np. 12 + 7 + 5 + 10 = 34% na cokolwiek)
      if (view == 'dun' && mob.sd && mob.sd.length) {
        let roll = Math.random() * 100, x = null;
        for (const d of mob.sd) { if (roll < d.pct) { x = d; break; } roll -= d.pct; }
        if (x) {
          const it = makeFixed(x.k); it.fresh = 1; inv.push(it); me.found = me.found || {}; me.found[x.k] = 1;
          say(`<b>Special drop:</b> <b class="t${it.r}">${it.name}</b>!`, 'crit');
          rareBanner(Object.assign({}, it, { big: true, html: `<div class="fx-b-ico cell r${it.r}">${sizeIco(it, 64)}</div><b class="t${it.r}" style="font-size:22px">${it.name}</b>` }));   // duży baner z błyskiem – bez napisu „RARE DROP!”, tylko ikona i nazwa (22 px)
        }
      }
      if (view == 'dun') {
        const di = DUN.mobs.indexOf(mob);
        if (!DEV || devFlag('dcd', false)) { me.dcd = me.dcd || {}; me.dcd[di] = Date.now() + DUN_CD; }   // przerwa 1 h dla tego przeciwnika (DEV: bez przerwy)
        if (di === dprog) { setDprog(dprog + 1); dJustBeat = true; }   // pierwszy raz pokonany → następny zostanie wybrany po Back
      }
      // postęp w lokacji: pokonanie kolejnego przeciwnika odblokowuje następnego w tej samej lokacji
      { const li = ALL_LOCS.findIndex(l => l.mobs.includes(mob)); if (li >= 0) { const mi = ALL_LOCS[li].mobs.indexOf(mob); me.eprog = me.eprog || {}; if (mi === (me.eprog[li] || 0)) me.eprog[li] = mi + 1; } }
      if (view == 'exp') qDone = questKill(mob, loot);   // QUEST: postęp / ukończenie aktywnego questa
      // pokonanie bossa lokacji (ostatni przeciwnik) odblokowuje następną lokację
      const bossLoc = ALL_LOCS.findIndex(l => l.mobs[l.mobs.length - 1] === mob);
      if (bossLoc >= 0 && bossLoc === locUnlocked && bossLoc + 1 < ALL_LOCS.length) {
        setLocUnlocked(bossLoc + 1);
        const na = ACT_START.indexOf(bossLoc + 1);   // pierwsza lokacja nowego aktu
        say(na > 0 ? `<b>${ACTS[na].n} unlocked!</b> ${ALL_LOCS[bossLoc + 1].e} ${ALL_LOCS[bossLoc + 1].n} is now available.` : `<b>Location unlocked: ${ALL_LOCS[bossLoc + 1].e} ${ALL_LOCS[bossLoc + 1].n}!</b>`, 'crit');
      }
      // pierwsze pokonanie Fire Lorda (ostatni boss Aktu 1) odblokowuje menu aktów
      const lastLoc = LOCS[LOCS.length - 1];
      if (!actsUnlocked && mob === lastLoc.mobs[lastLoc.mobs.length - 1]) {
        setActsUnlocked(true); setEact(0);
        say('<b>Act 1 complete!</b> Act selection unlocked in Expedition.', 'crit');
      }
    } else { say('<b>You lost.</b> Get stronger and try again.'); }
    if (view == 'exp') { expRes = { win: ph > 0, loot, had: loot.length > 0, xp: rwXp, gold: rwGold, quest: qDone }; if (loot.length) me.pendLoot = loot; }   // pendLoot: ta sama tablica – zapis gry   // had: był łup (po założeniu wszystkiego nie piszemy „No loot”)
  } catch (err) {
    console.error('Combat error:', err);
    say('An error occurred during combat (see console, F12).', 'miss');
  } finally {
    if (skipFight) sayMute = false; fightOn = false; skipFight = false;
    setBusy(false); setCdEnd(Date.now() + 1000); render();
  }
};

const tipEl = document.createElement('div'); tipEl.id = 'tip'; document.body.appendChild(tipEl);

function placeTip(x, y) {
  tipEl.style.display = 'block';
  tipEl.style.left = Math.max(4, Math.min(x + 14, innerWidth - tipEl.offsetWidth - 8)) + 'px';
  tipEl.style.top = Math.max(4, Math.min(y + 14, innerHeight - tipEl.offsetHeight - 8)) + 'px';
}

// jeden dymek dla wszystkiego: przedmioty (data-it) oraz opisy (data-tip: statystyki, (+), FP, nody skilli)
function updateTip(x, y, target) {
  tip2.style.display = 'none';   // drugi dymek (porównywarka) – tylko gdy porównujemy
  if (drag || panDrag || !target || !target.closest) { tipEl.style.display = 'none'; return; }
  const tt = target.closest('[data-tip]');
  if (tt) {
    tipEl.innerHTML = tt.dataset.tip;
    tipEl.style.borderColor = tt.classList.contains('upg-node') ? 'var(--c2)' : 'var(--c0)';
    placeTip(x, y); return;
  }
  const t = target.closest('[data-it]');
  let i = null;
  if (t) {
    const it = t.dataset.it;
    if (it === 'upgrade') i = upgradeItem;
    else if (it === 'upgprev') i = isUpgradable(upgradeItem) ? previewGear(upgradeItem) : null;
    else if (it.startsWith('fixed:')) i = makeFixed(it.split(':')[1]);
    else if (it.startsWith('dish:')) i = makeDish(it.split(':')[1]);   // danie w zakładce Cooking   // przepisy craftingu sprzętu: Seasoned Angler, Sea Raider (wynik i składnik)
    else if (it === 'shop:rod') i = makeRod();
    else if (it.startsWith('shopi:')) i = (me.shop && me.shop.items[+it.slice(6)]) || null;
    else if (it === 'craft:ring' || it === 'craft:amulet') i = makeCraftFish(it.split(':')[1]);
    else if (it.startsWith('craft:scroll_')) { const k = it.split('_')[1]; i = { isScroll: true, kind: k, name: SCROLLS[k].name, val: 0, noSell: true, qty: 1 }; }
    else if (it.startsWith('mat:')) {
      // składnik przepisu: ten sam opis co materiał w plecaku (z aktualną ilością, jeśli go masz)
      const k = it.split(':')[1], d = MATS[k];
      i = inv.find(x => x.mat && x.sl === k) || { sl: k, r: d.r || 0, name: d.name, mat: 1, qty: 0, val: d.val, s: {} };
    }
    else if (it.startsWith('questrw:')) i = me.quests?.list?.[+it.split(':')[1]]?.item || null;   // nagroda z questa
    else if (it.startsWith('loot:')) i = expRes?.loot?.[+it.split(':')[1]] || null;   // łup pod przyciskiem Collect
    else if (it.startsWith('dsd:')) { const [, m, n] = it.split(':'), x = DUN.mobs[+m]?.sd?.[+n]; i = x ? makeFixed(x.k) : null; }
    else if (it.startsWith('sdrop:')) { const [, f, n] = it.split(':'); i = SPECIAL_DROPS[f]?.[+n]?.item() || null; }
    else if (it.startsWith('fishsel:')) {
      // ten sam opis co ryba w plecaku (z aktualną ilością, jeśli ją masz)
      const k = it.split(':')[1], d = MATS[k];
      i = inv.find(x => x.mat && x.sl === k) || { sl: k, r: d.r || 0, name: d.name, mat: 1, qty: 0, val: d.val, s: {} };
    }
    else {
      const parts = it.split(':');
      i = parts[0] == 'inv' ? inv[+parts[1]] : ((equipPage === 1 ? eq1 : eq2)[parts[1]]);
    }
  }
  if (!i) { tipEl.style.display = 'none'; return; }
  if (i.fresh && t.dataset.it.startsWith('inv:')) { delete i.fresh; t.classList.remove('new'); }   // czerwona kropka znika po najechaniu
  // plecak, sklep, dropy: porównanie z założonym – tylko z wciśniętym Shift; bez Shift zwykły dymek z podpowiedzią
  const cmp = t && /^(inv|shopi|dsd|sdrop|fixed|loot|questrw):/.test(t.dataset.it) ? cmpCard(i) : null;   // loot: łup pod przyciskiem Collect
  tipEl.style.borderColor = 'var(--c0)';
  // QUEST: nad przedmiotem nagrody – XP i złoto
  const qh = t && t.dataset.it.startsWith('questrw:') ? (q => q ? `<div style="font-weight:700;margin-bottom:6px">Reward: <span style="color:#e69500">+${q.gold}</span> ${goldIco(14)} <span style="color:#8e44ad">+${q.xp} XP</span></div>`
    + `<div class="cell r${q.item.r || 0}" style="width:56px;height:56px;margin:0 0 6px;cursor:default">${invIco(q.item)}</div>` : '')(me.quests.list[+t.dataset.it.split(':')[1]]) : '';   // ikona przedmiotu z nagrody (ramka w kolorze rzadkości)
  if (cmp && shiftDown) { tipEl.innerHTML = qh + cmp.left; if (cmp.right) { tip2.innerHTML = cmp.right; placeTip2(x, y); } else placeTip(x, y); }
  else { tipEl.innerHTML = qh + card(i, cmp ? 'Hold Shift to compare' : ''); placeTip(x, y); }
}

// DYMEK PRZEDMIOTU: „Value” zawsze w prawym dolnym rogu (stopka); hint = podpis po lewej w stopce (np. Hold Shift to compare)
function moveVal(html, hint = '') {
  // podpowiedź (Hold Shift to compare) zaraz pod nazwą przedmiotu – w miejscu pustej linii pod nazwą
  if (hint) html = html.replace(/^(<b[^>]*>.*?<\/b>(?:<span[^>]*>Unique<\/span>)?)(<br>)?/, `$1<div class="cmphint" style="margin:2px 0 6px">${hint}</div>`);
  const m = html.match(/<br>Value: ([^<]*)/);
  if (!m) return html;
  return html.replace(m[0], '') + `<div class="tfoot"><span class="tval">Value: ${m[1]} ${goldIco(16)}</span></div>`;
}
const card = (i, hint) => moveVal(cardRaw(i), hint);
// PORÓWNYWARKA: dwa dymki obok siebie – po LEWEJ nowy przedmiot (każda statystyka z różnicą względem założonego: zielone +, czerwone −),
// po PRAWEJ założony przedmiot z napisem „Equipped” (bojowy → ekwipunek strona 1, wędkarski → strona 2). Broń: różnica średnich obrażeń.
const tip2 = document.createElement('div'); tip2.id = 'tip2'; document.body.appendChild(tip2);
document.head.insertAdjacentHTML('beforeend', '<style>#tip2{position:fixed;display:none;z-index:50;background:var(--card);border:1px solid var(--bd);border-radius:10px;padding:12px;font-size:18px;line-height:1.35;max-width:315px;pointer-events:none;box-shadow:0 4px 14px #0006}#tip2 b{display:block;font-size:19px}.cmpd{font-weight:800;margin-left:6px}.cmphint{font-size:12px;color:var(--mut);font-style:italic}.tfoot{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;margin-top:6px}.tval{margin-left:auto;white-space:nowrap}.eqlbl{font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin-bottom:4px}</style>');
const cmpEq = i => !i || !i.sl || i.mat || i.isScroll || i.isRecipe || i.isDesign || i.isGuide || i.isFood || i.isChest ? undefined : (i.isFishGear ? eq2 : eq1)[i.sl] || null;   // null = pusty slot (porównanie z niczym)
const cdiff = (v, u = '') => { v = +(+v).toFixed(1); return v ? `<span class="cmpd" style="color:${v > 0 ? '#3fdc3f' : '#e53935'}">${v > 0 ? '+' : '−'}${Math.abs(v)}${u}</span>` : ''; };
// opis nowego przedmiotu z różnicami (ten sam układ co zwykły dymek)
function cmpLeft(i, cur) {
  const reqL = i.req ? `<br><span style="color:${me.lvl >= i.req ? 'var(--tx)' : 'var(--lack)'}">Requires level ${i.req}</span>` : '';
  if (i.isFishGear) {
    const fa = itemFx(cur) || {}, fb = itemFx(i) || {};
    const fx = Object.keys(fb).map(e => `<br><span style="color:#3fdc3f">${FX_TXT[e](fb[e])}</span>${cdiff(fb[e] - (fa[e] || 0), '%')}`).join('')
      + Object.keys(fa).filter(e => !fb[e]).map(e => `<br><span style="color:var(--mut)">${FX_TXT[e](0)}</span>${cdiff(-fa[e], '%')}`).join('');
    return `<b class="t${i.r}">${i.name}</b>${uniqueTag(i)}${reqL}<br>FP: <b class="t2" style="display:inline">${i.fp || 0}</b>${cdiff((i.fp || 0) - ((cur && cur.fp) || 0))}${fx}${i.sl !== 'weapon' ? setTip(i) : ''}<br>Value: ${price(i)}${quoteLine(i)}`;
  }
  const avg = x => x && x.d ? (x.d[0] + x.d[1]) / 2 : 0, sa = (cur && cur.s) || {}, sb = i.s || {};
  const dmg = i.d ? `${dl(i).replace(/<br>$/, '')}${cdiff(avg(i) - avg(cur))}` : (cur && cur.d ? `<span style="color:var(--mut)">0 Damage</span>${cdiff(-avg(cur))}` : '');
  const keys = STAT_ORDER.concat([...Object.keys(sa), ...Object.keys(sb)].filter(k => !STAT_ORDER.includes(k))).filter((k, n, a) => a.indexOf(k) === n && (sa[k] || sb[k]));
  const st = keys.map(k => sb[k] ? `${sgn(k)}${sb[k]} ${ST[k]}${cdiff(sb[k] - (sa[k] || 0))}` : `<span style="color:var(--mut)">${sgn(k)}0 ${ST[k]}</span>${cdiff(-sa[k])}`).join('<br>');
  return `<b class="t${i.r}">${i.name}</b>${uniqueTag(i)}${reqL}<br>${dmg}${dmg && st ? '<br>' : ''}${st}${setTip(i)}${setOf(i) ? '<br>' : ''}<br>Value: ${price(i)}`;
}
function cmpCard(i) { const cur = cmpEq(i); return cur === undefined || cur === i ? null : { left: moveVal(cmpLeft(i, cur)), right: cur ? `<div class="eqlbl">Equipped</div>` + card(cur) : null }; }
// dwa dymki obok siebie (lewy = nowy, prawy = założony); razem mieszczą się w oknie
// SHIFT: wciśnięcie / puszczenie od razu przełącza dymek (zwykły ↔ porównanie) pod kursorem
let shiftDown = false;
addEventListener('keydown', e => { if (e.key === 'Shift' && !shiftDown) { shiftDown = true; refreshTip(); } });
addEventListener('keyup', e => { if (e.key === 'Shift') { shiftDown = false; refreshTip(); } });
addEventListener('blur', () => { if (shiftDown) { shiftDown = false; refreshTip(); } });   // np. Alt+Tab z wciśniętym Shift
function placeTip2(x, y) {
  tipEl.style.display = 'block'; tip2.style.display = 'block';
  const w = tipEl.offsetWidth + 8 + tip2.offsetWidth, x0 = Math.max(4, Math.min(x + 14, innerWidth - w - 8));
  tipEl.style.left = x0 + 'px'; tip2.style.left = (x0 + tipEl.offsetWidth + 8) + 'px';
  tipEl.style.top = Math.max(4, Math.min(y + 14, innerHeight - tipEl.offsetHeight - 8)) + 'px';
  tip2.style.top = Math.max(4, Math.min(y + 14, innerHeight - tip2.offsetHeight - 8)) + 'px';
}

// po każdym renderze sprawdź, co jest teraz pod kursorem (np. po zamianie przedmiotów)
function refreshTip() {
  if (!lastMouseE) return;
  updateTip(lastMouseE.clientX, lastMouseE.clientY, document.elementFromPoint(lastMouseE.clientX, lastMouseE.clientY));
}

document.addEventListener('mousemove', e => {
  setLastMouseE(e);
  if (panDrag) {
    const dx = e.clientX - panDrag.x, dy = e.clientY - panDrag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) setPanMoved(true);
    setPanX(panDrag.px + dx); setPanY(panDrag.py + dy); clampPan();
    const tc = $('treeContent');
    if (tc) tc.style.transform = `translate(${panX}px,${panY}px) scale(${currentZoom})`;
    tipEl.style.display = 'none'; tip2.style.display = 'none';
    return;
  }
  updateTip(e.clientX, e.clientY, e.target);
});

document.addEventListener('mouseup', () => {
  if (panDrag) { setPanDrag(null); setTimeout(() => setPanMoved(false), 0); }
});

// czy podczas bieżącego przeciągania strona ekwipunku została automatycznie przełączona na 2 (wtedy po upuszczeniu – pełny render)
let dragPageSwitch = false;

document.addEventListener('dragstart', e => {
  const t = e.target.closest('[data-it]');
  if (!t) return;
  setDrag(t.dataset.it);
  e.dataTransfer.setData('text/plain', t.dataset.it);

  const parts = t.dataset.it.split(':');
  const item = parts[0] === 'inv' ? inv[+parts[1]] : parts[0] === 'upgrade' ? upgradeItem : parts[0] === 'shopi' ? me.shop && me.shop.items[+parts[1]] : (equipPage === 1 ? eq1 : eq2)[parts[1]];
  if (parts[0] === 'shopi' && equipPage === 2) { setEquipPage(1); renderSlots(); dragPageSwitch = true; }   // przedmiot ze sklepu: pokaż ekwipunek bojowy
  // PODNIESIENIE sprzętu wędkarskiego (z plecaka albo ze slotu ulepszania) na stronie 1 → ekwipunek przełącza się na stronę 2,
  // żeby od razu było widać sloty, do których pasuje. Przebudowujemy tylko sloty (renderSlots), plecak zostaje nietknięty.
  if (item && item.isFishGear && equipPage === 1 && !busy && (parts[0] === 'inv' || parts[0] === 'upgrade')) {
    setEquipPage(2); renderSlots(); dragPageSwitch = true;
  }
  if (item && !item.mat && !item.isScroll && !item.isRecipe && !item.isDesign && !item.isGuide && !item.isFood && !item.isChest) {
    document.querySelectorAll('.slot[data-slot]').forEach(s => {
      if (s.dataset.slot === item.sl) s.classList.add('ok'); else s.classList.add('no');
    });
    // slot ulepszania wędki: podświetla się tak samo jak slot wędki, gdy trzymamy wędkę (inne przedmioty – przygaszony)
    const us = document.querySelector('.upgrade-drop-slot');
    if (us && parts[0] !== 'upgrade') us.classList.add(isUpgradable(item) ? 'ok' : 'no');   // wędka albo haczyk
  }
  if (sellMode) $('sellbtn').classList.add('over');
});

document.addEventListener('dragend', () => {
  setDrag(null);
  document.querySelectorAll('.slot').forEach(s => s.classList.remove('ok', 'no', 'over'));
  $('sellbtn').classList.remove('over');
  // strona przełączona przy podniesieniu: odśwież całość (statystyki, FP), nawet jeśli przedmiot upuszczono poza slotem
  if (dragPageSwitch) { dragPageSwitch = false; render(); }
});

document.addEventListener('dragover', e => {
  e.preventDefault();
  const s = e.target.closest('.slot[data-slot], .upgrade-drop-slot');
  if (s && drag) e.dataTransfer.dropEffect = 'move';
});

document.addEventListener('drop', e => {
  e.preventDefault();
  // SKLEP: przeciągnięcie przedmiotu na pasujący slot postaci = kup i załóż; na plecak = kup do plecaka
  if (drag && drag.startsWith('shopi:')) {
    const n = +drag.split(':')[1], it = me.shop && me.shop.items[n], sl = e.target.closest('.slot[data-slot]');
    if (it && sl && sl.dataset.slot === it.sl && equipPage === 1) window.buyShop(n, true);
    else if (it && e.target.closest('#invcard')) window.buyShop(n);
    setDrag(null); return;
  }
  // PLECAK: przeciągnięcie przedmiotu na inną komórkę plecaka = zamiana miejsc (na pustą część plecaka – nic się nie dzieje)
  const invCell = e.target.closest('#inv .cell[data-n]');
  if (invCell && drag && drag.startsWith('inv:')) {
    const a = +drag.split(':')[1], b = +invCell.dataset.n;
    if (a !== b && inv[a] && inv[b]) { [inv[a], inv[b]] = [inv[b], inv[a]]; render(); }
    setDrag(null);
    return;
  }
  const s = e.target.closest('.slot[data-slot]');
  const upgSlot = e.target.closest('.upgrade-drop-slot');
  const sellB = e.target.closest('#sellbtn');

  // wędka przeciągnięta ze slotu ulepszania do plecaka
  if (drag === 'upgrade') {
    if (e.target.closest('#invcard')) window.removeUpgradeItem();
    // wędka / haczyk ze slotu ulepszania prosto na pasujący slot w ekwipunku (strona 2) – zamiana miejscami
    else if (s && upgradeItem && equipPage === 2 && s.dataset.slot === upgradeItem.sl) {
      const sl = upgradeItem.sl;
      if (fishing.active && sl === 'weapon') say('You cannot change the rod while fishing!', 'miss');
      else {
        const old = eq2[sl];
        eq2[sl] = upgradeItem;
        setUpgradeItem(old && old.isFishGear ? old : null);
        render();
      }
    }
    setDrag(null);
    return;
  }

  if (sellB && drag) {
    const parts = drag.split(':');
    if (parts[0] === 'inv') sell(+parts[1], sellB.getBoundingClientRect());   // upuszczony na Sell – monety lecą z przycisku Sell
    setDrag(null);
    return;
  }

  if (drag && drag.startsWith('eq:') && e.target.closest('#invcard')) {
    unequip(drag.split(':')[1]);
    setDrag(null);
    return;
  }

  if (upgSlot && drag) {
    const parts = drag.split(':');
    if (parts[0] === 'inv') {
      const idx = +parts[1];
      const i = inv[idx];
      if (isUpgradable(i)) {   // slot przyjmuje wędki i haczyki
        if (upgradeItem) inv.push(upgradeItem);
        inv.splice(idx, 1);
        setUpgradeItem(i);
        render();
      }
    } else if (parts[0] === 'eq' && equipPage === 2) {
      // wędka / haczyk z ekwipunku (strona 2) prosto do slotu ulepszania – zamiana miejscami
      const i = eq2[parts[1]];
      if (isUpgradable(i)) {
        if (fishing.active && isRod(i)) say('You cannot remove the rod while fishing!', 'miss');
        else {
          const old = upgradeItem;
          // poprzedni przedmiot ze slotu ulepszania wraca na to miejsce tylko, jeśli pasuje (wędka↔wędka, haczyk↔haczyk); inaczej do plecaka
          if (old && old.sl === i.sl) eq2[parts[1]] = old; else { delete eq2[parts[1]]; if (old) inv.push(old); }
          setUpgradeItem(i);
          render();
        }
      }
    }
    setDrag(null);
    return;
  }

  if (s && drag) {
    const parts = drag.split(':');
    if (parts[0] === 'inv') {
      const idx = +parts[1];
      const i = inv[idx];
      const targetSlot = s.dataset.slot;

      if (i && !i.mat && !i.isScroll && !i.isRecipe && !i.isDesign && !i.isGuide && !i.isFood && !i.isChest) {
        if (equipPage === 2) {
          if (fishing.active && targetSlot === 'weapon') {
            say('You cannot change the rod while fishing!', 'miss');
            setDrag(null);
            return;
          }
          if (i.isFishGear && targetSlot === i.sl) {   // wędka → slot broni, haczyk → slot haczyka
            delete i.fresh;
            swapIn(idx, eq2, i);
          }
        } else {
          if (i.sl === targetSlot && !i.isFishGear) {
            delete i.fresh;
            swapIn(idx, eq1, i);
          }
        }
      }
    }
  }
  setDrag(null);
});

document.addEventListener('click', e => {
  const t = e.target; if (!t.closest) return;
  if (t.closest('[data-a=info]')) { setShowInfo(!showInfo); render(); return; }

  const btn = t.closest('#nav button');
  if (btn && !busy) {
    const targetView = btn.dataset.v;
    if (fishing.active && targetView === 'exp') return;
    setView(targetView);
    setEloc(null); setEsel(-1); setDloc(null);
    if (targetView === 'craft') craftTab = 'scrolls';
    // automatyczna zmiana setu ekwipunku
    if (targetView === 'fish' || targetView === 'upgrade') setEquipPage(2);
    else if (targetView === 'exp') setEquipPage(1);
    render();
    return;
  }

  // wybór ryby do łowienia (zablokowane placeholdery nie mają data-fish)
  // zakładki Wytwarzania
  const ct = t.closest('[data-ctab]');
  if (ct) { craftTab = ct.dataset.ctab; render(); return; }

  // wybór aktu w bocznym menu Wyprawy
  const ac = t.closest('[data-act]');
  if (ac && !busy && !fishing.active) { setEact(+ac.dataset.act); setEloc(null); setEsel(-1); render(); return; }

  const fc = t.closest('[data-fish]');
  if (fc && !fishing.active) { fishing.sel = fc.dataset.fish; render(); return; }

  const b = t.closest('button[data-a]');
  if (b && !busy) {
    const a = b.dataset.a;
    if (a == 'eloc') { if (locOpen(+b.dataset.i)) setEloc(+b.dataset.i); }
    else if (a == 'eback') { setEloc(null); setEsel(-1); }
    else if (a == 'fback') { setEsel(-1); endExp(); setLastMob(null); }   // Back w lewym górnym rogu okna walki (wyprawa) → wybór przeciwnika + plecak
    else if (a == 'esel') { if (mobOpen(eloc, +b.dataset.i)) { setEsel(+b.dataset.i); endExp(); setLastMob(null); } }   // zablokowany (niepokonany poprzedni) – nie da się wybrać
    else if (a == 'dloc') { if (dunLvlOk()) { setDloc(0); dfight = false; dsel = dprog < DUN.mobs.length && !fishing.active ? dprog : -1; dview = Math.min(dprog, DUN.mobs.length - 1); } }   // otwarcie: wybrany kolejny niepokonany
    else if (a == 'dsel') { const n = +b.dataset.i; dview = n; dsel = n <= dunProg() && !fishing.active ? n : -1; }   // każdy: podgląd dropów; walka z każdym pokonanym i kolejnym niepokonanym
    else if (a == 'dback') { setDloc(null); dsel = -1; dfight = false; }
    else if (a == 'dfight') {   // Fight pod Special drops: karta lochu zamienia się w walkę i walka startuje od razu
      if (dsel >= 0 && dsel === Math.min(dview, DUN.mobs.length - 1) && !dunCd(dsel) && !fishing.active) { dfight = true; render(); setTimeout(() => $('go').onclick(), 0); return; }
    }
    else if (a == 'dfback') {   // Back z walki → z powrotem lista przeciwników i dropy
      dfight = false;
      if (dJustBeat) { dJustBeat = false; if (dprog < DUN.mobs.length) { dsel = dprog; dview = dprog; } }   // po pierwszym pokonaniu – wybrany następny przeciwnik
    }
    render(); return;
  }

  const pl = t.plus || t.closest('.plus');
  if (pl) { buy(pl.dataset.k); return; }

  const c = t.closest('.cell[data-n]');
  if (c) { return sellMode ? sell(+c.dataset.n) : equip(+c.dataset.n); }

  const s = t.closest('.slot[data-it]');
  if (s) { unequip(s.dataset.slot); }
});

$('sellbtn').onclick = () => { setSellMode(!sellMode); render(); };
// LOG WALKI: domyślnie ukryty; przycisk pod przeciwnikiem (po prawej) pokazuje / chowa go (wybór zapamiętany do końca sesji)
$('logbtn').onclick = () => { const l = $('log'); l.hidden = !l.hidden; $('logbtn').textContent = l.hidden ? 'Show battle log' : 'Hide battle log'; if (!l.hidden) l.scrollTop = l.scrollHeight; };

// reset skilli: zwraca wszystkie skill pointy wydane w drzewku i cofa wszystkie węzły (łącznie z "Surprise Attack")
$('skillreset').onclick = () => {
  const refund = skillRefund();
  if (busy || !refund) return;
  me.sp += refund; spDot = true;
  upgTree.centerHp = 0;
  for (const k in upgTree.nodes) delete upgTree.nodes[k];
  say(`Skills reset. Refunded <b>${refund}</b> skill point${refund === 1 ? '' : 's'}.`, 'crit');
  render();
};

// Przycisk DEV: przełącza tryb i restartuje grę od zera (WYŁ = pusto, WŁ = wszystkie materiały itd.)
const devBtn = $('devbtn');
if (devBtn) {
  devBtn.textContent = DEV ? '🛠️ DEV: ON' : '🛠️ DEV: OFF';
  devBtn.classList.toggle('on', DEV);
  devBtn.onclick = () => {
    const msg = DEV
      ? 'Turn DEV mode off? You will go back to your normal game. DEV and normal games are saved separately.'
      : 'Turn DEV mode on? You will switch to the DEV game (999 of every material, 100,000 gold, etc.). DEV and normal games are saved separately.';
    if (!confirm(msg)) return;
    try { localStorage.setItem('arena_dev', DEV ? '0' : '1'); } catch (e) {}
    location.reload();
  };
}

// ===== ID PRZEDMIOTÓW =====
// Każdy rodzaj przedmiotu ma stałe, unikalne ID (niewidoczne w grze). Rozpiska: plik ITEM_IDS.md. Spawn po ID: panel DEV.
// ZASADA: każdy NOWY przedmiot dostaje tu ID w swoim zakresie; istniejących ID nie zmieniamy ani nie używamy ponownie.
//   1000–1999 ekwipunek losowy (baza z NAMES, rzadkość i poziom przy spawnie)   2000–2999 przedmioty z lochów
//   3000–3999 sprzęt wędkarski (stałe, wędki 31xx, haczyki 32xx)               4000–4999 unikaty
//   5000–5999 materiały (51xx ryby, 52xx materiały z ryb)                        6000–6999 przedmioty użytkowe (zwoje, jedzenie, przepisy, projekty…)
const ITEM_REG = [];
const regI = (id, cat, name, make, opts = {}) => ITEM_REG.push(Object.assign({ id, cat, name, make }, opts));
regI(1000, 'Equipment', 'Rusty Sword', () => ({ sl: 'weapon', r: 0, name: 'Rusty Sword', ic: 'sword_bronze', rust: 1, s: {}, d: [4, 6], dv: 2 }));
[['weapon', ['Sword', 'Axe', 'Mace']], ['helm', ['Helmet', 'Hood', 'Cap']], ['armor', ['Chainmail', 'Cuirass', 'Tunic']], ['boots', ['Leather Boots', 'Steel Boots', 'Fur Boots']],
 ['ring', ['Ring', 'Signet', 'Band']], ['amulet', ['Emerald Amulet', 'Frost Amulet', 'Ruby Amulet']], ['trinket', ['Chalice', 'Stone of Hope', 'Lucky Clover']],
 ['shield', ['Wooden Shield', 'Ruby Shield', 'Emerald Shield']], ['gloves', ['Leather Gloves', 'Steel Gauntlets', 'Fur Mittens']]]
  .flatMap(([sl, bs]) => bs.map(b => [sl, b])).forEach(([sl, b], k) => regI(1001 + k, 'Equipment (random stats)', b, (r = 0) => mk([r], sl, b), { sl, base: b, rar: true }));
// akt 2 – zbroje (1028–1030)
['Plate Armor', 'Scale Mail', 'Brigandine'].forEach((b, k) => regI(1028 + k, 'Equipment (random stats)', b, (r = 0) => mk([r], 'armor', b), { sl: 'armor', base: b, rar: true }));
// akt 2 – tarcze (1031–1033)
['Knight Shield', 'Drake Shield', 'Shadow Shield'].forEach((b, k) => regI(1031 + k, 'Equipment (random stats)', b, (r = 0) => mk([r], 'shield', b), { sl: 'shield', base: b, rar: true }));
// akt 2 – hełmy (1034–1036)
['Knight Helm', 'Drake Helm', 'Shadow Helm'].forEach((b, k) => regI(1034 + k, 'Equipment (random stats)', b, (r = 0) => mk([r], 'helm', b), { sl: 'helm', base: b, rar: true }));
['forgotten_edge', 'forgotten_cuirass', 'forgotten_pendant', 'forgotten_aegis'].forEach((k, n) => regI(2001 + n, 'Dungeon', FIXED_ITEMS[k].name, () => makeFixed(k), { fixed: k }));
['chitin_carapace', 'silkstep_boots', 'spider_eye_charm'].forEach((k, n) => regI(2005 + n, 'Dungeon', FIXED_ITEMS[k].name, () => makeFixed(k), { fixed: k }));   // zestaw pająka (Spider Servant)
['widow_spear', 'widow_ring', 'widowgrip_gauntlets', 'widow_helm'].forEach((k, n) => regI(2008 + n, 'Dungeon', FIXED_ITEMS[k].name, () => makeFixed(k), { fixed: k }));   // zestaw Widow (Spider Queen)
regI(2012, 'Dungeon', FIXED_ITEMS.widows_heart.name, () => makeFixed('widows_heart'), { fixed: 'widows_heart' });   // Widows Heart (Spider Queen, 0.4%)
regI(2013, 'Dungeon', FIXED_ITEMS.forgotten_fang.name, () => makeFixed('forgotten_fang'), { fixed: 'forgotten_fang' });   // Forgotten Fang (Spiderling, 2%)
regI(2014, 'Dungeon', FIXED_ITEMS.chitin_halberd.name, () => makeFixed('chitin_halberd'), { fixed: 'chitin_halberd' });   // Chitin Halberd (Spider Servant, 6%)
['boonie', 'wellies', 'parka', 'lantern', 'whisker_charm', 'whisker_amulet', 'whisker_ring', 'seasoned_cap', 'seasoned_parka', 'seasoned_wellies', 'seasoned_lantern',
 'hunter_helmet', 'hunter_parka', 'hunter_wellies', 'hunter_lantern', 'tide_ring', 'lure_necklace', 'shark_eye', 'king_crown', 'king_plate', 'king_boots', 'king_lantern']
  .forEach((k, n) => regI(3001 + n, 'Fishing gear', FIXED_ITEMS[k].name, () => makeFixed(k), { fixed: k }));
[0, 1, 2, 3, 4].forEach(r => regI(3101 + r, 'Fishing rod', ROD_TIERS[r].name, () => Object.assign(makeRod(), { r, name: ROD_TIERS[r].name, fp: ROD_TIERS[r].fp }), { rod: r }));
[0, 1, 2, 3, 4].forEach(r => regI(3201 + r, 'Fishing hook', HOOK_TIERS[r].name, () => Object.assign(makeHook(), { r, name: HOOK_TIERS[r].name, fp: HOOK_TIERS[r].fp }), { hook: r }));
regI(4001, 'Unique', UNIQUES.lure_hood.name, () => makeUnique('lure_hood'), { unique: 'lure_hood' });
const matI = (id, k) => regI(id, 'Material', MATS[k].name, () => ({ sl: MATS[k].sl, r: MATS[k].r || 0, name: MATS[k].name, mat: 1, qty: 1, val: MATS[k].val, s: {} }), { mat: k, stack: true });
['meat', 'claw', 'bone', 'skull'].forEach((k, n) => matI(5001 + n, k));
['fish_carp', 'fish_cod', 'fish_catfish', 'fish_barracuda', 'fish_anglerfish', 'fish_shark', 'fish_leviathan'].forEach((k, n) => matI(5101 + n, k));
['eye_of_cod', 'catfish_scale', 'barracuda_fang', 'light_of_anglerfish', 'pearl_of_the_deep', 'shark_fin'].forEach((k, n) => matI(5201 + n, k));
['str', 'dex'].forEach((k, n) => regI(6001 + n, 'Scroll', SCROLLS[k].name, () => ({ isScroll: true, kind: k, name: SCROLLS[k].name, val: 0, noSell: true, qty: 1 }), { scroll: k, stack: true }));
const DISH_KEYS = ['cooked_carp', 'cooked_cod', 'grilled_catfish', 'steamed_barracuda', 'anglerfish_stew', 'shark_steak', 'abyssal_broth'];
DISH_KEYS.forEach((k, n) => regI(6101 + n, 'Food', DISHES[k].name, () => makeDish(k), { food: k, stack: true }));
DISH_KEYS.forEach((k, n) => regI(6201 + n, 'Recipe', RECIPES[k].name, () => makeRecipe(k), { recipe: k }));
['seasoned_cap', 'seasoned_parka', 'seasoned_wellies', 'seasoned_lantern', 'hunter_helmet', 'hunter_parka', 'hunter_wellies', 'hunter_lantern', 'tide_ring']
  .forEach((k, n) => regI(6301 + n, 'Crafting Design', makeDesign(k).name, () => makeDesign(k), { design: k }));
regI(6401, 'Other', GUIDE.name, () => ({ isGuide: 1, sl: 'guide', r: GUIDE.r, name: GUIDE.name, qty: 1, val: GUIDE.val, s: {} }), { guide: true, stack: true });
regI(6402, 'Other', CHEST.name, () => makeChest(), { chest: true, stack: true });
// ID z istniejącego przedmiotu (np. z plecaka) – do przyszłych zapisów, statystyk, logów; w grze niewidoczne
function itemId(i) {
  if (!i) return 0;
  const f = x => (ITEM_REG.find(x) || {}).id || 0;
  if (i.fixed) return f(e => e.fixed === i.fixed);
  if (i.unique) return f(e => e.unique === i.unique);
  if (i.mat) return f(e => e.mat && MATS[e.mat].sl === i.sl);
  if (i.isScroll) return f(e => e.scroll === (i.kind || 'str'));
  if (i.isFood) return f(e => e.food === i.kind);
  if (i.isRecipe) return f(e => e.recipe === i.kind);
  if (i.isDesign) return f(e => e.design === i.kind);
  if (i.isGuide) return 6401;
  if (i.isChest) return 6402;
  if (i.isFishGear && i.sl === 'weapon') return f(e => e.rod === i.r);
  if (i.isFishGear && i.sl === 'hook') return f(e => e.hook === i.r);
  if (i.rust) return 1000;
  return f(e => e.base && e.sl === i.sl && i.name.endsWith(e.base));
}
window.ITEM_REG_LIST = () => ITEM_REG.map(e => ({ id: e.id, cat: e.cat, name: e.name, rar: !!e.rar, stack: !!e.stack }));   // do generowania rozpiski
window.itemId = itemId;
if (DEV) window.ITEM_REG_CHECK = () => ITEM_REG.filter(e => itemId(e.make(1)) !== e.id).map(e => e.id);   // test: każde ID odczytuje się z powrotem z przedmiotu
// spawn po ID (panel DEV): rzadkość r – tylko ekwipunek losowy (1001–1027), poziom = aktualny poziom postaci; qty – przedmioty w stosach
function spawnItem(id, r = 0, qty = 1) {
  const e = ITEM_REG.find(x => x.id === id); if (!e) return null;
  let it = null;
  for (let q = 0; q < (e.stack ? qty : 1); q++) {
    if (e.mat) { giveMatQuiet(e.mat); it = it || e.make(); continue; }
    const o = e.make(r); o.fresh = 1;
    const same = e.stack && inv.find(x => itemId(x) === id && !x.mat);
    if (same) { same.qty = (same.qty || 1) + 1; same.fresh = 1; } else inv.push(o);
    it = it || o;
  }
  return it;
}

// ===== PANEL (DEV i zwykła gra) =====
// Przycisk „🧪 Panel” obok „DEV: ON”: przewijanie czasu, eksport / import zapisu, przełączniki przeciwników, ustawianie statystyk.
{
  document.head.insertAdjacentHTML('beforeend', '<style>#devpbtn{position:fixed;left:126px;bottom:12px;z-index:60;font-weight:700;font-size:12px}#devpanel{position:fixed;left:12px;bottom:52px;z-index:61;width:300px;max-height:calc(100vh - 70px);overflow:auto;background:var(--card);border:2px solid var(--ac);border-radius:12px;padding:10px 12px;box-shadow:0 6px 24px #0007;font-size:12px}#devpanel h4{margin:10px 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ac)}#devpanel .dvrow{display:flex;flex-wrap:wrap;gap:5px;align-items:center}#devpanel button{font-size:12px;padding:3px 8px}#devpanel label{display:flex;align-items:center;gap:6px;margin:3px 0;cursor:pointer}#devpanel .dvgrid{display:grid;grid-template-columns:auto 1fr;gap:4px 8px;align-items:center}#devpanel input[type=number],#devpanel select{width:100%;box-sizing:border-box;padding:2px 4px;font:inherit}</style>');
  const pb = document.createElement('button'); pb.id = 'devpbtn'; pb.textContent = '🧪 Panel'; document.body.appendChild(pb);
  let open = false;
  const setFlag = (k, v) => { try { localStorage.setItem(PANEL_KEY + k, v ? '1' : '0'); } catch (e) {} };
  const fmtOff = ms => { const m = Math.round(ms / 60000); return m <= 0 ? '0 min' : (m >= 60 ? Math.floor(m / 60) + ' h ' : '') + (m % 60 ? m % 60 + ' min' : ''); };
  const draw = () => {
    let p = $('devpanel');
    if (!open) { if (p) p.remove(); return; }
    if (!p) { p = document.createElement('div'); p.id = 'devpanel'; document.body.appendChild(p); }
    const num = (k, v) => `<input type="number" data-dv="${k}" value="${v}" min="0">`;
    p.innerHTML = `<div class="dvrow" style="justify-content:flex-end"><button data-dva="close">X</button></div>`
      + `<h4>Time skip</h4><div class="dvrow"><button data-dvt="10">+10 min</button><button data-dvt="60">+1 h</button><button data-dvt="480">+8 h</button><button data-dvt="1440">+24 h</button><button data-dva="treset">Reset</button></div>`
      + `<small style="color:var(--mut)">Time shift: +${fmtOff(DEV_TIME.off)}</small>`
      + `<h4>Save</h4><div class="dvrow"><button data-dva="export">⬇ Export</button><button data-dva="import">⬆ Import</button><input type="file" id="dvfile" accept=".json,application/json" hidden></div>`
      + `<h4>Spawn item</h4><div class="dvgrid"><span>Item ID</span><input type="number" data-dv="sid" value="${p.dataset.sid || 1001}" min="1000"><span>Rarity</span><select data-dv="srar">${['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'].map((n, r) => `<option value="${r}"${+(p.dataset.srar || 0) === r ? ' selected' : ''}>${n}</option>`).join('')}</select><span>Quantity</span><input type="number" data-dv="sqty" value="${p.dataset.sqty || 1}" min="1"></div>`
      + `<div class="dvrow" style="margin-top:6px"><button data-dva="spawn">Spawn</button><small style="color:var(--mut)">rarity: IDs 1001–1036, qty: stackables</small></div>`
      + `<h4>Progress</h4><label><input type="checkbox" data-dvf="unlockall"${devFlag('unlockall', false) ? ' checked' : ''}> Unlock all content</label>`
      + `<h4>Enemies</h4><label><input type="checkbox" data-dvf="onehp"${devFlag('onehp', true) ? ' checked' : ''}> 1 HP enemies</label>${DEV ? `<label><input type="checkbox" data-dvf="dcd"${devFlag('dcd', false) ? ' checked' : ''}> Dungeon cooldowns (1 h)</label>` : ''}`
      + `<h4>Character</h4><div class="dvgrid"><span>Level</span>${num('lvl', me.lvl)}<span>Gold</span>${num('gold', Math.floor(window.G_GLOBAL))}<span>Strength</span>${num('str', me.str)}<span>Dexterity</span>${num('dex', me.dex)}<span>Vitality</span>${num('con', me.con)}<span>Skill Points</span>${num('sp', me.sp)}</div>`
      + `<div class="dvrow" style="margin-top:6px"><button data-dva="apply">Apply</button><small style="color:var(--mut)">base stats, without items</small></div>`;
  };
  pb.onclick = () => { open = !open; draw(); };
  document.addEventListener('click', e => {
    const p = $('devpanel'); if (!p || !p.contains(e.target)) return;
    const t = e.target.closest('[data-dvt]'), a = e.target.closest('[data-dva]');
    if (t) {   // przewinięcie czasu: łowienie liczone jak powrót po nieobecności (okno „While you were away”, limit AFK Fishing)
      if (busy) return;
      const before = Date.now();
      setTimeOff(DEV_TIME.off + +t.dataset.dvt * 60000);
      processOffline(before); render(); draw(); return;
    }
    if (!a) return;
    const act = a.dataset.dva;
    if (act === 'close') { open = false; draw(); }
    else if (act === 'treset') { setTimeOff(0); render(); draw(); }
    else if (act === 'export') {   // zapis do pliku JSON (najpierw aktualny stan)
      saveGame();
      const txt = localStorage.getItem(SAVE_KEY) || '{}', d = new Date(Date.now()), pad = x => String(x).padStart(2, '0');
      const name = `arena_save_lv${me.lvl}_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.json`;
      const url = URL.createObjectURL(new Blob([txt], { type: 'application/json' }));
      const l = document.createElement('a'); l.href = url; l.download = name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      say(`Save exported (${name})`);
    }
    else if (act === 'import') $('dvfile').click();
    else if (act === 'spawn') {   // spawn przedmiotu po ID (rozpiska: ITEM_IDS.md)
      const g = k => p.querySelector(`[data-dv="${k}"]`).value;
      p.dataset.sid = g('sid'); p.dataset.srar = g('srar'); p.dataset.sqty = g('sqty');
      const it = spawnItem(Math.floor(+g('sid')), +g('srar'), Math.max(1, Math.floor(+g('sqty') || 1)));
      if (it) say(`DEV: spawned <b class="t${it.r || 0}">${it.name}</b> (ID ${Math.floor(+g('sid'))})`); else say(`DEV: no item with ID ${g('sid')}`, 'miss');
      render(); draw();
    }
    else if (act === 'apply') {   // ustawienie statystyk postaci (podstawowe, bez przedmiotów)
      const v = k => { const e2 = p.querySelector(`[data-dv="${k}"]`); return Math.max(0, Math.floor(+e2.value || 0)); };
      me.lvl = Math.min(MAX_LVL, Math.max(1, v('lvl'))); me.xp = 0;
      window.G_GLOBAL = v('gold'); me.str = v('str'); me.dex = v('dex'); me.con = v('con'); me.sp = v('sp');
      say(`DEV: level ${me.lvl}, gold ${window.G_GLOBAL}, STR ${me.str} / DEX ${me.dex} / VIT ${me.con}, ${me.sp} skill points`);
      render(); draw();
    }
  });
  document.addEventListener('change', e => {
    const p = $('devpanel'); if (!p || !p.contains(e.target)) return;
    if (e.target.dataset.dvf) { setFlag(e.target.dataset.dvf, e.target.checked); render(); return; }
    if (e.target.id === 'dvfile' && e.target.files[0]) {   // import: wczytanie pliku, nadpisanie zapisu DEV i restart gry
      const f = e.target.files[0], rd = new FileReader();
      rd.onload = () => {
        try { JSON.parse(rd.result); } catch (er) { alert('This file is not a valid Arena save.'); return; }
        if (!confirm(`Load save "${f.name}"? Your current ${DEV ? 'DEV ' : ''}game will be replaced.`)) return;
        resetSave();   // blokuje autozapis, żeby nie nadpisał importu przed przeładowaniem
        try { localStorage.setItem(SAVE_KEY, rd.result); } catch (er) {}
        location.reload();
      };
      rd.readAsText(f);
    }
  });
}

// ŁOWIENIE: sprawdzanie brań co 100 ms (ryba trafia do plecaka najwyżej 0,1 s po czasie, niezależnie od zakładki),
// a pasek postępu odświeża się co klatkę (requestAnimationFrame) – płynnie, bez skoków co sekundę
setInterval(() => { if (fishTick()) { render(); playFx(); } }, 100);
(function fishBarLoop() { updateFishUI(); requestAnimationFrame(fishBarLoop); })();

// QUESTY: co sekundę licznik do resetu; po czasie – nowa pula (gdy nie trwa walka)
setInterval(() => {
  if (!me.quests) return;
  if (Date.now() >= me.quests.t) { if (!busy) { genQuests(); if (view == 'exp') render(); } return; }
  const e = document.querySelector('#quest-side [data-questcd]'); if (e) e.textContent = fmtCd(me.quests.t - Date.now());
}, 1000);
// SKLEP: co sekundę licznik do odświeżenia; po czasie – nowe przedmioty
setInterval(() => {
  if (!me.shop) return;
  if (Date.now() >= me.shop.t) { if (view == 'shop' && !busy) render(); return; }   // render() → ensureShop() losuje nowy towar
  const e = document.querySelector('#body-shop [data-shopcd]'); if (e) e.textContent = fmtCd(me.shop.t - Date.now());
}, 1000);
// LOCH: co sekundę odliczanie przerw na kafelkach i przycisku walki; po końcu przerwy – pełne odświeżenie
setInterval(() => {
  if (view != 'dun' || dloc == null || busy) return;
  let ended = false;
  document.querySelectorAll('#body-dun .dcd').forEach(e => { const ms = dunCd(+e.dataset.cd); if (ms <= 0) ended = true; else e.textContent = fmtCd(ms); });
  const go = $('go'), m = curMob();
  if (m && dsel >= 0) { const ms = dunCd(dsel); if (ms > 0) go.textContent = `Next fight in ${fmtCd(ms)}`; else if (go.textContent !== 'Fight!') ended = true; }
  if (ended) render();
}, 1000);

let buffWasActive = false, strWas = false, dexWas = false, foodWas = false;
setInterval(() => {
  const now = Date.now(), strOn = now < buffStrEnd, dexOn = now < buffDexEnd, foodOn = now < foodBuff.end;
  if (strOn || dexOn || foodOn || buffWasActive) renderBuffs();   // także raz po wygaśnięciu – czyści wiersz
  if ((strWas && !strOn) || (dexWas && !dexOn) || (foodWas && !foodOn)) render();   // zwój albo jedzenie wygasło – odśwież statystyki
  strWas = strOn; dexWas = dexOn; foodWas = foodOn; buffWasActive = strOn || dexOn || foodOn;
}, 1000);

buildNav();
// nagłówek karty ulepszania (w index.html jest jeszcze stara nazwa "Rod Upgrade")
const upgH = document.querySelector('#v-upgrade h2'); if (upgH) upgH.textContent = 'Tackle Upgrade';
// panel łowienia bez nagłówka „Fishing” (nazwa jest już w zakładce w lewym menu)
const fishH = document.querySelector('#v-fish h2'); if (fishH) fishH.remove();
// sklep bez nagłówka „Shop”
const shopH = document.querySelector('#v-shop h2'); if (shopH) shopH.remove();
// ===== POSTĘP OFFLINE =====
// Po powrocie do gry: jeśli przy zapisie trwało łowienie i jest AFK Fishing, liczymy brania od zapisu do teraz (maks. 1–3 h, zależnie od rangi) – z dropami, Fishpedią itd.
// Wynik w oknie „While you were away”; rzadkie dropy (epic+) dostają baner po kliknięciu Collect. Krótka nieobecność (< 1 min) – bez okna.
// AFK FISHING: postęp offline działa TYLKO po kupieniu keystone „AFK Fishing” w Fishing Skill Tree (limit w godzinach: fub().afk – 1 / 2 / 3 h).
// Bez niego: po powrocie łowienie trwa dalej, ale pasek startuje od zera – ryby z czasu nieobecności przepadają.
const fmtHours = h => { const m = Math.round(h * 60); return m % 60 ? (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`) : `${m / 60} h`; };   // 1.333 h → „1 h 20 min”
function processOffline(t0) {
  if (!t0 || !fishing.active) return;
  const OFFLINE_CAP_H = fub().afk, OFFLINE_CAP = OFFLINE_CAP_H * 3600 * 1000;
  if (!OFFLINE_CAP_H) { scheduleCatch(Date.now()); return; }
  const now = Date.now(), end = Math.min(now, t0 + OFFLINE_CAP), away = now - t0;
  const snap = new Map(inv.map(x => [x, x.qty || 1])), cnt0 = { ...(fishing.count || {}) }, sp0 = fishing.sp || 0;
  offlineLog = { pedia: [] }; sayMute = true;
  try { fishTick(end, true); } finally { sayMute = false; }
  const pedia = offlineLog.pedia; offlineLog = null; fxQueue = [];
  if (fishing.active && end < now) scheduleCatch(now);   // limit 8 h: dalej łowimy od teraz
  const fish = FISH.map(f => ({ f, n: pediaCount(f.id) - (cnt0[f.id] || 0) })).filter(x => x.n > 0);
  const items = [];
  inv.forEach(x => { if (x.mat && FISH.some(f => f.id === x.sl)) return; const q = (x.qty || 1) - (snap.has(x) ? snap.get(x) : 0); if (q > 0) items.push({ it: x, q }); });
  saveGame();
  if (away < 60000 || (!fish.length && !items.length)) return;
  const h = Math.floor(away / 3600000), m = Math.floor(away % 3600000 / 60000), time = h ? `${h} h ${m} min` : `${m} min`;
  const total = fish.reduce((a, x) => a + x.n, 0);
  let i = 0;
  const cell = (inner, r, qty, attr) => `<div class="cell r${r} fx-in${r >= 3 ? ' rare' : ''}" style="--fc:${RCOL(r)};animation-delay:${(i++) * 70}ms" ${attr}>${inner}${qty > 1 ? `<span class="qty">${qty}</span>` : ''}</div>`;
  const ov = document.createElement('div'); ov.id = 'offline-ov';
  ov.innerHTML = `<div class="off-box"><h2>While you were away</h2>`
    + `<div style="color:var(--mut)">You were away for <b style="color:var(--tx)">${time}</b>${end < now ? ` (fishing counts up to ${fmtHours(OFFLINE_CAP_H)})` : ''}</div>`
    + `<div class="off-sec">Fish caught: <span style="color:var(--ac)">${total}</span></div><div class="off-grid">${fish.map(x => cell(matIco(x.f.id, 40, 28), MATS[x.f.id].r || 0, x.n, `data-tip="<b>${x.f.name}</b>Caught: ${x.n}"`)).join('')}</div>`
    + (items.length ? `<div class="off-sec">Loot</div><div class="off-grid">${items.map(x => cell(sizeIco(x.it, 40), x.it.r || 0, x.q, `data-it="inv:${inv.indexOf(x.it)}"`)).join('')}</div>` : '')
    + (pedia.length ? `<div class="off-sec">Fishpedia</div>${pedia.map(t => `<div style="color:#f2c200">${t}</div>`).join('')}` : '')
    + (fishing.sp > sp0 ? `<div style="margin-top:6px">Fishing Skill Points: <b class="t2" style="display:inline">+${fishing.sp - sp0}</b></div>` : '')
    + (!fishing.active ? `<div style="margin-top:8px;color:var(--hp)">Fishing stopped: not enough FP.</div>` : '')
    + `<button id="off-ok" style="margin-top:16px;width:100%;font-weight:700;background:var(--ac);color:#fff;border-color:var(--ac)">Collect</button></div>`;
  document.body.appendChild(ov);
  $('off-ok').onclick = () => {
    ov.remove(); const tip = $('tip'); if (tip) tip.style.display = 'none'; tip2.style.display = 'none';
    items.filter(x => (x.it.r || 0) >= 3 && !x.it.mat).forEach(x => rareBanner(x.it));   // rzadkie JEDNORAZOWE dropy: baner po kolei
  };
}
processOffline(savedAt);
startAutosave();
// NEW GAME: kasuje zapis bieżącego trybu (DEV i zwykła gra mają osobne zapisy) i zaczyna od nowa
const newBtn = document.createElement('button');
newBtn.id = 'newgamebtn'; newBtn.textContent = '↺ New game'; newBtn.title = 'Deletes the save of this mode and starts over';
newBtn.style.cssText = 'position:fixed;left:12px;bottom:46px;z-index:60;font-weight:700;font-size:12px;opacity:.85';
newBtn.onclick = () => { if (confirm(`Start a new ${DEV ? 'DEV ' : ''}game? Your current ${DEV ? 'DEV ' : ''}save will be deleted.`)) resetSave(); };
document.body.appendChild(newBtn);
// niezebrany łup z wyprawy (strona odświeżona przed Collect) → plecak
if (me.pendLoot) { deliverLoot(me.pendLoot); delete me.pendLoot; }
render();
