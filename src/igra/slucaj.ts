// Generator nasumičnih brojeva sa sjemenom (mulberry32), da se dijeljenje može ponoviti.

export type Rng = () => number;

export function rng(sjeme: number): Rng {
  let a = sjeme >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function promijesaj<T>(niz: T[], r: Rng): T[] {
  const a = [...niz];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const novoSjeme = (): number => (Math.random() * 2 ** 31) >>> 0;
