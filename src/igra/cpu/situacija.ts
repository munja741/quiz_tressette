// Situacija za stolom iz pogleda jednog igrača: sve što pravila i heuristika trebaju.

import { type Karta, boja, polozaj, bele, TRICA, DUJA, AS, uBoji } from '../karte.ts';
import { dopusteneKarte, pobjednikRuke, partnerOd, type Signal } from '../dijeljenje.ts';
import { type Pogled, type Znanje, izgradiZnanje, najjacaUBoji } from './znanje.ts';

export interface Potez { karta: Karta; signal: Signal }

export interface Situacija {
  p: Pogled;
  z: Znanje;
  dop: Karta[];
  /** karte po bojama, od najjače */
  poBoji: Karta[][];
  /** otvaram prvu ruku dijeljenja */
  prviOdRuke: boolean;
  /** otvaram neku ruku */
  vodim: boolean;
  /** položaj u ruci: 0 otvaram, 1, 2, 3 zadnji */
  pozicija: number;
  partner: number;
  /** boja otvorene ruke ili -1 */
  otvorenaBoja: number;
  /** tko trenutno drži ruku (ako ima karata) */
  drzi: number;
  /** karta koja trenutno drži ruku */
  drziKartu: Karta | -1;
  beleNaStolu: number;
}

export function situacija(p: Pogled): Situacija {
  const z = izgradiZnanje(p);
  const dop = dopusteneKarte(p.ruka, p.tekuca);
  const poBoji = [0, 1, 2, 3].map((b) => uBoji(p.ruka, b));
  const pozicija = p.tekuca.length;
  let drzi = -1;
  let drziKartu: Karta | -1 = -1;
  if (pozicija) {
    drzi = pobjednikRuke(p.tekuca);
    drziKartu = p.tekuca.find((o) => o.igrac === drzi)!.karta;
  }
  return {
    p,
    z,
    dop,
    poBoji,
    prviOdRuke: p.odigrane.length === 0 && pozicija === 0,
    vodim: pozicija === 0,
    pozicija,
    partner: partnerOd(p.ja),
    otvorenaBoja: pozicija ? boja(p.tekuca[0].karta) : -1,
    drzi,
    drziKartu,
    beleNaStolu: p.tekuca.reduce((s, o) => s + bele(o.karta), 0),
  };
}

export const ima = (karte: Karta[], pol: number): boolean => karte.some((k) => polozaj(k) === pol);
export const najmanja = (karte: Karta[]): Karta => karte.reduce((a, b) => (polozaj(b) > polozaj(a) ? b : a));
export const najjaca = (karte: Karta[]): Karta => karte.reduce((a, b) => (polozaj(b) < polozaj(a) ? b : a));
export const jeMaster = (s: Situacija, k: Karta): boolean => najjacaUBoji(k, s.z, s.p.ruka);

/** Najmanja karta bez bela ako postoji, inače najmanja. */
export function najjeftinija(karte: Karta[]): Karta {
  const bez = karte.filter((k) => bele(k) === 0);
  return najmanja(bez.length ? bez : karte);
}

/** Boje koje se prema priručniku ne otvaraju kao prvi od ruke. */
export function zabranjeneZaOtvaranje(s: Situacija): Set<number> {
  const zab = new Set<number>();
  s.poBoji.forEach((k, b) => {
    if (!k.length) return;
    const t = ima(k, TRICA), d = ima(k, DUJA), a = ima(k, AS);
    // t. 10: suha trica+aš
    if (k.length === 2 && t && a) zab.add(b);
    // Uporaba aša, t. 1: treći aš (bez trice i duje)
    if (a && !t && !d && k.length <= 3) zab.add(b);
    // t. 8: suhi kralj
    if (k.length === 1 && polozaj(k[0]) === 3) zab.add(b);
    // suhi aš
    if (k.length === 1 && a) zab.add(b);
  });
  return zab;
}

/** Je li partner u ranijoj ruci otvorio boju uz bato, a ja se još nisam vratio u nju. */
export function partnerovBato(s: Situacija): number[] {
  const out: number[] = [];
  s.p.odigrane.forEach((r, i) => {
    if (r.signal !== 'bato' || r.otvara !== s.partner) return;
    const b = boja(r.karte[0].karta);
    const vratioSam = s.p.odigrane.slice(i + 1).some((x) => x.otvara === s.p.ja && boja(x.karte[0].karta) === b);
    if (!vratioSam && s.poBoji[b].length) out.push(b);
  });
  return out;
}
