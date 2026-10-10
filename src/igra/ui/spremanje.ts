// Spremanje u localStorage: postavke, nedovršena partija i statistika. Svako čitanje i pisanje u try/catch.

import { type Partija, type Postavke, ZADANE_POSTAVKE } from '../partija.ts';

const KLJUC = 'skola-tresete:igra:v1';

export interface Statistika { partija: number; pobjeda: number; dijeljenja: number; punti: number; ultima: number; akuza: number }

export interface Spremljeno { postavke: Postavke; partija: Partija | null; statistika: Statistika }

const PRAZNA: Statistika = { partija: 0, pobjeda: 0, dijeljenja: 0, punti: 0, ultima: 0, akuza: 0 };

export function ucitaj(): Spremljeno {
  try {
    const t = localStorage.getItem(KLJUC);
    if (t) {
      const s = JSON.parse(t);
      return { postavke: { ...ZADANE_POSTAVKE, ...s.postavke }, partija: s.partija ?? null, statistika: { ...PRAZNA, ...s.statistika } };
    }
  } catch {
    /* bez spremanja igra i dalje radi */
  }
  return { postavke: { ...ZADANE_POSTAVKE }, partija: null, statistika: { ...PRAZNA } };
}

export function spremi(s: Spremljeno): void {
  try {
    localStorage.setItem(KLJUC, JSON.stringify(s));
  } catch {
    /* npr. privatni prozor */
  }
}
