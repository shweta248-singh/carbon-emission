const express = require('express');
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const Shipment = require('../models/Shipment');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get operations summary stats
// @route   GET /api/operations/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Total Products Added (Count of items in Inventory)
    const totalProducts = await Inventory.countDocuments({ user: userId });

    // 2. Total Shipments Created
    const totalShipments = await Shipment.countDocuments({ user: userId });

    // 3. Aggregate Stats (Distance, Emission, Savings)
    const stats = await Shipment.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$distanceKm' },
          totalEmission: { $sum: '$carbonEmissionKg' },
          totalSavings: { $sum: '$savingsKg' },
          avgEmission: { $avg: '$carbonEmissionKg' },
        },
      },
    ]);

    const aggregateStats = stats[0] || {
      totalDistance: 0,
      totalEmission: 0,
      totalSavings: 0,
      avgEmission: 0,
    };

    // 4. Most Used Vehicle
    const vehicleStats = await Shipment.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$vehicleType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const mostUsedVehicle = vehicleStats[0] ? vehicleStats[0]._id : 'N/A';

    // 5. Last Shipment Date
    const lastShipment = await Shipment.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .select('createdAt');
    const lastShipmentDate = lastShipment ? lastShipment.createdAt : null;

    // 6. Most Used Route
    const routeStats = await Shipment.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { origin: '$origin', destination: '$destination' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const mostUsedRoute = routeStats[0]
      ? `${routeStats[0]._id.origin} ➔ ${routeStats[0]._id.destination}`
      : 'N/A';

    res.json({
      success: true,
      data: {
        totalProducts,
        totalInventoryTransactions: totalProducts, // Using as proxy
        totalShipments,
        totalDistance: aggregateStats.totalDistance,
        totalEmission: aggregateStats.totalEmission,
        totalSavings: aggregateStats.totalSavings,
        avgEmission: aggregateStats.avgEmission,
        mostUsedVehicle,
        lastShipmentDate,
        mostUsedRoute,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
