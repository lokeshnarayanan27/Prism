import React from 'react';
import { useStore } from '../store/useStore';
import { ImageCard } from '../components/ImageCard';
import { Compass } from 'lucide-react';
import { Logo } from '../components/Logo';

export const Home = () => {
  const images = useStore(state => state.images);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>Discover</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Explore high-resolution, original quality photography.</p>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            <Compass size={24} />
        </div>
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
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No images captured yet.</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto' }}>Be the first one to capture and share uncompressed inspiration with the community.</p>
        </div>
      )}
    </div>
  );
};
