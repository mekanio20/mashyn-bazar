import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // public/manifest.json kullanılıyor
      workbox: {
        globPatterns: ['**/*.{html,js,css,json,png,svg}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
});
