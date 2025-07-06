const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { db, supabase } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError, ForbiddenError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const createItemSchema = Joi.object({
  category_id: Joi.string().uuid().required(),
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().min(10).required(),
  brand: Joi.string().max(100),
  size: Joi.string().max(20),
  condition: Joi.string().valid('new', 'excellent', 'good', 'fair').required(),
  price_per_day: Joi.number().min(1).max(999999.99).required(),
  deposit_amount: Joi.number().min(0).max(999999.99).default(0),
  images: Joi.array().items(Joi.string().uri()).max(10).default([]),
  tags: Joi.array().items(Joi.string().max(50)).max(20).default([]),
  style_tags: Joi.array().items(Joi.string().max(50)).max(10).default([]),
  city: Joi.string().max(100),
  state: Joi.string().max(100),
  country: Joi.string().max(100).default('USA')
});

const updateItemSchema = Joi.object({
  title: Joi.string().min(3).max(255),
  description: Joi.string().min(10),
  brand: Joi.string().max(100),
  size: Joi.string().max(20),
  condition: Joi.string().valid('new', 'excellent', 'good', 'fair'),
  price_per_day: Joi.number().min(1).max(999999.99),
  deposit_amount: Joi.number().min(0).max(999999.99),
  images: Joi.array().items(Joi.string().uri()).max(10),
  tags: Joi.array().items(Joi.string().max(50)).max(20),
  style_tags: Joi.array().items(Joi.string().max(50)).max(10),
  city: Joi.string().max(100),
  state: Joi.string().max(100),
  country: Joi.string().max(100),
  is_available: Joi.boolean(),
  status: Joi.string().valid('draft', 'active', 'inactive', 'archived')
});

const searchSchema = Joi.object({
  q: Joi.string().max(100),
  category_id: Joi.string().uuid(),
  min_price: Joi.number().min(0),
  max_price: Joi.number().min(0),
  city: Joi.string().max(100),
  state: Joi.string().max(100),
  condition: Joi.array().items(Joi.string().valid('new', 'excellent', 'good', 'fair')),
  tags: Joi.array().items(Joi.string().max(50)),
  sort_by: Joi.string().valid('created_at', 'price_per_day', 'average_rating', 'total_bookings').default('created_at'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

/**
 * @route GET /api/items
 * @desc Get all items with search and filtering
 * @access Public
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { error, value } = searchSchema.validate(req.query);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { q, category_id, min_price, max_price, city, state, condition, tags, sort_by, order, page, limit } = value;
  const offset = (page - 1) * limit;

  // Build filters object
  const filters = {
    status: 'active',
    limit,
    offset,
    sort_by,
    order
  };

  if (q) filters.search = q;
  if (category_id) filters.category_id = category_id;
  if (min_price) filters.min_price = min_price;
  if (max_price) filters.max_price = max_price;
  if (city) filters.city = city;
  if (state) filters.state = state;

  let query = supabase
    .from('items')
    .select(`
      *,
      categories(name, icon, color),
      users(full_name, profile_image_url, average_rating, city, state)
    `, { count: 'exact' })
    .is('deleted_at', null)
    .eq('status', 'active')
    .eq('is_available', true);

  // Apply search
  if (q) {
    query = query.textSearch('title,description,brand,tags,style_tags', q);
  }

  // Apply filters
  if (category_id) query = query.eq('category_id', category_id);
  if (min_price) query = query.gte('price_per_day', min_price);
  if (max_price) query = query.lte('price_per_day', max_price);
  if (city) query = query.eq('city', city);
  if (state) query = query.eq('state', state);
  if (condition && condition.length > 0) query = query.in('condition', condition);
  if (tags && tags.length > 0) query = query.overlaps('tags', tags);

  // Apply sorting
  const sortOrder = order === 'asc' ? { ascending: true } : { ascending: false };
  query = query.order(sort_by, sortOrder);

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: items, error: queryError, count } = await query;
  if (queryError) throw queryError;

  res.json({
    message: 'Items retrieved successfully',
    data: {
      items: items || [],
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit
    }
  });
}));

/**
 * @route GET /api/items/:id
 * @desc Get single item by ID
 * @access Public
 */
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await db.items.findById(id);
  if (!item) {
    throw new NotFoundError('Item not found');
  }

  // Increment view count if not the owner
  if (!req.user || req.user.id !== item.user_id) {
    await db.items.update(id, {
      view_count: item.view_count + 1
    });
    item.view_count += 1;
  }

  // Check if user has favorited this item
  let is_favorited = false;
  if (req.user) {
    const { data: favorite } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('item_id', id)
      .single();
    
    is_favorited = !!favorite;
  }

  // Get availability for the next 30 days
  const startDate = new Date();
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  const { data: availability } = await supabase
    .from('item_availability')
    .select('*')
    .eq('item_id', id)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  res.json({
    message: 'Item retrieved successfully',
    data: {
      item: {
        ...item,
        is_favorited
      },
      availability: availability || []
    }
  });
}));

/**
 * @route POST /api/items
 * @desc Create new item
 * @access Private
 */
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { error, value } = createItemSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  // Check if category exists
  const category = await db.categories.findById(value.category_id);
  if (!category) {
    throw new ValidationError('Invalid category ID');
  }

  // Use user's location if not provided
  const itemData = {
    id: uuidv4(),
    user_id: req.user.id,
    ...value,
    city: value.city || req.user.city,
    state: value.state || req.user.state,
    country: value.country || req.user.country || 'USA',
    status: 'active',
    is_available: true,
    created_at: new Date().toISOString()
  };

  const item = await db.items.create(itemData);

  res.status(201).json({
    message: 'Item created successfully',
    data: { item }
  });
}));

/**
 * @route PUT /api/items/:id
 * @desc Update item
 * @access Private
 */
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateItemSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  // Check if item exists and belongs to user
  const existingItem = await db.items.findById(id);
  if (!existingItem) {
    throw new NotFoundError('Item not found');
  }

  if (existingItem.user_id !== req.user.id) {
    throw new ForbiddenError('You can only update your own items');
  }

  const updatedItem = await db.items.update(id, {
    ...value,
    updated_at: new Date().toISOString()
  });

  res.json({
    message: 'Item updated successfully',
    data: { item: updatedItem }
  });
}));

/**
 * @route DELETE /api/items/:id
 * @desc Delete item (soft delete)
 * @access Private
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if item exists and belongs to user
  const existingItem = await db.items.findById(id);
  if (!existingItem) {
    throw new NotFoundError('Item not found');
  }

  if (existingItem.user_id !== req.user.id) {
    throw new ForbiddenError('You can only delete your own items');
  }

  // Check for active bookings
  const { data: activeBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('item_id', id)
    .in('status', ['pending', 'confirmed', 'active']);

  if (activeBookings && activeBookings.length > 0) {
    throw new ForbiddenError('Cannot delete item with active bookings');
  }

  await db.items.delete(id);

  res.json({
    message: 'Item deleted successfully'
  });
}));

/**
 * @route POST /api/items/:id/favorite
 * @desc Add item to favorites
 * @access Private
 */
router.post('/:id/favorite', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if item exists
  const item = await db.items.findById(id);
  if (!item) {
    throw new NotFoundError('Item not found');
  }

  // Check if already favorited
  const { data: existingFavorite } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('item_id', id)
    .single();

  if (existingFavorite) {
    return res.json({
      message: 'Item already in favorites',
      data: { favorite: existingFavorite }
    });
  }

  // Add to favorites
  const { data: favorite, error } = await supabase
    .from('favorites')
    .insert([{
      user_id: req.user.id,
      item_id: id
    }])
    .select()
    .single();

  if (error) throw error;

  // Update item favorite count
  await db.items.update(id, {
    favorite_count: item.favorite_count + 1
  });

  res.status(201).json({
    message: 'Item added to favorites',
    data: { favorite }
  });
}));

/**
 * @route DELETE /api/items/:id/favorite
 * @desc Remove item from favorites
 * @access Private
 */
router.delete('/:id/favorite', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Remove from favorites
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', req.user.id)
    .eq('item_id', id);

  if (error) throw error;

  // Update item favorite count
  const item = await db.items.findById(id);
  if (item) {
    await db.items.update(id, {
      favorite_count: Math.max(0, item.favorite_count - 1)
    });
  }

  res.json({
    message: 'Item removed from favorites'
  });
}));

/**
 * @route GET /api/items/:id/availability
 * @desc Get item availability calendar
 * @access Public
 */
router.get('/:id/availability', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { start_date, end_date } = req.query;

  // Check if item exists
  const item = await db.items.findById(id);
  if (!item) {
    throw new NotFoundError('Item not found');
  }

  let query = supabase
    .from('item_availability')
    .select('*')
    .eq('item_id', id)
    .order('date', { ascending: true });

  if (start_date) {
    query = query.gte('date', start_date);
  }
  if (end_date) {
    query = query.lte('date', end_date);
  }

  const { data: availability, error } = await query;
  if (error) throw error;

  res.json({
    message: 'Availability retrieved successfully',
    data: {
      availability: availability || []
    }
  });
}));

/**
 * @route PUT /api/items/:id/availability
 * @desc Update item availability
 * @access Private
 */
router.put('/:id/availability', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { dates } = req.body;

  if (!dates || !Array.isArray(dates)) {
    throw new ValidationError('Dates array is required');
  }

  // Check if item belongs to user
  const item = await db.items.findById(id);
  if (!item) {
    throw new NotFoundError('Item not found');
  }

  if (item.user_id !== req.user.id) {
    throw new ForbiddenError('You can only update availability for your own items');
  }

  // Update availability for each date
  const availabilityUpdates = dates.map(dateInfo => ({
    item_id: id,
    date: dateInfo.date,
    is_available: dateInfo.is_available,
    reason: dateInfo.reason || null
  }));

  const { data: availability, error } = await supabase
    .from('item_availability')
    .upsert(availabilityUpdates, {
      onConflict: 'item_id,date'
    })
    .select();

  if (error) throw error;

  res.json({
    message: 'Availability updated successfully',
    data: { availability }
  });
}));

/**
 * @route GET /api/items/user/:userId
 * @desc Get items by user ID
 * @access Public
 */
router.get('/user/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, status = 'active' } = req.query;
  const offset = (page - 1) * limit;

  const filters = {
    user_id: userId,
    limit: parseInt(limit),
    offset,
    sort_by: 'created_at',
    order: 'desc'
  };

  if (status && status !== 'all') {
    filters.status = status;
  }

  const { data: items, count } = await supabase
    .from('items')
    .select(`
      *,
      categories(name, icon, color)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .eq('status', status === 'all' ? undefined : status)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  res.json({
    message: 'User items retrieved successfully',
    data: {
      items: items || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      has_more: (count || 0) > offset + parseInt(limit)
    }
  });
}));

module.exports = router;
