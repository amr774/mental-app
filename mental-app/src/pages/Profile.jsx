import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { profileService, wishlistService, personalityService, moodService, petService } from '../services/api';
import { Link } from 'react-router-dom';
import './Profile.css';

const RESULT_KEYS = {
  Good:     { emoji: '🌟', color: '#4ade80' },
  Calm:     { emoji: '🌿', color: '#4ecdc4' },
  Social:   { emoji: '🤝', color: '#a78bfa' },
  Anxious:  { emoji: '🧘', color: '#f87171' },
  Sad:      { emoji: '💙', color: '#60a5fa' },
  Lonely:   { emoji: '🤝', color: '#a78bfa' },
  Stressed: { emoji: '🧘', color: '#f87171' },
};

const TYPE_EMOJI = { cat:'🐱', dog:'🐶', bird:'🐦', fish:'🐠', rabbit:'🐰', hamster:'🐹', turtle:'🐢' };
const petEmoji = (type = '') => TYPE_EMOJI[type.toLowerCase()] || '🐾';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Profile() {
  const { user: authUser, login } = useAuth();
  const { t, isRTL } = useLang();

  const [profile, setProfile]   = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [adopted, setAdopted]   = useState([]);
  const [lastTest, setLastTest] = useState(null);
  const [moods, setMoods]       = useState([]);

  const [editing, setEditing]         = useState(false);
  const [editName, setEditName]       = useState('');
  const [currentPw, setCurrentPw]     = useState('');
  const [newPw, setNewPw]             = useState('');
  const [saveError, setSaveError]     = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saving, setSaving]           = useState(false);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    profileService.get()
      .then(d => {
        setProfile(d.user);
        setEditName(d.user?.name || '');
        if (d.user?.avatar) setAvatarPreview(`${API_BASE}${d.user.avatar}`);
      })
      .catch(() => setEditName(authUser?.name || ''));

    wishlistService.get()
      .then(d => setWishlist(d.wishlist || d || []))
      .catch(() => {});

    petService.getAdopted()
      .then(setAdopted)
      .catch(() => {});

    personalityService.getMyResults()
      .then(tests => { if (tests?.length > 0) setLastTest(tests[0]); })
      .catch(() => {
        const stored = localStorage.getItem('mh_testResult');
        if (stored) setLastTest({ result: stored });
      });

    moodService.getHistory()
      .then(data => setMoods(data.slice(0, 7)))
      .catch(() => {});
  }, []);

  // ── Avatar upload ─────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      const res = await profileService.uploadAvatar(file);
      setAvatarPreview(`${API_BASE}${res.avatar}`);
    } catch (err) {
      setSaveError(err.message || t('profile.avatarError'));
      setAvatarPreview(profile?.avatar ? `${API_BASE}${profile.avatar}` : '');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ── Profile save ──────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveError(''); setSaveSuccess('');
    if (newPw && newPw.length < 6) { setSaveError(t('auth.passwordShort')); return; }
    setSaving(true);
    try {
      const payload = { name: editName };
      if (currentPw && newPw) { payload.currentPassword = currentPw; payload.newPassword = newPw; }
      const res = await profileService.update(payload);
      setProfile(res.user);
      login({ ...authUser, name: res.user.name });
      setSaveSuccess(t('profile.saveSuccess'));
      setCurrentPw(''); setNewPw('');
      setEditing(false);
    } catch (err) {
      setSaveError(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const displayUser = profile || authUser;
  const resultKey   = lastTest?.result;
  const resultMeta  = resultKey ? RESULT_KEYS[resultKey] : null;
  const resultLabel = resultKey ? t('test.results')?.[resultKey]?.label : null;
  const initials    = (displayUser?.name || displayUser?.email || '?')[0].toUpperCase();

  return (
    <div className="page">
      {/* ── Hero ── */}
      <div className="profile-hero animate-fade-up">

        {/* Avatar with upload */}
        <div className="avatar-wrap" onClick={() => fileInputRef.current?.click()}>
          {avatarPreview ? (
            <img src={avatarPreview} alt="avatar" className="profile-avatar avatar-img" />
          ) : (
            <div className="profile-avatar">{initials}</div>
          )}
          <div className="avatar-overlay">
            {uploadingAvatar ? <span className="spinner" /> : '📷'}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
        </div>

        <div>
          <h1 className="heading">{displayUser?.name || displayUser?.email}</h1>
          {displayUser?.name && (
            <p style={{ color: 'var(--text-2)', fontSize: 14, marginTop: 4 }}>{displayUser.email}</p>
          )}
          <span className={`badge ${displayUser?.role === 'admin' ? 'badge-lavender' : 'badge-teal'}`}>
            {displayUser?.role === 'admin' ? t('profile.adminBadge') : t('profile.member')}
          </span>
          <p className="avatar-hint">{t('profile.avatarHint')}</p>
        </div>

        <button className="btn btn-ghost btn-sm" style={{ marginInlineStart: 'auto' }}
          onClick={() => { setEditing(e => !e); setSaveError(''); setSaveSuccess(''); }}>
          {editing ? t('profile.cancel') : t('profile.editProfile')}
        </button>
      </div>

      {/* ── Edit form ── */}
      {editing && (
        <div className="card animate-fade-up" style={{ marginBottom: 24 }}>
          <h3 className="section-label">{t('profile.editTitle')}</h3>
          <form onSubmit={handleSaveProfile} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="input-group">
              <label className="input-label">{t('profile.displayName')}</label>
              <input className="input" value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">{t('profile.currentPw')}</label>
              <input className="input" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">{t('profile.newPw')}</label>
              <input className="input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
            </div>
            {saveError   && <p style={{ color:'#fc8181', fontSize:14 }}>{saveError}</p>}
            {saveSuccess && <p style={{ color:'#4ade80', fontSize:14 }}>{saveSuccess}</p>}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : t('profile.saveChanges')}
            </button>
          </form>
        </div>
      )}

      {saveError && !editing && <p style={{ color:'#fc8181', fontSize:14, marginBottom:12 }}>{saveError}</p>}

      <div className="profile-grid">
        {/* Last Assessment */}
        <div className="card animate-fade-up delay-1">
          <h3 className="section-label">{t('profile.lastAssessment')}</h3>
          {resultMeta ? (
            <div className="result-row" style={{ '--rc': resultMeta.color }}>
              <span className="result-icon">{resultMeta.emoji}</span>
              <div>
                <p className="result-name">{resultLabel}</p>
                <p className="result-hint">{t('profile.basedOn')}</p>
              </div>
            </div>
          ) : (
            <p className="empty-hint">
              {t('profile.noTest').split('Emotional Test')[0]}
              <Link to="/test" style={{ color:'var(--teal)' }}>
                {isRTL ? 'الاختبار العاطفي' : 'Emotional Test'}
              </Link>
              {t('profile.noTest').split('Emotional Test')[1]}
            </p>
          )}
        </div>

        {/* Recent Moods */}
        <div className="card animate-fade-up delay-2">
          <h3 className="section-label">{t('profile.recentMoods')}</h3>
          {moods.length === 0 ? (
            <p className="empty-hint">{t('profile.noMoods')}</p>
          ) : (
            <div className="mood-list">
              {moods.map((m, i) => {
                const dateStr = new Date(m.date || m.created_at)
                  .toLocaleDateString(undefined, { month:'short', day:'numeric' });
                return (
                  <div key={i} className="mood-row">
                    <span className="mood-row-emoji">{m.mood}</span>
                    <span className="mood-row-date">{dateStr}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="card profile-info animate-fade-up delay-3">
          <h3 className="section-label">{t('profile.account')}</h3>
          <div className="info-rows">
            {displayUser?.name && (
              <div className="info-row">
                <span className="info-key">{t('profile.name')}</span>
                <span className="info-val">{displayUser.name}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-key">{t('profile.email')}</span>
              <span className="info-val">{displayUser?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-key">{t('profile.role')}</span>
              <span className="info-val" style={{ textTransform:'capitalize' }}>{displayUser?.role}</span>
            </div>
            <div className="info-row">
              <span className="info-key">{t('profile.status')}</span>
              <span className="info-val" style={{ color:'var(--teal)' }}>{t('profile.active')}</span>
            </div>
          </div>
        </div>

        {/* Wishlist */}
        <div className="card profile-info animate-fade-up delay-4">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 className="section-label" style={{ margin:0 }}>{t('profile.wishlist')}</h3>
            <Link to="/pets" style={{ fontSize:13, color:'var(--teal)', textDecoration:'none' }}>
              {t('profile.browsePets')}
            </Link>
          </div>
          {wishlist.length === 0 ? (
            <p className="empty-hint">
              {t('profile.noWishlist')}{' '}
              <Link to="/pets" style={{ color:'var(--teal)' }}>{t('profile.browseStore')}</Link>
            </p>
          ) : (
            <div className="wishlist-grid">
              {wishlist.map(pet => (
                <div key={pet._id || pet.id} className="wishlist-item">
                  <span className="wishlist-emoji">{petEmoji(pet.type)}</span>
                  <div>
                    <p className="wishlist-name">{pet.name}</p>
                    <p className="wishlist-type">{pet.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Adopted Pets */}
        {adopted.length > 0 && (
          <div className="card profile-info animate-fade-up delay-4" style={{ gridColumn:'1 / -1' }}>
            <h3 className="section-label" style={{ marginBottom:16 }}>🏠 {t('profile.adoptedPets')}</h3>
            <div className="wishlist-grid">
              {adopted.map(pet => (
                <div key={pet._id || pet.id} className="wishlist-item"
                  style={{ borderColor:'rgba(167,139,250,0.3)', background:'rgba(167,139,250,0.05)' }}>
                  <span className="wishlist-emoji">{petEmoji(pet.type)}</span>
                  <div>
                    <p className="wishlist-name">{pet.name}</p>
                    <p className="wishlist-type">{pet.type}</p>
                  </div>
                  <span className="badge badge-lavender" style={{ marginInlineStart:'auto' }}>
                    ✓ {t('pets.adopted')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
