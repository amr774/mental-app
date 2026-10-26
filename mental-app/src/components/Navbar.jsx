import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang }  from '../context/LanguageContext';
import { useCart }  from '../context/CartContext';
import { useSaved } from '../context/SavedContext';
import './Navbar.css';

// Links always visible in the top navbar
const MAIN_LINKS = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: '🏠', label: 'Home'    },
  { to: '/chat',      labelKey: 'nav.chat',      icon: '💬', label: 'Chat'    },
  { to: '/test',      labelKey: 'nav.test',      icon: '🧪', label: 'Test'    },
  { to: '/store',     labelKey: 'nav.store',     icon: '🛍️', label: 'Store'   },
  { to: '/profile',   labelKey: 'nav.profile',   icon: '👤', label: 'Profile' },
];

// Links in the sidebar
const SIDE_LINKS = [
  { to: '/articles',  icon: '📰', label: 'Articles'   },
  { to: '/mood',      icon: '📊', label: 'Mood'        },
  { to: '/journal',   icon: '📔', label: 'Journal'     },
  { to: '/goals',     icon: '🎯', label: 'Goals'       },
  { to: '/breathe',   icon: '🌬️', label: 'Breathe'    },
  { to: '/community', icon: '🤝', label: 'Community'   },
  { to: '/pets',      icon: '🐾', label: 'Pet Store'   },
  { to: '/scan',      icon: '🧠', label: 'Emotion Scan'},
  { to: '/withubot',  icon: '🤍', label: 'WithUBot'   },
];

export default function Navbar() {
  const { user, logout }        = useAuth();
  const { theme, toggleTheme }  = useTheme();
  const { t, toggleLang, lang } = useLang();
  const { count: cartCount }    = useCart();
  const { addItem: addToCart }  = useCart();
  const { items: savedItems, remove: removeSaved, count: savedCount } = useSaved();
  const { pathname }            = useLocation();
  const navigate                = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedOpen,   setSavedOpen]   = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); setSidebarOpen(false); setSavedOpen(false); };
  const openSaved   = () => { setSavedOpen(true);  setSidebarOpen(false); };
  const openSidebar = () => { setSidebarOpen(o => !o); setSavedOpen(false); };

  // Close panels on route change
  useEffect(() => { setSidebarOpen(false); setSavedOpen(false); }, [pathname]);

  // Lock body scroll when any panel open
  useEffect(() => {
    document.body.style.overflow = (sidebarOpen || savedOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen, savedOpen]);

  const isActive = (to) => pathname === to || pathname.startsWith(to + '/');

  return (
    <>
      {/* ── Top Navbar ─────────────────────────────── */}
      <header className="navbar">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🧠</span>
          <span className="brand-name">Mindful</span>
        </Link>

        {/* Main nav links — desktop */}
        {user && (
          <nav className="navbar-main-links">
            {MAIN_LINKS.map(({ to, icon, labelKey, label }) => (
              <Link key={to} to={to} className={`nav-link ${isActive(to) ? 'active' : ''}`}>
                <span className="nav-icon">{icon}</span>
                <span className="nav-label">{t(labelKey) || label}</span>
              </Link>
            ))}
          </nav>
        )}

        {/* Right actions */}
        <div className="navbar-actions">
          {!user && (
            <>
              <Link to="/login"    className={`nav-link ${isActive('/login')    ? 'active' : ''}`}>{t('nav.login')}</Link>
              <Link to="/register" className="btn btn-primary nav-btn">{t('nav.getStarted')}</Link>
            </>
          )}

          {user && (
            <Link
              to={cartCount > 0 ? '/checkout' : '/orders'}
              className="action-btn action-btn--cart"
              title={cartCount > 0 ? 'Cart' : 'My Orders'}
            >
              {cartCount > 0 ? '🛒' : '📦'}
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}

          {user && (
            <button
              className={`action-btn action-btn--saved ${savedOpen ? 'active' : ''}`}
              onClick={openSaved}
              title="Saved items"
            >
              🔖
              {savedCount > 0 && <span className="cart-badge saved-badge">{savedCount}</span>}
            </button>
          )}

          <button className="action-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="action-btn" onClick={toggleLang} title="Toggle language">🌐</button>

          {user && (
            <button
              className={`action-btn sidebar-toggle ${sidebarOpen ? 'active' : ''}`}
              onClick={openSidebar}
              title="More"
              aria-label="Open sidebar"
            >
              <span className="hamburger-lines">
                <span />
                <span />
                <span />
              </span>
            </button>
          )}
        </div>
      </header>

      {/* ── Sidebar Overlay ────────────────────────── */}
      {user && (
        <>
          <div
            className={`sidebar-backdrop ${(sidebarOpen || savedOpen) ? 'open' : ''}`}
            onClick={() => { setSidebarOpen(false); setSavedOpen(false); }}
          />

          <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            {/* Header */}
            <div className="sidebar-header">
              <div className="sidebar-user">
                <div className="sidebar-avatar">
                  {(user.name || user.email || '?')[0].toUpperCase()}
                </div>
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">{user.name || 'User'}</span>
                  <span className="sidebar-user-email">{user.email}</span>
                </div>
              </div>
              <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
            </div>

            {/* Links */}
            <nav className="sidebar-nav">
              <p className="sidebar-section-label">Features</p>
              {SIDE_LINKS.map(({ to, icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`sidebar-link ${isActive(to) ? 'active' : ''}`}
                >
                  <span className="sidebar-link-icon">{icon}</span>
                  <span>{label}</span>
                  {isActive(to) && <span className="sidebar-active-dot" />}
                </Link>
              ))}

              {user?.role === 'admin' && (
                <>
                  <p className="sidebar-section-label">Admin</p>
                  <Link to="/admin" className={`sidebar-link sidebar-link--admin ${isActive('/admin') ? 'active' : ''}`}>
                    <span className="sidebar-link-icon">🛡️</span>
                    <span>Admin Dashboard</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
              <button className="sidebar-logout" onClick={handleLogout}>
                <span>🚪</span> Sign out
              </button>
            </div>
          </aside>

          {/* ── Saved Panel ──────────────────────── */}
          <aside className={`sidebar saved-panel ${savedOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <div className="sidebar-user">
                <span style={{ fontSize: 20 }}>🔖</span>
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">Saved items</span>
                  <span className="sidebar-user-email">{savedCount} item{savedCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <button className="sidebar-close" onClick={() => setSavedOpen(false)}>✕</button>
            </div>

            <div className="saved-list">
              {savedCount === 0 ? (
                <div className="saved-empty">
                  <span>🔖</span>
                  <p>No saved items yet</p>
                  <p style={{ fontSize: '0.78rem' }}>Tap 🔖 on any product to save it</p>
                </div>
              ) : (
                savedItems.map(item => (
                  <div key={`${item.itemType}-${item.id}`} className="saved-item">
                    <div className="saved-item-img">
                      {item.image
                        ? <img src={item.image} alt={item.name} onError={e => { e.currentTarget.style.display = 'none'; }} />
                        : <span>{item.itemType === 'pet' ? '🐾' : '📦'}</span>
                      }
                    </div>
                    <div className="saved-item-info">
                      <span className="saved-item-name">{item.name}</span>
                      <span className="saved-item-price">{item.price} EGP</span>
                      <span className={`saved-item-type ${item.itemType}`}>
                        {item.itemType === 'pet' ? '🐾 Pet Store' : '🛍️ Store'}
                      </span>
                    </div>
                    <div className="saved-item-actions">
                      <button
                        className="saved-add-cart"
                        title="Add to cart"
                        onClick={() => {
                          addToCart({ id: item.id, itemType: item.itemType, name: item.name, price: item.price, image: item.image });
                        }}
                      >🛒</button>
                      <button
                        className="saved-remove"
                        title="Remove"
                        onClick={() => removeSaved(item.id, item.itemType)}
                      >✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {savedCount > 0 && (
              <div className="sidebar-footer">
                <Link to="/checkout" className="saved-checkout-btn" onClick={() => { savedItems.forEach(i => addToCart(i)); setSavedOpen(false); }}>
                  🛒 Add all to cart
                </Link>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}
