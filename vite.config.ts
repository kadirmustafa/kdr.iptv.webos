import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // webOS 4.x (Chromium 53) has no ES modules / modern syntax: ship a nomodule ES5 bundle with polyfills.
    // The modern bundle is lowered to Chromium 64 (webOS 5) by the plugin.
    legacy({
      targets: ['chrome >= 53'],
      renderLegacyChunks: true
    })
  ],

  base: './', // webOS requires relative asset paths
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true // Allow localtunnel and any external tunnel hosts
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})


