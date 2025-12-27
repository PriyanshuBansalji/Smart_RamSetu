/**
 * Centralized error handling for RamSetu Health Bridge
 */

// Custom error class for API errors
export class APIError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Specific error types
export class ValidationError extends APIError {
  constructor(message, details = null) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends APIError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends APIError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends APIError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends APIError {
  constructor(message = 'Too many requests') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends APIError {
  constructor(message = 'External service error', statusCode = 502) {
    super(message, statusCode);
    this.name = 'ExternalServiceError';
  }
}

/**
 * Global error handler middleware
 * Should be added as the last middleware in Express app
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode || 500,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    body: req.body,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const details = Object.keys(err.errors).map(key => ({
      field: key,
      message: err.errors[key].message,
    }));
    return res.status(400).json({
      error: 'Validation failed',
      statusCode: 400,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Mongoose cast errors
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
  }

  // Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      error: `${field} already exists`,
      statusCode: 409,
      timestamp: new Date().toISOString(),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid or expired token',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
  }

  // Custom API errors
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
      details: err.details,
      timestamp: err.timestamp,
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    statusCode: err.statusCode || 500,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Retry logic for operations that may fail transiently
 */
export const retryAsync = async (
  fn,
  maxRetries = 3,
  delayMs = 1000,
  backoff = 1.5
) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < maxRetries - 1) {
        const delay = delayMs * Math.pow(backoff, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

/**
 * Logger utility for consistent logging
 */
export const logger = {
  info: (message, data = {}) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data);
  },
  warn: (message, data = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data);
  },
  error: (message, error = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
  },
  debug: (message, data = {}) => {
    if (process.env.DEBUG === 'true') {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, data);
    }
  },
};

export default {
  APIError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  errorHandler,
  asyncHandler,
  retryAsync,
  logger,
};
