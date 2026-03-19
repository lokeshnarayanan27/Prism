import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Upload } from './pages/Upload';
import { Profile } from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const user = useStore(state => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export const App = () => {

  // Disable right-click globally for "original quality" protection mockup
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
