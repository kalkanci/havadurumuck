import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        cors: true,
        headers: {
          'Cache-Control': 'no-cache',
        }
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
          manifest: {
            name: "Atmosfer AI - Hava Durumu",
            short_name: "Atmosfer",
            description: "Sinematik, mobil öncelikli ve akıllı tavsiyeler sunan gerçek zamanlı hava durumu deneyimi.",
            theme_color: "#020617",
            background_color: "#020617",
            display: "standalone",
            orientation: "portrait-primary",
            start_url: "/",
            scope: "/",
            icons: [
              {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any"
              },
              {
                src: "/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any maskable"
              }
            ],
            shortcuts: [
              {
                name: "Anlık Hava Durumu",
                short_name: "Hava",
                description: "Mevcut konumunuzun hava durumunu gösterin",
                url: "/?tab=today",
                icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
              },
              {
                name: "7 Günlük Tahmin",
                short_name: "Tahmin",
                description: "Haftalık hava durumu tahmini",
                url: "/?tab=forecast",
                icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
              }
            ],
            categories: ["weather", "productivity"],
            share_target: {
                action: "/share",
                method: "POST",
                enctype: "application/x-www-form-urlencoded",
                params: {
                  title: "title",
                  text: "text",
                  url: "url"
                }
            }
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/(api\.open-meteo\.com|air-quality-api\.open-meteo\.com|nominatim\.openstreetmap\.org|date\.nager\.at)\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'atmosfer-api-cache',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 // 1 day
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                 urlPattern: /^https:\/\/apod\.nasa\.gov\/.*/i,
                 handler: 'CacheFirst',
                 options: {
                   cacheName: 'nasa-image-cache',
                   expiration: {
                     maxEntries: 10,
                     maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                   },
                   cacheableResponse: {
                     statuses: [0, 200]
                   }
                 }
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        css: true,
      },
      build: {
        target: 'ES2020',
        minify: 'esbuild',
        rollupOptions: {
          output: {
            entryFileNames: 'js/[name].[hash].js',
            chunkFileNames: 'js/[name].[hash].js',
            assetFileNames: 'assets/[name].[hash][extname]'
          },
        },
        sourcemap: mode === 'development',
        reportCompressedSize: true,
      },
      preview: {
        port: 4173,
        strictPort: false,
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'lucide-react'],
        exclude: ['node_modules/.vite'],
      }
    };
});
