# 04 · Kvizovi

Svaka lekcija završava kvizom. Cilj kviza nije ocjena nego dijagnoza: pokazati što je savladano i vratiti čitatelja na odjeljak koji treba ponovno pročitati.

## Vrste pitanja

| Vrsta | Kako izgleda | Primjer |
| --- | --- | --- |
| `izbor` | Pitanje i 3 do 4 odgovora | "Partner bati, a ti imaš drugog aša. Što radiš?" |
| `ruka` | Ruka od 10 karata; klik na kartu + odabir signala | "Prvi si od ruke. Kako otvaraš?" |
| `stol` | Karte već na stolu + tvoja ruka; klik na kartu koju stavljaš | "Igrač prije tebe bati 6 kupa. Što stavljaš?" |
| `redoslijed` | Poredaj karte povlačenjem | "Poredaj po jačini" |
| `broj` | Unos broja | "Koliko punata ima ova hrpa?" |

Vrsta `ruka` koristi istu logiku i ocjene kao postojeći test otvaranja: savršeno, pogrešno, katastrofalno.

## Format podataka

`src/content/kvizovi/<slug-lekcije>.json`:

```json
{
  "lekcija": "odgovori",
  "prolaz": 0.75,
  "pitanja": [
    {
      "id": "odg-1",
      "vrsta": "izbor",
      "pitanje": "Igrač prije tebe bati, a ti imaš drugu duju. Što radiš?",
      "ruka": "kupe:2,5",
      "odgovori": [
        { "tekst": "Odmah uzmem dujom i promijenim boju", "tocno": true },
        { "tekst": "Bacim lišinu i čuvam duju" },
        { "tekst": "Čekam da partner stavi aša" }
      ],
      "objasnjenje": "Na protivnikov bato druga duja uvijek odmah uzima. To je dogma bez iznimke.",
      "izvor": { "lekcija": "odgovori", "odjeljak": "druga-duja", "tocka": "t. 32" }
    }
  ]
}
```

Za vrstu `ruka` umjesto `odgovori` dolazi `otvaranja` s poljima `boja`, `karte`, `signal`, `ocjena` (`savrseno`, `pogresno`, `katastrofalno`), `zasto` i neobaveznim `nastavak` (drugi korak). Vidi prototip testa otvaranja.

## Tijek kviza

1. Pitanja se prikazuju jedno po jedno, redoslijed odgovora se miješa.
2. Nakon odgovora: točno ili netočno, objašnjenje i poveznica "Pročitaj ponovno: <naslov odjeljka>".
3. Na kraju: rezultat, prolaz ili ne, i **popis odjeljaka za ponovno čitanje**, grupiran po odjeljku (ako je promašeno više pitanja iz istog odjeljka, on je na vrhu).
4. Gumbi: "Ponovi kviz", "Sljedeća lekcija" (istaknut ako je položeno).

## Pravila ocjenjivanja

- Lekcija je savladana s rezultatom od barem 75 %.
- Vrsta `ruka`: savršeno 3, pogrešno 0, katastrofalno −2; postotak se računa od najvećeg mogućeg zbroja.
- Najbolji rezultat sprema se u `localStorage` (vidi `02-struktura.md`).

## Pravila za pisanje pitanja

- Svako pitanje ima `izvor` s ID-om odjeljka koji postoji u lekciji. Build mora pasti ako ID ne postoji.
- Pitanje provjerava pravilo iz lekcije, ne trivijalnost.
- Netočni odgovori su uvjerljive pogreške početnika, ne apsurdi.
- Objašnjenje kaže zašto je točno, u jednoj do dvije rečenice, i navodi točku priručnika.
- Ocjene za `ruka` pitanja izvode se samo iz pravila koja priručnik izričito navodi. "Katastrofalno" samo kad ga priručnik tako opisuje ili ga urednica potvrdi.

## Završni test razine

Na kraju svake razine: 12 pitanja izvučenih nasumično iz kvizova te razine. Prolaz 80 % otključava oznaku razine (Početnik, Igrač, Napredni, Majstor) na stranici Put učenja.
