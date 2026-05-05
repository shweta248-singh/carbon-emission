const express = require('express');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const Shipment = require('../models/Shipment');
const { protect } = require('../middleware/auth');
const { getShipmentSavings } = require('../utils/carbon');

const router = express.Router();

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
router.get(
  '/dashboard',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const totalInventory = await Inventory.countDocuments({ user: userId });
    const totalShipments = await Shipment.countDocuments({ user: userId });

    const shipments = await Shipment.find({ user: userId }).lean();

    const totalEmissions = shipments.reduce(
      (acc, curr) => acc + (Number(curr.carbonEmissionKg) || 0),
      0
    );

    const totalSaved = shipments.reduce(
      (acc, curr) => acc + getShipmentSavings(curr),
      0
    );

    const monthlyTrends = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      const monthShipments = shipments.filter((s) => {
        const sDate = new Date(s.createdAt);
        return sDate >= monthStart && sDate < monthEnd;
      });

      monthlyTrends.push({
        month: monthName,
        emission: Number(
          monthShipments
            .reduce((acc, s) => acc + (Number(s.carbonEmissionKg) || 0), 0)
            .toFixed(1)
        ),
        saved: Number(
          monthShipments
            .reduce((acc, s) => acc + getShipmentSavings(s), 0)
            .toFixed(1)
        ),
      });
    }

    const vehicleEmissions = await Shipment.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$vehicleType',
          totalEmission: { $sum: '$carbonEmissionKg' },
        },
      },
      {
        $project: {
          _id: 0,
          vehicleType: '$_id',
          totalEmission: { $round: ['$totalEmission', 2] },
        },
      },
      { $sort: { totalEmission: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalInventory,
        totalShipments,
        totalEmissions: Number(totalEmissions.toFixed(2)),
        totalSaved: Number(totalSaved.toFixed(2)),
        vehicleChart: vehicleEmissions || [],
        monthlyTrends,
      },
    });
  })
);

// @desc    Get emissions by vehicle type aggregation
// @route   GET /api/analytics/emissions-by-vehicle-type
// @access  Private
router.get(
  '/emissions-by-vehicle-type',
  protect,
  asyncHandler(async (req, res) => {
    // Use the native ObjectId from the user document for maximum reliability
    const matchUser = req.user._id;

    const emissionsByVehicle = await Shipment.aggregate([
      { $match: { user: matchUser } },
      {
        $group: {
          _id: '$vehicleType',
          totalEmission: { $sum: '$carbonEmissionKg' },
        },
      },
      {
        $project: {
          _id: 0,
          vehicleType: '$_id',
          totalEmission: { $round: ['$totalEmission', 2] },
        },
      },
      { $sort: { totalEmission: -1 } },
    ]);

    res.json({
      success: true,
      data: emissionsByVehicle || [],
    });
  })
);

module.exports = router;