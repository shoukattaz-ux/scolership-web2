import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function TermsPage() {
  const { legalPages, settings } = useAppContext();
  const cmsPage = legalPages.find((p) => p.slug === 'terms');
  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Terms & Conditions' }];

  return (
    <>
      <SeoHead
        title={cmsPage?.seoTitle || `Terms & Conditions | ${settings.general.brandName}`}
        description={
          cmsPage?.seoDescription ||
          'Terms and conditions governing use of the ScholarPath USA university scholarship directory, comparison tool, and educational articles.'
        }
        canonicalPath="/terms"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <header className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
              {cmsPage?.title || 'Terms & Conditions'}
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
                1. Educational Use
              </h2>
              <p>
                All scholarship listings and guides on {settings.general.brandName} are provided strictly for general educational research.
              </p>
            </section>
          )}
        </article>
      </div>
    </>
  );
}
