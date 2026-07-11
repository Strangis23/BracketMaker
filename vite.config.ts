import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set BASE_PATH=/YourRepoName/ when building for GitHub Pages project sites.
// GitHub Actions sets this automatically from the repository name.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
