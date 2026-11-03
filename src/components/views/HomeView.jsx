import React from 'react';
import { 
  Mic, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Target, 
  Volume2 
} from 'lucide-react';
import { SAMPLE_SUBJECTS } from '../../data/mockData';

export default function HomeView({ onStartViva, onSelectTopicPreset }) {
  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-10">
        
        {/* Soft background glow accents (blue & purple) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 -z-10 pointer-events-none opacity-40 blur-3xl">
          <div className="absolute top-10 left-1/4 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl animate-pulse" />
          <div className="absolute top-10 right-1/4 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
          
          {/* Tagline / Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs sm:text-sm font-semibold mb-6 shadow-xs">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>AI-Powered Oral Exam & Viva Voce Trainer</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Master Your Technical Viva{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Before Facing The Examiner
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Practice technical viva voce questions out loud. Speak or type your answers, instantly identify 
            <span className="font-semibold text-slate-800"> missing concepts</span>, and build speaking confidence with structured rubric feedback.
          </p>

          {/* CTA Group */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onStartViva}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-200/60 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:shadow-xl transition-all duration-200 group"
            >
              <span>Start Viva Practice</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-base hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
            >
              <span>See How It Works</span>
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Voice Speech-to-Text & Text Fallback</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Realistic Engineering Question Banks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero Jargon Concept Gap Analysis</span>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Viva Sample Preview Card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                Interactive Preview
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">
                What a VivaMate Feedback Session Looks Like
              </h3>
            </div>
            <button
              onClick={onStartViva}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-center"
            >
              <span>Try Live Viva Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
            
            {/* Left: Examiner Question & Student Answer */}
            <div className="md:col-span-7 space-y-4">
              <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                  Examiner Question (Operating Systems):
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  "Explain the Coffman conditions required for a deadlock to occur in an operating system."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
                  <Mic className="w-3.5 h-3.5 text-purple-600" />
                  Sample Student Spoken Answer:
                </span>
                <p className="text-sm text-slate-700 italic">
                  "Deadlock needs mutual exclusion where resources are non-shareable, hold and wait, and circular wait where processes form a cycle waiting for resources."
                </p>
              </div>
            </div>

            {/* Right: VivaMate Concept Breakdown */}
            <div className="md:col-span-5 bg-indigo-50/50 rounded-xl p-5 border border-indigo-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Evaluation Result
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                    Score: 7.5 / 10
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1">
                      ✓ Concepts Covered (3)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded font-medium">
                        Mutual Exclusion
                      </span>
                      <span className="text-xs bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded font-medium">
                        Hold and Wait
                      </span>
                      <span className="text-xs bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded font-medium">
                        Circular Wait
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1">
                      ⚠️ Missing Concept (1)
                    </span>
                    <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium inline-block">
                      No Preemption
                    </span>
                  </div>

                  <div className="pt-2 border-t border-indigo-100/70">
                    <span className="text-[11px] font-bold text-indigo-900 uppercase block mb-0.5">
                      💡 Improvement Tip
                    </span>
                    <p className="text-xs text-slate-600">
                      You missed naming "No Preemption". Stating all 4 conditions completely ensures a full 10/10 mark.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Feature Grid */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Built Specifically For Oral Viva Success
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Written exams test rote memory; viva examinations test spontaneous articulation and conceptual depth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Voice-First Simulator
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Speak naturally into your microphone using browser speech recognition. Includes instant text fallback for noisy environments or unsupported devices.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Concept Gap Detection
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Don't guess what the examiner wanted. VivaMate breaks down exactly which core concepts were hit and which crucial keywords were omitted.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Actionable Exam Tips
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Receive structured recommendations after every question, plus a final performance summary highlighting your readiness level.
            </p>
          </div>

        </div>
      </section>

      {/* Preset Topics Quick Launch */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800">
              Curated Question Sets
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-3">
              Practice Popular Engineering Topics
            </h2>
            <p className="mt-2 text-slate-300 text-sm sm:text-base">
              Jump straight into frequently asked university and placement viva questions.
            </p>
          </div>

          {/* Topic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 relative z-10">
            {SAMPLE_SUBJECTS.slice(0, 4).map((sub) => (
              <div 
                key={sub.id}
                onClick={() => onSelectTopicPreset(sub.name, sub.popularTopics[0])}
                className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
              >
                <div>
                  <h4 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                    {sub.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {sub.popularTopics[0]}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-indigo-400 font-semibold pt-3 border-t border-slate-700">
                  <span>Start Topic</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
