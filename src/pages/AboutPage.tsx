import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs, buildBreadcrumbSchema } from '../components/Breadcrumbs';
import { SafeImage } from '../components/SafeImage';

export function AboutPage() {
  const { settings } = useAppContext();
  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'About Us' }];

  return (
    <>
      <SeoHead
        title={`About ${settings.general.brandName} | Mission & Editorial Standards`}
        description="What ScholarPath USA is, who it is for, and how we label, review, and correct U.S. university scholarship information."
        canonicalPath="/about"
        schemas={[buildBreadcrumbSchema(breadcrumbs, typeof window !== 'undefined' ? window.location.origin : '')]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <Breadcrumbs items={breadcrumbs} />

        <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-800 dark:text-gold-400">
              Editorial Standards &amp; Independence
            </p>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
              Helping U.S. Students Navigate University Scholarships With Clarity
            </h1>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              {settings.general.brandName} is an independent educational directory built for U.S. high school seniors, undergraduate and transfer students, graduate applicants, parents, and school counselors. Our goal is straightforward: organize institutional funding by real tuition coverage—so families can distinguish a 100% full-ride fellowship from a partial tuition waiver in seconds.
            </p>
          </div>
          <div className="lg:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <SafeImage assetKey="counselorEssay" className="w-full h-full object-cover" />
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
            How We Review Scholarship Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-slate-300">
            <div>
              <h3 className="font-sans font-semibold text-slate-900 dark:text-white mb-1.5">
                01. Clear Coverage Taxonomy
              </h3>
              <p className="leading-relaxed">
                Every listing explicitly separates tuition coverage, campus housing, books, and stipends instead of hiding partial grants behind vague "full scholarship" headlines.
              </p>
            </div>
            <div>
              <h3 className="font-sans font-semibold text-slate-900 dark:text-white mb-1.5">
                02. Direct Institutional Links
              </h3>
              <p className="leading-relaxed">
                We link students straight to official university portals and financial aid offices rather than gating applications behind lead-broker paywalls.
              </p>
            </div>
            <div>
              <h3 className="font-sans font-semibold text-slate-900 dark:text-white mb-1.5">
                03. Honest Labeling
              </h3>
              <p className="leading-relaxed">
                Records that are not yet verified against an official source are labeled as sample entries, and every page shows when it was last updated, so families know what to double-check.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Who runs this site</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {settings.general.brandName} is an independent publication operated by a small site team. We do not claim
            affiliation with any university, government agency, or financial aid provider, and we do not publish
            staff credentials we cannot document. Our standards for preparing, labeling, reviewing, and correcting
            content are set out in the{' '}
            <Link to="/editorial-policy" className="underline text-navy-800 dark:text-gold-400">
              Editorial Policy
            </Link>
            .
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Parts of the directory are still marked as sample or unverified entries while each record is checked against the
            sponsoring university’s official page. Those entries carry a notice, and you should always confirm details with the
            university before relying on them.
          </p>
        </section>

        <section className="bg-navy-900 text-white rounded-2xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-serif font-bold">Have a Scholarship Update or Correction?</h2>
            <p className="text-sm text-slate-300 mt-1">
              University financial aid staff and school counselors can submit updates directly to our editorial desk.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-5 py-2.5 rounded-lg bg-gold-500 text-slate-950 hover:bg-gold-400 text-xs font-semibold whitespace-nowrap self-start sm:self-auto"
          >
            Contact Editorial Team
          </Link>
        </section>
      </div>
    </>
  );
}
