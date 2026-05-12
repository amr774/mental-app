import { useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';
import { goalService } from '../services/api';
import './Goals.css';

// ── Helpers ────────────────────────────────────────────────────────
function getMondayOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getWeekDays(mondayDate) {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(mondayDate);
        d.setDate(mondayDate.getDate() + i);
        return d;
    });
}

function dateKey(date) {
    return date.toISOString().slice(0, 10);
}

const DAY_LABELS = {
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    ar: ['إث', 'ث', 'أر', 'خ', 'ج', 'س', 'أح'],
};

const EMOJI_OPTIONS = ['🎯','🏃','📚','💪','🧘','🥗','💧','😴','🎨','🎵','🌱','❤️','🧠','✍️','🚶'];

// ── Component ──────────────────────────────────────────────────────
export default function Goals() {
    const { t, lang } = useLang();

    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', emoji: '🎯', targetDays: 7 });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const monday = getMondayOfWeek();
    const weekDays = getWeekDays(monday);
    const weekStartStr = dateKey(monday);
    const todayStr = dateKey(new Date());

    useEffect(() => {
        goalService.getAll()
            .then(setGoals)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    async function handleCreate(e) {
        e.preventDefault();
        if (!form.title.trim()) { setError(t('goals.errorTitle')); return; }
        setSaving(true);
        setError('');
        try {
            const g = await goalService.create({
                title: form.title.trim(),
                emoji: form.emoji,
                targetDays: Number(form.targetDays),
                weekStart: weekStartStr,
            });
            setGoals(prev => [g, ...prev]);
            setForm({ title: '', emoji: '🎯', targetDays: 7 });
            setShowForm(false);
        } catch (err) {
            setError(err.message || t('goals.errorCreate'));
        } finally {
            setSaving(false);
        }
    }

    async function handleToggle(goalId, dayKey) {
        try {
            const updated = await goalService.toggleDay(goalId, dayKey);
            setGoals(prev => prev.map(g => g._id === goalId ? updated : g));
        } catch { /* ignore */ }
    }

    async function handleDelete(goalId) {
        try {
            await goalService.delete(goalId);
            setGoals(prev => prev.filter(g => g._id !== goalId));
        } catch { /* ignore */ }
    }

    const weekGoals = goals.filter(g => g.weekStart === weekStartStr);
    const otherGoals = goals.filter(g => g.weekStart !== weekStartStr);

    function progressPct(goal) {
        const done = goal.completedDays.filter(d => weekDays.some(wd => dateKey(wd) === d)).length;
        return Math.round((done / goal.targetDays) * 100);
    }

    return (
        <div className="goals-page">
            {/* Header */}
            <div className="goals-header">
                <span className="goals-badge">{t('goals.badge')}</span>
                <h1 className="goals-title">{t('goals.heading')}</h1>
                <p className="goals-sub">{t('goals.sub')}</p>
            </div>

            {/* Week label */}
            <div className="goals-week-bar">
                <span className="goals-week-label">
                    {t('goals.week')}: {monday.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short' })}
                    {' – '}
                    {weekDays[6].toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short' })}
                </span>
                <button className="goals-add-btn" onClick={() => setShowForm(v => !v)}>
                    {showForm ? t('goals.cancel') : `+ ${t('goals.addGoal')}`}
                </button>
            </div>

            {/* Add form */}
            {showForm && (
                <form className="goals-form" onSubmit={handleCreate}>
                    <div className="goals-form-row">
                        <div className="goals-emoji-picker">
                            {EMOJI_OPTIONS.map(em => (
                                <button
                                    key={em} type="button"
                                    className={`emoji-opt ${form.emoji === em ? 'selected' : ''}`}
                                    onClick={() => setForm(f => ({ ...f, emoji: em }))}
                                >{em}</button>
                            ))}
                        </div>
                    </div>
                    <div className="goals-form-row">
                        <input
                            className="goals-input"
                            placeholder={t('goals.titlePh')}
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        />
                    </div>
                    <div className="goals-form-row goals-form-row--split">
                        <label className="goals-field-label">{t('goals.targetDays')}</label>
                        <select
                            className="goals-select"
                            value={form.targetDays}
                            onChange={e => setForm(f => ({ ...f, targetDays: e.target.value }))}
                        >
                            {[1,2,3,4,5,6,7].map(n => (
                                <option key={n} value={n}>{n} {t('goals.days')}</option>
                            ))}
                        </select>
                    </div>
                    {error && <div className="goals-error">{error}</div>}
                    <button className="goals-submit" type="submit" disabled={saving}>
                        {saving ? '…' : t('goals.create')}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="goals-empty">{t('goals.loading')}</div>
            ) : weekGoals.length === 0 && !showForm ? (
                <div className="goals-empty-state">
                    <div className="goals-empty-icon">🎯</div>
                    <p>{t('goals.empty')}</p>
                    <button className="goals-add-btn" onClick={() => setShowForm(true)}>
                        {t('goals.addFirst')}
                    </button>
                </div>
            ) : (
                <>
                    {/* Day header row */}
                    {weekGoals.length > 0 && (
                        <div className="goals-day-header">
                            <div className="goals-day-title-col" />
                            {weekDays.map((d, i) => (
                                <div
                                    key={i}
                                    className={`goals-day-col ${dateKey(d) === todayStr ? 'today' : ''}`}
                                >
                                    <span className="day-abbr">{DAY_LABELS[lang]?.[i] || DAY_LABELS.en[i]}</span>
                                    <span className="day-num">{d.getDate()}</span>
                                </div>
                            ))}
                            <div className="goals-day-pct-col">{t('goals.progress')}</div>
                            <div className="goals-day-del-col" />
                        </div>
                    )}

                    {/* Goals for this week */}
                    {weekGoals.map(goal => {
                        const pct = progressPct(goal);
                        const done = goal.completedDays.filter(d => weekDays.some(wd => dateKey(wd) === d)).length;
                        const complete = done >= goal.targetDays;
                        return (
                            <div key={goal._id} className={`goals-row ${complete ? 'complete' : ''}`}>
                                <div className="goals-row-title">
                                    <span className="goals-row-emoji">{goal.emoji}</span>
                                    <span className="goals-row-name">{goal.title}</span>
                                </div>
                                {weekDays.map((d, i) => {
                                    const k = dateKey(d);
                                    const checked = goal.completedDays.includes(k);
                                    const isToday = k === todayStr;
                                    return (
                                        <button
                                            key={i}
                                            className={`goals-day-btn ${checked ? 'checked' : ''} ${isToday ? 'today' : ''}`}
                                            onClick={() => handleToggle(goal._id, k)}
                                            title={d.toLocaleDateString()}
                                        >
                                            {checked ? '✓' : ''}
                                        </button>
                                    );
                                })}
                                <div className="goals-pct-col">
                                    <div className="goals-pct-bar">
                                        <div className="goals-pct-fill" style={{ width: `${pct}%`, background: complete ? '#4ade80' : 'var(--teal)' }} />
                                    </div>
                                    <span className="goals-pct-text">{pct}%</span>
                                </div>
                                <button className="goals-del-btn" onClick={() => handleDelete(goal._id)}>✕</button>
                            </div>
                        );
                    })}
                </>
            )}

            {/* Previous weeks */}
            {otherGoals.length > 0 && (
                <div className="goals-past">
                    <h3 className="goals-past-title">{t('goals.past')}</h3>
                    {otherGoals.map(g => {
                        const done = g.completedDays.length;
                        const pct = Math.min(100, Math.round((done / (g.targetDays * 7)) * 100));
                        return (
                            <div key={g._id} className="goals-past-row">
                                <span>{g.emoji} {g.title}</span>
                                <span className="goals-past-pct">{done} / {g.targetDays * 7} {t('goals.days')}</span>
                                <button className="goals-del-btn" onClick={() => handleDelete(g._id)}>✕</button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
