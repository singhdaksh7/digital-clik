import React, { useState } from 'react';
import { ArrowRight, MousePointer } from 'lucide-react';

export default function CaseStudiesView({ onOpenAuditModal }) {
  const [filter, setFilter] = useState('all');

  const caseStudies = [
    {
      id: '1',
      client: 'Real Estate Sales Team',
      category: 'real-estate',
      categoryLabel: 'Real Estate CRM',
      title: 'Custom Lead Management & Property Portal',
      metric: 'Lead Workflow',
      metricLabel: 'CRM & Property Portal',
      summary: 'Centralized property CRM and listing portal built for a real estate sales team to manage incoming inquiries, client requirements, follow-ups, and site visits in one place.',
      tags: ['Custom CRM', 'WhatsApp Lead Alerts', 'Property Portal']
    },
    {
      id: '2',
      client: 'Diagnostic & Clinic Network',
      category: 'healthcare',
      categoryLabel: 'Healthcare & Booking',
      title: 'Clinic Booking & Patient Records Dashboard',
      metric: 'Direct Booking',
      metricLabel: 'Patient Scheduling System',
      summary: 'Fast patient scheduling interface and clinic management dashboard allowing front-desk staff and patients to coordinate appointments without manual phone tag.',
      tags: ['Appointment Booking', 'Doctor Schedules', 'Admin Reception Panel']
    },
    {
      id: '3',
      client: 'Direct-to-Consumer Apparel Brand',
      category: 'ecommerce',
      categoryLabel: 'E-Commerce & Retail',
      title: 'Custom Shopify Storefront & Social Content Engine',
      metric: 'Store & Content',
      metricLabel: 'Storefront & Social Calendars',
      summary: 'Custom storefront rebuild paired with weekly reel production, product photography edits, and catalogue management to support seasonal drops.',
      tags: ['Shopify Storefront', 'Reel Editing', 'Product Catalogue']
    },
    {
      id: '4',
      client: 'Regional Logistics Fleet',
      category: 'logistics',
      categoryLabel: 'Logistics & Fleet',
      title: 'Fleet Dispatch Portal & Route Tracking',
      metric: 'Fleet Operations',
      metricLabel: 'Internal Dispatch Dashboard',
      summary: 'Internal operations dashboard built for fleet dispatchers to coordinate vehicle status, driver assignments, and delivery logs across branch hubs.',
      tags: ['Dispatch Portal', 'Route Coordination', 'Internal Tools']
    }
  ];

  const filteredCases = filter === 'all' 
    ? caseStudies 
    : caseStudies.filter(c => c.category === filter);

  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      
      {/* Hero Header */}
      <section className="dc-section" style={{ paddingTop: '4rem', paddingBottom: '3.5rem', borderBottom: '1px solid var(--dc-border)' }}>
        <div className="dc-container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1.25rem' }}>
            OUR WORK
          </span>
          <h1>
            Systems & Platforms We Have <span className="dc-text-purple">Delivered.</span>
          </h1>
          <p style={{ marginTop: '1.25rem', fontSize: '1.15rem', color: 'var(--dc-text-secondary)' }}>
            A look at custom websites, internal software, e-commerce storefronts, and digital systems built for growing businesses.
          </p>

          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'real-estate', label: 'Real Estate' },
              { id: 'healthcare', label: 'Healthcare' },
              { id: 'ecommerce', label: 'E-Commerce' },
              { id: 'logistics', label: 'Logistics' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className="dc-btn"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  background: filter === tab.id ? 'var(--dc-purple)' : 'var(--dc-bg-soft)',
                  color: filter === tab.id ? '#FFFFFF' : '#0A0A0A',
                  border: filter === tab.id ? 'none' : '1px solid var(--dc-border)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Case Grid */}
      <section className="dc-section">
        <div className="dc-container">
          <div className="dc-grid-2" style={{ gap: '2.5rem' }}>
            {filteredCases.map(cs => (
              <div key={cs.id} className="dc-card" style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#FFFFFF' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span className="dc-badge dc-badge-purple">{cs.categoryLabel}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#737373', textTransform: 'uppercase' }}>{cs.client}</span>
                  </div>

                  <h3 style={{ fontSize: '1.4rem', color: '#0A0A0A', marginBottom: '1rem', lineHeight: 1.3 }}>
                    {cs.title}
                  </h3>

                  <p style={{ color: 'var(--dc-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    {cs.summary}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
                    {cs.tags.map((t, i) => (
                      <span key={i} style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem', borderRadius: '6px', background: 'var(--dc-bg-soft)', color: '#4A4A4A', fontWeight: 500 }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{
                  background: 'var(--dc-purple-tint)',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid var(--dc-border-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dc-purple)', lineHeight: 1 }}>
                      {cs.metric}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#555555', fontWeight: 600, marginTop: '0.2rem' }}>
                      {cs.metricLabel}
                    </div>
                  </div>

                  <button 
                    onClick={onOpenAuditModal}
                    className="dc-btn dc-btn-primary" 
                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
                  >
                    <span>Start a Project</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
