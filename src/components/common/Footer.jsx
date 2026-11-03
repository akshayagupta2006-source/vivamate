import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#040711] border-t border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white text-sm tracking-tight">VivaMate</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
              AI Voice Viva
            </span>
          </div>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span>Next-Generation Turn-by-Turn AI Oral Exam Trainer</span>
        </div>

        {/* Tech Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-sky-400 font-mono text-[11px]">
            React 19 + Vite 8
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-purple-400 font-mono text-[11px]">
            Tailwind CSS
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[11px]">
            Node.js + Express
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Gemini 2.5 Flash
          </span>
        </div>

        {/* Note */}
        <div className="text-center sm:text-right text-[11px] text-slate-500">
          Curated Rubric Fallback Ready • Built for University Students
        </div>

      </div>
    </footer>
  );
}
