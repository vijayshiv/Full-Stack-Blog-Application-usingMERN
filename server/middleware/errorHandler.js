const utils = require('../utils');

class ErrorHandler {
  
  // Database Error Handler
  static handleDatabaseError(error) {
    console.error('Database Error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('email')) {
        return 'Email already exists. Please use a different email address.';
      }
      return 'Duplicate entry found.';
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return 'Referenced item not found.';
    }
    
    if (error.code === 'ECONNREFUSED') {
      return 'Database connection failed. Please try again later.';
    }
    
    return 'Database operation failed. Please try again.';
  }

  // JWT Error Handler
  static handleJWTError(error) {
    console.error('JWT Error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return 'Invalid authentication token.';
    }
    
    if (error.name === 'TokenExpiredError') {
      return 'Authentication token has expired. Please login again.';
    }
    
    return 'Authentication failed.';
  }

  // File Upload Error Handler
  static handleMulterError(error) {
    console.error('File Upload Error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return 'File size too large. Maximum size allowed is 5MB.';
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return 'Too many files uploaded. Maximum 1 file allowed.';
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return 'Unexpected file field. Please check the field name.';
    }
    
    return 'File upload failed. Please try again.';
  }

  // Global Error Handler Middleware
  static globalErrorHandler(err, req, res, next) {
    console.error('Global Error Handler:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    let errorMessage = 'Internal Server Error';
    let statusCode = 500;

    // Handle different types of errors
    if (err.name === 'ValidationError') {
      errorMessage = err.message;
      statusCode = 400;
    } else if (err.code && err.code.startsWith('ER_')) {
      errorMessage = ErrorHandler.handleDatabaseError(err);
      statusCode = 400;
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      errorMessage = ErrorHandler.handleJWTError(err);
      statusCode = 401;
    } else if (err.code && err.code.startsWith('LIMIT_')) {
      errorMessage = ErrorHandler.handleMulterError(err);
      statusCode = 400;
    } else if (err.message) {
      errorMessage = err.message;
    }

    res.status(statusCode).json(utils.errorMessage(errorMessage));
  }

  // Async Error Wrapper
  static asyncErrorHandler(asyncFunction) {
    return (req, res, next) => {
      Promise.resolve(asyncFunction(req, res, next)).catch(next);
    };
  }

  // 404 Not Found Handler
  static notFoundHandler(req, res) {
    res.status(404).json(utils.errorMessage(`Route ${req.originalUrl} not found`));
  }
}

module.exports = ErrorHandler;
