import React, { useState, useEffect } from 'react';
import { Eye, Plus, ArrowRight } from 'lucide-react';
import { fetchApi } from '../api/client';

export default function NotFoundManagerCMS() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/admin/404-logs');
      if (res.success) setLogs(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCreateRedirect = async (path) => {
    const target = window.prompt(`Redirect 404 URL "${path}" to:`, '/');
    if (!target) return;
    try {
      await fetchApi('/admin/redirects', {
        method: 'POST',
        body: JSON.stringify({ sourcePath: path, targetPath: target, statusCode: 301 })
      });
      alert('Redirect rule created!');
      fetchLogs();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <div className="pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">404 Error Monitor & Broken Path Recovery</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor public 404 errors in real time. Create instant 301 redirects to recover lost search traffic.
        </p>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading 404 logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No 404 errors recorded yet. Clean routing!</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Missing URL Path</th>
                <th className="py-3 px-4">Hit Count</th>
                <th className="py-3 px-4">Last Seen</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-mono text-xs text-red-600 font-semibold">{l.path}</td>
                  <td className="py-3 px-4 font-bold text-gray-800">{l.count}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{new Date(l.lastSeen).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleCreateRedirect(l.path)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-purple-50 text-[#5C3BFF] hover:bg-purple-100 rounded font-semibold"
                    >
                      <Plus size={12} /> Create 301 Redirect
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
