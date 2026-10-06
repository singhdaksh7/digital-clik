import React from 'react';

export default function BlackManifesto() {
  return (
    <section className="dc-section dc-section-dark" style={{
      backgroundColor: '#0A0A0A',
      paddingTop: '6.5rem',
      paddingBottom: '6.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="dc-container-wide">
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'left' }}>
          
          <div className="dc-badge dc-badge-dark" style={{ marginBottom: '2rem' }}>
            DIGITALCLIK MANIFESTO
          </div>

          <h2 style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            color: '#FFFFFF',
            marginBottom: '2.5rem'
          }}>
            WE DON'T JUST MAKE THINGS LOOK GOOD. <br />
            WE MAKE THEM <span className="dc-text-purple">WORK HARDER.</span>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            borderTop: '1px solid var(--dc-border-dark)',
            paddingTop: '2.5rem'
          }} className="dc-grid-2">
            
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 700 }}>
                Strategy Before Execution
              </h4>
              <p style={{ color: '#A3A3A3', fontSize: '1.05rem', lineHeight: 1.6 }}>
                Design without positioning is just decoration. We align visual identity, high-speed engineering, and acquisition strategy to achieve measurable category market dominance.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 700 }}>
                Technology Built to Scale
              </h4>
              <p style={{ color: '#A3A3A3', fontSize: '1.05rem', lineHeight: 1.6 }}>
                From Next.js web applications to AI-first search entity optimization (AEO/GEO), our technical platforms are built for sub-second performance and long-term durability.
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
