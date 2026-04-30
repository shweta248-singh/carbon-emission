import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Leaf, ArrowRight, Calculator, MapPin, Navigation2, 
  ChevronDown, Zap, Truck 
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
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/5 blur-[150px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)]"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center px-4 pt-6 md:pt-10 pb-20">
        
        {/* Navigation Logo */}
        <div className="w-full max-w-7xl flex justify-between items-center mb-12 lg:mb-24 px-2">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-primary/20 p-1.5 md:p-2 rounded-xl border border-primary/30">
              <Leaf className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <span className="text-lg md:text-xl font-black text-white tracking-tighter uppercase italic">CarbonTrace</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/login" className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-white transition-colors border border-white/5 bg-white/5 px-4 md:px-6 py-2 rounded-full backdrop-blur-sm uppercase tracking-widest">
              Sign In
            </Link>
            <Link to="/register" className="hidden xs:block text-[10px] md:text-xs font-bold text-dark bg-primary px-4 md:px-6 py-2 rounded-full hover:bg-emerald-400 transition-colors uppercase tracking-widest">
              Get Started
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-[850px] mx-auto mb-12 px-2 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-[0.2em]">Eco-Intelligence for Supply Chains</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            Optimize your supply chain <br className="hidden sm:block" /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 italic">Sustainability.</span>
          </h1>
          
          <p className="text-slate-400 text-sm md:text-base lg:text-lg leading-relaxed mb-8 md:mb-10 max-w-2xl mx-auto px-4">
            Track emissions, optimize routes, and reduce your carbon footprint with AI-driven insights. Built for modern businesses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <button 
              onClick={() => document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto bg-primary hover:bg-emerald-400 text-dark font-black py-3.5 px-8 rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 text-xs md:text-sm uppercase tracking-wider group"
            >
              Try Carbon Calculator <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-8 rounded-2xl transition-all border border-white/10 backdrop-blur-md text-xs md:text-sm uppercase tracking-wider"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Calculator Section */}
        <div id="calculator-section" className="w-full max-w-[540px] mx-auto px-2 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="glass-card rounded-[28px] md:rounded-[32px] p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
              <Calculator className="w-32 h-32 md:w-40 md:h-40 text-white" />
            </div>

            <div className="flex flex-col items-center text-center mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-bold text-white mb-1">Carbon Footprint Calculator</h3>
              <p className="text-slate-500 text-[10px] md:text-xs font-medium">Get instant sustainability insights for your shipments.</p>
            </div>

            <form onSubmit={handleGuestCalculate} className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Origin City</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="Enter city"
                    value={guestData.origin}
                    onChange={(e) => setGuestData({ ...guestData, origin: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Destination City</label>
                <div className="relative">
                  <Navigation2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="Enter city"
                    value={guestData.destination}
                    onChange={(e) => setGuestData({ ...guestData, destination: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Distance (km)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="e.g. 800"
                  value={guestData.distance}
                  onChange={(e) => setGuestData({ ...guestData, distance: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Vehicle Mode</label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                    value={guestData.vehicleType}
                    onChange={(e) => setGuestData({ ...guestData, vehicleType: e.target.value })}
                  >
                    {VEHICLE_TYPES.map(v => (
                      <option key={v.id} value={v.id} className="bg-slate-900">{v.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="sm:col-span-2 bg-white/5 hover:bg-white/10 text-white font-black py-3 rounded-xl transition-all border border-white/10 text-[10px] tracking-widest uppercase"
              >
                Calculate Emissions
              </button>
            </form>

            {calcResult && calcResult.recommended && (
              <div className="space-y-4 md:space-y-5 animate-in zoom-in duration-500">
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="p-3 md:p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                    <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{calcResult.currentVehicle} Emission</p>
                    <p className="text-lg md:text-xl font-black text-red-400">{calcResult.currentEmissions?.toFixed(1)} <span className="text-[10px] text-slate-600 font-bold">kg</span></p>
                  </div>
                  <div className="p-3 md:p-4 bg-primary/5 rounded-2xl border border-primary/20">
                    <p className="text-[7px] md:text-[8px] font-black text-primary uppercase tracking-widest mb-1">Potential Savings</p>
                    <p className="text-lg md:text-xl font-black text-emerald-400">+{calcResult.recommended.saved?.toFixed(1)} <span className="text-[10px] text-emerald-500/50 font-bold">kg</span></p>
                  </div>
                  <div className="p-3 md:p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                    <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Best Alternative</p>
                    <p className="text-xs md:text-sm font-bold text-white capitalize">{calcResult.recommended.label}</p>
                  </div>
                  <div className="p-3 md:p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                    <p className="text-[7px] md:text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Efficiency Gain</p>
                    <p className="text-lg md:text-xl font-black text-emerald-400">{calcResult.savingsPercent}%</p>
                  </div>
                </div>

                {calcResult.alternatives.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/5"></div>
                      <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">Lower Emission Alternatives</p>
                      <div className="h-px flex-1 bg-white/5"></div>
                    </div>
                    
                    <div className="space-y-2">
                      {calcResult.alternatives.map((alt) => (
                        <div key={alt.id} className="flex items-center justify-between p-2.5 md:p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-white/10 transition-all">
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
                            <p className="text-[6px] md:text-[7px] text-emerald-500/50 font-black uppercase tracking-tighter">Save {alt.savedPercent}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-3">
                  <p className="text-[8px] md:text-[9px] text-slate-500 text-center italic px-4">
                    Register to save this analysis and track your full supply chain performance.
                  </p>
                  <button 
                    onClick={() => navigate('/register')}
                    className="w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl border border-primary/20 transition-all"
                  >
                    Create Account to Save Result
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
