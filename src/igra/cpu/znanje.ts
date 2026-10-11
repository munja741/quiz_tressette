// Vidljivo stanje i model znanja CPU igrača. CPU nikad ne vidi tuđe karte.

import { type Karta, boja, polozaj, SPIL, karta } from '../karte.ts';
import { type Dijeljenje, type Odigrano, type Ruka, type Signal, type Akuza, type Opcije, partnerOd } from '../dijeljenje.ts';

export interface Pogled {
  ja: number;
  djelitelj: number;
  opcije: Opcije;
  ruka: Karta[];
  tekuca: Odigrano[];
  tekuciSignal: Signal;
  otvaraTekucu: number;
  odigrane: Ruka[];
  akuza: Akuza[];
  brojKarata: number[];
  naPotezu: number;
}

const bezRazloga = (o: Odigrano): Odigrano => ({ igrac: o.igrac, karta: o.karta });

/** Samo ono što igrač na mjestu `ja` smije znati. */
export function vidljivoStanje(d: Dijeljenje, ja: number): Pogled {
  return {
    ja,
    djelitelj: d.djelitelj,
    opcije: { ...d.opcije },
    ruka: [...d.ruke[ja]],
    tekuca: d.tekuca.map(bezRazloga),
    tekuciSignal: d.tekuciSignal,
    otvaraTekucu: d.otvaraTekucu,
    odigrane: d.odigrane.map((r) => ({ ...r, karte: r.karte.map(bezRazloga) })),
    akuza: d.akuza.map((a) => ({ ...a, kombinacije: a.kombinacije.map((k) => ({ ...k, karte: [...k.karte] })) })),
    brojKarata: d.ruke.map((h) => h.length),
    naPotezu: d.naPotezu,
  };
}

export interface Znanje {
  ja: number;
  /** odigrane karte, uključujući tekuću ruku */
  odigrano: Set<Karta>;
  /** nemaBoju[igrac][boja] */
  nemaBoju: boolean[][];
  /** karte za koje se zna čije su (iz akuže), a još nisu odigrane */
  poznate: Map<Karta, number>;
  /** igrač ima barem `najmanje` od ovih karata (akuža tri iste) */
  ogranicenja: { igrac: number; karte: Karta[]; najmanje: number }[];
  /** karte koje nisu odigrane ni u mojoj ruci */
  nepoznate: Karta[];
  brojKarata: number[];
}

export function izgradiZnanje(p: Pogled): Znanje {
  const odigrano = new Set<Karta>();
  const nemaBoju = [0, 1, 2, 3].map(() => [false, false, false, false]);
  const sveRuke = [...p.odigrane.map((r) => r.karte), p.tekuca];
  for (const karte of sveRuke) {
    if (!karte.length) continue;
    const b = boja(karte[0].karta);
    for (const o of karte) {
      odigrano.add(o.karta);
      if (boja(o.karta) !== b) nemaBoju[o.igrac][b] = true;
    }
  }
  const moje = new Set(p.ruka);
  const poznate = new Map<Karta, number>();
  const ogranicenja: Znanje['ogranicenja'] = [];
  for (const a of p.akuza) {
    if (a.igrac === p.ja) continue;
    for (const k of a.kombinacije) {
      if (k.vrsta === 'cetiri' || k.vrsta === 'napolitana') {
        for (const c of k.karte) if (!odigrano.has(c)) poznate.set(c, a.igrac);
      } else {
        // tri iste: igrač ima 3 od 4 karte tog položaja
        const sve = [0, 1, 2, 3].map((b) => karta(b, k.kljuc));
        ogranicenja.push({ igrac: a.igrac, karte: sve, najmanje: 3 });
      }
    }
  }
  const nepoznate = SPIL.filter((k) => !odigrano.has(k) && !moje.has(k));
  return { ja: p.ja, odigrano, nemaBoju, poznate, ogranicenja, nepoznate, brojKarata: [...p.brojKarata] };
}

/** Je li karta najjača u boji: sve jače karte te boje su odigrane ili u mojoj ruci. */
export function najjacaUBoji(k: Karta, z: Znanje, ruka: Karta[]): boolean {
  const b = boja(k);
  for (let p = 0; p < polozaj(k); p++) {
    const c = karta(b, p);
    if (!z.odigrano.has(c) && !ruka.includes(c)) return false;
  }
  return true;
}

/** Koliko karata te boje još nije odigrano i nije u mojoj ruci. */
export const preostaloUBoji = (b: number, z: Znanje): number => z.nepoznate.filter((k) => boja(k) === b).length;

export { partnerOd };
