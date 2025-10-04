import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   root: '.', // Default is project root; adjust if index.html is in src/
//   build: {
//     outDir: 'dist', // Output directory for build
//     emptyOutDir: true, // Clear the output directory before building
//   },
//   server: {
//     port: 5173, // Matches the port in server.js CORS config
//   },
// });