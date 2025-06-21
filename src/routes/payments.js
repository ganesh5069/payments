const express = require('express');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');
const { validatePayment } = require('../middleware/validation');
const db = require('../database/database');

const router = express.Router();

// Apply authentication middleware to all payment routes
router.use(authenticateToken);

// Payment method handlers (extensible for future payment providers)
const paymentHandlers = {
  credit_card: async (paymentData) => {
    // Simulate credit card payment processing
    console.log('Processing credit card payment:', paymentData);
    return { success: true, transactionId: `cc_${Date.now()}` };
  },
  
  paypal: async (paymentData) => {
    // Simulate PayPal payment processing
    console.log('Processing PayPal payment:', paymentData);
    return { success: true, transactionId: `pp_${Date.now()}` };
  },
  
  stripe: async (paymentData) => {
    // Simulate Stripe payment processing
    console.log('Processing Stripe payment:', paymentData);
    return { success: true, transactionId: `st_${Date.now()}` };
  },
  
  bank_transfer: async (paymentData) => {
    // Simulate bank transfer processing
    console.log('Processing bank transfer:', paymentData);
    return { success: true, transactionId: `bt_${Date.now()}` };
  }
};

// POST /api/payments - Initiate a payment
router.post('/', validatePayment, async (req, res, next) => {
  const { product_id, payment_method,amount } = req.body;
  
  // Start database transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION', async (err) => {
      if (err) {
        return next(err);
      }

      try {
        // Get product details
        const product = await Product.findById(product_id);
        
        if (!product) {
          db.run('ROLLBACK');
          return res.status(404).json({ error: 'Product not found' });
        }

        // Check if product has sufficient quantity
        if (product.quantity <= 0) {
          db.run('ROLLBACK');
          return res.status(400).json({ error: 'Product is out of stock' });
        }

        // Check if the product belongs to the authenticated user
        if (product.user_id !== req.user.id) {
          db.run('ROLLBACK');
          return res.status(403).json({ error: 'Access denied' });
        }

        // Process payment using the selected payment method
        const paymentHandler = paymentHandlers[payment_method];
        if (!paymentHandler) {
          db.run('ROLLBACK');
          return res.status(400).json({ error: 'Unsupported payment method' });
        }

        const paymentData = {
          product_id,
          user_id: req.user.id,
          amount,
          payment_method
        };

        const paymentResult = await paymentHandler(paymentData);
        
        if (!paymentResult.success) {
          db.run('ROLLBACK');
          return res.status(400).json({ error: 'Payment processing failed' });
        }

        // Decrement product quantity atomically
        await Product.decrementQuantity(product_id, 1);

        // Record payment in database (for future extension)
        const insertPaymentQuery = `
          INSERT INTO payments (product_id, user_id, payment_method, amount, status)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(insertPaymentQuery, [
          product_id,
          req.user.id,
          payment_method,
          paymentData.amount,
          'completed'
        ], function(err) {
          if (err) {
            db.run('ROLLBACK');
            return next(err);
          }

          // Commit transaction
          db.run('COMMIT', (err) => {
            if (err) {
              return next(err);
            }

            res.status(201).json({
              message: 'Payment processed successfully',
              payment: {
                id: this.lastID,
                product_id,
                payment_method,
                amount: paymentData.amount,
                status: 'completed',
                transaction_id: paymentResult.transactionId
              }
            });
          });
        });

      } catch (error) {
        db.run('ROLLBACK');
        next(error);
      }
    });
  });
});

// GET /api/payments - Get payment history for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    const query = `
      SELECT p.*, pr.name as product_name
      FROM payments p
      JOIN products pr ON p.product_id = pr.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `;
    
    db.all(query, [req.user.id], (err, payments) => {
      if (err) {
        return next(err);
      }
      
      res.json({
        payments,
        count: payments.length
      });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 