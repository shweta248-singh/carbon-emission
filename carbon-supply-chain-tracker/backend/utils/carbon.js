const EMISSION_FACTORS = {
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

const BEST_EMISSION_FACTOR = EMISSION_FACTORS.ship;

const calculateFallbackSavings = (vehicleType, distanceKm, carbonEmissionKg) => {
  const distance = Number(distanceKm) || 0;

  if (distance <= 0) return 0;

  const currentEmission =
    Number(carbonEmissionKg) ||
    distance * (EMISSION_FACTORS[vehicleType] || 0.1);

  const bestEmission = distance * BEST_EMISSION_FACTOR;

  return Number(Math.max(0, currentEmission - bestEmission).toFixed(2));
};

const getShipmentSavings = (shipment) => {
  if (typeof shipment.savingsKg === 'number' && shipment.savingsKg > 0) {
    return Number(shipment.savingsKg.toFixed(2));
  }

  return calculateFallbackSavings(
    shipment.vehicleType,
    shipment.distanceKm,
    shipment.carbonEmissionKg
  );
};

module.exports = {
  EMISSION_FACTORS,
  calculateFallbackSavings,
  getShipmentSavings,
};