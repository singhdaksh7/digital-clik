import React, { useEffect, useState } from 'react';
import { getDashboardMetrics } from '../api/admin';
import { 
  Inbox, Briefcase, Layers, MessageSquare, 
  Users, TrendingUp, Clock, ArrowRight, ShieldCheck, Plus, ExternalLink 
} from 'lucide-react';

export default function DashboardView({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getDashboardMetrics();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#737373' }}>Loading CMS Dashboard Metrics...</div>;
  }

  const metrics = data?.metrics || {};

  return (
    <div>
      
      {/* Dashboard Top Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="dc-badge dc-badge-purple" style={{ marginBottom: '0.5rem' }}>SYSTEM OVERVIEW</span>
          <h1 style={{ fontSize: '2rem', color: '#0A0A0A' }}>DigitalClik Admin Dashboard</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => onNavigate('services')} className="dc-btn dc-btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
            <Plus size={14} /> Add Service
          </button>
          <button onClick={() => onNavigate('projects')} className="dc-btn dc-btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
            <Plus size={14} /> Add Project
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }} className="dc-grid-4">
        
        <div className="dc-card" style={{ padding: '1.5rem', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#737373', textTransform: 'uppercase' }}>PROJECT ENQUIRIES</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--dc-purple-tint)', color: 'var(--dc-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Inbox size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0A0A0A' }}>{metrics.totalEnquiries || 0}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--dc-purple)', fontWeight: 700, marginTop: '0.2rem' }}>
            {metrics.newEnquiries || 0} New Pending Action
          </div>
        </div>

        <div className="dc-card" style={{ padding: '1.5rem', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#737373', textTransform: 'uppercase' }}>CONTACT LEADS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--dc-purple-tint)', color: 'var(--dc-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0A0A0A' }}>{metrics.totalContacts || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#737373', fontWeight: 600, marginTop: '0.2rem' }}>
            {metrics.newContacts || 0} New Messages
          </div>
        </div>

        <div className="dc-card" style={{ padding: '1.5rem', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#737373', textTransform: 'uppercase' }}>ACTIVE SERVICES</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--dc-purple-tint)', color: 'var(--dc-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0A0A0A' }}>{metrics.totalServices || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#737373', fontWeight: 600, marginTop: '0.2rem' }}>
            Managed Capabilities
          </div>
        </div>

        <div className="dc-card" style={{ padding: '1.5rem', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#737373', textTransform: 'uppercase' }}>PORTFOLIO PROJECTS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--dc-purple-tint)', color: 'var(--dc-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0A0A0A' }}>{metrics.totalProjects || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#737373', fontWeight: 600, marginTop: '0.2rem' }}>
            Published Work
          </div>
        </div>

      </div>

      {/* 2-Column Section: Recent Enquiries & Audit Activity */}
      <div className="dc-grid-2" style={{ gap: '2rem' }}>
        
        {/* Recent Enquiries Table */}
        <div className="dc-card" style={{ padding: '1.75rem', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0A0A0A' }}>Recent Project Enquiries</h3>
            <button onClick={() => onNavigate('leads')} style={{ fontSize: '0.8rem', color: 'var(--dc-purple)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
              View All &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(data?.recentEnquiries || []).length > 0 ? (
              data.recentEnquiries.map((enq) => (
                <div key={enq.id} style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'var(--dc-bg-soft)',
                  border: '1px solid var(--dc-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0A0A0A' }}>{enq.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#737373' }}>{enq.email} • {enq.website}</div>
                  </div>
                  <span className="dc-badge dc-badge-purple" style={{ fontSize: '0.68rem' }}>{enq.status}</span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.9rem', color: '#737373', padding: '1rem 0' }}>No recent enquiries submitted.</div>
            )}
          </div>
        </div>

        {/* Recent Audit Activity */}
        <div className="dc-card" style={{ padding: '1.75rem', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0A0A0A' }}>Recent System Audit Logs</h3>
            <button onClick={() => onNavigate('audit-logs')} style={{ fontSize: '0.8rem', color: 'var(--dc-purple)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
              View All &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(data?.recentAuditLogs || []).length > 0 ? (
              data.recentAuditLogs.map((log) => (
                <div key={log.id} style={{
                  padding: '0.85rem',
                  borderRadius: '8px',
                  borderBottom: '1px solid var(--dc-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--dc-purple)' }}>[{log.action}]</span>
                    <span style={{ fontSize: '0.85rem', color: '#0A0A0A', marginLeft: '0.5rem', fontWeight: 600 }}>{log.entityType}</span>
                    <div style={{ fontSize: '0.72rem', color: '#737373', marginTop: '0.1rem' }}>
                      {log.user?.email || 'System'} • {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.9rem', color: '#737373', padding: '1rem 0' }}>No system logs yet.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
