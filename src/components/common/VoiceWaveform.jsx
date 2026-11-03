import React from 'react';

export default function VoiceWaveform({ isActive = false, color = 'cyan', barCount = 18 }) {
  const bars = Array.from({ length: barCount });

  const colorStyles = {
    cyan: 'bg-cyan-400 shadow-cyan-400/50',
    purple: 'bg-purple-400 shadow-purple-400/50',
    emerald: 'bg-emerald-400 shadow-emerald-400/50',
  };

  const selectedColor = colorStyles[color] || colorStyles.cyan;

  return (
    <div className="flex items-center justify-center gap-1.5 h-10 px-4">
      {bars.map((_, i) => {
        const animClass = isActive 
          ? (i % 4 === 0 ? 'animate-eq-1' : i % 4 === 1 ? 'animate-eq-2' : i % 4 === 2 ? 'animate-eq-3' : 'animate-eq-4')
          : '';

        // Dynamic base height when idle
        const idleHeight = 15 + Math.sin(i * 0.7) * 10;

        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-300 shadow-xs ${selectedColor} ${animClass}`}
            style={{
              height: isActive ? undefined : `${idleHeight}%`,
              animationDelay: `${(i % 5) * 0.12}s`,
            }}
          />
        );
      })}
    </div>
  );
}

