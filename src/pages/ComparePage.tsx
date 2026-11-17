import { Link } from 'react-router-dom';
import { Check, Minus, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs, buildBreadcrumbSchema } from '../components/Breadcrumbs';
import { CategoryTag } from '../components/CategoryTag';

export function ComparePage() {
  const { scholarships, compareIds, toggleCompare, removeFromCompare, clearCompare } = useAppContext();

  const selected = scholarships.filter((s) => compareIds.includes(s.id));
  const availableToAdd = scholarships.filter((s) => !compareIds.includes(s.id));
  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Compare Scholarships' }];

  return (
    <>
      <SeoHead
        title="Compare Scholarships Side by Side | ScholarPath USA"
        description="Compare up to 3 U.S. university scholarships side by side across tuition coverage, housing, stipends, GPA thresholds, and deadlines."
        canonicalPath="/compare"
        schemas={[buildBreadcrumbSchema(breadcrumbs, typeof window !== 'undefined' ? window.location.origin : '')]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-200 dark:border-slate-800 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
              Compare Scholarships Side by Side
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2">
              Evaluate up to 3 scholarships across funding value, living stipends, GPA requirements, and renewal terms.
            </p>
          </div>

          {selected.length > 0 && (
            <button
              type="button"
              onClick={clearCompare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer self-start"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear Comparison</span>
            </button>
          )}
        </div>

        {selected.length < 3 && (
          <div className="mb-8 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Add a scholarship to compare ({selected.length}/3 selected)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose from the directory below or click the compare icon on any scholarship card.
              </p>
            </div>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) toggleCompare(e.target.value);
              }}
              aria-label="Add scholarship to comparison"
              className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 max-w-xs"
            >
              <option value="">+ Select a scholarship...</option>
              {availableToAdd.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.universityName})
                </option>
              ))}
            </select>
          </div>
        )}

        {selected.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <h2 className="text-xl font-serif font-semibold text-slate-900 dark:text-white">
              No scholarships selected yet
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Use the dropdown above or browse the scholarship directory to pick up to 3 awards to compare.
            </p>
            <Link
              to="/scholarships"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold"
            >
              Browse Scholarships
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="p-5 w-48 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 align-top">
                    Comparison Criteria
                  </th>
                  {selected.map((s) => (
                    <th key={s.id} className="p-5 align-top border-l border-slate-100 dark:border-slate-800">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CategoryTag slug={s.category} compact />
                        <button
                          type="button"
                          onClick={() => removeFromCompare(s.id)}
                          aria-label={`Remove ${s.title}`}
                          className="text-xs text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <Link
                        to={`/scholarship/${s.slug}`}
                        className="text-base font-serif font-bold text-slate-900 dark:text-white hover:underline block"
                      >
                        {s.title}
                      </Link>
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400 block mt-1">
                        {s.universityName}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                <tr>
                  <td className="p-5 font-medium text-slate-700 dark:text-slate-300">Award Value</td>
                  {selected.map((s) => (
                    <td key={s.id} className="p-5 border-l border-slate-100 dark:border-slate-800 font-semibold text-navy-900 dark:text-gold-400 tabular-nums">
                      {s.amountDisplay}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-medium text-slate-700 dark:text-slate-300">Tuition Covered</td>
                  {selected.map((s) => (
                    <td key={s.id} className="p-5 border-l border-slate-100 dark:border-slate-800">
                      {s.coversTuition ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                          <Check className="w-4 h-4" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <Minus className="w-4 h-4" /> No
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-medium text-slate-700 dark:text-slate-300">Housing &amp; Meals</td>
                  {selected.map((s) => (
                    <td key={s.id} className="p-5 border-l border-slate-100 dark:border-slate-800">
                      {s.coversHousing ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                          <Check className="w-4 h-4" /> Included
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Minus className="w-4 h-4" /> Not included
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-medium text-slate-700 dark:text-slate-300">Living / Research Stipend</td>
                  {selected.map((s) => (
                    <td key={s.id} className="p-5 border-l border-slate-100 dark:border-slate-800">
                      {s.includesStipend ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                          <Check className="w-4 h-4" /> Included
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Minus className="w-4 h-4" /> None
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-medium text-slate-700 dark:text-slate-300">Minimum GPA</td>
                  {selected.map((s) => (
                    <td key={s.id} className="p-5 border-l border-slate-100 dark:border-slate-800 tabular-nums">
                      {s.gpaMin > 0 ? s.gpaMin.toFixed(2) : 'Not stated'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-medium text-slate-700 dark:text-slate-300">Deadline</td>
                  {selected.map((s) => (
                    <td key={s.id} className="p-5 border-l border-slate-100 dark:border-slate-800 tabular-nums">
                      {s.deadlineLabel}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-medium text-slate-700 dark:text-slate-300">Renewable Terms</td>
                  {selected.map((s) => (
                    <td key={s.id} className="p-5 border-l border-slate-100 dark:border-slate-800 text-xs">
                      {s.renewable}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-medium text-slate-700 dark:text-slate-300">Degree Levels</td>
                  {selected.map((s) => (
                    <td key={s.id} className="p-5 border-l border-slate-100 dark:border-slate-800 text-xs">
                      {s.degreeLevels.join(', ')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-medium text-slate-700 dark:text-slate-300">Action</td>
                  {selected.map((s) => (
                    <td key={s.id} className="p-5 border-l border-slate-100 dark:border-slate-800">
                      <Link
                        to={`/scholarship/${s.slug}`}
                        className="inline-flex items-center px-3.5 py-2 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold"
                      >
                        Full Requirements
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
