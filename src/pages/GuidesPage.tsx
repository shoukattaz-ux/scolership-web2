import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs, buildBreadcrumbSchema } from '../components/Breadcrumbs';
import { SafeImage } from '../components/SafeImage';

export function GuidesPage() {
  const { guides } = useAppContext();
  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Guides & Articles' }];

  return (
    <>
      <SeoHead
        title="Scholarship Guides, Essay Tips & FAFSA Help | ScholarPath USA"
        description="Read in-depth U.S. scholarship guides covering full-ride strategies, personal statement essays, FAFSA & CSS Profile steps, and STEM fellowships."
        canonicalPath="/guides"
        schemas={[buildBreadcrumbSchema(breadcrumbs, typeof window !== 'undefined' ? window.location.origin : '')]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />

        <div className="pb-8 border-b border-slate-200 dark:border-slate-800 mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-800 dark:text-gold-400 mb-2">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>Editorial Resource Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            U.S. Scholarship &amp; Financial Aid Guides
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Practical, research-backed guides written by former financial aid directors and admissions advisors to help families maximize merit and need-based university grants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {guides.map((guide: any) => (
            <article
              key={guide.slug}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col"
            >
              <Link to={`/guides/${guide.slug}`} className="aspect-[16/10] overflow-hidden block bg-slate-100 dark:bg-slate-800">
                <SafeImage
                  assetKey={guide.imageKey}
                  srcOverride={guide.customImageUrl}
                  className="w-full h-full object-cover"
                />
              </Link>
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 tabular-nums">
                    <span>{guide.categoryLabel}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{guide.readMinutes} min read</span>
                    <span aria-hidden="true"> · </span>
                    <span>Updated {guide.lastUpdated}</span>
                  </p>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white leading-snug">
                    <Link to={`/guides/${guide.slug}`} className="hover:text-navy-700 dark:hover:text-gold-400 transition-colors">
                      {guide.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    {guide.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="text-xs">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{guide.authorName}</p>
                    <p className="text-slate-500 dark:text-slate-400">{guide.authorRole}</p>
                  </div>
                  <Link
                    to={`/guides/${guide.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 dark:text-gold-400 hover:underline underline-offset-4 shrink-0"
                  >
                    <span>Read guide</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
