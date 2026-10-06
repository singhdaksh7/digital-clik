import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function IndustryGrid({ onSelectIndustry }) {
  const industries = [
    { id: 'real-estate', name: 'REAL ESTATE & PROPTECH', code: '01', desc: 'Hyper-local search engine optimization, property video tours & lead capture.' },
    { id: 'education', name: 'EDUCATION & ACADEMICS', code: '02', desc: 'Enrollment acquisition campaigns, university branding & student portals.' },
    { id: 'e-commerce', name: 'E-COMMERCE & DTC RETAIL', code: '03', desc: 'Headless storefront engineering, UGC video ads & high-ROAS paid media.' },
    { id: 'healthcare', name: 'HEALTHCARE & MEDTECH', code: '04', desc: 'HIPAA-compliant patient portals, local search authority & clinic growth.' },
    { id: 'fintech', name: 'FINTECH & DIGITAL BANKING', code: '05', desc: 'AI search entity authority, compliant investor acquisition & web apps.' },
    { id: 'saas', name: 'ENTERPRISE SAAS & B2B', code: '06', desc: 'Account-based marketing, enterprise search positioning & demo funnels.' }
  ];

  return (
    <section id="industries" className="dc-section" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="dc-container">
        
        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1rem' }}>
              SECTOR SPECIALIZATION
            </span>
            <h2>
              Industry <span className="dc-text-purple">Playbooks.</span>
            </h2>
          </div>
          <p style={{ maxWidth: '450px', color: 'var(--dc-text-secondary)', fontSize: '1.05rem' }}>
            We bring deep sector insights and proven growth frameworks tailored to your specific market dynamics.
          </p>
        </div>

        {/* Large Typographic List Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {industries.map((ind) => (
            <div 
              key={ind.id}
              onClick={() => onSelectIndustry(ind.id)}
              className="dc-industry-list-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <span style={{
                  fontFamily: 'var(--dc-font-heading)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: '#A3A3A3'
                }}>
                  {ind.code}
                </span>

                <div>
                  <h3 style={{
                    fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.025em'
                  }}>
                    {ind.name}
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: '#666666', marginTop: '0.2rem' }}>
                    {ind.desc}
                  </p>
                </div>
              </div>

              <div className="dc-industry-arrow" style={{
                transition: 'transform 0.25s ease, color 0.25s ease',
                color: '#0A0A0A'
              }}>
                <ArrowUpRight size={32} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
