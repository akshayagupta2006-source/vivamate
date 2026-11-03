import React, { useState } from 'react';
import { 
  Sparkles, 
  Mic, 
  LayoutDashboard, 
  Compass, 
  Settings, 
  Menu, 
  X, 
  Play
} from 'lucide-react';

export default function Navbar({ 
  currentScreen, 
  onNavigate, 
  sessionActive, 
  topicInfo, 
  onOpenSettings,
  isLiveAI = false 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Explore', icon: Compass },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'configure', label: 'New Viva', icon: Play },
  ];

  const handleNavClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070c18]/90 backdrop-blur-xl border-b border-indigo-500/15 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('landing')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
                <Mic className="w-5 h-5" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  VivaMate
                </span>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 uppercase">
                  AI Voice Viva
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Oral Exam & Interview Simulator
              </p>
            </div>
          </div>

          {/* Active Session Indicator Pill */}
          {sessionActive && topicInfo && (
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-indigo-950/60 border border-indigo-500/30 rounded-full text-xs font-medium text-indigo-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Exam in progress: <strong className="font-semibold text-white">{topicInfo.topic}</strong></span>
              <span className="text-indigo-400/50">|</span>
              <span className="capitalize text-slate-300">{topicInfo.difficulty}</span>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-white bg-indigo-600/30 border border-indigo-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* AI Status Indicator */}
            <div 
              onClick={onOpenSettings}
              className={`cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isLiveAI 
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                  : 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30 hover:bg-indigo-900/60'
              }`}
              title="Click to configure Gemini API Key"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isLiveAI ? 'Gemini AI Active' : 'AI Engine'}</span>
            </div>

            {/* Settings Gear */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Open Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Start Viva Call to Action */}
            {currentScreen !== 'viva' && currentScreen !== 'configure' && (
              <button
                onClick={() => handleNavClick('configure')}
                className="ml-2 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 hover:brightness-110 transition-all"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Start Viva</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-300 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0f1d] border-b border-indigo-500/20 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-left ${
                  isActive
                    ? 'text-white bg-indigo-600/30 border border-indigo-500/40'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 text-indigo-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
