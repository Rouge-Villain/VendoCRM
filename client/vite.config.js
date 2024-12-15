import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import errorModal from '@replit/vite-plugin-runtime-error-modal';

export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,js}",
    }),
    errorModal()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@db': path.resolve(__dirname, './src/types')
    },
    extensions: ['.js', '.jsx', '.json']
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
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
