import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Bell,
  Bookmark,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Scale,
  Share2,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs, buildBreadcrumbSchema } from '../components/Breadcrumbs';
import { CategoryTag } from '../components/CategoryTag';
import { DeadlineCountdown } from '../components/DeadlineCountdown';
import { ScholarshipCard } from '../components/ScholarshipCard';
import { AdSlot } from '../components/AdSlot';
import { NotFoundPage } from './NotFoundPage';

export function ScholarshipDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { scholarships, universities, categories, isSaved, toggleSaved, isCompared, toggleCompare, siteDataLoaded } =
    useAppContext();

  const scholarship: any = slug ? scholarships.find((s) => s.slug === slug) : undefined;

  const [copied, setCopied] = useState(false);
  const [compareLimitMsg, setCompareLimitMsg] = useState(false);

  if (!scholarship) {
    return siteDataLoaded ? <NotFoundPage /> : <div className="min-h-[60vh]" aria-busy="true" />;
  }

  const university = universities.find((u) => u.slug === scholarship.universitySlug);
  const category = categories.find((c) => c.slug === scholarship.category);
  const saved = isSaved(scholarship.id);
  const compared = isCompared(scholarship.id);

  const related = scholarships
    .filter(
      (s) =>
        s.id !== scholarship.id &&
        (s.category === scholarship.category || s.universitySlug === scholarship.universitySlug)
    )
    .slice(0, 3);

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCompare = () => {
    const res = toggleCompare(scholarship.id);
    if (res.limitReached) {
      setCompareLimitMsg(true);
      setTimeout(() => setCompareLimitMsg(false), 3000);
    }
  };

  const breadcrumbs = [
    { label: 'Home', to: '/' },
    { label: 'Scholarships', to: '/scholarships' },
    ...(category ? [{ label: category.shortName, to: `/scholarships/${category.slug}` }] : []),
    { label: scholarship.title },
  ];

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const programSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: scholarship.title,
    description: scholarship.overview,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: scholarship.universityName,
      url: scholarship.officialUrl,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const faqSchema =
    scholarship.faqs && scholarship.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: scholarship.faqs.map((f: any) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        }
      : null;

  const schemas = [
    buildBreadcrumbSchema(breadcrumbs, origin),
    programSchema,
    ...(faqSchema ? [faqSchema] : []),
  ];

  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const shareTitle = encodeURIComponent(scholarship.title);

  return (
    <>
      <SeoHead
        title={scholarship.seoTitle || `${scholarship.title} | ScholarPath USA`}
        description={
          scholarship.seoDescription ||
          `${scholarship.universityName} (${scholarship.state}) – ${scholarship.amountDisplay}. Eligibility, required documents, deadline, and application steps.`
        }
        canonicalPath={`/scholarship/${scholarship.slug}`}
        noIndex={scholarship.isSampleData}
        schemas={schemas}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />

        {scholarship.isSampleData && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
            <strong>Sample Directory Listing:</strong> Figures, GPA thresholds, and 2026–2027 dates below are sample educational profiles. Always confirm current award terms on{' '}
            <a
              href={scholarship.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              {scholarship.universityName}’s official website
            </a>
            .
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-navy-900 text-gold-400 font-serif font-bold text-base shrink-0">
                    {university?.initials || scholarship.stateCode}
                  </span>
                  <div>
                    {university ? (
                      <Link
                        to={`/university/${scholarship.universitySlug}`}
                        className="text-sm font-semibold text-navy-900 dark:text-gold-400 hover:underline underline-offset-4"
                      >
                        {scholarship.universityName}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-navy-900 dark:text-gold-400">{scholarship.universityName}</span>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {university ? `${university.city}, ${university.state}` : scholarship.state}
                      <span aria-hidden="true"> · </span>
                      <span>Updated {scholarship.lastUpdated}</span>
                    </p>
                  </div>
                </div>
                <CategoryTag slug={scholarship.category} />
              </div>

              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white leading-tight">
                {scholarship.title}
              </h1>

              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                {scholarship.overview}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Award Value</span>
                  <span className="text-base font-semibold text-navy-900 dark:text-gold-400 tabular-nums mt-0.5 block">
                    {scholarship.amountDisplay}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Application Deadline</span>
                  <div className="mt-0.5">
                    <DeadlineCountdown
                      deadlineISO={scholarship.deadlineISO}
                      deadlineLabel={scholarship.deadlineLabel}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Minimum GPA &amp; Renewal</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5 block">
                    {scholarship.gpaMin > 0 ? `${scholarship.gpaMin.toFixed(2)} GPA` : 'No GPA minimum stated'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{scholarship.renewable}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={scholarship.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-slate-950 dark:hover:bg-gold-400 text-sm font-semibold transition-colors"
                >
                  <span>Visit Official Page</span>
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => toggleSaved(scholarship.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                    saved
                      ? 'bg-navy-900 text-white border-navy-900 dark:bg-gold-500 dark:text-slate-950 dark:border-gold-500'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                  <span>{saved ? 'Saved' : 'Save Award'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCompare}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                    compared
                      ? 'bg-gold-600 text-white border-gold-600 dark:bg-gold-400 dark:text-slate-950 dark:border-gold-400'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>{compared ? 'Added to Compare' : 'Compare'}</span>
                </button>
              </div>
              {compareLimitMsg && (
                <p role="status" className="text-xs text-amber-800 dark:text-amber-300">
                  Comparison tray is full (maximum 3 scholarships). Visit the Compare page to adjust selections.
                </p>
              )}
            </header>

            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-4">
                What This Scholarship Covers
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{scholarship.coverageSummary}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="block text-slate-500 dark:text-slate-400">Tuition</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {scholarship.coversTuition ? 'Included' : 'Not Included'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="block text-slate-500 dark:text-slate-400">Housing &amp; Meals</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {scholarship.coversHousing ? 'Included' : 'Not Included'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="block text-slate-500 dark:text-slate-400">Books / Supplies</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {scholarship.coversBooks ? 'Included' : 'Not Included'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="block text-slate-500 dark:text-slate-400">Living / Research Stipend</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {scholarship.includesStipend ? 'Included' : 'Not Included'}
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-3">
                  Eligibility Requirements
                </h2>
                <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                  {scholarship.eligibility.map((item: string) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-3">
                  Required Application Documents
                </h2>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
                  {scholarship.requiredDocuments.map((doc: string) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-3">
                  Step-by-Step Application Process
                </h2>
                <ol className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  {scholarship.applicationSteps.map((step: string, i: number) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold shrink-0 tabular-nums">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <AdSlot position="inContent" suppress={scholarship.isSampleData} />

            {scholarship.faqs && scholarship.faqs.length > 0 && (
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-4">
                  Scholarship FAQs
                </h2>
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {scholarship.faqs.map((faq: any) => (
                    <details key={faq.question} className="py-3.5 group" open>
                      <summary className="font-medium text-sm text-slate-900 dark:text-slate-100 cursor-pointer list-none flex items-center justify-between gap-4">
                        <span>{faq.question}</span>
                        <span className="text-slate-400 group-open:rotate-45 transition-transform">+</span>
                      </summary>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
              <h2 className="text-base font-serif font-bold text-slate-900 dark:text-white">
                Program Scope
              </h2>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Degree Levels</span>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {scholarship.degreeLevels.join(' · ')}
                </p>
              </div>
              {scholarship.fieldsOfStudy.length > 0 && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">Fields of Study</span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {scholarship.fieldsOfStudy.join(' · ')}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-navy-800 dark:text-gold-400" aria-hidden="true" />
                <h2 className="text-base font-serif font-bold text-slate-900 dark:text-white">
                  Share Scholarship
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Share on X
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  LinkedIn
                </a>
                <a
                  href={`mailto:?subject=${shareTitle}&body=${shareUrl}`}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Email
                </a>
              </div>
            </div>

            <AdSlot position="sidebar" suppress={scholarship.isSampleData} />
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6">
              Related U.S. University Scholarships
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((item) => (
                <ScholarshipCard key={item.id} scholarship={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
