import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs, buildBreadcrumbSchema } from '../components/Breadcrumbs';

export function AdvertisePage() {
  const { settings } = useAppContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; text: string }>({
    type: 'idle',
    text: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', text: '' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          topic: 'Advertising / Sponsorship Inquiry',
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', text: data.error || 'Unable to submit inquiry.' });
      } else {
        setStatus({ type: 'success', text: data.message });
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch {
      setStatus({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Advertise With Us' }];

  return (
    <>
      <SeoHead
        title={`Advertise With Us | ${settings.general.brandName}`}
        description="Partner with ScholarPath USA to reach U.S. high school seniors, university applicants, parents, and school counselors through brand-safe placements."
        canonicalPath="/advertise"
        schemas={[buildBreadcrumbSchema(breadcrumbs, typeof window !== 'undefined' ? window.location.origin : '')]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <Breadcrumbs items={breadcrumbs} />

        <header className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            Advertise &amp; Partner With {settings.general.brandName}
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            Connect accredited higher education institutions, test-prep providers, and student financial literacy partners with high-intent U.S. college applicants and families.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
              Brand-Safe Editorial Context
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every placement sits alongside curated U.S. scholarship directories, FAFSA tutorials, and university aid guides with zero deceptive popups.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
              CLS-Safe Reserved Ad Slots
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Designated header leaderboard, in-content responsive, sidebar rectangle, and footer placements are reserved with fixed heights so pages do not shift while ads load. All ads are labeled "Advertisement".
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
              Strict Student Trust Standards
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We never accept predatory loan offers, pay-to-apply scholarship scams, or deceptive "guaranteed admission" advertisements.
            </p>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-2xl">
          <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-2">
            Request Partnership Information
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            {settings.general.advertisingEmail ? (
              <>
                Direct inquiries:{' '}
                <a href={`mailto:${settings.general.advertisingEmail}`} className="underline text-navy-800 dark:text-gold-400">
                  {settings.general.advertisingEmail}
                </a>
              </>
            ) : (
              'Send your inquiry using the form below.'
            )}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name / Organization"
                aria-label="Your Name or Organization"
                className="px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work Email"
                aria-label="Work Email"
                className="px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your university program, scholarship announcement, or campaign timeline..."
              aria-label="Campaign details"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
            <button
              type="submit"
              disabled={status.type === 'loading'}
              className="px-5 py-2.5 rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer"
            >
              {status.type === 'loading' ? 'Submitting...' : 'Submit Inquiry'}
            </button>
            {status.type === 'success' && (
              <p role="status" className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>{status.text}</span>
              </p>
            )}
            {status.type === 'error' && (
              <p role="alert" className="text-xs text-rose-700 dark:text-rose-400">
                {status.text}
              </p>
            )}
          </form>
        </section>
      </div>
    </>
  );
}
