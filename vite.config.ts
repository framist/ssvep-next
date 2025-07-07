import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    define: {
      'process.env.APP_VERSION': JSON.stringify(packageJson.version),
    },
    plugins: [react()],
    base: command === 'build' ? '/ssvep-next/' : '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@mui/material', '@mui/icons-material'],
            dnd: ['@dnd-kit/core', '@dnd-kit/modifiers'],
          },
        },
      },
    },
  }
})
