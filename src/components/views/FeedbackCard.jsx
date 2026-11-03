import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  BookOpen, 
  Award, 
  ArrowRight, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Info
} from 'lucide-react';

export default function FeedbackCard({ 
  evaluation, 
  isLastQuestion, 
  onNextQuestion 
}) {
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  if (!evaluation) return null;

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 5.5) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const getCorrectnessBadge = (correctness) => {
    if (correctness.includes('Correct & Comprehensive')) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {correctness}
        </span>
      );
    }
    if (correctness.includes('Partially')) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          {correctness}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        {correctness}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-100 p-6 sm:p-8 space-y-6 animate-fadeIn">
      
      {/* Header with Score and Correctness */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
              Question Evaluation
            </span>
            {getCorrectnessBadge(evaluation.correctness)}
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            Examiner Feedback & Concept Analysis
          </h3>
        </div>

        {/* Score Pill */}
        <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-3 ${getScoreColor(evaluation.score)}`}>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wide opacity-80">
              Evaluated Score
            </div>
            <div className="text-2xl font-black">
              {evaluation.score} <span className="text-xs font-medium opacity-70">/ 10</span>
            </div>
          </div>
          <Award className="w-8 h-8 opacity-80" />
        </div>
      </div>

      {/* Honest Demo Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-slate-800">Demo Rubric Mode: </strong>
          <span>{evaluation.evaluationDisclaimer}</span>
        </div>
      </div>

      {/* Concept Breakdown Grid: Covered vs Missing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Concepts Covered */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/90">
          <div className="flex items-center gap-2 mb-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Concepts Covered ({evaluation.conceptsCovered?.length || 0})
            </h4>
          </div>
          {evaluation.conceptsCovered && evaluation.conceptsCovered.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {evaluation.conceptsCovered.map((c, i) => (
                <span 
                  key={i} 
                  className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 text-xs font-medium shadow-2xs"
                >
                  ✓ {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No core concepts were identified in your answer.
            </p>
          )}
        </div>

        {/* Missing Concepts */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100/90">
          <div className="flex items-center gap-2 mb-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Missing Concepts ({evaluation.missingConcepts?.length || 0})
            </h4>
          </div>
          {evaluation.missingConcepts && evaluation.missingConcepts.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {evaluation.missingConcepts.map((c, i) => (
                <span 
                  key={i} 
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 text-xs font-medium shadow-2xs"
                >
                  ⚠️ {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-700 font-medium">
              Excellent! You covered all expected core concepts.
            </p>
          )}
        </div>

      </div>

      {/* Actionable Improvement Tips */}
      <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-purple-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">
            Actionable Improvement Tips for Viva
          </h4>
        </div>
        <ul className="space-y-1.5">
          {evaluation.improvementTips?.map((tip, idx) => (
            <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
              <span className="text-purple-600 font-bold shrink-0">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Model Answer Toggle */}
      {evaluation.modelAnswer && (
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowModelAnswer(!showModelAnswer)}
            className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100 text-left flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Review Model Reference Answer</span>
            </div>
            {showModelAnswer ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
          {showModelAnswer && (
            <div className="p-4 bg-white border-t border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p className="font-sans">{evaluation.modelAnswer}</p>
            </div>
          )}
        </div>
      )}

      {/* Continue / Next Question Button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onNextQuestion}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-md hover:from-blue-700 hover:to-purple-700 transition-all group"
        >
          <span>{isLastQuestion ? 'View Final Results' : 'Proceed to Next Question'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}
