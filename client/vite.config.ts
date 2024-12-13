import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { checker } from 'vite-plugin-checker';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@db': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});