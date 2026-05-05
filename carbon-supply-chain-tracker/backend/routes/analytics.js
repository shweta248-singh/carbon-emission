const express = require("express");
const router = express.Router();
const Shipment = require("../models/Shipment");

// Helper to safely get emission value from various possible field names
const getEmissionValue = (s) =>
  Number(
    s.calculatedEmission ??
    s.carbonEmissionKg ??
    s.carbonEmission ??
    s.emission ??
    s.totalEmission ??
    0
  );

// Helper to safely get saved emission value from various possible field names
const getSavedValue = (s) =>
  Number(
    s.co2Saved ??
    s.savedEmission ??
    s.savingsKg ??
    s.totalSaved ??
    0
  );

// @desc    Get analytics summary
// @route   GET /api/analytics/summary
router.get("/summary", async (req, res) => {
  try {
    const shipments = await Shipment.find({}).lean();

    const totalEmissions = shipments.reduce(
      (sum, s) => sum + getEmissionValue(s),
      0
    );

    const totalSaved = shipments.reduce(
      (sum, s) => sum + getSavedValue(s),
      0
    );

    const optimalCount = shipments.filter(
      (s) => s.isOptimal || s.recommended || s.usedRecommendedVehicle || (s.vehicleType === s.recommendedVehicle)
    ).length;

    const optimalShipmentPercentage = shipments.length
      ? Math.round((optimalCount / shipments.length) * 100)
      : 0;

    res.json({
      totalEmissions: Number(totalEmissions.toFixed(2)),
      totalSaved: Number(totalSaved.toFixed(2)),
      optimalShipmentPercentage,
      carbonEfficiencyScore: shipments.length ? (optimalShipmentPercentage > 80 ? "A" : "B") : "N/A"
    });
  } catch (error) {
    console.error("Analytics summary error:", error);
    res.status(500).json({ message: "Failed to load analytics summary" });
  }
});

// @desc    Get emissions by vehicle type
// @route   GET /api/analytics/emissions-by-vehicle-type
router.get("/emissions-by-vehicle-type", async (req, res) => {
  try {
    const shipments = await Shipment.find({}).lean();

    const grouped = {};

    shipments.forEach((s) => {
      const vehicleType = s.vehicleType || s.vehicle || s.transportMode || "unknown";
      const emission = getEmissionValue(s);

      grouped[vehicleType] = (grouped[vehicleType] || 0) + emission;
    });

    const result = Object.entries(grouped).map(([vehicleType, totalEmission]) => ({
      vehicleType,
      totalEmission: Number(totalEmission.toFixed(2))
    }));

    res.json(result);
  } catch (error) {
    console.error("Emissions by vehicle type error:", error);
    res.status(500).json({ message: "Failed to load emissions by vehicle type" });
  }
});

// @desc    Get emission trend
// @route   GET /api/analytics/emission-trend
router.get("/emission-trend", async (req, res) => {
  try {
    const shipments = await Shipment.find({}).lean();

    const grouped = {};

    shipments.forEach((s) => {
      const date = new Date(s.createdAt || Date.now()).toISOString().slice(0, 10);

      if (!grouped[date]) {
        grouped[date] = {
          date,
          carbonEmissions: 0,
          co2Saved: 0
        };
      }

      grouped[date].carbonEmissions += getEmissionValue(s);
      grouped[date].co2Saved += getSavedValue(s);
    });

    const result = Object.values(grouped)
      .map((item) => ({
        date: item.date,
        carbonEmissions: Number(item.carbonEmissions.toFixed(2)),
        co2Saved: Number(item.co2Saved.toFixed(2))
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(result);
  } catch (error) {
    console.error("Emission trend error:", error);
    res.status(500).json({ message: "Failed to load emission trend" });
  }
});

module.exports = router;