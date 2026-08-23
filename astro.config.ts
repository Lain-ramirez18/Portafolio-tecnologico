import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import AstroPWA from '@vite-pwa/astro';
import JavaScriptObfuscator from 'javascript-obfuscator';
import type { Plugin } from 'vite';

/**
 * Obfuscates emitted JS chunks in production builds only.
 * Ported unchanged from the previous vite.config.ts.
 */
function obfuscatePlugin(): Plugin {
  return {
    name: 'obfuscate-bundle',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      if (process.env.SKIP_OBFUSCATION === '1') return;
      for (const file of Object.values(bundle)) {
        if (file.type === 'chunk' && file.fileName.endsWith('.js')) {
          const result = JavaScriptObfuscator.obfuscate(file.code, {
            compact: true,
            /* controlFlowFlattening + deadCodeInjection were the dominant size cost — together they
             * inflated one chunk from 184KB to 1.44MB (verified via SKIP_OBFUSCATION=1 comparison).
             * Dropped for load speed; splitStrings/stringArray/selfDefending/hexadecimal identifiers
             * still make the output meaningfully harder to read than plain minification. */
            controlFlowFlattening: false,
            deadCodeInjection: false,
            debugProtection: false,
            disableConsoleOutput: true,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            numbersToExpressions: true,
            renameGlobals: false,
            selfDefending: true,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 10,
            stringArray: true,
            stringArrayCallsTransform: true,
            stringArrayCallsTransformThreshold: 0.5,
            stringArrayEncoding: ['base64'],
            stringArrayIndexShift: true,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayWrappersCount: 1,
            stringArrayWrappersChainedCalls: true,
            stringArrayWrappersParametersMaxCount: 2,
            stringArrayWrappersType: 'variable',
            stringArrayThreshold: 0.75,
            unicodeEscapeSequence: false,
          });
          file.code = result.getObfuscatedCode();
        }
      }
    },
  };
}

export default defineConfig({
  output: 'static',
  integrations: [
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,svg,png,webp,avif,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'lsrr-pages',
              networkTimeoutSeconds: 4,
            },
          },
          {
            urlPattern: ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'lsrr-assets' },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'lsrr-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifest: false, // manifest.json is hand-authored in public/
      includeAssets: ['assets/img/*.svg', 'assets/img/favicon-*.png'],
    }),
  ],
  vite: {
    plugins: [obfuscatePlugin()],
    build: {
      target: 'es2022',
      sourcemap: false,
    },
  },
});
