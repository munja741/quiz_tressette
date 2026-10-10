import { useState } from 'preact/hooks';
import { type Karta, naziv, nazivAkuzativ, boja } from '../karte.ts';
import { type Dijeljenje, dopustene } from '../dijeljenje.ts';
import { potezi, stanjeNakon } from '../pregled.ts';
import { vidljivoStanje } from '../cpu/znanje.ts';
import { situacija } from '../cpu/situacija.ts';
import { pravilo } from '../cpu/igrac-cpu.ts';
import { procjena } from '../cpu/klijent.ts';
import { SlikaKarte } from './Karta.tsx';
import { IME } from './imena.ts';

interface Nalaz { korak: number; ruka: number; odigrao: Karta; bolje: Karta; razlika: number; pravilo?: string; lekcija?: string }

const bela = (n: number) => (n === 1 ? '1 bela' : n < 5 ? `${n} bele` : `${n} bela`);

export function Pregled({ d, zatvori, kompaktne }: { d: Dijeljenje; zatvori: () => void; kompaktne: boolean }) {
  const sve = potezi(d);
  const [n, setN] = useState(0);
  const [nalazi, setNalazi] = useState<Nalaz[] | null>(null);
  const [racunam, setRacunam] = useState<number | null>(null);
  const s = stanjeNakon(d, n);
  const naStolu = s.tekuca.length ? s.tekuca : n > 0 && s.odigrane.length ? s.odigrane[s.odigrane.length - 1].karte : [];

  async function analiziraj() {
    const moji = sve.map((m, i) => ({ m, i })).filter(({ m }) => m.igrac === 0);
    const out: Nalaz[] = [];
    for (let j = 0; j < moji.length; j++) {
      setRacunam(j + 1);
      const { m, i } = moji[j];
      const st = stanjeNakon(d, i);
      const dop = dopustene(st);
      if (dop.length < 2) continue;
      const pogled = vidljivoStanje(st, 0);
      const pr = await procjena(pogled, dop, 350);
      const vrijednost = (k: Karta) => pr.find((x) => x.karta === k)?.vrijednost ?? 0;
      const moj = vrijednost(m.karta);
      // kao Majstor: pravilo iz priručnika ima prednost, osim ako pretraga očekuje barem jednu belu više
      const p = pravilo(situacija(pogled));
      let bolje = pr[0].karta;
      let objasnjenje: string | undefined;
      let lekcija: string | undefined;
      if (p && (i < 12 || vrijednost(pr[0].karta) - vrijednost(p.potez.karta) < 1)) {
        bolje = p.potez.karta;
        objasnjenje = `${p.razlog.tekst} (${p.razlog.tocka})`;
        lekcija = p.razlog.lekcija;
      }
      if (bolje === m.karta) continue;
      const razlika = Math.round(vrijednost(bolje) - moj);
      if (razlika >= 1 || (objasnjenje && razlika >= 0)) {
        out.push({ korak: i, ruka: Math.floor(i / 4) + 1, odigrao: m.karta, bolje, razlika, pravilo: objasnjenje, lekcija });
      }
    }
    setRacunam(null);
    setNalazi(out);
  }

  const mjesta = [2, 1, 3, 0];
  return (
    <section class="pregled" aria-labelledby="naslov-pregled">
      <div class="pregled-zaglavlje">
        <h2 id="naslov-pregled">Pregled dijeljenja</h2>
        <button type="button" class="gumb" onClick={zatvori}>Natrag na obračun</button>
      </div>
      <div class="pregled-stol">
        {mjesta.map((i) => (
          <div class={`pregled-ruka mjesto-${i}`} key={i}>
            <div class="pregled-ime">{IME[i]}</div>
            <div class="pregled-karte">
              {s.ruke[i].map((k) => <SlikaKarte k={k} kompaktna key={k} />)}
              {!s.ruke[i].length && <span class="prazno">nema karata</span>}
            </div>
          </div>
        ))}
        <div class="pregled-sredina" aria-label="Karte na stolu">
          {naStolu.map((o) => <div class={`na-stolu od-${o.igrac}`} key={o.karta}><SlikaKarte k={o.karta} kompaktna={kompaktne} /></div>)}
        </div>
      </div>
      <div class="kontrole" role="group" aria-label="Kretanje kroz poteze">
        <button type="button" class="gumb" onClick={() => setN(0)} disabled={n === 0}>Na početak</button>
        <button type="button" class="gumb" onClick={() => setN(Math.max(0, n - 1))} disabled={n === 0}>Natrag</button>
        <span class="korak">Potez {n} od {sve.length}</span>
        <button type="button" class="gumb" onClick={() => setN(Math.min(sve.length, n + 1))} disabled={n === sve.length}>Naprijed</button>
        <button type="button" class="gumb" onClick={() => setN(sve.length)} disabled={n === sve.length}>Na kraj</button>
      </div>
      {n > 0 && (
        <p class="razlog-poteza">
          <b>{IME[sve[n - 1].igrac]}</b>: {naziv(sve[n - 1].karta)}{sve[n - 1].signal ? `, ${sve[n - 1].signal === 'bato' ? 'bato' : 'strišo'}` : ''}.{' '}
          {sve[n - 1].razlog && sve[n - 1].razlog!.izvor !== 'igrac' ? sve[n - 1].razlog!.tekst + (sve[n - 1].razlog!.tocka ? ` (${sve[n - 1].razlog!.tocka})` : '') : ''}
        </p>
      )}

      <div class="analiza">
        <h3>Analiza tvojih poteza</h3>
        {!nalazi && racunam === null && <button type="button" class="gumb glavni" onClick={analiziraj}>Analiziraj moje poteze</button>}
        {racunam !== null && <p aria-live="polite">Računam potez {racunam} od 10…</p>}
        {nalazi && !nalazi.length && <p>Svi tvoji potezi su dobri ili razlika nije veća od jedne bele.</p>}
        {nalazi && nalazi.length > 0 && (
          <ul class="nalazi">
            {nalazi.map((x) => (
              <li key={x.korak}>
                <button type="button" class="poveznica" onClick={() => setN(x.korak)}>Ruka {x.ruka}</button>: igrao si {nazivAkuzativ(x.odigrao)}. Bolje je bilo {nazivAkuzativ(x.bolje)}{x.razlika >= 1 ? `, procjena: oko ${bela(x.razlika)} više` : ''}.
                {x.pravilo && <> {x.pravilo}{x.lekcija ? ` Lekcija: ${x.lekcija}.` : ''}</>}
                {!x.pravilo && boja(x.odigrao) !== boja(x.bolje) && <> Druga boja.</>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
