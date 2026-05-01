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

// Haversine Formula for straight-line distance
const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const lon1 = coords1[0];
  const lat1 = coords1[1];
  const lon2 = coords2[0];
  const lat2 = coords2[1];

  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @desc    Calculate routes using OpenRouteService
// @route   POST /api/operations/calculate-routes
// @access  Private
router.post('/calculate-routes', protect, async (req, res, next) => {
  let originFound = false;
  let destFound = false;
  let originData = null;
  let destData = null;
  
  try {
    const { originCity, destinationCity, vehicleType } = req.body;
    const apiKey = process.env.ORS_API_KEY;

    console.log(`--- Route Request: ${originCity} to ${destinationCity} (Vehicle: ${vehicleType}) ---`);

    if (!apiKey) {
      console.error('ORS Error: ORS_API_KEY is missing in process.env');
      return res.status(500).json({ success: false, message: 'ORS API Key not configured' });
    }

    // 1. International Geocoding
    const geocode = async (city) => {
      const query = city;
        
      const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(query)}&size=3`;
      const response = await axios.get(url);
      
      if (response.data.features && response.data.features.length > 0) {
        const match = response.data.features[0];
        return {
          coords: match.geometry.coordinates, // [lon, lat]
          label: match.properties.label,
          country: match.properties.country
        };
      }
      return null;
    };

    [originData, destData] = await Promise.all([
      geocode(originCity),
      geocode(destinationCity)
    ]);

    if (originData) originFound = true;
    if (destData) destFound = true;

    if (!originData || !destData) {
      const missing = !originData ? 'Origin' : 'Destination';
      return res.status(404).json({ 
        success: false, 
        message: `Location not found: ${missing}. Please enter city with state, e.g. Lucknow, Uttar Pradesh`,
        details: { originFound, destFound }
      });
    }

    const originBase = originCity.split(',')[0].trim().toLowerCase();
    const destBase = destinationCity.split(',')[0].trim().toLowerCase();

    if (!originData.label.toLowerCase().includes(originBase) || !destData.label.toLowerCase().includes(destBase)) {
      return res.status(400).json({
        success: false,
        message: 'Location could not be matched accurately. Please check shipment location.'
      });
    }

    // 2. Determine Feasibility and Routes
    const approxDistance = haversineDistance(originData.coords, destData.coords);
    let isLongDistance = approxDistance > 100;
    const isInternational = originData.country !== destData.country;
    
    const ROAD_VEHICLES = ['truck', 'mini_truck', 'van', 'pickup', 'bike', 'car', 'container_truck', 'refrigerated_truck'];
    const isRoadVehicle = !vehicleType ? true : ROAD_VEHICLES.includes(vehicleType);
    let feasibilityWarning = null;
    let isEstimated = false;
    let routes = [];

    if (!isRoadVehicle) {
      // Non-road vehicle (Ship, Air, Rail): Use straight-line estimation
      isEstimated = true;
      let speedKmH = 50;
      if (vehicleType === 'air_cargo') speedKmH = 800;
      else if (vehicleType === 'ship') speedKmH = 40;
      else if (vehicleType === 'rail') speedKmH = 60;

      const durationMin = (approxDistance / speedKmH) * 60;
      
      routes = [{
        id: 0,
        distanceKm: approxDistance,
        durationMin: durationMin,
        geometry: [
          [originData.coords[0], originData.coords[1]], 
          [destData.coords[0], destData.coords[1]]
        ]
      }];
    } else {
      // Road vehicle: Use ORS driving profile
      
      if (isInternational) {
        feasibilityWarning = 'International logistics detected. This vehicle may not be suitable for this route.';
      }
      
      if (approxDistance > 1000 && (vehicleType === 'car' || vehicleType === 'bike')) {
        return res.status(400).json({
          success: false,
          message: 'Selected vehicle is not recommended for this international route. Suggested modes: Ship, Air Cargo, Rail'
        });
      }

      const directionsUrl = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`;
      
      const getRequestBody = (withAlternatives) => {
        const body = {
          coordinates: [originData.coords, destData.coords]
        };
        if (withAlternatives) {
          body.alternative_routes = {
            target_count: 3,
            share_factor: 0.6,
            weight_factor: 1.4
          };
        }
        return body;
      };

      let directionsResponse;
      try {
        directionsResponse = await axios.post(directionsUrl, getRequestBody(!isLongDistance), {
          params: { api_key: apiKey },
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (orsError) {
        const errStatus = orsError.response?.status;
        const errDataStr = JSON.stringify(orsError.response?.data || '').toLowerCase();
        
        // If route is impossible (e.g. crossing oceans)
        if (errStatus === 404 || errDataStr.includes('could not find') || errDataStr.includes('route not found')) {
           return res.status(400).json({ 
             success: false, 
             message: `Selected vehicle is not recommended for this international route. Suggested modes: Ship, Air Cargo, Rail` 
           });
        }
        
        // If alternatives failed due to distance, retry without them
        if (!isLongDistance && errStatus === 400 && errDataStr.includes('limit')) {
          console.warn('ORS alternatives failed, retrying without alternatives...');
          isLongDistance = true;
          directionsResponse = await axios.post(directionsUrl, getRequestBody(false), {
            params: { api_key: apiKey },
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          throw orsError;
        }
      }

      if (!directionsResponse.data.features || directionsResponse.data.features.length === 0) {
        return res.status(404).json({ success: false, message: 'No routes found between these locations' });
      }

      routes = directionsResponse.data.features.map((feature, index) => {
        const props = feature.properties.summary;
        return {
          id: index,
          distanceKm: props.distance / 1000,
          durationMin: props.duration / 60,
          geometry: feature.geometry.coordinates,
        };
      });
    }

    res.json({
      success: true,
      data: {
        origin: { city: originData.label, coords: [originData.coords[1], originData.coords[0]] },
        destination: { city: destData.label, coords: [destData.coords[1], destData.coords[0]] },
        routes,
        isLongDistance,
        isEstimated,
        feasibilityWarning,
        longDistanceMessage: isLongDistance && isRoadVehicle ? 'Long-distance route detected. Alternative route comparison is not available for routes above 100 km.' : null
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
