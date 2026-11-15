import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Scale, ArrowUpRight } from 'lucide-react';
import { Scholarship } from '../types/scholarship';
import { useAppContext } from '../context/AppContext';
import { CategoryTag } from './CategoryTag';
import { DeadlineCountdown } from './DeadlineCountdown';

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

export function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const { isSaved, toggleSaved, isCompared, toggleCompare } = useAppContext();
  const [limitNotice, setLimitNotice] = useState(false);

  const saved = isSaved(scholarship.id);
  const compared = isCompared(scholarship.id);

  const handleCompareClick = () => {
    const res = toggleCompare(scholarship.id);
    if (res.limitReached) {
      setLimitNotice(true);
      setTimeout(() => setLimitNotice(false), 2600);
    }
  };

  return (
    <article className="group flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors duration-150 hover:border-navy-700/40 dark:hover:border-gold-400/50">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <CategoryTag slug={scholarship.category} compact />
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => toggleSaved(scholarship.id)}
              aria-label={saved ? `Remove ${scholarship.title} from saved scholarships` : `Save ${scholarship.title}`}
              aria-pressed={saved}
              className={`p-2 rounded-lg border transition-colors duration-150 cursor-pointer ${
                saved
                  ? 'bg-navy-900 text-white border-navy-900 dark:bg-gold-500 dark:text-slate-950 dark:border-gold-500'
                  : 'bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
              title={saved ? 'Saved' : 'Save scholarship'}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleCompareClick}
              aria-label={compared ? `Remove ${scholarship.title} from comparison` : `Add ${scholarship.title} to comparison`}
              aria-pressed={compared}
              className={`p-2 rounded-lg border transition-colors duration-150 cursor-pointer ${
                compared
                  ? 'bg-gold-600 text-white border-gold-600 dark:bg-gold-400 dark:text-slate-950 dark:border-gold-400'
                  : 'bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
              title={compared ? 'In comparison' : 'Compare (up to 3)'}
            >
              <Scale className="w-4 h-4" />
            </button>
          </div>
        </div>

        {limitNotice && (
          <p role="status" className="text-xs text-amber-800 dark:text-amber-300 mb-2">
            Comparison tray is full (max 3 scholarships). Remove one to add another.
          </p>
        )}

        <h3 className="text-lg font-serif font-semibold text-slate-900 dark:text-slate-50 leading-snug mb-1.5">
          <Link
            to={`/scholarship/${scholarship.slug}`}
            className="hover:text-navy-700 dark:hover:text-gold-400 transition-colors"
          >
            {scholarship.title}
          </Link>
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
          <Link
            to={`/university/${scholarship.universitySlug}`}
            className="font-medium hover:underline underline-offset-4"
          >
            {scholarship.universityName}
          </Link>
          <span aria-hidden="true"> · </span>
          <span>{scholarship.state}</span>
        </p>

        <div className="mb-4">
          <p className="text-base font-semibold text-navy-900 dark:text-gold-400 tabular-nums">
            {scholarship.amountDisplay}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
            {scholarship.coverageSummary}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-400 tabular-nums">
          <DeadlineCountdown
            deadlineISO={scholarship.deadlineISO}
            deadlineLabel={scholarship.deadlineLabel}
            compact
          />
          <span aria-hidden="true">·</span>
          <span>Min GPA {scholarship.gpaMin.toFixed(1)}</span>
        </div>

        <Link
          to={`/scholarship/${scholarship.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 dark:text-gold-400 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
        >
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
