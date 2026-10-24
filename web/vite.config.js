import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// У режимі розробки (npm run dev) запити /api і /ws йдуть на Python-ядро
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8765',
      '/ws': { target: 'ws://127.0.0.1:8765', ws: true },
    },
  },
})
