import React, { useState, useEffect } from 'react';
import { Inbox, Download, CheckCircle, Clock } from 'lucide-react';
import { fetchApi } from '../api/client';

export default function FormSubmissionsCMS() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/admin/form-submissions');
      if (res.success) setSubmissions(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await fetchApi(`/admin/form-submissions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      fetchSubmissions();
      if (selectedSub && selectedSub.id === id) {
        setSelectedSub((prev) => ({ ...prev, status }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <div className="pb-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom Form Submissions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review inbound inquiries captured across all dynamic page forms.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No form submissions received yet.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Form</th>
                  <th className="py-3 px-4">Page</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => setSelectedSub(sub)}
                    className={`hover:bg-gray-50 cursor-pointer transition ${
                      selectedSub?.id === sub.id ? 'bg-purple-50/50' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-gray-900">{sub.formName}</td>
                    <td className="py-3 px-4 text-xs font-mono text-gray-500">/{sub.pageSlug || 'home'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sub.status === 'NEW'
                            ? 'bg-amber-100 text-amber-700'
                            : sub.status === 'CONTACTED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Details Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          {selectedSub ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-bold text-gray-900 text-sm">{selectedSub.formName}</h3>
                <span className="text-xs text-gray-400 font-mono">
                  {new Date(selectedSub.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Status Workflow</label>
                <select
                  value={selectedSub.status}
                  onChange={(e) => handleUpdateStatus(selectedSub.id, e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="CLOSED">Closed</option>
                  <option value="SPAM">Spam</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Submitted Fields</label>
                <div className="bg-gray-50 p-3 rounded-lg border text-xs space-y-2">
                  {Object.entries(JSON.parse(selectedSub.data || '{}')).map(([k, v]) => (
                    <div key={k}>
                      <span className="font-semibold text-gray-700 capitalize">{k}: </span>
                      <span className="text-gray-900">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-400">
              Select a submission to review fields & update workflow status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
