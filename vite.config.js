import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// import.meta.url is a file URL. dirname needs a normal path.
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3001',
      '/products': 'http://localhost:3001',
      '/orders': {
        target: 'http://localhost:3001',
        // /orders/success is the React page. API calls such as /orders/:id still go to Nest.
        bypass(req) {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html'
          }
        },
      },
      '/reservations': {
        target: 'http://localhost:3001',
        // The page /reservations is the React route. Only API calls go to Nest.
        bypass(req) {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html'
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      // Lets files import "@/components/..." instead of a long relative path.
      '@': path.resolve(__dirname, './src'),
    },
  },
})

