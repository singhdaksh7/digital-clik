import React, { useState } from 'react';
import { ArrowRight, MousePointer } from 'lucide-react';

export default function CaseStudiesView({ onOpenAuditModal }) {
  const [filter, setFilter] = useState('all');

  const caseStudies = [
    {
      id: '1',
      client: 'NexoPay Banking',
      category: 'fintech',
      categoryLabel: 'FinTech & Banking',
      title: 'Digital Banking Platform & Organic Search Authority',
      metric: 'Organic Growth',
      metricLabel: 'SEO & Entity Search Strategy',
      summary: 'Re-architected NexoPay\'s digital search presence and customer portal, capturing high-intent financial queries and scaling monthly digital transactions.',
      tags: ['AI Search (GEO)', 'Enterprise SEO', 'Next.js App']
    },
    {
      id: '2',
      client: 'CloudScale AI',
      category: 'saas',
      categoryLabel: 'B2B Enterprise SaaS',
      title: 'Enterprise ABM Campaign & Multi-Channel Acquisition',
      metric: 'Acquisition Scale',
      metricLabel: 'Enterprise Performance PPC',
      summary: 'Deployed targeted LinkedIn and Google Search account-based campaigns to acquire Fortune 500 infrastructure and CTO leads.',
      tags: ['Performance PPC', 'LinkedIn ABM', 'CRO']
    },
    {
      id: '3',
      client: 'Verve Luxury',
      category: 'ecom',
      categoryLabel: 'Direct-to-Consumer',
      title: 'Omnichannel E-Commerce & Creator UGC Ads',
      metric: 'Ad Performance',
      metricLabel: 'Creator UGC & Social Ads',
      summary: 'Built high-velocity creator UGC video ad pipelines releasing multi-angle variations weekly across Meta and TikTok feeds.',
      tags: ['Video Studio', 'TikTok Ads', 'UGC']
    },
    {
      id: '4',
      client: 'PulseCare Health',
      category: 'health',
      categoryLabel: 'Healthcare & Telemedicine',
      title: 'Patient Consultation Portal & Sub-Second App',
      metric: 'Speed Score',
      metricLabel: 'Next.js App Architecture',
      summary: 'Designed and engineered Next.js patient consultation platform with HIPAA-compliant API workflows and automated scheduling.',
      tags: ['Next.js PWA', 'SEO', 'Web App']
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
            SELECTED WORK & CASE STUDIES
          </span>
          <h1>
            Real Projects. <span className="dc-text-purple">Real Growth.</span>
          </h1>
          <p style={{ marginTop: '1.25rem', fontSize: '1.15rem', color: 'var(--dc-text-secondary)' }}>
            Explore how we partner with category leaders across brand strategy, high-speed web engineering, search intelligence, and performance media.
          </p>

          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'fintech', label: 'FinTech' },
              { id: 'saas', label: 'B2B SaaS' },
              { id: 'ecom', label: 'E-Commerce' },
              { id: 'health', label: 'Healthcare' },
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
                    <span>Request Proposal</span>
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
