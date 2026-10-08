import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// BASE_PATH lets the same build run at a domain root or under a sub-path (e.g. GitHub Pages).
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  integrations: [preact()],
  build: { format: 'directory' },
});
