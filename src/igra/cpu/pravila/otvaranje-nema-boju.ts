import { bele, TRICA, DUJA, GENITIV_BOJE, BOJE } from '../../karte.ts';
import { ima, najmanja, zabranjeneZaOtvaranje } from '../situacija.ts';
import { type Pravilo, sBatom } from './tip.ts';

// t. 4: kad nemaš jednu boju, kreni s najjačom igrom.
export const otvaranjeNemaBoju: Pravilo = {
  id: 'otvaranje-nema-boju',
  tocka: 't. 4',
  lekcija: 'otvaranje-1',
  faza: 'otvaranje',
  prioritet: 50,
  primijeni: (s) => {
    if (!s.prviOdRuke || !s.poBoji.some((k) => k.length === 0)) return null;
    const zab = zabranjeneZaOtvaranje(s);
    const snaga = (b: number) => s.poBoji[b].reduce((x, k) => x + bele(k), 0) + s.poBoji[b].length;
    const boje = [0, 1, 2, 3].filter((b) => s.poBoji[b].length && !zab.has(b)).sort((a, b) => snaga(b) - snaga(a));
    if (!boje.length) return null;
    const k = s.poBoji[boje[0]];
    const bato = ima(k, TRICA) || ima(k, DUJA);
    return { karta: najmanja(k), signal: bato ? sBatom(s) : null };
  },
  objasnjenje: (_s, p) => `Nema jedne boje: kreće se s najjačom igrom, ${GENITIV_BOJE[BOJE[Math.floor(p.karta / 10)]]}.`,
};
