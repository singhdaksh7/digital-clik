import React, { useEffect, useState } from 'react';
import { getMediaItems, uploadMediaFile, deleteMediaItem } from '../api/admin';
import { Upload, Trash2, Copy, Check, Image as ImageIcon } from 'lucide-react';

export default function MediaLibraryCMS() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const res = await getMediaItems();
      if (res.success) setMedia(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadMediaFile(file);
      if (res.success) {
        setMedia(prev => [res.data, ...prev]);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (url, id) => {
    const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete media asset from library?')) return;
    try {
      const res = await deleteMediaItem(id);
      if (res.success) {
        setMedia(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#737373' }}>Loading Media Assets...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="dc-badge dc-badge-purple" style={{ marginBottom: '0.5rem' }}>ASSET STORAGE</span>
          <h1 style={{ fontSize: '2rem', color: '#0A0A0A' }}>Media Library</h1>
        </div>

        <label className="dc-btn dc-btn-primary" style={{ cursor: 'pointer' }}>
          <Upload size={16} />
          <span>{uploading ? 'Uploading Asset...' : 'Upload New Media'}</span>
          <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*,video/*" />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        {media.map(m => (
          <div key={m.id} className="dc-card" style={{ padding: '1rem', background: '#FFFFFF', border: '1px solid var(--dc-border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '160px', background: 'var(--dc-bg-soft)', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.75rem', position: 'relative' }}>
              <img src={m.url.startsWith('http') ? m.url : `http://localhost:5000${m.url}`} alt={m.altText || m.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.2rem' }}>
              {m.originalName}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#737373', marginBottom: '0.75rem' }}>
              {(m.size / 1024).toFixed(1)} KB • {m.mimeType}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <button onClick={() => handleCopyUrl(m.url, m.id)} className="dc-btn dc-btn-secondary" style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem' }}>
                {copiedId === m.id ? <Check size={14} color="var(--dc-purple)" /> : <Copy size={14} />}
                <span>{copiedId === m.id ? 'Copied' : 'URL'}</span>
              </button>
              <button onClick={() => handleDelete(m.id)} style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: 'none', background: '#FFEBEE', color: '#C62828', cursor: 'pointer' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
