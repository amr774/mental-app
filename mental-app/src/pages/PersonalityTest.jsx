import { useState } from 'react';
import { personalityService } from '../services/api';
import { useLang } from '../context/LanguageContext';
import './PersonalityTest.css';

const TYPE_SCORE = { Good: 1, Calm: 2, Sad: 3, Lonely: 4, Stressed: 5 };

export default function PersonalityTest() {
  const { t, isRTL } = useLang();

  const QUESTIONS = t('test.questions');
  const RESULTS   = t('test.results');

  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult]   = useState(null);

  const total    = QUESTIONS.length;
  const progress = (step / total) * 100;

  const handleAnswer = (type) => {
    const updated = [...answers, type];
    setAnswers(updated);

    if (step + 1 < total) {
      setStep(s => s + 1);
    } else {
      const count = {};
      updated.forEach(a => { count[a] = (count[a] || 0) + 1; });
      const winner = Object.keys(count).reduce((a, b) => count[a] > count[b] ? a : b);
      setResult(RESULTS[winner]);
      localStorage.setItem('mh_testResult', winner);
      const numericAnswers = updated.map(a => TYPE_SCORE[a] ?? 1);
      personalityService.submit(numericAnswers).catch(() => {});
    }
  };

  const reset = () => { setStep(0); setAnswers([]); setResult(null); };

  if (result) {
    return (
      <div className="page test-page" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="result-card card animate-fade-up" style={{ '--rc': result.color }}>
          <div className="result-emoji">{result.emoji}</div>
          <div className="badge badge-teal result-badge">{t('test.complete')}</div>
          <h2 className="display result-label">{result.label}</h2>
          <p className="subtext result-tip">{result.tip}</p>
          <button className="btn btn-primary result-btn" onClick={reset}>
            {t('test.retake')}
          </button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step];

  return (
    <div className="page test-page" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="test-meta animate-fade-up">
        <span className="test-counter">{step + 1} / {total}</span>
        <div className="test-progress-track">
          <div className="test-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="test-card card animate-fade-up delay-1" key={step}>
        <p className="test-question">{q.q}</p>
        <div className="test-options">
          {q.options.map((opt, i) => (
            <button key={i} className="test-option" onClick={() => handleAnswer(opt.type)}>
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
