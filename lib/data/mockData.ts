// Mock data for the application

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  price_per_day: number;
  category_id: string;
  user_id: string;
  images: string[];
  size: string | null;
  brand: string | null;
  condition: string;
  location: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category;
  users?: any;
}

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Dresses',
    description: 'Evening, cocktail, and formal dresses',
    icon: 'shirt-outline',
    color: '#E91E63',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Tops',
    description: 'Blouses, shirts, and designer tops',
    icon: 'shirt-outline',
    color: '#2196F3',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Bottoms',
    description: 'Pants, skirts, and shorts',
    icon: 'shirt-outline',
    color: '#FF9800',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Outerwear',
    description: 'Jackets, coats, and blazers',
    icon: 'shirt-outline',
    color: '#9C27B0',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-5',
    name: 'Accessories',
    description: 'Jewelry, bags, and watches',
    icon: 'watch-outline',
    color: '#FF5722',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-6',
    name: 'Shoes',
    description: 'Heels, flats, and designer footwear',
    icon: 'walk-outline',
    color: '#795548',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-7',
    name: 'Handbags',
    description: 'Purses, clutches, and designer bags',
    icon: 'bag-outline',
    color: '#607D8B',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-8',
    name: 'Jewelry',
    description: 'Necklaces, earrings, and bracelets',
    icon: 'diamond-outline',
    color: '#9E9E9E',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export const mockItems: Item[] = [
  {
    id: 'item-1',
    title: 'Elegant Black Evening Dress',
    description: 'Stunning black evening gown perfect for formal events. Features a flowing silhouette and elegant design.',
    price_per_day: 85,
    category_id: 'cat-1',
    user_id: 'user-1',
    images: [],
    size: 'M',
    brand: 'Versace',
    condition: 'Excellent',
    location: 'Downtown Manhattan',
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'item-2',
    title: 'Designer Leather Jacket',
    description: 'Vintage-style leather jacket from a premium designer brand. Perfect for adding edge to any outfit.',
    price_per_day: 65,
    category_id: 'cat-4',
    user_id: 'user-2',
    images: [],
    size: 'L',
    brand: 'Saint Laurent',
    condition: 'Very Good',
    location: 'Brooklyn Heights',
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'item-3',
    title: 'Cocktail Party Dress',
    description: 'Chic cocktail dress in deep blue. Ideal for parties and special occasions.',
    price_per_day: 55,
    category_id: 'cat-1',
    user_id: 'user-3',
    images: [],
    size: 'S',
    brand: 'Diane von Furstenberg',
    condition: 'Excellent',
    location: 'Upper East Side',
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'item-4',
    title: 'Cashmere Winter Coat',
    description: 'Luxurious cashmere coat to keep you warm and stylish during winter months.',
    price_per_day: 95,
    category_id: 'cat-4',
    user_id: 'user-4',
    images: [],
    size: 'M',
    brand: 'MaxMara',
    condition: 'Like New',
    location: 'Midtown',
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'item-5',
    title: 'Silk Blouse',
    description: 'Professional silk blouse perfect for business meetings or formal occasions.',
    price_per_day: 35,
    category_id: 'cat-2',
    user_id: 'user-5',
    images: [],
    size: 'M',
    brand: 'Equipment',
    condition: 'Excellent',
    location: 'Chelsea',
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'item-6',
    title: 'High-waisted Trousers',
    description: 'Trendy high-waisted trousers that can be dressed up or down.',
    price_per_day: 45,
    category_id: 'cat-3',
    user_id: 'user-6',
    images: [],
    size: 'S',
    brand: 'Theory',
    condition: 'Very Good',
    location: 'SoHo',
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'item-7',
    title: 'Statement Necklace',
    description: 'Bold statement necklace to elevate any outfit.',
    price_per_day: 25,
    category_id: 'cat-8',
    user_id: 'user-7',
    images: [],
    size: 'One Size',
    brand: 'Tiffany & Co',
    condition: 'Excellent',
    location: 'Financial District',
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'item-8',
    title: 'Designer Handbag',
    description: 'Luxury designer handbag perfect for special occasions.',
    price_per_day: 75,
    category_id: 'cat-7',
    user_id: 'user-8',
    images: [],
    size: 'Medium',
    brand: 'Chanel',
    condition: 'Excellent',
    location: 'Upper West Side',
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'item-9',
    title: 'Summer Maxi Dress',
    description: 'Flowing maxi dress perfect for summer events and beach weddings.',
    price_per_day: 40,
    category_id: 'cat-1',
    user_id: 'user-9',
    images: [],
    size: 'L',
    brand: 'Free People',
    condition: 'Very Good',
    location: 'Greenwich Village',
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'item-10',
    title: 'Classic Blazer',
    description: 'Timeless blazer that works for both professional and casual settings.',
    price_per_day: 50,
    category_id: 'cat-4',
    user_id: 'user-10',
    images: [],
    size: 'M',
    brand: 'Hugo Boss',
    condition: 'Excellent',
    location: 'Times Square',
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Helper function to get category by id
export const getCategoryById = (id: string): Category | undefined => {
  return mockCategories.find(cat => cat.id === id);
};

// Helper function to get items with category information
export const getItemsWithCategories = (): (Item & { categories: Category })[] => {
  return mockItems.map(item => ({
    ...item,
    categories: getCategoryById(item.category_id)!,
  }));
};
