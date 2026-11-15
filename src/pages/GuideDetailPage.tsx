import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, UserCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs, buildBreadcrumbSchema } from '../components/Breadcrumbs';
import { SafeImage } from '../components/SafeImage';
import { AdSlot } from '../components/AdSlot';
import { NotFoundPage } from './NotFoundPage';

export function GuideDetailPage() {
  const { guides, scholarships, settings } = useAppContext();
  const { slug } = useParams<{ slug: string }>();
  const guide: any = slug ? guides.find((g) => g.slug === slug) : undefined;

  if (!guide) {
    return <NotFoundPage />;
  }

  const breadcrumbs = [
    { label: 'Home', to: '/' },
    { label: 'Guides', to: '/guides' },
    { label: guide.title },
  ];

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.seoDescription,
    datePublished: guide.publishedDate,
    dateModified: guide.lastUpdated,
    author: {
      '@type': guide.authorName === 'ScholarPath USA Editorial' ? 'Organization' : 'Person',
      name: guide.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: settings.general.brandName,
    },
  };

  const faqSchema =
    guide.faqs && guide.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: guide.faqs.map((f: any) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        }
      : null;

  const otherGuides = guides.filter((g) => g.slug !== guide.slug).slice(0, 2);

  return (
    <>
      <SeoHead
        title={guide.seoTitle}
        description={guide.seoDescription}
        canonicalPath={`/guides/${guide.slug}`}
        ogType="article"
        schemas={[
          buildBreadcrumbSchema(breadcrumbs, origin),
          articleSchema,
          ...(faqSchema ? [faqSchema] : []),
        ]}
      />

      <article className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <header className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-navy-800 dark:text-gold-400">
                {guide.categoryLabel}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-serif font-bold text-slate-900 dark:text-white leading-tight">
                {guide.title}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {guide.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums border-y border-slate-200 dark:border-slate-800 py-3">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                  <UserCheck className="w-3.5 h-3.5 text-navy-700 dark:text-gold-400" aria-hidden="true" />
                  {guide.authorName}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 font-medium ${
                    guide.reviewStatus === 'reviewed' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {guide.reviewStatus === 'reviewed'
                    ? `Reviewed${guide.reviewedAt ? ` ${guide.reviewedAt.slice(0, 10)}` : ''}`
                    : 'Editorial review pending'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  Last updated {guide.lastUpdated}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {guide.readMinutes} min read
                </span>
              </div>
            </header>

            <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <SafeImage
                assetKey={guide.imageKey}
                srcOverride={guide.customImageUrl}
                className="w-full h-full object-cover"
              />
            </div>

            {guide.sections && guide.sections.length > 0 && (
              <nav
                aria-label="Table of Contents"
                className="bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
              >
                <h2 className="text-sm font-sans font-semibold text-slate-900 dark:text-white mb-3">
                  In This Guide
                </h2>
                <ol className="space-y-1.5 text-sm">
                  {guide.sections.map((sec: any) => (
                    <li key={sec.id}>
                      <a
                        href={`#${sec.id}`}
                        className="text-navy-800 dark:text-gold-400 hover:underline underline-offset-4"
                      >
                        {sec.heading}
                      </a>
                    </li>
                  ))}
                  {guide.faqs && guide.faqs.length > 0 && (
                    <li>
                      <a
                        href="#guide-faq"
                        className="text-navy-800 dark:text-gold-400 hover:underline underline-offset-4"
                      >
                        Frequently Asked Questions
                      </a>
                    </li>
                  )}
                </ol>
              </nav>
            )}

            <div className="max-w-prose space-y-10">
              {guide.sections.map((sec: any, idx: number) => (
                <section key={sec.id} id={sec.id} className="scroll-mt-24 space-y-4">
                  <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
                    {sec.heading}
                  </h2>
                  {sec.paragraphs?.map((p: string, pIdx: number) => (
                    <p
                      key={pIdx}
                      className="text-[15px] sm:text-base text-slate-700 dark:text-slate-300 leading-[1.78]"
                    >
                      {p}
                    </p>
                  ))}
                  {sec.bullets && (
                    <ul className="space-y-2 pl-5 list-disc text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      {sec.bullets.map((b: string) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  )}
                  {sec.relatedScholarshipSlugs && sec.relatedScholarshipSlugs.length > 0 && (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-navy-800 dark:text-gold-400">
                        Related Scholarships Mentioned
                      </p>
                      <ul className="space-y-1.5 text-sm">
                        {sec.relatedScholarshipSlugs.map((sSlug: string) => {
                          const sch = scholarships.find((item) => item.slug === sSlug);
                          if (!sch) return null;
                          return (
                            <li key={sch.id}>
                              <Link
                                to={`/scholarship/${sch.slug}`}
                                className="font-medium text-navy-900 dark:text-slate-100 hover:text-navy-700 dark:hover:text-gold-400 underline underline-offset-4"
                              >
                                {sch.title}
                              </Link>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {' '}
                                — {sch.universityName} ({sch.amountDisplay})
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {idx === 1 && <AdSlot position="inContent" suppress={guide.reviewStatus !== 'reviewed'} />}
                </section>
              ))}

              {guide.faqs && guide.faqs.length > 0 && (
                <section id="guide-faq" className="scroll-mt-24 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4">
                    Frequently Asked Questions
                  </h2>
                  <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
                    {guide.faqs.map((faq: any) => (
                      <details key={faq.question} className="py-4" open>
                        <summary className="font-medium text-sm sm:text-base text-slate-900 dark:text-slate-100 cursor-pointer list-none">
                          {faq.question}
                        </summary>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {guide.sources && guide.sources.length > 0 && (
                <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">Sources</h2>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {guide.sources.map((src: { label: string; url: string }) => (
                      <li key={src.url}>
                        <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline text-navy-800 dark:text-gold-400">
                          {src.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-navy-800 dark:text-gold-400">
                  About the Author
                </p>
                <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                  {guide.authorName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{guide.authorRole}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {guide.authorBio}
                </p>
              </section>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-navy-900 text-white rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-serif font-bold">Find Matching Scholarships</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Answer 5 quick questions about your GPA, degree level, and funding goals to discover matching U.S. awards.
              </p>
              <Link
                to="/quiz"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-gold-500 text-slate-950 hover:bg-gold-400 text-xs font-semibold transition-colors"
              >
                Launch Eligibility Quiz
              </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-serif font-bold text-slate-900 dark:text-white">
                More Editorial Guides
              </h2>
              <ul className="space-y-4">
                {otherGuides.map((og) => (
                  <li key={og.slug} className="pb-4 border-b last:border-b-0 last:pb-0 border-slate-100 dark:border-slate-800">
                    <Link
                      to={`/guides/${og.slug}`}
                      className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-navy-700 dark:hover:text-gold-400 block"
                    >
                      {og.title}
                    </Link>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                      {og.readMinutes} min read · Updated {og.lastUpdated}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <AdSlot position="sidebar" suppress={guide.reviewStatus !== 'reviewed'} />
          </aside>
        </div>
      </article>
    </>
  );
}
