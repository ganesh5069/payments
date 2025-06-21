const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }
  next();
};

const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Product name must be between 1 and 255 characters'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  handleValidationErrors
];

const validatePayment = [
  body('product_id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  body('payment_method')
    .isIn(['credit_card', 'paypal', 'stripe', 'bank_transfer'])
    .withMessage('Invalid payment method'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateProduct,
  validatePayment,
  handleValidationErrors
}; 