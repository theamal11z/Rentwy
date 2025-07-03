// Simple in-memory mock data and helpers replacing Convex backend.

export interface Item {
  _id: string;
  ownerId: string;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  pricePerDay: number;
  depositAmount: number;
  rating: number;
  totalReviews: number;
}

export const mockItems: Item[] = [
  {
    _id: 'i1',
    ownerId: 'u_anon',
    title: 'Elegant Black Dress',
    description: 'Perfect for formal events and parties.',
    category: 'dress',
    size: 'M',
    condition: 'excellent',
    pricePerDay: 25,
    depositAmount: 100,
    rating: 4.8,
    totalReviews: 12,
  },
  {
    _id: 'i2',
    ownerId: 'u2',
    title: 'Designer Handbag',
    description: 'Classic style, matches any outfit.',
    category: 'bags',
    size: 'One Size',
    condition: 'good',
    pricePerDay: 30,
    depositAmount: 150,
    rating: 4.6,
    totalReviews: 8,
  },
];

export function getItem(id: string) {
  return mockItems.find((it) => it._id === id);
}

export function searchItems(category?: string) {
  if (!category || category === 'all') return mockItems;
  return mockItems.filter((it) => it.category === category);
}

export interface Booking {
  _id: string;
  itemId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
}

export const mockBookings: Booking[] = [];

// ----- Favorites -----
export const mockFavoriteItemIds: string[] = ['i1', 'i2'];

// ----- Reviews -----
export interface Review {
  _id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export const mockReviews: Review[] = [
  {
    _id: 'r1',
    reviewerName: 'Sarah Chen',
    rating: 5,
    comment: 'Amazing dress, looked brand new!',
    date: '2025-06-10',
  },
  {
    _id: 'r2',
    reviewerName: 'Emma Wilson',
    rating: 4,
    comment: 'Great experience, would rent again.',
    date: '2025-06-01',
  },
];

// ----- Earnings -----
export interface EarningsSummary {
  total: number;
  thisMonth: number;
  pending: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export const mockUsers: User[] = [
  { id: 'u_anon', name: 'Alex Johnson', email: 'alex@example.com', password: 'password' },
];

export const mockEarnings: EarningsSummary = {
  total: 540,
  thisMonth: 120,
  pending: 60,
};

// ----- Conversations & Messages -----
export interface Conversation {
  id: string;
  userName: string;
  itemTitle: string;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
}

export const mockConversations: Conversation[] = [
  { id: '1', userName: 'Sarah Chen', itemTitle: 'Elegant Black Dress' },
  { id: '2', userName: 'Emma Wilson', itemTitle: 'Designer Handbag' },
  { id: '3', userName: 'Jessica Park', itemTitle: 'Summer Floral Dress' },
];

export const mockMessagesByConv: Record<string, ChatMessage[]> = {
  '1': [
    { id: 'm1', sender: 'them', text: 'Hi! Is the dress still available?', timestamp: '2m ago' },
    { id: 'm2', sender: 'me', text: 'Yes, it is!', timestamp: 'Just now' },
  ],
  '2': [
    { id: 'm3', sender: 'them', text: 'Thanks for the handbag!', timestamp: '1h ago' },
  ],
  '3': [
    { id: 'm4', sender: 'them', text: 'Could we arrange pickup for tomorrow?', timestamp: '3h ago' },
  ],
};

export function createBooking(b: Omit<Booking, '_id' | 'status'>) {
  const _id = `b${mockBookings.length + 1}`;
  const totalPrice = (() => {
    const item = getItem(b.itemId);
    if (!item) return 0;
    const days = Math.max(
      1,
      Math.ceil(
        (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) /
          86400000,
      ),
    );
    return days * item.pricePerDay;
  })();
  const booking: Booking = { ...b, _id, totalPrice, status: 'pending' };
  mockBookings.push(booking);
  return booking;
}

export function getBookingsByRenter(renterId: string) {
  return mockBookings.filter((b) => b.renterId === renterId);
}
