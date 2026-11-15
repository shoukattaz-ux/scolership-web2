import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function PrivacyPolicyPage() {
  const { legalPages, settings } = useAppContext();
  const cmsPage = legalPages.find((p) => p.slug === 'privacy-policy');
  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }];

  return (
    <>
      <SeoHead
        title={cmsPage?.seoTitle || `Privacy Policy | ${settings.general.brandName}`}
        description={
          cmsPage?.seoDescription ||
          'Read the ScholarPath USA Privacy Policy covering analytics, advertising cookies, and GDPR/CCPA rights.'
        }
        canonicalPath="/privacy-policy"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <header className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
              {cmsPage?.title || 'Privacy Policy'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Effective Date: {cmsPage?.lastUpdated || settings.general.lastSiteAuditDate} · {settings.general.brandName}
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
                1. Overview &amp; Advertising Partners
              </h2>
              <p>
                {settings.general.brandName} uses optional cookies for advertising and analytics strictly in accordance with your consent preferences.
              </p>
            </section>
          )}

          <section className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
              Contact for Privacy Requests
            </h2>
            <p>
              {settings.general.contactEmail && (
                <>
                  Email{' '}
                  <a href={`mailto:${settings.general.contactEmail}`} className="underline text-navy-800 dark:text-gold-400">
                    {settings.general.contactEmail}
                  </a>{' '}
                  or submit an inquiry on our{' '}
                </>
              )}
              {!settings.general.contactEmail && <>Submit your request on our{' '}</>}
              <Link to="/contact" className="underline text-navy-800 dark:text-gold-400">
                Contact Form
              </Link>
              .
            </p>
          </section>
        </article>
      </div>
    </>
  );
}
