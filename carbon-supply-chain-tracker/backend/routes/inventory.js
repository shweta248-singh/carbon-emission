const express = require('express');
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const inventory = await Inventory.find({ user: req.user.id });
    res.json({ success: true, count: inventory.length, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add new inventory item
// @route   POST /api/inventory
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    req.body.user = req.user.id;
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
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
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
