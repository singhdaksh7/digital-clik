import React, { useEffect, useState } from 'react';
import { getSiteSettings } from '../api/public';
import { updateSiteSettings, updateAnnouncementBar } from '../api/admin';
import { Save, Check } from 'lucide-react';

export default function SettingsCMS() {
  const [settings, setSettings] = useState({
    companyName: 'DigitalClik',
    shortName: 'DigitalClik Agency',
    email: 'hello@digitalclik.com',
    phone: '+1 (800) 555-CLIK',
    whatsapp: '+18005552545',
    address: 'DigitalClik Headquarters',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    defaultMetaTitle: '',
    defaultMetaDescription: ''
  });

  const [announcement, setAnnouncement] = useState({
    enabled: true,
    text: 'AI Search Authority (AEO/GEO) & High-Speed Web Platforms',
    linkText: 'EXPLORE AUDIT ↗',
    linkUrl: '#audit'
  });

  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await getSiteSettings();
      if (res.success && res.data) {
        if (res.data.settings) setSettings(res.data.settings);
        if (res.data.announcement) setAnnouncement(res.data.announcement);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await updateSiteSettings(settings);
      await updateAnnouncementBar(announcement);
      setSavedMsg('Site settings updated successfully!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#737373' }}>Loading Settings CMS...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="dc-badge dc-badge-purple" style={{ marginBottom: '0.5rem' }}>GLOBAL CONFIGURATION</span>
        <h1 style={{ fontSize: '2rem', color: '#0A0A0A' }}>Site Settings & Information</h1>
      </div>

      {savedMsg && (
        <div style={{ background: 'var(--dc-purple-tint)', border: '1px solid var(--dc-purple)', color: 'var(--dc-purple)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 700 }}>
          ✓ {savedMsg}
        </div>
      )}

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Announcement Bar */}
        <div className="dc-card" style={{ padding: '2rem', background: '#FFFFFF', border: '1px solid var(--dc-border)' }}>
          <h3 style={{ fontSize: '1.3rem', color: '#0A0A0A', marginBottom: '1rem' }}>Top Announcement Bar</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="annEnabled" checked={announcement.enabled} onChange={e => setAnnouncement({ ...announcement, enabled: e.target.checked })} />
              <label htmlFor="annEnabled" style={{ fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>Enable Announcement Bar Globally</label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>ANNOUNCEMENT TEXT</label>
              <input type="text" value={announcement.text} onChange={e => setAnnouncement({ ...announcement, text: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>LINK BUTTON LABEL</label>
                <input type="text" value={announcement.linkText} onChange={e => setAnnouncement({ ...announcement, linkText: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>LINK TARGET URL</label>
                <input type="text" value={announcement.linkUrl} onChange={e => setAnnouncement({ ...announcement, linkUrl: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Company & Contact Information */}
        <div className="dc-card" style={{ padding: '2rem', background: '#FFFFFF', border: '1px solid var(--dc-border)' }}>
          <h3 style={{ fontSize: '1.3rem', color: '#0A0A0A', marginBottom: '1rem' }}>Company & Contact Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>PRIMARY EMAIL</label>
              <input type="email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>CLIENT DIRECT PHONE</label>
              <input type="text" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--dc-border)' }} />
            </div>
          </div>
        </div>

        <button type="submit" className="dc-btn dc-btn-primary" style={{ padding: '1rem 2.5rem', alignSelf: 'flex-start' }}>
          <Save size={18} /> Save Settings & Configuration
        </button>

      </form>
    </div>
  );
}
