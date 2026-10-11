# Kviz trešete: upute za izradu

Oct 9, 2026 · @Žana

## Cilj

Aplikacija igraču pokaže deset karata i pita kako bi otvorio kao prvi od ruke. To je test koji autor *Biblije trešete u parove* predlaže na početku priručnika: za svako dijeljenje postoji jedno savršeno otvaranje, dva pogrešna i jedno katastrofalno.

Na kraju igrač dobiva razinu i za svaki odgovor objašnjenje s brojem točke iz priručnika. Test tako ne samo ocjenjuje nego i uči.

Pitanja se pišu kao podaci, odvojeno od koda. Vi ih pregledavate, ispravljate i dodajete bez diranja aplikacije.

## Kako test radi

Jedan krug ima 10 ruku. Igrač za svaku bira jedno od četiri otvaranja i odmah vidi ocjenu i objašnjenje.

1. Ekran pokazuje 10 karata, složenih po bojama, i položaj: prvi od ruke, partner nasuprot.
2. Ispod su četiri ponuđena otvaranja: karta, boja i signal (bato, rebato, strišo, "volo" ili bez signala). Redoslijed se svaki put miješa.
3. Nakon odabira: ocjena, objašnjenje u dvije do tri rečenice i broj točke u priručniku.
4. Nakon 10 ruku: ukupni bodovi, razina i popis ruku na kojima je igrač pogriješio.

| Ocjena | Bodovi |
| --- | --- |
| Savršeno | 3 |
| Pogrešno | 0 |
| Katastrofalno | −2 |

| Razina | Bodovi od 30 |
| --- | --- |
| Sjena | 27 i više |
| Iskusni igrač | 20 do 26 |
| Igrač | 12 do 19 |
| Početnik | ispod 12 |

Naziv najviše razine, "Sjena", preuzet je iz uvoda priručnika. Granice razina su prijedlog i lako se mijenjaju.

## Pitanja

Ovo je prvih šest ruku, svaka izgrađena oko jedne točke priručnika. Ocjene sam izveo iz pravila koja autor izričito navodi, ali ih treba pregledati iskusan igrač prije nego što test ode u upotrebu. Za puni krug treba još četiri ruke.

Oznake: 3, 2, A = trica, duja, aš · K, C, F = kralj, konj, fanat · 7 do 4 = lišine.

### Ruka 1 · nemaš jednu boju (točka 16)

Kupe 2 A K 5 · Špade 3 A 7 4 · Dinari 6 5 · Baštoni nema

| Otvaranje | Ocjena | Zašto |
| --- | --- | --- |
| 2 kupa, tražiš tricu; inzistiraš kraljem dok trica ne padne | Savršeno | Trica od trice+aša jedini je siguran povratak, pa se otvara duja+aš (t. 16) |
| 2 kupa, a kad trica ne padne, 3 špada tražeći duju | Katastrofalno | Autor: potez koji apsolutno ne smiješ napraviti, upropaštava dvije igre (t. 16) |
| 3 špada | Pogrešno | S tricom+ašem nikad se ne otvara udarajući tricom, osim ako je šesta (t. 11) |
| 6 dinara | Pogrešno | Kad nemaš boju, kreni s najjačom igrom (t. 4) |

### Ruka 2 · jedino bato (točka 3)

Kupe C 7 4 · Špade 3 6 5 4 · Dinari A 6 · Baštoni K

| Otvaranje | Ocjena | Zašto |
| --- | --- | --- |
| 4 špada, signal bato | Savršeno | S jedinom bojom za batiti otvara se ta boja, da partner zna gdje je trica (t. 3) |
| K baštona, "volo" | Pogrešno | Suhi kralj volava se samo kad si vrlo jak u ostalim bojama (t. 8) |
| C kupa, bez signala | Pogrešno | Otvaranje najslabije boje vrijedi uz srednju igru u tri boje, a nje nema (t. 2) |
| A dinara, strišo | Pogrešno | Aš se strišava kao prvi od ruke tek uz treće velike u ostalim bojama (t. 21b) |

### Ruka 3 · duga duja (točka 1)

Kupe 2 7 6 5 4 · Špade 3 K 4 · Dinari A C · Baštoni nema

| Otvaranje | Ocjena | Zašto |
| --- | --- | --- |
| 4 kupa, signal rebato | Savršeno | S dugom dujom (još 4 ili više karata) uvijek se otvara ta boja (t. 1) |
| 4 špada, signal bato | Pogrešno | Duga duja ima prednost; a kad nemaš boju, kreće se s najjačom igrom (t. 1, t. 4) |
| A dinara, strišo | Pogrešno | Kad nemaš boju, kreni s najjačom igrom (t. 4) |

### Ruka 4 · duja+aš i suha trica+aš (točke 10 i 11)

Kupe 3 A · Špade 2 A K 5 · Dinari C 7 5 · Baštoni F

| Otvaranje | Ocjena | Zašto |
| --- | --- | --- |
| 2 špada, tražiš tricu | Savršeno | S dujom+ašem uz barem još jednu kartu uvijek se otvara dujom (t. 11) |
| 3 kupa | Pogrešno | Sa suhom tricom+ašem nikad se ne otvara prvi (t. 10) |
| A špada | Pogrešno | S dujom+ašem štih mora ostati tebi, zato duja, a ne aš (t. 11) |

### Ruka 5 · srednja igra u tri boje (točka 2)

Kupe 3 6 · Špade 2 5 · Dinari 2 7 4 · Baštoni C 6 5

| Otvaranje | Ocjena | Zašto |
| --- | --- | --- |
| C baštona, bez signala | Savršeno | Uz srednju igru u tri boje otvara se najslabija, bez signala (t. 2) |
| C baštona, strišo | Pogrešno | Signalizirati strišo kao prvi od ruke autor zove ludošću (poglavlje Strišo) |
| 4 dinara, signal rebato | Pogrešno | Kao prvi od ruke ne rebatiš, osim s dugom dujom (t. 1) |
| 6 kupa, signal bato | Pogrešno | Druga trica nije boja za batiti (t. 3) |

### Ruka 6 · suha trica+duja (točka 17)

Kupe 3 2 · Špade C 7 5 · Dinari A 6 4 · Baštoni F 6

| Otvaranje | Ocjena | Zašto |
| --- | --- | --- |
| 3 kupa, signal suhe trice+duje | Savršeno | Udari tricu i signaliziraj; partner niskom lišinom traži da udariš i duju (t. 17) |
| 4 dinara | Pogrešno | Treći aš otvara se samo uz treće velike u ostalim trima bojama (Uporaba aša, t. 1) |

Samo ruka 1 ima katastrofalnu opciju, jer je priručnik izričito navodi. Rukama 2 do 6 katastrofalno otvaranje, po uzoru na autora, treba dodati iskusan igrač.

## Tehnička izvedba

Najjednostavnije je statična web stranica: jedan HTML, CSS i JS, bez poslužitelja, objavljena preko GitHub Pages. Isti kod može se objaviti i kao artifact na claude.ai.

- **Pitanja u zasebnoj datoteci** `questions.json`. Svaka ruka: id, naslov, točka iz priručnika, karte po bojama i popis otvaranja.
- **Otvaranje** ima: kartu, boju, signal, ocjenu (`savrseno`, `pogresno`, `katastrofalno`) i objašnjenje.
- **Karte** su nacrtane jednostavno, kao pravokutnici s vrijednošću i znakom boje. Bez preslikavanja dizajna postojećih talijanskih špilova.
- **Mobitel prvo:** 10 karata u dva reda na zaslonu od 375 px, velike tipke za odgovore.
- **Jezik:** hrvatski, nazivlje iz priručnika (bato, rebato, strišo, "volati", lišina, velike).
- **Bez prijave i baze:** rezultat se pokazuje na kraju i ne sprema se nigdje.

Primjer zapisa jedne ruke:

```json
{
  "id": "ruka-1",
  "naslov": "Nemaš jednu boju",
  "tocka": "t. 16",
  "karte": {"kupe": ["2","A","K","5"], "spade": ["3","A","7","4"], "dinari": ["6","5"], "bastoni": []},
  "otvaranja": [
    {"karta": "2", "boja": "kupe", "signal": "bez signala", "ocjena": "savrseno",
     "zasto": "Trica od trice+aša jedini je siguran povratak, pa se otvara duja+aš."}
  ]
}
```

## Upute za Claude (GitHub)

Prompt ispod kopirajte u Claude Code povezan s vašim GitHubom, zajedno s ovim dokumentom (izvezite ga u Markdown) ili barem odjeljcima Pitanja i Tehnička izvedba.

```markdown
Napravi mobilnu web aplikaciju "Test otvaranja" za trešetu u parove, prema priloženom dokumentu.

Repozitorij: novi, naziv treseta-test. Objava preko GitHub Pages.

Tehnika:
- Statična stranica: index.html, style.css, app.js, questions.json. Bez frameworka i bez build koraka.
- Sva pitanja čitaj iz questions.json; u kodu nema ni jedne ruke.
- Pretvori šest ruku iz odjeljka Pitanja u questions.json točno kako pišu; ništa ne izmišljaj i ne mijenjaj ocjene.

Tijek:
- Krug od svih ruku iz questions.json, redom.
- Za svaku ruku pokaži 10 karata složenih po bojama (kupe, špade, dinari, baštoni) i ponuđena otvaranja u nasumičnom redu.
- Nakon odabira pokaži ocjenu, objašnjenje i točku iz priručnika; tipka Dalje.
- Bodovi: savršeno 3, pogrešno 0, katastrofalno -2.
- Na kraju: zbroj, razina (Sjena, Iskusni igrač, Igrač, Početnik; granice skaliraj na broj ruku: 90 %, 67 %, 40 %) i popis promašenih ruku s objašnjenjem.

Izgled:
- Mobitel prvo, širina 375 px; karte u dva reda, tipke najmanje 44 px visoke.
- Karte crtaj sam (CSS ili SVG): vrijednost i znak boje. Ne kopiraj dizajn postojećih talijanskih špilova.
- Svijetla i tamna tema prema postavci telefona.
- Sav tekst na hrvatskom, nazivlje: bato, rebato, strišo, "volati", lišina, velike, prvi od ruke.

Na kraju mi pošalji link na GitHub Pages i kratke upute kako dodati novu ruku u questions.json.
```

Ako želite, isti test mogu napraviti i ovdje, kao artifact na claude.ai, bez GitHuba; pitanja bi ostala u jednoj datoteci koju lako mijenjamo.
