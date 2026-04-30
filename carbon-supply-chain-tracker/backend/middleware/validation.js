const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
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
    body('distanceKm').isNumeric().withMessage('Distance must be a number').custom(val => val > 0).withMessage('Distance must be positive'),
    body('vehicleType').notEmpty().withMessage('Vehicle type is required'),
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
