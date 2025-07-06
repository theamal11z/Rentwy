# Rent My Threads - REST API Documentation

## Overview

The Rent My Threads API is a comprehensive REST API for a fashion rental marketplace built with Node.js, Express, and Supabase (PostgreSQL). It provides endpoints for user management, item listings, bookings, messaging, reviews, payments, and more.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Get Authentication Token

**POST** `/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": "30d"
  }
}
```

---

## API Endpoints

### 🔐 Authentication Routes (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| GET | `/auth/me` | Get current user | Yes |
| PUT | `/auth/change-password` | Change password | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| POST | `/auth/verify-email` | Verify email address | Yes |
| POST | `/auth/logout` | User logout | Yes |
| DELETE | `/auth/deactivate` | Deactivate account | Yes |

### 👥 User Management (`/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/profile` | Get current user profile | Yes |
| PUT | `/users/profile` | Update user profile | Yes |
| GET | `/users/:id` | Get public user profile | No |
| GET | `/users/settings` | Get user settings | Yes |
| PUT | `/users/settings` | Update user settings | Yes |
| GET | `/users/addresses` | Get user addresses | Yes |
| POST | `/users/addresses` | Add new address | Yes |
| PUT | `/users/addresses/:id` | Update address | Yes |
| DELETE | `/users/addresses/:id` | Delete address | Yes |
| GET | `/users/stats` | Get user statistics | Yes |
| GET | `/users/favorites` | Get user's favorites | Yes |

### 🏷️ Categories (`/categories`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/categories` | Get all categories | No |
| GET | `/categories/:id` | Get single category | No |

### 🛍️ Items/Listings (`/items`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/items` | Search and filter items | No |
| GET | `/items/:id` | Get single item | No |
| POST | `/items` | Create new item | Yes |
| PUT | `/items/:id` | Update item | Yes |
| DELETE | `/items/:id` | Delete item | Yes |
| POST | `/items/:id/favorite` | Add to favorites | Yes |
| DELETE | `/items/:id/favorite` | Remove from favorites | Yes |
| GET | `/items/:id/availability` | Get item availability | No |
| PUT | `/items/:id/availability` | Update availability | Yes |
| GET | `/items/user/:userId` | Get items by user | No |

### 📅 Bookings (`/bookings`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/bookings` | Get user's bookings | Yes |
| GET | `/bookings/:id` | Get single booking | Yes |
| POST | `/bookings` | Create new booking | Yes |
| PUT | `/bookings/:id` | Update booking | Yes |
| POST | `/bookings/:id/cancel` | Cancel booking | Yes |
| GET | `/bookings/calendar/:year/:month` | Get calendar view | Yes |
| GET | `/bookings/stats` | Get booking statistics | Yes |

### 💬 Messages (`/messages`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/messages/conversations` | Get conversations | Yes |
| GET | `/messages/conversations/:id` | Get conversation with messages | Yes |
| POST | `/messages` | Send message | Yes |
| PUT | `/messages/:id/read` | Mark message as read | Yes |
| POST | `/messages/conversations/:id/archive` | Archive conversation | Yes |
| GET | `/messages/unread-count` | Get unread count | Yes |

### ⭐ Reviews (`/reviews`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/reviews` | Get reviews with filters | No |
| GET | `/reviews/:id` | Get single review | No |
| POST | `/reviews` | Create new review | Yes |
| PUT | `/reviews/:id` | Update review | Yes |
| DELETE | `/reviews/:id` | Delete review | Yes |
| GET | `/reviews/user/:userId/stats` | Get user review stats | No |
| GET | `/reviews/item/:itemId` | Get item reviews | No |
| GET | `/reviews/pending` | Get pending reviews | Yes |

### 💳 Payments (`/payments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/payments/methods` | Get payment methods | Yes |
| POST | `/payments/methods` | Add payment method | Yes |
| DELETE | `/payments/methods/:id` | Delete payment method | Yes |
| GET | `/payments/payout-methods` | Get payout methods | Yes |
| POST | `/payments/payout-methods` | Add payout method | Yes |
| POST | `/payments/process` | Process payment | Yes |
| GET | `/payments/transactions` | Get transaction history | Yes |
| POST | `/payments/refund` | Process refund | Yes |
| GET | `/payments/earnings` | Get earnings summary | Yes |

### 🔔 Notifications (`/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | Get user notifications | Yes |
| GET | `/notifications/unread-count` | Get unread count | Yes |
| POST | `/notifications` | Send notification | Yes |
| PUT | `/notifications/:id/read` | Mark as read | Yes |
| PUT | `/notifications/mark-all-read` | Mark all as read | Yes |
| DELETE | `/notifications/:id` | Delete notification | Yes |
| GET | `/notifications/preferences` | Get preferences | Yes |
| PUT | `/notifications/preferences` | Update preferences | Yes |

### 📤 File Upload (`/upload`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload/images` | Upload multiple images | Yes |
| POST | `/upload/profile-image` | Upload profile image | Yes |
| POST | `/upload/item-images` | Upload item images | Yes |
| DELETE | `/upload/images/:filename` | Delete image | Yes |
| GET | `/upload/images/:filename` | Serve image | No |
| POST | `/upload/validate-image` | Validate image | Yes |
| GET | `/upload/storage-info` | Get storage usage | Yes |

---

## Request/Response Examples

### Create New Item

**POST** `/items`

```json
{
  "category_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Elegant Evening Dress",
  "description": "Beautiful black evening dress perfect for special occasions",
  "brand": "Designer Brand",
  "size": "M",
  "condition": "excellent",
  "price_per_day": 45.00,
  "deposit_amount": 200.00,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "tags": ["evening", "formal", "elegant"],
  "style_tags": ["classic", "sophisticated"]
}
```

**Response:**
```json
{
  "message": "Item created successfully",
  "data": {
    "item": {
      "id": "987fcdeb-51f2-12d3-a456-426614174000",
      "title": "Elegant Evening Dress",
      "description": "Beautiful black evening dress...",
      "price_per_day": 45.00,
      "status": "active",
      "created_at": "2025-01-01T00:00:00Z",
      "categories": {
        "name": "Dresses",
        "icon": "shirt-outline",
        "color": "#E91E63"
      },
      "users": {
        "full_name": "Jane Doe",
        "profile_image_url": "https://example.com/profile.jpg",
        "average_rating": 4.8
      }
    }
  }
}
```

### Create Booking

**POST** `/bookings`

```json
{
  "item_id": "987fcdeb-51f2-12d3-a456-426614174000",
  "start_date": "2025-02-15",
  "end_date": "2025-02-17",
  "pickup_method": "delivery",
  "delivery_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  },
  "special_instructions": "Please deliver before 6 PM"
}
```

### Search Items

**GET** `/items?q=dress&category_id=123&min_price=20&max_price=100&city=New York&page=1&limit=20`

**Response:**
```json
{
  "message": "Items retrieved successfully",
  "data": {
    "items": [
      {
        "id": "987fcdeb-51f2-12d3-a456-426614174000",
        "title": "Elegant Evening Dress",
        "price_per_day": 45.00,
        "images": ["https://example.com/image1.jpg"],
        "condition": "excellent",
        "average_rating": 4.7,
        "categories": {
          "name": "Dresses",
          "icon": "shirt-outline"
        },
        "users": {
          "full_name": "Jane Doe",
          "average_rating": 4.8
        }
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20,
    "has_more": false
  }
}
```

---

## Error Handling

The API uses standard HTTP status codes and returns error responses in this format:

```json
{
  "error": "Error Type",
  "status": 400,
  "details": "Detailed error message",
  "timestamp": "2025-01-01T00:00:00Z",
  "path": "/api/items",
  "method": "POST"
}
```

### Common Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate resource)
- **422**: Unprocessable Entity (validation failed)
- **429**: Too Many Requests (rate limited)
- **500**: Internal Server Error

---

## Rate Limiting

The API implements rate limiting:
- **100 requests per 15-minute window** per IP address
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

---

## Pagination

Many endpoints support pagination using query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes pagination metadata:
```json
{
  "data": { ... },
  "total": 150,
  "page": 1,
  "limit": 20,
  "has_more": true
}
```

---

## WebSocket Events

The API includes WebSocket support for real-time features:

### Events
- `new-message`: New message received
- `new-notification`: New notification
- `user-typing`: User typing indicator
- `booking-update`: Booking status changed

### Connection
```javascript
const socket = io('http://localhost:3000');
socket.emit('join-user-room', userId);
socket.emit('join-conversation', conversationId);
```

---

## Development Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Set up database with the provided SQL schema

4. Start development server:
   ```bash
   npm run dev
   ```

5. API will be available at: `http://localhost:3000`

---

## Health Check

**GET** `/health`

Returns server status and basic information:

```json
{
  "status": "OK",
  "message": "Rent My Threads API is running",
  "timestamp": "2025-01-01T00:00:00Z",
  "environment": "development"
}
```
