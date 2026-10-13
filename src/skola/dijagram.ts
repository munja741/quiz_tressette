// Dijagram ruke: jednostavne karte (broj i ikona boje), po uzoru na PokerStrategy.
// Zapis: "kupe:2,A,13,5|spade:3,A,7,4|bastoni:-". Boje koje se ne navode dopunjuju se
// nasumično (deterministički, sjeme iz zapisa) do n karata i prikazuju blijedo.

import { BOJE, OZNAKE, type Boja, GENITIV_BOJE } from '../igra/karte.ts';
import { rng, promijesaj } from '../igra/slucaj.ts';

const COL: Record<Boja, string> = { kupe: '#1f4e9c', spade: '#1a1a1a', dinari: '#b77f00', bastoni: '#c8102e' };
const ICON: Record<Boja, string> = {
  kupe: '<path d="M3.5 3h13c0 5-2.3 8-5.2 8.7V15h3v2h-8.6v-2h3v-3.3C5.8 11 3.5 8 3.5 3z"/>',
  spade: '<path d="M10 1l1.5 2.6v9.6h-3V3.6z"/><rect x="5.2" y="13" width="9.6" height="2" rx="1"/><rect x="9" y="14.8" width="2" height="2.8"/><circle cx="10" cy="18.4" r="1.3"/>',
  dinari: '<circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="4.6" fill="#fff" opacity=".55"/>',
  bastoni: '<path d="M13.6 1.6c1.8.8 2.2 2.6 1.4 4.2L8.4 18.6c-.5.9-1.6 1.2-2.5.7-.9-.5-1.2-1.6-.7-2.5l6.2-12.6c-.5-1.3.2-2.4 2.2-2.6z"/>',
};
const RIME: Record<string, string> = { '3': 'trica', '2': 'duja', A: 'aš', '13': 'kralj', '12': 'konj', '11': 'fanat', '7': 'sedmica', '6': 'šestica', '5': 'petica', '4': 'četvorka' };
const CW = 40, CH = 56, GAP = 4, SGAP = 12;

interface K { r: string; dopuna: boolean }

function hash(t: string): number {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function parsiraj(zapis: string): { ruka: Record<Boja, K[]>; izostavljene: Set<Boja>; navedene: Set<Boja> } {
  const ruka = { kupe: [], spade: [], dinari: [], bastoni: [] } as Record<Boja, K[]>;
  const izostavljene = new Set<Boja>();
  const navedene = new Set<Boja>();
  for (const dio of zapis.split('|')) {
    const [b, popis] = dio.split(':').map((x) => x?.trim());
    if (!BOJE.includes(b as Boja)) continue;
    navedene.add(b as Boja);
    if (!popis || popis === '-') { izostavljene.add(b as Boja); continue; }
    for (const r of popis.split(',').map((x) => x.trim().toUpperCase())) if ((OZNAKE as readonly string[]).includes(r)) ruka[b as Boja].push({ r, dopuna: false });
  }
  return { ruka, izostavljene, navedene };
}

export function dijagramSVG(zapis: string, opcije: { igra?: string; n?: number } = {}): { svg: string; opis: string; imaDopuna: boolean } {
  const { ruka, navedene } = parsiraj(zapis);
  const n = opcije.n ?? 10;
  const ima = BOJE.reduce((s, b) => s + ruka[b].length, 0);
  const slobodne = BOJE.filter((b) => !navedene.has(b));
  const bazen = promijesaj(slobodne.flatMap((b) => OZNAKE.map((r) => [b, r] as const)), rng(hash(zapis)));
  for (const [b, r] of bazen.slice(0, Math.max(0, n - ima))) ruka[b].push({ r, dopuna: true });
  for (const b of BOJE) ruka[b].sort((x, y) => OZNAKE.indexOf(x.r as never) - OZNAKE.indexOf(y.r as never));
  const [igraB, igraR] = (opcije.igra ?? '').split(':').map((x) => x?.trim().toUpperCase());
  const dijelovi: string[] = [];
  let x = 0;
  for (const b of BOJE) {
    if (!ruka[b].length) continue;
    for (const k of ruka[b]) {
      const igra = igraB === b.toUpperCase() && igraR === k.r;
      const fs = k.r.length < 2 ? 15 : 13;
      dijelovi.push(
        `<g transform="translate(${x} 0)"${k.dopuna ? ' opacity="0.42"' : ''}>` +
          `<rect x="1" y="1" width="${CW - 2}" height="${CH - 2}" rx="5" fill="#ffffff" stroke="${igra ? '#c9a227' : '#c9ccc9'}" stroke-width="${igra ? 2.6 : 1}"/>` +
          `<text x="6" y="19" font-family="Source Sans 3, Arial, sans-serif" font-weight="700" font-size="${fs}" fill="${COL[b]}">${k.r}</text>` +
          `<g transform="translate(${CW / 2 - 11} 27) scale(1.1)" fill="${COL[b]}">${ICON[b]}</g></g>`,
      );
      x += CW + GAP;
    }
    x += SGAP - GAP;
  }
  const w = Math.max(CW, x - SGAP + 2);
  const opis = BOJE.filter((b) => ruka[b].length)
    .map((b) => `${GENITIV_BOJE[b]}: ${ruka[b].map((k) => RIME[k.r]).join(', ')}`)
    .join('; ');
  const svg = `<svg class="dijagram-svg" viewBox="-1 -1 ${w} ${CH + 2}" width="${w}" height="${CH + 2}" role="img" aria-label="Ruka. ${opis}." xmlns="http://www.w3.org/2000/svg">${dijelovi.join('')}</svg>`;
  return { svg, opis, imaDopuna: BOJE.some((b) => ruka[b].some((k) => k.dopuna)) };
}
