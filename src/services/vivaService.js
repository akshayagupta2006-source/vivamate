// VivaMate Unified Frontend AI Service
// Connects to Express backend & Gemini AI, with custom API key support and seamless offline fallback.

import {
  MOCK_QUESTIONS_DATABASE,
  MOCK_QUESTIONS_DATABASE_HINDI,
  generateCustomMockQuestions,
  matchesConcept,
} from '../data/mockData';
import { calculateGrade, getReadinessStatus } from '../utils/grading';

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
  const isHindi = config.language === 'Hindi';
  const db = isHindi ? MOCK_QUESTIONS_DATABASE_HINDI : MOCK_QUESTIONS_DATABASE;
  let matched = null;
  if (normalized.includes('deadlock') || normalized.includes('banker') || normalized.includes('डेडलॉक')) matched = db['os-deadlocks'];
  else if (normalized.includes('acid') || normalized.includes('transaction') || normalized.includes('एसिड')) matched = db['dbms-acid'];
  else if (normalized.includes('handshake') || normalized.includes('tcp') || normalized.includes('टीसीपी')) matched = db['cn-tcp'];
  else if (normalized.includes('tree') || normalized.includes('avl') || normalized.includes('ट्री')) matched = db['dsa-trees'];

  const pool = (matched && matched.length > 0) ? matched : generateCustomMockQuestions(config.subject, config.topic, 4, config.language);
  const firstQ = pool[Math.floor(Math.random() * pool.length)] || pool[0];
  return {
    source: 'smart-rubric-demo',
    isLiveAI: false,
    disclaimer: isHindi
      ? 'क्यूरेटेड रूब्रिक मोड — लाइव AI के लिए Gemini API कुंजी कनेक्ट करें।'
      : 'Curated Rubric Mode — Connect Gemini API key for live AI.',
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
  const { currentQuestion, studentAnswer, questionIndex, totalQuestions, topic, subject, language = 'English' } = turnPayload;
  const isHindi = language === 'Hindi';
  const cleanAnswer = (studentAnswer || '').toLowerCase();
  const words = cleanAnswer.split(/\s+/).filter(Boolean);
  const keyConcepts = currentQuestion.keyConcepts || [];

  const conceptsCovered = [];
  const missingConcepts = [];

  keyConcepts.forEach((concept) => {
    if (matchesConcept(cleanAnswer, concept)) {
      conceptsCovered.push(concept);
    } else {
      missingConcepts.push(concept);
    }
  });

  const ratio = keyConcepts.length > 0 ? conceptsCovered.length / keyConcepts.length : 0.6;
  let baseScore = ratio * 7.5;
  if (words.length >= 35) baseScore += 2.0;
  else if (words.length >= 18) baseScore += 1.0;
  else baseScore -= 1.0;

  const finalScore = Math.min(Math.max(Math.round(baseScore * 10) / 10, 3.0), 9.6);
  let correctness = isHindi ? 'सुधार की आवश्यकता है' : 'Needs Improvement';
  if (finalScore >= 7.5) correctness = isHindi ? 'सही और व्यापक' : 'Correct & Comprehensive';
  else if (finalScore >= 5.0) correctness = isHindi ? 'आंशिक रूप से सही' : 'Partially Correct';

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
        difficulty: isHindi ? 'लक्षित सुधार' : 'Targeted Remediation',
        question: isHindi
          ? `आपने मुख्य विचार को छुआ, लेकिन "${targetGap}" छूट गया। ${topic} के संदर्भ में, "${targetGap}" कैसे काम करता है और आप इसे कैसे संभालेंगे?`
          : `You touched upon the core idea, but omitted "${targetGap}". In the context of ${topic}, how does "${targetGap}" work and how would you resolve or handle it?`,
        context: isHindi
          ? `अनुवर्ती प्रश्न: छात्र की छूटी हुई अवधारणा: ${targetGap}`
          : `Adaptive follow-up probing student's missed concept: ${targetGap}`,
        keyConcepts: [targetGap, topic, isHindi ? 'तंत्र' : 'Mechanism', isHindi ? 'रोकथाम' : 'Prevention/Handling'],
        modelAnswer: isHindi
          ? `${targetGap} की विस्तृत व्याख्या तंत्र और ${topic} में इसके प्रभाव को स्पष्ट करती है।`
          : `A thorough explanation of ${targetGap} defines the mechanism and how it specifically contributes to or mitigates issues in ${topic}.`,
      };
    } else {
      const anchor = conceptsCovered[0] || topic;
      nextQuestion = {
        id: `adaptive-deepen-${questionIndex + 1}-${Date.now()}`,
        questionNumber: questionIndex + 1,
        subject,
        topic,
        difficulty: finalScore >= 7.5 ? (isHindi ? 'उन्नत सिस्टम्स' : 'Advanced Systems') : (isHindi ? 'मध्यवर्ती अवधारणा' : 'Intermediate Concept'),
        question: finalScore >= 7.5
          ? (isHindi
              ? `${anchor} पर आपकी पकड़ अच्छी है। उत्पादन प्रणाली में, इसे बड़े पैमाने पर लागू करते समय क्या ट्रेड-ऑफ और विफलताएं हो सकती हैं?`
              : `Solid mastery of ${anchor}. In a production high-concurrency system, what performance trade-offs, overheads, or failure modes emerge when scaling this?`)
          : (isHindi
              ? `आपने ${anchor} को अच्छी तरह से समझाया। यह ${subject} में वैकल्पिक तकनीकों की तुलना में कैसे भिन्न है?`
              : `You explained ${anchor} well. How does this compare directly with an alternative technique in ${subject}?`),
        context: isHindi
          ? `विश्लेषणात्मक अनुवर्ती प्रश्न: ${anchor} पर आधारित`
          : `Adaptive analytical follow-up building on: ${anchor}`,
        keyConcepts: [topic, isHindi ? 'ट्रेड-ऑफ' : 'Trade-offs', isHindi ? 'स्केलेबिलिटी' : 'Scalability', isHindi ? 'तुलना' : 'Comparison'],
        modelAnswer: isHindi
          ? `एक अनुकरणीय उत्तर वास्तुशिल्प सीमाओं और डिजाइन निर्णयों का मूल्यांकन करता है।`
          : `An exemplary response evaluates architectural constraints, scalability limits, and design compromises.`,
      };
    }
  }

  return {
    source: 'smart-rubric-demo',
    isLiveAI: false,
    disclaimer: isHindi
      ? 'क्यूरेटेड रूब्रिक मानदंडों के साथ मूल्यांकन। लाइव AI के लिए Gemini API कनेक्ट करें।'
      : 'Evaluated with curated rubric criteria. Connect Gemini API for live semantic evaluation.',
    evaluation: {
      score: finalScore,
      correctness,
      conceptsCovered,
      missingConcepts,
      feedbackSummary: isHindi
        ? `${keyConcepts.length} में से ${conceptsCovered.length} मुख्य अवधारणाओं को कवर किया।`
        : `Covered ${conceptsCovered.length} of ${keyConcepts.length} core concepts.`,
      improvementTips: [
        missingConcepts.length > 0
          ? (isHindi ? `अपने मौखिक उत्तर में "${missingConcepts[0]}" का स्पष्ट रूप से उल्लेख करें।` : `Explicitly mention "${missingConcepts[0]}" in your oral answer.`)
          : (isHindi ? 'अच्छी तकनीकी शब्दावली का उपयोग किया गया।' : 'Good technical terminology used.'),
        isHindi ? 'अपनी व्याख्या को वास्तविक दुनिया के उदाहरणों से जोड़ें।' : 'Connect your explanation to real-world performance implications.',
      ],
      modelAnswer: currentQuestion.sampleAnswer || (isHindi ? 'आदर्श उत्तर प्राथमिक स्थितियों और व्यवहार को कवर करता है।' : 'Ideal answer covers primary conditions and system behavior.'),
    },
    examinerReaction: isHindi
      ? (finalScore >= 7.5
          ? 'बहुत अच्छा उत्तर! आपने प्राथमिक तंत्र को स्पष्ट रूप से समझाया।'
          : 'आपने उत्तर के कुछ हिस्सों को छुआ, लेकिन मुख्य शर्तें छूट गईं।')
      : (finalScore >= 7.5
          ? 'Good answer! You explained the primary mechanism clearly.'
          : 'You touched upon parts of the answer, but missed key conditions.'),
    nextQuestion,
  };
}

/**
 * Ask AI for a subtle hint
 */
export async function requestAIHint({ question, topic, language = 'English' }) {
  try {
    const res = await fetch(`${BASE_URL}/api/viva/hint`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question, topic, language }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Hint request error:', err);
  }
  const isHindi = language === 'Hindi';
  return {
    source: 'smart-rubric-demo',
    hint: isHindi
      ? `संकेत: विचार करें कि ${topic} में संसाधनों को कैसे निर्धारित किया जाता है। यदि कोई प्रक्रिया दूसरे संसाधन का अनुरोध करते हुए एक संसाधन धारण करती है तो क्या होता है?`
      : `Hint: Think about how resources are scheduled in ${topic}. What happens if a process holds one resource while requesting another?`,
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
  const isHindi = language === 'Hindi';
  return {
    source: 'smart-rubric-demo',
    clarification: isHindi
      ? `सरल शब्दों में: परीक्षक आपसे यह वर्णन करने के लिए कह रहा है कि व्यवहार में "${topic}" कैसे कार्य करता है, और यह किस विशिष्ट समस्या का समाधान करता है।`
      : `To simplify: The examiner is asking you to describe how "${topic}" functions in practice, and what specific problem it solves.`,
  };
}

/**
 * Generate final comprehensive performance report
 */
export async function generateFinalReport({ subject, topic, sessionResults = [], language = 'English' }) {
  try {
    const res = await fetch(`${BASE_URL}/api/viva/final-report`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ subject, topic, sessionResults, language }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Final report synthesis error:', err);
  }

  // Fallback calculation using institutional grading scale
  const totalScoreAccum = sessionResults.reduce((acc, curr) => acc + (curr.evaluation?.score || 0), 0);
  const avgScore = sessionResults.length > 0 ? (totalScoreAccum / sessionResults.length) : 0;
  const scoreOutOf100 = Math.round(avgScore * 10);

  const allCovered = sessionResults.flatMap((r) => r.evaluation?.conceptsCovered || []);
  const allMissed = sessionResults.flatMap((r) => r.evaluation?.missingConcepts || []);

  const grade = calculateGrade(scoreOutOf100);
  const status = getReadinessStatus(scoreOutOf100, language);
  const isHindi = language === 'Hindi';

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
      revisionChecklist: isHindi
        ? [
            `${topic} की मुख्य परिभाषाओं और शर्तों को दोहराएं`,
            'सटीक तकनीकी शब्दों को बोलकर अभ्यास करें',
            'कम से कम एक वास्तविक वास्तुशिल्प उदाहरण याद रखें',
          ]
        : [
            `Review the core definitions and conditions for ${topic}`,
            'Practice speaking the key terms out loud to improve articulation',
            'Memorize at least one real-world architectural example',
          ],
      examinerExecutiveSummary: isHindi
        ? `उम्मीदवार ने ${topic} की स्पष्ट वैचारिक समझ प्रदर्शित की। उत्तरों की गहराई ठोस थी, हालांकि मौखिक परीक्षा के लिए तकनीकी शब्दावली और सीमाओं को और अधिक स्पष्ट किया जा सकता है।`
        : `The candidate demonstrated an understanding of ${topic}. Response depth was solid, though precision regarding technical terminology and boundary conditions can be sharpened.`,
      recommendedNextTopic: isHindi ? `${subject} - गहन अध्ययन (Deep Dive)` : `${subject} - Advanced Concepts`,
    },
  };
}

/**
 * Fetch targeted revision questions for weak topics
 */
export async function fetchRevisionQuestions({ weakConcepts = [], subject = 'Computer Science', language = 'English' }) {
  try {
    const res = await fetch(`${BASE_URL}/api/viva/revision`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ weakConcepts, subject, language }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Revision question fetch error:', err);
  }

  const isHindi = language === 'Hindi';
  const list = weakConcepts.length > 0 ? weakConcepts : (isHindi ? ['मौलिक परिभाषाएं', 'सिस्टम बाधाएं'] : ['Fundamental Definitions', 'System Constraints']);
  return {
    questions: list.map((concept, idx) => ({
      id: `rev-local-${idx}-${Date.now()}`,
      subject,
      topic: concept,
      question: isHindi
        ? `त्वरित पुनरीक्षण: संक्षेप में समझाएं कि "${concept}" का मुख्य उद्देश्य क्या है और यह त्रुटियों को कैसे रोकता है।`
        : `Flash Revision: In 2 sentences, explain the key purpose of "${concept}" and how it prevents errors.`,
      keyConcepts: [concept, isHindi ? 'उद्देश्य' : 'Purpose', isHindi ? 'प्रभाव' : 'Impact'],
      modelAnswer: isHindi
        ? `"${concept}" अप्रत्याशित विफलता के विरुद्ध सुरक्षा प्रदान करता है।`
        : `"${concept}" provides architectural guarantees against unexpected failure.`,
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
  const isHindi = language === 'Hindi';
  const cleanAnswer = (studentAnswer || '').toLowerCase();
  const words = cleanAnswer.split(/\s+/).filter(Boolean);
  const keyConcepts = currentQuestion?.keyConcepts || [topic];

  const conceptsCovered = [];
  const missingConcepts = [];

  keyConcepts.forEach((concept) => {
    if (matchesConcept(cleanAnswer, concept)) {
      conceptsCovered.push(concept);
    } else {
      missingConcepts.push(concept);
    }
  });

  const ratio = keyConcepts.length > 0 ? conceptsCovered.length / keyConcepts.length : 0.6;
  let baseScore = ratio * 7.5;
  if (words.length >= 25) baseScore += 2.0;
  else if (words.length >= 12) baseScore += 1.0;
  else baseScore -= 1.0;

  const finalScore = Math.min(Math.max(Math.round(baseScore * 10) / 10, 3.0), 9.6);
  let correctness = isHindi ? 'सुधार की आवश्यकता है' : 'Needs Improvement';
  if (finalScore >= 7.5) correctness = isHindi ? 'सही और व्यापक' : 'Correct & Comprehensive';
  else if (finalScore >= 5.0) correctness = isHindi ? 'आंशिक रूप से सही' : 'Partially Correct';

  const examinerReaction = isHindi
    ? (finalScore >= 7.5
        ? `शानदार पुनरीक्षण! आपने ${conceptsCovered.slice(0, 2).join(' और ') || 'मुख्य अवधारणा'} को स्पष्ट रूप से कवर किया।`
        : `अच्छा प्रयास, लेकिन ${missingConcepts.slice(0, 2).join(' और ') || 'मुख्य बिंदुओं'} को मजबूत करें।`)
    : (finalScore >= 7.5
        ? `Great revision recall! You clearly covered ${conceptsCovered.slice(0, 2).join(' and ')}.`
        : `Good attempt, but make sure to reinforce key points like ${missingConcepts.slice(0, 2).join(' and ')}.`);

  return {
    source: 'smart-rubric-demo',
    isLiveAI: false,
    evaluation: {
      score: finalScore,
      correctness,
      conceptsCovered,
      missingConcepts,
      feedbackSummary: isHindi
        ? `${keyConcepts.length} में से ${conceptsCovered.length} आवश्यक पुनरीक्षण अवधारणाओं को कवर किया।`
        : `Covered ${conceptsCovered.length} of ${keyConcepts.length} essential revision concepts.`,
      improvementTips: [
        missingConcepts.length > 0
          ? (isHindi
              ? `इस विषय को याद करते समय "${missingConcepts[0]}" का उल्लेख करने पर ध्यान दें।`
              : `Focus on mentioning "${missingConcepts[0]}" when recalling this topic.`)
          : (isHindi ? 'ठोस वैचारिक समझ प्रदर्शित।' : 'Solid conceptual retention demonstrated.'),
      ],
      modelAnswer: currentQuestion?.modelAnswer || (isHindi
        ? 'एक पूर्ण उत्तर परिभाषा, परिचालन भूमिका और विफलता की रोकथाम को कवर करता है।'
        : 'A complete answer covers definition, operational role, and failure prevention.'),
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
