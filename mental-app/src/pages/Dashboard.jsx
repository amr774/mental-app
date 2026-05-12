import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import './Dashboard.css';

// ── Badge definitions ──────────────────────────────────────────────
const BADGES = [
    {
        id: 'first_mood',
        emoji: '🌱',
        label: { en: 'First Step', ar: 'الخطوة الأولى' },
        desc:  { en: 'Logged your first mood', ar: 'سجّلت مزاجك لأول مرة' },
        check: (s) => s.moodCount >= 1,
    },
    {
        id: 'week_streak',
        emoji: '🔥',
        label: { en: 'On Fire', ar: 'متحمّس' },
        desc:  { en: '7-day mood streak', ar: 'تتبّعت مزاجك ٧ أيام متتالية' },
        check: (s) => s.streak >= 7,
    },
    {
        id: 'month_streak',
        emoji: '🏆',
        label: { en: 'Consistent', ar: 'ثابت' },
        desc:  { en: '30-day mood streak', ar: 'تتبّعت مزاجك ٣٠ يوماً متتالياً' },
        check: (s) => s.streak >= 30,
    },
    {
        id: 'journalist',
        emoji: '📖',
        label: { en: 'Journalist', ar: 'كاتب' },
        desc:  { en: '5 journal entries', ar: 'كتبت ٥ مدخلات في يومياتك' },
        check: (s) => s.journalCount >= 5,
    },
    {
        id: 'pet_parent',
        emoji: '🐾',
        label: { en: 'Pet Parent', ar: 'أب/أم الحيوانات' },
        desc:  { en: 'Adopted a pet', ar: 'تبنّيت حيواناً أليفاً' },
        check: (s) => s.adoptedPetsCount >= 1,
    },
    {
        id: 'goal_setter',
        emoji: '🎯',
        label: { en: 'Goal Setter', ar: 'صاحب هدف' },
        desc:  { en: 'Completed a weekly goal', ar: 'أكملت هدفاً أسبوعياً' },
        check: (s) => s.goalsCompletedThisWeek >= 1,
    },
    {
        id: 'community',
        emoji: '💬',
        label: { en: 'Community Spirit', ar: 'روح المجتمع' },
        desc:  { en: 'Made your first post', ar: 'نشرت أول منشور لك' },
        check: (s) => s.postsCount >= 1,
    },
    {
        id: 'mood_master',
        emoji: '🌟',
        label: { en: 'Mood Master', ar: 'متتبّع المزاج' },
        desc:  { en: '30 mood logs', ar: 'سجّلت مزاجك ٣٠ مرة' },
        check: (s) => s.moodCount >= 30,
    },
];

// ── Reminder helpers ───────────────────────────────────────────────
function getReminderTime() {
    return localStorage.getItem('mh_reminder_time') || '09:00';
}

function isReminderOn() {
    return localStorage.getItem('mh_reminder_on') === '1';
}

async function requestAndScheduleReminder(time, t) {
    if (!('Notification' in window)) return false;
    let perm = Notification.permission;
    if (perm === 'default') perm = await Notification.requestPermission();
    if (perm !== 'granted') return false;

    localStorage.setItem('mh_reminder_on', '1');
    localStorage.setItem('mh_reminder_time', time);
    scheduleReminderTick(time, t);
    return true;
}

let reminderTimer = null;
function scheduleReminderTick(time, t) {
    clearTimeout(reminderTimer);
    const [h, m] = time.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const ms = target - now;
    reminderTimer = setTimeout(() => {
        if (isReminderOn()) {
            new Notification('Mindful 🧠', {
                body: t('dash.reminderBody'),
                icon: '/favicon.ico',
            });
            scheduleReminderTick(time, t);
        }
    }, ms);
}

// ── Component ──────────────────────────────────────────────────────
export default function Dashboard() {
    const { t, lang } = useLang();
    const { user } = useAuth();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reminderOn, setReminderOn] = useState(isReminderOn());
    const [reminderTime, setReminderTime] = useState(getReminderTime());
    const [notifError, setNotifError] = useState('');

    useEffect(() => {
        dashboardService.get()
            .then(setStats)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // Re-arm existing reminder on page load
    useEffect(() => {
        if (isReminderOn()) scheduleReminderTick(getReminderTime(), t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const earnedBadges = stats
        ? BADGES.filter(b => b.check(stats))
        : [];

    const lockedBadges = stats
        ? BADGES.filter(b => !b.check(stats))
        : BADGES;

    async function handleReminderToggle() {
        if (reminderOn) {
            localStorage.setItem('mh_reminder_on', '0');
            setReminderOn(false);
            clearTimeout(reminderTimer);
        } else {
            const ok = await requestAndScheduleReminder(reminderTime, t);
            if (ok) {
                setReminderOn(true);
                setNotifError('');
            } else {
                setNotifError(t('dash.notifBlocked'));
            }
        }
    }

    function handleTimeChange(e) {
        const val = e.target.value;
        setReminderTime(val);
        localStorage.setItem('mh_reminder_time', val);
        if (reminderOn) scheduleReminderTick(val, t);
    }

    const personalityMap = {
        Good:     { label: lang === 'ar' ? 'مزدهر'      : 'Flourishing',  emoji: '🌟', color: '#4ade80' },
        Calm:     { label: lang === 'ar' ? 'متوازن'     : 'Balanced',     emoji: '🌿', color: '#4ecdc4' },
        Sad:      { label: lang === 'ar' ? 'مزاج منخفض': 'Low Mood',     emoji: '💙', color: '#60a5fa' },
        Lonely:   { label: lang === 'ar' ? 'منعزل'      : 'Disconnected', emoji: '🤝', color: '#a78bfa' },
        Stressed: { label: lang === 'ar' ? 'مرهق'       : 'Overwhelmed',  emoji: '🧘', color: '#f87171' },
    };
    const pResult = stats?.personality ? personalityMap[stats.personality] : null;

    return (
        <div className="dash-page">
            {/* Header */}
            <div className="dash-header">
                <span className="dash-badge">{t('dash.badge')}</span>
                <h1 className="dash-title">
                    {t('dash.hello')}, <span className="dash-name">{user?.name?.split(' ')[0] || '👋'}</span>
                </h1>
                <p className="dash-sub">{t('dash.sub')}</p>
            </div>

            {loading ? (
                <div className="dash-loading">{t('dash.loading')}</div>
            ) : (
                <>
                    {/* Stats grid */}
                    <div className="dash-stats">
                        <StatCard icon="🔥" value={stats?.streak ?? 0}  label={t('dash.streak')}   color="var(--teal)" />
                        <StatCard icon="😊" value={stats?.moodCount ?? 0} label={t('dash.moods')} color="#60a5fa" />
                        <StatCard icon="📔" value={stats?.journalCount ?? 0} label={t('dash.journals')} color="#a78bfa" />
                        <StatCard icon="🐾" value={stats?.adoptedPetsCount ?? 0} label={t('dash.pets')} color="#f59e0b" />
                        <StatCard icon="🎯" value={stats?.goalsCompletedThisWeek ?? 0} label={t('dash.goalsWeek')} color="#4ade80" />
                        <StatCard icon="💬" value={stats?.postsCount ?? 0} label={t('dash.posts')} color="#f87171" />
                    </div>

                    {/* Personality result */}
                    {pResult && (
                        <div className="dash-section">
                            <h2 className="dash-section-title">{t('dash.personality')}</h2>
                            <div className="dash-personality" style={{ borderColor: pResult.color }}>
                                <span className="dash-p-emoji">{pResult.emoji}</span>
                                <div>
                                    <div className="dash-p-label" style={{ color: pResult.color }}>{pResult.label}</div>
                                    <div className="dash-p-sub">{t('dash.personalitySub')}</div>
                                </div>
                                <Link to="/test" className="dash-p-link">{t('dash.retakeTest')}</Link>
                            </div>
                        </div>
                    )}

                    {/* Badges earned */}
                    <div className="dash-section">
                        <h2 className="dash-section-title">
                            🏆 {t('dash.badges')} <span className="dash-badge-count">{earnedBadges.length}/{BADGES.length}</span>
                        </h2>
                        <div className="dash-badges">
                            {earnedBadges.map(b => (
                                <div key={b.id} className="dash-badge-card earned">
                                    <span className="badge-emoji">{b.emoji}</span>
                                    <div className="badge-label">{b.label[lang] || b.label.en}</div>
                                    <div className="badge-desc">{b.desc[lang] || b.desc.en}</div>
                                </div>
                            ))}
                            {lockedBadges.map(b => (
                                <div key={b.id} className="dash-badge-card locked">
                                    <span className="badge-emoji">🔒</span>
                                    <div className="badge-label">{b.label[lang] || b.label.en}</div>
                                    <div className="badge-desc">{b.desc[lang] || b.desc.en}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reminders */}
                    <div className="dash-section">
                        <h2 className="dash-section-title">🔔 {t('dash.reminders')}</h2>
                        <div className="dash-reminder-box">
                            <div className="dash-reminder-row">
                                <span className="dash-reminder-label">{t('dash.dailyReminder')}</span>
                                <button
                                    className={`dash-toggle ${reminderOn ? 'on' : 'off'}`}
                                    onClick={handleReminderToggle}
                                >
                                    {reminderOn ? t('dash.on') : t('dash.off')}
                                </button>
                            </div>
                            <div className="dash-reminder-row">
                                <span className="dash-reminder-label">{t('dash.reminderTime')}</span>
                                <input
                                    type="time"
                                    className="dash-time-input"
                                    value={reminderTime}
                                    onChange={handleTimeChange}
                                />
                            </div>
                            {notifError && <div className="dash-notif-error">{notifError}</div>}
                            <p className="dash-reminder-hint">{t('dash.reminderHint')}</p>
                        </div>
                    </div>

                    {/* Quick links */}
                    <div className="dash-section">
                        <h2 className="dash-section-title">{t('dash.quickLinks')}</h2>
                        <div className="dash-quick">
                            <QuickLink to="/mood"      icon="😊" label={t('nav.mood')} />
                            <QuickLink to="/journal"   icon="📔" label={t('nav.journal')} />
                            <QuickLink to="/goals"     icon="🎯" label={t('nav.goals')} />
                            <QuickLink to="/community" icon="💬" label={t('nav.community')} />
                            <QuickLink to="/pets"      icon="🐾" label={t('nav.pets')} />
                            <QuickLink to="/breathe"   icon="🌬️" label={t('nav.breathe')} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function StatCard({ icon, value, label, color }) {
    return (
        <div className="dash-stat-card">
            <span className="stat-icon">{icon}</span>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

function QuickLink({ to, icon, label }) {
    return (
        <Link to={to} className="dash-quick-link">
            <span className="quick-icon">{icon}</span>
            <span className="quick-label">{label}</span>
        </Link>
    );
}
