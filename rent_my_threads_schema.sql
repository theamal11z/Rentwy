-- =====================================================
-- Rent My Threads - Complete Database Schema
-- PostgreSQL Database for Fashion Rental Marketplace
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected')),
    kyc_documents JSONB,
    
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

-- 2. Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 3. Items Table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    images JSONB DEFAULT '[]',
    
    -- Tags and categorization
    tags TEXT[],
    style_tags TEXT[],
    
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
    boost_score INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 4. Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    pickup_address JSONB,
    delivery_address JSONB,
    
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

-- =====================================================
-- COMMUNICATION TABLES
-- =====================================================

-- 5. Conversations Table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    participant_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    
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

-- 6. Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- =====================================================
-- REVIEWS AND SOCIAL FEATURES
-- =====================================================

-- 7. Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 8. Favorites Table
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, item_id)
);

-- =====================================================
-- FINANCIAL TABLES
-- =====================================================

-- 9. Payment Methods Table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment method type
    method_type VARCHAR(20) NOT NULL CHECK (method_type IN ('card', 'bank', 'paypal', 'stripe')),
    
    -- Card details (encrypted)
    card_type VARCHAR(20),
    last_four VARCHAR(4),
    expiry_month INTEGER,
    expiry_year INTEGER,
    cardholder_name VARCHAR(255),
    
    -- Bank details (encrypted)
    bank_name VARCHAR(255),
    account_type VARCHAR(20),
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

-- 10. Payout Methods Table
CREATE TABLE payout_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 11. Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    external_transaction_id VARCHAR(255),
    processor VARCHAR(20),
    
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

-- =====================================================
-- USER MANAGEMENT TABLES
-- =====================================================

-- 12. Addresses Table
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    label VARCHAR(50) NOT NULL,
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

-- 13. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 14. User Settings Table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- =====================================================
-- SUPPORTING TABLES
-- =====================================================

-- 15. Item Availability Calendar
CREATE TABLE item_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    reason VARCHAR(50),
    booking_id UUID REFERENCES bookings(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(item_id, date)
);

-- 16. Search Analytics Table
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    search_query TEXT,
    category_filter VARCHAR(100),
    price_min DECIMAL(8,2),
    price_max DECIMAL(8,2),
    location_filter VARCHAR(255),
    results_count INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. App Analytics Table
CREATE TABLE app_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users(latitude, longitude);
CREATE INDEX idx_users_city_state ON users(city, state);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Items indexes
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_location ON items(city, state);
CREATE INDEX idx_items_price ON items(price_per_day);
CREATE INDEX idx_items_created_at ON items(created_at);
CREATE INDEX idx_items_search ON items USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_items_tags ON items USING GIN(tags);

-- Bookings indexes
CREATE INDEX idx_bookings_item_id ON bookings(item_id);
CREATE INDEX idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX idx_bookings_owner_id ON bookings(owner_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

-- Messages indexes
CREATE INDEX idx_conversations_participants ON conversations(participant_1_id, participant_2_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Reviews indexes
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_item_id ON reviews(item_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Favorites indexes
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_item_id ON favorites(item_id);

-- Payment methods indexes
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Addresses indexes
CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Item availability indexes
CREATE INDEX idx_item_availability_item_date ON item_availability(item_id, date);

-- Analytics indexes
CREATE INDEX idx_app_analytics_event_type ON app_analytics(event_type);
CREATE INDEX idx_app_analytics_created_at ON app_analytics(created_at);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample categories
INSERT INTO categories (name, description, icon, color) VALUES
('Dresses', 'Evening, cocktail, and formal dresses', 'shirt-outline', '#E91E63'),
('Tops', 'Blouses, shirts, and designer tops', 'shirt-outline', '#2196F3'),
('Bottoms', 'Pants, skirts, and shorts', 'shirt-outline', '#FF9800'),
('Outerwear', 'Jackets, coats, and blazers', 'shirt-outline', '#9C27B0'),
('Accessories', 'Jewelry, bags, and watches', 'watch-outline', '#FF5722'),
('Shoes', 'Heels, flats, and designer footwear', 'walk-outline', '#795548'),
('Handbags', 'Purses, clutches, and designer bags', 'bag-outline', '#607D8B'),
('Jewelry', 'Necklaces, earrings, and bracelets', 'diamond-outline', '#9E9E9E');

-- =====================================================
-- DATABASE FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update user stats when reviews change
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

-- Function to update item stats when reviews change
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

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating stats
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER trigger_update_item_stats
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_item_stats();

-- Triggers for updating timestamps
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payout_methods_updated_at
    BEFORE UPDATE ON payout_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMPLEX QUERIES
-- =====================================================

-- User Stats View
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

-- Item Stats View
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

-- =====================================================
-- SCHEMA CREATION COMPLETE
-- =====================================================

-- Success message
SELECT 'Rent My Threads database schema created successfully!' as message;
