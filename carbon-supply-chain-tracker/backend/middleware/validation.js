const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(400).json({
    success: false,
    message: extractedErrors[0][Object.keys(extractedErrors[0])[0]], // First error message
    errors: extractedErrors,
  });
};

const registerValidationRules = () => {
  return [
    body('name').trim().notEmpty().withMessage('Name is required').escape(),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password')
      .isLength({ min: 10 }).withMessage('Password must be at least 10 characters long')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
  ];
};

const loginValidationRules = () => {
  return [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ];
};

const shipmentValidationRules = () => {
  return [
    body('originCity').trim().notEmpty().withMessage('Origin city is required').escape(),
    body('destinationCity').trim().notEmpty().withMessage('Destination city is required').escape(),
    body('distanceKm')
      .isNumeric().withMessage('Distance must be a number')
      .custom(val => val > 0 && val <= 20000).withMessage('Distance must be between 0.1 and 20000 km'),
    body('vehicleType').notEmpty().withMessage('Vehicle type is required').escape(),
    body('vehicleCategory').notEmpty().withMessage('Vehicle category is required').escape(),
    // Conditional validation can be complex in express-validator, 
    // so we'll do basic checks here and detailed logic in the controller if needed.
  ];
};

const inventoryValidationRules = () => {
  return [
    body('productName').trim().notEmpty().withMessage('Product name is required').escape(),
    body('quantity').isNumeric().withMessage('Quantity must be a number').custom(val => val >= 0).withMessage('Quantity cannot be negative'),
    body('sku').trim().notEmpty().withMessage('SKU is required').escape(),
    body('warehouseLocation').trim().notEmpty().withMessage('Warehouse location is required').escape(),
  ];
};

module.exports = {
  validate,
  registerValidationRules,
  loginValidationRules,
  shipmentValidationRules,
  inventoryValidationRules
};

