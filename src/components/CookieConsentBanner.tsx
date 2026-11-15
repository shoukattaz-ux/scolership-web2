import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function CookieConsentBanner() {
  const { cookiePrefs, saveCookiePrefs, showCookieModal, setShowCookieModal } = useAppContext();
  const [analytics, setAnalytics] = useState(cookiePrefs?.analytics ?? false);
  const [advertising, setAdvertising] = useState(cookiePrefs?.advertising ?? false);

  const shouldShowBanner = !cookiePrefs && !showCookieModal;

  if (!shouldShowBanner && !showCookieModal) {
    return null;
  }

  return (
    <>
      {shouldShowBanner && (
        <aside
          role="dialog"
          aria-label="Cookie and Privacy Preferences"
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-lg z-50 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-lg p-5"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-navy-800 dark:text-gold-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-3">
              <div>
                <h2 className="text-sm font-sans font-semibold text-slate-900 dark:text-slate-100">
                  Your Privacy &amp; Cookie Choices
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  We use essential storage for saved scholarships and optional analytics/advertising cookies (supporting Google Consent Mode v2 for AdSense and Media.net). Read our{' '}
                  <Link to="/cookie-policy" className="underline underline-offset-2 hover:text-navy-800 dark:hover:text-gold-400">
                    Cookie Policy
                  </Link>
                  .
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => saveCookiePrefs({ necessary: true, analytics: true, advertising: true })}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-slate-950 dark:hover:bg-gold-400 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={() => saveCookiePrefs({ necessary: true, analytics: false, advertising: false })}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={() => setShowCookieModal(true)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:underline underline-offset-4 whitespace-nowrap cursor-pointer"
                >
                  Manage Preferences
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {showCookieModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h2 id="cookie-modal-title" className="text-lg font-serif font-semibold text-slate-900 dark:text-slate-50">
                Privacy &amp; Consent Settings
              </h2>
              <button
                type="button"
                onClick={() => setShowCookieModal(false)}
                aria-label="Close privacy settings"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Strictly Necessary</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Stores theme preference, saved scholarships, and comparison selections locally.
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 shrink-0">
                  Always Active
                </span>
              </div>

              <label className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-medium text-slate-900 dark:text-slate-100 block">Analytics (GA4)</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Helps measure directory performance and popular scholarship categories.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-navy-900 dark:accent-gold-500"
                />
              </label>

              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <span className="font-medium text-slate-900 dark:text-slate-100 block">Advertising Partners</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Enables Google AdSense and Media.net advertising cookies when ad slots are active.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={advertising}
                  onChange={(e) => setAdvertising(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-navy-900 dark:accent-gold-500"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => saveCookiePrefs({ necessary: true, analytics: false, advertising: false })}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Reject Optional
              </button>
              <button
                type="button"
                onClick={() => saveCookiePrefs({ necessary: true, analytics, advertising })}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-slate-950 dark:hover:bg-gold-400 cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
