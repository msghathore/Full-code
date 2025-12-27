import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    headers: {
      // CSP headers to allow Facebook Pixel, Clerk, and other third-party scripts
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://www.facebook.com https://cdn.jsdelivr.net https://*.clerk.accounts.dev",
        "connect-src 'self' https://www.facebook.com https://*.supabase.co https://*.square.site https://api.square.com wss://*.supabase.co https://*.clerk.accounts.dev",
        "img-src 'self' data: https: blob:",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "frame-src 'self' https://www.facebook.com https://web.facebook.com https://js.squareup.com https://sandbox.web.squareup.com https://*.clerk.accounts.dev",
        "worker-src 'self' blob:"
      ].join('; ')
    }
  },
})