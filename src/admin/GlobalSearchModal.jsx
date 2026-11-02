import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Briefcase, Sparkles, Inbox, Image, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { getPages, getBlogPosts, getAdminProjects as getProjects, getUnifiedLeads } from '../api/admin';

export default function GlobalSearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onNavigate?.('__OPEN_SEARCH__');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [pagesRes, blogRes, projRes, leadsRes] = await Promise.all([
          getPages().catch(() => ({ data: [] })),
          getBlogPosts().catch(() => ({ data: [] })),
          getProjects().catch(() => ({ data: [] })),
          getUnifiedLeads({ search: query }).catch(() => ({ data: [] }))
        ]);

        const q = query.toLowerCase();
        const matched = [];

        // Match pages
        (pagesRes.data || []).forEach(p => {
          if (p.title?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q)) {
            matched.push({ type: 'Page', title: p.title, subtitle: `/${p.slug}`, tab: 'pages', id: p.id });
          }
        });

        // Match blog posts
        (blogRes.data || []).forEach(b => {
          if (b.title?.toLowerCase().includes(q) || b.slug?.toLowerCase().includes(q)) {
            matched.push({ type: 'Blog Post', title: b.title, subtitle: `/blog/${b.slug}`, tab: 'blog', id: b.id });
          }
        });

        // Match projects
        (projRes.data || []).forEach(pr => {
          if (pr.title?.toLowerCase().includes(q) || pr.client?.toLowerCase().includes(q)) {
            matched.push({ type: 'Project', title: pr.title, subtitle: pr.client, tab: 'projects', id: pr.id });
          }
        });

        // Match leads
        (leadsRes.data || []).slice(0, 5).forEach(l => {
          matched.push({ type: 'Lead', title: l.name || l.email, subtitle: `${l.email} • ${l.status}`, tab: 'leads', id: l.id });
        });

        setResults(matched.slice(0, 12));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (item) => {
    onClose();
    if (onNavigate) onNavigate(item.tab, item.id);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Page': return <FileText size={14} className="text-blue-400" />;
      case 'Blog Post': return <FileText size={14} className="text-emerald-400" />;
      case 'Project': return <Briefcase size={14} className="text-purple-400" />;
      case 'Lead': return <Inbox size={14} className="text-amber-400" />;
      default: return <Sparkles size={14} className="text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center pt-20 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-neutral-800 flex items-center gap-3">
          <Search size={18} className="text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type to search pages, blogs, projects, leads, or press ESC..."
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-neutral-500 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-neutral-800/60 p-2 text-xs">
          {loading ? (
            <div className="py-8 text-center text-neutral-500">Searching...</div>
          ) : query && results.length === 0 ? (
            <div className="py-8 text-center text-neutral-500">No results found for &quot;{query}&quot;</div>
          ) : !query ? (
            <div className="p-4 text-center text-neutral-500">
              Search by title, URL slug, client name, or prospect email.
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(item)}
                className="p-3 rounded-lg hover:bg-neutral-800 cursor-pointer flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{item.title}</div>
                    <div className="text-neutral-500 text-[11px] font-mono">{item.subtitle}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-neutral-400 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                  <span>{item.type}</span>
                  <CornerDownLeft size={11} className="text-neutral-500" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
