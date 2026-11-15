import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface SuggestionItem {
  type: 'Scholarship' | 'Category' | 'University' | 'Guide';
  label: string;
  sublabel: string;
  to: string;
}

interface SearchAutocompleteProps {
  placeholder?: string;
  initialQuery?: string;
  variant?: 'hero' | 'compact';
  onSubmitSearch?: (query: string) => void;
}

export function SearchAutocomplete({
  placeholder = 'Search scholarships, universities, states, or majors (e.g., Full Ride, STEM, Duke)...',
  initialQuery = '',
  variant = 'hero',
  onSubmitSearch,
}: SearchAutocompleteProps) {
  const { scholarships, categories, universities, guides } = useAppContext();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo<SuggestionItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const items: SuggestionItem[] = [];

    categories.forEach((cat) => {
      if (cat.name.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q)) {
        items.push({
          type: 'Category',
          label: cat.name,
          sublabel: 'Funding Category Hub',
          to: `/scholarships/${cat.slug}`,
        });
      }
    });

    scholarships.forEach((s) => {
      if (
        s.title.toLowerCase().includes(q) ||
        s.universityName.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q) ||
        s.fieldsOfStudy.some((f) => f.toLowerCase().includes(q))
      ) {
        items.push({
          type: 'Scholarship',
          label: s.title,
          sublabel: `${s.universityName} · ${s.amountDisplay}`,
          to: `/scholarship/${s.slug}`,
        });
      }
    });

    universities.forEach((u) => {
      if (u.name.toLowerCase().includes(q) || u.state.toLowerCase().includes(q)) {
        items.push({
          type: 'University',
          label: u.name,
          sublabel: `${u.city}, ${u.stateCode}`,
          to: `/university/${u.slug}`,
        });
      }
    });

    guides.forEach((g) => {
      if (g.title.toLowerCase().includes(q)) {
        items.push({
          type: 'Guide',
          label: g.title,
          sublabel: `${g.categoryLabel} · ${g.readMinutes} min read`,
          to: `/guides/${g.slug}`,
        });
      }
    });

    return items.slice(0, 8);
  }, [query, categories, scholarships, universities, guides]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      navigate(suggestions[activeIndex].to);
      return;
    }
    const trimmed = query.trim();
    if (onSubmitSearch) {
      onSubmitSearch(trimmed);
    } else if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/scholarships');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const isHero = variant === 'hero';

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <form
        onSubmit={handleFormSubmit}
        role="search"
        aria-label="Search scholarships and universities"
        className={`flex items-center w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm focus-within:border-navy-700 dark:focus-within:border-gold-400 transition-colors ${
          isHero ? 'p-1.5 sm:p-2' : 'p-1'
        }`}
      >
        <Search
          className={`text-slate-400 shrink-0 ${isHero ? 'w-5 h-5 ml-3 mr-2.5' : 'w-4 h-4 ml-2.5 mr-2'}`}
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search scholarships"
          aria-autocomplete="list"
          aria-expanded={open && suggestions.length > 0}
          className={`w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none ${
            isHero ? 'text-sm sm:text-base py-2.5 pr-3' : 'text-sm py-2 pr-2'
          }`}
        />
        <button
          type="submit"
          className={`inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-slate-950 dark:hover:bg-gold-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            isHero ? 'px-5 py-2.5 text-sm' : 'px-3.5 py-2 text-xs'
          }`}
        >
          <span>Search</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label="Search suggestions"
          className="absolute z-40 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800"
        >
          {suggestions.map((item, idx) => (
            <li key={`${item.type}-${item.to}`} role="option" aria-selected={idx === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  navigate(item.to);
                }}
                className={`w-full text-left px-4 py-3 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                  idx === activeIndex
                    ? 'bg-slate-100 dark:bg-slate-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {item.sublabel}
                  </p>
                </div>
                <span className="text-[11px] font-medium text-navy-700 dark:text-gold-400 shrink-0">
                  {item.type}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
