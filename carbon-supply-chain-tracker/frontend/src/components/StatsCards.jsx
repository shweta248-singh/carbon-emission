import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass p-6 rounded-2xl card-hover">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold mt-1 text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-${color}/20 text-${color}`}>
        <Icon size={28} />
      </div>
    </div>
  </div>
);

export default StatsCard;
