import React, { useState } from 'react';
import { X, ChevronDown, MousePointer, ArrowRight } from 'lucide-react';

export default function MobileDrawer({ isOpen, onClose, setActivePage, onOpenAuditModal }) {
  const [openSection, setOpenSection] = useState('services');

  if (!isOpen) return null;

  const handleLinkClick = (pageName) => {
    setActivePage(pageName);
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto'
    }}>
      {/* Top Mobile Bar */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--dc-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--dc-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MousePointer size={16} color="#FFFFFF" style={{ transform: 'rotate(-25deg)', fill: '#FFFFFF' }} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A0A0A' }}>
            digital<span style={{ color: 'var(--dc-purple)' }}>clik</span>
          </span>
        </div>

        <button 
          onClick={onClose}
          style={{
            background: 'var(--dc-bg-soft)',
            border: '1px solid var(--dc-border)',
            color: '#0A0A0A',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Drawer Content Body */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Services Group */}
          <div style={{ borderBottom: '1px solid var(--dc-border)', paddingBottom: '1rem' }}>
            <button 
              onClick={() => setOpenSection(openSection === 'services' ? null : 'services')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#0A0A0A',
                fontSize: '1.15rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                cursor: 'pointer'
              }}
            >
              <span>Services</span>
              <ChevronDown size={18} style={{ transform: openSection === 'services' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--dc-purple)' }} />
            </button>

            {openSection === 'services' && (
              <div style={{ paddingLeft: '1rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a onClick={() => handleLinkClick('services')} style={{ color: 'var(--dc-purple)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
                  SEO & AI Search (AEO/GEO)
                </a>
                <a onClick={() => handleLinkClick('services')} style={{ color: '#4A4A4A', fontSize: '0.95rem', cursor: 'pointer' }}>
                  Performance Paid Media
                </a>
                <a onClick={() => handleLinkClick('services')} style={{ color: '#4A4A4A', fontSize: '0.95rem', cursor: 'pointer' }}>
                  Brand Strategy & Creative
                </a>
                <a onClick={() => handleLinkClick('services')} style={{ color: '#4A4A4A', fontSize: '0.95rem', cursor: 'pointer' }}>
                  Video & UGC Ad Studio
                </a>
                <a onClick={() => handleLinkClick('services')} style={{ color: '#4A4A4A', fontSize: '0.95rem', cursor: 'pointer' }}>
                  Custom Web & App Engineering
                </a>
              </div>
            )}
          </div>

          {/* Work */}
          <div style={{ borderBottom: '1px solid var(--dc-border)', paddingBottom: '1rem' }}>
            <button 
              onClick={() => handleLinkClick('case-studies')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#0A0A0A',
                fontSize: '1.15rem',
                fontWeight: 700,
                textAlign: 'left',
                padding: '0.5rem 0',
                cursor: 'pointer'
              }}
            >
              Selected Work
            </button>
          </div>

          {/* Industries */}
          <div style={{ borderBottom: '1px solid var(--dc-border)', paddingBottom: '1rem' }}>
            <button 
              onClick={() => handleLinkClick('industries')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#0A0A0A',
                fontSize: '1.15rem',
                fontWeight: 700,
                textAlign: 'left',
                padding: '0.5rem 0',
                cursor: 'pointer'
              }}
            >
              Industry Playbooks
            </button>
          </div>

          {/* Contact */}
          <div style={{ borderBottom: '1px solid var(--dc-border)', paddingBottom: '1rem' }}>
            <button 
              onClick={() => handleLinkClick('contact')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#0A0A0A',
                fontSize: '1.15rem',
                fontWeight: 700,
                textAlign: 'left',
                padding: '0.5rem 0',
                cursor: 'pointer'
              }}
            >
              Contact Us
            </button>
          </div>

        </div>

        {/* Bottom Action */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={() => {
              onClose();
              onOpenAuditModal();
            }}
            className="dc-btn dc-btn-primary" 
            style={{ width: '100%', padding: '1rem' }}
          >
            <span>Start a Project</span>
            <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
