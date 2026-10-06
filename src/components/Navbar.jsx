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
              Creative & Growth Agency
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
                
                {/* Column 01: Marketing & Growth */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--dc-purple)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                    01 • Marketing & Growth
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>SEO & AI Search (AEO/GEO)</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>Entity optimization & ranking authority</span>
                    </a>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Performance Paid Media</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>Google Ads, Meta & LinkedIn acquisition</span>
                    </a>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Conversion Optimization</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>A/B testing & checkout friction lift</span>
                    </a>
                  </div>
                </div>

                {/* Column 02: Brand & Creative */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--dc-purple)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                    02 • Brand & Creative
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Brand Strategy & Identity</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>Positioning, design systems & identity</span>
                    </a>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Video & UGC Ad Studio</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>High-scale viral social reel creative</span>
                    </a>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Content Marketing</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>Editorial storytelling & copywriting</span>
                    </a>
                  </div>
                </div>

                {/* Column 03: Web & Technology */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--dc-purple)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                    03 • Web & Technology
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Custom Web Applications</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>Next.js, React & Node.js architecture</span>
                    </a>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Headless E-Commerce</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>Fast storefronts & seamless checkout</span>
                    </a>
                    <a href="#services" onClick={() => handleNavClick('services')} style={{ textDecoration: 'none' }}>
                      <div style={{ color: '#0A0A0A', fontWeight: 700, fontSize: '0.92rem' }}>Platform Maintenance</div>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>Security, speed & ongoing iteration</span>
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
                      DIGITALCLIK APPROACH
                    </div>
                    <h4 style={{ color: '#0A0A0A', fontSize: '1rem', marginBottom: '0.4rem', fontWeight: 700 }}>
                      Strategy Before Execution.
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#555555', lineHeight: 1.5 }}>
                      We combine creative design, modern technology, and data-backed marketing under one unified partnership.
                    </p>
                  </div>

                  <button 
                    onClick={onOpenAuditModal}
                    className="dc-btn dc-btn-primary" 
                    style={{ width: '100%', marginTop: '1rem', padding: '0.65rem 1rem', fontSize: '0.85rem' }}
                  >
                    <span>Start a Project</span>
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
            <span>Let's Talk</span>
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
