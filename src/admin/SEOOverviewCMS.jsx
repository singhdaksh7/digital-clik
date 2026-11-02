import React, { useState, useEffect } from 'react';
import { 
  Search, AlertTriangle, CheckCircle, ExternalLink, 
  CornerDownRight, RefreshCw, ShieldAlert, ArrowRight, FileText
} from 'lucide-react';
import { getSeoOverview } from '../api/admin';

export default function SEOOverviewCMS({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await getSeoOverview();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch SEO overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading && !data) {
    return <div style={{ padding: '2rem', color: '#737373' }}>Analyzing site-wide SEO performance...</div>;
  }

  const {
    totalIndexable = 0,
    publishedPagesCount = 0,
    publishedPostsCount = 0,
    servicesCount = 0,
    projectsCount = 0,
    redirectsCount = 0,
    open404s = 0,
    totalIssues = 0,
    highSeverityIssues = 0,
    mediumSeverityIssues = 0,
    issues = []
  } = data || {};

  const filteredIssues = issues.filter(issue => {
    if (severityFilter === 'ALL') return true;
    return issue.severity === severityFilter;
  });

  const healthScore = totalIndexable > 0 
    ? Math.max(0, Math.round(((totalIndexable - highSeverityIssues) / totalIndexable) * 100))
    : 100;

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0A0A0A', margin: 0 }}>
            SEO Health & Metadata Audit
          </h1>
          <p style={{ color: '#737373', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Site-wide crawler readiness, metadata completeness, OpenGraph assets, and indexation status.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D4D4D4',
            padding: '0.65rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={15} /> Refresh Audit
        </button>
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        
        {/* Health Score */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#737373', fontWeight: 700 }}>SEO Health Score</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: healthScore >= 80 ? '#166534' : healthScore >= 50 ? '#D97706' : '#DC2626' }}>
              {healthScore}%
            </span>
            <span style={{ fontSize: '0.78rem', color: '#737373' }}>readiness</span>
          </div>
          <div style={{ marginTop: '0.6rem', height: '6px', backgroundColor: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${healthScore}%`, height: '100%', backgroundColor: healthScore >= 80 ? '#22C55E' : healthScore >= 50 ? '#F59E0B' : '#EF4444' }} />
          </div>
        </div>

        {/* Indexable Entities */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#737373', fontWeight: 700 }}>Indexable URLs</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0A0A0A', marginTop: '0.5rem' }}>
            {totalIndexable}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.3rem' }}>
            {publishedPagesCount} pages • {publishedPostsCount} blogs • {servicesCount + projectsCount} services
          </div>
        </div>

        {/* Active 301/302 Redirects */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#737373', fontWeight: 700 }}>Active Redirect Rules</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0A0A0A', marginTop: '0.5rem' }}>
            {redirectsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.3rem', fontWeight: 700 }}>
            Cached in Edge & Express
          </div>
        </div>

        {/* 404 Errors */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#737373', fontWeight: 700 }}>Captured 404 URLs</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: open404s > 0 ? '#DC2626' : '#0A0A0A', marginTop: '0.5rem' }}>
            {open404s}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.3rem' }}>
            Unresolved broken visitor requests
          </div>
        </div>

      </div>

      {/* Issues Table Section */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '1.5rem' }}>
        
        {/* Table Header & Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0A0A0A' }}>
              Detected SEO Issues & Warnings ({totalIssues})
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#737373', marginTop: '0.2rem' }}>
              {highSeverityIssues} high priority (missing title / meta description)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: severityFilter === sev ? '#0A0A0A' : '#F3F4F6',
                  color: severityFilter === sev ? '#FFFFFF' : '#525252'
                }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid #E5E5E5', color: '#737373', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Severity</th>
                <th style={{ padding: '0.75rem 1rem' }}>Issue Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Resource Title</th>
                <th style={{ padding: '0.75rem 1rem' }}>Path</th>
                <th style={{ padding: '0.75rem 1rem' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.55rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      backgroundColor: issue.severity === 'HIGH' ? '#FEE2E2' : issue.severity === 'MEDIUM' ? '#FEF3C7' : '#EFF6FF',
                      color: issue.severity === 'HIGH' ? '#DC2626' : issue.severity === 'MEDIUM' ? '#D97706' : '#2563EB'
                    }}>
                      {issue.severity}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#171717', fontSize: '0.82rem' }}>
                    {issue.type.replace(/_/g, ' ')}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#0A0A0A' }}>
                    {issue.title}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--dc-purple)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem' }}
                    >
                      {issue.url} <ExternalLink size={12} />
                    </a>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#737373', fontSize: '0.8rem' }}>
                    {issue.details || 'Required for optimal search ranking'}
                  </td>
                </tr>
              ))}
              {filteredIssues.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: '#166534' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={24} color="#166534" />
                      <span style={{ fontWeight: 700 }}>Zero SEO issues detected in this category!</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
