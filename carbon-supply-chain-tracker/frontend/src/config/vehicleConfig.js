import { 
  Truck, Activity, Zap, Train, Ship as ShipIcon, Box, Car, Bike
} from 'lucide-react';

export const VEHICLE_TYPES = [
  { id: 'truck', label: 'Truck', factor: 0.105, icon: Truck, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { id: 'mini_truck', label: 'Mini Truck', factor: 0.09, icon: Truck, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 'van', label: 'Van', factor: 0.16, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'pickup', label: 'Pickup', factor: 0.11, icon: Truck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'bike', label: 'Bike', factor: 0.04, icon: Bike, color: 'text-slate-400', bg: 'bg-slate-400/10' },
  { id: 'car', label: 'Car', factor: 0.12, icon: Car, color: 'text-slate-200', bg: 'bg-slate-200/10' },
  { id: 'electric_van', label: 'Electric Van', factor: 0.03, icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { id: 'ev_truck', label: 'EV Truck', factor: 0.04, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'rail', label: 'Rail', factor: 0.04, icon: Train, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'ship', label: 'Ship', factor: 0.015, icon: ShipIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'air_cargo', label: 'Air Cargo', factor: 0.60, icon: Activity, color: 'text-sky-400', bg: 'bg-sky-400/10' },
  { id: 'container_truck', label: 'Container Truck', factor: 0.13, icon: Box, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'refrigerated_truck', label: 'Refrigerated Truck', factor: 0.15, icon: Truck, color: 'text-blue-300', bg: 'bg-blue-300/10' }
];

export const getVehicleById = (id) => VEHICLE_TYPES.find(v => v.id === id) || VEHICLE_TYPES[0];

export const calculateEmissions = (distanceKm, vehicleId) => {
  const vehicle = getVehicleById(vehicleId);
  return distanceKm * vehicle.factor;
};
