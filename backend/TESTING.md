# Backend Testing Guide

## Quick Start
```bash
# Run all automated tests
npm test

# Run manual API tests
./test-api.sh

# Run tests with coverage
npm test -- --coverage
```

## Test Categories

### 1. Unit Tests (Jest + Supertest)
- **Location**: `tests/` directory
- **Purpose**: Test individual API endpoints and business logic
- **Run**: `npm test`

### 2. Manual API Tests
- **Location**: `test-api.sh`
- **Purpose**: Manual verification of API endpoints
- **Run**: `./test-api.sh`

## What's Currently Tested

### ✅ Working Endpoints
- `GET /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile (requires auth)
- `PUT /api/auth/change-password` - Change password (requires auth)
- `GET /api/categories` - Get categories

### ❌ Issues Found
- `GET /api/items` - Returns 500 error (needs debugging)

## Testing Best Practices

### For Development
1. Run tests after every change: `npm test -- --watch`
2. Check test coverage: `npm test -- --coverage`
3. Test individual endpoints: `curl` or `./test-api.sh`

### For Production
1. All tests must pass: `npm test`
2. Manual smoke tests: `./test-api.sh`
3. Load testing with tools like `ab` or `wrk`
4. Security testing with tools like `nmap` or `nikto`

## Adding New Tests

### Unit Tests
1. Create `tests/[feature].test.js`
2. Import supertest and your app
3. Write test cases for success/failure scenarios
4. Test validation, authentication, and business logic

### Integration Tests
1. Test complete user workflows
2. Test with real database data
3. Test WebSocket functionality
4. Test file uploads

## Environment Setup
- Tests run in `NODE_ENV=test`
- Uses separate test database (if configured)
- Mocks external services (email, payments, etc.)

## Debugging Tests
```bash
# Run specific test file
npm test -- tests/auth.test.js

# Run with verbose output
npm test -- --verbose

# Debug specific test
node --inspect-brk node_modules/.bin/jest tests/auth.test.js
```

## Performance Testing
```bash
# Install apache bench
sudo apt-get install apache2-utils

# Test endpoint performance
ab -n 1000 -c 10 http://localhost:3000/health

# Test with authentication
ab -n 100 -c 5 -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/auth/me
```

## Security Testing
```bash
# Test for common vulnerabilities
npm audit

# Check for outdated dependencies
npm outdated

# Manual security testing
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "'\''OR 1=1--"}'
```
