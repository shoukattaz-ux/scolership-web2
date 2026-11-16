import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function HtmlSitemapPage() {
  const { categories, scholarships, universities, guides, settings } = useAppContext();
  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'HTML Sitemap' }];

  return (
    <>
      <SeoHead
        title={`HTML Sitemap | ${settings.general.brandName}`}
        description="Complete navigation map of ScholarPath USA scholarship categories, U.S. universities, guides, tools, and legal pages."
        canonicalPath="/sitemap"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <div>
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            HTML Sitemap
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Full directory index for visitors and search crawlers. Also available as{' '}
            <a href="/sitemap.xml" className="underline text-navy-800 dark:text-gold-400">
              XML Sitemap (/sitemap.xml)
            </a>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              Core Pages &amp; Tools
            </h2>
            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              <li><Link to="/" className="hover:underline">Home</Link></li>
              <li><Link to="/scholarships" className="hover:underline">All Scholarships</Link></li>
              <li><Link to="/universities" className="hover:underline">Universities Directory</Link></li>
              <li><Link to="/guides" className="hover:underline">Financial Aid &amp; Scholarship Guides</Link></li>
              <li><Link to="/quiz" className="hover:underline">Scholarship Eligibility Quiz</Link></li>
              <li><Link to="/compare" className="hover:underline">Compare Scholarships</Link></li>
              <li><Link to="/saved" className="hover:underline">Saved Scholarships</Link></li>
              <li><Link to="/search" className="hover:underline">Search Directory</Link></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              Scholarship Categories ({categories.length})
            </h2>
            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/scholarships/${c.slug}`} className="hover:underline">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              About &amp; Legal Trust Pages
            </h2>
            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact Us</Link></li>
              <li><Link to="/advertise" className="hover:underline">Advertise With Us</Link></li>
              <li><Link to="/editorial-policy" className="hover:underline">Editorial Policy &amp; Corrections</Link></li>
              <li><Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:underline">Terms &amp; Conditions</Link></li>
              <li><Link to="/disclaimer" className="hover:underline">Disclaimer</Link></li>
              <li><Link to="/cookie-policy" className="hover:underline">Cookie Policy</Link></li>
            </ul>
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              Universities ({universities.length})
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm text-slate-700 dark:text-slate-300">
              {universities.map((u) => (
                <li key={u.slug}>
                  <Link to={`/university/${u.slug}`} className="hover:underline">
                    {u.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              Editorial Guides ({guides.length})
            </h2>
            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link to={`/guides/${g.slug}`} className="hover:underline">
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="space-y-3 pt-4">
          <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
            All Listed Scholarships ({scholarships.length})
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-slate-700 dark:text-slate-300">
            {scholarships.map((s) => (
              <li key={s.id}>
                <Link to={`/scholarship/${s.slug}`} className="hover:underline">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
