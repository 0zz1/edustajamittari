import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:5000' }
  },
  define: {
    // Bake API URL at build time from env var (Railway injects this)
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || '')
  }
})
