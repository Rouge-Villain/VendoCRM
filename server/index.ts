import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import { setupWebSocket, startActivityMonitoring } from "./websocket";

function log(message: string, type: 'info' | 'error' | 'debug' = 'info') {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const prefix = `${formattedTime} [express]`;
  switch (type) {
    case 'error':
      console.error(`${prefix} ERROR: ${message}`);
      break;
    case 'debug':
      console.debug(`${prefix} DEBUG: ${message}`);
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}

// Initialize Express app with error handling
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  log(err.message, 'error');
  log(err.stack || 'No stack trace available', 'debug');
  res.status(500).json({ error: 'Internal Server Error' });
});

(async () => {
  try {
    // Register routes first
    log('Registering routes...', 'debug');
    registerRoutes(app);

    // Create HTTP server
    log('Creating HTTP server...', 'debug');
    const server = createServer(app);

    // Setup WebSocket and monitoring
    log('Setting up WebSocket server...', 'debug');
    setupWebSocket(server);
    log('Starting activity monitoring...', 'debug');
    startActivityMonitoring();

    // Setup development or production mode
    if (process.env['NODE_ENV'] === 'development') {
      log('Setting up Vite development server...', 'debug');
      await setupVite(app, server);
    } else {
      log('Setting up static file serving...', 'debug');
      serveStatic(app);
    }

    // Start the server
    const PORT = Number(process.env['PORT']) || 3001;
    let currentPort = PORT;
    const MAX_RETRIES = 10;

    const startServer = async () => {
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          await new Promise<void>((resolve, reject) => {
            server.listen(currentPort, "0.0.0.0", () => resolve());
            server.once('error', (error: NodeJS.ErrnoException) => {
              if (error.code === 'EADDRINUSE') {
                log(`Port ${currentPort} is in use, trying next port...`, 'debug');
                currentPort++;
                reject(error);
              } else {
                reject(error);
              }
            });
          });
          
          // If we get here, the server started successfully
          process.env['PORT'] = String(currentPort);
          log(`Server started successfully on port ${currentPort}`, 'info');
          return true;
        } catch (error) {
          if (attempt === MAX_RETRIES - 1) {
            throw new Error(`Failed to start server after ${MAX_RETRIES} attempts`);
          }
          // Continue to next attempt
          continue;
        }
      }
      return false;
    };

    const success = await startServer();
    if (!success) {
      throw new Error('Failed to start server');
    }

  } catch (error) {
    log(`Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    if (error instanceof Error && error.stack) {
      log(error.stack, 'debug');
    }
    process.exit(1);
  }
})();