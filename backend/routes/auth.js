const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, ValidationError, UnauthorizedError, ConflictError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  full_name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  date_of_birth: Joi.date().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const changePasswordSchema = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string().min(6).required()
});

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Helper function to exclude password from user object
const excludePassword = (user) => {
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { full_name, email, password, phone, date_of_birth } = value;

  // Check if user already exists
  const existingUser = await db.users.findByEmail(email);
  if (existingUser) {
    throw new ConflictError('User already exists with this email');
  }

  // Hash password
  const saltRounds = 12;
  const password_hash = await bcrypt.hash(password, saltRounds);

  // Create user
  const userData = {
    id: uuidv4(),
    full_name,
    email: email.toLowerCase(),
    password_hash,
    phone,
    date_of_birth,
    is_email_verified: false,
    is_phone_verified: false,
    is_verified: false,
    created_at: new Date().toISOString()
  };

  const user = await db.users.create(userData);

  // Generate token
  const token = generateToken(user.id);

  // Return user (without password) and token
  res.status(201).json({
    message: 'User registered successfully',
    data: {
      user: excludePassword(user),
      token,
      expires_in: '30d'
    }
  });
}));

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { email, password } = value;

  // Find user by email
  const user = await db.users.findByEmail(email.toLowerCase());
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check if account is deactivated
  if (user.deleted_at) {
    throw new UnauthorizedError('Account has been deactivated');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Update last active timestamp
  await db.users.update(user.id, {
    last_active: new Date().toISOString()
  });

  // Generate token
  const token = generateToken(user.id);

  res.json({
    message: 'Login successful',
    data: {
      user: excludePassword(user),
      token,
      expires_in: '30d'
    }
  });
}));

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    message: 'User profile retrieved successfully',
    data: {
      user: excludePassword(req.user)
    }
  });
}));

/**
 * @route PUT /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.put('/change-password', authenticateToken, asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = changePasswordSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { current_password, new_password } = value;

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(current_password, req.user.password_hash);
  if (!isCurrentPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Hash new password
  const saltRounds = 12;
  const new_password_hash = await bcrypt.hash(new_password, saltRounds);

  // Update password
  await db.users.update(req.user.id, {
    password_hash: new_password_hash,
    updated_at: new Date().toISOString()
  });

  res.json({
    message: 'Password changed successfully'
  });
}));

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = resetPasswordSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { email } = value;

  // Find user by email
  const user = await db.users.findByEmail(email.toLowerCase());
  
  // Always return success to prevent email enumeration
  res.json({
    message: 'If an account with that email exists, we have sent a password reset link'
  });

  // If user doesn't exist, just return without sending email
  if (!user || user.deleted_at) {
    return;
  }

  // TODO: Implement email sending logic
  // For now, just log the reset token
  const resetToken = jwt.sign(
    { userId: user.id, type: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  console.log('Password reset token for', user.email, ':', resetToken);
  // In production, send this token via email
}));

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, new_password } = req.body;

  if (!token || !new_password) {
    throw new ValidationError('Token and new password are required');
  }

  if (new_password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }

  try {
    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      throw new UnauthorizedError('Invalid reset token');
    }

    // Find user
    const user = await db.users.findById(decoded.userId);
    if (!user || user.deleted_at) {
      throw new UnauthorizedError('Invalid reset token');
    }

    // Hash new password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await db.users.update(user.id, {
      password_hash,
      updated_at: new Date().toISOString()
    });

    res.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Invalid or expired reset token');
    }
    throw error;
  }
}));

/**
 * @route POST /api/auth/verify-email
 * @desc Verify user email
 * @access Private
 */
router.post('/verify-email', authenticateToken, asyncHandler(async (req, res) => {
  const { verification_code } = req.body;

  if (!verification_code) {
    throw new ValidationError('Verification code is required');
  }

  // TODO: Implement email verification logic
  // For now, just mark email as verified
  await db.users.update(req.user.id, {
    is_email_verified: true,
    updated_at: new Date().toISOString()
  });

  res.json({
    message: 'Email verified successfully'
  });
}));

/**
 * @route POST /api/auth/resend-verification
 * @desc Resend email verification
 * @access Private
 */
router.post('/resend-verification', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user.is_email_verified) {
    throw new ValidationError('Email is already verified');
  }

  // TODO: Implement email sending logic
  // For now, just return success
  console.log('Verification email sent to:', req.user.email);

  res.json({
    message: 'Verification email sent successfully'
  });
}));

/**
 * @route POST /api/auth/logout
 * @desc Logout user (client-side token removal)
 * @access Private
 */
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // Update last active timestamp
  await db.users.update(req.user.id, {
    last_active: new Date().toISOString()
  });

  res.json({
    message: 'Logout successful'
  });
}));

/**
 * @route DELETE /api/auth/deactivate
 * @desc Deactivate user account
 * @access Private
 */
router.delete('/deactivate', authenticateToken, asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new ValidationError('Password confirmation is required');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, req.user.password_hash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Password is incorrect');
  }

  // Soft delete user account
  await db.users.update(req.user.id, {
    deleted_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  res.json({
    message: 'Account deactivated successfully'
  });
}));

module.exports = router;
