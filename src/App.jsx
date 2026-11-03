import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import SettingsModal from './components/common/SettingsModal';
import LandingPageView from './components/views/LandingPageView';
import DashboardView from './components/views/DashboardView';
import VivaConfigView from './components/views/VivaConfigView';
import VoiceExamRoomView from './components/views/VoiceExamRoomView';
import PerformanceReportView from './components/views/PerformanceReportView';
import RevisionModeView from './components/views/RevisionModeView';

import { 
  startVivaSession, 
  submitVivaTurn, 
  generateFinalReport, 
  loadSessionHistory, 
  saveSessionToHistory, 
  checkBackendHealth,
  getSavedApiKey 
} from './services/vivaService';

export default function App() {
  // Navigation: 'landing' | 'dashboard' | 'configure' | 'viva' | 'report' | 'revision'
  const [currentScreen, setCurrentScreen] = useState('landing');

  // Examination configuration
  const [sessionConfig, setSessionConfig] = useState({
    subject: 'Operating Systems',
    topic: 'Deadlocks & Banker\'s Algorithm',
    difficulty: 'Intermediate',
    count: 3,
    language: 'English',
    persona: 'Friendly Professor',
    examMode: 'voice',
  });

  // Active examination state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [latestTurnResult, setLatestTurnResult] = useState(null);
  const [finalReport, setFinalReport] = useState(null);

  // Persistence & Dashboard state
  const [sessionHistory, setSessionHistory] = useState(() => loadSessionHistory());
  const [weakConceptsForRevision, setWeakConceptsForRevision] = useState([]);

  // System & Modal state
  const [isProcessing, setIsProcessing] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isLiveAI, setIsLiveAI] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // Check health and AI mode on mount
  useEffect(() => {
    async function checkAI() {
      const health = await checkBackendHealth();
      const hasKey = Boolean(getSavedApiKey());
      setIsLiveAI(Boolean(health.geminiConfigured || hasKey));
    }
    checkAI();
  }, []);

  const handleSettingsUpdated = async () => {
    const health = await checkBackendHealth();
    const hasKey = Boolean(getSavedApiKey());
    setIsLiveAI(Boolean(health.geminiConfigured || hasKey));
  };

  const handleNavigate = (screen) => {
    setGlobalError(null);
    setCurrentScreen(screen);
  };

  // Launch configuration from landing or dashboard
  const handleStartNewViva = (prefillSubject, prefillTopic) => {
    if (prefillSubject && prefillTopic) {
      setSessionConfig((prev) => ({
        ...prev,
        subject: prefillSubject,
        topic: prefillTopic,
      }));
    }
    setCurrentScreen('configure');
  };

  // Start viva exam session
  const handleStartSession = async (config) => {
    setSessionConfig(config);
    setIsProcessing(true);
    setGlobalError(null);

    try {
      const response = await startVivaSession(config);
      if (!response || !response.question) {
        throw new Error('Unable to generate initial viva question. Please retry.');
      }

      setCurrentQuestion(response.question);
      setQuestionIndex(1);
      setConversationHistory([]);
      setLatestTurnResult(null);
      setFinalReport(null);
      setCurrentScreen('viva');
    } catch (err) {
      console.error('Failed to start session:', err);
      setGlobalError(err.message || 'Failed to start viva session. Please check your topic and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Student submits an answer for current turn
  const handleSubmitTurn = async (studentAnswer) => {
    if (!currentQuestion) return;

    setIsProcessing(true);
    setGlobalError(null);

    try {
      const turnPayload = {
        subject: sessionConfig.subject,
        topic: sessionConfig.topic,
        difficulty: sessionConfig.difficulty,
        persona: sessionConfig.persona,
        language: sessionConfig.language,
        conversationHistory,
        currentQuestion,
        studentAnswer,
        questionIndex,
        totalQuestions: sessionConfig.count,
      };

      const result = await submitVivaTurn(turnPayload);
      setLatestTurnResult(result);

      // Record in conversation history
      setConversationHistory((prev) => [
        ...prev,
        {
          question: currentQuestion,
          studentAnswer,
          examinerReaction: result.examinerReaction,
          evaluation: result.evaluation,
        },
      ]);
    } catch (err) {
      console.error('Turn evaluation error:', err);
      setGlobalError(err.message || 'Error evaluating your response. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Proceed to next follow-up question or complete viva
  const handleProceedToNextQuestion = async () => {
    const isLast = questionIndex >= sessionConfig.count;

    if (!isLast) {
      const nextQ = latestTurnResult?.nextQuestion || {
        id: `q-followup-${questionIndex + 1}-${Date.now()}`,
        questionNumber: questionIndex + 1,
        question: `Adaptive Follow-Up: Given your response regarding ${sessionConfig.topic}, what are the key trade-offs and edge cases?`,
        keyConcepts: [sessionConfig.topic, 'Trade-offs', 'Edge Cases'],
        modelAnswer: 'A complete answer covers system constraints, latency or resource overhead, and failure handling.',
      };
      setCurrentQuestion(nextQ);
      setQuestionIndex((prev) => prev + 1);
      setLatestTurnResult(null);
    } else {
      // Completed viva: Generate final report
      setIsProcessing(true);
      try {
        const reportRes = await generateFinalReport({
          subject: sessionConfig.subject,
          topic: sessionConfig.topic,
          sessionResults: conversationHistory,
        });

        const synthReport = reportRes.report || reportRes;
        setFinalReport(synthReport);

        // Save session record to history
        const sessionRecord = {
          id: `viva-${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          subject: sessionConfig.subject,
          topic: sessionConfig.topic,
          difficulty: sessionConfig.difficulty,
          persona: sessionConfig.persona,
          language: sessionConfig.language,
          totalScore: synthReport.totalScore || 80,
          averageScoreOutOf10: synthReport.averageScoreOutOf10 || Number(((synthReport.totalScore || 80) / 10).toFixed(1)),
          conceptualScore: synthReport.conceptualScore,
          technicalScore: synthReport.technicalScore,
          completenessScore: synthReport.completenessScore,
          articulationScore: synthReport.articulationScore,
          overallGrade: synthReport.overallGrade || 'A',
          readinessStatus: synthReport.readinessStatus || 'Solid Foundation',
          weakConcepts: synthReport.weakConcepts || [],
          strongConcepts: synthReport.strongConcepts || [],
          revisionChecklist: synthReport.revisionChecklist || [],
          examinerExecutiveSummary: synthReport.examinerExecutiveSummary || '',
          sessionResults: conversationHistory,
        };

        saveSessionToHistory(sessionRecord);
        setSessionHistory(loadSessionHistory());
        setCurrentScreen('report');
      } catch (err) {
        console.error('Report generation error:', err);
        setGlobalError('Could not synthesize final report. Showing calculated summary.');
        setCurrentScreen('report');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Skip question
  const handleSkipQuestion = () => {
    const skippedEvaluation = {
      score: 0,
      correctness: 'Skipped / No Answer Provided',
      conceptsCovered: [],
      missingConcepts: currentQuestion.keyConcepts || [],
      improvementTips: ['Attempting partial concepts helps examiners award partial credit.'],
      modelAnswer: currentQuestion.modelAnswer || currentQuestion.sampleAnswer,
    };

    setConversationHistory((prev) => [
      ...prev,
      {
        question: currentQuestion,
        studentAnswer: 'Skipped by candidate',
        examinerReaction: 'Question skipped. Let us move to the next concept.',
        evaluation: skippedEvaluation,
      },
    ]);

    if (questionIndex < sessionConfig.count) {
      const nextQ = {
        id: `skip-${questionIndex + 1}-${Date.now()}`,
        questionNumber: questionIndex + 1,
        subject: sessionConfig.subject,
        topic: sessionConfig.topic,
        difficulty: sessionConfig.difficulty,
        question: `Since you skipped the previous question, let's explore another core aspect of ${sessionConfig.topic}: What is the primary operational trade-off or architectural challenge encountered when implementing it?`,
        keyConcepts: [sessionConfig.topic, 'Trade-offs', 'Architecture'],
        modelAnswer: 'A good answer identifies system overhead, latency vs throughput constraints, and error recovery.',
      };
      setCurrentQuestion(nextQ);
      setQuestionIndex((prev) => prev + 1);
      setLatestTurnResult(null);
    } else {
      handleProceedToNextQuestion();
    }
  };

  // End viva early
  const handleEndSessionEarly = () => {
    if (window.confirm('Are you sure you want to end this examination early? Current progress will be evaluated.')) {
      if (conversationHistory.length > 0) {
        handleProceedToNextQuestion();
      } else {
        setCurrentScreen('dashboard');
      }
    }
  };

  // Retake viva with same topic
  const handleRetakeViva = () => {
    handleStartSession(sessionConfig);
  };

  // Launch revision flash mode
  const handlePracticeWeakTopics = (weakConcepts) => {
    setWeakConceptsForRevision(weakConcepts || []);
    setCurrentScreen('revision');
  };

  // Review a past report from dashboard
  const handleReviewPastReport = (pastSession) => {
    setSessionConfig({
      subject: pastSession.subject,
      topic: pastSession.topic,
      difficulty: pastSession.difficulty || 'Intermediate',
      persona: pastSession.persona || 'Friendly Professor',
      language: pastSession.language || 'English',
      count: (pastSession.sessionResults || []).length || 3,
    });
    setFinalReport({
      totalScore: pastSession.totalScore,
      averageScoreOutOf10: pastSession.averageScoreOutOf10 || Number(((pastSession.totalScore || 80) / 10).toFixed(1)),
      conceptualScore: pastSession.conceptualScore || Math.min(pastSession.totalScore + 4, 98),
      technicalScore: pastSession.technicalScore || Math.max(pastSession.totalScore - 5, 45),
      completenessScore: pastSession.completenessScore || Math.max(pastSession.totalScore - 2, 50),
      articulationScore: pastSession.articulationScore || Math.min(pastSession.totalScore + 2, 95),
      overallGrade: pastSession.overallGrade,
      readinessStatus: pastSession.readinessStatus,
      strongConcepts: pastSession.strongConcepts,
      weakConcepts: pastSession.weakConcepts,
      revisionChecklist: pastSession.revisionChecklist || [],
      examinerExecutiveSummary: pastSession.examinerExecutiveSummary || '',
    });
    setConversationHistory(pastSession.sessionResults || []);
    setCurrentScreen('report');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050814] text-slate-100 font-sans antialiased selection:bg-purple-600/40 selection:text-white">
      
      {/* Sticky Futuristic Navbar */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        sessionActive={currentScreen === 'viva'}
        topicInfo={sessionConfig}
        onOpenSettings={() => setSettingsModalOpen(true)}
        isLiveAI={isLiveAI}
      />

      {/* Global Error Notice Banner */}
      {globalError && (
        <div className="max-w-4xl mx-auto px-4 mt-4 w-full">
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-sm flex items-center justify-between shadow-lg">
            <span>{globalError}</span>
            <button
              onClick={() => setGlobalError(null)}
              className="text-xs font-bold text-rose-400 hover:text-white underline ml-4"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentScreen === 'landing' && (
          <LandingPageView
            onStartViva={() => handleStartNewViva()}
            onExploreFeatures={() => {
              const el = document.getElementById('how-it-works');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onSelectTopicPreset={(sub, top) => handleStartNewViva(sub, top)}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardView
            sessionHistory={sessionHistory}
            onStartNewViva={() => handleStartNewViva()}
            onPracticeTopic={(sub, top) => handleStartNewViva(sub, top)}
            onReviewReport={handleReviewPastReport}
            onStartRevision={(weak) => handlePracticeWeakTopics(weak)}
          />
        )}

        {currentScreen === 'configure' && (
          <VivaConfigView
            onStartSession={handleStartSession}
            isLoading={isProcessing}
            initialSubject={sessionConfig.subject}
            initialTopic={sessionConfig.topic}
          />
        )}

        {currentScreen === 'viva' && (
          <VoiceExamRoomView
            config={sessionConfig}
            currentQuestion={currentQuestion}
            questionIndex={questionIndex}
            totalQuestions={sessionConfig.count}
            conversationHistory={conversationHistory}
            onSubmitTurn={handleSubmitTurn}
            onEndSessionEarly={handleEndSessionEarly}
            onSkipQuestion={handleSkipQuestion}
            isProcessing={isProcessing}
            latestTurnResult={latestTurnResult}
            onProceedToNextQuestion={handleProceedToNextQuestion}
          />
        )}

        {currentScreen === 'report' && (
          <PerformanceReportView
            config={sessionConfig}
            report={finalReport || {}}
            sessionResults={conversationHistory}
            onRetakeViva={handleRetakeViva}
            onPracticeWeakTopics={(weak) => handlePracticeWeakTopics(weak)}
            onReturnDashboard={() => setCurrentScreen('dashboard')}
          />
        )}

        {currentScreen === 'revision' && (
          <RevisionModeView
            weakConcepts={weakConceptsForRevision}
            subject={sessionConfig.subject}
            language={sessionConfig.language}
            onBackToDashboard={() => setCurrentScreen('dashboard')}
            onStartFullViva={() => handleStartNewViva()}
          />
        )}
      </main>

      {/* Universal Dark Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Settings Modal (Gemini API Key configuration) */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onSettingsUpdated={handleSettingsUpdated}
      />

    </div>
  );
}
