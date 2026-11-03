// Hook for AI Examiner Voice Synthesis with Language and Persona Support
import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      };
    }
  }, []);

  const speak = useCallback(({ text, language = 'English', persona = 'Friendly Professor', onStart, onEnd }) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Select voice based on language and persona
      const currentVoices = window.speechSynthesis.getVoices() || voices;
      let matchedVoice = null;

      if (language === 'Hindi') {
        utterance.lang = 'hi-IN';
        matchedVoice = currentVoices.find((v) => v.lang === 'hi-IN' || v.lang.startsWith('hi')) 
          || currentVoices.find((v) => v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('kalpana') || v.name.toLowerCase().includes('hemant'))
          || null;
      } else {
        utterance.lang = 'en-US';
        // Find natural English voice (Google US English, Samantha, Daniel, Natural, etc.)
        matchedVoice = currentVoices.find((v) => 
          v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
        ) || currentVoices.find((v) => v.lang.startsWith('en')) || null;
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      // Persona Pitch & Rate calibration
      if (persona === 'Strict Examiner') {
        utterance.rate = 1.0;
        utterance.pitch = 0.95;
      } else if (persona === 'Technical Interviewer') {
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
      } else {
        // Friendly Professor
        utterance.rate = 0.96;
        utterance.pitch = 1.05;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (onStart) onStart();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Failed to speak with synthesis:', e);
      setIsSpeaking(false);
      if (onEnd) onEnd();
    }
  }, [voices]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
  };
}
