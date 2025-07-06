const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError, ForbiddenError, ConflictError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const addPaymentMethodSchema = Joi.object({
  payment_method_id: Joi.string().required(), // Stripe payment method ID
  is_default: Joi.boolean().default(false)
});

const addPayoutMethodSchema = Joi.object({
  method_type: Joi.string().valid('bank', 'paypal', 'stripe').required(),
  account_name: Joi.string().max(255).required(),
  bank_name: Joi.string().max(255).when('method_type', {
    is: 'bank',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  routing_number: Joi.string().when('method_type', {
    is: 'bank',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  account_number: Joi.string().when('method_type', {
    is: 'bank',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  external_id: Joi.string().max(255),
  is_default: Joi.boolean().default(false)
});

const processPaymentSchema = Joi.object({
  booking_id: Joi.string().uuid().required(),
  payment_method_id: Joi.string().required(),
  save_payment_method: Joi.boolean().default(false)
});

/**
 * @route GET /api/payments/methods
 * @desc Get user's payment methods
 * @access Private
 */
router.get('/methods', authenticateToken, asyncHandler(async (req, res) => {
  const { data: paymentMethods, error } = await db.supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', req.user.id)
    .is('deleted_at', null)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Remove sensitive data before sending
  const safeMethods = (paymentMethods || []).map(method => ({
    id: method.id,
    method_type: method.method_type,
    card_type: method.card_type,
    last_four: method.last_four,
    expiry_month: method.expiry_month,
    expiry_year: method.expiry_year,
    cardholder_name: method.cardholder_name,
    is_default: method.is_default,
    is_verified: method.is_verified,
    created_at: method.created_at
  }));

  res.json({
    message: 'Payment methods retrieved successfully',
    data: {
      payment_methods: safeMethods,
      total: safeMethods.length
    }
  });
}));

/**
 * @route POST /api/payments/methods
 * @desc Add new payment method
 * @access Private
 */
router.post('/methods', authenticateToken, asyncHandler(async (req, res) => {
  const { error, value } = addPaymentMethodSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { payment_method_id, is_default } = value;

  try {
    // Retrieve payment method from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);
    
    if (!paymentMethod) {
      throw new ValidationError('Invalid payment method ID');
    }

    // Attach payment method to customer if not already attached
    if (!paymentMethod.customer) {
      // Get or create Stripe customer
      let customerId = req.user.stripe_customer_id;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: req.user.email,
          name: req.user.full_name,
          metadata: {
            user_id: req.user.id
          }
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await db.users.update(req.user.id, {
          stripe_customer_id: customerId
        });
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(payment_method_id, {
        customer: customerId,
      });
    }

    // If this is set as default, unset other default payment methods
    if (is_default) {
      await db.supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', req.user.id);
    }

    // Save payment method to database
    const paymentMethodData = {
      id: uuidv4(),
      user_id: req.user.id,
      method_type: 'card',
      external_id: payment_method_id,
      is_default,
      is_verified: true,
      created_at: new Date().toISOString()
    };

    // Add card-specific details
    if (paymentMethod.card) {
      paymentMethodData.card_type = paymentMethod.card.brand;
      paymentMethodData.last_four = paymentMethod.card.last4;
      paymentMethodData.expiry_month = paymentMethod.card.exp_month;
      paymentMethodData.expiry_year = paymentMethod.card.exp_year;
      paymentMethodData.cardholder_name = paymentMethod.billing_details?.name;
    }

    const { data: savedMethod, error: saveError } = await db.supabase
      .from('payment_methods')
      .insert([paymentMethodData])
      .select()
      .single();

    if (saveError) throw saveError;

    // Remove sensitive data before sending
    const safeMethod = {
      id: savedMethod.id,
      method_type: savedMethod.method_type,
      card_type: savedMethod.card_type,
      last_four: savedMethod.last_four,
      expiry_month: savedMethod.expiry_month,
      expiry_year: savedMethod.expiry_year,
      cardholder_name: savedMethod.cardholder_name,
      is_default: savedMethod.is_default,
      is_verified: savedMethod.is_verified,
      created_at: savedMethod.created_at
    };

    res.status(201).json({
      message: 'Payment method added successfully',
      data: { payment_method: safeMethod }
    });

  } catch (stripeError) {
    if (stripeError.type === 'StripeCardError') {
      throw new ValidationError(stripeError.message);
    }
    throw stripeError;
  }
}));

/**
 * @route DELETE /api/payments/methods/:id
 * @desc Delete payment method
 * @access Private
 */
router.delete('/methods/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get payment method
  const { data: paymentMethod, error } = await db.supabase
    .from('payment_methods')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!paymentMethod) {
    throw new NotFoundError('Payment method not found');
  }

  try {
    // Detach from Stripe if external_id exists
    if (paymentMethod.external_id) {
      await stripe.paymentMethods.detach(paymentMethod.external_id);
    }
  } catch (stripeError) {
    console.warn('Failed to detach payment method from Stripe:', stripeError.message);
  }

  // Soft delete payment method
  const { error: deleteError } = await db.supabase
    .from('payment_methods')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (deleteError) throw deleteError;

  res.json({
    message: 'Payment method deleted successfully'
  });
}));

/**
 * @route GET /api/payments/payout-methods
 * @desc Get user's payout methods
 * @access Private
 */
router.get('/payout-methods', authenticateToken, asyncHandler(async (req, res) => {
  const { data: payoutMethods, error } = await db.supabase
    .from('payout_methods')
    .select('*')
    .eq('user_id', req.user.id)
    .is('deleted_at', null)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Remove sensitive data before sending
  const safeMethods = (payoutMethods || []).map(method => ({
    id: method.id,
    method_type: method.method_type,
    account_name: method.account_name,
    bank_name: method.bank_name,
    is_default: method.is_default,
    is_verified: method.is_verified,
    created_at: method.created_at
  }));

  res.json({
    message: 'Payout methods retrieved successfully',
    data: {
      payout_methods: safeMethods,
      total: safeMethods.length
    }
  });
}));

/**
 * @route POST /api/payments/payout-methods
 * @desc Add new payout method
 * @access Private
 */
router.post('/payout-methods', authenticateToken, asyncHandler(async (req, res) => {
  const { error, value } = addPayoutMethodSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { method_type, account_name, bank_name, routing_number, account_number, external_id, is_default } = value;

  // If this is set as default, unset other default payout methods
  if (is_default) {
    await db.supabase
      .from('payout_methods')
      .update({ is_default: false })
      .eq('user_id', req.user.id);
  }

  // Encrypt sensitive data (in production, use proper encryption)
  const payoutMethodData = {
    id: uuidv4(),
    user_id: req.user.id,
    method_type,
    account_name,
    bank_name,
    external_id,
    is_default,
    is_verified: false, // Require manual verification
    created_at: new Date().toISOString()
  };

  // Store encrypted account details (simplified for demo)
  if (routing_number) {
    payoutMethodData.routing_number_encrypted = Buffer.from(routing_number).toString('base64');
  }
  if (account_number) {
    payoutMethodData.account_number_encrypted = Buffer.from(account_number).toString('base64');
  }

  const { data: savedMethod, error: saveError } = await db.supabase
    .from('payout_methods')
    .insert([payoutMethodData])
    .select()
    .single();

  if (saveError) throw saveError;

  // Remove sensitive data before sending
  const safeMethod = {
    id: savedMethod.id,
    method_type: savedMethod.method_type,
    account_name: savedMethod.account_name,
    bank_name: savedMethod.bank_name,
    is_default: savedMethod.is_default,
    is_verified: savedMethod.is_verified,
    created_at: savedMethod.created_at
  };

  res.status(201).json({
    message: 'Payout method added successfully',
    data: { payout_method: safeMethod }
  });
}));

/**
 * @route POST /api/payments/process
 * @desc Process payment for a booking
 * @access Private
 */
router.post('/process', authenticateToken, asyncHandler(async (req, res) => {
  const { error, value } = processPaymentSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { booking_id, payment_method_id, save_payment_method } = value;

  // Get booking details
  const booking = await db.bookings.findById(booking_id);
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Verify user is the renter
  if (booking.renter_id !== req.user.id) {
    throw new ForbiddenError('You can only pay for your own bookings');
  }

  // Check booking status
  if (booking.status !== 'confirmed') {
    throw new ConflictError('Only confirmed bookings can be paid');
  }

  try {
    // Get or create Stripe customer
    let customerId = req.user.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.full_name,
        metadata: {
          user_id: req.user.id
        }
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await db.users.update(req.user.id, {
        stripe_customer_id: customerId
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.total_amount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      payment_method: payment_method_id,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/booking/${booking_id}`,
      metadata: {
        booking_id: booking.id,
        user_id: req.user.id,
        item_id: booking.item_id
      }
    });

    // Create transaction record
    const transactionData = {
      id: uuidv4(),
      booking_id: booking.id,
      user_id: req.user.id,
      transaction_type: 'rental_payment',
      amount: booking.total_amount,
      currency: 'USD',
      external_transaction_id: paymentIntent.id,
      processor: 'stripe',
      status: paymentIntent.status === 'succeeded' ? 'completed' : 'processing',
      description: `Payment for booking ${booking.id}`,
      metadata: {
        stripe_payment_intent_id: paymentIntent.id
      },
      processed_at: paymentIntent.status === 'succeeded' ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    };

    const { data: transaction, error: transactionError } = await db.supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Update booking status if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      await db.bookings.update(booking.id, {
        status: 'active'
      });
    }

    // Save payment method if requested
    if (save_payment_method) {
      // Implementation similar to adding payment method
      // (omitted for brevity)
    }

    res.json({
      message: 'Payment processed successfully',
      data: {
        transaction,
        payment_status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        requires_action: paymentIntent.status === 'requires_action'
      }
    });

  } catch (stripeError) {
    // Log the error and create failed transaction record
    const transactionData = {
      id: uuidv4(),
      booking_id: booking.id,
      user_id: req.user.id,
      transaction_type: 'rental_payment',
      amount: booking.total_amount,
      currency: 'USD',
      processor: 'stripe',
      status: 'failed',
      description: `Failed payment for booking ${booking.id}`,
      metadata: {
        error: stripeError.message
      },
      created_at: new Date().toISOString()
    };

    await db.supabase
      .from('transactions')
      .insert([transactionData]);

    if (stripeError.type === 'StripeCardError') {
      throw new ValidationError(stripeError.message);
    }
    throw stripeError;
  }
}));

/**
 * @route GET /api/payments/transactions
 * @desc Get user's transaction history
 * @access Private
 */
router.get('/transactions', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, type } = req.query;
  const offset = (page - 1) * limit;

  let query = db.supabase
    .from('transactions')
    .select(`
      *,
      bookings(
        id, start_date, end_date,
        items(id, title, images)
      )
    `, { count: 'exact' })
    .eq('user_id', req.user.id);

  // Apply filters
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  if (type && type !== 'all') {
    query = query.eq('transaction_type', type);
  }

  // Apply pagination and sorting
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  const { data: transactions, error, count } = await query;
  if (error) throw error;

  res.json({
    message: 'Transactions retrieved successfully',
    data: {
      transactions: transactions || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      has_more: (count || 0) > offset + parseInt(limit)
    }
  });
}));

/**
 * @route POST /api/payments/refund
 * @desc Process refund for a transaction
 * @access Private
 */
router.post('/refund', authenticateToken, asyncHandler(async (req, res) => {
  const { transaction_id, reason } = req.body;

  if (!transaction_id) {
    throw new ValidationError('Transaction ID is required');
  }

  // Get transaction
  const { data: transaction, error } = await db.supabase
    .from('transactions')
    .select('*')
    .eq('id', transaction_id)
    .eq('user_id', req.user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  if (transaction.status !== 'completed') {
    throw new ConflictError('Only completed transactions can be refunded');
  }

  try {
    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: transaction.external_transaction_id,
      reason: 'requested_by_customer',
      metadata: {
        original_transaction_id: transaction.id,
        refund_reason: reason
      }
    });

    // Create refund transaction record
    const refundTransactionData = {
      id: uuidv4(),
      booking_id: transaction.booking_id,
      user_id: req.user.id,
      transaction_type: 'refund',
      amount: -transaction.amount, // Negative amount for refund
      currency: transaction.currency,
      external_transaction_id: refund.id,
      processor: 'stripe',
      status: refund.status === 'succeeded' ? 'completed' : 'processing',
      description: `Refund for transaction ${transaction.id}`,
      metadata: {
        original_transaction_id: transaction.id,
        stripe_refund_id: refund.id,
        reason
      },
      processed_at: refund.status === 'succeeded' ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    };

    const { data: refundTransaction, error: refundError } = await db.supabase
      .from('transactions')
      .insert([refundTransactionData])
      .select()
      .single();

    if (refundError) throw refundError;

    res.json({
      message: 'Refund processed successfully',
      data: {
        refund_transaction: refundTransaction,
        refund_status: refund.status
      }
    });

  } catch (stripeError) {
    if (stripeError.type === 'StripeInvalidRequestError') {
      throw new ValidationError(stripeError.message);
    }
    throw stripeError;
  }
}));

/**
 * @route GET /api/payments/earnings
 * @desc Get user's earnings summary
 * @access Private
 */
router.get('/earnings', authenticateToken, asyncHandler(async (req, res) => {
  const { period = '30' } = req.query; // days
  const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

  // Get earnings from completed rental payouts
  const { data: earnings } = await db.supabase
    .from('transactions')
    .select('amount, created_at, booking_id')
    .eq('user_id', req.user.id)
    .eq('transaction_type', 'rental_payout')
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString());

  const totalEarnings = earnings?.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0) || 0;
  const transactionCount = earnings?.length || 0;

  // Get pending payouts
  const { data: pending } = await db.supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', req.user.id)
    .eq('transaction_type', 'rental_payout')
    .eq('status', 'pending');

  const pendingEarnings = pending?.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0) || 0;

  res.json({
    message: 'Earnings summary retrieved successfully',
    data: {
      total_earnings: totalEarnings,
      pending_earnings: pendingEarnings,
      transaction_count: transactionCount,
      period_days: parseInt(period),
      average_per_transaction: transactionCount > 0 ? totalEarnings / transactionCount : 0
    }
  });
}));

module.exports = router;
