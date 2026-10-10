"""Hand diagrams: simple 4-colour cards (rank + suit icon), PokerStrategy style."""
import random

ORDER = ['kupe', 'spade', 'dinari', 'bastoni']
RANKS = ['3', '2', 'A', '13', '12', '11', '7', '6', '5', '4']
COL = {'kupe': '#1f4e9c', 'spade': '#1a1a1a', 'dinari': '#b77f00', 'bastoni': '#c8102e'}
NAME = {'kupe': 'kupa', 'spade': 'špada', 'dinari': 'dinara', 'bastoni': 'baštona'}
RNAME = {'3': 'trica', '2': 'duja', 'A': 'aš', '13': 'kralj', '12': 'konj', '11': 'fanat'}

# flat suit icons in a 20x20 box
ICON = {
 'kupe': '<path d="M3.5 3h13c0 5-2.3 8-5.2 8.7V15h3v2h-8.6v-2h3v-3.3C5.8 11 3.5 8 3.5 3z"/>',
 'spade': '<path d="M10 1l1.5 2.6v9.6h-3V3.6z"/><rect x="5.2" y="13" width="9.6" height="2" rx="1"/><rect x="9" y="14.8" width="2" height="2.8"/><circle cx="10" cy="18.4" r="1.3"/>',
 'dinari': '<circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="4.6" fill="#fff" opacity=".55"/>',
 'bastoni': '<path d="M13.6 1.6c1.8.8 2.2 2.6 1.4 4.2L8.4 18.6c-.5.9-1.6 1.2-2.5.7-.9-.5-1.2-1.6-.7-2.5l6.2-12.6c-.5-1.3.2-2.4 2.2-2.6z"/>'
}

CW, CH, GAP, SGAP = 40, 56, 4, 12


def card(x, s, r, filler=False, play=False):
    op = ' opacity="0.42"' if filler else ''
    stroke = '#c9a227' if play else '#c9ccc9'
    sw = '2.6' if play else '1'
    fs = '15' if len(r) < 2 else '13'
    return (f'<g transform="translate({x} 0)"{op}>'
            f'<rect x="1" y="1" width="{CW-2}" height="{CH-2}" rx="5" fill="#ffffff" stroke="{stroke}" stroke-width="{sw}"/>'
            f'<text x="6" y="19" font-family="Liberation Sans, Arial, sans-serif" font-weight="700" font-size="{fs}" fill="{COL[s]}">{r}</text>'
            f'<g transform="translate({CW/2-11} 27) scale(1.1)" fill="{COL[s]}">{ICON[s]}</g></g>')


def build(spec, seed, n=10):
    """spec: {'kupe':['2','A'], ...}; missing cards are random filler from suits not in spec."""
    rnd = random.Random(seed)
    hand = {s: [(r, False) for r in spec.get(s, [])] for s in ORDER}
    need = n - sum(len(v) for v in hand.values())
    free = [s for s in ORDER if s not in spec]
    pool = [(s, r) for s in free for r in RANKS]
    rnd.shuffle(pool)
    for s, r in pool[:max(0, need)]:
        hand[s].append((r, True))
    for s in ORDER:
        hand[s].sort(key=lambda c: RANKS.index(c[0]))
    return hand


def svg(hand, play=None):
    parts, x = [], 0
    for s in ORDER:
        cs = hand[s]
        if not cs:
            continue
        for r, fill in cs:
            parts.append(card(x, s, r, fill, play == (s, r)))
            x += CW + GAP
        x += SGAP - GAP
    w = x - SGAP + 2
    return f'<svg class="hand-svg" viewBox="-1 -1 {w} {CH+2}" width="{w}" height="{CH+2}" role="img" xmlns="http://www.w3.org/2000/svg">{"".join(parts)}</svg>'


def label(hand):
    out = []
    for s in ORDER:
        if hand[s]:
            out.append(NAME[s] + ': ' + ', '.join(RNAME.get(r, r) for r, _ in hand[s]))
    return 'Primjer ruke. ' + '; '.join(out)


def figure(spec, seed, cap, n=10, play=None):
    h = build(spec, seed, n)
    has_fill = any(f for s in ORDER for _, f in h[s])
    note = []
    if play:
        note.append('Zlatni obrub: karta kojom se igra.')
    if has_fill:
        note.append('Blijede karte su nasumične i nisu važne za primjer.')
    s = svg(h, play).replace('role="img"', f'role="img" aria-label="{label(h)}"')
    return (f'<figure class="hand-fig">{s}<figcaption><b>{cap}</b>'
            + (' ' + ' '.join(note) if note else '') + '</figcaption></figure>')
