import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SearchAutocomplete } from '../components/SearchAutocomplete';
import { ScholarshipCard } from '../components/ScholarshipCard';

export function SearchPage() {
  const { scholarships, universities, categories, guides } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { scholarships: [], universities: [], categories: [], guides: [] };
    }

    return {
      scholarships: scholarships.filter((s) =>
        `${s.title} ${s.universityName} ${s.state} ${s.overview} ${s.fieldsOfStudy.join(' ')}`.toLowerCase().includes(q)
      ),
      universities: universities.filter((u) =>
        `${u.name} ${u.city} ${u.state} ${u.overview}`.toLowerCase().includes(q)
      ),
      categories: categories.filter((c) =>
        `${c.name} ${c.description}`.toLowerCase().includes(q)
      ),
      guides: guides.filter((g) =>
        `${g.title} ${g.excerpt} ${g.categoryLabel}`.toLowerCase().includes(q)
      ),
    };
  }, [query, scholarships, universities, categories, guides]);

  const totalCount =
    results.scholarships.length +
    results.universities.length +
    results.categories.length +
    results.guides.length;

  return (
    <>
      <SeoHead
        title={query ? `Search: ${query} | ScholarPath USA` : 'Search Scholarships | ScholarPath USA'}
        description="Search across U.S. university scholarships, funding categories, campus financial aid profiles, and editorial guides."
        canonicalPath="/search"
        noIndex
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <div>
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Search' }]} />
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-4">
            {query ? `Search Results for “${query}”` : 'Search ScholarPath USA'}
          </h1>
          <div className="max-w-2xl">
            <SearchAutocomplete
              initialQuery={query}
              onSubmitSearch={(newQ) => setSearchParams(newQ ? { q: newQ } : {})}
            />
          </div>
          {query && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 tabular-nums">
              Found {totalCount} matching {totalCount === 1 ? 'result' : 'results'} across scholarships, universities, categories, and guides.
            </p>
          )}
        </div>

        {results.categories.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
              Matching Funding Categories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/scholarships/${cat.slug}`}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-navy-700/50"
                >
                  <p className="font-serif font-semibold text-slate-900 dark:text-white">{cat.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {results.scholarships.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
              Matching Scholarships ({results.scholarships.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.scholarships.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))}
            </div>
          </section>
        )}

        {results.universities.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
              Matching Universities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.universities.map((u) => (
                <Link
                  key={u.slug}
                  to={`/university/${u.slug}`}
                  className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <p className="font-serif font-semibold text-slate-900 dark:text-white">{u.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {u.city}, {u.state} · Avg Aid {u.avgAidPackage}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {results.guides.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
              Matching Guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.guides.map((g) => (
                <Link
                  key={g.slug}
                  to={`/guides/${g.slug}`}
                  className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <p className="font-serif font-semibold text-slate-900 dark:text-white">{g.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {g.categoryLabel} · {g.readMinutes} min read
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {query && totalCount === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-3">
            <h2 className="text-lg font-serif font-semibold text-slate-900 dark:text-white">
              No results found for “{query}”
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Try searching by state (e.g., North Carolina, California), funding type (Full Tuition, Half Funded), or browse all scholarships.
            </p>
            <Link
              to="/scholarships"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold"
            >
              View All Scholarships
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
