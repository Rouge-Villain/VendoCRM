import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import errorModal from '@replit/vite-plugin-runtime-error-modal';

const __dirname = dirname(fileURLToPath(import.meta.url));
const postcssConfigPath = resolve(__dirname, 'client/postcss.config.cjs');

export default defineConfig({
  plugins: [
    react({
      include: "**/*.{js,jsx}",
      babel: {
        plugins: [
          ["@babel/plugin-transform-react-jsx"]
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
    },
    extensions: ['.js', '.jsx', '.json']
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
  css: {
    postcss: {
      config: postcssConfigPath
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
  },
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  }
});
