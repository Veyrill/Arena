import { allMobsFlat, UPG, DEV, makeUnique, makeFixed, devFlag, GEAR_SETS } from './data.js';

// sp = skill points: +1 za każdy zdobyty poziom, każdy skill w drzewku kosztuje 1 sp
// start: 0 skill pointów (także w DEV) – punkty tylko z awansów; w DEV można je ustawić w panelu (Character → Skill Points)
export let me = { lvl: 1, xp: 0, str: 10, dex: 10, con: 10, sp: 0 };
// startowa broń: brązowy miecz z sepią (rust) – wygląda na zardzewiały
export let eq1 = { weapon: { sl: 'weapon', r: 0, name: 'Rusty Sword', ic: 'sword_bronze', rust: 1, s: {}, d: [4, 6], dv: 2 } };
export let eq2 = {};
// DEV: 999 każdego surowca i 100 000 złota; normalnie pusty plecak i 0 złota
export let inv = DEV ? [
  { sl: 'meat', r: 0, name: 'Meat', mat: 1, qty: 999, val: 10, s: {} },
  { sl: 'claw', r: 0, name: 'Bear Paw', mat: 1, qty: 999, val: 20, s: {} },
  { sl: 'bone', r: 0, name: 'Bone', mat: 1, qty: 999, val: 10, s: {} },
  { sl: 'skull', r: 0, name: 'Skull', mat: 1, qty: 999, val: 25, s: {} },
  { sl: 'fish_carp', r: 0, name: 'Crucian Carp', mat: 1, qty: 999, val: 15, s: {} },
  { sl: 'fish_cod', r: 1, name: 'Cod', mat: 1, qty: 999, val: 40, s: {} },
  // DEV: każda ryba po 999
  { sl: 'fish_catfish', r: 2, name: 'Catfish', mat: 1, qty: 999, val: 80, s: {} },
  { sl: 'fish_barracuda', r: 2, name: 'Barracuda', mat: 1, qty: 999, val: 150, s: {} },
  { sl: 'fish_anglerfish', r: 3, name: 'Anglerfish', mat: 1, qty: 999, val: 300, s: {} },
  { sl: 'fish_shark', r: 3, name: 'Shark', mat: 1, qty: 999, val: 500, s: {} },
  { sl: 'fish_leviathan', r: 4, name: 'Leviathan', mat: 1, qty: 999, val: 1000, s: {} },
  { sl: 'catfish_scale', r: 2, name: 'Catfish Scale', mat: 1, qty: 999, val: 50, s: {} },   // DEV: materiał do ulepszania kompletu Angler
  { sl: 'eye_of_cod', r: 1, name: 'Eye of Cod', mat: 1, qty: 999, val: 30, s: {} },   // DEV: materiał z Dorsza (uncommon)
  { sl: 'barracuda_fang', r: 2, name: 'Barracuda Fang', mat: 1, qty: 999, val: 75, s: {} },   // DEV: materiał z Barrakudy (rare)
  { sl: 'light_of_anglerfish', r: 3, name: 'Light of Anglerfish', mat: 1, qty: 999, val: 150, s: {} },   // DEV: materiał z Żabnicy (epic) – crafting Sea Raider
  { sl: 'pearl_of_the_deep', r: 4, name: 'Pearl of the Deep', mat: 1, qty: 999, val: 400, s: {} },   // DEV: materiał z Lewiatana (legendary)
  { sl: 'shark_fin', r: 3, name: 'Shark Fin', mat: 1, qty: 999, val: 250, s: {} },   // DEV: materiał z Rekina (epic) – ulepszenie wędki i haczyka rare → epic
  // DEV: wędka każdej rzadkości (common → legendary; mityczna tymczasowo usunięta z gry); FP: 25 / 60 / 110 / 175 / 275 (jak ROD_TIERS w fishing.js)
  ...[['Stick and String', 25], ['Uncommon Rod', 60], ['Rare Rod', 110], ['Epic Rod', 175], ['Legendary Rod', 275]]
    .map(([name, fp], r) => ({ sl: 'weapon', r, name, isFishGear: 1, val: 250, fp, s: {} })),
  // DEV: haczyk każdej rzadkości (common → legendary; mityczny tymczasowo usunięty z gry); FP: 15 / 40 / 70 / 105 / 165 (jak HOOK_TIERS w fishing.js)
  ...[['Fishing Hook', 15], ['Uncommon Hook', 40], ['Rare Hook', 70], ['Epic Hook', 105], ['Legendary Hook', 165]]
    .map(([name, fp], r) => ({ sl: 'hook', r, name, isFishGear: 1, fp, val: 10, s: {} })),
  // DEV: każdy NOWY przedmiot od razu w plecaku (zasada projektu)
  // makeUnique('lure_hood'),   // Abyssal Lure Hood (mityczny) – TYMCZASOWO usunięty z gry
  makeFixed('forgotten_edge'),              // miecz z lochu Forgotten Edge (rare, wymaga 12 poziomu)
  makeFixed('forgotten_cuirass'),           // zbroja z lochu Forgotten Cuirass (rare, wymaga 12 poziomu)
  makeFixed('forgotten_pendant'),           // wisior z lochu Forgotten Pendant (rare, wymaga 12 poziomu)
  makeFixed('forgotten_aegis'),
  makeFixed('forgotten_fang'),              // nóż z lochu Forgotten Fang (rare, Spiderling 2%, wymaga 12 poziomu)             // tarcza z lochu Forgotten Aegis (rare, wymaga 12 poziomu)
  // akt 2 – nowe zbroje (losowe statystyki w grze; tu przykładowe epic na start DEV)
  { sl: 'armor', r: 3, name: 'Epic Plate Armor', ic: 'armor_plate', s: { arm: 60, con: 8, str: 6 } },
  { sl: 'armor', r: 3, name: 'Epic Scale Mail', ic: 'armor_scale', s: { arm: 60, dex: 8, con: 6 } },
  { sl: 'armor', r: 3, name: 'Epic Brigandine', ic: 'armor_brigandine', s: { arm: 60, str: 8, dex: 6 } },
  // akt 2 – nowe tarcze (przykładowe epic na start DEV)
  { sl: 'shield', r: 3, name: 'Epic Knight Shield', ic: 'shield_knight', s: { arm: 45, con: 8, str: 6 } },
  { sl: 'shield', r: 3, name: 'Epic Drake Shield', ic: 'shield_drake', s: { arm: 45, dex: 8, con: 6 } },
  { sl: 'shield', r: 3, name: 'Epic Shadow Shield', ic: 'shield_shadow', s: { arm: 45, str: 8, dex: 6 } },
  // akt 2 – nowe hełmy (przykładowe epic na start DEV)
  { sl: 'helm', r: 3, name: 'Epic Knight Helm', ic: 'helm_knight', s: { arm: 40, con: 8, str: 6 } },
  { sl: 'helm', r: 3, name: 'Epic Drake Helm', ic: 'helm_drake', s: { arm: 40, dex: 8, con: 6 } },
  { sl: 'helm', r: 3, name: 'Epic Shadow Helm', ic: 'helm_shadow', s: { arm: 40, str: 8, dex: 6 } },
  makeFixed('chitin_carapace'),             // zbroja z lochu Chitin Carapace (rare, Spider Servant, wymaga 21 poziomu)
  makeFixed('silkstep_boots'),              // buty z lochu Silkstep Boots (rare, Spider Servant, wymaga 21 poziomu)
  makeFixed('spider_eye_charm'),
  makeFixed('chitin_halberd'),              // halabarda z lochu Chitin Halberd (rare, Spider Servant 6%, wymaga 21 poziomu)
  makeFixed('widow_spear'),                 // włócznia z lochu Widow Spear (rare, Spider Queen, wymaga 26 poziomu)
  makeFixed('widow_ring'),                  // pierścień z lochu Widow Ring (rare, Spider Queen)
  makeFixed('widowgrip_gauntlets'),         // rękawice z lochu Widowgrip Gauntlets (rare, Spider Queen)
  makeFixed('widow_helm'),
  makeFixed('widows_heart'),                // naszyjnik z lochu Widows Heart (epic, Spider Queen 0.4%, osobna nagroda)                  // hełm z lochu Widow Helm (rare, Spider Queen)            // talizman z lochu Spider Eye Charm (rare, Spider Servant, wymaga 21 poziomu)
  makeFixed('boonie'),                      // kapelusz do łowienia Angler Boonie (uncommon)
  makeFixed('wellies'),                     // kalosze do łowienia Angler Wellies (uncommon)
  makeFixed('parka'),                       // płaszcz do łowienia Angler Parka (uncommon)
  makeFixed('lantern'),                     // latarnia do łowienia Angler Lantern (uncommon)
  makeFixed('whisker_charm'),               // talizman do łowienia Catfish Whisker Charm (rare)
  makeFixed('whisker_amulet'),              // amulet do łowienia Catfish Whisker Amulet (rare)
  makeFixed('whisker_ring'),                // pierścień do łowienia Catfish Whisker Ring (rare)
  makeFixed('seasoned_cap'), makeFixed('seasoned_parka'), makeFixed('seasoned_wellies'), makeFixed('seasoned_lantern'),   // komplet Seasoned Angler (rare)
  makeFixed('hunter_helmet'), makeFixed('hunter_parka'), makeFixed('hunter_wellies'), makeFixed('hunter_lantern'),   // komplet Sea Raider (epic, z Anglerfish)
  makeFixed('shark_eye'),                   // talizman do łowienia Shark Eye Trophy (epic, special drop z Rekina)
  makeFixed('tide_ring'),                   // pierścień do łowienia Ring of the Tide (epic, crafting)
  makeFixed('lure_necklace'),               // naszyjnik do łowienia Anglerfish Lure Necklace (epic, z Anglerfish)
  makeFixed('king_crown'), makeFixed('king_plate'), makeFixed('king_boots'), makeFixed('king_lantern'),   // komplet Sea King (legendary, special drop z Lewiatana)
  // projekty Crafting Design (rare) – kliknięcie uczy przepisu Seasoned Angler w craftingu
  ...['seasoned_cap', 'seasoned_parka', 'seasoned_wellies', 'seasoned_lantern'].map(k => ({ isDesign: 1, kind: k, sl: 'design', r: 2,
    name: 'Crafting Design: ' + { seasoned_cap: "Seasoned Angler Cap", seasoned_parka: "Seasoned Angler Parka", seasoned_wellies: "Seasoned Angler Wellies", seasoned_lantern: "Seasoned Angler Lantern" }[k], val: 100, s: {} })),
  // projekty Crafting Design (epic) do kompletu Sea Raider – z Anglerfish
  ...['hunter_helmet', 'hunter_parka', 'hunter_wellies', 'hunter_lantern'].map(k => ({ isDesign: 1, kind: k, sl: 'design', r: 3,
    name: 'Crafting Design: ' + { hunter_helmet: 'Sea Raider Helmet', hunter_parka: 'Sea Raider Parka', hunter_wellies: 'Sea Raider Wellies', hunter_lantern: 'Sea Raider Lantern' }[k], val: 200, s: {} })),
  { isDesign: 1, kind: 'tide_ring', sl: 'design', r: 3, name: 'Crafting Design: Ring of the Tide', val: 200, s: {} },   // projekt (epic) z Barrakudy
  { isGuide: 1, sl: 'guide', r: 2, name: 'Fishing Guide', qty: 10, val: 50, s: {} },   // DEV: Fishing Guide (kliknięcie = +1 Fishing Skill Point)
  { isRecipe: 1, kind: 'cooked_carp', sl: 'recipe', r: 1, name: 'Recipe: Cooked Crucian Carp', val: 50, s: {} },  // przepis (zwój)
  { isRecipe: 1, kind: 'cooked_cod', sl: 'recipe', r: 1, name: 'Recipe: Cooked Cod', val: 50, s: {} },   // przepis (zwój)
  { isRecipe: 1, kind: 'grilled_catfish', sl: 'recipe', r: 2, name: 'Recipe: Grilled Catfish', val: 100, s: {} },   // przepis (zwój, rare)
  { isRecipe: 1, kind: 'steamed_barracuda', sl: 'recipe', r: 2, name: 'Recipe: Grilled Barracuda', val: 100, s: {} },   // przepis (zwój, rare) – z Barrakudy
  { isRecipe: 1, kind: 'anglerfish_stew', sl: 'recipe', r: 3, name: 'Recipe: Anglerfish Stew', val: 200, s: {} },   // przepis (zwój, epic) – z Żabnicy
  { isRecipe: 1, kind: 'shark_steak', sl: 'recipe', r: 3, name: 'Recipe: Shark Stew', val: 200, s: {} },   // przepis (zwój, epic) – z Rekina
  { isRecipe: 1, kind: 'abyssal_broth', sl: 'recipe', r: 4, name: 'Recipe: Abyssal Broth', val: 400, s: {} },   // przepis (zwój, legendary) – z Lewiatana
  { isChest: 1, sl: 'chest', r: 2, name: 'Sunken Chest', qty: 999, val: 100, s: {} },   // DEV: Sunken Chest (kliknięcie = otwarcie)
  // DEV: dania z Cooking (po 5 sztuk; wartość = 10 ryb × 1.2)
  ...[['cooked_carp', 'Cooked Crucian Carp', 1, 180], ['cooked_cod', 'Cooked Cod', 1, 480], ['grilled_catfish', 'Grilled Catfish', 2, 960], ['steamed_barracuda', 'Grilled Barracuda', 2, 1800],
    ['anglerfish_stew', 'Anglerfish Stew', 3, 3600], ['shark_steak', 'Shark Stew', 3, 6000], ['abyssal_broth', 'Abyssal Broth', 4, 12000]]
    .map(([kind, name, r, val]) => ({ isFood: 1, kind, sl: 'food', r, name, qty: 5, val, s: {} }))
] : [];
export let G = DEV ? 100000 : 0;
export let up = { str: 0, dex: 0, con: 0 };
// centerHp = środkowy skill "Surprise Attack" (nazwa zmiennej zostaje dla zgodności): 1 = kupiony
export let upgTree = { centerHp: 0, nodes: {} };
// sel = id zaznaczonej ryby do łowienia (domyślnie Crucian Carp)
// Brak poziomu i XP łowienia: dostęp do ryby zależy tylko od FP (FISH[].fp w data.js). DEV: każda ryba dostępna (canFish w fishing.js).
// Fishing Skill Points: na start 0, +1 po pierwszym złowionym Crucian Carp (DEV: 999), kolejne z przedmiotu Fishing Guide; wydawane w Fishing Skill Tree (zakładka Fishing)
export let fishing = { active: false, startAt: 0, nextAt: 0, rodLevel: 0, sel: 'fish_carp', hookGiven: false, sp: DEV ? 999 : 0, guides: {}, caught: {}, skills: {} };   // sp = Fishing Skill Points (start: 0, +1 za pierwszego Crucian Carp; DEV: 999); skills[id] = kupiona ranga w Fishing Skill Tree   // caught[id ryby] = złowiona choć raz (boczne menu pokazuje ją nawet przy za małym FP)   // guides[id ryby] = ile Fishing Guide zdobyto z tej ryby (limit: guideCap w ui.js)
export let upgradeItem = null;
export let equipPage = 1;
export let currentZoom = 1, panX = 0, panY = 0, panMoved = false, panDrag = null;
export let view = 'exp', eloc = null, esel = -1, dloc = null, dprog = 0;
export let busy = false, cdEnd = 0, sellMode = false, drag = null, lastMob = null, showInfo = false;
// eact = wybrany akt w Wyprawie (null = menu aktów), actsUnlocked = czy pokonano już Fire Lorda
export let eact = null, actsUnlocked = false;
// locUnlocked = indeks ostatniej odblokowanej lokacji Aktu 1 (0 = tylko Forest; kolejne po pokonaniu bossa poprzedniej)
export let locUnlocked = 0;
export function setLocUnlocked(v) { locUnlocked = v; }
export function setEact(v) { eact = v; }
export function setActsUnlocked(v) { actsUnlocked = v; }
export let showDunUnlockMsg = false;
export let dunMsgClosed = false;
export let showNoRodMsg = false;
export let buffStrEnd = 0;
export let buffDexEnd = 0;   // Scroll of Dexterity: +10% Zręczności do tego czasu
// BUFF Z JEDZENIA (Cooking): tylko jeden naraz – kind = danie, pct = +% maks. HP, end = do kiedy działa (30 min od zjedzenia)
export let foodBuff = { kind: null, pct: 0, end: 0 };
export let lastMouseE = null;

export function setEquipPage(v) { equipPage = v; }
export function setView(v) { view = v; }
export function setEloc(v) { eloc = v; }
export function setEsel(v) { esel = v; }
export function setDloc(v) { dloc = v; }
export function setDprog(v) { dprog = v; }
export function setBusy(v) { busy = v; }
export function setSellMode(v) { sellMode = v; }
export function setLastMouseE(v) { lastMouseE = v; }
export function setDrag(v) { drag = v; }
export function setPanDrag(v) { panDrag = v; }
export function setPanMoved(v) { panMoved = v; }
export function setPanX(v) { panX = v; }
export function setPanY(v) { panY = v; }
export function setCurrentZoom(v) { currentZoom = v; }
export function setShowInfo(v) { showInfo = v; }
export function setLastMob(v) { lastMob = v; }
// POPRAWKA: wcześniej te dwa settery nadpisywały same siebie (setX = v) zamiast zmiennej,
// przez co przy kolejnym wywołaniu leciał błąd "is not a function" (m.in. blokada gry po walce).
export function setShowDunUnlockMsg(v) { showDunUnlockMsg = v; }
export function setDunMsgClosed(v) { dunMsgClosed = v; }
export function setShowNoRodMsg(v) { showNoRodMsg = v; }
export function setCdEnd(v) { cdEnd = v; }
export function setBuffStrEnd(v) { buffStrEnd = v; }
export function setBuffDexEnd(v) { buffDexEnd = v; }
export function setUpgradeItem(v) { upgradeItem = v; }

// over = podmienione sloty ekwipunku bojowego, np. { weapon: przedmiot } – „policz mnie tak, jakbym to miał na sobie” (porównywarka)
export function gear(over) {
  const t = { dmin: 0, dmax: 0, arm: 0, str: 0, dex: 0, con: 0 };
  const currentEq = over ? Object.assign({}, eq1, over) : (equipPage === 1) ? eq1 : eq2;
  Object.values(currentEq).forEach(i => {
    if (i && !i.isFishGear) {
      for (const k in i.s) t[k] += i.s[k];
      if (i.d) { t.dmin += i.d[0]; t.dmax += i.d[1]; }
    }
  });
  return t;
}

// Eksportowana funkcja ub zbierająca wszystkie efekty skilli
export function ub() {
  // efrail..doom = efekty drzewka klątw (Curses); starsze klucze (ecrit, edmg, earm, efear, esign) zostają na 0
  // sunder = ranga Sunder (0–3), sunderCap = dawny limit z Exposed Weakness (już nieużywany; expose = +% obrażeń przy min. 2 klątwach na wrogu), hpPct = % maks. HP z Shadow Prayers,
  // mark = ranga Curse of the Void, rend = Soul Sunder (1/1), dexPct = % Dexterity z Unholy Grace, agony = Torment (1/1)
  // firstDmg = % dodatkowych obrażeń pierwszego ataku w walce (Determination, 10% za rangę)
  // strEff = dodatkowe obrażenia za punkt Strength (Brutal Force), warcry = War Cry (1/1), critBonus = % obrażeń krytyka (Bloodlust), endure = Endure (1/1)
  // critEff = dodatkowy % krytyka za punkt Dexterity (Cruelty), rage = % obrażeń broni za każdy krytyk w walce (Rage Within, 1% za rangę), fervor = ranga Battle Fervor
  // vitEff = dodatkowe HP za punkt Vitality (Headstrong), armPct = % pancerza z przedmiotów (Thick Skin); hpPct sumuje Shadow Prayers i Iron Will
  // barrier = % maks. HP jako tarcza na start walki (Elemental Barrier, 1.67% za rangę – 5% przy 3/3)
  // bolt = % średnich obrażeń pioruna przy 5 stosach Lightning Energy (Lightning Bolt, 15% za rangę)
  // boltGrow = o ile % mocniejszy każdy kolejny piorun w walce (Overcharge, 10% za rangę)
  // fire = % maks. HP wroga przy wybuchu stosów Fire Energy (Fire Incantation, 3.33% za rangę – 10% przy 3/3); burn = Lingering Flames (1/1)
  // water = % maks. HP leczenia przy 5 stosach Water Energy (Tidal Renewal, 2% za rangę); tide = % pancerza z Soothing Tide (40, 1/1); critDown = −% krytyka wroga (Mist Veil, 3 za rangę)
  // elemMaster = Master of All Elements (1/1): Incantations przy 4 stosach zamiast 5
  const t = { str: 0, dex: 0, con: 0, ecrit: 0, edodge: 0, edmg: 0, earm: 0, efear: 0, esign: 0, efrail: 0, sunder: 0, sunderCap: 0, hpPct: 0, mark: 0, rend: 0, dexPct: 0, agony: 0, firstDmg: 0, strEff: 0, warcry: 0, critBonus: 0, endure: 0, vitEff: 0, armPct: 0, critEff: 0, rage: 0, fervor: 0, barrier: 0, bolt: 0, boltGrow: 0, fire: 0, burn: 0, water: 0, tide: 0, critDown: 0, elemMaster: 0, exhaust: 0, lacerate: 0, expose: 0, reap: 0, fester: 0, doom: 0 };
  UPG.forEach(n => {
    if (upgTree.nodes[n.id] && n.eff) {
      // nodes[id] = kupiona ranga (1..max); efekt jednej rangi × ranga
      for (const k in n.eff) t[k] += n.eff[k] * upgTree.nodes[n.id];
    }
  });
  return t;
}

// HP_MUL: globalny mnożnik HP (gracz i wszyscy przeciwnicy) – dłuższe walki = mniej losowości. Obrażenia bez zmian.
export const HP_MUL = 1.7;
// PRZECIWNICY: wszyscy (wyprawa i lochy) mają 30% mniej HP (ENEMY_HP) i o 2 mniej Strength (ENEMY_STR) – słabsze ciosy
export const ENEMY_HP = 0.7, ENEMY_STR = -2;

// KRYTYK (podobnie jak pancerz): szansa = Dex / (Dex + CRIT_K × Twój poziom + CRIT_C), maks. CRIT_CAP (50%).
// Szybszy wzór (było K 13 / C 75): 50% osiągasz, gdy Dexterity = CRIT_K × poziom + CRIT_C (np. 30 poziom: 230 Dex, 80 poziom: 530 Dex).
// NADWYŻKA DEXTERITY: każdy punkt Dex ponad próg 50% = +0.1 pkt proc. obrażeń krytyka (CRIT_OVER) – bazowo krytyk ×1.8 (180%),
// np. 300 Dex ponad próg → ×2.1. Tylko gracz (wrogowie mają stałą szansę i ×1.8).
// Cruelty: Dexterity liczy się mocniej do krytyka (+8.33% za rangę, +25% przy 3/3) – także do nadwyżki.
export const CRIT_K = 6, CRIT_C = 50, CRIT_CAP = 50, CRIT_BASE = 1.8, CRIT_OVER = 0.001;
// BONUSY SETOWE (sprzęt bojowy, eq1 + ewentualnie porównywany przedmiot): { crit, critDmg, arm }
export function gearSetFx(over) {
  const e = over ? Object.assign({}, eq1, over) : eq1, t = { crit: 0, critDmg: 0, arm: 0 };
  for (const k in GEAR_SETS) {
    const S = GEAR_SETS[k], c = S.pieces.filter(p => Object.values(e).some(i => i && i.fixed === p)).length;
    S.bonus.forEach(b => { if (c >= b.n) for (const x in b.eff) t[x] += b.eff[x]; });
  }
  return t;
}
export function der(over) {
  const g = gear(over), u = ub(), sb = gearSetFx(over);
  let baseStr = me.str + g.str + u.str;
  if (Date.now() < buffStrEnd) baseStr *= 1.1;
  let baseDex = me.dex + g.dex + u.dex;
  if (Date.now() < buffDexEnd) baseDex *= 1.1;
  baseDex *= 1 + (u.dexPct || 0) / 100;   // Unholy Grace: +6.67% / 13.33% / 20% Dexterity
  const s = Math.round(baseStr), d = Math.round(baseDex), c = me.con + g.con + u.con;
  const hpPer = 4 + (u.vitEff || 0);   // HP za punkt Vitality (Headstrong: 4 → 5 przy 3/3)
  const baseHp = 40 + c * hpPer + me.lvl * 10;
  const foodPct = Date.now() < foodBuff.end ? foodBuff.pct : 0;   // jedzenie: +5…35% maks. HP (sumuje się z % ze skilli)
  const finalHp = Math.round(baseHp * HP_MUL * (1 + ((u.hpPct || 0) + foodPct) / 100));   // × HP_MUL (1.7)   // Shadow Prayers i Iron Will: po +6.67% / 13.33% / 20% maks. HP
  const dmgMul = 1 + (u.edmg || 0) / 100;
  // OBRAŻENIA = obrażenia broni × (1 + Strength / 100): każdy punkt Strength = +1% obrażeń broni.
  // Brutal Force podnosi to do +1.1% za punkt przy 3/3. Bez broni: pięści 1–2.
  const strDmg = (1 + (u.strEff || 0)) / 100;   // mnożnik za punkt Strength (0.01 → 0.011 przy 3/3)
  const wmin = g.dmin || 1, wmax = g.dmax || 2, strMul = 1 + s * strDmg;
  return {
    str: s,
    dex: d,
    con: c,
    hp: finalHp,
    hpPer,
    foodPct,
    strDmg,
    wmin, wmax, strMul,
    min: wmin * strMul * dmgMul,
    max: wmax * strMul * dmgMul,
    arm: Math.round((g.arm + sb.arm) * (1 + (u.armPct || 0) / 100)),   // Thick Skin: +10% pancerza z przedmiotów; sb.arm = bonus setowy (np. Chitin 3/3: +100)
    armSet: sb.arm,
    critDex: d * (1 + (u.critEff || 0) * 2.5),          // Dexterity liczona do krytyka (Cruelty: ×1.0833 za rangę → ×1.25 przy 3/3)
    critOver: Math.max(0, Math.round(d * (1 + (u.critEff || 0) * 2.5) - (CRIT_K * me.lvl + CRIT_C))),   // Dexterity ponad próg 50%
    critMul: CRIT_BASE + sb.critDmg / 100 + CRIT_OVER * Math.max(0, d * (1 + (u.critEff || 0) * 2.5) - (CRIT_K * me.lvl + CRIT_C)),   // mnożnik krytyka gracza (×1.8 + set + nadwyżka)
    critSet: sb.crit, critDmgSet: sb.critDmg,   // bonusy setowe (np. Forgotten 2/3: +5% krytyka, 3/3: +5% obrażeń krytyka)
    critRaw: 100 * d * (1 + (u.critEff || 0) * 2.5) / (d * (1 + (u.critEff || 0) * 2.5) + CRIT_K * me.lvl + CRIT_C),   // bez limitu (limit 50% nakładany w walce; Curse of the Void może go przekroczyć)
    crit: Math.min(CRIT_CAP, 100 * d * (1 + (u.critEff || 0) * 2.5) / (d * (1 + (u.critEff || 0) * 2.5) + CRIT_K * me.lvl + CRIT_C)) + sb.crit,   // + bonus setowy (ponad limit 50%)
    dodge: Math.min(35, d * 0.3)
  };
}

export function mstats(m, realHp) {   // realHp = zawsze prawdziwe HP (symulacja szansy wygranej w DEV)
  const idx = allMobsFlat.indexOf(m);
  const isExp = idx !== -1;
  const boost = isExp ? (1.05 ** idx) : 1;
  const L = m.sl ?? m.l;   // poziom do statystyk (Akt 1: dawny poziom 1–25 – balans bez zmian)
  const baseSt = Object.assign({ hp: 30 + L * 28, min: (4 + L * 3.2) * 0.8, max: (4 + L * 3.2) * 1.2, arm: L * 2, crit: 5, dodge: Math.min(30, (3 + L * 2) * 0.5), dex: 3 + L * 2 }, m.st || {});
  const U = ub(), A = (baseSt.min + baseSt.max) / 2 * boost, str = Math.max(0, (A - 2) / 0.6 + ENEMY_STR) * (1 - (U.esign || 0) / 100), kAtk = ((str * 0.6 + 2) / A) * (1 - (U.efear || 0) / 100);
  return {
    str,
    hp: !realHp && devFlag('onehp', true) ? 1 : Math.round(baseSt.hp * boost * (m.hpMul || 1) * HP_MUL * ENEMY_HP),   // × ENEMY_HP (0.7)   // × HP_MUL (1.7) – także lochy   // hpMul: wyprawa −10% HP, lochy 1   // DEV: każdy przeciwnik ma 1 HP (Curse of Frailty NIE zmniejsza maks. HP – tylko HP startowe, w ui.js)
    min: baseSt.min * boost * kAtk,
    max: baseSt.max * boost * kAtk,
    arm: baseSt.arm * boost * (1 - (U.earm || 0) / 100),
    crit: Math.max(0, baseSt.crit - (U.ecrit || 0)),
    dodge: Math.max(0, baseSt.dodge - (U.edodge || 0)),
    dex: baseSt.dex * boost
  };
}
