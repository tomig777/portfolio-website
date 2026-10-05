import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import externalRapierWasm from './scripts/build/externalRapierWasm.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [externalRapierWasm(), react()],
  base: '/', // Using custom domain, so base is root
  assetsInclude: ['**/*.glb'],
  optimizeDeps: {
    exclude: ['@react-three/rapier']
  }
})
