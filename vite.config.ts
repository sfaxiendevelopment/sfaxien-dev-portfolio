import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion') || id.includes('gsap')) return 'motion'
            if (id.includes('@tanstack')) return 'data'
            if (id.includes('@radix-ui') || id.includes('cmdk') || id.includes('sonner')) return 'ui'
            return 'vendor'
          }
        },
      },
    },
  },
  server: {
    port: 5173,
  },
})