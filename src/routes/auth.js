const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');

const router = express.Router();

// POST /api/auth/register
router.post('/register', validateRegistration, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const user = await User.create(email, password);
    
    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Validate password
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 