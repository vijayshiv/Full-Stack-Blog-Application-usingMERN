const express = require("express");
const { UserController } = require("../controllers");
const { ValidationMiddleware, ErrorHandler, RateLimiter } = require("../middleware");

const router = express.Router();
const rateLimiter = new RateLimiter();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - email
 *               - password
 *             properties:
 *               fullname:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 128
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "User registered successfully"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post("/register", 
  rateLimiter.authRateLimit(),
  ValidationMiddleware.validateUserRegistration,
  ErrorHandler.asyncErrorHandler(UserController.register)
);

/**
 * @swagger
 * /user/check-email:
 *   post:
 *     summary: Check if email exists
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Email check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     exists:
 *                       type: boolean
 *                       example: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post("/check-email", 
  rateLimiter.authRateLimit(),
  ValidationMiddleware.validateEmail,
  ErrorHandler.asyncErrorHandler(UserController.checkEmail)
);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 error:
 *                   type: string
 *                   example: "Invalid credentials"
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post("/login", 
  rateLimiter.authRateLimit(),
  ValidationMiddleware.validateUserLogin,
  ErrorHandler.asyncErrorHandler(UserController.login)
);

/**
 * @swagger
 * /user/details:
 *   get:
 *     summary: Get user details
 *     tags: [Users]
 *     security:
 *       - tokenAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/AuthError'
 */
router.get("/details", 
  ErrorHandler.asyncErrorHandler(UserController.getDetails)
);

/**
 * @swagger
 * /user/update:
 *   put:
 *     summary: Update user details
 *     tags: [Users]
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "John Doe Updated"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/AuthError'
 */
router.put("/update", 
  ErrorHandler.asyncErrorHandler(UserController.update)
);

/**
 * @swagger
 * /user/delete:
 *   post:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - tokenAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/AuthError'
 */
router.post("/delete", 
  ErrorHandler.asyncErrorHandler(UserController.delete)
);

/**
 * @swagger
 * /user/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post("/forgot-password", 
  rateLimiter.passwordResetRateLimit(),
  ValidationMiddleware.validateEmail,
  ErrorHandler.asyncErrorHandler(UserController.forgotPassword)
);

/**
 * @swagger
 * /user/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               token:
 *                 type: string
 *                 example: "reset-token-123"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post("/reset-password", 
  rateLimiter.passwordResetRateLimit(),
  ErrorHandler.asyncErrorHandler(UserController.resetPassword)
);

module.exports = router;
module.exports = router;

// Get user details route
router.get("/details", async (req, res) => {
  const userId = req.user.id;
  const query = "SELECT fullname, email, isDeleted FROM users WHERE id = ?";

  try {
    const [data] = await db.pool.execute(query, [userId]);
    if (data.length === 0) {
      return res.send(util.errorMessage("No user found"));
    }
    res.send(util.successMessage(data[0]));
  } catch (error) {
    console.error("Database Error:", error);
    res.send(util.errorMessage("Error retrieving user details"));
  }
});

// Update user route
router.put("/update", async (req, res) => {
  const { id, email, fullname, oldPassword, newPassword } = req.body;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const [userData] = await db.pool.query(
      "SELECT password FROM users WHERE id = ?",
      [id]
    );

    if (userData.length === 0) {
      return res.send(util.errorMessage("User not found"));
    }

    if (newPassword && oldPassword) {
      const hashedOldPassword = String(encrypt.SHA256(oldPassword));
      if (hashedOldPassword !== userData[0].password) {
        return res.send(util.errorMessage("Old password is incorrect"));
      }
    }

    let query = "UPDATE users SET";
    const values = [];

    if (email) {
      query += " email = ?,";
      values.push(email);
    }
    if (fullname) {
      query += " fullname = ?,";
      values.push(fullname);
    }
    if (newPassword) {
      const hashedNewPassword = String(encrypt.SHA256(newPassword));
      query += " password = ?,";
      values.push(hashedNewPassword);
    }

    query = query.slice(0, -1) + " WHERE id = ?";
    values.push(id);

    await db.pool.execute(query, values);
    res.send(util.successMessage("User updated successfully"));
  } catch (error) {
    console.error("Database Error:", error);
    res.send(util.errorMessage("Error updating user"));
  }
});

// Delete user route
router.post("/delete", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.send(util.errorMessage("User ID is required"));
  }

  const query = "UPDATE users SET isDeleted = 1 WHERE id = ?";

  try {
    const [result] = await db.pool.execute(query, [id]);
    if (result.affectedRows === 0) {
      return res.send(util.errorMessage("User not found or cannot be deleted"));
    }
    res.send(util.successMessage("User deleted successfully"));
  } catch (error) {
    console.error("Database Error:", error);
    res.send(util.errorMessage("Failed to delete user"));
  }
});

// Forgot password route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const query = "SELECT id FROM users WHERE email = ?";
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
  });

  try {
    const [users] = await db.pool.execute(query, [email]);
    if (users.length === 0) {
      return res.send(util.errorMessage("Email not found"));
    }

    const userId = users[0].id;
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour

    await db.pool.execute(
      "UPDATE users SET reset_token = ?, reset_token_expiration = ? WHERE id = ?",
      [resetToken, resetTokenExpiration, userId]
    );

    // Send reset link via email
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetLink}">Reset Password</a>`,
    });

    res.send(util.successMessage("Password reset link sent to your email"));
  } catch (error) {
    console.error("Error during password reset request:", error);
    res.send(util.errorMessage("Error sending password reset email"));
  }
});

// Reset password route
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  const encryptedPassword = String(
    crypto.createHash("sha256").update(password).digest("hex")
  );

  try {
    const [users] = await db.pool.execute(
      "SELECT id FROM users WHERE reset_token = ? AND reset_token_expiration > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.send(util.errorMessage("Invalid or expired token"));
    }

    const userId = users[0].id;
    await db.pool.execute(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE id = ?",
      [encryptedPassword, userId]
    );

    res.send(util.successMessage("Password reset successful"));
  } catch (error) {
    console.error("Error resetting password:", error);
    res.send(util.errorMessage("Error resetting password"));
  }
});

module.exports = router;
