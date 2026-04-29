const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  productName: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'Please add a SKU'],
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Please add a quantity'],
    min: [0, 'Quantity cannot be negative'],
  },
  warehouseLocation: {
    type: String,
    required: [true, 'Please add a warehouse location'],
  },
  category: {
    type: String,
    trim: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Inventory', inventorySchema);
