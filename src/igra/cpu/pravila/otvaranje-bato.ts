import { TRICA, GENITIV_BOJE, BOJE } from '../../karte.ts';
import { ima, najmanja } from '../situacija.ts';
import { type Pravilo, sBatom } from './tip.ts';

// t. 3: boja za batiti (trica barem četvrta) otvara se uz bato.
export const otvaranjeBato: Pravilo = {
  id: 'otvaranje-bato',
  tocka: 't. 3',
  lekcija: 'otvaranje-1',
  faza: 'otvaranje',
  prioritet: 55,
  primijeni: (s) => {
    if (!s.prviOdRuke) return null;
    const kandidati = s.poBoji
      .map((k, b) => ({ k, b }))
      .filter(({ k }) => k.length >= 4 && ima(k, TRICA))
      .sort((x, y) => y.k.length - x.k.length);
    if (!kandidati.length) return null;
    return { karta: najmanja(kandidati[0].k), signal: sBatom(s) };
  },
  objasnjenje: (_s, p) => `Trica ${GENITIV_BOJE[BOJE[Math.floor(p.karta / 10)]]} barem četvrta: otvara se ta boja${p.signal ? ' uz bato' : ''}, partner zna gdje se može osloniti na tricu.`,
};
