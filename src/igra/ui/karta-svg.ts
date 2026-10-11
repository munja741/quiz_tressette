// Crteži karata (SVG kao tekst). Velika ilustrirana karta iz prototipa testa otvaranja
// i kompaktna karta iz dijagrama ruke. Boje: kupe plava, špade crna, dinari zlatna, baštoni crvena.
/* eslint-disable */
// @ts-nocheck
var DISP={'K':'13','C':'12','F':'11'};
var GOLD='#e0b23a', GOLDD='#9a6d0a', RED='#c2412d', BLUE='#2c5896', BLACK='#1f1f1f', STEEL='#3a3d42', INK='#3a2a12', SKIN='#f3dcc0', BROWN='#8a5a2b';
// one pip, drawn in a 32x32 box
var PIP={
 kupe:'<path d="M7 8.5h18c0 6.5-3.2 10.2-7 11.2v3.6h3.6c1.4 0 2.4 1 2.4 2.4V27H8v-1.3c0-1.4 1-2.4 2.4-2.4H14v-3.6c-3.8-1-7-4.7-7-11.2z" fill="'+BLUE+'" stroke="'+INK+'" stroke-width=".8"/><rect x="7.6" y="10.4" width="16.8" height="2.6" fill="'+GOLD+'"/><circle cx="16" cy="5.2" r="2.2" fill="'+GOLD+'" stroke="'+INK+'" stroke-width=".6"/>',
 spade:'<path d="M14.6 2.5c4.8 4.6 5.4 11.5 2.6 18.5l-3-.6c2-5.8 1.7-11.6.4-17.9z" fill="'+STEEL+'" stroke="'+INK+'" stroke-width=".7"/><rect x="8.5" y="20.2" width="15" height="3.2" rx="1.6" fill="'+GOLD+'" stroke="'+INK+'" stroke-width=".6"/><rect x="14.4" y="23.2" width="3.2" height="5.2" fill="'+RED+'"/><circle cx="16" cy="29.4" r="2" fill="'+GOLD+'" stroke="'+INK+'" stroke-width=".6"/>',
 dinari:'<circle cx="16" cy="16" r="12.5" fill="'+GOLD+'" stroke="'+GOLDD+'" stroke-width="1.2"/><circle cx="16" cy="16" r="8.4" fill="'+RED+'"/><path d="M16 9.5l1.6 4.9h5.1l-4.1 3 1.6 4.9-4.2-3-4.2 3 1.6-4.9-4.1-3h5.1z" fill="'+GOLD+'"/>',
 bastoni:'<path d="M22.4 3.2c2.9 1.4 3.6 4.3 2.2 6.8L13.9 29.6c-.8 1.4-2.5 1.9-3.9 1.1-1.4-.8-1.9-2.5-1.1-3.9L19.5 7.3c-.7-2 .3-3.7 2.9-4.1z" fill="'+RED+'" stroke="'+INK+'" stroke-width=".8"/><circle cx="19.2" cy="12.4" r="1.8" fill="'+GOLD+'"/><circle cx="15.6" cy="19.2" r="1.7" fill="'+GOLD+'"/><circle cx="12.4" cy="25" r="1.5" fill="'+GOLD+'"/>'
};
function pip(s,x,y,size){ var k=size/32; return '<g transform="translate('+(x-size/2)+' '+(y-size/2)+') scale('+k+')">'+PIP[s]+'</g>'; }
var LAY={1:[[31,50]],2:[[31,32],[31,68]],3:[[31,27],[31,50],[31,73]],4:[[21,32],[41,32],[21,68],[41,68]],5:[[21,30],[41,30],[31,50],[21,70],[41,70]],6:[[21,27],[41,27],[21,50],[41,50],[21,73],[41,73]],7:[[21,26],[41,26],[31,38],[21,50],[41,50],[21,73],[41,73]]};
function figure(s,r){
  var robe={kupe:BLUE,spade:BLACK,dinari:'#b8860b',bastoni:RED}[s], g='';
  if(r==='C'){ // konj: horse with rider
    g+='<path d="M14 56c0-6 5-10 12-10h10c4 0 7-3 9-6l3 2c-1 4-3 7-6 9l1 6c0 2-1 3-3 3H17c-2 0-3-1-3-4z" fill="'+BROWN+'" stroke="'+INK+'" stroke-width=".8"/>';
    g+='<path d="M45 40l3-5 2 1-1 6z" fill="'+BROWN+'" stroke="'+INK+'" stroke-width=".7"/>';
    g+='<rect x="18" y="58" width="3" height="15" fill="'+BROWN+'" stroke="'+INK+'" stroke-width=".6"/><rect x="38" y="58" width="3" height="15" fill="'+BROWN+'" stroke="'+INK+'" stroke-width=".6"/>';
    g+='<path d="M24 47l3-13h8l2 13z" fill="'+robe+'" stroke="'+INK+'" stroke-width=".8"/><circle cx="31" cy="29" r="4.6" fill="'+SKIN+'" stroke="'+INK+'" stroke-width=".7"/><path d="M26.5 26.5c1-3 8-3 9 0z" fill="'+GOLD+'"/>';
    g+=pip(s,18,38,12);
  } else { // fanat or kralj standing
    g+='<path d="M20 76l4-34h14l4 34z" fill="'+robe+'" stroke="'+INK+'" stroke-width=".8"/>';
    g+='<path d="M24 42h14l1 7H23z" fill="'+GOLD+'" opacity=".85"/>';
    g+='<circle cx="31" cy="34" r="6" fill="'+SKIN+'" stroke="'+INK+'" stroke-width=".7"/>';
    if(r==='K'){ g+='<path d="M24.5 28.5l1.6-6 2.4 3.4 2.5-4.4 2.5 4.4 2.4-3.4 1.6 6z" fill="'+GOLD+'" stroke="'+GOLDD+'" stroke-width=".7"/><path d="M27 38.5c1.5 2.5 6.5 2.5 8 0" stroke="'+INK+'" stroke-width=".7" fill="none"/>'; }
    else { g+='<path d="M24.5 31c0-5 13-5 13 0l-2-2.2h-9z" fill="'+robe+'" stroke="'+INK+'" stroke-width=".7"/><circle cx="37.5" cy="27.5" r="1.6" fill="'+GOLD+'"/>'; }
    g+=pip(s,45,52,15);
  }
  return g;
}
export function cardSVG(s,r){
  var col={kupe:BLUE,spade:BLACK,dinari:GOLDD,bastoni:RED}[s], d=DISP[r]||r, body='';
  if(r==='A'){ body='<circle cx="31" cy="50" r="19" fill="none" stroke="'+col+'" stroke-width=".8" opacity=".5"/><circle cx="31" cy="50" r="15.5" fill="none" stroke="'+col+'" stroke-width=".5" opacity=".35"/>'+pip(s,31,50,30); }
  else if(DISP[r]){ body=figure(s,r); }
  else { var n=+r; (LAY[n]||[]).forEach(function(p){ body+=pip(s,p[0],p[1],n>4?15:(n>3?17:19)); }); }
  return '<svg viewBox="0 0 62 96" aria-hidden="true"><rect x=".5" y=".5" width="61" height="95" rx="6.5" fill="#fbf7ee" stroke="#d8cfbd"/><rect x="4" y="4" width="54" height="88" rx="4" fill="none" stroke="'+col+'" stroke-width=".8" opacity=".55"/>'+body+'<text x="7.5" y="15" font-family="Alegreya SC, Georgia, serif" font-weight="700" font-size="11" fill="'+col+'">'+d+'</text><text x="54.5" y="81" transform="rotate(180 54.5 81)" text-anchor="start" font-family="Alegreya SC, Georgia, serif" font-weight="700" font-size="11" fill="'+col+'">'+d+'</text></svg>';
}



const ICON = {
 kupe: '<path d="M3.5 3h13c0 5-2.3 8-5.2 8.7V15h3v2h-8.6v-2h3v-3.3C5.8 11 3.5 8 3.5 3z"/>',
 spade: '<path d="M10 1l1.5 2.6v9.6h-3V3.6z"/><rect x="5.2" y="13" width="9.6" height="2" rx="1"/><rect x="9" y="14.8" width="2" height="2.8"/><circle cx="10" cy="18.4" r="1.3"/>',
 dinari: '<circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="4.6" fill="#fff" opacity=".55"/>',
 bastoni: '<path d="M13.6 1.6c1.8.8 2.2 2.6 1.4 4.2L8.4 18.6c-.5.9-1.6 1.2-2.5.7-.9-.5-1.2-1.6-.7-2.5l6.2-12.6c-.5-1.3.2-2.4 2.2-2.6z"/>'
};
export const BOJA_DIJAGRAMA = { kupe: '#1f4e9c', spade: '#1a1a1a', dinari: '#b77f00', bastoni: '#c8102e' };

/** Kompaktna karta (broj i ikona), 40 x 56. */
export function kompaktnaSVG(s, r) {
  const col = BOJA_DIJAGRAMA[s];
  const d = DISP[r] || r;
  const fs = d.length < 2 ? 15 : 13;
  return '<svg viewBox="0 0 40 56" aria-hidden="true"><rect x="1" y="1" width="38" height="54" rx="5" fill="#fff" stroke="#c9ccc9"/>'
    + '<text x="6" y="19" font-family="Source Sans 3, Arial, sans-serif" font-weight="700" font-size="' + fs + '" fill="' + col + '">' + d + '</text>'
    + '<g transform="translate(9 27) scale(1.1)" fill="' + col + '">' + ICON[s] + '</g></svg>';
}

/** Poleđina: zelena čoha i mjedena mreža (vlastiti crtež). */
export function poledinaSVG() {
  let l = '';
  for (let i = -96; i < 96; i += 8) l += '<path d="M' + i + ' 0l96 96M' + (i + 96) + ' 0l-96 96" stroke="#c9a54a" stroke-width=".7" opacity=".55"/>';
  return '<svg viewBox="0 0 62 96" aria-hidden="true"><defs><clipPath id="pc"><rect x="4" y="4" width="54" height="88" rx="4"/></clipPath></defs>'
    + '<rect x=".5" y=".5" width="61" height="95" rx="6.5" fill="#f4efe2" stroke="#d8cfbd"/>'
    + '<rect x="4" y="4" width="54" height="88" rx="4" fill="#1d5a3c"/><g clip-path="url(#pc)">' + l + '</g>'
    + '<rect x="4" y="4" width="54" height="88" rx="4" fill="none" stroke="#c9a54a" stroke-width="1"/></svg>';
}
