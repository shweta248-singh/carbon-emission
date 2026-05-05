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
      'truck', 'mini_truck', 'van', 'pickup', 'bike', 'car', 
      'rail', 'ship', 'air_cargo', 'container_truck', 'refrigerated_truck'
    ],
    required: [true, 'Please add a vehicle type'],
  },
  vehicleCategory: {
    type: String,
    enum: ['Road', 'Rail', 'Ship', 'Air'],
    required: true,
  },
  vehicleNumber: String,
  vehicleModel: String,
  fuelType: {
    type: String,
    enum: ['Diesel', 'Petrol', 'CNG', 'Electric', 'Hybrid', 'Marine Fuel', 'Aviation Fuel', 'HFO', 'MDO', 'LNG', 'LPG'],
  },
  loadCapacity: Number,
  cargoWeight: Number,
  loadUtilization: {
    type: Number,
    min: 0,
    max: 100,
  },
  averageMileage: Number,
  energyConsumption: Number,
  vesselType: String,
  railType: String,
  aircraftType: String,
  emissionFactor: Number,
  emissionFactorUsed: Number,
  calculationMethod: String,
  driverName: String,
  transportCompany: String,
  status: {
    type: String,
    enum: ["Pending", "In Transit", "Delivered"],
    default: "Pending",
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
