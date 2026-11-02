import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'UNDERSTAND',
      subtitle: 'Scope & Workflow Mapping',
      description: 'We start with how your business works, what is broken, and what the final system actually needs to do.'
    },
    {
      num: '02',
      title: 'PLAN',
      subtitle: 'Architecture & Priorities',
      description: 'We map pages, features, workflows and priorities before development starts.'
    },
    {
      num: '03',
      title: 'DESIGN',
      subtitle: 'UI/UX & Prototypes',
      description: 'We design clean, modern interfaces that are easy to use and look sharp on every screen.'
    },
    {
      num: '04',
      title: 'BUILD',
      subtitle: 'Clean Full-Stack Development',
      description: 'We develop in stages, test properly and keep you involved throughout.'
    },
    {
      num: '05',
      title: 'LAUNCH',
      subtitle: 'Testing & Go-Live',
      description: 'We handle deployment, domains, integrations and final checks.'
    },
    {
      num: '06',
      title: 'IMPROVE',
      subtitle: 'Ongoing Support',
      description: 'We stay available for updates, fixes and the next version.'
    }
  ];

  return (
    <section className="dc-section dc-section-soft" style={{ borderTop: '1px solid var(--dc-border)', borderBottom: '1px solid var(--dc-border)' }}>
      <div className="dc-container-wide">
        
        <div className="dc-grid-2" style={{ gap: '4rem', alignItems: 'flex-start' }}>
          
          {/* Sticky Left Column Heading */}
          <div style={{ position: 'sticky', top: 'calc(var(--dc-header-height) + 30px)' }}>
            <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1rem' }}>
              OUR PROCESS
            </span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', color: '#0A0A0A', marginBottom: '1.25rem' }}>
              How We <br />
              <span className="dc-text-purple">Work.</span>
            </h2>
            <p style={{ color: 'var(--dc-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '480px' }}>
              A straightforward, stage-by-stage process so you always know what is being built, why, and what comes next.
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
