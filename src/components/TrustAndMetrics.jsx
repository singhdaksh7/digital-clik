import React from 'react';

export default function TrustAndMetrics() {
  const pillars = [
    { title: 'Brand Architecture', desc: 'Strategic positioning, visual identity & design systems' },
    { title: 'Web Platforms', desc: 'Sub-second performance & Next.js applications' },
    { title: 'Search Intelligence', desc: 'AEO, GEO & LLM entity authority optimization' },
    { title: 'Acquisition Scale', desc: 'Data-backed performance & multi-channel paid media' },
  ];

  const capabilities = [
    'STRATEGY & BRAND ARCHITECTURE',
    'SUB-SECOND WEB ENGINEERING',
    'AI SEARCH & ENTITY AUTHORITY (AEO/GEO)',
    'PERFORMANCE PAID MEDIA',
    'HIGH-SCALE CREATIVE STUDIO',
    'AUTOMATION & CRO ENGINES'
  ];

  return (
    <section className="dc-section" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--dc-border)', borderBottom: '1px solid var(--dc-border)' }}>
      <div className="dc-container">
        
        {/* Brand Manifesto Text Moment */}
        <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 4.5rem auto' }}>
          <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1.25rem' }}>
            DIGITALCLIK MANIFESTO
          </span>
          <blockquote style={{
            fontFamily: 'var(--dc-font-heading)',
            fontSize: 'clamp(1.6rem, 3.2vw, 2.5rem)',
            fontWeight: 800,
            lineHeight: 1.25,
            color: '#0A0A0A',
            letterSpacing: '-0.03em'
          }}>
            “We combine creative thinking, modern technology, and growth strategy to build brands that <span className="dc-text-purple">move.</span>”
          </blockquote>
        </div>

        {/* Clean Agency Pillars Grid */}
        <div className="dc-grid-4" style={{ marginBottom: '4.5rem' }}>
          {pillars.map((p, idx) => (
            <div 
              key={idx} 
              style={{
                textAlign: 'center',
                padding: '2rem 1.25rem',
                borderRight: idx < 3 ? '1px solid var(--dc-border)' : 'none',
                background: 'var(--dc-bg-soft)',
                borderRadius: '12px',
                border: '1px solid var(--dc-border)'
              }}
              className="dc-stat-col"
            >
              <div style={{
                fontFamily: 'var(--dc-font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0A0A0A',
                marginBottom: '0.5rem'
              }}>
                {p.title}
              </div>

              <p style={{ fontSize: '0.88rem', color: '#666666', lineHeight: 1.5 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Agency Capability Marquee Banner */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#737373', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            INTEGRATED CREATIVE STUDIO, WEB ENGINEERING & PERFORMANCE ACQUISITION
          </span>
        </div>

        <div className="dc-marquee-wrapper">
          <div className="dc-marquee-content">
            {capabilities.concat(capabilities).map((cap, index) => (
              <div 
                key={index}
                style={{
                  fontSize: '1.05rem',
                  fontFamily: 'var(--dc-font-heading)',
                  fontWeight: 800,
                  color: 'var(--dc-purple)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap'
                }}
              >
                ● {cap}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

