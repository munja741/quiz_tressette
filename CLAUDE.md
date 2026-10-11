# CLAUDE.md · Škola trešete

Upute za Claude Code. Pročitaj ih prije svakog zadatka u ovom repozitoriju.

## Što gradimo

Web mjesto za učenje trešete u parove na hrvatskom jeziku: lekcije po razinama, kviz na kraju svake lekcije i interaktivne vježbe s kartama, te igra po uzoru na BridgeBase Online u kojoj igrač s CPU partnerom igra protiv dva CPU protivnika. Uzor je struktura škola poput PokerStrategy.com: put učenja od početnika do majstora, kratke lekcije, provjera znanja i praćenje napretka.

Pročitaj redom:

1. `docs/01-vizija.md`: cilj, publika, opseg, pravna napomena
2. `docs/02-struktura.md`: mapa stranica, URL-ovi, predlošci
3. `docs/03-sadrzaj.md`: sadržaj svake lekcije i kviza
4. `docs/04-kvizovi.md`: format pitanja, bodovanje, povratak na gradivo
5. `docs/05-dizajn.md`: vizualni sustav i komponenta karte
6. `docs/06-pojmovnik.md`: obvezno nazivlje
7. `docs/07-plan-rada.md`: faze i kriteriji prihvaćanja
8. `docs/08-igra.md`: igra protiv računala (`/igraj/`, bez animacija, izgled po BBO-u), pravila, CPU igrači, Faza 6

## Tehnologija

- **Astro** (statični site), sadržaj u **MDX** content collections: `src/content/lekcije/*.mdx`.
- Interaktivni dijelovi (kviz, karte, vježbe) kao male komponente u čistom TypeScriptu ili Preactu. Bez teških frameworka.
- Kvizovi kao podaci: `src/content/kvizovi/<slug>.json`, validirani shemom (Zod u Astro content config).
- Napredak korisnika samo u `localStorage`, s `try/catch` oko svakog čitanja i pisanja. Bez prijave i baze u prvoj verziji.
- Igra (`src/igra/`): engine u čistom TypeScriptu bez DOM-a, pretraga CPU igrača u Web Workeru, testovi u Vitestu (`npm test`).
- Objava: GitHub Pages ili Netlify, iz `main` grane, GitHub Action za build.
- Pristupačnost: semantički HTML, vidljiv fokus, karte imaju `aria-label` ("trica kupa").

## Pravila pisanja sadržaja

- Jezik je hrvatski. Kratke, jasne rečenice. Bez crtica (em dash) u tekstu.
- Nazivlje strogo prema `docs/06-pojmovnik.md`. Nikad "letjeti", "tučem", "kucati", "štih" bez "ruka".
- Dopušteni signali su samo bato i strišo. Talijanski rebato kod nas se daje batom.
- Ne piši "lijevo" i "desno" za igrače. Uvijek "igrač prije tebe" i "igrač poslije tebe", jer smjer igre nije svugdje isti.
- Figure se na kartama označavaju brojevima: kralj 13, konj 12, fanat 11.
- **Svaka konkretna ruka u tekstu dobiva dijagram** (`<Dijagram />`, vidi `docs/05-dizajn.md`, odjeljak Dijagram ruke). Tekst bez slike kad se opisuje ruka nije gotov.
- **Ne izmišljaj pravila ni običaje.** Svaka tvrdnja o hrvatskoj praksi koja nije u izvorima iz `docs/01-vizija.md` dobiva oznaku `<!-- TREBA POTVRDITI -->` i ide na popis u `docs/otvorena-pitanja.md`.
- Strategija iz priručnika "Biblija trešete u parove" označava se kao autorov pristup ("talijanska škola"), s brojem točke u priručniku.
- Ne prepisuj priručnik doslovno u lekcije dok nije riješeno pravo na objavu (vidi `docs/01-vizija.md`). Lekcije pišu pravila svojim riječima i upućuju na točku izvora.

## Kako raditi

- Prije svake faze napravi kratki plan i pokaži ga.
- Svaku lekciju i kviz radi kao zaseban commit.
- `npm run build` mora proći bez grešaka i upozorenja prije svakog commita.
- Kvizovi: svako pitanje mora imati `izvor` (lekcija i odjeljak) i `objasnjenje`. Pitanje bez izvora ne ide u kviz.
- CPU igrači nikad ne vide tuđe karte; pravila CPU igrača pišu se samo iz lekcija i priručnika, s brojem točke i testom.
- Kad nešto nije jasno iz dokumenata, pitaj. Ne pogađaj sadržaj igre.
