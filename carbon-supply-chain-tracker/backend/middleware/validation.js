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
    errors: extractedErrors,
  });
};

const registerValidationRules = () => {
  return [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  ];
};

const loginValidationRules = () => {
  return [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ];
};

const shipmentValidationRules = () => {
  return [
    body('originCity').notEmpty().withMessage('Origin city is required'),
    body('destinationCity').notEmpty().withMessage('Destination city is required'),
    body('distanceKm')
      .isNumeric().withMessage('Distance must be a number')
      .custom(val => val >= 1 && val <= 20000).withMessage('Distance must be between 1 and 20000 km'),
    body('vehicleType').notEmpty().withMessage('Vehicle type is required'),
    body('vehicleNumber')
      .notEmpty().withMessage('Vehicle number is required')
      .matches(/^[A-Z]{2}[0-9]{1,2}\s?[A-Z]{1,2}\s?[0-9]{4}$/i).withMessage('Enter a valid vehicle number, e.g. UP32 AB 1234'),
    body('vehicleModel')
      .notEmpty().withMessage('Vehicle model is required')
      .isLength({ min: 2 }).withMessage('Vehicle model must be at least 2 characters'),
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
    body('productName').notEmpty().withMessage('Product name is required'),
    body('quantity').isNumeric().withMessage('Quantity must be a number').custom(val => val >= 0).withMessage('Quantity cannot be negative'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('warehouseLocation').notEmpty().withMessage('Warehouse location is required'),
  ];
};

module.exports = {
  validate,
  registerValidationRules,
  loginValidationRules,
  shipmentValidationRules,
  inventoryValidationRules
};
