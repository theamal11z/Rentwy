const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError, ForbiddenError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const sendMessageSchema = Joi.object({
  conversation_id: Joi.string().uuid(),
  recipient_id: Joi.string().uuid(),
  booking_id: Joi.string().uuid(),
  item_id: Joi.string().uuid(),
  message_text: Joi.string().min(1).max(1000).required(),
  message_type: Joi.string().valid('text', 'image', 'system').default('text'),
  attachment_url: Joi.string().uri()
}).xor('conversation_id', 'recipient_id'); // Either conversation_id or recipient_id is required

/**
 * @route GET /api/messages/conversations
 * @desc Get all conversations for the user
 * @access Private
 */
router.get('/conversations', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const { data: conversations, error, count } = await db.supabase
    .from('conversations')
    .select(`
      *,
      participant_1:users!participant_1_id(id, full_name, profile_image_url),
      participant_2:users!participant_2_id(id, full_name, profile_image_url),
      items(id, title, images),
      bookings(id, status, start_date, end_date)
    `, { count: 'exact' })
    .or(`participant_1_id.eq.${req.user.id},participant_2_id.eq.${req.user.id}`)
    .eq('is_archived', false)
    .order('last_message_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (error) throw error;

  // Add other participant info and unread count
  const conversationsWithDetails = await Promise.all(
    (conversations || []).map(async (conversation) => {
      // Determine the other participant
      const otherParticipant = conversation.participant_1_id === req.user.id 
        ? conversation.participant_2 
        : conversation.participant_1;

      // Get unread message count
      const { count: unreadCount } = await db.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversation.id)
        .neq('sender_id', req.user.id)
        .eq('is_read', false);

      return {
        ...conversation,
        other_participant: otherParticipant,
        unread_count: unreadCount || 0
      };
    })
  );

  res.json({
    message: 'Conversations retrieved successfully',
    data: {
      conversations: conversationsWithDetails,
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      has_more: (count || 0) > offset + parseInt(limit)
    }
  });
}));

/**
 * @route GET /api/messages/conversations/:id
 * @desc Get conversation details with messages
 * @access Private
 */
router.get('/conversations/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  // Get conversation details
  const { data: conversation, error: convError } = await db.supabase
    .from('conversations')
    .select(`
      *,
      participant_1:users!participant_1_id(id, full_name, profile_image_url),
      participant_2:users!participant_2_id(id, full_name, profile_image_url),
      items(id, title, images, price_per_day),
      bookings(id, status, start_date, end_date, total_amount)
    `)
    .eq('id', id)
    .single();

  if (convError && convError.code !== 'PGRST116') throw convError;
  if (!conversation) {
    throw new NotFoundError('Conversation not found');
  }

  // Check if user is a participant
  if (conversation.participant_1_id !== req.user.id && conversation.participant_2_id !== req.user.id) {
    throw new ForbiddenError('Access denied');
  }

  // Get messages for this conversation
  const { data: messages, error: msgError, count } = await db.supabase
    .from('messages')
    .select(`
      *,
      sender:users!sender_id(id, full_name, profile_image_url)
    `, { count: 'exact' })
    .eq('conversation_id', id)
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (msgError) throw msgError;

  // Mark messages as read for the current user
  await db.supabase
    .from('messages')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('conversation_id', id)
    .neq('sender_id', req.user.id)
    .eq('is_read', false);

  // Determine other participant
  const otherParticipant = conversation.participant_1_id === req.user.id 
    ? conversation.participant_2 
    : conversation.participant_1;

  res.json({
    message: 'Conversation retrieved successfully',
    data: {
      conversation: {
        ...conversation,
        other_participant: otherParticipant
      },
      messages: (messages || []).reverse(), // Reverse to show oldest first
      total_messages: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      has_more: (count || 0) > offset + parseInt(limit)
    }
  });
}));

/**
 * @route POST /api/messages
 * @desc Send a message
 * @access Private
 */
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { error, value } = sendMessageSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { conversation_id, recipient_id, booking_id, item_id, message_text, message_type, attachment_url } = value;

  let conversationId = conversation_id;

  // If no conversation_id provided, find or create conversation
  if (!conversationId && recipient_id) {
    // Check if conversation already exists
    const { data: existingConversation } = await db.supabase
      .from('conversations')
      .select('*')
      .or(
        `and(participant_1_id.eq.${req.user.id},participant_2_id.eq.${recipient_id}),` +
        `and(participant_1_id.eq.${recipient_id},participant_2_id.eq.${req.user.id})`
      )
      .eq('booking_id', booking_id || null)
      .single();

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      // Create new conversation
      const { data: newConversation, error: convError } = await db.supabase
        .from('conversations')
        .insert([{
          id: uuidv4(),
          participant_1_id: req.user.id,
          participant_2_id: recipient_id,
          booking_id,
          item_id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (convError) throw convError;
      conversationId = newConversation.id;
    }
  }

  // Verify user is part of the conversation
  const { data: conversation } = await db.supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (!conversation || (conversation.participant_1_id !== req.user.id && conversation.participant_2_id !== req.user.id)) {
    throw new ForbiddenError('Access denied');
  }

  // Create message
  const messageData = {
    id: uuidv4(),
    conversation_id: conversationId,
    sender_id: req.user.id,
    message_text,
    message_type,
    attachment_url,
    created_at: new Date().toISOString()
  };

  const { data: message, error: msgError } = await db.supabase
    .from('messages')
    .insert([messageData])
    .select(`
      *,
      sender:users!sender_id(id, full_name, profile_image_url)
    `)
    .single();

  if (msgError) throw msgError;

  // Update conversation with last message info
  await db.supabase
    .from('conversations')
    .update({
      last_message_id: message.id,
      last_message_at: message.created_at,
      last_message_text: message_text.substring(0, 100),
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId);

  res.status(201).json({
    message: 'Message sent successfully',
    data: {
      message,
      conversation_id: conversationId
    }
  });
}));

/**
 * @route PUT /api/messages/:id/read
 * @desc Mark message as read
 * @access Private
 */
router.put('/:id/read', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get message details
  const { data: message, error } = await db.supabase
    .from('messages')
    .select(`
      *,
      conversations!inner(participant_1_id, participant_2_id)
    `)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!message) {
    throw new NotFoundError('Message not found');
  }

  // Check if user is part of the conversation and not the sender
  const conversation = message.conversations;
  const isParticipant = conversation.participant_1_id === req.user.id || conversation.participant_2_id === req.user.id;
  const isSender = message.sender_id === req.user.id;

  if (!isParticipant || isSender) {
    throw new ForbiddenError('Cannot mark this message as read');
  }

  // Mark as read
  const { data: updatedMessage, error: updateError } = await db.supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) throw updateError;

  res.json({
    message: 'Message marked as read',
    data: { message: updatedMessage }
  });
}));

/**
 * @route POST /api/messages/conversations/:id/archive
 * @desc Archive a conversation
 * @access Private
 */
router.post('/conversations/:id/archive', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get conversation
  const { data: conversation, error } = await db.supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!conversation) {
    throw new NotFoundError('Conversation not found');
  }

  // Check if user is a participant
  if (conversation.participant_1_id !== req.user.id && conversation.participant_2_id !== req.user.id) {
    throw new ForbiddenError('Access denied');
  }

  // Archive conversation
  const { data: updatedConversation, error: updateError } = await db.supabase
    .from('conversations')
    .update({
      is_archived: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) throw updateError;

  res.json({
    message: 'Conversation archived successfully',
    data: { conversation: updatedConversation }
  });
}));

/**
 * @route POST /api/messages/conversations/:id/unarchive
 * @desc Unarchive a conversation
 * @access Private
 */
router.post('/conversations/:id/unarchive', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get conversation
  const { data: conversation, error } = await db.supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!conversation) {
    throw new NotFoundError('Conversation not found');
  }

  // Check if user is a participant
  if (conversation.participant_1_id !== req.user.id && conversation.participant_2_id !== req.user.id) {
    throw new ForbiddenError('Access denied');
  }

  // Unarchive conversation
  const { data: updatedConversation, error: updateError } = await db.supabase
    .from('conversations')
    .update({
      is_archived: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) throw updateError;

  res.json({
    message: 'Conversation unarchived successfully',
    data: { conversation: updatedConversation }
  });
}));

/**
 * @route GET /api/messages/unread-count
 * @desc Get total unread message count for user
 * @access Private
 */
router.get('/unread-count', authenticateToken, asyncHandler(async (req, res) => {
  // Get all conversations where user is a participant
  const { data: conversations } = await db.supabase
    .from('conversations')
    .select('id')
    .or(`participant_1_id.eq.${req.user.id},participant_2_id.eq.${req.user.id}`)
    .eq('is_archived', false);

  if (!conversations || conversations.length === 0) {
    return res.json({
      message: 'Unread count retrieved successfully',
      data: { unread_count: 0 }
    });
  }

  // Get unread message count
  const conversationIds = conversations.map(c => c.id);
  const { count } = await db.supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('conversation_id', conversationIds)
    .neq('sender_id', req.user.id)
    .eq('is_read', false);

  res.json({
    message: 'Unread count retrieved successfully',
    data: { unread_count: count || 0 }
  });
}));

module.exports = router;
