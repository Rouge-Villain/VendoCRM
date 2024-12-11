import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import checker from "vite-plugin-checker";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: UserConfig = {
  plugins: [
    react({
      include: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
    }),
    runtimeErrorOverlay(),
    themePlugin(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@db': path.resolve(__dirname, 'client/src/types'),
      '@/components': path.resolve(__dirname, 'client/src/components'),
      '@/lib': path.resolve(__dirname, 'client/src/lib'),
      '@/hooks': path.resolve(__dirname, 'client/src/hooks'),
      '@/styles': path.resolve(__dirname, 'client/src/styles')
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3001,
    host: true,
    strictPort: true,
  }
};

export default defineConfig(config);
