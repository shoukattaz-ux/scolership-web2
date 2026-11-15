import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';

export function AdminLoginPage() {
  const { authUser, authLoading, login, settings } = useAppContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && authUser) {
      navigate('/admin', { replace: true });
    }
  }, [authUser, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email.trim(), password);
    setSubmitting(false);
    if (result.ok) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.error || 'Invalid credentials.');
    }
  };

  return (
    <>
      <SeoHead
        title={`Admin Sign In | ${settings.general.brandName}`}
        description="Authorized editorial and administrative sign in for ScholarPath USA CMS."
        canonicalPath="/admin/login"
        noIndex
      />

      <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-800 dark:text-gold-400">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>CMS Administration</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
              Sign In to {settings.general.shortName}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Manage U.S. scholarship listings, editorial guides, AdSense/Media.net ad slots, SEO metadata, and legal pages.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourdomain.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 dark:focus-visible:ring-gold-400"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 dark:focus-visible:ring-gold-400"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-2"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-5 py-2.5 rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-slate-950 dark:hover:bg-gold-400 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Verifying session...' : 'Sign In'}
            </button>
          </form>

          <p className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            Authorized site staff only. Accounts are created by the site administrator.
          </p>
        </div>
      </div>
    </>
  );
}
