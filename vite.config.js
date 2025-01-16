import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  define: {
    'process.env': process.env
  },
  server: {
    port: 5174,
    open: true,
    strictPort: false
  }
})
