import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages sirve el sitio bajo /<repo>/; en CloudFront va en la raíz.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
