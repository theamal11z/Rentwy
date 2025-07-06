const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // Supabase/PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique constraint violation
        error = {
          status: 409,
          message: 'Resource already exists',
          details: err.detail || 'Duplicate entry'
        };
        break;
      case '23503': // Foreign key constraint violation
        error = {
          status: 400,
          message: 'Invalid reference',
          details: 'Referenced resource does not exist'
        };
        break;
      case '23502': // Not null constraint violation
        error = {
          status: 400,
          message: 'Missing required field',
          details: err.detail || 'Required field cannot be null'
        };
        break;
      case '42P01': // Undefined table
        error = {
          status: 500,
          message: 'Database configuration error',
          details: 'Table does not exist'
        };
        break;
      case 'PGRST116': // No data found
        error = {
          status: 404,
          message: 'Resource not found',
          details: 'The requested resource does not exist'
        };
        break;
      default:
        error = {
          status: 500,
          message: 'Database error',
          details: err.message
        };
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      status: 401,
      message: 'Invalid token',
      details: 'Authentication token is malformed'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      status: 401,
      message: 'Token expired',
      details: 'Authentication token has expired'
    };
  }

  // Validation errors (Joi)
  if (err.name === 'ValidationError' || err.isJoi) {
    error = {
      status: 400,
      message: 'Validation error',
      details: err.details ? err.details.map(detail => detail.message) : err.message
    };
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      status: 400,
      message: 'File too large',
      details: `File size exceeds the limit of ${process.env.MAX_FILE_SIZE || '10MB'}`
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      status: 400,
      message: 'Too many files',
      details: 'File count exceeds the allowed limit'
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      status: 400,
      message: 'Unexpected file field',
      details: 'File uploaded to unexpected field'
    };
  }

  // Cast errors (invalid ObjectId format)
  if (err.name === 'CastError') {
    error = {
      status: 400,
      message: 'Invalid ID format',
      details: 'The provided ID is not in valid format'
    };
  }

  // Express-validator errors
  if (err.array && typeof err.array === 'function') {
    error = {
      status: 400,
      message: 'Validation error',
      details: err.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    };
  }

  // Network/timeout errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    error = {
      status: 503,
      message: 'Service unavailable',
      details: 'Unable to connect to external service'
    };
  }

  // Development vs Production error responses
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const response = {
    error: error.message,
    status: error.status,
    ...(error.details && { details: error.details }),
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Log errors for monitoring
  if (error.status >= 500) {
    console.error('Server Error:', {
      error: err,
      request: {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
        user: req.user?.id || 'anonymous'
      }
    });
  }

  res.status(error.status).json(response);
};

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.status = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400);
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  asyncHandler
};
