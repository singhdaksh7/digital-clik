import React, { useState } from 'react';
import { MousePointer, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { adminLogin } from '../api/admin';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await adminLogin(email, password);
      if (res.success && res.data?.token) {
        onLoginSuccess(res.data.user);
      } else {
        setError(res.error?.message || 'Invalid login credentials');
      }
    } catch (err) {
      setError(err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0A0A0A',
      color: '#FFFFFF',
      padding: '1.5rem'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#141414',
        border: '1px solid #262626',
        borderRadius: '16px',
        padding: '2.5rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--dc-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MousePointer size={18} color="#FFFFFF" style={{ transform: 'rotate(-25deg)', fill: '#FFFFFF' }} />
          </div>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF' }}>
            digital<span style={{ color: 'var(--dc-purple)' }}>clik</span>
          </span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#FFFFFF', marginBottom: '0.4rem' }}>
            CMS Control Center
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#A3A3A3' }}>
            Enter your credentials to manage the DigitalClik platform.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#CCCCCC', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#737373' }} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@digitalclik.com"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.6rem',
                  borderRadius: '8px',
                  background: '#1A1A1A',
                  border: '1px solid #333333',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#CCCCCC', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#737373' }} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.6rem',
                  borderRadius: '8px',
                  background: '#1A1A1A',
                  border: '1px solid #333333',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="dc-btn dc-btn-primary"
            style={{ width: '100%', padding: '0.95rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Admin Panel'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.75rem', color: '#666666' }}>
          Protected by Argon2id Password Hashing & Role-Based Auth
        </div>

      </div>
    </div>
  );
}
