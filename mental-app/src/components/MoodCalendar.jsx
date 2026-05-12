import { useMemo } from 'react';
import { useLang } from '../context/LanguageContext';
import './MoodCalendar.css';

const MOOD_COLOR = {
  '😄': '#4ade80',
  '😌': '#4ecdc4',
  '😐': '#94a3b8',
  '😢': '#60a5fa',
  '😡': '#f87171',
  '😰': '#fbbf24',
  '🥰': '#f472b6',
  '😴': '#a78bfa',
};

const MONTH_NAMES_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_NAMES_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const DAY_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAY_AR = ['أحد','اثن','ثلا','أرب','خمس','جمع','سبت'];

// Helper: get a usable date string from an entry (handles Mongoose 'createdAt' and old 'created_at')
const getEntryDate = (h) => h.date || h.createdAt || h.created_at;

export default function MoodCalendar({ history = [] }) {
  const { t, lang } = useLang();
  const MONTHS = lang === 'ar' ? MONTH_NAMES_AR : MONTH_NAMES_EN;
  const DAYS   = lang === 'ar' ? DAY_AR : DAY_EN;

  // Build a map: "YYYY-MM-DD" → mood emoji
  const moodMap = useMemo(() => {
    const map = {};
    history.forEach(h => {
      const raw = getEntryDate(h);
      if (!raw) return;
      const d = new Date(raw);
      if (isNaN(d.getTime())) return;           // skip invalid dates
      const key = d.toISOString().slice(0, 10);
      map[key] = h.mood;
    });
    return map;
  }, [history]);

  // Build 52 weeks × 7 days grid (364 days back from today)
  const weeks = useMemo(() => {
    const today  = new Date();
    today.setHours(0, 0, 0, 0);

    // Start on Sunday 52 weeks ago
    const start = new Date(today);
    start.setDate(start.getDate() - 363);
    // Align to Sunday
    start.setDate(start.getDate() - start.getDay());

    const allWeeks = [];
    let current = new Date(start);

    while (current <= today) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const iso = current.toISOString().slice(0, 10);
        week.push({
          date:   new Date(current),
          iso,
          mood:   moodMap[iso] || null,
          future: current > today,
        });
        current.setDate(current.getDate() + 1);
      }
      allWeeks.push(week);
    }
    return allWeeks;
  }, [moodMap]);

  // Month labels: find first week where month changes
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const m = week[0].date.getMonth();
      if (m !== lastMonth) {
        labels.push({ wi, name: MONTHS[m] });
        lastMonth = m;
      }
    });
    return labels;
  }, [weeks, MONTHS]);

  return (
    <div className="mood-calendar">
      <h3 className="section-label" style={{ marginBottom: 16 }}>{t('mood.calendar')}</h3>

      <div className="cal-scroll">
        {/* Month row */}
        <div className="cal-months" style={{ gridTemplateColumns: `28px repeat(${weeks.length}, 14px)` }}>
          <div />
          {weeks.map((_, wi) => {
            const label = monthLabels.find(l => l.wi === wi);
            return (
              <div key={wi} className="cal-month-label">
                {label ? label.name : ''}
              </div>
            );
          })}
        </div>

        <div className="cal-body">
          {/* Day labels */}
          <div className="cal-day-labels">
            {DAYS.map((d, i) => (
              <div key={i} className="cal-day-label">{i % 2 === 1 ? d : ''}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="cal-grid" style={{ gridTemplateColumns: `repeat(${weeks.length}, 14px)` }}>
            {weeks.map((week, wi) =>
              week.map((cell, di) => {
                const color = cell.mood ? MOOD_COLOR[cell.mood] : null;
                const title = cell.mood
                  ? `${cell.iso} — ${cell.mood}`
                  : cell.future ? '' : cell.iso;
                return (
                  <div
                    key={`${wi}-${di}`}
                    className={`cal-cell ${cell.future ? 'cal-future' : ''}`}
                    style={{
                      gridColumn: wi + 1,
                      gridRow: di + 1,
                      background: color
                        ? color
                        : cell.future
                        ? 'transparent'
                        : 'var(--surface-2)',
                      boxShadow: color ? `0 0 6px ${color}55` : 'none',
                    }}
                    title={title}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="cal-legend">
        <span className="cal-legend-label">{t('mood.calLess')}</span>
        <div className="cal-cell" style={{ background:'var(--surface-2)' }} />
        {Object.entries(MOOD_COLOR).map(([emoji, color]) => (
          <div key={emoji} className="cal-legend-item" title={emoji}>
            <div className="cal-cell" style={{ background: color }} />
            <span>{emoji}</span>
          </div>
        ))}
        <span className="cal-legend-label">{t('mood.calMore')}</span>
      </div>
    </div>
  );
}
