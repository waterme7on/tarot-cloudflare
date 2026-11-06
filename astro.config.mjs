import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

export default defineConfig({
  site: process.env.SITE_URL || 'https://tarot-tools.example.com',
  output: 'server',
  trailingSlash: 'ignore',
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: 'compile',
    workerEntryPoint: { path: 'src/worker/entry.ts', namedExports: ['ReportWorkflow'] },
  }),
  integrations: [react()],
  vite: {
    build: { minify: true },
    resolve: { alias: import.meta.env.PROD ? { 'react-dom/server': 'react-dom/server.edge' } : {} },
  },
});
