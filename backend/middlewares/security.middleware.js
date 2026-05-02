/**
 * ========================================
 * SECURITY MIDDLEWARE
 * ========================================
 *
 * This file contains all security-related middleware to protect the application.
 *
 * BEGINNER'S GUIDE:
 * ----------------
 * Middleware = Functions that run BEFORE your main route handlers
 * They can:
 * - Check/modify requests
 * - Add security headers
 * - Block suspicious requests
 * - Rate limit to prevent abuse
 *
 * WHAT THIS FILE DOES:
 * -------------------
 * 1. Sets secure HTTP headers (helmet)
 * 2. Prevents too many requests (rate limiting)
 * 3. Protects against MongoDB injection (sanitization)
 * 4. NOTE: XSS protection is handled by other means since xss-clean is deprecated
 */

import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

/**
 * ========================================
 * 1. HELMET - SECURE HTTP HEADERS
 * ========================================
 *
 * What it does:
 * - Sets various HTTP headers to protect against common attacks
 * - Prevents clickjacking, MIME sniffing, XSS, etc.
 *
 * How it helps:
 * - Tells browsers to be more careful with your page
 * - Prevents your site from being embedded in iframes (clickjacking)
 * - Forces HTTPS connections
 */

export const securityHeaders = helmet({
  //  Disable CSP here (handled by Nginx)
  contentSecurityPolicy: false,

  // Prevent page from being embedded in iframe
  frameguard: { action: "deny" },

  // Hide "X-Powered-By: Express"
  hidePoweredBy: true,

  // These are fine
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});
/**
 * ========================================
 * 2. RATE LIMITING - PREVENT ABUSE
 * ========================================
 *
 * What it does:
 * - Limits how many requests one IP can make
 * - Prevents brute force attacks
 * - Protects against DoS (Denial of Service)
 *
 * Example:
 * - User makes 150 requests in 15 minutes → Blocked for 15 minutes
 */

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
    statusCode: 429,
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

/**
 * Strict rate limiter for login endpoint
 * Only 5 login attempts per 15 minutes
 * Helps prevent brute force password attacks
 */

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 WRONG attempts allowed
  message: {
    success: false,
    message: "Too many failed login attempts, please try again after 15 minutes.",
    statusCode: 429,
  },
  skipSuccessfulRequests: true, //
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for user creation
 * Only 10 user creations per hour
 * Prevents spam account creation
 */
export const createUserRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 user creations per hour
  message: {
    success: false,
    message:
      "Too many accounts created from this IP, please try again after an hour.",
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * ========================================
 * 3. MONGODB INJECTION PROTECTION
 * ========================================
 *
 * What it does:
 * - Removes/sanitizes $ and . characters from user input
 * - Prevents MongoDB operator injection attacks
 *
 * Example attack it prevents:
 * Instead of sending { username: "admin" }
 * Attacker sends { username: { $gt: "" } } to bypass authentication
 *
 * This middleware removes those dangerous operators
 */
export const mongoSanitization = mongoSanitize({
  replaceWith: "_", // Replace $ and . with underscore
  onSanitize: ({ req, key }) => {
    console.warn(`[SECURITY] Sanitized malicious input: ${key} from ${req.ip}`);
  },
});

/**
 * ========================================
 * 4. INPUT SANITIZATION HELPER
 * ========================================
 *
 * Additional manual sanitization for specific cases
 */

/**
 * Remove potentially dangerous HTML/script tags from string
 * Prevents XSS (Cross-Site Scripting) attacks
 *
 * @param {string} str - String to sanitize
 * @returns {string} - Safe string
 */
export const sanitizeString = (str) => {
  if (typeof str !== "string") return str;

  // Remove HTML tags
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
};

/**
 * Sanitize object by removing dangerous characters from all string values
 *
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string" ? sanitizeString(item) : item,
      );
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Middleware to sanitize request body
 * Apply this to routes that accept user input
 */
export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * ========================================
 * 5. IP BLOCKING (OPTIONAL)
 * ========================================
 *
 * Block specific IPs if they're causing problems
 * You can maintain a blacklist of malicious IPs
 */

const BLOCKED_IPS = new Set([
  // Add IPs to block here
  // Example: '123.456.789.0'
]);

export const ipBlocker = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;

  if (BLOCKED_IPS.has(clientIp)) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
      statusCode: 403,
    });
  }

  next();
};

/**
 * ========================================
 * EXPORT ALL MIDDLEWARE
 * ========================================
 */
export default {
  securityHeaders,
  apiRateLimiter,
  loginRateLimiter,
  createUserRateLimiter,
  mongoSanitization,
  sanitizeInput,
  sanitizeString,
  sanitizeObject,
  ipBlocker,
};
