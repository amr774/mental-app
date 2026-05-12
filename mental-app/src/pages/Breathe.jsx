import { useState, useEffect, useRef } from 'react';
import { useLang } from '../context/LanguageContext';
import './Breathe.css';

const EXERCISES = [
  { key: 'box',    labelKey: 'breathe.box',    phases: ['breathe.inhale','breathe.hold','breathe.exhale','breathe.hold'],   durations: [4,4,4,4],   color: '#4ecdc4' },
  { key: '478',    labelKey: 'breathe.478',    phases: ['breathe.inhale','breathe.hold','breathe.exhale'],                  durations: [4,7,8],     color: '#a78bfa' },
  { key: 'simple', labelKey: 'breathe.simple', phases: ['breathe.inhale','breathe.exhale'],                                 durations: [4,6],       color: '#4ade80' },
];

export default function Breathe() {
  const { t } = useLang();

  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [running, setRunning]         = useState(false);
  const [phaseIdx, setPhaseIdx]       = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cycles, setCycles]           = useState(0);

  const ex = EXERCISES[exerciseIdx];
  const intervalRef = useRef(null);

  const start = () => {
    setPhaseIdx(0);
    setSecondsLeft(ex.durations[0]);
    setCycles(0);
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setPhaseIdx(0);
    setSecondsLeft(0);
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setPhaseIdx(pi => {
            const next = (pi + 1) % ex.phases.length;
            if (next === 0) setCycles(c => c + 1);
            setSecondsLeft(ex.durations[next]);
            return next;
          });
          return ex.durations[(phaseIdx + 1) % ex.phases.length];
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, phaseIdx, exerciseIdx]);

  const phase = ex.phases[phaseIdx];
  const isExpanding = phase === 'breathe.inhale';
  const isHold      = phase === 'breathe.hold';
  const totalDur    = ex.durations[phaseIdx];
  const progress    = running ? ((totalDur - secondsLeft) / totalDur) * 100 : 0;

  return (
    <div className="page breathe-page">
      <div className="animate-fade-up">
        <span className="badge badge-teal">{t('breathe.badge')}</span>
        <h1 className="display">{t('breathe.heading')}</h1>
        <p className="subtext">{t('breathe.sub')}</p>
      </div>

      {/* Exercise selector */}
      <div className="breathe-tabs animate-fade-up delay-1">
        {EXERCISES.map((e, i) => (
          <button
            key={e.key}
            className={`tab-btn ${exerciseIdx === i ? 'active' : ''}`}
            onClick={() => { setExerciseIdx(i); stop(); }}
          >
            {t(e.labelKey)}
          </button>
        ))}
      </div>

      {/* Circle animation */}
      <div className="breathe-stage animate-fade-up delay-2">
        <div
          className={`breathe-circle ${running ? (isExpanding ? 'expand' : isHold ? 'hold' : 'contract') : 'idle'}`}
          style={{ '--bc': ex.color, '--dur': `${ex.durations[phaseIdx]}s` }}
        >
          <div className="breathe-inner">
            {running ? (
              <>
                <p className="breathe-phase">{t(phase)}</p>
                <p className="breathe-seconds">{secondsLeft}</p>
              </>
            ) : (
              <p className="breathe-ready">{t('breathe.ready')}</p>
            )}
          </div>
          <svg className="breathe-progress" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--surface-2)" strokeWidth="4" />
            {running && (
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke={ex.color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            )}
          </svg>
        </div>

        {running && (
          <p className="breathe-cycles">
            {t('breathe.cycles')}: <strong>{cycles}</strong>
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="breathe-controls animate-fade-up delay-3">
        {running ? (
          <button className="btn btn-ghost" onClick={stop}>{t('breathe.stop')}</button>
        ) : (
          <button className="btn btn-primary" onClick={start}>{t('breathe.start')}</button>
        )}
      </div>

      {/* Tips */}
      <div className="card breathe-tips animate-fade-up delay-4">
        <h3 className="section-label">{t('breathe.tips')}</h3>
        <ul className="tips-list">
          <li>{t('breathe.tip1')}</li>
          <li>{t('breathe.tip2')}</li>
          <li>{t('breathe.tip3')}</li>
        </ul>
      </div>
    </div>
  );
}
