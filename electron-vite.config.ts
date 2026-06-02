import { defineConfig } from 'electron-vite'
import { resolve } from 'path'
import { existsSync } from 'fs'
import react from '@vitejs/plugin-react'

// Use local avatarConfig.ts if it exists, otherwise fall back to default
const avatarConfigPath = existsSync(resolve(__dirname, 'src/renderer/sprites/avatarConfig.ts'))
  ? resolve(__dirname, 'src/renderer/sprites/avatarConfig.ts')
  : resolve(__dirname, 'src/renderer/sprites/avatarConfig.default.ts')

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
    })],
    resolve: {
      alias: {
        './avatarConfig': avatarConfigPath,
      }
    }
  }
})
