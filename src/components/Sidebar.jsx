import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, UploadCloud, User, LogOut, ShieldAlert } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Logo } from './Logo';

export const Sidebar = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Search', icon: Search, path: '/search' },
    { name: 'Upload', icon: UploadCloud, path: '/upload' },
    { name: 'Profile', icon: User, path: `/profile/${user?.username || 'user'}` },
  ];

  if (user?.isAdmin) {
    navItems.push({ name: 'Admin', icon: ShieldAlert, path: '/admin' });
  }

  return (
    <>
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: '240px', backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)', display: 'flex',
        flexDirection: 'column', padding: '2rem 1.5rem',
        zIndex: 50
      }} className="sidebar-desktop">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Logo size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.05em', color: 'var(--text-primary)' }}>Prism</h1>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.75rem 1rem', borderRadius: '12px',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              })}
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.75rem 1rem', color: 'var(--danger)',
              borderRadius: '12px', transition: 'all 0.2s', width: '100%',
              textAlign: 'left'
            }}
            className="sidebar-btn"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <style>{`
        .sidebar-desktop { display: none !important; }
        .bottom-nav { display: flex !important; }
        @media (min-width: 768px) {
          .sidebar-desktop { display: flex !important; }
          .bottom-nav { display: none !important; }
        }
        .sidebar-btn:hover { background-color: var(--bg-tertiary); }
      `}</style>
      
      <nav className="bottom-nav glass" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '60px', zIndex: 50, display: 'none',
        justifyContent: 'space-around', alignItems: 'center',
        padding: '0 1rem', borderTop: '1px solid var(--border)'
      }}>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              padding: '0.5rem'
            })}
          >
            <item.icon size={22} />
            <span style={{ fontSize: '10px', marginTop: '2px', fontWeight: 500 }}>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};
