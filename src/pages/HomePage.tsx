import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, HelpCircle, Mail, Building2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { SearchAutocomplete } from '../components/SearchAutocomplete';
import { ScholarshipCard } from '../components/ScholarshipCard';
import { SafeImage } from '../components/SafeImage';
import { AdSlot } from '../components/AdSlot';

const HOME_FAQS = [
  {
    question: 'Are the scholarships listed on ScholarPath USA real U.S. university programs?',
    answer:
      'Yes, our directory models major U.S. university merit, need-based, STEM, athletic, diversity, and veteran awards. All sample listings are clearly labeled so families verify final dollar amounts and deadlines directly on each university’s official financial aid portal.',
  },
  {
    question: 'What is the difference between Fully Funded and Full Tuition scholarships?',
    answer:
      'A Fully Funded (100% full-ride) scholarship covers tuition, campus housing, meal plans, books, and often a stipend. A Full Tuition award waives 100% of instructional tuition and academic fees, while housing and meals remain separate.',
  },
  {
    question: 'Can transfer students and graduate students use ScholarPath USA?',
    answer:
      'Yes. You can filter the scholarship directory by High School Senior, Undergraduate, Transfer, or Graduate / PhD to surface awards tailored to your enrollment stage.',
  },
  {
    question: 'Is ScholarPath USA free for students, parents, and school counselors?',
    answer:
      'Yes, 100% free. There are no paywalls or account fees to search, bookmark, compare scholarships, or take our eligibility matching quiz.',
  },
];

export function HomePage() {
  const { scholarships, categories, universities, guides, settings } = useAppContext();
  const hp = settings.homepage;

  const featuredScholarships = scholarships
    .filter((s) => s.featured)
    .slice(0, hp.featuredCount || 6);
  const topUniversities = universities.slice(0, 6);
  const latestGuides = guides.slice(0, 3);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterRole, setNewsletterRole] = useState('High School Senior');
  const [newsletterStatus, setNewsletterStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    text: string;
  }>({
    type: 'idle',
    text: '',
  });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus({ type: 'loading', text: '' });
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail, role: newsletterRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNewsletterStatus({ type: 'error', text: data.error || 'Subscription failed.' });
      } else {
        setNewsletterStatus({ type: 'success', text: data.message });
        setNewsletterEmail('');
      }
    } catch {
      setNewsletterStatus({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <SeoHead
        title={`${settings.general.brandName} – Fully Funded & Partial U.S. Scholarships`}
        description="Find fully funded, full-tuition, and partial scholarships at U.S. universities. Search, filter, and compare 2026–2027 university aid packages."
        canonicalPath="/"
        schemas={[faqSchema]}
      />

      {/* Hero Section */}
      <section className="relative bg-navy-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <SafeImage assetKey="heroCampus" priority className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/80 to-navy-950/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-28">
          <div className="max-w-3xl space-y-6">
            <p className="text-xs font-sans font-semibold tracking-wider uppercase text-gold-400">
              {hp.heroEyebrow}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif font-bold leading-[1.12] tracking-tight text-white">
              {hp.heroTitle}
            </h1>
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
              {hp.heroSubtitle}
            </p>

            <div className="pt-2 max-w-2xl">
              <SearchAutocomplete />
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-slate-300">
              <span className="text-slate-400">Popular pathways:</span>
              <Link to="/scholarships/fully-funded" className="hover:text-gold-400 underline underline-offset-4">
                Fully Funded (100%)
              </Link>
              <Link to="/scholarships/half-funded" className="hover:text-gold-400 underline underline-offset-4">
                Half Tuition (50%)
              </Link>
              <Link to="/scholarships/stem" className="hover:text-gold-400 underline underline-offset-4">
                STEM &amp; Engineering
              </Link>
              <Link to="/scholarships/first-generation" className="hover:text-gold-400 underline underline-offset-4">
                First-Generation
              </Link>
              <Link to="/quiz" className="text-gold-400 font-semibold hover:underline underline-offset-4">
                Take Eligibility Quiz →
              </Link>
            </div>
          </div>

          <div className="mt-14 pt-8 border-t border-white/15 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-2xl font-serif font-bold text-white tabular-nums">{categories.length}</p>
              <p className="text-xs text-slate-300 mt-1">Structured Funding Categories</p>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-white tabular-nums">{scholarships.length}</p>
              <p className="text-xs text-slate-300 mt-1">Published Award Profiles</p>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-white tabular-nums">{universities.length}</p>
              <p className="text-xs text-slate-300 mt-1">Featured U.S. Universities</p>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-gold-400 tabular-nums">Up to 3</p>
              <p className="text-xs text-slate-300 mt-1">Side-by-Side Award Comparisons</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Scholarships */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
              Featured U.S. University Scholarships
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Curated full-ride, half-tuition, STEM, and graduate fellowships. Verify final criteria on official university portals.
            </p>
          </div>
          <Link
            to="/scholarships"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 dark:text-gold-400 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
          >
            <span>Browse all {scholarships.length} awards</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredScholarships.map((scholarship) => (
            <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 empty:hidden">
        <AdSlot position="inContent" />
      </div>

      {/* Category Grid */}
      <section className="bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
              Explore All {categories.length} Scholarship Funding Categories
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
              Select a dedicated funding hub to filter eligible awards by tuition coverage, academic discipline, or student background.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const count = scholarships.filter(
                (s) => s.category === cat.slug || s.secondaryCategories?.includes(cat.slug)
              ).length;
              return (
                <Link
                  key={cat.slug}
                  to={`/scholarships/${cat.slug}`}
                  className="group flex flex-col justify-between p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-navy-700/50 dark:hover:border-gold-400/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`w-3 h-3 rounded-[2px] ${cat.swatchClass}`} aria-hidden="true" />
                      <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {count} listings
                      </span>
                    </div>
                    <h3 className="text-base font-serif font-semibold text-slate-900 dark:text-slate-100 group-hover:text-navy-800 dark:group-hover:text-gold-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-navy-800 dark:text-gold-400 mt-4">
                    <span>View hub</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {hp.showHowItWorks && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
                  How Students &amp; Counselors Use {settings.general.brandName}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Three structured steps to narrow hundreds of U.S. institutional aid programs down to realistic, high-value applications.
                </p>
              </div>

              <ol className="space-y-5">
                <li className="pb-5 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-sans font-semibold text-slate-900 dark:text-slate-100">
                    01. Match Your GPA, Degree Level &amp; Financial Profile
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Filter by high school senior, undergraduate, transfer, or PhD pathways, or complete our 60-second Eligibility Quiz to rank relevant awards.
                  </p>
                </li>
                <li className="pb-5 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-sans font-semibold text-slate-900 dark:text-slate-100">
                    02. Compare Up to 3 Scholarships Side by Side
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Evaluate full-ride stipends against half-tuition waivers, renewal GPA rules, and housing coverage in one clean comparison matrix.
                  </p>
                </li>
                <li>
                  <h3 className="text-base font-sans font-semibold text-slate-900 dark:text-slate-100">
                    03. Bookmark Awards &amp; Set Deadline Reminders
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Save shortlisted scholarships locally in your browser and request email alerts ahead of early merit and FAFSA priority cutoffs.
                  </p>
                </li>
              </ol>

              <div className="pt-2">
                <Link
                  to="/quiz"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-slate-950 dark:hover:bg-gold-400 text-sm font-semibold transition-colors"
                >
                  <span>Start Eligibility Quiz</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 min-h-[320px]">
              <SafeImage assetKey="graduation" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>
      )}

      {hp.showTopUniversities && (
        <section className="bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
                  Top U.S. Universities Offering Major Aid
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Explore institutional aid policies, average packages, and listed scholarships by campus.
                </p>
              </div>
              <Link
                to="/universities"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 dark:text-gold-400 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
              >
                <span>View all {universities.length} universities</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topUniversities.map((uni) => {
                const uniCount = scholarships.filter((s) => s.universitySlug === uni.slug).length;
                return (
                  <Link
                    key={uni.slug}
                    to={`/university/${uni.slug}`}
                    className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-navy-700/50 dark:hover:border-gold-400/50 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-navy-900 dark:bg-navy-800 text-gold-400 font-serif font-bold text-sm">
                          {uni.initials}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{uni.institutionType}</span>
                      </div>
                      <h3 className="text-lg font-serif font-semibold text-slate-900 dark:text-white">
                        {uni.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {uni.city}, {uni.state}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                        {uni.overview}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs tabular-nums">
                      <span className="font-medium text-navy-900 dark:text-gold-400">
                        Avg Aid: {uni.avgAidPackage}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                        {uniCount} listed {uniCount === 1 ? 'award' : 'awards'}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {hp.showLatestGuides && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
                Latest Financial Aid &amp; Scholarship Guides
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                In-depth editorial playbooks reviewed by higher education advisors.
              </p>
            </div>
            <Link
              to="/guides"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 dark:text-gold-400 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              <span>Read all guides</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestGuides.map((guide: any) => (
              <article
                key={guide.slug}
                className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
              >
                <Link to={`/guides/${guide.slug}`} className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800 block">
                  <SafeImage
                    assetKey={guide.imageKey}
                    srcOverride={guide.customImageUrl}
                    className="w-full h-full object-cover transition-transform duration-200 hover:scale-[1.02]"
                  />
                </Link>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 tabular-nums">
                      <span>{guide.categoryLabel}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{guide.readMinutes} min read</span>
                      <span aria-hidden="true"> · </span>
                      <span>Updated {guide.lastUpdated}</span>
                    </p>
                    <h3 className="text-lg font-serif font-semibold text-slate-900 dark:text-white leading-snug">
                      <Link to={`/guides/${guide.slug}`} className="hover:text-navy-700 dark:hover:text-gold-400 transition-colors">
                        {guide.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {guide.excerpt}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                    By {guide.authorName}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {hp.showNewsletter && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="bg-navy-900 dark:bg-navy-900 border border-navy-800 rounded-2xl p-8 sm:p-12 text-white grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-gold-400 uppercase tracking-wider">
                <Mail className="w-4 h-4" aria-hidden="true" />
                <span>Weekly Deadline Briefing</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Never Miss a Full-Ride or FAFSA Priority Cutoff
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Receive one concise Monday digest covering upcoming U.S. scholarship deadlines, essay prompt updates, and newly added university awards. Unsubscribe anytime.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="lg:col-span-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email address for scholarship alerts"
                  className="sm:col-span-2 px-4 py-3 rounded-lg bg-white text-slate-900 placeholder:text-slate-500 text-sm focus:outline-none"
                />
                <select
                  value={newsletterRole}
                  onChange={(e) => setNewsletterRole(e.target.value)}
                  aria-label="Applicant role"
                  className="px-3 py-3 rounded-lg bg-navy-800 text-white border border-navy-700 text-sm focus:outline-none"
                >
                  <option value="High School Senior">High School Senior</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Transfer Student">Transfer Student</option>
                  <option value="Graduate / PhD">Graduate / PhD</option>
                  <option value="Parent / Counselor">Parent / Counselor</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={newsletterStatus.type === 'loading'}
                  className="px-5 py-2.5 rounded-lg bg-gold-500 text-slate-950 hover:bg-gold-400 font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
                >
                  {newsletterStatus.type === 'loading' ? 'Subscribing...' : 'Subscribe to Deadline Alerts'}
                </button>
                <span className="text-xs text-slate-400">
                  Zero spam. Respects your{' '}
                  <Link to="/privacy-policy" className="underline hover:text-white">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </div>
              {newsletterStatus.type === 'success' && (
                <p role="status" className="flex items-center gap-2 text-xs text-emerald-300 pt-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{newsletterStatus.text}</span>
                </p>
              )}
              {newsletterStatus.type === 'error' && (
                <p role="alert" className="text-xs text-rose-300 pt-1">
                  {newsletterStatus.text}
                </p>
              )}
            </form>
          </div>
        </section>
      )}

      {hp.showFaq && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-8">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-navy-800 dark:text-gold-400" aria-hidden="true" />
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
            {HOME_FAQS.map((faq) => (
              <details key={faq.question} className="group py-4">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-medium text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  <span>{faq.question}</span>
                  <span className="text-slate-400 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
