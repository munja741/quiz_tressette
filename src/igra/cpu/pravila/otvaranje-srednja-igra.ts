import { velika, GENITIV_BOJE, BOJE } from '../../karte.ts';
import { najjaca } from '../situacija.ts';
import type { Pravilo } from './tip.ts';

// t. 2: srednja igra u tri boje i tri karte bez velikih u četvrtoj: otvori tu najslabiju boju, bez signala.
export const otvaranjeSrednjaIgra: Pravilo = {
  id: 'otvaranje-srednja-igra',
  tocka: 't. 2',
  lekcija: 'otvaranje-1',
  faza: 'otvaranje',
  prioritet: 45,
  primijeni: (s) => {
    if (!s.prviOdRuke) return null;
    const slabe = [0, 1, 2, 3].filter((b) => s.poBoji[b].length === 3 && !s.poBoji[b].some(velika));
    if (slabe.length !== 1) return null;
    const ostale = [0, 1, 2, 3].filter((b) => b !== slabe[0]);
    if (!ostale.every((b) => s.poBoji[b].some(velika))) return null;
    return { karta: najjaca(s.poBoji[slabe[0]]), signal: null };
  },
  objasnjenje: (_s, p) => `Srednja igra u tri boje: otvara se najslabija boja, ${GENITIV_BOJE[BOJE[Math.floor(p.karta / 10)]]}, bez signala. Partner saznaje gdje nema igre.`,
};
