import React, { useState } from 'react';
import { Heart, Download, Maximize2, Trash2, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export const ImageCard = ({ image }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const { likeImage, deleteImage, user: currentUser, users } = useStore();
  const uploaderNickname = users[image.authorId]?.nickname || image.userNickname || image.user || 'Unknown';
  const isAuthor = currentUser && currentUser.uid === image.authorId;

  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const landscape = naturalWidth > naturalHeight;
    setIsLandscape(landscape);
    
    // Calculate aspect ratio. For landscape images, we'll swap it after rotation.
    if (landscape) {
      setAspectRatio(naturalWidth / naturalHeight); // Original ratio
    } else {
      setAspectRatio(naturalWidth / naturalHeight);
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${image.title.replace(/\s+/g, '_')}_prism.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (err) {
      console.error('Download failed:', err);
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

  // Pinterest-style adaptive rendering
  // If landscape, we rotate it 90deg, effectively swapping [width/height] to [height/width] in terms of visual footprint
  const containerStyle = {
    position: 'relative',
    cursor: 'pointer',
    width: '100%',
    // If we have aspect ratio, we can set it. If landscape, ratio is [H/W] because it's rotated.
    // If portrait, ratio is [W/H].
    aspectRatio: aspectRatio ? (isLandscape ? `1 / ${aspectRatio}` : `${aspectRatio}`) : 'auto',
    backgroundColor: '#1d1d1d',
    overflow: 'hidden'
  };

  const finalImgStyle = {
    display: 'block',
    opacity: aspectRatio ? 1 : 0,
    transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    ...(isLandscape ? {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(90deg)',
      width: 'auto',
      height: `${(1 / aspectRatio) * 100}%`,
    } : {
      width: '100%',
      height: 'auto',
    })
  };

  return (
    <div className="masonry-item image-card-container" style={containerStyle}>
      <img 
        src={image.url} 
        alt={image.title}
        onLoad={handleLoad}
        style={finalImgStyle}
        loading="lazy"
      />
      
      {/* Overlay gradient */}
      <div className="image-overlay" style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
        pointerEvents: 'none', display: 'flex', flexDirection: 'column', 
        justifyContent: 'flex-end', padding: '1rem', color: 'white'
      }}>
        <div className="image-overlay-content" style={{ pointerEvents: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.25rem' }}>
            <div style={{ overflow: 'hidden' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.15rem 0', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{image.title}</h3>
              <p style={{ margin: 0, opacity: 0.7, fontSize: '0.75rem', color: 'white' }}>{uploaderNickname}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); likeImage(image.id); }}
                className="glass"
                style={{
                  height: '32px', borderRadius: '16px', padding: '0 10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  color: 'white', border: 'none', fontWeight: 600, fontSize: '0.85rem'
                }}
              >
                <Heart size={16} fill={image.likes > 0 ? '#ef4444' : 'none'} color={image.likes > 0 ? '#ef4444' : 'white'} />
                {image.likes > 0 && <span>{image.likes}</span>}
              </button>
              <button 
                onClick={handleDownload}
                className="glass"
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', border: 'none'
                }}
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top right actions */}
      <div className="image-actions-top" style={{
        position: 'absolute', top: '0.75rem', right: '0.75rem',
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
          {/* In modal, we show the image in its original orientation or rotated? 
              User said "Automatically rotate... so it fits into a portrait-style layout".
              Usually, modals show the original. I'll stick to original in modal unless specified otherwise.
          */}
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
