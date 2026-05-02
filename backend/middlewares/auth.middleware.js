/**
 * ========================================
 * AUTHENTICATION MIDDLEWARE
 * ========================================
 * 
 * BEGINNER'S GUIDE:
 * ----------------
 * This middleware runs BEFORE controller functions.
 * It checks if the user is authenticated and authorized.
 * 
 * How it works:
 * 1. User sends request with JWT token in header
 * 2. Middleware verifies token is valid
 * 3. Fetches full user data from database
 * 4. Attaches user to req.user for use in controllers
 * 5. Checks if user has required role/permissions
 * 
 * SECURITY FEATURES:
 * -----------------
 * - JWT verification prevents token tampering
 * - Fetches fresh user data (handles deleted/suspended users)
 * - Role-based authorization
 */

import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { errorResponse } from '../utils/response.js';
import AdminAndAgentModel from '../models/AdminAgentModel.js';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 * 
 * How to use:
 * router.get('/protected', authenticate, controller);
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    // Expected format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response = errorResponse('No token provided. Please login.', 401);
      return res.status(response.statusCode).json(response);
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.replace('Bearer ', '');

    // Verify token is valid and not expired
    const decoded = jwt.verify(token, env.jwtSecret || 'your-secret-key');

    // Fetch FULL user object from database
    // This ensures we have latest user data (in case of updates/deletion)
    const user = await AdminAndAgentModel.findOne({
      _id: decoded.id,
      isDeleted: false  // Don't allow deleted users
    }).select('-password'); // Exclude password from user object

    if (!user) {
      const response = errorResponse('User not found or has been deleted', 401);
      return res.status(response.statusCode).json(response);
    }

    // Attach full user object to request
    // Controllers can now access req.user for:
    // - User ID (req.user._id)
    // - User role (req.user.type)
    // - Hospital assignments (req.user.hospitalNames)
    // - etc.
    req.user = user;

    next();
  } catch (error) {
    let message = 'Invalid or expired token';

    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired. Please login again.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token. Please login again.';
    }

    const response = errorResponse(message, 401, error);
    res.status(response.statusCode).json(response);
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if user has one of the allowed roles
 * 
 * How to use:
 * router.post('/admin', authenticate, authorize('superAdmin', 'admin'), controller);
 * 
 * @param {...string} allowedRoles - List of allowed user types
 * @returns {Function} - Middleware function
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated first
    if (!req.user) {
      const response = errorResponse('User not authenticated', 401);
      return res.status(response.statusCode).json(response);
    }

    // Get user's role/type
    const userRole = req.user.type;

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(userRole)) {
      const response = errorResponse(
        `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}`,
        403
      );
      return res.status(response.statusCode).json(response);
    }

    // User has required role, proceed
    next();
  };
};

/**
 * Optional Authentication Middleware
 * Attaches user if token exists, but doesn't require it
 * Useful for routes that work differently for logged-in vs guest users
 * 
 * How to use:
 * router.get('/public', optionalAuth, controller);
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, but that's okay
      req.user = null;
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, env.jwtSecret || 'your-secret-key');

    const user = await AdminAndAgentModel.findOne({
      _id: decoded.id,
      isDeleted: false
    }).select('-password');

    req.user = user; // Attach user if found, otherwise null
    next();
  } catch (error) {
    // If token is invalid, just set user to null
    req.user = null;
    next();
  }
};

export default {
  authenticate,
  authorize,
  optionalAuth
};
