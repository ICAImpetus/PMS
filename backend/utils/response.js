/**
 * Standardized API response utilities
 */

/**
 * Success response
 */
export const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    statusCode
  };
};

/**
 * Error response
 */
export const errorResponse = (message = 'Error occurred', statusCode = 500, error = null) => {
  return {
    success: false,
    message,
    statusCode,
    ...(error && { error: error.message || error })
  };
};

/**
 * Validation error response
 */
export const validationErrorResponse = (errors) => {
  return {
    success: false,
    message: 'Validation failed',
    statusCode: 400,
    errors
  };
};

/**
 * Not found response
 */
export const notFoundResponse = (resource = 'Resource') => {
  return {
    success: false,
    message: `${resource} not found`,
    statusCode: 404
  };
};
