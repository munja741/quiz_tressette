from hands import figure

# (file, line-start anchor, spec, caption, n, play)
HANDS = [
 ("p1.html", "<p>2. Ako si prvi", {'kupe': ['3', '6'], 'spade': ['2', '5'], 'dinari': ['2', '7', '4'], 'bastoni': ['12', '6', '5']}, "Točka 2: srednja igra u tri boje, tri karte bez velikih u baštonima.", 10, None),
 ("p1.html", "<p>3. Ako si pak prvi", {'kupe': ['12', '7', '4'], 'spade': ['3', '6', '5', '4'], 'dinari': ['A', '6'], 'bastoni': ['13']}, "Točka 3: jedina boja za batiti su špade.", 10, ('spade', '4')),
 ("p1.html", "<p>11. U slučajevima", {'kupe': ['2', 'A', '5']}, "Točka 11: duja+aš uz još jednu kartu; otvara se dujom.", 10, ('kupe', '2')),
 ("p1.html", "<p>13. Ako imaš", {'kupe': ['3', 'A', '13', '5']}, "Točka 13: četvrta trica+aš s kraljem; otvara se kraljem bez signala.", 10, ('kupe', '13')),
 ("p1.html", "<p>16. Kad si prvi", {'kupe': ['2', 'A', '13', '5'], 'spade': ['3', 'A', '7', '4'], 'dinari': ['6', '5'], 'bastoni': []}, "Točka 16: nema baštona; otvara se dujom kupa.", 10, ('kupe', '2')),
 ("p1.html", "<p>17. Ako imaš suhu", {'kupe': ['3', '2'], 'spade': ['12', '7', '5'], 'dinari': ['A', '6', '4'], 'bastoni': ['11', '6']}, "Točka 17: suha trica+duja i treći aš.", 10, ('kupe', '3')),
 ("p1.html", "<p>19. Ako imaš", {'kupe': ['13', '12', '11', '6']}, "Točka 19: četvrti kralj s figurama; može se batiti lišinom.", 10, ('kupe', '6')),
 ("p1.html", "<p>21b.", {'kupe': ['2', '6', '5'], 'spade': ['2', '7', '4'], 'dinari': ['3', '5'], 'bastoni': ['A', '6']}, "Točka 21b: aš se strišava kao prvi od ruke.", 10, ('bastoni', 'A')),
 ("p1.html", "<p>Uzmimo primjer: igrač poslije tebe rebati", {'kupe': ['13', '4'], 'spade': ['3', 'A', '13', '5'], 'dinari': ['2', '6'], 'bastoni': ['2', '7']}, "Točka 24: tvoja ruka u primjeru.", 10, None),
 ("p1.html", "<p>Otvori BEZ SIGNALA TRICOM", {'kupe': ['3', '2', 'A']}, "Točka 28: suha napolitana.", 10, ('kupe', '3')),
 ("p1.html", "<p>Prvi si od ruke i imaš PETU", {'kupe': ['3', '2', 'A', '12', '5']}, "Točka 29: peta napolitana s lišinom i figurom.", 10, ('kupe', '3')),
 ("p1.html", "<p>30. Ako si prvi", {'kupe': ['3', '2', '6']}, "Točka 30: treća trica+duja.", 10, ('kupe', '3')),
 ("p1.html", "<p>1. Ako imaš TREĆEG aša", {'kupe': ['A', '7', '5'], 'spade': ['3', '6', '4'], 'dinari': ['2', '5'], 'bastoni': ['3', '6']}, "Uporaba aša, 1: treći aš uz velike u ostale tri boje.", 10, None),
 ("p1.html", "<p>3. Ako je aš peti", {'kupe': ['A', '13', '12', '6', '4'], 'spade': ['3']}, "Uporaba aša, 3: peti aš s kraljem i konjem, uz tricu druge boje.", 10, ('kupe', 'A')),
 ("p1.html", "<p>4. Ako imamo tri jake", {'kupe': ['3', '2', 'A', '6'], 'spade': ['3', '2', '5'], 'dinari': ['3', '13'], 'bastoni': ['A']}, "Uporaba aša, 4: tri jake boje i suhi aš.", 10, ('bastoni', 'A')),
 ("p2.html", "<p>32. Ako imaš DRUGU", {'kupe': ['2', '6']}, "Točka 32: druga duja; igrač prije tebe bati u kupama.", 10, ('kupe', '2')),
 ("p2.html", "<p>43.", {'kupe': ['2', '13', '5']}, "Točka 43: treća duja s kraljem.", 10, ('kupe', '2')),
 ("p2.html", "<p>55.", {'kupe': ['2', 'A', '6', '4']}, "Točka 55: četvrta duja+aš; partner bati u kupama.", 10, None),
 ("p2.html", "<p>57.", {'dinari': ['3', '6']}, "Točka 57: zadnje dvije karte, trica za strišo u boji koja još nije izašla.", 2, ('dinari', '3')),
 ("p2.html", "<p>Ako u pretposljednjoj ruci", {'kupe': ['13', '5']}, "Kralj za strišo: pretposljednja ruka.", 2, ('kupe', '5')),
 ("p4.html", "<p>U situaciji neizvjesnosti", {'kupe': ['2', '13', '6']}, "Duja: duja s kraljem i još jednom kartom; otvara se odmah dujom.", 10, ('kupe', '2')),
 ("p4.html", "<p>Uzmimo klasičan primjer", {'dinari': ['12', '11'], 'spade': ['2', '6'], 'bastoni': ['3', 'A', '12', '5'], 'kupe': []}, "Odbacivanje: tvojih osam karata nakon dvije ruke u kupama.", 8, ('bastoni', '12')),
 ("p4.html", "<p>Prvi ste od ruke. Imate četvrtu", {'kupe': ['3', '7', '5', '4'], 'spade': ['3', '6'], 'dinari': ['12', '6', '5'], 'bastoni': ['11']}, "Test vještine: vaša ruka.", 10, ('kupe', '4')),
]


def figures():
    out = []
    for i, (f, anchor, spec, cap, n, play) in enumerate(HANDS):
        out.append((f, anchor, figure(spec, 1000 + i, cap, n, play)))
    return out
