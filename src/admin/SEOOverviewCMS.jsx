import React, { useState, useEffect } from 'react';
import { 
  Search, AlertTriangle, CheckCircle2, XCircle, RefreshCw, 
  ExternalLink, ArrowRight, Link as LinkIcon, Network, GitMerge, FileText,
  ShieldCheck, AlertCircle, HelpCircle
} from 'lucide-react';
import { getSeoOverview, getInternalLinkGraph, getRedirectChains } from '../api/admin';

export default function SEOOverviewCMS({ onNavigate }) {
  const [data, setData] = useState(null);
  const [linkGraph, setLinkGraph] = useState(null);
  const [chains, setChains] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'links' | 'chains'
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchIssue, setSearchIssue] = useState('');

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const [seoRes, graphRes, chainsRes] = await Promise.all([
        getSeoOverview(),
        getInternalLinkGraph().catch(() => ({ success: false })),
        getRedirectChains().catch(() => ({ success: false }))
      ]);

      if (seoRes.success) setData(seoRes.data);
      if (graphRes.success) setLinkGraph(graphRes.data);
      if (chainsRes.success) setChains(chainsRes.data);
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
    return (
      <div className="py-24 text-center text-neutral-400">
        <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-emerald-500" />
        <p>Analyzing site-wide SEO metadata, link topology, and redirect graph...</p>
      </div>
    );
  }

  const {
    totalIndexable = 0,
    publishedPagesCount = 0,
    publishedPostsCount = 0,
    servicesCount = 0,
    projectsCount = 0,
    statusCounts = { healthy: 0, warnings: 0, needsAttention: 0 },
    counters = {},
    issues = []
  } = data || {};

  const filteredIssues = issues.filter(issue => {
    if (severityFilter !== 'ALL' && issue.severity !== severityFilter) return false;
    if (searchIssue.trim()) {
      const q = searchIssue.toLowerCase();
      return (
        issue.title?.toLowerCase().includes(q) ||
        issue.url?.toLowerCase().includes(q) ||
        issue.details?.toLowerCase().includes(q) ||
        issue.type?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const checkCards = [
    { label: 'Missing Meta Titles', count: counters.missingMetaTitle || 0, severity: 'critical' },
    { label: 'Missing Descriptions', count: counters.missingMetaDescription || 0, severity: 'critical' },
    { label: 'Duplicate Titles', count: counters.duplicateMetaTitle || 0, severity: 'warning' },
    { label: 'Duplicate Descriptions', count: counters.duplicateMetaDescription || 0, severity: 'warning' },
    { label: 'Missing H1 Tags', count: counters.missingH1 || 0, severity: 'warning' },
    { label: 'Multiple H1 Tags', count: counters.multipleH1 || 0, severity: 'warning' },
    { label: 'Missing Image Alt Text', count: counters.missingAltText || 0, severity: 'warning' },
    { label: 'Broken Internal Links', count: counters.brokenInternalLinks || 0, severity: 'critical' },
    { label: 'Noindex on Published', count: counters.noindexPages || 0, severity: 'warning' },
    { label: 'Canonical Problems', count: counters.canonicalProblems || 0, severity: 'warning' },
    { label: 'Unresolved 404s', count: counters.open404s || 0, severity: 'critical' },
    { label: 'Redirect Chains', count: counters.redirectChains || 0, severity: 'warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SEO Health & Audit</h1>
          <p className="text-sm text-neutral-400">
            Factual counters, link integrity, and crawler metadata across {totalIndexable} indexable URLs.
          </p>
        </div>
        <button
          onClick={fetchOverview}
          className="flex items-center gap-2 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-semibold rounded-lg transition"
        >
          <RefreshCw size={14} />
          <span>Rerun Audit</span>
        </button>
      </div>

      {/* Factual Status Triage (No fake percentage scores!) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{statusCounts.healthy}</div>
            <div className="text-xs font-semibold text-neutral-300">Healthy Entities</div>
            <div className="text-[11px] text-neutral-500">Fully compliant with title, desc & canonicals</div>
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">{statusCounts.warnings}</div>
            <div className="text-xs font-semibold text-neutral-300">Active Warnings</div>
            <div className="text-[11px] text-neutral-500">Missing alt text, duplicate copy, or chains</div>
          </div>
        </div>

        <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
            <XCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{statusCounts.needsAttention}</div>
            <div className="text-xs font-semibold text-neutral-300">Needs Attention</div>
            <div className="text-[11px] text-neutral-500">Missing titles, 404 errors, broken internal links</div>
          </div>
        </div>
      </div>

      {/* 12 Factual Check Metrics */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
          12 Core SEO & Indexation Metrics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {checkCards.map((chk, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border text-center transition ${
                chk.count > 0
                  ? chk.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-neutral-950/50 border-neutral-800/80'
              }`}
            >
              <div
                className={`text-xl font-bold ${
                  chk.count > 0
                    ? chk.severity === 'critical'
                      ? 'text-red-400'
                      : 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {chk.count}
              </div>
              <div className="text-[11px] text-neutral-300 font-medium truncate mt-0.5" title={chk.label}>
                {chk.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-neutral-800 space-x-6 text-sm">
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 font-medium transition flex items-center gap-2 border-b-2 ${
            activeTab === 'audit'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <FileText size={15} />
          <span>Issues Audit ({filteredIssues.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`pb-3 font-medium transition flex items-center gap-2 border-b-2 ${
            activeTab === 'links'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Network size={15} />
          <span>Internal Link Graph</span>
        </button>
        <button
          onClick={() => setActiveTab('chains')}
          className={`pb-3 font-medium transition flex items-center gap-2 border-b-2 ${
            activeTab === 'chains'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <GitMerge size={15} />
          <span>Redirect Chains ({chains?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Issues Audit */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                placeholder="Search issues by title, path, or rule..."
                value={searchIssue}
                onChange={e => setSearchIssue(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div className="flex items-center gap-2">
              {['ALL', 'CRITICAL', 'WARNING'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    severityFilter === sev
                      ? 'bg-neutral-800 text-white border border-neutral-700'
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {filteredIssues.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-neutral-800 rounded-xl">
              <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
              <h3 className="text-white font-medium text-sm">No issues matching filters</h3>
              <p className="text-xs text-neutral-500 mt-1">All scanned pages and posts passed this check criteria.</p>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950 border-b border-neutral-800 uppercase text-[10px] text-neutral-400">
                  <tr>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Entity / URL</th>
                    <th className="p-3">Audit Rule</th>
                    <th className="p-3">Details & Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/70">
                  {filteredIssues.map((iss, idx) => (
                    <tr key={idx} className="hover:bg-neutral-800/40">
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            iss.severity === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {iss.severity}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-white">{iss.title || iss.entity}</div>
                        <div className="text-neutral-500 font-mono text-[11px] truncate max-w-xs">{iss.url}</div>
                      </td>
                      <td className="p-3 font-medium text-neutral-300">
                        {iss.type?.replace(/_/g, ' ')}
                      </td>
                      <td className="p-3 text-neutral-400">
                        {iss.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Internal Link Graph */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between text-xs text-neutral-400">
            <div>
              <strong className="text-white">Internal Link Graph & Orphan Detection</strong>
              <p className="mt-0.5">Scans internal anchor tags across Page Blocks, identifying orphan pages and outgoing dead ends.</p>
            </div>
            <div className="text-right">
              <span className="text-white font-bold">
                {Array.isArray(linkGraph) ? linkGraph.length : (linkGraph?.pages?.length || 0)}
              </span> pages analyzed
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 border-b border-neutral-800 uppercase text-[10px] text-neutral-400">
                <tr>
                  <th className="p-3">Page Slug</th>
                  <th className="p-3">Title</th>
                  <th className="p-3 text-center">Inbound Links</th>
                  <th className="p-3 text-center">Outbound Links</th>
                  <th className="p-3 text-center">Broken Targets</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/70">
                {(Array.isArray(linkGraph) ? linkGraph : (linkGraph?.pages || [])).map((p, idx) => {
                  const inboundCount = p.incomingLinksCount ?? p.inboundCount ?? 0;
                  const outboundCount = p.outgoingLinksCount ?? p.outboundCount ?? 0;
                  const brokenLinks = p.brokenLinks || p.brokenOutbound || [];
                  const isOrphan = inboundCount === 0 && p.slug !== '';
                  const hasBroken = brokenLinks.length > 0;

                  return (
                    <tr key={idx} className="hover:bg-neutral-800/40">
                      <td className="p-3 font-mono text-neutral-300">
                        /{p.slug}
                      </td>
                      <td className="p-3 text-white font-medium">{p.title}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${isOrphan ? 'bg-amber-500/20 text-amber-300' : 'bg-neutral-800 text-neutral-300'}`}>
                          {inboundCount}
                        </span>
                      </td>
                      <td className="p-3 text-center text-neutral-400">{outboundCount}</td>
                      <td className="p-3 text-center">
                        {hasBroken ? (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded font-bold text-[11px]">
                            {brokenLinks.length} broken
                          </span>
                        ) : (
                          <span className="text-neutral-500">0</span>
                        )}
                      </td>
                      <td className="p-3">
                        {isOrphan ? (
                          <span className="text-amber-400 text-[11px]">⚠️ Orphan page (0 internal links)</span>
                        ) : hasBroken ? (
                          <span className="text-red-400 text-[11px]">⚠️ Links to invalid slug</span>
                        ) : (
                          <span className="text-emerald-400 text-[11px]">✅ Connected</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Redirect Chains */}
      {activeTab === 'chains' && (
        <div className="space-y-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-400">
            <strong className="text-white">Multi-Hop Redirect Chains</strong>
            <p className="mt-0.5">Detects redirects that point to other redirect rules (e.g. /a → /b → /c). Chains waste crawl budget and increase TTFB latency.</p>
          </div>

          {chains && chains.length > 0 ? (
            <div className="space-y-3">
              {chains.map((c, idx) => (
                <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono bg-neutral-950 px-2.5 py-1.5 rounded text-neutral-300">{c.source}</span>
                    <ArrowRight size={14} className="text-neutral-500" />
                    <span className="font-mono bg-amber-500/20 text-amber-300 px-2.5 py-1.5 rounded border border-amber-500/30">{c.intermediate}</span>
                    <ArrowRight size={14} className="text-neutral-500" />
                    <span className="font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-1.5 rounded border border-emerald-500/30">{c.target}</span>
                  </div>

                  <div className="text-xs text-neutral-400">
                    Fix: Point <code className="text-white">{c.source}</code> directly to <code className="text-emerald-400">{c.target}</code>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border border-dashed border-neutral-800 rounded-xl">
              <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
              <h3 className="text-white font-medium text-sm">No redirect chains detected</h3>
              <p className="text-xs text-neutral-500 mt-1">All active redirect rules resolve directly to destinations in 1 hop.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
