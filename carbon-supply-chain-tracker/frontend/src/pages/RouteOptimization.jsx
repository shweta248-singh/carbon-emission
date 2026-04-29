import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/axios';
import { Map, Navigation2, Zap, ArrowRight, ShieldCheck, Leaf } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

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

  useEffect(() => {
    const fetchUserPrefs = async () => {
      try {
        const userRes = await api.get('/users/me');
        if (userRes.data?.data?.preferences?.language) {
          const lang = userRes.data.data.preferences.language;
          if (i18n.language !== lang) {
            i18n.changeLanguage(lang);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user preferences:', err);
      }
    };
    fetchUserPrefs();
  }, [i18n]);

  const handleOptimize = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/shipments/optimize', formData);
      setResult(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
          <div className="glass-card rounded-2xl p-1 flex-1 min-h-[400px] relative overflow-hidden flex items-center justify-center group">
            {/* Map Placeholder */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.2"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
                {formData.originCity && formData.destinationCity && (
                  <>
                    <circle cx="20" cy="50" r="1.5" fill="#10b981" className="animate-pulse" />
                    <circle cx="80" cy="40" r="1.5" fill="#f59e0b" className="animate-pulse" />
                    <path d="M 20 50 Q 50 20 80 40" fill="none" stroke="url(#lineGradient)" strokeWidth="0.8" strokeDasharray="2 2" className="animate-[dash_20s_linear_infinite]" />
                    <defs>
                      <linearGradient id="lineGradient">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </>
                )}
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center p-8 bg-slate-900/60 rounded-xl backdrop-blur-sm border border-slate-700/50 max-w-sm">
              <Map className="w-12 h-12 text-slate-400 mb-4" />
              <h4 className="text-white font-medium mb-2">{t('optimization.map_ready') || 'Map Integration Ready'}</h4>
              <p className="text-slate-400 text-sm">{t('optimization.map_desc') || 'Configure Google Maps or Mapbox API to display interactive routes here.'}</p>
            </div>
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
