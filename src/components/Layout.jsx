import React from 'react';
import { Sidebar } from './Sidebar';
import { useLocation } from 'react-router-dom';

export const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) return children;

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {children}
        </div>
      </main>
    </div>
  );
};
