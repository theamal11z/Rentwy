const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError, ForbiddenError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const sendNotificationSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  type: Joi.string().valid(
    'booking_request', 'booking_confirmed', 'booking_cancelled',
    'message_received', 'payment_received', 'review_received',
    'item_favorited', 'system_update', 'marketing'
  ).required(),
  title: Joi.string().max(255).required(),
  message: Joi.string().required(),
  booking_id: Joi.string().uuid(),
  item_id: Joi.string().uuid(),
  sender_id: Joi.string().uuid(),
  send_push: Joi.boolean().default(true),
  send_email: Joi.boolean().default(false),
  send_sms: Joi.boolean().default(false)
});

const updateNotificationPreferencesSchema = Joi.object({
  push_notifications: Joi.boolean(),
  email_notifications: Joi.boolean(),
  sms_notifications: Joi.boolean(),
  marketing_emails: Joi.boolean(),
  booking_reminders: Joi.boolean()
});

// Helper function to check if user allows specific notification type
const checkNotificationPreference = async (userId, notificationType, deliveryMethod) => {
  const { data: settings } = await db.supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!settings) return true; // Default to allowing notifications

  switch (deliveryMethod) {
    case 'push':
      return settings.push_notifications;
    case 'email':
      return settings.email_notifications && (notificationType !== 'marketing' || settings.marketing_emails);
    case 'sms':
      return settings.sms_notifications;
    default:
      return true;
  }
};

// Helper function to send actual notifications (integrates with external services)
const sendActualNotification = async (notification, deliveryMethods) => {
  // This is a placeholder for actual notification sending
  // In production, integrate with services like:
  // - Firebase for push notifications
  // - SendGrid/AWS SES for emails
  // - Twilio for SMS

  const results = {
    push: false,
    email: false,
    sms: false
  };

  if (deliveryMethods.push) {
    // TODO: Send push notification via Firebase
    console.log(`Push notification sent to user ${notification.user_id}: ${notification.title}`);
    results.push = true;
  }

  if (deliveryMethods.email) {
    // TODO: Send email notification
    console.log(`Email notification sent to user ${notification.user_id}: ${notification.title}`);
    results.email = true;
  }

  if (deliveryMethods.sms) {
    // TODO: Send SMS notification
    console.log(`SMS notification sent to user ${notification.user_id}: ${notification.title}`);
    results.sms = true;
  }

  return results;
};

/**
 * @route GET /api/notifications
 * @desc Get user's notifications
 * @access Private
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, is_read } = req.query;
  const offset = (page - 1) * limit;

  let query = db.supabase
    .from('notifications')
    .select(`
      *,
      sender:users!sender_id(id, full_name, profile_image_url),
      items(id, title, images),
      bookings(id, start_date, end_date, status)
    `, { count: 'exact' })
    .eq('user_id', req.user.id);

  // Apply filters
  if (type && type !== 'all') {
    query = query.eq('type', type);
  }
  if (is_read !== undefined) {
    query = query.eq('is_read', is_read === 'true');
  }

  // Apply pagination and sorting
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  const { data: notifications, error, count } = await query;
  if (error) throw error;

  res.json({
    message: 'Notifications retrieved successfully',
    data: {
      notifications: notifications || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      has_more: (count || 0) > offset + parseInt(limit)
    }
  });
}));

/**
 * @route GET /api/notifications/unread-count
 * @desc Get count of unread notifications
 * @access Private
 */
router.get('/unread-count', authenticateToken, asyncHandler(async (req, res) => {
  const { count, error } = await db.supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', req.user.id)
    .eq('is_read', false);

  if (error) throw error;

  res.json({
    message: 'Unread count retrieved successfully',
    data: { unread_count: count || 0 }
  });
}));

/**
 * @route POST /api/notifications
 * @desc Send a notification (admin/system use)
 * @access Private
 */
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { error, value } = sendNotificationSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { 
    user_id, type, title, message, booking_id, item_id, sender_id,
    send_push, send_email, send_sms 
  } = value;

  // Check if user allows this type of notification
  const allowPush = send_push && await checkNotificationPreference(user_id, type, 'push');
  const allowEmail = send_email && await checkNotificationPreference(user_id, type, 'email');
  const allowSms = send_sms && await checkNotificationPreference(user_id, type, 'sms');

  // Create notification record
  const notificationData = {
    id: uuidv4(),
    user_id,
    type,
    title,
    message,
    booking_id,
    item_id,
    sender_id: sender_id || req.user.id,
    is_read: false,
    sent_push: false,
    sent_email: false,
    sent_sms: false,
    created_at: new Date().toISOString()
  };

  const { data: notification, error: createError } = await db.supabase
    .from('notifications')
    .insert([notificationData])
    .select(`
      *,
      sender:users!sender_id(id, full_name, profile_image_url),
      items(id, title, images),
      bookings(id, start_date, end_date, status)
    `)
    .single();

  if (createError) throw createError;

  // Send actual notifications
  const deliveryResults = await sendActualNotification(notification, {
    push: allowPush,
    email: allowEmail,
    sms: allowSms
  });

  // Update notification record with delivery status
  await db.supabase
    .from('notifications')
    .update({
      sent_push: deliveryResults.push,
      sent_email: deliveryResults.email,
      sent_sms: deliveryResults.sms
    })
    .eq('id', notification.id);

  // Emit real-time notification via WebSocket if available
  if (req.app && req.app.get('io')) {
    req.app.get('io').to(`user-${user_id}`).emit('new-notification', notification);
  }

  res.status(201).json({
    message: 'Notification sent successfully',
    data: {
      notification,
      delivery_status: deliveryResults
    }
  });
}));

/**
 * @route PUT /api/notifications/:id/read
 * @desc Mark notification as read
 * @access Private
 */
router.put('/:id/read', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify notification belongs to user
  const { data: existingNotification, error: findError } = await db.supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (findError && findError.code !== 'PGRST116') throw findError;
  if (!existingNotification) {
    throw new NotFoundError('Notification not found');
  }

  // Mark as read
  const { data: notification, error: updateError } = await db.supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) throw updateError;

  res.json({
    message: 'Notification marked as read',
    data: { notification }
  });
}));

/**
 * @route PUT /api/notifications/mark-all-read
 * @desc Mark all notifications as read
 * @access Private
 */
router.put('/mark-all-read', authenticateToken, asyncHandler(async (req, res) => {
  const { error } = await db.supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('user_id', req.user.id)
    .eq('is_read', false);

  if (error) throw error;

  res.json({
    message: 'All notifications marked as read'
  });
}));

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete a notification
 * @access Private
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify notification belongs to user
  const { data: existingNotification, error: findError } = await db.supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (findError && findError.code !== 'PGRST116') throw findError;
  if (!existingNotification) {
    throw new NotFoundError('Notification not found');
  }

  // Delete notification
  const { error: deleteError } = await db.supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (deleteError) throw deleteError;

  res.json({
    message: 'Notification deleted successfully'
  });
}));

/**
 * @route GET /api/notifications/preferences
 * @desc Get user's notification preferences
 * @access Private
 */
router.get('/preferences', authenticateToken, asyncHandler(async (req, res) => {
  const { data: settings, error } = await db.supabase
    .from('user_settings')
    .select('push_notifications, email_notifications, sms_notifications, marketing_emails, booking_reminders')
    .eq('user_id', req.user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  // Return default preferences if none exist
  const preferences = settings || {
    push_notifications: true,
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: false,
    booking_reminders: true
  };

  res.json({
    message: 'Notification preferences retrieved successfully',
    data: { preferences }
  });
}));

/**
 * @route PUT /api/notifications/preferences
 * @desc Update user's notification preferences
 * @access Private
 */
router.put('/preferences', authenticateToken, asyncHandler(async (req, res) => {
  const { error, value } = updateNotificationPreferencesSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  // Upsert notification preferences
  const { data: settings, error: upsertError } = await db.supabase
    .from('user_settings')
    .upsert({
      user_id: req.user.id,
      ...value,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (upsertError) throw upsertError;

  res.json({
    message: 'Notification preferences updated successfully',
    data: { preferences: settings }
  });
}));

/**
 * @route POST /api/notifications/send-booking-notification
 * @desc Send booking-related notification
 * @access Private
 */
router.post('/send-booking-notification', authenticateToken, asyncHandler(async (req, res) => {
  const { booking_id, notification_type } = req.body;

  if (!booking_id || !notification_type) {
    throw new ValidationError('Booking ID and notification type are required');
  }

  // Get booking details
  const booking = await db.bookings.findById(booking_id);
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Determine recipient and message based on notification type and user role
  let recipientId, title, message;

  switch (notification_type) {
    case 'booking_request':
      recipientId = booking.owner_id;
      title = 'New Booking Request';
      message = `You have a new booking request for your item "${booking.items?.title}"`;
      break;
    
    case 'booking_confirmed':
      recipientId = booking.renter_id;
      title = 'Booking Confirmed';
      message = `Your booking for "${booking.items?.title}" has been confirmed`;
      break;
    
    case 'booking_cancelled':
      recipientId = req.user.id === booking.renter_id ? booking.owner_id : booking.renter_id;
      title = 'Booking Cancelled';
      message = `The booking for "${booking.items?.title}" has been cancelled`;
      break;
    
    default:
      throw new ValidationError('Invalid notification type');
  }

  // Send notification
  const notificationData = {
    user_id: recipientId,
    type: notification_type,
    title,
    message,
    booking_id,
    item_id: booking.item_id,
    sender_id: req.user.id,
    send_push: true,
    send_email: true,
    send_sms: false
  };

  // Use the same logic as the main notification endpoint
  const allowPush = await checkNotificationPreference(recipientId, notification_type, 'push');
  const allowEmail = await checkNotificationPreference(recipientId, notification_type, 'email');

  const notificationRecord = {
    id: uuidv4(),
    ...notificationData,
    is_read: false,
    sent_push: false,
    sent_email: false,
    sent_sms: false,
    created_at: new Date().toISOString()
  };

  const { data: notification, error: createError } = await db.supabase
    .from('notifications')
    .insert([notificationRecord])
    .select()
    .single();

  if (createError) throw createError;

  // Send actual notifications
  const deliveryResults = await sendActualNotification(notification, {
    push: allowPush,
    email: allowEmail,
    sms: false
  });

  // Update delivery status
  await db.supabase
    .from('notifications')
    .update({
      sent_push: deliveryResults.push,
      sent_email: deliveryResults.email,
      sent_sms: deliveryResults.sms
    })
    .eq('id', notification.id);

  res.json({
    message: 'Booking notification sent successfully',
    data: {
      notification,
      delivery_status: deliveryResults
    }
  });
}));

/**
 * @route GET /api/notifications/templates
 * @desc Get notification templates for different types
 * @access Private
 */
router.get('/templates', authenticateToken, asyncHandler(async (req, res) => {
  const templates = {
    booking_request: {
      title: 'New Booking Request',
      message: 'You have a new booking request for your item "{item_title}"'
    },
    booking_confirmed: {
      title: 'Booking Confirmed',
      message: 'Your booking for "{item_title}" has been confirmed'
    },
    booking_cancelled: {
      title: 'Booking Cancelled',
      message: 'The booking for "{item_title}" has been cancelled'
    },
    message_received: {
      title: 'New Message',
      message: 'You have a new message from {sender_name}'
    },
    payment_received: {
      title: 'Payment Received',
      message: 'You received a payment of ${amount} for your item "{item_title}"'
    },
    review_received: {
      title: 'New Review',
      message: 'You received a new review from {reviewer_name}'
    },
    item_favorited: {
      title: 'Item Favorited',
      message: '{user_name} added your item "{item_title}" to their favorites'
    },
    system_update: {
      title: 'System Update',
      message: 'Important system update: {update_message}'
    }
  };

  res.json({
    message: 'Notification templates retrieved successfully',
    data: { templates }
  });
}));

module.exports = router;
