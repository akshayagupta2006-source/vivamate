import React, { useState } from 'react';
import { 
  Sliders, 
  ArrowRight, 
  Mic, 
  Keyboard, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { SAMPLE_SUBJECTS } from '../../data/mockData';

export default function VivaConfigView({ 
  onStartSession, 
  isLoading = false,
  initialSubject = '', 
  initialTopic = '' 
}) {
  const [subject, setSubject] = useState(initialSubject || 'Operating Systems');
  const [topic, setTopic] = useState(initialTopic || 'Deadlocks & Banker\'s Algorithm');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(3);
  const [language, setLanguage] = useState('English'); // 'English' | 'Hindi'
  const [persona, setPersona] = useState('Friendly Professor'); // 'Friendly Professor' | 'Strict Examiner' | 'Technical Interviewer'
  const [examMode, setExamMode] = useState('voice'); // 'voice' | 'text'
  const [customSubjectActive, setCustomSubjectActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const personas = [
    {
      id: 'Friendly Professor',
      icon: '🎓',
      title: 'Friendly Professor',
      desc: 'Supportive & encouraging. Acknowledges partial answers and gently tests depth.',
    },
    {
      id: 'Strict Examiner',
      icon: '🧐',
      title: 'Strict Examiner',
      desc: 'Rigorous & formal. Demands exact definitions, technical terms, and conditions.',
    },
    {
      id: 'Technical Interviewer',
      icon: '💻',
      title: 'Technical Interviewer',
      desc: 'Industry focused. Probes real-world architecture, trade-offs, and scalability.',
    },
  ];

  const handleSubjectChange = (val) => {
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

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!subject.trim()) {
      setErrorMessage('Please select or type a subject.');
      return;
    }
    if (!topic.trim()) {
      setErrorMessage('Please specify the topic.');
      return;
    }

    setErrorMessage('');
    onStartSession({
      subject: subject.trim(),
      topic: topic.trim(),
      difficulty,
      count: Number(questionCount),
      language,
      persona,
      examMode,
    });
  };

  // Instant 1-click test preset
  const handleQuickDemo = (subName, topicName) => {
    setCustomSubjectActive(false);
    setSubject(subName);
    setTopic(topicName);
    setDifficulty('Intermediate');
    setQuestionCount(3);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Smart Viva Configuration</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Configure Your AI Oral Examination
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Tailor examiner persona, spoken language, subject curriculum, and examination rigor.
        </p>
      </div>

      {/* Main Glass Form */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-8 relative">
        
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Subject & Topic */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-900/60 flex items-center justify-center text-[10px] text-indigo-300">1</span>
              <span>Curriculum & Subject Selection</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Subject Area
                </label>
                {!customSubjectActive ? (
                  <select
                    value={subject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {SAMPLE_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                    <option value="custom">✏️ Custom Subject...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Distributed Systems"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCustomSubjectActive(false);
                        setSubject(SAMPLE_SUBJECTS[0].name);
                      }}
                      className="px-3 text-xs bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                    >
                      Presets
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Specific Topic / Focus Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deadlocks & Banker's Algorithm"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Quick Topic Pills */}
            {!customSubjectActive && (
              <div className="flex flex-wrap gap-1.5 items-center pt-1">
                <span className="text-[11px] text-slate-500 font-semibold">Recommended Topics:</span>
                {(SAMPLE_SUBJECTS.find((s) => s.name === subject)?.popularTopics || []).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      topic === t 
                        ? 'bg-indigo-600 text-white border-indigo-400 font-bold'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Examiner Persona Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-900/60 flex items-center justify-center text-[10px] text-indigo-300">2</span>
              <span>AI Examiner Persona</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {personas.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPersona(p.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    persona === p.id
                      ? 'bg-indigo-950/70 border-indigo-400 ring-2 ring-indigo-500/30'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <h4 className="text-sm font-bold text-white">{p.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Language & Exam Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            
            {/* Language */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Examination Language
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'English', label: 'English', sub: 'Native en-US' },
                  { id: 'Hindi', label: 'Hindi (हिंदी)', sub: 'Bilingual Hinglish' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLanguage(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      language === item.id
                        ? 'bg-indigo-600 text-white border-indigo-400 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] opacity-75">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode: Voice vs Text */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Interaction Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'voice', label: 'Voice Mode', icon: Mic, sub: 'Turn-by-turn dialogue' },
                  { id: 'text', label: 'Text Mode', icon: Keyboard, sub: 'Typing fallback ready' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setExamMode(item.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        examMode === item.id
                          ? 'bg-purple-600 text-white border-purple-400 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </div>
                      <div className="text-[10px] opacity-75">{item.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Section 4: Rigor (Difficulty & Count) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            
            {/* Difficulty */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Rigor & Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      difficulty === lvl
                        ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/30'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Question Count
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { count: 3, label: '3 Qs (Quick)' },
                  { count: 5, label: '5 Qs (Standard)' },
                  { count: 7, label: '7 Qs (In-depth)' },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setQuestionCount(item.count)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      questionCount === item.count
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/30'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {item.count} Questions
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Submit Action */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-600 to-purple-600 text-white font-black text-base shadow-xl shadow-indigo-600/40 hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>AI Examiner is Preparing Question 1...</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 text-cyan-200" />
                  <span>Enter Examination Room</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* Quick 1-Click Academic Presets */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick 1-Click Viva Presets:</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_SUBJECTS.slice(0, 4).map((s) => (
            <div
              key={s.id}
              onClick={() => handleQuickDemo(s.name, s.popularTopics[0])}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all bg-slate-900/60 hover:border-indigo-400 ${
                subject === s.name && topic === s.popularTopics[0]
                  ? 'border-indigo-400 ring-2 ring-indigo-500/20'
                  : 'border-slate-800'
              }`}
            >
              <div className="text-xs font-bold text-white">{s.name}</div>
              <div className="text-[11px] text-indigo-400 mt-0.5 truncate">{s.popularTopics[0]}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
