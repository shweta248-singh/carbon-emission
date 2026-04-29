const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  inventoryId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Inventory',
    required: true,
  },
  origin: {
    type: String,
    required: [true, 'Please add an origin'],
  },
  destination: {
    type: String,
    required: [true, 'Please add a destination'],
  },
  distanceKm: {
    type: Number,
    required: [true, 'Please add distance in km'],
  },
  vehicleType: {
    type: String,
    enum: ['truck', 'van', 'rail', 'ship'],
    required: [true, 'Please add a vehicle type'],
  },
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending',
  },
  carbonEmissionKg: {
    type: Number,
  },
  recommendedVehicle: {
    type: String,
  },
  recommendedEmissionKg: {
    type: Number,
  },
  savingsKg: {
    type: Number,
  },
  vehicleDetails: {
    type: Object,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Shipment', shipmentSchema);
