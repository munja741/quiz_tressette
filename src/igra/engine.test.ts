import { describe, it, expect } from 'vitest';
import { bele, karta, parsirajZapis, naziv, TRICA, DUJA, AS, KRALJ } from './karte.ts';
import { podijeli, dopustene, odigraj, obracun, pobjednikRuke, pronadiAkuzu, akuzaj, NedopustenPotez, type Dijeljenje } from './dijeljenje.ts';
import { novaPartija, zakljuciDijeljenje, sljedeceDijeljenje, ZADANE_POSTAVKE, type Partija } from './partija.ts';
import { rng } from './slucaj.ts';

const opc = { akuza: true, signali: true };

function odigrajNasumicno(d: Dijeljenje, sjeme: number): Dijeljenje {
  const r = rng(sjeme);
  while (!d.gotovo) {
    const dop = dopustene(d);
    d = odigraj(d, dop[Math.floor(r() * dop.length)]);
  }
  return d;
}

describe('karte', () => {
  it('vrijednosti u belama', () => {
    expect(bele(karta(0, AS))).toBe(3);
    expect(bele(karta(0, TRICA))).toBe(1);
    expect(bele(karta(0, KRALJ))).toBe(1);
    expect(bele(karta(0, 6))).toBe(0);
    const ukupno = Array.from({ length: 40 }, (_, k) => bele(k)).reduce((a, b) => a + b, 0);
    expect(ukupno).toBe(32); // + 3 za ultimu = 35
  });
  it('zapis dijagrama', () => {
    expect(parsirajZapis('kupe:2,A,13|bastoni:-')).toEqual([karta(0, DUJA), karta(0, AS), karta(0, KRALJ)]);
    expect(naziv(karta(1, TRICA))).toBe('trica špada');
  });
});

describe('dijeljenje', () => {
  it('svih 40 karata, po 10 svakom igraču', () => {
    for (let s = 1; s < 50; s++) {
      const d = podijeli(s, s % 4, opc);
      expect(d.ruke.every((h) => h.length === 10)).toBe(true);
      expect(new Set(d.ruke.flat()).size).toBe(40);
      expect(d.naPotezu).toBe((s % 4 + 1) % 4);
    }
  });
  it('isto sjeme daje isto dijeljenje', () => {
    expect(podijeli(77, 3, opc).ruke).toEqual(podijeli(77, 3, opc).ruke);
  });
  it('zadana ruka igrača', () => {
    const z = parsirajZapis('kupe:2,A,13,5|spade:3,A,7,4|dinari:6,5');
    const d = podijeli(5, 3, opc, z);
    expect(d.ruke[0]).toEqual([...z].sort((a, b) => a - b));
    expect(new Set(d.ruke.flat()).size).toBe(40);
  });
});

describe('ruka', () => {
  it('mora se odgovoriti na boju', () => {
    let d = podijeli(11, 3, opc);
    const k = d.ruke[0][0];
    d = odigraj(d, k);
    const dop = dopustene(d);
    const b = Math.floor(k / 10);
    if (d.ruke[1].some((x) => Math.floor(x / 10) === b)) expect(dop.every((x) => Math.floor(x / 10) === b)).toBe(true);
    else expect(dop.length).toBe(d.ruke[1].length);
  });
  it('najjača karta otvorene boje uzima ruku, bez aduta', () => {
    const w = pobjednikRuke([
      { igrac: 0, karta: karta(0, 6) },
      { igrac: 1, karta: karta(1, TRICA) },
      { igrac: 2, karta: karta(0, AS) },
      { igrac: 3, karta: karta(0, KRALJ) },
    ]);
    expect(w).toBe(2);
  });
  it('signal smije dati samo onaj tko otvara', () => {
    let d = podijeli(3, 3, opc);
    d = odigraj(d, d.ruke[0][0], 'bato');
    expect(d.tekuciSignal).toBe('bato');
    expect(() => odigraj(d, dopustene(d)[0], 'striso')).toThrow(NedopustenPotez);
  });
  it('bez signala kad su isključeni', () => {
    const d = podijeli(3, 3, { akuza: true, signali: false });
    expect(() => odigraj(d, d.ruke[0][0], 'bato')).toThrow(NedopustenPotez);
  });
});

describe('obračun', () => {
  it('35 bela i 11 punata u svakom dijeljenju', () => {
    for (let s = 1; s <= 300; s++) {
      const d = odigrajNasumicno(podijeli(s, 0, { akuza: false, signali: true }), s * 7);
      const o = obracun(d);
      expect(o.ukupnoBela[0] + o.ukupnoBela[1]).toBe(35);
      expect(o.puntiIgre[0] + o.puntiIgre[1]).toBe(11);
      expect(o.asovi[0] + o.asovi[1]).toBe(4);
      expect(o.uzeteRuke[0] + o.uzeteRuke[1]).toBe(10);
    }
  });
});

describe('akuža', () => {
  it('kombinacije i zbrajanje', () => {
    const ruka = parsirajZapis('kupe:3,2,A|spade:3,A|dinari:3,A|bastoni:A,4,5');
    const k = pronadiAkuzu(ruka);
    const vrste = k.map((x) => `${x.vrsta}${x.kljuc}`).sort();
    expect(vrste).toEqual(['cetiri2', 'napolitana0', 'tri0'].sort());
    expect(k.reduce((s, x) => s + x.punti, 0)).toBe(10);
  });
  it('napolitana uvijek vrijedi 3', () => {
    const k = pronadiAkuzu(parsirajZapis('kupe:3,2,A,13,12,11,7'));
    expect(k).toHaveLength(1);
    expect(k[0].punti).toBe(3);
  });
  it('kapot ne briše akužu', () => {
    let d = podijeli(9, 3, opc);
    d = { ...d, pocetneRuke: d.pocetneRuke.map((h, i) => (i === 1 ? parsirajZapis('kupe:3,2,A|spade:4,5,6,7|dinari:4,5,6') : h)) };
    d = akuzaj(d, 1, true);
    const zavrseno = { ...d, gotovo: true, odigrane: Array.from({ length: 10 }, (_, i) => ({ otvara: 0, karte: [], signal: null, uzeo: 0, bele: i === 9 ? 35 : 0 })) };
    const o = obracun(zavrseno as Dijeljenje);
    expect(o.kapot[1]).toBe(true);
    expect(o.ukupno[1]).toBe(3);
    expect(o.ukupno[0]).toBe(11);
  });
  it('akuža se ne može prijaviti nakon prve karte', () => {
    let d = podijeli(4, 3, opc);
    d = odigraj(d, d.ruke[0][0]);
    const prije = d.akuza.length;
    d = akuzaj(d, 0, true);
    expect(d.akuza.length).toBe(prije);
  });
});

describe('partija', () => {
  function odigrajPartiju(cilj: 0 | 21 | 31 | 41, sjeme: number): Partija {
    let p = novaPartija({ ...ZADANE_POSTAVKE, cilj, akuza: false }, sjeme);
    let n = 0;
    while (!p.gotova && n < 100) {
      p = { ...p, trenutno: odigrajNasumicno(p.trenutno, sjeme + n) };
      p = zakljuciDijeljenje(p);
      if (!p.gotova) p = sljedeceDijeljenje(p);
      n++;
    }
    return p;
  }
  it('prvo dijeljenje otvara igrač, djelitelj je igrač prije njega', () => {
    const p = novaPartija(ZADANE_POSTAVKE, 1);
    expect(p.trenutno.djelitelj).toBe(3);
    expect(p.trenutno.naPotezu).toBe(0);
  });
  it('djelitelj se mijenja u smjeru igre', () => {
    let p = novaPartija({ ...ZADANE_POSTAVKE, akuza: false }, 2);
    p = zakljuciDijeljenje({ ...p, trenutno: odigrajNasumicno(p.trenutno, 2) });
    p = sljedeceDijeljenje(p);
    expect(p.trenutno.djelitelj).toBe(0);
    expect(p.trenutno.naPotezu).toBe(1);
  });
  it('partija završava na cilju; kod izjednačenja preko cilja igra se dalje', () => {
    for (const cilj of [21, 31, 41] as const) {
      for (let s = 1; s <= 20; s++) {
        const p = odigrajPartiju(cilj, s * 13);
        expect(p.gotova).toBe(true);
        expect(Math.max(...p.zbroj)).toBeGreaterThanOrEqual(cilj);
        expect(p.zbroj[0]).not.toBe(p.zbroj[1]);
        expect(p.pobjednik).toBe(p.zbroj[0] > p.zbroj[1] ? 0 : 1);
        // prije zadnjeg dijeljenja nitko nije bio na cilju, osim izjednačenja
        const prije = p.zavrsena.slice(0, -1).reduce((z, x) => [z[0] + x.rezultat.ukupno[0], z[1] + x.rezultat.ukupno[1]], [0, 0]);
        if (Math.max(...prije) >= cilj) expect(prije[0]).toBe(prije[1]);
      }
    }
  });
  it('jedno dijeljenje', () => {
    const p = odigrajPartiju(0, 5);
    expect(p.zavrsena).toHaveLength(1);
    expect(p.gotova).toBe(true);
  });
});

import { stanjeNakon, potezi } from './pregled.ts';
describe('pregled', () => {
  it('stanje nakon svih poteza jednako je završnom', () => {
    let d = podijeli(21, 3, opc);
    d = odigrajNasumicno(d, 5);
    const s = stanjeNakon(d, 40);
    expect(s.odigrane.map((r) => r.uzeo)).toEqual(d.odigrane.map((r) => r.uzeo));
    expect(potezi(d)).toHaveLength(40);
    expect(stanjeNakon(d, 0).ruke).toEqual(d.pocetneRuke);
  });
});
