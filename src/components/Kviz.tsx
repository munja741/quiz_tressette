import { useMemo, useState } from 'preact/hooks';
import { parsirajZapis, polozaj, naziv, type Karta } from '../igra/karte.ts';
import { svgKarte } from '../igra/ui/Karta.tsx';
import { dijagramSVG } from '../skola/dijagram.ts';
import { spremiKviz } from '../skola/napredak.ts';

type Izvor = { lekcija: string; odjeljak: string; tocka?: string };
type Pitanje =
  | { id: string; vrsta: 'izbor'; pitanje: string; ruka?: string; karte?: string; odgovori: { tekst: string; tocno?: boolean }[]; objasnjenje: string; izvor: Izvor }
  | { id: string; vrsta: 'broj'; pitanje: string; karte?: string; tocno: number; jedinica?: string; objasnjenje: string; izvor: Izvor }
  | { id: string; vrsta: 'redoslijed'; pitanje: string; karte: string; objasnjenje: string; izvor: Izvor }
  | { id: string; vrsta: 'stol'; pitanje: string; ruka: string; stol: { tko: 'prije' | 'partner' | 'poslije'; karta: string; signal?: 'bato' | 'striso' }[]; tocne: string[]; objasnjenje: string; izvor: Izvor };

interface Props {
  slug: string;
  prolaz: number;
  pitanja: Pitanje[];
  odjeljci: Record<string, string>;
  sljedeca?: { href: string; naslov: string };
}

const TKO = { prije: 'Igrač prije tebe', partner: 'Partner', poslije: 'Igrač poslije tebe' };
const SIGNAL = { bato: 'bato', striso: 'strišo' };

function promijesaj<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

const jednaKarta = (zapis: string): Karta => parsirajZapis(zapis)[0];

function KartaGumb({ k, onClick, oznacena, disabled }: { k: Karta; onClick?: () => void; oznacena?: boolean; disabled?: boolean }) {
  return (
    <button type="button" class={`kviz-karta ${oznacena ? 'oznacena' : ''}`} aria-label={naziv(k)} aria-pressed={oznacena} disabled={disabled} onClick={onClick}
      dangerouslySetInnerHTML={{ __html: svgKarte(k, true) }} />
  );
}

export default function Kviz({ slug, prolaz, pitanja, odjeljci, sljedeca }: Props) {
  const [kljuc, setKljuc] = useState(0);
  const redoslijedOdgovora = useMemo(() => pitanja.map((p) => (p.vrsta === 'izbor' ? promijesaj(p.odgovori.map((_, i) => i)) : [])), [kljuc]);
  const izmijesaneKarte = useMemo(() => pitanja.map((p) => (p.vrsta === 'redoslijed' ? promijesaj(parsirajZapis(p.karte)) : [])), [kljuc]);
  const [i, setI] = useState(0);
  const [odgovoreno, setOdgovoreno] = useState<null | boolean>(null);
  const [rezultati, setRezultati] = useState<boolean[]>([]);
  const [broj, setBroj] = useState('');
  const [poredak, setPoredak] = useState<Karta[]>([]);
  const [odabrano, setOdabrano] = useState<number | Karta | null>(null);
  const [kraj, setKraj] = useState(false);

  const p = pitanja[i];
  const gotovo = kraj;

  function zabiljezi(tocno: boolean) {
    setOdgovoreno(tocno);
    const novi = [...rezultati, tocno];
    setRezultati(novi);
    if (novi.length === pitanja.length) spremiKviz(slug, novi.filter(Boolean).length, pitanja.length);
  }
  function dalje() {
    if (i + 1 >= pitanja.length) { setKraj(true); return; }
    setI(i + 1); setOdgovoreno(null); setBroj(''); setPoredak([]); setOdabrano(null);
  }
  function ponovi() {
    setKljuc(kljuc + 1); setKraj(false); setI(0); setOdgovoreno(null); setRezultati([]); setBroj(''); setPoredak([]); setOdabrano(null);
  }

  if (gotovo) {
    const tocnih = rezultati.filter(Boolean).length;
    const polozen = tocnih / pitanja.length >= prolaz;
    const promaseni = new Map<string, number>();
    pitanja.forEach((q, j) => { if (!rezultati[j]) promaseni.set(q.izvor.odjeljak, (promaseni.get(q.izvor.odjeljak) ?? 0) + 1); });
    const zaCitanje = [...promaseni.entries()].sort((a, b) => b[1] - a[1]);
    return (
      <section class="kviz" aria-labelledby="kviz-naslov">
        <h2 id="kviz-naslov">Kviz</h2>
        <p class="kviz-rezultat"><span class="kviz-broj">{tocnih}</span> od {pitanja.length}</p>
        <p>{polozen ? 'Lekcija je savladana.' : `Za prolaz treba ${Math.ceil(prolaz * pitanja.length)} točnih odgovora.`}</p>
        {zaCitanje.length > 0 && (
          <>
            <p>Pročitaj ponovno:</p>
            <ul class="kviz-citanje">
              {zaCitanje.map(([id, n]) => <li key={id}><a href={`#${id}`}>{odjeljci[id] ?? id}</a>{n > 1 ? ` (${n} pitanja)` : ''}</li>)}
            </ul>
          </>
        )}
        <div class="kviz-akcije">
          <button type="button" class="kviz-gumb" onClick={ponovi}>Ponovi kviz</button>
          {sljedeca && <a class={`kviz-gumb ${polozen ? 'glavni' : ''}`} href={sljedeca.href}>Sljedeća lekcija: {sljedeca.naslov}</a>}
        </div>
      </section>
    );
  }

  let tijelo = null;
  if (p.vrsta === 'izbor') {
    tijelo = (
      <div class="kviz-odgovori" role="group" aria-label="Odgovori">
        {redoslijedOdgovora[i].map((j) => {
          const o = p.odgovori[j];
          const stanje = odgovoreno === null ? '' : o.tocno ? 'tocno' : odabrano === j ? 'netocno' : '';
          return <button type="button" key={j} class={`kviz-odgovor ${stanje}`} disabled={odgovoreno !== null} onClick={() => { setOdabrano(j); zabiljezi(!!o.tocno); }}>{o.tekst}</button>;
        })}
      </div>
    );
  } else if (p.vrsta === 'broj') {
    tijelo = (
      <form class="kviz-broj-unos" onSubmit={(e) => { e.preventDefault(); if (broj.trim() !== '' && odgovoreno === null) zabiljezi(Number(broj.replace(',', '.')) === p.tocno); }}>
        <label>Odgovor <input type="number" inputMode="numeric" value={broj} disabled={odgovoreno !== null} onInput={(e) => setBroj((e.target as HTMLInputElement).value)} /> {p.jedinica}</label>
        <button type="submit" class="kviz-gumb glavni" disabled={odgovoreno !== null || broj.trim() === ''}>Provjeri</button>
        {odgovoreno === false && <p class="kviz-tocan">Točno je: {p.tocno}{p.jedinica ? ` ${p.jedinica}` : ''}.</p>}
      </form>
    );
  } else if (p.vrsta === 'redoslijed') {
    const sve = izmijesaneKarte[i];
    const tocanRed = [...sve].sort((a, b) => polozaj(a) - polozaj(b));
    tijelo = (
      <div>
        <p class="kviz-uputa">Dodiruj karte od najjače prema najslabijoj.</p>
        <div class="kviz-karte">{sve.map((k) => <KartaGumb key={k} k={k} disabled={odgovoreno !== null || poredak.includes(k)} onClick={() => {
          const n = [...poredak, k]; setPoredak(n);
          if (n.length === sve.length) zabiljezi(n.every((x, j) => polozaj(x) === polozaj(tocanRed[j])));
        }} />)}</div>
        <p class="kviz-uputa">Tvoj poredak:</p>
        <div class="kviz-karte poredak">{poredak.map((k) => <KartaGumb key={k} k={k} disabled />)}</div>
        {poredak.length > 0 && odgovoreno === null && <button type="button" class="kviz-gumb" onClick={() => setPoredak([])}>Kreni ispočetka</button>}
        {odgovoreno === false && <><p class="kviz-uputa">Točan poredak:</p><div class="kviz-karte">{tocanRed.map((k) => <KartaGumb key={k} k={k} disabled />)}</div></>}
      </div>
    );
  } else if (p.vrsta === 'stol') {
    const tocne = p.tocne.map(jednaKarta);
    tijelo = (
      <div>
        <div class="kviz-stol">
          {p.stol.map((s) => (
            <div class="kviz-stol-mjesto" key={s.tko}>
              <span>{TKO[s.tko]}{s.signal ? `, ${SIGNAL[s.signal]}` : ''}</span>
              <KartaGumb k={jednaKarta(s.karta)} disabled />
            </div>
          ))}
        </div>
        <p class="kviz-uputa">Tvoje karte. Dodirni kartu koju stavljaš.</p>
        <div class="kviz-karte">{parsirajZapis(p.ruka).sort((a, b) => a - b).map((k) => (
          <KartaGumb key={k} k={k} oznacena={odabrano === k || (odgovoreno === false && tocne.includes(k))} disabled={odgovoreno !== null}
            onClick={() => { setOdabrano(k); zabiljezi(tocne.includes(k)); }} />
        ))}</div>
      </div>
    );
  }

  const prikazKarata = (p.vrsta === 'izbor' && p.ruka) ? dijagramSVG(p.ruka).svg : ('karte' in p && p.karte && p.vrsta !== 'redoslijed') ? dijagramSVG(p.karte, { n: 0 }).svg : null;

  return (
    <section class="kviz" aria-labelledby="kviz-naslov">
      <h2 id="kviz-naslov">Kviz</h2>
      <p class="kviz-napredak">Pitanje {i + 1} od {pitanja.length}</p>
      <p class="kviz-pitanje">{p.pitanje}</p>
      {prikazKarata && <div class="dijagram-slika" dangerouslySetInnerHTML={{ __html: prikazKarata }} />}
      {tijelo}
      {odgovoreno !== null && (
        <div class={`kviz-povratna ${odgovoreno ? 'tocno' : 'netocno'}`} aria-live="polite">
          <p class="kviz-presuda">{odgovoreno ? 'Točno.' : 'Nije točno.'}</p>
          <p>{p.objasnjenje}{p.izvor.tocka ? ` (${p.izvor.tocka})` : ''}</p>
          {!odgovoreno && <p>Pročitaj ponovno: <a href={`#${p.izvor.odjeljak}`}>{odjeljci[p.izvor.odjeljak] ?? p.izvor.odjeljak}</a></p>}
          <button type="button" class="kviz-gumb glavni" onClick={dalje}>{i + 1 < pitanja.length ? 'Sljedeće pitanje' : 'Rezultat'}</button>
        </div>
      )}
    </section>
  );
}
