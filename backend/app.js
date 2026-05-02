/**
 * ========================================
 * APPLICATION SETUP
 * ========================================
 *
 * This file configures the Express application with all middleware and routes.
 *
 * SECURITY FEATURES:
 * -----------------
 * - Helmet for secure HTTP headers
 * - Rate limiting to prevent brute force
 * - MongoDB injection protection
 * - Input sanitization
 * - XSS protection
 */

import path from "path";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import apiAuthRoutes from "./routes/auth.routes.js";
import apiFormRoutes from "./routes/form.routes.js";
import apiHospitalRoutes from "./routes/hospital.routes.js";
import apiUserRoutes from "./routes/user.routes.js";
import errorHandler from "./middlewares/errorHandler.js";

// Security middleware
import {
  loginRateLimiter,
  mongoSanitization,
  sanitizeInput,
} from "./middlewares/security.middleware.js";
import requestLogger from "./middlewares/apiLogger.middleware.js";

const app = express();

app.set("trust proxy", true);
// ===== SECURITY MIDDLEWARE (Applied First) =====
// 1. Secure HTTP Headers
// app.use(securityHeaders);

// 2. MongoDB Injection Protection
app.use(mongoSanitization);

// ===== PARSERS =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Input Sanitization (after parsing)
app.use(sanitizeInput);
app.use(requestLogger)

// CORS configuration
app.use(
  cors({
    origin: true, // Allow any origin (simplifies dev/prod)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cache-Control",
      "Pragma",
      "Expires",
    ],
  }),
);

// Handle preflight requests
app.options("*", cors());

// ===== API ROUTES WITH RATE LIMITING =====

// Apply general rate limiting to all API routes
// app.use("/api", apiRateLimiter);

// Strict rate limiting for login endpoints
app.use("/api/login", loginRateLimiter);
app.use("/api/auth/login", loginRateLimiter);

// Unified API routes (MVC structure - all under /api)
app.use("/api", apiAuthRoutes);
app.use("/api", apiFormRoutes);
app.use("/api", apiHospitalRoutes);
app.use("/api", apiUserRoutes);

// Health check and future REST-style routes (optional)
// app.use("/api", apiRoutes);

// Serve static files from frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");

app.use(express.static(frontendDistPath));

// Catch-all route for SPA
app.get("*", (req, res, next) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

// Error handling middleware
app.use(errorHandler.notFound);
app.use(errorHandler.general);

export default app;
