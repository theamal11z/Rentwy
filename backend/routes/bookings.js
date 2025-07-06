const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError, ForbiddenError, ConflictError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const createBookingSchema = Joi.object({
  item_id: Joi.string().uuid().required(),
  start_date: Joi.date().min('now').required(),
  end_date: Joi.date().greater(Joi.ref('start_date')).required(),
  pickup_method: Joi.string().valid('pickup', 'delivery').required(),
  pickup_address: Joi.object().when('pickup_method', {
    is: 'pickup',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  delivery_address: Joi.object().when('pickup_method', {
    is: 'delivery',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  special_instructions: Joi.string().max(500)
});

const updateBookingSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed'),
  pickup_address: Joi.object(),
  delivery_address: Joi.object(),
  special_instructions: Joi.string().max(500),
  cancellation_reason: Joi.string().max(500)
});

// Helper function to calculate booking pricing
const calculateBookingPricing = (item, startDate, endDate) => {
  const start = moment(startDate);
  const end = moment(endDate);
  const totalDays = end.diff(start, 'days') + 1;
  
  const dailyRate = parseFloat(item.price_per_day);
  const subtotal = dailyRate * totalDays;
  const serviceFeeRate = 0.10; // 10% service fee
  const serviceFee = subtotal * serviceFeeRate;
  const deliveryFee = 0; // Default delivery fee, can be customized
  const depositAmount = parseFloat(item.deposit_amount);
  const totalAmount = subtotal + serviceFee + deliveryFee + depositAmount;

  return {
    daily_rate: dailyRate,
    total_days: totalDays,
    subtotal: subtotal,
    service_fee: serviceFee,
    delivery_fee: deliveryFee,
    deposit_amount: depositAmount,
    total_amount: totalAmount
  };
};

// Helper function to check item availability
const checkItemAvailability = async (itemId, startDate, endDate) => {
  // Check for existing bookings in the date range
  const { data: conflictingBookings } = await db.supabase
    .from('bookings')
    .select('*')
    .eq('item_id', itemId)
    .in('status', ['confirmed', 'active'])
    .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

  if (conflictingBookings && conflictingBookings.length > 0) {
    return false;
  }

  // Check item availability calendar
  const { data: unavailableDates } = await db.supabase
    .from('item_availability')
    .select('*')
    .eq('item_id', itemId)
    .eq('is_available', false)
    .gte('date', startDate)
    .lte('date', endDate);

  return !unavailableDates || unavailableDates.length === 0;
};

/**
 * @route GET /api/bookings
 * @desc Get user's bookings (as renter or owner)
 * @access Private
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { status, role, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = db.supabase
    .from('bookings')
    .select(`
      *,
      items(
        id, title, images, price_per_day, condition,
        categories(name, icon, color)
      ),
      renter:users!renter_id(id, full_name, profile_image_url, phone),
      owner:users!owner_id(id, full_name, profile_image_url, phone)
    `, { count: 'exact' });

  // Filter by user role
  if (role === 'renter') {
    query = query.eq('renter_id', req.user.id);
  } else if (role === 'owner') {
    query = query.eq('owner_id', req.user.id);
  } else {
    // Default: show all bookings where user is involved
    query = query.or(`renter_id.eq.${req.user.id},owner_id.eq.${req.user.id}`);
  }

  // Filter by status
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  // Apply pagination and sorting
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  const { data: bookings, error, count } = await query;
  if (error) throw error;

  res.json({
    message: 'Bookings retrieved successfully',
    data: {
      bookings: bookings || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      has_more: (count || 0) > offset + parseInt(limit)
    }
  });
}));

/**
 * @route GET /api/bookings/:id
 * @desc Get single booking by ID
 * @access Private
 */
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await db.bookings.findById(id);
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Check if user is involved in this booking
  if (booking.renter_id !== req.user.id && booking.owner_id !== req.user.id) {
    throw new ForbiddenError('Access denied');
  }

  res.json({
    message: 'Booking retrieved successfully',
    data: { booking }
  });
}));

/**
 * @route POST /api/bookings
 * @desc Create new booking
 * @access Private
 */
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { error, value } = createBookingSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { item_id, start_date, end_date, pickup_method, pickup_address, delivery_address, special_instructions } = value;

  // Get item details
  const item = await db.items.findById(item_id);
  if (!item) {
    throw new NotFoundError('Item not found');
  }

  // Check if item is available
  if (!item.is_available || item.status !== 'active') {
    throw new ConflictError('Item is not available for booking');
  }

  // Check if user is trying to book their own item
  if (item.user_id === req.user.id) {
    throw new ForbiddenError('You cannot book your own item');
  }

  // Check availability for the requested dates
  const isAvailable = await checkItemAvailability(item_id, start_date, end_date);
  if (!isAvailable) {
    throw new ConflictError('Item is not available for the selected dates');
  }

  // Calculate pricing
  const pricing = calculateBookingPricing(item, start_date, end_date);

  // Create booking
  const bookingData = {
    id: uuidv4(),
    item_id,
    renter_id: req.user.id,
    owner_id: item.user_id,
    start_date,
    end_date,
    ...pricing,
    pickup_method,
    pickup_address,
    delivery_address,
    special_instructions,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  const booking = await db.bookings.create(bookingData);

  // Create availability entries for booked dates
  const dates = [];
  const start = moment(start_date);
  const end = moment(end_date);
  
  for (let date = start.clone(); date.isSameOrBefore(end); date.add(1, 'day')) {
    dates.push({
      item_id,
      date: date.format('YYYY-MM-DD'),
      is_available: false,
      reason: 'booked',
      booking_id: booking.id
    });
  }

  await db.supabase
    .from('item_availability')
    .upsert(dates, { onConflict: 'item_id,date' });

  res.status(201).json({
    message: 'Booking created successfully',
    data: { booking }
  });
}));

/**
 * @route PUT /api/bookings/:id
 * @desc Update booking status or details
 * @access Private
 */
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateBookingSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const booking = await db.bookings.findById(id);
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Check permissions
  const isOwner = booking.owner_id === req.user.id;
  const isRenter = booking.renter_id === req.user.id;

  if (!isOwner && !isRenter) {
    throw new ForbiddenError('Access denied');
  }

  // Status change validations
  if (value.status) {
    const currentStatus = booking.status;
    const newStatus = value.status;

    // Only owner can confirm bookings
    if (newStatus === 'confirmed' && !isOwner) {
      throw new ForbiddenError('Only the item owner can confirm bookings');
    }

    // Only pending bookings can be confirmed
    if (newStatus === 'confirmed' && currentStatus !== 'pending') {
      throw new ConflictError('Only pending bookings can be confirmed');
    }

    // Both parties can cancel, but with different rules
    if (newStatus === 'cancelled') {
      if (currentStatus === 'active') {
        throw new ConflictError('Active bookings cannot be cancelled');
      }
      if (!value.cancellation_reason) {
        throw new ValidationError('Cancellation reason is required');
      }
    }

    // Only owner can mark as completed
    if (newStatus === 'completed' && !isOwner) {
      throw new ForbiddenError('Only the item owner can mark bookings as completed');
    }

    // Only active bookings can be completed
    if (newStatus === 'completed' && currentStatus !== 'active') {
      throw new ConflictError('Only active bookings can be completed');
    }
  }

  // Add timestamps for status changes
  const updates = { ...value };
  if (value.status) {
    switch (value.status) {
      case 'confirmed':
        updates.confirmed_at = new Date().toISOString();
        break;
      case 'cancelled':
        updates.cancelled_at = new Date().toISOString();
        break;
      case 'completed':
        updates.completed_at = new Date().toISOString();
        break;
    }
  }

  const updatedBooking = await db.bookings.update(id, updates);

  // Handle availability updates for cancelled bookings
  if (value.status === 'cancelled') {
    await db.supabase
      .from('item_availability')
      .delete()
      .eq('booking_id', id);
  }

  res.json({
    message: 'Booking updated successfully',
    data: { booking: updatedBooking }
  });
}));

/**
 * @route POST /api/bookings/:id/cancel
 * @desc Cancel a booking
 * @access Private
 */
router.post('/:id/cancel', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new ValidationError('Cancellation reason is required');
  }

  const booking = await db.bookings.findById(id);
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Check permissions
  const isOwner = booking.owner_id === req.user.id;
  const isRenter = booking.renter_id === req.user.id;

  if (!isOwner && !isRenter) {
    throw new ForbiddenError('Access denied');
  }

  // Check if booking can be cancelled
  if (!['pending', 'confirmed'].includes(booking.status)) {
    throw new ConflictError('This booking cannot be cancelled');
  }

  // Update booking status
  const updatedBooking = await db.bookings.update(id, {
    status: 'cancelled',
    cancellation_reason: reason,
    cancelled_at: new Date().toISOString()
  });

  // Remove availability blocks
  await db.supabase
    .from('item_availability')
    .delete()
    .eq('booking_id', id);

  res.json({
    message: 'Booking cancelled successfully',
    data: { booking: updatedBooking }
  });
}));

/**
 * @route GET /api/bookings/calendar/:year/:month
 * @desc Get calendar view of bookings for a specific month
 * @access Private
 */
router.get('/calendar/:year/:month', authenticateToken, asyncHandler(async (req, res) => {
  const { year, month } = req.params;
  const { role = 'all' } = req.query;

  // Validate year and month
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  
  if (yearNum < 2020 || yearNum > 2030 || monthNum < 1 || monthNum > 12) {
    throw new ValidationError('Invalid year or month');
  }

  // Get first and last day of the month
  const startDate = moment({ year: yearNum, month: monthNum - 1, day: 1 });
  const endDate = startDate.clone().endOf('month');

  let query = db.supabase
    .from('bookings')
    .select(`
      id, start_date, end_date, status,
      items(id, title, images),
      renter:users!renter_id(id, full_name),
      owner:users!owner_id(id, full_name)
    `)
    .gte('start_date', startDate.format('YYYY-MM-DD'))
    .lte('end_date', endDate.format('YYYY-MM-DD'));

  // Filter by role
  if (role === 'owner') {
    query = query.eq('owner_id', req.user.id);
  } else if (role === 'renter') {
    query = query.eq('renter_id', req.user.id);
  } else {
    query = query.or(`renter_id.eq.${req.user.id},owner_id.eq.${req.user.id}`);
  }

  const { data: bookings, error } = await query;
  if (error) throw error;

  // Transform bookings into calendar format
  const calendar = {};
  
  // Initialize all days of the month
  for (let day = 1; day <= endDate.date(); day++) {
    const date = startDate.clone().date(day).format('YYYY-MM-DD');
    calendar[date] = [];
  }

  // Add bookings to appropriate dates
  bookings?.forEach(booking => {
    const start = moment(booking.start_date);
    const end = moment(booking.end_date);
    
    for (let date = start.clone(); date.isSameOrBefore(end); date.add(1, 'day')) {
      const dateStr = date.format('YYYY-MM-DD');
      if (calendar[dateStr]) {
        calendar[dateStr].push({
          ...booking,
          is_start: date.isSame(start, 'day'),
          is_end: date.isSame(end, 'day')
        });
      }
    }
  });

  res.json({
    message: 'Calendar retrieved successfully',
    data: {
      calendar,
      month: monthNum,
      year: yearNum,
      total_bookings: bookings?.length || 0
    }
  });
}));

/**
 * @route GET /api/bookings/stats
 * @desc Get booking statistics for the user
 * @access Private
 */
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const { period = '30' } = req.query; // days
  const startDate = moment().subtract(parseInt(period), 'days').format('YYYY-MM-DD');

  // Get booking stats as owner
  const { data: ownerStats } = await db.supabase
    .from('bookings')
    .select('status, total_amount, created_at')
    .eq('owner_id', req.user.id)
    .gte('created_at', startDate);

  // Get booking stats as renter
  const { data: renterStats } = await db.supabase
    .from('bookings')
    .select('status, total_amount, created_at')
    .eq('renter_id', req.user.id)
    .gte('created_at', startDate);

  // Calculate statistics
  const stats = {
    as_owner: {
      total: ownerStats?.length || 0,
      pending: ownerStats?.filter(b => b.status === 'pending').length || 0,
      confirmed: ownerStats?.filter(b => b.status === 'confirmed').length || 0,
      active: ownerStats?.filter(b => b.status === 'active').length || 0,
      completed: ownerStats?.filter(b => b.status === 'completed').length || 0,
      cancelled: ownerStats?.filter(b => b.status === 'cancelled').length || 0,
      total_earnings: ownerStats?.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0) || 0
    },
    as_renter: {
      total: renterStats?.length || 0,
      pending: renterStats?.filter(b => b.status === 'pending').length || 0,
      confirmed: renterStats?.filter(b => b.status === 'confirmed').length || 0,
      active: renterStats?.filter(b => b.status === 'active').length || 0,
      completed: renterStats?.filter(b => b.status === 'completed').length || 0,
      cancelled: renterStats?.filter(b => b.status === 'cancelled').length || 0,
      total_spent: renterStats?.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0) || 0
    }
  };

  res.json({
    message: 'Booking statistics retrieved successfully',
    data: {
      stats,
      period: parseInt(period)
    }
  });
}));

module.exports = router;
