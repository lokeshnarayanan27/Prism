import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Upload } from './pages/Upload';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { ImageDetail } from './pages/ImageDetail';

const ProtectedRoute = ({ children }) => {
  const user = useStore(state => state.user);
  const loading = useStore(state => state.loading);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export const App = () => {
  const initAuth = useStore(state => state.initAuth);
  const loading = useStore(state => state.loading);

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initAuth]);

  // Disable right-click globally for "quality protection" mockup
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)'
      }}>
        <div className="animate-spin" style={{
          width: '40px', height: '40px', border: '3px solid var(--accent)',
          borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '1rem'
        }}></div>
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Prism Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/image/:id" element={<ProtectedRoute><ImageDetail /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
