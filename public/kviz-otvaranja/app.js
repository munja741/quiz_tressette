'use strict';

const BOJE = {
  kupe:    { naziv: 'Kupe',    gen: 'kupa' },
  spade:   { naziv: 'Špade',   gen: 'špada' },
  dinari:  { naziv: 'Dinari',  gen: 'dinara' },
  bastoni: { naziv: 'Baštoni', gen: 'baštona' }
};
const REDOSLIJED = ['kupe', 'spade', 'dinari', 'bastoni'];
const OCJENE = {
  savrseno:      { naziv: 'Savršeno',      bodovi: 3 },
  pogresno:      { naziv: 'Pogrešno',      bodovi: 0 },
  katastrofalno: { naziv: 'Katastrofalno', bodovi: -2 }
};
// Granice razina kao udio najvećeg mogućeg zbroja (3 boda po ruci); uz 10 ruku: 27, 20, 12 od 30.
const RAZINE = [
  { naziv: 'Sjena', udio: 0.9 },
  { naziv: 'Iskusni igrač', udio: 2 / 3 },
  { naziv: 'Igrač', udio: 0.4 },
  { naziv: 'Početnik', udio: -Infinity }
];
const IMENA_VRIJEDNOSTI = { 13: 'kralj', 12: 'konj', 11: 'fanat', A: 'aš' };
// Položaji znakova (u % lica karte) za vrijednosti 1 do 7; figure 11, 12 i 13 imaju svoj piktogram.
const L = { x1: 24, x2: 76, m: 50 };
const RASPORED = {
  A: [[50, 50]],
  2: [[50, 24], [50, 76]],
  3: [[50, 20], [50, 50], [50, 80]],
  4: [[L.x1, 26], [L.x2, 26], [L.x1, 74], [L.x2, 74]],
  5: [[L.x1, 24], [L.x2, 24], [50, 50], [L.x1, 76], [L.x2, 76]],
  6: [[L.x1, 20], [L.x2, 20], [L.x1, 50], [L.x2, 50], [L.x1, 80], [L.x2, 80]],
  7: [[L.x1, 20], [L.x2, 20], [50, 35], [L.x1, 50], [L.x2, 50], [L.x1, 80], [L.x2, 80]]
};

const app = document.getElementById('app');
let ruke = [];
let stanje = null;

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const ikona = (boja, figura) => {
  const ns = 'http://www.w3.org/2000/svg';
  const s = document.createElementNS(ns, 'svg');
  s.setAttribute('aria-hidden', 'true');
  const u = document.createElementNS(ns, 'use');
  u.setAttribute('href', figura ? '#' + boja : '#s-' + boja);
  s.appendChild(u);
  return s;
};
const promijesaj = (a) => {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};
const prikaz = (...cvorovi) => { app.replaceChildren(...cvorovi); window.scrollTo(0, 0); };

function nacrtajKartu(vrijednost, boja) {
  const k = el('div', 'card');
  k.dataset.suit = boja;
  k.setAttribute('role', 'img');
  k.setAttribute('aria-label', `${IMENA_VRIJEDNOSTI[vrijednost] || vrijednost} ${BOJE[boja].gen}`);
  const indeks = (cls) => {
    const i = el('span', `idx ${cls}`);
    i.append(el('b', null, vrijednost), ikona(boja));
    return i;
  };
  const lice = el('div', 'face');
  if (RASPORED[vrijednost]) {
    lice.classList.add(vrijednost === 'A' ? 'ace' : 'pips');
    RASPORED[vrijednost].forEach(([x, y]) => {
      const p = ikona(boja);
      p.style.left = x + '%';
      p.style.top = y + '%';
      lice.append(p);
    });
  } else {
    lice.classList.add('court');
    lice.append(ikona('p-' + vrijednost, true), ikona(boja));
  }
  k.append(indeks('tl'), lice, indeks('br'));
  return k;
}

function opisOtvaranja(o) {
  const glavno = `${o.karta} ${BOJE[o.boja].gen}`;
  const signal = o.signal === 'bez signala' ? 'bez signala'
    : o.signal === 'volo' ? 'signal „volo“' : `signal ${o.signal}`;
  return { glavno, signal, opis: o.opis };
}

function provjeri(podaci) {
  const greske = [];
  if (!podaci || !Array.isArray(podaci.ruke) || !podaci.ruke.length) return ['Nema nijedne ruke u questions.json.'];
  podaci.ruke.forEach((r, i) => {
    const ime = `Ruka ${i + 1} (${r.id || '?'})`;
    const n = REDOSLIJED.reduce((s, b) => s + ((r.karte && r.karte[b]) || []).length, 0);
    if (n !== 10) greske.push(`${ime}: ima ${n} karata, a treba ih biti 10.`);
    if (!Array.isArray(r.otvaranja) || r.otvaranja.length < 2) greske.push(`${ime}: treba barem dva otvaranja.`);
    else {
      if (r.otvaranja.filter(o => o.ocjena === 'savrseno').length !== 1) greske.push(`${ime}: mora imati točno jedno „savrseno“ otvaranje.`);
      r.otvaranja.forEach(o => {
        if (!OCJENE[o.ocjena]) greske.push(`${ime}: nepoznata ocjena „${o.ocjena}“.`);
        if (!BOJE[o.boja]) greske.push(`${ime}: nepoznata boja „${o.boja}“.`);
      });
    }
  });
  return greske;
}

function pocetak() {
  const n = ruke.length;
  const naslov = el('h1', null, 'Test otvaranja');
  const uvod = el('div', 'panel');
  uvod.append(
    el('p', null, 'Trešeta u parove. Sjediš za stolom s deset karata u ruci kao prvi od ruke; partner sjedi nasuprot. Dodirni kartu kojom otvaraš, odaberi signal i odigraj je.'),
    el('p', 'muted', `Krug ima ${n} ${n === 1 ? 'ruku' : 'ruke'}. Savršeno otvaranje nosi 3 boda, pogrešno 0, a katastrofalno −2. Nakon svakog odgovora vidiš objašnjenje i točku iz priručnika.`)
  );
  const b = el('button', 'btn', 'Počni test');
  b.type = 'button';
  b.addEventListener('click', () => { stanje = { i: 0, odgovori: [] }; ruka(); });
  prikaz(naslov, uvod, b);
}

function zbroj() {
  return stanje.odgovori.reduce((s, a) => s + OCJENE[a.odabrano.ocjena].bodovi, 0);
}

const poredak = (o) => opisOtvaranja(o);
const tekstIgre = (o) => {
  const d = poredak(o);
  return d.signal === 'bez signala' ? 'Igraj bez signala' : `Igraj uz ${d.signal}`;
};
const istaKarta = (o, v, b) => o.karta === v && o.boja === b;

function straznjaStrana(cls) {
  return el('i', `back ${cls || ''}`);
}
function sjedalo(klasa, naziv, okomito) {
  const s = el('div', `seat ${klasa}`);
  const karte = el('div', 'backs');
  for (let i = 0; i < 10; i++) karte.append(straznjaStrana(okomito ? 'side' : ''));
  s.append(el('span', 'lbl', naziv), karte);
  return s;
}

function ruka() {
  const r = ruke[stanje.i];
  const n = ruke.length;
  const redoslijed = promijesaj(r.otvaranja);

  const prog = el('div', 'progress');
  prog.append(el('span', null, `Ruka ${stanje.i + 1} od ${n}`), el('span', null, `Bodovi: ${zbroj()}`));
  const bar = el('div', 'bar');
  const fill = el('i');
  fill.style.width = `${(stanje.i / n) * 100}%`;
  bar.append(fill);

  const stol = el('section', 'table');
  stol.setAttribute('aria-label', 'Stol');
  const trick = el('div', 'trick');
  const hint = el('span', 'hint', 'Ti si prvi od ruke');
  trick.append(hint);
  const ja = el('div', 'me', 'Ti · prvi od ruke');
  const ruka_ = el('div', 'myhand');
  ruka_.setAttribute('role', 'group');
  ruka_.setAttribute('aria-label', 'Tvojih deset karata');
  stol.append(sjedalo('top', 'Partner', false), sjedalo('left', 'Protivnik', true), trick, sjedalo('right', 'Protivnik', true), ja, ruka_);

  const akcije = el('div', 'actions');
  const upute = 'Dodirni kartu kojom otvaraš. Zatamnjene karte nisu među ponuđenim otvaranjima.';
  akcije.append(el('p', 'muted', upute));

  const legend = el('div', 'legend');
  let odabrana = null;
  let zavrseno = false;
  const slotovi = [];
  let prvi = true;

  REDOSLIJED.forEach(b => {
    const karte = r.karte[b] || [];
    const l = el('span');
    l.append(ikona(b), document.createTextNode(`${BOJE[b].naziv}: ${karte.length ? karte.join(' ') : 'nema'}`));
    legend.append(l);
    karte.forEach((v, idx) => {
      const gumb = el('button', 'slot');
      gumb.type = 'button';
      if (idx === 0 && !prvi) gumb.classList.add('suit-start');
      prvi = false;
      const moguce = redoslijed.filter(o => istaKarta(o, v, b));
      if (!moguce.length) gumb.classList.add('dim');
      gumb.append(nacrtajKartu(v, b));
      gumb.addEventListener('click', () => {
        if (zavrseno) return;
        if (!moguce.length) {
          odabrana = null;
          slotovi.forEach(x => x.gumb.classList.remove('sel'));
          akcije.replaceChildren(el('p', 'muted warn', 'Ta karta nije među ponuđenim otvaranjima. Odaberi neku od istaknutih.'));
          return;
        }
        if (odabrana === gumb) {
          odabrana = null;
          gumb.classList.remove('sel');
          akcije.replaceChildren(el('p', 'muted', upute));
          return;
        }
        odabrana = gumb;
        slotovi.forEach(x => x.gumb.classList.toggle('sel', x.gumb === gumb));
        prikaziSignale(v, b, moguce);
      });
      slotovi.push({ gumb, v, b });
      ruka_.append(gumb);
    });
  });

  function prikaziSignale(v, b, moguce) {
    const naslov = el('p', 'q', `Otvaraš s ${v} ${BOJE[b].gen}. Kako igraš?`);
    const opts = el('div', 'opts');
    moguce.forEach(o => {
      const d = poredak(o);
      const g = el('button', 'opt');
      g.type = 'button';
      g.append(el('span', 'main', tekstIgre(o)));
      if (d.opis) g.append(el('span', 'extra', d.opis));
      g.addEventListener('click', () => odigraj(o, v, b));
      opts.append(g);
    });
    akcije.replaceChildren(naslov, opts);
  }

  function odigraj(o, v, b) {
    zavrseno = true;
    stanje.odgovori.push({ ruka: r, odabrano: o });
    slotovi.forEach(x => { x.gumb.disabled = true; x.gumb.classList.remove('sel'); });
    const igrana = slotovi.find(x => x.v === v && x.b === b);
    igrana.gumb.classList.add('played');
    const najbolja = r.otvaranja.find(x => x.ocjena === 'savrseno');
    if (najbolja && !(najbolja.karta === v && najbolja.boja === b)) {
      const s = slotovi.find(x => x.v === najbolja.karta && x.b === najbolja.boja);
      if (s) s.gumb.classList.add('best');
    }
    hint.remove();
    const odigrana = el('div', 'played-card');
    odigrana.append(nacrtajKartu(v, b));
    const d = poredak(o);
    odigrana.append(el('span', 'bubble', d.signal === 'bez signala' ? 'bez signala' : d.signal));
    trick.append(odigrana);
    ocjena(o, redoslijed, akcije, r);
  }

  prikaz(prog, bar, el('h2', null, `Ruka ${stanje.i + 1}`), stol, akcije, legend);
}

function ocjena(odabrano, redoslijed, akcije, r) {
  const oc = OCJENE[odabrano.ocjena];
  const fb = el('div', `panel fb ${odabrano.ocjena}`);
  fb.append(
    el('h2', null, `${oc.naziv} (${oc.bodovi > 0 ? '+' : ''}${String(oc.bodovi).replace('-', '−')} b.)`),
    el('p', null, odabrano.zasto),
    el('p', 'muted', `${r.naslov} · Priručnik: ${r.tocka}`)
  );
  const sva = el('div', 'panel');
  sva.append(el('h2', null, 'Sva ponuđena otvaranja'));
  r.otvaranja.forEach(o => {
    const d = poredak(o);
    const red = el('div', 'res' + (o === odabrano ? ' mine' : ''));
    const gl = el('div');
    gl.append(el('strong', null, d.glavno), document.createTextNode(` · ${d.signal}`));
    red.append(gl);
    if (d.opis) red.append(el('div', 'muted', d.opis));
    const ob = OCJENE[o.ocjena];
    red.append(el('span', `badge g-${o.ocjena}`, `${ob.naziv} · ${String(ob.bodovi).replace('-', '−')} b.${o === odabrano ? ' · tvoj izbor' : ''}`));
    if (o !== odabrano) red.append(el('div', 'why', o.zasto));
    sva.append(red);
  });
  const zadnja = stanje.i === ruke.length - 1;
  const dalje = el('button', 'btn', zadnja ? 'Prikaži rezultat' : 'Dalje');
  dalje.type = 'button';
  dalje.addEventListener('click', () => { stanje.i++; zadnja ? kraj() : ruka(); });
  akcije.replaceChildren(fb, dalje, sva);
  fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function razina(bodovi, maks) {
  return RAZINE.find(r => bodovi >= r.udio * maks - 1e-9).naziv;
}

function kraj() {
  const n = ruke.length;
  const maks = n * OCJENE.savrseno.bodovi;
  const bodovi = zbroj();
  const sazetak = el('div', 'panel');
  sazetak.append(
    el('p', 'muted', 'Tvoj rezultat'),
    el('div', 'score', `${bodovi.toString().replace('-', '−')} / ${maks}`),
    el('div', 'level', razina(bodovi, maks))
  );

  const promaseno = stanje.odgovori.filter(a => a.odabrano.ocjena !== 'savrseno');
  const lista = el('div', 'panel');
  if (!promaseno.length) {
    lista.append(el('h2', null, 'Bez promašaja'), el('p', 'muted', 'Sve ruke otvorio si savršeno.'));
  } else {
    lista.append(el('h2', null, `Promašene ruke (${promaseno.length})`));
    promaseno.forEach(a => {
      const idx = ruke.indexOf(a.ruka) + 1;
      const sav = a.ruka.otvaranja.find(o => o.ocjena === 'savrseno');
      const d = opisOtvaranja(a.odabrano);
      const ds = opisOtvaranja(sav);
      const blok = el('div', 'miss');
      const ocj = OCJENE[a.odabrano.ocjena];
      blok.append(
        el('strong', null, `Ruka ${idx}: ${a.ruka.naslov}`),
        el('div', 'muted', `Priručnik: ${a.ruka.tocka}`)
      );
      const t1 = el('p');
      t1.append(el('span', `badge g-${a.odabrano.ocjena}`, ocj.naziv), document.createTextNode(` Tvoj izbor: ${d.glavno}, ${d.signal}${d.opis ? ' (' + d.opis + ')' : ''}. ${a.odabrano.zasto}`));
      const t2 = el('p');
      t2.append(el('span', 'badge g-savrseno', 'Savršeno'), document.createTextNode(` ${ds.glavno}, ${ds.signal}${ds.opis ? ' (' + ds.opis + ')' : ''}. ${sav.zasto}`));
      blok.append(t1, t2);
      lista.append(blok);
    });
  }

  const opet = el('button', 'btn', 'Ponovi test');
  opet.type = 'button';
  opet.addEventListener('click', pocetak);
  prikaz(el('h1', null, 'Kraj testa'), sazetak, lista, opet);
}

async function init() {
  try {
    const odg = await fetch('questions.json', { cache: 'no-cache' });
    if (!odg.ok) throw new Error(`HTTP ${odg.status}`);
    const podaci = await odg.json();
    const greske = provjeri(podaci);
    if (greske.length) {
      const p = el('div', 'panel err');
      p.append(el('strong', null, 'Greška u questions.json:'));
      const ul = el('ul');
      greske.forEach(g => ul.append(el('li', null, g)));
      p.append(ul);
      prikaz(p);
      return;
    }
    ruke = podaci.ruke;
    pocetak();
  } catch (e) {
    prikaz(el('p', 'panel err', `Pitanja se nisu mogla učitati (${e.message}). Otvori stranicu preko poslužitelja ili GitHub Pagesa, ne kao lokalnu datoteku.`));
  }
}
init();
