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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, userRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/users/me')
        ]);
        setData(analyticsRes.data.data);
        
        // Apply language from user preferences
        if (userRes.data?.data?.preferences?.language) {
          const lang = userRes.data.data.preferences.language;
          if (i18n.language !== lang) {
            i18n.changeLanguage(lang);
          }
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [i18n]);

  if (loading) return <LoadingSpinner message={t('common.loading')} />;

  // Create mock historical data if none exists
  const emissionHistory = [
    { month: 'Jan', emission: 400, saved: 240 },
    { month: 'Feb', emission: 300, saved: 139 },
    { month: 'Mar', emission: 200, saved: 980 },
    { month: 'Apr', emission: 278, saved: 390 },
    { month: 'May', emission: 189, saved: 480 },
    { month: 'Jun', emission: data?.totalEmissions || 239, saved: data?.totalSaved || 380 },
  ];

  const vehicleComparison = [
    { name: 'Truck', emission: 120, avgDistance: 500 },
    { name: 'Van', emission: 80, avgDistance: 200 },
    { name: 'Rail', emission: 40, avgDistance: 1200 },
    { name: 'Ship', emission: 20, avgDistance: 3000 },
  ];

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('analytics.title')}</h1>
          <p className="text-slate-400 mt-1">{t('analytics.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('analytics.efficiency_score') || 'Carbon Efficiency Score'}
          value="A-"
          icon={Leaf}
          trend="up"
          trendValue="Top 15%"
          subtitle={t('analytics.vs_industry') || 'vs industry average'}
        />
        <StatCard
          title={t('analytics.ytd_emissions') || 'YTD Total Emissions'}
          value={`${data?.totalEmissions?.toFixed(1) || 0} kg`}
          icon={Activity}
          trend="down"
          trendValue="12%"
          subtitle={t('analytics.vs_last_year') || 'vs last year'}
        />
        <StatCard
          title={t('analytics.ytd_saved') || 'YTD Total Saved'}
          value={`${data?.totalSaved?.toFixed(1) || 0} kg`}
          icon={Wind}
          trend="up"
          trendValue="8%"
          subtitle={t('analytics.vs_last_year') || 'vs last year'}
        />
        <StatCard
          title={t('analytics.optimal_shipments') || 'Optimal Shipments'}
          value="84%"
          icon={TrendingDown}
          subtitle={t('analytics.recommended_vehicle_used') || 'used recommended vehicle'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('analytics.trends_chart') || 'Emission & Savings Trend'}>
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

        <ChartCard title="Vehicle Emission Comparison">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehicleComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis yAxisId="left" orientation="left" stroke="#94a3b8" />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                cursor={{ fill: '#334155', opacity: 0.4 }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="emission" fill="#f59e0b" name="Avg Emission (kg/100km)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="avgDistance" fill="#3b82f6" name="Avg Distance (km)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Route Performance Analysis</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-emerald-400 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Best Performing Route
                </h4>
                <span className="text-xs text-slate-400">Last 30 Days</span>
              </div>
              <p className="text-white text-lg font-semibold">Seattle → Portland</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                <span>Vehicle: Rail</span>
                <span>Avg. Emissions: 12kg</span>
                <span className="text-emerald-400">-40% vs Avg</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-red-400 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  Highest Impact Route
                </h4>
                <span className="text-xs text-slate-400">Needs Optimization</span>
              </div>
              <p className="text-white text-lg font-semibold">Denver → Chicago</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                <span>Vehicle: Truck</span>
                <span>Avg. Emissions: 340kg</span>
                <span className="text-red-400">+25% vs Avg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sustainability Recommendations</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/30">
                1
              </div>
              <div>
                <h4 className="text-white font-medium">Shift Denver to Chicago route to Rail</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Replacing the current truck fleet with rail transport on this corridor can reduce emissions by up to 60% with only a 12-hour increase in transit time.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/30">
                2
              </div>
              <div>
                <h4 className="text-white font-medium">Consolidate shipments from Warehouse B</h4>
                <p className="text-sm text-slate-400 mt-1">
                  By waiting 24 hours to consolidate pending orders, you can reduce total trips by 15%, saving an estimated 200kg of CO2 weekly.
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
