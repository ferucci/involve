import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      usePolling: true, // Для лучшей работы в Docker/WSL2 (опционально)
    },
  },
  css: {
    devSourcemap: true, // Включить sourcemaps для SCSS/CSS
  },
});