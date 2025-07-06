// Test setup file
require('dotenv').config({ path: '../.env' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console.log in tests to keep output clean
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Common test utilities
global.testUtils = {
  // Mock user data
  mockUser: {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
    full_name: 'Test User'
  },

  // Mock JWT token
  mockToken: 'mock-jwt-token',

  // Helper to create authorization header
  authHeader: function(token = this.mockToken) {
    return { Authorization: `Bearer ${token}` };
  }
};
