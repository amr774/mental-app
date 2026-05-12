import { useState, useEffect } from 'react';
import { articleService, adminService, petService, storeService, orderService } from '../services/api';
import { useLang } from '../context/LanguageContext';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import './Admin.css';

const CATEGORIES = ['Mental Health', 'Anxiety', 'Depression', 'Mindfulness', 'Self-Care', 'Other'];
const PERSONALITIES = ['Calm', 'Social', 'Anxious', 'Playful', 'Gentle'];
const PIE_COLORS = ['#4ade80','#4ecdc4','#a78bfa','#f87171','#60a5fa','#fbbf24'];
const STORE_CATS = ['general', 'books', 'electronics', 'toys', 'other'];
const STORE_CONDS = ['new', 'like-new', 'good', 'fair'];
const CONDITION_COLOR = { new: '#4ade80', 'like-new': '#4ecdc4', good: '#94a3b8', fair: '#fbbf24' };

// ── CSV helper ────────────────────────────────────────
function downloadCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r[h] ?? '').toString().replace(/"/g,'""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Admin() {
  const { t } = useLang();

  const [tab, setTab]           = useState('overview');
  const [articles, setArticles] = useState([]);
  const [users, setUsers]       = useState([]);
  const [pets, setPets]         = useState([]);
  const [stats, setStats]       = useState(null);
  const [personalityResults, setPersonalityResults] = useState([]);

  // Article form
  const [title, setTitle]       = useState('');
  const [content, setContent]   = useState('');
  const [category, setCategory] = useState('Mental Health');

  // Pet form — unified object like storeForm
  const EMPTY_PET = { name: '', type: 'cat', personality: '', description: '', image: '', price: '', contact: '', status: 'available' };
  const [petForm,     setPetForm]     = useState(EMPTY_PET);
  const [petImgError, setPetImgError] = useState(false);
  const [editingPet,   setEditingPet]       = useState(null);
  const [editPetImgErr,setEditPetImgErr]    = useState(false);

  // Store state
  const [storeItems,    setStoreItems]    = useState([]);
  const [storeForm,     setStoreForm]     = useState({
    title: '', description: '', price: '', category: 'general',
    condition: 'new', image: '', contact: 'mindfulstore@support.com',
  });
  const [editingStore,  setEditingStore]  = useState(null);  // item being edited inline
  const [storeImgError, setStoreImgError] = useState(false);
  const [editImgError,  setEditImgError]  = useState(false);

  const [editingArticle, setEditingArticle] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    articleService.getAll('', '', 1, 100).then(res => {
      setArticles(Array.isArray(res) ? res : res.items || []);
    }).catch(() => {});
    adminService.getUsers().then(d => setUsers(d.users || [])).catch(() => {});
    petService.getAll().then(setPets).catch(() => {});
    adminService.getStats().then(d => setStats(d.stats)).catch(() => {});
    adminService.getPersonalityResults().then(d => setPersonalityResults(d.results || d || [])).catch(() => {});
    storeService.getAllAdmin().then(setStoreItems).catch(() => {});
    orderService.getAll().then(setOrders).catch(() => {});
  }, []);

  // ── Articles ──────────────────────────────────────────
  const addArticle = async () => {
    if (!title.trim()) return;
    setError('');
    try {
      const a = await articleService.create(title, content, category);
      setArticles(prev => [...prev, a]);
      setTitle(''); setContent(''); setCategory('Mental Health');
    } catch (e) { setError(e.message || 'Failed to create article'); }
  };

  const removeArticle = async (id) => {
    setError('');
    try {
      await articleService.remove(id);
      setArticles(prev => prev.filter(a => (a._id || a.id) !== id));
    } catch (e) { setError(e.message || 'Failed to delete article'); }
  };

  const saveArticleEdit = async () => {
    if (!editingArticle) return;
    setError('');
    try {
      const updated = await articleService.update(editingArticle.id, {
        title: editingArticle.title, content: editingArticle.content, category: editingArticle.category,
      });
      setArticles(prev => prev.map(a => (a._id || a.id) === editingArticle.id ? { ...a, ...updated } : a));
      setEditingArticle(null);
    } catch (e) { setError(e.message || 'Failed to update article'); }
  };

  // ── Pets ─────────────────────────────────────────────
  const addPet = async () => {
    if (!petForm.name.trim()) return;
    setError('');
    try {
      const p = await petService.create({
        name:        petForm.name.trim(),
        type:        petForm.type,
        personality: petForm.personality,
        description: petForm.description,
        image:       petForm.image,
        price:       Number(petForm.price) || 0,
        contact:     petForm.contact,
        status:      petForm.status,
      });
      setPets(prev => [...prev, p]);
      setPetForm(EMPTY_PET);
      setPetImgError(false);
    } catch (e) { setError(e.message || 'Failed to create pet'); }
  };

  const savePetEdit = async () => {
    if (!editingPet) return;
    setError('');
    try {
      const updated = await petService.update(editingPet._id || editingPet.id, {
        name:        editingPet.name,
        type:        editingPet.type,
        personality: editingPet.personality,
        description: editingPet.description,
        image:       editingPet.image,
        price:       Number(editingPet.price) || 0,
        contact:     editingPet.contact || '',
        status:      editingPet.status || 'available',
      });
      setPets(prev => prev.map(p => (p._id || p.id) === (editingPet._id || editingPet.id) ? updated : p));
      setEditingPet(null);
      setEditPetImgErr(false);
    } catch (e) { setError(e.message || 'Failed to update pet'); }
  };

  const deletePet = async (id) => {
    setError('');
    try {
      await petService.remove(id);
      setPets(prev => prev.filter(p => (p._id || p.id) !== id));
    } catch (e) { setError(e.message || 'Failed to delete pet'); }
  };

  // ── Users ─────────────────────────────────────────────
  const removeUser = async (id) => {
    setError('');
    try {
      await adminService.deleteUser(id);
      setUsers(prev => prev.filter(u => (u._id || u.id) !== id));
    } catch (e) { setError(e.message || 'Failed to delete user'); }
  };

  // ── Store ─────────────────────────────────────────────
  const addStoreItem = async () => {
    if (!storeForm.title.trim() || !storeForm.price) return;
    setError('');
    try {
      const item = await storeService.create({
        ...storeForm,
        price: Number(storeForm.price),
      });
      setStoreItems(prev => [item, ...prev]);
      setStoreForm({ title: '', description: '', price: '', category: 'general', condition: 'new', image: '', contact: 'mindfulstore@support.com' });
      setStoreImgError(false);
    } catch (e) { setError(e.message || 'Failed to add item'); }
  };

  const saveStoreEdit = async () => {
    if (!editingStore) return;
    setError('');
    try {
      const updated = await storeService.update(editingStore._id, {
        ...editingStore,
        price: Number(editingStore.price),
      });
      setStoreItems(prev => prev.map(i => i._id === editingStore._id ? updated : i));
      setEditingStore(null);
      setEditImgError(false);
    } catch (e) { setError(e.message || 'Failed to update item'); }
  };

  const deleteStoreItem = async (id) => {
    setError('');
    try {
      await storeService.remove(id);
      setStoreItems(prev => prev.filter(i => i._id !== id));
    } catch (e) { setError(e.message || 'Failed to delete item'); }
  };

  const markStoreSold = async (id) => {
    setError('');
    try {
      await storeService.markSold(id);
      setStoreItems(prev => prev.map(i => i._id === id ? { ...i, status: 'sold' } : i));
    } catch (e) { setError(e.message || 'Failed to mark sold'); }
  };

  const markStoreAvailable = async (id) => {
    setError('');
    try {
      const updated = await storeService.update(id, { status: 'available' });
      setStoreItems(prev => prev.map(i => i._id === id ? updated : i));
    } catch (e) { setError(e.message || 'Failed to update'); }
  };

  // ── Orders ───────────────────────────────────────────
  const updateOrderStatus = async (id, status) => {
    setError('');
    try {
      const updated = await orderService.updateStatus(id, status);
      setOrders(prev => prev.map(o => (o._id || o.id) === id ? { ...o, status: updated.status } : o));
    } catch (e) { setError(e.message || 'Failed to update order'); }
  };

  // ── Chart data ────────────────────────────────────────
  const STATS = stats
    ? [
        { label: t('admin.totalUsers'),    value: stats.totalUsers,            icon: '👥', color: 'var(--teal)'     },
        { label: t('admin.totalArticles'), value: stats.totalArticles,         icon: '📰', color: 'var(--lavender)' },
        { label: t('admin.totalPets'),     value: stats.totalPets,             icon: '🐾', color: 'var(--amber)'    },
        { label: t('admin.totalTests'),    value: stats.totalPersonalityTests, icon: '🧠', color: 'var(--rose)'     },
        { label: t('admin.store'),         value: storeItems.length,           icon: '🛍️', color: '#60a5fa'         },
      ]
    : [
        { label: t('admin.totalUsers'),    value: users.length,              icon: '👥', color: 'var(--teal)'     },
        { label: t('admin.totalArticles'), value: articles.length,           icon: '📰', color: 'var(--lavender)' },
        { label: t('admin.totalPets'),     value: pets.length,               icon: '🐾', color: 'var(--amber)'    },
        { label: t('admin.totalTests'),    value: personalityResults.length, icon: '🧠', color: 'var(--rose)'     },
        { label: t('admin.store'),         value: storeItems.length,         icon: '🛍️', color: '#60a5fa'         },
      ];

  // Personality pie data
  const personalityCount = personalityResults.reduce((acc, r) => {
    acc[r.result] = (acc[r.result] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(personalityCount).map(([name, value]) => ({ name, value }));

  // Category bar data
  const catCount = articles.reduce((acc, a) => {
    const key = a.category || 'Other';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(catCount).map(([name, count]) => ({ name, count }));

  const TABS = [
    { key: 'overview',    label: t('admin.overview')    },
    { key: 'charts',      label: t('admin.charts')      },
    { key: 'orders',      label: `🛒 ${t('admin.orders')}${orders.length ? ` (${orders.length})` : ''}` },
    { key: 'articles',    label: t('admin.articles')    },
    { key: 'pets',        label: t('admin.pets')        },
    { key: 'store',       label: '🛍️ ' + t('admin.store') },
    { key: 'users',       label: t('admin.users')       },
    { key: 'personality', label: t('admin.personality') },
  ];

  return (
    <div className="page-wide">
      <div className="admin-header animate-fade-up">
        <div>
          <span className="badge badge-lavender">{t('admin.badge')}</span>
          <h1 className="display admin-title">{t('admin.dashboard')}</h1>
        </div>
      </div>

      {error && (
        <div style={{ color: '#fc8181', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div className="admin-tabs animate-fade-up delay-1">
        {TABS.map(({ key, label }) => (
          <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="animate-fade-up delay-2">
          <div className="stats-grid">
            {STATS.map(s => (
              <div key={s.label} className="stat-card card" style={{ '--sc': s.color }}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value ?? '…'}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="section-label">{t('admin.recentArticles')}</h3>
            {articles.length === 0 ? (
              <p className="empty-hint">{t('admin.noArticles')}</p>
            ) : (
              <div className="preview-list">
                {articles.slice(-5).reverse().map(a => (
                  <div key={a._id || a.id} className="preview-row">
                    <span className="preview-dot" />
                    <span>{a.title}</span>
                    {a.createdAt && <span className="preview-date">{new Date(a.createdAt).toLocaleDateString()}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Charts ── */}
      {tab === 'charts' && (
        <div className="animate-fade-up delay-1">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flexWrap: 'wrap' }}>
            <div className="card">
              <h3 className="section-label">{t('admin.personalityChart')}</h3>
              {pieData.length === 0 ? (
                <p className="empty-hint">{t('admin.noPersonality')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card">
              <h3 className="section-label">{t('admin.articlesByCategory')}</h3>
              {barData.length === 0 ? (
                <p className="empty-hint">{t('admin.noArticles')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} margin={{ top: 8, right: 8, left: -24, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 11 }} angle={-35} textAnchor="end" />
                    <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#4ecdc4" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* CSV Export */}
          <div className="card" style={{ marginTop: 20 }}>
            <h3 className="section-label">{t('admin.exportData')}</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={() =>
                downloadCSV(users.map(u => ({ name: u.name || '', email: u.email || '', role: u.role || '', joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '' })), 'users.csv')
              }>⬇ {t('admin.exportUsers')}</button>
              <button className="btn btn-ghost btn-sm" onClick={() =>
                downloadCSV(articles.map(a => ({ title: a.title || '', category: a.category || '', date: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '' })), 'articles.csv')
              }>⬇ {t('admin.exportArticles')}</button>
              <button className="btn btn-ghost btn-sm" onClick={() =>
                downloadCSV(personalityResults.map(r => ({ user: r.userId?.email || r.userId || '', result: r.result || '', date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '' })), 'personality.csv')
              }>⬇ {t('admin.exportPersonality')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Orders ── */}
      {tab === 'orders' && (
        <div className="animate-fade-up delay-1">
          {orders.length === 0 ? (
            <p className="empty-hint" style={{ padding: '20px 0' }}>{t('admin.noOrders')}</p>
          ) : (
            <div className="admin-list">
              {orders.map(order => {
                const oid = order._id || order.id;
                const STATUS_COLORS = {
                  pending:   { bg: 'rgba(251,191,36,0.12)',  color: '#d97706' },
                  confirmed: { bg: 'rgba(78,205,196,0.12)',  color: '#0d9488' },
                  cancelled: { bg: 'rgba(248,113,113,0.12)', color: '#dc2626' },
                  delivered: { bg: 'rgba(74,222,128,0.12)',  color: '#16a34a' },
                };
                const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                return (
                  <div key={oid} className="card" style={{ padding: '16px 20px', marginBottom: 12 }}>
                    {/* Order header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                      <span style={{ fontWeight: 800, color: 'var(--teal)', fontSize: 13 }}>
                        #{oid?.slice(-6).toUpperCase()}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                      </span>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        borderRadius: 20, padding: '2px 12px',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {t(`admin.status.${order.status}`) || order.status}
                      </span>
                      <span style={{ marginLeft: 'auto', fontWeight: 800, color: 'var(--text)', fontSize: 15 }}>
                        {order.totalAmount} {t('store.currency')}
                      </span>
                    </div>

                    {/* Customer info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                      <span>👤 {order.customer?.fullName}</span>
                      <span>📧 {order.customer?.email}</span>
                      <span>📞 {order.customer?.phone}</span>
                      <span>📍 {order.customer?.governorate}</span>
                      <span style={{ gridColumn: '1 / -1' }}>🏠 {order.customer?.address}</span>
                      <span>💳 {order.paymentMethod === 'visa' ? '💳 Visa' : '💵 ' + t('checkout.cash')}</span>
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>{t('admin.orderItems')}:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {order.items?.map((item, idx) => (
                          <span key={idx} style={{
                            background: 'var(--bg)', border: '1px solid var(--border)',
                            borderRadius: 8, padding: '4px 10px', fontSize: 12,
                          }}>
                            {item.itemType === 'pet' ? '🐾' : '📦'} {item.name} — {item.price} {t('store.currency')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Status update */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['pending','confirmed','cancelled','delivered'].map(s => (
                        <button
                          key={s}
                          className={`btn btn-sm ${order.status === s ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => updateOrderStatus(oid, s)}
                          disabled={order.status === s}
                          style={{ fontSize: 11 }}
                        >
                          {t(`admin.status.${s}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Articles ── */}
      {tab === 'articles' && (
        <div className="animate-fade-up delay-1">
          <div className="card admin-form">
            <h3 className="section-label">{t('admin.addArticle')}</h3>
            <div className="input-group">
              <label className="input-label">{t('admin.title')}</label>
              <input className="input" placeholder={t('admin.title') + '…'} value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">{t('admin.content')}</label>
              <textarea className="input admin-textarea" placeholder={t('admin.content') + '…'} value={content} onChange={e => setContent(e.target.value)} rows={3} />
            </div>
            <div className="input-group">
              <label className="input-label">{t('admin.category')}</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={addArticle} disabled={!title.trim()}>{t('admin.publish')}</button>
          </div>

          <div className="admin-list">
            {articles.length === 0 && <p className="empty-hint" style={{ padding: '20px 0' }}>{t('admin.noArticles')}</p>}
            {[...articles].reverse().map(a => {
              const id = a._id || a.id;
              const isEditing = editingArticle?.id === id;
              return (
                <div key={id} className="admin-list-item card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
                  {isEditing ? (
                    <>
                      <div className="input-group">
                        <label className="input-label">{t('admin.title')}</label>
                        <input className="input" value={editingArticle.title} onChange={e => setEditingArticle(p => ({ ...p, title: e.target.value }))} />
                      </div>
                      <div className="input-group">
                        <label className="input-label">{t('admin.content')}</label>
                        <textarea className="input admin-textarea" rows={3} value={editingArticle.content} onChange={e => setEditingArticle(p => ({ ...p, content: e.target.value }))} />
                      </div>
                      <div className="input-group">
                        <label className="input-label">{t('admin.category')}</label>
                        <select className="input" value={editingArticle.category} onChange={e => setEditingArticle(p => ({ ...p, category: e.target.value }))}>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary btn-sm" onClick={saveArticleEdit}>{t('admin.save')}</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingArticle(null)}>{t('admin.cancel')}</button>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div className="article-info" style={{ flex: 1 }}>
                        <p className="article-title">{a.title}</p>
                        {a.category && <span className="badge badge-teal">{a.category}</span>}
                        {a.content && <p className="article-content">{a.content}</p>}
                        {a.createdAt && <span className="article-date">{new Date(a.createdAt).toLocaleDateString()}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingArticle({ id, title: a.title, content: a.content || '', category: a.category || 'Mental Health' })}>{t('admin.edit')}</button>
                        <button className="btn btn-danger btn-sm" onClick={() => removeArticle(id)}>{t('admin.delete')}</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Pets ── */}
      {tab === 'pets' && (
        <div className="animate-fade-up delay-1">
          <div className="card admin-form">
            <h3 className="section-label">➕ {t('admin.addPet')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="input-group">
                <label className="input-label">{t('admin.petName')} *</label>
                <input className="input" placeholder={t('admin.petName') + '…'}
                  value={petForm.name} onChange={e => setPetForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">{t('admin.petType')}</label>
                <select className="input" value={petForm.type} onChange={e => setPetForm(f => ({ ...f, type: e.target.value }))}>
                  {['cat','dog','bird','fish','rabbit','hamster','turtle'].map(t2 => (
                    <option key={t2} value={t2}>{t2.charAt(0).toUpperCase() + t2.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">{t('admin.petPersonality')}</label>
                <select className="input" value={petForm.personality} onChange={e => setPetForm(f => ({ ...f, personality: e.target.value }))}>
                  <option value="">— select —</option>
                  {PERSONALITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">📌 {t('admin.status')}</label>
                <select className="input" value={petForm.status} onChange={e => setPetForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="available">{t('admin.available')}</option>
                  <option value="sold">{t('admin.markSold')}</option>
                </select>
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">{t('admin.petDesc')}</label>
                <textarea className="input admin-textarea" rows={2}
                  placeholder={t('admin.petDesc') + '…'}
                  value={petForm.description}
                  onChange={e => setPetForm(f => ({ ...f, description: e.target.value }))}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div className="input-group">
                <label className="input-label">💰 {t('admin.price')}</label>
                <input className="input" type="number" min="0" placeholder="0"
                  value={petForm.price} onChange={e => setPetForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">📞 {t('admin.contact')}</label>
                <input className="input" placeholder="+20 100 000 0000"
                  value={petForm.contact} onChange={e => setPetForm(f => ({ ...f, contact: e.target.value }))} />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">🖼️ {t('admin.imageUrl')}</label>
                <input className="input" placeholder="https://…" value={petForm.image}
                  onChange={e => { setPetForm(f => ({ ...f, image: e.target.value })); setPetImgError(false); }} />
                {petForm.image && !petImgError && (
                  <img src={petForm.image} alt="preview" className="admin-img-preview"
                       onError={() => setPetImgError(true)} />
                )}
                {petImgError && <p className="admin-img-error">⚠️ {t('admin.imgError')}</p>}
              </div>
            </div>
            <button className="btn btn-primary" onClick={addPet} disabled={!petForm.name.trim()}>{t('admin.addPetBtn')}</button>
          </div>
          <div className="admin-list">
            {pets.length === 0 && <p className="empty-hint" style={{ padding: '20px 0' }}>{t('admin.noPets')}</p>}
            {[...pets].reverse().map(p => {
              const id = p._id || p.id;
              const isEditing = editingPet && (editingPet._id || editingPet.id) === id;
              return (
                <div key={id} className="card" style={{ padding: '16px 20px', marginBottom: 10 }}>
                  {isEditing ? (
                    /* ── Inline Edit ── */
                    <div style={{ width: '100%' }}>
                      <h4 style={{ color: 'var(--teal)', marginBottom: 16, fontSize: 14 }}>✏️ {t('admin.editing')}: {p.name}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="input-group">
                          <label className="input-label">{t('admin.petName')}</label>
                          <input className="input" value={editingPet.name}
                            onChange={e => setEditingPet(s => ({ ...s, name: e.target.value }))} />
                        </div>
                        <div className="input-group">
                          <label className="input-label">{t('admin.petType')}</label>
                          <input className="input" value={editingPet.type}
                            onChange={e => setEditingPet(s => ({ ...s, type: e.target.value }))} />
                        </div>
                        <div className="input-group">
                          <label className="input-label">{t('admin.petPersonality')}</label>
                          <select className="input" value={editingPet.personality}
                            onChange={e => setEditingPet(s => ({ ...s, personality: e.target.value }))}>
                            <option value="">— select —</option>
                            {PERSONALITIES.map(pp => <option key={pp} value={pp}>{pp}</option>)}
                          </select>
                        </div>
                        <div className="input-group">
                          <label className="input-label">{t('admin.petDesc')}</label>
                          <input className="input" value={editingPet.description}
                            onChange={e => setEditingPet(s => ({ ...s, description: e.target.value }))} />
                        </div>
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="input-label">🖼️ {t('admin.imageUrl')}</label>
                          <input className="input" placeholder="https://…" value={editingPet.image || ''}
                            onChange={e => { setEditingPet(s => ({ ...s, image: e.target.value })); setEditPetImgErr(false); }} />
                          {editingPet.image && !editPetImgErr && (
                            <img src={editingPet.image} alt="preview" className="admin-img-preview"
                                 onError={() => setEditPetImgErr(true)} />
                          )}
                          {editPetImgErr && <p className="admin-img-error">⚠️ {t('admin.imgError')}</p>}
                        </div>
                        <div className="input-group">
                          <label className="input-label">💰 {t('admin.price')}</label>
                          <input className="input" type="number" min="0" value={editingPet.price || 0}
                            onChange={e => setEditingPet(s => ({ ...s, price: e.target.value }))} />
                        </div>
                        <div className="input-group">
                          <label className="input-label">📞 {t('admin.contact')}</label>
                          <input className="input" placeholder="+20 100 000 0000" value={editingPet.contact || ''}
                            onChange={e => setEditingPet(s => ({ ...s, contact: e.target.value }))} />
                        </div>
                        <div className="input-group">
                          <label className="input-label">📌 {t('admin.status')}</label>
                          <select className="input" value={editingPet.status || 'available'}
                            onChange={e => setEditingPet(s => ({ ...s, status: e.target.value }))}>
                            <option value="available">{t('admin.available')}</option>
                            <option value="sold">{t('admin.markSold')}</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button className="btn btn-primary btn-sm" onClick={savePetEdit}>{t('admin.save')}</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditingPet(null); setEditPetImgErr(false); }}>{t('admin.cancel')}</button>
                      </div>
                    </div>
                  ) : (
                    /* ── Read View ── */
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {p.image && (
                        <img src={p.image} alt={p.name}
                          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                          onError={e => { e.currentTarget.style.display = 'none'; }} />
                      )}
                      <div className="user-info" style={{ flex: 1 }}>
                        <p className="user-email">{p.name}</p>
                        <span className="user-meta">{[p.type, p.personality].filter(Boolean).join(' · ')}</span>
                        {p.description && <p className="user-meta" style={{ marginTop: 2 }}>{p.description}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => { setEditingPet({ ...p }); setEditPetImgErr(false); }}>
                          {t('admin.edit')}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deletePet(id)}>{t('admin.delete')}</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ Store ══ */}
      {tab === 'store' && (
        <div className="animate-fade-up delay-1">

          {/* Add item form */}
          <div className="card admin-form">
            <h3 className="section-label">➕ {t('admin.addStoreItem')}</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">{t('admin.title')} *</label>
                <input className="input" placeholder={t('admin.storeItemTitlePh')}
                  value={storeForm.title} onChange={e => setStoreForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">{t('admin.content')}</label>
                <textarea className="input admin-textarea" rows={2}
                  placeholder={t('admin.storeItemDescPh')}
                  value={storeForm.description}
                  onChange={e => setStoreForm(f => ({ ...f, description: e.target.value }))}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              <div className="input-group">
                <label className="input-label">{t('admin.price')} (EGP) *</label>
                <input className="input" type="number" min="0" placeholder="0"
                  value={storeForm.price} onChange={e => setStoreForm(f => ({ ...f, price: e.target.value }))} />
              </div>

              <div className="input-group">
                <label className="input-label">{t('admin.condition')}</label>
                <select className="input" value={storeForm.condition}
                  onChange={e => setStoreForm(f => ({ ...f, condition: e.target.value }))}>
                  {STORE_CONDS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">{t('admin.category')}</label>
                <select className="input" value={storeForm.category}
                  onChange={e => setStoreForm(f => ({ ...f, category: e.target.value }))}>
                  {STORE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">{t('admin.contact')}</label>
                <input className="input" placeholder="email or phone"
                  value={storeForm.contact} onChange={e => setStoreForm(f => ({ ...f, contact: e.target.value }))} />
              </div>

              {/* Image URL + preview */}
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">🖼️ {t('admin.imageUrl')}</label>
                <input className="input" placeholder="https://…"
                  value={storeForm.image}
                  onChange={e => { setStoreForm(f => ({ ...f, image: e.target.value })); setStoreImgError(false); }} />
                {storeForm.image && !storeImgError && (
                  <img src={storeForm.image} alt="preview"
                    className="admin-img-preview"
                    onError={() => setStoreImgError(true)} />
                )}
                {storeImgError && (
                  <p className="admin-img-error">⚠️ {t('admin.imgError')}</p>
                )}
              </div>
            </div>

            <button className="btn btn-primary" style={{ marginTop: 4 }}
              onClick={addStoreItem}
              disabled={!storeForm.title.trim() || !storeForm.price}>
              {t('admin.addStoreItem')}
            </button>
          </div>

          {/* Items list */}
          <div className="admin-list" style={{ marginTop: 20 }}>
            {storeItems.length === 0 && <p className="empty-hint" style={{ padding: '20px 0' }}>{t('admin.noStoreItems')}</p>}
            {storeItems.map(item => {
              const isEditing = editingStore?._id === item._id;
              return (
                <div key={item._id} className="card admin-store-item" style={{ opacity: item.status === 'sold' ? 0.7 : 1 }}>
                  {isEditing ? (
                    /* ── Inline Edit Form ── */
                    <div style={{ width: '100%' }}>
                      <h4 style={{ color: 'var(--teal)', marginBottom: 16, fontSize: 14 }}>✏️ {t('admin.editing')}: {item.title}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="input-label">{t('admin.title')}</label>
                          <input className="input" value={editingStore.title}
                            onChange={e => setEditingStore(s => ({ ...s, title: e.target.value }))} />
                        </div>
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="input-label">{t('admin.content')}</label>
                          <textarea className="input" rows={2}
                            value={editingStore.description}
                            onChange={e => setEditingStore(s => ({ ...s, description: e.target.value }))}
                            style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                        </div>
                        <div className="input-group">
                          <label className="input-label">{t('admin.price')} (EGP)</label>
                          <input className="input" type="number" min="0"
                            value={editingStore.price}
                            onChange={e => setEditingStore(s => ({ ...s, price: e.target.value }))} />
                        </div>
                        <div className="input-group">
                          <label className="input-label">{t('admin.condition')}</label>
                          <select className="input" value={editingStore.condition}
                            onChange={e => setEditingStore(s => ({ ...s, condition: e.target.value }))}>
                            {STORE_CONDS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="input-group">
                          <label className="input-label">{t('admin.category')}</label>
                          <select className="input" value={editingStore.category}
                            onChange={e => setEditingStore(s => ({ ...s, category: e.target.value }))}>
                            {STORE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="input-group">
                          <label className="input-label">{t('admin.contact')}</label>
                          <input className="input"
                            value={editingStore.contact}
                            onChange={e => setEditingStore(s => ({ ...s, contact: e.target.value }))} />
                        </div>
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="input-label">🖼️ {t('admin.imageUrl')}</label>
                          <input className="input" placeholder="https://…"
                            value={editingStore.image}
                            onChange={e => { setEditingStore(s => ({ ...s, image: e.target.value })); setEditImgError(false); }} />
                          {editingStore.image && !editImgError && (
                            <img src={editingStore.image} alt="preview"
                              className="admin-img-preview"
                              onError={() => setEditImgError(true)} />
                          )}
                          {editImgError && <p className="admin-img-error">⚠️ {t('admin.imgError')}</p>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button className="btn btn-primary btn-sm" onClick={saveStoreEdit}>{t('admin.save')}</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditingStore(null); setEditImgError(false); }}>{t('admin.cancel')}</button>
                      </div>
                    </div>
                  ) : (
                    /* ── Read View ── */
                    <div className="admin-store-row">
                      {item.image && (
                        <img src={item.image} alt={item.title} className="admin-store-thumb"
                             onError={e => { e.currentTarget.style.display = 'none'; }} />
                      )}
                      <div className="admin-store-info">
                        <p className="admin-store-title">{item.title}</p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                          <span className="badge" style={{ background: CONDITION_COLOR[item.condition] + '22', color: CONDITION_COLOR[item.condition], fontSize: 11 }}>{item.condition}</span>
                          <span className="badge badge-teal" style={{ fontSize: 11 }}>{item.category}</span>
                          {item.status === 'sold' && <span className="badge" style={{ background: '#f8717122', color: '#f87171', fontSize: 11 }}>sold</span>}
                        </div>
                        <p style={{ color: 'var(--teal)', fontWeight: 700, fontSize: 15, margin: '4px 0 0' }}>{item.price} EGP</p>
                      </div>
                      <div className="admin-store-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditingStore({ ...item }); setEditImgError(false); }}>{t('admin.edit')}</button>
                        {item.status === 'available'
                          ? <button className="btn btn-ghost btn-sm" onClick={() => markStoreSold(item._id)}>✅ {t('admin.markSold')}</button>
                          : <button className="btn btn-ghost btn-sm" onClick={() => markStoreAvailable(item._id)}>♻️ {t('admin.restock')}</button>
                        }
                        <button className="btn btn-danger btn-sm" onClick={() => deleteStoreItem(item._id)}>{t('admin.delete')}</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'users' && (
        <div className="animate-fade-up delay-1">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() =>
              downloadCSV(users.map(u => ({ name: u.name || '', email: u.email || '', role: u.role || '' })), 'users.csv')
            }>⬇ {t('admin.exportUsers')}</button>
          </div>
          <div className="admin-list">
            {users.length === 0 && <p className="empty-hint" style={{ padding: '20px 0' }}>{t('admin.noUsers')}</p>}
            {users.map(u => (
              <div key={u._id || u.id} className="admin-list-item card">
                <div className="user-avatar">{(u.email || u.name || '?')[0].toUpperCase()}</div>
                <div className="user-info">
                  <p className="user-email">{u.name || u.email}</p>
                  <span className="user-meta">{u.email}{u.createdAt ? ` · ${t('admin.joined')} ${new Date(u.createdAt).toLocaleDateString()}` : ''}</span>
                </div>
                <span className={`badge ${u.role === 'admin' ? 'badge-lavender' : 'badge-teal'}`}>{u.role}</span>
                <button className="btn btn-danger btn-sm" onClick={() => removeUser(u._id || u.id)}>{t('admin.remove')}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Personality ── */}
      {tab === 'personality' && (
        <div className="animate-fade-up delay-1">
          <div className="admin-list">
            {personalityResults.length === 0 && <p className="empty-hint" style={{ padding: '20px 0' }}>{t('admin.noPersonality')}</p>}
            {personalityResults.map(r => (
              <div key={r._id} className="admin-list-item card">
                <div className="user-info">
                  <p className="user-email">{r.userId?.name || r.userId?.email || r.userId || 'Unknown user'}</p>
                  <span className="user-meta">
                    {t('admin.result')}: <strong>{r.result}</strong>
                    {r.createdAt ? ` · ${new Date(r.createdAt).toLocaleDateString()}` : ''}
                  </span>
                </div>
                <span className="badge badge-teal">{r.result}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
