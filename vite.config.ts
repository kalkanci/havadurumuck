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
          includeAssets: ['icon-192.png', 'icon-512.png'],
          manifest: {
            name: 'Atmosfer AI - Hava Durumu',
            short_name: 'Atmosfer',
            description: 'Sinematik, mobil öncelikli ve akıllı tavsiyeler sunan gerçek zamanlı hava durumu deneyimi.',
            start_url: '/',
            scope: '/',
            display: 'standalone',
            orientation: 'portrait-primary',
            background_color: '#020617',
            theme_color: '#020617',
            categories: ['weather', 'productivity'],
            icons: [
              {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ],
            shortcuts: [
              {
                name: 'Anlık Hava Durumu',
                short_name: 'Hava',
                description: 'Mevcut konumunuzun hava durumunu gösterin',
                url: '/?tab=today',
                icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
              },
              {
                name: '7 Günlük Tahmin',
                short_name: 'Tahmin',
                description: 'Haftalık hava durumu tahmini',
                url: '/?tab=forecast',
                icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
              }
            ],
            share_target: {
              action: '/share',
              method: 'POST',
              enctype: 'application/x-www-form-urlencoded',
              params: {
                title: 'title',
                text: 'text',
                url: 'url'
              }
            }
          },
          workbox: {
            cleanupOutdatedCaches: true,
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'nominatim-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'weather-api-cache',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 // 1 Hour
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/air-quality-api\.open-meteo\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'air-quality-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 // 1 Hour
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/date\.nager\.at\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'holiday-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 Year (Holidays rarely change)
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
