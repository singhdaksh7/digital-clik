import React, { useState } from 'react';
import { 
  LayoutDashboard, Layers, Briefcase, Building2, 
  Quote, Sliders, Image as ImageIcon, Inbox, Settings, 
  ShieldCheck, LogOut, ExternalLink, MousePointer, Sparkles 
} from 'lucide-react';
import { adminLogout } from '../api/admin';

import DashboardView from './DashboardView';
import HomepageCMS from './HomepageCMS';
import ServicesCMS from './ServicesCMS';
import ProjectsCMS from './ProjectsCMS';
import MediaLibraryCMS from './MediaLibraryCMS';
import LeadsCMS from './LeadsCMS';
import SettingsCMS from './SettingsCMS';

export default function AdminLayout({ user, onLogout, onViewPublicSite }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'homepage', label: 'Homepage Sections', icon: Sliders },
    { id: 'services', label: 'Services CMS', icon: Layers },
    { id: 'projects', label: 'Projects & Work', icon: Briefcase },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'leads', label: 'Leads & Enquiries', icon: Inbox },
    { id: 'settings', label: 'Global Settings', icon: Settings },
  ];

  const handleLogoutClick = () => {
    adminLogout();
    onLogout();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      
      {/* Sidebar Navigation Panel */}
      <aside style={{
        width: '260px',
        backgroundColor: '#0A0A0A',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
        borderRight: '1px solid #1A1A1A'
      }}>
        
        {/* Brand Header */}
        <div style={{ padding: '1.75rem 1.5rem', borderBottom: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--dc-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MousePointer size={16} color="#FFFFFF" style={{ transform: 'rotate(-25deg)', fill: '#FFFFFF' }} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
            digital<span style={{ color: 'var(--dc-purple)' }}>clik</span>
          </span>
          <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginLeft: 'auto', fontWeight: 700 }}>CMS</span>
        </div>

        {/* Sidebar Nav Links */}
        <div style={{ flex: 1, padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map(item => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontFamily: 'var(--dc-font-heading)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: isActive ? 'var(--dc-purple)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#A3A3A3'
                }}
              >
                <IconComponent size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Account & Actions Footer */}
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <button 
            onClick={onViewPublicSite}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0.85rem',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span>View Live Site</span>
            <ExternalLink size={14} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF' }}>{user?.name || 'Admin'}</div>
              <div style={{ fontSize: '0.72rem', color: '#737373' }}>{user?.email || 'admin@digitalclik.com'}</div>
            </div>
            <button 
              onClick={handleLogoutClick}
              title="Logout"
              style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: '0.4rem' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main style={{ marginLeft: '260px', flex: 1, padding: '2.5rem 3rem' }}>
        {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'homepage' && <HomepageCMS />}
        {activeTab === 'services' && <ServicesCMS />}
        {activeTab === 'projects' && <ProjectsCMS />}
        {activeTab === 'media' && <MediaLibraryCMS />}
        {activeTab === 'leads' && <LeadsCMS />}
        {activeTab === 'settings' && <SettingsCMS />}
      </main>

    </div>
  );
}
