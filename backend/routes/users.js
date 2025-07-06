const express = require('express');
const Joi = require('joi');
const { db } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError, ForbiddenError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const updateProfileSchema = Joi.object({
  full_name: Joi.string().min(2).max(255),
  phone: Joi.string(),
  bio: Joi.string().max(500),
  date_of_birth: Joi.date(),
  city: Joi.string().max(100),
  state: Joi.string().max(100),
  country: Joi.string().max(100),
  postal_code: Joi.string().max(20),
  profile_image_url: Joi.string().uri()
});

const updateSettingsSchema = Joi.object({
  push_notifications: Joi.boolean(),
  email_notifications: Joi.boolean(),
  sms_notifications: Joi.boolean(),
  marketing_emails: Joi.boolean(),
  booking_reminders: Joi.boolean(),
  profile_visibility: Joi.boolean(),
  show_last_seen: Joi.boolean(),
  allow_messages: Joi.boolean(),
  preferred_currency: Joi.string().length(3),
  preferred_language: Joi.string().max(5),
  dark_mode: Joi.boolean()
});

const addAddressSchema = Joi.object({
  label: Joi.string().max(50).required(),
  address_line_1: Joi.string().max(255).required(),
  address_line_2: Joi.string().max(255),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).required(),
  postal_code: Joi.string().max(20).required(),
  country: Joi.string().max(100).default('USA'),
  is_default: Joi.boolean().default(false)
});

/**
 * @route GET /api/users/profile
 * @desc Get current user's profile
 * @access Private
 */
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const { password_hash, ...userProfile } = req.user;
  
  res.json({
    message: 'Profile retrieved successfully',
    data: { user: userProfile }
  });
}));

/**
 * @route PUT /api/users/profile
 * @desc Update current user's profile
 * @access Private
 */
router.put('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const { error, value } = updateProfileSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const updatedUser = await db.users.update(req.user.id, {
    ...value,
    updated_at: new Date().toISOString()
  });

  const { password_hash, ...userProfile } = updatedUser;

  res.json({
    message: 'Profile updated successfully',
    data: { user: userProfile }
  });
}));

/**
 * @route GET /api/users/:id
 * @desc Get public user profile
 * @access Public
 */
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await db.users.findById(id);
  if (!user || user.deleted_at) {
    throw new NotFoundError('User not found');
  }

  // Check privacy settings
  if (!user.profile_visibility && (!req.user || req.user.id !== user.id)) {
    throw new ForbiddenError('This profile is private');
  }

  // Return only public information
  const publicProfile = {
    id: user.id,
    full_name: user.full_name,
    profile_image_url: user.profile_image_url,
    bio: user.bio,
    city: user.city,
    state: user.state,
    country: user.country,
    average_rating: user.average_rating,
    total_reviews: user.total_reviews,
    total_listings: user.total_listings,
    completion_rate: user.completion_rate,
    response_rate: user.response_rate,
    created_at: user.created_at,
    last_active: user.show_last_seen ? user.last_active : null
  };

  res.json({
    message: 'User profile retrieved successfully',
    data: { user: publicProfile }
  });
}));

/**
 * @route GET /api/users/settings
 * @desc Get user settings
 * @access Private
 */
router.get('/settings', authenticateToken, asyncHandler(async (req, res) => {
  const { data: settings, error } = await db.supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  // If no settings exist, create default settings
  if (!settings) {
    const { data: newSettings, error: createError } = await db.supabase
      .from('user_settings')
      .insert([{ user_id: req.user.id }])
      .select()
      .single();

    if (createError) throw createError;

    return res.json({
      message: 'User settings retrieved successfully',
      data: { settings: newSettings }
    });
  }

  res.json({
    message: 'User settings retrieved successfully',
    data: { settings }
  });
}));

/**
 * @route PUT /api/users/settings
 * @desc Update user settings
 * @access Private
 */
router.put('/settings', authenticateToken, asyncHandler(async (req, res) => {
  const { error, value } = updateSettingsSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { data: settings, error: updateError } = await db.supabase
    .from('user_settings')
    .upsert({
      user_id: req.user.id,
      ...value,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (updateError) throw updateError;

  res.json({
    message: 'Settings updated successfully',
    data: { settings }
  });
}));

/**
 * @route GET /api/users/addresses
 * @desc Get user addresses
 * @access Private
 */
router.get('/addresses', authenticateToken, asyncHandler(async (req, res) => {
  const { data: addresses, error } = await db.supabase
    .from('addresses')
    .select('*')
    .eq('user_id', req.user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  res.json({
    message: 'Addresses retrieved successfully',
    data: { 
      addresses: addresses || [],
      total: addresses?.length || 0
    }
  });
}));

/**
 * @route POST /api/users/addresses
 * @desc Add new address
 * @access Private
 */
router.post('/addresses', authenticateToken, asyncHandler(async (req, res) => {
  const { error, value } = addAddressSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  // If this is set as default, unset other default addresses
  if (value.is_default) {
    await db.supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', req.user.id);
  }

  const { data: address, error: createError } = await db.supabase
    .from('addresses')
    .insert([{
      user_id: req.user.id,
      ...value
    }])
    .select()
    .single();

  if (createError) throw createError;

  res.status(201).json({
    message: 'Address added successfully',
    data: { address }
  });
}));

/**
 * @route PUT /api/users/addresses/:id
 * @desc Update address
 * @access Private
 */
router.put('/addresses/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error, value } = addAddressSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  // Verify address belongs to user
  const { data: existingAddress, error: findError } = await db.supabase
    .from('addresses')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (findError && findError.code !== 'PGRST116') throw findError;
  if (!existingAddress) {
    throw new NotFoundError('Address not found');
  }

  // If this is set as default, unset other default addresses
  if (value.is_default) {
    await db.supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', req.user.id)
      .neq('id', id);
  }

  const { data: address, error: updateError } = await db.supabase
    .from('addresses')
    .update({
      ...value,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (updateError) throw updateError;

  res.json({
    message: 'Address updated successfully',
    data: { address }
  });
}));

/**
 * @route DELETE /api/users/addresses/:id
 * @desc Delete address
 * @access Private
 */
router.delete('/addresses/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify address belongs to user
  const { data: existingAddress, error: findError } = await db.supabase
    .from('addresses')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (findError && findError.code !== 'PGRST116') throw findError;
  if (!existingAddress) {
    throw new NotFoundError('Address not found');
  }

  const { error: deleteError } = await db.supabase
    .from('addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user.id);

  if (deleteError) throw deleteError;

  res.json({
    message: 'Address deleted successfully'
  });
}));

/**
 * @route GET /api/users/stats
 * @desc Get user statistics
 * @access Private
 */
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  // Get comprehensive user stats from the view
  const { data: stats, error } = await db.supabase
    .from('user_stats')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  // Get additional stats
  const { data: recentBookings, error: bookingsError } = await db.supabase
    .from('bookings')
    .select('*')
    .or(`renter_id.eq.${req.user.id},owner_id.eq.${req.user.id}`)
    .order('created_at', { ascending: false })
    .limit(5);

  if (bookingsError) throw bookingsError;

  const { data: notifications, error: notifError } = await db.supabase
    .from('notifications')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('is_read', false)
    .limit(10);

  if (notifError) throw notifError;

  res.json({
    message: 'User statistics retrieved successfully',
    data: {
      stats: stats || {
        total_listings: 0,
        active_listings: 0,
        total_rentals_as_owner: 0,
        total_rentals_as_renter: 0,
        total_earnings: 0
      },
      recent_bookings: recentBookings || [],
      unread_notifications: notifications?.length || 0
    }
  });
}));

/**
 * @route GET /api/users/favorites
 * @desc Get user's favorite items
 * @access Private
 */
router.get('/favorites', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const { data: favorites, error, count } = await db.supabase
    .from('favorites')
    .select(`
      *,
      items(
        *,
        categories(name, icon, color),
        users(full_name, profile_image_url, average_rating)
      )
    `, { count: 'exact' })
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  res.json({
    message: 'Favorites retrieved successfully',
    data: {
      favorites: favorites || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      has_more: (count || 0) > offset + limit
    }
  });
}));

module.exports = router;
