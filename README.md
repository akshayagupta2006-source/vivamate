# VivaMate – Premium AI-Powered Voice Viva Platform

An intelligent, futuristic oral exam preparation and viva voce defense platform. Powered by Google Gemini 2.5 Flash, real-time Web Speech Recognition, and Speech Synthesis, VivaMate simulates genuine turn-by-turn oral examinations with adaptive cross-questioning, semantic concept gap detection, multi-language support (English & Hindi), and student analytics.

---

## 🌟 Highlights & Key Capabilities

- **🎙️ True Turn-by-Turn AI Voice Examination**:
  - The AI examiner speaks questions aloud using natural voice synthesis.
  - The student speaks their technical response into the microphone.
  - Live speech-to-text with continuous interim transcripts and text editing fallback.
  - Gemini AI evaluates conceptual depth, technical precision, and flags missing keywords.
  - The examiner reacts conversationally and asks dynamic cross-questions based on what the student said.
- **✨ Animated AI Examiner Orb**:
  - 4 dynamic visual states: *Idle*, *Speaking*, *Listening*, and *Evaluating/Thinking*.
  - Live audio equalizer waveform visualization.
- **🧠 3 Examiner Personalities**:
  - 🎓 **Friendly Professor**: Supportive, patient, guides when stuck.
  - 🧐 **Strict Examiner**: Rigorous, formal, demands exact definitions and conditions.
  - 💻 **Technical Interviewer**: Explores real-world architecture, trade-offs, and edge cases.
- **🌐 Multi-Language Support**:
  - Native **English** (`en-US`) and **Hindi** (`hi-IN` / bilingual Hinglish).
- **💡 In-Exam Assistance**:
  - 💡 **AI Hint**: Subtle conceptual nudges without giving away full answers.
  - ❓ **Clarify / Rephrase**: Simplifies questions on demand.
  - 🔁 **Repeat Question**: Re-speaks the current question.
- **📊 Student Analytics Dashboard**:
  - Streak tracker, average score, curriculum progress bars, and weak topics radar.
  - Session history persisted in `localStorage`.
- **⚡ AI Flash Revision Mode**:
  - Targeted drill mode focusing exclusively on concepts missed in previous exams.
- **📄 Printable Performance Reports**:
  - 4-dimensional score breakdown (Conceptual Depth, Technical Accuracy, Completeness, Articulation), question-by-question audit, model answers, and printable PDF styling.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide React, Canvas Confetti |
| **Voice Engine** | Web Speech Recognition API (`SpeechRecognition`), Web Speech Synthesis API (`speechSynthesis`) |
| **Backend** | Node.js, Express, CORS, Dotenv |
| **AI Integration** | Official `@google/genai` SDK (`gemini-2.5-flash`) |
| **Fallback Engine** | Curated semantic rubric engine with honest demonstration mode labels |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for Live Gemini AI)
Copy `.env.example` to `.env`:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_BASE_URL=http://localhost:5000
```
> **Note**: You can also enter your `GEMINI_API_KEY` directly in the in-app **Settings Modal** (gear icon in the top navigation). If no key is entered, VivaMate operates in **Smart Rubric Demo Mode**.

### 3. Run Both Frontend and Backend
```bash
npm run server  # Runs Express backend on port 5000
npm run dev     # Runs Vite frontend on port 5173
```
Or run both concurrently:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Quality Verification

```bash
npm run lint   # Oxlint (0 warnings, 0 errors)
npm run build  # Vite production build (Clean compilation in ~1.3s)
```
