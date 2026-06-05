import { defineConfig } from 'electron-vite'
import { resolve } from 'path'
import { config } from 'dotenv'
import react from '@vitejs/plugin-react'

// Load .env so GOOGLE_CLIENT_ID/SECRET are in process.env at build time
// In CI, these come from GitHub Secrets instead
config()

export default defineConfig({
  main: {
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
