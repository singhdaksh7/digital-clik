import React, { useState, useEffect } from 'react';
import { Phone, Globe, ChevronDown, ArrowRight } from 'lucide-react';
import { getSiteSettings } from '../api/public';

export default function TopBar({ onOpenAuditModal }) {
  const [currency, setCurrency] = useState('USD ($)');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('Building high-performing digital experiences & growth strategy for ambitious brands.');
  const [phoneText, setPhoneText] = useState('+1 (800) 555-CLIK');

  useEffect(() => {
    getSiteSettings()
      .then(res => {
        if (res.success && res.data) {
          if (res.data.announcement?.text) setAnnouncementText(res.data.announcement.text);
          if (res.data.settings?.phone) setPhoneText(res.data.settings.phone);
        }
      })
      .catch(() => {});
  }, []);

  const currencies = [
    { code: 'USD ($)', label: 'Global (USD)' },
    { code: 'EUR (€)', label: 'Europe (EUR)' },
    { code: 'GBP (£)', label: 'United Kingdom (GBP)' },
    { code: 'INR (₹)', label: 'India (INR)' },
    { code: 'AED (د.إ)', label: 'Middle East (AED)' },
  ];

  return (
    <div style={{
      backgroundColor: 'var(--dc-purple)',
      color: '#FFFFFF',
      fontSize: '0.8rem',
      padding: '0.45rem 0',
      position: 'relative',
      zIndex: 101,
      fontWeight: 500
    }}>
      <div className="dc-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        
        {/* Ticker / Statement */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '0.15rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            DIGITAL CLIK
          </span>
          <span style={{ fontWeight: 500, opacity: 0.95 }}>
            {announcementText}
          </span>
        </div>

        {/* Right Utility Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          
          {/* Currency / Region Switcher */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <Globe size={13} />
              <span>{currency}</span>
              <ChevronDown size={12} />
            </button>

            {isCurrencyOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                background: '#FFFFFF',
                border: '1px solid var(--dc-border)',
                borderRadius: '8px',
                padding: '0.4rem',
                boxShadow: 'var(--dc-shadow-card)',
                minWidth: '170px',
                zIndex: 200
              }}>
                {currencies.map((c) => (
                  <div
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code);
                      setIsCurrencyOpen(false);
                    }}
                    style={{
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: currency === c.code ? 'var(--dc-purple)' : '#333333',
                      background: currency === c.code ? 'var(--dc-purple-light)' : 'transparent',
                      fontWeight: currency === c.code ? 700 : 500,
                      fontSize: '0.78rem'
                    }}
                  >
                    {c.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Direct Phone */}
          <a 
            href="tel:+18005552545" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#FFFFFF', fontWeight: 600, textDecoration: 'none' }}
          >
            <Phone size={12} />
            <span>+1 (800) 555-CLIK</span>
          </a>

          {/* Direct Consultation Link */}
          <button
            onClick={onOpenAuditModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
          >
            <span>Let's Talk</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </div>
    </div>
  );
}
