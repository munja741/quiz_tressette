import type { Situacija, Potez } from '../situacija.ts';

export interface Pravilo {
  id: string;
  tocka: string;
  lekcija: string;
  faza: 'otvaranje' | 'odgovor' | 'odbacivanje' | 'zadnje-ruke' | 'nastavak';
  prioritet: number;
  /** vraća potez ako pravilo vrijedi, inače null */
  primijeni: (s: Situacija) => Potez | null;
  objasnjenje: (s: Situacija, potez: Potez) => string;
}

export const sBatom = (s: Situacija) => (s.p.opcije.signali ? ('bato' as const) : null);
