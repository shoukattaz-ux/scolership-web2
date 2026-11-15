import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { DegreeLevel } from '../types/scholarship';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs, buildBreadcrumbSchema } from '../components/Breadcrumbs';
import { ScholarshipCard } from '../components/ScholarshipCard';
import { AdSlot } from '../components/AdSlot';

const DEGREE_OPTIONS: DegreeLevel[] = [
  'High School Senior',
  'Undergraduate',
  'Transfer',
  'Graduate / PhD',
];

type SortOption = 'deadline' | 'amount' | 'newest';

export function ScholarshipsPage() {
  const { scholarships, categories } = useAppContext();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const activeCategory = categorySlug ? categories.find((c) => c.slug === categorySlug) : undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categorySlug || 'all');

  useEffect(() => {
    setSelectedCategory(categorySlug || 'all');
  }, [categorySlug]);

  const [selectedDegree, setSelectedDegree] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [maxGpaRequired, setMaxGpaRequired] = useState<number>(4.0);
  const [minAmount, setMinAmount] = useState<number>(0);
  const [deadlineFilter, setDeadlineFilter] = useState<'all' | '30' | '90'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');

  const effectiveCategory = categorySlug || selectedCategory;

  const statesList = useMemo(() => {
    return Array.from(new Set(scholarships.map((s) => s.state))).sort();
  }, [scholarships]);

  const fieldsList = useMemo(() => {
    const all = new Set<string>();
    scholarships.forEach((s) => s.fieldsOfStudy.forEach((f) => all.add(f)));
    return Array.from(all).sort();
  }, [scholarships]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = new Date();

    const list = scholarships.filter((s) => {
      if (effectiveCategory !== 'all') {
        const matchesPrimary = s.category === effectiveCategory;
        const matchesSecondary = s.secondaryCategories?.includes(effectiveCategory as any);
        if (!matchesPrimary && !matchesSecondary) return false;
      }

      if (selectedDegree !== 'all' && !s.degreeLevels.includes(selectedDegree as DegreeLevel)) {
        return false;
      }

      if (selectedState !== 'all' && s.state !== selectedState) {
        return false;
      }

      if (
        selectedField !== 'all' &&
        !s.fieldsOfStudy.includes(selectedField) &&
        !s.fieldsOfStudy.includes('All Majors')
      ) {
        return false;
      }

      if (s.gpaMin > maxGpaRequired) {
        return false;
      }

      if (s.amountNumeric < minAmount) {
        return false;
      }

      if (deadlineFilter !== 'all') {
        const days = Math.ceil(
          (new Date(`${s.deadlineISO}T23:59:59`).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const cap = deadlineFilter === '30' ? 30 : 90;
        if (days < 0 || days > cap) return false;
      }

      if (q) {
        const hay = `${s.title} ${s.universityName} ${s.state} ${s.overview} ${s.fieldsOfStudy.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'amount') return b.amountNumeric - a.amountNumeric;
      if (sortBy === 'newest') return b.lastUpdated.localeCompare(a.lastUpdated);
      return a.deadlineISO.localeCompare(b.deadlineISO);
    });
  }, [
    scholarships,
    effectiveCategory,
    selectedDegree,
    selectedState,
    selectedField,
    maxGpaRequired,
    minAmount,
    deadlineFilter,
    searchQuery,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    if (!categorySlug) setSelectedCategory('all');
    setSelectedDegree('all');
    setSelectedState('all');
    setSelectedField('all');
    setMaxGpaRequired(4.0);
    setMinAmount(0);
    setDeadlineFilter('all');
    setSortBy('deadline');
  };

  const breadcrumbs = activeCategory
    ? [
        { label: 'Home', to: '/' },
        { label: 'Scholarships', to: '/scholarships' },
        { label: activeCategory.name },
      ]
    : [{ label: 'Home', to: '/' }, { label: 'Scholarships' }];

  const seoTitle = activeCategory
    ? activeCategory.seoTitle
    : 'U.S. University Scholarships Directory | ScholarPath USA';
  const seoDesc = activeCategory
    ? activeCategory.seoDescription
    : 'Search, filter, and compare fully funded, full-tuition, half-funded, and partial scholarships at accredited U.S. universities.';

  return (
    <>
      <SeoHead
        title={seoTitle}
        description={seoDesc}
        canonicalPath={activeCategory ? `/scholarships/${activeCategory.slug}` : '/scholarships'}
        schemas={[buildBreadcrumbSchema(breadcrumbs, typeof window !== 'undefined' ? window.location.origin : '')]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />

        <div className="pb-8 border-b border-slate-200 dark:border-slate-800 mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            {activeCategory && (
              <span className={`w-3 h-3 rounded-[2px] ${activeCategory.swatchClass}`} aria-hidden="true" />
            )}
            <span className="text-xs font-semibold uppercase tracking-wider text-navy-700 dark:text-gold-400">
              {activeCategory ? 'Scholarship Category Hub' : 'Complete U.S. Scholarship Directory'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            {activeCategory ? activeCategory.name : 'Search U.S. University Scholarships'}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed">
            {activeCategory
              ? activeCategory.description
              : 'Filter U.S. scholarships by funding category, degree level, state, major, GPA threshold, and award size.'}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-6">
            <Link
              to="/scholarships"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                !activeCategory
                  ? 'bg-navy-900 text-white border-navy-900 dark:bg-gold-500 dark:text-slate-950 dark:border-gold-500'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
              }`}
            >
              All Categories
            </Link>
            {categories.map((cat) => {
              const isCurrent = activeCategory?.slug === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  to={`/scholarships/${cat.slug}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                    isCurrent
                      ? 'bg-navy-900 text-white border-navy-900 dark:bg-gold-500 dark:text-slate-950 dark:border-gold-500'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-[2px] ${cat.swatchClass}`} aria-hidden="true" />
                  <span>{cat.shortName}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-sans font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-navy-800 dark:text-gold-400" aria-hidden="true" />
                  <span>Filter Awards</span>
                </h2>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-gold-400 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              </div>

              <div>
                <label htmlFor="filter-search" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Keyword or University
                </label>
                <input
                  id="filter-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Duke, STEM, Tuition..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              {!categorySlug && (
                <div>
                  <label htmlFor="filter-category" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Funding Category
                  </label>
                  <select
                    id="filter-category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="all">All {categories.length} Categories</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="filter-degree" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Degree Level
                </label>
                <select
                  id="filter-degree"
                  value={selectedDegree}
                  onChange={(e) => setSelectedDegree(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="all">All Degree Levels</option>
                  {DEGREE_OPTIONS.map((deg) => (
                    <option key={deg} value={deg}>
                      {deg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-state" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  U.S. State
                </label>
                <select
                  id="filter-state"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="all">All States</option>
                  {statesList.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-field" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Field of Study
                </label>
                <select
                  id="filter-field"
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="all">All Majors &amp; Fields</option>
                  {fieldsList.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <label htmlFor="filter-gpa">My GPA (Show eligible up to)</label>
                  <span className="tabular-nums font-semibold">{maxGpaRequired.toFixed(1)}</span>
                </div>
                <input
                  id="filter-gpa"
                  type="range"
                  min={2.5}
                  max={4.0}
                  step={0.1}
                  value={maxGpaRequired}
                  onChange={(e) => setMaxGpaRequired(parseFloat(e.target.value))}
                  className="w-full accent-navy-900 dark:accent-gold-500"
                />
              </div>

              <div>
                <label htmlFor="filter-amount" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Minimum Annual Value
                </label>
                <select
                  id="filter-amount"
                  value={minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value={0}>Any Award Size</option>
                  <option value={15000}>$15,000+ / yr</option>
                  <option value={30000}>$30,000+ / yr</option>
                  <option value={50000}>$50,000+ / yr</option>
                  <option value={65000}>$65,000+ / yr (Full-Ride Tier)</option>
                </select>
              </div>

              <div>
                <label htmlFor="filter-deadline" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Deadline Window
                </label>
                <select
                  id="filter-deadline"
                  value={deadlineFilter}
                  onChange={(e) => setDeadlineFilter(e.target.value as 'all' | '30' | '90')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="all">All Upcoming Deadlines</option>
                  <option value="30">Closing Within 30 Days</option>
                  <option value="90">Closing Within 90 Days</option>
                </select>
              </div>
            </div>

            <AdSlot position="sidebar" />
          </aside>

          <div className="lg:col-span-9 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3.5">
              <p className="text-sm text-slate-700 dark:text-slate-300 tabular-nums">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{filtered.length}</span>{' '}
                {filtered.length === 1 ? 'scholarship' : 'scholarships'}
              </p>

              <div className="flex items-center gap-2">
                <label htmlFor="sort-by" className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="deadline">Deadline (Soonest)</option>
                  <option value="amount">Award Amount (Highest)</option>
                  <option value="newest">Recently Updated</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-3">
                <h2 className="text-lg font-serif font-semibold text-slate-900 dark:text-white">
                  No scholarships match your current filters
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Try raising your GPA slider, widening the deadline window, or resetting all filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((s) => (
                  <ScholarshipCard key={s.id} scholarship={s} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
