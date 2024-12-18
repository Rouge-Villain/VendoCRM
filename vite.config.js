import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import errorModal from '@replit/vite-plugin-runtime-error-modal';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx']
        ]
      }
    }),
    errorModal(),
  ],
  root: 'client',
  build: {
    outDir: '../dist/public',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'client/src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'chart.js',
      'react-chartjs-2'
    ],
    force: true
  }
});