import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Permite rodar no GitHub Pages em qualquer subpasta!
  publicDir: 'public',
  server: {
    port: 3000,
    open: false
  }
});
