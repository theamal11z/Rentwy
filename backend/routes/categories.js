const express = require('express');
const { db } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { asyncHandler, NotFoundError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route GET /api/categories
 * @desc Get all active categories
 * @access Public
 */
router.get('/', asyncHandler(async (req, res) => {
  const categories = await db.categories.findAll();
  
  res.json({
    message: 'Categories retrieved successfully',
    data: {
      categories,
      total: categories.length
    }
  });
}));

/**
 * @route GET /api/categories/:id
 * @desc Get single category by ID
 * @access Public
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const category = await db.categories.findById(id);
  if (!category) {
    throw new NotFoundError('Category not found');
  }
  
  res.json({
    message: 'Category retrieved successfully',
    data: {
      category
    }
  });
}));

module.exports = router;
