import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang }  from '../context/LanguageContext';
import { useCart }  from '../context/CartContext';
import { useRef } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout }        = useAuth();
  const { theme, toggleTheme }  = useTheme();
  const { t, toggleLang, lang } = useLang();
  const { count: cartCount }    = useCart();
  const { pathname }            = useLocation();
  const navigate                = useNavigate();
  const scrollRef               = useRef(null);

  const NAV_LINKS = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: '🏠' },
    { to: '/articles',  label: t('nav.articles'),  icon: '📰' },
    { to: '/chat',      label: t('nav.chat'),      icon: '💬' },
    { to: '/test',      label: t('nav.test'),      icon: '🧪' },
    { to: '/mood',      label: t('nav.mood'),      icon: '📊' },
    { to: '/breathe',   label: t('nav.breathe'),   icon: '🌬️' },
    { to: '/journal',   label: t('nav.journal'),   icon: '📔' },
    { to: '/goals',     label: t('nav.goals'),     icon: '🎯' },
    { to: '/community', label: t('nav.community'), icon: '💬' },
    { to: '/pets',      label: t('nav.pets'),      icon: '🐾' },
    { to: '/store',     label: t('nav.store'),     icon: '🛍️' },

    { to: '/profile',   label: t('nav.profile'),   icon: '👤' },
  ];

  function scrollNav(direction) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 150, behavior: 'smooth' });
  }

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="navbar">
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">🧠</span>
        <span className="brand-name">Mindful</span>
      </Link>

      {/* Scroll wrapper — arrows always visible when logged in */}
      <div className="navbar-scroll-wrap">
        {user && (
          <button className="nav-arrow" onClick={() => scrollNav(-1)} aria-label="scroll prev">
            ‹
          </button>
        )}

        <nav className="navbar-links" ref={scrollRef}>
          {!user && (
            <>
              <Link to="/login"    className={`nav-link ${pathname === '/login' ? 'active' : ''}`}>{t('nav.login')}</Link>
              <Link to="/register" className="btn btn-primary nav-btn">{t('nav.getStarted')}</Link>
            </>
          )}

          {user && NAV_LINKS.map(({ to, label, icon }) => (
            <Link
              key={to} to={to}
              className={`nav-link ${pathname === to || pathname.startsWith(to + '/') ? 'active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </Link>
          ))}

          {user?.role === 'admin' && (
            <Link to="/admin" className={`nav-link ${pathname === '/admin' ? 'active' : ''}`}>
              <span className="nav-icon">🛡️</span>{t('nav.admin')}
            </Link>
          )}
        </nav>

        {user && (
          <button className="nav-arrow" onClick={() => scrollNav(1)} aria-label="scroll next">
            ›
          </button>
        )}
      </div>

      {/* Fixed compact icon actions */}
      <div className="navbar-actions">
        {user && (
          <Link
            to={cartCount > 0 ? '/checkout' : '/orders'}
            className="action-btn action-btn--cart"
            title={cartCount > 0 ? (t('nav.cart') || 'Cart') : (t('nav.orders') || 'My Orders')}
          >
            {cartCount > 0 ? '🛒' : '📦'}
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        )}
        <button className="action-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="action-btn" onClick={toggleLang} title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}>
          🌐
        </button>
        {user && (
          <button className="action-btn action-btn--logout" onClick={handleLogout} title={t('nav.signout')}>
            🚪
          </button>
        )}
      </div>
    </header>
  );
}
