import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { authService } from '../services/api';
import './Auth.css';

export default function ForgotPassword() {
  const { t }    = useLang();
  const navigate = useNavigate();

  const [email, setEmail]           = useState('');
  const [resetToken, setResetToken] = useState('');
  const [step, setStep]             = useState(1);
  const [token, setToken]           = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [info, setInfo]             = useState('');

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      if (res.resetToken) {
        setResetToken(res.resetToken);
        setInfo(`${res.message} — Token: ${res.resetToken}`);
      } else {
        setInfo(res.message || '');
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError(t('auth.passwordShort')); return; }
    setLoading(true);
    try {
      await authService.resetPassword(email, token || resetToken, newPassword);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card card-glow animate-fade-up">
        <div className="auth-header">
          <div className="auth-logo">🔑</div>
          <h1 className="heading">{step === 1 ? t('auth.forgotTitle') : t('auth.resetTitle')}</h1>
          <p className="subtext">{step === 1 ? t('auth.forgotSub') : t('auth.resetSub')}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestToken} className="auth-form">
            <div className="input-group">
              <label className="input-label">{t('auth.email')}</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : t('auth.sendToken')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="auth-form">
            {info && <p className="auth-success">{info}</p>}
            <div className="input-group">
              <label className="input-label">{t('auth.resetToken')}</label>
              <input className="input" placeholder="6-char token"
                value={token || resetToken} onChange={e => setToken(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">{t('auth.newPassword')}</label>
              <input className="input" type="password" placeholder={t('auth.minPassword')}
                value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : t('auth.resetBtn')}
            </button>
            <button type="button" className="btn btn-ghost auth-submit"
              onClick={() => { setStep(1); setError(''); setInfo(''); }}>
              {t('auth.back')}
            </button>
          </form>
        )}

        <p className="auth-footer">
          {t('auth.remembered')}{' '}
          <Link to="/login" className="auth-link">{t('auth.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
