import React from 'react';
import { Sparkles, Mic, Volume2, Cpu, Brain } from 'lucide-react';

export default function AIExaminerOrb({ 
  state = 'idle', // 'idle' | 'speaking' | 'listening' | 'thinking'
  persona = 'Friendly Professor',
  size = 'md' // 'sm' | 'md' | 'lg'
}) {
  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-56 h-56',
  };

  const getStatusInfo = () => {
    switch (state) {
      case 'speaking':
        return {
          label: 'AI Examiner Speaking...',
          color: 'text-sky-400 bg-sky-950/80 border-sky-500/40',
          icon: <Volume2 className="w-3.5 h-3.5 text-sky-400 animate-pulse" />,
          orbClass: 'animate-orb-speaking',
          gradient: 'from-cyan-500 via-indigo-500 to-purple-600',
          ringColor: 'border-cyan-400/40',
        };
      case 'listening':
        return {
          label: 'Listening to your answer...',
          color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40',
          icon: <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />,
          orbClass: 'animate-orb-listening',
          gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
          ringColor: 'border-emerald-400/40',
        };
      case 'thinking':
        return {
          label: 'Evaluating your response...',
          color: 'text-purple-400 bg-purple-950/80 border-purple-500/40',
          icon: <Brain className="w-3.5 h-3.5 text-purple-400 animate-spin" />,
          orbClass: 'animate-orb-idle',
          gradient: 'from-purple-600 via-pink-500 to-indigo-600',
          ringColor: 'border-purple-400/50',
        };
      case 'idle':
      default:
        return {
          label: `${persona} (Ready)`,
          color: 'text-indigo-300 bg-indigo-950/60 border-indigo-500/30',
          icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />,
          orbClass: 'animate-orb-idle',
          gradient: 'from-blue-600 via-indigo-600 to-purple-700',
          ringColor: 'border-indigo-400/20',
        };
    }
  };

  const status = getStatusInfo();

  return (
    <div className="flex flex-col items-center justify-center select-none py-2">
      {/* Outer Glow Halo & Ring container */}
      <div className={`relative flex items-center justify-center ${sizeMap[size]}`}>
        
        {/* Deep ambient backdrop glow */}
        <div 
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${status.gradient} opacity-40 blur-2xl transition-all duration-700`}
        />

        {/* Orbiting Tech Ring */}
        <div 
          className={`absolute -inset-3 rounded-full border border-dashed ${status.ringColor} ${state === 'thinking' ? 'animate-orb-spin' : ''} transition-all duration-500 opacity-60`}
        />

        {/* Secondary Expanding Ripple (when speaking or listening) */}
        {(state === 'speaking' || state === 'listening') && (
          <div 
            className="absolute -inset-6 rounded-full border border-sky-400/30 animate-ping pointer-events-none opacity-40" 
          />
        )}

        {/* Core Sphere */}
        <div 
          className={`relative z-10 w-full h-full rounded-full bg-gradient-to-tr ${status.gradient} shadow-2xl ${status.orbClass} flex items-center justify-center transition-all duration-500 overflow-hidden border border-white/20`}
        >
          {/* Inner Light Highlights */}
          <div className="absolute top-2 left-4 w-1/3 h-1/4 rounded-full bg-white/30 blur-xs" />
          <div className="absolute bottom-3 right-4 w-1/4 h-1/4 rounded-full bg-black/40 blur-xs" />

          {/* Central AI Core Icon */}
          <div className="relative z-20 text-white/90 drop-shadow-md">
            {state === 'thinking' ? (
              <Brain className="w-10 h-10 animate-pulse text-white" />
            ) : state === 'speaking' ? (
              <Volume2 className="w-10 h-10 text-white animate-bounce" />
            ) : state === 'listening' ? (
              <Mic className="w-10 h-10 text-white" />
            ) : (
              <Cpu className="w-10 h-10 text-white/80" />
            )}
          </div>
        </div>

      </div>

      {/* Floating Status Pill */}
      <div className="mt-4">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md shadow-lg transition-all duration-300 ${status.color}`}>
          {status.icon}
          <span>{status.label}</span>
        </div>
      </div>
    </div>
  );
}

