# 07 · Plan rada

Šest faza. Svaka završava objavom koju urednica pregledava prije sljedeće.

## Faza 1 · Kostur

- Astro projekt, content collections za lekcije i kvizove, Zod sheme.
- Dizajnerski tokeni, tipografija, svijetla i tamna tema.
- Komponente: `Karta`, `Ruka`, `Signal`, okviri `Pravilo` i `Kod nas`.
- Stranice: početna, Put učenja (s praznim lekcijama), pojmovnik iz `06-pojmovnik.md`.
- GitHub Action za build i objavu.

**Gotovo kad:** site se gradi bez grešaka, sve karte iz špila prikazuju se ispravno na stranici `/razvoj/karte` (svih 40), pojmovnik je vidljiv, ocjena pristupačnosti (Lighthouse) 95 ili više.

## Faza 2 · Kviz

- Komponenta `Kviz` za vrste `izbor`, `ruka`, `broj`.
- Logika povratka na odjeljke, spremanje napretka.
- Provjera u buildu: svaki `izvor.odjeljak` postoji u lekciji.
- Test otvaranja prenesen iz prototipa kao alat `/alati/test-otvaranja/`.

**Gotovo kad:** probni kviz s 5 pitanja prolazi cijeli tijek na mobitelu i računalu; netočan odgovor vodi na pravi odjeljak.

## Faza 3 · Razina Početnik

- Lekcije `pravila`, `punti-i-bele`, `akuza`, `signali`, `bonton` s kvizovima.
- Alat kalkulator punata.

**Gotovo kad:** urednica potvrdi sve oznake **[POTVRDITI]** u tim lekcijama ili ih ukloni.

## Faza 4 · Razina Igrač

- Lekcije `otvaranje-1`, `otvaranje-2`, `as`, `odgovori`, `odbacivanje`.
- Vrsta pitanja `stol`.
- Listići kao stranice (`/listici/`).

## Faza 5 · Napredni i Majstor

- Preostale lekcije, vrsta pitanja `redoslijed`, alat vježba brojanja.
- Završni testovi razina.

## Faza 6 · Igra

- Partija protiv računala na `/igraj/`, bez animacija, izgled po uzoru na BBO, u pet podfaza (6a do 6e).
- Puni opis, podfaze i kriteriji prihvaćanja: `08-igra.md`.
- Može početi nakon Faze 2 i ići usporedno s fazama 3 do 5.

## Otvorena pitanja

Voditi u `docs/otvorena-pitanja.md`. Početni popis:

1. Dopuštenje autora priručnika za objavu prijevoda i prilagodbe.
2. Konačni naziv i domena.
3. Hrvatska praksa: tko prvi dijeli u partiji uživo, kako se daje signal (gestom ili riječju), zvanje dosta i kazne. Riješeno je dio pitanja, vidi `01-vizija.md`, Potvrđena hrvatska praksa.
4. Varijante: u dvoje, u troje, "ko manje".
5. Treba li site i engleski jezik.
6. Igra: sve odluke urednice su u `08-igra.md`; otvorenih pitanja nema.
