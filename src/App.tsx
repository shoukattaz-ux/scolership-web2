import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
const ScholarshipsPage = lazy(() => import('./pages/ScholarshipsPage').then((m) => ({ default: m.ScholarshipsPage })));
const ScholarshipDetailPage = lazy(() => import('./pages/ScholarshipDetailPage').then((m) => ({ default: m.ScholarshipDetailPage })));
const UniversitiesPage = lazy(() => import('./pages/UniversitiesPage').then((m) => ({ default: m.UniversitiesPage })));
const UniversityDetailPage = lazy(() => import('./pages/UniversityDetailPage').then((m) => ({ default: m.UniversityDetailPage })));
const GuidesPage = lazy(() => import('./pages/GuidesPage').then((m) => ({ default: m.GuidesPage })));
const GuideDetailPage = lazy(() => import('./pages/GuideDetailPage').then((m) => ({ default: m.GuideDetailPage })));
const QuizPage = lazy(() => import('./pages/QuizPage').then((m) => ({ default: m.QuizPage })));
const ComparePage = lazy(() => import('./pages/ComparePage').then((m) => ({ default: m.ComparePage })));
const SavedPage = lazy(() => import('./pages/SavedPage').then((m) => ({ default: m.SavedPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const AdvertisePage = lazy(() => import('./pages/AdvertisePage').then((m) => ({ default: m.AdvertisePage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage').then((m) => ({ default: m.DisclaimerPage })));
const EditorialPolicyPage = lazy(() => import('./pages/EditorialPolicyPage').then((m) => ({ default: m.EditorialPolicyPage })));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage').then((m) => ({ default: m.CookiePolicyPage })));
const HtmlSitemapPage = lazy(() => import('./pages/HtmlSitemapPage').then((m) => ({ default: m.HtmlSitemapPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/scholarships" element={<ScholarshipsPage />} />
            <Route path="/scholarships/:categorySlug" element={<ScholarshipsPage />} />
            <Route path="/scholarship/:slug" element={<ScholarshipDetailPage />} />
            <Route path="/universities" element={<UniversitiesPage />} />
            <Route path="/university/:slug" element={<UniversityDetailPage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/guides/:slug" element={<GuideDetailPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/advertise" element={<AdvertisePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/editorial-policy" element={<EditorialPolicyPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/sitemap" element={<HtmlSitemapPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
