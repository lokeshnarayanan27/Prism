import React, { useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Users, Image as ImageIcon, Activity, ShieldAlert, Trash2, Ban, CheckCircle, Search, Clock } from 'lucide-react';

export const AdminDashboard = () => {
  const { user, images, getAllUsers, blockUser, deleteUserAccount, deleteImageByAdmin, adminLogs } = useStore();
  const [profiles, setProfiles] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, users, content, logs
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (user?.isAdmin) {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getAllUsers();
      setProfiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleBlockUser = async (uid, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this user?`)) {
      await blockUser(uid, !currentStatus);
      await loadUsers();
    }
  };

  const handleDeleteUser = async (uid) => {
    if (window.confirm('WARNING: This will delete the user profile and all their images. Continue?')) {
      await deleteUserAccount(uid);
      await loadUsers();
    }
  };

  const handleDeleteContent = async (id) => {
    if (window.confirm('Delete this image? This action cannot be undone.')) {
      await deleteImageByAdmin(id);
    }
  };

  const filteredUsers = profiles.filter(p => 
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredImages = images.filter(img => 
    img.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    img.user?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: profiles.length,
    totalUploads: images.length,
    activeUsers: profiles.filter(p => !p.is_banned).length,
    bannedUsers: profiles.filter(p => p.is_banned).length
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldAlert size={36} color="var(--accent)" />
          Super Admin Panel
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage users, content, and system settings.</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', overflowX: 'auto' }}>
        {['dashboard', 'users', 'content', 'logs'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: '99px',
              backgroundColor: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <Users size={24} /> <h3>Total Users</h3>
            </div>
            <span style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalUsers}</span>
          </div>
          <div className="glass" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <ImageIcon size={24} /> <h3>Total Uploads</h3>
            </div>
            <span style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalUploads}</span>
          </div>
          <div className="glass" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--danger)' }}>
              <Ban size={24} /> <h3>Banned Users</h3>
            </div>
            <span style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>{stats.bannedUsers}</span>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div>
          <div style={{ marginBottom: '1rem', position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem' }}
            />
          </div>
          
          
          {!loadingUsers && filteredUsers.length === 0 ? (
            <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', borderRadius: '16px' }}>No users found matching your search.</div>
          ) : (
            <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <th style={{ padding: '1rem' }}>User</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr> : 
                  filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{u.nickname || u.username}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{u.username}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>
                      {u.is_banned ? 
                        <span style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Banned</span> : 
                        <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Active</span>
                      }
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => handleBlockUser(u.id, u.is_banned)} style={{ padding: '0.5rem', color: u.is_banned ? 'var(--success)' : 'var(--text-secondary)' }} title={u.is_banned ? 'Unblock' : 'Block'}>
                        {u.is_banned ? <CheckCircle size={18} /> : <Ban size={18} />}
                      </button>
                      <button onClick={() => handleDeleteUser(u.id)} style={{ padding: '0.5rem', color: 'var(--danger)' }} title="Delete Profile & Images">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}

      {/* CONTENT TAB */}
      {activeTab === 'content' && (
        <div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Content Moderation</h3>
            <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search images..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem', padding: '0.5rem 1rem 0.5rem 2.8rem' }}
              />
            </div>
          </div>
          
          <div className="masonry-grid">
            {filteredImages.map(img => (
              <div key={img.id} className="masonry-item" style={{ position: 'relative' }}>
                <img src={img.url} alt={img.title} style={{ width: '100%', display: 'block' }} loading="lazy" />
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.2s' }} 
                     className="image-overlay" />
                
                <div className="image-overlay-content" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', color: 'white' }}>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem' }}>{img.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>by {img.user}</p>
                </div>
                
                <button 
                  onClick={() => handleDeleteContent(img.id)}
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'var(--danger)', color: 'white', padding: '0.6rem', borderRadius: '50%', border: 'none', zIndex: 10, cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }}
                  title="Remove Content"
                  className="image-actions-top"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>System Logs (Local)</h3>
          </div>
          {adminLogs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No actions recorded yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {adminLogs.map((log, i) => (
                <div key={i} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Activity size={18} color="var(--accent)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{log.action}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target ID: {log.targetId}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} />
                    {new Date(log.date).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .masonry-item:hover .image-overlay,
        .masonry-item:hover .image-actions-top {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};
