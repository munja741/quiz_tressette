// Kako se akuža ispisuje na stolu.
import { boja, BOJE, GENITIV_BOJE, LOKATIV_BOJE } from './karte.ts';
import type { Kombinacija } from './dijeljenje.ts';

/** "3 trice (bez kupa)", "4 aša", "napolitana u dinarima". Kod četiri iste nema zagrade: velika je u svim bojama. */
export function opisKombinacije(k: Kombinacija): string {
  if (k.vrsta === 'napolitana') return `napolitana u ${LOKATIV_BOJE[BOJE[k.kljuc]]}`;
  const ime = ['trice', 'duje', 'aša'][k.kljuc];
  if (k.vrsta === 'cetiri') return `4 ${ime}`;
  // tri iste: u zagradi boja koja nedostaje
  const boje = k.karte.map(boja);
  const nema = [0, 1, 2, 3].find((b) => !boje.includes(b))!;
  return `3 ${ime} (bez ${GENITIV_BOJE[BOJE[nema]]})`;
}
