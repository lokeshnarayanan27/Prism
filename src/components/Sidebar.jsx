import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, User, LogOut, ShieldAlert } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Logo } from './Logo';

export const Sidebar = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Desktop sidebar nav items
  const desktopNavItems = [
    { name: 'Home',    icon: Home,       path: '/' },
    { name: 'Search',  icon: Search,     path: '/search' },
    { name: 'Upload',  icon: PlusSquare, path: '/upload' },
    { name: 'Profile', icon: User,       path: `/profile/${user?.username || 'user'}` },
  ];

  if (user?.isAdmin) {
    desktopNavItems.push({ name: 'Admin', icon: ShieldAlert, path: '/admin' });
  }

  // Bottom nav: Home → Search → Post(+) → Profile (ordered as requested)
  const bottomNavItems = [
    { name: 'Home',    icon: Home,       path: '/' },
    { name: 'Search',  icon: Search,     path: '/search' },
    { name: 'Post',    icon: PlusSquare, path: '/upload', isPost: true },
    { name: 'Profile', icon: User,       path: `/profile/${user?.username || 'user'}` },
  ];

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar-desktop" style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: '240px', backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)', display: 'flex',
        flexDirection: 'column', padding: '2rem 1.5rem', zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <Logo size={28} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.05em', color: 'var(--text-primary)' }}>Prism</h1>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {desktopNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
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

        <button
          onClick={handleLogout}
          className="sidebar-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '0.75rem 1rem', color: 'var(--danger)',
            borderRadius: '12px', transition: 'all 0.2s', width: '100%',
            textAlign: 'left', marginTop: 'auto'
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="bottom-nav glass">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? 'active' : ''} ${item.isPost ? 'post-btn' : ''}`
            }
          >
            {item.isPost ? (
              <div className="post-icon-wrap">
                <item.icon size={24} />
              </div>
            ) : (
              <>
                <item.icon size={22} />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <style>{`
        .sidebar-desktop { display: none !important; }
        .bottom-nav      { display: flex   !important; }

        @media (min-width: 769px) {
          .sidebar-desktop { display: flex !important; }
          .bottom-nav      { display: none !important; }
        }

        .sidebar-btn:hover { background-color: var(--bg-tertiary); }
      `}</style>
    </>
  );
};
