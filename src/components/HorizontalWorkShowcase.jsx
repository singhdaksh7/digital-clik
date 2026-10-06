import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowUpRight, MousePointer } from 'lucide-react';
import { getProjects } from '../api/public';

export default function HorizontalWorkShowcase({ onHoverCursor }) {
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);
  const [projects, setProjects] = useState([
    {
      id: 'p1',
      client: 'NexoPay Banking',
      category: 'FINTECH PLATFORM',
      title: 'Digital Banking System & AI Search Engine Authority',
      year: '2026',
      metric: 'SEO & Organic Growth',
      layout: 'full',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      summary: 'Re-architected NexoPay\'s digital search presence and customer portal, capturing high-intent financial queries and scaling monthly digital transactions.',
      deliverables: ['AI Search Entity Structuring', 'Next.js Web Portal Development', 'B2B Acquisition Campaign']
    },
    {
      id: 'p2',
      client: 'CloudScale AI',
      category: 'ENTERPRISE SAAS',
      title: 'Enterprise ABM Acquisition & Performance Media Scale',
      year: '2025',
      metric: 'Performance Marketing',
      layout: 'split',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
      summary: 'Deployed targeted LinkedIn and Google Search account-based campaigns to acquire Fortune 500 infrastructure and CTO leads.',
      deliverables: ['LinkedIn ABM Campaigns', 'Google Search Infrastructure', 'CRO & Landing Page Optimization']
    },
    {
      id: 'p3',
      client: 'Verve Luxury',
      category: 'DIRECT-TO-CONSUMER',
      title: 'Omnichannel Storefront & UGC Creative Studio',
      year: '2025',
      metric: 'Omnichannel Ad Scale',
      layout: 'bleed',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
      summary: 'Built high-velocity creator UGC video ad pipelines releasing multi-angle variations weekly across Meta and TikTok feeds.',
      deliverables: ['AI Avatar & Creator UGC Studio', 'TikTok & Meta Ad Scale', 'Headless Storefront Design']
    }
  ]);

  useEffect(() => {
    getProjects()
      .then(res => {
        if (res.success && res.data && res.data.length > 0) {
          const parsed = res.data.map(p => ({
            id: p.id,
            client: p.client,
            category: p.category,
            title: p.title,
            year: p.year || '2026',
            metric: p.metric || 'SEO & Growth',
            layout: p.layout || 'full',
            image: p.image,
            summary: p.summary,
            deliverables: typeof p.deliverables === 'string' ? JSON.parse(p.deliverables || '[]') : (p.deliverables || [])
          }));
          setProjects(parsed);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="selected-work" className="dc-section" style={{ backgroundColor: '#FFFFFF', paddingBottom: '7rem' }}>
      
      <div className="dc-container">
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '4rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1rem' }}>
              SELECTED PORTFOLIO
            </span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)' }}>
              Featured Agency <span className="dc-text-purple">Projects.</span>
            </h2>
          </div>
          <p style={{ maxWidth: '450px', color: 'var(--dc-text-secondary)', fontSize: '1.05rem' }}>
            Art-directed visual work across brand strategy, sub-second web engineering, and acquisition marketing.
          </p>
        </div>
      </div>

      {/* Alternating Project Layouts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
        
        {/* PROJECT 01: Full Width Landscape Container */}
        <div className="dc-container-wide">
          <div 
            onClick={() => setSelectedCaseStudy(projects[0])}
            onMouseEnter={() => onHoverCursor && onHoverCursor(true, 'VIEW PROJECT')}
            onMouseLeave={() => onHoverCursor && onHoverCursor(false, '')}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <div style={{ height: '520px', borderRadius: '16px', overflow: 'hidden', position: 'relative', marginBottom: '1.5rem' }}>
              <img 
                src={projects[0].image} 
                alt={projects[0].title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '1.5rem',
                left: '1.5rem',
                background: '#FFFFFF',
                padding: '0.4rem 1rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--dc-purple)'
              }}>
                {projects[0].category}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#737373', textTransform: 'uppercase' }}>
                  {projects[0].client} • {projects[0].year}
                </span>
                <h3 style={{ fontSize: '1.8rem', color: '#0A0A0A', marginTop: '0.2rem' }}>
                  {projects[0].title}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dc-purple)' }}>
                  {projects[0].metric}
                </span>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--dc-purple-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dc-purple)' }}>
                  <ArrowUpRight size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PROJECT 02: Split Layout (Image Left, Text Right) */}
        <div className="dc-container">
          <div 
            onClick={() => setSelectedCaseStudy(projects[1])}
            onMouseEnter={() => onHoverCursor && onHoverCursor(true, 'VIEW PROJECT')}
            onMouseLeave={() => onHoverCursor && onHoverCursor(false, '')}
            className="dc-grid-2" 
            style={{ alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ height: '420px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
              <img 
                src={projects[1].image} 
                alt={projects[1].title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: '1.25rem',
                left: '1.25rem',
                background: '#FFFFFF',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--dc-purple)'
              }}>
                {projects[1].category}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#737373', textTransform: 'uppercase' }}>
                {projects[1].client} • {projects[1].year}
              </span>
              <h3 style={{ fontSize: '2rem', color: '#0A0A0A', marginTop: '0.4rem', marginBottom: '1rem', lineHeight: 1.25 }}>
                {projects[1].title}
              </h3>
              <p style={{ color: 'var(--dc-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {projects[1].summary}
              </p>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--dc-purple)', fontWeight: 800, fontSize: '0.95rem' }}>
                <span>Read Full Case Study</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* PROJECT 03: Full-Bleed Imagery with Overlay */}
        <div 
          onClick={() => setSelectedCaseStudy(projects[2])}
          onMouseEnter={() => onHoverCursor && onHoverCursor(true, 'VIEW PROJECT')}
          onMouseLeave={() => onHoverCursor && onHoverCursor(false, '')}
          style={{ width: '100vw', height: '550px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
        >
          <img 
            src={projects[2].image} 
            alt={projects[2].title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to top, rgba(10, 10, 10, 0.85) 0%, rgba(10, 10, 10, 0.1) 60%)',
            display: 'flex',
            alignItems: 'flex-end',
            paddingBottom: '4rem'
          }}>
            <div className="dc-container" style={{ width: '100%' }}>
              <span className="dc-badge dc-badge-purple" style={{ marginBottom: '0.75rem' }}>
                {projects[2].category} • {projects[2].year}
              </span>
              <h3 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: '#FFFFFF', maxWidth: '800px', lineHeight: 1.2 }}>
                {projects[2].title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {projects[2].metric}
                </span>
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Inspect Details &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Case Breakdown Modal */}
      {selectedCaseStudy && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(10, 10, 10, 0.75)',
          backdropFilter: 'blur(12px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="dc-card" style={{
            maxWidth: '680px',
            width: '100%',
            padding: '2.5rem',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#FFFFFF',
            border: '1px solid var(--dc-border)'
          }}>
            <button 
              onClick={() => setSelectedCaseStudy(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'var(--dc-bg-soft)',
                border: '1px solid var(--dc-border)',
                color: '#0A0A0A',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: 700
              }}
            >
              ✕
            </button>

            <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1rem' }}>
              {selectedCaseStudy.category}
            </span>

            <h2 style={{ fontSize: '1.8rem', color: '#0A0A0A', marginBottom: '0.4rem' }}>
              {selectedCaseStudy.client}
            </h2>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--dc-purple)', marginBottom: '1.5rem' }}>
              {selectedCaseStudy.title}
            </h3>

            <p style={{ color: 'var(--dc-text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {selectedCaseStudy.summary}
            </p>

            <div style={{ background: 'var(--dc-bg-soft)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.75rem', border: '1px solid var(--dc-border)' }}>
              <h4 style={{ color: '#0A0A0A', fontSize: '1rem', marginBottom: '0.75rem' }}>Key Deliverables:</h4>
              <ul style={{ paddingLeft: '1.25rem', color: '#4A4A4A', fontSize: '0.92rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedCaseStudy.deliverables.map((del, i) => (
                  <li key={i} style={{ color: '#0A0A0A' }}>{del}</li>
                ))}
              </ul>
            </div>

            <button 
              onClick={() => setSelectedCaseStudy(null)}
              className="dc-btn dc-btn-primary" 
              style={{ width: '100%' }}
            >
              Close Project Breakdown
            </button>
          </div>
        </div>
      )}

    </section>
  );
}
