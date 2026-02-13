import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  
  // --- THE FIX IS HERE ---
  // Vite server-ke force kora hocche jate she port 3000 use kore
  server: {
    port: 3000,
  }
})