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
import { MOCK_QUESTIONS_DATABASE, generateCustomMockQuestions } from '../src/data/mockData.js';

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
  currentQuestion,
  _studentAnswer,
  questionIndex,
  _totalQuestions,
  conversationHistory = [],
  evaluation = {},
}) {
  const previousQuestions = [
    currentQuestion?.question || '',
    ...(conversationHistory || []).map((h) => h.question?.question || h.question || ''),
  ].filter(Boolean).map((q) => q.toLowerCase());

  const normalizedTopic = (topic || '').toLowerCase();
  let pool = [];
  if (normalizedTopic.includes('deadlock') || normalizedTopic.includes('banker')) {
    pool = MOCK_QUESTIONS_DATABASE['os-deadlocks'] || [];
  } else if (normalizedTopic.includes('acid') || normalizedTopic.includes('transaction')) {
    pool = MOCK_QUESTIONS_DATABASE['dbms-acid'] || [];
  } else if (normalizedTopic.includes('handshake') || normalizedTopic.includes('tcp')) {
    pool = MOCK_QUESTIONS_DATABASE['cn-tcp'] || [];
  } else if (normalizedTopic.includes('tree') || normalizedTopic.includes('avl')) {
    pool = MOCK_QUESTIONS_DATABASE['dsa-trees'] || [];
  }

  const missing = evaluation.missingConcepts || [];
  const covered = evaluation.conceptsCovered || [];
  const score = evaluation.score || 5;

  // 1. If student struggled or omitted critical concepts, generate a targeted diagnostic probe
  if (missing.length > 0) {
    const targetGap = missing[0];
    return {
      id: `adaptive-probe-${questionIndex + 1}-${Date.now()}`,
      questionNumber: questionIndex + 1,
      subject,
      topic,
      difficulty: 'Targeted Remediation',
      question: `You explained part of the concept, but didn't touch upon "${targetGap}". In the context of ${topic}, how does "${targetGap}" operate and how is it addressed?`,
      context: `Adaptive follow-up probing student's missed concept: ${targetGap}`,
      keyConcepts: [targetGap, topic, 'Mechanism', 'Prevention/Handling'],
      modelAnswer: `A thorough explanation of ${targetGap} defines the mechanism and how it specifically contributes to or mitigates issues in ${topic}.`,
    };
  }

  // 2. If student demonstrated high mastery, select an unasked question from the curated pool
  const unaskedInPool = pool.filter((q) => {
    const text = (q.question || '').toLowerCase();
    return !previousQuestions.some((prev) => prev.includes(text.slice(0, 30)) || text.includes(prev.slice(0, 30)));
  });

  if (unaskedInPool.length > 0) {
    const chosen = unaskedInPool[0];
    const coveredHighlight = covered.length > 0 ? `You had a solid grasp of ${covered.slice(0, 2).join(' and ')}. ` : '';
    return {
      ...chosen,
      questionNumber: questionIndex + 1,
      question: `${coveredHighlight}Now let's delve deeper: ${chosen.question}`,
    };
  }

  // 3. Fallback scenario question building on their answered concepts
  const anchor = covered[0] || topic;
  return {
    id: `adaptive-scenario-${questionIndex + 1}-${Date.now()}`,
    questionNumber: questionIndex + 1,
    subject,
    topic,
    difficulty: score >= 7.5 ? 'Advanced Systems' : 'Intermediate Concept',
    question: score >= 7.5
      ? `Strong explanation on ${anchor}. Now consider a distributed, high-concurrency production system: How does this mechanism scale, and what failure modes or bottlenecks occur?`
      : `You've touched upon ${anchor}. Can you compare this approach with an alternative method in ${subject}, and explain the core trade-offs between them?`,
    context: `Adaptive analytical follow-up building on: ${anchor}`,
    keyConcepts: [topic, 'Trade-offs', 'System Design', 'Failure Modes'],
    modelAnswer: `An exemplary response evaluates architectural constraints, scalability limits, and design compromises.`,
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
    const normalizedTopic = topic.toLowerCase();
    let fallbackQuestions = null;

    if (normalizedTopic.includes('deadlock') || normalizedTopic.includes('banker')) {
      fallbackQuestions = MOCK_QUESTIONS_DATABASE['os-deadlocks'];
    } else if (normalizedTopic.includes('acid') || normalizedTopic.includes('transaction')) {
      fallbackQuestions = MOCK_QUESTIONS_DATABASE['dbms-acid'];
    } else if (normalizedTopic.includes('handshake') || normalizedTopic.includes('tcp')) {
      fallbackQuestions = MOCK_QUESTIONS_DATABASE['cn-tcp'];
    } else if (normalizedTopic.includes('tree') || normalizedTopic.includes('avl')) {
      fallbackQuestions = MOCK_QUESTIONS_DATABASE['dsa-trees'];
    }

    const pool = (fallbackQuestions && fallbackQuestions.length > 0)
      ? fallbackQuestions
      : generateCustomMockQuestions(subject, topic, 4);

    const firstQ = pool[Math.floor(Math.random() * pool.length)] || pool[0];

    return res.json({
      source: 'smart-rubric-demo',
      isLiveAI: false,
      disclaimer: 'Curated Rubric Mode — Connect Gemini API key in settings or backend .env for dynamic AI generation.',
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

    const examinerReaction = finalScore >= 7.5
      ? `Good explanation! You clearly grasped ${conceptsCovered.slice(0, 2).join(' and ')}.`
      : `You touched upon the idea, but missed critical points such as ${missingConcepts.slice(0, 2).join(' and ')}.`;

    const isLast = questionIndex >= totalQuestions;
    let nextQuestion = null;

    if (!isLast) {
      // Dynamically formulate adaptive question based on student's actual performance and answers
      nextQuestion = generateAdaptiveFallbackQuestion({
        subject,
        topic,
        difficulty,
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

    return res.json({
      source: 'smart-rubric-demo',
      isLiveAI: false,
      disclaimer: 'Evaluated with curated rubric criteria. Connect Gemini API key for live semantic evaluation.',
      evaluation: {
        score: finalScore,
        correctness,
        conceptsCovered,
        missingConcepts,
        feedbackSummary: `Covered ${conceptsCovered.length} of ${keyConcepts.length} core concepts.`,
        improvementTips: [
          missingConcepts.length > 0 ? `Explicitly mention "${missingConcepts[0]}" when answering oral questions.` : 'Good technical terminology used.',
          'State real-world trade-offs or operational impact to get full marks in viva voce.',
        ],
        modelAnswer: currentQuestion.sampleAnswer || 'Ideal answer covers all primary definitions and edge cases.',
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
    const { question, topic } = req.body;
    const apiKey = getApiKey(req);

    if (apiKey) {
      const hintData = await generateAIHint({ question, topic, apiKey });
      if (hintData) {
        return res.json({ source: 'gemini-ai', ...hintData });
      }
    }

    return res.json({
      source: 'smart-rubric-demo',
      hint: `Think about how the core principles of ${topic} affect memory, CPU states, or transaction atomicity. What happens if a resource cannot be preempted?`,
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

    if (apiKey) {
      const clarified = await clarifyQuestion({ question, topic, language, apiKey });
      if (clarified) {
        return res.json({ source: 'gemini-ai', ...clarified });
      }
    }

    return res.json({
      source: 'smart-rubric-demo',
      clarification: `In simpler terms: The examiner is asking for the core mechanism behind "${question}". Focus on defining the conditions, why they matter, and what problem they prevent.`,
    });
  } catch {
    res.status(500).json({ error: 'Clarification failed' });
  }
});

// 6. Comprehensive Final Report Synthesis
app.post('/api/viva/final-report', async (req, res) => {
  try {
    const { subject, topic, sessionResults = [] } = req.body;
    const apiKey = getApiKey(req);

    if (apiKey && sessionResults.length > 0) {
      const geminiReport = await generateFinalReport({
        subject,
        topic,
        sessionResults,
        apiKey,
      });

      if (geminiReport) {
        return res.json({
          source: 'gemini-ai',
          isLiveAI: true,
          report: geminiReport,
        });
      }
    }

    // Heuristic Fallback Report
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
        revisionChecklist: [
          'Review the formal definitions and conditions for ' + topic,
          'Practice speaking the exact technical terms out loud to improve fluency',
          'Memorize at least one real-world architectural example or code snippet',
        ],
        examinerExecutiveSummary: `The candidate demonstrated a clear foundational understanding of ${topic}. Response depth was solid, though precision regarding boundary conditions and technical keywords can be sharpened for university examinations.`,
        recommendedNextTopic: `${subject} - Advanced Deep Dive`,
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
    const { weakConcepts = [], subject = 'Computer Science' } = req.body;
    const questions = weakConcepts.map((concept, idx) => ({
      id: `rev-${idx}-${Date.now()}`,
      subject,
      topic: concept,
      question: `Quick Flash Question: In your own words, define "${concept}" and explain why it is essential in ${subject}.`,
      keyConcepts: [concept, 'Definition', 'Use case'],
      modelAnswer: `"${concept}" is crucial because it ensures correctness and prevents unexpected system failure.`,
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

    // Heuristic Evaluation Fallback
    const cleanAnswer = studentAnswer.toLowerCase();
    const words = cleanAnswer.split(/\s+/).filter(Boolean);
    const keyConcepts = currentQuestion?.keyConcepts || [topic || 'Key Concepts'];

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
      ? `Great revision recall! You clearly grasped ${conceptsCovered.slice(0, 2).join(' and ')}.`
      : `Good attempt, but make sure to reinforce key points like ${missingConcepts.slice(0, 2).join(' and ')}.`;

    return res.json({
      source: 'smart-rubric-demo',
      isLiveAI: false,
      evaluation: {
        score: finalScore,
        correctness,
        conceptsCovered,
        missingConcepts,
        feedbackSummary: `Covered ${conceptsCovered.length} of ${keyConcepts.length} core revision concepts.`,
        improvementTips: [
          missingConcepts.length > 0
            ? `Make sure to mention "${missingConcepts[0]}" when defining this concept.`
            : 'Strong conceptual recall demonstrated.',
        ],
        modelAnswer: currentQuestion?.modelAnswer || 'A complete answer defines the concept, its operational purpose, and failure handling.',
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
