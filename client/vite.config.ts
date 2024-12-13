import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { checker } from 'vite-plugin-checker';
import path from 'path';
import errorModal from '@replit/vite-plugin-runtime-error-modal';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    errorModal(),
    checker({
      typescript: {
        tsconfigPath: './tsconfig.json',
        root: '.',
      },
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx,js,jsx}"',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@db': path.resolve(__dirname, './src/types')
    }
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
