import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabase/supabase';

export const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Nature');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const user = useStore(state => state.user);

  const categories = ['Nature', 'Travel', 'Technology', 'Art', 'Architecture', 'Urban'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) { 
        setError("File is too large (max 50MB)");
        return;
      }
      setFile(selectedFile);
      setError(null);
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
      if (droppedFile.size > 50 * 1024 * 1024) { 
        setError("File is too large (max 50MB)");
        return;
      }
      setFile(droppedFile);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !user || !title.trim()) {
      setError("Please select an image and provide a title.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // Create a safely formatted filename
      const extension = file.name.split('.').pop() || 'jpg';
      const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
      const uniqueFilename = `${Date.now()}-${cleanName}.${extension}`;
      
      // In Supabase, if your bucket is 'images', your path inside it should start with the user ID directly
      const filePath = `${user.uid}/${uniqueFilename}`;
      
      // STEP 1: Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage Error:", uploadError);
        throw new Error(`FILE UPLOAD FAILED: ${uploadError.message || "Permission Denied. Check bucket RLS."}`);
      }

      setUploadProgress(50); // Move halfway after storage success

      // STEP 2: Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      // STEP 3: Add record to Database
      const { error: dbError } = await supabase.from('images').insert({
        url: publicUrl,
        title: title.trim(),
        user: user.username,
        userNickname: user.nickname || user.username,
        authorId: user.uid,
        category,
        likes: 0,
        height: Math.floor(Math.random() * 200) + 250,
        createdAt: new Date().toISOString()
      });

      if (dbError) {
        console.error("Database Error:", dbError);
        throw new Error(`DATABASE SAVE FAILED: ${dbError.message || "New row violates RLS policy."}`);
      }

      setUploadProgress(100);
      setIsUploading(false);
      navigate('/profile/' + user.username);

    } catch (err) {
      console.error("Upload error details:", err);
      setError(err.message || "Upload failed. Please check your Supabase permissions.");
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Upload Original Quality</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No compression, no limits. Showcase your art in full fidelity.</p>
      </header>

      {error && (
        <div style={{ 
          backgroundColor: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)', 
          padding: '1.25rem', borderRadius: '16px', marginBottom: '2rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <AlertCircle size={24} />
          <div>
            <strong style={{ display: 'block' }}>Upload Interrupted</strong>
            <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="glass"
          style={{
            border: `2.5px dashed ${preview ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '32px', padding: '3rem 2rem', textAlign: 'center',
            cursor: isUploading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
            position: 'relative', overflow: 'hidden', minHeight: '350px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {preview ? (
            <>
              <img 
                src={preview} 
                alt="Preview" 
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.4 }} 
              />
              <div style={{ position: 'relative', zIndex: 1, backgroundColor: 'var(--bg-primary)', padding: '1rem 1.5rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)' }}>
                <CheckCircle size={22} color="var(--success)" />
                <span style={{ fontWeight: 700 }}>Image Ready for Processing</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ 
                backgroundColor: 'var(--bg-tertiary)', width: '96px', height: '96px', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem', color: 'var(--accent)', opacity: 0.8
              }}>
                <UploadCloud size={48} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Click or drag to capture</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '1.1rem' }}>
                Files are kept in their exact original form to preserve metadata, quality and artists signature.
              </p>
            </>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', backgroundColor: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '32px', border: '1px solid var(--border)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Image Title</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Give your photography a name..." 
              style={{ fontSize: '1.1rem' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isUploading}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Subject Category</label>
            <div style={{ position: 'relative' }}>
              <select 
                className="input-field" 
                style={{ appearance: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isUploading}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>▼</div>
            </div>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            {isUploading && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent)' }}>Transmitting Data: {uploadProgress}%</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Secure Transfer Active</span>
                </div>
                <div style={{ height: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${uploadProgress}%`, backgroundColor: 'var(--accent)', transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
                </div>
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={!file || !title.trim() || isUploading}
              style={{ width: '100%', padding: '1.25rem', fontSize: '1.25rem', fontWeight: 700, opacity: (!file || !title.trim() || isUploading) ? 0.7 : 1, gap: '1rem' }}
            >
              {isUploading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Processing...
                </>
              ) : 'Publish to Feed'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
