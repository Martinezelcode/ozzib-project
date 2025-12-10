import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import "./eventScheduler"; // Start event lifecycle management
import { addAuthTestRoutes } from "./authTest";
import { createTelegramBot } from "./telegramBot";
import { NotificationAlgorithmService } from "./notificationAlgorithm";
import { seedAdmin } from "./seedAdmin";
import cors from 'cors';

const app = express();

// Raw body parsing for webhooks, JSON parsing for everything else
app.use('/api/webhook/paystack', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Add middleware to handle external resource loading
app.use((req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

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

(async () => {
  // Initialize Telegram bot
  const telegramBot = createTelegramBot();
  if (telegramBot) {
    console.log('🔧 Testing Telegram bot configuration...');
    const connectionTest = await telegramBot.testConnection();

    if (connectionTest.botInfo) {
      console.log(`✅ Bot token valid: @${connectionTest.botInfo.username}`);
      
      // Start polling for messages (works without external webhook access)
      telegramBot.startPolling();
      
      if (connectionTest.channelInfo) {
        console.log(`✅ Channel connected: ${connectionTest.channelInfo.title || connectionTest.channelInfo.first_name}`);
      } else {
        console.log('⚠️ Channel not configured (broadcasting disabled, but /start will work)');
      }
    } else {
      console.log('❌ Telegram bot token invalid:');
      console.log(`   ${connectionTest.error}`);
    }
  }

  const server = await registerRoutes(app);
  addAuthTestRoutes(app);

  // Initialize notification algorithm service
  const { storage } = await import('./storage');

  // Seed admin users
  try {
    await seedAdmin();
    console.log("👑 Admin users seeded successfully");
  } catch (error) {
    console.error("❌ Failed to seed admin users:", error);
  }
  const notificationAlgorithm = new NotificationAlgorithmService(storage);
  console.log('🔔 Starting notification algorithm service...');
  notificationAlgorithm.startNotificationScheduler();
  console.log('✅ Notification algorithm service started');

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();