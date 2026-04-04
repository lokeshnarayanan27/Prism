import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { UploadCloud, CheckCircle, AlertCircle, Loader2, X, Tag } from 'lucide-react';
import { supabase } from '../supabase/supabase';

export const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileInfo, setFileInfo] = useState(null); // { name, size, format }
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState('Diorama');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const user = useStore(state => state.user);

  const categories = ['Diorama', 'Scale Cars', 'Figures', 'Terrain', 'Buildings', 'Nature', 'Train Sets', 'Sci-Fi', 'Fantasy', 'Abstract'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File is too large (max 50MB)');
      return;
    }
    setFile(selectedFile);
    setError(null);

    // Detect format from MIME or extension
    const ext = selectedFile.name.split('.').pop()?.toUpperCase() || 'IMAGE';
    const format = selectedFile.type?.split('/')[1]?.toUpperCase() || ext;
    const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
    setFileInfo({ name: selectedFile.name, size: sizeMB, format });

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) processFile(droppedFile);
  };

  // Tag management
  const addTag = (value) => {
    const cleaned = value.trim().replace(/^#+/, '').toLowerCase();
    if (cleaned && !tags.includes(cleaned) && tags.length < 10) {
      setTags(prev => [...prev, cleaned]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !user) {
      setError('Please select an image.');
      return;
    }
    if (tags.length === 0) {
      setError('Please add at least one tag.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const extension = file.name.split('.').pop() || 'jpg';
      const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
      const uniqueFilename = `${Date.now()}-${cleanName}.${extension}`;
      const filePath = `${user.uid}/${uniqueFilename}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      setUploadProgress(50);

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('images').insert({
        url: publicUrl,
        title: tags[0] || 'Untitled',     // keep for backward compat
        tags: tags,
        user: user.username,
        userNickname: user.nickname || user.username,
        authorId: user.uid,
        category,
        format: fileInfo?.format || 'JPEG',
        likes: 0,
        height: Math.floor(Math.random() * 200) + 250,
        createdAt: new Date().toISOString()
      });

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      setUploadProgress(100);
      setIsUploading(false);
      navigate('/profile/' + user.username);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed.');
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-fade-in upload-container">
      <header className="upload-header">
        <h2 className="upload-title">Share Your Scene</h2>
      </header>

      {error && (
        <div className="upload-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="upload-form">
        {/* Drop zone */}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`upload-dropzone glass ${preview ? 'has-preview' : ''}`}
        >
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="dropzone-preview-img" />
              <div className="dropzone-ready-badge">
                <CheckCircle size={20} color="var(--success)" />
                <span>Ready</span>
                {fileInfo && (
                  <span className="file-format-badge">{fileInfo.format} · {fileInfo.size} MB</span>
                )}
              </div>
            </>
          ) : (
            <div className="dropzone-placeholder">
              <div className="dropzone-icon">
                <UploadCloud size={44} />
              </div>
              <h3 className="dropzone-heading">Tap to select or drag & drop</h3>
              <p className="dropzone-sub">JPG, PNG, WEBP, HEIC · max 50 MB</p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
            disabled={isUploading}
          />
        </div>

        {/* Form fields */}
        <div className="upload-fields">
          {/* Tags input */}
          <div className="field-group">
            <label className="field-label">
              <Tag size={14} style={{ marginRight: '6px' }} />
              Tags
              <span className="field-hint">Press Enter or comma to add (max 10)</span>
            </label>
            <div className="tags-input-wrapper">
              {tags.map(tag => (
                <span key={tag} className="tag-chip">
                  #{tag}
                  <button type="button" className="tag-remove" onClick={() => removeTag(tag)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              {tags.length < 10 && (
                <input
                  type="text"
                  className="tags-inner-input"
                  placeholder={tags.length === 0 ? 'e.g. sunset, landscape...' : 'Add tag...'}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => tagInput && addTag(tagInput)}
                  disabled={isUploading}
                />
              )}
            </div>
          </div>

          {/* Category */}
          <div className="field-group">
            <label className="field-label">Category</label>
            <div style={{ position: 'relative' }}>
              <select
                className="input-field"
                style={{ appearance: 'none', cursor: 'pointer', fontSize: '1rem' }}
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={isUploading}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>▼</div>
            </div>
          </div>

          {/* Progress */}
          {isUploading && (
            <div className="upload-progress-wrap">
              <div className="progress-header">
                <span>Uploading… {uploadProgress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary upload-submit"
            disabled={!file || tags.length === 0 || isUploading}
          >
            {isUploading ? (
              <><Loader2 size={22} className="animate-spin" /> Processing...</>
            ) : 'Publish to Feed'}
          </button>
        </div>
      </form>
    </div>
  );
};
