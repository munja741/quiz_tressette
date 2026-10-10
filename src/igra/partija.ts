// Partija: niz dijeljenja do cilja (21, 31, 41) ili samo jedno dijeljenje.

import { type Dijeljenje, type Obracun, podijeli, obracun, sljedeci } from './dijeljenje.ts';
import type { Karta } from './karte.ts';

export type Razina = 'pocetnik' | 'igrac' | 'majstor';
export type Cilj = 0 | 21 | 31 | 41;

export interface Postavke {
  cilj: Cilj;
  akuza: boolean;
  signali: boolean;
  razinaPartner: Razina;
  razinaProtivnici: Razina;
  stanka: number; // ms
  ucitelj: 'iskljucen' | 'savjet' | 'upozori';
  brojac: 'vidljiv' | 'skriven';
  potvrda: 'jedan' | 'dva';
  kompaktne: boolean;
  automatskaAkuza: boolean;
}

export const ZADANE_POSTAVKE: Postavke = {
  cilj: 41,
  akuza: true,
  signali: true,
  razinaPartner: 'igrac',
  razinaProtivnici: 'igrac',
  stanka: 700,
  ucitelj: 'savjet',
  brojac: 'vidljiv',
  potvrda: 'jedan',
  kompaktne: false,
  automatskaAkuza: false,
};

export interface ZavrsenoDijeljenje { sjeme: number; djelitelj: number; rezultat: Obracun; dijeljenje: Dijeljenje }

export interface Partija {
  postavke: Postavke;
  sjeme: number;
  zavrsena: ZavrsenoDijeljenje[];
  trenutno: Dijeljenje;
  zbroj: [number, number];
  gotova: boolean;
  /** 0 = mi, 1 = oni, null = neriješeno (samo kod jednog dijeljenja) */
  pobjednik: 0 | 1 | null;
}

export const sjemeDijeljenja = (sjeme: number, n: number): number => (sjeme + Math.imul(n, 0x9e3779b1)) >>> 0;

/** Nova partija. Prvo dijeljenje uvijek otvara igrač (mjesto 0), pa je djelitelj igrač prije njega (mjesto 3). */
export function novaPartija(postavke: Postavke, sjeme: number, zadanaRuka?: Karta[]): Partija {
  const opcije = { akuza: postavke.akuza, signali: postavke.signali };
  return {
    postavke,
    sjeme,
    zavrsena: [],
    trenutno: podijeli(sjemeDijeljenja(sjeme, 0), 3, opcije, zadanaRuka),
    zbroj: [0, 0],
    gotova: false,
    pobjednik: null,
  };
}

/** Zbraja gotovo dijeljenje i provjerava kraj partije. */
export function zakljuciDijeljenje(p: Partija): Partija {
  const d = p.trenutno;
  if (!d.gotovo) return p;
  if (p.zavrsena.some((z) => z.dijeljenje === d)) return p;
  const rezultat = obracun(d);
  const zbroj: [number, number] = [p.zbroj[0] + rezultat.ukupno[0], p.zbroj[1] + rezultat.ukupno[1]];
  const zavrsena = [...p.zavrsena, { sjeme: d.sjeme, djelitelj: d.djelitelj, rezultat, dijeljenje: d }];
  let gotova = false;
  let pobjednik: 0 | 1 | null = null;
  const cilj = p.postavke.cilj;
  if (cilj === 0) {
    gotova = true;
    pobjednik = zbroj[0] === zbroj[1] ? null : zbroj[0] > zbroj[1] ? 0 : 1;
  } else if (zbroj[0] >= cilj || zbroj[1] >= cilj) {
    // oba para preko cilja: pobjeđuje par s više punata; kod izjednačenja dodatno dijeljenje
    if (zbroj[0] !== zbroj[1]) {
      gotova = true;
      pobjednik = zbroj[0] > zbroj[1] ? 0 : 1;
    }
  }
  return { ...p, zavrsena, zbroj, gotova, pobjednik };
}

export function sljedeceDijeljenje(p: Partija): Partija {
  if (p.gotova || !p.trenutno.gotovo) return p;
  const n = p.zavrsena.length;
  const djelitelj = sljedeci(p.trenutno.djelitelj);
  const opcije = { akuza: p.postavke.akuza, signali: p.postavke.signali };
  return { ...p, trenutno: podijeli(sjemeDijeljenja(p.sjeme, n), djelitelj, opcije) };
}
