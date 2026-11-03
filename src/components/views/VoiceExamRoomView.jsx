import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Send, 
  RotateCcw, 
  HelpCircle, 
  Lightbulb, 
  SkipForward, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Award,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';
import AIExaminerOrb from '../common/AIExaminerOrb';
import VoiceWaveform from '../common/VoiceWaveform';
import ConversationTranscript from '../common/ConversationTranscript';
import ProgressBar from '../common/ProgressBar';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { requestAIHint, requestClarification } from '../../services/vivaService';

export default function VoiceExamRoomView({
  config = {},
  currentQuestion = {},
  questionIndex = 1,
  totalQuestions = 3,
  conversationHistory = [],
  onSubmitTurn,
  onEndSessionEarly,
  onSkipQuestion,
  isProcessing = false,
  latestTurnResult = null,
  onProceedToNextQuestion,
}) {
  const [studentText, setStudentText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [clarificationMessage, setClarificationMessage] = useState('');
  const [isRequestingHelp, setIsRequestingHelp] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // TTS Hook
  const { isSpeaking, speak, stop: stopSpeaking } = useSpeechSynthesis();

  // STT Hook
  const handleTranscriptUpdate = useCallback((newText) => {
    setStudentText(newText);
    setValidationError('');
  }, []);

  const {
    isListening,
    interimTranscript,
    isSupported: isSpeechSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    onTranscriptChange: handleTranscriptUpdate,
    language: config.language || 'English',
  });

  // Automatically speak the new question when it changes (if Voice Mode active)
  const prevQuestionKey = useRef(null);
  const currentKey = currentQuestion?.id || currentQuestion?.question || currentQuestion?.questionNumber;

  useEffect(() => {
    if (currentQuestion && currentQuestion.question && prevQuestionKey.current !== currentKey) {
      prevQuestionKey.current = currentKey;
      setStudentText('');
      resetTranscript();
      setHintMessage('');
      setClarificationMessage('');
      setValidationError('');
      stopListening();

      // Speak question automatically in Voice Mode
      if (config.examMode === 'voice') {
        const timer = setTimeout(() => {
          speak({
            text: currentQuestion.question,
            language: config.language,
            persona: config.persona,
          });
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [currentKey, currentQuestion, config, speak, resetTranscript, stopListening]);

  // When latest turn result arrives, speak examiner reaction!
  useEffect(() => {
    if (latestTurnResult && latestTurnResult.examinerReaction && config.examMode === 'voice') {
      speak({
        text: latestTurnResult.examinerReaction,
        language: config.language,
        persona: config.persona,
      });
    }
  }, [latestTurnResult, config, speak]);

  // Determine current orb state
  let orbState = 'idle';
  if (isSpeaking) orbState = 'speaking';
  else if (isListening) orbState = 'listening';
  else if (isProcessing) orbState = 'thinking';

  // Toggle microphone
  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking(); // stop AI voice if student starts speaking
      setValidationError('');
      startListening();
    }
  };

  // Replay current question voice
  const handleRepeatQuestion = () => {
    if (currentQuestion?.question) {
      speak({
        text: currentQuestion.question,
        language: config.language,
        persona: config.persona,
      });
    }
  };

  // Request subtle AI hint
  const handleRequestHint = async () => {
    if (hintMessage) return;
    setIsRequestingHelp(true);
    const res = await requestAIHint({
      question: currentQuestion.question,
      topic: config.topic,
    });
    setHintMessage(res.hint);
    setIsRequestingHelp(false);
  };

  // Request clarification / simpler rephrase
  const handleRequestClarification = async () => {
    if (clarificationMessage) return;
    setIsRequestingHelp(true);
    const res = await requestClarification({
      question: currentQuestion.question,
      topic: config.topic,
      language: config.language,
    });
    setClarificationMessage(res.clarification);
    setIsRequestingHelp(false);
  };

  // Submit Answer (with duplicate submission prevention)
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isProcessing) return; // Prevent duplicate rapid clicks
    if (isListening) stopListening();
    stopSpeaking();

    const trimmed = studentText.trim();
    if (!trimmed) {
      setValidationError('Please speak or type your answer before submitting.');
      return;
    }
    if (trimmed.length < 8) {
      setValidationError('Your answer is too brief for an oral viva. Please elaborate.');
      return;
    }

    setValidationError('');
    onSubmitTurn(trimmed);
  };

  // Hackathon quick test filler
  const handleInsertDemoResponse = () => {
    if (currentQuestion.modelAnswer) {
      const demoAnswer = currentQuestion.modelAnswer.slice(0, 180) + '...';
      setStudentText(demoAnswer);
      resetTranscript();
      setValidationError('');
    }
  };

  const wordCount = studentText.trim() ? studentText.trim().split(/\s+/).length : 0;
  const isFinalQuestion = questionIndex >= totalQuestions;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* 1. Session Status Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Topic & Persona */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center font-bold text-sky-400 font-mono text-sm">
            Q{questionIndex}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{config.topic}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {config.persona}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                {config.language}
              </span>
            </div>
            <p className="text-xs text-slate-400">{config.subject} • {config.difficulty}</p>
          </div>
        </div>

        {/* Right: Progress, Timer, End Button */}
        <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end">
          <div className="w-32 sm:w-40">
            <ProgressBar current={questionIndex} total={totalQuestions} />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTimer(sessionSeconds)}</span>
          </div>

          <button
            onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Transcript</span>
          </button>

          <button
            onClick={onEndSessionEarly}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline"
          >
            End
          </button>
        </div>

      </div>

      {/* 2. Main AI Examiner Stage */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-6 relative overflow-hidden">
        
        {/* Animated AI Examiner Orb in Center */}
        <div className="flex flex-col items-center justify-center py-2">
          <AIExaminerOrb 
            state={orbState} 
            persona={config.persona} 
            size="lg" 
          />

          {/* Equalizer Audio Waves when speaking or listening */}
          <div className="mt-2 h-10 flex items-center justify-center">
            <VoiceWaveform 
              isActive={isSpeaking || isListening} 
              color={isSpeaking ? 'cyan' : isListening ? 'emerald' : 'purple'} 
              barCount={22}
            />
          </div>
        </div>

        {/* The Spoken Question Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#090f1e] border border-indigo-500/30 shadow-lg space-y-3">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-800">
              Question {questionIndex} of {totalQuestions}
            </span>

            {/* Audio Voice Repeat Action */}
            <button
              onClick={handleRepeatQuestion}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-white bg-sky-950/70 hover:bg-sky-900/70 px-3 py-1.5 rounded-xl border border-sky-800/60 transition-all"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeaking ? 'Re-speaking...' : 'Repeat Question'}</span>
            </button>
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-white leading-relaxed">
            {currentQuestion.question || 'Examiner is preparing question...'}
          </h2>

          {/* Assistant Action Buttons: AI Hint & Clarify */}
          <div className="pt-2 flex flex-wrap gap-2 items-center">
            <button
              onClick={handleRequestHint}
              disabled={isRequestingHelp || Boolean(hintMessage)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/60 text-purple-300 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{hintMessage ? 'Hint Provided' : 'Ask for AI Hint'}</span>
            </button>

            <button
              onClick={handleRequestClarification}
              disabled={isRequestingHelp || Boolean(clarificationMessage)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/60 text-indigo-300 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>{clarificationMessage ? 'Clarified' : 'Clarify / Rephrase Question'}</span>
            </button>
          </div>

          {/* AI Hint Drawer */}
          {hintMessage && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-300">Examiner Hint: </strong>
                <span>{hintMessage}</span>
              </div>
            </div>
          )}

          {/* Clarification Drawer */}
          {clarificationMessage && (
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-indigo-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-indigo-300">Rephrased for Clarity: </strong>
                <span>{clarificationMessage}</span>
              </div>
            </div>
          )}

        </div>

        {/* 3. If Turn Result Ready: Display Instant Evaluation & Follow-Up prompt */}
        {latestTurnResult ? (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Turn Evaluation Card */}
            <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-900/50">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Turn Assessment Result
                  </span>
                  <h4 className="text-base font-extrabold text-white mt-0.5">
                    {latestTurnResult.evaluation?.correctness || 'Answer Evaluated'}
                  </h4>
                </div>

                <div className="flex items-center gap-2.5 bg-indigo-900/50 px-4 py-2 rounded-2xl border border-indigo-500/40">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-xl font-black text-white">
                    {latestTurnResult.evaluation?.score || 0}
                    <span className="text-xs font-semibold text-slate-400"> / 10</span>
                  </span>
                </div>
              </div>

              {/* Spoken Reaction from Examiner */}
              {latestTurnResult.examinerReaction && (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    Examiner Reaction:
                  </span>
                  <p className="text-slate-200 leading-relaxed font-medium">
                    "{latestTurnResult.examinerReaction}"
                  </p>
                </div>
              )}

              {/* Covered & Missing Concepts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-1.5">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Concepts Covered ({latestTurnResult.evaluation?.conceptsCovered?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {latestTurnResult.evaluation?.conceptsCovered?.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 text-[11px]">
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 space-y-1.5">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Missing Concepts ({latestTurnResult.evaluation?.missingConcepts?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {latestTurnResult.evaluation?.missingConcepts?.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 text-[11px]">
                        ⚠️ {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Improvement Tip */}
              {latestTurnResult.evaluation?.improvementTips?.length > 0 && (
                <div className="text-xs text-slate-300 space-y-1 pt-1">
                  <strong className="text-purple-300 font-bold block">💡 Examiner Advice:</strong>
                  <p>{latestTurnResult.evaluation.improvementTips[0]}</p>
                </div>
              )}

            </div>

            {/* Next Question / Final Report Action */}
            <div className="flex justify-end pt-2">
              <button
                onClick={onProceedToNextQuestion}
                disabled={isProcessing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-600 to-purple-600 text-white font-black text-sm shadow-xl shadow-indigo-600/30 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Synthesizing Final AI Evaluation Report...</span>
                  </>
                ) : (
                  <>
                    <span>{isFinalQuestion ? 'View Final AI Performance Report' : 'Proceed to Next Adaptive Question'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        ) : (
          /* 4. Active Answer Input Area (Microphone + Textarea Fallback) */
          <div className="space-y-5 pt-2">
            
            {/* Microphone Button & Status */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/80 to-indigo-950/30 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              
              <button
                type="button"
                onClick={handleToggleListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                  isListening
                    ? 'bg-rose-600 text-white animate-voice-pulse shadow-rose-600/50 scale-105'
                    : 'bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white hover:scale-105 shadow-indigo-600/40'
                }`}
                title={isListening ? 'Click to stop recording' : 'Click to speak answer'}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              <div className="space-y-1">
                <span className="text-sm font-bold text-white block">
                  {isListening ? (
                    <span className="text-rose-400 flex items-center justify-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      Listening to your oral defense... Speak now
                    </span>
                  ) : (
                    <span>Click Microphone to Speak Your Answer</span>
                  )}
                </span>
                <p className="text-xs text-slate-400">
                  {isSpeechSupported
                    ? `Speech recognition ready (${config.language}). Transcript will appear below.`
                    : 'Web Speech not active. Please type your answer in the fallback field below.'}
                </p>
              </div>

              {/* Live interim text preview */}
              {isListening && interimTranscript && (
                <div className="px-4 py-2 bg-indigo-950/90 border border-cyan-500/40 rounded-xl text-xs font-mono text-cyan-300 max-w-lg">
                  🎙️ "{interimTranscript}"
                </div>
              )}
            </div>

            {/* Speech Notice or Permission Error */}
            {speechError && (
              <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{speechError}</span>
              </div>
            )}

            {/* Textarea Fallback for Typing & Transcript Editing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <label htmlFor="answer-input">
                  Your Answer (Speech Transcript or Typed Response):
                </label>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono">
                    {wordCount} words
                  </span>

                  {studentText && (
                    <button
                      type="button"
                      onClick={() => {
                        setStudentText('');
                        resetTranscript();
                      }}
                      className="text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleInsertDemoResponse}
                    className="text-sky-400 hover:text-sky-300 hidden sm:flex items-center gap-1"
                    title="Insert sample student answer for quick testing"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Insert Sample Answer</span>
                  </button>
                </div>
              </div>

              <textarea
                id="answer-input"
                rows={4}
                value={studentText}
                onFocus={() => {
                  if (isSpeaking) stopSpeaking();
                }}
                onChange={(e) => {
                  if (isSpeaking) stopSpeaking();
                  setStudentText(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Speak into the microphone or type your technical response here..."
                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500 leading-relaxed"
              />
            </div>

            {/* Validation Notice */}
            {validationError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Submission Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onSkipQuestion}
                disabled={isProcessing}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip Question</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-600 to-purple-600 text-white font-black text-sm shadow-xl shadow-indigo-600/30 hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Gemini AI is Evaluating Answer...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Answer</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>

      {/* 4. Slide-over / Modal Conversation Transcript Drawer */}
      {showTranscriptDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#090f1e] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Full Examination Transcript</h3>
              </div>
              <button
                onClick={() => setShowTranscriptDrawer(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ConversationTranscript 
              history={conversationHistory} 
              currentQuestion={currentQuestion} 
              onReplayAudio={(text) => speak({ text, language: config.language, persona: config.persona })}
            />
          </div>
        </div>
      )}

    </div>
  );
}
