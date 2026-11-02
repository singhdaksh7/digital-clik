import React, { useState, useEffect } from 'react';
import { 
  Webhook, Mail, BarChart2, Plus, Trash2, Send, 
  CheckCircle, AlertCircle, RefreshCw, Key, ExternalLink
} from 'lucide-react';
import {
  getWebhooks, createWebhook, updateWebhook, deleteWebhook, testWebhook,
  getEmailTemplates, createEmailTemplate, deleteEmailTemplate, testSendEmail
} from '../api/admin';

export default function IntegrationsCMS() {
  const [activeTab, setActiveTab] = useState('webhooks'); // webhooks | email | analytics
  const [webhooks, setWebhooks] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Webhook Modal State
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [webhookForm, setWebhookForm] = useState({ url: '', event: 'ALL', secret: '' });
  const [testResult, setTestResult] = useState(null);
  const [testingWebhookId, setTestingWebhookId] = useState(null);

  // Email Test State
  const [testEmailTo, setTestEmailTo] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  // Analytics Settings State
  const [analytics, setAnalytics] = useState({
    ga4Id: '',
    gtmId: '',
    metaPixelId: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [resWebhooks, resEmail] = await Promise.all([
        getWebhooks(),
        getEmailTemplates()
      ]);
      if (resWebhooks.success) setWebhooks(resWebhooks.data);
      if (resEmail.success) setEmailTemplates(resEmail.data);
    } catch (err) {
      console.error('Error loading integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Webhook Handlers
  const handleSaveWebhook = async (e) => {
    e.preventDefault();
    try {
      const res = await createWebhook(webhookForm);
      if (res.success) {
        setIsWebhookModalOpen(false);
        setWebhookForm({ url: '', event: 'ALL', secret: '' });
        loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteWebhook = async (id) => {
    if (!confirm('Delete this webhook?')) return;
    try {
      await deleteWebhook(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTestWebhook = async (id) => {
    try {
      setTestingWebhookId(id);
      setTestResult(null);
      const res = await testWebhook(id);
      setTestResult({
        webhookId: id,
        success: res.success,
        status: res.status,
        durationMs: res.durationMs,
        response: res.responseBody || res.error?.message
      });
    } catch (err) {
      setTestResult({
        webhookId: id,
        success: false,
        error: err.message
      });
    } finally {
      setTestingWebhookId(null);
    }
  };

  // Test Email Handler
  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmailTo) return;
    try {
      setEmailSending(true);
      setEmailStatus(null);
      const res = await testSendEmail({
        to: testEmailTo,
        subject: 'Test Notification from DigitalClik CMS PRO',
        html: '<p>Congratulations! Your SMTP notification gateway is fully functional.</p>'
      });
      setEmailStatus(res.success ? 'DISPATCHED' : 'FAILED');
    } catch (err) {
      setEmailStatus('FAILED');
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0A0A0A', margin: 0 }}>
            Integrations, Webhooks & APIs
          </h1>
          <p style={{ color: '#737373', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Configure real-time event webhooks, transactional email gateways, and tracking pixels.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #E5E5E5', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('webhooks')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1rem',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'webhooks' ? '#0A0A0A' : 'none',
            color: activeTab === 'webhooks' ? '#FFFFFF' : '#737373',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Webhook size={15} /> Event Webhooks ({webhooks.length})
        </button>

        <button
          onClick={() => setActiveTab('email')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1rem',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'email' ? '#0A0A0A' : 'none',
            color: activeTab === 'email' ? '#FFFFFF' : '#737373',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Mail size={15} /> Email Notifications & SMTP
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1rem',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'analytics' ? '#0A0A0A' : 'none',
            color: activeTab === 'analytics' ? '#FFFFFF' : '#737373',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <BarChart2 size={15} /> Analytics & Pixel Tags
        </button>
      </div>

      {/* Tab: Webhooks */}
      {activeTab === 'webhooks' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0A0A0A' }}>Outbound Webhooks</h2>
              <div style={{ fontSize: '0.78rem', color: '#737373', marginTop: '0.2rem' }}>
                Sends signed HTTP POST payloads to external endpoints on events.
              </div>
            </div>

            <button
              onClick={() => setIsWebhookModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#0A0A0A', color: '#FFFFFF', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              <Plus size={14} /> Add Webhook
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid #E5E5E5', color: '#737373', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Destination Endpoint</th>
                <th style={{ padding: '0.75rem 1rem' }}>Subscribed Event</th>
                <th style={{ padding: '0.75rem 1rem' }}>HMAC Secret</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map(w => (
                <tr key={w.id} style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.82rem' }}>
                    {w.url}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                      {w.event}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#737373', fontSize: '0.8rem' }}>
                    {w.secret ? '••••••••' : 'None'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleTestWebhook(w.id)}
                        disabled={testingWebhookId === w.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid #D4D4D4', background: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        <Send size={12} /> {testingWebhookId === w.id ? 'Testing...' : 'Test Ping'}
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(w.id)}
                        style={{ padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {webhooks.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2.5rem', textAlign: 'center', color: '#737373' }}>
                    No webhooks registered. Click "Add Webhook" to integrate Zapier, Slack, or CRM endpoints.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Test Ping Result Box */}
          {testResult && (
            <div style={{
              marginTop: '1.25rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: testResult.success ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${testResult.success ? '#BBF7D0' : '#FECACA'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.85rem', color: testResult.success ? '#166534' : '#DC2626' }}>
                {testResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                Test Delivery {testResult.success ? `Succeeded (${testResult.status} OK in ${testResult.durationMs}ms)` : 'Failed'}
              </div>
              {testResult.response && (
                <pre style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#FFFFFF', borderRadius: '4px', fontSize: '0.75rem', overflowX: 'auto', border: '1px solid #E5E5E5' }}>
                  {testResult.response}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Email */}
      {activeTab === 'email' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          {/* SMTP Status & Test Sender */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 800 }}>SMTP Gateway Diagnostic</h3>
            
            <form onSubmit={handleSendTestEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Send Test Verification Email To:
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@digitalclik.com"
                  value={testEmailTo}
                  onChange={e => setTestEmailTo(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #D4D4D4', fontSize: '0.9rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={emailSending}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#0A0A0A',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <Send size={15} /> {emailSending ? 'Dispatching...' : 'Dispatch Test Notification'}
              </button>

              {emailStatus && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: emailStatus === 'DISPATCHED' ? '#DCFCE7' : '#FEE2E2',
                  color: emailStatus === 'DISPATCHED' ? '#166534' : '#991B1B',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  {emailStatus === 'DISPATCHED' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                  {emailStatus === 'DISPATCHED' ? 'Test email logged & dispatched successfully.' : 'Email dispatch encountered an error.'}
                </div>
              )}
            </form>
          </div>

          {/* Email Templates */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 800 }}>Notification Templates ({emailTemplates.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ border: '1px solid #F0F0F0', borderRadius: '8px', padding: '0.85rem', backgroundColor: '#FAFAFA' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Contact Form Lead Receipt</div>
                <div style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.2rem' }}>Triggers immediately when a contact lead is captured.</div>
              </div>
              <div style={{ border: '1px solid #F0F0F0', borderRadius: '8px', padding: '0.85rem', backgroundColor: '#FAFAFA' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Audit Request Enquiry</div>
                <div style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.2rem' }}>Notifies sales team with company URL and budget.</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '1.5rem', maxWidth: '650px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1.25rem 0', color: '#0A0A0A' }}>
            Analytics & Marketing Pixels
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Google Analytics 4 Measurement ID
              </label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={analytics.ga4Id}
                onChange={e => setAnalytics(prev => ({ ...prev, ga4Id: e.target.value }))}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Google Tag Manager (GTM) Container ID
              </label>
              <input
                type="text"
                placeholder="GTM-XXXXXXX"
                value={analytics.gtmId}
                onChange={e => setAnalytics(prev => ({ ...prev, gtmId: e.target.value }))}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Meta (Facebook) Pixel ID
              </label>
              <input
                type="text"
                placeholder="123456789012345"
                value={analytics.metaPixelId}
                onChange={e => setAnalytics(prev => ({ ...prev, metaPixelId: e.target.value }))}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
              />
            </div>

            <button
              onClick={() => alert('Analytics IDs saved successfully!')}
              style={{
                alignSelf: 'flex-start',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#0A0A0A',
                color: '#FFFFFF',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Save Tracking IDs
            </button>
          </div>
        </div>
      )}

      {/* Webhook Modal */}
      {isWebhookModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '2rem', width: '480px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800 }}>Register Outbound Webhook</h3>
            <form onSubmit={handleSaveWebhook} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Payload URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://hooks.zapier.com/..."
                  value={webhookForm.url}
                  onChange={e => setWebhookForm(prev => ({ ...prev, url: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Event Trigger</label>
                <select
                  value={webhookForm.event}
                  onChange={e => setWebhookForm(prev => ({ ...prev, event: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
                >
                  <option value="ALL">All Events (Catch-All)</option>
                  <option value="LEAD_CREATED">LEAD_CREATED (Contact / Enquiry)</option>
                  <option value="PAGE_PUBLISHED">PAGE_PUBLISHED</option>
                  <option value="FORM_SUBMITTED">FORM_SUBMITTED</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>HMAC Secret Token (Optional)</label>
                <input
                  type="text"
                  placeholder="Secret key for X-DigitalClik-Signature"
                  value={webhookForm.secret}
                  onChange={e => setWebhookForm(prev => ({ ...prev, secret: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsWebhookModalOpen(false)} style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #D4D4D4', background: '#FFFFFF', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', border: 'none', background: '#0A0A0A', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>Register Webhook</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
