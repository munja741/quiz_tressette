import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lekcije = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/lekcije' }),
  schema: z.object({
    naslov: z.string(),
    razina: z.enum(['Početnik', 'Igrač', 'Napredni', 'Majstor']),
    redoslijed: z.number(),
    minuta: z.number(),
    opis: z.string(),
    preduvjeti: z.array(z.string()).default([]),
    ciljevi: z.array(z.string()).min(2).max(4),
    sazetak: z.string(),
  }),
});

const izvor = z.object({ lekcija: z.string(), odjeljak: z.string(), tocka: z.string().optional() });
const osnova = { id: z.string(), pitanje: z.string(), objasnjenje: z.string(), izvor };

const pitanje = z.discriminatedUnion('vrsta', [
  z.object({ ...osnova, vrsta: z.literal('izbor'), ruka: z.string().optional(), karte: z.string().optional(), odgovori: z.array(z.object({ tekst: z.string(), tocno: z.boolean().optional() })).min(2) }),
  z.object({ ...osnova, vrsta: z.literal('broj'), karte: z.string().optional(), tocno: z.number(), jedinica: z.string().optional() }),
  z.object({ ...osnova, vrsta: z.literal('redoslijed'), karte: z.string() }),
  z.object({
    ...osnova,
    vrsta: z.literal('stol'),
    ruka: z.string(),
    stol: z.array(z.object({ tko: z.enum(['prije', 'partner', 'poslije']), karta: z.string(), signal: z.enum(['bato', 'striso']).optional() })),
    tocne: z.array(z.string()).min(1),
  }),
]);

const kvizovi = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/kvizovi' }),
  schema: z.object({ lekcija: z.string(), prolaz: z.number().default(0.75), pitanja: z.array(pitanje).min(3) }),
});

export const collections = { lekcije, kvizovi };
