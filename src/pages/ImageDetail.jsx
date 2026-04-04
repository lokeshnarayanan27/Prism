import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Heart, Download, ArrowLeft, Trash2, Tag } from 'lucide-react';

export const ImageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { images, likeImage, deleteImage, user: currentUser, users } = useStore();
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const topRef = useRef(null);

  const image = images.find(img => String(img.id) === String(id));

  useEffect(() => {
    if (image) {
      setLocalLikes(image.likes || 0);
      setLiked(false);
    }
    // scroll to top when navigating to detail
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, image]);

  if (!image) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        <p>Image not found.</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '1rem', color: 'var(--accent)' }}>
          ← Back to Home
        </button>
      </div>
    );
  }

  const uploaderNickname = users[image.authorId]?.nickname || image.userNickname || image.user || 'Unknown';
  const isAuthor = currentUser && currentUser.uid === image.authorId;

  // Similar images: same category or by same author, excluding current
  const similar = images.filter(img =>
    img.id !== image.id &&
    (img.category === image.category || img.authorId === image.authorId)
  ).slice(0, 12);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLocalLikes(prev => prev + 1);
      likeImage(image.id);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();

      // Use canvas to re-encode as WebP for smaller size without visual quality loss
      const img = new Image();
      const originalUrl = URL.createObjectURL(blob);
      img.src = originalUrl;

      await new Promise(resolve => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(webpBlob => {
        const a = document.createElement('a');
        const url = URL.createObjectURL(webpBlob);
        a.href = url;
        const name = (image.tags?.[0] || image.title || 'prism').replace(/\s+/g, '_');
        a.download = `${name}_prism.webp`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => {
          URL.revokeObjectURL(url);
          URL.revokeObjectURL(originalUrl);
        }, 100);
      }, 'image/webp', 0.88);
    } catch (err) {
      console.error('Download failed:', err);
      window.open(image.url, '_blank');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this image?')) {
      try {
        await deleteImage(image.id);
        navigate('/');
      } catch (err) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  const handleSimilarClick = (imgId) => {
    navigate(`/image/${imgId}`);
  };

  return (
    <div className="image-detail-page animate-fade-in">
      {/* ── Top: Main Image ── */}
      <div className="image-detail-top" ref={topRef}>
        {/* Back button */}
        <button className="image-detail-back glass" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>

        <img
          src={image.url}
          alt={image.tags?.[0] || image.title || 'Image'}
          className="image-detail-img"
        />

        {/* Gradient overlay with actions */}
        <div className="image-detail-gradient">
          <div className="image-detail-meta">
            <div>
              <div className="image-detail-tags">
                {image.tags?.length > 0
                  ? image.tags.map(tag => (
                    <span key={tag} className="detail-tag">#{tag}</span>
                  ))
                  : image.title && <span className="detail-tag">{image.title}</span>
                }
              </div>
              <p className="image-detail-uploader">by {uploaderNickname}</p>
              {image.category && (
                <span className="image-detail-category">{image.category}</span>
              )}
            </div>
            <div className="image-detail-actions">
              <button className="detail-action-btn glass" onClick={handleLike}>
                <Heart size={20} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : 'white'} />
                <span>{localLikes > 0 ? localLikes : ''}</span>
              </button>
              <button className="detail-action-btn glass" onClick={handleDownload}>
                <Download size={20} />
              </button>
              {isAuthor && (
                <button className="detail-action-btn glass danger" onClick={handleDelete}>
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom: Similar Images ── */}
      {similar.length > 0 && (
        <div className="image-detail-similar">
          <h3 className="similar-title">More like this</h3>
          <div className="similar-grid">
            {similar.map(img => (
              <SimilarCard key={img.id} image={img} onClick={() => handleSimilarClick(img.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SimilarCard = ({ image, onClick }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="similar-card" onClick={onClick}>
      <img
        src={image.url}
        alt={image.tags?.[0] || image.title || 'Image'}
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease' }}
        loading="lazy"
      />
    </div>
  );
};
