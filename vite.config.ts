import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path'; // ✅ добавь это

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'BarberHub',
        short_name: 'BarberHub',
        description: 'Выбирай стрижку, а не барбера',
        start_url: '/',
        display: 'standalone',
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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ✅ вот это добавь
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});