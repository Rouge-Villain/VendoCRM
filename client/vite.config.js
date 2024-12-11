import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@db': path.resolve(__dirname, './src/types'),
      '@db/schema': path.resolve(__dirname, './src/types/db'),
      '../../db/schema': path.resolve(__dirname, './src/types/db')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    hmr: { port: 3000 }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  esbuild: {
    loader: "tsx",
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
        '.tsx': 'tsx',
      },
    },
  },
});
