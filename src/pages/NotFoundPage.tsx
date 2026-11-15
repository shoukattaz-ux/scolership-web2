import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { SearchAutocomplete } from '../components/SearchAutocomplete';

export function NotFoundPage() {
  return (
    <>
      <SeoHead
        title="Page Not Found (404) | ScholarPath USA"
        description="The scholarship or page you requested could not be found. Search our U.S. university scholarship directory instead."
        noIndex
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center space-y-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-navy-800 dark:text-gold-400">
          Error 404
        </p>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 dark:text-white">
          We Could Not Find That Page
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          The scholarship URL may have moved or been updated for the 2026–2027 cycle. Use the search bar below or jump back to our main hubs.
        </p>

        <div className="max-w-xl mx-auto pt-2 text-left">
          <SearchAutocomplete />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold"
          >
            Back to Home
          </Link>
          <Link
            to="/scholarships"
            className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
          >
            Browse All Scholarships
          </Link>
          <Link
            to="/sitemap"
            className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
          >
            HTML Sitemap
          </Link>
        </div>
      </div>
    </>
  );
}
