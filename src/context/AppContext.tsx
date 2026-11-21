import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SCHOLARSHIP_CATEGORIES } from '../data/categories';
import { SCHOLARSHIPS } from '../data/scholarships';
import { UNIVERSITIES } from '../data/universities';
import { EDITORIAL_GUIDES } from '../data/guides';
import { siteConfig } from '../config/siteConfig';
import {
  GuideArticle,
  Scholarship,
  ScholarshipCategory,
  University,
} from '../types/scholarship';

export type ThemeMode = 'light' | 'dark';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  advertising: boolean;
  consentedAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
}

export interface LegalPageSection {
  heading: string;
  body: string;
}

export interface LegalPageData {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  sections: LegalPageSection[];
  lastUpdated: string;
}

export interface MediaAssetRecord {
  id: string;
  title: string;
  url: string;
  alt_text: string;
  category: string;
  width: number;
  height: number;
  created_at: string;
}

export interface DynamicSlotConfig {
  id: string;
  enabled: boolean;
  network: 'adsense' | 'medianet' | 'revbit';
  slotCode: string;
  label: string;
  minHeightDesktop: number;
  minHeightMobile: number;
}

export interface SiteSettingsData {
  general: {
    brandName: string;
    shortName: string;
    tagline: string;
    contactEmail: string;
    advertisingEmail: string;
    location: string;
    editorialTeamLead: string;
    ga4MeasurementId: string;
    googleSiteVerification: string;
    lastSiteAuditDate: string;
    showSampleData?: boolean;
  };
  homepage: {
    heroEyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    featuredCount: number;
    showHowItWorks: boolean;
    showTopUniversities: boolean;
    showLatestGuides: boolean;
    showNewsletter: boolean;
    showFaq: boolean;
  };
  menus: {
    primaryNav: Array<{ label: string; to: string }>;
    primaryCtaLabel: string;
    primaryCtaTo: string;
  };
  monetization: {
    enabled: boolean;
    showPreApprovalSlots: boolean;
    primaryNetwork: 'adsense' | 'medianet' | 'revbit';
    adsensePublisherId: string;
    medianetCustomerId: string;
    medianetSiteId: string;
    revbitSiteId: string;
    adsTxtContent: string;
    slots: Record<'header' | 'inContent' | 'sidebar' | 'footer', DynamicSlotConfig>;
  };
}

const DEFAULT_SETTINGS_STATE: SiteSettingsData = {
  general: {
    brandName: siteConfig.brandName,
    shortName: siteConfig.shortName,
    tagline: siteConfig.tagline,
    contactEmail: siteConfig.contactEmail,
    advertisingEmail: siteConfig.advertisingEmail,
    location: siteConfig.location,
    editorialTeamLead: siteConfig.editorialTeamLead,
    ga4MeasurementId: siteConfig.analytics.ga4MeasurementId,
    googleSiteVerification: siteConfig.analytics.googleSiteVerification,
    lastSiteAuditDate: siteConfig.lastSiteAuditDate,
  },
  homepage: {
    heroEyebrow: 'U.S. University Scholarship Directory · 2026–2027 Cycle',
    heroTitle: 'Find Fully Funded and Partial Scholarships at U.S. Universities',
    heroSubtitle:
      'Search 14 funding categories across accredited American public and private universities. Compare tuition coverage, GPA thresholds, and deadlines side by side without paywalls.',
    featuredCount: 6,
    showHowItWorks: true,
    showTopUniversities: true,
    showLatestGuides: true,
    showNewsletter: true,
    showFaq: true,
  },
  menus: {
    primaryNav: [
      { label: 'Scholarships', to: '/scholarships' },
      { label: 'Universities', to: '/universities' },
      { label: 'Full Ride', to: '/scholarships/fully-funded' },
      { label: 'Guides', to: '/guides' },
      { label: 'About', to: '/about' },
    ],
    primaryCtaLabel: 'Eligibility Quiz',
    primaryCtaTo: '/quiz',
  },
  monetization: {
    enabled: siteConfig.ads.enabled,
    showPreApprovalSlots: siteConfig.ads.showPreApprovalSlots,
    primaryNetwork: 'adsense',
    adsensePublisherId: siteConfig.ads.adsensePublisherId,
    medianetCustomerId: '',
    medianetSiteId: '',
    revbitSiteId: siteConfig.ads.revbitSiteId,
    adsTxtContent: '',
    slots: {
      header: { ...siteConfig.ads.slots.header, enabled: true, network: 'adsense', slotCode: '' },
      inContent: { ...siteConfig.ads.slots.inContent, enabled: true, network: 'adsense', slotCode: '' },
      sidebar: { ...siteConfig.ads.slots.sidebar, enabled: true, network: 'adsense', slotCode: '' },
      footer: { ...siteConfig.ads.slots.footer, enabled: true, network: 'adsense', slotCode: '' },
    },
  },
};

interface AppContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  savedIds: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  compareIds: string[];
  toggleCompare: (id: string) => { added: boolean; limitReached: boolean };
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isCompared: (id: string) => boolean;
  cookiePrefs: CookiePreferences | null;
  saveCookiePrefs: (prefs: Omit<CookiePreferences, 'consentedAt'>) => void;
  showCookieModal: boolean;
  setShowCookieModal: (open: boolean) => void;

  // Live CMS Data
  categories: ScholarshipCategory[];
  universities: University[];
  scholarships: Scholarship[];
  guides: GuideArticle[];
  legalPages: LegalPageData[];
  mediaAssets: MediaAssetRecord[];
  settings: SiteSettingsData;
  refreshSiteData: () => Promise<void>;
  siteDataLoaded: boolean;

  // Auth Session
  authUser: AuthUser | null;
  csrfToken: string | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const THEME_KEY = 'scholarpath_theme';
const SAVED_KEY = 'scholarpath_saved';
const COMPARE_KEY = 'scholarpath_compare';
const CONSENT_KEY = 'scholarpath_consent';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [compareIds, setCompareIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(COMPARE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [cookiePrefs, setCookiePrefs] = useState<CookiePreferences | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [showCookieModal, setShowCookieModal] = useState(false);

  // Live CMS state: the server embeds the same data as /api/bootstrap in the HTML so the first paint is complete.
  const boot: any = typeof window !== 'undefined' ? (window as any).__BOOTSTRAP__ : undefined;
  const [categories, setCategories] = useState<ScholarshipCategory[]>(boot?.categories?.length ? boot.categories : SCHOLARSHIP_CATEGORIES);
  const [universities, setUniversities] = useState<University[]>(boot?.universities || []);
  const [scholarships, setScholarships] = useState<Scholarship[]>(boot?.scholarships || []);
  const [siteDataLoaded, setSiteDataLoaded] = useState(Boolean(boot));
  const [guides, setGuides] = useState<GuideArticle[]>(boot?.guides || []);
  const [legalPages, setLegalPages] = useState<LegalPageData[]>(boot?.legalPages || []);
  const [mediaAssets, setMediaAssets] = useState<MediaAssetRecord[]>(boot?.mediaAssets || []);
  const [settings, setSettings] = useState<SiteSettingsData>(boot?.settings || DEFAULT_SETTINGS_STATE);

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshSiteData = useCallback(async () => {
    try {
      const res = await fetch(import.meta.env.VITE_STATIC === '1' ? '/site-data.json' : '/api/bootstrap');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.categories) && data.categories.length) setCategories(data.categories);
      if (Array.isArray(data.universities)) setUniversities(data.universities);
      if (Array.isArray(data.scholarships)) setScholarships(data.scholarships);
      if (Array.isArray(data.guides)) setGuides(data.guides);
      if (Array.isArray(data.legalPages)) setLegalPages(data.legalPages);
      if (Array.isArray(data.mediaAssets)) setMediaAssets(data.mediaAssets);
      if (data.settings) setSettings(data.settings);
    } catch {
      // Keep empty lists; pages show their empty states
    } finally {
      setSiteDataLoaded(true);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    if (import.meta.env.VITE_STATIC === '1') { setAuthLoading(false); return; }
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setAuthUser(data.user || null);
        setCsrfToken(data.csrfToken || null);
      }
    } catch {
      setAuthUser(null);
      setCsrfToken(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSiteData();
    refreshAuth();
  }, [refreshSiteData, refreshAuth]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds));
    } catch {
      // ignore
    }
  }, [savedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(COMPARE_KEY, JSON.stringify(compareIds));
    } catch {
      // ignore
    }
  }, [compareIds]);

  const applyGoogleConsent = (prefs: CookiePreferences) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        ad_storage: prefs.advertising ? 'granted' : 'denied',
        ad_user_data: prefs.advertising ? 'granted' : 'denied',
        ad_personalization: prefs.advertising ? 'granted' : 'denied',
      });
    }
  };

  useEffect(() => {
    if (cookiePrefs) {
      applyGoogleConsent(cookiePrefs);
    }
  }, [cookiePrefs]);

  // Load GA4 only with analytics consent and a valid Measurement ID configured in Admin.
  useEffect(() => {
    const id = settings.general.ga4MeasurementId;
    if (!cookiePrefs?.analytics || !/^G-[A-Z0-9]{6,14}$/.test(id)) return;
    if (document.querySelector(`script[data-ga4="${id}"]`)) return;
    const el = document.createElement('script');
    el.async = true;
    el.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    el.setAttribute('data-ga4', id);
    document.head.appendChild(el);
    window.gtag?.('js', new Date());
    window.gtag?.('config', id, { anonymize_ip: true });
  }, [cookiePrefs?.analytics, settings.general.ga4MeasurementId]);

  // Site-wide Organization / WebSite structured data using the real origin.
  useEffect(() => {
    const origin = window.location.origin;
    document.head.querySelectorAll('script[data-site-schema="true"]').forEach((n) => n.remove());
    [
      { '@context': 'https://schema.org', '@type': 'Organization', name: settings.general.brandName, url: origin },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: settings.general.brandName,
        url: origin,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${origin}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ].forEach((schema) => {
      const el = document.createElement('script');
      el.type = 'application/ld+json';
      el.setAttribute('data-site-schema', 'true');
      el.textContent = JSON.stringify(schema);
      document.head.appendChild(el);
    });
  }, [settings.general.brandName]);

  // Keep Google Search Console verification meta tag synced with Admin settings
  useEffect(() => {
    const token = settings.general.googleSiteVerification;
    if (!token) return;
    let el = document.head.querySelector<HTMLMetaElement>('meta[name="google-site-verification"]');
    if (!el) {
      el = document.createElement('meta');
      el.name = 'google-site-verification';
      document.head.appendChild(el);
    }
    el.content = token;
  }, [settings.general.googleSiteVerification]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const toggleSaved = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isSaved = (id: string) => savedIds.includes(id);

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds((prev) => prev.filter((item) => item !== id));
      return { added: false, limitReached: false };
    }
    if (compareIds.length >= 3) {
      return { added: false, limitReached: true };
    }
    setCompareIds((prev) => [...prev, id]);
    return { added: true, limitReached: false };
  };

  const removeFromCompare = (id: string) => {
    setCompareIds((prev) => prev.filter((item) => item !== id));
  };

  const clearCompare = () => setCompareIds([]);
  const isCompared = (id: string) => compareIds.includes(id);

  const saveCookiePrefs = (prefs: Omit<CookiePreferences, 'consentedAt'>) => {
    const full: CookiePreferences = {
      ...prefs,
      necessary: true,
      consentedAt: new Date().toISOString(),
    };
    setCookiePrefs(full);
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(full));
    } catch {
      // ignore
    }
    applyGoogleConsent(full);
    setShowCookieModal(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Sign in failed.' };
      }
      setAuthUser(data.user);
      setCsrfToken(data.csrfToken);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error while signing in.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setAuthUser(null);
    setCsrfToken(null);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        savedIds,
        toggleSaved,
        isSaved,
        compareIds,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isCompared,
        cookiePrefs,
        saveCookiePrefs,
        showCookieModal,
        setShowCookieModal,
        categories,
        universities,
        scholarships,
        guides,
        legalPages,
        mediaAssets,
        settings,
        refreshSiteData,
        siteDataLoaded,
        authUser,
        csrfToken,
        authLoading,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return ctx;
}
