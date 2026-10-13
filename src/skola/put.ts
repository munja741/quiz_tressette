// Put učenja: sve lekcije po razinama (docs/02-struktura.md). Lekcije bez datoteke prikazuju se kao "uskoro".
export const RAZINE = ['Početnik', 'Igrač', 'Napredni', 'Majstor'] as const;
export const PUT: { slug: string; naslov: string; razina: (typeof RAZINE)[number] }[] = [
  { slug: 'pravila', naslov: 'Pravila igre', razina: 'Početnik' },
  { slug: 'punti-i-bele', naslov: 'Punti, bele i ultima', razina: 'Početnik' },
  { slug: 'akuza', naslov: 'Akuža', razina: 'Početnik' },
  { slug: 'signali', naslov: 'Signali: bato i strišo', razina: 'Početnik' },
  { slug: 'bonton', naslov: 'Za stolom', razina: 'Početnik' },
  { slug: 'otvaranje-1', naslov: 'Otvaranje: osnovna pravila', razina: 'Igrač' },
  { slug: 'otvaranje-2', naslov: 'Otvaranje: duja+aš, trica+aš, napolitana', razina: 'Igrač' },
  { slug: 'as', naslov: 'Uporaba aša', razina: 'Igrač' },
  { slug: 'odgovori', naslov: 'Odgovori na otvaranje', razina: 'Igrač' },
  { slug: 'odbacivanje', naslov: 'Odbacivanje', razina: 'Igrač' },
  { slug: 'duja', naslov: 'Duja u modernoj igri', razina: 'Napredni' },
  { slug: 'bez-signala', naslov: 'Igra bez signala', razina: 'Napredni' },
  { slug: 'striso', naslov: 'Zašto ne signalizirati strišo', razina: 'Napredni' },
  { slug: 'otvaranje-3', naslov: 'Napadi i protivnička igra', razina: 'Napredni' },
  { slug: 'temelji', naslov: 'Igra para: temelji', razina: 'Napredni' },
  { slug: 'hvatanje-asa', naslov: 'Hvatanje trećeg aša', razina: 'Majstor' },
  { slug: 'zadnje-ruke', naslov: 'Zadnje ruke i brojanje karata', razina: 'Majstor' },
  { slug: 'simulacije', naslov: 'Simulacije i finese', razina: 'Majstor' },
  { slug: 'bez-akuze', naslov: 'Zašto akuža koči igru', razina: 'Majstor' },
  { slug: 'test-vjestine', naslov: 'Test vještine', razina: 'Majstor' },
];
