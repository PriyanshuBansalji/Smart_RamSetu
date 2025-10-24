import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 8080,
    proxy: {
      '/api': 'http://localhost:5000', // Change if your backend runs on a different port
    }
  }
});
