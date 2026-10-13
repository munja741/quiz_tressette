// Napredak u lekcijama: localStorage ključ skola-tresete:v1 (docs/02-struktura.md). Svako čitanje i pisanje u try/catch.
const KLJUC = 'skola-tresete:v1';
export interface Rezultat { najbolje: number; od: number; datum: string }
export interface Napredak { lekcije: Record<string, { procitano?: boolean; kviz?: Rezultat }>; zadnja?: string }

export function ucitajNapredak(): Napredak {
  try {
    const t = localStorage.getItem(KLJUC);
    if (t) return { lekcije: {}, ...JSON.parse(t) };
  } catch { /* bez spremanja */ }
  return { lekcije: {} };
}

function spremi(n: Napredak) {
  try { localStorage.setItem(KLJUC, JSON.stringify(n)); } catch { /* bez spremanja */ }
}

export function oznaciProcitano(slug: string) {
  const n = ucitajNapredak();
  n.lekcije[slug] = { ...n.lekcije[slug], procitano: true };
  n.zadnja = slug;
  spremi(n);
}

export function spremiKviz(slug: string, bodovi: number, od: number) {
  const n = ucitajNapredak();
  const staro = n.lekcije[slug]?.kviz;
  if (!staro || bodovi / od > staro.najbolje / staro.od) {
    n.lekcije[slug] = { ...n.lekcije[slug], kviz: { najbolje: bodovi, od, datum: new Date().toISOString().slice(0, 10) } };
  }
  n.zadnja = slug;
  spremi(n);
}

export const savladano = (r?: Rezultat, prolaz = 0.75) => !!r && r.najbolje / r.od >= prolaz;
