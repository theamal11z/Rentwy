import { useEffect, useState } from 'react';
import {
  searchItems,
  getItem,
  mockItems,
  getBookingsByRenter,
  mockFavoriteItemIds,
  mockReviews,
  mockEarnings,
  mockMessagesByConv,
  Item,
  Booking,
  Review,
  EarningsSummary,
  ChatMessage,
} from './mockData';

export function useItems(category?: string) {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    setItems(searchItems(category));
  }, [category]);
  return items;
}

export function useItem(id?: string) {
  const [item, setItem] = useState<Item | undefined>();
  useEffect(() => {
    if (id) setItem(getItem(id));
  }, [id]);
  return item;
}

export function useOwnerItems(ownerId: string) {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    setItems(mockItems.filter((i) => i.ownerId === ownerId));
  }, [ownerId]);
  return items;
}

export function useFeaturedItems(count: number = 10) {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    setItems(mockItems.slice(0, count));
  }, [count]);
  return items;
}

export function useFavorites() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    setItems(mockFavoriteItemIds.map(id => getItem(id)!).filter(Boolean));
  }, []);
  return items;
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    setReviews(mockReviews);
  }, []);
  return reviews;
}

export function useEarnings() {
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  useEffect(() => {
    setEarnings(mockEarnings);
  }, []);
  return earnings;
}

export function useConversation(convId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  useEffect(() => {
    setMessages(mockMessagesByConv[convId] || []);
  }, [convId]);
  return messages;
}

export function useBookingsByRenter(renterId: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => {
    setBookings(getBookingsByRenter(renterId));
  }, [renterId]);
  return bookings;
}
