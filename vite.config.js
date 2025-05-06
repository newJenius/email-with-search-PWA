import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'nermes',
        short_name: 'Поисковик людей',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          {
            src: 'https://i.pinimg.com/736x/c8/f9/06/c8f9061609378df1bd6bfb61f578ef9d.jpg',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'https://i.pinimg.com/736x/c8/f9/06/c8f9061609378df1bd6bfb61f578ef9d.jpg',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*$/, // Кешируй API
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 день
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 дней
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // hmr: false,
    // watch: {
    //   usePolling: true,
    // },
    cors: true,
    origin: 'https://e41e-79-134-37-172.ngrok-free.app',
    fs: {
      strict: false,
    },
  },
});
