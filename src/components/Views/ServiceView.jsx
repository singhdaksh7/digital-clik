import React from 'react';
import StickySubnav from '../StickySubnav';
import { CheckCircle2, ArrowRight, MousePointer } from 'lucide-react';

export default function ServiceView({ onOpenAuditModal }) {
  const subnavItems = [
    { id: 'web-development', label: 'Websites & Apps' },
    { id: 'custom-software', label: 'Custom Software & CRM' },
    { id: 'automation-seo', label: 'Automation & SEO' },
    { id: 'service-faqs', label: 'Service FAQs' },
  ];

  const faqs = [
    {
      q: 'How does DigitalClik work with new clients?',
      a: 'We start by understanding how your business currently operates, what tools you use, and where things get stuck. Then we agree on clear deliverables, timeline, and budget before writing code or designing screens.'
    },
    {
      q: 'Can you build both simple websites and complex internal tools?',
      a: 'Yes. We build customer-facing marketing websites, lead capture landing pages, client portals, and custom CRM/ERP dashboards. You do not need to coordinate separate frontend, backend, and design freelancers.'
    },
    {
      q: 'Do you offer ongoing support after launch?',
      a: 'Yes. We do not disappear after deployment. We remain available for maintenance, feature additions, server updates, and regular content support.'
    }
  ];

  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      
      {/* Service Hero */}
      <section className="dc-section" style={{ paddingTop: '4rem', paddingBottom: '3.5rem', borderBottom: '1px solid var(--dc-border)' }}>
        <div className="dc-container" style={{ textAlign: 'center', maxWidth: '850px' }}>
          <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1.25rem' }}>
            WHAT WE DO
          </span>
          <h1>
            Digital Services Built for <span className="dc-text-purple">Real Business Operations.</span>
          </h1>
          <p style={{ marginTop: '1.25rem', fontSize: '1.15rem', color: 'var(--dc-text-secondary)' }}>
            We design websites, write custom software, automate manual workflows, and run day-to-day digital execution for businesses that want one accountable team.
          </p>
        </div>
      </section>

      {/* Sticky Subnav Bar */}
      <StickySubnav items={subnavItems} />

      {/* SECTION 1: WEBSITES & APPS */}
      <section id="web-development" className="dc-section" style={{ borderBottom: '1px solid var(--dc-border)' }}>
        <div className="dc-container">
          <div className="dc-grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1rem' }}>
                01 • WEBSITES & WEB APPS
              </span>
              <h2>
                Website Development & <span className="dc-text-purple">Web Applications.</span>
              </h2>
              <p style={{ marginTop: '1rem', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                Fast, responsive websites built around your brand, your actual content, and the customer journey. We build business websites, landing pages, and web apps with clean code, fast page loads, and solid SEO foundations.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0A0A0A', fontWeight: 600 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--dc-purple)' }} />
                  <span>Business & Corporate Websites</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0A0A0A', fontWeight: 600 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--dc-purple)' }} />
                  <span>High-Converting Campaign Landing Pages</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0A0A0A', fontWeight: 600 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--dc-purple)' }} />
                  <span>Mobile-First & Core Web Vitals Optimization</span>
                </div>
              </div>

              <button onClick={onOpenAuditModal} className="dc-btn dc-btn-primary">
                <span>Start a Website Project</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="dc-card" style={{ padding: '2.5rem', background: 'var(--dc-bg-soft)' }}>
              <span style={{ fontSize: '0.75rem', color: '#737373', fontWeight: 700, textTransform: 'uppercase' }}>WHAT YOU GET</span>
              <h3 style={{ fontSize: '1.4rem', color: '#0A0A0A', marginTop: '0.4rem', marginBottom: '1rem' }}>
                Complete Project Handoff
              </h3>
              <p style={{ color: '#555555', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Clean code repository, easy-to-use CMS, mobile responsive layouts, Google search setup, and full admin credentials. You own everything we build.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CUSTOM SOFTWARE & CRM */}
      <section id="custom-software" className="dc-section" style={{ borderBottom: '1px solid var(--dc-border)', backgroundColor: 'var(--dc-bg-soft)' }}>
        <div className="dc-container">
          <div className="dc-grid-2" style={{ alignItems: 'center' }}>
            <div className="dc-card" style={{ padding: '2.5rem', background: '#FFFFFF' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--dc-purple)', fontWeight: 700, textTransform: 'uppercase' }}>CUSTOM CAPABILITIES</span>
              <h3 style={{ fontSize: '1.4rem', color: '#0A0A0A', marginTop: '0.4rem', marginBottom: '1rem' }}>
                Tailored Architecture
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.88rem', color: '#0A0A0A', fontWeight: 600 }}>
                <div>✓ Custom CRM & Lead Tracking</div>
                <div>✓ Admin Panels & Dashboards</div>
                <div>✓ Client & Partner Portals</div>
                <div>✓ Inventory & Operations Tools</div>
              </div>
            </div>

            <div>
              <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1rem' }}>
                02 • INTERNAL TOOLS & CRM
              </span>
              <h2>
                Custom Software & <span className="dc-text-purple">Internal Tools.</span>
              </h2>
              <p style={{ marginTop: '1rem', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                Internal tools, dashboards, portals and workflows built around the way your team already works. Built on clean web stacks with secure authentication and database controls.
              </p>

              <button onClick={onOpenAuditModal} className="dc-btn dc-btn-primary">
                <span>Discuss Custom Software</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: AUTOMATION & SEO */}
      <section id="automation-seo" className="dc-section" style={{ borderBottom: '1px solid var(--dc-border)' }}>
        <div className="dc-container">
          <div className="dc-grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1rem' }}>
                03 • WORKFLOWS & VISIBILITY
              </span>
              <h2>
                Business Automation & <span className="dc-text-purple">Search Visibility.</span>
              </h2>
              <p style={{ marginTop: '1rem', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                If your team is still copying leads between WhatsApp, Sheets, and a CRM manually, that is exactly what we automate. We also handle technical and local SEO so customers can find you.
              </p>

              <button onClick={onOpenAuditModal} className="dc-btn dc-btn-primary">
                <span>Talk to Us About Automation</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="dc-card" style={{ padding: '2.5rem', background: 'var(--dc-bg-soft)' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--dc-purple)', marginBottom: '0.8rem' }}>
                Zero Manual Busywork
              </h3>
              <p style={{ color: '#555555', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Instant WhatsApp lead notifications, automated spreadsheet syncing, follow-up alerts, and clean on-page search indexing so you never miss an inquiry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FAQS */}
      <section id="service-faqs" className="dc-section">
        <div className="dc-container" style={{ maxWidth: '850px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1rem' }}>
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2>
              Service & Process <span className="dc-text-purple">Details.</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} className="dc-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                  <span style={{
                    fontFamily: 'var(--dc-font-heading)',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: 'var(--dc-purple)',
                    lineHeight: 1
                  }}>
                    0{idx + 1}
                  </span>

                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: '#0A0A0A', marginBottom: '0.6rem' }}>
                      {faq.q}
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: '#555555', lineHeight: 1.6 }}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
