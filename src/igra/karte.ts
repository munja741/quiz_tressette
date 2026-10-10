// Špil od 40 karata. Karta je broj 0..39: boja = floor(k / 10), polozaj = k % 10.
// Polozaj 0 je najjača karta (trica), 9 najslabija (četvorka).

export const BOJE = ['kupe', 'spade', 'dinari', 'bastoni'] as const;
export type Boja = (typeof BOJE)[number];
export type Karta = number;

export const OZNAKE = ['3', '2', 'A', '13', '12', '11', '7', '6', '5', '4'] as const;
export type Oznaka = (typeof OZNAKE)[number];

const NAZIV_KARTE = ['trica', 'duja', 'aš', 'kralj', 'konj', 'fanat', 'sedmica', 'šestica', 'petica', 'četvorka'];
const NAZIV_KARTE_AKU = ['tricu', 'duju', 'aša', 'kralja', 'konja', 'fanta', 'sedmicu', 'šesticu', 'peticu', 'četvorku'];
export const NAZIV_BOJE: Record<Boja, string> = { kupe: 'Kupe', spade: 'Špade', dinari: 'Dinari', bastoni: 'Baštoni' };
export const GENITIV_BOJE: Record<Boja, string> = { kupe: 'kupa', spade: 'špada', dinari: 'dinara', bastoni: 'baštona' };

export const TRICA = 0, DUJA = 1, AS = 2, KRALJ = 3;

export const boja = (k: Karta): number => Math.floor(k / 10);
export const polozaj = (k: Karta): number => k % 10;
export const imeBoje = (k: Karta): Boja => BOJE[boja(k)];
export const oznaka = (k: Karta): Oznaka => OZNAKE[polozaj(k)];
export const karta = (b: number, p: number): Karta => b * 10 + p;

/** Vrijednost karte u belama (trećinama punta). */
export function bele(k: Karta): number {
  const p = polozaj(k);
  if (p === AS) return 3;
  if (p <= 5) return 1; // trica, duja, 13, 12, 11
  return 0;
}

/** Je li karta velika (trica, duja ili aš). */
export const velika = (k: Karta): boolean => polozaj(k) <= AS;

export function naziv(k: Karta): string {
  return `${NAZIV_KARTE[polozaj(k)]} ${GENITIV_BOJE[imeBoje(k)]}`;
}
export function nazivAkuzativ(k: Karta): string {
  return `${NAZIV_KARTE_AKU[polozaj(k)]} ${GENITIV_BOJE[imeBoje(k)]}`;
}
export const nazivPolozaja = (p: number): string => NAZIV_KARTE[p];

export const SPIL: Karta[] = Array.from({ length: 40 }, (_, i) => i);

/** Sortira kartu po boji (kupe, špade, dinari, baštoni) pa po jačini. */
export const sortiraj = (karte: Karta[]): Karta[] => [...karte].sort((a, b) => a - b);

/** Karte jedne boje iz ruke, od najjače. */
export const uBoji = (ruka: Karta[], b: number): Karta[] => sortiraj(ruka.filter((k) => boja(k) === b));

/** Zapis "kupe:2,A,13,5|spade:3,A,7,4" u popis karata (format komponente Dijagram). */
export function parsirajZapis(zapis: string): Karta[] {
  const out: Karta[] = [];
  for (const dio of zapis.split('|')) {
    const [ime, popis] = dio.split(':');
    const b = BOJE.indexOf(ime?.trim() as Boja);
    if (b < 0 || !popis || popis.trim() === '-') continue;
    for (const o of popis.split(',')) {
      const p = OZNAKE.indexOf(o.trim().toUpperCase() as Oznaka);
      if (p >= 0) out.push(karta(b, p));
    }
  }
  return [...new Set(out)];
}
