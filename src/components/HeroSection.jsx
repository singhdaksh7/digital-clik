import React, { useState, useEffect } from 'react';
import { ArrowRight, MousePointer, ArrowUpRight } from 'lucide-react';
import { getHomepageData } from '../api/public';

export default function HeroSection({ onOpenAuditModal }) {
  const [heroData, setHeroData] = useState({
    eyebrow: 'CREATIVE STUDIO & DIGITAL AGENCY',
    headlineLine1: 'DIGITAL',
    headlineLine2: 'THAT MAKES',
    headlineLine3: 'PEOPLE',
    highlightedWord: 'CLICK.',
    description: 'DigitalClik builds category-defining brand identities, sub-second web platforms, and search-driven acquisition systems for ambitious companies worldwide.'
  });

  const [heroFrames, setHeroFrames] = useState([
    { id: '1', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', label: 'NEXT.JS / WEB PLATFORM' },
    { id: '2', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', label: 'MOBILE & APP' },
    { id: '3', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80', label: 'BRAND & CREATIVE' }
  ]);

  useEffect(() => {
    getHomepageData()
      .then(res => {
        if (res.success && res.data) {
          if (res.data.heroMedia && res.data.heroMedia.length > 0) {
            setHeroFrames(res.data.heroMedia);
          }
          const heroSec = res.data.sections?.find(s => s.sectionKey === 'HERO');
          if (heroSec) {
            setHeroData(prev => ({
              ...prev,
              eyebrow: heroSec.eyebrow || prev.eyebrow,
              description: heroSec.subtitle || prev.description
            }));
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="dc-section" style={{
      backgroundColor: '#FFFFFF',
      paddingTop: '3.5rem',
      paddingBottom: '6rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="dc-container-wide">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
          gap: '4rem',
          alignItems: 'center'
        }} className="dc-hero-grid">
          
          {/* Left Column: Giant Stacked Editorial Headline & Action */}
          <div>
            
            {/* Category Eyebrow */}
            <div className="dc-badge dc-badge-purple" style={{ marginBottom: '1.75rem' }}>
              {heroData.eyebrow}
            </div>

            {/* Oversized Stacked Editorial Headline (72–96px scale) */}
            <h1 style={{
              fontSize: 'clamp(3rem, 6.2vw, 5.8rem)',
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: '-0.04em',
              color: '#0A0A0A',
              marginBottom: '2rem'
            }}>
              {heroData.headlineLine1} <br />
              {heroData.headlineLine2} <br />
              {heroData.headlineLine3} <span className="dc-text-purple">{heroData.highlightedWord}</span>
            </h1>

            {/* Confident Agency Statement */}
            <p style={{
              fontSize: '1.2rem',
              color: 'var(--dc-text-secondary)',
              marginBottom: '2.5rem',
              maxWidth: '560px',
              lineHeight: 1.6,
              fontWeight: 450
            }}>
              {heroData.description}
            </p>

            {/* Action Buttons with Sharp Borders */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <button 
                onClick={onOpenAuditModal} 
                className="dc-btn dc-btn-primary" 
                style={{ padding: '1.1rem 2.5rem', fontSize: '1.05rem', borderRadius: '8px' }}
              >
                <span>LET'S WORK TOGETHER</span>
                <ArrowRight size={18} />
              </button>

              <a 
                href="#selected-work" 
                className="dc-btn dc-btn-secondary" 
                style={{ padding: '1.1rem 2.25rem', fontSize: '1.05rem', borderRadius: '8px' }}
              >
                <span>EXPLORE WORK</span>
                <ArrowUpRight size={18} />
              </a>
            </div>

          </div>

          {/* Right Column: Art-Directed Asymmetric Portfolio Wall (Rectangular Visual Frames) */}
          <div style={{ position: 'relative' }}>
            <div className="dc-hero-wall-grid">
              
              {/* Frame 1: Large Main Desktop Website Frame (Grid Span 1..12, Row 1..7) */}
              <div className="dc-hero-frame" style={{
                gridColumn: '1 / 13',
                gridRow: '1 / 8',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--dc-border)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
                position: 'relative',
                background: '#0A0A0A'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80" 
                  alt="Web Engineering Platform"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.9,
                    transition: 'transform 0.5s ease'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '1rem',
                  background: '#FFFFFF',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#0A0A0A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--dc-purple)' }} />
                  NEXT.JS / WEB PLATFORM
                </div>
              </div>

              {/* Frame 2: Mobile Interface Frame (Grid Span 1..6, Row 8..13) */}
              <div className="dc-hero-frame" style={{
                gridColumn: '1 / 7',
                gridRow: '7 / 13',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--dc-border)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
                position: 'relative',
                zIndex: 2,
                background: '#FFFFFF'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" 
                  alt="Mobile Experience"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '0.75rem',
                  left: '0.75rem',
                  background: 'var(--dc-purple)',
                  color: '#FFFFFF',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}>
                  MOBILE & APP
                </div>
              </div>

              {/* Frame 3: Brand Creative Frame (Grid Span 7..12, Row 8..13) */}
              <div className="dc-hero-frame" style={{
                gridColumn: '7 / 13',
                gridRow: '8 / 13',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--dc-border)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
                position: 'relative',
                background: '#0A0A0A'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80" 
                  alt="Brand Identity"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '0.75rem',
                  right: '0.75rem',
                  background: '#FFFFFF',
                  color: 'var(--dc-purple)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}>
                  BRAND & CREATIVE
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

