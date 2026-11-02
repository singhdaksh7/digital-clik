import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Check, Settings, ChevronRight } from 'lucide-react';

const STORAGE_KEY = 'dc_cookie_consent_v1';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Wait 1s after load before showing banner
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(saved);
        setAnalyticsEnabled(parsed.analytics !== false);
        setMarketingEnabled(parsed.marketing === true);
      }
    } catch (e) {
      // quiet fallback
    }
  }, []);

  const savePreferences = (analytics, marketing) => {
    try {
      const consent = {
        necessary: true,
        analytics,
        marketing,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
      window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: consent }));
    } catch (e) {
      console.error(e);
    }
    setVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => savePreferences(true, true);
  const handleRejectNonEssential = () => savePreferences(false, false);
  const handleSaveCustom = () => savePreferences(analyticsEnabled, marketingEnabled);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md z-50 animate-fade-in">
      <div className="bg-[#0C101A] border border-neutral-800/90 rounded-2xl shadow-2xl p-5 text-white backdrop-blur-xl">
        {!showPreferences ? (
          /* Main Notice */
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm tracking-tight">Privacy & Cookie Preferences</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  We use cookies and telemetry strictly to improve site responsiveness, evaluate audience growth, and understand user journeys. No intrusive third-party data broker tracking.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 text-xs">
              <button
                onClick={() => setShowPreferences(true)}
                className="text-neutral-400 hover:text-white underline text-left sm:text-center text-[11px] py-1"
              >
                Customize Settings
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRejectNonEssential}
                  className="flex-1 sm:flex-none px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium rounded-xl border border-neutral-800 transition"
                >
                  Decline
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition shadow-lg shadow-purple-600/20"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Custom Preferences Modal */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="font-bold text-sm">Cookie Settings</h3>
              <button onClick={() => setShowPreferences(false)} className="text-neutral-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Essential */}
              <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Essential Cookies</div>
                  <div className="text-[11px] text-neutral-400">Strictly necessary for security, routing & sessions.</div>
                </div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Always Active
                </span>
              </div>

              {/* Analytics */}
              <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Performance & Analytics</div>
                  <div className="text-[11px] text-neutral-400">Aggregated telemetry to measure page speed and visits.</div>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={e => setAnalyticsEnabled(e.target.checked)}
                  className="rounded border-neutral-700 w-4 h-4 text-purple-600 focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Marketing */}
              <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Marketing & Retargeting</div>
                  <div className="text-[11px] text-neutral-400">Campaign attribution for advertising channels.</div>
                </div>
                <input
                  type="checkbox"
                  checked={marketingEnabled}
                  onChange={e => setMarketingEnabled(e.target.checked)}
                  className="rounded border-neutral-700 w-4 h-4 text-purple-600 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-3 py-1.5 bg-neutral-900 text-neutral-400 hover:text-white rounded-lg text-xs"
              >
                Back
              </button>
              <button
                onClick={handleSaveCustom}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

