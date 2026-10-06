import React, { useEffect, useState } from 'react';
import { getAdminProjects, createProject, updateProject, deleteProject } from '../api/admin';
import { Plus, Edit2, Trash2, Eye, ExternalLink } from 'lucide-react';

export default function ProjectsCMS() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProj, setEditingProj] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    client: '',
    category: 'FINTECH PLATFORM',
    year: '2026',
    metric: 'SEO & Organic Growth',
    layout: 'full',
    image: '',
    summary: '',
    deliverables: '',
    featuredOnHomepage: true,
    status: 'PUBLISHED'
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await getAdminProjects();
      if (res.success) setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (proj = null) => {
    if (proj) {
      setEditingProj(proj);
      setFormData({
        title: proj.title || '',
        slug: proj.slug || '',
        client: proj.client || '',
        category: proj.category || 'FINTECH PLATFORM',
        year: proj.year || '2026',
        metric: proj.metric || 'SEO & Organic Growth',
        layout: proj.layout || 'full',
        image: proj.image || '',
        summary: proj.summary || '',
        deliverables: typeof proj.deliverables === 'string' ? proj.deliverables : JSON.stringify(proj.deliverables || []),
        featuredOnHomepage: proj.featuredOnHomepage ?? true,
        status: proj.status || 'PUBLISHED'
      });
    } else {
      setEditingProj(null);
      setFormData({
        title: '',
        slug: '',
        client: '',
        category: 'ENTERPRISE SAAS',
        year: '2026',
        metric: 'Performance Marketing',
        layout: 'split',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
        summary: '',
        deliverables: JSON.stringify(['AI Search Entity Structuring', 'Next.js Web Portal Development']),
        featuredOnHomepage: true,
        status: 'PUBLISHED'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let delArray = [];
      try {
        delArray = typeof formData.deliverables === 'string' ? JSON.parse(formData.deliverables) : formData.deliverables;
      } catch (e) {
        delArray = formData.deliverables.split(',').map(s => s.trim());
      }

      const payload = { ...formData, deliverables: delArray };

      if (editingProj) {
        const res = await updateProject(editingProj.id, payload);
        if (res.success) {
          setProjects(prev => prev.map(p => p.id === editingProj.id ? res.data : p));
        }
      } else {
        const res = await createProject(payload);
        if (res.success) {
          setProjects(prev => [...prev, res.data]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await deleteProject(id);
      if (res.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#737373' }}>Loading Projects CMS...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="dc-badge dc-badge-purple" style={{ marginBottom: '0.5rem' }}>PORTFOLIO MANAGEMENT</span>
          <h1 style={{ fontSize: '2rem', color: '#0A0A0A' }}>Projects & Selected Work CMS</h1>
        </div>
        <button onClick={() => handleOpenModal()} className="dc-btn dc-btn-primary">
          <Plus size={16} /> Add New Project
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {projects.map(proj => (
          <div key={proj.id} className="dc-card" style={{ padding: '1.5rem', background: '#FFFFFF', display: 'flex', gap: '1.5rem', alignItems: 'center', border: '1px solid var(--dc-border)' }}>
            <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#0A0A0A' }}>
              <img src={proj.image} alt={proj.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                <span className="dc-badge dc-badge-purple">{proj.category}</span>
                <span style={{ fontSize: '0.78rem', color: '#737373', fontWeight: 600 }}>{proj.client} • {proj.year}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--dc-purple)', fontWeight: 700 }}>LAYOUT: {proj.layout.toUpperCase()}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#0A0A0A', margin: '0.2rem 0' }}>{proj.title}</h3>
              <p style={{ fontSize: '0.88rem', color: '#666666' }}>{proj.summary}</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleOpenModal(proj)} className="dc-btn dc-btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                <Edit2 size={14} /> Edit
              </button>
              <button onClick={() => handleDelete(proj.id)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: 'none', background: '#FFEBEE', color: '#C62828', cursor: 'pointer' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(8px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div className="dc-card" style={{ maxWidth: '640px', width: '100%', padding: '2rem', background: '#FFFFFF', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#0A0A0A' }}>
              {editingProj ? 'Edit Project' : 'Add New Project'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>CLIENT NAME *</label>
                  <input type="text" required value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>PROJECT CATEGORY *</label>
                  <input type="text" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>PROJECT TITLE *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>URL SLUG *</label>
                  <input type="text" required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>HOMEPAGE LAYOUT</label>
                  <select value={formData.layout} onChange={e => setFormData({ ...formData, layout: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }}>
                    <option value="full">Full Landscape</option>
                    <option value="split">Split Screen</option>
                    <option value="bleed">Full Bleed 100vw</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>HERO IMAGE URL *</label>
                <input type="text" required value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>CAPABILITY OUTCOME METRIC</label>
                <input type="text" value={formData.metric} onChange={e => setFormData({ ...formData, metric: e.target.value })} placeholder="e.g. SEO & Organic Growth" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>PROJECT SUMMARY *</label>
                <textarea rows="3" required value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="dc-btn dc-btn-primary" style={{ flex: 1, padding: '0.75rem' }}>Save Project</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="dc-btn dc-btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
