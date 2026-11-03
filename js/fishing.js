import { eq1, eq2, inv, fishing, upgradeItem } from './state.js';
import { DEV } from './data.js';

// Stopnie wędki: indeks = poziom ulepszenia = rzadkość wędki (item.r). fp = FP.
// WYGŁADZONE FP: jednostka rzadkości U = 10 / 25 / 45 / 70 / 110 (common → legendary) – tyle ma każda część setu i biżuteria;
// wędka = ok. 2.5 × U, haczyk = 1.5 × U. Mityczne (wędka 40, haczyk 50) – bez zmian, nie są dropem ze zwykłych ryb.
// fx = bonusy łowienia wędki / haczyka (jak FIXED_ITEMS.fx w data.js): wędka skraca czas łowienia, haczyk daje Double Catch.
// Wędki: Fishing time -3 / -6 / -9 / -15 / -23% (każda +3% względem pierwotnych). Fishing Hook (r 0) i mityczne – bez bonusów.
export const ROD_TIERS = [
  { r: 0, name: 'Stick and String', fp: 25, fx: { time: 3 } },   // szara (było 15)
  { r: 1, name: 'Uncommon Rod', fp: 60, fx: { time: 6 } },         // zielona (było 30)
  { r: 2, name: 'Rare Rod', fp: 110, fx: { time: 9 } },          // niebieska (było 90)
  { r: 3, name: 'Epic Rod', fp: 175, fx: { time: 15 } },          // fioletowa (było 180)
  { r: 4, name: 'Legendary Rod', fp: 275, fx: { time: 23 } },     // złota (było 270)
  { r: 5, name: 'Mythic Rod', fp: 40 }          // czerwona
];

// Stopnie haczyka: indeks = rzadkość haczyka (item.r). Każdy haczyk ma swój poziom (nie ma wspólnego licznika jak wędka).
// FP: 15 / 40 / 70 / 105 / 165 / 50 (wygładzone; było 10 / 20 / 60 / 120 / 180; mityczny bez zmian)
export const HOOK_TIERS = [
  { r: 0, name: 'Fishing Hook', fp: 15 },   // było 10
  { r: 1, name: 'Uncommon Hook', fp: 40, fx: { dbl: 3 } },
  { r: 2, name: 'Rare Hook', fp: 70, fx: { dbl: 6 } },
  { r: 3, name: 'Epic Hook', fp: 105, fx: { dbl: 12 } },
  { r: 4, name: 'Legendary Hook', fp: 165, fx: { dbl: 20 } },
  { r: 5, name: 'Mythic Hook', fp: 50 }
];

// Najwyższy poziom wędki (mityczna) – dalej nie da się ulepszać
// TYMCZASOWO bez mitycznej wędki i haczyka: ulepszanie kończy się na legendary (4). Żeby przywrócić mityczne: ROD_TIERS.length - 1 / HOOK_TIERS.length - 1.
export const MAX_ROD_LEVEL = 4;
export const MAX_HOOK_LEVEL = 4;

export function rodTier(level) {
  return ROD_TIERS[Math.min(level, MAX_ROD_LEVEL)];
}

// Koszt ulepszenia z danego poziomu na następny: { mat: id materiału, qty: ilość } – wspólny dla wędki i haczyka.
// UPGRADE_COSTS[poziom] = koszt przejścia z tego poziomu na następny:
//   0 → 1 (szara/common → zielona/uncommon): 15 Crucian Carp (było 10)
//   1 → 2 (zielona/uncommon → niebieska/rare): 15 Barracuda Fang (było 10)
//   2 → 3 (niebieska/rare → fioletowa/epic): 15 Shark Fin (było 10)
//   3 → 4 (fioletowa/epic → złota/legendary): 15 Pearl of the Deep (było 10)
// Ostatni poziom (→ mythic): jak dotąd Karasie, poziom + 1 (5); w DEV 1.
const UPGRADE_COSTS = [
  { mat: 'fish_carp', qty: 15 },
  { mat: 'barracuda_fang', qty: 15 },
  { mat: 'shark_fin', qty: 15 },
  { mat: 'pearl_of_the_deep', qty: 15 }
];
export const upgradeCost = level => UPGRADE_COSTS[level] || { mat: 'fish_carp', qty: DEV ? 1 : level + 1 };

// Nowa (szara) wędka – używana przy zakupie i w podglądzie w sklepie
export function makeRod() {
  const t = ROD_TIERS[0];
  return { sl: 'weapon', r: t.r, name: t.name, isFishGear: 1, val: 250, fp: t.fp, s: {} };
}

// Haczyk wędkarski – zakładany w slot "hook" na stronie 2 ekwipunku. Ulepszany w zakładce Tackle Upgrade.
export function makeHook() {
  const t = HOOK_TIERS[0];
  return { sl: 'hook', r: t.r, name: t.name, isFishGear: 1, fp: t.fp, val: 10, s: {} };
}

// Wędka (a nie np. haczyk)
export const isRod = i => !!(i && i.isFishGear && i.sl === 'weapon');
// Haczyk
export const isHook = i => !!(i && i.isFishGear && i.sl === 'hook');
// Co można włożyć do slotu ulepszania: wędka albo haczyk
export const isUpgradable = i => isRod(i) || isHook(i);

// Aktualny poziom przedmiotu w ulepszaniu = jego rzadkość (wędka i haczyk). Wcześniej wędka brała wspólny fishing.rodLevel,
// co psuło się przy kilku wędkach (DEV: wszystkie rarity w plecaku). W normalnej grze (jedna wędka) wynik jest ten sam.
export const gearLevel = i => (i && i.r) || 0;
export const gearMaxLevel = i => isRod(i) ? MAX_ROD_LEVEL : MAX_HOOK_LEVEL;

// Jak będzie wyglądać wędka po ulepszeniu (do podglądu w drugim slocie)
export function previewRod(item, level) {
  const t = rodTier(level + 1);
  const p = Object.assign({}, item, { r: t.r, name: t.name, fp: t.fp });
  delete p.fresh;
  return p;
}

// Podgląd po ulepszeniu dla wędki albo haczyka
export function previewGear(item) {
  if (isRod(item)) return previewRod(item, gearLevel(item));
  const t = HOOK_TIERS[Math.min(gearLevel(item) + 1, MAX_HOOK_LEVEL)];
  const p = Object.assign({}, item, { r: t.r, name: t.name, fp: t.fp });
  delete p.fresh;
  return p;
}

// Suma FP z założonego ekwipunku rybackiego (strona 2) + FP z Fishing Skill Tree (fishing.treeFp) + FP z Fishpedii (fishing.pediaFp) – oba liczone w ui.js
export function fishPower() {
  return Object.values(eq2).reduce((a, i) => a + (i && i.isFishGear ? (i.fp || 0) : 0), 0) + (fishing.treeFp || 0) + (fishing.pediaFp || 0);
}

// Czy można łowić daną rybę: wystarczające FP z ekwipunku rybackiego (fish.fp). Każde branie to 100% sukcesu.
// DEV: każdą rybę można łowić bez względu na FP.
export const canFish = fish => !!fish && (DEV || fishPower() >= fish.fp);

export function hasRod() {
  const inInv = inv.some(isRod);
  const inEq1 = Object.values(eq1).some(isRod);
  const inEq2 = Object.values(eq2).some(isRod);
  const inUpg = isRod(upgradeItem);
  return inInv || inEq1 || inEq2 || inUpg;
}

export function buyRod(renderCallback, sayCallback) {
  if (window.G_GLOBAL < 500 || hasRod()) return;
  window.G_GLOBAL -= 500;
  const rod = makeRod();
  rod.fresh = 1;
  inv.push(rod);
  sayCallback(`Bought a rod: <b class="t0">${rod.name}</b>!`);
  renderCallback();
}

// zabiera materiał na ulepszenie; false = za mało
function payUpgrade(level) {
  const cost = upgradeCost(level);
  const matItem = inv.find(x => x.mat && x.sl === cost.mat);
  if (!matItem || matItem.qty < cost.qty) return false;
  matItem.qty -= cost.qty;
  if (matItem.qty <= 0) inv.splice(inv.indexOf(matItem), 1);
  return true;
}

export function upgradeRod(renderCallback, sayCallback) {
  if (!isRod(upgradeItem)) return;

  const currentRodLevel = gearLevel(upgradeItem);   // poziom z rzadkości tej wędki
  if (currentRodLevel >= MAX_ROD_LEVEL) return;   // blokada: legendarna wędka to (tymczasowo) maksimum
  if (!payUpgrade(currentRodLevel)) return;

  fishing.rodLevel = currentRodLevel + 1;   // zostawione dla zgodności (nieużywane do obliczeń)
  const t = rodTier(fishing.rodLevel);
  upgradeItem.r = t.r;
  upgradeItem.name = t.name;
  upgradeItem.fp = t.fp;

  sayCallback(`Rod upgraded: <b class="t${t.r}">${t.name}</b>!`, 'crit');
  renderCallback();
}

// Ulepszenie tego, co leży w slocie ulepszania: wędka (jak dotąd) albo haczyk (common → … → mythic)
export function upgradeGear(renderCallback, sayCallback) {
  if (isRod(upgradeItem)) return upgradeRod(renderCallback, sayCallback);
  if (!isHook(upgradeItem)) return;
  const lvl = gearLevel(upgradeItem);
  if (lvl >= MAX_HOOK_LEVEL) return;   // legendarny haczyk to (tymczasowo) maksimum
  if (!payUpgrade(lvl)) return;
  const t = HOOK_TIERS[lvl + 1];
  upgradeItem.r = t.r;
  upgradeItem.name = t.name;
  upgradeItem.fp = t.fp;
  sayCallback(`Hook upgraded: <b class="t${t.r}">${t.name}</b>!`, 'crit');
  renderCallback();
}
