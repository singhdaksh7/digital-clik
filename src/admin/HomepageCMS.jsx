import React, { useEffect, useState } from 'react';
import { getHomepageSections, updateHomepageSection } from '../api/admin';
import { Eye, EyeOff, Save, ArrowUp, ArrowDown, Check, Edit2 } from 'lucide-react';

export default function HomepageCMS() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSec, setEditingSec] = useState(null);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const res = await getHomepageSections();
      if (res.success) {
        setSections(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (sec) => {
    try {
      const updatedVisible = !sec.isVisible;
      const res = await updateHomepageSection(sec.id, { ...sec, isVisible: updatedVisible });
      if (res.success) {
        setSections(prev => prev.map(s => s.id === sec.id ? { ...s, isVisible: updatedVisible } : s));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Update sortOrder
    const updatedWithSort = newSections.map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
    setSections(updatedWithSort);

    // Save orders to DB
    for (const s of updatedWithSort) {
      await updateHomepageSection(s.id, { sortOrder: s.sortOrder });
    }
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    try {
      const res = await updateHomepageSection(editingSec.id, editingSec);
      if (res.success) {
        setSections(prev => prev.map(s => s.id === editingSec.id ? res.data : s));
        setEditingSec(null);
        setSavedMsg('Section updated successfully!');
        setTimeout(() => setSavedMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#737373' }}>Loading Homepage Configuration...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="dc-badge dc-badge-purple" style={{ marginBottom: '0.5rem' }}>HOMEPAGE ARCHITECTURE</span>
        <h1 style={{ fontSize: '2rem', color: '#0A0A0A' }}>Reorder & Toggle Homepage Sections</h1>
        <p style={{ color: 'var(--dc-text-secondary)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
          Control which sections appear on the live homepage and change their rendering order dynamically.
        </p>
      </div>

      {savedMsg && (
        <div style={{ background: 'var(--dc-purple-tint)', border: '1px solid var(--dc-purple)', color: 'var(--dc-purple)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 700 }}>
          ✓ {savedMsg}
        </div>
      )}

      {/* Sections List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sections.map((sec, idx) => (
          <div key={sec.id} className="dc-card" style={{
            padding: '1.25rem 1.75rem',
            background: sec.isVisible ? '#FFFFFF' : 'var(--dc-bg-soft)',
            opacity: sec.isVisible ? 1 : 0.6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--dc-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <button 
                  disabled={idx === 0} 
                  onClick={() => handleMove(idx, -1)}
                  style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? '#CCC' : '#0A0A0A' }}
                >
                  <ArrowUp size={16} />
                </button>
                <button 
                  disabled={idx === sections.length - 1} 
                  onClick={() => handleMove(idx, 1)}
                  style={{ background: 'none', border: 'none', cursor: idx === sections.length - 1 ? 'default' : 'pointer', color: idx === sections.length - 1 ? '#CCC' : '#0A0A0A' }}
                >
                  <ArrowDown size={16} />
                </button>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--dc-purple)' }}>ORDER {sec.sortOrder}</span>
                <h3 style={{ fontSize: '1.2rem', color: '#0A0A0A', margin: '0.1rem 0' }}>{sec.title || sec.sectionKey}</h3>
                <span style={{ fontSize: '0.78rem', color: '#737373', fontWeight: 600 }}>KEY: {sec.sectionKey}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setEditingSec(sec)}
                className="dc-btn dc-btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              >
                <Edit2 size={14} /> Edit Title
              </button>

              <button 
                onClick={() => handleToggleVisibility(sec)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: sec.isVisible ? '#E8F5E9' : '#FFEBEE',
                  color: sec.isVisible ? '#2E7D32' : '#C62828',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                {sec.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                <span>{sec.isVisible ? 'VISIBLE' : 'HIDDEN'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Section Modal */}
      {editingSec && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(8px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div className="dc-card" style={{ maxWidth: '520px', width: '100%', padding: '2rem', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#0A0A0A' }}>Edit Homepage Section</h3>
            
            <form onSubmit={handleSaveSection} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.3rem' }}>SECTION TITLE</label>
                <input 
                  type="text" 
                  value={editingSec.title || ''} 
                  onChange={(e) => setEditingSec({ ...editingSec, title: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.3rem' }}>EYEBROW BADGE TEXT</label>
                <input 
                  type="text" 
                  value={editingSec.eyebrow || ''} 
                  onChange={(e) => setEditingSec({ ...editingSec, eyebrow: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="dc-btn dc-btn-primary" style={{ flex: 1, padding: '0.75rem' }}>Save Changes</button>
                <button type="button" onClick={() => setEditingSec(null)} className="dc-btn dc-btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
