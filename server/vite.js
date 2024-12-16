import express from "express";
import fs from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import viteConfig from "../vite.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function setupVite(app, server) {
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = resolve(
        __dirname,
        "..",
        "client",
        "index.html"
      );

      const template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

export function serveStaticFiles(app) {
  const distPath = resolve(__dirname, "../dist/public");

  if (!fs.existsSync(distPath)) {
    console.warn(`Build directory not found: ${distPath}. Please build the client first.`);
  }

  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(resolve(distPath, "index.html"));
  });
}
