const express = require('express');
const asyncHandler = require('express-async-handler');
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/auth');
const router = express.Router();

const { validate, inventoryValidationRules } = require('../middleware/validation');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const inventory = await Inventory.find({ user: req.user.id });
  res.json({ success: true, count: inventory.length, data: inventory });
}));

// @desc    Add new inventory item
// @route   POST /api/inventory
// @access  Private
router.post('/', protect, inventoryValidationRules(), validate, asyncHandler(async (req, res) => {
  const { productName, quantity, sku, warehouseLocation, category } = req.body;
  
  const item = await Inventory.create({
    user: req.user.id,
    productName,
    quantity,
    sku,
    warehouseLocation,
    category
  });

  res.status(201).json({ success: true, data: item });
}));

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
router.put('/:id', protect, inventoryValidationRules(), validate, asyncHandler(async (req, res) => {
  const { productName, quantity, sku, warehouseLocation, category } = req.body;
  let item = await Inventory.findById(req.params.id);

  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  if (item.user.toString() !== req.user.id) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  item = await Inventory.findByIdAndUpdate(req.params.id, {
    productName,
    quantity,
    sku,
    warehouseLocation,
    category
  }, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: item });
}));

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);

  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  if (item.user.toString() !== req.user.id) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  await item.deleteOne();

  res.json({ success: true, data: {} });
}));

module.exports = router;
