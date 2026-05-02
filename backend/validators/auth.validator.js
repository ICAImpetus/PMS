/**
 * ========================================
 * INPUT VALIDATORS
 * ========================================
 * 
 * This file contains validation rules for authentication requests.
 * 
 * BEGINNER'S GUIDE:
 * ----------------
 * Validators check if user input is valid BEFORE processing it.
 * 
 * Why validate?
 * - Prevent bad data from entering database
 * - Give users clear error messages
 * - Improve security
 * - Save processing time
 * 
 * How to use:
 * Add validator as middleware in routes:
 * router.post('/login', loginValidator, loginController);
 */

import { body, validationResult } from 'express-validator';
import { errorResponse } from '../utils/response.js';

/**
 * ========================================
 * LOGIN VALIDATION
 * ========================================
 */
export const loginValidator = [
  // Validate username
  body('username')
    .trim() // Remove whitespace
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
    .isLength({ max: 50 }).withMessage('Username cannot exceed 50 characters'),

  // Validate password
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

/**
 * ========================================
 * USER CREATION VALIDATION
 * ========================================
 */
export const createUserValidator = [
  // ID
  body('ID')
    .trim()
    .notEmpty().withMessage('User ID is required')
    .isLength({ min: 3, max: 50 }).withMessage('User ID must be 3-50 characters'),

  // Username
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9._-]+$/).withMessage('Username can only contain letters, numbers, dots, dashes, and underscores'),

  // Password
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  // Name
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

  // Email (optional but must be valid if provided)
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  // User type
  body('type')
    .notEmpty().withMessage('User type is required')
    .isIn(['superAdmin', 'admin', 'teamLeader', 'executive', 'supermanager', 'manager']).withMessage('Invalid user type')
];

/**
 * ========================================
 * USER UPDATE VALIDATION
 * ========================================
 */
export const updateUserValidator = [
  // Username (if provided)
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9._-]+$/).withMessage('Username can only contain letters, numbers, dots, dashes, and underscores'),

  // Password (if provided)
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  // Name (if provided)
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

  // Email (if provided)
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  // User type (if provided)
  body('type')
    .optional()
    .isIn(['superAdmin', 'admin', 'teamLeader', 'executive', 'supermanager', 'manager']).withMessage('Invalid user type')
];

/**
 * ========================================
 * PASSWORD CHANGE VALIDATION
 * ========================================
 */
export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your new password')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

/**
 * ========================================
 * VALIDATION RESULT HANDLER
 * ========================================
 * 
 * This middleware checks if validation passed
 * If not, returns errors to the client
 * 
 * Use this AFTER validators in route:
 * router.post('/login', loginValidator, handleValidationErrors, loginController);
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Extract error messages
    const errorMessages = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));

    const response = errorResponse(
      'Validation failed',
      400,
      { errors: errorMessages }
    );
    
    return res.status(400).json(response);
  }
  
  next();
};

/**
 * ========================================
 * EXPORT ALL VALIDATORS
 * ========================================
 */
export default {
  loginValidator,
  createUserValidator,
  updateUserValidator,
  changePasswordValidator,
  handleValidationErrors
};
