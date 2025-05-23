import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Автоматическое обновление Service Worker
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'], // Дополнительные файлы для кэширования
      manifest: {
        name: 'BarberHub',
        short_name: 'BarberHub',
        description: 'Выбирай стрижку, а не барбера',
        start_url: '/',
        display: 'standalone', // Открывается как приложение
        background_color: '#ffffff',
        theme_color: '#9A0F34',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});