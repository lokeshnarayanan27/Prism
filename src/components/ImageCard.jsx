import React, { useState } from 'react';
import { Heart, Download, Maximize2, Trash2, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export const ImageCard = ({ image }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { likeImage, deleteImage, user: currentUser, users } = useStore();
  const uploaderNickname = users[image.authorId]?.nickname || image.userNickname || image.user || 'Unknown';
  const isAuthor = currentUser && currentUser.uid === image.authorId;

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      // For cross-origin URLs (Supabase), the 'download' attribute on an anchor tag doesn't work.
      // We must fetch it as a blob and then force the download.
      const response = await fetch(image.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${image.title.replace(/\s+/g, '_')}_prism.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback
      window.open(image.url, '_blank');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        await deleteImage(image.id);
      } catch (err) {
        alert("Failed to delete image: " + err.message);
      }
    }
  };

  return (
    <div 
      className="masonry-item"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ height: image.height || 'auto', cursor: 'pointer' }}
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
        justifyContent: 'flex-end', padding: '1.25rem', color: 'white'
      }}>
        <div style={{ pointerEvents: 'auto', transform: isHovered ? 'translateY(0)' : 'translateY(10px)', transition: 'transform 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
            <div style={{ overflow: 'hidden' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{image.title}</h3>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '0.8rem', color: 'white' }}>by {uploaderNickname}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); likeImage(image.id); }}
                className="glass"
                style={{
                  height: '36px', borderRadius: '18px', padding: '0 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  color: 'white', border: 'none', fontWeight: 600, fontSize: '0.9rem'
                }}
              >
                <Heart size={18} fill={image.likes > 0 ? '#ef4444' : 'none'} color={image.likes > 0 ? '#ef4444' : 'white'} />
                {image.likes > 0 && <span>{image.likes}</span>}
              </button>
              <button 
                onClick={handleDownload}
                className="glass"
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', border: 'none'
                }}
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top right actions */}
      <div style={{
        position: 'absolute', top: '0.75rem', right: '0.75rem',
        opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s ease',
        display: 'flex', gap: '0.5rem', zIndex: 10
      }}>
        {isAuthor && (
          <button 
            onClick={handleDelete}
            className="glass" 
            style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: '#ef4444', border: 'none' 
            }}
            title="Delete Image"
          >
            <Trash2 size={16} />
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
          className="glass"
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', border: 'none', cursor: 'pointer'
          }}
        >
          <Maximize2 size={16} />
        </button>
      </div>
      
      {/* Expanded Modal */}
      {isExpanded && (
        <div 
          onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out'
          }}
        >
          <img 
            src={image.url} 
            alt={image.title}
            style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
            style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem',
              color: 'white', background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <X size={32} />
          </button>
        </div>
      )}
    </div>
  );
};
