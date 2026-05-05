import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/axios';
import ChartCard from '../components/ChartCard';
import StatCard from '../components/StatCard';
import { Activity, Droplets, Leaf, TrendingDown, Wind } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line
} from 'recharts';

const Analytics = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [vehicleEmissions, setVehicleEmissions] = useState([]);
  const [chartError, setChartError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setChartError(null);
    try {
      const response = await api.get('/analytics/dashboard');
      const analyticsData = response.data.data;
      setData(analyticsData);
      setVehicleEmissions(analyticsData.vehicleChart || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setChartError('Failed to load sustainability metrics. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message={t('common.loading')} />;

  const emissionHistory = data?.monthlyTrends || [];

  const renderVehicleChart = () => {
    if (chartError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20">
          <Activity className="w-12 h-12 mb-3 opacity-20" />
          <p>{chartError}</p>
        </div>
      );
    }

    if (vehicleEmissions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20">
          <Leaf className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-center font-medium">No emission data available yet.<br/><span className="text-sm opacity-60">Create shipments to view analytics.</span></p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={vehicleEmissions} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="vehicleType" 
            stroke="#94a3b8" 
            tickFormatter={(val) => t(`vehicles.${val}`, val?.replace('_', ' ')) || val}
            style={{ fontSize: '12px', fontWeight: 'bold' }}
          />
          <YAxis stroke="#94a3b8" label={{ value: 'kg CO2e', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: '12px' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
            cursor={{ fill: '#334155', opacity: 0.4 }}
            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
            formatter={(value) => [`${value} kg CO2e`, 'Total Emission']}
          />
          <Bar dataKey="totalEmission" fill="#10b981" radius={[6, 6, 0, 0]}>
            {vehicleEmissions.map((entry, index) => (
              <rect key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#34d399'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('analytics.title') || 'Sustainability Analytics'}</h1>
          <p className="text-slate-400 mt-1">{t('analytics.subtitle') || 'Deep dive into your carbon footprint and operational efficiency.'}</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl border border-white/10 transition-all text-sm font-medium"
        >
          <Activity className="w-4 h-4" />
          {t('common.refresh') || 'Refresh Data'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('analytics.efficiency_score') || 'Efficiency Score'}
          value="A-"
          icon={Leaf}
          trend="up"
          trendValue="Top 15%"
          subtitle={t('analytics.vs_industry') || 'vs Industry Avg'}
        />
        <StatCard
          title={t('analytics.ytd_emissions') || 'YTD Emissions'}
          value={`${data?.totalEmissions?.toFixed(1) || 0} kg`}
          icon={Activity}
          trend="down"
          trendValue="12%"
          subtitle={t('analytics.vs_last_year') || 'vs Last Year'}
        />
        <StatCard
          title={t('analytics.ytd_saved') || 'YTD CO2 Saved'}
          value={`${data?.totalSaved?.toFixed(1) || 0} kg`}
          icon={Wind}
          trend="up"
          trendValue="8%"
          subtitle={t('analytics.vs_last_year') || 'vs Last Year'}
        />
        <StatCard
          title={t('analytics.optimal_shipments') || 'Optimal Shipments'}
          value="84%"
          icon={TrendingDown}
          subtitle={t('analytics.recommended_vehicle_used') || 'Recommended mode used'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('analytics.trends_chart')}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={emissionHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEmission" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="emission" stroke="#ef4444" fillOpacity={1} fill="url(#colorEmission)" name={t('dashboard.carbon_emissions')} />
              <Area type="monotone" dataKey="saved" stroke="#10b981" fillOpacity={1} fill="url(#colorSaved)" name={t('dashboard.co2_saved')} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Total Emissions by Vehicle Type">
          {renderVehicleChart()}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t('analytics.performance_analysis')}</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-emerald-400 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {t('analytics.best_route')}
                </h4>
                <span className="text-xs text-slate-400">{t('analytics.last_30_days')}</span>
              </div>
              <p className="text-white text-lg font-semibold">Seattle → Portland</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                <span>{t('operations.vehicle_type')}: {t('vehicles.rail')}</span>
                <span>{t('operations.avg_emission')}: 12kg</span>
                <span className="text-emerald-400">-40% {t('analytics.vs_avg')}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-red-400 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  {t('analytics.highest_impact')}
                </h4>
                <span className="text-xs text-slate-400">{t('analytics.needs_optimization')}</span>
              </div>
              <p className="text-white text-lg font-semibold">Denver → Chicago</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                <span>{t('operations.vehicle_type')}: {t('vehicles.truck')}</span>
                <span>{t('operations.avg_emission')}: 340kg</span>
                <span className="text-red-400">+25% {t('analytics.vs_avg')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t('analytics.recommendations')}</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/30">
                1
              </div>
              <div>
                <h4 className="text-white font-medium">{t('analytics.recommendation_1_title', { from: 'Denver', to: 'Chicago' })}</h4>
                <p className="text-sm text-slate-400 mt-1">
                  {t('analytics.recommendation_1_desc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/30">
                2
              </div>
              <div>
                <h4 className="text-white font-medium">{t('analytics.recommendation_2_title')}</h4>
                <p className="text-sm text-slate-400 mt-1">
                  {t('analytics.recommendation_2_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
