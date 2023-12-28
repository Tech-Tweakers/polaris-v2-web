import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Pages from 'vite-plugin-pages';
import { VitePWA } from "vite-plugin-pwa";
// import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': '/src/',
    },
  },
  build: {
    outDir: './ui-siap'
  },
  plugins: [
    vue(),
    Pages({
      pagesDir: 'src/pages',
      extensions: ['vue'],
      exclude: ["**/components/*.vue"],
    }),
    VitePWA({
      // mode: "development",
      base: "./",
      srcDir: "src",
      filename: "sw.ts",
      includeAssets: ["icons/icon512.png"],
      strategies: "injectManifest",
      registerType: 'autoUpdate',
      manifest: {
        name: "Siap",
        lang: "pt-br",
        short_name: "Siap",
        display: "standalone",
        background_color: "#c3cfe2",
        "theme_color": "#c3cfe2",
        "orientation": "portrait",
        "categories": ["Office"],
        "screenshots": [
          {
            "src": "screen.jpg",
            "sizes": "1104x1104",
            "type": "image/jpg"
          }
        ],
        icons: [
          {
            src: "icons/icon256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "icons/icon256.png",
            sizes: "256x256",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/icon512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ]
});
