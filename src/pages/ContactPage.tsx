import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs, buildBreadcrumbSchema } from '../components/Breadcrumbs';

export function ContactPage() {
  const { settings } = useAppContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Scholarship Listing Update');
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
        body: JSON.stringify({ name, email, topic, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', text: data.error || 'Could not send message.' });
      } else {
        setStatus({ type: 'success', text: `${data.message} (Ref: ${data.referenceId})` });
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch {
      setStatus({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Contact Us' }];

  return (
    <>
      <SeoHead
        title={`Contact Us | ${settings.general.brandName}`}
        description="Contact the ScholarPath USA editorial team regarding scholarship corrections, university directory listings, or student inquiries."
        canonicalPath="/contact"
        schemas={[buildBreadcrumbSchema(breadcrumbs, typeof window !== 'undefined' ? window.location.origin : '')]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
                Contact Our Editorial Desk
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Questions about a listed U.S. scholarship, deadline correction, or counselor partnership? Reach out below and we will reply by email.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 text-sm">
              {settings.general.contactEmail ? (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-navy-800 dark:text-gold-400 shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Email</p>
                    <a href={`mailto:${settings.general.contactEmail}`} className="text-navy-800 dark:text-gold-400 hover:underline">
                      {settings.general.contactEmail}
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-400">
                  Use the form to reach us. Messages go straight to the site team.
                </p>
              )}
              {settings.general.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-navy-800 dark:text-gold-400 shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Location</p>
                    <p className="text-slate-600 dark:text-slate-400">{settings.general.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jordan Taylor"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@example.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-topic" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Topic
              </label>
              <select
                id="contact-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                <option value="Scholarship Listing Update">Scholarship Listing Update</option>
                <option value="University Financial Aid Office">University Financial Aid Office</option>
                <option value="Student / Counselor Question">Student / Counselor Question</option>
                <option value="Privacy / Legal Inquiry">Privacy / Legal Inquiry</option>
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share details, university URLs, or questions..."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <button
              type="submit"
              disabled={status.type === 'loading'}
              className="px-6 py-3 rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-slate-950 dark:hover:bg-gold-400 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
            >
              {status.type === 'loading' ? 'Sending...' : 'Send Message'}
            </button>

            {status.type === 'success' && (
              <p role="status" className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{status.text}</span>
              </p>
            )}
            {status.type === 'error' && (
              <p role="alert" className="text-xs text-rose-700 dark:text-rose-400">
                {status.text}
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
