import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Check if we're building for GitHub Pages
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isGitHubPages ? '/fun-routes/' : '/',
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
