import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Leaf, ArrowRight, Calculator, MapPin, Navigation2, 
  ChevronDown, Zap, Truck, CheckCircle 
} from 'lucide-react';
import { VEHICLE_TYPES, getVehicleById } from '../config/vehicleConfig';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Auth Redirect: If already logged in, go to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Guest Calculator State
  const [guestData, setGuestData] = useState({
    origin: '',
    destination: '',
    distance: '',
    vehicleType: 'truck'
  });
  const [calcResult, setCalcResult] = useState(null);

  const handleGuestCalculate = (e) => {
    e.preventDefault();
    const dist = parseFloat(guestData.distance);
    if (isNaN(dist)) return;

    const currentVehicle = getVehicleById(guestData.vehicleType);
    const currentEmissions = dist * currentVehicle.factor;

    const allOptions = VEHICLE_TYPES.map(v => {
      const em = dist * v.factor;
      return {
        ...v,
        emissions: em,
        saved: currentEmissions - em,
        savedPercent: Math.round(((currentEmissions - em) / currentEmissions) * 100)
      };
    }).sort((a, b) => a.emissions - b.emissions);

    const alternatives = allOptions.filter(v => v.id !== guestData.vehicleType && v.emissions < currentEmissions).slice(0, 3);
    const recommended = allOptions[0];

    setCalcResult({
      currentEmissions,
      currentVehicle: currentVehicle.label,
      recommended,
      alternatives,
      savingsPercent: Math.round(((currentEmissions - recommended.emissions) / currentEmissions) * 100)
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] relative overflow-x-hidden text-slate-200 selection:bg-primary/30 selection:text-primary">
      {/* Premium Radial Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/5 blur-[150px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)]"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center pt-24 pb-12 lg:pt-0 lg:pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full my-auto">
          
          {/* Left Column (55%) -> 7/12 in grid */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left animate-in fade-in slide-in-from-left-10 duration-1000 order-1">
            
            {/* Brand/Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <Leaf className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">Carbon<span className="text-primary">Trace</span></span>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-6">
              <Zap className="w-3 h-3 text-primary animate-pulse" />
              <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.2em]">{t('landing.badge', 'Eco-Intelligence for Supply Chains')}</span>
            </div>
            
            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
              {t('landing.heading_start', 'Smarter Logistics')} <br className="hidden lg:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 italic">{t('landing.heading_highlight', 'Greener Future')}</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-slate-400 text-base sm:text-lg lg:text-xl leading-relaxed mb-8 max-w-2xl px-4 lg:px-0">
              {t('landing.hero_subtitle', 'AI-powered route optimization & carbon tracking for modern supply chains.')}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 lg:px-0 mb-10">
              <button 
                onClick={() => document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto bg-primary hover:bg-emerald-400 text-dark font-black py-3.5 px-8 rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 text-sm uppercase tracking-wider group"
              >
                {t('landing.try_calculator', 'Try Carbon Calculator')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-8 rounded-2xl transition-all border border-white/10 backdrop-blur-md text-sm uppercase tracking-wider"
              >
                {t('landing.create_account', 'Create Account')}
              </button>
            </div>

            {/* Feature points */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 px-4 lg:px-0">
              {[
                t('landing.feature_tracking', 'Real-time carbon tracking'),
                t('landing.feature_routing', 'Route optimization'),
                t('landing.feature_insights', 'Sustainability insights')
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (45%) -> 5/12 in grid */}
          <div className="lg:col-span-5 w-full max-w-[520px] mx-auto lg:mx-0 order-2 animate-in fade-in slide-in-from-right-10 duration-1000" id="calculator-section">
            <div className="bg-[#111827]/80 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
                <Calculator className="w-32 h-32 md:w-40 md:h-40 text-white" />
              </div>

              <div className="flex flex-col items-center text-center mb-6 sm:mb-8 relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{t('landing.calculator_title', 'Carbon Footprint Calculator')}</h3>
                <p className="text-slate-400 text-xs sm:text-sm font-medium">{t('landing.calculator_subtitle', 'Estimate emissions and discover greener alternatives instantly.')}</p>
              </div>

              <form onSubmit={handleGuestCalculate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('shipments.origin_city', 'Origin City')}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder-slate-600"
                      placeholder={t('landing.enter_city', 'Enter city')}
                      value={guestData.origin}
                      onChange={(e) => setGuestData({ ...guestData, origin: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('shipments.dest_city', 'Destination City')}</label>
                  <div className="relative">
                    <Navigation2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder-slate-600"
                      placeholder={t('landing.enter_city', 'Enter city')}
                      value={guestData.destination}
                      onChange={(e) => setGuestData({ ...guestData, destination: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('shipments.distance', 'Distance (km)')}</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder-slate-600"
                    placeholder={t('landing.distance_placeholder', 'e.g. 800')}
                    value={guestData.distance}
                    onChange={(e) => setGuestData({ ...guestData, distance: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('shipments.vehicle_type', 'Vehicle Type')}</label>
                  <div className="relative">
                    <select
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                      value={guestData.vehicleType}
                      onChange={(e) => setGuestData({ ...guestData, vehicleType: e.target.value })}
                    >
                      {VEHICLE_TYPES.map(v => (
                        <option key={v.id} value={v.id} className="bg-slate-900">{t(`vehicles.${v.id}`, v.label)}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="sm:col-span-2 mt-2 bg-primary hover:bg-emerald-400 text-dark font-black py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] text-[11px] sm:text-xs tracking-widest uppercase flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  {t('landing.calculate_emissions', 'Calculate Emissions')}
                </button>
              </form>

              {calcResult && calcResult.recommended && (
                <div className="space-y-4 md:space-y-5 animate-in zoom-in duration-500 relative z-10">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 md:p-4 bg-[#0f172a] rounded-2xl border border-white/5">
                      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{calcResult.currentVehicle} {t('landing.emission_label', 'Emission')}</p>
                      <p className="text-lg md:text-xl font-black text-red-400">{calcResult.currentEmissions?.toFixed(1)} <span className="text-[10px] text-slate-500 font-bold">kg</span></p>
                    </div>
                    <div className="p-3 md:p-4 bg-primary/10 rounded-2xl border border-primary/20">
                      <p className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-widest mb-1">{t('landing.potential_savings', 'Potential Savings')}</p>
                      <p className="text-lg md:text-xl font-black text-emerald-400">+{calcResult.recommended.saved?.toFixed(1)} <span className="text-[10px] text-emerald-500/50 font-bold">kg</span></p>
                    </div>
                    <div className="p-3 md:p-4 bg-[#0f172a] rounded-2xl border border-white/5">
                      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('landing.best_alternative', 'Best Alternative')}</p>
                      <p className="text-xs md:text-sm font-bold text-white capitalize">{calcResult.recommended.label}</p>
                    </div>
                    <div className="p-3 md:p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <p className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">{t('landing.efficiency_gain', 'Efficiency Gain')}</p>
                      <p className="text-lg md:text-xl font-black text-emerald-400">{calcResult.savingsPercent}%</p>
                    </div>
                  </div>
                  
                  {calcResult.alternatives && calcResult.alternatives.length > 0 && (
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-white/10"></div>
                        <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('landing.lower_emission_alternatives', 'Lower Emission Alternatives')}</p>
                        <div className="h-px flex-1 bg-white/10"></div>
                      </div>
                      
                      <div className="space-y-2">
                        {calcResult.alternatives.map((alt) => (
                          <div key={alt.id} className="flex items-center justify-between p-2.5 md:p-3 bg-[#0f172a] rounded-xl border border-white/5 group hover:border-white/10 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400">
                                <Truck size={12} />
                              </div>
                              <div>
                                <p className="text-[9px] md:text-[10px] font-bold text-white">{alt.label}</p>
                                <p className="text-[7px] md:text-[8px] text-slate-500 font-medium">{alt.emissions.toFixed(1)} kg CO2</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] md:text-[9px] font-black text-emerald-400">-{alt.saved.toFixed(1)} kg</p>
                              <p className="text-[6px] md:text-[7px] text-emerald-500/50 font-black uppercase tracking-tighter">{t('landing.save_percent', 'Save {{percent}}%', { percent: alt.savedPercent })}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-3">
                    <p className="text-[9px] md:text-[10px] text-slate-400 text-center italic px-4">
                      {t('landing.register_prompt', 'Register to save this analysis and track your full supply chain performance.')}
                    </p>
                    <button 
                      onClick={() => navigate('/register')}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl border border-white/10 transition-all"
                    >
                      {t('landing.create_account_btn', 'Create Account to Save Result')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LandingPage;
