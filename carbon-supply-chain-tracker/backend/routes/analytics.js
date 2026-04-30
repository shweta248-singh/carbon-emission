const express = require('express');
const Inventory = require('../models/Inventory');
const Shipment = require('../models/Shipment');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalInventory = await Inventory.countDocuments({ user: userId });
    const totalShipments = await Shipment.countDocuments({ user: userId });
    
    const shipments = await Shipment.find({ user: userId });
    
    const totalEmissions = shipments.reduce((acc, curr) => acc + (curr.carbonEmissionKg || 0), 0);
    const totalSaved = shipments.reduce((acc, curr) => acc + (curr.savingsKg || 0), 0);

    // Monthly Trends (last 6 months)
    const monthlyTrends = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const monthShipments = shipments.filter(s => {
        const sDate = new Date(s.createdAt);
        return sDate >= monthStart && sDate <= monthEnd;
      });

      monthlyTrends.push({
        month: monthName,
        emission: parseFloat(monthShipments.reduce((acc, s) => acc + (s.carbonEmissionKg || 0), 0).toFixed(1)),
        saved: parseFloat(monthShipments.reduce((acc, s) => acc + (s.savingsKg || 0), 0).toFixed(1))
      });
    }

    // Vehicle-wise emission distribution
    const vehicleData = {};

    shipments.forEach(s => {
      if (!vehicleData[s.vehicleType]) {
        vehicleData[s.vehicleType] = 0;
      }
      vehicleData[s.vehicleType] += (s.carbonEmissionKg || 0);
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
        vehicleChart: chartData,
        monthlyTrends
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
