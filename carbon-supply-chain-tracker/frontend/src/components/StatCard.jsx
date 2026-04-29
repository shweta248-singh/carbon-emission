import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, subtitle }) => {
  return (
    <div className="glass-card rounded-2xl p-6 card-hover relative overflow-hidden group">
      {/* Decorative gradient blur */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      
      {(trend || subtitle) && (
        <div className="flex items-center gap-2 mt-4 relative z-10 text-sm">
          {trend === 'up' && (
            <span className="text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-500/20">
              ↑ {trendValue}
            </span>
          )}
          {trend === 'down' && (
            <span className="text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-500/20">
              ↓ {trendValue}
            </span>
          )}
          {trend === 'neutral' && (
            <span className="text-slate-400 flex items-center bg-slate-500/10 px-2 py-0.5 rounded-full text-xs font-medium border border-slate-500/20">
              - {trendValue}
            </span>
          )}
          {trend === 'bad' && (
            <span className="text-red-400 flex items-center bg-red-500/10 px-2 py-0.5 rounded-full text-xs font-medium border border-red-500/20">
              ↑ {trendValue}
            </span>
          )}
          <span className="text-slate-500">{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
