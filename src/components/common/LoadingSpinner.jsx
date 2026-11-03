import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export default function LoadingSpinner({ 
  message = 'Loading...', 
  subtext = 'Preparing oral exam questions with evaluation rubric...' 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-5">
        {/* Outer glowing pulsing ring */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500/20 via-indigo-500/30 to-purple-500/20 animate-ping absolute inset-0" />
        
        {/* Main spinner card */}
        <div className="relative w-16 h-16 rounded-2xl bg-white border border-slate-200/80 shadow-lg flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
        <span>{message}</span>
        <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
      </h3>
      {subtext && (
        <p className="mt-1 text-sm text-slate-500 max-w-sm">
          {subtext}
        </p>
      )}
    </div>
  );
}

