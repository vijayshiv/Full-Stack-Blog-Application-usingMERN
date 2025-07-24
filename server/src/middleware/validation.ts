import { Request, Response, NextFunction } from "express";
import { errorMessage } from "../utils";
import { ValidationError } from "../types";

export class ValidationMiddleware {
  /**
   * User Registration Validation
   */
  static validateUserRegistration(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { fullname, email, password } = req.body;
    const errors: string[] = [];

    // Fullname validation
    if (!fullname || fullname.trim().length === 0) {
      errors.push("Full name is required");
    } else if (fullname.trim().length < 2) {
      errors.push("Full name must be at least 2 characters long");
    } else if (fullname.trim().length > 100) {
      errors.push("Full name must be less than 100 characters");
    }

    // Email validation
    if (!email || email.trim().length === 0) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push("Please provide a valid email address");
      }
    }

    // Password validation
    if (!password || password.length === 0) {
      errors.push("Password is required");
    } else if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    } else if (password.length > 128) {
      errors.push("Password must be less than 128 characters");
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    // Sanitize inputs
    req.body.fullname = fullname.trim();
    req.body.email = email.trim().toLowerCase();

    next();
  }

  /**
   * User Login Validation
   */
  static validateUserLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { email, password } = req.body;
    const errors: string[] = [];

    // Email validation
    if (!email || email.trim().length === 0) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push("Please provide a valid email address");
      }
    }

    // Password validation
    if (!password || password.length === 0) {
      errors.push("Password is required");
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    // Sanitize inputs
    req.body.email = email.trim().toLowerCase();

    next();
  }

  /**
   * Post Creation Validation
   */
  static validatePostCreation(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { title, content, category } = req.body;
    const errors: string[] = [];

    // Title validation
    if (!title || title.trim().length === 0) {
      errors.push("Title is required");
    } else if (title.trim().length < 3) {
      errors.push("Title must be at least 3 characters long");
    } else if (title.trim().length > 255) {
      errors.push("Title must be less than 255 characters");
    }

    // Content validation
    if (!content || content.trim().length === 0) {
      errors.push("Content is required");
    } else if (content.trim().length < 10) {
      errors.push("Content must be at least 10 characters long");
    } else if (content.trim().length > 10000) {
      errors.push("Content must be less than 10,000 characters");
    }

    // Category validation
    if (!category || category.trim().length === 0) {
      errors.push("Category is required");
    } else if (category.trim().length > 50) {
      errors.push("Category must be less than 50 characters");
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    // Sanitize inputs
    req.body.title = title.trim();
    req.body.content = content.trim();
    req.body.category = category.trim();

    next();
  }

  /**
   * Post Update Validation
   */
  static validatePostUpdate(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { title, content, category } = req.body;
    const errors: string[] = [];

    // Only validate fields that are provided (partial update)
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        errors.push("Title cannot be empty");
      } else if (title.trim().length < 3) {
        errors.push("Title must be at least 3 characters long");
      } else if (title.trim().length > 255) {
        errors.push("Title must be less than 255 characters");
      }
      req.body.title = title.trim();
    }

    if (content !== undefined) {
      if (!content || content.trim().length === 0) {
        errors.push("Content cannot be empty");
      } else if (content.trim().length < 10) {
        errors.push("Content must be at least 10 characters long");
      } else if (content.trim().length > 10000) {
        errors.push("Content must be less than 10,000 characters");
      }
      req.body.content = content.trim();
    }

    if (category !== undefined) {
      if (!category || category.trim().length === 0) {
        errors.push("Category cannot be empty");
      } else if (category.trim().length > 50) {
        errors.push("Category must be less than 50 characters");
      }
      req.body.category = category.trim();
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    next();
  }

  /**
   * Comment Validation
   */
  static validateComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { content } = req.body;
    const errors: string[] = [];

    // Content validation
    if (!content || content.trim().length === 0) {
      errors.push("Comment content is required");
    } else if (content.trim().length < 1) {
      errors.push("Comment must be at least 1 character long");
    } else if (content.trim().length > 1000) {
      errors.push("Comment must be less than 1,000 characters");
    }

    // Check for potentially harmful content
    const forbiddenPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i];
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(content)) {
        errors.push("Comment contains forbidden content");
        break;
      }
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    // Sanitize input
    req.body.content = content.trim();

    next();
  }

  /**
   * Email Check Validation
   */
  static validateEmailCheck(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { email } = req.body;
    const errors: string[] = [];

    // Email validation
    if (!email || email.trim().length === 0) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push("Please provide a valid email address");
      }
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    // Sanitize input
    req.body.email = email.trim().toLowerCase();

    next();
  }

  /**
   * Password Reset Validation
   */
  static validatePasswordReset(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { token, password } = req.body;
    const errors: string[] = [];

    // Token validation
    if (!token || token.trim().length === 0) {
      errors.push("Reset token is required");
    }

    // Password validation
    if (!password || password.length === 0) {
      errors.push("New password is required");
    } else if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    } else if (password.length > 128) {
      errors.push("Password must be less than 128 characters");
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    next();
  }

  /**
   * User Update Validation
   */
  static validateUserUpdate(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { fullname, email, oldPassword, newPassword } = req.body;
    const errors: string[] = [];

    // Fullname validation (if provided)
    if (fullname !== undefined) {
      if (fullname.trim().length === 0) {
        errors.push("Full name cannot be empty");
      } else if (fullname.trim().length < 2) {
        errors.push("Full name must be at least 2 characters long");
      } else if (fullname.trim().length > 100) {
        errors.push("Full name must be less than 100 characters");
      }
      req.body.fullname = fullname.trim();
    }

    // Email validation (if provided)
    if (email !== undefined) {
      if (email.trim().length === 0) {
        errors.push("Email cannot be empty");
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          errors.push("Please provide a valid email address");
        }
      }
      req.body.email = email.trim().toLowerCase();
    }

    // Password validation (if changing password)
    if (newPassword !== undefined) {
      if (!oldPassword) {
        errors.push("Current password is required to set new password");
      }
      if (newPassword.length < 6) {
        errors.push("New password must be at least 6 characters long");
      } else if (newPassword.length > 128) {
        errors.push("New password must be less than 128 characters");
      }
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    next();
  }

  /**
   * ID Parameter Validation (for routes with :id)
   */
  static validateIdParam(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
      res.status(400).json(errorMessage("Invalid ID parameter"));
      return;
    }

    next();
  }

  /**
   * Pagination Query Validation
   */
  static validatePaginationQuery(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { page, limit } = req.query;
    const errors: string[] = [];

    if (page !== undefined) {
      const pageNum = parseInt(page as string);
      if (isNaN(pageNum) || pageNum < 1) {
        errors.push("Page must be a positive number");
      } else if (pageNum > 1000) {
        errors.push("Page number too large");
      }
    }

    if (limit !== undefined) {
      const limitNum = parseInt(limit as string);
      if (isNaN(limitNum) || limitNum < 1) {
        errors.push("Limit must be a positive number");
      } else if (limitNum > 100) {
        errors.push("Limit cannot exceed 100");
      }
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    next();
  }

  /**
   * User Registration Validation (alias)
   */
  static validateRegistration = ValidationMiddleware.validateUserRegistration;

  /**
   * User Login Validation (alias)
   */
  static validateLogin = ValidationMiddleware.validateUserLogin;

  /**
   * Profile Update Validation
   */
  static validateProfileUpdate(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { fullname, bio } = req.body;
    const errors: string[] = [];

    // Fullname validation (optional)
    if (fullname !== undefined) {
      if (typeof fullname !== "string") {
        errors.push("Full name must be a string");
      } else if (fullname.trim().length < 2) {
        errors.push("Full name must be at least 2 characters long");
      } else if (fullname.trim().length > 100) {
        errors.push("Full name must be less than 100 characters");
      }
    }

    // Bio validation (optional)
    if (bio !== undefined) {
      if (typeof bio !== "string") {
        errors.push("Bio must be a string");
      } else if (bio.length > 500) {
        errors.push("Bio must be less than 500 characters");
      }
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    // Sanitize inputs
    if (fullname !== undefined) {
      req.body.fullname = fullname.trim();
    }

    next();
  }

  /**
   * Image Upload Validation
   */
  static validateImageUpload(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const file = req.file;
    const errors: string[] = [];

    if (!file) {
      errors.push("Image file is required");
    } else {
      // Check file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.mimetype)) {
        errors.push("Only JPEG, PNG, and GIF images are allowed");
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        errors.push("File size must be less than 5MB");
      }
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    next();
  }

  /**
   * Password Change Validation
   */
  static validatePasswordChange(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { currentPassword, newPassword } = req.body;
    const errors: string[] = [];

    // Current password validation
    if (!currentPassword || currentPassword.length === 0) {
      errors.push("Current password is required");
    }

    // New password validation
    if (!newPassword || newPassword.length === 0) {
      errors.push("New password is required");
    } else if (newPassword.length < 6) {
      errors.push("New password must be at least 6 characters long");
    } else if (newPassword.length > 128) {
      errors.push("New password must be less than 128 characters");
    }

    // Check if passwords are different
    if (currentPassword && newPassword && currentPassword === newPassword) {
      errors.push("New password must be different from current password");
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    next();
  }

  /**
   * Forgot Password Validation
   */
  static validateForgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { email } = req.body;
    const errors: string[] = [];

    // Email validation
    if (!email || email.trim().length === 0) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push("Please provide a valid email address");
      }
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    // Sanitize email
    req.body.email = email.trim().toLowerCase();

    next();
  }

  /**
   * Reset Password Validation
   */
  static validateResetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { token, password } = req.body; // Changed from newPassword to password
    const errors: string[] = [];

    // Token validation
    if (!token || token.trim().length === 0) {
      errors.push("Reset token is required");
    }

    // New password validation (using 'password' field)
    if (!password || password.length === 0) {
      errors.push("New password is required");
    } else if (password.length < 6) {
      errors.push("New password must be at least 6 characters long");
    } else if (password.length > 128) {
      errors.push("New password must be less than 128 characters");
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    next();
  }

  /**
   * Pagination validation (alias)
   */
  static validatePagination = ValidationMiddleware.validatePaginationQuery;

  /**
   * Post ID validation
   */
  static validatePostId(req: Request, res: Response, next: NextFunction): void {
    const { id, postId } = req.params;
    const postIdValue = id || postId;
    const errors: string[] = [];

    if (!postIdValue) {
      errors.push("Post ID is required");
    } else {
      const postIdNum = parseInt(postIdValue);
      if (isNaN(postIdNum) || postIdNum <= 0) {
        errors.push("Post ID must be a positive number");
      }
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    next();
  }

  /**
   * Comment ID validation
   */
  static validateCommentId(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { commentId } = req.params;
    const errors: string[] = [];

    if (!commentId) {
      errors.push("Comment ID is required");
    } else {
      const commentIdNum = parseInt(commentId);
      if (isNaN(commentIdNum) || commentIdNum <= 0) {
        errors.push("Comment ID must be a positive number");
      }
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    next();
  }

  /**
   * Search query validation
   */
  static validateSearchQuery(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { q } = req.query;
    const errors: string[] = [];

    if (!q || typeof q !== "string" || q.trim().length === 0) {
      errors.push("Search query is required");
    } else if (q.trim().length > 100) {
      errors.push("Search query must be less than 100 characters");
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    // Sanitize search query
    if (typeof q === "string") {
      req.query.q = q.trim();
    }

    next();
  }

  /**
   * Category validation
   */
  static validateCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { category } = req.params;
    const errors: string[] = [];

    if (!category || category.trim().length === 0) {
      errors.push("Category is required");
    } else if (category.trim().length > 50) {
      errors.push("Category name must be less than 50 characters");
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    next();
  }

  /**
   * Comment creation validation
   */
  static validateCommentCreation(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // Support both 'content' and 'comment' field names for compatibility
    const content = req.body.content || req.body.comment;
    const errors: string[] = [];

    // Content validation
    if (!content || content.trim().length === 0) {
      errors.push("Comment content is required");
    } else if (content.trim().length > 1000) {
      errors.push("Comment content must be less than 1000 characters");
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    // Sanitize content and ensure both field names are available
    const sanitizedContent = content.trim();
    req.body.content = sanitizedContent;
    req.body.comment = sanitizedContent;

    next();
  }

  /**
   * Comment update validation
   */
  static validateCommentUpdate(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    return ValidationMiddleware.validateCommentCreation(req, res, next);
  }

  /**
   * Notification ID validation
   */
  static validateNotificationId(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const { id } = req.params;
    const errors: string[] = [];

    // ID validation
    if (!id) {
      errors.push("Notification ID is required");
    } else if (isNaN(Number(id))) {
      errors.push("Notification ID must be a valid number");
    } else if (Number(id) <= 0) {
      errors.push("Notification ID must be a positive number");
    }

    if (errors.length > 0) {
      res.status(400).json(errorMessage(errors.join(", ")));
      return;
    }

    next();
  }
}

export default ValidationMiddleware;
