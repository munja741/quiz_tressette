# 08 · Igra: partija trešete protiv računala

## Ukratko

Igra u pregledniku, bez animacija. Igrač sjedi za stolom s partnerom i dva protivnika; sva tri igra računalo (CPU). Igrač vidi samo svoje karte. CPU igrači igraju najbolje što znaju, prema pravilima iz priručnika i lekcija ovog sitea. Izgled i tijek slijede web aplikaciju **BridgeBase Online** (BBO) za igranje bridža: pogled odozgo na stol, natpisna pločica uz svako mjesto, istaknut igrač na potezu, karte koje se pojavljuju na stolu bez animacije, brojač uzetih ruku, povijest i pregled dijeljenja nakon igre.

Igra je alat za vježbu, ne kockarnica: nema uloga, novca ni rang lista.

- **Ruta:** `/igraj/`, poveznica "Igraj" u gornjoj traci (vidi `02-struktura.md`).
- **Kod:** `src/igra/` (vidi odjeljak Tehnička arhitektura).
- **Prije rada pročitaj:** `03-sadrzaj.md` (pravila, punti, akuža, signali), `05-dizajn.md` (karte, boje), `06-pojmovnik.md` (nazivlje).

## Načini igre

| Način | Opis |
| --- | --- |
| **Jedno dijeljenje** | 10 karata, jedna partija od 10 ruku, na kraju obračun punata i analiza. Za brzu vježbu. |
| **Partija do 21** | Dijeljenja se nižu dok jedan par ne dosegne 21 punat. |
| **Partija do 31** | Isto, do 31. Tako igra priručnik. |
| **Partija do 41** | Isto, do 41. Zadana postavka, jer se kod nas igra na 41 (en.wikipedia, vidi `01-vizija.md`). |

Početni zaslon: izbor načina, prekidač **Igra s akužom** (uključeno ili isključeno, bira se pri pokretanju svake partije), gumb **Igraj** i poveznica **Postavke**. Zadnji izbor akuže se pamti. Nedovršena partija nudi se kao **Nastavi partiju**.

## Postavke

| Postavka | Mogućnosti | Zadano |
| --- | --- | --- |
| Cilj | jedno dijeljenje, 21, 31, 41 | 41 |
| Signali | bato i strišo, bez signala | bato i strišo |
| Razina CPU igrača | Početnik, Igrač, Majstor | Igrač |
| Stanka između poteza | kratka (0,3 s), normalna (0,7 s), duga (1,2 s) | normalna |
| Učitelj | isključen, savjet na zahtjev, upozori na grešku | savjet na zahtjev |
| Brojač punata | vidljiv, skriven ("broji sam") | vidljiv |
| Potvrda poteza | jedan dodir, dva dodira | dva dodira na mobitelu, jedan na računalu |

Razina CPU igrača može se zadati posebno za partnera i za protivnike (napredna postavka), da igrač može igrati s majstorom protiv početnika ili obratno.

Igra se po hrvatskoj praksi koju je potvrdila urednica (vidi `01-vizija.md`, Potvrđena hrvatska praksa). Smjer igre nije postavka: igra uvijek ide u smjeru kazaljke na satu. Dopušteni su samo signali bato i strišo. Ono što talijanska škola zove rebato kod nas se daje istim signalom, batom. "Volo" i ostali talijanski signali se ne izvode.

## Pravila koja igra provodi

Pravila se pišu prema lekcijama `pravila`, `punti-i-bele` i `akuza` te prema potvrđenoj hrvatskoj praksi. Igra ne smije izmišljati pravila. Sva pravila iz ovog odjeljka potvrdila je urednica.

**Špil i dijeljenje**

- 40 karata, četiri boje (kupe, špade, dinari, baštoni), u svakoj 3, 2, A, 13, 12, 11, 7, 6, 5, 4.
- Četiri igrača, partneri nasuprot. U svakom dijeljenju svih 40 karata podijeli se četvorici igrača, svakome 10.
- Igra ide u smjeru kazaljke na satu.
- **Prvo dijeljenje uvijek otvara igrač (ti).** Djelitelj prvog dijeljenja je zato igrač prije tebe.
- Djelitelj se mijenja nakon svakog dijeljenja, u smjeru igre. Otvara igrač koji je na redu poslije djelitelja.
- Špil se ne siječe.
- Dijeli se u dva kruga po pet karata, počevši od igrača poslije djelitelja. Engine dijeli tim redom (važno za ponovljivost sa sjemenom), ali sučelje dijeljenje ne prikazuje: karte se odmah pojave u rukama.

**Ruka (štih)**

- Na otvorenu boju mora se odgovoriti istom bojom. Tko nema boju, odbacuje bilo koju kartu.
- Ruku uzima najjača karta otvorene boje, prema redu jačine: 3, 2, A, 13, 12, 11, 7, 6, 5, 4. Aduta nema.
- Tko uzme ruku, otvara sljedeću.
- Nedopuštene karte u ruci igrača prikazuju se zatamnjeno i ne mogu se odigrati.

**Punti**

- Sve se računa u **belama (trećinama punta)**, cijelim brojevima. Nikad decimalni brojevi.
  - aš: 3 bele (1 punat)
  - trica, duja, 13, 12, 11: 1 bela
  - ultima (zadnja ruka): 3 bele (1 punat)
  - ukupno u dijeljenju: 35 bela
- Na kraju dijeljenja par dobiva `floor(bele / 3)` punata. Ostatak bela se gubi. Zbroj punata oba para je 11.
- **Kapot:** par koji nije uzeo nijedan punat. Kapot ne nosi dodatne punte i ne briše punte akuže: par koji je akužao zadržava ih i kad je kapot.

**Akuža** (kad je uključena)

- Kombinacije: 3 trice, 3 duje ili 3 aša = 3 punta; 4 iste velike = 4 punta; napolitana (trica, duja i aš iste boje) = 3 punta. Kombinacije se zbrajaju.
- Akuža se prijavljuje prije prve karte (hr.wikipedia). U igri: kad igrač prvi put dođe na red, ploča mu pokaže pronađene kombinacije i gumb **Akužaj** ili **Bez akuže**. Postavka "automatska akuža" to radi sama.
- Igra sama provjerava kombinacije, pa lažne prijave nema i kazna nije potrebna.
- Punti akuže pribrajaju se paru na kraju dijeljenja, i kad je par kapot.
- Napolitana uvijek vrijedi 3 punta, koliko god karata iste boje uz nju igrač imao.
- Hoće li se igrati s akužom, bira se pri pokretanju partije (vidi Načini igre).

**Kraj partije**

- Nakon svakog dijeljenja zbrajaju se punti. Partija završava kad jedan par dosegne cilj (21, 31 ili 41).
- Ako oba para prijeđu cilj u istom dijeljenju, pobjeđuje par s više punata. Ako su izjednačeni, igra se dodatno dijeljenje.
- Zvanje dosta se u igri ne izvodi. Partija se uvijek broji do kraja dijeljenja.

**Signali**

- Signal smije dati samo igrač koji otvara ruku, samo za otvorenu boju i samo uz kartu kojom otvara (lekcija `signali`).
- Igrač bira signal prije nego odigra kartu: ispod ruke pojavljuju se pilule dopuštenih signala, kao u testu otvaranja. Bez odabira se igra bez signala.
- Postoje samo dva signala:
  - **Bato:** "igraj najjaču i vrati mi manjom". Partner stavlja svoju najjaču kartu te boje i, kad uzme ruku, vraća se u tu boju manjom kartom. Bato se daje i s tricom i s dujom kad se traži trica: ono što talijanska škola razlikuje kao bato i rebato, kod nas je jedan signal.
  - **Strišo:** isto značenje kao "liscio" u talijanskom priručniku (lekcija `signali`).
- Signal se prikazuje kao oznaka na natpisnoj pločici igrača ("bato") i ostaje vidljiva dok traje ruka. Zapisuje se u povijest ruku.
- Drugih signala nema. Engine odbija svaki drugi signal.

## Prikaz stola (po uzoru na BBO)

Raspored i ponašanje slijede BBO-ov stol za bridž, prilagođeno trešeti. Grafika je vlastita: bez BBO-ova logotipa, boja i ikona.

```
┌───────────────┬────────────────────────────────────┬──────────────┐
│ Dijeljenje 4  │          ┌──────────────┐          │ [Povijest]   │
│ Djelitelj:    │          │ Partner   10 │          │ [Rezultat]   │
│  igrač prije  │          └──────────────┘          │ [Postavke]   │
│  tebe         │           ▢▢▢▢▢▢▢▢▢▢ (poleđine)    │              │
│ Cilj: 41      │                                    │ Ruka 3       │
│ Akuža: da     │ ┌───────────┐  ┌──────┐ ┌───────────┐│ 1. Ti 2♦ ... │
│ MI 18 ONI 23  │ │Igrač      │  │  ▢   │ │Igrač      ││ 2. ...       │
│               │ │poslije  9 │  │▢   ▢ │ │prije    9 ││              │
│ Ruke:         │ │ bato      │  │  ▢   │ │           ││              │
│ mi 2 · oni 1  │ └───────────┘  └──────┘ └───────────┘│              │
│ Punti:        │                                    │              │
│ mi 2 · oni 1  │          ┌──────────────┐          │              │
│               │          │ Ti        10 │ ← na potezu              │
│               │          └──────────────┘          │              │
│               │  [kupe 3 2 13 6][špade A 7][dinari …][baštoni …]   │
│ [Zadnja ruka] │       signal: (bez) (bato) (strišo)   [Savjet]    │
└───────────────┴────────────────────────────────────┴──────────────┘
```

**Stol**

- **Mjesta:** ti dolje, partner gore, protivnici sa strane, raspoređeni kao na skici. Igra ide u smjeru kazaljke na satu: od tebe prema igraču poslije tebe, pa partneru, pa igraču prije tebe. Ploča uvijek piše "igrač prije tebe" i "igrač poslije tebe", nikad "lijevo" ili "desno".
- **Natpisna pločica** uz svako mjesto (kao u BBO-u): ime (Ti, Partner, Protivnik 1, Protivnik 2), broj preostalih karata, oznaka djelitelja i signal dan u ovoj ruci.
- **Na potezu:** pločica igrača na potezu ima zlatnu pozadinu. Bez pulsiranja i drugih pokreta.
- **Tvoja ruka** dolje, otvorena, poredana po bojama (kupe, špade, dinari, baštoni) i unutar boje po jačini, s malim razmakom između boja. Kao u BBO-u, karte su u jednom redu s preklapanjem; vidljiv je broj i znak boje svake karte.
- **Partnerove i protivničke karte** prikazuju se poleđinom ili samo kao broj na pločici. Poleđina je vlastiti crtež: zelena čoha i mjedena mreža.
- **Sredina stola:** odigrana karta odmah se pojavi ispred mjesta igrača koji ju je odigrao. Nema klizanja ni okretanja.
- **Kraj ruke:** kad su na stolu sve četiri karte, ostaju vidljive koliko traje postavka Stanka između poteza, a zatim nestanu. Brojač uzetih ruku odmah se poveća. Klik ili dodir na stol skraćuje stanku.
- **Karte:** velika ilustrirana karta iz `05-dizajn.md` (komponenta `Karta`), u bojama kupe plava, špade crna, dinari zlatna, baštoni crvena. Uz postavku "kompaktne karte" koristi se karta iz dijagrama ruke (broj i ikona), kao jednostavne karte u BBO-u.

**Ploča sa stanjem** (gornji kut, kao BBO-ov okvir s brojem dijeljenja)

- broj dijeljenja, djelitelj, cilj, akuža da ili ne;
- rezultat partije: mi i oni;
- uzete ruke u ovom dijeljenju: mi i oni;
- punti i bele u ovom dijeljenju (skriveno u načinu "broji sam");
- gumb **Zadnja ruka**: prikazuje prethodnu ruku na stolu dok se ne klikne ponovno.

**Bočna ploča s karticama** (kao BBO-ova desna ploča)

- **Povijest:** sve ruke ovog dijeljenja, redom: tko je otvorio, četiri karte, signal, tko je uzeo.
- **Rezultat:** punti po dijeljenjima za cijelu partiju.
- **Postavke:** postavke iz tablice gore. Promjena vrijedi od sljedećeg poteza.

**Tijek bez animacija**

- Dijeljenje se ne prikazuje. Na početku dijeljenja ruke su odmah pune.
- Potez CPU igrača pojavi se nakon postavljene stanke. Stanka postoji samo zato da igrač stigne vidjeti tko je što odigrao.
- Ploča obračuna na kraju dijeljenja pojavi se odmah, bez klizanja.
- Zvuk je isključen dok ga igrač ne uključi. Samo tihi zvuk karte na stolu.

**Mobitel (prvo)**

- Uspravno, 375 px širine. Ploča sa stanjem sažeta je u traku na vrhu; bočna ploča otvara se kao ploča odozdo.
- Tvojih 10 karata u jednom redu s preklapanjem, kao u BBO-u na mobitelu. Dodir podiže kartu, drugi dodir je igra (postavka Potvrda poteza).
- Protivnici i partner prikazani su samo pločicom: ime, broj karata i signal.

**Računalo**

- Prelazak mišem podiže kartu, klik je igra.
- Tipkovnica: strelice biraju kartu, Enter igra, brojke 1 do 3 biraju signal (bez, bato, strišo), Z pokazuje zadnju ruku.

## Kraj dijeljenja i analiza

**Ploča obračuna**

| | Mi | Oni |
| --- | --- | --- |
| Asovi | 2 punta | 2 punta |
| Bele | 11 bela | 9 bela |
| Ultima | 1 punat | |
| Akuža | 3 | |
| **Ukupno** | **10** | **5** |

Ispod: stanje partije, gumbi **Sljedeće dijeljenje**, **Pregled dijeljenja** i **Ponovi ovo dijeljenje**.

**Pregled dijeljenja** (kao BBO-ov pregled nakon dijeljenja)

- Sve četiri ruke otvorene od početka. Gumbi na početak, natrag, naprijed i na kraj vode potez po potez, kao u BBO-u.
- Uz svaki potez CPU igrača piše razlog (vidi Objašnjenja).
- **Analiza tvojih poteza:** popis poteza gdje si odigrao drugačije nego što bi CPU razine Majstor, s procjenom razlike u belama i poveznicom na lekciju i točku priručnika. Primjer: "Ruka 1: otvorio si aš kupa. Prema t. 11, s dujom+ašem otvara se dujom. Lekcija `otvaranje-2` → `#duja-as`."
- Analiza ne ocjenjuje poteze gdje je razlika manja od jedne bele.

**Kraj partije:** pobjednički par, tablica punata po dijeljenjima, statistika (koliko si puta uzeo ultimu, koliko akuža, prosjek punata) i gumb **Nova partija**.

## CPU igrači

### Temeljno načelo: bez varanja

CPU igrač zna samo ono što bi znao čovjek za stolom:

- svoje karte;
- sve odigrane karte i tko ih je odigrao;
- signale;
- prijavljenu akužu (otkriva koje velike netko ima);
- zaključke iz igre, npr. tko nije odgovorio na boju više je nema.

Engine to provodi kroz funkciju `vidljivoStanje(igrac)`. CPU modul nikad ne prima puno stanje igre. Test to provjerava.

### Model znanja (`znanje.ts`)

Za svakog drugog igrača i svaku kartu koja nije odigrana CPU vodi popis mogućih vlasnika:

- karta u vlastitoj ruci: poznata;
- igrač nije odgovorio na boju: nema nijednu kartu te boje;
- akuža: poznate velike tog igrača;
- signal: bato znači da igrač ima tricu ili duju bez trice (traži tricu) i želi da partner stavi najjaču i vrati se u boju manjom kartom; strišo kao liscio u priručniku (lekcija `signali`).

Iz tog popisa računa se, na primjer, gdje je treći aš ili je li njegova karta najjača u boji. Brojanje karata iz lekcije `zadnje-ruke` (t. 56 do 59) radi nad ovim modelom.

### Slojevi odluke

CPU bira potez ovim redom:

1. **Dopušteni potezi.** Ako je samo jedan, igra ga odmah.
2. **Pravila iz priručnika.** Popis pravila s prioritetom. Prvo pravilo čiji je uvjet ispunjen određuje potez.
3. **Pretraga** (samo razina Majstor). Vidi niže.
4. **Opća heuristika** ako nijedno pravilo ne odgovara:
   - kad odgovaraš i partner drži ruku, dodaj punte (aš ili figuru) ako ne gubiš kontrolu boje;
   - kad protivnik drži ruku s puntima, uzmi je najmanjom kartom koja je dovoljna;
   - inače igraj najmanju kartu;
   - kod odbacivanja slijedi pravila iz lekcije `odbacivanje`, a bez pravila odbaci lišinu duge boje.

### Pravila kao podaci

Svako pravilo je zaseban objekt u `src/igra/cpu/pravila/`:

```ts
export const otvaranjeDujaAs: Pravilo = {
  id: "otvaranje-duja-as",
  tocka: "t. 11",
  lekcija: "otvaranje-2#duja-as",
  faza: "otvaranje",          // otvaranje | odgovor | odbacivanje | zadnje-ruke | signal
  razina: "igrac",            // najniža razina CPU-a koja zna pravilo
  prioritet: 60,
  uvjet: (s) => s.prviOdRuke && imaDujaAs(s.ruka) && !imaSuhuTricaAs(s.ruka),
  potez: (s) => ({ karta: duja(bojaDujaAs(s.ruka)), signal: null }),
  objasnjenje: "S dujom+ašem otvara se dujom i traži se trica.",
};
```

- Svako pravilo ima barem jedan test s konkretnom rukom i očekivanim potezom. Ruke za testove uzeti iz primjera u lekcijama i iz `prototipovi/dijagram-ruke-primjeri.py` (23 ruke iz prijevoda priručnika s brojem točke).
- Objašnjenje se piše svojim riječima, kratko, s brojem točke (pravna napomena u `01-vizija.md`).
- Pravilo koje nije jasno iz lekcija ne piše se dok urednica ne potvrdi; ide u `docs/otvorena-pitanja.md`.

**Početni katalog** (iz `03-sadrzaj.md` i testa otvaranja; proširivati lekciju po lekciju):

| Faza | Pravilo | Izvor |
| --- | --- | --- |
| otvaranje | duga duja (duja + još 4 karte): otvori tu boju uz bato (u priručniku rebato) | t. 1 |
| otvaranje | srednja igra u tri boje i tri karte bez velikih u četvrtoj: otvori najslabiju boju, bez signala | t. 2 |
| otvaranje | jedna boja za batiti (trica barem četvrta): otvori je s batom | t. 3 |
| otvaranje | nemaš jednu boju: kreni s najjačom igrom | t. 4 |
| otvaranje | suhi kralj "volava" se samo kad si vrlo jak u ostalim bojama | t. 8 |
| otvaranje | suha trica+aš: nikad ne otvaraj tu boju | t. 10 |
| otvaranje | duja+aš i barem još jedna karta: otvori dujom | t. 11 |
| otvaranje | nemaš jednu boju, imaš duju+aš i tricu+aš u drugoj boji: dujom, pa inzistiraj dok trica ne padne | t. 16 |
| otvaranje | aš se strišava kao prvi od ruke tek s trećim dujama ili tricama u ostalim bojama | t. 21b |
| otvaranje | boja trećeg aša otvara se samo s trećim velikima u ostale tri boje | Uporaba aša, t. 1 |
| odgovor | partner bati: stavi najjaču (s tricom tricu, bez trice aša), a kad uzmeš ruku, vrati se u boju manjom kartom | lekcija `signali`, t. 34, hrvatska praksa |
| odgovor | partner otvori uz strišo: odgovori kao na liscio u priručniku | lekcija `signali`, poglavlje Strišo |
| odgovor | odgovori na otvaranje | t. 32 do 44 |
| odbacivanje | pravila odbacivanja i zvanja | t. 45 do 50 |
| zadnje ruke | brojanje karata i igra zadnjih ruku | t. 56 do 59 |

### Razine CPU igrača

| Razina | Kako igra |
| --- | --- |
| **Početnik** | Dopušteni potezi i opća heuristika. U 20 % poteza igra nasumičnu dopuštenu kartu. Signale daje rijetko i ne čita partnerove. |
| **Igrač** | Sva pravila iz kataloga s razinom `pocetnik` i `igrac`, puni model znanja, daje i čita signale. |
| **Majstor** | Sva pravila i pretraga. Pravilo daje prijedlog; pretraga ga potvrđuje ili mijenja kad očekuje barem jednu belu više. |

### Pretraga (razina Majstor)

- **Metoda:** Monte Carlo s određivanjem ruku (PIMC).
  1. Iz modela znanja nasumično se podijele nepoznate karte, poštujući sve zaključke (nemanje boje, akuža, signali).
  2. Za svaku podjelu traži se najbolji potez kao da su sve karte otvorene: minimaks s alfa-beta rezanjem, ocjena je razlika bela između parova uključujući ultimu.
  3. Bira se potez s najboljim prosjekom.
- **Broj uzoraka:** 50 do 200, ovisno o vremenu.
- **Vremensko ograničenje:** 300 ms po potezu na mobitelu, 600 ms na računalu.
- **Od šeste ruke nadalje** (5 ili manje karata u ruci) pretraga ide do kraja dijeljenja. Ranije ide do dubine koju vrijeme dopušta, a ostatak procjenjuje heuristikom.
- Pretraga radi u **Web Workeru**, da sučelje nikad ne zastane.
- Poznata slabost PIMC-a: ne vrednuje skrivanje informacija. Zato pravila iz priručnika o signalima i igri bez signala imaju prednost pred pretragom kod otvaranja (prve tri ruke).

### Objašnjenja poteza

- Uz svaki potez CPU igrača sprema se razlog: `{ pravilo, tocka, lekcija, tekst }` ili `{ izvor: "pretraga", razlika: 2 }` (u belama).
- Dodir ili prelazak mišem preko odigrane karte na stolu ili u povijesti pokazuje razlog: "Partner: otvara dujom kupa i traži tricu (t. 11)."
- Kod poteza iz pretrage: "Izračun: ovaj potez u prosjeku donosi 2 bele više."
- **Savjet** za igrača koristi istu logiku na razini Majstor nad igračevim vidljivim stanjem i pokazuje preporučenu kartu, razlog i poveznicu na lekciju.
- U načinu **Učitelj: upozori na grešku**, prije nego karta ode na stol, igra upozori ako je razlika veća od 3 bele: "Siguran si? Prema t. 10 suha trica+aš se ne otvara." Igrač može potvrditi ili promijeniti potez.

## Tehnička arhitektura

```
src/igra/
  karte.ts          špil, red jačine, vrijednost u belama, nazivi karata ("trica kupa")
  slucaj.ts         generator nasumičnih brojeva sa sjemenom (mulberry32)
  stanje.ts         nepromjenjivo stanje igre i događaji
  pravila-igre.ts   dopušteni potezi, pobjednik ruke, obračun, akuža
  partija.ts        niz dijeljenja, djelitelj, cilj, kraj partije
  cpu/
    znanje.ts       model znanja iz vidljivog stanja
    pravila/        pravila iz priručnika, jedno po datoteci, s testom
    heuristika.ts   opća heuristika
    pretraga.ts     PIMC + alfa-beta
    worker.ts       Web Worker za pretragu
    igrac-cpu.ts    spaja slojeve, vraća potez i razlog
  ui/               Preact komponente: Stol, Plocica, RukaIgraca, SredinaStola, Signal,
                    PlocaStanja, BocnaPloca, Povijest, Obracun, Pregled, Postavke
src/pages/igraj.astro
```

- **Engine je čisti TypeScript bez DOM-a.** Može se testirati i pokretati u Node.js-u i u workeru.
- **Događaji:** svaka radnja je događaj (`dijeljenje`, `akuza`, `karta`, `signal`, `ruka-uzeta`, `kraj-dijeljenja`, `kraj-partije`). Sučelje se crta iz niza događaja, bez animacija; pregled dijeljenja ponovno prolazi isti niz.
- **Sjeme dijeljenja:**
  - Svako dijeljenje ima sjeme. "Ponovi ovo dijeljenje" pokreće isto sjeme.
  - Poveznica `/igraj/#d=<sjeme>` otvara točno to dijeljenje, pa se primjer može podijeliti.
  - Lekcije mogu imati gumb **Odigraj ovaj primjer** s unaprijed zadanim rukama: `/igraj/#ruke=kupe:2,A,13,5|spade:3,A,7,4|...`, isti zapis kao komponenta `Dijagram`. Ostale karte dijele se nasumično.
- **Spremanje:**
  - `localStorage` ključ `skola-tresete:igra:v1` čuva postavke, nedovršenu partiju (niz događaja i sjeme) i statistiku.
  - Svako čitanje i pisanje je u `try/catch`; bez spremanja igra i dalje radi.
- **Pristupačnost:**
  - Karte su gumbi s `aria-label` ("trica kupa").
  - Živa regija najavljuje poteze: "Partner igra aš kupa, bato." i "Ruku uzima igrač poslije tebe."
  - Svi potezi su dostupni tipkovnicom.
  - Boja nikad nije jedini znak: uvijek i broj i ikona.

## Testovi

Vitest. `npm test` mora proći prije svakog commita.

**Engine**

- Špil ima 40 različitih karata, svaki igrač dobiva 10.
- Zbroj bela u svakom dijeljenju je 35, a zbroj punata 11.
- Obavezno odgovaranje na boju i pobjednik ruke, na tablici primjera.
- Akuža: sve kombinacije iz lekcije `akuza`, zbrajanje, napolitana uvijek 3, akuža ostaje paru i kad je kapot.
- Kraj partije za 21, 31 i 41, uključujući slučaj kad oba para prijeđu cilj i dodatno dijeljenje kod izjednačenja.
- Prvo dijeljenje otvara igrač; djelitelj se mijenja u smjeru kazaljke na satu.

**CPU**

- Svako pravilo: zadana ruka → očekivani potez.
- `vidljivoStanje` ne sadrži tuđe karte.
- Simulacija: 10 000 dijeljenja CPU protiv CPU bez greške i bez nedopuštenog poteza.
- Provjera snage: par Majstor protiv para Početnik dobiva barem 65 % partija do 41 u 1 000 partija. Par Igrač protiv para Početnik barem 58 %. Ako ne, pravila ili pretraga imaju grešku.
- Brzina: potez Majstora u prosjeku ispod vremenskog ograničenja na srednjem mobitelu (Lighthouse CPU throttling 4×).

## Faza 6 · Igra (dodatak plana rada)

Radi se nakon Faze 2 (kad postoje komponente karte), a može ići usporedno s fazama 3 do 5. Svaka podfaza završava objavom koju urednica pregledava.

| Podfaza | Sadržaj | Gotovo kad |
| --- | --- | --- |
| **6a** Engine | `karte`, `stanje`, `pravila-igre`, `partija`, testovi engina | svi testovi engina prolaze; 10 000 nasumičnih dijeljenja bez greške |
| **6b** Stol | stol po uzoru na BBO, pločice, ploča sa stanjem, bočna ploča, CPU Početnik, način Jedno dijeljenje | dijeljenje se odigra do kraja na mobitelu i računalu; obračun je točan |
| **6c** Partija | 21, 31, 41, akuža, signali, postavke, nastavak nedovršene partije | partija do 41 odigra se do kraja; osvježavanje stranice ne gubi partiju |
| **6d** Igrač | model znanja, katalog pravila, objašnjenja poteza, Savjet | sva pravila iz kataloga imaju test; provjera snage Igrač/Početnik prolazi |
| **6e** Majstor | pretraga u workeru, pregled i analiza dijeljenja, Učitelj, sjeme i poveznice | provjera snage Majstor/Početnik prolazi; analiza upućuje na postojeće odjeljke lekcija |

## Odluke urednice (10. 10. 2026.)

1. Igra ide u smjeru kazaljke na satu. Prvo dijeljenje otvara igrač; djelitelj je igrač prije njega. Špil se ne siječe. Dijeli se svih 40 karata, po 10 svakom igraču, u dva kruga po pet.
2. Kad oba para prijeđu cilj, pobjeđuje par s više punata. Kod izjednačenja igra se dodatno dijeljenje.
3. Zvanje dosta se u igri ne izvodi.
4. Kapot ne nosi dodatne punte i ne briše akužu para koji je akužao.
5. Napolitana uvijek vrijedi 3 punta.
6. Akuža se uključuje ili isključuje pri pokretanju partije.
7. Signali su samo bato ("igraj najjaču i vrati mi manjom") i strišo (kao liscio u priručniku). Talijanski rebato kod nas se daje batom. Ostali talijanski signali se ne izvode.
8. Igra nema animacija: ni dijeljenja ni odigravanja karata. Izgled slijedi BBO.

## Otvoreno

Za igru nema otvorenih pitanja.
