import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/axios';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Package, Truck, Zap, CloudFog, AlertTriangle, 
  TrendingDown, Download, Plus, Info, X, 
  HelpCircle, ChevronRight, CheckCircle2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);


  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, shipmentsRes, inventoryRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/shipments'),
        api.get('/inventory')
      ]);
      
      setData(analyticsRes.data.data);
      setShipments(shipmentsRes.data.data || []);
      setInventory(inventoryRes.data.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(t('common.error') || 'Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const downloadReport = () => {
    if (shipments.length === 0) return alert(t('dashboard.no_shipments'));

    const headers = [
      t('dashboard.tracking_id'), 
      t('inventory.product_name'), 
      t('dashboard.origin'), 
      t('dashboard.destination'), 
      t('shipments.vehicle_type'), 
      t('shipments.distance'), 
      t('dashboard.carbon_emissions'), 
      t('optimization.recommended'), 
      t('optimization.savings'), 
      t('dashboard.status'), 
      t('common.created_at')
    ];
    
    const rows = shipments.map(s => [
      s._id,
      s.inventoryId?.productName || 'N/A',
      s.origin,
      s.destination,
      s.vehicleType,
      s.distanceKm,
      s.carbonEmissionKg?.toFixed(2),
      s.recommendedVehicle || 'N/A',
      s.savingsKg?.toFixed(2),
      s.status,
      new Date(s.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `carbon-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateInsights = () => {
    if (shipments.length === 0) return [{ 
      type: 'info', 
      title: t('dashboard.insight_get_started'), 
      desc: t('dashboard.insight_get_started_desc'),
      icon: Info
    }];

    const insights = [];
    
    // Truck optimization insight
    const truckEmissions = shipments
      .filter(s => s.vehicleType === 'truck')
      .reduce((acc, s) => acc + (s.carbonEmissionKg || 0), 0);
    
    if (truckEmissions > 0) {
      insights.push({
        type: 'emerald',
        title: t('dashboard.insight_optimization'),
        desc: t('dashboard.insight_optimization_desc'),
        icon: Zap
      });
    }

    // Savings insight
    if (data?.totalSaved > 0) {
      insights.push({
        type: 'blue',
        title: t('dashboard.insight_milestone'),
        desc: t('dashboard.insight_milestone_desc', { saved: data.totalSaved.toFixed(1) }),
        icon: TrendingDown
      });
    }

    return insights;
  };

  const generateAlerts = () => {
    const alerts = [];
    
    // Low stock alerts
    const lowStockItems = inventory.filter(item => item.quantity < 10);
    if (lowStockItems.length > 0) {
      alerts.push({
        type: 'warning',
        title: t('dashboard.alert_low_stock'),
        desc: t('dashboard.alert_low_stock_desc', { count: lowStockItems.length }),
        icon: AlertTriangle
      });
    }

    // Delayed shipment alerts
    const pendingShipments = shipments.filter(s => s.status?.toLowerCase() === 'pending');
    if (pendingShipments.length > 0) {
      alerts.push({
        type: 'slate',
        title: t('dashboard.alert_pending'),
        desc: t('dashboard.alert_pending_desc', { count: pendingShipments.length }),
        icon: Truck
      });
    }

    return alerts;
  };

  if (loading) return <LoadingSpinner message={t('dashboard.calculating_metrics')} />;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">{t('common.oops')}</h2>
      <p className="text-slate-400 mb-6">{error}</p>
      <button onClick={fetchData} className="bg-primary text-dark px-6 py-2 rounded-xl font-bold">{t('common.try_again')}</button>
    </div>
  );

  const insights = generateInsights();
  const alerts = generateAlerts();

  return (
    <div className="space-y-8 fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {t('dashboard.welcome') || 'Dashboard Overview'}
          </h1>
          <p className="text-slate-400 mt-2">
            {t('dashboard.subtitle') || 'Monitor your supply chain efficiency and carbon footprint.'}
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={downloadReport}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors border border-slate-700"
          >
            <Download size={18} /> {t('dashboard.download_report') || 'Download Report'}
          </button>
          <button 
            onClick={() => navigate('/operations')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-emerald-400 text-dark rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
          >
            <Plus size={18} /> {t('dashboard.new_shipment') || 'New Shipment'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title={t('dashboard.total_inventory') || 'Total Inventory'}
          value={data?.totalInventory || 0}
          icon={Package}
          trend="up"
          trendValue={t('dashboard.trend_live') || 'Live'}
        />
        <StatCard
          title={t('dashboard.total_shipments') || 'Total Shipments'}
          value={data?.totalShipments || 0}
          icon={Truck}
          trend="up"
          trendValue={t('dashboard.trend_live') || 'Live'}
        />
        <StatCard
          title={t('dashboard.carbon_emissions') || 'Carbon Emissions'}
          value={`${data?.totalEmissions?.toFixed(1) || 0} kg`}
          icon={CloudFog}
          trend="down"
          trendValue={t('dashboard.trend_net') || 'Net'}
        />
        <StatCard
          title={t('dashboard.co2_saved') || 'CO2 Saved'}
          value={`${data?.totalSaved?.toFixed(1) || 0} kg`}
          icon={TrendingDown}
          trend="up"
          trendValue={t('dashboard.trend_goal') || 'Target'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('dashboard.emissions_chart')}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.vehicleChart || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" className="capitalize" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                cursor={{ fill: '#334155', opacity: 0.4 }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name={t('dashboard.carbon_emissions')} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="glass-card rounded-2xl p-6 flex flex-col justify-center overflow-hidden">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">{t('dashboard.sustainability_insights')}</h3>
              <Info className="w-5 h-5 text-slate-500" />
           </div>
           <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div key={idx} className={`flex items-start gap-4 p-4 rounded-xl border ${
                  insight.type === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                  insight.type === 'blue' ? 'bg-blue-500/10 border-blue-500/20' : 
                  'bg-slate-800/50 border-slate-700/50'
                }`}>
                  <div className={`p-2 rounded-lg ${
                    insight.type === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 
                    insight.type === 'blue' ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-slate-700 text-slate-400'
                  }`}>
                    <insight.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                      insight.type === 'emerald' ? 'text-emerald-400' : 
                      insight.type === 'blue' ? 'text-blue-400' : 
                      'text-white'
                    }`}>{insight.title}</h4>
                    <p className="text-sm text-slate-400 mt-1">{insight.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Shipments Table */}
        <div className="glass-card rounded-2xl p-6 col-span-1 lg:col-span-2 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">{t('dashboard.recent_shipments')}</h3>
            <button onClick={() => navigate('/operations')} className="text-xs text-primary hover:underline flex items-center gap-1">
              {t('common.view_all')} <ChevronRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-4 py-3 font-medium">{t('dashboard.tracking_id')}</th>
                  <th className="px-4 py-3 font-medium">{t('dashboard.origin')}</th>
                  <th className="px-4 py-3 font-medium">{t('dashboard.destination')}</th>
                  <th className="px-4 py-3 font-medium">{t('dashboard.status')}</th>
                  <th className="px-4 py-3 font-medium">{t('dashboard.carbon_emissions')}</th>
                </tr>
              </thead>
              <tbody>
                {shipments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-10 text-center text-slate-500 italic">{t('dashboard.no_shipments')}</td>
                  </tr>
                ) : shipments.slice(0, 5).map((shipment) => (
                  <tr key={shipment._id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white font-mono text-xs">
                      {shipment._id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">{shipment.origin}</td>
                    <td className="px-4 py-3">{shipment.destination}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                        shipment.status?.toLowerCase() === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        shipment.status?.toLowerCase() === 'in_transit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {shipment.status === 'In Transit' ? 'IN TRANSIT' : shipment.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{shipment.carbonEmissionKg?.toFixed(1) || 0} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Help */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 h-full">
            <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.real_time_alerts')}</h3>
            <div className="space-y-4">
               {alerts.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500/30 mb-2" />
                    <p className="text-slate-500 text-sm">{t('dashboard.no_alerts')}</p>
                 </div>
               ) : alerts.map((alert, idx) => (
                 <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors bg-slate-900/20 border border-slate-800">
                   <alert.icon className={`w-5 h-5 shrink-0 mt-0.5 ${
                     alert.type === 'warning' ? 'text-amber-500' : 'text-slate-400'
                   }`} />
                   <div>
                     <p className="text-sm text-white font-medium">{alert.title}</p>
                     <p className="text-xs text-slate-500 mt-0.5">{alert.desc}</p>
                   </div>
                 </div>
               ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-800">
               <div className="bg-gradient-to-br from-primary/20 to-emerald-500/5 p-4 rounded-2xl border border-primary/20">
                  <h4 className="text-white font-bold text-sm mb-1">{t('dashboard.need_assistance')}</h4>
                  <p className="text-xs text-slate-400 mb-3">{t('dashboard.maximize_savings')}</p>
                  <button 
                    onClick={() => setShowHelpModal(true)}
                    className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg text-xs font-bold transition-all"
                  >
                    {t('common.view_docs')}
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card rounded-3xl w-full max-w-lg p-8 relative border border-white/10 shadow-2xl animate-in zoom-in duration-200">
            <button 
              onClick={() => setShowHelpModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                 <HelpCircle className="w-8 h-8" />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-white">{t('dashboard.help_title')}</h2>
                 <p className="text-slate-400 text-sm">{t('dashboard.help_subtitle')}</p>
               </div>
            </div>

            <div className="space-y-6">
              {[
                { title: t('dashboard.help_inventory_title'), desc: t('dashboard.help_inventory_desc'), icon: Package },
                { title: t('dashboard.help_shipment_title'), desc: t('dashboard.help_shipment_desc'), icon: Truck },
                { title: t('dashboard.help_optimization_title'), desc: t('dashboard.help_optimization_desc'), icon: Zap },
                { title: t('dashboard.help_analytics_title'), desc: t('dashboard.help_analytics_desc'), icon: TrendingDown },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="p-2 h-fit bg-slate-800 rounded-lg text-slate-400">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowHelpModal(false)}
              className="w-full mt-8 py-3 bg-primary text-dark font-bold rounded-xl"
            >
              {t('common.got_it')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
