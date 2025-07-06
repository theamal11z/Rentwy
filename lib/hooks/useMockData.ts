import { useState, useEffect } from 'react';
import { 
  mockCategories, 
  mockItems, 
  getItemsWithCategories, 
  getCategoryById,
  Category,
  Item
} from '@/lib/data/mockData';

// Custom hook for authentication (mock)
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

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
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        let filteredItems = getItemsWithCategories();

        // Apply filters
        if (options?.categoryId) {
          filteredItems = filteredItems.filter(item => item.category_id === options.categoryId);
        }

        if (options?.userId) {
          filteredItems = filteredItems.filter(item => item.user_id === options.userId);
        }

        if (options?.searchQuery) {
          const query = options.searchQuery.toLowerCase();
          filteredItems = filteredItems.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.brand?.toLowerCase().includes(query)
          );
        }

        if (options?.limit) {
          filteredItems = filteredItems.slice(0, options.limit);
        }

        setItems(filteredItems);
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

  return { items, loading, error, refetch: () => {} };
}

// Custom hook for fetching categories
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
        setCategories(mockCategories);
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
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const foundItem = getItemsWithCategories().find(item => item.id === itemId);
        
        if (!foundItem) {
          throw new Error('Item not found');
        }
        
        setItem(foundItem);
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

// Custom hook for fetching bookings (mock)
export function useBookings(userId?: string, type: 'renter' | 'owner' | 'all' = 'all') {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return { bookings, loading, error };
}

// Custom hook for fetching favorites (mock)
export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToFavorites = async (itemId: string) => {
    // Mock implementation
    console.log('Added to favorites:', itemId);
  };

  const removeFromFavorites = async (itemId: string) => {
    // Mock implementation
    console.log('Removed from favorites:', itemId);
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
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Get a subset of items and categories for trending
        const itemsData = getItemsWithCategories().slice(0, 10);
        const categoriesData = mockCategories;
        
        setTrendingItems(itemsData);
        setTrendingCategories(categoriesData);
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

// Custom hook for conversations (mock)
export function useConversations(userId?: string) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return { conversations, loading, error };
}

// Custom hook for messages (mock)
export function useMessages(conversationId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (senderId: string, content: string) => {
    // Mock implementation
    console.log('Message sent:', { senderId, content });
  };

  return { messages, loading, error, sendMessage };
}

// Custom hook for addresses (mock)
export function useAddresses(userId?: string) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAddress = async (address: any) => {
    console.log('Address created:', address);
  };

  const updateAddress = async (addressId: string, updates: any) => {
    console.log('Address updated:', { addressId, updates });
  };

  const deleteAddress = async (addressId: string) => {
    console.log('Address deleted:', addressId);
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

// Custom hook for payment methods (mock)
export function usePaymentMethods(userId?: string) {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentMethod = async (paymentMethod: any) => {
    console.log('Payment method created:', paymentMethod);
  };

  const deletePaymentMethod = async (paymentMethodId: string) => {
    console.log('Payment method deleted:', paymentMethodId);
  };

  return { 
    paymentMethods, 
    loading, 
    error, 
    createPaymentMethod, 
    deletePaymentMethod 
  };
}

// Custom hook for transactions/earnings (mock)
export function useTransactions(userId?: string) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return { transactions, loading, error };
}

// Custom hook for notifications (mock)
export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const markAsRead = async (notificationId: string) => {
    console.log('Notification marked as read:', notificationId);
  };

  return { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAsRead 
  };
}
