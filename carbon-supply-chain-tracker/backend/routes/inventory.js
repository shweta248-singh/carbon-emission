const express = require('express');
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/auth');
const router = express.Router();

const { validate, inventoryValidationRules } = require('../middleware/validation');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const inventory = await Inventory.find({ user: req.user.id });
    res.json({ success: true, count: inventory.length, data: inventory });
  } catch (error) {
    next(error);
  }
});

// @desc    Add new inventory item
// @route   POST /api/inventory
// @access  Private
router.post('/', protect, inventoryValidationRules(), validate, async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
router.put('/:id', protect, inventoryValidationRules(), validate, async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await item.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
