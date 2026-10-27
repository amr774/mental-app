import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { authService } from '../services/api';
import './Auth.css';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login }  = useAuth();
  const { t }      = useLang();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || '/';
  const justRegistered = location.state?.registered === true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await authService.login(email, password);
      login({ ...user.user, token: user.token });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card card-glow animate-fade-up">
        <div className="auth-header">
          <div className="auth-logo">🧠</div>
          <h1 className="heading">{t('auth.welcomeBack')}</h1>
          <p className="subtext">{t('auth.signInSub')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label" htmlFor="login-email">{t('auth.email')}</label>
            <input id="login-email" className="input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="login-password">{t('auth.password')}</label>
            <input id="login-password" className="input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>

          {justRegistered && <p className="auth-success">{t('auth.registered')}</p>}
          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : t('auth.signIn')}
          </button>
        </form>

        <p className="auth-footer" style={{ marginBottom: 8 }}>
          <Link to="/forgot-password" className="auth-link">{t('auth.forgotPassword')}</Link>
        </p>
        <p className="auth-footer">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="auth-link">{t('auth.createOne')}</Link>
        </p>
      </div>
    </div>
  );
}
