const utils = require('../utils');

class ValidationMiddleware {
  
  // User Registration Validation
  static validateUserRegistration(req, res, next) {
    const { fullname, email, password } = req.body;
    const errors = [];

    // Fullname validation
    if (!fullname || fullname.trim().length === 0) {
      errors.push('Full name is required');
    } else if (fullname.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long');
    } else if (fullname.trim().length > 100) {
      errors.push('Full name must be less than 100 characters');
    }

    // Email validation
    if (!email || email.trim().length === 0) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push('Please provide a valid email address');
      }
    }

    // Password validation
    if (!password || password.length === 0) {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    } else if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    if (errors.length > 0) {
      return res.status(400).json(utils.errorMessage(errors.join(', ')));
    }

    // Sanitize inputs
    req.body.fullname = fullname.trim();
    req.body.email = email.trim().toLowerCase();
    
    next();
  }

  // User Login Validation
  static validateUserLogin(req, res, next) {
    const { email, password } = req.body;
    const errors = [];

    if (!email || email.trim().length === 0) {
      errors.push('Email is required');
    }

    if (!password || password.length === 0) {
      errors.push('Password is required');
    }

    if (errors.length > 0) {
      return res.status(400).json(utils.errorMessage(errors.join(', ')));
    }

    req.body.email = email.trim().toLowerCase();
    next();
  }

  // Post Creation Validation
  static validatePostCreation(req, res, next) {
    const { title, content, category } = req.body;
    const errors = [];

    // Title validation
    if (!title || title.trim().length === 0) {
      errors.push('Title is required');
    } else if (title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    } else if (title.trim().length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    // Content validation
    if (!content || content.trim().length === 0) {
      errors.push('Content is required');
    } else if (content.trim().length < 10) {
      errors.push('Content must be at least 10 characters long');
    }

    // Category validation
    if (!category || category.trim().length === 0) {
      errors.push('Category is required');
    } else if (category.trim().length > 50) {
      errors.push('Category must be less than 50 characters');
    }

    if (errors.length > 0) {
      return res.status(400).json(utils.errorMessage(errors.join(', ')));
    }

    // Sanitize inputs
    req.body.title = title.trim();
    req.body.content = content.trim();
    req.body.category = category.trim();
    
    next();
  }

  // Comment Validation
  static validateComment(req, res, next) {
    const { content } = req.body;
    const errors = [];

    if (!content || content.trim().length === 0) {
      errors.push('Comment content is required');
    } else if (content.trim().length < 1) {
      errors.push('Comment must be at least 1 character long');
    } else if (content.trim().length > 1000) {
      errors.push('Comment must be less than 1000 characters');
    }

    if (errors.length > 0) {
      return res.status(400).json(utils.errorMessage(errors.join(', ')));
    }

    req.body.content = content.trim();
    next();
  }

  // Email Validation
  static validateEmail(req, res, next) {
    const { email } = req.body;
    const errors = [];

    if (!email || email.trim().length === 0) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push('Please provide a valid email address');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json(utils.errorMessage(errors.join(', ')));
    }

    req.body.email = email.trim().toLowerCase();
    next();
  }

  // ID Parameter Validation
  static validateId(paramName = 'id') {
    return (req, res, next) => {
      const id = req.params[paramName];
      
      if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        return res.status(400).json(utils.errorMessage(`Invalid ${paramName}. Must be a positive number.`));
      }

      req.params[paramName] = parseInt(id);
      next();
    };
  }

  // Category Parameter Validation
  static validateCategory(req, res, next) {
    const { category } = req.params;
    
    if (!category || category.trim().length === 0) {
      return res.status(400).json(utils.errorMessage('Category is required'));
    }

    if (category.trim().length > 50) {
      return res.status(400).json(utils.errorMessage('Category must be less than 50 characters'));
    }

    req.params.category = category.trim();
    next();
  }
}

module.exports = ValidationMiddleware;
