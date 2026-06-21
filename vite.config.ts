import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // VITE_BASE_PATH is injected by actions/configure-pages in CI; locally it falls back to '/'
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
})