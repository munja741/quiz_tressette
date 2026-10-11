# Škola trešete

Web mjesto za učenje trešete u parove na hrvatskom. Prva gotova cjelina je **igra protiv računala**: ti i CPU partner protiv dva CPU protivnika, po hrvatskim pravilima, s izgledom po uzoru na BridgeBase Online.

- Igra: `/igraj/` (kod u `src/igra/`)
- Stari test otvaranja: `/kviz-otvaranja/` (u `public/kviz-otvaranja/`)
- Specifikacija cijele škole: `docs/` (počni od `CLAUDE.md`)

## Pokretanje

```
npm install
npm run dev      # http://localhost:4321/quiz_tressette/
npm test         # testovi engina i CPU igrača
npm run build    # statični site u dist/
npm run snaga    # provjera snage CPU razina (traje nekoliko minuta)
```

## Objava

GitHub Action `.github/workflows/objava.yml` na svaki push u `main` pokreće testove, gradi site i objavljuje ga na GitHub Pages: https://munja741.github.io/quiz_tressette/

Jednom treba uključiti Pages: **Settings → Pages → Source: GitHub Actions**.

## Igra

| Dio | Datoteka |
| --- | --- |
| Špil, nazivi, bele | `src/igra/karte.ts` |
| Dijeljenje, ruke, akuža, obračun | `src/igra/dijeljenje.ts` |
| Partija do 21, 31, 41 ili jedno dijeljenje | `src/igra/partija.ts` |
| Vidljivo stanje i znanje CPU igrača | `src/igra/cpu/znanje.ts` |
| Pravila iz priručnika (jedno po datoteci) | `src/igra/cpu/pravila/` |
| Heuristika | `src/igra/cpu/heuristika.ts` |
| Pretraga za Majstora (PIMC + alfa-beta), Web Worker | `src/igra/cpu/pretraga.ts`, `worker.ts` |
| Sučelje (Preact) | `src/igra/ui/` |

Razine CPU igrača:

- **Početnik:** heuristika, 20 % nasumičnih poteza.
- **Igrač:** pravila iz priručnika, heuristika, signali, brojanje karata u zadnje tri ruke.
- **Majstor:** sve to i pretraga.

Poveznice: `#dijeljenje=<sjeme>.<djelitelj>` otvara točno to dijeljenje; `#ruke=kupe:3,2,A|spade:3,7` zadaje tvoju ruku (zapis kao u komponenti Dijagram).
