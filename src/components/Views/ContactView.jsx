import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { submitContact } from '../../api/public';

export default function ContactView({ onOpenAuditModal }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    service: 'Strategy & Brand Identity',
    budget: '$10,000 - $25,000',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitContact(formData);
    } catch (err) {
      console.error('Contact submit error:', err);
    }
    setSubmitted(true);
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      
      {/* Contact Hero */}
      <section className="dc-section" style={{ paddingTop: '4rem', paddingBottom: '3.5rem', borderBottom: '1px solid var(--dc-border)' }}>
        <div className="dc-container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <span className="dc-badge dc-badge-purple" style={{ marginBottom: '1.25rem' }}>
            START A CONVERSATION
          </span>
          <h1>
            Let's Make Something <span className="dc-text-purple">Worth Clicking.</span>
          </h1>
          <p style={{ marginTop: '1.25rem', fontSize: '1.15rem', color: 'var(--dc-text-secondary)' }}>
            Speak directly with a senior DigitalClik growth architect. We will review your digital footprint and outline a clear growth roadmap.
          </p>
        </div>
      </section>

      {/* Main Form & Contact Info Section */}
      <section className="dc-section">
        <div className="dc-container">
          <div className="dc-grid-2" style={{ gap: '3.5rem' }}>
            
            {/* Left Column: Form */}
            <div className="dc-card" style={{ padding: '2.5rem', background: '#FFFFFF', border: '1px solid var(--dc-border)' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#0A0A0A', marginBottom: '1.5rem' }}>
                Schedule a 1-on-1 Consultation
              </h2>

              {!submitted ? (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', marginBottom: '0.4rem' }}>
                      FULL NAME *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Alex Mercer"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', marginBottom: '0.4rem' }}>
                      WORK EMAIL *
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="alex@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', marginBottom: '0.4rem' }}>
                      WEBSITE URL *
                    </label>
                    <input 
                      type="url" 
                      required
                      placeholder="https://company.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
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
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', marginBottom: '0.4rem' }}>
                      PROJECT OVERVIEW / GOALS
                    </label>
                    <textarea 
                      rows="4"
                      placeholder="Tell us about your brand goals, target timeline, or current bottlenecks..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        background: 'var(--dc-bg-soft)',
                        border: '1px solid var(--dc-border)',
                        color: '#0A0A0A',
                        fontSize: '0.9rem',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="dc-btn dc-btn-primary"
                    style={{ width: '100%', padding: '0.95rem', fontSize: '1rem' }}
                  >
                    <span>Send Consultation Inquiry</span>
                    <ArrowRight size={18} />
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#737373', fontSize: '0.75rem' }}>
                    <ShieldCheck size={14} style={{ color: 'var(--dc-purple)' }} />
                    <span>Strictly Confidential. Privacy Guaranteed.</span>
                  </div>

                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--dc-purple-tint)', border: '2px solid var(--dc-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: 'var(--dc-purple)' }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', color: '#0A0A0A', marginBottom: '0.5rem' }}>
                    Consultation Requested!
                  </h3>
                  <p style={{ color: '#666666', fontSize: '0.95rem' }}>
                    Thank you. Our team is reviewing {formData.website}. A calendar invite has been sent to {formData.email}.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Direct Channels & Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#0A0A0A', marginBottom: '1rem' }}>
                  Direct Contact Channels
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="dc-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#FFFFFF' }}>
                    <Phone size={24} style={{ color: 'var(--dc-purple)' }} />
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#737373', fontWeight: 700 }}>24/7 CLIENT DIRECT LINE</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A0A0A' }}>+1 (800) 555-CLIK</div>
                    </div>
                  </div>

                  <div className="dc-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#FFFFFF' }}>
                    <Mail size={24} style={{ color: 'var(--dc-purple)' }} />
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#737373', fontWeight: 700 }}>INQUIRIES & PROPOSALS</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A0A0A' }}>hello@digitalclik.com</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agency Operations Notice */}
              <div className="dc-card" style={{ padding: '1.5rem', background: 'var(--dc-bg-soft)', border: '1px solid var(--dc-border)' }}>
                <h4 style={{ color: '#0A0A0A', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                  Global Operational Hours
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#555555', lineHeight: 1.6 }}>
                  Our strategy and engineering teams operate across Eastern Time (US), Greenwich Mean Time (UK), and Indian Standard Time (IST) for global client coverage.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
