import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'image/simpati2.jpg'],
      manifest: {
        name: 'Sistem Arsip Surat',
        short_name: 'ArsipSurat',
        description: 'Aplikasi Manajemen Arsip Surat',
        theme_color: '#101828',
        background_color: '#101828',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/image/simpati2.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any'
          },
          {
            src: '/image/simpati2.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any'
          },
          {
            src: '/image/simpati2.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
      }
    })
  ]
})