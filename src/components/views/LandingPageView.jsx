import React from 'react';
import { 
  Mic, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Brain, 
  Volume2, 
  BarChart3,
  Flame,
  Award
} from 'lucide-react';
import AIExaminerOrb from '../common/AIExaminerOrb';

export default function LandingPageView({ onStartViva, onExploreFeatures }) {
  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16">
        
        {/* Futuristic Ambient Glow Backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none opacity-30">
          <div className="absolute top-12 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[140px]" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500 rounded-full blur-[160px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs sm:text-sm font-semibold mb-8 shadow-lg shadow-indigo-950/60 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Next-Gen Voice AI Oral Exam Simulator</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Master Every Concept.{' '}
            <span className="block mt-2 bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Ace Every Viva.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            VivaMate simulates real-time, turn-by-turn oral examinations with an intelligent AI examiner. 
            Speak your answers, defend your technical reasoning, uncover missing concepts, and eliminate viva exam anxiety.
          </p>

          {/* Animated AI Examiner Orb Feature In Hero */}
          <div className="my-10 flex flex-col items-center justify-center">
            <div className="p-4 rounded-3xl glass-panel relative group">
              <AIExaminerOrb state="speaking" persona="AI Examiner" size="md" />
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartViva}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 hover:brightness-115 transition-all group"
            >
              <Mic className="w-5 h-5 text-cyan-200" />
              <span>Start Your First Viva</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreFeatures}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass-panel text-slate-200 font-semibold text-base hover:text-white hover:border-indigo-400 transition-all"
            >
              <span>Explore Features</span>
            </button>
          </div>

          {/* Trust stats */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80 text-center">
            <div>
              <div className="text-2xl font-black text-white">Turn-by-Turn</div>
              <div className="text-xs text-slate-400 mt-0.5">Voice Examination</div>
            </div>
            <div>
              <div className="text-2xl font-black text-sky-400">Adaptive</div>
              <div className="text-xs text-slate-400 mt-0.5">Cross-Questioning</div>
            </div>
            <div>
              <div className="text-2xl font-black text-purple-400">Gemini 2.5</div>
              <div className="text-xs text-slate-400 mt-0.5">Semantic Analysis</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">EN & HI</div>
              <div className="text-xs text-slate-400 mt-0.5">Multi-Language Support</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. HOW VIVAMATE WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-800">
            Turn-by-Turn Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            How VivaMate Works
          </h2>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            True two-way oral exam simulation powered by speech-to-text, generative AI, and intelligent vocal synthesis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'AI Examiner Speaks',
              desc: 'The AI examiner generates and speaks a tailored viva question out loud with persona & voice synthesis.',
              icon: Volume2,
              color: 'text-sky-400 bg-sky-950/60 border-sky-500/30',
            },
            {
              step: '02',
              title: 'You Speak Your Answer',
              desc: 'Answer naturally via microphone with live speech-to-text transcription and full text fallback editing.',
              icon: Mic,
              color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
            },
            {
              step: '03',
              title: 'Semantic Concept Check',
              desc: 'Gemini AI semantically analyzes conceptual depth, technical accuracy, and catches missing keywords.',
              icon: Brain,
              color: 'text-purple-400 bg-purple-950/60 border-purple-500/30',
            },
            {
              step: '04',
              title: 'Adaptive Follow-Up',
              desc: 'The examiner reacts verbally and asks a dynamic cross-question based directly on your previous answer.',
              icon: Sparkles,
              color: 'text-indigo-400 bg-indigo-950/60 border-indigo-500/30',
            },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="glass-panel rounded-3xl p-6 relative group glass-panel-hover">
                <span className="text-3xl font-black text-slate-800 group-hover:text-indigo-400/30 transition-colors absolute top-4 right-6 font-mono">
                  {s.step}
                </span>
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-5 ${s.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. AI VOICE EXAMINATION & ADAPTIVE QUESTIONING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-indigo-500/25 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800">
                Core Capability
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Not Just a Quiz — A Living, Adaptive Oral Examination
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Static quiz platforms test multiple-choice memory. Viva exams in top engineering colleges and technical job interviews require rapid verbal articulation and deep reasoning under pressure.
              </p>

              <div className="space-y-3.5">
                {[
                  'Semantic understanding rather than rigid exact-word matching',
                  'Dynamic cross-questioning when you miss critical boundary conditions',
                  'Multiple examiner personalities (Friendly Professor, Strict Examiner, Tech Lead)',
                  'Real-time hints if you freeze or get stuck on definitions',
                  'Rephrase and clarify questions in simpler everyday language on demand',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={onStartViva}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>Experience Voice Examination</span>
                </button>
              </div>
            </div>

            {/* Simulated Voice Room Visual Preview */}
            <div className="bg-[#090e1d] rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="font-bold text-slate-300">Live Voice Room (Operating Systems)</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>

              <div className="py-6 flex flex-col items-center">
                <AIExaminerOrb state="speaking" persona="Strict Examiner" size="sm" />
              </div>

              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-sky-400 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" />
                  Examiner Follow-Up:
                </span>
                <p className="text-slate-200">
                  "You correctly identified Circular Wait. Now explain: how does the OS enforce resource ordering to prevent it?"
                </p>
              </div>

              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-900/40 text-xs space-y-1">
                <span className="font-bold text-purple-300 flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5" />
                  Student Speech Transcript:
                </span>
                <p className="text-slate-300 italic">
                  "By assigning a unique global integer to every resource type and requiring processes to request them in strictly increasing order..."
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PERFORMANCE TRACKING & INSTANT FEEDBACK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
            Actionable Analytics
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            Instant AI Feedback & Performance Tracking
          </h2>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            Every session feeds into your personal student dashboard to pinpoint weak concepts and track mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-3xl p-6 space-y-3 glass-panel-hover">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">4-Dimensional Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Assesses Conceptual Depth, Technical Terminology, Response Completeness, and Verbal Articulation independently.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 space-y-3 glass-panel-hover">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Weak Topic AI Revision</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identifies omitted conditions and generates targeted flash revision sessions so you only practice what you missed.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 space-y-3 glass-panel-hover">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Official PDF Reports</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export comprehensive printable audit reports with model answers and examiner recommendations for college records.
            </p>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE VIVAMATE (COMPARISON) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white">
            Why Choose VivaMate?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Engineered specifically for spoken academic defense and technical interviews.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                <th className="pb-3">Capabilities</th>
                <th className="pb-3 text-indigo-400">VivaMate Voice AI</th>
                <th className="pb-3 text-slate-500">Static Quiz Apps</th>
                <th className="pb-3 text-slate-500">Peer Practice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 font-medium">Turn-by-turn spoken viva</td>
                <td className="py-3 text-emerald-400 font-bold">✓ Native Web Speech + TTS</td>
                <td className="py-3 text-rose-500">✕ None</td>
                <td className="py-3 text-amber-400">⚠️ Inconsistent</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Dynamic follow-up questioning</td>
                <td className="py-3 text-emerald-400 font-bold">✓ Contextual Gemini 2.5</td>
                <td className="py-3 text-rose-500">✕ Static MCQs</td>
                <td className="py-3 text-amber-400">⚠️ Limited</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Concept gap breakdown</td>
                <td className="py-3 text-emerald-400 font-bold">✓ Real-time keyword check</td>
                <td className="py-3 text-rose-500">✕ Only right/wrong</td>
                <td className="py-3 text-rose-500">✕ Subjective</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Multi-language (EN & HI)</td>
                <td className="py-3 text-emerald-400 font-bold">✓ Dual English & Hindi</td>
                <td className="py-3 text-slate-500">English only</td>
                <td className="py-3 text-slate-500">Varies</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Weak topic revision mode</td>
                <td className="py-3 text-emerald-400 font-bold">✓ Automated Flash Revision</td>
                <td className="py-3 text-rose-500">✕ None</td>
                <td className="py-3 text-rose-500">✕ Manual</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 text-center bg-gradient-to-tr from-cyan-900/60 via-indigo-950/80 to-purple-950/60 border border-indigo-500/30 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Ace Your Next Oral Examination?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Step into the virtual examination room today. Test yourself against our AI examiners and enter your viva voce with absolute confidence.
            </p>
            <div className="pt-2">
              <button
                onClick={onStartViva}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/40 hover:brightness-110 transition-all group"
              >
                <Mic className="w-5 h-5" />
                <span>Start Free Examination Session</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
