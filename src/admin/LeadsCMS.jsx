import React, { useEffect, useState } from 'react';
import { getProjectEnquiries, updateEnquiryStatus, getContactLeads, updateContactStatus } from '../api/admin';
import { Inbox, MessageSquare, CheckCircle2, ShieldCheck, Download, Edit2 } from 'lucide-react';

export default function LeadsCMS() {
  const [tab, setTab] = useState('enquiries'); // enquiries, contacts
  const [enquiries, setEnquiries] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const resEnq = await getProjectEnquiries();
      if (resEnq.success) setEnquiries(resEnq.data);

      const resCon = await getContactLeads();
      if (resCon.success) setContacts(resCon.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status, type) => {
    try {
      if (type === 'enquiry') {
        const res = await updateEnquiryStatus(id, status);
        if (res.success) {
          setEnquiries(prev => prev.map(e => e.id === id ? res.data : e));
        }
      } else {
        const res = await updateContactStatus(id, status);
        if (res.success) {
          setContacts(prev => prev.map(c => c.id === id ? res.data : c));
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return alert('No lead data to export');
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#737373' }}>Loading Lead Management System...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="dc-badge dc-badge-purple" style={{ marginBottom: '0.5rem' }}>LEAD ACQUISITION</span>
          <h1 style={{ fontSize: '2rem', color: '#0A0A0A' }}>Form Submissions & Enquiries</h1>
        </div>

        <button 
          onClick={() => exportCSV(tab === 'enquiries' ? enquiries : contacts, `digitalclik_${tab}_export`)} 
          className="dc-btn dc-btn-secondary"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--dc-border)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setTab('enquiries')}
          style={{
            padding: '0.75rem 1.25rem',
            fontFamily: 'var(--dc-font-heading)',
            fontWeight: 800,
            fontSize: '0.95rem',
            border: 'none',
            background: 'none',
            color: tab === 'enquiries' ? 'var(--dc-purple)' : '#737373',
            borderBottom: tab === 'enquiries' ? '3px solid var(--dc-purple)' : 'none',
            cursor: 'pointer'
          }}
        >
          Project Enquiries ({enquiries.length})
        </button>

        <button 
          onClick={() => setTab('contacts')}
          style={{
            padding: '0.75rem 1.25rem',
            fontFamily: 'var(--dc-font-heading)',
            fontWeight: 800,
            fontSize: '0.95rem',
            border: 'none',
            background: 'none',
            color: tab === 'contacts' ? 'var(--dc-purple)' : '#737373',
            borderBottom: tab === 'contacts' ? '3px solid var(--dc-purple)' : 'none',
            cursor: 'pointer'
          }}
        >
          Contact Messages ({contacts.length})
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {tab === 'enquiries' ? (
          enquiries.map(enq => (
            <div key={enq.id} className="dc-card" style={{ padding: '1.75rem', background: '#FFFFFF', border: '1px solid var(--dc-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#0A0A0A' }}>{enq.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--dc-purple)', fontWeight: 600 }}>{enq.email} • {enq.website}</div>
                </div>

                <select 
                  value={enq.status} 
                  onChange={e => handleStatusChange(enq.id, e.target.value, 'enquiry')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    border: '1px solid var(--dc-border)',
                    background: 'var(--dc-purple-tint)',
                    color: 'var(--dc-purple)'
                  }}
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="PROPOSAL_SENT">PROPOSAL SENT</option>
                  <option value="WON">WON</option>
                  <option value="LOST">LOST</option>
                  <option value="SPAM">SPAM</option>
                </select>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#555555', marginBottom: '0.85rem' }}>
                <strong>Est. Monthly Spend:</strong> {enq.monthlySpend || 'N/A'} | <strong>Submitted:</strong> {new Date(enq.createdAt).toLocaleString()}
              </div>

              {enq.message && (
                <div style={{ background: 'var(--dc-bg-soft)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.88rem', color: '#333333' }}>
                  "{enq.message}"
                </div>
              )}
            </div>
          ))
        ) : (
          contacts.map(con => (
            <div key={con.id} className="dc-card" style={{ padding: '1.75rem', background: '#FFFFFF', border: '1px solid var(--dc-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#0A0A0A' }}>{con.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--dc-purple)', fontWeight: 600 }}>{con.email}</div>
                </div>

                <select 
                  value={con.status} 
                  onChange={e => handleStatusChange(con.id, e.target.value, 'contact')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    border: '1px solid var(--dc-border)',
                    background: 'var(--dc-purple-tint)',
                    color: 'var(--dc-purple)'
                  }}
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="SPAM">SPAM</option>
                </select>
              </div>

              <div style={{ background: 'var(--dc-bg-soft)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.88rem', color: '#333333' }}>
                "{con.message}"
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
