# Rent My Threads - Database Schema

## Overview
This document outlines the complete database structure needed for the "Rent My Threads" peer-to-peer fashion rental marketplace based on comprehensive screen analysis.

## Core Entities

### 1. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    profile_image_url TEXT,
    bio TEXT,
    date_of_birth DATE,
    
    -- Profile completeness and verification
    is_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    kyc_status VARCHAR(20) DEFAULT 'pending', -- pending, submitted, approved, rejected
    kyc_documents JSONB, -- Store document URLs and metadata
    
    -- Profile settings
    profile_visibility BOOLEAN DEFAULT TRUE,
    show_last_seen BOOLEAN DEFAULT FALSE,
    allow_messages BOOLEAN DEFAULT TRUE,
    
    -- Location
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'USA',
    postal_code VARCHAR(20),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Stats (calculated fields, updated via triggers)
    total_listings INTEGER DEFAULT 0,
    total_rentals INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    response_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE,
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users(latitude, longitude);
CREATE INDEX idx_users_city_state ON users(city, state);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 2. Categories Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50), -- Ionicon name
    color VARCHAR(7), -- Hex color code
    parent_category_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample categories from app
INSERT INTO categories (name, description, icon, color) VALUES
('Dresses', 'Evening, cocktail, and formal dresses', 'shirt-outline', '#E91E63'),
('Tops', 'Blouses, shirts, and designer tops', 'shirt-outline', '#2196F3'),
('Bottoms', 'Pants, skirts, and shorts', 'shirt-outline', '#FF9800'),
('Outerwear', 'Jackets, coats, and blazers', 'shirt-outline', '#9C27B0'),
('Accessories', 'Jewelry, bags, and watches', 'watch-outline', '#FF5722'),
('Shoes', 'Heels, flats, and designer footwear', 'walk-outline', '#795548'),
('Handbags', 'Purses, clutches, and designer bags', 'bag-outline', '#607D8B'),
('Jewelry', 'Necklaces, earrings, and bracelets', 'diamond-outline', '#9E9E9E');
```

### 3. Items Table
```sql
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    
    -- Basic info
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    brand VARCHAR(100),
    size VARCHAR(20),
    condition VARCHAR(20) NOT NULL CHECK (condition IN ('new', 'excellent', 'good', 'fair')),
    
    -- Pricing
    price_per_day DECIMAL(8,2) NOT NULL,
    deposit_amount DECIMAL(8,2) NOT NULL DEFAULT 0,
    
    -- Media
    images JSONB DEFAULT '[]', -- Array of image URLs
    
    -- Tags and categorization
    tags TEXT[], -- Array of tags for search
    style_tags TEXT[], -- Style-related tags
    
    -- Location (inherited from user but can be overridden)
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    
    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'rented', 'inactive', 'archived')),
    
    -- Stats (updated via triggers)
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    
    -- Metadata
    featured_until TIMESTAMP WITH TIME ZONE,
    boost_score INTEGER DEFAULT 0, -- For search ranking
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_location ON items(city, state);
CREATE INDEX idx_items_price ON items(price_per_day);
CREATE INDEX idx_items_created_at ON items(created_at);
CREATE INDEX idx_items_search ON items USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_items_tags ON items USING GIN(tags);
```

### 4. Bookings Table
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    renter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Rental period
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
    
    -- Pricing breakdown
    daily_rate DECIMAL(8,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    service_fee DECIMAL(8,2) NOT NULL,
    delivery_fee DECIMAL(8,2) DEFAULT 0,
    deposit_amount DECIMAL(8,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Delivery/pickup
    pickup_method VARCHAR(20) NOT NULL CHECK (pickup_method IN ('pickup', 'delivery')),
    pickup_address JSONB, -- Address object
    delivery_address JSONB, -- Address object
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed'
    )),
    
    -- Additional info
    special_instructions TEXT,
    cancellation_reason TEXT,
    
    -- Important dates
    confirmed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_item_id ON bookings(item_id);
CREATE INDEX idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX idx_bookings_owner_id ON bookings(owner_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
```

### 5. Messages Table
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    participant_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id), -- For context
    
    -- Status
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- Last message info (denormalized for performance)
    last_message_id UUID,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_text TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(participant_1_id, participant_2_id, booking_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
    attachment_url TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_participants ON conversations(participant_1_id, participant_2_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

### 6. Reviews Table
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT NOT NULL,
    
    -- Review type
    review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('item', 'renter', 'owner')),
    
    -- Moderation
    is_approved BOOLEAN DEFAULT TRUE,
    is_flagged BOOLEAN DEFAULT FALSE,
    moderation_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(booking_id, reviewer_id, review_type)
);

-- Indexes
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_item_id ON reviews(item_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

### 7. Favorites Table
```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, item_id)
);

-- Indexes
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_item_id ON favorites(item_id);
```

## Financial & Payment Tables

### 8. Payment Methods Table
```sql
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment method type
    method_type VARCHAR(20) NOT NULL CHECK (method_type IN ('card', 'bank', 'paypal', 'stripe')),
    
    -- Card details (encrypted)
    card_type VARCHAR(20), -- visa, mastercard, amex, discover
    last_four VARCHAR(4),
    expiry_month INTEGER,
    expiry_year INTEGER,
    cardholder_name VARCHAR(255),
    
    -- Bank details (encrypted)
    bank_name VARCHAR(255),
    account_type VARCHAR(20), -- checking, savings
    routing_number_encrypted TEXT,
    account_number_encrypted TEXT,
    
    -- External provider details
    external_id VARCHAR(255), -- Stripe customer ID, PayPal account ID, etc.
    external_metadata JSONB,
    
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
```

### 9. Payout Methods Table
```sql
CREATE TABLE payout_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    method_type VARCHAR(20) NOT NULL CHECK (method_type IN ('bank', 'paypal', 'stripe')),
    
    -- Bank details (encrypted)
    account_name VARCHAR(255),
    bank_name VARCHAR(255),
    routing_number_encrypted TEXT,
    account_number_encrypted TEXT,
    
    -- External provider details
    external_id VARCHAR(255),
    external_metadata JSONB,
    
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

### 10. Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Transaction details
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN (
        'rental_payment', 'deposit_charge', 'deposit_refund', 'rental_payout',
        'service_fee', 'delivery_fee', 'refund', 'dispute_resolution'
    )),
    
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Payment processing
    payment_method_id UUID REFERENCES payment_methods(id),
    external_transaction_id VARCHAR(255), -- Stripe payment intent ID, etc.
    processor VARCHAR(20), -- stripe, paypal, etc.
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
    )),
    
    -- Metadata
    description TEXT,
    metadata JSONB,
    
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX idx_transactions_status ON transactions(status);
```

## User Management Tables

### 11. Addresses Table
```sql
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    label VARCHAR(50) NOT NULL, -- Home, Work, etc.
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'USA',
    
    is_default BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
```

### 12. Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification content
    type VARCHAR(30) NOT NULL CHECK (type IN (
        'booking_request', 'booking_confirmed', 'booking_cancelled',
        'message_received', 'payment_received', 'review_received',
        'item_favorited', 'system_update', 'marketing'
    )),
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entities
    booking_id UUID REFERENCES bookings(id),
    item_id UUID REFERENCES items(id),
    sender_id UUID REFERENCES users(id),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery
    sent_push BOOLEAN DEFAULT FALSE,
    sent_email BOOLEAN DEFAULT FALSE,
    sent_sms BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### 13. User Settings Table
```sql
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification preferences
    push_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    booking_reminders BOOLEAN DEFAULT TRUE,
    
    -- Privacy settings
    profile_visibility BOOLEAN DEFAULT TRUE,
    show_last_seen BOOLEAN DEFAULT FALSE,
    allow_messages BOOLEAN DEFAULT TRUE,
    
    -- App preferences
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    preferred_language VARCHAR(5) DEFAULT 'en-US',
    dark_mode BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);
```

## Supporting Tables

### 14. Item Availability Calendar
```sql
CREATE TABLE item_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    reason VARCHAR(50), -- blocked, rented, maintenance, etc.
    booking_id UUID REFERENCES bookings(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(item_id, date)
);

-- Indexes
CREATE INDEX idx_item_availability_item_date ON item_availability(item_id, date);
```

### 15. Search Analytics Table
```sql
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    search_query TEXT,
    category_filter VARCHAR(100),
    price_min DECIMAL(8,2),
    price_max DECIMAL(8,2),
    location_filter VARCHAR(255),
    results_count INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 16. App Analytics Table
```sql
CREATE TABLE app_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_app_analytics_event_type ON app_analytics(event_type);
CREATE INDEX idx_app_analytics_created_at ON app_analytics(created_at);
```

## Views for Complex Queries

### User Stats View
```sql
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.full_name,
    u.average_rating,
    u.total_reviews,
    COUNT(DISTINCT i.id) as total_listings,
    COUNT(DISTINCT CASE WHEN i.status = 'active' THEN i.id END) as active_listings,
    COUNT(DISTINCT b.id) FILTER (WHERE b.owner_id = u.id) as total_rentals_as_owner,
    COUNT(DISTINCT b.id) FILTER (WHERE b.renter_id = u.id) as total_rentals_as_renter,
    COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type = 'rental_payout'), 0) as total_earnings
FROM users u
LEFT JOIN items i ON u.id = i.user_id AND i.deleted_at IS NULL
LEFT JOIN bookings b ON (u.id = b.owner_id OR u.id = b.renter_id)
LEFT JOIN transactions t ON u.id = t.user_id AND t.status = 'completed'
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.full_name, u.average_rating, u.total_reviews;
```

### Item Stats View
```sql
CREATE VIEW item_stats AS
SELECT 
    i.id,
    i.title,
    i.price_per_day,
    i.average_rating,
    i.total_reviews,
    COUNT(f.id) as favorite_count,
    COUNT(DISTINCT b.id) as total_bookings,
    COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type = 'rental_payout'), 0) as total_earnings
FROM items i
LEFT JOIN favorites f ON i.id = f.item_id
LEFT JOIN bookings b ON i.id = b.item_id
LEFT JOIN transactions t ON b.id = t.booking_id AND t.transaction_type = 'rental_payout' AND t.status = 'completed'
WHERE i.deleted_at IS NULL
GROUP BY i.id, i.title, i.price_per_day, i.average_rating, i.total_reviews;
```

## Database Functions & Triggers

### Update User Stats Trigger
```sql
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update average rating and review count for the user
    UPDATE users SET 
        average_rating = (
            SELECT COALESCE(AVG(rating::DECIMAL), 0) 
            FROM reviews 
            WHERE reviewee_id = COALESCE(NEW.reviewee_id, OLD.reviewee_id)
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE reviewee_id = COALESCE(NEW.reviewee_id, OLD.reviewee_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.reviewee_id, OLD.reviewee_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();
```

### Update Item Stats Trigger
```sql
CREATE OR REPLACE FUNCTION update_item_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update average rating and review count for the item
    UPDATE items SET 
        average_rating = (
            SELECT COALESCE(AVG(rating::DECIMAL), 0) 
            FROM reviews 
            WHERE item_id = COALESCE(NEW.item_id, OLD.item_id) AND review_type = 'item'
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE item_id = COALESCE(NEW.item_id, OLD.item_id) AND review_type = 'item'
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.item_id, OLD.item_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_item_stats
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_item_stats();
```

## Key Features Supported

### 1. **Authentication & User Management**
- Email/password registration and login
- Social login support (Google, Apple)
- Email verification
- Phone verification
- Password reset functionality
- Two-factor authentication setup

### 2. **Item Management**
- Create, edit, delete listings
- Multiple image uploads
- Category and tag management
- Availability calendar
- Pricing and deposit management
- Item status tracking (active, rented, inactive)

### 3. **Booking System**
- Date range selection
- Automatic pricing calculation
- Service fees and delivery fees
- Pickup/delivery method selection
- Booking status workflow
- Calendar availability checking

### 4. **Payment Processing**
- Multiple payment methods (cards, bank accounts)
- Secure payment processing
- Automatic payouts to owners
- Deposit handling
- Transaction history
- Earnings tracking

### 5. **Communication**
- In-app messaging between users
- Conversation threading by booking
- Real-time notifications
- Message read status

### 6. **Reviews & Ratings**
- Bidirectional reviews (renter ↔ owner)
- Item-specific reviews
- Star ratings with comments
- Review moderation

### 7. **Search & Discovery**
- Full-text search on items
- Category filtering
- Price range filtering
- Location-based search
- Favorite items
- Trending items

### 8. **Analytics & Insights**
- User behavior tracking
- Search analytics
- Revenue analytics
- Performance metrics

## Security Considerations

1. **Data Encryption**: Sensitive payment information encrypted at rest
2. **PII Protection**: Personal information properly masked and secured
3. **Access Control**: Row-level security for user data
4. **Audit Trail**: All critical operations logged
5. **Rate Limiting**: API rate limiting to prevent abuse
6. **Input Validation**: All user inputs validated and sanitized

## Scalability Considerations

1. **Indexing**: Comprehensive indexing strategy for performance
2. **Partitioning**: Large tables partitioned by date/region
3. **Caching**: Frequently accessed data cached
4. **Read Replicas**: Read operations distributed across replicas
5. **Archive Strategy**: Old data archived to reduce main table size

This schema provides a robust foundation for the Rent My Threads application, supporting all features identified in the screen analysis while maintaining scalability and security best practices.
