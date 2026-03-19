import React, { useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ImageCard } from '../components/ImageCard';
import { Image as ImageIcon, Heart, Edit2, Check } from 'lucide-react';

export const Profile = () => {
  const { username } = useParams();
  const currentUser = useStore(state => state.user);
  const users = useStore(state => state.users);
  const updateNickname = useStore(state => state.updateNickname);
  const images = useStore(state => state.images);
  
  const isOwnProfile = currentUser && currentUser.username === username;
  const profileUser = isOwnProfile ? currentUser : (users[username] || { username, nickname: username });
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
    <div className="animate-fade-in">
      <header className="glass" style={{
        padding: '3rem', borderRadius: '24px', marginBottom: '3rem',
        display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap'
      }}>
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), #e879f9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '3rem', fontWeight: 700,
          boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.5)'
        }}>
          {displayNickname.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '2rem', padding: '0.5rem', fontWeight: 600, width: '300px' }}
                  autoFocus
                />
                <button onClick={handleSaveNickname} className="btn glass" style={{ padding: '0.5rem' }}>
                  <Check size={20} color="var(--success)" />
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{displayNickname}</h2>
                {isOwnProfile && (
                  <button onClick={() => setIsEditing(true)} className="btn glass" style={{ padding: '0.5rem' }} title="Edit Nickname">
                    <Edit2 size={18} />
                  </button>
                )}
              </>
            )}
          </div>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '500px' }}>
            A passionate photographer sharing uncompressed moments captured in full fidelity.
          </p>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={20} color="var(--text-secondary)" />
              <div><strong style={{ fontSize: '1.25rem' }}>{userImages.length}</strong> Shots</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={20} color="var(--text-secondary)" />
              <div><strong style={{ fontSize: '1.25rem' }}>{totalLikes}</strong> Likes Received</div>
            </div>
          </div>
        </div>
        
        {!isOwnProfile && (
          <button className="btn btn-primary" style={{ padding: '0.75rem 2rem', alignSelf: 'center' }}>
            Follow
          </button>
        )}
      </header>

      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Original Quality Shots</h3>
      
      {userImages.length > 0 ? (
        <div className="masonry-grid">
          {userImages.map(image => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
          <ImageIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No uploads yet</h3>
          <p>This user hasn't shared any original photography.</p>
        </div>
      )}
    </div>
  );
};
