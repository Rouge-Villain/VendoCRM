import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import checker from "vite-plugin-checker";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react({
      include: /\.(jsx|tsx?)$/,
    }),
    checker({
      typescript: true,
      overlay: false,
    }),
    runtimeErrorOverlay(),
    themePlugin(),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'client/src') },
      { find: '@db', replacement: path.resolve(__dirname, 'db') },
    ],
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
