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
      {/* Minimal top bar on mobile — just the logo */}
      <header className="mobile-header glass">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <Logo size={22} />
          <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.05em', color: 'var(--text-primary)' }}>
            Prism
          </span>
        </Link>
      </header>

      <main className="main-content">
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {children}
        </div>
      </main>
    </div>
  );
};
