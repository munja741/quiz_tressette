// Pravila jednog dijeljenja: dijeljenje karata, dopušteni potezi, ruke, akuža i obračun.
// Mjesta za stolom, u smjeru igre (kazaljka na satu):
// 0 = ti, 1 = igrač poslije tebe, 2 = partner, 3 = igrač prije tebe.
// Par 0 (mi) = mjesta 0 i 2, par 1 (oni) = mjesta 1 i 3.

import { type Karta, SPIL, bele, boja, polozaj, karta, TRICA, DUJA, AS } from './karte.ts';
import { rng, promijesaj } from './slucaj.ts';

export type Signal = 'bato' | 'striso' | null;
export const par = (igrac: number): 0 | 1 => (igrac % 2) as 0 | 1;
export const sljedeci = (igrac: number): number => (igrac + 1) % 4;
export const partnerOd = (igrac: number): number => (igrac + 2) % 4;

export interface Razlog {
  tekst: string;
  tocka?: string;
  lekcija?: string;
  izvor: 'pravilo' | 'pretraga' | 'heuristika' | 'jedini' | 'igrac';
}

export interface Odigrano { igrac: number; karta: Karta; razlog?: Razlog }

export interface Ruka {
  otvara: number;
  karte: Odigrano[];
  signal: Signal;
  uzeo: number;
  bele: number;
}

export interface Kombinacija {
  vrsta: 'tri' | 'cetiri' | 'napolitana';
  /** za tri i četiri: polozaj (0 trica, 1 duja, 2 aš); za napolitanu: boja */
  kljuc: number;
  punti: number;
  karte: Karta[];
}

export interface Akuza { igrac: number; kombinacije: Kombinacija[]; punti: number }

export interface Opcije { akuza: boolean; signali: boolean }

export interface Dijeljenje {
  sjeme: number;
  djelitelj: number;
  opcije: Opcije;
  pocetneRuke: Karta[][];
  ruke: Karta[][];
  naPotezu: number;
  otvaraTekucu: number;
  tekuca: Odigrano[];
  tekuciSignal: Signal;
  odigrane: Ruka[];
  akuza: Akuza[];
  /** je li igrač na mjestu i već odlučio o akuži */
  akuzaOdluka: boolean[];
  gotovo: boolean;
}

/**
 * Dijeli svih 40 karata: dva kruga po pet karata, počevši od igrača poslije djelitelja.
 * zadanaRuka (neobavezno) postavlja karte igraču na mjestu 0; ostale se dijele nasumično.
 */
export function podijeli(sjeme: number, djelitelj: number, opcije: Opcije, zadanaRuka?: Karta[]): Dijeljenje {
  const r = rng(sjeme);
  let spil = promijesaj(SPIL, r);
  const ruke: Karta[][] = [[], [], [], []];
  const zadano = zadanaRuka ? [...new Set(zadanaRuka)].slice(0, 10) : [];
  if (zadano.length) {
    spil = spil.filter((k) => !zadano.includes(k));
    ruke[0].push(...zadano);
  }
  let i = 0;
  for (let krug = 0; krug < 2; krug++) {
    const cilj = 5 * (krug + 1);
    for (let n = 1; n <= 4; n++) {
      const igrac = (djelitelj + n) % 4;
      const uzmi = Math.max(0, cilj - ruke[igrac].length);
      for (let j = 0; j < uzmi; j++) ruke[igrac].push(spil[i++]);
    }
  }
  const sortirane = ruke.map((h) => [...h].sort((a, b) => a - b));
  const otvara = sljedeci(djelitelj);
  const d: Dijeljenje = {
    sjeme,
    djelitelj,
    opcije,
    pocetneRuke: sortirane.map((h) => [...h]),
    ruke: sortirane,
    naPotezu: otvara,
    otvaraTekucu: otvara,
    tekuca: [],
    tekuciSignal: null,
    odigrane: [],
    akuza: [],
    akuzaOdluka: [false, false, false, false],
    gotovo: false,
  };
  return d;
}

/** Pronađi sve kombinacije akuže u ruci. */
export function pronadiAkuzu(ruka: Karta[]): Kombinacija[] {
  const out: Kombinacija[] = [];
  for (const p of [TRICA, DUJA, AS]) {
    const karte = ruka.filter((k) => polozaj(k) === p);
    if (karte.length === 4) out.push({ vrsta: 'cetiri', kljuc: p, punti: 4, karte });
    else if (karte.length === 3) out.push({ vrsta: 'tri', kljuc: p, punti: 3, karte });
  }
  for (let b = 0; b < 4; b++) {
    const k3 = karta(b, TRICA), k2 = karta(b, DUJA), ka = karta(b, AS);
    if (ruka.includes(k3) && ruka.includes(k2) && ruka.includes(ka)) {
      // napolitana uvijek vrijedi 3, koliko god karata te boje uz nju bilo
      out.push({ vrsta: 'napolitana', kljuc: b, punti: 3, karte: [k3, k2, ka] });
    }
  }
  return out;
}

/** Igrač prijavljuje (ili ne) akužu. Dopušteno samo prije njegove prve karte. */
export function akuzaj(d: Dijeljenje, igrac: number, prijavi: boolean): Dijeljenje {
  if (!d.opcije.akuza || d.akuzaOdluka[igrac]) return d;
  if (d.ruke[igrac].length < 10) return d;
  const n: Dijeljenje = { ...d, akuzaOdluka: [...d.akuzaOdluka], akuza: [...d.akuza] };
  n.akuzaOdluka[igrac] = true;
  if (prijavi) {
    const kombinacije = pronadiAkuzu(d.pocetneRuke[igrac]);
    if (kombinacije.length) n.akuza.push({ igrac, kombinacije, punti: kombinacije.reduce((s, k) => s + k.punti, 0) });
  }
  return n;
}

export function dopusteneKarte(ruka: Karta[], tekuca: Odigrano[]): Karta[] {
  if (!tekuca.length) return [...ruka];
  const b = boja(tekuca[0].karta);
  const uBoji = ruka.filter((k) => boja(k) === b);
  return uBoji.length ? uBoji : [...ruka];
}

export function dopustene(d: Dijeljenje, igrac = d.naPotezu): Karta[] {
  if (d.gotovo || igrac !== d.naPotezu) return [];
  return dopusteneKarte(d.ruke[igrac], d.tekuca);
}

/** Pobjednik ruke: najjača karta otvorene boje (najmanji polozaj). */
export function pobjednikRuke(karte: Odigrano[]): number {
  const b = boja(karte[0].karta);
  let naj = karte[0];
  for (const o of karte) if (boja(o.karta) === b && polozaj(o.karta) < polozaj(naj.karta)) naj = o;
  return naj.igrac;
}

export class NedopustenPotez extends Error {}

/** Odigraj kartu igrača na potezu. Signal smije dati samo onaj tko otvara ruku. */
export function odigraj(d: Dijeljenje, k: Karta, signal: Signal = null, razlog?: Razlog): Dijeljenje {
  if (d.gotovo) throw new NedopustenPotez('Dijeljenje je gotovo.');
  const igrac = d.naPotezu;
  if (!dopustene(d).includes(k)) throw new NedopustenPotez('Karta nije dopuštena.');
  if (signal && (d.tekuca.length > 0 || !d.opcije.signali)) throw new NedopustenPotez('Signal smije dati samo igrač koji otvara ruku.');
  if (signal && signal !== 'bato' && signal !== 'striso') throw new NedopustenPotez('Dopušteni su samo bato i strišo.');
  const ruke = d.ruke.map((h) => h.slice());
  ruke[igrac] = ruke[igrac].filter((x) => x !== k);
  const akuzaOdluka = [...d.akuzaOdluka];
  akuzaOdluka[igrac] = true; // nakon prve karte akuža se više ne može prijaviti
  const tekuca = [...d.tekuca, { igrac, karta: k, razlog }];
  const n: Dijeljenje = {
    ...d,
    ruke,
    akuzaOdluka,
    tekuca,
    tekuciSignal: d.tekuca.length === 0 ? signal : d.tekuciSignal,
    naPotezu: sljedeci(igrac),
  };
  if (tekuca.length === 4) {
    const uzeo = pobjednikRuke(tekuca);
    const zadnja = n.odigrane.length === 9;
    const r: Ruka = {
      otvara: d.otvaraTekucu,
      karte: tekuca,
      signal: n.tekuciSignal,
      uzeo,
      bele: tekuca.reduce((s, o) => s + bele(o.karta), 0) + (zadnja ? 3 : 0),
    };
    n.odigrane = [...n.odigrane, r];
    n.tekuca = [];
    n.tekuciSignal = null;
    n.naPotezu = uzeo;
    n.otvaraTekucu = uzeo;
    if (zadnja) n.gotovo = true;
  }
  return n;
}

export interface Obracun {
  asovi: [number, number];
  /** bele od trica, duja i figura (bez aša i ultime) */
  bele: [number, number];
  ultima: 0 | 1;
  /** ukupno u belama, s asovima i ultimom */
  ukupnoBela: [number, number];
  puntiIgre: [number, number];
  akuza: [number, number];
  kapot: [boolean, boolean];
  ukupno: [number, number];
  uzeteRuke: [number, number];
}

export function obracun(d: Dijeljenje): Obracun {
  const asovi: [number, number] = [0, 0];
  const bel: [number, number] = [0, 0];
  const ukupnoBela: [number, number] = [0, 0];
  const uzeteRuke: [number, number] = [0, 0];
  let ultima: 0 | 1 = 0;
  d.odigrane.forEach((r, i) => {
    const p = par(r.uzeo);
    uzeteRuke[p]++;
    ukupnoBela[p] += r.bele;
    for (const o of r.karte) {
      if (polozaj(o.karta) === AS) asovi[p]++;
      else bel[p] += bele(o.karta);
    }
    if (i === 9) ultima = p;
  });
  const puntiIgre: [number, number] = [Math.floor(ukupnoBela[0] / 3), Math.floor(ukupnoBela[1] / 3)];
  const akuza: [number, number] = [0, 0];
  for (const a of d.akuza) akuza[par(a.igrac)] += a.punti;
  const kapot: [boolean, boolean] = [puntiIgre[0] === 0 && d.gotovo, puntiIgre[1] === 0 && d.gotovo];
  // kapot ne nosi dodatne punte i ne briše akužu
  const ukupno: [number, number] = [puntiIgre[0] + akuza[0], puntiIgre[1] + akuza[1]];
  return { asovi, bele: bel, ultima, ukupnoBela, puntiIgre, akuza, kapot, ukupno, uzeteRuke };
}

/** Bele uzete do sada u tekućem dijeljenju, po parovima. */
export function beleDoSada(d: Dijeljenje): [number, number] {
  const b: [number, number] = [0, 0];
  for (const r of d.odigrane) b[par(r.uzeo)] += r.bele;
  return b;
}
