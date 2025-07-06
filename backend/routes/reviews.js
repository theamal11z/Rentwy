const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError, ForbiddenError, ConflictError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const createReviewSchema = Joi.object({
  booking_id: Joi.string().uuid().required(),
  reviewee_id: Joi.string().uuid().required(),
  item_id: Joi.string().uuid().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().max(255),
  comment: Joi.string().min(10).max(1000).required(),
  review_type: Joi.string().valid('item', 'renter', 'owner').required()
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  title: Joi.string().max(255),
  comment: Joi.string().min(10).max(1000)
});

/**
 * @route GET /api/reviews
 * @desc Get reviews with filtering options
 * @access Public
 */
router.get('/', asyncHandler(async (req, res) => {
  const { 
    reviewee_id, 
    item_id, 
    review_type = 'all',
    rating,
    page = 1, 
    limit = 20 
  } = req.query;
  
  const offset = (page - 1) * limit;

  let query = db.supabase
    .from('reviews')
    .select(`
      *,
      reviewer:users!reviewer_id(id, full_name, profile_image_url),
      reviewee:users!reviewee_id(id, full_name, profile_image_url),
      items(id, title, images),
      bookings(id, start_date, end_date)
    `, { count: 'exact' })
    .eq('is_approved', true);

  // Apply filters
  if (reviewee_id) {
    query = query.eq('reviewee_id', reviewee_id);
  }
  if (item_id) {
    query = query.eq('item_id', item_id);
  }
  if (review_type && review_type !== 'all') {
    query = query.eq('review_type', review_type);
  }
  if (rating) {
    query = query.eq('rating', parseInt(rating));
  }

  // Apply pagination and sorting
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  const { data: reviews, error, count } = await query;
  if (error) throw error;

  res.json({
    message: 'Reviews retrieved successfully',
    data: {
      reviews: reviews || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      has_more: (count || 0) > offset + parseInt(limit)
    }
  });
}));

/**
 * @route GET /api/reviews/:id
 * @desc Get single review by ID
 * @access Public
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: review, error } = await db.supabase
    .from('reviews')
    .select(`
      *,
      reviewer:users!reviewer_id(id, full_name, profile_image_url),
      reviewee:users!reviewee_id(id, full_name, profile_image_url),
      items(id, title, images),
      bookings(id, start_date, end_date, total_amount)
    `)
    .eq('id', id)
    .eq('is_approved', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!review) {
    throw new NotFoundError('Review not found');
  }

  res.json({
    message: 'Review retrieved successfully',
    data: { review }
  });
}));

/**
 * @route POST /api/reviews
 * @desc Create a new review
 * @access Private
 */
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { error, value } = createReviewSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { booking_id, reviewee_id, item_id, rating, title, comment, review_type } = value;

  // Get booking details to verify review permissions
  const booking = await db.bookings.findById(booking_id);
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Check if booking is completed
  if (booking.status !== 'completed') {
    throw new ForbiddenError('Reviews can only be created for completed bookings');
  }

  // Check if user is involved in the booking
  const isRenter = booking.renter_id === req.user.id;
  const isOwner = booking.owner_id === req.user.id;

  if (!isRenter && !isOwner) {
    throw new ForbiddenError('You can only review bookings you were involved in');
  }

  // Validate reviewee_id based on review type and user role
  let validReviewee = false;
  if (review_type === 'item' && isRenter && reviewee_id === booking.owner_id) {
    validReviewee = true; // Renter reviewing item (owner)
  } else if (review_type === 'renter' && isOwner && reviewee_id === booking.renter_id) {
    validReviewee = true; // Owner reviewing renter
  } else if (review_type === 'owner' && isRenter && reviewee_id === booking.owner_id) {
    validReviewee = true; // Renter reviewing owner
  }

  if (!validReviewee) {
    throw new ForbiddenError('Invalid review type or reviewee for this booking');
  }

  // Check if review already exists
  const { data: existingReview } = await db.supabase
    .from('reviews')
    .select('*')
    .eq('booking_id', booking_id)
    .eq('reviewer_id', req.user.id)
    .eq('review_type', review_type)
    .single();

  if (existingReview) {
    throw new ConflictError('You have already reviewed this booking');
  }

  // Create review
  const reviewData = {
    id: uuidv4(),
    booking_id,
    reviewer_id: req.user.id,
    reviewee_id,
    item_id,
    rating,
    title,
    comment,
    review_type,
    is_approved: true, // Auto-approve for now
    created_at: new Date().toISOString()
  };

  const { data: review, error: createError } = await db.supabase
    .from('reviews')
    .insert([reviewData])
    .select(`
      *,
      reviewer:users!reviewer_id(id, full_name, profile_image_url),
      reviewee:users!reviewee_id(id, full_name, profile_image_url),
      items(id, title, images)
    `)
    .single();

  if (createError) throw createError;

  res.status(201).json({
    message: 'Review created successfully',
    data: { review }
  });
}));

/**
 * @route PUT /api/reviews/:id
 * @desc Update a review
 * @access Private
 */
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateReviewSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  // Get existing review
  const { data: existingReview, error: findError } = await db.supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .single();

  if (findError && findError.code !== 'PGRST116') throw findError;
  if (!existingReview) {
    throw new NotFoundError('Review not found');
  }

  // Check if user owns the review
  if (existingReview.reviewer_id !== req.user.id) {
    throw new ForbiddenError('You can only update your own reviews');
  }

  // Update review
  const { data: review, error: updateError } = await db.supabase
    .from('reviews')
    .update({
      ...value,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      reviewer:users!reviewer_id(id, full_name, profile_image_url),
      reviewee:users!reviewee_id(id, full_name, profile_image_url),
      items(id, title, images)
    `)
    .single();

  if (updateError) throw updateError;

  res.json({
    message: 'Review updated successfully',
    data: { review }
  });
}));

/**
 * @route DELETE /api/reviews/:id
 * @desc Delete a review
 * @access Private
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get existing review
  const { data: existingReview, error: findError } = await db.supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .single();

  if (findError && findError.code !== 'PGRST116') throw findError;
  if (!existingReview) {
    throw new NotFoundError('Review not found');
  }

  // Check if user owns the review
  if (existingReview.reviewer_id !== req.user.id) {
    throw new ForbiddenError('You can only delete your own reviews');
  }

  // Delete review
  const { error: deleteError } = await db.supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (deleteError) throw deleteError;

  res.json({
    message: 'Review deleted successfully'
  });
}));

/**
 * @route GET /api/reviews/user/:userId/stats
 * @desc Get review statistics for a user
 * @access Public
 */
router.get('/user/:userId/stats', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Get overall stats
  const { data: reviews } = await db.supabase
    .from('reviews')
    .select('rating, review_type')
    .eq('reviewee_id', userId)
    .eq('is_approved', true);

  if (!reviews) {
    return res.json({
      message: 'Review statistics retrieved successfully',
      data: {
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        by_type: {
          item: { count: 0, average: 0 },
          renter: { count: 0, average: 0 },
          owner: { count: 0, average: 0 }
        }
      }
    });
  }

  // Calculate statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
    : 0;

  // Rating distribution
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(review => {
    ratingDistribution[review.rating]++;
  });

  // By review type
  const byType = {
    item: { count: 0, average: 0 },
    renter: { count: 0, average: 0 },
    owner: { count: 0, average: 0 }
  };

  ['item', 'renter', 'owner'].forEach(type => {
    const typeReviews = reviews.filter(r => r.review_type === type);
    byType[type].count = typeReviews.length;
    byType[type].average = typeReviews.length > 0
      ? typeReviews.reduce((sum, r) => sum + r.rating, 0) / typeReviews.length
      : 0;
  });

  res.json({
    message: 'Review statistics retrieved successfully',
    data: {
      total_reviews: totalReviews,
      average_rating: Math.round(averageRating * 100) / 100,
      rating_distribution: ratingDistribution,
      by_type: byType
    }
  });
}));

/**
 * @route GET /api/reviews/item/:itemId
 * @desc Get reviews for a specific item
 * @access Public
 */
router.get('/item/:itemId', asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const { data: reviews, error, count } = await db.supabase
    .from('reviews')
    .select(`
      *,
      reviewer:users!reviewer_id(id, full_name, profile_image_url),
      bookings(id, start_date, end_date)
    `, { count: 'exact' })
    .eq('item_id', itemId)
    .eq('review_type', 'item')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (error) throw error;

  // Calculate item rating stats
  const ratings = reviews?.map(r => r.rating) || [];
  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
    : 0;

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(rating => {
    ratingDistribution[rating]++;
  });

  res.json({
    message: 'Item reviews retrieved successfully',
    data: {
      reviews: reviews || [],
      total: count || 0,
      average_rating: Math.round(avgRating * 100) / 100,
      rating_distribution: ratingDistribution,
      page: parseInt(page),
      limit: parseInt(limit),
      has_more: (count || 0) > offset + parseInt(limit)
    }
  });
}));

/**
 * @route GET /api/reviews/pending
 * @desc Get pending reviews for the current user (bookings they can review)
 * @access Private
 */
router.get('/pending', authenticateToken, asyncHandler(async (req, res) => {
  // Get completed bookings where user hasn't left reviews yet
  const { data: completedBookings } = await db.supabase
    .from('bookings')
    .select(`
      *,
      items(id, title, images, user_id),
      renter:users!renter_id(id, full_name, profile_image_url),
      owner:users!owner_id(id, full_name, profile_image_url)
    `)
    .or(`renter_id.eq.${req.user.id},owner_id.eq.${req.user.id}`)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (!completedBookings) {
    return res.json({
      message: 'Pending reviews retrieved successfully',
      data: { pending_reviews: [] }
    });
  }

  // Check which reviews are missing
  const pendingReviews = [];

  for (const booking of completedBookings) {
    const isRenter = booking.renter_id === req.user.id;
    const isOwner = booking.owner_id === req.user.id;

    // Check existing reviews for this booking by this user
    const { data: existingReviews } = await db.supabase
      .from('reviews')
      .select('review_type')
      .eq('booking_id', booking.id)
      .eq('reviewer_id', req.user.id);

    const existingTypes = existingReviews?.map(r => r.review_type) || [];

    // Determine what reviews can be left
    if (isRenter) {
      // Renter can review the item and the owner
      if (!existingTypes.includes('item')) {
        pendingReviews.push({
          booking,
          review_type: 'item',
          reviewee_id: booking.owner_id,
          reviewee: booking.owner
        });
      }
      if (!existingTypes.includes('owner')) {
        pendingReviews.push({
          booking,
          review_type: 'owner',
          reviewee_id: booking.owner_id,
          reviewee: booking.owner
        });
      }
    }

    if (isOwner) {
      // Owner can review the renter
      if (!existingTypes.includes('renter')) {
        pendingReviews.push({
          booking,
          review_type: 'renter',
          reviewee_id: booking.renter_id,
          reviewee: booking.renter
        });
      }
    }
  }

  res.json({
    message: 'Pending reviews retrieved successfully',
    data: { pending_reviews: pendingReviews }
  });
}));

module.exports = router;
