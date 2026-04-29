import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = "Loading...", fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-slate-400 text-sm font-medium">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darker">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center items-center min-h-[200px]">
      {content}
    </div>
  );
};

export default LoadingSpinner;
