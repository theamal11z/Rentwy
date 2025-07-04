import { useState, useEffect } from 'react';
import { SupabaseService } from '@/lib/services/supabaseService';
import { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

// Custom hook for authentication
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await SupabaseService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  return { user, loading };
}

// Custom hook for fetching items
export function useItems(options?: {
  categoryId?: string;
  userId?: string;
  searchQuery?: string;
  limit?: number;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await SupabaseService.getItems(options);
        setItems(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [options?.categoryId, options?.userId, options?.searchQuery, options?.limit]);

  return { items, loading, error, refetch: () => fetchItems() };
}

// Custom hook for fetching categories
export function useCategories() {
  const [categories, setCategories] = useState<Tables['categories']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await SupabaseService.getCategories();
        setCategories(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

// Custom hook for fetching a single item
export function useItem(itemId: string) {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) return;

    const fetchItem = async () => {
      try {
        setLoading(true);
        const data = await SupabaseService.getItemById(itemId);
        setItem(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching item:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch item');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  return { item, loading, error };
}

// Custom hook for fetching bookings
export function useBookings(userId?: string, type: 'renter' | 'owner' | 'all' = 'all') {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await SupabaseService.getBookings(userId, type);
        setBookings(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId, type]);

  return { bookings, loading, error };
}

// Custom hook for fetching favorites
export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const data = await SupabaseService.getFavorites(userId);
        setFavorites(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId]);

  const addToFavorites = async (itemId: string) => {
    if (!userId) return;
    
    try {
      await SupabaseService.addToFavorites(userId, itemId);
      // Refresh favorites
      const data = await SupabaseService.getFavorites(userId);
      setFavorites(data || []);
    } catch (err) {
      console.error('Error adding to favorites:', err);
    }
  };

  const removeFromFavorites = async (itemId: string) => {
    if (!userId) return;
    
    try {
      await SupabaseService.removeFromFavorites(userId, itemId);
      // Refresh favorites
      const data = await SupabaseService.getFavorites(userId);
      setFavorites(data || []);
    } catch (err) {
      console.error('Error removing from favorites:', err);
    }
  };

  return { 
    favorites, 
    loading, 
    error, 
    addToFavorites, 
    removeFromFavorites 
  };
}

// Custom hook for trending data
export function useTrendingData() {
  const [trendingItems, setTrendingItems] = useState<any[]>([]);
  const [trendingCategories, setTrendingCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setLoading(true);
        const [itemsData, categoriesData] = await Promise.all([
          SupabaseService.getTrendingItems(10),
          SupabaseService.getTrendingCategories()
        ]);
        
        setTrendingItems(itemsData || []);
        setTrendingCategories(categoriesData || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching trending data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch trending data');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  return { trendingItems, trendingCategories, loading, error };
}

// Custom hook for conversations
export function useConversations(userId?: string) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await SupabaseService.getConversations(userId);
        setConversations(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId]);

  return { conversations, loading, error };
}

// Custom hook for messages
export function useMessages(conversationId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await SupabaseService.getMessages(conversationId);
        setMessages(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  const sendMessage = async (senderId: string, content: string) => {
    if (!conversationId) return;
    
    try {
      await SupabaseService.sendMessage(conversationId, senderId, content);
      // Refresh messages
      const data = await SupabaseService.getMessages(conversationId);
      setMessages(data || []);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return { messages, loading, error, sendMessage };
}

// Custom hook for addresses
export function useAddresses(userId?: string) {
  const [addresses, setAddresses] = useState<Tables['addresses']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const data = await SupabaseService.getAddresses(userId);
        setAddresses(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [userId]);

  const createAddress = async (address: Tables['addresses']['Insert']) => {
    try {
      await SupabaseService.createAddress(address);
      // Refresh addresses
      if (userId) {
        const data = await SupabaseService.getAddresses(userId);
        setAddresses(data || []);
      }
    } catch (err) {
      console.error('Error creating address:', err);
      throw err;
    }
  };

  const updateAddress = async (addressId: string, updates: Tables['addresses']['Update']) => {
    try {
      await SupabaseService.updateAddress(addressId, updates);
      // Refresh addresses
      if (userId) {
        const data = await SupabaseService.getAddresses(userId);
        setAddresses(data || []);
      }
    } catch (err) {
      console.error('Error updating address:', err);
      throw err;
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      await SupabaseService.deleteAddress(addressId);
      // Refresh addresses
      if (userId) {
        const data = await SupabaseService.getAddresses(userId);
        setAddresses(data || []);
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      throw err;
    }
  };

  return { 
    addresses, 
    loading, 
    error, 
    createAddress, 
    updateAddress, 
    deleteAddress 
  };
}

// Custom hook for payment methods
export function usePaymentMethods(userId?: string) {
  const [paymentMethods, setPaymentMethods] = useState<Tables['payment_methods']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        const data = await SupabaseService.getPaymentMethods(userId);
        setPaymentMethods(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching payment methods:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch payment methods');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [userId]);

  const createPaymentMethod = async (paymentMethod: Tables['payment_methods']['Insert']) => {
    try {
      await SupabaseService.createPaymentMethod(paymentMethod);
      // Refresh payment methods
      if (userId) {
        const data = await SupabaseService.getPaymentMethods(userId);
        setPaymentMethods(data || []);
      }
    } catch (err) {
      console.error('Error creating payment method:', err);
      throw err;
    }
  };

  const deletePaymentMethod = async (paymentMethodId: string) => {
    try {
      await SupabaseService.deletePaymentMethod(paymentMethodId);
      // Refresh payment methods
      if (userId) {
        const data = await SupabaseService.getPaymentMethods(userId);
        setPaymentMethods(data || []);
      }
    } catch (err) {
      console.error('Error deleting payment method:', err);
      throw err;
    }
  };

  return { 
    paymentMethods, 
    loading, 
    error, 
    createPaymentMethod, 
    deletePaymentMethod 
  };
}

// Custom hook for transactions/earnings
export function useTransactions(userId?: string) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await SupabaseService.getTransactions(userId);
        setTransactions(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  return { transactions, loading, error };
}

// Custom hook for notifications
export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Tables['notifications']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const [notificationsData, unreadCountData] = await Promise.all([
          SupabaseService.getNotifications(userId),
          SupabaseService.getUnreadNotificationCount(userId)
        ]);
        
        setNotifications(notificationsData || []);
        setUnreadCount(unreadCountData);
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      await SupabaseService.markNotificationAsRead(notificationId);
      // Refresh notifications
      if (userId) {
        const [notificationsData, unreadCountData] = await Promise.all([
          SupabaseService.getNotifications(userId),
          SupabaseService.getUnreadNotificationCount(userId)
        ]);
        
        setNotifications(notificationsData || []);
        setUnreadCount(unreadCountData);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  return { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAsRead 
  };
}
