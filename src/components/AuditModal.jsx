import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, MousePointer, Globe, Mail, Phone } from 'lucide-react';
import { submitProjectEnquiry } from '../api/public';

export default function AuditModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    phone: '',
    services: [],
    monthlySpend: '$5,000 - $10,000'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleService = (svc) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(svc)
        ? prev.services.filter(s => s !== svc)
        : [...prev.services, svc]
    }));
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (step === 1 && formData.website && formData.email) {
      setStep(2);
    } else if (step === 2) {
      try {
        await submitProjectEnquiry(formData);
      } catch (err) {
        console.error('Audit submit error:', err);
      }
      setIsSubmitted(true);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setIsSubmitted(false);
    onClose();
  };

  return (
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
        maxWidth: '650px',
        width: '100%',
        padding: '2.5rem',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#FFFFFF',
        border: '1px solid var(--dc-border)',
        boxShadow: 'var(--dc-shadow-card)'
      }}>

        {/* Close Button */}
        <button 
          onClick={resetAndClose}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="dc-badge dc-badge-purple" style={{ marginBottom: '0.6rem' }}>
                DIGITALCLIK CONSULTATION
              </span>
              <h2 style={{ fontSize: '1.75rem', color: '#0A0A0A' }}>
                Start a Growth Project with <span className="dc-text-purple">DigitalClik</span>
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#666666', marginTop: '0.4rem' }}>
                Share your website and growth goals. Our senior strategists will review your current search footprint and marketing architecture.
              </p>
            </div>

            {/* Steps Progress Indicator */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= 1 ? 'var(--dc-purple)' : 'var(--dc-border)' }} />
              <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= 2 ? 'var(--dc-purple)' : 'var(--dc-border)' }} />
            </div>

            <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {step === 1 ? (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', marginBottom: '0.4rem' }}>
                      YOUR WEBSITE OR DOMAIN URL *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Globe size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#737373' }} />
                      <input 
                        type="url" 
                        required
                        placeholder="https://yourcompany.com" 
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.85rem 1rem 0.85rem 2.8rem',
                          borderRadius: '10px',
                          background: 'var(--dc-bg-soft)',
                          border: '1px solid var(--dc-border)',
                          color: '#0A0A0A',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', marginBottom: '0.4rem' }}>
                      WORK EMAIL ADDRESS *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#737373' }} />
                      <input 
                        type="email" 
                        required
                        placeholder="alex@yourcompany.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.85rem 1rem 0.85rem 2.8rem',
                          borderRadius: '10px',
                          background: 'var(--dc-bg-soft)',
                          border: '1px solid var(--dc-border)',
                          color: '#0A0A0A',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', marginBottom: '0.4rem' }}>
                      PHONE / WHATSAPP (OPTIONAL)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#737373' }} />
                      <input 
                        type="tel" 
                        placeholder="+1 (555) 000-0000" 
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.85rem 1rem 0.85rem 2.8rem',
                          borderRadius: '10px',
                          background: 'var(--dc-bg-soft)',
                          border: '1px solid var(--dc-border)',
                          color: '#0A0A0A',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="dc-btn dc-btn-primary" 
                    style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
                  >
                    <span>Continue to Project Options</span>
                    <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', marginBottom: '0.6rem' }}>
                      SELECT PRIMARY AREAS OF INTEREST:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                      {['Strategy & Brand', 'SEO & AI Search', 'Paid PPC & Social', 'Video Studio & UGC', 'Custom Web Apps', 'CRO & Funnels'].map((svc) => (
                        <div 
                          key={svc}
                          onClick={() => toggleService(svc)}
                          style={{
                            padding: '0.6rem 0.8rem',
                            borderRadius: '8px',
                            background: formData.services.includes(svc) ? 'var(--dc-purple-tint)' : 'var(--dc-bg-soft)',
                            border: `1px solid ${formData.services.includes(svc) ? 'var(--dc-purple)' : 'var(--dc-border)'}`,
                            color: formData.services.includes(svc) ? 'var(--dc-purple)' : '#0A0A0A',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>{svc}</span>
                          {formData.services.includes(svc) && <span>✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', marginBottom: '0.4rem' }}>
                      ESTIMATED MONTHLY MARKETING / TECH SPEND
                    </label>
                    <select 
                      value={formData.monthlySpend}
                      onChange={(e) => setFormData({ ...formData, monthlySpend: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        background: 'var(--dc-bg-soft)',
                        border: '1px solid var(--dc-border)',
                        color: '#0A0A0A',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    >
                      <option value="Under $5,000">Under $5,000 / mo</option>
                      <option value="$5,000 - $10,000">$5,000 - $10,000 / mo</option>
                      <option value="$10,000 - $25,000">$10,000 - $25,000 / mo</option>
                      <option value="$25,000 - $100,000">$25,000 - $100,000 / mo</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="dc-btn dc-btn-secondary" 
                      style={{ flex: 1 }}
                    >
                      Back
                    </button>

                    <button 
                      type="submit" 
                      className="dc-btn dc-btn-primary" 
                      style={{ flex: 2 }}
                    >
                      <span>Submit Consultation Request</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#737373', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                <ShieldCheck size={14} style={{ color: 'var(--dc-purple)' }} />
                <span>Strictly Confidential. Privacy Guaranteed.</span>
              </div>

            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--dc-purple-tint)', border: '2px solid var(--dc-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--dc-purple)' }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.8rem', color: '#0A0A0A', marginBottom: '0.5rem' }}>
              Request Received!
            </h2>

            <p style={{ color: '#666666', fontSize: '0.98rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Our senior strategy team is reviewing <strong>{formData.website}</strong>. You will receive your consultation details at <strong>{formData.email}</strong> shortly.
            </p>

            <button 
              onClick={resetAndClose}
              className="dc-btn dc-btn-primary" 
              style={{ padding: '0.85rem 2rem' }}
            >
              Return to DigitalClik
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
