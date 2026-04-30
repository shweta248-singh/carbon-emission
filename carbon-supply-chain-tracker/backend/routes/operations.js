const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const Inventory = require('../models/Inventory');
const Shipment = require('../models/Shipment');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get operations summary stats
// @route   GET /api/operations/summary
// @access  Private
router.get('/summary', protect, async (req, res, next) => {
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
    next(error);
  }
});

// @desc    Calculate routes using OpenRouteService
// @route   POST /api/operations/calculate-routes
// @access  Private
router.post('/calculate-routes', protect, async (req, res, next) => {
  let originFound = false;
  let destFound = false;
  let originData = null;
  let destData = null;
  
  try {
    const { originCity, destinationCity } = req.body;
    const apiKey = process.env.ORS_API_KEY;

    console.log(`--- Route Request: ${originCity} to ${destinationCity} ---`);

    if (!apiKey) {
      console.error('ORS Error: ORS_API_KEY is missing in process.env');
      return res.status(500).json({ success: false, message: 'ORS API Key not configured' });
    }

    // 1. Improved Geocoding
    const geocode = async (city) => {
      // Append India if not explicitly mentioned to improve local relevance
      const query = (city.toLowerCase().includes('india') || city.includes(',')) 
        ? city 
        : `${city}, India`;
        
      const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(query)}&size=3`;
      const response = await axios.get(url);
      
      if (response.data.features && response.data.features.length > 0) {
        // Try to find a match that specifically says India in the country property
        const indiaMatch = response.data.features.find(f => 
          f.properties.country === 'India' || 
          f.properties.label.toLowerCase().includes('india')
        );
        const match = indiaMatch || response.data.features[0];
        return {
          coords: match.geometry.coordinates, // [lon, lat]
          label: match.properties.label
        };
      }
      return null;
    };

    [originData, destData] = await Promise.all([
      geocode(originCity),
      geocode(destinationCity)
    ]);

    if (originData) {
      originFound = true;
      console.log(`Origin Geocoded: ${originData.label} -> [${originData.coords}]`);
    }
    if (destData) {
      destFound = true;
      console.log(`Destination Geocoded: ${destData.label} -> [${destData.coords}]`);
    }

    if (!originData || !destData) {
      const missing = !originData ? 'Origin' : 'Destination';
      return res.status(404).json({ 
        success: false, 
        message: `Location not found: ${missing}. Please enter city with state, e.g. Lucknow, Uttar Pradesh`,
        details: { originFound, destFound }
      });
    }

    // 2. Fetch Alternative Routes
    const directionsUrl = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`;
    
    // Ensure coordinates are [[lng, lat], [lng, lat]]
    const requestBody = {
      coordinates: [originData.coords, destData.coords],
      alternative_routes: {
        target_count: 3
      }
    };

    const directionsResponse = await axios.post(directionsUrl, requestBody, {
      params: {
        api_key: apiKey
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 3. Process Routes
    if (!directionsResponse.data.features || directionsResponse.data.features.length === 0) {
      return res.status(404).json({ success: false, message: 'No routes found between these locations' });
    }

    const routes = directionsResponse.data.features.map((feature, index) => {
      const props = feature.properties.summary;
      return {
        id: index,
        distanceKm: props.distance / 1000,
        durationMin: props.duration / 60,
        geometry: feature.geometry.coordinates, // Array of [lon, lat]
      };
    });

    res.json({
      success: true,
      data: {
        origin: { city: originData.label, coords: [originData.coords[1], originData.coords[0]] }, // [lat, lon]
        destination: { city: destData.label, coords: [destData.coords[1], destData.coords[0]] },
        routes
      }
    });

  } catch (error) {
    console.error('--- Calculate Routes Error ---');
    console.error('Message:', error.message);
    console.error('Status:', error.response?.status);
    console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.log(`Origin: ${originFound ? 'OK' : 'FAIL'}, Dest: ${destFound ? 'OK' : 'FAIL'}`);
    console.error('-------------------------------');

    const errorResponse = {
      success: false,
      message: 'Failed to calculate routes',
      originFound,
      destFound
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.devError = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }

    res.status(error.response?.status || 500).json(errorResponse);
  }
});

module.exports = router;
