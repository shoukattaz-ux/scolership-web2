import { Link, useParams } from 'react-router-dom';
import { ExternalLink, MapPin } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs, buildBreadcrumbSchema } from '../components/Breadcrumbs';
import { ScholarshipCard } from '../components/ScholarshipCard';
import { NotFoundPage } from './NotFoundPage';

export function UniversityDetailPage() {
  const { universities, scholarships, siteDataLoaded } = useAppContext();
  const { slug } = useParams<{ slug: string }>();
  const university = slug ? universities.find((u) => u.slug === slug) : undefined;

  if (!university) {
    return siteDataLoaded ? <NotFoundPage /> : <div className="min-h-[60vh]" aria-busy="true" />;
  }

  const awards = scholarships.filter((s) => s.universitySlug === university.slug);
  const breadcrumbs = [
    { label: 'Home', to: '/' },
    { label: 'Universities', to: '/universities' },
    { label: university.shortName },
  ];

  return (
    <>
      <SeoHead
        title={`${university.shortName} Scholarships & Aid | ScholarPath USA`}
        description={`Explore ${awards.length} scholarships and institutional financial aid policies at ${university.name} in ${university.city}, ${university.stateCode}.`}
        canonicalPath={`/university/${university.slug}`}
        noIndex={university.isSampleData}
        schemas={[buildBreadcrumbSchema(breadcrumbs, typeof window !== 'undefined' ? window.location.origin : '')]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />

        <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-navy-900 text-gold-400 font-serif font-bold text-lg shrink-0">
                {university.initials}
              </span>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{university.institutionType}</p>
                <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
                  {university.name}
                </h1>
                <p className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 mt-1">
                  <MapPin className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  <span>
                    {university.city}, {university.state}
                  </span>
                </p>
              </div>
            </div>

            <a
              href={university.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-slate-950 dark:hover:bg-gold-400 text-xs font-semibold transition-colors whitespace-nowrap self-start"
            >
              <span>Official University Site</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mt-6 leading-relaxed max-w-3xl">
            {university.overview}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 tabular-nums">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Avg Aid Package</span>
              <span className="text-base font-semibold text-navy-900 dark:text-gold-400 mt-0.5 block">
                {university.avgAidPackage}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Acceptance Rate</span>
              <span className="text-base font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {university.acceptanceRate}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Undergrad Enrollment</span>
              <span className="text-base font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {university.undergradEnrollment}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Directory Scholarships</span>
              <span className="text-base font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {awards.length} listed
              </span>
            </div>
          </div>

          <p className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
            {university.financialAidPolicy}
          </p>
        </header>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
              Scholarships at {university.shortName}
            </h2>
            <Link to="/scholarships" className="text-xs font-semibold text-navy-900 dark:text-gold-400 hover:underline">
              Compare with all U.S. awards →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {awards.map((s) => (
              <ScholarshipCard key={s.id} scholarship={s} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
