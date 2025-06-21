const express = require('express');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');

const router = express.Router();

// Apply authentication middleware to all product routes
router.use(authenticateToken);

// GET /api/products - Get all products for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.findByUserId(req.user.id);
    res.json({
      products,
      count: products.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Get a specific product
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if the product belongs to the authenticated user
    if (product.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Create a new product
router.post('/', validateProduct, async (req, res, next) => {
  try {
    const { name, quantity } = req.body;
    const product = await Product.create(name, quantity, req.user.id);
    
    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id - Update a product
router.put('/:id', validateProduct, async (req, res, next) => {
  try {
    const { name, quantity } = req.body;
    const updates = {};
    
    if (name !== undefined) updates.name = name;
    if (quantity !== undefined) updates.quantity = quantity;

    const product = await Product.update(req.params.id, updates, req.user.id);
    
    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    if (error.message === 'Product not found or access denied') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', async (req, res, next) => {
  try {
    await Product.delete(req.params.id, req.user.id);
    
    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Product not found or access denied') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router; 