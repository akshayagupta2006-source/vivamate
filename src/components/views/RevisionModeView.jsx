import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowRight, 
  Volume2, 
  ArrowLeft,
  Mic,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Globe,
  RotateCcw
} from 'lucide-react';
import { fetchRevisionQuestions, evaluateRevisionAnswer } from '../../services/vivaService';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export default function RevisionModeView({ 
  weakConcepts = [], 
  subject = 'Computer Science', 
  language = 'English',
  onBackToDashboard,
  onStartFullViva
}) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [examinerReaction, setExaminerReaction] = useState('');
  const [validationError, setValidationError] = useState('');
  const [selectedLanguageOverride, setSelectedLanguageOverride] = useState(null);
  const [revisionScores, setRevisionScores] = useState({});

  const speechLanguage = selectedLanguageOverride || language || 'English';

  const { speak, stop: stopSpeaking } = useSpeechSynthesis();

  // Sync spoken transcript directly to userAnswer and allow live editing
  const handleTranscriptChange = useCallback((liveTranscript) => {
    setUserAnswer(liveTranscript);
    setValidationError('');
  }, []);

  // Web Speech Recognition
  const {
    isListening,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    language: speechLanguage,
    onTranscriptChange: handleTranscriptChange,
  });

  // Load revision questions on mount
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await fetchRevisionQuestions({ weakConcepts, subject });
      setQuestions(res.questions || []);
      setIsLoading(false);
    }
    load();
  }, [weakConcepts, subject]);

  // Stop recognition when unmounting
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  const currentQ = questions[currentIndex];

  const handleSpeak = () => {
    if (currentQ?.question) {
      stopListening();
      speak({ text: currentQ.question, language: speechLanguage });
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      setValidationError('');
      startListening();
    }
  };

  // Submit spoken or typed response for semantic evaluation
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      setValidationError('Please speak or type an answer before submitting for evaluation.');
      return;
    }

    stopListening();
    stopSpeaking();
    setIsEvaluating(true);
    setValidationError('');

    try {
      const res = await evaluateRevisionAnswer({
        subject,
        topic: currentQ?.topic,
        currentQuestion: currentQ,
        studentAnswer: userAnswer.trim(),
        language: speechLanguage,
      });

      setEvaluationResult(res.evaluation);
      setExaminerReaction(res.examinerReaction || '');
      setShowAnswer(true);

      if (res.evaluation?.score !== undefined) {
        setRevisionScores((prev) => ({
          ...prev,
          [currentIndex]: res.evaluation.score,
        }));
      }

      if (res.examinerReaction) {
        speak({
          text: res.examinerReaction,
          language: speechLanguage,
        });
      }
    } catch (err) {
      console.error('Revision evaluation failed:', err);
      setValidationError('Could not evaluate answer automatically. You can check the reference answer below.');
      setShowAnswer(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    stopListening();
    stopSpeaking();
    setShowAnswer(false);
    setEvaluationResult(null);
    setExaminerReaction('');
    setUserAnswer('');
    resetTranscript();
    setValidationError('');

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onBackToDashboard();
    }
  };

  const handleExit = () => {
    stopListening();
    stopSpeaking();
    onBackToDashboard();
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-12 h-12 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Synthesizing targeted flash revision questions from your weak topics...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h3 className="text-lg font-bold text-white">No Weak Topics Recorded</h3>
        <p className="text-xs text-slate-400">Complete an oral viva exam first to diagnose targeted weak concepts.</p>
        <button
          onClick={onStartFullViva}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
        >
          Start a Full Viva Exam
        </button>
      </div>
    );
  }

  // Calculate overall completed progress
  const completedCount = Object.keys(revisionScores).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={handleExit}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Revision</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800">
            Concept {currentIndex + 1} of {questions.length}
          </div>
          {completedCount > 0 && (
            <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{completedCount} Evaluated</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Flashcard */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-6">
        
        {/* Topic Tag & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-800">
            Target Weak Topic: {currentQ?.topic}
          </span>

          <div className="flex items-center gap-3">
            {/* Language indicator & switcher */}
            <button
              type="button"
              onClick={() => {
                const nextLang = speechLanguage === 'English' ? 'Hindi' : 'English';
                setSelectedLanguageOverride(nextLang);
                if (isListening) stopListening();
              }}
              title="Toggle speech recognition language"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
            >
              <Globe className="w-3 h-3 text-indigo-400" />
              <span>{speechLanguage === 'Hindi' ? '🇮🇳 Hindi (hi-IN)' : '🌐 English (en-US)'}</span>
            </button>

            <button
              onClick={handleSpeak}
              className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen</span>
            </button>
          </div>
        </div>

        {/* Question Text */}
        <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
          {currentQ?.question}
        </h2>

        {/* Spoken/Typed Answer Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>Your Answer (Speak or Type):</span>
            </label>

            <span className="text-[11px] text-slate-400">
              {userAnswer.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          {/* Text Area with Embedded Microphone Button */}
          <div className="relative">
            <textarea
              rows={4}
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                setValidationError('');
              }}
              placeholder={
                isListening
                  ? speechLanguage === 'Hindi'
                    ? 'सुन रहा हूँ... बोलिए (Listening in Hindi)...'
                    : 'Listening... Speak your answer clearly into your microphone...'
                  : 'Speak into your microphone or type your explanation here...'
              }
              className={`w-full p-4 pr-14 bg-slate-900 border rounded-2xl text-white text-sm focus:outline-none focus:ring-2 transition-all leading-relaxed ${
                isListening
                  ? 'border-rose-500/80 ring-2 ring-rose-500/30'
                  : 'border-slate-700 focus:ring-indigo-500'
              }`}
            />

            {/* Microphone Button Beside Text Input */}
            <div className="absolute right-3 top-3 flex items-center">
              <button
                type="button"
                onClick={handleToggleListening}
                disabled={!isSupported || isEvaluating}
                title={
                  !isSupported
                    ? 'Speech recognition is not supported in this browser'
                    : isListening
                    ? 'Click to stop listening'
                    : `Click to speak your answer in ${speechLanguage}`
                }
                className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40 ring-2 ring-rose-400'
                    : isSupported
                    ? 'bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 hover:border-sky-500/50 shadow-md'
                    : 'bg-slate-800/40 text-slate-500 cursor-not-allowed border border-slate-800'
                }`}
              >
                <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce' : ''}`} />
              </button>
            </div>
          </div>

          {/* 1. Listening State Indicator */}
          {isListening && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-semibold">
                  Listening ({speechLanguage})... Speak now, text appears live above.
                </span>
              </div>
              <button
                type="button"
                onClick={stopListening}
                className="text-[11px] underline text-rose-400 hover:text-white font-bold"
              >
                Stop Mic
              </button>
            </div>
          )}

          {/* 2. Permission Denied State Indicator */}
          {speechError && (
            <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-800/70 text-xs text-amber-200 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Microphone Notice</span>
                <p className="text-amber-300/90 leading-relaxed">{speechError}</p>
              </div>
            </div>
          )}

          {/* 3. Unsupported Browser State Indicator */}
          {!isSupported && (
            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 text-xs text-slate-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-white">Browser Voice Support</span>
                <p className="text-slate-400">
                  Web Speech Recognition is not supported by your current browser. You can still type your answers directly, or use Google Chrome or Microsoft Edge for voice support.
                </p>
              </div>
            </div>
          )}

          {/* Validation Error */}
          {validationError && (
            <p className="text-xs font-semibold text-rose-400 animate-fadeIn">
              {validationError}
            </p>
          )}

          {/* Action Row: Submit for AI Evaluation or Reveal Answer */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleSubmitAnswer}
              disabled={isEvaluating}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                isEvaluating
                  ? 'bg-indigo-600/50 text-indigo-200 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25'
              }`}
            >
              {isEvaluating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Spoken Response...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Answer for AI Evaluation</span>
                </>
              )}
            </button>

            {!showAnswer && (
              <button
                onClick={() => {
                  stopListening();
                  setShowAnswer(true);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Reveal Model Solution Directly
              </button>
            )}

            {userAnswer && !isEvaluating && (
              <button
                onClick={() => {
                  setUserAnswer('');
                  resetTranscript();
                  setValidationError('');
                }}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Input</span>
              </button>
            )}
          </div>
        </div>

        {/* Semantic Evaluation Feedback Card */}
        {evaluationResult && (
          <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  AI Revision Evaluation
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  evaluationResult.score >= 7.5
                    ? 'text-emerald-300 bg-emerald-950/80 border-emerald-800'
                    : evaluationResult.score >= 5.0
                    ? 'text-amber-300 bg-amber-950/80 border-amber-800'
                    : 'text-rose-300 bg-rose-950/80 border-rose-800'
                }`}>
                  Score: {evaluationResult.score} / 10
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  ({evaluationResult.correctness})
                </span>
              </div>
            </div>

            {/* Spoken Reaction */}
            {examinerReaction && (
              <p className="text-xs sm:text-sm text-indigo-200 italic bg-indigo-900/30 p-3 rounded-xl border border-indigo-500/20">
                "{examinerReaction}"
              </p>
            )}

            {/* Covered & Missing Concepts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-1">Concepts Covered</span>
                {evaluationResult.conceptsCovered?.length > 0 ? (
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {evaluationResult.conceptsCovered.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-slate-500 italic">None detected</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-bold text-amber-400 block mb-1">Key Points to Reinforce</span>
                {evaluationResult.missingConcepts?.length > 0 ? (
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {evaluationResult.missingConcepts.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-emerald-400">All core concepts articulated!</span>
                )}
              </div>
            </div>

            {/* Feedback Tips */}
            {evaluationResult.improvementTips?.length > 0 && (
              <div className="text-xs text-slate-300 space-y-1">
                <span className="font-bold text-indigo-400">Examiner Advice:</span>
                <p className="text-slate-300 leading-relaxed">
                  {evaluationResult.improvementTips.join(' ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Model Answer Reveal */}
        {showAnswer && (
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2 animate-fadeIn">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Reference Model Solution
            </span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              {currentQ?.modelAnswer}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400">
            {currentIndex + 1} of {questions.length} completed
          </span>

          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all"
          >
            <span>{currentIndex < questions.length - 1 ? 'Next Revision Concept' : 'Finish Revision & Return'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
