import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, MousePointer, Sparkles } from 'lucide-react';
import { getServices } from '../api/public';

export default function CapabilitiesWall({ onSelectService }) {
  const [activeId, setActiveId] = useState('01');
  const [services, setServices] = useState([
    {
      id: '01',
      code: '01',
      title: 'Strategy & Brand Identity',
      category: 'BRAND ARCHITECTURE',
      description: 'We craft distinctive brand positioning, design systems, and identity frameworks that make your business instantly recognizable and trusted.',
      features: ['Brand Positioning & Messaging', 'Visual Identity & Design Systems', 'Logo Architecture & Style Guides', 'Brand Collateral & Assets'],
      metric: 'Distinctive Market Authority'
    },
    {
      id: '02',
      code: '02',
      title: 'Websites & E-Commerce',
      category: 'DIGITAL PLATFORMS',
      description: 'Sub-second, high-converting digital storefronts and web platforms built on Next.js App Router and modern headless e-commerce stacks.',
      features: ['Next.js & React Engineering', 'Headless Storefront Systems', 'Page Load & Performance Optimization', 'UI/UX Interactive Prototyping'],
      metric: 'High-Speed Web Architecture'
    },
    {
      id: '03',
      code: '03',
      title: 'SEO & AI Search (AEO/GEO)',
      category: 'ORGANIC VISIBILITY',
      description: 'Generative Engine Optimization (GEO) & Answer Engine Optimization (AEO). We optimize your entity graph so ChatGPT, Perplexity & Google Gemini cite your brand.',
      features: ['LLM Entity Authority Seeding', 'Schema & Vector Search Structuring', 'Enterprise Technical Audits', 'Google AI Overview Optimization'],
      metric: 'AI Search Entity Authority'
    },
    {
      id: '04',
      code: '04',
      title: 'Performance Paid Media',
      category: 'PAID ACQUISITION',
      description: 'Data-backed paid search and paid social campaigns engineered around strict cost-per-acquisition (CPA) targets and customer lifetime value.',
      features: ['Google Search & Shopping Ads', 'Meta & TikTok Paid Social', 'LinkedIn B2B Lead Acquisition', 'Multi-Touch Attribution Modeling'],
      metric: 'Performance Paid Media Scale'
    },
    {
      id: '05',
      code: '05',
      title: 'Video & Creative Studio',
      category: 'HIGH-SCALE CREATIVE',
      description: 'High-velocity UGC ad production, creator campaigns, and corporate films designed to drive engagement and conversion across social feeds.',
      features: ['Short-Form Social Reels & Shorts', 'Creator-Led UGC Ad Pipelines', 'Scriptwriting & Storyboarding', 'Multi-Language Localization'],
      metric: 'High-Velocity Creative Pipeline'
    },
    {
      id: '06',
      code: '06',
      title: 'AI & Automation Systems',
      category: 'OPERATIONAL EFFICIENCY',
      description: 'Custom AI workflows, automated CRM funnels, and conversion rate optimization (CRO) engines that eliminate operational friction.',
      features: ['Custom AI Workflow Integrations', 'Automated Lead Qualification', 'A/B Multivariate Testing', 'Session Analytics & Friction Removal'],
      metric: 'Conversion Rate Optimization'
    }
  ]);

  useEffect(() => {
    getServices()
      .then(res => {
        if (res.success && res.data && res.data.length > 0) {
          const parsed = res.data.map(s => ({
            id: s.id,
            code: s.code || '01',
            title: s.title,
            category: s.categoryLabel || 'CAPABILITY',
            description: s.shortDescription,
            features: typeof s.capabilities === 'string' ? JSON.parse(s.capabilities || '[]') : (s.capabilities || []),
            metric: s.metric || 'Market Authority'
          }));
          setServices(parsed);
          setActiveId(parsed[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const activeService = services.find(s => s.id === activeId) || services[0];

  return (
    <section id="services" className="dc-section" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="dc-container">
        
        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div className="dc-badge dc-badge-purple" style={{ marginBottom: '1rem' }}>
              EXCELLENCE IN EXECUTION
            </div>
            <h2>
              Our Core Service <span className="dc-text-purple">Capabilities.</span>
            </h2>
          </div>
          <p style={{ maxWidth: '480px', color: 'var(--dc-text-secondary)', fontSize: '1.05rem' }}>
            We bring strategy, design, technology, and performance marketing under one unified execution system.
          </p>
        </div>

        {/* 2-Column Editorial Layout */}
        <div className="dc-grid-2" style={{ gap: '3rem', alignItems: 'flex-start' }}>
          
          {/* Left Column: Interactive Service Rows */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {services.map((svc) => (
              <div
                key={svc.id}
                onMouseEnter={() => setActiveId(svc.id)}
                onClick={() => {
                  setActiveId(svc.id);
                  onSelectService(svc.id);
                }}
                className="dc-service-row"
                style={{
                  backgroundColor: activeId === svc.id ? 'var(--dc-purple-tint)' : 'var(--dc-bg-white)',
                  borderColor: activeId === svc.id ? 'var(--dc-border-purple)' : 'var(--dc-border)',
                  paddingLeft: activeId === svc.id ? '2.5rem' : '2rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{
                    fontFamily: 'var(--dc-font-heading)',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: activeId === svc.id ? 'var(--dc-purple)' : '#737373'
                  }}>
                    {svc.code || svc.id}
                  </span>
                  <div>
                    <h3 className="dc-service-title" style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: activeId === svc.id ? 'var(--dc-purple)' : '#0A0A0A',
                      transition: 'color 0.2s'
                    }}>
                      {svc.title}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#737373', fontWeight: 600, letterSpacing: '0.05em' }}>
                      {svc.category}
                    </span>
                  </div>
                </div>

                <div className="dc-service-arrow" style={{
                  color: activeId === svc.id ? 'var(--dc-purple)' : '#737373',
                  transition: 'all 0.2s'
                }}>
                  <ArrowRight size={20} />
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Sticky Active Service Breakdown Card */}
          <div style={{ position: 'sticky', top: 'calc(var(--dc-header-height) + 20px)' }}>
            <div className="dc-card" style={{ padding: '2.5rem', background: 'var(--dc-bg-soft)', border: '1px solid var(--dc-border)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span className="dc-badge dc-badge-purple">
                  {activeService.category}
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dc-purple)' }}>
                  {activeService.id} / 06
                </span>
              </div>

              <h3 style={{ fontSize: '1.6rem', color: '#0A0A0A', marginBottom: '1rem' }}>
                {activeService.title}
              </h3>

              <p style={{ color: 'var(--dc-text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                {activeService.description}
              </p>

              <div style={{
                background: '#FFFFFF',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid var(--dc-border)',
                marginBottom: '1.75rem'
              }}>
                <span style={{ fontSize: '0.72rem', color: '#737373', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  KEY CAPABILITY OUTCOME
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dc-purple)', marginTop: '0.2rem' }}>
                  ⚡ {activeService.metric}
                </div>
              </div>

              {/* Feature List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem' }}>
                {activeService.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#0A0A0A', fontWeight: 600 }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--dc-purple)' }} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => onSelectService(activeService.id)}
                className="dc-btn dc-btn-primary" 
                style={{ width: '100%' }}
              >
                <span>Explore {activeService.title}</span>
                <ArrowRight size={16} />
              </button>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
