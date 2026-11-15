import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { MediaAssetRecord } from '../../context/AppContext';
import { REVIEW_STATUS_LABELS, ReviewStatus } from '../../types/scholarship';

export interface AdminGuideItem {
  slug?: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  categoryLabel: string;
  excerpt: string;
  authorName: string;
  authorRole: string;
  authorBio: string;
  readMinutes: number;
  imageKey: 'graduation' | 'stemLab' | 'readingRoom' | 'counselorEssay';
  customImageUrl?: string;
  status: 'published' | 'draft';
  tags: string[];
  sections: Array<{
    id: string;
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
  faqs: Array<{ question: string; answer: string }>;
  reviewStatus?: ReviewStatus;
  reviewNotes?: string;
  sources?: Array<{ label: string; url: string }>;
  publishAt?: string;
  imageAlt?: string;
}

interface Props {
  initial?: AdminGuideItem | null;
  mediaAssets: MediaAssetRecord[];
  onClose: () => void;
  onSave: (payload: AdminGuideItem, isEdit: boolean) => Promise<{ ok: boolean; error?: string }>;
}

export function GuideEditorModal({ initial, mediaAssets, onClose, onSave }: Props) {
  const isEdit = Boolean(initial?.slug);
  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [categoryLabel, setCategoryLabel] = useState(initial?.categoryLabel || 'Scholarship Strategy');
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '');
  const [authorName, setAuthorName] = useState(initial?.authorName || 'ScholarPath USA Editorial');
  const [authorRole, setAuthorRole] = useState(initial?.authorRole || 'Editorial Team');
  const [authorBio, setAuthorBio] = useState(
    initial?.authorBio || 'Prepared by the ScholarPath USA editorial team.'
  );
  const [readMinutes, setReadMinutes] = useState(String(initial?.readMinutes ?? 6));
  const [imageKey, setImageKey] = useState<AdminGuideItem['imageKey']>(
    initial?.imageKey || 'readingRoom'
  );
  const [customImageUrl, setCustomImageUrl] = useState(initial?.customImageUrl || '');
  const [status, setStatus] = useState<'published' | 'draft'>(initial?.status || 'draft');
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(initial?.reviewStatus || 'pending_review');
  const [reviewNotes, setReviewNotes] = useState(initial?.reviewNotes || '');
  const [sourcesText, setSourcesText] = useState(
    (initial?.sources || []).map((s) => `${s.label} | ${s.url}`).join('\n')
  );
  const [publishAt, setPublishAt] = useState(initial?.publishAt || '');
  const [imageAlt, setImageAlt] = useState(initial?.imageAlt || '');
  const [tagsText, setTagsText] = useState(initial?.tags?.join(', ') || '');
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || '');
  const [sections, setSections] = useState<AdminGuideItem['sections']>(
    initial?.sections?.length
      ? initial.sections
      : [
          {
            id: 'section-1',
            heading: 'Overview & Strategy',
            paragraphs: [''],
          },
        ]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateSection = (idx: number, patch: Partial<AdminGuideItem['sections'][number]>) => {
    setSections((prev) => prev.map((sec, i) => (i === idx ? { ...sec, ...patch } : sec)));
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: `section-${prev.length + 1}`,
        heading: `Section ${prev.length + 1}`,
        paragraphs: [''],
      },
    ]);
  };

  const removeSection = (idx: number) => {
    setSections((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const cleanedSections = sections
      .filter((s) => s.heading.trim())
      .map((s, idx) => ({
        id: s.id || `sec-${idx + 1}`,
        heading: s.heading.trim(),
        paragraphs: s.paragraphs.filter((p) => p.trim()),
        bullets: s.bullets,
      }));

    const payload: AdminGuideItem = {
      slug: slug.trim() || undefined,
      title: title.trim(),
      seoTitle: seoTitle.trim() || `${title.trim().slice(0, 40)} | ScholarPath USA`,
      seoDescription: seoDescription.trim() || excerpt.trim().slice(0, 160),
      categoryLabel: categoryLabel.trim(),
      excerpt: excerpt.trim(),
      authorName: authorName.trim(),
      authorRole: authorRole.trim(),
      authorBio: authorBio.trim(),
      readMinutes: Number(readMinutes) || 6,
      imageKey,
      customImageUrl: customImageUrl.trim(),
      status,
      reviewStatus,
      reviewNotes: reviewNotes.trim(),
      publishAt: status === 'published' ? publishAt : '',
      imageAlt: imageAlt.trim(),
      sources: sourcesText
        .split('\n')
        .map((line) => {
          const [label, ...rest] = line.split('|');
          return { label: (label || '').trim(), url: rest.join('|').trim() };
        })
        .filter((s) => s.label && s.url),
      tags: tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      sections: cleanedSections,
      faqs: initial?.faqs || [],
    };
    const res = await onSave(payload, isEdit);
    setSaving(false);
    if (!res.ok) {
      setError(res.error || 'Failed to save guide.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit Editorial Guide' : 'Create Editorial Guide'}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
            {isEdit ? 'Edit Editorial Guide' : 'New Editorial Guide'}
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
                Guide Title *
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
                Category Label
              </label>
              <input
                type="text"
                value={categoryLabel}
                onChange={(e) => setCategoryLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
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
                <option value="published">Published</option>
                <option value="draft">Draft</option>
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

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Scheduled Publish Time (optional, UTC)
              </label>
              <input
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Featured Image Description (alt text)
              </label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Sources (one per line: Label | https://official-url)
              </label>
              <textarea
                rows={3}
                value={sourcesText}
                onChange={(e) => setSourcesText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Author Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Read Minutes
              </label>
              <input
                type="number"
                min={1}
                value={readMinutes}
                onChange={(e) => setReadMinutes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Default Built-In Cover Image
              </label>
              <select
                value={imageKey}
                onChange={(e) => setImageKey(e.target.value as AdminGuideItem['imageKey'])}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                <option value="graduation">Graduation / Commencement</option>
                <option value="stemLab">STEM Research Laboratory</option>
                <option value="readingRoom">University Reading Room</option>
                <option value="counselorEssay">Counselor Essay Advising</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Custom Image from Media Library (optional)
              </label>
              <select
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                <option value="">Use Default Built-In Cover</option>
                {mediaAssets.map((m) => (
                  <option key={m.id} value={m.url}>
                    {m.title} ({m.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Excerpt / Summary *
              </label>
              <textarea
                rows={2}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Article Sections ({sections.length})
              </h3>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-1 text-xs font-semibold text-navy-800 dark:text-gold-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Section
              </button>
            </div>

            {sections.map((sec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder="Section Heading"
                    value={sec.heading}
                    onChange={(e) => updateSection(idx, { heading: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(idx)}
                      aria-label="Remove section"
                      className="p-1.5 text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  placeholder="Section body paragraphs (separate paragraphs with a blank line)"
                  value={sec.paragraphs.join('\n\n')}
                  onChange={(e) =>
                    updateSection(idx, {
                      paragraphs: e.target.value.split(/\n\s*\n/),
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                SEO Title (max 70 chars)
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
                SEO Meta Description
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
              {saving ? 'Saving...' : isEdit ? 'Save Guide' : 'Publish Guide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
