import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load Environment Variables (.env)
dotenv.config();

import authRoutes from "./src/backend/routes/authRoutes";
import leadRoutes from "./src/backend/routes/leadRoutes";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body Parsing Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Debug API request logging (Humble and clean)
  app.use((req, res, next) => {
    console.log(`[Express] ${req.method} ${req.path}`);
    next();
  });

  // Mount API REST Controllers
  app.use("/api/auth", authRoutes);
  app.use("/api/leads", leadRoutes);

  // Healthcheck Endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Serve static UI / Vite Bundles
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode with compiled static assets...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve Vite build assets
    app.use(express.static(distPath));
    
    // Single Page Application state recovery
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to 0.0.0.0 and PORT 3000 (Required for sandbox runtime)
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CRM Web Server actively bound on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical Web Server startup failure:", error);
});
