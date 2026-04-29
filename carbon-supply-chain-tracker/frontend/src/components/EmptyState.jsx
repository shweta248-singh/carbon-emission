import React from 'react';
import { PackageX } from 'lucide-react';

const EmptyState = ({ title = "No Data Found", description = "Get started by adding some data.", icon: Icon = PackageX, action }) => {
  return (
    <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-700/50">
      <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-6 max-w-sm">{description}</p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
