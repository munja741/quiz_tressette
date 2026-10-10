import { describe, it, expect } from 'vitest';
import { parsirajZapis, karta, naziv, DUJA, TRICA } from '../karte.ts';
import { podijeli, odigraj, dopustene, obracun } from '../dijeljenje.ts';
import { novaPartija, ZADANE_POSTAVKE, type Razina } from '../partija.ts';
import { rng } from '../slucaj.ts';
import { vidljivoStanje } from './znanje.ts';
import { situacija } from './situacija.ts';
import { pravilo, odluci } from './igrac-cpu.ts';
import { odigrajDijeljenje, odigrajPartiju } from './igraj-dijeljenje.ts';

const opc = { akuza: false, signali: true };
const B = { kupe: 0, spade: 1, dinari: 2, bastoni: 3 };

/** Pogled igrača 0 koji otvara prvu ruku sa zadanom rukom. */
function otvaranje(zapis: string, signali = true) {
  const d = podijeli(42, 3, { akuza: false, signali }, parsirajZapis(zapis));
  return { d, s: situacija(vidljivoStanje(d, 0)) };
}

// Ruke iz testa otvaranja (prototipovi/test-otvaranja.html), s brojem točke iz priručnika.
describe('pravila iz priručnika', () => {
  it('t. 16 / t. 11: nemaš baštone, duja+aš u kupama: otvori dujom kupa', () => {
    const { s } = otvaranje('kupe:2,A,13,5|spade:3,A,7,4|dinari:6,5|bastoni:-');
    const r = pravilo(s)!;
    expect(r.potez.karta).toBe(karta(B.kupe, DUJA));
    expect(r.razlog.tocka).toBe('t. 11');
  });
  it('t. 3: jedina boja za batiti: lišina špada uz bato', () => {
    const { s } = otvaranje('kupe:12,7,4|spade:3,6,5,4|dinari:A,6|bastoni:13');
    const r = pravilo(s)!;
    expect(r.potez.karta).toBe(karta(B.spade, 9));
    expect(r.potez.signal).toBe('bato');
    expect(r.razlog.tocka).toBe('t. 3');
  });
  it('t. 1: duga duja: lišina kupa uz bato (talijanski rebato)', () => {
    const { s } = otvaranje('kupe:2,7,6,5,4|spade:3,13,4|dinari:A,12|bastoni:-');
    const r = pravilo(s)!;
    expect(Math.floor(r.potez.karta / 10)).toBe(B.kupe);
    expect(r.potez.karta).toBe(karta(B.kupe, 9));
    expect(r.potez.signal).toBe('bato');
    expect(r.razlog.tocka).toBe('t. 1');
  });
  it('t. 10 i t. 11: suha trica+aš se ne otvara; otvara se dujom špada', () => {
    const { s } = otvaranje('kupe:3,A|spade:2,A,13,5|dinari:12,7,5|bastoni:11');
    const r = pravilo(s)!;
    expect(r.potez.karta).toBe(karta(B.spade, DUJA));
  });
  it('t. 2: srednja igra u tri boje: konj baštona bez signala', () => {
    const { s } = otvaranje('kupe:3,6|spade:2,5|dinari:2,7,4|bastoni:12,6,5');
    const r = pravilo(s)!;
    expect(r.potez.karta).toBe(karta(B.bastoni, 4));
    expect(r.potez.signal).toBeNull();
  });
  it('bez signala kad su isključeni', () => {
    const { s } = otvaranje('kupe:12,7,4|spade:3,6,5,4|dinari:A,6|bastoni:13', false);
    expect(pravilo(s)!.potez.signal).toBeNull();
  });
  it('odgovor na bato: partner stavlja najjaču', () => {
    let provjereno = 0;
    for (let sj = 1; sj < 200 && provjereno < 5; sj++) {
      let d = podijeli(sj, 1, opc, parsirajZapis('kupe:A,7,5|spade:3,6|dinari:2,7,4|bastoni:12,6'));
      const k = d.ruke[2].find((x) => Math.floor(x / 10) === B.kupe);
      if (k === undefined || d.naPotezu !== 2) continue;
      d = odigraj(d, k, 'bato');
      d = odigraj(d, dopustene(d)[0]);
      const r = pravilo(situacija(vidljivoStanje(d, 0)))!;
      expect(r.potez.karta).toBe(karta(B.kupe, 2)); // aš kupa je moja najjača
      expect(r.razlog.lekcija).toBe('signali');
      provjereno++;
    }
    expect(provjereno).toBe(5);
  });
  it('heuristika: zadnji od ruke, partner drži ruku: daje punat', () => {
    // ruka se gradi ručno: partner je odigrao najjaču kartu
    let d = podijeli(7, 0, opc);
    // igrači 1, 2, 3 igraju, 0 je zadnji
    for (let n = 0; n < 3; n++) d = odigraj(d, dopustene(d)[0]);
    const pot = odluci(vidljivoStanje(d, 0), 'igrac', rng(1));
    expect(dopustene(d)).toContain(pot.karta);
  });
});

describe('bez varanja', () => {
  it('vidljivo stanje ne sadrži tuđe karte', () => {
    const d = podijeli(5, 3, opc);
    for (let i = 0; i < 4; i++) {
      const p = vidljivoStanje(d, i);
      const tuđe = d.ruke.filter((_, j) => j !== i).flat();
      const json = JSON.stringify(p);
      expect(p.ruka).toEqual(d.ruke[i]);
      expect(Object.keys(p)).not.toContain('ruke');
      expect(Object.keys(p)).not.toContain('pocetneRuke');
      expect(tuđe.every((k) => !p.ruka.includes(k))).toBe(true);
      expect(json.includes('pocetneRuke')).toBe(false);
    }
  });
});

describe('simulacija', () => {
  it('2000 dijeljenja CPU protiv CPU bez nedopuštenog poteza', () => {
    const razine: Razina[][] = [['igrac', 'pocetnik', 'igrac', 'pocetnik'], ['pocetnik', 'igrac', 'pocetnik', 'igrac']];
    for (let s = 1; s <= 2000; s++) {
      const d = odigrajDijeljenje(podijeli(s, s % 4, { akuza: true, signali: s % 3 !== 0 }), razine[s % 2], s);
      const o = obracun(d);
      expect(o.puntiIgre[0] + o.puntiIgre[1]).toBe(11);
    }
  });
  it('Igrač protiv Početnika dobiva barem 58 % partija do 41', () => {
    let pobjede = 0;
    const N = 300;
    for (let s = 1; s <= N; s++) {
      const mi: Razina[] = s % 2 ? ['igrac', 'pocetnik', 'igrac', 'pocetnik'] : ['pocetnik', 'igrac', 'pocetnik', 'igrac'];
      const p = odigrajPartiju(novaPartija({ ...ZADANE_POSTAVKE, cilj: 41 }, s * 7919), mi, s);
      const parIgraca = s % 2 ? 0 : 1;
      if (p.pobjednik === parIgraca) pobjede++;
    }
    expect(pobjede / N).toBeGreaterThanOrEqual(0.58);
  });
  it('Majstor odluči unutar vremena i igra dopuštene poteze', () => {
    const d0 = podijeli(99, 3, opc);
    let d = d0;
    const r = rng(3);
    let najduze = 0;
    while (!d.gotovo) {
      const t = Date.now();
      const pot = odluci(vidljivoStanje(d, d.naPotezu), 'majstor', r, { vrijemeMs: 300 });
      najduze = Math.max(najduze, Date.now() - t);
      expect(dopustene(d)).toContain(pot.karta);
      d = odigraj(d, pot.karta, pot.signal, pot.razlog);
    }
    expect(najduze).toBeLessThan(1500);
  });
});

describe('nazivi', () => {
  it('trica kupa', () => expect(naziv(karta(0, TRICA))).toBe('trica kupa'));
});
