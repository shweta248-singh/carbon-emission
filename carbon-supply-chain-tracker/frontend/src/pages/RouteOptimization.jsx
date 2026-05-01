import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/axios';
import { 
  Map as MapIcon, Navigation2, Zap, ArrowRight, ShieldCheck, 
  Leaf, MapPin, Loader2, AlertCircle, ChevronDown,
  Truck, TrendingUp, TrendingDown, Clock, Move, Info 
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { VEHICLE_TYPES, calculateEmissions, getVehicleById } from '../config/vehicleConfig';

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Map Recenter Component
const RecenterMap = ({ origin, dest, routes }) => {
  const map = useMap();
  useEffect(() => {
    if (origin && dest) {
      let bounds = L.latLngBounds([origin, dest]);
      
      // Expand bounds to include all route points if they exist
      if (routes && routes.length > 0) {
        routes.forEach(route => {
          if (route.geometry) {
            route.geometry.forEach(coord => {
              bounds.extend([coord[1], coord[0]]); // [lat, lon]
            });
          }
        });
      }
      
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else if (origin) {
      map.setView(origin, 10);
    } else if (dest) {
      map.setView(dest, 10);
    }
  }, [origin, dest, routes, map]);
  return null;
};

const RouteOptimization = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    originCity: '',
    destinationCity: '',
    vehicleType: ''
  });
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [mapError, setMapError] = useState('');
  const [mapLoading, setMapLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [userVehicles, setUserVehicles] = useState([]);
  const [initLoading, setInitLoading] = useState(true);
  const [isLongDistance, setIsLongDistance] = useState(false);
  const [isEstimated, setIsEstimated] = useState(false);
  const [feasibilityWarning, setFeasibilityWarning] = useState(null);
  const [resolvedOrigin, setResolvedOrigin] = useState('');
  const [resolvedDest, setResolvedDest] = useState('');
  const [userOrigins, setUserOrigins] = useState([]);
  const [userDestinations, setUserDestinations] = useState([]);

  useEffect(() => {
    const fetchUserShipments = async () => {
      try {
        const response = await api.get('/shipments');
        const shipments = response.data.data || [];
        
        const origins = [...new Set(shipments.map(s => s.origin))];
        const dests = [...new Set(shipments.map(s => s.destination))];
        setUserOrigins(origins);
        setUserDestinations(dests);

        // Extract unique vehicle types
        const uniqueTypes = [...new Set(shipments.map(s => s.vehicleType))];
        
        // Map to config and filter
        const filtered = VEHICLE_TYPES.filter(v => uniqueTypes.includes(v.id));
        setUserVehicles(filtered);
        
        setFormData(prev => ({ 
          ...prev, 
          vehicleType: filtered.length > 0 ? filtered[0].id : '',
          originCity: origins.length > 0 ? origins[0] : '',
          destinationCity: dests.length > 0 ? dests[0] : ''
        }));
      } catch (err) {
        console.error('Failed to fetch shipments:', err);
      } finally {
        setInitLoading(false);
      }
    };

    fetchUserShipments();
  }, []);

  const handleOptimize = async (e) => {
    e.preventDefault();
    if (!formData.vehicleType) return;

    setLoading(true);
    setMapLoading(true);
    setMapError('');
    setRoutes([]);
    setInsights(null);
    setIsLongDistance(false);
    setIsEstimated(false);
    setFeasibilityWarning(null);
    setResolvedOrigin('');
    setResolvedDest('');
    
    try {
      // Call Backend for Route Calculation (proxied ORS)
      const response = await api.post('/operations/calculate-routes', {
        originCity: formData.originCity,
        destinationCity: formData.destinationCity,
        vehicleType: formData.vehicleType
      });

      const { origin, destination, routes: fetchedRoutes, isLongDistance: longDist, isEstimated: estimated, feasibilityWarning: warning } = response.data.data;
      
      setIsLongDistance(longDist);
      setIsEstimated(estimated);
      setFeasibilityWarning(warning);
      setResolvedOrigin(origin.city);
      setResolvedDest(destination.city);
      
      setOriginCoords(origin.coords);
      setDestCoords(destination.coords);

      // Process routes with emissions
      const processedRoutes = fetchedRoutes.map(route => {
        const emissions = calculateEmissions(route.distanceKm, formData.vehicleType);
        return {
          ...route,
          emissions,
          vehicle: getVehicleById(formData.vehicleType)
        };
      });

      // Sort and identify insights
      const sortedByEmissions = [...processedRoutes].sort((a, b) => a.emissions - b.emissions);
      const sortedByTime = [...processedRoutes].sort((a, b) => a.durationMin - b.durationMin);
      const sortedByDistance = [...processedRoutes].sort((a, b) => b.emissions - a.emissions); // Highest for contrast

      setRoutes(processedRoutes);
      setInsights({
        eco: sortedByEmissions[0],
        fastest: sortedByTime[0],
        highest: sortedByDistance[0]
      });

    } catch (err) {
      console.error(err);
      setMapError(err.response?.data?.message || t('optimization.failed') || 'Failed to optimize routes');
    } finally {
      setLoading(false);
      setMapLoading(false);
    }
  };

  const getRouteColor = (routeId) => {
    if (!insights) return '#64748b'; // Slate 500
    if (routeId === insights.eco.id) return '#10b981'; // Emerald 500
    if (routeId === insights.highest.id) return '#ef4444'; // Red 500
    return '#3b82f6'; // Blue 500
  };

  if (initLoading) return <LoadingSpinner message="Loading optimization tools..." />;

  return (
    <div className="min-h-screen pb-16 fade-in">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="pt-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Navigation2 className="text-primary w-8 h-8" />
            {t('optimization.title') || 'Route Optimization'}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {t('optimization.subtitle') || 'Find the most eco-friendly and efficient routes for your shipments.'}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          
          {/* Setup Form */}
          <div className="glass-card rounded-[24px] p-6 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-500"></div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
              <MapIcon className="w-4 h-4 text-primary" />
              {t('optimization.setup_route') || 'Setup Route'}
            </h3>
            
            <form onSubmit={handleOptimize} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 ml-1">{t('shipments.origin_city') || 'Origin City'}</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    required
                    disabled={userOrigins.length === 0}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    value={formData.originCity}
                    onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
                  >
                    {userOrigins.length > 0 ? (
                      userOrigins.map(loc => (
                        <option key={loc} value={loc} className="bg-slate-900">{loc}</option>
                      ))
                    ) : (
                      <option value="">No previous origins</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 ml-1">{t('shipments.dest_city') || 'Destination City'}</label>
                <div className="relative">
                  <Navigation2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    required
                    disabled={userDestinations.length === 0}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    value={formData.destinationCity}
                    onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                  >
                    {userDestinations.length > 0 ? (
                      userDestinations.map(loc => (
                        <option key={loc} value={loc} className="bg-slate-900">{loc}</option>
                      ))
                    ) : (
                      <option value="">No previous destinations</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 ml-1">{t('optimization.current_vehicle') || 'Vehicle Type'}</label>
                <div className="relative">
                  <select
                    disabled={userVehicles.length === 0}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  >
                    {userVehicles.length > 0 ? (
                      userVehicles.map(v => (
                        <option key={v.id} value={v.id} className="bg-slate-900">
                          {t(`vehicles.${v.id}`, v.label)}
                        </option>
                      ))
                    ) : (
                      <option value="">No vehicles used yet</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
                {userVehicles.length === 0 && (
                  <p className="text-[10px] text-amber-400 mt-1 ml-1 font-medium italic">
                    Create a shipment first to use route optimization.
                  </p>
                )}
              </div>

              <button
                type="submit" disabled={loading || userVehicles.length === 0 || userOrigins.length === 0 || userDestinations.length === 0}
                className="w-full bg-primary hover:bg-emerald-400 text-dark font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:grayscale text-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Zap className="w-4 h-4 fill-current" /> {t('optimization.optimize_button') || 'Analyze Routes'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Map View */}
          <div className="flex flex-col gap-4">
            
            {(resolvedOrigin || resolvedDest) && !mapError && (
              <div className="bg-slate-900/60 border border-white/5 rounded-[20px] p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-lg">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Origin Resolved</span>
                  </div>
                  <p className="text-sm text-white font-medium pl-6">{resolvedOrigin}</p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-white/10"></div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Navigation2 className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Destination Resolved</span>
                  </div>
                  <p className="text-sm text-white font-medium pl-6">{resolvedDest}</p>
                </div>
              </div>
            )}

            {feasibilityWarning && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top duration-500">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-400">Vehicle Feasibility Notice</p>
                  <p className="text-xs text-slate-400 mt-1">{feasibilityWarning}</p>
                </div>
              </div>
            )}

            <div className="glass-card rounded-[24px] overflow-hidden border border-white/5 h-[400px] relative shadow-xl">
              <MapContainer 
                center={[20, 0]} zoom={2} 
                style={{ height: '100%', width: '100%', background: '#020617' }}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {originCoords && <Marker position={originCoords}><Popup>{formData.originCity}</Popup></Marker>}
                {destCoords && <Marker position={destCoords}><Popup>{formData.destinationCity}</Popup></Marker>}
                
                {routes.map((route) => (
                  <Polyline 
                    key={route.id}
                    positions={route.geometry.map(coord => [coord[1], coord[0]])}
                    color={getRouteColor(route.id)}
                    weight={route.id === insights?.eco.id ? 5 : 3}
                    opacity={route.id === insights?.eco.id ? 1 : 0.6}
                  >
                    <Popup>
                      <div className="p-2">
                        <p className="font-bold">Route {route.id + 1}</p>
                        <p className="text-xs">{route.distanceKm.toFixed(1)} km | {Math.round(route.durationMin)} min</p>
                        <p className="text-xs font-bold text-emerald-400">{route.emissions.toFixed(1)} kg CO2 {isEstimated && '(Est.)'}</p>
                      </div>
                    </Popup>
                  </Polyline>
                ))}
                
                <RecenterMap origin={originCoords} dest={destCoords} routes={routes} />
              </MapContainer>

              {/* Map Loading/Error Overlay */}
              {(mapLoading || mapError) && (
                <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px]">
                  <div className="text-center p-4">
                    {mapLoading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-white text-xs font-bold">Calculating optimal routes...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                        <p className="text-white text-xs font-bold">{mapError}</p>
                        <button onClick={() => setMapError('')} className="text-primary text-[10px] font-bold underline">Dismiss</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Smart Insights */}
            {insights && routes.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InsightCard 
                  title="Eco-Friendly" 
                  route={insights.eco} 
                  icon={Leaf} 
                  color="text-emerald-400" 
                  bg="bg-emerald-400/10" 
                  border="border-emerald-400/20"
                />
                <InsightCard 
                  title="Fastest Route" 
                  route={insights.fastest} 
                  icon={Zap} 
                  color="text-amber-400" 
                  bg="bg-amber-400/10" 
                  border="border-amber-400/20"
                />
                <InsightCard 
                  title="Highest Emission" 
                  route={insights.highest} 
                  icon={AlertCircle} 
                  color="text-red-400" 
                  bg="bg-red-400/10" 
                  border="border-red-400/20"
                />
              </div>
            )}
            {insights && routes.length === 1 && (
              <div className="glass-card p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Info className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-white">Single route available for this mode</span>
              </div>
            )}
          </div>
        </div>

        {/* Route Cards */}
        {routes.length > 0 && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary rounded-full"></div>
              <h3 className="text-xl font-bold text-white">
                {isEstimated ? 'Estimated Logistics Route' : isLongDistance ? 'Logistics Route Overview' : 'Alternative Routes Comparison'}
              </h3>
            </div>

            {isLongDistance && (
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top duration-500">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-400">Long-distance route detected</p>
                  <p className="text-xs text-slate-400 mt-1">
                    To maintain high performance and accuracy, alternative route comparison is restricted to routes within 100 km.
                    We have provided the most efficient direct path for your carbon analysis.
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {routes.map((route, index) => (
                <div 
                  key={route.id}
                  className={`glass-card p-6 rounded-[28px] border transition-all duration-300 relative overflow-hidden ${
                    route.id === insights?.eco.id 
                      ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                      : 'border-white/5'
                  }`}
                >
                  {route.id === insights?.eco.id && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-dark text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Best Option
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-2xl ${route.id === insights?.eco.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Truck size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Route {index + 1}</h4>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{Math.round(route.durationMin)} minutes</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <Move className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-400">Distance</span>
                      </div>
                      <span className="text-sm font-bold text-white">{route.distanceKm.toFixed(1)} km</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-400">Duration</span>
                      </div>
                      <span className="text-sm font-bold text-white">{Math.round(route.durationMin)} min</span>
                    </div>

                    <div className={`flex justify-between items-center p-4 rounded-xl border ${
                      route.id === insights?.eco.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950/40 border-white/5'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Leaf className={`w-5 h-5 ${route.id === insights?.eco?.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-400">Carbon Emission</span>
                          {isEstimated && <span className="text-[10px] text-amber-400/80 uppercase font-medium">Estimated</span>}
                        </div>
                      </div>
                      <span className={`text-lg font-black ${route.id === insights?.eco.id ? 'text-emerald-400' : 'text-white'}`}>
                        {route.emissions.toFixed(1)} <span className="text-[10px] uppercase">kg</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InsightCard = ({ title, route, icon: Icon, color, bg, border }) => (
  <div className={`glass-card p-4 rounded-2xl border ${border} ${bg} flex items-center gap-4`}>
    <div className={`p-3 rounded-xl ${bg} ${color} border ${border}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{title}</p>
      <p className={`text-base font-bold ${color}`}>{route.emissions.toFixed(1)} kg CO2</p>
      <p className="text-[10px] text-slate-400 font-medium">{route.distanceKm.toFixed(1)} km | {Math.round(route.durationMin)} min</p>
    </div>
  </div>
);

export default RouteOptimization;
