import { useState, useEffect } from 'react';
import { articleService } from '../services/api';
import { useLang } from '../context/LanguageContext';

const CATEGORIES = ['', 'Mental Health', 'Anxiety', 'Depression', 'Mindfulness', 'Self-Care', 'Other', 'stress', 'sad', 'lonely', 'anxious', 'general'];

export default function Articles() {
  const { t } = useLang();
  const [articles, setArticles] = useState([]);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]       = useState(0);
  const LIMIT = 6;

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  useEffect(() => {
    setLoading(true);
    articleService.getAll(search, category, page, LIMIT)
      .then(res => {
        // Support both paginated { items, total, pages } and plain array
        if (Array.isArray(res)) {
          setArticles(res);
          setTotalPages(1);
          setTotal(res.length);
        } else {
          setArticles(res.items || []);
          setTotalPages(res.pages || 1);
          setTotal(res.total || 0);
        }
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [search, category, page]);

  return (
    <div className="page">
      <div className="animate-fade-up">
        <span className="badge badge-teal">{t('articles.badge')}</span>
        <h1 className="display" style={{ marginBottom: 8 }}>{t('articles.heading')}</h1>
        <p className="subtext">{t('articles.sub')}</p>
      </div>

      <div className="animate-fade-up delay-1" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '24px 0' }}>
        <input className="input" style={{ flex: 1, minWidth: 200 }}
          placeholder={t('articles.search')} value={search}
          onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ width: 180 }} value={category}
          onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c || t('articles.allCats')}</option>
          ))}
        </select>
      </div>

      {total > 0 && (
        <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 12 }}>
          {total} {t('articles.results')}
        </p>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-3)', padding: '40px 0', textAlign: 'center' }}>{t('articles.loading')}</p>
      ) : articles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>📰</p>
          <p className="subtext">{t('articles.notFound')}</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {articles.map((a, i) => {
              const id     = a._id || a.id;
              const isOpen = expanded === id;
              return (
                <div key={id} className={`card animate-fade-up delay-${(i % 4) + 1}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{a.title}</h3>
                        {a.category && <span className="badge badge-teal">{a.category}</span>}
                      </div>
                      {a.createdAt && (
                        <p style={{ color: 'var(--text-3)', fontSize: 12, marginBottom: 8 }}>
                          {new Date(a.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                      {a.content && (
                        <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                          {isOpen ? a.content : `${a.content.slice(0, 160)}${a.content.length > 160 ? '…' : ''}`}
                        </p>
                      )}
                    </div>
                    {a.content && a.content.length > 160 && (
                      <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}
                        onClick={() => setExpanded(isOpen ? null : id)}>
                        {isOpen ? t('articles.showLess') : t('articles.readMore')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 32 }}>
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                ← {t('articles.prev')}
              </button>
              <span style={{ color: 'var(--text-2)', fontSize: 14 }}>
                {page} / {totalPages}
              </span>
              <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                {t('articles.next')} →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
