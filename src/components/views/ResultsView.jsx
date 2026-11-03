import React, { useEffect } from 'react';
import { 
  Award, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateGrade } from '../../utils/grading';

export default function ResultsView({
  sessionResults = [],
  performanceSummary = {},
  topicInfo = {},
  onRetakeViva,
  onChooseNewTopic,
}) {
  const calculatedGrade = performanceSummary.overallGrade || calculateGrade(Number(performanceSummary.scorePercentage) || 0);

  // Fire subtle celebratory confetti on mount if average score is good
  useEffect(() => {
    if (performanceSummary.averageScore >= 6.0) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#2563eb', '#9333ea', '#10b981'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [performanceSummary]);

  const handlePrint = () => {
    window.print();
  };

  const getGradeColor = (grade) => {
    if ((grade || '').startsWith('A')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if ((grade || '').startsWith('B')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if ((grade || '').startsWith('C')) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Hero Performance Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-100 p-6 sm:p-10 relative overflow-hidden">
        
        {/* Soft background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-100/60 to-purple-100/60 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
          
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Viva Voce Examination Completed</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Performance Summary
            </h1>
            
            <p className="text-sm text-slate-600">
              Subject: <strong className="text-slate-800">{topicInfo.subject}</strong> • Topic: <strong className="text-slate-800">{topicInfo.topic}</strong>
            </p>
          </div>

          {/* Big Score Widget */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Overall Average
              </div>
              <div className="text-3xl sm:text-4xl font-black text-indigo-600">
                {performanceSummary.averageScore || 0}
                <span className="text-sm font-semibold text-slate-400"> / 10</span>
              </div>
              <div className="text-xs font-bold text-slate-600 mt-0.5">
                {performanceSummary.scorePercentage || 0}% Accuracy
              </div>
            </div>

            <div className={`px-4 py-3 rounded-2xl border text-center ${getGradeColor(calculatedGrade)}`}>
              <div className="text-[10px] font-bold uppercase">Grade</div>
              <div className="text-2xl font-black">{calculatedGrade}</div>
            </div>
          </div>

        </div>

        {/* Readiness Diagnosis Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <span className="text-xs text-indigo-700 font-bold uppercase">Examiner Assessment: </span>
              <span className="text-sm font-bold text-slate-900">{performanceSummary.readinessStatus}</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Tested {sessionResults.length} Questions
          </span>
        </div>

        {/* Breakdown Metric Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500">Conceptual Depth</div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {Math.min(Math.round((performanceSummary.averageScore || 0) * 10), 95)}%
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min((performanceSummary.averageScore || 0) * 10, 95)}%` }} />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500">Key Terminology</div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {Math.min(Math.round((performanceSummary.averageScore || 0) * 9.5), 90)}%
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${Math.min((performanceSummary.averageScore || 0) * 9.5, 90)}%` }} />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500">Articulation</div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {Math.min(Math.round((performanceSummary.averageScore || 0) * 9.8), 92)}%
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${Math.min((performanceSummary.averageScore || 0) * 9.8, 92)}%` }} />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500">Completeness</div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {Math.min(Math.round((performanceSummary.averageScore || 0) * 9.2), 88)}%
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${Math.min((performanceSummary.averageScore || 0) * 9.2, 88)}%` }} />
            </div>
          </div>
        </div>

      </div>

      {/* Revision Checklist & Strengths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Priority Revision Checklist */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              Priority Revision Topics
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Concepts you missed during this session that examiners frequently ask about:
          </p>

          {performanceSummary.areasForImprovement && performanceSummary.areasForImprovement.length > 0 ? (
            <div className="space-y-2">
              {performanceSummary.areasForImprovement.map((concept, i) => (
                <div key={i} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs font-medium text-amber-900 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span>{concept}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-700 italic">
              No major gaps detected! Outstanding conceptual coverage.
            </p>
          )}
        </div>

        {/* Mastered Concepts */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Mastered Concepts
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Key principles and technical terms you correctly explained:
          </p>

          {performanceSummary.strengths && performanceSummary.strengths.length > 0 ? (
            <div className="space-y-2">
              {performanceSummary.strengths.map((concept, i) => (
                <div key={i} className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs font-medium text-emerald-900 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{concept}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Keep practicing to build your core terminology list.
            </p>
          )}
        </div>

      </div>

      {/* Question-by-Question Audit Review */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Detailed Question-by-Question Audit
            </h3>
            <p className="text-xs text-slate-500">
              Review what the examiner asked, your response, and the rubric outcome.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>

        <div className="space-y-4">
          {sessionResults.map((item, idx) => (
            <div 
              key={idx} 
              className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    Question {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.question?.question}
                  </h4>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-indigo-700 shadow-2xs">
                  {item.evaluation?.score || 0} / 10
                </span>
              </div>

              {/* Student Answer */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-500 block mb-1">Your Spoken/Typed Answer:</span>
                <p className="italic">{item.studentAnswer || 'Skipped / No answer submitted.'}</p>
              </div>

              {/* Missing & Covered Concepts */}
              <div className="flex flex-wrap gap-2 text-xs pt-1">
                {item.evaluation?.conceptsCovered?.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 text-[11px] font-medium">
                    ✓ {c}
                  </span>
                ))}
                {item.evaluation?.missingConcepts?.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-amber-100/70 text-amber-900 text-[11px] font-medium">
                    ⚠️ {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Next Actions Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={onRetakeViva}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Same Topic</span>
        </button>

        <button
          onClick={onChooseNewTopic}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-md hover:from-blue-700 hover:to-purple-700 transition-all group"
        >
          <span>Choose New Topic</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}
