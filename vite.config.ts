import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        target: 'ES2020',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            pure_funcs: ['console.log', 'console.info'],
          },
        },
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
