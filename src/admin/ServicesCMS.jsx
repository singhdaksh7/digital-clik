import React, { useEffect, useState } from 'react';
import { getAdminServices, createService, updateService, deleteService } from '../api/admin';
import { Plus, Edit2, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ServicesCMS() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSvc, setEditingSvc] = useState(null);
  const [formData, setFormData] = useState({
    code: '01',
    title: '',
    slug: '',
    categoryLabel: 'BRAND ARCHITECTURE',
    shortDescription: '',
    metric: '',
    capabilities: '',
    featured: true,
    homepageOrder: 1,
    status: 'PUBLISHED'
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await getAdminServices();
      if (res.success) setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (svc = null) => {
    if (svc) {
      setEditingSvc(svc);
      setFormData({
        code: svc.code || '01',
        title: svc.title || '',
        slug: svc.slug || '',
        categoryLabel: svc.categoryLabel || 'BRAND ARCHITECTURE',
        shortDescription: svc.shortDescription || '',
        metric: svc.metric || '',
        capabilities: typeof svc.capabilities === 'string' ? svc.capabilities : JSON.stringify(svc.capabilities || []),
        featured: svc.featured ?? true,
        homepageOrder: svc.homepageOrder || 1,
        status: svc.status || 'PUBLISHED'
      });
    } else {
      setEditingSvc(null);
      setFormData({
        code: `0${services.length + 1}`,
        title: '',
        slug: '',
        categoryLabel: 'DIGITAL PLATFORMS',
        shortDescription: '',
        metric: '',
        capabilities: JSON.stringify(['High-Speed Web Architecture', 'UI/UX Interactive Prototyping']),
        featured: true,
        homepageOrder: services.length + 1,
        status: 'PUBLISHED'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let capArray = [];
      try {
        capArray = typeof formData.capabilities === 'string' ? JSON.parse(formData.capabilities) : formData.capabilities;
      } catch (e) {
        capArray = formData.capabilities.split(',').map(s => s.trim());
      }

      const payload = { ...formData, capabilities: capArray };

      if (editingSvc) {
        const res = await updateService(editingSvc.id, payload);
        if (res.success) {
          setServices(prev => prev.map(s => s.id === editingSvc.id ? res.data : s));
        }
      } else {
        const res = await createService(payload);
        if (res.success) {
          setServices(prev => [...prev, res.data]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await deleteService(id);
      if (res.success) {
        setServices(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#737373' }}>Loading Services CMS...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="dc-badge dc-badge-purple" style={{ marginBottom: '0.5rem' }}>CAPABILITY MANAGEMENT</span>
          <h1 style={{ fontSize: '2rem', color: '#0A0A0A' }}>Services & Capabilities CMS</h1>
        </div>
        <button onClick={() => handleOpenModal()} className="dc-btn dc-btn-primary">
          <Plus size={16} /> Add New Service
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        {services.map(svc => (
          <div key={svc.id} className="dc-card" style={{ padding: '1.75rem', background: '#FFFFFF', border: '1px solid var(--dc-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="dc-badge dc-badge-purple">{svc.code} • {svc.categoryLabel}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleOpenModal(svc)} className="dc-btn dc-btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}>
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(svc.id)} style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: 'none', background: '#FFEBEE', color: '#C62828', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <h3 style={{ fontSize: '1.3rem', color: '#0A0A0A', marginBottom: '0.5rem' }}>{svc.title}</h3>
            <p style={{ fontSize: '0.9rem', color: '#666666', lineHeight: 1.5, marginBottom: '1rem' }}>{svc.shortDescription}</p>

            <div style={{ background: 'var(--dc-bg-soft)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--dc-purple)' }}>
              ⚡ {svc.metric}
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Service Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(8px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div className="dc-card" style={{ maxWidth: '640px', width: '100%', padding: '2rem', background: '#FFFFFF', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#0A0A0A' }}>
              {editingSvc ? 'Edit Service' : 'Add New Service'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>CODE NUMBER</label>
                  <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>CATEGORY LABEL</label>
                  <input type="text" value={formData.categoryLabel} onChange={e => setFormData({ ...formData, categoryLabel: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>SERVICE TITLE *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>URL SLUG *</label>
                <input type="text" required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>SHORT DESCRIPTION *</label>
                <textarea rows="3" required value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>OUTCOME METRIC LABEL</label>
                <input type="text" value={formData.metric} onChange={e => setFormData({ ...formData, metric: e.target.value })} placeholder="e.g. High-Speed Web Architecture" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>CAPABILITIES (JSON Array or Comma Separated)</label>
                <input type="text" value={formData.capabilities} onChange={e => setFormData({ ...formData, capabilities: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="dc-btn dc-btn-primary" style={{ flex: 1, padding: '0.75rem' }}>Save Service</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="dc-btn dc-btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
