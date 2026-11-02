import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, MousePointer, Sparkles } from 'lucide-react';
import { getServices } from '../api/public';

export default function CapabilitiesWall({ onSelectService }) {
  const [activeId, setActiveId] = useState('01');
  const [services, setServices] = useState([
    {
      id: '01',
      code: '01',
      title: 'Website Development',
      category: 'WEBSITES & WEB APPS',
      description: 'Fast, responsive business websites, landing pages and web apps built around your brand, your content, and the actual customer journey.',
      features: ['Business & Corporate Websites', 'High-Converting Landing Pages', 'Custom CMS & Content Management', 'Mobile Responsive & Core Web Vitals'],
      metric: 'Clean Code & Fast Loads'
    },
    {
      id: '02',
      code: '02',
      title: 'Custom Software & CRM',
      category: 'INTERNAL TOOLS & PORTALS',
      description: 'Internal tools, admin dashboards, portals and custom CRM/ERP systems tailored to the exact way your team operates day-to-day.',
      features: ['Custom CRM & Lead Tracking', 'Admin Dashboards & Portals', 'Role-Based Access & Data Tables', 'Inventory & Operations Management'],
      metric: 'Built for Your Workflow'
    },
    {
      id: '03',
      code: '03',
      title: 'Business Automation',
      category: 'WORKFLOWS & INTEGRATIONS',
      description: 'If your team is manually copying leads between WhatsApp, Google Sheets, and email, that is exactly what we connect and automate.',
      features: ['WhatsApp & Email Lead Alerts', 'CRM & Spreadsheet Sync', 'Form & Notification Workflows', 'API Integrations & Webhooks'],
      metric: 'Zero Manual Busywork'
    },
    {
      id: '04',
      code: '04',
      title: 'E-Commerce Systems',
      category: 'STOREFRONTS & PAYMENTS',
      description: 'Online stores and catalogue platforms designed for smooth browsing, fast checkout, reliable payment gateways, and straightforward order management.',
      features: ['Custom Storefronts & Catalogues', 'Payment Gateway Integration', 'Order Flow & Cart Experience', 'B2B Wholesale & Pricing Rules'],
      metric: 'Smooth Checkout Flows'
    },
    {
      id: '05',
      code: '05',
      title: 'Search & Visibility (SEO)',
      category: 'SEARCH & LOCAL DISCOVERY',
      description: 'Clean technical SEO, on-page structure, speed optimization, and local search visibility so potential clients can actually find you on Google.',
      features: ['Technical & On-Page SEO', 'Google Business Profile & Local SEO', 'Speed & Mobile Optimization', 'Search Analytics & Clear Reporting'],
      metric: 'Clean Search Structure'
    },
    {
      id: '06',
      code: '06',
      title: 'Social Media & Content',
      category: 'CONTENT & VIDEO EDITING',
      description: 'Content planning, reels, video edits, graphic posts and regular publishing for brands that want consistent social presence without freelancer chaos.',
      features: ['Reel Editing & Short-Form Video', 'Post Design & Content Calendars', 'Page & Profile Management', 'Ad Creative & Launch Support'],
      metric: 'Consistent Execution'
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
              WHAT WE DO
            </div>
            <h2>
              Our Core Service <span className="dc-text-purple">Capabilities.</span>
            </h2>
          </div>
          <p style={{ maxWidth: '480px', color: 'var(--dc-text-secondary)', fontSize: '1.05rem' }}>
            Fast websites, custom software, workflow automation and social content built for how your business actually runs.
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
                  WHAT WE DELIVER
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
