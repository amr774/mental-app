import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to your backend when VITE_API_URL is set
    // proxy: {
    //   '/api': { target: 'http://localhost:8000', changeOrigin: true },
    // },
  },
});
