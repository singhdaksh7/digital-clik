import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function IndustryGrid({ onSelectIndustry }) {
  const industries = [
    { id: 'real-estate', name: 'REAL ESTATE', code: '01', desc: 'Property listing portals, broker CRMs, lead capture workflows and project landing pages.' },
    { id: 'healthcare', name: 'HEALTHCARE', code: '02', desc: 'Patient booking systems, clinic websites, doctor schedules and local search presence.' },
    { id: 'e-commerce', name: 'E-COMMERCE & RETAIL', code: '03', desc: 'Online stores, catalogue management, payment setup and inventory sync.' },
    { id: 'education', name: 'EDUCATION', code: '04', desc: 'Course enquiry pages, student portals, school websites and admission forms.' },
    { id: 'professional-services', name: 'PROFESSIONAL SERVICES', code: '05', desc: 'Firm websites, case inquiry forms, client portals and local search visibility.' },
    { id: 'startups', name: 'STARTUPS & GROWING BUSINESSES', code: '06', desc: 'MVPs, internal dashboards, custom web apps and workflow automation.' }
  ];

  return (
    <section id="industries" className="dc-section" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="dc-container">
        
        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1rem' }}>
              WHO WE WORK WITH
            </span>
            <h2>
              Industries We <span className="dc-text-purple">Work With.</span>
            </h2>
          </div>
          <p style={{ maxWidth: '450px', color: 'var(--dc-text-secondary)', fontSize: '1.05rem' }}>
            From local businesses to fast-growing firms, we build the digital systems that keep operations moving.
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
