// VivaMate Unified Frontend AI Service
// Connects to Express backend & Gemini AI, with custom API key support and seamless offline fallback.

import { MOCK_QUESTIONS_DATABASE, generateCustomMockQuestions } from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Retrieve custom API key saved in localStorage by user/judge
export function getSavedApiKey() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('vivamate_gemini_key') || '';
  }
  return '';
}

export function saveApiKey(key) {
  if (typeof window !== 'undefined') {
    if (key) {
      localStorage.setItem('vivamate_gemini_key', key.trim());
    } else {
      localStorage.removeItem('vivamate_gemini_key');
    }
  }
}

// Common headers including optional client key
function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const customKey = getSavedApiKey();
  if (customKey) {
    headers['x-gemini-api-key'] = customKey;
  }
  return headers;
}

/**
 * Health & configuration check
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`, { headers: getHeaders() });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend health check error:', err);
  }
  return {
    status: 'standalone',
    service: 'VivaMate Standalone',
    geminiConfigured: false,
    mode: 'Smart Rubric Demo Mode',
  };
}

/**
 * Start viva session and obtain first question
 */
export async function startVivaSession(config) {
  try {
    const res = await fetch(`${BASE_URL}/api/viva/start`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(config),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend start viva failed, using local rubric fallback:', err);
  }

  // Local fallback
  const normalized = (config.topic || '').toLowerCase();
  let matched = null;
  if (normalized.includes('deadlock') || normalized.includes('banker')) matched = MOCK_QUESTIONS_DATABASE['os-deadlocks'];
  else if (normalized.includes('acid') || normalized.includes('transaction')) matched = MOCK_QUESTIONS_DATABASE['dbms-acid'];
  else if (normalized.includes('handshake') || normalized.includes('tcp')) matched = MOCK_QUESTIONS_DATABASE['cn-tcp'];
  else if (normalized.includes('tree') || normalized.includes('avl')) matched = MOCK_QUESTIONS_DATABASE['dsa-trees'];

  const pool = (matched && matched.length > 0) ? matched : generateCustomMockQuestions(config.subject, config.topic, 4);
  const firstQ = pool[Math.floor(Math.random() * pool.length)] || pool[0];
  return {
    source: 'smart-rubric-demo',
    isLiveAI: false,
    disclaimer: 'Curated Rubric Mode — Connect Gemini API key for live AI.',
    question: {
      ...firstQ,
      questionNumber: 1,
    },
  };
}

/**
 * Process viva turn: evaluate answer, get examiner reaction & adaptive follow-up
 */
export async function submitVivaTurn(turnPayload) {
  try {
    const res = await fetch(`${BASE_URL}/api/viva/turn`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(turnPayload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend submit turn failed, using local rubric evaluation:', err);
  }

  // Local rubric fallback
  const { currentQuestion, studentAnswer, questionIndex, totalQuestions, topic, subject } = turnPayload;
  const cleanAnswer = (studentAnswer || '').toLowerCase();
  const words = cleanAnswer.split(/\s+/).filter(Boolean);
  const keyConcepts = currentQuestion.keyConcepts || [];

  const conceptsCovered = [];
  const missingConcepts = [];

  keyConcepts.forEach((concept) => {
    const terms = concept.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
    const match = terms.some((t) => t.length > 3 && cleanAnswer.includes(t));
    if (match) conceptsCovered.push(concept);
    else missingConcepts.push(concept);
  });

  const ratio = keyConcepts.length > 0 ? conceptsCovered.length / keyConcepts.length : 0.6;
  let baseScore = ratio * 7.5;
  if (words.length >= 35) baseScore += 2.0;
  else if (words.length >= 18) baseScore += 1.0;
  else baseScore -= 1.0;

  const finalScore = Math.min(Math.max(Math.round(baseScore * 10) / 10, 3.0), 9.6);
  let correctness = 'Needs Improvement';
  if (finalScore >= 7.5) correctness = 'Correct & Comprehensive';
  else if (finalScore >= 5.0) correctness = 'Partially Correct';

  const isLast = questionIndex >= totalQuestions;
  let nextQuestion = null;

  if (!isLast) {
    if (missingConcepts.length > 0) {
      const targetGap = missingConcepts[0];
      nextQuestion = {
        id: `adaptive-probe-${questionIndex + 1}-${Date.now()}`,
        questionNumber: questionIndex + 1,
        subject,
        topic,
        difficulty: 'Targeted Remediation',
        question: `You touched upon the core idea, but omitted "${targetGap}". In the context of ${topic}, how does "${targetGap}" work and how would you resolve or handle it?`,
        context: `Adaptive follow-up probing student's missed concept: ${targetGap}`,
        keyConcepts: [targetGap, topic, 'Mechanism', 'Prevention/Handling'],
        modelAnswer: `A thorough explanation of ${targetGap} defines the mechanism and how it specifically contributes to or mitigates issues in ${topic}.`,
      };
    } else {
      const anchor = conceptsCovered[0] || topic;
      nextQuestion = {
        id: `adaptive-deepen-${questionIndex + 1}-${Date.now()}`,
        questionNumber: questionIndex + 1,
        subject,
        topic,
        difficulty: finalScore >= 7.5 ? 'Advanced Systems' : 'Intermediate Concept',
        question: finalScore >= 7.5
          ? `Solid mastery of ${anchor}. In a production high-concurrency system, what performance trade-offs, overheads, or failure modes emerge when scaling this?`
          : `You explained ${anchor} well. How does this compare directly with an alternative technique in ${subject}?`,
        context: `Adaptive analytical follow-up building on: ${anchor}`,
        keyConcepts: [topic, 'Trade-offs', 'Scalability', 'Comparison'],
        modelAnswer: `An exemplary response evaluates architectural constraints, scalability limits, and design compromises.`,
      };
    }
  }

  return {
    source: 'smart-rubric-demo',
    isLiveAI: false,
    disclaimer: 'Evaluated with curated rubric criteria. Connect Gemini API for live semantic evaluation.',
    evaluation: {
      score: finalScore,
      correctness,
      conceptsCovered,
      missingConcepts,
      feedbackSummary: `Covered ${conceptsCovered.length} of ${keyConcepts.length} core concepts.`,
      improvementTips: [
        missingConcepts.length > 0 ? `Explicitly mention "${missingConcepts[0]}" in your oral answer.` : 'Good technical terminology used.',
        'Connect your explanation to real-world performance implications.',
      ],
      modelAnswer: currentQuestion.sampleAnswer || 'Ideal answer covers primary conditions and system behavior.',
    },
    examinerReaction: finalScore >= 7.5
      ? 'Good answer! You explained the primary mechanism clearly.'
      : 'You touched upon parts of the answer, but missed key conditions.',
    nextQuestion,
  };
}

/**
 * Ask AI for a subtle hint
 */
export async function requestAIHint({ question, topic }) {
  try {
    const res = await fetch(`${BASE_URL}/api/viva/hint`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question, topic }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Hint request error:', err);
  }
  return {
    source: 'smart-rubric-demo',
    hint: `Hint: Think about how resources are scheduled in ${topic}. What happens if a process holds one resource while requesting another?`,
  };
}

/**
 * Ask AI to clarify or rephrase the question
 */
export async function requestClarification({ question, topic, language = 'English' }) {
  try {
    const res = await fetch(`${BASE_URL}/api/viva/clarify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question, topic, language }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Clarify request error:', err);
  }
  return {
    source: 'smart-rubric-demo',
    clarification: `To simplify: The examiner is asking you to describe how "${topic}" functions in practice, and what specific problem it solves.`,
  };
}

/**
 * Generate final comprehensive performance report
 */
export async function generateFinalReport({ subject, topic, sessionResults = [] }) {
  try {
    const res = await fetch(`${BASE_URL}/api/viva/final-report`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ subject, topic, sessionResults }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Final report synthesis error:', err);
  }

  // Fallback calculation
  const totalScoreAccum = sessionResults.reduce((acc, curr) => acc + (curr.evaluation?.score || 0), 0);
  const avgScore = sessionResults.length > 0 ? (totalScoreAccum / sessionResults.length) : 0;
  const scoreOutOf100 = Math.round(avgScore * 10);

  const allCovered = sessionResults.flatMap((r) => r.evaluation?.conceptsCovered || []);
  const allMissed = sessionResults.flatMap((r) => r.evaluation?.missingConcepts || []);

  let grade = 'B';
  let status = 'Solid Conceptual Foundation';
  if (scoreOutOf100 >= 85) {
    grade = 'A+';
    status = 'Viva Master - High Distinction';
  } else if (scoreOutOf100 >= 75) {
    grade = 'A';
    status = 'Exam Ready (High Confidence)';
  } else if (scoreOutOf100 >= 60) {
    grade = 'B+';
    status = 'Good Understanding with Minor Gaps';
  } else if (scoreOutOf100 < 50) {
    grade = 'C';
    status = 'Targeted Revision Recommended';
  }

  return {
    source: 'smart-rubric-demo',
    isLiveAI: false,
    report: {
      totalScore: scoreOutOf100,
      averageScoreOutOf10: Number(avgScore.toFixed(1)),
      conceptualScore: Math.min(scoreOutOf100 + 4, 98),
      technicalScore: Math.max(scoreOutOf100 - 6, 40),
      completenessScore: Math.max(scoreOutOf100 - 2, 45),
      articulationScore: Math.min(scoreOutOf100 + 2, 95),
      overallGrade: grade,
      readinessStatus: status,
      strongConcepts: [...new Set(allCovered)].slice(0, 5),
      weakConcepts: [...new Set(allMissed)].slice(0, 5),
      revisionChecklist: [
        `Review the core definitions and conditions for ${topic}`,
        'Practice speaking the key terms out loud to improve articulation',
        'Memorize at least one real-world architectural example',
      ],
      examinerExecutiveSummary: `The candidate demonstrated an understanding of ${topic}. Response depth was solid, though precision regarding technical terminology and boundary conditions can be sharpened.`,
      recommendedNextTopic: `${subject} - Advanced Concepts`,
    },
  };
}

/**
 * Fetch targeted revision questions for weak topics
 */
export async function fetchRevisionQuestions({ weakConcepts = [], subject = 'Computer Science' }) {
  try {
    const res = await fetch(`${BASE_URL}/api/viva/revision`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ weakConcepts, subject }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Revision question fetch error:', err);
  }

  const list = weakConcepts.length > 0 ? weakConcepts : ['Fundamental Definitions', 'System Constraints'];
  return {
    questions: list.map((concept, idx) => ({
      id: `rev-local-${idx}-${Date.now()}`,
      subject,
      topic: concept,
      question: `Flash Revision: In 2 sentences, explain the key purpose of "${concept}" and how it prevents errors.`,
      keyConcepts: [concept, 'Purpose', 'Impact'],
      modelAnswer: `"${concept}" provides architectural guarantees against unexpected failure.`,
    })),
  };
}

/**
 * Evaluate student's spoken/typed response in Weak Topic Revision
 */
export async function evaluateRevisionAnswer({
  subject = 'Computer Science',
  topic,
  currentQuestion,
  studentAnswer,
  language = 'English',
}) {
  try {
    const res = await fetch(`${BASE_URL}/api/viva/revision/evaluate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        subject,
        topic,
        currentQuestion,
        studentAnswer,
        language,
      }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Revision answer evaluation error, using heuristic fallback:', err);
  }

  // Local semantic fallback
  const cleanAnswer = (studentAnswer || '').toLowerCase();
  const words = cleanAnswer.split(/\s+/).filter(Boolean);
  const keyConcepts = currentQuestion?.keyConcepts || [topic];

  const conceptsCovered = [];
  const missingConcepts = [];

  keyConcepts.forEach((concept) => {
    const terms = concept.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
    const match = terms.some((t) => t.length > 3 && cleanAnswer.includes(t));
    if (match) conceptsCovered.push(concept);
    else missingConcepts.push(concept);
  });

  const ratio = keyConcepts.length > 0 ? conceptsCovered.length / keyConcepts.length : 0.6;
  let baseScore = ratio * 7.5;
  if (words.length >= 25) baseScore += 2.0;
  else if (words.length >= 12) baseScore += 1.0;
  else baseScore -= 1.0;

  const finalScore = Math.min(Math.max(Math.round(baseScore * 10) / 10, 3.0), 9.6);
  let correctness = 'Needs Improvement';
  if (finalScore >= 7.5) correctness = 'Correct & Comprehensive';
  else if (finalScore >= 5.0) correctness = 'Partially Correct';

  const examinerReaction = finalScore >= 7.5
    ? `Great revision recall! You clearly covered ${conceptsCovered.slice(0, 2).join(' and ')}.`
    : `Good attempt, but make sure to reinforce key points like ${missingConcepts.slice(0, 2).join(' and ')}.`;

  return {
    source: 'smart-rubric-demo',
    isLiveAI: false,
    evaluation: {
      score: finalScore,
      correctness,
      conceptsCovered,
      missingConcepts,
      feedbackSummary: `Covered ${conceptsCovered.length} of ${keyConcepts.length} essential revision concepts.`,
      improvementTips: [
        missingConcepts.length > 0
          ? `Focus on mentioning "${missingConcepts[0]}" when recalling this topic.`
          : 'Solid conceptual retention demonstrated.',
      ],
      modelAnswer: currentQuestion?.modelAnswer || 'A complete answer covers definition, operational role, and failure prevention.',
    },
    examinerReaction,
  };
}

/**
 * Session History storage utilities
 */
export function loadSessionHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('vivamate_session_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSessionToHistory(sessionRecord) {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadSessionHistory();
    const updated = [sessionRecord, ...existing].slice(0, 30); // keep last 30
    localStorage.setItem('vivamate_session_history', JSON.stringify(updated));
  } catch (err) {
    console.warn('Error saving session history:', err);
  }
}
