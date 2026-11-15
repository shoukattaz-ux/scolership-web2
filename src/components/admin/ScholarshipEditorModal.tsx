import { REVIEW_STATUS_LABELS, ReviewStatus } from '../../types/scholarship';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  DegreeLevel,
  ScholarshipCategory,
  University,
} from '../../types/scholarship';

export interface AdminScholarshipItem {
  id?: string;
  slug?: string;
  title: string;
  universitySlug: string;
  universityName: string;
  state: string;
  stateCode: string;
  category: string;
  degreeLevels: DegreeLevel[];
  fieldsOfStudy: string[];
  amountDisplay: string;
  amountNumeric: number;
  coverageSummary: string;
  coversTuition: boolean;
  coversHousing: boolean;
  coversBooks: boolean;
  includesStipend: boolean;
  renewable: string;
  deadlineISO: string;
  deadlineLabel: string;
  gpaMin: number;
  featured: boolean;
  isSampleData: boolean;
  reviewStatus?: ReviewStatus;
  reviewNotes?: string;
  status: 'published' | 'draft';
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  overview: string;
  eligibility: string[];
  requiredDocuments: string[];
  applicationSteps: string[];
  officialUrl: string;
  faqs: Array<{ question: string; answer: string }>;
}

const ALL_DEGREES: DegreeLevel[] = [
  'High School Senior',
  'Undergraduate',
  'Graduate / PhD',
  'Transfer',
];

interface Props {
  initial?: AdminScholarshipItem | null;
  categories: ScholarshipCategory[];
  universities: University[];
  onClose: () => void;
  onSave: (payload: AdminScholarshipItem) => Promise<{ ok: boolean; error?: string }>;
}

export function ScholarshipEditorModal({
  initial,
  categories,
  universities,
  onClose,
  onSave,
}: Props) {
  const defaultUni = universities[0];
  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [universitySlug, setUniversitySlug] = useState(initial?.universitySlug || defaultUni?.slug || '');
  const [universityName, setUniversityName] = useState(initial?.universityName || defaultUni?.name || '');
  const [stateName, setStateName] = useState(initial?.state || defaultUni?.state || '');
  const [stateCode, setStateCode] = useState(initial?.stateCode || defaultUni?.stateCode || '');
  const [category, setCategory] = useState(initial?.category || categories[0]?.slug || 'merit-based');
  const [degreeLevels, setDegreeLevels] = useState<DegreeLevel[]>(
    initial?.degreeLevels?.length ? initial.degreeLevels : ['Undergraduate']
  );
  const [fieldsText, setFieldsText] = useState(
    initial?.fieldsOfStudy?.join(', ') || 'All Majors'
  );
  const [amountDisplay, setAmountDisplay] = useState(initial?.amountDisplay || '$25,000 / year');
  const [amountNumeric, setAmountNumeric] = useState(String(initial?.amountNumeric ?? 25000));
  const [coverageSummary, setCoverageSummary] = useState(
    initial?.coverageSummary || 'Annual institutional tuition scholarship'
  );
  const [coversTuition, setCoversTuition] = useState(initial?.coversTuition ?? true);
  const [coversHousing, setCoversHousing] = useState(initial?.coversHousing ?? false);
  const [coversBooks, setCoversBooks] = useState(initial?.coversBooks ?? false);
  const [includesStipend, setIncludesStipend] = useState(initial?.includesStipend ?? false);
  const [renewable, setRenewable] = useState(initial?.renewable || 'Up to 4 years (3.0+ GPA)');
  const [deadlineISO, setDeadlineISO] = useState(initial?.deadlineISO || '2027-01-15');
  const [deadlineLabel, setDeadlineLabel] = useState(initial?.deadlineLabel || 'January 15, 2027');
  const [gpaMin, setGpaMin] = useState(String(initial?.gpaMin ?? 3.5));
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [status, setStatus] = useState<'published' | 'draft'>(initial?.status || 'draft');
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(initial?.reviewStatus || 'pending_review');
  const [reviewNotes, setReviewNotes] = useState(initial?.reviewNotes || '');
  const [isSample, setIsSample] = useState(initial?.isSampleData ?? false);
  const [tagsText, setTagsText] = useState(initial?.tags?.join(', ') || '');
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || '');
  const [overview, setOverview] = useState(initial?.overview || '');
  const [eligibilityText, setEligibilityText] = useState(initial?.eligibility?.join('\n') || '');
  const [docsText, setDocsText] = useState(initial?.requiredDocuments?.join('\n') || '');
  const [stepsText, setStepsText] = useState(initial?.applicationSteps?.join('\n') || '');
  const [officialUrl, setOfficialUrl] = useState(initial?.officialUrl || defaultUni?.website || 'https://www.ed.gov/');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleUniSelect = (uSlug: string) => {
    setUniversitySlug(uSlug);
    const found = universities.find((u) => u.slug === uSlug);
    if (found) {
      setUniversityName(found.name);
      setStateName(found.state);
      setStateCode(found.stateCode);
      if (!initial?.id) {
        setOfficialUrl(found.website);
      }
    }
  };

  const toggleDegree = (deg: DegreeLevel) => {
    setDegreeLevels((prev) =>
      prev.includes(deg) ? prev.filter((d) => d !== deg) : [...prev, deg]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload: AdminScholarshipItem = {
      id: initial?.id,
      slug: slug.trim() || undefined,
      title: title.trim(),
      universitySlug,
      universityName: universityName.trim(),
      state: stateName.trim(),
      stateCode: stateCode.trim().toUpperCase(),
      category,
      degreeLevels: degreeLevels.length ? degreeLevels : ['Undergraduate'],
      fieldsOfStudy: fieldsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      amountDisplay: amountDisplay.trim(),
      amountNumeric: Number(amountNumeric) || 0,
      coverageSummary: coverageSummary.trim(),
      coversTuition,
      coversHousing,
      coversBooks,
      includesStipend,
      renewable: renewable.trim(),
      deadlineISO: deadlineISO.trim(),
      deadlineLabel: deadlineLabel.trim(),
      gpaMin: Number(gpaMin) || 0,
      featured,
      isSampleData: isSample,
      reviewStatus,
      reviewNotes: reviewNotes.trim(),
      status,
      tags: tagsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      overview: overview.trim(),
      eligibility: eligibilityText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      requiredDocuments: docsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      applicationSteps: stepsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      officialUrl: officialUrl.trim(),
      faqs: initial?.faqs || [],
    };
    const res = await onSave(payload);
    setSaving(false);
    if (!res.ok) {
      setError(res.error || 'Failed to save scholarship.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={initial?.id ? 'Edit Scholarship' : 'Add Scholarship'}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
            {initial?.id ? 'Edit Scholarship Listing' : 'Add New Scholarship'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Scholarship Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                University Directory Link
              </label>
              <select
                value={universitySlug}
                onChange={(e) => handleUniSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                {universities.map((u) => (
                  <option key={u.slug} value={u.slug}>
                    {u.name} ({u.stateCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Funding Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                URL Slug (auto-generated if blank)
              </label>
              <input
                type="text"
                value={slug}
                disabled={Boolean(initial?.id)}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="presidential-merit-award"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Publish Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                <option value="published">Published (Visible on Site)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Editorial Review Status
              </label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as ReviewStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                {(Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[]).map((k) => (
                  <option key={k} value={k}>
                    {REVIEW_STATUS_LABELS[k]}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Only an administrator can set “Reviewed”, and only after checking the content against its sources. Content must be Reviewed before it can be published.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Reviewer Notes (internal)
              </label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={isSample} onChange={(e) => setIsSample(e.target.checked)} />
                Sample / unverified entry (shows a notice, hides ads, excluded from sitemap and search indexing). Untick only after checking every figure against the official source.
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Display Amount *
              </label>
              <input
                type="text"
                required
                value={amountDisplay}
                onChange={(e) => setAmountDisplay(e.target.value)}
                placeholder="100% Full Ride (~$88,000/yr)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Numeric Annual Value ($)
              </label>
              <input
                type="number"
                min={0}
                value={amountNumeric}
                onChange={(e) => setAmountNumeric(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Deadline ISO (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={deadlineISO}
                onChange={(e) => setDeadlineISO(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Deadline Display Label
              </label>
              <input
                type="text"
                value={deadlineLabel}
                onChange={(e) => setDeadlineLabel(e.target.value)}
                placeholder="January 15, 2027"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Minimum GPA (0.0 – 4.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="4.0"
                value={gpaMin}
                onChange={(e) => setGpaMin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Renewable Terms
              </label>
              <input
                type="text"
                value={renewable}
                onChange={(e) => setRenewable(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Coverage Summary
              </label>
              <input
                type="text"
                value={coverageSummary}
                onChange={(e) => setCoverageSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Degree Levels
            </span>
            <div className="flex flex-wrap gap-3">
              {ALL_DEGREES.map((deg) => (
                <label key={deg} className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={degreeLevels.includes(deg)}
                    onChange={() => toggleDegree(deg)}
                    className="rounded border-slate-300 dark:border-slate-700"
                  />
                  <span>{deg}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
              <input type="checkbox" checked={coversTuition} onChange={(e) => setCoversTuition(e.target.checked)} />
              <span>Covers Tuition</span>
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
              <input type="checkbox" checked={coversHousing} onChange={(e) => setCoversHousing(e.target.checked)} />
              <span>Covers Housing</span>
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
              <input type="checkbox" checked={coversBooks} onChange={(e) => setCoversBooks(e.target.checked)} />
              <span>Covers Books</span>
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
              <input type="checkbox" checked={includesStipend} onChange={(e) => setIncludesStipend(e.target.checked)} />
              <span>Includes Stipend</span>
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 dark:text-gold-400 cursor-pointer">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              <span>Featured on Homepage</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Fields of Study (comma separated)
              </label>
              <input
                type="text"
                value={fieldsText}
                onChange={(e) => setFieldsText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="no-essay, auto-considered, fafsa"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Official University Application URL
              </label>
              <input
                type="url"
                value={officialUrl}
                onChange={(e) => setOfficialUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Overview Paragraph *
            </label>
            <textarea
              rows={3}
              required
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Eligibility Rules (one per line)
              </label>
              <textarea
                rows={4}
                value={eligibilityText}
                onChange={(e) => setEligibilityText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Required Documents (one per line)
              </label>
              <textarea
                rows={4}
                value={docsText}
                onChange={(e) => setDocsText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Application Steps (one per line)
              </label>
              <textarea
                rows={4}
                value={stepsText}
                onChange={(e) => setStepsText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Custom SEO Title (optional, max 70 chars)
              </label>
              <input
                type="text"
                maxLength={70}
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Custom SEO Meta Description (max 170 chars)
              </label>
              <input
                type="text"
                maxLength={170}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs text-rose-700 dark:text-rose-400">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer disabled:opacity-60"
            >
              {saving ? 'Saving...' : initial?.id ? 'Save Changes' : 'Create Scholarship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
