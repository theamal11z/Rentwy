# Rent My Threads - Backend API

A comprehensive REST API for a fashion rental marketplace built with Node.js, Express.js, and Supabase (PostgreSQL).

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- Supabase account and project
- (Optional) Stripe account for payments

### Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp ../.env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```bash
   # Required
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   JWT_SECRET=your_super_secure_jwt_secret
   
   # Optional but recommended
   STRIPE_SECRET_KEY=your_stripe_secret_key
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

4. **Set up database:**
   - Create a new Supabase project
   - Run the SQL schema from `../rent_my_threads_schema.sql` in your Supabase SQL editor

5. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 📋 Available Scripts

- `npm run dev` - Start development server with health checks
- `npm run dev:watch` - Start development server with auto-reload
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run check` - Run health checks only

## 📖 API Documentation

Full API documentation is available in [`../API_DOCUMENTATION.md`](../API_DOCUMENTATION.md)

### Quick Test

After starting the server, test the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Rent My Threads API is running",
  "timestamp": "2025-01-01T00:00:00Z",
  "environment": "development"
}
```

## 🏗️ API Structure

```
/api
├── /auth              # Authentication & user management
├── /users             # User profiles, settings, addresses
├── /categories        # Item categories
├── /items             # Fashion item listings
├── /bookings          # Rental bookings
├── /messages          # Messaging system
├── /reviews           # Reviews & ratings
├── /payments          # Payment processing
├── /notifications     # Push notifications
└── /upload            # File upload handling
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | No | Environment (development/production) |
| `PORT` | No | Server port (default: 3000) |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key |
| `JWT_SECRET` | Yes | JWT signing secret |
| `STRIPE_SECRET_KEY` | No | Stripe secret key for payments |
| `SENDGRID_API_KEY` | No | SendGrid API key for emails |

### Database Schema

The complete database schema is in `../rent_my_threads_schema.sql` and includes:

- **17 tables** covering all marketplace features
- **Triggers** for automatic stats updates
- **Views** for complex queries
- **Indexes** for optimal performance
- **Sample data** for development

## 🛡️ Security Features

- JWT-based authentication
- Input validation with Joi
- Rate limiting (100 requests/15 minutes)
- CORS protection
- Helmet security headers
- Password hashing with bcrypt
- SQL injection protection via Supabase
- File upload validation

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js        # Database configuration
├── middleware/
│   ├── auth.js           # Authentication middleware
│   └── errorHandler.js   # Error handling
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── users.js          # User management
│   ├── categories.js     # Categories
│   ├── items.js          # Item listings
│   ├── bookings.js       # Booking management
│   ├── messages.js       # Messaging
│   ├── reviews.js        # Reviews & ratings
│   ├── payments.js       # Payment processing
│   ├── notifications.js  # Notifications
│   └── upload.js         # File uploads
├── uploads/              # Local file storage
├── server.js             # Main server file
├── start-dev.js          # Development startup script
└── package.json          # Dependencies
```

## 🔌 WebSocket Features

Real-time features via Socket.IO:

- Live messaging
- Typing indicators
- Push notifications
- Booking updates

Connect to WebSocket:
```javascript
const socket = io('http://localhost:3000');
socket.emit('join-user-room', userId);
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Test specific endpoints with curl:
```bash
# Health check
curl http://localhost:3000/health

# Get categories
curl http://localhost:3000/api/categories

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"password123"}'
```

## 🚀 Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use production database credentials
3. Set up SSL/HTTPS
4. Configure proper CORS origins
5. Set up monitoring and logging

### Production Checklist

- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] Error monitoring (Sentry) set up
- [ ] Logging configured
- [ ] Backup strategy in place

## 🛠️ Development

### Adding New Routes

1. Create route file in `routes/`
2. Add middleware and validation
3. Import in `server.js`
4. Add to API documentation
5. Write tests

### Database Changes

1. Update `rent_my_threads_schema.sql`
2. Create migration script
3. Update database helper functions
4. Test with sample data

## 📞 Support

For issues and questions:

1. Check the API documentation
2. Review the database schema
3. Test with the health endpoint
4. Check server logs for errors

## 📄 License

MIT License - see LICENSE file for details
