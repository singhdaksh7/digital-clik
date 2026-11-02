import React, { useState, useEffect } from 'react';
import { getScheduledJobs, cancelScheduledJob } from '../api/admin';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Trash2, ArrowRight } from 'lucide-react';

export default function ScheduledJobsCMS({ onNavigateToPage }) {
  const [data, setData] = useState({ upcoming: [], executed: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await getScheduledJobs();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load scheduled jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelJob = async (id, action) => {
    if (!window.confirm('Cancel this scheduled release?')) return;
    try {
      const res = await cancelScheduledJob(id, action);
      if (res.success) {
        alert('Scheduled publication cancelled.');
        loadJobs();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel job');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Scheduled Releases & Publishing</h1>
        <p className="text-sm text-neutral-400">
          Automated cron-managed queue for publishing landing pages and campaign unpublishing.
        </p>
      </div>

      {/* Upcoming Releases */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
          <Calendar size={16} className="text-emerald-400" />
          <span>Upcoming Scheduled Publications ({data.upcoming?.length || 0})</span>
        </h2>

        {loading ? (
          <div className="py-16 text-center text-neutral-500">Loading schedule...</div>
        ) : !data.upcoming || data.upcoming.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-neutral-800 rounded-xl">
            <Clock size={32} className="mx-auto text-neutral-600 mb-2" />
            <h3 className="text-white font-medium text-sm">No scheduled publications pending</h3>
            <p className="text-xs text-neutral-500 mt-1">
              You can schedule pages to publish or unpublish automatically in the Page Settings sidebar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.upcoming.map(job => (
              <div
                key={job.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">{job.title}</h3>
                    <span className="font-mono text-xs text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded">
                      /{job.slug}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Scheduled
                    </span>
                  </div>

                  <div className="text-xs text-neutral-400 flex flex-wrap items-center gap-4 mt-2">
                    {job.scheduledPublishAt && (
                      <span className="text-emerald-300 font-medium">
                        🚀 Publish: {new Date(job.scheduledPublishAt).toLocaleString()}
                      </span>
                    )}
                    {job.scheduledUnpublishAt && (
                      <span className="text-amber-300 font-medium">
                        🛑 Unpublish: {new Date(job.scheduledUnpublishAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToPage?.(job.id)}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Edit Page
                  </button>

                  <button
                    onClick={() => handleCancelJob(job.id, 'both')}
                    className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800"
                    title="Cancel Schedule"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Published */}
      {data.executed && data.executed.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-neutral-800">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            Recently Executed ({data.executed.length})
          </h2>
          <div className="space-y-2">
            {data.executed.map(job => (
              <div
                key={job.id}
                className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">{job.title}</span>
                    <span className="text-neutral-500 font-mono ml-2">/{job.slug}</span>
                  </div>
                </div>
                <div className="text-neutral-500">
                  Published {new Date(job.publishedAt || job.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
