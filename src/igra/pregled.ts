// Pregled dijeljenja: stanje nakon n odigranih karata, iz početnih ruku i povijesti.

import { type Dijeljenje, type Odigrano, odigraj, sljedeci } from './dijeljenje.ts';

/** Svi potezi dijeljenja redom, sa signalom uz kartu kojom se otvaralo. */
export function potezi(d: Dijeljenje): (Odigrano & { signal: Dijeljenje['tekuciSignal'] })[] {
  const out: (Odigrano & { signal: Dijeljenje['tekuciSignal'] })[] = [];
  for (const r of d.odigrane) r.karte.forEach((o, i) => out.push({ ...o, signal: i === 0 ? r.signal : null }));
  d.tekuca.forEach((o, i) => out.push({ ...o, signal: i === 0 ? d.tekuciSignal : null }));
  return out;
}

export function stanjeNakon(d: Dijeljenje, n: number): Dijeljenje {
  let s: Dijeljenje = {
    ...d,
    ruke: d.pocetneRuke.map((h) => [...h]),
    naPotezu: sljedeci(d.djelitelj),
    otvaraTekucu: sljedeci(d.djelitelj),
    tekuca: [],
    tekuciSignal: null,
    odigrane: [],
    akuzaOdluka: [true, true, true, true],
    gotovo: false,
  };
  const sve = potezi(d);
  for (let i = 0; i < Math.min(n, sve.length); i++) s = odigraj(s, sve[i].karta, sve[i].signal, sve[i].razlog);
  return s;
}
