import React, { useMemo, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ImageCard } from '../components/ImageCard';
import { Image as ImageIcon, Heart, Edit2, Check, User as UserIcon, LogOut } from 'lucide-react';

export const Profile = () => {
  const { username } = useParams();
  const currentUser = useStore(state => state.user);
  const users = useStore(state => state.users);
  const updateNickname = useStore(state => state.updateNickname);
  const images = useStore(state => state.images);
  const logout = useStore(state => state.logout);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const isOwnProfile = currentUser && currentUser.username === username;
  const profileUser = isOwnProfile 
    ? currentUser 
    : (Object.values(users).find(u => u.username === username) || { username, nickname: username });
  const displayNickname = profileUser.nickname || profileUser.username;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(displayNickname);

  const userImages = useMemo(() => images.filter(img => img.user === username), [images, username]);
  const totalLikes = useMemo(() => userImages.reduce((sum, img) => sum + img.likes, 0), [userImages]);

  if (!username) return <Navigate to="/" />;

  const handleSaveNickname = () => {
    if (editName.trim()) {
      updateNickname(editName.trim());
    } else {
      setEditName(displayNickname);
    }
    setIsEditing(false);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <header className="glass" style={{
        padding: '3.5rem', borderRadius: '32px', marginBottom: '3.5rem',
        display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Background Accent */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', opacity: 0.05, filter: 'blur(50px)' }}></div>

        <div style={{
          width: '140px', height: '140px', borderRadius: '48px',
          background: 'linear-gradient(135deg, var(--accent), #e879f9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '3.5rem', fontWeight: 800,
          boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.4)',
          position: 'relative', zIndex: 1
        }}>
          {displayNickname.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.5rem' }}>
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '2.5rem', padding: '0.75rem 1rem', fontWeight: 700, minWidth: '350px', backgroundColor: 'var(--bg-primary)' }}
                  autoFocus
                />
                <button onClick={handleSaveNickname} className="btn-primary" style={{ width: '56px', height: '56px', borderRadius: '16px' }}>
                  <Check size={28} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <h2 style={{ fontSize: '3rem', margin: 0, letterSpacing: '-0.04em' }}>{displayNickname}</h2>
                  {isOwnProfile && (
                    <button onClick={() => setIsEditing(true)} style={{ padding: '0.5rem', color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
                      <Edit2 size={24} />
                    </button>
                  )}
                </div>
                {isOwnProfile && (
                  <button 
                    onClick={handleLogout}
                    className="mobile-logout-btn"
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem', 
                      padding: '0.5rem 1rem', color: 'var(--danger)', 
                      backgroundColor: 'transparent', borderRadius: '12px',
                      fontWeight: 600, fontSize: '0.9rem', border: '1px solid var(--border)'
                    }}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                )}
                <style>{`
                  .mobile-logout-btn { display: flex; }
                  @media (min-width: 768px) {
                    .mobile-logout-btn { display: none !important; }
                  }
                `}</style>
              </div>
            )}
          </div>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', fontSize: '1.1rem' }}>
            A dedicated Prism artist capturing and sharing the world in uncompressed, original fidelity.
          </p>

          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ color: 'var(--accent)', backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '16px' }}>
                <ImageIcon size={24} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{userImages.length}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shots Published</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ color: '#ef4444', backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '16px' }}>
                <Heart size={24} fill="#ef4444" />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{totalLikes}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Likes Received</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h3 style={{ fontSize: '1.75rem', margin: 0, letterSpacing: '-0.02em' }}>Original Gallery</h3>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Showing {userImages.length} items</span>
      </div>
      
      {userImages.length > 0 ? (
        <div className="masonry-grid">
          {userImages.map(image => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '8rem 0', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', borderRadius: '32px' }}>
          <ImageIcon size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.15 }} />
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Gallery is empty.</h3>
          <p>No photography has been published to this profile yet.</p>
        </div>
      )}
    </div>
  );
};
