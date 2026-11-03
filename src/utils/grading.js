/**
 * VivaMate Unified Grading & Performance Classification Utility
 * Standard Institutional Grade Mapping:
 *   90–100 : A+
 *   80–89  : A
 *   70–79  : B+
 *   60–69  : B
 *   50–59  : C
 *   40–49  : D
 *   0–39   : F
 */

export function calculateGrade(rawScore) {
  if (rawScore === null || rawScore === undefined || rawScore === '') return 'F';
  const num = Number(rawScore);
  if (isNaN(num)) return 'F';
  const score = Math.round(num);

  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export function getReadinessStatus(rawScore, language = 'English') {
  if (rawScore === null || rawScore === undefined || rawScore === '') {
    return language === 'Hindi' ? 'मूल्यांकन लंबित (Not Evaluated)' : 'Not Evaluated';
  }
  const score = Math.round(Number(rawScore) || 0);
  const isHindi = language === 'Hindi';

  if (score >= 90) {
    return isHindi ? 'वाइवा मास्टर - उच्च विशिष्टता (Viva Master - High Distinction)' : 'Viva Master - High Distinction';
  }
  if (score >= 80) {
    return isHindi ? 'परीक्षा के लिए तैयार (Exam Ready - High Confidence)' : 'Exam Ready (High Confidence)';
  }
  if (score >= 70) {
    return isHindi ? 'ठोस वैचारिक आधार (Solid Conceptual Foundation)' : 'Solid Conceptual Foundation';
  }
  if (score >= 60) {
    return isHindi ? 'सामान्य समझ (Good Understanding with Minor Gaps)' : 'Good Understanding with Minor Gaps';
  }
  if (score >= 50) {
    return isHindi ? 'औसत तैयारी - अभ्यास आवश्यक (Average Preparation - Practice Needed)' : 'Average Preparation - Practice Needed';
  }
  if (score >= 40) {
    return isHindi ? 'उत्तीर्ण - लक्षित पुनरीक्षण आवश्यक (Pass with Gaps - Targeted Revision Recommended)' : 'Pass with Gaps - Targeted Revision Recommended';
  }
  return isHindi ? 'गंभीर पुनरीक्षण आवश्यक (Critical Revision Required)' : 'Critical Revision Required';
}

export function getGradeBadgeColor(grade) {
  const g = (grade || '').toUpperCase().trim();
  if (g.startsWith('A')) return 'bg-emerald-950 text-emerald-400 border-emerald-700/80';
  if (g.startsWith('B')) return 'bg-indigo-950 text-indigo-400 border-indigo-700/80';
  if (g.startsWith('C')) return 'bg-amber-950 text-amber-400 border-amber-700/80';
  if (g.startsWith('D')) return 'bg-orange-950 text-orange-400 border-orange-700/80';
  return 'bg-rose-950 text-rose-400 border-rose-700/80';
}

