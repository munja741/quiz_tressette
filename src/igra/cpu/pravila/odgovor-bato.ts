import { boja } from '../../karte.ts';
import { najjaca } from '../situacija.ts';
import type { Pravilo } from './tip.ts';

// Bato (kod nas): "igraj najjaču i vrati mi manjom". Partner stavlja najjaču kartu te boje.
export const odgovorBato: Pravilo = {
  id: 'odgovor-bato',
  tocka: 'bato',
  lekcija: 'signali',
  faza: 'odgovor',
  prioritet: 80,
  primijeni: (s) => {
    if (s.vodim || s.p.tekuciSignal !== 'bato' || s.p.otvaraTekucu !== s.partner) return null;
    const uBoji = s.dop.filter((k) => boja(k) === s.otvorenaBoja);
    if (!uBoji.length) return null;
    return { karta: najjaca(uBoji), signal: null };
  },
  objasnjenje: () => 'Partner je batio: igra se najjača karta te boje.',
};
