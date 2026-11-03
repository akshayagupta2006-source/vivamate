import React from 'react';
import { Volume2, User, Bot, Sparkles } from 'lucide-react';

export default function ConversationTranscript({ 
  history = [], 
  currentQuestion = null, 
  onReplayAudio 
}) {
  if (history.length === 0 && !currentQuestion) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        No viva dialogue recorded yet. Start speaking to populate the real-time transcript.
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
      {history.map((turn, idx) => (
        <div key={idx} className="space-y-2.5 pb-3 border-b border-slate-800/80">
          
          {/* Turn Header */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Turn {idx + 1}</span>
            {turn.evaluation && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono">
                Score: {turn.evaluation.score}/10
              </span>
            )}
          </div>

          {/* Examiner Question Message */}
          <div className="flex items-start gap-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-300">AI Examiner</span>
                {onReplayAudio && (
                  <button
                    onClick={() => onReplayAudio(turn.question?.question || turn.question)}
                    className="text-slate-400 hover:text-indigo-300 transition-colors"
                    title="Replay audio"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {turn.question?.question || turn.question}
              </p>
            </div>
          </div>

          {/* Student Spoken Answer */}
          {turn.studentAnswer && (
            <div className="flex items-start gap-2.5 bg-indigo-950/40 border border-indigo-900/50 rounded-2xl p-3 ml-4">
              <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-[11px] font-bold text-purple-300 block">Your Spoken Answer</span>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{turn.studentAnswer}"
                </p>
              </div>
            </div>
          )}

          {/* Examiner Reaction & Concept Notes if available */}
          {turn.examinerReaction && (
            <div className="ml-4 pl-3 border-l-2 border-indigo-500/50 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>Reaction: {turn.examinerReaction}</span>
              </div>
            </div>
          )}

        </div>
      ))}

      {/* Current Active Question if waiting for student answer */}
      {currentQuestion && (
        <div className="flex items-start gap-2.5 bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-3 shadow-lg shadow-indigo-950/50 animate-pulse">
          <div className="w-6 h-6 rounded-lg bg-indigo-600/40 border border-indigo-400 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-bold text-indigo-300">AI Examiner (Current Question)</span>
            <p className="text-xs text-slate-100 font-semibold leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
