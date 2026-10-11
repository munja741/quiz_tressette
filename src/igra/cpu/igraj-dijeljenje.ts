// Pomoćne funkcije za simulaciju: CPU igrači odigraju cijelo dijeljenje ili partiju.

import { type Dijeljenje, odigraj, akuzaj, pronadiAkuzu } from '../dijeljenje.ts';
import { type Partija, type Razina, zakljuciDijeljenje, sljedeceDijeljenje } from '../partija.ts';
import { rng } from '../slucaj.ts';
import { vidljivoStanje } from './znanje.ts';
import { odluci, type OpcijeOdluke } from './igrac-cpu.ts';

export function cpuAkuza(d: Dijeljenje, igraci: number[]): Dijeljenje {
  for (const i of igraci) if (d.opcije.akuza && !d.akuzaOdluka[i]) d = akuzaj(d, i, pronadiAkuzu(d.pocetneRuke[i]).length > 0);
  return d;
}

export function odigrajDijeljenje(d: Dijeljenje, razine: Razina[], sjeme: number, opcije: OpcijeOdluke = {}): Dijeljenje {
  const r = rng(sjeme);
  d = cpuAkuza(d, [0, 1, 2, 3]);
  while (!d.gotovo) {
    const i = d.naPotezu;
    const pot = odluci(vidljivoStanje(d, i), razine[i], r, opcije);
    d = odigraj(d, pot.karta, pot.signal, pot.razlog);
  }
  return d;
}

export function odigrajPartiju(p: Partija, razine: Razina[], sjeme: number, opcije: OpcijeOdluke = {}): Partija {
  let n = 0;
  while (!p.gotova && n < 60) {
    p = { ...p, trenutno: odigrajDijeljenje(p.trenutno, razine, sjeme + n * 101, opcije) };
    p = zakljuciDijeljenje(p);
    if (!p.gotova) p = sljedeceDijeljenje(p);
    n++;
  }
  return p;
}
