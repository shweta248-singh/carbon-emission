const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const asyncHandler = require('express-async-handler');
const Inventory = require('../models/Inventory');
const Shipment = require('../models/Shipment');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get operations summary stats
// @route   GET /api/operations/summary
// @access  Private
router.get('/summary', protect, asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const totalProducts = await Inventory.countDocuments({ user: userId });
  const totalShipments = await Shipment.countDocuments({ user: userId });

  const stats = await Shipment.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        totalDistance: { $sum: '$distanceKm' },
        totalEmission: { $sum: '$carbonEmissionKg' },
        avgEmission: { $avg: '$carbonEmissionKg' },
      },
    },
  ]);

  const aggregateStats = stats[0] || {
    totalDistance: 0,
    totalEmission: 0,
    avgEmission: 0,
  };

  const calculateFallbackSavings = (vehicleType, distanceKm, carbonEmissionKg) => {
    const factors = {
      truck: 0.105,
      mini_truck: 0.09,
      van: 0.16,
      pickup: 0.11,
      bike: 0.04,
      car: 0.12,
      rail: 0.04,
      ship: 0.015,
      air_cargo: 0.6,
      container_truck: 0.13,
      refrigerated_truck: 0.15,
    };

    const distance = Number(distanceKm) || 0;
    const currentEmission =
      Number(carbonEmissionKg) || distance * (factors[vehicleType] || 0.1);

    const bestEmission = distance * factors.ship;
    return Math.max(0, currentEmission - bestEmission);
  };

  const shipmentsForSavings = await Shipment.find({ user: userId }).select(
    'vehicleType distanceKm carbonEmissionKg savingsKg'
  );

  const calculatedSavings = shipmentsForSavings.reduce((total, shipment) => {
    if (typeof shipment.savingsKg === 'number' && shipment.savingsKg > 0) {
      return total + shipment.savingsKg;
    }

    return (
      total +
      calculateFallbackSavings(
        shipment.vehicleType,
        shipment.distanceKm,
        shipment.carbonEmissionKg
      )
    );
  }, 0);

  const vehicleStats = await Shipment.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$vehicleType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  const mostUsedVehicle = vehicleStats[0] ? vehicleStats[0]._id : 'N/A';

  const lastShipment = await Shipment.findOne({ user: userId })
    .sort({ createdAt: -1 })
    .select('createdAt');

  const lastShipmentDate = lastShipment ? lastShipment.createdAt : null;

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
      totalShipments,
      totalDistance: Number((aggregateStats.totalDistance || 0).toFixed(2)),
      totalEmission: Number((aggregateStats.totalEmission || 0).toFixed(2)),
      totalSavings: Number(calculatedSavings.toFixed(2)),
      avgEmission: Number((aggregateStats.avgEmission || 0).toFixed(2)),
      mostUsedVehicle,
      lastShipmentDate,
      mostUsedRoute,
    },
  });
}));

// Haversine Formula
const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const lon1 = coords1[0];
  const lat1 = coords1[1];
  const lon2 = coords2[0];
  const lat2 = coords2[1];

  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @desc    Calculate routes using OpenRouteService
// @route   POST /api/operations/calculate-routes
// @access  Private
router.post('/calculate-routes', protect, asyncHandler(async (req, res) => {
  const { originCity, destinationCity, vehicleType } = req.body;
  const apiKey = process.env.ORS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: 'ORS API Key not configured',
    });
  }

  const geocode = async (city) => {
    const response = await axios.get(
      'https://api.openrouteservice.org/geocode/search',
      {
        params: {
          text: city,
          size: 1,
        },
        headers: {
          Authorization: apiKey,
        },
        timeout: 8000,
      }
    );

    if (response.data.features && response.data.features.length > 0) {
      const match = response.data.features[0];

      return {
        coords: match.geometry.coordinates,
        label: match.properties.label,
        country: match.properties.country,
      };
    }

    return null;
  };

  const [originData, destData] = await Promise.all([
    geocode(originCity),
    geocode(destinationCity),
  ]);

  if (!originData || !destData) {
    const missing = !originData ? 'Origin' : 'Destination';

    return res.status(404).json({
      success: false,
      message: `Location not found: ${missing}. Please be more specific (e.g., City, Country).`,
    });
  }

  const approxDistance = haversineDistance(originData.coords, destData.coords);

  const ROAD_VEHICLES = [
    'truck',
    'mini_truck',
    'van',
    'pickup',
    'bike',
    'car',
    'container_truck',
    'refrigerated_truck',
  ];

  const isRoadVehicle = ROAD_VEHICLES.includes(vehicleType);

  if (isRoadVehicle && approxDistance > 5000) {
    return res.status(400).json({
      success: false,
      message: `${vehicleType.replace(
        '_',
        ' '
      )} is not feasible for distances over 5000km. Please choose Ship, Air Cargo, or Rail.`,
    });
  }

  let isEstimated = !isRoadVehicle;
  let routes = [];
  let isLongDistance = approxDistance > 100;
  let feasibilityWarning = null;

  if (isEstimated) {
    let speedKmH = 50;

    if (vehicleType === 'air_cargo') speedKmH = 800;
    else if (vehicleType === 'ship') speedKmH = 40;
    else if (vehicleType === 'rail') speedKmH = 60;

    routes = [
      {
        id: 0,
        distanceKm: approxDistance,
        durationMin: (approxDistance / speedKmH) * 60,
        geometry: [originData.coords, destData.coords],
      },
    ];
  } else {
    if (originData.country !== destData.country) {
      feasibilityWarning =
        'International road route detected. Cross-border logistics may vary.';
    }

    const directionsUrl =
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

    const getRequestBody = (withAlts) => ({
      coordinates: [originData.coords, destData.coords],
      ...(withAlts && {
        alternative_routes: {
          target_count: 3,
          share_factor: 0.6,
          weight_factor: 1.4,
        },
      }),
    });

    try {
      const response = await axios.post(
        directionsUrl,
        getRequestBody(!isLongDistance),
        {
          params: { api_key: apiKey },
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
        }
      );

      routes = response.data.features.map((f, i) => ({
        id: i,
        distanceKm: f.properties.summary.distance / 1000,
        durationMin: f.properties.summary.duration / 60,
        geometry: f.geometry.coordinates,
      }));
    } catch (err) {
      if (!isLongDistance && err.response?.status === 400) {
        const response = await axios.post(
          directionsUrl,
          getRequestBody(false),
          {
            params: { api_key: apiKey },
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000,
          }
        );

        isLongDistance = true;

        routes = response.data.features.map((f, i) => ({
          id: i,
          distanceKm: f.properties.summary.distance / 1000,
          durationMin: f.properties.summary.duration / 60,
          geometry: f.geometry.coordinates,
        }));
      } else {
        throw err;
      }
    }
  }

  if (feasibilityWarning) {
    const Notification = require('../models/Notification');

    await Notification.create({
      user: req.user.id,
      title: 'route_warning',
      message: feasibilityWarning,
      type: 'route_warning',
    });
  }

  res.json({
    success: true,
    data: {
      origin: {
        city: originData.label,
        coords: [originData.coords[1], originData.coords[0]],
      },
      destination: {
        city: destData.label,
        coords: [destData.coords[1], destData.coords[0]],
      },
      routes,
      isLongDistance,
      isEstimated,
      feasibilityWarning,
    },
  });
}));

module.exports = router;