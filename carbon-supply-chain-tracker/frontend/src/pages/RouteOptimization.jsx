import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/axios';
import { Map as MapIcon, Navigation2, Zap, ArrowRight, ShieldCheck, Leaf, MapPin, Loader2, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

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
const RecenterMap = ({ origin, dest }) => {
  const map = useMap();
  useEffect(() => {
    if (origin && dest) {
      const bounds = L.latLngBounds([origin, dest]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else if (origin) {
      map.setView(origin, 10);
    } else if (dest) {
      map.setView(dest, 10);
    }
  }, [origin, dest, map]);
  return null;
};

const RouteOptimization = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    originCity: '',
    destinationCity: '',
    vehicleType: 'truck',
    distanceKm: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [mapError, setMapError] = useState('');
  const [mapLoading, setMapLoading] = useState(false);


  const geocodeCity = async (city) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (err) {
      console.error('Geocoding error:', err);
      return null;
    }
  };

  const handleOptimize = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMapLoading(true);
    setMapError('');
    
    try {
      // 1. Backend Optimization Result
      const response = await api.post('/shipments/optimize', formData);
      setResult(response.data.data);

      // 2. Geocoding for Map
      const [origin, dest] = await Promise.all([
        geocodeCity(formData.originCity),
        geocodeCity(formData.destinationCity)
      ]);

      if (!origin || !dest) {
        setMapError(t('optimization.location_not_found'));
      } else {
        setOriginCoords(origin);
        setDestCoords(dest);
      }

    } catch (err) {
      console.error(err);
      setMapError(t('optimization.failed'));
    } finally {
      setLoading(false);
      setMapLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('optimization.title')}</h1>
        <p className="text-slate-400 mt-1">{t('optimization.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Navigation2 className="w-5 h-5 text-primary" /> {t('optimization.setup_route')}
            </h3>
            
            <form onSubmit={handleOptimize} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">{t('shipments.origin_city')}</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="e.g. New York"
                  value={formData.originCity}
                  onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">{t('shipments.dest_city')}</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="e.g. Los Angeles"
                  value={formData.destinationCity}
                  onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">{t('optimization.current_vehicle')}</label>
                <select
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                >
                  <option value="truck">{t('settings.vehicle_truck')}</option>
                  <option value="van">{t('settings.vehicle_van')}</option>
                  <option value="rail">{t('settings.vehicle_rail')}</option>
                  <option value="ship">{t('settings.vehicle_ship')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">{t('shipments.distance')}</label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="e.g. 4500"
                  value={formData.distanceKm}
                  onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-emerald-400 text-dark font-semibold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? t('optimization.optimizing') : (
                  <>
                    <Zap className="w-4 h-4" /> {t('optimization.optimize_button')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Map & Results */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-card rounded-2xl p-0 flex-1 min-h-[450px] relative overflow-hidden border border-slate-700/50 shadow-inner">
            {/* Real Map Integration */}
            <MapContainer 
              center={[20, 0]} 
              zoom={2} 
              style={{ height: '100%', width: '100%', background: '#0f172a' }}
              zoomControl={false}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              
              {originCoords && (
                <Marker position={originCoords}>
                  <Popup>
                    <div className="text-slate-900 font-medium">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('dashboard.origin')}</p>
                      {formData.originCity}
                    </div>
                  </Popup>
                </Marker>
              )}

              {destCoords && (
                <Marker position={destCoords}>
                  <Popup>
                    <div className="text-slate-900 font-medium">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('dashboard.destination')}</p>
                      {formData.destinationCity}
                    </div>
                  </Popup>
                </Marker>
              )}

              {originCoords && destCoords && (
                <Polyline 
                  positions={[originCoords, destCoords]} 
                  color="#10b981" 
                  weight={3}
                  opacity={0.8}
                  dashArray="10, 10"
                />
              )}

              <RecenterMap origin={originCoords} dest={destCoords} />
            </MapContainer>

            {/* Map Overlay for Loading or Errors */}
            {(mapLoading || mapError || (!originCoords && !destCoords)) && (
              <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] pointer-events-none">
                <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-700/50 shadow-2xl max-w-xs text-center pointer-events-auto transform transition-all animate-in fade-in zoom-in duration-300">
                  {mapLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <MapPin className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-white font-medium">{t('optimization.mapping')}</p>
                    </div>
                  ) : mapError ? (
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="w-10 h-10 text-red-400" />
                      <p className="text-white font-medium">{mapError}</p>
                      <button 
                        onClick={() => setMapError('')}
                        className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
                      >
                        {t('common.dismiss')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-slate-800/50 rounded-full mb-2">
                        <MapIcon className="w-8 h-8 text-slate-400" />
                      </div>
                      <h4 className="text-white font-medium">{t('optimization.visualization')}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{t('optimization.enter_cities')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {loading ? (
             <div className="glass-card rounded-2xl p-8 flex justify-center">
               <LoadingSpinner message={t('optimization.calculating') || 'Calculating optimal transport mode...'} />
             </div>
          ) : result && (
            <div className="glass-card rounded-2xl p-8 border border-primary/20 bg-gradient-to-br from-slate-900/80 to-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Leaf className="w-32 h-32 text-primary" />
              </div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{t('optimization.results')}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">{t('optimization.current_emission')}</p>
                  <p className="text-2xl font-bold text-red-400">{result.currentEmissionKg?.toFixed(1) || 0} <span className="text-sm font-normal text-slate-500">kg CO2</span></p>
                </div>
                
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 flex flex-col justify-center relative">
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 flex justify-center hidden md:flex text-slate-500">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <p className="text-emerald-400 text-sm mb-1 font-medium">{t('optimization.recommended')}</p>
                  <p className="text-2xl font-bold text-white capitalize flex items-center gap-2">
                    {result.recommendedVehicle} <Zap className="w-4 h-4 text-amber-400" />
                  </p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">{t('optimization.savings')}</p>
                  <p className="text-2xl font-bold text-emerald-400">+{result.savingsKg?.toFixed(1) || 0} <span className="text-sm font-normal text-slate-500">kg CO2</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteOptimization;
