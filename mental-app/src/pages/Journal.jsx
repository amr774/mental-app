import { useState, useEffect } from 'react';
import { journalService } from '../services/api';
import { useLang } from '../context/LanguageContext';
import './Journal.css';

const MOOD_OPTIONS = ['😄','😌','😐','😢','😡','😰','🥰','😴'];

export default function Journal() {
  const { t } = useLang();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);

  const [title, setTitle]     = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    journalService.getAll()
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true); setError('');
    try {
      const entry = await journalService.create({ title, content, mood });
      setEntries(prev => [entry, ...prev]);
      setTitle(''); setContent(''); setMood('');
      setWriting(false);
    } catch (e) {
      setError(e.message || t('journal.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await journalService.delete(id);
      setEntries(prev => prev.filter(e => (e._id || e.id) !== id));
    } catch {}
  };

  return (
    <div className="page">
      <div className="animate-fade-up">
        <span className="badge badge-teal">{t('journal.badge')}</span>
        <h1 className="display">{t('journal.heading')}</h1>
        <p className="subtext">{t('journal.sub')}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '20px 0 4px' }}>
        <button
          className={`btn ${writing ? 'btn-ghost' : 'btn-primary'}`}
          onClick={() => { setWriting(w => !w); setError(''); }}
        >
          {writing ? t('journal.cancel') : t('journal.newEntry')}
        </button>
      </div>

      {writing && (
        <div className="card journal-form animate-fade-up">
          <div className="input-group">
            <label className="input-label">{t('journal.title')}</label>
            <input className="input" placeholder={t('journal.titlePlaceholder')}
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="input-group">
            <label className="input-label">{t('journal.mood')}</label>
            <div className="journal-mood-picker">
              {MOOD_OPTIONS.map(m => (
                <button
                  key={m}
                  className={`mood-pick-btn ${mood === m ? 'selected' : ''}`}
                  onClick={() => setMood(m === mood ? '' : m)}
                  type="button"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t('journal.content')} *</label>
            <textarea
              className="input journal-textarea"
              rows={6}
              placeholder={t('journal.contentPlaceholder')}
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}

          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !content.trim()}
          >
            {saving ? <span className="spinner" /> : t('journal.save')}
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-3)', padding: '40px 0', textAlign: 'center' }}>{t('journal.loading')}</p>
      ) : entries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📔</p>
          <p className="subtext">{t('journal.empty')}</p>
        </div>
      ) : (
        <div className="journal-list">
          {entries.map((e, i) => {
            const id      = e._id || e.id;
            const dateStr = new Date(e.createdAt || e.created_at)
              .toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
            return (
              <div key={id} className={`card journal-entry animate-fade-up delay-${(i % 4) + 1}`}>
                <div className="journal-entry-header">
                  <div>
                    {e.mood && <span className="journal-mood">{e.mood}</span>}
                    <h3 className="journal-title">{e.title || t('journal.untitled')}</h3>
                    <p className="journal-date">{dateStr}</p>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#f87171', flexShrink: 0 }}
                    onClick={() => handleDelete(id)}
                  >
                    ✕
                  </button>
                </div>
                <p className="journal-content">{e.content}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
