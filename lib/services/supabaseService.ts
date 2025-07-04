import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type Item = Tables['items']['Row'];
type Category = Tables['categories']['Row'];
type Booking = Tables['bookings']['Row'];
type Review = Tables['reviews']['Row'];
type Favorite = Tables['favorites']['Row'];
type User = Tables['users']['Row'];

export class SupabaseService {
  // User operations
  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Category operations
  static async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  static async getCategoryById(categoryId: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Item operations
  static async getItems(options?: {
    categoryId?: string;
    userId?: string;
    limit?: number;
    offset?: number;
    searchQuery?: string;
  }) {
    let query = supabase
      .from('items')
      .select(`
        *,
        categories(*),
        users(*)
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options?.searchQuery) {
      query = query.ilike('title', `%${options.searchQuery}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  static async getItemById(itemId: string) {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        categories(*),
        users(*)
      `)
      .eq('id', itemId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createItem(item: Tables['items']['Insert']) {
    const { data, error } = await supabase
      .from('items')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateItem(itemId: string, updates: Tables['items']['Update']) {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteItem(itemId: string) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);
    
    if (error) throw error;
  }

  // Booking operations
  static async getBookings(userId: string, type: 'renter' | 'owner' | 'all' = 'all') {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        items(*),
        renter:users!renter_id(*),
        owner:users!owner_id(*)
      `)
      .order('created_at', { ascending: false });

    if (type === 'renter') {
      query = query.eq('renter_id', userId);
    } else if (type === 'owner') {
      query = query.eq('owner_id', userId);
    } else {
      query = query.or(`renter_id.eq.${userId},owner_id.eq.${userId}`);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  static async createBooking(booking: Tables['bookings']['Insert']) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateBookingStatus(
    bookingId: string, 
    status: Tables['bookings']['Row']['status']
  ) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Review operations
  static async getReviews(options?: {
    bookingId?: string;
    revieweeId?: string;
    reviewerId?: string;
  }) {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        reviewer:users!reviewer_id(*),
        reviewee:users!reviewee_id(*),
        booking:bookings(*)
      `)
      .order('created_at', { ascending: false });

    if (options?.bookingId) {
      query = query.eq('booking_id', options.bookingId);
    }

    if (options?.revieweeId) {
      query = query.eq('reviewee_id', options.revieweeId);
    }

    if (options?.reviewerId) {
      query = query.eq('reviewer_id', options.reviewerId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  static async createReview(review: Tables['reviews']['Insert']) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Favorite operations
  static async getFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        items(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async addToFavorites(userId: string, itemId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, item_id: itemId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async removeFromFavorites(userId: string, itemId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId);
    
    if (error) throw error;
  }

  static async isFavorite(userId: string, itemId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .single();
    
    return !error && !!data;
  }

  // Trending data
  static async getTrendingItems(limit: number = 10) {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        categories(*),
        users(*),
        bookings(count)
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  static async getTrendingCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        items(count)
      `)
      .order('name');
    
    if (error) throw error;
    return data;
  }

  // Messages operations
  static async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        items(*),
        participant1:users!participant1_id(*),
        participant2:users!participant2_id(*),
        last_message:messages!last_message_id(*)
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async createConversation(participant1Id: string, participant2Id: string, itemId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant1_id: participant1Id,
        participant2_id: participant2Id,
        item_id: itemId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async sendMessage(conversationId: string, senderId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Address operations
  static async getAddresses(userId: string) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createAddress(address: Tables['addresses']['Insert']) {
    const { data, error } = await supabase
      .from('addresses')
      .insert(address)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateAddress(addressId: string, updates: Tables['addresses']['Update']) {
    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', addressId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteAddress(addressId: string) {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);
    
    if (error) throw error;
  }

  // Payment methods operations
  static async getPaymentMethods(userId: string) {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('is_default', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createPaymentMethod(paymentMethod: Tables['payment_methods']['Insert']) {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert(paymentMethod)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deletePaymentMethod(paymentMethodId: string) {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId);
    
    if (error) throw error;
  }

  // Payout methods operations
  static async getPayoutMethods(userId: string) {
    const { data, error } = await supabase
      .from('payout_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('is_default', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createPayoutMethod(payoutMethod: Tables['payout_methods']['Insert']) {
    const { data, error } = await supabase
      .from('payout_methods')
      .insert(payoutMethod)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deletePayoutMethod(payoutMethodId: string) {
    const { error } = await supabase
      .from('payout_methods')
      .delete()
      .eq('id', payoutMethodId);
    
    if (error) throw error;
  }

  // Transactions operations
  static async getTransactions(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        booking:bookings(*),
        payer:users!payer_id(*),
        payee:users!payee_id(*)
      `)
      .or(`payer_id.eq.${userId},payee_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Verification operations
  static async getVerificationDocuments(userId: string) {
    const { data, error } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async submitVerificationDocument(
    userId: string,
    documentType: string,
    documentUrl: string
  ) {
    const { data, error } = await supabase
      .from('verification_documents')
      .insert({
        user_id: userId,
        document_type: documentType,
        document_url: documentUrl
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Notifications operations
  static async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUnreadNotificationCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
    return count || 0;
  }
}
