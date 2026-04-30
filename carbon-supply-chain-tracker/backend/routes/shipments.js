const express = require('express');
const axios = require('axios');
const Shipment = require('../models/Shipment');
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/auth');
const router = express.Router();

const { validate, shipmentValidationRules } = require('../middleware/validation');

// @desc    Get all shipments
// @route   GET /api/shipments
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const shipments = await Shipment.find({ user: req.user.id }).populate('inventoryId');
    res.json({ success: true, count: shipments.length, data: shipments });
  } catch (error) {
    next(error);
  }
});

// @desc    Get optimization preview without saving
// @route   POST /api/shipments/optimize
// @access  Private
router.post('/optimize', protect, shipmentValidationRules(), validate, async (req, res, next) => {
  try {
    const { distanceKm, vehicleType } = req.body;

    // Call Python Optimizer Engine
    const response = await axios.post(`${process.env.OPTIMIZER_URL}/optimize`, {
      distanceKm,
      vehicleType
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new shipment with optimization
// @route   POST /api/shipments
// @access  Private
router.post('/', protect, shipmentValidationRules(), validate, async (req, res, next) => {
  try {
    const { 
      inventoryId, originCity, destinationCity, distanceKm, vehicleType, 
      quantity = 1,
      vehicleNumber, vehicleModel, fuelType, loadCapacity, 
      averageMileage, emissionFactor, driverName, transportCompany 
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

    // 2. Call Python Optimizer Engine
    let optimizationData = {};
    try {
      const response = await axios.post(`${process.env.OPTIMIZER_URL}/optimize`, {
        distanceKm,
        vehicleType
      });
      optimizationData = response.data;
    } catch (err) {
      console.error('Optimizer Engine Error:', err.message);
    }

    // 3. Calculate Emission
    let carbonEmissionKg = 0;
    const dist = parseFloat(distanceKm);
    const eFactor = parseFloat(emissionFactor);

    if (!isNaN(eFactor) && !isNaN(dist)) {
      carbonEmissionKg = dist * eFactor;
    } else {
      carbonEmissionKg = optimizationData.currentEmissionKg || 0;
    }

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
      savingsKg: optimizationData.savingsKg || 0,
    });

    // 4. Deduct Inventory
    inventoryItem.quantity -= quantity;
    await inventoryItem.save();

    res.status(201).json({ success: true, data: shipment });
  } catch (error) {
    next(error);
  }
});

// @desc    Update shipment status
// @route   PATCH /api/shipments/:id/status
// @access  Private
router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const { status } = req.body;
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

    res.json({ success: true, data: shipment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
