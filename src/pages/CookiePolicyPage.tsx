import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function CookiePolicyPage() {
  const { setShowCookieModal, legalPages, settings } = useAppContext();
  const cmsPage = legalPages.find((p) => p.slug === 'cookie-policy');
  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Cookie Policy' }];

  return (
    <>
      <SeoHead
        title={cmsPage?.seoTitle || `Cookie Policy | ${settings.general.brandName}`}
        description={
          cmsPage?.seoDescription ||
          'Learn how ScholarPath USA uses essential browser storage, Google Consent Mode v2, analytics, and advertising cookies.'
        }
        canonicalPath="/cookie-policy"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <header className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
                {cmsPage?.title || 'Cookie Policy'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Last Updated: {cmsPage?.lastUpdated || settings.general.lastSiteAuditDate} · Google Consent Mode v2 Enabled
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCookieModal(true)}
              className="px-4 py-2 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer self-start sm:self-auto"
            >
              Manage Cookie Preferences
            </button>
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
                1. Essential &amp; Advertising Cookies
              </h2>
              <p>
                Advertising cookies (Google AdSense, Media.net) remain disabled until explicitly consented.
              </p>
            </section>
          )}
        </article>
      </div>
    </>
  );
}
