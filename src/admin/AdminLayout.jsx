import React, { useState } from 'react';
import { 
  LayoutDashboard, Layers, Briefcase, 
  Image as ImageIcon, Inbox, Settings, 
  LogOut, ExternalLink, MousePointer,
  FileText, CornerDownRight, Search,
  Activity, Webhook, BookOpen, Clock, Calendar, CheckSquare
} from 'lucide-react';
import { adminLogout } from '../api/admin';

import DashboardView from './DashboardView';
import HomepageCMS from './HomepageCMS';
import ServicesCMS from './ServicesCMS';
import ProjectsCMS from './ProjectsCMS';
import MediaLibraryCMS from './MediaLibraryCMS';
import LeadsCMS from './LeadsCMS';
import SettingsCMS from './SettingsCMS';
import PagesCMS from './PagesCMS';
import PageBuilderCMS from './PageBuilderCMS';
import RedirectsCMS from './RedirectsCMS';
import GlobalBlocksCMS from './GlobalBlocksCMS';
import NotFoundManagerCMS from './NotFoundManagerCMS';
import FormSubmissionsCMS from './FormSubmissionsCMS';
import BlogCMS from './BlogCMS';
import SEOOverviewCMS from './SEOOverviewCMS';
import SystemHealthCMS from './SystemHealthCMS';
import IntegrationsCMS from './IntegrationsCMS';
import FormsCMS from './FormsCMS';
import ReviewQueueCMS from './ReviewQueueCMS';
import ScheduledJobsCMS from './ScheduledJobsCMS';
import NotificationCenter from './NotificationCenter';
import GlobalSearchModal from './GlobalSearchModal';

export default function AdminLayout({ user, onLogout, onViewPublicSite }) {
  const [activeTab, setActiveTab] = useState('pages');
  const [editingPageId, setEditingPageId] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pages', label: 'Pages & Landing Pages', icon: FileText },
    { id: 'review-queue', label: 'Editorial Review Queue', icon: CheckSquare },
    { id: 'scheduled', label: 'Scheduled Content', icon: Calendar },
    { id: 'forms', label: 'Form Builder', icon: Inbox },
    { id: 'leads', label: 'Unified Leads CRM', icon: Inbox },
    { id: 'blog', label: 'Blog & Articles', icon: BookOpen },
    { id: 'global-blocks', label: 'Reusable Global Blocks', icon: Layers },
    { id: 'media', label: 'Media Library Pro', icon: ImageIcon },
    { id: 'seo-overview', label: 'SEO Diagnostics', icon: Search },
    { id: 'redirects', label: '301 / 302 Redirects', icon: CornerDownRight },
    { id: '404-monitor', label: '404 Error Monitor', icon: CornerDownRight },
    { id: 'homepage', label: 'Homepage Sections', icon: Layers },
    { id: 'services', label: 'Services CMS', icon: Layers },
    { id: 'projects', label: 'Projects & Work', icon: Briefcase },
    { id: 'integrations', label: 'Integrations & Webhooks', icon: Webhook },
    { id: 'system-health', label: 'System Health', icon: Activity },
    { id: 'settings', label: 'Global Settings', icon: Settings },
  ];

  const handleLogoutClick = () => {
    adminLogout();
    onLogout();
  };

  const handleNavigateFromSearch = (tab, id) => {
    if (tab === '__OPEN_SEARCH__') {
      setIsSearchOpen(true);
      return;
    }
    setActiveTab(tab);
    if (tab === 'pages' && id) {
      setEditingPageId(id);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0F172A', color: '#F8FAFC' }}>
      
      {/* Sidebar Navigation Panel */}
      <aside style={{
        width: '260px',
        backgroundColor: '#090D16',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
        borderRight: '1px solid #1E293B'
      }}>
        
        {/* Brand Header */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--dc-purple, #5C3BFF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MousePointer size={16} color="#FFFFFF" style={{ transform: 'rotate(-25deg)', fill: '#FFFFFF' }} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
            digital<span style={{ color: 'var(--dc-purple, #5C3BFF)' }}>clik</span>
          </span>
          <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginLeft: 'auto', fontWeight: 700 }}>PRO</span>
        </div>

        {/* Sidebar Nav Links */}
        <div style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          {navItems.map(item => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setEditingPageId(null);
                  setActiveTab(item.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  fontFamily: 'var(--dc-font-heading, sans-serif)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: isActive ? 'var(--dc-purple, #5C3BFF)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8'
                }}
              >
                <IconComponent size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Account & Actions Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            onClick={onViewPublicSite}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.55rem 0.75rem',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <span>View Live Site</span>
            <ExternalLink size={13} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF', truncate: true }}>{user?.name || 'Admin'}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{user?.email || 'admin@digitalclik.com'}</div>
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
      <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#090D16' }}>
        
        {/* Top Header Bar */}
        {!editingPageId && (
          <header style={{
            height: '60px',
            backgroundColor: '#090D16',
            borderBottom: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 40
          }}>
            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                color: '#64748B',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <Search size={14} />
              <span>Search pages, blogs, leads...</span>
              <kbd style={{ fontSize: '0.7rem', background: '#1E293B', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#94A3B8' }}>
                ⌘K
              </kbd>
            </button>

            {/* Notification Center */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <NotificationCenter onNavigate={(tab) => {
                if (tab === 'leads') setActiveTab('leads');
                else if (tab === 'review') setActiveTab('review-queue');
              }} />
            </div>
          </header>
        )}

        {/* Dynamic CMS Page or Builder View */}
        <main style={{ flex: 1, padding: editingPageId ? 0 : '2rem' }}>
          {editingPageId ? (
            <PageBuilderCMS
              pageId={editingPageId}
              onBack={() => setEditingPageId(null)}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => setActiveTab(tab)} />}
              {activeTab === 'pages' && <PagesCMS onEditPage={(id) => setEditingPageId(id)} />}
              {activeTab === 'review-queue' && <ReviewQueueCMS onNavigateToPage={(id) => setEditingPageId(id)} />}
              {activeTab === 'scheduled' && <ScheduledJobsCMS onNavigateToPage={(id) => setEditingPageId(id)} />}
              {activeTab === 'forms' && <FormsCMS />}
              {activeTab === 'leads' && <LeadsCMS />}
              {activeTab === 'blog' && <BlogCMS />}
              {activeTab === 'global-blocks' && <GlobalBlocksCMS />}
              {activeTab === 'form-submissions' && <FormSubmissionsCMS />}
              {activeTab === 'seo-overview' && <SEOOverviewCMS onNavigate={(tab) => setActiveTab(tab)} />}
              {activeTab === 'redirects' && <RedirectsCMS />}
              {activeTab === '404-monitor' && <NotFoundManagerCMS />}
              {activeTab === 'homepage' && <HomepageCMS />}
              {activeTab === 'services' && <ServicesCMS />}
              {activeTab === 'projects' && <ProjectsCMS />}
              {activeTab === 'media' && <MediaLibraryCMS />}
              {activeTab === 'integrations' && <IntegrationsCMS />}
              {activeTab === 'system-health' && <SystemHealthCMS />}
              {activeTab === 'settings' && <SettingsCMS />}
            </>
          )}
        </main>
      </div>

      {/* Global Search Command Palette */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigateFromSearch}
      />

    </div>
  );
}
