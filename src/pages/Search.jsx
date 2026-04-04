import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { ImageCard } from '../components/ImageCard';
import { Search as SearchIcon, Filter } from 'lucide-react';

export const Search = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const images = useStore(state => state.images);
  const users = useStore(state => state.users);

  const categories = ['All', 'Diorama', 'Scale Cars', 'Figures', 'Terrain', 'Buildings', 'Nature', 'Train Sets', 'Sci-Fi', 'Fantasy', 'Abstract'];

  const filteredImages = useMemo(() => {
    return images.filter(img => {
      const uploaderNickname = users[img.authorId]?.nickname || img.userNickname || img.user || '';
      const searchText = [
        img.title,
        ...(img.tags || []),
        uploaderNickname,
        img.category
      ].join(' ').toLowerCase();
      const matchesQuery = query === '' || searchText.includes(query.toLowerCase());
      const matchesCategory = activeCategory === 'All' || img.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [images, query, activeCategory, users]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', margin: 0, letterSpacing: '-0.03em' }}>Explore</h2>
        
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <SearchIcon size={24} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search scenes, tags, makers..." 
            className="input-field"
            style={{ padding: '1.25rem 1.25rem 1.25rem 4rem', fontSize: '1.1rem', borderRadius: '20px' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', maskImage: 'linear-gradient(to right, black 95%, transparent)' }} className="hide-scrollbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
            <Filter size={20} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Filter</span>
          </div>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                padding: '0.6rem 1.5rem', borderRadius: '999px',
                backgroundColor: activeCategory === category ? 'var(--text-primary)' : 'var(--bg-secondary)',
                color: activeCategory === category ? 'var(--bg-primary)' : 'var(--text-primary)',
                border: `1px solid ${activeCategory === category ? 'transparent' : 'var(--border)'}`,
                fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.2s ease', fontSize: '0.95rem'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </header>
      
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>

      {filteredImages.length > 0 ? (
        <div className="masonry-grid">
          {filteredImages.map(image => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '8rem 0', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', borderRadius: '32px' }}>
          <SearchIcon size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.15 }} />
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Nothing found.</h3>
          <p>Try a different tag, maker name, or category.</p>
        </div>
      )}
    </div>
  );
};
