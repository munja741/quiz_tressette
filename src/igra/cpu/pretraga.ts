// Pretraga za razinu Majstor: Monte Carlo s određivanjem ruku (PIMC).
// 1. Nepoznate karte nasumično se podijele, poštujući sve zaključke (nemanje boje, akuža, broj karata).
// 2. Za svaki mogući potez igra se do kraja: brzom heuristikom dok u rukama ima više od 4 karte,
//    zatim točnim minimaksom s alfa-beta rezanjem.
// 3. Bira se potez s najvećim prosjekom bela za moj par.

import { type Karta, boja, polozaj, bele } from '../karte.ts';
import { type Odigrano, par } from '../dijeljenje.ts';
import { type Rng, promijesaj } from '../slucaj.ts';
import { type Pogled, type Znanje, izgradiZnanje } from './znanje.ts';

interface Sim {
  ruke: Karta[][];
  tekuca: Odigrano[];
  naPotezu: number;
  odigranihRuku: number;
  bele: [number, number];
}

/** Nasumična podjela nepoznatih karata ostalim igračima, u skladu sa znanjem. */
export function uzorkuj(z: Znanje, p: Pogled, r: Rng): Karta[][] | null {
  for (let pokusaj = 0; pokusaj < 60; pokusaj++) {
    const ruke: Karta[][] = [[], [], [], []];
    ruke[p.ja] = [...p.ruka];
    const kapacitet = z.brojKarata.map((n, i) => (i === p.ja ? 0 : n));
    const slobodne: Karta[] = [];
    for (const k of z.nepoznate) {
      const vl = z.poznate.get(k);
      if (vl !== undefined && vl !== p.ja) {
        ruke[vl].push(k);
        kapacitet[vl]--;
      } else slobodne.push(k);
    }
    if (kapacitet.some((c) => c < 0)) return null;
    // najprije karte s najmanje mogućih vlasnika
    const moguci = (k: Karta) => [0, 1, 2, 3].filter((i) => i !== p.ja && !z.nemaBoju[i][boja(k)]);
    const redom = promijesaj(slobodne, r).sort((a, b) => moguci(a).length - moguci(b).length);
    let uspjeh = true;
    for (const k of redom) {
      const m = moguci(k).filter((i) => kapacitet[i] > 0);
      if (!m.length) { uspjeh = false; break; }
      // težina po preostalom kapacitetu
      const ukupno = m.reduce((s, i) => s + kapacitet[i], 0);
      let x = r() * ukupno;
      let izbor = m[0];
      for (const i of m) { x -= kapacitet[i]; if (x < 0) { izbor = i; break; } }
      ruke[izbor].push(k);
      kapacitet[izbor]--;
    }
    if (!uspjeh) continue;
    const ok = z.ogranicenja.every((o) => {
      const ima = o.karte.filter((k) => ruke[o.igrac].includes(k) || z.odigrano.has(k)).length;
      return ima >= Math.min(o.najmanje, o.karte.length);
    });
    if (ok || pokusaj > 40) return ruke;
  }
  return null;
}

function dopusteneSim(s: Sim): Karta[] {
  const h = s.ruke[s.naPotezu];
  if (!s.tekuca.length) return h;
  const b = boja(s.tekuca[0].karta);
  const u = h.filter((k) => boja(k) === b);
  return u.length ? u : h;
}

function pobjednik(t: Odigrano[]): number {
  const b = boja(t[0].karta);
  let naj = t[0];
  for (const o of t) if (boja(o.karta) === b && polozaj(o.karta) < polozaj(naj.karta)) naj = o;
  return naj.igrac;
}

function igraj(s: Sim, k: Karta): void {
  const i = s.naPotezu;
  s.ruke[i] = s.ruke[i].filter((x) => x !== k);
  s.tekuca.push({ igrac: i, karta: k });
  if (s.tekuca.length === 4) {
    const w = pobjednik(s.tekuca);
    s.odigranihRuku++;
    s.bele[par(w)] += s.tekuca.reduce((a, o) => a + bele(o.karta), 0) + (s.odigranihRuku === 10 ? 3 : 0);
    s.tekuca = [];
    s.naPotezu = w;
  } else s.naPotezu = (i + 1) % 4;
}

const klon = (s: Sim): Sim => ({ ruke: s.ruke.map((h) => h.slice()), tekuca: s.tekuca.slice(), naPotezu: s.naPotezu, odigranihRuku: s.odigranihRuku, bele: [s.bele[0], s.bele[1]] });

/** Je li karta najjača među kartama te boje koje su još u rukama (otvorene ruke). */
function masterSim(s: Sim, k: Karta): boolean {
  const b = boja(k), p = polozaj(k);
  for (const h of s.ruke) for (const x of h) if (boja(x) === b && polozaj(x) < p) return false;
  return true;
}

/** Brza heuristika s otvorenim kartama, za igranje do kraja u uzorcima. */
function brziPotez(s: Sim): Karta {
  const dop = dopusteneSim(s);
  if (dop.length === 1) return dop[0];
  const ja = s.naPotezu;
  const slabija = (a: Karta, b: Karta) => (polozaj(b) > polozaj(a) ? b : a);
  const jeftina = (ks: Karta[]) => { const z = ks.filter((k) => bele(k) === 0); return (z.length ? z : ks).reduce(slabija); };
  if (!s.tekuca.length) {
    let naj = -1, najB = -1;
    for (const k of dop) {
      if (!masterSim(s, k)) continue;
      const vani = s.ruke.some((h, i) => i !== ja && h.some((x) => boja(x) === boja(k)));
      if (vani && bele(k) > najB) { naj = k; najB = bele(k); }
    }
    if (naj >= 0) return naj;
    const duljina = (b: number) => dop.filter((k) => boja(k) === b).length;
    const b = [0, 1, 2, 3].sort((x, y) => duljina(y) - duljina(x))[0];
    return jeftina(dop.filter((k) => boja(k) === b));
  }
  const w = pobjednik(s.tekuca);
  const wk = s.tekuca.find((o) => o.igrac === w)!.karta;
  const partnerDrzi = par(w) === par(ja);
  const zadnji = s.tekuca.length === 3;
  const b = boja(s.tekuca[0].karta);
  const uBoji = dop.filter((k) => boja(k) === b);
  const daj = (ks: Karta[]) => ks.reduce((a, c) => (bele(c) > bele(a) || (bele(c) === bele(a) && polozaj(c) > polozaj(a)) ? c : a));
  if (!uBoji.length) {
    return partnerDrzi && (zadnji || masterSim(s, wk)) ? daj(dop) : jeftina(dop);
  }
  if (partnerDrzi && (zadnji || masterSim(s, wk))) return daj(uBoji);
  const jace = uBoji.filter((k) => polozaj(k) < polozaj(wk));
  if (!partnerDrzi && jace.length) {
    if (zadnji) return jace.reduce(slabija);
    const m = jace.filter((k) => masterSim(s, k));
    if (m.length) return m.reduce(slabija);
  }
  return jeftina(uBoji);
}

function alfaBeta(s: Sim, alfa: number, beta: number, mojPar: 0 | 1): number {
  if (s.odigranihRuku === 10) return 0;
  const i = s.naPotezu;
  const max = par(i) === mojPar;
  const dop = [...dopusteneSim(s)].sort((a, b) => polozaj(a) - polozaj(b));
  let najbolje = max ? -Infinity : Infinity;
  for (const k of dop) {
    const n = klon(s);
    const prije = n.bele[mojPar];
    igraj(n, k);
    const dobitak = n.bele[mojPar] - prije;
    const v = dobitak + alfaBeta(n, alfa - dobitak, beta - dobitak, mojPar);
    if (max) { if (v > najbolje) najbolje = v; if (v > alfa) alfa = v; }
    else { if (v < najbolje) najbolje = v; if (v < beta) beta = v; }
    if (beta <= alfa) break;
  }
  return najbolje;
}

const PRAG_TOCNO = 16; // ukupno karata u rukama (4 po igraču)

/** Odigraj do kraja i vrati bele mog para od ove točke. */
function doKraja(s: Sim, mojPar: 0 | 1): number {
  const pocetak = s.bele[mojPar];
  while (s.odigranihRuku < 10) {
    const uRukama = s.ruke.reduce((a, h) => a + h.length, 0);
    if (uRukama <= PRAG_TOCNO && s.tekuca.length === 0) return s.bele[mojPar] - pocetak + alfaBeta(s, -Infinity, Infinity, mojPar);
    igraj(s, brziPotez(s));
  }
  return s.bele[mojPar] - pocetak;
}

export interface Procjena { karta: Karta; vrijednost: number; uzoraka: number }

/**
 * Procjenjuje svaki kandidat-potez: prosjek bela koje moj par uzme od sada do kraja dijeljenja.
 * Ograničenje je broj uzoraka ili vrijeme (ms), što prije dođe.
 */
export function procijeni(p: Pogled, kandidati: Karta[], r: Rng, opcije: { uzoraka?: number; vrijemeMs?: number } = {}): Procjena[] {
  const z = izgradiZnanje(p);
  const mojPar = par(p.ja);
  const zbroj = new Map<Karta, number>(kandidati.map((k) => [k, 0]));
  const maxUzoraka = opcije.uzoraka ?? 200;
  const kraj = opcije.vrijemeMs ? Date.now() + opcije.vrijemeMs : Infinity;
  let n = 0;
  while (n < maxUzoraka && (n < 8 || Date.now() < kraj)) {
    const ruke = uzorkuj(z, p, r);
    if (!ruke) break;
    const baza: Sim = { ruke, tekuca: p.tekuca.map((o) => ({ ...o })), naPotezu: p.ja, odigranihRuku: p.odigrane.length, bele: [0, 0] };
    for (const k of kandidati) {
      const s = klon(baza);
      igraj(s, k);
      zbroj.set(k, zbroj.get(k)! + s.bele[mojPar] + doKraja(s, mojPar));
    }
    n++;
  }
  return kandidati.map((k) => ({ karta: k, vrijednost: n ? zbroj.get(k)! / n : 0, uzoraka: n })).sort((a, b) => b.vrijednost - a.vrijednost);
}
