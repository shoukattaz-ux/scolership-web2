import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function EditorialPolicyPage() {
  const { legalPages, settings } = useAppContext();
  const cmsPage = legalPages.find((p) => p.slug === 'editorial-policy');
  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Editorial Policy' }];

  return (
    <>
      <SeoHead
        title={cmsPage?.seoTitle || `Editorial Policy & Corrections | ${settings.general.brandName}`}
        description={
          cmsPage?.seoDescription ||
          'How scholarship listings and guides are prepared, reviewed, labeled, and corrected.'
        }
        canonicalPath="/editorial-policy"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <header className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
              {cmsPage?.title || 'Editorial Policy & Corrections'}
            </h1>
            {cmsPage?.lastUpdated && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Last updated: {cmsPage.lastUpdated}</p>
            )}
          </header>
          {cmsPage?.sections.map((sec) => (
            <section key={sec.heading} className="space-y-2">
              <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">{sec.heading}</h2>
              <p>{sec.body}</p>
            </section>
          ))}
          <p>
            Spotted an error?{' '}
            <Link to="/contact" className="underline text-navy-800 dark:text-gold-400">
              Send a correction
            </Link>
            .
          </p>
        </article>
      </div>
    </>
  );
}
