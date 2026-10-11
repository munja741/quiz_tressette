# 02 · Struktura sitea

## Mapa stranica

```
/                         Početna: što je škola, put učenja, nastavi gdje si stao
/put-ucenja/              Sve razine i lekcije, s napretkom
/lekcije/<slug>/          Lekcija (MDX) + kviz na dnu
/igraj/                   Igra: partija protiv računala (jedno dijeljenje, do 21, 31, 41), vidi 08-igra.md
/alati/test-otvaranja/    Interaktivni test otvaranja (10 ruku)
/alati/brojanje/          Vježba brojanja karata u boji
/alati/punti/             Kalkulator punata i bela za kraj dijeljenja
/pojmovnik/               Svi pojmovi, abecedno, s primjerom karata
/listici/                 Listići za ispis i mobitel (osnove, otvaranje, odgovori, odbacivanje)
/o-skoli/                 Izvori, prijevod, zahvale, kontakt
```

## Razine i lekcije

Redoslijed je put učenja. Svaka lekcija ima kviz. `IZVOR` je poglavlje priručnika ili druga stavka iz `01-vizija.md`.

| Razina | Slug | Lekcija | Izvor |
| --- | --- | --- | --- |
| Početnik | `pravila` | Pravila igre | Priručnik: Osnovna pravila; hrvatska praksa |
| Početnik | `punti-i-bele` | Punti, bele i ultima | Priručnik: Osnovna pravila |
| Početnik | `akuza` | Akuža | Priručnik: Akuža; hrvatska praksa |
| Početnik | `signali` | Signali: bato, rebato, strišo, volo | Priručnik: Klasični signali, Signali |
| Početnik | `bonton` | Za stolom: što se smije, što je varanje | hrvatska praksa (novo) |
| Igrač | `otvaranje-1` | Otvaranje: osnovna pravila | Priručnik: Otvaranje, t. 1 do 9 |
| Igrač | `otvaranje-2` | Otvaranje: duja+aš, trica+aš, napolitana | Priručnik: Otvaranje, t. 10 do 19 |
| Igrač | `as` | Uporaba aša | Priručnik: Uporaba aša u trešeti |
| Igrač | `odgovori` | Odgovori na otvaranje | Priručnik: Odgovori, t. 32 do 44 |
| Igrač | `odbacivanje` | Odbacivanje | Priručnik: Odbacivanje, t. 45 do 50 |
| Napredni | `duja` | Duja u modernoj igri | Priručnik: Duja |
| Napredni | `bez-signala` | Igra bez signala | Priručnik: Trešeta bez signala |
| Napredni | `striso` | Zašto ne signalizirati strišo | Priručnik: Strišo |
| Napredni | `otvaranje-3` | Napadi i protivnička igra | Priručnik: Otvaranje, t. 20 do 31 |
| Napredni | `temelji` | Igra para: temelji | Priručnik: Nekoliko temelja |
| Majstor | `hvatanje-asa` | Hvatanje trećeg aša | Priručnik: t. 35, 36, 54; Duja |
| Majstor | `zadnje-ruke` | Zadnje ruke i brojanje karata | Priručnik: t. 56 do 59 |
| Majstor | `simulacije` | Simulacije i finese | Priručnik: t. 28, 29, 51, 52 |
| Majstor | `bez-akuze` | Zašto akuža koči igru | Priručnik: zadnje poglavlje |
| Majstor | `test-vjestine` | Test vještine | Priručnik: Test vještine |

Lekcije `bonton`, `punti-i-bele` i alati proširuju priručnik.

## Predložak lekcije

1. Naslov, razina, procijenjeno vrijeme čitanja, preduvjeti (poveznice).
2. **Što ćeš naučiti**: 2 do 4 stavke.
3. Odjeljci (H2) s ID-om, npr. `#druga-duja`. Kviz upućuje na te ID-ove.
4. Primjeri: svaka konkretna ruka kao dijagram, komponenta `<Dijagram karte="kupe:2,A,13,5|spade:3,A,7,4" igra="kupe:2" />` (vidi `05-dizajn.md`).
5. Okvir **Pravilo** za tvrdnju koju treba zapamtiti, s brojem točke iz priručnika.
6. Okvir **Kod nas** gdje se hrvatska praksa razlikuje (samo potvrđene tvrdnje).
7. **Sažetak u tri rečenice.**
8. Neobavezno: gumb **Odigraj ovaj primjer** koji otvara igru sa zadanom rukom (`/igraj/#ruke=...`, vidi `08-igra.md`).
9. Kviz (komponenta `<Kviz slug="..." />`).
10. Prethodna i sljedeća lekcija.

## Navigacija

- Gornja traka: Put učenja, Igraj, Alati, Pojmovnik, Listići.
- Na mobitelu: izbornik i traka napretka razine.
- Na kraju lekcije: gumb "Sljedeća lekcija" postaje istaknut tek kad je kviz položen; čitatelj ipak može nastaviti i bez toga.

## Napredak

`localStorage` ključ `skola-tresete:v1`:

```json
{
  "lekcije": { "otvaranje-1": { "procitano": true, "kviz": { "najbolje": 7, "od": 8, "datum": "2026-10-09" } } },
  "zadnja": "otvaranje-1"
}
```

Lekcija je savladana kad je kviz riješen s barem 75 %.
