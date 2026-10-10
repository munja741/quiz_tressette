// CPU igrač: spaja pravila iz priručnika, heuristiku i pretragu. Vraća potez i razlog.

import type { Karta } from '../karte.ts';
import { naziv } from '../karte.ts';
import type { Razlog, Signal } from '../dijeljenje.ts';
import type { Razina } from '../partija.ts';
import type { Rng } from '../slucaj.ts';
import type { Pogled } from './znanje.ts';
import { situacija, type Situacija, type Potez } from './situacija.ts';
import { PRAVILA } from './pravila/index.ts';
import { heuristika } from './heuristika.ts';
import { procijeni, type Procjena } from './pretraga.ts';

export interface CpuPotez { karta: Karta; signal: Signal; razlog: Razlog }

export function pravilo(s: Situacija): { potez: Potez; razlog: Razlog } | null {
  for (const pr of PRAVILA) {
    const potez = pr.primijeni(s);
    if (potez && s.dop.includes(potez.karta)) {
      return { potez, razlog: { tekst: pr.objasnjenje(s, potez), tocka: pr.tocka, lekcija: pr.lekcija, izvor: 'pravilo' } };
    }
  }
  return null;
}

export interface OpcijeOdluke { uzoraka?: number; vrijemeMs?: number }

export function odluci(p: Pogled, razina: Razina, r: Rng, opcije: OpcijeOdluke = {}): CpuPotez {
  const s = situacija(p);
  if (s.dop.length === 1) return { karta: s.dop[0], signal: null, razlog: { tekst: 'Jedina dopuštena karta.', izvor: 'jedini' } };

  if (razina === 'pocetnik') {
    if (r() < 0.2) {
      const k = s.dop[Math.floor(r() * s.dop.length)];
      return { karta: k, signal: null, razlog: { tekst: 'Početnik: nasumičan potez.', izvor: 'heuristika' } };
    }
    const h = heuristika(s);
    return { karta: h.karta, signal: null, razlog: { tekst: h.tekst, izvor: 'heuristika' } };
  }

  const pr = pravilo(s);
  if (razina === 'igrac') {
    if (pr) return { karta: pr.potez.karta, signal: pr.potez.signal, razlog: pr.razlog };
    // zadnje ruke (t. 56 do 59): brojanje karata, kad u ruci ostanu tri karte ili manje
    if (p.ruka.length <= 3) {
      const procjene = procijeni(p, s.dop, r, { uzoraka: 24 });
      const h = heuristika(s);
      const vH = procjene.find((x) => x.karta === h.karta)!.vrijednost;
      if (procjene[0].vrijednost - vH >= 0.5) {
        return { karta: procjene[0].karta, signal: null, razlog: { tekst: 'Zadnje ruke: brojanjem karata ovo je najbolji potez.', tocka: 't. 56 do 59', lekcija: 'zadnje-ruke', izvor: 'pretraga' } };
      }
      return { karta: h.karta, signal: h.signal, razlog: { tekst: h.tekst, izvor: 'heuristika' } };
    }
    const h = heuristika(s);
    return { karta: h.karta, signal: h.signal, razlog: { tekst: h.tekst, izvor: 'heuristika' } };
  }

  // Majstor: u prve tri ruke pravila o otvaranju i signalima imaju prednost pred pretragom.
  if (pr && p.odigrane.length < 3) return { karta: pr.potez.karta, signal: pr.potez.signal, razlog: pr.razlog };
  const procjene = procijeni(p, s.dop, r, { uzoraka: opcije.uzoraka ?? 120, vrijemeMs: opcije.vrijemeMs ?? 500 });
  return izPretrage(s, procjene, pr);
}

function izPretrage(s: Situacija, procjene: Procjena[], pr: ReturnType<typeof pravilo>): CpuPotez {
  const naj = procjene[0];
  if (pr) {
    const vPr = procjene.find((x) => x.karta === pr.potez.karta)?.vrijednost ?? -Infinity;
    // pravilo ostaje ako pretraga ne očekuje barem jednu belu više
    if (naj.vrijednost - vPr < 1) return { karta: pr.potez.karta, signal: pr.potez.signal, razlog: pr.razlog };
  }
  const h = heuristika(s);
  const vH = procjene.find((x) => x.karta === h.karta)?.vrijednost ?? -Infinity;
  if (naj.vrijednost - vH < 0.5) return { karta: h.karta, signal: h.signal, razlog: { tekst: h.tekst, izvor: 'heuristika' } };
  const razlika = Math.round((naj.vrijednost - vH) * 10) / 10;
  return {
    karta: naj.karta,
    signal: null,
    razlog: { tekst: `Izračun: ${naziv(naj.karta)} u prosjeku donosi ${fmt(razlika)} više od uobičajenog poteza.`, izvor: 'pretraga' },
  };
}

const fmt = (b: number): string => {
  const r = Math.round(b);
  if (r <= 0) return 'nešto';
  return r === 1 ? '1 belu' : r < 5 ? `${r} bele` : `${r} bela`;
};

export { procijeni };
