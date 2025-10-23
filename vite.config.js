import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Using custom domain, so base is root
  assetsInclude: ['**/*.glb'],
  optimizeDeps: {
    exclude: ['@react-three/rapier']
  }
})
