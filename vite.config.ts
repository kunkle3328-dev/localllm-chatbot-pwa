import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  // Load BOTH VITE_* and non-prefixed keys (for compatibility with your existing .env.local)
  const env = loadEnv(mode, '.', '');

  const geminiKey =
    env.VITE_GEMINI_API_KEY ||
    env.GEMINI_API_KEY ||
    env.API_KEY ||
    '';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),

      // Single-file-ish output: inlines JS/CSS into index.html.
      // NOTE: PWA still needs a service worker file, manifest, and icons, so it cannot be a *true* single file.
      viteSingleFile(),

      // PWA: lets you "Install" and run offline after first load.
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
        manifest: {
          name: 'Local LLM Chatbot',
          short_name: 'LocalLLM',
          description: 'On-device/offline WebLLM chatbot',
          start_url: '/',
          display: 'standalone',
          background_color: '#0b0f14',
          theme_color: '#0b0f14',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
        workbox: {
          // Cache the app shell + build output
          globPatterns: ['**/*.{html,js,css,ico,png,svg,webmanifest}'],

          // Cache WebLLM model artifacts at runtime (so after first download, it works offline).
          runtimeCaching: [
            {
              // MLC model artifacts are fetched from their CDN.
              urlPattern: /^https:\/\/.*\bmlc\.ai\b\/.*$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'webllm-models',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Also cache Hugging Face artifacts if you later point WebLLM there.
              urlPattern: /^https:\/\/huggingface\.co\/.*$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'hf-models',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    define: {
      // keep backward compatibility with any code that reads process.env.*
      'process.env.API_KEY': JSON.stringify(geminiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Helps mobile memory + produces smaller chunks (but singlefile will inline them)
      target: 'es2020',
      sourcemap: false,
    },
  };
});
