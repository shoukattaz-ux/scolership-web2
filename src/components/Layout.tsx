import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bookmark, Lock, Menu, Moon, Scale, Sun, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AdSlot } from './AdSlot';
import { CompareDrawerBar } from './CompareDrawerBar';
import { CookieConsentBanner } from './CookieConsentBanner';

export function Layout({ children }: { children: React.ReactNode }) {
  const {
    theme,
    toggleTheme,
    savedIds,
    compareIds,
    setShowCookieModal,
    categories,
    settings,
    authUser,
  } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium whitespace-nowrap shrink-0 transition-colors underline-offset-8 ${
      isActive
        ? 'text-navy-900 dark:text-gold-400 underline'
        : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:underline'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-navy-900 focus:text-white focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <Link
            to="/"
            className="text-xl font-serif font-bold tracking-tight text-navy-900 dark:text-white whitespace-nowrap shrink-0"
          >
            {settings.general.brandName}
          </Link>

          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6">
            {settings.menus.primaryNav.slice(0, 5).map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={settings.menus.primaryCtaTo}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-slate-950 dark:hover:bg-gold-400 transition-colors whitespace-nowrap shrink-0"
            >
              {settings.menus.primaryCtaLabel}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-3">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-2">
              {settings.menus.primaryNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to={settings.menus.primaryCtaTo}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm font-semibold text-navy-900 dark:text-gold-400"
              >
                {settings.menus.primaryCtaLabel}
              </Link>
              <Link to="/saved" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium">
                Saved Scholarships ({savedIds.length})
              </Link>
              <Link to="/compare" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium">
                Compare ({compareIds.length}/3)
              </Link>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium">
                {authUser ? 'Admin Dashboard' : 'Admin Sign In'}
              </Link>
            </nav>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Appearance</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Workspace Utility Ribbon */}
      <div className="bg-slate-100/80 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <p className="text-slate-600 dark:text-slate-300 truncate">{settings.general.tagline}</p>
          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/saved"
              className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-navy-900 dark:hover:text-gold-400 font-medium whitespace-nowrap tabular-nums"
            >
              <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Saved ({savedIds.length})</span>
            </Link>
            <Link
              to="/compare"
              className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-navy-900 dark:hover:text-gold-400 font-medium whitespace-nowrap tabular-nums"
            >
              <Scale className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Compare ({compareIds.length}/3)</span>
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200 hover:text-navy-900 dark:hover:text-gold-400 font-medium whitespace-nowrap"
            >
              <Lock className="w-3 h-3" aria-hidden="true" />
              <span>{authUser ? 'Admin CMS' : 'Admin'}</span>
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-slate-400 transition-colors cursor-pointer whitespace-nowrap"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-gold-400" /> : <Moon className="w-3.5 h-3.5 text-navy-800" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-3 empty:hidden">
        <AdSlot position="header" />
      </div>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-4 empty:hidden">
        <AdSlot position="footer" />
      </div>

      <footer className="bg-navy-950 text-slate-300 border-t border-navy-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-3">
            <Link to="/" className="text-xl font-serif font-bold text-white inline-block">
              {settings.general.brandName}
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              {settings.general.tagline}. An independent directory helping U.S. high school seniors, transfer students, undergraduates, and graduate applicants compare institutional aid.
            </p>
            {settings.general.contactEmail && (
              <p className="text-xs text-slate-400">
                Editorial Desk:{' '}
                <a href={`mailto:${settings.general.contactEmail}`} className="text-gold-400 hover:underline">
                  {settings.general.contactEmail}
                </a>
              </p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-sans font-semibold text-white mb-4">Scholarship Categories</h3>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 7).map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/scholarships/${cat.slug}`} className="hover:text-gold-400 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-sans font-semibold text-white mb-4">Directory &amp; Guides</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/scholarships" className="hover:text-gold-400 transition-colors">
                  Browse All Scholarships
                </Link>
              </li>
              <li>
                <Link to="/universities" className="hover:text-gold-400 transition-colors">
                  U.S. Universities Directory
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="hover:text-gold-400 transition-colors">
                  Scholarship Eligibility Quiz
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-gold-400 transition-colors">
                  Financial Aid &amp; FAFSA Guides
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-gold-400 transition-colors">
                  Side-by-Side Comparison Tool
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="hover:text-gold-400 transition-colors">
                  HTML Sitemap
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-sans font-semibold text-white mb-4">Trust &amp; Compliance</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-gold-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/editorial-policy" className="hover:text-gold-400 transition-colors">
                  Editorial Policy &amp; Corrections
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/advertise" className="hover:text-gold-400 transition-colors">
                  Advertise With Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-gold-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gold-400 transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-gold-400 transition-colors">
                  Disclaimer &amp; Data Notice
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="hover:text-gold-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setShowCookieModal(true)}
                  className="text-gold-400 hover:underline cursor-pointer"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-800/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} {settings.general.brandName}. Independent educational resource—not affiliated with the U.S. Department of Education or listed universities.
            </p>
            <div className="flex items-center gap-4 shrink-0">
              <a href="/sitemap.xml" className="hover:text-white transition-colors">
                sitemap.xml
              </a>
              <a href="/robots.txt" className="hover:text-white transition-colors">
                robots.txt
              </a>
              <a href="/ads.txt" className="hover:text-white transition-colors">
                ads.txt
              </a>
            </div>
          </div>
        </div>
      </footer>

      <CompareDrawerBar />
      <CookieConsentBanner />
    </div>
  );
}
