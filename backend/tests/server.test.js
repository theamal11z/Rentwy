const request = require('supertest');
const { app } = require('../server');

describe('Server Tests', () => {
  describe('Health Check', () => {
    test('GET /health should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message', 'Rent My Threads API is running');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('404 Handler', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
      expect(response.body).toHaveProperty('availableRoutes');
      expect(Array.isArray(response.body.availableRoutes)).toBe(true);
    });
  });

  describe('API Routes', () => {
    test('should have auth endpoints available', async () => {
      // Test GET /api/auth/me (should return 401 without auth)
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
      
      // Test POST /api/auth/login (should return 400 for missing data)
      const loginResponse = await request(app).post('/api/auth/login');
      expect(loginResponse.status).toBe(400);
      
      // Test POST /api/auth/register (should return 400 for missing data)
      const registerResponse = await request(app).post('/api/auth/register');
      expect(registerResponse.status).toBe(400);
    });

    test('should have categories endpoint available', async () => {
      const response = await request(app).get('/api/categories');
      // Should not return 404 (route exists)
      expect(response.status).not.toBe(404);
    });
  });
});
