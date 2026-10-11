import { LOKATIV_BOJE, BOJE } from '../../karte.ts';
import { najmanja, partnerovBato } from '../situacija.ts';
import type { Pravilo } from './tip.ts';

// Bato (kod nas): "vrati mi manjom". Kad uzmeš ruku, vrati se u partnerovu boju manjom kartom.
export const povratakBato: Pravilo = {
  id: 'povratak-bato',
  tocka: 'bato',
  lekcija: 'signali',
  faza: 'nastavak',
  prioritet: 75,
  primijeni: (s) => {
    if (!s.vodim) return null;
    const boje = partnerovBato(s);
    if (!boje.length) return null;
    return { karta: najmanja(s.poBoji[boje[0]]), signal: null };
  },
  objasnjenje: (_s, p) => `Partner je batio u ${LOKATIV_BOJE[BOJE[Math.floor(p.karta / 10)]]}: vraća mu se manjom kartom.`,
};
