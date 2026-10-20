// vite.config.js — configuración para despliegue en GitHub Pages
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/reactor-del-saber/',
  build: {
    target: 'esnext',
  },
});
