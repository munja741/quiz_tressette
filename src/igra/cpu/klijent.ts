// Poziv CPU-a iz sučelja: Majstor i analiza idu u Web Worker; ako worker nije dostupan, računa se na glavnoj niti.
import type { Karta } from '../karte.ts';
import type { Razina } from '../partija.ts';
import { rng, novoSjeme } from '../slucaj.ts';
import type { Pogled } from './znanje.ts';
import { odluci, type CpuPotez } from './igrac-cpu.ts';
import { procijeni, type Procjena } from './pretraga.ts';

let worker: Worker | null = null;
let sljedeciId = 1;
const cekaju = new Map<number, (v: unknown) => void>();

function dohvatiWorker(): Worker | null {
  if (worker) return worker;
  try {
    worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e) => {
      const f = cekaju.get(e.data.id);
      cekaju.delete(e.data.id);
      f?.(e.data.greska ? null : e.data.rez);
    };
    worker.onerror = () => { worker = null; };
  } catch {
    worker = null;
  }
  return worker;
}

function posalji<T>(poruka: Record<string, unknown>, lokalno: () => T): Promise<T> {
  const w = dohvatiWorker();
  if (!w) return Promise.resolve(lokalno());
  const id = sljedeciId++;
  return new Promise((res) => {
    cekaju.set(id, (v) => res(v === null ? lokalno() : (v as T)));
    w.postMessage({ ...poruka, id });
  });
}

const vrijemeMajstora = (): number => (typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent) ? 300 : 600);

export function cpuPotez(p: Pogled, razina: Razina): Promise<CpuPotez> {
  const sjeme = novoSjeme();
  if (razina !== 'majstor') return Promise.resolve(odluci(p, razina, rng(sjeme)));
  const vrijemeMs = vrijemeMajstora();
  return posalji({ vrsta: 'odluci', pogled: p, razina, sjeme, vrijemeMs }, () => odluci(p, razina, rng(sjeme), { vrijemeMs }));
}

export function procjena(p: Pogled, kandidati: Karta[], vrijemeMs = 400): Promise<Procjena[]> {
  const sjeme = novoSjeme();
  return posalji({ vrsta: 'procijeni', pogled: p, kandidati, sjeme, vrijemeMs, uzoraka: 150 }, () => procijeni(p, kandidati, rng(sjeme), { vrijemeMs, uzoraka: 150 }));
}
