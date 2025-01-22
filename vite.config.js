import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Check if we're building for GitHub Pages
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/fun-routes/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  define: {
    'process.env': process.env,
    'process.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.VITE_GOOGLE_MAPS_API_KEY)
  },
  server: {
    port: 5174,
    open: true,
    strictPort: false
  }
})
