import React, { useState, useEffect } from 'react';
import {
  getReviewQueue,
  approvePage,
  rejectPage
} from '../api/admin';
import {
  CheckCircle, XCircle, Clock, AlertTriangle, Eye,
  FileText, User, MessageSquare, ArrowRight, Check
} from 'lucide-react';

export default function ReviewQueueCMS({ onNavigateToPage }) {
  const [queue, setQueue] = useState({ pending: [], recent: [] });
  const [loading, setLoading] = useState(true);
  const [rejectModalPage, setRejectModalPage] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await getReviewQueue();
      if (res.success) {
        setQueue(res.data);
      }
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (pageId, autoPublish = false) => {
    if (!window.confirm(autoPublish ? 'Approve and publish page immediately?' : 'Approve page into draft state?')) return;
    setProcessing(true);
    try {
      const res = await approvePage(pageId, autoPublish);
      if (res.success) {
        alert(autoPublish ? 'Page approved and published!' : 'Page approved.');
        loadQueue();
      }
    } catch (err) {
      alert(err.message || 'Approval failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalPage || !rejectReason.trim()) {
      alert('Please provide feedback or a reason for requesting changes.');
      return;
    }
    setProcessing(true);
    try {
      const res = await rejectPage(rejectModalPage.id, rejectReason.trim());
      if (res.success) {
        alert('Changes requested. Author notified.');
        setRejectModalPage(null);
        setRejectReason('');
        loadQueue();
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Editorial Review Queue</h1>
        <p className="text-sm text-neutral-400">
          Enforce quality gates and editorial governance before content is pushed to live production.
        </p>
      </div>

      {/* Pending Reviews */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
          <Clock size={16} className="text-amber-400" />
          <span>Awaiting Review ({queue.pending?.length || 0})</span>
        </h2>

        {loading ? (
          <div className="py-16 text-center text-neutral-500">Loading review queue...</div>
        ) : !queue.pending || queue.pending.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-neutral-800 rounded-xl">
            <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
            <h3 className="text-white font-medium text-sm">Review queue is clear</h3>
            <p className="text-xs text-neutral-500 mt-1">No articles or landing pages are currently awaiting editorial sign-off.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.pending.map(page => (
              <div
                key={page.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">{page.title}</h3>
                    <span className="font-mono text-xs bg-neutral-950 px-2 py-0.5 rounded text-neutral-400">
                      /{page.slug}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      Pending Review
                    </span>
                  </div>

                  <div className="text-xs text-neutral-400 flex flex-wrap items-center gap-4 pt-1">
                    <span className="flex items-center gap-1">
                      <User size={13} className="text-neutral-500" />
                      Submitted by: {page.submittedBy?.name || page.submittedBy?.email || 'Contributor'}
                    </span>
                    <span>
                      {new Date(page.submittedAt || page.updatedAt).toLocaleString()}
                    </span>
                  </div>

                  {page.reviewNote && (
                    <div className="mt-2 text-xs text-neutral-300 bg-neutral-950 border border-neutral-800/80 rounded p-2.5 flex items-start gap-2">
                      <MessageSquare size={14} className="text-neutral-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-neutral-400 block mb-0.5">Contributor Note:</strong>
                        {page.reviewNote}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onNavigateToPage?.(page.id)}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Eye size={13} />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => setRejectModalPage(page)}
                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <XCircle size={13} />
                    <span>Request Changes</span>
                  </button>

                  <button
                    onClick={() => handleApprove(page.id, true)}
                    disabled={processing}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Check size={13} />
                    <span>Approve & Publish</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject / Request Changes Modal */}
      {rejectModalPage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Request Changes</h3>
            <p className="text-xs text-neutral-400">
              Provide feedback for <strong className="text-white">{rejectModalPage.title}</strong> so the author knows what needs adjustment before approval.
            </p>

            <div>
              <label className="text-xs text-neutral-300 block mb-1">Feedback / Requested Edits</label>
              <textarea
                rows={4}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. Please update hero headline and add meta description..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalPage(null)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={processing || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {processing ? 'Submitting...' : 'Send Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

