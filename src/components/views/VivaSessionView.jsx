import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  SkipForward, 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  Info
} from 'lucide-react';
import ProgressBar from '../common/ProgressBar';
import FeedbackCard from './FeedbackCard';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export default function VivaSessionView({
  questions = [],
  currentIndex = 0,
  onAnswerSubmit,
  onNextQuestion,
  onSkipQuestion,
  onEndSessionEarly,
  isEvaluating = false,
  currentEvaluation = null,
  topicInfo = {},
}) {
  const currentQuestion = questions[currentIndex] || {};
  const [studentText, setStudentText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showExaminerTip, setShowExaminerTip] = useState(false);
  const [isReadingQuestion, setIsReadingQuestion] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Timer for exam duration
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Sync spoken transcript directly to studentText
  const handleTranscriptUpdate = useCallback((newText) => {
    setStudentText(newText);
    setValidationError('');
  }, []);

  // Web Speech Recognition
  const {
    isListening,
    setTranscript,
    interimTranscript,
    isSupported: isSpeechSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    onTranscriptChange: handleTranscriptUpdate,
  });

  // When changing questions, reset input and speech state
  const prevIndexRef = React.useRef(currentIndex);
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      prevIndexRef.current = currentIndex;
      setStudentText('');
      resetTranscript();
      setValidationError('');
      setShowExaminerTip(false);
      stopListening();
    }
  }, [currentIndex, resetTranscript, stopListening]);

  // Toggle microphone recording
  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setValidationError('');
      startListening();
    }
  };

  // Text-to-Speech: Read question aloud
  const handleReadQuestion = () => {
    if (!('speechSynthesis' in window)) return;

    if (isReadingQuestion) {
      window.speechSynthesis.cancel();
      setIsReadingQuestion(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsReadingQuestion(false);
    utterance.onerror = () => setIsReadingQuestion(false);

    setIsReadingQuestion(true);
    window.speechSynthesis.speak(utterance);
  };

  // Submit Answer validation & trigger
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isListening) {
      stopListening();
    }

    const trimmed = studentText.trim();
    if (!trimmed) {
      setValidationError('Please speak or type your answer before submitting.');
      return;
    }
    if (trimmed.length < 10) {
      setValidationError('Your answer is quite short. Please provide a more complete explanation.');
      return;
    }

    setValidationError('');
    onAnswerSubmit(trimmed);
  };

  // Hackathon convenience: Auto-fill sample answer for fast demoing
  const handlePasteDemoAnswer = () => {
    if (currentQuestion.sampleAnswer) {
      // Intentionally provide a realistic student answer to showcase concept gap analysis
      const partialAnswer = currentQuestion.sampleAnswer.slice(0, 160) + '...';
      setStudentText(partialAnswer);
      setTranscript(partialAnswer);
      setValidationError('');
    }
  };

  const wordCount = studentText.trim() ? studentText.trim().split(/\s+/).length : 0;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Session Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Topic & Difficulty */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
            Q{currentIndex + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">{topicInfo.topic}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {topicInfo.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-500">{topicInfo.subject}</p>
          </div>
        </div>

        {/* Right: Progress & Timer */}
        <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
          <div className="w-36 sm:w-44">
            <ProgressBar current={currentIndex + 1} total={questions.length} />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>{formatTimer(sessionSeconds)}</span>
          </div>

          <button
            onClick={onEndSessionEarly}
            className="text-xs text-slate-500 hover:text-rose-600 transition-colors font-medium underline"
          >
            End
          </button>
        </div>

      </div>

      {/* Main Examiner Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-100 p-6 sm:p-8 space-y-4">
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Viva Question {currentIndex + 1} of {questions.length}
          </span>

          {/* Audio read-aloud button */}
          <button
            type="button"
            onClick={handleReadQuestion}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100/70 px-3 py-1.5 rounded-xl transition-all"
            title="Listen to question spoken aloud"
          >
            {isReadingQuestion ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-indigo-700 animate-pulse" />
                <span>Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Listen Question</span>
              </>
            )}
          </button>
        </div>

        {/* The Question Text */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
          {currentQuestion.question}
        </h2>

        {/* Examiner context hint */}
        {currentQuestion.context && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowExaminerTip(!showExaminerTip)}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showExaminerTip ? 'Hide examiner objective' : 'Examiner objective hint'}</span>
            </button>
            {showExaminerTip && (
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 italic">
                {currentQuestion.context}
              </p>
            )}
          </div>
        )}

      </div>

      {/* If evaluation is ready for this question, render FeedbackCard */}
      {currentEvaluation ? (
        <FeedbackCard
          evaluation={currentEvaluation}
          isLastQuestion={isLastQuestion}
          onNextQuestion={onNextQuestion}
        />
      ) : (
        /* Otherwise, render the active Input Form (Voice + Text fallback) */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-100 p-6 sm:p-8 space-y-6">
          
          {/* Microphone Recording Section */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-slate-50 to-indigo-50/30 border border-slate-200 text-center relative overflow-hidden">
            
            {/* Visual soundwave effect while recording */}
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-48 h-48 rounded-full bg-purple-500 animate-ping" />
              </div>
            )}

            {/* Mic Button */}
            <div className="relative mb-3">
              <button
                type="button"
                onClick={handleToggleListening}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  isListening
                    ? 'bg-rose-600 text-white animate-voice-pulse shadow-rose-200'
                    : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white hover:scale-105 shadow-indigo-200'
                }`}
                title={isListening ? 'Click to stop recording' : 'Click to start speaking'}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>

            {/* Status text */}
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                {isListening ? (
                  <span className="text-rose-600 flex items-center justify-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                    Listening... Speak your answer now
                  </span>
                ) : (
                  <span>Click Microphone to Speak Your Answer</span>
                )}
              </h4>
              <p className="text-xs text-slate-500">
                {isSpeechSupported
                  ? 'Powered by browser Web Speech API. You can also edit or type below.'
                  : 'Speech recognition is not active in this browser. Please use the text field below.'}
              </p>
            </div>

            {/* Live interim transcript preview while speaking */}
            {isListening && interimTranscript && (
              <div className="mt-3 px-4 py-2 bg-white/90 border border-purple-200 rounded-xl text-xs font-mono text-purple-900 max-w-lg">
                🎙️ "{interimTranscript}"
              </div>
            )}

          </div>

          {/* Speech Error Banner if permission denied or unsupported */}
          {speechError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{speechError}</span>
            </div>
          )}

          {/* Text-Answer Fallback Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <label htmlFor="answer-textarea" className="flex items-center gap-1.5">
                <span>Your Answer (Spoken transcript or typed response):</span>
              </label>

              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-normal">
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </span>
                
                {/* Clear text */}
                {studentText && (
                  <button
                    type="button"
                    onClick={() => {
                      setStudentText('');
                      resetTranscript();
                    }}
                    className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}

                {/* Demo autofill helper */}
                <button
                  type="button"
                  onClick={handlePasteDemoAnswer}
                  className="text-indigo-600 hover:text-indigo-800 font-medium hidden sm:flex items-center gap-1"
                  title="Fills a sample student answer for quick testing"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Insert Sample Answer</span>
                </button>
              </div>
            </div>

            <textarea
              id="answer-textarea"
              rows={5}
              value={studentText}
              onChange={(e) => {
                setStudentText(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="Your answer will appear here as you speak into the microphone, or you can type directly..."
              className="w-full p-4 rounded-2xl border border-slate-200 text-slate-800 text-sm leading-relaxed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all bg-slate-50/50"
            />
          </div>

          {/* Validation error notice */}
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Action Buttons: Submit & Skip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            
            <button
              type="button"
              onClick={onSkipQuestion}
              disabled={isEvaluating}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Skip Question</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isEvaluating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-md shadow-indigo-100 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isEvaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Answer...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

          </div>

        </div>
      )}

    </div>
  );
}
