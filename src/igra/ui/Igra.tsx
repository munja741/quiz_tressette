import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { type Karta, naziv, nazivAkuzativ, parsirajZapis, boja, uBoji, GENITIV_BOJE, BOJE } from '../karte.ts';
import { type Dijeljenje, type Odigrano, type Signal, type Kombinacija, odigraj, dopustene, akuzaj, pronadiAkuzu, beleDoSada, par } from '../dijeljenje.ts';
import { type Partija, type Postavke, type Razina, novaPartija, zakljuciDijeljenje, sljedeceDijeljenje, ponoviDijeljenje } from '../partija.ts';
import { novoSjeme } from '../slucaj.ts';
import { vidljivoStanje } from '../cpu/znanje.ts';
import { situacija } from '../cpu/situacija.ts';
import { pravilo, type CpuPotez } from '../cpu/igrac-cpu.ts';
import { cpuPotez } from '../cpu/klijent.ts';
import { cpuAkuza } from '../cpu/igraj-dijeljenje.ts';
import { SlikaKarte, Poledina, svgKarte } from './Karta.tsx';
import { Pocetak, RAZINE } from './Pocetak.tsx';
import { Pregled } from './Pregled.tsx';
import { ucitaj, spremi, type Statistika } from './spremanje.ts';
import { IME, ULOGA, IME_PARA } from './imena.ts';
import './igra.css';

type Faza = 'pocetak' | 'igra' | 'obracun' | 'pregled' | 'kraj';
type Kartica = 'povijest' | 'rezultat' | 'postavke';

const SIGNAL_IME: Record<string, string> = { bato: 'bato', striso: 'strišo' };

function punti(b: number): string {
  const p = Math.floor(b / 3), r = b % 3;
  if (!p && !r) return '0';
  if (!r) return `${p}`;
  return p ? `${p} i ${r} ${r === 1 ? 'bela' : 'bele'}` : `${r} ${r === 1 ? 'bela' : 'bele'}`;
}

function opisKombinacije(k: Kombinacija): string {
  if (k.vrsta === 'napolitana') return `napolitana u ${['kupama', 'špadama', 'dinarima', 'baštonima'][k.kljuc]}`;
  const ime = ['trice', 'duje', 'aša'][k.kljuc];
  return `${k.vrsta === 'cetiri' ? '4' : '3'} ${ime}`;
}

function hashPoveznica(): { ruka?: Karta[]; dijeljenje?: { sjeme: number; djelitelj: number }; opis?: string } {
  if (typeof location === 'undefined') return {};
  const h = new URLSearchParams(location.hash.replace(/^#/, ''));
  const out: ReturnType<typeof hashPoveznica> = {};
  const ruke = h.get('ruke');
  if (ruke) {
    out.ruka = parsirajZapis(ruke);
    out.opis = 'Prvo dijeljenje počinje sa zadanom rukom iz poveznice; ostale karte dijele se nasumično.';
  }
  const dj = h.get('dijeljenje');
  if (dj) {
    const [s, d] = dj.split('.').map(Number);
    if (Number.isFinite(s)) {
      out.dijeljenje = { sjeme: s >>> 0, djelitelj: Number.isFinite(d) ? ((d % 4) + 4) % 4 : 3 };
      out.opis = 'Dijeljenje iz poveznice: iste karte kao kod osobe koja ga je podijelila.';
    }
  }
  return out;
}

export default function Igra() {
  const pocetno = useMemo(() => ucitaj(), []);
  const [postavke, setPostavke] = useState<Postavke>(pocetno.postavke);
  const [partija, setPartija] = useState<Partija | null>(null);
  const [spremljena, setSpremljena] = useState<Partija | null>(pocetno.partija && !pocetno.partija.gotova ? pocetno.partija : null);
  const [statistika, setStatistika] = useState<Statistika>(pocetno.statistika);
  const [faza, setFaza] = useState<Faza>('pocetak');
  const [kartica, setKartica] = useState<Kartica>('povijest');
  const [odabrana, setOdabrana] = useState<Karta | null>(null);
  const [signal, setSignal] = useState<Signal>(null);
  const [prikazStih, setPrikazStih] = useState<Odigrano[] | null>(null);
  const [zadnjaOtvorena, setZadnjaOtvorena] = useState(false);
  const [savjet, setSavjet] = useState<CpuPotez | null>(null);
  const [savjetRacuna, setSavjetRacuna] = useState(false);
  const [upozorenje, setUpozorenje] = useState<{ k: Karta; tekst: string } | null>(null);
  const [najava, setNajava] = useState('');
  const [poveznica] = useState(() => hashPoveznica());
  const [kopirano, setKopirano] = useState(false);
  const prikazanoRuku = useRef(0);
  const zeton = useRef(0);

  const d = partija?.trenutno ?? null;

  // spremanje
  useEffect(() => {
    spremi({ postavke, partija: partija && !partija.gotova ? partija : spremljena, statistika });
  }, [postavke, partija, statistika, spremljena]);

  function promijeniPostavke(p: Partial<Postavke>) {
    setPostavke((x) => ({ ...x, ...p }));
    if (partija) setPartija({ ...partija, postavke: { ...partija.postavke, ...p, cilj: partija.postavke.cilj, akuza: partija.postavke.akuza, signali: partija.postavke.signali } });
  }

  function pripremi(dij: Dijeljenje): Dijeljenje {
    let x = cpuAkuza(dij, [1, 2, 3]);
    if (x.opcije.akuza && postavke.automatskaAkuza) x = akuzaj(x, 0, true);
    if (x.opcije.akuza && !pronadiAkuzu(x.ruke[0]).length) x = akuzaj(x, 0, false);
    return x;
  }

  function zapocni() {
    const p = novaPartija(postavke, novoSjeme(), poveznica.ruka, poveznica.dijeljenje);
    if (poveznica.dijeljenje) p.postavke = { ...p.postavke, cilj: 0 };
    prikazanoRuku.current = 0;
    setPartija({ ...p, trenutno: pripremi(p.trenutno) });
    setSpremljena(null);
    setFaza('igra');
    if (poveznica.ruka || poveznica.dijeljenje) history.replaceState(null, '', location.pathname);
  }

  function nastavi() {
    if (!spremljena) return;
    prikazanoRuku.current = spremljena.trenutno.odigrane.length;
    setPartija(spremljena);
    setPostavke((x) => ({ ...x, ...spremljena.postavke }));
    setSpremljena(null);
    setFaza(spremljena.trenutno.gotovo ? 'obracun' : 'igra');
  }

  function primijeni(nova: Dijeljenje, k: Karta, igrac: number, sig: Signal) {
    setNajava(`${IME[igrac]} igra ${nazivAkuzativ(k)}${sig ? `, ${SIGNAL_IME[sig]}` : ''}.`);
    setPartija((p) => (p ? { ...p, trenutno: nova } : p));
  }

  // završena ruka ostaje na stolu koliko traje stanka
  useEffect(() => {
    if (!d) return;
    const n = d.odigrane.length;
    if (n > prikazanoRuku.current && d.tekuca.length === 0) {
      prikazanoRuku.current = n;
      const r = d.odigrane[n - 1];
      setPrikazStih(r.karte);
      setNajava((x) => `${x} ${r.uzeo === 0 ? 'Ruku uzimaš ti' : `Ruku uzima ${IME[r.uzeo]}`}.`);
      const t = setTimeout(() => setPrikazStih(null), Math.max(400, postavke.stanka * 1.4));
      return () => clearTimeout(t);
    }
  }, [d]);

  // kraj dijeljenja
  useEffect(() => {
    if (!partija || !d || !d.gotovo || prikazStih || faza !== 'igra') return;
    const z = zakljuciDijeljenje(partija);
    setPartija(z);
    const o = z.zavrsena[z.zavrsena.length - 1].rezultat;
    setStatistika((s) => ({
      ...s,
      dijeljenja: s.dijeljenja + 1,
      punti: s.punti + o.ukupno[0],
      ultima: s.ultima + (o.ultima === 0 ? 1 : 0),
      akuza: s.akuza + (o.akuza[0] > 0 ? 1 : 0),
      partija: s.partija + (z.gotova ? 1 : 0),
      pobjeda: s.pobjeda + (z.gotova && z.pobjednik === 0 ? 1 : 0),
    }));
    setFaza('obracun');
  }, [partija, d, prikazStih, faza]);

  const akuzaCeka = !!d && d.opcije.akuza && !d.akuzaOdluka[0] && d.odigrane.length === 0 && pronadiAkuzu(d.ruke[0]).length > 0;

  // CPU na potezu
  useEffect(() => {
    if (!partija || !d || faza !== 'igra' || d.gotovo || prikazStih || d.naPotezu === 0 || akuzaCeka) return;
    const igrac = d.naPotezu;
    const razina: Razina = igrac === 2 ? partija.postavke.razinaPartner : partija.postavke.razinaProtivnici;
    const moj = ++zeton.current;
    const pocetak = Date.now();
    const pogled = vidljivoStanje(d, igrac);
    let t: ReturnType<typeof setTimeout> | undefined;
    cpuPotez(pogled, razina).then((pot) => {
      const ostatak = Math.max(0, postavke.stanka - (Date.now() - pocetak));
      t = setTimeout(() => {
        if (zeton.current !== moj) return;
        try {
          primijeni(odigraj(d, pot.karta, pot.signal, pot.razlog), pot.karta, igrac, pot.signal);
        } catch {
          const k = dopustene(d)[0];
          primijeni(odigraj(d, k), k, igrac, null);
        }
      }, ostatak);
    });
    return () => { zeton.current++; if (t) clearTimeout(t); };
  }, [partija, faza, prikazStih, akuzaCeka]);

  // novo stanje: poništi odabir i savjet
  useEffect(() => { setOdabrana(null); setSavjet(null); setSignal(null); }, [d?.naPotezu, d?.odigrane.length]);

  function igrajKartu(k: Karta, svejedno = false) {
    if (!d || d.naPotezu !== 0 || prikazStih || akuzaCeka) return;
    if (!dopustene(d).includes(k)) return;
    if (!svejedno && partija!.postavke.ucitelj === 'upozori') {
      const pr = pravilo(situacija(vidljivoStanje(d, 0)));
      if (pr && pr.potez.karta !== k) {
        setUpozorenje({ k, tekst: `${pr.razlog.tekst}${pr.razlog.tocka ? ` (${pr.razlog.tocka})` : ''} Preporuka: ${nazivAkuzativ(pr.potez.karta)}.` });
        return;
      }
    }
    const sig = d.tekuca.length === 0 && d.opcije.signali ? signal : null;
    setUpozorenje(null);
    primijeni(odigraj(d, k, sig, { tekst: '', izvor: 'igrac' }), k, 0, sig);
  }

  function klikKarte(k: Karta) {
    if (postavke.potvrda === 'dva' && odabrana !== k) { setOdabrana(k); return; }
    igrajKartu(k);
  }

  async function traziSavjet() {
    if (!d || d.naPotezu !== 0) return;
    setSavjetRacuna(true);
    const pot = await cpuPotez(vidljivoStanje(d, 0), 'majstor');
    setSavjetRacuna(false);
    setSavjet(pot);
    if (pot.signal) setSignal(pot.signal);
  }

  function odluciAkuzu(prijavi: boolean) {
    if (!d) return;
    setPartija((p) => (p ? { ...p, trenutno: akuzaj(p.trenutno, 0, prijavi) } : p));
  }

  function sljedece() {
    if (!partija) return;
    const n = sljedeceDijeljenje(partija);
    prikazanoRuku.current = 0;
    setPartija({ ...n, trenutno: pripremi(n.trenutno) });
    setFaza('igra');
  }

  function ponovi() {
    if (!partija) return;
    const n = ponoviDijeljenje(partija);
    prikazanoRuku.current = 0;
    setPartija({ ...n, trenutno: pripremi(n.trenutno) });
    setFaza('igra');
  }

  function kopirajPoveznicu() {
    if (!d) return;
    const url = `${location.origin}${location.pathname}#dijeljenje=${d.sjeme}.${d.djelitelj}`;
    try { navigator.clipboard?.writeText(url); setKopirano(true); setTimeout(() => setKopirano(false), 2000); } catch { /* nema međuspremnika */ }
  }

  // tipkovnica
  useEffect(() => {
    function tipka(e: KeyboardEvent) {
      if (faza !== 'igra' || !d) return;
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'SELECT' || t.tagName === 'INPUT')) return;
      if (e.key === 'z' || e.key === 'Z') setZadnjaOtvorena((x) => !x);
      if (d.naPotezu === 0 && d.tekuca.length === 0 && d.opcije.signali) {
        if (e.key === '1') setSignal(null);
        if (e.key === '2') setSignal('bato');
        if (e.key === '3') setSignal('striso');
      }
    }
    addEventListener('keydown', tipka);
    return () => removeEventListener('keydown', tipka);
  }, [faza, d]);

  if (faza === 'pocetak' || !partija || !d) {
    return (
      <div class="igra-okvir">
        <Pocetak postavke={postavke} promijeni={(p) => setPostavke((x) => ({ ...x, ...p }))} igraj={zapocni} nastavi={spremljena ? nastavi : undefined} izPoveznice={poveznica.opis} />
      </div>
    );
  }

  const pp = partija.postavke;
  const kompaktne = postavke.kompaktne;
  const mojPotez = d.naPotezu === 0 && !d.gotovo && !prikazStih && !akuzaCeka && faza === 'igra';
  const dop = mojPotez ? dopustene(d) : [];
  const bele = beleDoSada(d);
  const uzete = [0, 1].map((p) => d.odigrane.filter((r) => par(r.uzeo) === p).length);
  const naStolu: Odigrano[] = prikazStih ?? d.tekuca;
  const zadnja = d.odigrane.length ? d.odigrane[d.odigrane.length - 1] : null;
  const signalRuke = prikazStih ? (zadnja?.signal ?? null) : d.tekuciSignal;
  const otvaracRuke = prikazStih ? zadnja?.otvara : d.otvaraTekucu;
  const brojDijeljenja = partija.zavrsena.length + (partija.zakljuceno ? 0 : 1);
  const akuzaIgraca = (i: number) => d.akuza.find((a) => a.igrac === i);

  const plocica = (i: number) => {
    const a = akuzaIgraca(i);
    return (
      <div class={`plocica mjesto-${i} ${d.naPotezu === i && !d.gotovo && !prikazStih ? 'na-potezu' : ''}`}>
        <div class="plocica-ime">
          <span>{IME[i]}</span>
          {d.djelitelj === i && <span class="zeton" title="Djelitelj" aria-label="djelitelj">D</span>}
        </div>
        <div class="plocica-info">
          {ULOGA[i] && <span>{ULOGA[i]}</span>}
          <span>{d.ruke[i].length} {d.ruke[i].length === 1 ? 'karta' : d.ruke[i].length < 5 && d.ruke[i].length > 1 ? 'karte' : 'karata'}</span>
        </div>
        {(signalRuke && otvaracRuke === i && naStolu.length > 0) && <div class="oznaka-signala">{SIGNAL_IME[signalRuke]}</div>}
        {a && d.odigrane.length < 2 && <div class="oznaka-akuze">akuža {a.punti}: {a.kombinacije.map(opisKombinacije).join(', ')}</div>}
      </div>
    );
  };

  const poBojama = [0, 1, 2, 3].map((b) => uBoji(d.ruke[0], b)).filter((x) => x.length);

  return (
    <div class="igra-okvir">
      <div class="sr-only" aria-live="polite">{najava}</div>
      <div class="raspored">
        {/* ploča sa stanjem */}
        <aside class="stanje" aria-label="Stanje igre">
          <dl>
            <div><dt>Dijeljenje</dt><dd>{brojDijeljenja}</dd></div>
            <div><dt>Djelitelj</dt><dd>{IME[d.djelitelj]}</dd></div>
            <div><dt>Cilj</dt><dd>{pp.cilj === 0 ? 'jedno dijeljenje' : pp.cilj}</dd></div>
            <div><dt>Akuža</dt><dd>{pp.akuza ? 'da' : 'ne'}</dd></div>
          </dl>
          <table class="rezultat-mali">
            <thead><tr><th scope="col"></th><th scope="col">Mi</th><th scope="col">Oni</th></tr></thead>
            <tbody>
              {pp.cilj !== 0 && <tr><th scope="row">Partija</th><td class="broj">{partija.zbroj[0]}</td><td class="broj">{partija.zbroj[1]}</td></tr>}
              <tr><th scope="row">Ruke</th><td>{uzete[0]}</td><td>{uzete[1]}</td></tr>
              <tr><th scope="row">Punti</th>{postavke.brojac === 'vidljiv' ? <><td>{punti(bele[0])}</td><td>{punti(bele[1])}</td></> : <td colSpan={2} class="skriveno">broji sam</td>}</tr>
            </tbody>
          </table>
          <button type="button" class="gumb malen" aria-pressed={zadnjaOtvorena} disabled={!zadnja} onClick={() => setZadnjaOtvorena((x) => !x)}>Zadnja ruka</button>
          {zadnjaOtvorena && zadnja && (
            <div class="zadnja-ruka">
              {zadnja.karte.map((o) => <div key={o.karta}><span class="malo">{IME[o.igrac]}</span><SlikaKarte k={o.karta} kompaktna /></div>)}
              <p class="malo">Uzeo: {IME[zadnja.uzeo]}</p>
            </div>
          )}
        </aside>

        {/* stol */}
        <main class="stol-okvir">
          <div class="stol" onClick={() => prikazStih && setPrikazStih(null)}>
            <div class="pozicija gore">{plocica(2)}<div class="poledine">{d.ruke[2].map((k) => <Poledina key={k} klasa="mala" />)}</div></div>
            <div class="pozicija lijevo">{plocica(1)}</div>
            <div class="pozicija desno">{plocica(3)}</div>
            <div class="sredina" aria-label="Karte na stolu">
              {naStolu.map((o) => (
                <div class={`na-stolu od-${o.igrac}`} key={o.karta}>
                  <SlikaKarte k={o.karta} kompaktna={kompaktne} />
                </div>
              ))}
              {akuzaCeka && (
                <div class="dijalog" role="dialog" aria-labelledby="akuza-naslov">
                  <h2 id="akuza-naslov">Akuža</h2>
                  <p>Imaš: {pronadiAkuzu(d.ruke[0]).map(opisKombinacije).join(', ')}. Vrijedi {pronadiAkuzu(d.ruke[0]).reduce((s, k) => s + k.punti, 0)} punta.</p>
                  <div class="akcije">
                    <button type="button" class="gumb glavni" onClick={() => odluciAkuzu(true)}>Akužaj</button>
                    <button type="button" class="gumb" onClick={() => odluciAkuzu(false)}>Bez akuže</button>
                  </div>
                </div>
              )}
              {upozorenje && (
                <div class="dijalog" role="alertdialog" aria-labelledby="upoz-naslov">
                  <h2 id="upoz-naslov">Siguran si?</h2>
                  <p>{upozorenje.tekst}</p>
                  <div class="akcije">
                    <button type="button" class="gumb" onClick={() => igrajKartu(upozorenje.k, true)}>Igraj {nazivAkuzativ(upozorenje.k)}</button>
                    <button type="button" class="gumb glavni" onClick={() => setUpozorenje(null)}>Promijeni potez</button>
                  </div>
                </div>
              )}
            </div>
            <div class="pozicija dolje">{plocica(0)}</div>
          </div>

          {/* moja ruka */}
          <div class="moja-ruka" role="group" aria-label="Tvoje karte">
            {poBojama.map((karte) => (
              <div class="boja-grupa" key={boja(karte[0])}>
                {karte.map((k) => {
                  const dopustena = dop.includes(k);
                  return (
                    <button
                      type="button"
                      key={k}
                      class={`karta-gumb ${kompaktne ? 'kompaktna' : ''} ${odabrana === k ? 'podignuta' : ''} ${savjet?.karta === k ? 'savjet' : ''}`}
                      disabled={!dopustena}
                      aria-label={naziv(k)}
                      onClick={() => klikKarte(k)}
                      dangerouslySetInnerHTML={{ __html: svgKarte(k, kompaktne) }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div class="ispod-ruke">
            {mojPotez && d.tekuca.length === 0 && d.opcije.signali && (
              <div class="signali" role="group" aria-label="Signal">
                <span class="oznaka">Signal</span>
                {([null, 'bato', 'striso'] as Signal[]).map((s) => (
                  <button type="button" key={String(s)} class="pilula" aria-pressed={signal === s} onClick={() => setSignal(s)}>{s ? SIGNAL_IME[s] : 'bez'}</button>
                ))}
              </div>
            )}
            <div class="poruka" aria-live="polite">
              {mojPotez ? (postavke.potvrda === 'dva' && odabrana !== null ? `Dodirni ${nazivAkuzativ(odabrana)} još jednom da je odigraš.` : d.tekuca.length ? `Odgovori na ${GENITIV_BOJE[BOJE[boja(d.tekuca[0].karta)]]}.` : 'Ti otvaraš ruku.') : prikazStih ? 'Dodirni stol za sljedeću ruku.' : akuzaCeka ? 'Odluči o akuži.' : d.gotovo ? '' : `Na potezu: ${IME[d.naPotezu]}.`}
            </div>
            {pp.ucitelj !== 'iskljucen' && (
              <button type="button" class="gumb malen" disabled={!mojPotez || savjetRacuna} onClick={traziSavjet}>{savjetRacuna ? 'Računam…' : 'Savjet'}</button>
            )}
          </div>
          {savjet && mojPotez && (
            <p class="savjet-tekst">Savjet: {nazivAkuzativ(savjet.karta)}{savjet.signal ? `, ${SIGNAL_IME[savjet.signal]}` : ''}. {savjet.razlog.tekst}{savjet.razlog.tocka ? ` (${savjet.razlog.tocka})` : ''}</p>
          )}
        </main>

        {/* bočna ploča */}
        <aside class="bocna" aria-label="Povijest, rezultat i postavke">
          <div class="kartice" role="tablist">
            {(['povijest', 'rezultat', 'postavke'] as Kartica[]).map((k) => (
              <button type="button" role="tab" key={k} aria-selected={kartica === k} class="kartica" onClick={() => setKartica(k)}>{k === 'povijest' ? 'Povijest' : k === 'rezultat' ? 'Rezultat' : 'Postavke'}</button>
            ))}
          </div>
          <div class="kartica-sadrzaj" role="tabpanel">
            {kartica === 'povijest' && (
              d.odigrane.length === 0 ? <p class="malo">Odigrane ruke pojavit će se ovdje.</p> : (
                <ol class="povijest">
                  {d.odigrane.map((r, i) => (
                    <li key={i}>
                      <span class="povijest-karte">{r.karte.map((o) => <span key={o.karta} title={`${IME[o.igrac]}: ${naziv(o.karta)}${o.razlog && o.razlog.izvor !== 'igrac' ? `. ${o.razlog.tekst}` : ''}`}><SlikaKarte k={o.karta} kompaktna /></span>)}</span>
                      <span class="malo">{r.otvara === 0 ? 'Otvaraš' : `${IME[r.otvara]} otvara`}{r.signal ? `, ${SIGNAL_IME[r.signal]}` : ''}. {r.uzeo === 0 ? 'Uzimaš ti' : `Uzima ${IME[r.uzeo]}`}.</span>
                    </li>
                  ))}
                </ol>
              )
            )}
            {kartica === 'rezultat' && (
              <table class="tablica">
                <thead><tr><th scope="col">Dijeljenje</th><th scope="col">Mi</th><th scope="col">Oni</th></tr></thead>
                <tbody>
                  {partija.zavrsena.map((z, i) => <tr key={i}><td>{i + 1}</td><td>{z.rezultat.ukupno[0]}</td><td>{z.rezultat.ukupno[1]}</td></tr>)}
                  <tr class="zbroj"><th scope="row">Ukupno</th><td>{partija.zbroj[0]}</td><td>{partija.zbroj[1]}</td></tr>
                </tbody>
              </table>
            )}
            {kartica === 'postavke' && (
              <form class="postavke" onSubmit={(e) => e.preventDefault()}>
                <label class="izbor"><span>Partner</span>
                  <select value={pp.razinaPartner} onChange={(e) => promijeniPostavke({ razinaPartner: (e.target as HTMLSelectElement).value as Razina })}>{RAZINE.map((x) => <option value={x.r} key={x.r}>{x.ime}</option>)}</select></label>
                <label class="izbor"><span>Protivnici</span>
                  <select value={pp.razinaProtivnici} onChange={(e) => promijeniPostavke({ razinaProtivnici: (e.target as HTMLSelectElement).value as Razina })}>{RAZINE.map((x) => <option value={x.r} key={x.r}>{x.ime}</option>)}</select></label>
                <label class="izbor"><span>Stanka između poteza</span>
                  <select value={postavke.stanka} onChange={(e) => promijeniPostavke({ stanka: Number((e.target as HTMLSelectElement).value) })}>
                    <option value={300}>kratka</option><option value={700}>normalna</option><option value={1200}>duga</option></select></label>
                <label class="izbor"><span>Učitelj</span>
                  <select value={pp.ucitelj} onChange={(e) => promijeniPostavke({ ucitelj: (e.target as HTMLSelectElement).value as Postavke['ucitelj'] })}>
                    <option value="iskljucen">isključen</option><option value="savjet">savjet na zahtjev</option><option value="upozori">upozori na grešku</option></select></label>
                <label class="izbor"><span>Brojač punata</span>
                  <select value={postavke.brojac} onChange={(e) => promijeniPostavke({ brojac: (e.target as HTMLSelectElement).value as Postavke['brojac'] })}>
                    <option value="vidljiv">vidljiv</option><option value="skriven">skriven (broji sam)</option></select></label>
                <label class="izbor"><span>Potvrda poteza</span>
                  <select value={postavke.potvrda} onChange={(e) => promijeniPostavke({ potvrda: (e.target as HTMLSelectElement).value as Postavke['potvrda'] })}>
                    <option value="jedan">jedan dodir</option><option value="dva">dva dodira</option></select></label>
                <label class="prekidac"><input type="checkbox" checked={postavke.kompaktne} onChange={(e) => promijeniPostavke({ kompaktne: (e.target as HTMLInputElement).checked })} /><span>Kompaktne karte</span></label>
                <label class="prekidac"><input type="checkbox" checked={postavke.automatskaAkuza} onChange={(e) => promijeniPostavke({ automatskaAkuza: (e.target as HTMLInputElement).checked })} /><span>Automatska akuža</span></label>
                <button type="button" class="gumb malen" onClick={() => { setFaza('pocetak'); setSpremljena(partija.gotova ? null : partija); setPartija(null); }}>Nova partija</button>
              </form>
            )}
          </div>
        </aside>
      </div>

      {faza === 'obracun' && partija.zavrsena.length > 0 && (
        <Obracun partija={partija} sljedece={sljedece} pregled={() => setFaza('pregled')} ponovi={ponovi} kopiraj={kopirajPoveznicu} kopirano={kopirano}
          novaPartija={() => { setFaza('pocetak'); setPartija(null); }} />
      )}
      {faza === 'pregled' && <div class="preklop"><div class="preklop-ploca siroka"><Pregled d={partija.zavrsena[partija.zavrsena.length - 1].dijeljenje} zatvori={() => setFaza('obracun')} kompaktne={kompaktne} /></div></div>}
    </div>
  );
}

function Obracun({ partija, sljedece, pregled, ponovi, kopiraj, kopirano, novaPartija }: { partija: Partija; sljedece: () => void; pregled: () => void; ponovi: () => void; kopiraj: () => void; kopirano: boolean; novaPartija: () => void }) {
  const z = partija.zavrsena[partija.zavrsena.length - 1];
  const o = z.rezultat;
  const kraj = partija.gotova;
  const naslov = kraj
    ? partija.pobjednik === null ? 'Neriješeno' : partija.pobjednik === 0 ? 'Pobijedili ste' : 'Pobijedili su protivnici'
    : `Dijeljenje ${partija.zavrsena.length}`;
  const ruke = (n: number) => `${n} ${n === 1 ? 'punat' : n > 1 && n < 5 ? 'punta' : 'punata'}`;
  return (
    <div class="preklop" role="dialog" aria-labelledby="obracun-naslov">
      <div class="preklop-ploca">
        <h2 id="obracun-naslov">{naslov}</h2>
        <table class="tablica obracun">
          <thead><tr><th scope="col"></th><th scope="col">{IME_PARA[0]}</th><th scope="col">{IME_PARA[1]}</th></tr></thead>
          <tbody>
            <tr><th scope="row">Asovi</th><td>{ruke(o.asovi[0])}</td><td>{ruke(o.asovi[1])}</td></tr>
            <tr><th scope="row">Bele</th><td>{o.bele[0]}</td><td>{o.bele[1]}</td></tr>
            <tr><th scope="row">Ultima</th><td>{o.ultima === 0 ? '1 punat' : ''}</td><td>{o.ultima === 1 ? '1 punat' : ''}</td></tr>
            {(o.akuza[0] > 0 || o.akuza[1] > 0) && <tr><th scope="row">Akuža</th><td>{o.akuza[0] || ''}</td><td>{o.akuza[1] || ''}</td></tr>}
            <tr class="zbroj"><th scope="row">Ukupno</th><td>{o.ukupno[0]}{o.kapot[0] ? ' (kapot)' : ''}</td><td>{o.ukupno[1]}{o.kapot[1] ? ' (kapot)' : ''}</td></tr>
            {partija.postavke.cilj !== 0 && <tr class="partija"><th scope="row">Partija do {partija.postavke.cilj}</th><td>{partija.zbroj[0]}</td><td>{partija.zbroj[1]}</td></tr>}
          </tbody>
        </table>
        {!kraj && partija.postavke.cilj !== 0 && partija.zbroj[0] >= partija.postavke.cilj && partija.zbroj[0] === partija.zbroj[1] && (
          <p>Oba para su prešla cilj s istim brojem punata: igra se dodatno dijeljenje.</p>
        )}
        {kraj && partija.zavrsena.length > 1 && <p class="malo">Odigrano dijeljenja: {partija.zavrsena.length}.</p>}
        <div class="akcije">
          {!kraj && <button type="button" class="gumb glavni" onClick={sljedece}>Sljedeće dijeljenje</button>}
          {kraj && <button type="button" class="gumb glavni" onClick={novaPartija}>Nova partija</button>}
          <button type="button" class="gumb" onClick={pregled}>Pregled dijeljenja</button>
          {!kraj && <button type="button" class="gumb" onClick={ponovi}>Ponovi ovo dijeljenje</button>}
          <button type="button" class="gumb" onClick={kopiraj}>{kopirano ? 'Poveznica kopirana' : 'Kopiraj poveznicu na dijeljenje'}</button>
        </div>
      </div>
    </div>
  );
}

