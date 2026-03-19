import React, { useState } from 'react';
import { Heart, Download, Share2, Maximize2 } from 'lucide-react';
import { useStore } from '../store/useStore';

export const ImageCard = ({ image }) => {
  const [isHovered, setIsHovered] = useState(false);
  const likeImage = useStore(state => state.likeImage);
  const users = useStore(state => state.users);
  const uploaderNickname = users[image.user]?.nickname || image.userNickname || image.user;

  const handleDownload = () => {
    // In a real app, this would download the original file instead of opening in a new tab
    const a = document.createElement('a');
    a.href = image.url;
    a.download = `${image.title}.jpg`;
    a.target = '_blank';
    a.click();
  };

  return (
    <div 
      className="masonry-item"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ height: image.height || 'auto' }}
    >
      <img 
        src={image.url} 
        alt={image.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        loading="lazy"
      />
      
      {/* Overlay gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
        opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s ease',
        pointerEvents: 'none', display: 'flex', flexDirection: 'column', 
        justifyContent: 'flex-end', padding: '1.5rem', color: 'white'
      }}>
        <div style={{ pointerEvents: 'auto', transform: isHovered ? 'translateY(0)' : 'translateY(10px)', transition: 'transform 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>{image.title}</h3>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '0.875rem' }}>by {uploaderNickname}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => likeImage(image.id)}
                className="glass"
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', border: 'none', cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <Heart size={20} fill={image.likes > 0 ? '#ef4444' : 'none'} color={image.likes > 0 ? '#ef4444' : 'white'} />
              </button>
              <button 
                onClick={handleDownload}
                className="glass"
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', border: 'none', cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top right actions */}
      <div style={{
        position: 'absolute', top: '1rem', right: '1rem',
        opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s ease',
        display: 'flex', gap: '0.5rem'
      }}>
        <button 
          className="glass"
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', border: 'none', cursor: 'pointer'
          }}
        >
          <Maximize2 size={18} />
        </button>
      </div>
    </div>
  );
};
