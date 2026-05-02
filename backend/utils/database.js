import mongoose from 'mongoose';

/**
 * Database utility functions for Mongoose
 */

/**
 * Check if a value is a valid ObjectId
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Convert string to ObjectId if valid
 */
export const toObjectId = (id) => {
  if (typeof id === 'string' && isValidObjectId(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
};

/**
 * Generate a unique ID (for custom ID fields)
 */
export const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Standardized response format
 */
export const createResponse = (success, data = null, message = '', error = null) => {
  return {
    success,
    message,
    data,
    ...(error && { error: error.message || error })
  };
};

/**
 * Pagination helper
 */
export const getPaginationParams = (page = 1, limit = 10) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  
  return {
    page: pageNum,
    limit: limitNum,
    skip
  };
};

/**
 * Build pagination response
 */
export const buildPaginationResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    }
  };
};
