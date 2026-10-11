// Web Worker: pretraga CPU igrača izvan glavne niti, da sučelje nikad ne zastane.
import { odluci } from './igrac-cpu.ts';
import { procijeni } from './pretraga.ts';
import { rng } from '../slucaj.ts';

self.onmessage = (e: MessageEvent) => {
  const m = e.data;
  try {
    const r = rng(m.sjeme);
    const rez = m.vrsta === 'odluci'
      ? odluci(m.pogled, m.razina, r, { vrijemeMs: m.vrijemeMs })
      : procijeni(m.pogled, m.kandidati, r, { vrijemeMs: m.vrijemeMs, uzoraka: m.uzoraka });
    (self as unknown as Worker).postMessage({ id: m.id, rez });
  } catch (err) {
    (self as unknown as Worker).postMessage({ id: m.id, greska: String(err) });
  }
};
