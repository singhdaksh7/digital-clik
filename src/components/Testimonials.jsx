import React, { useState, useEffect } from 'react';
import { MousePointer, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTestimonials } from '../api/public';

export default function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  const [testimonials, setTestimonials] = useState([
    {
      quote: "Every project starts with a different problem. Our job is to understand it properly, build what is actually needed, and stay involved until it works.",
      author: "Direct Communication",
      title: "Accountability",
      company: "DigitalClik Practice"
    },
    {
      quote: "We do not build and vanish. When your team needs updates, bug fixes, or a new feature three months down the line, we are still here to support you.",
      author: "Reliable Support",
      title: "Long-Term Backup",
      company: "DigitalClik Practice"
    },
    {
      quote: "Code you can actually maintain. No messy spaghetti code, no locked-in proprietary traps, and complete handover of all accounts, designs, and repositories.",
      author: "Full Ownership",
      title: "Clean Handover",
      company: "DigitalClik Practice"
    }
  ]);

  useEffect(() => {
    getTestimonials()
      .then(res => {
        if (res.success && res.data && res.data.length > 0) {
          setTestimonials(res.data.map(t => ({
            quote: t.quote,
            author: t.author,
            title: t.title,
            company: t.company
          })));
        }
      })
      .catch(() => {});
  }, []);

  const current = testimonials[activeIdx] || testimonials[0];

  const nextTestimonial = () => {
    setActiveIdx((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="dc-section dc-section-dark" style={{
      backgroundColor: '#0A0A0A',
      paddingTop: '6rem',
      paddingBottom: '6rem',
      position: 'relative'
    }}>
      <div className="dc-container" style={{ maxWidth: '1000px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="dc-badge dc-badge-dark">
            OUR COMMITMENT
          </span>
        </div>

        {/* Large Editorial Quote Frame */}
        <div style={{ textAlign: 'center', position: 'relative' }}>
          
          {/* Quote Mark Icon Accent */}
          <div style={{
            fontSize: '5rem',
            fontFamily: 'var(--dc-font-heading)',
            color: 'var(--dc-purple)',
            lineHeight: 0.8,
            marginBottom: '1rem',
            userSelect: 'none'
          }}>
            “
          </div>

          <blockquote style={{
            fontFamily: 'var(--dc-font-heading)',
            fontSize: 'clamp(1.5rem, 3.2vw, 2.4rem)',
            fontWeight: 700,
            lineHeight: 1.3,
            color: '#FFFFFF',
            letterSpacing: '-0.025em',
            marginBottom: '2.5rem'
          }}>
            {current.quote}
          </blockquote>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
              {current.author}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#A3A3A3', marginTop: '0.2rem' }}>
              {current.title} • <span style={{ color: 'var(--dc-purple)', fontWeight: 600 }}>{current.company}</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <button 
              onClick={prevTestimonial}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              aria-label="Previous Trust Commitment"
            >
              <ChevronLeft size={20} />
            </button>

            <span style={{ fontSize: '0.85rem', color: '#737373', fontWeight: 700 }}>
              0{activeIdx + 1} / 0{testimonials.length}
            </span>

            <button 
              onClick={nextTestimonial}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              aria-label="Next Trust Commitment"
            >
              <ChevronRight size={20} />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
