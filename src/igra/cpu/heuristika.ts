// Opća heuristika kad nijedno pravilo iz priručnika ne odgovara.

import { type Karta, boja, polozaj, bele, AS, TRICA, DUJA, naziv } from '../karte.ts';
import { type Situacija, type Potez, najmanja, najjeftinija, jeMaster, zabranjeneZaOtvaranje, ima } from './situacija.ts';

export interface Odluka extends Potez { tekst: string }

const potez = (karta: Karta, tekst: string): Odluka => ({ karta, signal: null, tekst });

/** Najviše bela, ali ne najjača u boji (nju čuvamo); kod jednakih bela najslabija. */
function dajPunte(s: Situacija, karte: Karta[]): Karta {
  const nemaster = karte.filter((k) => !jeMaster(s, k));
  const izbor = nemaster.length ? nemaster : karte;
  return izbor.reduce((a, b) => (bele(b) > bele(a) || (bele(b) === bele(a) && polozaj(b) > polozaj(a)) ? b : a));
}

function otvori(s: Situacija): Odluka {
  const { p, z } = s;
  // 1. Najjača karta u boji koja još ima karata vani: naplati je.
  const masteri = p.ruka.filter((k) => jeMaster(s, k) && z.nepoznate.some((x) => boja(x) === boja(k)));
  if (masteri.length) {
    const k = masteri.reduce((a, b) => (bele(b) > bele(a) ? b : a));
    return potez(k, `${cap(naziv(k))} je najjača karta u boji: uzima ruku.`);
  }
  // 2. Inače najmanja karta duge boje, izbjegavajući boje koje se ne otvaraju.
  const zab = zabranjeneZaOtvaranje(s);
  const ocjena = (b: number): number => {
    const k = s.poBoji[b];
    if (!k.length) return -99;
    let o = k.length * 2;
    if (zab.has(b)) o -= 10;
    if (ima(k, AS) && !ima(k, TRICA) && !ima(k, DUJA)) o -= 4; // nezaštićen aš
    // partner nema boju: protivnici bi je uzeli
    if (z.nemaBoju[s.partner][b]) o -= 3;
    return o;
  };
  const b = [0, 1, 2, 3].sort((x, y) => ocjena(y) - ocjena(x))[0];
  const k = najjeftinija(s.poBoji[b]);
  return potez(k, 'Otvara se najmanjom kartom duge boje.');
}

function odbaci(s: Situacija): Odluka {
  const partnerDrzi = s.drzi === s.partner;
  const sigurno = partnerDrzi && (s.pozicija === 3 || jeMaster(s, s.drziKartu as Karta));
  if (sigurno) {
    const k = dajPunte(s, s.p.ruka);
    if (bele(k) > 0) return potez(k, 'Nema boje, a partner drži ruku: daje mu se punat.');
  }
  // najmanja karta bez bela iz najduže boje
  const bezBela = s.p.ruka.filter((k) => bele(k) === 0);
  const izbor = bezBela.length ? bezBela : s.p.ruka;
  const duljina = (k: Karta) => s.poBoji[boja(k)].length;
  const k = izbor.reduce((a, c) => (duljina(c) > duljina(a) || (duljina(c) === duljina(a) && polozaj(c) > polozaj(a)) ? c : a));
  return potez(k, 'Nema boje: odbacuje se lišina iz najduže boje.');
}

function odgovori(s: Situacija): Odluka {
  const uBoji = s.dop.filter((k) => boja(k) === s.otvorenaBoja);
  if (!uBoji.length) return odbaci(s);
  const drziKartu = s.drziKartu as Karta;
  const partnerDrzi = s.drzi === s.partner;
  const jace = uBoji.filter((k) => polozaj(k) < polozaj(drziKartu));
  const najjeftinijaJaca = jace.length ? najmanja(jace) : -1;

  if (s.pozicija === 3) {
    if (partnerDrzi) return potez(dajPunte(s, uBoji), 'Partner drži ruku: daje mu se najviše punata.');
    if (najjeftinijaJaca >= 0 && (s.beleNaStolu > 0 || bele(najjeftinijaJaca) === 0)) {
      return potez(najjeftinijaJaca, 'Zadnji od ruke: uzima se ruka najmanjom kartom koja je dovoljna.');
    }
    return potez(najjeftinija(uBoji), 'Ruka se ne isplati: igra se najmanja karta.');
  }

  if (partnerDrzi && jeMaster(s, drziKartu)) {
    return potez(dajPunte(s, uBoji), 'Partnerova karta je najjača u boji: daje mu se punat.');
  }
  // protivnik drži ruku (ili partner, ali nesigurno)
  const masterJaci = jace.filter((k) => jeMaster(s, k));
  if (!partnerDrzi && masterJaci.length) {
    return potez(najmanja(masterJaci), 'Uzima se ruka najjačom kartom u boji.');
  }
  if (s.pozicija === 2 && !partnerDrzi && najjeftinijaJaca >= 0) {
    // zadnji igrač nema boju: dovoljno je biti jači od stola
    const zadnji = (s.p.ja + 1) % 4;
    if (s.z.nemaBoju[zadnji][s.otvorenaBoja]) return potez(najjeftinijaJaca, 'Igrač poslije nema boju: uzima se ruka.');
  }
  return potez(najjeftinija(uBoji), 'Igra se najmanja karta.');
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export function heuristika(s: Situacija): Odluka {
  if (s.dop.length === 1) return potez(s.dop[0], 'Jedina dopuštena karta.');
  return s.vodim ? otvori(s) : odgovori(s);
}
