import type { Pravilo } from './tip.ts';
import { otvaranjeDugaDuja } from './otvaranje-duga-duja.ts';
import { otvaranjeDujaAs } from './otvaranje-duja-as.ts';
import { otvaranjeBato } from './otvaranje-bato.ts';
import { otvaranjeNemaBoju } from './otvaranje-nema-boju.ts';
import { otvaranjeSrednjaIgra } from './otvaranje-srednja-igra.ts';
import { nastavakDujaAs } from './nastavak-duja-as.ts';
import { odgovorBato } from './odgovor-bato.ts';
import { povratakBato } from './povratak-bato.ts';

export type { Pravilo } from './tip.ts';

export const PRAVILA: Pravilo[] = [
  odgovorBato,
  povratakBato,
  otvaranjeDugaDuja,
  otvaranjeDujaAs,
  otvaranjeBato,
  otvaranjeNemaBoju,
  otvaranjeSrednjaIgra,
  nastavakDujaAs,
].sort((a, b) => b.prioritet - a.prioritet);
