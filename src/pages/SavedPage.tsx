import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ScholarshipCard } from '../components/ScholarshipCard';

export function SavedPage() {
  const { savedIds, scholarships } = useAppContext();
  const savedScholarships = scholarships.filter((s) => savedIds.includes(s.id));

  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Saved Scholarships' }];

  return (
    <>
      <SeoHead
        title="Saved Scholarships | ScholarPath USA"
        description="Review your bookmarked U.S. university scholarships and upcoming application deadlines."
        canonicalPath="/saved"
        noIndex
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />

        <div className="pb-8 border-b border-slate-200 dark:border-slate-800 mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            Saved Scholarships ({savedScholarships.length})
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Bookmarks are stored locally in your browser so you can track deadlines without creating an account.
          </p>
        </div>

        {savedScholarships.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <Bookmark className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
            <h2 className="text-xl font-serif font-semibold text-slate-900 dark:text-white">
              No saved scholarships yet
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Click the bookmark icon on any scholarship listing to build your personal application shortlist.
            </p>
            <Link
              to="/scholarships"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold"
            >
              Explore Scholarships
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedScholarships.map((s) => (
              <ScholarshipCard key={s.id} scholarship={s} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
