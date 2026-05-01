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
      .custom(val => val >= 1 && val <= 20000).withMessage('Distance must be between 1 and 20000 km'),
    body('vehicleType').notEmpty().withMessage('Vehicle type is required').escape(),
    body('vehicleNumber')
      .trim().notEmpty().withMessage('Vehicle number is required')
      .matches(/^[A-Z]{2}[0-9]{1,2}\s?[A-Z]{1,2}\s?[0-9]{4}$/i).withMessage('Enter a valid vehicle number, e.g. UP32 AB 1234').escape(),
    body('vehicleModel')
      .trim().notEmpty().withMessage('Vehicle model is required')
      .isLength({ min: 2 }).withMessage('Vehicle model must be at least 2 characters').escape(),
    body('fuelType')
      .notEmpty().withMessage('Fuel type is required')
      .isIn(['Diesel', 'Petrol', 'CNG', 'Electric', 'Hybrid']).withMessage('Invalid fuel type'),
    body('loadCapacity')
      .optional({ checkFalsy: true })
      .isNumeric().withMessage('Load capacity must be a number')
      .custom(val => val >= 0.1 && val <= 50).withMessage('Load capacity must be between 0.1 and 50 Tons'),
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

