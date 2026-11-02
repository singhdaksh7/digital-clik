import React, { useEffect, useState } from 'react';
import {
  getUnifiedLeads,
  updateLeadStatus,
  getExportUrl
} from '../api/admin';
import {
  Inbox, Filter, Download, Search, CheckCircle2,
  Clock, AlertCircle, X, ChevronRight, User, Mail, Phone,
  Globe, Sparkles, MessageSquare, Tag, FileText, Check
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Leads' },
  { value: 'NEW', label: 'New', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { value: 'QUALIFIED', label: 'Qualified', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { value: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { value: 'WON', label: 'Won (Deal Closed)', color: 'bg-green-500/20 text-green-300 border-green-500/40' },
  { value: 'LOST', label: 'Lost', color: 'bg-neutral-800 text-neutral-400 border-neutral-700' },
  { value: 'SPAM', label: 'Spam', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
];

export default function LeadsCMS() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [activeLead, setActiveLead] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    loadLeads();
  }, [selectedStatus, search]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await getUnifiedLeads({
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        search: search.trim() || undefined
      });
      if (res.success) {
        setLeads(res.data);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!activeLead) return;
    setUpdatingStatus(true);
    try {
      const res = await updateLeadStatus(activeLead.id, {
        status: newStatus,
        note: noteText.trim() || undefined,
        entityType: activeLead.originType
      });
      if (res.success) {
        setLeads(prev => prev.map(l => l.id === activeLead.id ? { ...l, status: newStatus } : l));
        setActiveLead(prev => ({
          ...prev,
          status: newStatus,
          timeline: [...(prev.timeline || []), { event: `Status updated to ${newStatus}`, at: new Date().toISOString(), note: noteText.trim() }]
        }));
        setNoteText('');
      }
    } catch (err) {
      alert(err.message || 'Failed to update lead status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDownloadCsv = (type) => {
    const url = getExportUrl(type);
    window.open(url, '_blank');
  };

  const getStatusBadge = (status) => {
    const opt = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${opt?.color || 'bg-neutral-800 text-neutral-300'}`}>
        {opt?.label || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Unified Leads & CRM Inbox</h1>
          <p className="text-sm text-neutral-400">
            All contact requests, project briefs, and custom form submissions with full UTM campaign attribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadCsv('leads')}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-semibold rounded-lg transition"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Status Pipeline */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Search leads by name, email, phone, company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
            />
          </div>
        </div>

        {/* Pipeline Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-800 text-xs">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedStatus === opt.value
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'bg-neutral-950/60 text-neutral-400 border border-neutral-900 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="py-24 text-center text-neutral-500">Loading leads inbox...</div>
      ) : leads.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-800 rounded-xl">
          <Inbox className="mx-auto text-neutral-600 mb-3" size={40} />
          <h3 className="text-white font-medium">No leads found</h3>
          <p className="text-sm text-neutral-500 mt-1">There are no submissions matching your current filters.</p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 border-b border-neutral-800 uppercase text-[10px] text-neutral-400">
              <tr>
                <th className="p-3">Contact</th>
                <th className="p-3">Origin / Form</th>
                <th className="p-3">UTM Campaign</th>
                <th className="p-3">Status</th>
                <th className="p-3">Received</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/70">
              {leads.map(lead => (
                <tr
                  key={lead.id}
                  onClick={() => setActiveLead(lead)}
                  className={`hover:bg-neutral-800/40 cursor-pointer ${
                    activeLead?.id === lead.id ? 'bg-neutral-800/60' : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="font-semibold text-white">{lead.name || 'Anonymous Prospect'}</div>
                    <div className="text-neutral-400 text-[11px] flex items-center gap-2 mt-0.5">
                      <span>{lead.email}</span>
                      {lead.phone && <span>• {lead.phone}</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300">
                      {lead.formTitle || lead.originType || 'Website'}
                    </span>
                  </td>
                  <td className="p-3">
                    {lead.utmSource ? (
                      <div className="text-[11px]">
                        <span className="font-semibold text-emerald-400">{lead.utmSource}</span>
                        {lead.utmMedium && <span className="text-neutral-500"> / {lead.utmMedium}</span>}
                        {lead.utmCampaign && <div className="text-neutral-500 text-[10px]">{lead.utmCampaign}</div>}
                      </div>
                    ) : (
                      <span className="text-neutral-500 text-[11px]">Direct / Organic</span>
                    )}
                  </td>
                  <td className="p-3">{getStatusBadge(lead.status)}</td>
                  <td className="p-3 text-neutral-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <ChevronRight size={15} className="inline text-neutral-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lead Detail Drawer */}
      {activeLead && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-neutral-950 border-l border-neutral-800 shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Lead Details</h2>
              <span className="text-xs text-neutral-500">ID: {activeLead.id}</span>
            </div>
            <button
              onClick={() => setActiveLead(null)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Contact Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
              <h3 className="text-lg font-bold text-white">{activeLead.name || 'Anonymous'}</h3>
              <div className="space-y-1 text-xs text-neutral-300">
                {activeLead.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-neutral-500" />
                    <a href={`mailto:${activeLead.email}`} className="hover:text-emerald-400">{activeLead.email}</a>
                  </div>
                )}
                {activeLead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-neutral-500" />
                    <a href={`tel:${activeLead.phone}`} className="hover:text-emerald-400">{activeLead.phone}</a>
                  </div>
                )}
                {activeLead.company && (
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-neutral-500" />
                    <span>Company: {activeLead.company}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Pipeline Action */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">Pipeline Stage</label>
              <div className="grid grid-cols-2 gap-1.5">
                {STATUS_OPTIONS.filter(o => o.value !== 'ALL').map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleUpdateStatus(opt.value)}
                    disabled={updatingStatus}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold text-left border transition flex items-center justify-between ${
                      activeLead.status === opt.value
                        ? `${opt.color} font-bold`
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {activeLead.status === opt.value && <Check size={14} />}
                  </button>
                ))}
              </div>

              {/* Status Note input */}
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Optional log note for status transition..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500"
                />
              </div>
            </div>

            {/* UTM Campaign Attribution */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-emerald-400" />
                <span>Marketing Attribution</span>
              </h4>

              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">UTM Source:</span>
                  <span className="text-white font-mono">{activeLead.utmSource || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">UTM Medium:</span>
                  <span className="text-white font-mono">{activeLead.utmMedium || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">UTM Campaign:</span>
                  <span className="text-white font-mono">{activeLead.utmCampaign || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Landing Page:</span>
                  <span className="text-neutral-300 font-mono truncate max-w-xs">{activeLead.landingPage || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Referrer:</span>
                  <span className="text-neutral-300 font-mono truncate max-w-xs">{activeLead.referrer || '—'}</span>
                </div>
              </div>
            </div>

            {/* Submitted Form Payload / Message */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Submitted Data</h4>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-xs space-y-2 text-neutral-300">
                {activeLead.message && (
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Message / Brief:</span>
                    <p className="whitespace-pre-wrap text-white bg-neutral-950 p-2.5 rounded border border-neutral-800/80">
                      {activeLead.message}
                    </p>
                  </div>
                )}

                {activeLead.payloadJson && (
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Custom Form Data:</span>
                    <div className="space-y-1 bg-neutral-950 p-2.5 rounded border border-neutral-800/80">
                      {Object.entries(
                        typeof activeLead.payloadJson === 'string'
                          ? JSON.parse(activeLead.payloadJson)
                          : activeLead.payloadJson
                      ).map(([k, v]) => (
                        <div key={k} className="flex justify-between py-0.5 border-b border-neutral-900 last:border-0">
                          <span className="text-neutral-400 font-mono">{k}:</span>
                          <span className="text-white font-medium">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lead Timeline History */}
            {activeLead.timeline && activeLead.timeline.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Activity History</h4>
                <div className="space-y-2 text-xs">
                  {activeLead.timeline.map((item, idx) => (
                    <div key={idx} className="bg-neutral-900 p-2.5 rounded border border-neutral-800">
                      <div className="flex justify-between text-neutral-500 text-[11px]">
                        <span>{item.event}</span>
                        <span>{item.at ? new Date(item.at).toLocaleString() : ''}</span>
                      </div>
                      {item.note && <p className="text-white mt-1 text-xs">{item.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
