// Provjera snage CPU razina: npm run snaga
import { novaPartija, ZADANE_POSTAVKE, type Razina } from '../src/igra/partija.ts';
import { odigrajPartiju } from '../src/igra/cpu/igraj-dijeljenje.ts';

function mec(a: Razina, b: Razina, n: number, vrijemeMs = 60): number {
  let pob = 0;
  for (let s = 1; s <= n; s++) {
    const prvi = s % 2 === 1;
    const razine: Razina[] = prvi ? [a, b, a, b] : [b, a, b, a];
    const p = odigrajPartiju(novaPartija({ ...ZADANE_POSTAVKE, cilj: 41 }, s * 104729), razine, s, { vrijemeMs, uzoraka: 40 });
    if (p.pobjednik === (prvi ? 0 : 1)) pob++;
  }
  return pob / n;
}
const n = Number(process.argv[2] ?? 40);
console.log('igrac protiv pocetnik', mec('igrac', 'pocetnik', n * 5).toFixed(2));
console.log('majstor protiv pocetnik', mec('majstor', 'pocetnik', n).toFixed(2));
console.log('majstor protiv igrac', mec('majstor', 'igrac', n).toFixed(2));
