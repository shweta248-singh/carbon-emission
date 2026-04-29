const express = require('express');
const axios = require('axios');
const Shipment = require('../models/Shipment');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all shipments
// @route   GET /api/shipments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const shipments = await Shipment.find({ user: req.user.id }).populate('inventoryId');
    res.json({ success: true, count: shipments.length, data: shipments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get optimization preview without saving
// @route   POST /api/shipments/optimize
// @access  Private
router.post('/optimize', protect, async (req, res) => {
  try {
    const { distanceKm, vehicleType } = req.body;

    // Call Python Optimizer Engine
    const response = await axios.post(`${process.env.OPTIMIZER_URL}/optimize`, {
      distanceKm,
      vehicleType
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create new shipment with optimization
// @route   POST /api/shipments
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { inventoryId, originCity, destinationCity, distanceKm, vehicleType } = req.body;

    // Call Python Optimizer Engine
    let optimizationData = {};
    try {
      const response = await axios.post(`${process.env.OPTIMIZER_URL}/optimize`, {
        distanceKm,
        vehicleType
      });
      optimizationData = response.data;
    } catch (err) {
      console.error('Optimizer Engine Error:', err.message);
      // Fallback or handle error
    }

    const shipment = await Shipment.create({
      user: req.user.id,
      inventoryId,
      origin: originCity,
      destination: destinationCity,
      distanceKm,
      vehicleType,
      carbonEmissionKg: optimizationData.currentEmissionKg || 0,
      recommendedVehicle: optimizationData.recommendedVehicle || vehicleType,
      recommendedEmissionKg: optimizationData.recommendedEmissionKg || 0,
      savingsKg: optimizationData.savingsKg || 0,
    });

    res.status(201).json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update shipment status
// @route   PATCH /api/shipments/:id/status
// @access  Private
router.patch('/:id/status', protect, async (req, res) => {
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
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
