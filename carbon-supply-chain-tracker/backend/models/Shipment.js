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
    enum: [
      'truck', 'mini_truck', 'van', 'pickup', 'bike', 'car', 'electric_van', 
      'rail', 'ship', 'air_cargo', 'container_truck', 'refrigerated_truck', 'ev_truck'
    ],
    required: [true, 'Please add a vehicle type'],
  },
  vehicleNumber: String,
  vehicleModel: String,
  fuelType: {
    type: String,
    enum: ['Diesel', 'Petrol', 'CNG', 'Electric', 'Hybrid', 'Marine Fuel', 'Aviation Fuel'],
  },
  loadCapacity: Number,
  averageMileage: Number,
  emissionFactor: Number,
  driverName: String,
  transportCompany: String,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Shipment', shipmentSchema);
