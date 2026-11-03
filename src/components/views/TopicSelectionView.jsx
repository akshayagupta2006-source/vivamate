import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Sliders, 
  AlertCircle,
  Cpu,
  Database,
  Network,
  Globe,
  Code
} from 'lucide-react';
import { SAMPLE_SUBJECTS } from '../../data/mockData';

export default function TopicSelectionView({ 
  onStartSession, 
  isLoading, 
  initialSubject = '', 
  initialTopic = '' 
}) {
  const [subject, setSubject] = useState(initialSubject || 'Operating Systems');
  const [topic, setTopic] = useState(initialTopic || 'Deadlocks & Banker\'s Algorithm');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(3);
  const [customSubjectActive, setCustomSubjectActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle subject change from dropdown
  const handleSubjectChange = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      setCustomSubjectActive(true);
      setSubject('');
      setTopic('');
    } else {
      setCustomSubjectActive(false);
      setSubject(val);
      const selected = SAMPLE_SUBJECTS.find((s) => s.name === val);
      if (selected && selected.popularTopics.length > 0) {
        setTopic(selected.popularTopics[0]);
      }
    }
    setErrorMessage('');
  };

  // Quick 1-click preset select
  const handleSelectPreset = (subName, topicName) => {
    setCustomSubjectActive(false);
    setSubject(subName);
    setTopic(topicName);
    setErrorMessage('');
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      setErrorMessage('Please select or enter a subject.');
      return;
    }
    if (!topic.trim()) {
      setErrorMessage('Please specify the topic or focus area.');
      return;
    }
    setErrorMessage('');
    onStartSession({
      subject: subject.trim(),
      topic: topic.trim(),
      difficulty,
      count: Number(questionCount),
    });
  };

  const getSubjectIcon = (name) => {
    switch (name) {
      case 'Operating Systems': return <Cpu className="w-5 h-5 text-blue-600" />;
      case 'Database Management Systems': return <Database className="w-5 h-5 text-purple-600" />;
      case 'Computer Networks': return <Network className="w-5 h-5 text-emerald-600" />;
      case 'Web Engineering & System Design': return <Globe className="w-5 h-5 text-amber-600" />;
      default: return <Code className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Title & Introduction */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
          <span>Step 1 of 2: Configure Viva Voce</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Choose Your Exam Subject & Topic
        </h1>
        <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
          Select from standard technical viva curricula or type any custom topic. Questions will be calibrated to your selected difficulty level.
        </p>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-100 p-6 sm:p-10">
        
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Subject Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">
              Subject / Course
            </label>
            {!customSubjectActive ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={subject}
                  onChange={handleSubjectChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                >
                  {SAMPLE_SUBJECTS.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                  <option value="custom">✏️ Enter Custom Subject...</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setCustomSubjectActive(true);
                    setSubject('');
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 self-center text-left sm:text-right px-2"
                >
                  Or type custom subject
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems, Machine Learning, Compiler Design"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomSubjectActive(false);
                    setSubject(SAMPLE_SUBJECTS[0].name);
                  }}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Presets
                </button>
              </div>
            )}
          </div>

          {/* Topic / Focus Area */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">
              Topic / Focus Area
            </label>
            <input
              type="text"
              placeholder="e.g. Deadlocks & Banker's Algorithm, Normalization, TCP Handshake"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            
            {/* Quick Topic Suggestions */}
            {!customSubjectActive && (
              <div className="pt-1.5 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] font-semibold text-slate-400">Suggestions:</span>
                {(SAMPLE_SUBJECTS.find((s) => s.name === subject)?.popularTopics || []).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      topic === t 
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300 font-semibold' 
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 border-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Difficulty & Number of Questions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            
            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      difficulty === lvl
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions count */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Number of Viva Questions
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { count: 3, label: '3 Questions (Quick)' },
                  { count: 5, label: '5 Questions (Standard)' },
                  { count: 7, label: '7 Questions (In-depth)' }
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setQuestionCount(item.count)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      questionCount === item.count
                        ? 'bg-purple-600 text-white border-transparent shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.count} Qs
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Launch Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-base shadow-lg shadow-indigo-200/80 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing Viva Session...</span>
                </>
              ) : (
                <>
                  <span>Begin Viva Examination</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* Curated Presets Cards Grid */}
      <div className="mt-12">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Or Quick-Select a Popular Academic Viva Preset:</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_SUBJECTS.map((s) => (
            <div
              key={s.id}
              onClick={() => handleSelectPreset(s.name, s.popularTopics[0])}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white hover:border-indigo-300 hover:shadow-md ${
                subject === s.name && topic === s.popularTopics[0]
                  ? 'border-indigo-500 ring-2 ring-indigo-100'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  {getSubjectIcon(s.name)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{s.name}</h4>
                  <p className="text-xs text-indigo-600 font-medium">{s.popularTopics[0]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
