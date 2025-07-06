#!/bin/bash

# Rent My Threads API Test Scripts
# Make sure your backend server is running on port 3000

API_BASE="http://localhost:3000/api"

echo "=== Rent My Threads API Tests ==="
echo

# Test 1: Health Check
echo "1. Health Check:"
curl -X GET "${API_BASE}/../health" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# Test 2: User Registration
echo "2. User Registration:"
curl -X POST "${API_BASE}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test-'$(date +%s)'@example.com",
    "password": "password123"
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Test 3: User Login (will fail without valid credentials)
echo "3. User Login (with invalid credentials):"
curl -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "wrongpassword"
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Test 4: Get User Profile (without token)
echo "4. Get User Profile (without authentication):"
curl -X GET "${API_BASE}/auth/me" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# Test 5: Get Categories
echo "5. Get Categories:"
curl -X GET "${API_BASE}/categories" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# Test 6: Get Items (may require auth)
echo "6. Get Items:"
curl -X GET "${API_BASE}/items" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo "=== Tests Complete ==="
