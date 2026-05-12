import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import './Home.css';

export default function Home() {
  const { user }   = useAuth();
  const { t }      = useLang();
  const navigate   = useNavigate();

  const FEATURES = [
    { icon: '💬', title: t('home.feature1.title'), desc: t('home.feature1.desc') },
    { icon: '🧪', title: t('home.feature2.title'), desc: t('home.feature2.desc') },
    { icon: '📊', title: t('home.feature3.title'), desc: t('home.feature3.desc') },
  ];

  return (
    <div className="home">
      <section className="hero animate-fade-up">
        <div className="hero-badge badge badge-teal">{t('home.badge')}</div>
        <h1 className="display hero-title">
          {t('home.title1')}<br />
          <em>{t('home.title2')}</em>
        </h1>
        <p className="subtext hero-sub">{t('home.sub')}</p>
        <div className="hero-actions">
          {user ? (
            <button className="btn btn-primary hero-cta" onClick={() => navigate('/chatbot')}>
              {t('home.openChat')}
            </button>
          ) : (
            <>
              <button className="btn btn-primary hero-cta" onClick={() => navigate('/register')}>
                {t('home.startFree')}
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('/login')}>
                {t('home.signin')}
              </button>
            </>
          )}
        </div>
      </section>

      <section className="features">
        {FEATURES.map((f, i) => (
          <div key={f.title} className={`feature-card card animate-fade-up delay-${i + 2}`}>
            <div className="feature-icon">{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </section>

      {!user && (
        <div className="cta-strip animate-fade-up delay-4">
          <p className="subtext">{t('home.cta')}</p>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>
            {t('home.createAccount')}
          </button>
        </div>
      )}
    </div>
  );
}
