// Backend Gemini AI Service for VivaMate
// Handles turn-by-turn oral exam questioning, semantic evaluation,
// adaptive cross-questioning, and comprehensive viva report generation.

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// Helper to get Gemini client with server or client-provided key
export function getGeminiClient(customKey) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Robust JSON extractor for LLM output (handles markdown ```json wrappers)
export function extractAndParseJSON(rawText) {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonSubstr = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonSubstr);
    }
    throw new Error('Unable to extract valid JSON from Gemini output: ' + rawText.slice(0, 100));
  }
}

// Generate with fallback across Gemini model family
async function generateWithModelFallback(ai, prompt, responseMimeType = 'application/json', temperature = 0.85) {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastErr = null;
  for (const model of models) {
    try {
      const config = {
        temperature,
        ...(responseMimeType ? { responseMimeType } : {}),
      };
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });
      return response;
    } catch (err) {
      lastErr = err;
      if (err?.message?.includes('not found') || err?.status === 404 || err?.message?.includes('supported')) {
        console.warn(`Model ${model} not available on this key/region, trying fallback...`);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// System Persona Prompts
export function getPersonaInstruction(persona = 'Friendly Professor', language = 'English') {
  let tone = '';
  switch (persona) {
    case 'Strict Examiner':
      tone = 'You are a strict, formal university viva examiner. You scrutinize every answer for technical precision, exact definitions, and system conditions. You do not accept vague answers and challenge students on missing edge cases.';
      break;
    case 'Technical Interviewer':
      tone = 'You are a senior tech lead / engineering interviewer at a top technology firm. You focus on real-world system trade-offs, architecture, edge cases, scalability, and practical implementation details.';
      break;
    case 'Friendly Professor':
    default:
      tone = 'You are an encouraging, patient university professor conducting an oral viva voce. You guide the student, acknowledge what they got right, and gently test their depth on core concepts.';
      break;
  }

  const langInstruction = language === 'Hindi'
    ? 'You MUST conduct the viva completely in natural, articulate Hindi (Devanagari script). Standard technical terms like "deadlock", "process", "memory", "safe state", "Banker\'s algorithm" can remain in Latin/English or Devanagari script for academic clarity, but all oral questions, reactions, and explanations must be spoken in Hindi. Never output English explanations when Hindi is selected.'
    : 'Conduct the viva in clear, articulate English.';

  return `${tone} ${langInstruction} Keep your oral questions concise and spoken-friendly (2-3 sentences max) so they are easy to listen to.`;
}

/**
 * Generate the opening viva question
 */
export async function generateInitialQuestion({
  subject,
  topic,
  difficulty = 'Intermediate',
  persona = 'Friendly Professor',
  language = 'English',
  apiKey,
}) {
  const ai = getGeminiClient(apiKey);
  if (!ai) {
    return null; // Will trigger intelligent mock fallback
  }

  const focusAngles = [
    'core conceptual mechanism and foundational definition',
    'real-world architectural failure scenario and troubleshooting',
    'system design constraints, performance overheads, and practical trade-offs',
    'comparison with alternative techniques and edge conditions',
  ];
  const chosenAngle = focusAngles[Math.floor(Math.random() * focusAngles.length)];

  const langRule = language === 'Hindi'
    ? 'CRITICAL LANGUAGE RULE: Because the viva is conducted in Hindi, the oral "question", "modelAnswer", and "context" MUST be generated in natural, fluent Hindi (Devanagari script). Standard technical terms like Deadlock or Banker\'s Algorithm may remain in English, but the question itself MUST be in Hindi.'
    : 'Formulate the question in clear, articulate English.';

  const prompt = `
${getPersonaInstruction(persona, language)}

You are starting a viva voce examination.
Subject: ${subject}
Topic: ${topic}
Difficulty Level: ${difficulty}
Session Focus Angle: ${chosenAngle}
${langRule}

Task: Formulate the FIRST question for this oral examination focusing on ${chosenAngle}. It should be conceptual, clear, and test understanding. Make it distinct, engaging, and suitable for a university viva.

Return ONLY a valid JSON object matching this schema:
{
  "questionNumber": 1,
  "question": "string (the exact question the examiner will speak aloud)",
  "context": "string (brief internal note on what the examiner expects the student to know)",
  "keyConcepts": ["string", "string", "string"],
  "modelAnswer": "string (a high quality 2-3 sentence reference answer)"
}
`;

  try {
    const response = await generateWithModelFallback(ai, prompt, 'application/json', 0.85);
    return extractAndParseJSON(response.text);
  } catch (err) {
    console.error('Gemini generateInitialQuestion error:', err?.message || err);
    return null;
  }
}

/**
 * Evaluate student answer, generate examiner reaction, and formulate the NEXT follow-up question
 */
export async function evaluateTurnAndFollowUp({
  subject,
  topic,
  difficulty = 'Intermediate',
  persona = 'Friendly Professor',
  language = 'English',
  conversationHistory = [],
  currentQuestion,
  studentAnswer,
  questionIndex,
  totalQuestions,
  apiKey,
}) {
  const ai = getGeminiClient(apiKey);
  if (!ai) {
    return null;
  }

  const isLastQuestion = questionIndex >= totalQuestions;

  const previousQuestions = [
    currentQuestion?.question,
    ...conversationHistory.map((h) => h.question?.question || h.question || ''),
  ].filter(Boolean);

  const langRule = language === 'Hindi'
    ? `CRITICAL LANGUAGE REQUIREMENT: Because the examination language is Hindi:
   - Formulate 'examinerReaction', 'nextQuestion.question', 'nextQuestion.modelAnswer', 'nextQuestion.context', 'evaluation.feedbackSummary', and 'evaluation.improvementTips' strictly in natural, articulate Hindi (Devanagari script).
   - Technical terms (Deadlock, Safe State, Banker's Algorithm, etc.) may be mentioned in English or Hindi, but all feedback and follow-up question sentences must be in Hindi.`
    : '';

  const prompt = `
${getPersonaInstruction(persona, language)}

Subject: ${subject}
Topic: ${topic}
Target Difficulty: ${difficulty}
Current Question (Q${questionIndex} of ${totalQuestions}): "${currentQuestion?.question}"
Expected Key Concepts: ${JSON.stringify(currentQuestion?.keyConcepts || [])}
Student's Spoken Answer: "${studentAnswer}"

Previous examination history:
${conversationHistory.map((h, i) => `Turn ${i + 1}: Q: ${h.question?.question || h.question} | Student: ${h.studentAnswer}`).join('\n')}

Already Asked Questions in this session:
${previousQuestions.map((q) => `- "${q}"`).join('\n')}
${langRule}

Tasks:
1. SEMANTIC EVALUATION:
   - Evaluate conceptual understanding, technical accuracy, relevance, and completeness (score 0 to 10).
   - Identify which key concepts were covered and which critical points/keywords were omitted.
   - Note: Student's answer may be in Hindi or English (Hinglish technical response). Evaluate its conceptual meaning fairly.
   - Provide constructive, actionable feedback.
2. EXAMINER ORAL REACTION:
   - Speak 1-2 natural sentences reacting to the student's answer in persona.
3. ${isLastQuestion ? 'EXAM CONCLUSION: No next question needed since this is the final question.' : `GENUINELY ADAPTIVE FOLLOW-UP QUESTION (Q${questionIndex + 1}):
   - STRICT CONSTRAINT: Do NOT repeat, rephrase, or ask about the exact same scenario as ANY of the already asked questions listed above.
   - ADAPTIVE LOGIC:
     * If the student missed key concepts or gave a partial/vague answer, formulate a direct probing follow-up targeting the specific missing concept or misconception.
     * If the student answered comprehensively with high technical precision, escalate to an advanced cross-question exploring system design trade-offs, architecture, edge cases, or failure recovery building upon what they just said.
     * Keep the question spoken-friendly and concise (2-3 sentences max).`}

Return ONLY a valid JSON object matching this schema:
{
  "evaluation": {
    "score": number (between 0.0 and 10.0),
    "correctness": "string ('Correct & Comprehensive' | 'Partially Correct' | 'Needs Improvement')",
    "conceptsCovered": ["string"],
    "missingConcepts": ["string"],
    "feedbackSummary": "string",
    "improvementTips": ["string", "string"],
    "modelAnswer": "string"
  },
  "examinerReaction": "string (natural spoken reaction from examiner)",
  ${!isLastQuestion ? `
  "nextQuestion": {
    "questionNumber": ${questionIndex + 1},
    "question": "string (spoken next viva question)",
    "context": "string",
    "keyConcepts": ["string"],
    "modelAnswer": "string",
    "difficulty": "string (adapted level)"
  }
  ` : `"nextQuestion": null`}
}
`;

  try {
    const response = await generateWithModelFallback(ai, prompt, 'application/json', 0.8);
    return extractAndParseJSON(response.text);
  } catch (err) {
    console.error('Gemini evaluateTurnAndFollowUp error:', err?.message || err);
    return null;
  }
}

/**
 * Generate a subtle hint when student is stuck
 */
export async function generateAIHint({ question, topic, language = 'English', apiKey }) {
  const ai = getGeminiClient(apiKey);
  if (!ai) return null;

  const prompt = `
You are a helpful academic examiner.
Question: "${question}"
Topic: "${topic}"
Language: ${language}

Task: Give a small, subtle conceptual hint (1 sentence) that guides the student toward the answer without directly giving away the solution.
${language === 'Hindi' ? 'CRITICAL: The hint MUST be written in clear Hindi (Devanagari script).' : 'The hint must be in English.'}

Return JSON:
{
  "hint": "string"
}
`;

  try {
    const response = await generateWithModelFallback(ai, prompt, 'application/json');
    return extractAndParseJSON(response.text);
  } catch (err) {
    console.error('Gemini generateAIHint error:', err?.message || err);
    return null;
  }
}

/**
 * Clarify or rephrase question in simpler terms
 */
export async function clarifyQuestion({ question, topic, language = 'English', apiKey }) {
  const ai = getGeminiClient(apiKey);
  if (!ai) return null;

  const prompt = `
You are an examiner clarifying a question for a student who asked: "Could you rephrase or clarify the question?"
Original Question: "${question}"
Topic: "${topic}"
Language: ${language}

Task: Rephrase the question in simpler, more direct terms in 1-2 sentences.
${language === 'Hindi' ? 'CRITICAL: The clarification MUST be written in clear Hindi (Devanagari script).' : 'The clarification must be in English.'}

Return JSON:
{
  "clarification": "string"
}
`;

  try {
    const response = await generateWithModelFallback(ai, prompt, 'application/json');
    return extractAndParseJSON(response.text);
  } catch (err) {
    console.error('Gemini clarifyQuestion error:', err?.message || err);
    return null;
  }
}

/**
 * Generate comprehensive final viva performance report
 */
export async function generateFinalReport({
  subject,
  topic,
  sessionResults = [],
  language = 'English',
  apiKey,
}) {
  const ai = getGeminiClient(apiKey);
  if (!ai) return null;

  const prompt = `
Act as an academic examination board. Review this complete student viva examination session and generate an official performance evaluation report.

Subject: ${subject}
Topic: ${topic}
Language of Examination: ${language}
Session Transcript & Evaluations:
${JSON.stringify(sessionResults, null, 2)}

Tasks:
1. Synthesize overall performance into a score out of 100.
2. Provide sub-scores out of 100 for: Conceptual Understanding, Technical Accuracy, Completeness, and Articulation.
3. Determine Letter Grade strictly using this institutional scale:
   - 90–100: A+
   - 80–89: A
   - 70–79: B+
   - 60–69: B
   - 50–59: C
   - 40–49: D
   - 0–39: F
4. Provide Examiner Readiness Diagnosis.
5. Identify Mastered Concepts and Critical Weak Concepts that need revision.
6. Provide actionable revision suggestions and recommended next practice topics.
${language === 'Hindi' ? 'LANGUAGE RULE: Since the viva was conducted in Hindi, the fields "readinessStatus", "revisionChecklist", "examinerExecutiveSummary", and "recommendedNextTopic" MUST be written in natural, formal Hindi (Devanagari script).' : ''}

Return ONLY a valid JSON object matching this schema:
{
  "totalScore": number (out of 100),
  "averageScoreOutOf10": number (out of 10),
  "conceptualScore": number (out of 100),
  "technicalScore": number (out of 100),
  "completenessScore": number (out of 100),
  "articulationScore": number (out of 100),
  "overallGrade": "string",
  "readinessStatus": "string (e.g. 'Viva Ready - High Distinction' | 'Solid Conceptual Foundation' | 'Needs Targeted Revision')",
  "strongConcepts": ["string"],
  "weakConcepts": ["string"],
  "revisionChecklist": ["string"],
  "examinerExecutiveSummary": "string (3-4 sentences summarizing performance and examiner impressions)",
  "recommendedNextTopic": "string"
}
`;

  try {
    const response = await generateWithModelFallback(ai, prompt, 'application/json');
    return extractAndParseJSON(response.text);
  } catch (err) {
    console.error('Gemini generateFinalReport error:', err?.message || err);
    return null;
  }
}
