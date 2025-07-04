# Supabase Setup Guide for Rent My Threads

This guide will help you set up Supabase as the backend for your Rent My Threads application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in your project details:
   - Name: `rent-my-threads`
   - Database Password: Choose a strong password
   - Region: Choose the closest region to your users
5. Click "Create new project"

## Step 2: Get Your Project Credentials

1. Once your project is created, go to Settings → API
2. Copy the following values:
   - **Project URL** (under Project Settings)
   - **Anon/Public Key** (under Project API keys)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 4: Set Up the Database Schema

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/schema.sql` 
4. Paste it into the SQL Editor and run it

This will create all the necessary tables:
- `users` - User profiles
- `categories` - Item categories
- `items` - Rental items
- `bookings` - Rental bookings
- `reviews` - User reviews
- `favorites` - User favorite items

## Step 5: Configure Authentication (Optional)

If you want to enable user authentication:

1. Go to Authentication → Settings
2. Configure your preferred auth providers (Email, Google, Apple, etc.)
3. Set up email templates if using email auth

## Step 6: Configure Storage (Optional)

For image uploads:

1. Go to Storage
2. Create a new bucket called `item-images`
3. Set appropriate policies for public read access

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. The app should now connect to your Supabase backend
3. Check the browser console for any connection errors

## Database Schema Overview

### Tables

- **users**: Extended user profiles linked to Supabase auth
- **categories**: Item categories (Dresses, Accessories, etc.)
- **items**: Rental items with images, pricing, and availability
- **bookings**: Rental transactions with status tracking
- **reviews**: User reviews and ratings
- **favorites**: User favorite items

### Row Level Security (RLS)

The schema includes RLS policies to ensure:
- Users can only see and edit their own data
- Items and categories are publicly readable
- Bookings are only visible to involved parties
- Reviews are publicly readable but only editable by creators

## API Usage Examples

### Fetching Items
```typescript
import { useItems } from '@/lib/hooks/useSupabase';

const { items, loading, error } = useItems({ 
  categoryId: 'dress-category-id',
  limit: 10 
});
```

### Creating a Booking
```typescript
import { SupabaseService } from '@/lib/services/supabaseService';

const booking = await SupabaseService.createBooking({
  item_id: 'item-id',
  renter_id: 'user-id',
  owner_id: 'owner-id',
  start_date: '2024-01-01',
  end_date: '2024-01-03',
  total_price: 150.00
});
```

### Managing Favorites
```typescript
import { useFavorites } from '@/lib/hooks/useSupabase';

const { favorites, addToFavorites, removeFromFavorites } = useFavorites(userId);

// Add to favorites
await addToFavorites('item-id');

// Remove from favorites
await removeFromFavorites('item-id');
```

## Troubleshooting

### Common Issues

1. **Connection Error**: Check if your environment variables are correct
2. **RLS Policy Error**: Ensure you're authenticated when accessing protected data
3. **CORS Error**: Make sure your app URL is added to allowed origins in Supabase settings

### Debugging

- Check the browser console for detailed error messages
- Use the Supabase dashboard to monitor API usage and errors
- Enable logging in your Supabase project settings

## Next Steps

1. Set up authentication in your app
2. Implement image upload functionality
3. Add real-time subscriptions for live updates
4. Set up email notifications for bookings
5. Configure backup and monitoring

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
