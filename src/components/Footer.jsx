import React from 'react';
import { ArrowRight, Mail, Phone, MousePointer } from 'lucide-react';

export default function Footer({ setActivePage, onOpenAuditModal }) {
  return (
    <>
      {/* FULL PURPLE CTA CLIMAX SECTION */}
      <section style={{
        backgroundColor: 'var(--dc-purple)',
        color: '#FFFFFF',
        padding: '5.5rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="dc-container" style={{ textAlign: 'center', maxWidth: '850px' }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '0.35rem 1rem',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem'
          }}>
            READY TO GROW?
          </div>

          <h2 style={{
            color: '#FFFFFF',
            fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem'
          }}>
            Got a project in mind? <br />
            Let's make something worth clicking.
          </h2>

          <p style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '1.15rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
            We work with ambitious brand partners across search, paid media, creative studio, and web technology.
          </p>

          <button 
            onClick={onOpenAuditModal}
            style={{
              background: '#FFFFFF',
              color: 'var(--dc-purple)',
              padding: '1.1rem 2.5rem',
              borderRadius: '999px',
              fontFamily: 'var(--dc-font-heading)',
              fontWeight: 800,
              fontSize: '1.05rem',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease'
            }}
          >
            <span>Start a Project</span>
            <ArrowRight size={18} />
          </button>

        </div>
      </section>

      {/* FOOTER — NEAR-BLACK ELEGANT BASE */}
      <footer style={{
        backgroundColor: 'var(--dc-bg-dark)',
        color: '#FFFFFF',
        paddingTop: '4.5rem',
        paddingBottom: '2.5rem',
        borderTop: '1px solid #1A1A1A'
      }}>
        <div className="dc-container">
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
            gap: '3rem',
            marginBottom: '4rem'
          }} className="dc-footer-grid">
            
            {/* Brand Column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--dc-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MousePointer size={18} color="#FFFFFF" style={{ transform: 'rotate(-25deg)', fill: '#FFFFFF' }} />
                </div>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF' }}>
                  digital<span style={{ color: 'var(--dc-purple)' }}>clik</span>
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#999999', lineHeight: 1.6, marginBottom: '1.75rem', maxWidth: '320px' }}>
                DigitalClik is a modern digital agency combining brand strategy, web engineering, and growth marketing for market leaders.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: '#CCCCCC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={14} style={{ color: 'var(--dc-purple)' }} />
                  <span>+1 (800) 555-CLIK</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={14} style={{ color: 'var(--dc-purple)' }} />
                  <span>hello@digitalclik.com</span>
                </div>
              </div>
            </div>

            {/* Navigation Column 1: Services */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                Capabilities
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: '#999999' }}>
                <li><a onClick={() => setActivePage('services')} style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Strategy & Brand</a></li>
                <li><a onClick={() => setActivePage('services')} style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Websites & E-Commerce</a></li>
                <li><a onClick={() => setActivePage('services')} style={{ cursor: 'pointer', transition: 'color 0.2s' }}>SEO & AI Search (AEO/GEO)</a></li>
                <li><a onClick={() => setActivePage('services')} style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Performance Paid Media</a></li>
                <li><a onClick={() => setActivePage('services')} style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Video & UGC Ad Studio</a></li>
              </ul>
            </div>

            {/* Navigation Column 2: Sectors */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                Sectors
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: '#999999' }}>
                <li><a onClick={() => setActivePage('industries')} style={{ cursor: 'pointer' }}>B2B & Enterprise SaaS</a></li>
                <li><a onClick={() => setActivePage('industries')} style={{ cursor: 'pointer' }}>E-Commerce & DTC Retail</a></li>
                <li><a onClick={() => setActivePage('industries')} style={{ cursor: 'pointer' }}>FinTech & Banking</a></li>
                <li><a onClick={() => setActivePage('industries')} style={{ cursor: 'pointer' }}>Healthcare & MedTech</a></li>
                <li><a onClick={() => setActivePage('industries')} style={{ cursor: 'pointer' }}>Real Estate & PropTech</a></li>
              </ul>
            </div>

            {/* Navigation Column 3: Agency */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                Agency
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: '#999999' }}>
                <li><a onClick={() => setActivePage('case-studies')} style={{ cursor: 'pointer' }}>Selected Work</a></li>
                <li><a onClick={() => setActivePage('contact')} style={{ cursor: 'pointer' }}>Contact & Inquiry</a></li>
                <li><a onClick={onOpenAuditModal} style={{ cursor: 'pointer' }}>Request Growth Audit</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom Legal Bar */}
          <div style={{
            borderTop: '1px solid #1A1A1A',
            paddingTop: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#666666'
          }}>
            <div>
              © {new Date().getFullYear()} DigitalClik Agency. All Rights Reserved. Pure Brand Identity.
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#" style={{ color: '#999999', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: '#999999', textDecoration: 'none' }}>Terms of Service</a>
              <a href="#" style={{ color: '#999999', textDecoration: 'none' }}>Security</a>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
