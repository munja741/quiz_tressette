import { boja, polozaj, karta, DUJA, TRICA, AS, GENITIV_BOJE, BOJE } from '../../karte.ts';
import type { Pravilo } from './tip.ts';

// t. 16: nakon otvaranja dujom (duja+aš), inzistiraj u toj boji dok trica ne padne.
export const nastavakDujaAs: Pravilo = {
  id: 'nastavak-duja-as',
  tocka: 't. 16',
  lekcija: 'otvaranje-2',
  faza: 'nastavak',
  prioritet: 40,
  primijeni: (s) => {
    if (!s.vodim || s.prviOdRuke) return null;
    const prva = s.p.odigrane[0];
    if (!prva || prva.otvara !== s.p.ja) return null;
    const otv = prva.karte[0].karta;
    if (polozaj(otv) !== DUJA) return null;
    const b = boja(otv);
    if (s.z.odigrano.has(karta(b, TRICA))) return null;
    const moje = s.poBoji[b];
    if (!moje.length) return null;
    const bezAsa = moje.filter((k) => polozaj(k) !== AS);
    const izbor = bezAsa.length ? bezAsa[0] : moje[0];
    return { karta: izbor, signal: null };
  },
  objasnjenje: (_s, p) => `Trica ${GENITIV_BOJE[BOJE[Math.floor(p.karta / 10)]]} još nije pala: inzistira se u boji duje+aša.`,
};
