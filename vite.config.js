import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Serve assets from root
  build: {
    outDir: 'dist', // Output to wedlyClient/dist
    sourcemap: false // Disable sourcemaps for production
  }
});