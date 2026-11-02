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
            OUR APPROACH
          </div>

          <h2 style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            color: '#FFFFFF',
            marginBottom: '2.5rem'
          }}>
            THE WEBSITE IS ONLY ONE PART. <br />
            THE SYSTEM BEHIND IT <span className="dc-text-purple">MATTERS MORE.</span>
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
                Design, Development & Real Operations
              </h4>
              <p style={{ color: '#A3A3A3', fontSize: '1.05rem', lineHeight: 1.6 }}>
                A pretty website does not solve anything if your checkout feels clunky or your team is still manually copying inquiries into spreadsheets. We design clean interfaces, write dependable code, and build the admin tools your team uses every single day.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 700 }}>
                Automation, Content & Day-to-Day Delivery
              </h4>
              <p style={{ color: '#A3A3A3', fontSize: '1.05rem', lineHeight: 1.6 }}>
                From WhatsApp lead alerts and CRM sync to weekly video edits and monthly post calendars, we handle the ongoing digital execution. One practical, technically capable team instead of five separate freelancers.
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
