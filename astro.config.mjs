import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// GitHub Pages: https://munja741.github.io/quiz_tressette/
export default defineConfig({
  site: 'https://munja741.github.io',
  base: '/quiz_tressette',
  integrations: [preact()],
});
