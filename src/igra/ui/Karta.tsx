import { type Karta as K, imeBoje, oznaka, naziv } from '../karte.ts';
import { cardSVG, kompaktnaSVG, poledinaSVG } from './karta-svg.ts';

const STARA_OZNAKA: Record<string, string> = { '13': 'K', '12': 'C', '11': 'F' };

export function svgKarte(k: K, kompaktna: boolean): string {
  const s = imeBoje(k);
  const o = oznaka(k);
  return kompaktna ? kompaktnaSVG(s, STARA_OZNAKA[o] ?? o) : cardSVG(s, STARA_OZNAKA[o] ?? o);
}

interface Props {
  k: K;
  kompaktna?: boolean;
  klasa?: string;
}

/** Karta kao slika (bez interakcije). */
export function SlikaKarte({ k, kompaktna = false, klasa = '' }: Props) {
  return <span class={`karta ${kompaktna ? 'kompaktna' : ''} ${klasa}`} role="img" aria-label={naziv(k)} dangerouslySetInnerHTML={{ __html: svgKarte(k, kompaktna) }} />;
}

export function Poledina({ klasa = '' }: { klasa?: string }) {
  return <span class={`karta poledina ${klasa}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: poledinaSVG() }} />;
}
