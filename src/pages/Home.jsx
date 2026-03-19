import React from 'react';
import { useStore } from '../store/useStore';
import { ImageCard } from '../components/ImageCard';
import { Camera } from 'lucide-react';

export const Home = () => {
  const images = useStore(state => state.images);

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Discover</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Explore uncompressed, high-resolution photography</p>
        </div>
      </header>

      {images.length > 0 ? (
        <div className="masonry-grid">
          {images.map(image => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
          <Camera size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No images found</h3>
          <p>Be the first to upload something amazing!</p>
        </div>
      )}
    </div>
  );
};
