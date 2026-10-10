# 05 · Dizajn

Smjer: kartaški stol, ne kockarnica. Mirno, čitljivo, s jednim jasnim naglaskom: zelena čoha. Isti jezik kao postojeći prototipovi (test otvaranja, listići, čitač priručnika).

## Boje (tokeni)

Definirati na `:root`, s tamnom temom preko `prefers-color-scheme` i `[data-theme]`.

| Token | Svijetla | Tamna | Uloga |
| --- | --- | --- | --- |
| `--bg` | #f3f5f1 | #0f1712 | pozadina stranice |
| `--paper` | #ffffff | #162019 | kartice, tablice |
| `--ink` | #18201b | #e7ece6 | tekst |
| `--muted` | #5a665e | #9eaba2 | sporedni tekst |
| `--rule` | #d6ddd6 | #28352c | crte, obrubi |
| `--felt` | #1d5a3c | #79c597 | naglasak, čoha |
| `--brass` | #9a7417 | #d8b45a | oznake točaka, napredak |
| `--good` / `--warn` / `--bad` | zelena / jantarna / crvena | | savršeno / pogrešno / katastrofalno |

Interaktivni alati (test otvaranja) mogu koristiti tamnu čohu kao jedinstven izgled.

## Tipografija

- Naslovi: **Big Shoulders Display** 700/800, verzal, blagi razmak slova.
- Tekst: **Source Sans 3** 400/600/700, 16 do 17 px, redak do 65 znakova.
- Brojevi na kartama: **Alegreya SC** 700.
- Sve s Google Fontsa, uz rezervne fontove.

## Komponenta karte

Postoji u prototipu testa otvaranja (`cardSVG(boja, karta)`); prenijeti u `src/components/Karta.ts`.

- SVG 62 × 96, krem pozadina, tanki unutarnji okvir u boji boje.
- Broj u gornjem lijevom i (okrenut) u donjem desnom kutu: 3, 2, A, 13, 12, 11, 7…4.
- Simboli boja, vlastiti crteži u stilu talijanskih karata:
  - kupe: plavi pehar sa zlatnim pojasom
  - špade: tamna, gotovo crna zakrivljena sablja, zlatni balčak
  - dinari: zlatni novčić, crveno središte, zvijezda
  - baštoni: crvena batina sa zlatnim čvorovima
- Boja oznake i odjeće figura: kupe plava `#2c5896`, špade crna `#1f1f1f`, dinari zlatna, baštoni crvena `#c2412d`. Isti raspored boja kao u dijagramu ruke.
- Brojčane karte: onoliko simbola koliko vrijede, raspored kao na talijanskom špilu. Aš: jedan velik simbol u krugu. Figure: silueta fanta, konja s jahačem, kralja s krunom.
- Ne kopirati dizajn postojećih komercijalnih špilova.

Komponente oko karte:

- `<Ruka karte="kupe:2,A|spade:3" />`: karte grupirane po boji, s nazivom boje.
- `<Stol>`: četiri mjesta (ti, igrač poslije tebe, partner, igrač prije tebe) i karte odigrane u ruci. Bez "lijevo/desno".
- `<Signal tip="bato" />`: oznaka signala kao pilula.

## Ostale komponente

- **Pravilo**: okvir s naslovom pravila, jednom rečenicom i oznakom točke (`t. 32`).
- **Kod nas**: okvir drugačije boje za hrvatsku praksu; prikazuje se samo uz potvrđen sadržaj.
- **Traka napretka razine** i **kvačica** uz savladanu lekciju.
- **Kartica lekcije** na Putu učenja: naslov, razina, vrijeme čitanja, stanje (nepročitano, pročitano, savladano).

## Raspored

- Mobitel prvo. Bočni razmak najmanje 16 px. Ruka od 10 karata stane u dva reda na 375 px.
- Lekcija: jedan stupac teksta; primjeri karata i okviri u istom stupcu.
- Put učenja: razine kao vodoravni pojasevi, lekcije kao kartice u mreži.

## Dijagram ruke

Svaka lekcija koja govori o konkretnoj ruci prikazuje sliku te ruke. Uzor su dijagrami ruku na PokerStrategy.com: male, jednostavne karte s brojkom i ikonom boje, bez ilustracija. Ova komponenta je različita od velike karte za igru (test otvaranja); u tekstu lekcija koristi se samo dijagram.

**Karta u dijagramu**

- Bijeli zaobljeni pravokutnik 40 × 56, tanki sivi obrub.
- Gore lijevo broj, podebljano, u boji boje: 3, 2, A, 13, 12, 11, 7, 6, 5, 4.
- Ispod jednostavna ravna ikona boje (pehar, mač, novčić, batina), u istoj boji.
- Četiri boje, uvijek iste: kupe plava `#1f4e9c`, špade crna `#1a1a1a`, dinari zlatna `#b77f00`, baštoni crvena `#c8102e`.
- Karte grupirane po boji (kupe, špade, dinari, baštoni), unutar boje po jačini; veći razmak između boja.

**Pravila prikaza**

- **Broj karata:** 10 kod otvaranja i odgovora u prvoj ruci; manje kad je situacija kasnije u dijeljenju (npr. 8 nakon dvije ruke, 2 u pretposljednjoj ruci).
- **Bitne karte** su one koje tekst opisuje. Prikazuju se punom bojom.
- **Nasumične dopune:** kad tekst opisuje samo jednu boju ("treća trica+aš"), ostatak do 10 karata nasumično se popunjava iz boja koje tekst ne spominje. Te karte prikazuju se blijedo (prozirnost oko 40 %). Nasumičnost je deterministička (sjeme po primjeru), da se slika ne mijenja pri svakom učitavanju.
- **Karta kojom se igra:** zlatni obrub `#c9a227`, deblji.
- **Potpis** ispod slike: što ruka pokazuje i broj točke, plus "Zlatni obrub: karta kojom se igra" i "Blijede karte su nasumične" kad je to slučaj.
- **Pristupačnost:** cijela slika ima `aria-label` s popisom karata riječima ("kupe: duja, aš, kralj, …").

**Zapis u MDX-u**

```mdx
<Dijagram karte="kupe:2,A,13,5|spade:3,A,7,4|dinari:6,5|bastoni:-" igra="kupe:2" n={10}
  potpis="Točka 16: nema baštona; otvara se dujom kupa." />
```

- `bastoni:-` znači da boje namjerno nema (ne dopunjava se).
- Boje koje se ne navode dopunjuju se nasumično do `n` karata.
- `igra` je karta sa zlatnim obrubom (neobavezno).

Referentna izvedba u Pythonu, koja je napravila dijagrame u prijevodu priručnika, nalazi se u `prototipovi/dijagram-ruke.py`, a primjer izgleda u `prototipovi/dijagram-ruke.html`.
