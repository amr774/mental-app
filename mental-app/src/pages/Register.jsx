import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { authService } from '../services/api';
import './Auth.css';

export default function Register() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { t }    = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError(t('auth.passwordShort')); return; }
    setLoading(true);
    try {
      await authService.register(name, email, password);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card card-glow animate-fade-up">
        <div className="auth-header">
          <div className="auth-logo">🧠</div>
          <h1 className="heading">{t('auth.createAccount')}</h1>
          <p className="subtext">{t('auth.journeySub')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label" htmlFor="register-name">{t('auth.fullName')}</label>
            <input id="register-name" autoComplete="name" className="input" type="text" placeholder="Your name"
              value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="register-email">{t('auth.email')}</label>
            <input id="register-email" className="input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="register-password">{t('auth.password')}</label>
            <input id="register-password" className="input" type="password" placeholder={t('auth.minPassword')}
              value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : t('auth.createAccount')}
          </button>
        </form>

        <p className="auth-footer">
          {t('auth.alreadyHave')}{' '}
          <Link to="/login" className="auth-link">{t('auth.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
