import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs, buildBreadcrumbSchema } from '../components/Breadcrumbs';

export function UniversitiesPage() {
  const { universities, scholarships } = useAppContext();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return universities.filter((u) => {
      if (typeFilter !== 'all' && u.institutionType !== typeFilter) return false;
      if (q && !`${u.name} ${u.city} ${u.state}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [universities, query, typeFilter]);

  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Universities' }];

  return (
    <>
      <SeoHead
        title="U.S. Universities With Scholarships | ScholarPath USA"
        description="Browse American public and private universities offering full-ride, full-tuition, need-based, and STEM institutional scholarships."
        canonicalPath="/universities"
        schemas={[buildBreadcrumbSchema(breadcrumbs, typeof window !== 'undefined' ? window.location.origin : '')]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />

        <div className="pb-8 border-b border-slate-200 dark:border-slate-800 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
              U.S. Universities Directory
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
              Compare institutional aid policies, average grant packages, and available scholarships across U.S. campuses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter university or state..."
              aria-label="Filter universities"
              className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by institution type"
              className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="all">All Institution Types</option>
              <option value="Public Research">Public Research</option>
              <option value="Private Research">Private Research</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((uni) => {
            const count = scholarships.filter((s) => s.universitySlug === uni.slug).length;
            return (
              <article
                key={uni.slug}
                className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-navy-900 text-gold-400 font-serif font-bold text-sm">
                      {uni.initials}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{uni.institutionType}</span>
                  </div>
                  <h2 className="text-xl font-serif font-semibold text-slate-900 dark:text-white">
                    <Link to={`/university/${uni.slug}`} className="hover:text-navy-700 dark:hover:text-gold-400">
                      {uni.name}
                    </Link>
                  </h2>
                  <p className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {uni.city}, {uni.state}
                    </span>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    {uni.overview}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs tabular-nums">
                    <span className="text-slate-500 dark:text-slate-400">Avg Aid: {uni.avgAidPackage}</span>
                    <span className="text-slate-500 dark:text-slate-400">Accepts: {uni.acceptanceRate}</span>
                  </div>
                  <Link
                    to={`/university/${uni.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 dark:text-gold-400 hover:underline underline-offset-4"
                  >
                    <span>Explore {count} listed {count === 1 ? 'scholarship' : 'scholarships'}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
