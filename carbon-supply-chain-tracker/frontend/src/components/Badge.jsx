import React from 'react';

const Badge = ({ children, type = 'default' }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    default: 'bg-slate-500/10 text-slate-300 border-slate-500/20'
  };

  const selectedStyle = styles[type] || styles.default;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${selectedStyle}`}>
      {children}
    </span>
  );
};

export default Badge;
