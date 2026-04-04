import React from 'react';
import { useStore } from '../store/useStore';
import { ImageCard } from '../components/ImageCard';
import { Logo } from '../components/Logo';

export const Home = () => {
  const images = useStore(state => state.images);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <header className="home-header">
        <h2 className="home-title">Tiny World</h2>
      </header>

      {images.length > 0 ? (
        <div className="masonry-grid">
          {images.map(image => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '10rem 0', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', borderRadius: '32px' }}>
          <div style={{ margin: '0 auto 1.5rem', opacity: 0.3, display: 'flex', justifyContent: 'center' }}>
            <Logo size={64} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No scenes captured yet.</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto' }}>Be the first to share your miniature world with the community.</p>
        </div>
      )}
    </div>
  );
};
