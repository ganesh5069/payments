const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/database');

describe('Product Endpoints', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Run migrations before tests
    require('../src/database/migrate');
    
    // Create a test user and get token
    const userData = {
      email: 'producttest@example.com',
      password: 'password123'
    };
    
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    db.close();
  });

  describe('GET /api/products', () => {
    it('should return user products when authenticated', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/api/products')
        .expect(401);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product successfully', async () => {
      const productData = {
        name: 'Test Product',
        quantity: 10
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Product created successfully');
      expect(response.body).toHaveProperty('product');
      expect(response.body.product.name).toBe(productData.name);
      expect(response.body.product.quantity).toBe(productData.quantity);
      expect(response.body.product.user_id).toBe(userId);
    });

    it('should validate product name', async () => {
      const productData = {
        name: '',
        quantity: 10
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should validate product quantity', async () => {
      const productData = {
        name: 'Test Product',
        quantity: -5
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('PUT /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      // Create a test product
      const productData = {
        name: 'Update Test Product',
        quantity: 15
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      productId = response.body.product.id;
    });

    it('should update product successfully', async () => {
      const updateData = {
        name: 'Updated Product Name',
        quantity: 20
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Product updated successfully');
      expect(response.body).toHaveProperty('product');
      expect(response.body.product.name).toBe(updateData.name);
      expect(response.body.product.quantity).toBe(updateData.quantity);
    });

    it('should return 404 for non-existent product', async () => {
      const updateData = {
        name: 'Updated Product Name',
        quantity: 20
      };

      await request(app)
        .put('/api/products/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      // Create a test product
      const productData = {
        name: 'Delete Test Product',
        quantity: 5
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      productId = response.body.product.id;
    });

    it('should delete product successfully', async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Product deleted successfully');
    });

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .delete('/api/products/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
}); 