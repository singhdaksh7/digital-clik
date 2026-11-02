import React, { useState } from 'react';
import { 
  ChevronDown, Menu, ArrowRight, MousePointer, 
  TrendingUp, Sparkles, Layers, Code2, Video, BarChart2
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenAuditModal, onToggleMobileMenu }) {
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);

  const handleNavClick = (pageName) => {
    setActivePage(pageName);
    setActiveMegaMenu(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--dc-border)',
      height: 'var(--dc-header-height)',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.3s ease'
    }}>
      <div className="dc-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        
        {/* DigitalClik Logo — Clean Minimal Identity */}
        <div 
          onClick={() => handleNavClick('home')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--dc-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            {/* Pointer / Cursor Accent Logo Graphic */}
            <MousePointer size={20} style={{ transform: 'rotate(-25deg)', fill: '#FFFFFF' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontFamily: 'var(--dc-font-heading)',
              fontSize: '1.45rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#0A0A0A',
              lineHeight: 1
            }}>
              digital<span style={{ color: 'var(--dc-purple)' }}>clik</span>
            </span>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              color: '#737373',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: '2px'
            }}>
              Digital Studio & Systems
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2.25rem' }} className="dc-desktop-nav">
          
          {/* Services Mega Menu Trigger */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setActiveMegaMenu('services')}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <button 
              onClick={() => handleNavClick('services')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activePage === 'services' || activeMegaMenu === 'services' ? 'var(--dc-purple)' : '#0A0A0A',
                fontFamily: 'var(--dc-font-heading)',
                fontSize: '0.95rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 0',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              <span>Services</span>
              <ChevronDown size={15} style={{ transition: 'transform 0.2s', transform: activeMegaMenu === 'services' ? 'rotate(180deg)' : 'none' }} />
            </button>

            {/* 4-COLUMN MEGA MENU PANEL — EDITORIAL STYLE */}
            {activeMegaMenu === 'services' && (
              <div style={{
                position: 'fixed',
                top: 'calc(var(--dc-header-height) + 10px)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(1200px, 94vw)',
                background: '#FFFFFF',
                border: '1px solid var(--dc-border)',
                borderRadius: '16px',
                padding: '2.25rem',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '2rem',
                zIndex: 1000
              }}>
                
                {/* Column 01: Websites & Web Apps */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--dc-purple)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                    01 • Websites & Apps
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Business Websites</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>Fast, responsive sites built for your brand</span>
                    </a>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Landing Pages</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>High-converting campaign landing pages</span>
                    </a>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Custom Web Apps</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>Modern React & Node.js application builds</span>
                    </a>
                  </div>
                </div>

                {/* Column 02: Software & Automation */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--dc-purple)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                    02 • Software & Workflows
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Custom CRM & Portals</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>Internal dashboards and client portals</span>
                    </a>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Business Automation</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>WhatsApp, Sheets and CRM lead sync</span>
                    </a>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>E-Commerce Systems</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>Catalogue, payment and order flows</span>
                    </a>
                  </div>
                </div>

                {/* Column 03: Search & Content */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--dc-purple)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                    03 • Search & Content
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Search & Local SEO</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>Technical SEO, structure and local ranking</span>
                    </a>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Reels & Video Editing</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>Short-form video and reels production</span>
                    </a>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Content Planning</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>Monthly calendars and social publishing</span>
                    </a>
                  </div>
                </div>

                {/* Column 04: Featured Agency Panel */}
                <div style={{
                  background: 'var(--dc-purple-tint)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(118, 47, 119, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}>
                  <div>
                    <div className="dc-badge dc-badge-purple" style={{ marginBottom: '0.75rem' }}>
                      DIGITALCLIK STUDIO
                    </div>
                    <h4 style={{ color: '#0A0A0A', fontSize: '1rem', marginBottom: '0.4rem', fontWeight: 700 }}>
                      Built Around How You Work.
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#555555', lineHeight: 1.5 }}>
                      We design, build and manage the digital side of your business so you can focus on day-to-day operations.
                    </p>
                  </div>

                  <button 
                    onClick={onOpenAuditModal}
                    className="dc-btn dc-btn-primary" 
                    style={{ width: '100%', marginTop: '1rem', padding: '0.65rem 1rem', fontSize: '0.85rem' }}
                  >
                    <span>Start a project</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Work / Case Studies Link */}
          <button 
            onClick={() => handleNavClick('case-studies')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activePage === 'case-studies' ? 'var(--dc-purple)' : '#0A0A0A',
              fontFamily: 'var(--dc-font-heading)',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
          >
            Work
          </button>

          {/* Industries Link */}
          <button 
            onClick={() => handleNavClick('industries')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activePage === 'industries' ? 'var(--dc-purple)' : '#0A0A0A',
              fontFamily: 'var(--dc-font-heading)',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
          >
            Industries
          </button>

          {/* Contact Link */}
          <button 
            onClick={() => handleNavClick('contact')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activePage === 'contact' ? 'var(--dc-purple)' : '#0A0A0A',
              fontFamily: 'var(--dc-font-heading)',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
          >
            Contact
          </button>

        </nav>

        {/* Right CTA Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          <button 
            onClick={onOpenAuditModal}
            className="dc-btn dc-btn-primary"
          >
            <span>Talk to us</span>
            <ArrowRight size={15} />
          </button>

          {/* Mobile Hamburger Trigger */}
          <button 
            onClick={onToggleMobileMenu}
            style={{
              background: 'var(--dc-bg-soft)',
              border: '1px solid var(--dc-border)',
              color: '#0A0A0A',
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={22} />
          </button>

        </div>

      </div>
    </header>
  );
}
