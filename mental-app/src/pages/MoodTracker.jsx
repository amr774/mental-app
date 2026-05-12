import { useState, useEffect } from 'react';
import { moodService } from '../services/api';
import { useLang } from '../context/LanguageContext';
import MoodCalendar from '../components/MoodCalendar';
import './MoodTracker.css';

export default function MoodTracker() {
  const { t } = useLang();

  const MOODS = [
    { emoji: '😄', label: t('mood.happy'),   color: '#4ade80', key: 'happy'   },
    { emoji: '😌', label: t('mood.calm'),    color: '#4ecdc4', key: 'calm'    },
    { emoji: '😐', label: t('mood.neutral'), color: '#94a3b8', key: 'neutral' },
    { emoji: '😢', label: t('mood.sad'),     color: '#60a5fa', key: 'sad'     },
    { emoji: '😡', label: t('mood.angry'),   color: '#f87171', key: 'angry'   },
  ];

  const getMoodMeta = (emoji) => MOODS.find(m => m.emoji === emoji) || { color: '#555', label: emoji };

  // Helper: get a valid date string from a mood entry (handles both Mongoose 'createdAt' and old 'created_at')
  const getEntryDate = (entry) => entry.date || entry.createdAt || entry.created_at;

  const [history, setHistory]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await moodService.getHistory();
        setHistory(data);
        const today = new Date().toLocaleDateString();
        const todayEntry = data.find(h => {
          const d = getEntryDate(h);
          return d && new Date(d).toLocaleDateString() === today;
        });
        if (todayEntry) setSelected(todayEntry.mood);
      } catch {
        setError(t('mood.errorLoad'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveMood = async (emoji) => {
    if (saving) return;
    setSaving(true); setError(null);
    try {
      const newEntry = await moodService.log(emoji);
      setSelected(emoji);
      const today = new Date().toLocaleDateString();
      setHistory(prev => {
        const filtered = prev.filter(h => {
          const d = getEntryDate(h);
          return d && new Date(d).toLocaleDateString() !== today;
        });
        return [newEntry, ...filtered];
      });
    } catch {
      setError(t('mood.errorSave'));
    } finally {
      setSaving(false);
    }
  };

  // ── Streak calculation ──────────────────────────────
  const calcStreak = (entries) => {
    if (!entries.length) return 0;
    const days = [...new Set(
      entries
        .map(e => getEntryDate(e))
        .filter(Boolean)
        .map(d => new Date(d).toLocaleDateString())
    )].sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < days.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (days[i] === expected.toLocaleDateString()) {
        streak++;
      } else break;
    }
    return streak;
  };

  const streak = calcStreak(history);

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const moodCounts = MOODS.reduce((acc, m) => {
    acc[m.emoji] = history.filter(h => h.mood === m.emoji).length;
    return acc;
  }, {});
  const maxCount = Math.max(...Object.values(moodCounts), 1);

  return (
    <div className="page">
      <div className="animate-fade-up">
        <div className="mood-date">{todayStr}</div>
        <h1 className="display mood-heading">{t('mood.heading')}</h1>
        <p className="subtext">{t('mood.sub')}</p>
      </div>

      {/* Streak badge */}
      {streak > 0 && (
        <div className="streak-banner animate-fade-up">
          <span className="streak-fire">🔥</span>
          <div>
            <p className="streak-count">{streak} {t('mood.streakDays')}</p>
            <p className="streak-sub">{t('mood.streakMsg')}</p>
          </div>
        </div>
      )}

      {error && <div style={{ color: '#f87171', marginBottom: 12, fontSize: 14 }}>{error}</div>}

      <div className="mood-picker animate-fade-up delay-1">
        {MOODS.map((mood) => (
          <button
            key={mood.key}
            className={`mood-btn ${selected === mood.emoji ? 'active' : ''}`}
            style={{ '--mood-color': mood.color }}
            onClick={() => saveMood(mood.emoji)}
            disabled={saving}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-label">{mood.label}</span>
          </button>
        ))}
      </div>

      <div className="card mood-chart animate-fade-up delay-2">
        <h3 className="chart-title">{t('mood.summary')}</h3>
        {loading ? (
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>{t('mood.loading')}</p>
        ) : (
          <div className="chart-bars">
            {MOODS.map((m) => {
              const count = moodCounts[m.emoji];
              const pct   = (count / maxCount) * 100;
              return (
                <div key={m.key} className="bar-row">
                  <span className="bar-emoji">{m.emoji}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%`, background: m.color }} />
                  </div>
                  <span className="bar-count">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mood Calendar */}
      {!loading && history.length > 0 && (
        <div className="card animate-fade-up delay-3" style={{ marginBottom: 28, overflowX: 'auto' }}>
          <MoodCalendar history={history} />
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className="mood-history animate-fade-up delay-3">
          <h3 className="history-title">{t('mood.recent')}</h3>
          <div className="history-list">
            {history.slice(0, 10).map((h, i) => {
              const meta    = getMoodMeta(h.mood);
              const rawDate = getEntryDate(h);
              const dateStr = rawDate
                ? new Date(rawDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : '—';
              return (
                <div key={i} className="history-item" style={{ '--c': meta.color }}>
                  <span className="history-emoji">{h.mood}</span>
                  <span className="history-label">{meta.label}</span>
                  <span className="history-date">{dateStr}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
