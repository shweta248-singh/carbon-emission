const express = require('express');
const Inventory = require('../models/Inventory');
const Shipment = require('../models/Shipment');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalInventory = await Inventory.countDocuments({ user: userId });
    const totalShipments = await Shipment.countDocuments({ user: userId });
    
    const shipments = await Shipment.find({ user: userId });
    
    const totalEmissions = shipments.reduce((acc, curr) => acc + (curr.carbonEmissionKg || 0), 0);
    const totalSaved = shipments.reduce((acc, curr) => acc + (curr.savingsKg || 0), 0);

    // Vehicle-wise emission distribution
    const vehicleData = {
      truck: 0,
      van: 0,
      rail: 0,
      ship: 0
    };

    shipments.forEach(s => {
      if (vehicleData.hasOwnProperty(s.vehicleType)) {
        vehicleData[s.vehicleType] += (s.carbonEmissionKg || 0);
      }
    });

    const chartData = Object.keys(vehicleData).map(key => ({
      name: key,
      value: parseFloat(vehicleData[key].toFixed(2))
    }));

    res.json({
      success: true,
      data: {
        totalInventory,
        totalShipments,
        totalEmissions: parseFloat(totalEmissions.toFixed(2)),
        totalSaved: parseFloat(totalSaved.toFixed(2)),
        vehicleChart: chartData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
