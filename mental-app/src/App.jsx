import { useState, useEffect, Component } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth }  from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LangProvider }  from './context/LanguageContext';
import { CartProvider }  from './context/CartContext';
import { SavedProvider } from './context/SavedContext';
import Navbar         from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Onboarding     from './components/Onboarding';

import Home            from './pages/Home';
import Login           from './pages/Login';
import Register        from './pages/Register';
import ForgotPassword  from './pages/ForgotPassword';
import Chatbot         from './pages/Chatbot';
import MoodTracker     from './pages/MoodTracker';
import PersonalityTest from './pages/PersonalityTest';
import Profile         from './pages/Profile';
import Admin           from './pages/Admin';
import PetStore        from './pages/PetStore';
import Articles        from './pages/Articles';
import Breathe         from './pages/Breathe';
import Journal         from './pages/Journal';
import Store           from './pages/Store';
import Dashboard       from './pages/Dashboard';
import Community       from './pages/Community';
import Goals           from './pages/Goals';
import Checkout        from './pages/Checkout';
import MyOrders        from './pages/MyOrders';
import EmotionScan     from './pages/EmotionScan';
import WithUBot        from './pages/WithUBot';
import ChatSelect      from './pages/ChatSelect';

// ── Error Boundary ────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
          background: '#0d1117', color: '#f87171', padding: 24, textAlign: 'center'
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{ color: '#fbbf24', margin: 0 }}>Something went wrong</h2>
          <pre style={{
            background: '#161b22', padding: '12px 20px', borderRadius: 8,
            color: '#e2e8f0', fontSize: 13, maxWidth: 600, overflowX: 'auto',
            textAlign: 'left', whiteSpace: 'pre-wrap'
          }}>
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: '#4ecdc4', color: '#000', fontWeight: 600, cursor: 'pointer'
            }}
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
          >
            Go to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Inner component so it can access AuthContext ──────────────────
function AppRoutes() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      const key = `mh_onboarded_${user.email || user.id}`;
      if (!localStorage.getItem(key)) {
        setShowOnboarding(true);
        localStorage.setItem(key, '1');
      }
    }
  }, [user]);

  return (
    <>
      <Navbar />
      {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
      <Routes>
        {/* Public */}
        <Route path="/"                element={<Home />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/articles"        element={<Articles />} />

        {/* Protected — any logged-in user */}
        <Route path="/chat"    element={<ProtectedRoute><ChatSelect /></ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        <Route path="/mood"    element={<ProtectedRoute><MoodTracker /></ProtectedRoute>} />
        <Route path="/test"    element={<ProtectedRoute><PersonalityTest /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/pets"    element={<ProtectedRoute><PetStore /></ProtectedRoute>} />
        <Route path="/breathe" element={<ProtectedRoute><Breathe /></ProtectedRoute>} />
        <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
        <Route path="/store"     element={<ProtectedRoute><Store /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/goals"     element={<ProtectedRoute><Goals /></ProtectedRoute>} />
        <Route path="/checkout"  element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders"    element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/scan"      element={<ProtectedRoute><EmotionScan /></ProtectedRoute>} />
        <Route path="/withubot" element={<ProtectedRoute><WithUBot /></ProtectedRoute>} />

        {/* Protected — admin only */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
      <LangProvider>
      <AuthProvider>
      <CartProvider>
      <SavedProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SavedProvider>
      </CartProvider>
      </AuthProvider>
      </LangProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
