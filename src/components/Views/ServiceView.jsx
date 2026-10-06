import React from 'react';
import StickySubnav from '../StickySubnav';
import { CheckCircle2, ArrowRight, MousePointer } from 'lucide-react';

export default function ServiceView({ onOpenAuditModal }) {
  const subnavItems = [
    { id: 'strategy-brand', label: 'Strategy & Brand' },
    { id: 'web-engineering', label: 'Web & E-Commerce' },
    { id: 'aeo-geo', label: 'SEO & AI Search' },
    { id: 'performance-media', label: 'Performance Media' },
    { id: 'service-faqs', label: 'Service FAQs' },
  ];

  const faqs = [
    {
      q: 'How does DigitalClik approach brand strategy and website builds?',
      a: 'We begin with strategic positioning and audience research before touching code or design tools. Every interface, typography choice, and technical system is built to communicate value and convert visitors.'
    },
    {
      q: 'What is AEO & GEO, and why does my brand need it?',
      a: 'Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) structure your brand\'s digital entity graph so AI models (ChatGPT, Perplexity, Google Gemini) cite your business when users ask purchase recommendation queries.'
    },
    {
      q: 'Do you work on flexible monthly or project-based agreements?',
      a: 'Yes. We offer both scoped project builds (brand identity, custom Next.js web applications) and ongoing performance & search growth partnerships.'
    }
  ];

  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      
      {/* Service Hero */}
      <section className="dc-section" style={{ paddingTop: '4rem', paddingBottom: '3.5rem', borderBottom: '1px solid var(--dc-border)' }}>
        <div className="dc-container" style={{ textAlign: 'center', maxWidth: '850px' }}>
          <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1.25rem' }}>
            AGENCY CAPABILITIES
          </span>
          <h1>
            Engineered Services Built for <span className="dc-text-purple">Market Leadership.</span>
          </h1>
          <p style={{ marginTop: '1.25rem', fontSize: '1.15rem', color: 'var(--dc-text-secondary)' }}>
            Explore our integrated services across brand strategy, high-speed web engineering, search intelligence, and performance media.
          </p>
        </div>
      </section>

      {/* Sticky Subnav Bar */}
      <StickySubnav items={subnavItems} />

      {/* SECTION 1: STRATEGY & BRAND */}
      <section id="strategy-brand" className="dc-section" style={{ borderBottom: '1px solid var(--dc-border)' }}>
        <div className="dc-container">
          <div className="dc-grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1rem' }}>
                01 • BRAND ARCHITECTURE
              </span>
              <h2>
                Strategy & <span className="dc-text-purple">Brand Identity.</span>
              </h2>
              <p style={{ marginTop: '1rem', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                A strong digital presence starts with clear positioning. We build cohesive brand identities, visual design systems, and messaging frameworks that differentiate your company in crowded markets.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0A0A0A', fontWeight: 600 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--dc-purple)' }} />
                  <span>Market Positioning & Competitor Analysis</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0A0A0A', fontWeight: 600 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--dc-purple)' }} />
                  <span>Cohesive Visual Identity & Design Systems</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0A0A0A', fontWeight: 600 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--dc-purple)' }} />
                  <span>Brand Messaging & Editorial Guidelines</span>
                </div>
              </div>

              <button onClick={onOpenAuditModal} className="dc-btn dc-btn-primary">
                <span>Discuss Brand Strategy</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="dc-card" style={{ padding: '2.5rem', background: 'var(--dc-bg-soft)' }}>
              <span style={{ fontSize: '0.75rem', color: '#737373', fontWeight: 700, textTransform: 'uppercase' }}>DELIVERABLE SPOTLIGHT</span>
              <h3 style={{ fontSize: '1.4rem', color: '#0A0A0A', marginTop: '0.4rem', marginBottom: '1rem' }}>
                Complete Brand Systems
              </h3>
              <p style={{ color: '#555555', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Includes vector logo assets, typography hierarchy, digital color palettes, component kits, and brand guideline documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: WEB & E-COMMERCE */}
      <section id="web-engineering" className="dc-section" style={{ borderBottom: '1px solid var(--dc-border)', backgroundColor: 'var(--dc-bg-soft)' }}>
        <div className="dc-container">
          <div className="dc-grid-2" style={{ alignItems: 'center' }}>
            <div className="dc-card" style={{ padding: '2.5rem', background: '#FFFFFF' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--dc-purple)', fontWeight: 700, textTransform: 'uppercase' }}>ENGINEERING BENCHMARK</span>
              <h3 style={{ fontSize: '1.4rem', color: '#0A0A0A', marginTop: '0.4rem', marginBottom: '1rem' }}>
                Sub-Second Page Loads
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.88rem', color: '#0A0A0A', fontWeight: 600 }}>
                <div>✓ Next.js App Router</div>
                <div>✓ React & TypeScript</div>
                <div>✓ Headless Storefronts</div>
                <div>✓ Core Web Vitals Optimization</div>
              </div>
            </div>

            <div>
              <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1rem' }}>
                02 • HIGH-SPEED WEB TECH
              </span>
              <h2>
                Custom Web & <span className="dc-text-purple">E-Commerce Platforms.</span>
              </h2>
              <p style={{ marginTop: '1rem', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                We engineer modern web applications and headless storefronts built for extreme performance, intuitive user experience, and high conversion rates.
              </p>

              <button onClick={onOpenAuditModal} className="dc-btn dc-btn-primary">
                <span>Start a Web Project</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SEO & AI SEARCH */}
      <section id="aeo-geo" className="dc-section" style={{ borderBottom: '1px solid var(--dc-border)' }}>
        <div className="dc-container">
          <div className="dc-grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1rem' }}>
                03 • ORGANIC AUTHORITY
              </span>
              <h2>
                SEO & AI Search <span className="dc-text-purple">(AEO & GEO).</span>
              </h2>
              <p style={{ marginTop: '1rem', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                Position your brand where buyers search today. We optimize entity authority across Google search results, ChatGPT, Perplexity, and AI Overviews.
              </p>

              <button onClick={onOpenAuditModal} className="dc-btn dc-btn-primary">
                <span>Audit My Search Footprint</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="dc-card" style={{ padding: '2.5rem', background: 'var(--dc-bg-soft)' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--dc-purple)', marginBottom: '0.8rem' }}>
                AI Recommendation Rank
              </h3>
              <p style={{ color: '#555555', fontSize: '0.95rem' }}>
                Capture recommendation citations when enterprise customers ask AI models for product and service advice.
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
