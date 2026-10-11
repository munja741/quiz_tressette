import { DUJA, TRICA, AS, karta, GENITIV_BOJE, BOJE } from '../../karte.ts';
import { ima } from '../situacija.ts';
import type { Pravilo } from './tip.ts';

// t. 11: s dujom+ašem i barem još jednom kartom otvara se dujom i traži se trica.
export const otvaranjeDujaAs: Pravilo = {
  id: 'otvaranje-duja-as',
  tocka: 't. 11',
  lekcija: 'otvaranje-2',
  faza: 'otvaranje',
  prioritet: 60,
  primijeni: (s) => {
    if (!s.prviOdRuke) return null;
    const kandidati = s.poBoji
      .map((k, b) => ({ k, b }))
      .filter(({ k }) => k.length >= 3 && ima(k, DUJA) && ima(k, AS) && !ima(k, TRICA))
      .sort((x, y) => y.k.length - x.k.length);
    if (!kandidati.length) return null;
    return { karta: karta(kandidati[0].b, DUJA), signal: null };
  },
  objasnjenje: (_s, p) => `S dujom+ašem ${GENITIV_BOJE[BOJE[Math.floor(p.karta / 10)]]} otvara se dujom i traži se trica.`,
};
