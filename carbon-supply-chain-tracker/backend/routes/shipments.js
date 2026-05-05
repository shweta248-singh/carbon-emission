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
    inventoryId, originCity, destinationCity, distanceKm, vehicleType, vehicleCategory,
    quantity = 1,
    vehicleNumber, vehicleModel, fuelType, loadCapacity, cargoWeight, loadUtilization,
    averageMileage, energyConsumption, emissionFactor, driverName, transportCompany,
    vesselType, railType, aircraftType
  } = req.body;

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

  // 2. Advanced Emission Calculation Logic
  let carbonEmissionKg = 0;
  let emissionFactorUsed = 0;
  let calculationMethod = '';
  const dist = parseFloat(distanceKm);
  const weight = parseFloat(cargoWeight) || 0;
  const manualFactor = parseFloat(emissionFactor);

  const FUEL_FACTORS = {
    'Petrol': 2.31,
    'Diesel': 2.68,
    'CNG': 2.75,
    'LPG': 1.51
  };
  const ELECTRIC_FACTOR = 0.716; // kg CO2e/kWh

  const TON_KM_FACTORS = {
    'Rail': { 'Diesel Freight': 0.027, 'Electric Freight': 0.012 },
    'Ship': { 'Container Ship': 0.016, 'Bulk Carrier': 0.006, 'Tanker': 0.008, 'General Cargo': 0.021 },
    'Air': { 'default': 0.602 }
  };

  if (manualFactor > 0) {
    emissionFactorUsed = manualFactor;
    calculationMethod = 'Manual Override';
    if (vehicleCategory === 'Road') {
      if (fuelType === 'Electric') {
        carbonEmissionKg = dist * (parseFloat(energyConsumption) || 0) * manualFactor;
      } else {
        carbonEmissionKg = (dist / (parseFloat(averageMileage) || 1)) * manualFactor;
      }
    } else {
      carbonEmissionKg = dist * weight * manualFactor;
    }
  } else {
    calculationMethod = 'System Default';
    if (vehicleCategory === 'Road') {
      if (fuelType === 'Electric') {
        emissionFactorUsed = ELECTRIC_FACTOR;
        const energyUsed = dist * (parseFloat(energyConsumption) || 0);
        carbonEmissionKg = energyUsed * emissionFactorUsed;
      } else {
        emissionFactorUsed = FUEL_FACTORS[fuelType] || 2.68;
        const fuelUsed = dist / (parseFloat(averageMileage) || 1);
        carbonEmissionKg = fuelUsed * emissionFactorUsed;
      }
    } else if (vehicleCategory === 'Rail') {
      emissionFactorUsed = TON_KM_FACTORS.Rail[railType] || 0.027;
      carbonEmissionKg = dist * weight * emissionFactorUsed;
    } else if (vehicleCategory === 'Ship') {
      emissionFactorUsed = TON_KM_FACTORS.Ship[vesselType] || 0.016;
      carbonEmissionKg = dist * weight * emissionFactorUsed;
    } else if (vehicleCategory === 'Air') {
      emissionFactorUsed = TON_KM_FACTORS.Air.default;
      carbonEmissionKg = dist * weight * emissionFactorUsed;
    }
  }

  // 3. Call Python Optimizer Engine (Optional/Background)
  let optimizationData = {};
  try {
    const response = await axios.post(`${process.env.OPTIMIZER_URL}/optimize`, {
      distanceKm,
      vehicleType
    }, { timeout: 5000 });
    optimizationData = response.data;
  } catch (err) {
    console.error('Optimizer Engine Error:', err.message);
  }

  // 4. Create Shipment
  const shipment = await Shipment.create({
    user: req.user.id,
    inventoryId,
    origin: originCity,
    destination: destinationCity,
    distanceKm: dist,
    vehicleType,
    vehicleCategory,
    vehicleNumber,
    vehicleModel,
    fuelType,
    loadCapacity,
    cargoWeight: weight,
    loadUtilization,
    averageMileage,
    energyConsumption,
    emissionFactor: manualFactor || undefined,
    emissionFactorUsed,
    calculationMethod,
    driverName,
    transportCompany,
    vesselType,
    railType,
    aircraftType,
    carbonEmissionKg,
    recommendedVehicle: optimizationData.recommendedVehicle || vehicleType,
    recommendedEmissionKg: optimizationData.recommendedEmissionKg || 0,
    status: 'Pending'
  });

  // Calculate savings for the response/storage
  shipment.savingsKg = getShipmentSavings({
    vehicleType,
    distanceKm: dist,
    carbonEmissionKg,
    savingsKg: optimizationData.savingsKg,
  });
  await shipment.save();

  // 5. Deduct Inventory
  inventoryItem.quantity -= quantity;
  await inventoryItem.save();

  res.status(201).json({ 
    success: true, 
    data: shipment,
    calculatedEmission: carbonEmissionKg,
    emissionFactorUsed: emissionFactorUsed
  });
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
