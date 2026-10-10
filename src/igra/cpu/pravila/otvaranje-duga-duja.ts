import { DUJA, TRICA, LOKATIV_BOJE, BOJE } from '../../karte.ts';
import { ima, najmanja } from '../situacija.ts';
import { type Pravilo, sBatom } from './tip.ts';

// t. 1: s dugom dujom (duja i još barem četiri karte, bez trice) uvijek se otvara ta boja.
// Talijanski rebato kod nas se daje batom.
export const otvaranjeDugaDuja: Pravilo = {
  id: 'otvaranje-duga-duja',
  tocka: 't. 1',
  lekcija: 'otvaranje-1',
  faza: 'otvaranje',
  prioritet: 70,
  primijeni: (s) => {
    if (!s.prviOdRuke) return null;
    const b = s.poBoji.findIndex((k) => k.length >= 5 && ima(k, DUJA) && !ima(k, TRICA));
    if (b < 0) return null;
    return { karta: najmanja(s.poBoji[b]), signal: sBatom(s) };
  },
  objasnjenje: (_s, p) => `Duga duja u ${LOKATIV_BOJE[BOJE[Math.floor(p.karta / 10)]]}: otvara se ta boja${p.signal ? ' uz bato, da partner stavi najjaču' : ''}.`,
};
