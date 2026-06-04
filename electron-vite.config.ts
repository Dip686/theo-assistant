import { defineConfig } from 'electron-vite'
import { resolve } from 'path'
import { config } from 'dotenv'
import react from '@vitejs/plugin-react'

// Load .env so credentials are available at build time
config()

export default defineConfig({
  main: {
    define: {
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(process.env.GOOGLE_CLIENT_ID || ''),
      'process.env.GOOGLE_CLIENT_SECRET': JSON.stringify(process.env.GOOGLE_CLIENT_SECRET || ''),
    },
    build: {
      outDir: 'out/main',
      lib: {
        entry: 'src/main/index.ts'
      }
    }
  },
  preload: {
    build: {
      outDir: 'out/preload',
      lib: {
        entry: resolve(__dirname, 'src/preload/index.ts')
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: resolve(__dirname, 'src/renderer/index.html')
      }
    },
    plugins: [react({
      jsxRuntime: 'automatic',
    })]
  }
})
