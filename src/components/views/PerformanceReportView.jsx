import React, { useEffect } from 'react';
import { 
  Award, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  ArrowRight, 
  Sparkles, 
  Check, 
  LayoutDashboard
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PerformanceReportView({
  config = {},
  report = {},
  sessionResults = [],
  onRetakeViva,
  onPracticeWeakTopics,
  onReturnDashboard,
}) {
  const totalScore = report.totalScore ?? Math.round((report.averageScoreOutOf10 || 7.5) * 10);

  useEffect(() => {
    if (totalScore >= 65) {
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#818cf8', '#a855f7', '#34d399'],
        });
      } catch {
        // ignore
      }
    }
  }, [totalScore]);

  const handlePrint = () => {
    window.print();
  };

  const getGradeBadge = (grade) => {
    if ((grade || '').startsWith('A')) return 'bg-emerald-950 text-emerald-400 border-emerald-700/80';
    if ((grade || '').startsWith('B')) return 'bg-indigo-950 text-indigo-400 border-indigo-700/80';
    return 'bg-amber-950 text-amber-400 border-amber-700/80';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* 1. Executive Performance Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-indigo-500/30 shadow-2xl">
        
        {/* Subtle background aurora */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/40 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Official Examination Evaluation Report</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Oral Viva Performance
            </h1>

            <p className="text-sm text-slate-300">
              Subject: <strong className="text-white">{config.subject}</strong> • Topic: <strong className="text-white">{config.topic}</strong> • Examiner: <strong className="text-indigo-300">{config.persona}</strong>
            </p>
          </div>

          {/* Big Score Widget */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Overall Viva Score
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white">
                {totalScore}
                <span className="text-sm font-semibold text-slate-400"> / 100</span>
              </div>
              <div className="text-xs font-mono font-bold text-sky-400 mt-0.5">
                {report.averageScoreOutOf10 || (totalScore / 10).toFixed(1)} / 10 Avg
              </div>
            </div>

            <div className={`px-4 py-3 rounded-2xl border text-center ${getGradeBadge(report.overallGrade)}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider">Grade</div>
              <div className="text-3xl font-black">{report.overallGrade || 'A'}</div>
            </div>
          </div>
        </div>

        {/* Readiness Diagnosis */}
        <div className="mt-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="text-xs text-indigo-300 font-bold uppercase">Assessment: </span>
              <span className="text-sm font-bold text-white">{report.readinessStatus || 'Solid Conceptual Foundation'}</span>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {sessionResults.length} Questions Evaluated
          </span>
        </div>

        {/* 4-Dimensional Skill Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-slate-400">Conceptual Depth</div>
            <div className="text-2xl font-black text-sky-400">
              {report.conceptualScore ?? Math.min(totalScore + 4, 98)}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-sky-400 h-1.5 rounded-full" 
                style={{ width: `${report.conceptualScore ?? Math.min(totalScore + 4, 98)}%` }} 
              />
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-slate-400">Technical Accuracy</div>
            <div className="text-2xl font-black text-purple-400">
              {report.technicalScore ?? Math.max(totalScore - 5, 45)}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-purple-400 h-1.5 rounded-full" 
                style={{ width: `${report.technicalScore ?? Math.max(totalScore - 5, 45)}%` }} 
              />
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-slate-400">Completeness</div>
            <div className="text-2xl font-black text-emerald-400">
              {report.completenessScore ?? Math.max(totalScore - 2, 50)}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-emerald-400 h-1.5 rounded-full" 
                style={{ width: `${report.completenessScore ?? Math.max(totalScore - 2, 50)}%` }} 
              />
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-slate-400">Verbal Articulation</div>
            <div className="text-2xl font-black text-indigo-400">
              {report.articulationScore ?? Math.min(totalScore + 2, 95)}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-indigo-400 h-1.5 rounded-full" 
                style={{ width: `${report.articulationScore ?? Math.min(totalScore + 2, 95)}%` }} 
              />
            </div>
          </div>

        </div>

      </div>

      {/* 2. Executive Examiner Summary & Concept Mastery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strong Mastered Concepts */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Mastered Concepts</h3>
          </div>
          <p className="text-xs text-slate-400">
            Principles you explained with high technical fidelity during oral questioning:
          </p>

          <div className="space-y-2">
            {(report.strongConcepts || []).length > 0 ? (
              report.strongConcepts.map((concept, i) => (
                <div key={i} className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs font-semibold text-emerald-200 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{concept}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No specific strengths recorded.</p>
            )}
          </div>
        </div>

        {/* Weak Concepts & Revision Checklist */}
        <div className="glass-panel rounded-3xl p-6 space-y-4 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Concepts Needing Revision</h3>
            </div>
            <button
              onClick={() => onPracticeWeakTopics(report.weakConcepts || [])}
              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline"
            >
              Practice Weak Concepts
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Terms and conditions you missed that examiners frequently challenge:
          </p>

          <div className="space-y-2">
            {(report.weakConcepts || []).length > 0 ? (
              report.weakConcepts.map((concept, i) => (
                <div key={i} className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs font-semibold text-amber-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{concept}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-emerald-400 font-medium">Exceptional performance! Zero major concept gaps detected.</p>
            )}
          </div>
        </div>

      </div>

      {/* 3. Detailed Question-by-Question Audit History */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Full Examination Question Audit</h3>
            <p className="text-xs text-slate-400">Review every examiner question, your speech transcript, and rubric outcome</p>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>

        <div className="space-y-4">
          {sessionResults.map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                    Question {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {item.question?.question}
                  </h4>
                </div>
                <span className="shrink-0 px-3 py-1 rounded-xl bg-indigo-950 border border-indigo-800 text-xs font-black text-indigo-300 font-mono">
                  {item.evaluation?.score ?? 0} / 10
                </span>
              </div>

              {/* Spoken Answer */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                <strong className="text-slate-400 block mb-1">Your Spoken Answer:</strong>
                <p className="italic font-mono leading-relaxed">
                  "{item.studentAnswer || 'Skipped / No answer submitted.'}"
                </p>
              </div>

              {/* Examiner Reaction & Model Answer */}
              {item.evaluation?.modelAnswer && (
                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-200">
                  <strong className="text-indigo-400 block mb-1">Ideal Reference Answer:</strong>
                  <p>{item.evaluation.modelAnswer}</p>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                {item.evaluation?.conceptsCovered?.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[11px] border border-emerald-800">
                    ✓ {c}
                  </span>
                ))}
                {item.evaluation?.missingConcepts?.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[11px] border border-amber-800">
                    ⚠️ {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={onReturnDashboard}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 font-bold text-sm hover:bg-slate-800 transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

        <button
          onClick={onRetakeViva}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 font-bold text-sm hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake This Topic</span>
        </button>

        <button
          onClick={() => onPracticeWeakTopics(report.weakConcepts || [])}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-600 to-purple-600 text-white font-black text-sm shadow-xl shadow-indigo-600/30 hover:brightness-110 transition-all"
        >
          <span>Practice Weak Concepts Flash Mode</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
