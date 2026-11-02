import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit } from 'lucide-react';
import { fetchApi } from '../api/client';

export default function GlobalBlocksCMS() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('CTA');
  const [category, setCategory] = useState('GENERAL');

  const fetchGlobalBlocks = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/admin/global-blocks');
      if (res.success) setBlocks(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalBlocks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await fetchApi('/admin/global-blocks', {
        method: 'POST',
        body: JSON.stringify({
          name,
          type,
          category,
          settings: { width: 'Standard', padding: 'Medium', background: 'Purple' },
          content: { title: name, subtitle: 'Reusable block content', ctaText: 'Contact Us', ctaLink: '/contact' }
        })
      });
      setIsAdding(false);
      setName('');
      fetchGlobalBlocks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, bName) => {
    if (!window.confirm(`Delete global block "${bName}"?`)) return;
    try {
      await fetchApi(`/admin/global-blocks/${id}`, { method: 'DELETE' });
      fetchGlobalBlocks();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global & Reusable Blocks</h1>
          <p className="text-sm text-gray-500 mt-1">
            Build site-wide sections (CTAs, trust banners, forms). Editing a linked global block updates every page using it.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C3BFF] text-white rounded-lg hover:bg-[#4828E0] transition font-medium text-sm shadow-sm"
        >
          <Plus size={16} /> New Reusable Block
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="my-6 p-5 bg-white border rounded-xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-800">Create Reusable Block</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Block Name *</label>
              <input
                type="text"
                placeholder="e.g. Universal Conversion CTA"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Block Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full text-xs p-2.5 border rounded-lg">
                <option value="CTA">CTA Box</option>
                <option value="FAQ">FAQ Accordion</option>
                <option value="STATS">Stats Grid</option>
                <option value="CONTACT_FORM">Contact Form</option>
                <option value="LOGO_CLOUD">Logo Cloud</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-xs p-2.5 border rounded-lg">
                <option value="GENERAL">General</option>
                <option value="CTA">Conversion CTA</option>
                <option value="TRUST">Trust & Proof</option>
                <option value="FOOTER">Footer Promo</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-1.5 text-xs bg-[#5C3BFF] text-white rounded font-medium">
              Create
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading global blocks...</div>
        ) : blocks.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No global blocks created yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Block Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Pages Linked</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blocks.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-semibold text-gray-900">{b.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-purple-700">{b.type}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{b.category}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{b._count?.blocks || 0} page(s)</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(b.id, b.name)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
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
