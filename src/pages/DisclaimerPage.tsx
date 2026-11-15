import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function DisclaimerPage() {
  const { legalPages, settings } = useAppContext();
  const cmsPage = legalPages.find((p) => p.slug === 'disclaimer');
  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Disclaimer' }];

  return (
    <>
      <SeoHead
        title={cmsPage?.seoTitle || `Disclaimer & Data Notice | ${settings.general.brandName}`}
        description={
          cmsPage?.seoDescription ||
          'Important disclaimer: ScholarPath USA is an independent directory not affiliated with U.S. universities, FAFSA, or the federal government.'
        }
        canonicalPath="/disclaimer"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <header className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
              {cmsPage?.title || 'Disclaimer & Institutional Non-Affiliation Notice'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Last Updated: {cmsPage?.lastUpdated || settings.general.lastSiteAuditDate} · {settings.general.brandName}
            </p>
          </header>

          {cmsPage && cmsPage.sections.length > 0 ? (
            cmsPage.sections.map((sec) => (
              <section key={sec.heading} className="space-y-2">
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                  {sec.heading}
                </h2>
                <p>{sec.body}</p>
              </section>
            ))
          ) : (
            <section className="space-y-2">
              <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                1. Non-Affiliation Notice
              </h2>
              <p>
                {settings.general.brandName} is independent and not affiliated with any U.S. university or government agency.
              </p>
            </section>
          )}
        </article>
      </div>
    </>
  );
}
