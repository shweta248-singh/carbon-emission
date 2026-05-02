const express = require('express');
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Shipment = require('../models/Shipment');
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/auth');
const { getShipmentSavings } = require('../utils/carbon');
const router = express.Router();

const { validate, shipmentValidationRules } = require('../middleware/validation');

// @desc    Get all shipments
// @route   GET /api/shipments
// @access  Private
// router.get('/', protect, asyncHandler(async (req, res) => {
//   const shipments = await Shipment.find({ user: req.user.id }).populate('inventoryId');
//   res.json({ success: true, count: shipments.length, data: shipments });
// }));

router.get('/', protect, asyncHandler(async (req, res) => {
  const shipments = await Shipment.find({ user: req.user.id })
    .populate('inventoryId')
    .lean();

  const formattedShipments = shipments.map((shipment) => ({
    ...shipment,
    savingsKg: getShipmentSavings(shipment),
  }));

  res.json({
    success: true,
    count: formattedShipments.length,
    data: formattedShipments,
  });
}));

// @desc    Get optimization preview without saving
// @route   POST /api/shipments/optimize
// @access  Private
router.post('/optimize', protect, shipmentValidationRules(), validate, asyncHandler(async (req, res) => {
  const { distanceKm, vehicleType } = req.body;

  // Feasibility Check
  if (distanceKm > 5000 && ['truck', 'van', 'car', 'bike', 'mini_truck', 'pickup'].includes(vehicleType)) {
    return res.status(400).json({ 
      success: false, 
      message: `${vehicleType.replace('_', ' ')} is not feasible for distances over 5000km. Please consider Air Cargo, Rail, or Ship.` 
    });
  }

  // Call Python Optimizer Engine with timeout
  const response = await axios.post(`${process.env.OPTIMIZER_URL}/optimize`, {
    distanceKm,
    vehicleType
  }, { timeout: 10000 });

  res.json({ success: true, data: response.data });
}));

// @desc    Create new shipment with optimization
// @route   POST /api/shipments
// @access  Private
router.post('/', protect, shipmentValidationRules(), validate, asyncHandler(async (req, res) => {
  const { 
    inventoryId, originCity, destinationCity, distanceKm, vehicleType, 
    quantity = 1,
    vehicleNumber, vehicleModel, fuelType, loadCapacity, 
    averageMileage, emissionFactor, driverName, transportCompany 
  } = req.body;

  // Feasibility Check
  if (distanceKm > 5000 && ['truck', 'van', 'car', 'bike', 'mini_truck', 'pickup'].includes(vehicleType)) {
    return res.status(400).json({ 
      success: false, 
      message: `${vehicleType.replace('_', ' ')} is not feasible for distances over 5000km.` 
    });
  }

  // 1. Check Inventory
  const inventoryItem = await Inventory.findById(inventoryId);
  if (!inventoryItem) {
    return res.status(404).json({ success: false, message: 'Inventory item not found' });
  }

  if (inventoryItem.user.toString() !== req.user.id) {
     return res.status(401).json({ success: false, message: 'Not authorized to use this inventory' });
  }

  if (inventoryItem.quantity < quantity) {
    return res.status(400).json({ success: false, message: 'Insufficient inventory quantity' });
  }

  // 2. Call Python Optimizer Engine
  let optimizationData = {};
  try {
    const response = await axios.post(`${process.env.OPTIMIZER_URL}/optimize`, {
      distanceKm,
      vehicleType
    }, { timeout: 10000 });
    optimizationData = response.data;
  } catch (err) {
    console.error('Optimizer Engine Error:', err.message);
    // Fallback logic handled below
  }

  // 3. Calculate Emission
  let carbonEmissionKg = 0;
  const dist = parseFloat(distanceKm);
  let eFactor = parseFloat(emissionFactor);

  const BACKEND_EMISSION_FACTORS = {
    "truck": 0.105, "mini_truck": 0.09, "van": 0.16, "pickup": 0.11, "bike": 0.04,
    "car": 0.12, "rail": 0.04, "ship": 0.015,
    "air_cargo": 0.60, "container_truck": 0.13, "refrigerated_truck": 0.15
  };

  if (isNaN(eFactor) || eFactor === 0) {
    if (optimizationData.currentEmissionKg > 0 && dist > 0) {
      eFactor = optimizationData.currentEmissionKg / dist;
    } else {
      eFactor = BACKEND_EMISSION_FACTORS[vehicleType] || 0.1;
    }
  }

  carbonEmissionKg = dist * eFactor;

  // 4. Create Shipment
  const shipment = await Shipment.create({
    user: req.user.id,
    inventoryId,
    origin: originCity,
    destination: destinationCity,
    distanceKm,
    vehicleType,
    vehicleNumber,
    vehicleModel,
    fuelType,
    loadCapacity,
    averageMileage,
    emissionFactor,
    driverName,
    transportCompany,
    carbonEmissionKg,
    recommendedVehicle: optimizationData.recommendedVehicle || vehicleType,
    recommendedEmissionKg: optimizationData.recommendedEmissionKg || 0,
    savingsKg: getShipmentSavings({
  vehicleType,
  distanceKm: dist,
  carbonEmissionKg,
  savingsKg: optimizationData.savingsKg,
}),
  });

  // 5. Deduct Inventory
  inventoryItem.quantity -= quantity;
  await inventoryItem.save();

  res.status(201).json({ success: true, data: shipment });
}));

// @desc    Update shipment status
// @route   PUT /api/shipments/:id/status
// @access  Private
router.put('/:id/status', protect, asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["Pending", "In Transit", "Delivered"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  let shipment = await Shipment.findById(req.params.id);

  if (!shipment) {
    return res.status(404).json({ success: false, message: 'Shipment not found' });
  }

  if (shipment.user.toString() !== req.user.id) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  shipment = await Shipment.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  // Create notification if delivered
  if (status === 'Delivered') {
    const Notification = require('../models/Notification');
    await Notification.create({
      user: req.user.id,
      title: 'shipment_delivered',
      message: `Your shipment from ${shipment.origin} to ${shipment.destination} has been delivered.`,
      type: 'shipment_delivered',
      relatedId: shipment._id.toString()
    });
  }

  res.json({ success: true, data: shipment });
}));

module.exports = router;
