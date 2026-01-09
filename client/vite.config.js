import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './',  // ← Add this line
  
  optimizeDeps: {
    include: ['react-virtualized-auto-sizer'],
    esbuildOptions: {
      // Fix for react-virtualized-auto-sizer
      mainFields: ['module', 'main'],
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx']
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/react-virtualized-auto-sizer/, /node_modules/]
    }
  }
  
})