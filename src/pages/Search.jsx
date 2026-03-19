import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { ImageCard } from '../components/ImageCard';
import { Search as SearchIcon, Filter } from 'lucide-react';

export const Search = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const images = useStore(state => state.images);

  const categories = ['All', 'Nature', 'Travel', 'Technology', 'Art', 'Architecture'];

  const users = useStore(state => state.users);

  const filteredImages = useMemo(() => {
    return images.filter(img => {
      const uploaderNickname = users[img.user]?.nickname || img.userNickname || img.user;
      const matchesQuery = img.title.toLowerCase().includes(query.toLowerCase()) || 
                           uploaderNickname.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = activeCategory === 'All' || img.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [images, query, activeCategory]);

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Explore</h2>
        
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <SearchIcon size={24} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search high-res images, users, or tags..." 
            className="input-field"
            style={{ padding: '1.25rem 1.25rem 1.25rem 3.5rem', fontSize: '1.1rem', borderRadius: '16px' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <Filter size={20} style={{ color: 'var(--text-secondary)' }} />
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: '999px',
                backgroundColor: activeCategory === category ? 'var(--text-primary)' : 'var(--bg-secondary)',
                color: activeCategory === category ? 'var(--bg-primary)' : 'var(--text-primary)',
                border: `1px solid ${activeCategory === category ? 'transparent' : 'var(--border)'}`,
                fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </header>

      {filteredImages.length > 0 ? (
        <div className="masonry-grid">
          {filteredImages.map(image => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
          <SearchIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No results found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
};
