import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'DISCOVER',
      subtitle: 'Market Intelligence & Positioning Audit',
      description: 'We audit your category competitors, target user search behavior, brand positioning, and technical bottlenecks to identify high-leverage growth opportunities.'
    },
    {
      num: '02',
      title: 'DEFINE',
      subtitle: 'Strategy & System Architecture',
      description: 'We map out clear project deliverables, content strategy, AI search entity structuring, and web engineering blueprints before touching design tools.'
    },
    {
      num: '03',
      title: 'DESIGN',
      subtitle: 'High-Impact Art-Directed Interfaces',
      description: 'We craft distinctive visual design systems, custom component libraries, and interactive prototypes engineered to captivate and convert visitors.'
    },
    {
      num: '04',
      title: 'BUILD',
      subtitle: 'Sub-Second Full-Stack Development',
      description: 'Our engineering team develops high-performance Next.js, React, and Node.js applications with 99+ Core Web Vitals and bulletproof security.'
    },
    {
      num: '05',
      title: 'LAUNCH',
      subtitle: 'Seamless Deployment & QA Hardening',
      description: 'Rigorous cross-browser testing, accessibility compliance, serverless infrastructure deployment, and live AI search index verification.'
    },
    {
      num: '06',
      title: 'GROW',
      subtitle: 'Continuous Optimization & Ad Scale',
      description: 'Ongoing A/B multivariate CRO testing, performance media scaling across search & paid social, and continuous search authority expansion.'
    }
  ];

  return (
    <section className="dc-section dc-section-soft" style={{ borderTop: '1px solid var(--dc-border)', borderBottom: '1px solid var(--dc-border)' }}>
      <div className="dc-container-wide">
        
        <div className="dc-grid-2" style={{ gap: '4rem', alignItems: 'flex-start' }}>
          
          {/* Sticky Left Column Heading */}
          <div style={{ position: 'sticky', top: 'calc(var(--dc-header-height) + 30px)' }}>
            <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1rem' }}>
              PROVEN AGENCY METHODOLOGY
            </span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', color: '#0A0A0A', marginBottom: '1.25rem' }}>
              How We Build <br />
              <span className="dc-text-purple">Market Leaders.</span>
            </h2>
            <p style={{ color: 'var(--dc-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '480px' }}>
              A disciplined 6-stage process combining strategic clarity, art-directed design, sub-second engineering, and performance growth.
            </p>
          </div>

          {/* Right Column: Stacked Interactive Process Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={step.num}
                  onMouseEnter={() => setActiveStep(idx)}
                  className="dc-card"
                  style={{
                    padding: '2rem 2.25rem',
                    background: isActive ? '#FFFFFF' : 'var(--dc-bg-white)',
                    borderColor: isActive ? 'var(--dc-purple)' : 'var(--dc-border)',
                    boxShadow: isActive ? 'var(--dc-shadow-hover)' : 'var(--dc-shadow-subtle)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{
                      fontFamily: 'var(--dc-font-heading)',
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      color: isActive ? 'var(--dc-purple)' : '#A3A3A3',
                      transition: 'color 0.25s'
                    }}>
                      {step.num}
                    </span>
                    <span style={{
                      fontFamily: 'var(--dc-font-heading)',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: isActive ? 'var(--dc-purple)' : '#0A0A0A',
                      letterSpacing: '0.05em'
                    }}>
                      {step.title}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0A0A0A', marginBottom: '0.5rem' }}>
                    {step.subtitle}
                  </div>

                  <p style={{ fontSize: '0.92rem', color: '#666666', lineHeight: 1.6 }}>
                    {step.description}
                  </p>

                  {/* Progress Line Accent */}
                  <div style={{
                    marginTop: '1.25rem',
                    height: '3px',
                    width: '100%',
                    background: isActive ? 'var(--dc-purple)' : 'var(--dc-border)',
                    borderRadius: '2px',
                    transition: 'background-color 0.3s ease'
                  }} />
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
