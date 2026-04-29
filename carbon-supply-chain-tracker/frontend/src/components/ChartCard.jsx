import React from 'react';

const ChartCard = ({ title, children, action }) => {
  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 w-full relative min-h-[300px]">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
