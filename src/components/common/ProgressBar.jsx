import React from 'react';

export default function ProgressBar({ current, total }) {
  const percentage = Math.min(Math.round(((current) / total) * 100), 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
        <span>Question {current} of {total}</span>
        <span className="text-indigo-600">{percentage}% Completed</span>
      </div>
      <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

