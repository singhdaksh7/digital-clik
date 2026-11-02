import React, { useState, useEffect } from 'react';
import { Search, Plus, ExternalLink, Copy, Trash2, Edit, Globe, FileText } from 'lucide-react';
import { getPages, createPage, duplicatePage, deletePage, publishPage } from '../api/admin';

export default function PagesCMS({ onEditPage }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [actionError, setActionError] = useState(null);

  const fetchPageList = async () => {
    try {
      setLoading(true);
      const res = await getPages({ status: filterStatus, search });
      if (res.success) {
        setPages(res.data);
      }
    } catch (err) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageList();
  }, [filterStatus, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setActionError(null);
      const res = await createPage({ title: newTitle, slug: newSlug });
      if (res.success && res.data) {
        setIsCreating(false);
        setNewTitle('');
        setNewSlug('');
        if (onEditPage) {
          onEditPage(res.data.id);
        } else {
          fetchPageList();
        }
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await duplicatePage(id);
      if (res.success) fetchPageList();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete page "${title}"? This cannot be undone.`)) return;
    try {
      const res = await deletePage(id);
      if (res.success) fetchPageList();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTogglePublish = async (page) => {
    const nextStatus = page.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await publishPage(page.id, nextStatus);
      if (res.success) fetchPageList();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages & Landing Pages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, assemble with modular blocks, optimize SEO, and manage live published URLs.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C3BFF] text-white rounded-lg hover:bg-[#4828E0] transition font-medium text-sm shadow-sm"
        >
          <Plus size={16} /> Create Page
        </button>
      </div>

      {actionError && (
        <div className="my-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {actionError}
        </div>
      )}

      {/* Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Page</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Page Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Development Gurgaon"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#5C3BFF]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. website-development-gurgaon"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#5C3BFF]"
                />
                <p className="text-xs text-gray-400 mt-1">Leaves blank to generate automatically from title.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-[#5C3BFF] text-white rounded-lg hover:bg-[#4828E0] font-medium"
                >
                  Create & Launch Builder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 my-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search pages by title, slug, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C3BFF]"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'PUBLISHED', 'DRAFT'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                filterStatus === st
                  ? 'bg-purple-50 text-[#5C3BFF] border-purple-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading pages...</div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-semibold text-gray-700">No pages found</h3>
            <p className="text-xs text-gray-400 mt-1">Get started by creating your first landing or service page.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="py-3 px-4">Title & Slug</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">SEO Index</th>
                <th className="py-3 px-4">Blocks</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{p.title}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 font-mono mt-0.5">
                      <Globe size={12} /> /{p.slug}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                        p.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs ${p.noIndex ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                      {p.noIndex ? 'NoIndex' : 'Indexed'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {p._count?.blocks || 0} blocks
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => onEditPage(p.id)}
                        className="p-1.5 text-gray-600 hover:text-[#5C3BFF] hover:bg-purple-50 rounded"
                        title="Edit in Page Builder"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(p.id)}
                        className="p-1.5 text-gray-600 hover:text-[#5C3BFF] hover:bg-purple-50 rounded"
                        title="Duplicate Page"
                      >
                        <Copy size={16} />
                      </button>
                      {p.status === 'PUBLISHED' && (
                        <a
                          href={`/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-gray-600 hover:text-[#5C3BFF] hover:bg-purple-50 rounded"
                          title="Open live URL"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className={`px-2 py-1 text-xs font-semibold rounded border ${
                          p.status === 'PUBLISHED'
                            ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {p.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete Page"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
