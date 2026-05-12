import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import './Onboarding.css';

const STEPS = [
  { icon: '🤖', titleKey: 'onboard.step1Title', descKey: 'onboard.step1Desc', route: '/chat' },
  { icon: '🧠', titleKey: 'onboard.step2Title', descKey: 'onboard.step2Desc', route: '/test' },
  { icon: '😄', titleKey: 'onboard.step3Title', descKey: 'onboard.step3Desc', route: '/mood' },
  { icon: '🌬️', titleKey: 'onboard.step4Title', descKey: 'onboard.step4Desc', route: '/breathe' },
  { icon: '📔', titleKey: 'onboard.step5Title', descKey: 'onboard.step5Desc', route: '/journal' },
];

export default function Onboarding({ onClose }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleGo = () => {
    onClose();
    navigate(current.route);
  };

  return (
    <div className="onboard-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="onboard-modal animate-fade-up">
        {/* Progress dots */}
        <div className="onboard-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`onboard-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} onClick={() => setStep(i)} />
          ))}
        </div>

        <div className="onboard-icon">{current.icon}</div>
        <h2 className="onboard-title">{t(current.titleKey)}</h2>
        <p className="onboard-desc">{t(current.descKey)}</p>

        <div className="onboard-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleGo}>
            {t('onboard.tryNow')} →
          </button>
          <button className="btn btn-primary" onClick={handleNext}>
            {isLast ? t('onboard.getStarted') : t('onboard.next')}
          </button>
        </div>

        <button className="onboard-skip" onClick={onClose}>{t('onboard.skip')}</button>
      </div>
    </div>
  );
}
