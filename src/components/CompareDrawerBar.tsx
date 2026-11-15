import { Link } from 'react-router-dom';
import { Scale, X, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function CompareDrawerBar() {
  const { compareIds, removeFromCompare, clearCompare, scholarships } = useAppContext();

  if (compareIds.length === 0) return null;

  const selected = scholarships.filter((s) => compareIds.includes(s.id));
  if (selected.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Scholarship comparison tray"
      className="fixed bottom-0 inset-x-0 z-40 bg-navy-900 text-white border-t border-navy-700 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Scale className="w-4 h-4 text-gold-400 shrink-0" aria-hidden="true" />
          <span className="text-xs font-semibold whitespace-nowrap shrink-0 tabular-nums">
            Compare ({selected.length}/3)
          </span>
          <div className="hidden md:flex items-center gap-2 min-w-0 overflow-hidden">
            {selected.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy-800 border border-navy-700 text-xs text-slate-100 max-w-[200px]"
              >
                <span className="truncate">{s.title}</span>
                <button
                  type="button"
                  onClick={() => removeFromCompare(s.id)}
                  aria-label={`Remove ${s.title} from comparison`}
                  className="text-slate-300 hover:text-white shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs text-slate-300 hover:text-white px-2 py-1.5 cursor-pointer whitespace-nowrap"
          >
            Clear
          </button>
          <Link
            to="/compare"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gold-500 text-slate-950 hover:bg-gold-400 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <span>Compare Side by Side</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
