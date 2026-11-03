// VivaMate Node.js + Express Backend Server
// Real Google Gemini AI integration with intelligent fallback and session management.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  generateInitialQuestion, 
  evaluateTurnAndFollowUp, 
  generateAIHint, 
  clarifyQuestion, 
  generateFinalReport 
} from './geminiService.js';
import { 
  MOCK_QUESTIONS_DATABASE, 
  MOCK_QUESTIONS_DATABASE_HINDI, 
  generateCustomMockQuestions, 
  matchesConcept 
} from '../src/data/mockData.js';
import { calculateGrade, getReadinessStatus } from '../src/utils/grading.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to extract custom API key passed from client header or env
const getApiKey = (req) => {
  return req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY || null;
};

// Adaptive Fallback Generator: creates dynamic, responsive follow-up questions when Gemini API is unavailable or as a safety net
export function generateAdaptiveFallbackQuestion({
  subject,
  topic,
  _difficulty = 'Intermediate',
  language = 'English',
  currentQuestion,
  _studentAnswer,
  questionIndex,
  _totalQuestions,
  conversationHistory = [],
  evaluation = {},
}) {
  const isHindi = language === 'Hindi';
  const previousQuestions = [
    currentQuestion?.question || '',
    ...(conversationHistory || []).map((h) => h.question?.question || h.question || ''),
  ].filter(Boolean).map((q) => q.toLowerCase());

  const normalizedTopic = (topic || '').toLowerCase();
  const db = isHindi ? MOCK_QUESTIONS_DATABASE_HINDI : MOCK_QUESTIONS_DATABASE;
  let pool = [];
  if (normalizedTopic.includes('deadlock') || normalizedTopic.includes('banker')) {
    pool = db['os-deadlocks'] || MOCK_QUESTIONS_DATABASE['os-deadlocks'] || [];
  } else if (normalizedTopic.includes('acid') || normalizedTopic.includes('transaction')) {
    pool = db['dbms-acid'] || MOCK_QUESTIONS_DATABASE['dbms-acid'] || [];
  } else if (normalizedTopic.includes('handshake') || normalizedTopic.includes('tcp')) {
    pool = db['cn-tcp'] || MOCK_QUESTIONS_DATABASE['cn-tcp'] || [];
  } else if (normalizedTopic.includes('tree') || normalizedTopic.includes('avl')) {
    pool = db['dsa-trees'] || MOCK_QUESTIONS_DATABASE['dsa-trees'] || [];
  }

  const missing = evaluation.missingConcepts || [];
  const covered = evaluation.conceptsCovered || [];
  const score = evaluation.score || 5;

  // 1. If student struggled or omitted critical concepts, generate a targeted diagnostic probe
  if (missing.length > 0) {
    const targetGap = missing[0];
    const questionText = isHindi
      ? `आपने विषय के कुछ भाग समझाए, लेकिन "${targetGap}" का उल्लेख नहीं किया। ${topic} के संदर्भ में, "${targetGap}" कैसे कार्य करता है और इसका समाधान कैसे किया जाता है?`
      : `You explained part of the concept, but didn't touch upon "${targetGap}". In the context of ${topic}, how does "${targetGap}" operate and how is it addressed?`;

    return {
      id: `adaptive-probe-${questionIndex + 1}-${Date.now()}`,
      questionNumber: questionIndex + 1,
      subject,
      topic,
      difficulty: isHindi ? 'लक्षित पुनरीक्षण' : 'Targeted Remediation',
      question: questionText,
      context: isHindi ? `छात्र की छूटी हुई अवधारणा पर अनुवर्ती प्रश्न: ${targetGap}` : `Adaptive follow-up probing student's missed concept: ${targetGap}`,
      keyConcepts: [targetGap, topic, 'Mechanism', 'Prevention/Handling'],
      modelAnswer: isHindi
        ? `"${targetGap}" का संपूर्ण उत्तर इसकी कार्यप्रणाली और ${topic} में इसकी भूमिका को स्पष्ट करता है।`
        : `A thorough explanation of ${targetGap} defines the mechanism and how it specifically contributes to or mitigates issues in ${topic}.`,
    };
  }

  // 2. If student demonstrated high mastery, select an unasked question from the curated pool
  const unaskedInPool = pool.filter((q) => {
    const text = (q.question || '').toLowerCase();
    return !previousQuestions.some((prev) => prev.includes(text.slice(0, 30)) || text.includes(prev.slice(0, 30)));
  });

  if (unaskedInPool.length > 0) {
    const chosen = unaskedInPool[0];
    const coveredHighlight = covered.length > 0
      ? isHindi
        ? `आपने ${covered.slice(0, 2).join(' और ')} की बहुत अच्छी समझ प्रदर्शित की। `
        : `You had a solid grasp of ${covered.slice(0, 2).join(' and ')}. `
      : '';
    const prefix = isHindi ? 'अब अगले स्तर पर चलते हैं: ' : "Now let's delve deeper: ";
    return {
      ...chosen,
      questionNumber: questionIndex + 1,
      question: `${coveredHighlight}${prefix}${chosen.question}`,
    };
  }

  // 3. Fallback scenario question building on their answered concepts
  const anchor = covered[0] || topic;
  const questionText = isHindi
    ? score >= 7.5
      ? `"${anchor}" पर बहुत अच्छा उत्तर। अब एक बड़े वितरित (distributed), उच्च-समवर्ती सिस्टम पर विचार करें: यह तंत्र कैसे स्केल करता है, और इसमें क्या विफलताएं या बॉटलनेक आ सकते हैं?`
      : `आपने "${anchor}" का उल्लेख किया। क्या आप ${subject} में इस पद्धति की तुलना किसी वैकल्पिक तकनीक से कर सकते हैं और मुख्य ट्रेड-ऑफ़ समझा सकते हैं?`
    : score >= 7.5
      ? `Strong explanation on ${anchor}. Now consider a distributed, high-concurrency production system: How does this mechanism scale, and what failure modes or bottlenecks occur?`
      : `You've touched upon ${anchor}. Can you compare this approach with an alternative method in ${subject}, and explain the core trade-offs between them?`;

  return {
    id: `adaptive-scenario-${questionIndex + 1}-${Date.now()}`,
    questionNumber: questionIndex + 1,
    subject,
    topic,
    difficulty: score >= 7.5 ? (isHindi ? 'उन्नत सिस्टम डिजाइन' : 'Advanced Systems') : (isHindi ? 'मध्यवर्ती अवधारणा' : 'Intermediate Concept'),
    question: questionText,
    context: isHindi ? `विश्लेषणात्मक अनुवर्ती प्रश्न: ${anchor}` : `Adaptive analytical follow-up building on: ${anchor}`,
    keyConcepts: [topic, 'Trade-offs', 'System Design', 'Failure Modes'],
    modelAnswer: isHindi
      ? `एक उत्कृष्ट उत्तर सिस्टम की बाधाओं, स्केलेबिलिटी सीमाओं और विश्वसनीयता का मूल्यांकन करता है।`
      : `An exemplary response evaluates architectural constraints, scalability limits, and design compromises.`,
  };
}

// 1. Health check & API key status
app.get('/api/health', (req, res) => {
  const apiKey = getApiKey(req);
  const isConfigured = Boolean(apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE');

  res.json({
    status: 'ok',
    service: 'VivaMate AI Engine',
    geminiConfigured: isConfigured,
    model: 'gemini-2.5-flash',
    mode: isConfigured ? 'Live Gemini AI Mode' : 'Smart Rubric Demo Mode',
  });
});

// 2. Start viva session & generate opening question
app.post('/api/viva/start', async (req, res) => {
  try {
    const { 
      subject = 'Operating Systems', 
      topic = 'Deadlocks', 
      difficulty = 'Intermediate', 
      persona = 'Friendly Professor', 
      language = 'English'
    } = req.body;

    const apiKey = getApiKey(req);

    // Try Gemini first if key available
    if (apiKey) {
      const geminiQ = await generateInitialQuestion({
        subject,
        topic,
        difficulty,
        persona,
        language,
        apiKey,
      });

      if (geminiQ) {
        return res.json({
          source: 'gemini-ai',
          isLiveAI: true,
          question: {
            id: `gemini-q1-${Date.now()}`,
            subject,
            topic,
            difficulty,
            ...geminiQ,
          },
        });
      }
    }

    // Intelligent Curated Fallback
    const isHindi = language === 'Hindi';
    const normalizedTopic = topic.toLowerCase();
    const db = isHindi ? MOCK_QUESTIONS_DATABASE_HINDI : MOCK_QUESTIONS_DATABASE;
    let fallbackQuestions = null;

    if (normalizedTopic.includes('deadlock') || normalizedTopic.includes('banker')) {
      fallbackQuestions = db['os-deadlocks'] || MOCK_QUESTIONS_DATABASE['os-deadlocks'];
    } else if (normalizedTopic.includes('acid') || normalizedTopic.includes('transaction')) {
      fallbackQuestions = db['dbms-acid'] || MOCK_QUESTIONS_DATABASE['dbms-acid'];
    } else if (normalizedTopic.includes('handshake') || normalizedTopic.includes('tcp')) {
      fallbackQuestions = db['cn-tcp'] || MOCK_QUESTIONS_DATABASE['cn-tcp'];
    } else if (normalizedTopic.includes('tree') || normalizedTopic.includes('avl')) {
      fallbackQuestions = db['dsa-trees'] || MOCK_QUESTIONS_DATABASE['dsa-trees'];
    }

    const pool = (fallbackQuestions && fallbackQuestions.length > 0)
      ? fallbackQuestions
      : generateCustomMockQuestions(subject, topic, 4, language);

    const firstQ = pool[Math.floor(Math.random() * pool.length)] || pool[0];

    return res.json({
      source: 'smart-rubric-demo',
      isLiveAI: false,
      disclaimer: isHindi 
        ? 'क्यूरेटेड रूब्रिक मोड — लाइव AI जेनरेशन के लिए सेटिंग्स में Gemini API Key जोड़ें।'
        : 'Curated Rubric Mode — Connect Gemini API key in settings or backend .env for dynamic AI generation.',
      question: {
        ...firstQ,
        questionNumber: 1,
      },
    });
  } catch (error) {
    console.error('Error starting viva:', error);
    res.status(500).json({ error: 'Failed to initiate viva session', details: error.message });
  }
});

// 3. Turn-by-turn answer evaluation and next follow-up question
app.post('/api/viva/turn', async (req, res) => {
  try {
    const {
      subject,
      topic,
      difficulty = 'Intermediate',
      persona = 'Friendly Professor',
      language = 'English',
      conversationHistory = [],
      currentQuestion,
      studentAnswer,
      questionIndex = 1,
      totalQuestions = 3,
    } = req.body;

    if (!studentAnswer || !studentAnswer.trim()) {
      return res.status(400).json({ error: 'Student answer is required.' });
    }

    const apiKey = getApiKey(req);
    const isLast = questionIndex >= totalQuestions;
    const isHindi = language === 'Hindi';

    // Call Gemini if key available
    if (apiKey) {
      const geminiResult = await evaluateTurnAndFollowUp({
        subject,
        topic,
        difficulty,
        persona,
        language,
        conversationHistory,
        currentQuestion,
        studentAnswer,
        questionIndex,
        totalQuestions,
        apiKey,
      });

      if (geminiResult) {
        // Guarantee adaptive fallback if Gemini model output missed nextQuestion on non-last turn
        if (!isLast && !geminiResult.nextQuestion) {
          geminiResult.nextQuestion = generateAdaptiveFallbackQuestion({
            subject,
            topic,
            difficulty,
            language,
            currentQuestion,
            studentAnswer,
            questionIndex,
            totalQuestions,
            conversationHistory,
            evaluation: geminiResult.evaluation || {},
          });
        }
        return res.json({
          source: 'gemini-ai',
          isLiveAI: true,
          ...geminiResult,
        });
      }
    }

    // Heuristic Fallback Evaluation
    const cleanAnswer = studentAnswer.toLowerCase();
    const words = cleanAnswer.split(/\s+/).filter(Boolean);
    const keyConcepts = currentQuestion.keyConcepts || [];

    const conceptsCovered = [];
    const missingConcepts = [];

    keyConcepts.forEach((concept) => {
      const match = matchesConcept(cleanAnswer, concept);
      if (match) conceptsCovered.push(concept);
      else missingConcepts.push(concept);
    });

    const ratio = keyConcepts.length > 0 ? conceptsCovered.length / keyConcepts.length : 0.6;
    let baseScore = ratio * 7.5;
    if (words.length >= 25) baseScore += 2.0;
    else if (words.length >= 12) baseScore += 1.0;
    else baseScore -= 1.0;

    const finalScore = Math.min(Math.max(Math.round(baseScore * 10) / 10, 3.0), 9.6);
    let correctness = isHindi ? 'सुधार की आवश्यकता (Needs Improvement)' : 'Needs Improvement';
    if (finalScore >= 7.5) {
      correctness = isHindi ? 'सटीक और संपूर्ण (Correct & Comprehensive)' : 'Correct & Comprehensive';
    } else if (finalScore >= 5.0) {
      correctness = isHindi ? 'आंशिक रूप से सही (Partially Correct)' : 'Partially Correct';
    }

    const examinerReaction = isHindi
      ? finalScore >= 7.5
        ? `बहुत बढ़िया उत्तर! आपने ${conceptsCovered.slice(0, 2).join(' और ') || topic} को बहुत अच्छी तरह समझाया।`
        : `आपने उत्तर देने का अच्छा प्रयास किया, लेकिन ${missingConcepts.slice(0, 2).join(' और ') || 'कुछ मुख्य बिंदु'} छूट गए।`
      : finalScore >= 7.5
        ? `Good explanation! You clearly grasped ${conceptsCovered.slice(0, 2).join(' and ') || topic}.`
        : `You touched upon the idea, but missed critical points such as ${missingConcepts.slice(0, 2).join(' and ') || 'key details'}.`;

    let nextQuestion = null;

    if (!isLast) {
      // Dynamically formulate adaptive question based on student's actual performance and answers
      nextQuestion = generateAdaptiveFallbackQuestion({
        subject,
        topic,
        difficulty,
        language,
        currentQuestion,
        studentAnswer,
        questionIndex,
        totalQuestions,
        conversationHistory,
        evaluation: {
          score: finalScore,
          correctness,
          conceptsCovered,
          missingConcepts,
        },
      });
    }

    const feedbackSummary = isHindi
      ? `${keyConcepts.length} मुख्य अवधारणाओं में से ${conceptsCovered.length} को कवर किया गया।`
      : `Covered ${conceptsCovered.length} of ${keyConcepts.length} core concepts.`;

    const improvementTips = isHindi
      ? [
          missingConcepts.length > 0
            ? `मौखिक परीक्षा में "${missingConcepts[0]}" का स्पष्ट रूप से उल्लेख करें।`
            : 'तकनीकी शब्दावली का अच्छा उपयोग किया गया।',
          'वास्तविक सिस्टम उदाहरणों के साथ उत्तर देने से अंक बेहतर होते हैं।',
        ]
      : [
          missingConcepts.length > 0
            ? `Explicitly mention "${missingConcepts[0]}" when answering oral questions.`
            : 'Good technical terminology used.',
          'State real-world trade-offs or operational impact to get full marks in viva voce.',
        ];

    return res.json({
      source: 'smart-rubric-demo',
      isLiveAI: false,
      disclaimer: isHindi
        ? 'क्यूरेटेड रूब्रिक द्वारा मूल्यांकित। लाइव सेमांटिक AI के लिए Gemini API Key जोड़ें।'
        : 'Evaluated with curated rubric criteria. Connect Gemini API key for live semantic evaluation.',
      evaluation: {
        score: finalScore,
        correctness,
        conceptsCovered,
        missingConcepts,
        feedbackSummary,
        improvementTips,
        modelAnswer: currentQuestion.modelAnswer || currentQuestion.sampleAnswer || (isHindi ? 'आदर्श उत्तर सभी मुख्य परिभाषाओं और उपयोग के मामलों को कवर करता है।' : 'Ideal answer covers all primary definitions and edge cases.'),
      },
      examinerReaction,
      nextQuestion,
    });
  } catch (error) {
    console.error('Error processing turn:', error);
    res.status(500).json({ error: 'Turn evaluation failed', details: error.message });
  }
});

// 4. AI Hint
app.post('/api/viva/hint', async (req, res) => {
  try {
    const { question, topic, language = 'English' } = req.body;
    const apiKey = getApiKey(req);
    const isHindi = language === 'Hindi';

    if (apiKey) {
      const hintData = await generateAIHint({ question, topic, language, apiKey });
      if (hintData) {
        return res.json({ source: 'gemini-ai', ...hintData });
      }
    }

    return res.json({
      source: 'smart-rubric-demo',
      hint: isHindi
        ? `विचार करें कि ${topic} के मूल सिद्धांत मेमोरी, सीपीयू स्थिति या सिस्टम पर कैसे प्रभाव डालते हैं। मुख्य शर्तों पर ध्यान दें।`
        : `Think about how the core principles of ${topic} affect memory, CPU states, or transaction atomicity. What happens if a resource cannot be preempted?`,
    });
  } catch {
    res.status(500).json({ error: 'Hint generation failed' });
  }
});

// 5. Question Clarification / Rephrase
app.post('/api/viva/clarify', async (req, res) => {
  try {
    const { question, topic, language = 'English' } = req.body;
    const apiKey = getApiKey(req);
    const isHindi = language === 'Hindi';

    if (apiKey) {
      const clarified = await clarifyQuestion({ question, topic, language, apiKey });
      if (clarified) {
        return res.json({ source: 'gemini-ai', ...clarified });
      }
    }

    return res.json({
      source: 'smart-rubric-demo',
      clarification: isHindi
        ? `सरल शब्दों में: परीक्षक प्रश्न "${question}" के पीछे के मुख्य तंत्र के बारे में पूछ रहा है। मुख्य शर्तों, उनके महत्व और वे किस समस्या को रोकते हैं, उस पर ध्यान दें।`
        : `In simpler terms: The examiner is asking for the core mechanism behind "${question}". Focus on defining the conditions, why they matter, and what problem they prevent.`,
    });
  } catch {
    res.status(500).json({ error: 'Clarification failed' });
  }
});

// 6. Comprehensive Final Report Synthesis
app.post('/api/viva/final-report', async (req, res) => {
  try {
    const { subject, topic, sessionResults = [], language = 'English' } = req.body;
    const apiKey = getApiKey(req);
    const isHindi = language === 'Hindi';

    if (apiKey && sessionResults.length > 0) {
      const geminiReport = await generateFinalReport({
        subject,
        topic,
        sessionResults,
        language,
        apiKey,
      });

      if (geminiReport) {
        const rawScore = Number.isFinite(geminiReport.totalScore)
          ? geminiReport.totalScore
          : (Number.isFinite(geminiReport.averageScoreOutOf10) ? Math.round(geminiReport.averageScoreOutOf10 * 10) : 0);
        const scoreOutOf100 = Math.max(0, Math.min(100, rawScore));
        const grade = calculateGrade(scoreOutOf100);
        const status = geminiReport.readinessStatus || getReadinessStatus(scoreOutOf100, language);

        return res.json({
          source: 'gemini-ai',
          isLiveAI: true,
          report: {
            ...geminiReport,
            totalScore: scoreOutOf100,
            overallGrade: grade,
            readinessStatus: status,
          },
        });
      }
    }

    // Heuristic Fallback Report
    const totalScoreAccum = sessionResults.reduce((acc, curr) => acc + (curr.evaluation?.score || 0), 0);
    const avgScore = sessionResults.length > 0 ? (totalScoreAccum / sessionResults.length) : 0;
    const scoreOutOf100 = Math.round(avgScore * 10);

    const allCovered = sessionResults.flatMap((r) => r.evaluation?.conceptsCovered || []);
    const allMissed = sessionResults.flatMap((r) => r.evaluation?.missingConcepts || []);

    const grade = calculateGrade(scoreOutOf100);
    const status = getReadinessStatus(scoreOutOf100, language);

    return res.json({
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
              `${topic} की औपचारिक परिभाषाओं और शर्तों को दोहराएं`,
              'मौखिक प्रवाह में सुधार के लिए तकनीकी शब्दों को बोलकर अभ्यास करें',
              'कम से कम एक वास्तविक वास्तुशिल्प उदाहरण या कोड स्निपेट याद रखें',
            ]
          : [
              'Review the formal definitions and conditions for ' + topic,
              'Practice speaking the exact technical terms out loud to improve fluency',
              'Memorize at least one real-world architectural example or code snippet',
            ],
        examinerExecutiveSummary: isHindi
          ? `उम्मीदवार ने ${topic} की स्पष्ट वैचारिक समझ प्रदर्शित की। उत्तरों की गहराई ठोस थी, हालांकि विश्वविद्यालय स्तर की मौखिक परीक्षा के लिए सीमा स्थितियों और तकनीकी शब्दों में अधिक सटीकता लाई जा सकती है।`
          : `The candidate demonstrated a clear foundational understanding of ${topic}. Response depth was solid, though precision regarding boundary conditions and technical keywords can be sharpened for university examinations.`,
        recommendedNextTopic: isHindi ? `${subject} - गहन अध्ययन (Deep Dive)` : `${subject} - Advanced Deep Dive`,
      },
    });
  } catch (err) {
    console.error('Final report generation failed:', err);
    res.status(500).json({ error: 'Report synthesis failed' });
  }
});

// 7. Revision mode for weak topics
app.post('/api/viva/revision', async (req, res) => {
  try {
    const { weakConcepts = [], subject = 'Computer Science', language = 'English' } = req.body;
    const isHindi = language === 'Hindi';
    const questions = weakConcepts.map((concept, idx) => ({
      id: `rev-${idx}-${Date.now()}`,
      subject,
      topic: concept,
      question: isHindi
        ? `त्वरित पुनरीक्षण प्रश्न: अपने शब्दों में बताएं कि "${concept}" क्या है और यह ${subject} में क्यों महत्वपूर्ण है?`
        : `Quick Flash Question: In your own words, define "${concept}" and explain why it is essential in ${subject}.`,
      keyConcepts: [concept, isHindi ? 'परिभाषा' : 'Definition', isHindi ? 'उपयोग' : 'Use case'],
      modelAnswer: isHindi
        ? `"${concept}" अत्यंत महत्वपूर्ण है क्योंकि यह प्रणाली की शुद्धता सुनिश्चित करता है और अप्रत्याशित विफलताओं को रोकता है।`
        : `"${concept}" is crucial because it ensures correctness and prevents unexpected system failure.`,
    }));

    res.json({ questions });
  } catch {
    res.status(500).json({ error: 'Revision question generation failed' });
  }
});

// 8. Evaluate student response in revision mode (voice or text)
app.post('/api/viva/revision/evaluate', async (req, res) => {
  try {
    const {
      subject = 'Computer Science',
      topic,
      currentQuestion,
      studentAnswer,
      language = 'English',
    } = req.body;

    if (!studentAnswer || !studentAnswer.trim()) {
      return res.status(400).json({ error: 'Student answer is required.' });
    }

    const apiKey = getApiKey(req);
    const isHindi = language === 'Hindi';

    if (apiKey) {
      const geminiResult = await evaluateTurnAndFollowUp({
        subject,
        topic: topic || currentQuestion?.topic || 'Revision Concept',
        difficulty: 'Foundational Revision',
        persona: 'Friendly Professor',
        language,
        conversationHistory: [],
        currentQuestion: currentQuestion || { question: `Explain ${topic}` },
        studentAnswer,
        questionIndex: 1,
        totalQuestions: 1,
        apiKey,
      });

      if (geminiResult) {
        return res.json({
          source: 'gemini-ai',
          isLiveAI: true,
          ...geminiResult,
        });
      }
    }

    // Heuristic Evaluation Fallback (with Unicode & Hindi concept matching)
    const cleanAnswer = studentAnswer.toLowerCase();
    const words = cleanAnswer.split(/\s+/).filter(Boolean);
    const keyConcepts = currentQuestion?.keyConcepts || [topic || 'Key Concepts'];

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
          ? `शानदार पुनरीक्षण! आपने ${conceptsCovered.slice(0, 2).join(' और ') || 'मुख्य अवधारणा'} को स्पष्ट रूप से समझाया।`
          : `अच्छा प्रयास, लेकिन ${missingConcepts.slice(0, 2).join(' और ') || 'मुख्य बिंदुओं'} पर विशेष ध्यान दें।`)
      : (finalScore >= 7.5
          ? `Great revision recall! You clearly grasped ${conceptsCovered.slice(0, 2).join(' and ')}.`
          : `Good attempt, but make sure to reinforce key points like ${missingConcepts.slice(0, 2).join(' and ')}.`);

    return res.json({
      source: 'smart-rubric-demo',
      isLiveAI: false,
      evaluation: {
        score: finalScore,
        correctness,
        conceptsCovered,
        missingConcepts,
        feedbackSummary: isHindi
          ? `${keyConcepts.length} में से ${conceptsCovered.length} पुनरीक्षण अवधारणाओं को कवर किया।`
          : `Covered ${conceptsCovered.length} of ${keyConcepts.length} core revision concepts.`,
        improvementTips: [
          missingConcepts.length > 0
            ? (isHindi
                ? `इस अवधारणा को परिभाषित करते समय "${missingConcepts[0]}" का उल्लेख अवश्य करें।`
                : `Make sure to mention "${missingConcepts[0]}" when defining this concept.`)
            : (isHindi ? 'मजबूत वैचारिक समझ का प्रदर्शन।' : 'Strong conceptual recall demonstrated.'),
        ],
        modelAnswer: currentQuestion?.modelAnswer || (isHindi
          ? 'एक पूर्ण उत्तर अवधारणा, उसके परिचालन उद्देश्य और विफलता से निपटने की व्याख्या करता है।'
          : 'A complete answer defines the concept, its operational purpose, and failure handling.'),
      },
      examinerReaction,
    });
  } catch (err) {
    console.error('Revision evaluation error:', err);
    res.status(500).json({ error: 'Failed to evaluate revision answer' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 VivaMate AI Backend running on port ${PORT}`);
  console.log(`🤖 Mode: ${process.env.GEMINI_API_KEY ? 'Gemini AI Active' : 'Smart Rubric Demo Active'}`);
});
