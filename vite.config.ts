import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
    },
    define: {
      // Ensure it's always a string, falling back to empty string if undefined
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  }
})
