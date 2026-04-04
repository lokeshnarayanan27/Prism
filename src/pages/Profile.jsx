import React, { useMemo, useState, useRef } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ImageCard } from '../components/ImageCard';
import { Image as ImageIcon, Edit2, Check, LogOut, Camera } from 'lucide-react';
import { supabase } from '../supabase/supabase';

export const Profile = () => {
  const { username } = useParams();
  const currentUser = useStore(state => state.user);
  const users = useStore(state => state.users);
  const updateNickname = useStore(state => state.updateNickname);
  const images = useStore(state => state.images);
  const logout = useStore(state => state.logout);
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

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
  const [avatarUrl, setAvatarUrl] = useState(profileUser.avatar_url || null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const userImages = useMemo(() => images.filter(img => img.user === username), [images, username]);

  if (!username) return <Navigate to="/" />;

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setAvatarUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `avatars/${currentUser.uid}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('images')
        .upload(filePath, file, { upsert: true, cacheControl: '3600' });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', currentUser.uid);
      setAvatarUrl(publicUrl);
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setAvatarUploading(false);
    }
  };

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
      <header className="profile-header glass">
        {/* Avatar */}
        <div className="profile-avatar-wrap">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayNickname} className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-placeholder">
              {displayNickname.charAt(0).toUpperCase()}
            </div>
          )}
          {isOwnProfile && (
            <>
              <button
                className="profile-avatar-edit"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                title="Change profile picture"
              >
                {avatarUploading ? '…' : <Camera size={16} />}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </>
          )}
        </div>

        {/* Name + actions */}
        <div className="profile-info">
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input-field"
                style={{ fontSize: '1.8rem', padding: '0.6rem 1rem', fontWeight: 700, backgroundColor: 'var(--bg-primary)' }}
                autoFocus
              />
              <button onClick={handleSaveNickname} className="btn btn-primary" style={{ padding: '0.6rem 1rem', borderRadius: '12px' }}>
                <Check size={20} />
              </button>
            </div>
          ) : (
            <div className="profile-name-row">
              <h2 className="profile-display-name">{displayNickname}</h2>
              <div className="profile-name-actions">
                {isOwnProfile && (
                  <button onClick={() => setIsEditing(true)} className="profile-icon-btn" title="Edit name">
                    <Edit2 size={18} />
                  </button>
                )}
                {isOwnProfile && (
                  <button onClick={handleLogout} className="profile-icon-btn logout" title="Logout">
                    <LogOut size={18} />
                  </button>
                )}
              </div>
            </div>
          )}
          <p className="profile-username">@{username}</p>
        </div>
      </header>


      
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
