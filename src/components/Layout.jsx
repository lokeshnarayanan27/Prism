import React from 'react';
import { Sidebar } from './Sidebar';
import { useLocation, Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) return children;

  return (
    <div className="app-container">
      <Sidebar />
      <header className="mobile-header glass" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '60px', zIndex: 40, display: 'none',
        alignItems: 'center', padding: '0 1rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <Logo size={24} />
          <span style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.05em', color: 'var(--text-primary)' }}>Prism</span>
        </Link>
      </header>
      <style>{`
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
          .main-content { padding-top: 5.5rem !important; }
        }
      `}</style>
      <main className="main-content">
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {children}
        </div>
      </main>
    </div>
  );
};
