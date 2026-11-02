import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { getRedirects, createRedirect, updateRedirect, deleteRedirect } from '../api/admin';

export default function RedirectsCMS() {
  const [redirects, setRedirects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [sourcePath, setSourcePath] = useState('');
  const [targetPath, setTargetPath] = useState('');
  const [statusCode, setStatusCode] = useState(301);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await getRedirects();
      if (res.success) setRedirects(res.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!sourcePath || !targetPath) return;

    try {
      const res = await createRedirect({ sourcePath, targetPath, statusCode });
      if (res.success) {
        setIsAdding(false);
        setSourcePath('');
        setTargetPath('');
        fetchList();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggle = async (r) => {
    try {
      await updateRedirect(r.id, { isActive: !r.isActive });
      fetchList();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, src) => {
    if (!window.confirm(`Delete redirect from ${src}?`)) return;
    try {
      await deleteRedirect(id);
      fetchList();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">301 / 302 URL Redirects</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage permanent (301) and temporary (302) redirects to protect SEO authority and fix legacy URLs.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C3BFF] text-white rounded-lg hover:bg-[#4828E0] transition font-medium text-sm shadow-sm"
        >
          <Plus size={16} /> Add Redirect Rule
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="my-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-800">Add New URL Redirect</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Source Path *</label>
              <input
                type="text"
                placeholder="/old-service-page"
                required
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Path or Full URL *</label>
              <input
                type="text"
                placeholder="/new-page or https://..."
                required
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status Code</label>
              <select
                value={statusCode}
                onChange={(e) => setStatusCode(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg"
              >
                <option value={301}>301 Permanent Redirect (SEO safe)</option>
                <option value={302}>302 Temporary Redirect</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-[#5C3BFF] text-white rounded-lg hover:bg-[#4828E0] font-medium"
            >
              Save Rule
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading redirects...</div>
        ) : redirects.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No redirects configured yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="py-3 px-4">Source URL</th>
                <th className="py-3 px-4">Target URL</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {redirects.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-mono text-xs text-gray-900 font-medium">{r.sourcePath}</td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-600 flex items-center gap-1.5">
                    <ArrowRight size={12} className="text-gray-400" /> {r.targetPath}
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-purple-700">{r.statusCode}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggle(r)}
                      className="flex items-center gap-1 text-xs font-semibold cursor-pointer"
                    >
                      {r.isActive ? (
                        <>
                          <CheckCircle size={14} className="text-green-500" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle size={14} className="text-gray-400" /> Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(r.id, r.sourcePath)}
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
