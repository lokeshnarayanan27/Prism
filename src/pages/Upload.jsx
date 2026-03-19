import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { UploadCloud, CheckCircle, Image as ImageIcon } from 'lucide-react';

export const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Nature');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const addImage = useStore(state => state.addImage);
  const user = useStore(state => state.user);

  const categories = ['Nature', 'Travel', 'Technology', 'Art', 'Architecture'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const newImage = {
        id: Date.now().toString(),
        url: preview, // Using the base64 preview as url for mockup
        title: title || 'Untitled',
        user: user?.username || 'guest',
        userNickname: user?.nickname || user?.username || 'Guest',
        category,
        likes: 0,
        height: Math.floor(Math.random() * 200) + 250 // Random height for masonry layout effect
      };

      addImage(newImage);
      setIsUploading(false);
      navigate('/profile/' + (user?.username || 'guest'));
    }, 1500);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Upload High-Res Image</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Share your photography with the world. No compression, no limits.</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="glass"
          style={{
            border: `2px dashed ${preview ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center',
            cursor: 'pointer', transition: 'all 0.3s ease',
            position: 'relative', overflow: 'hidden', minHeight: '300px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {preview ? (
            <>
              <img 
                src={preview} 
                alt="Preview" 
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 0, opacity: 0.4 }} 
              />
              <div style={{ position: 'relative', zIndex: 1, backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={20} color="var(--success)" />
                <span style={{ fontWeight: 600 }}>File Selected</span>
              </div>
            </>
          ) : (
            <>
              <UploadCloud size={64} style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Click or drag to upload</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
                Files will be saved and served in their exact original form to preserve metadata and quality.
              </p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Title</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Sunset in Yosemite" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
            <div style={{ position: 'relative' }}>
              <select 
                className="input-field" 
                style={{ appearance: 'none', cursor: 'pointer' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>▼</div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={!file || isUploading}
            style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem', opacity: (!file || isUploading) ? 0.7 : 1 }}
          >
            {isUploading ? 'Uploading Original File...' : 'Upload Image'}
          </button>
        </div>
      </form>
    </div>
  );
};
