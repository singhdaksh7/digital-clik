import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, FileText, Briefcase, BookOpen, Layers } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    document.title = query ? `Search: ${query} | DigitalClik` : 'Search | DigitalClik';
    if (query) {
      performSearch(query);
    }
  }, []);

  const performSearch = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const url = new URL(window.location);
      url.searchParams.set('q', query.trim());
      window.history.pushState({}, '', url);
      document.title = `Search: ${query.trim()} | DigitalClik`;
      performSearch(query.trim());
    }
  };

  const filteredResults = results.filter(item => {
    if (filterType === 'ALL') return true;
    if (filterType === 'PAGE') return item.type === 'page';
    if (filterType === 'SERVICE') return item.type === 'service';
    if (filterType === 'PROJECT') return item.type === 'project';
    if (filterType === 'BLOG') return item.type === 'blog';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'service': return <Layers size={14} className="text-purple-400" />;
      case 'project': return <Briefcase size={14} className="text-blue-400" />;
      case 'blog': return <BookOpen size={14} className="text-emerald-400" />;
      default: return <FileText size={14} className="text-amber-400" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'service': return 'Service';
      case 'project': return 'Case Study';
      case 'blog': return 'Insight';
      default: return 'Page';
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search Header */}
        <div className="space-y-4 text-center">
          <span className="text-xs uppercase tracking-widest font-mono text-purple-400">Search Index</span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Explore Capabilities & Insights
          </h1>
          <p className="text-sm md:text-base text-neutral-400 max-w-xl mx-auto">
            Find technical case studies, production architecture, design workflows, and insights across our platform.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-4">
            <div className="relative flex items-center bg-[#0F1420] border border-neutral-800 rounded-2xl p-2 shadow-2xl focus-within:border-purple-500 transition">
              <Search size={20} className="text-neutral-500 ml-3" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by keywords (e.g., Next.js, Headless CMS, Retainers, UI/UX)..."
                className="w-full bg-transparent px-3 py-2 text-sm md:text-base text-white placeholder-neutral-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs md:text-sm rounded-xl transition shrink-0"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Filters */}
        {results.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            {['ALL', 'PAGE', 'SERVICE', 'PROJECT', 'BLOG'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3.5 py-1.5 rounded-full font-medium transition ${
                  filterType === t
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {t === 'ALL' ? `All Results (${results.length})` : t}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div className="pt-6">
          {loading ? (
            <div className="py-20 text-center text-neutral-500 text-sm">Searching the platform...</div>
          ) : query && filteredResults.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-neutral-800 rounded-2xl p-8">
              <p className="text-neutral-400 text-base">No matches found for &quot;{query}&quot;</p>
              <p className="text-xs text-neutral-500 mt-1">Try searching for broader terms like &quot;design&quot;, &quot;development&quot;, or &quot;strategy&quot;.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResults.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  className="group block p-5 rounded-2xl bg-[#0C101A] border border-neutral-800/80 hover:border-purple-500/50 hover:bg-[#111726] transition space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400 text-[11px] font-mono">
                      {getIcon(item.type)}
                      <span>{getTypeLabel(item.type)}</span>
                    </span>
                    <span className="text-neutral-500 font-mono text-[11px] group-hover:text-purple-400 transition flex items-center gap-1">
                      {item.url}
                      <ArrowRight size={12} className="inline group-hover:translate-x-1 transition" />
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs md:text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
