import { R } from './data.js';

// PANCERZ: redukcja obrażeń = X / (X + K × poziom ATAKUJĄCEGO), maks. 50%. X = pancerz broniącego się.
// K = 37.5: pełny złoty zestaw na 80 poziomie (~3000 pancerza) = 50% przeciw przeciwnikowi 80 poziomu (3000 / (3000 + 37.5 × 80)).
export const ARMOR_K = 37.5, ARMOR_CAP = 0.5;
export const armorRed = (arm, attLvl) => Math.min(ARMOR_CAP, Math.max(0, arm) / (Math.max(0, arm) + ARMOR_K * Math.max(1, attLvl || 1)));

// Każdy atak trafia (brak uników). Zręczność wpływa tylko na szansę krytyka.
// A.critPen (0–1) = część pancerza ignorowana przy krytyku (Soul Sunder: 0.5).
// A.critBonus (%) = dodatkowe obrażenia krytyka (Bloodlust: 10% / 20% / 30%) – krytyk = ×critMul × (1 + critBonus/100).
// A.critMul = bazowy mnożnik krytyka: wrogowie ×1.8, gracz ×1.8 + nadwyżka Dexterity ponad próg 50% (state.js, der).
// Po każdym ciosie hit.crit = czy był krytyk.
// fig = postać ATAKUJĄCEGO (wyskakuje w stronę przeciwnika: Ty w prawo, wróg w lewo)
export function hit(att, def, A, D, fig, sayCallback) {
  const c = Math.random() * 100 < A.crit;
  const arm = D.arm * (c ? 1 - (A.critPen || 0) : 1);
  // PANCERZ: procentowa redukcja zależna od poziomu atakującego (A.lvl), maks. 50% – armorRed() wyżej
  let dm = Math.max(1, R(A.min, A.max) * (1 - armorRed(arm, A.lvl)));
  if (c) dm *= (A.critMul || 1.8) * (1 + (A.critBonus || 0) / 100);
  dm = Math.round(dm);
  // A.force = cios zadaje dokładnie tyle obrażeń (Death Sentence: całe pozostałe HP wroga), A.forceTag = dopisek w logu
  if (A.force) dm = A.force;
  hit.crit = c;

  if (fig) {
    fig.classList.add(fig.id === 'fp' ? 'hit' : 'hit2');
    setTimeout(() => fig.classList.remove('hit', 'hit2'), 180);
  }
  // "You deal" / "Wolf deals" – poprawna forma czasownika po angielsku
  const tag = A.forceTag ? ` – ${A.forceTag}` : c ? ' – CRITICAL HIT!' : '';
  sayCallback(`${att} ${att === 'You' ? 'deal' : 'deals'} <b>${dm}</b> damage${tag}`, c || A.forceTag ? 'crit' : '');
  return dm;
}
