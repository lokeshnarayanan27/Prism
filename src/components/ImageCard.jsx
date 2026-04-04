import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ImageCard = ({ image }) => {
  const navigate = useNavigate();
  const [aspectRatio, setAspectRatio] = useState(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const landscape = naturalWidth > naturalHeight;
    setIsLandscape(landscape);
    setAspectRatio(naturalWidth / naturalHeight);
    setLoaded(true);
  };

  const handleClick = () => {
    navigate(`/image/${image.id}`);
  };

  // Portrait: show naturally. Landscape: rotate 90° so it fits as portrait column.
  const containerStyle = {
    position: 'relative',
    cursor: 'pointer',
    width: '100%',
    aspectRatio: aspectRatio
      ? isLandscape
        ? `1 / ${aspectRatio}` // swapped because rotated
        : `${aspectRatio}`
      : 'auto',
    backgroundColor: '#1d1d1d',
    overflow: 'hidden',
  };

  const imgStyle = {
    display: 'block',
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.5s ease',
    ...(isLandscape
      ? {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(90deg)',
          width: 'auto',
          height: `${(1 / aspectRatio) * 100}%`,
        }
      : {
          width: '100%',
          height: 'auto',
        }),
  };

  return (
    <div
      className="masonry-item image-card-container"
      style={containerStyle}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      <img
        src={image.url}
        alt={image.tags?.[0] || image.title || 'Photo'}
        onLoad={handleLoad}
        style={imgStyle}
        loading="lazy"
      />

      {/* Minimal overlay — only uploader name, no like count */}
      <div className="card-overlay-minimal">
        <span className="card-uploader-name">
          {image.userNickname || image.user || ''}
        </span>
      </div>
    </div>
  );
};
