// Enhanced Web Speech Recognition Hook with Multi-Language (EN & HI) support
import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition({ onTranscriptChange, language = 'English' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  const [isSupported] = useState(() =>
    typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  );

  const [error, setError] = useState(() => {
    if (typeof window !== 'undefined' && !(window.SpeechRecognition || window.webkitSpeechRecognition)) {
      return 'Speech recognition is not supported in this browser. Use Chrome/Edge or type directly.';
    }
    return null;
  });

  const recognitionRef = useRef(null);
  const onTranscriptChangeRef = useRef(onTranscriptChange);

  useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange;
  }, [onTranscriptChange]);

  // Map language choice to speech code
  const getLangCode = (lang) => {
    if (lang === 'Hindi') return 'hi-IN';
    return 'en-US';
  };

  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getLangCode(language);

    recognition.onstart = () => {
      // Silence any ongoing speech synthesis immediately when student mic activates
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          currentFinal += item[0].transcript + ' ';
        } else {
          currentInterim += item[0].transcript;
        }
      }

      if (currentFinal) {
        setTranscript((prev) => {
          const updated = (prev ? prev.trim() + ' ' : '') + currentFinal.trim();
          if (onTranscriptChangeRef.current) {
            onTranscriptChangeRef.current(updated);
          }
          return updated;
        });
      }
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('Microphone permission was denied. Please click the lock or camera/mic icon in your browser address bar to allow mic access, or type your answer below.');
      } else if (event.error === 'no-speech') {
        // Soft notice, don't break session
      } else if (event.error === 'network') {
        setError('Network issue with speech recognition. Please type your answer or retry.');
      } else {
        setError(`Speech note: ${event.error}. You can type your answer.`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [language]);

  const startListening = useCallback(() => {
    setError(null);
    if (!recognitionRef.current) {
      setError('Speech recognition not available. Please use Google Chrome or type your answer.');
      return;
    }
    try {
      recognitionRef.current.lang = getLangCode(language);
      recognitionRef.current.start();
    } catch {
      // recognition may already be running
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    setTranscript,
    interimTranscript,
    isSupported,
    error,
    setError,
    startListening,
    stopListening,
    resetTranscript,
  };
}
