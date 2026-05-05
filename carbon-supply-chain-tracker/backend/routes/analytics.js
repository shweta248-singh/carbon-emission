const express = require('express');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Shipment = require('../models/Shipment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get analytics summary
// @route   GET /api/analytics/summary
// @access  Private
router.get(
  '/summary',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const stats = await Shipment.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalEmissions: { $sum: '$carbonEmissionKg' },
          totalSaved: { $sum: '$savingsKg' },
          count: { $sum: 1 },
          optimalCount: {
            $sum: {
              $cond: [{ $eq: ['$vehicleType', '$recommendedVehicle'] }, 1, 0]
            }
          }
        }
      }
    ]);

    if (!stats || stats.length === 0) {
      return res.json({
        success: true,
        data: {
          totalEmissions: 0,
          totalSaved: 0,
          optimalShipmentPercentage: 0,
          carbonEfficiencyScore: "N/A"
        }
      });
    }

    const { totalEmissions, totalSaved, count, optimalCount } = stats[0];
    const optimalShipmentPercentage = count > 0 ? Math.round((optimalCount / count) * 100) : 0;
    
    // Simple logic for efficiency score
    let carbonEfficiencyScore = "C";
    if (optimalShipmentPercentage > 80) carbonEfficiencyScore = "A";
    else if (optimalShipmentPercentage > 60) carbonEfficiencyScore = "B";

    res.json({
      success: true,
      data: {
        totalEmissions: Number(totalEmissions.toFixed(2)),
        totalSaved: Number(totalSaved.toFixed(2)),
        optimalShipmentPercentage,
        carbonEfficiencyScore
      }
    });
  })
);

// @desc    Get emissions by vehicle type
// @route   GET /api/analytics/emissions-by-vehicle-type
// @access  Private
router.get(
  '/emissions-by-vehicle-type',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const vehicleData = await Shipment.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$vehicleType',
          totalEmission: { $sum: '$carbonEmissionKg' }
        }
      },
      {
        $project: {
          _id: 0,
          vehicleType: '$_id',
          totalEmission: { $round: ['$totalEmission', 2] }
        }
      },
      { $sort: { totalEmission: -1 } }
    ]);

    res.json({
      success: true,
      data: vehicleData || []
    });
  })
);

// @desc    Get emission trend
// @route   GET /api/analytics/emission-trend
// @access  Private
router.get(
  '/emission-trend',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const trend = await Shipment.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          carbonEmissions: { $sum: '$carbonEmissionKg' },
          co2Saved: { $sum: '$savingsKg' }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          carbonEmissions: { $round: ['$carbonEmissions', 2] },
          co2Saved: { $round: ['$co2Saved', 2] }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({
      success: true,
      data: trend || []
    });
  })
);

// Deprecated legacy dashboard route (mapping to new logic for backward compatibility if needed)
router.get(
  '/dashboard',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    // ... existing logic or redirect to new endpoints
    res.status(410).json({ success: false, message: 'Endpoint deprecated. Use /summary, /emissions-by-vehicle-type, and /emission-trend.' });
  })
);

module.exports = router;