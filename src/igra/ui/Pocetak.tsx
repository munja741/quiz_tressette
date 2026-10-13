import type { Postavke, Cilj } from '../partija.ts';

const NACINI: { cilj: Cilj; naslov: string; opis: string }[] = [
  { cilj: 0, naslov: 'Jedno dijeljenje', opis: 'Deset ruku, obračun i pregled poteza.' },
  { cilj: 21, naslov: 'Do 21', opis: 'Kratka partija.' },
  { cilj: 31, naslov: 'Do 31', opis: 'Kao u priručniku.' },
  { cilj: 41, naslov: 'Do 41', opis: 'Kako se igra kod nas.' },
];


interface Props {
  postavke: Postavke;
  promijeni: (p: Partial<Postavke>) => void;
  igraj: () => void;
  nastavi?: () => void;
  izPoveznice?: string;
}

export function Pocetak({ postavke, promijeni, igraj, nastavi, izPoveznice }: Props) {
  return (
    <section class="pocetak" aria-labelledby="naslov-pocetak">
      <h1 id="naslov-pocetak">Igraj trešetu</h1>
      <p class="uvod">Ti i partner protiv dva protivnika. Partnera i protivnike igra računalo na razini Majstor, prema pravilima iz priručnika i hrvatskoj praksi.</p>
      {izPoveznice && <p class="napomena">{izPoveznice}</p>}

      <fieldset class="nacini">
        <legend>Koliko igramo</legend>
        {NACINI.map((n) => (
          <label class={`nacin ${postavke.cilj === n.cilj ? 'odabran' : ''}`} key={n.cilj}>
            <input type="radio" name="cilj" checked={postavke.cilj === n.cilj} onChange={() => promijeni({ cilj: n.cilj })} />
            <span class="nacin-naslov">{n.naslov}</span>
            <span class="nacin-opis">{n.opis}</span>
          </label>
        ))}
      </fieldset>

      <div class="red-postavki">
        <label class="prekidac">
          <input type="checkbox" checked={postavke.akuza} onChange={(e) => promijeni({ akuza: (e.target as HTMLInputElement).checked })} />
          <span>Igra s akužom</span>
        </label>
        <label class="prekidac">
          <input type="checkbox" checked={postavke.signali} onChange={(e) => promijeni({ signali: (e.target as HTMLInputElement).checked })} />
          <span>Signali bato i strišo</span>
        </label>
      </div>

      <div class="akcije">
        <button type="button" class="gumb glavni" onClick={igraj}>Igraj</button>
        {nastavi && <button type="button" class="gumb" onClick={nastavi}>Nastavi partiju</button>}
      </div>
    </section>
  );
}
