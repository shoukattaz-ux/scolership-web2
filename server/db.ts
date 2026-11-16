import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { SCHOLARSHIP_CATEGORIES } from '../src/data/categories.ts';
import { SCHOLARSHIPS } from '../src/data/scholarships.ts';
import { UNIVERSITIES } from '../src/data/universities.ts';
import { EDITORIAL_GUIDES } from '../src/data/guides.ts';
import { hashPassword } from './security.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'scholarpath.db');
export const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'editor')),
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    csrf_token TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS categories (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    description TEXT NOT NULL,
    seo_title TEXT NOT NULL,
    seo_description TEXT NOT NULL,
    swatch_class TEXT NOT NULL,
    text_class TEXT NOT NULL,
    border_class TEXT NOT NULL,
    surface_class TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS universities (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    initials TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    state_code TEXT NOT NULL,
    institution_type TEXT NOT NULL,
    acceptance_rate TEXT NOT NULL,
    avg_aid_package TEXT NOT NULL,
    undergrad_enrollment TEXT NOT NULL,
    website TEXT NOT NULL,
    overview TEXT NOT NULL,
    financial_aid_policy TEXT NOT NULL,
    is_sample_data INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS scholarships (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    university_slug TEXT NOT NULL,
    university_name TEXT NOT NULL,
    state TEXT NOT NULL,
    state_code TEXT NOT NULL,
    category TEXT NOT NULL,
    secondary_categories_json TEXT NOT NULL DEFAULT '[]',
    degree_levels_json TEXT NOT NULL DEFAULT '[]',
    fields_of_study_json TEXT NOT NULL DEFAULT '[]',
    amount_display TEXT NOT NULL,
    amount_numeric INTEGER NOT NULL DEFAULT 0,
    coverage_summary TEXT NOT NULL,
    covers_tuition INTEGER NOT NULL DEFAULT 1,
    covers_housing INTEGER NOT NULL DEFAULT 0,
    covers_books INTEGER NOT NULL DEFAULT 0,
    includes_stipend INTEGER NOT NULL DEFAULT 0,
    renewable TEXT NOT NULL,
    deadline_iso TEXT NOT NULL,
    deadline_label TEXT NOT NULL,
    gpa_min REAL NOT NULL DEFAULT 3.0,
    featured INTEGER NOT NULL DEFAULT 0,
    is_sample_data INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('published', 'draft')),
    tags_json TEXT NOT NULL DEFAULT '[]',
    seo_title TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    last_updated TEXT NOT NULL,
    overview TEXT NOT NULL,
    eligibility_json TEXT NOT NULL DEFAULT '[]',
    required_documents_json TEXT NOT NULL DEFAULT '[]',
    application_steps_json TEXT NOT NULL DEFAULT '[]',
    official_url TEXT NOT NULL,
    faqs_json TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS guides (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    seo_title TEXT NOT NULL,
    seo_description TEXT NOT NULL,
    category_label TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    author_bio TEXT NOT NULL,
    published_date TEXT NOT NULL,
    last_updated TEXT NOT NULL,
    read_minutes INTEGER NOT NULL DEFAULT 5,
    image_key TEXT NOT NULL DEFAULT 'readingRoom',
    custom_image_url TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('published', 'draft')),
    tags_json TEXT NOT NULL DEFAULT '[]',
    sections_json TEXT NOT NULL DEFAULT '[]',
    faqs_json TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS legal_pages (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    seo_title TEXT NOT NULL,
    seo_description TEXT NOT NULL,
    sections_json TEXT NOT NULL,
    last_updated TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS media_assets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    category TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 1280,
    height INTEGER NOT NULL DEFAULT 960,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    topic TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'reviewed', 'archived')),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS deadline_reminders (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    scholarship_slug TEXT NOT NULL,
    scholarship_title TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS backups (
    id TEXT PRIMARY KEY,
    created_by TEXT NOT NULL,
    summary_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

export const DEFAULT_SETTINGS = {
  general: {
    brandName: 'ScholarPath USA',
    shortName: 'ScholarPath',
    tagline: 'Find Fully Funded and Partial Scholarships at U.S. Universities',
    // Owner-supplied: blank values are hidden on the public site until filled in via Admin -> Settings.
    contactEmail: '',
    advertisingEmail: '',
    location: '',
    editorialTeamLead: '',
    ga4MeasurementId: '',
    googleSiteVerification: '',
    lastSiteAuditDate: '2026-11-15',
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
    // Ads stay off until the owner has an approved AdSense / Media.net account and real IDs.
    enabled: false,
    showPreApprovalSlots: false,
    primaryNetwork: 'adsense',
    adsensePublisherId: '',
    medianetCustomerId: '',
    medianetSiteId: '',
    revbitSiteId: '',
    adsTxtContent: '',
    slots: {
      header: { id: 'slot-header-leaderboard', enabled: true, network: 'adsense', slotCode: '', label: 'Advertisement', minHeightDesktop: 90, minHeightMobile: 50 },
      inContent: { id: 'slot-in-content-responsive', enabled: true, network: 'adsense', slotCode: '', label: 'Advertisement', minHeightDesktop: 250, minHeightMobile: 250 },
      sidebar: { id: 'slot-sidebar-rectangle', enabled: true, network: 'adsense', slotCode: '', label: 'Advertisement', minHeightDesktop: 250, minHeightMobile: 250 },
      footer: { id: 'slot-footer-banner', enabled: true, network: 'adsense', slotCode: '', label: 'Advertisement', minHeightDesktop: 90, minHeightMobile: 50 },
    },
  },
};

const LEGAL_CONTENT_VERSION = '2026-11-15-v2';

const DEFAULT_LEGAL_PAGES = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    seoTitle: 'Privacy Policy | ScholarPath USA',
    seoDescription:
      'How ScholarPath USA collects, uses, and protects information, including cookies, analytics, and third-party advertising, and the choices available to you.',
    lastUpdated: '2026-11-15',
    sections: [
      {
        heading: '1. Information we collect',
        body: 'You can browse the scholarship directory, quiz, and comparison tool without an account. We receive personal information only when you submit it: your name, email address, and message through the contact form, your email address (and chosen role) if you join the newsletter, and your email address plus the scholarship you picked if you request a deadline reminder. Saved scholarships, the comparison tray, theme choice, and your cookie preferences are stored in your own browser (localStorage) and are not sent to us.',
      },
      {
        heading: '2. How we use it',
        body: 'We use contact-form details to reply to you, newsletter and reminder emails to send the messages you asked for, and aggregate usage data (when you allow analytics) to understand which pages are useful. We do not sell personal information. Submissions are stored in our site database and are accessible only to authorized site administrators and editors.',
      },
      {
        heading: '3. Cookies, analytics, and advertising',
        body: 'Analytics and advertising technologies are off until you opt in through the cookie dialog (Google Consent Mode defaults every optional signal to denied). If we enable advertising, third-party vendors such as Google AdSense and Media.net may use cookies or similar identifiers to serve and measure ads, including ads based on your prior visits to this or other sites. Google’s use of advertising cookies is described at policies.google.com/technologies/ads. You can opt out of personalized advertising at myadcenter.google.com or aboutads.info, and change your choice on this site at any time from the Cookie Policy page. Advertising is only switched on after the relevant ad networks have approved the site; until then no ad code is loaded.',
      },
      {
        heading: '4. Retention and deletion',
        body: 'We keep contact messages, subscriber emails, and reminder requests only as long as needed to respond or deliver what you requested. You may ask us to access, correct, or delete the personal information we hold about you, and to unsubscribe at any time, by using the contact form or the contact email shown on the Contact page.',
      },
      {
        heading: '5. Your rights',
        body: 'Depending on where you live (for example the EU/UK under GDPR or California under the CCPA/CPRA), you may have rights to access, correct, delete, or restrict use of your personal information and to withdraw consent. Contact us to exercise them; we will respond within the timeframe required by applicable law.',
      },
      {
        heading: '6. Children',
        body: 'The site is intended for high school students, college students, parents, and counselors. We do not knowingly collect personal information from children under 13. If you believe a child has sent us personal information, contact us and we will delete it.',
      },
      {
        heading: '7. Security and changes',
        body: 'Administrator passwords are stored as salted hashes and admin actions require an authenticated session with CSRF protection. No online service is perfectly secure, so we cannot guarantee absolute security. We will update this page, and its date, when our practices change.',
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    seoTitle: 'Terms & Conditions | ScholarPath USA',
    seoDescription:
      'Terms governing use of the ScholarPath USA scholarship directory, comparison tool, and educational guides.',
    lastUpdated: '2026-11-15',
    sections: [
      {
        heading: '1. Acceptance of terms',
        body: 'By using ScholarPath USA you agree to these terms. If you do not agree, please do not use the site.',
      },
      {
        heading: '2. Information only; no application is submitted',
        body: 'Listings, guides, and tools are provided for general educational research. Using the quiz, saving, or comparing a scholarship does not submit an application to any university, and nothing here is professional financial, legal, or admissions advice. Always confirm amounts, eligibility, and deadlines with the sponsoring institution.',
      },
      {
        heading: '3. Accuracy',
        body: 'We work to keep information accurate and corrected promptly (see the Editorial Policy), but scholarship terms change and we provide the site "as is" without warranties. Some entries are labeled as sample or unverified records; treat those only as illustrative.',
      },
      {
        heading: '4. Acceptable use and intellectual property',
        body: 'Original text, layout, and tools belong to ScholarPath USA. You may link to and quote short excerpts with attribution. You may not scrape the site at scale, republish it, attempt to disrupt it, or probe it for vulnerabilities without permission. Third-party names and marks belong to their owners and are used only to identify the institutions concerned.',
      },
      {
        heading: '5. Third-party links and advertising',
        body: 'We link to university and government websites that we do not control. Where advertising is shown it is labeled as advertising and does not affect which scholarships are listed or how they are ordered.',
      },
      {
        heading: '6. Liability and changes',
        body: 'To the extent permitted by law, ScholarPath USA is not liable for losses arising from reliance on information on the site. We may update these terms; continued use after an update means you accept the revised terms.',
      },
    ],
  },
  {
    slug: 'disclaimer',
    title: 'Disclaimer',
    seoTitle: 'Disclaimer | ScholarPath USA',
    seoDescription:
      'ScholarPath USA is an independent site, not affiliated with any university, FAFSA, or the U.S. government. Verify all details with the official source.',
    lastUpdated: '2026-11-15',
    sections: [
      {
        heading: '1. Independence',
        body: 'ScholarPath USA is an independent informational website. It is not affiliated with, endorsed by, or connected to any college or university, state agency, Federal Student Aid (FAFSA), or the U.S. Department of Education.',
      },
      {
        heading: '2. Verify before you apply',
        body: 'Universities change award amounts, GPA requirements, and deadlines. Some records in this directory are marked as sample or unverified entries and may not reflect current terms. Confirm every detail on the sponsoring university’s official financial aid pages before you apply or make decisions.',
      },
      {
        heading: '3. No guarantees',
        body: 'We cannot guarantee that you will qualify for or receive any scholarship. Quiz results and comparisons are informational estimates only.',
      },
      {
        heading: '4. Advertising disclosure',
        body: 'If third-party advertising is enabled, it will be clearly labeled as advertising. Advertisers do not influence listings, guide content, or quiz results.',
      },
    ],
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    seoTitle: 'Cookie Policy | ScholarPath USA',
    seoDescription:
      'What browser storage and cookies ScholarPath USA uses, and how to change your analytics and advertising consent.',
    lastUpdated: '2026-11-15',
    sections: [
      {
        heading: '1. Essential browser storage',
        body: 'We store your light/dark theme, saved scholarships, comparison tray, and cookie choice in your browser so the site works as you expect. Admin users also receive a secure session cookie when signing in. These are not used for tracking.',
      },
      {
        heading: '2. Analytics (optional)',
        body: 'If analytics is configured, it only runs after you consent. Without consent, analytics storage stays denied.',
      },
      {
        heading: '3. Advertising (optional)',
        body: 'If advertising is enabled after approval by the ad networks, advertising cookies (for example from Google AdSense or Media.net) are only requested after you consent. Declining does not limit access to any content.',
      },
      {
        heading: '4. Changing your choice',
        body: 'Use the "Manage cookie preferences" control on this page or in the site footer at any time, or clear this site’s data in your browser settings.',
      },
    ],
  },
  {
    slug: 'editorial-policy',
    title: 'Editorial Policy & Corrections',
    seoTitle: 'Editorial Policy & Corrections | ScholarPath USA',
    seoDescription:
      'How ScholarPath USA prepares, reviews, labels, and corrects scholarship listings and guides.',
    lastUpdated: '2026-11-15',
    sections: [
      {
        heading: '1. Purpose',
        body: 'ScholarPath USA exists to help students and families understand how U.S. university scholarships differ, for example full-tuition versus partial awards, so they can decide where to look and what to verify.',
      },
      {
        heading: '2. How content is prepared',
        body: 'Scholarship entries should be built from the sponsoring institution’s official pages, and each entry links to that source. Guides explain general financial aid concepts in plain language and should cite official sources (such as studentaid.gov or an institution’s financial aid office) for any figure, rule, or deadline.',
      },
      {
        heading: '3. Review status',
        body: 'Every guide and scholarship has an editorial status in the admin panel: Draft, Pending Review, Needs Revision, Reviewed, or Published. Content is only marked Reviewed after a person has checked it against the official source. Entries not yet verified are labeled as sample/unverified on the page and are not treated as authoritative.',
      },
      {
        heading: '4. Independence from advertising',
        body: 'Advertising, if enabled, never determines what is listed, how it is ranked, or what a guide recommends. We do not accept payment for placement in scholarship listings.',
      },
      {
        heading: '5. Corrections',
        body: 'If you find an error or an out-of-date deadline, tell us through the Contact page, including the page address and the official source. We review reports promptly, correct confirmed errors, and update the "last updated" date on the page.',
      },
    ],
  },
];

function seedDatabaseIfEmpty() {
  const userCount = (db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number }).cnt;
  if (userCount === 0) {
    // No hard-coded credentials. The first admin comes from ADMIN_EMAIL / ADMIN_PASSWORD,
    // otherwise a random one-time password is generated and printed to the server log once.
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@localhost').toLowerCase();
    let adminPassword = process.env.ADMIN_PASSWORD || '';
    let generated = false;
    if (adminPassword.length < 12) {
      adminPassword = crypto.randomBytes(12).toString('base64url');
      generated = true;
    }
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role, active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)'
    ).run('usr_admin_01', process.env.ADMIN_NAME || 'Site Administrator', adminEmail, hashPassword(adminPassword), 'admin', new Date().toISOString());
    if (generated) {
      console.log(`[setup] Created admin account ${adminEmail} with one-time password: ${adminPassword}`);
      console.log('[setup] Set ADMIN_EMAIL / ADMIN_PASSWORD (12+ chars) before first start to choose your own.');
    }
  }

  // One-time cleanup of the previously shipped demo accounts (known public passwords).
  const demo = db.prepare("SELECT id FROM users WHERE email IN ('admin@scholarpathusa.example.com','editor@scholarpathusa.example.com')").all() as Array<{ id: string }>;
  if (demo.length) {
    const remaining = (db.prepare("SELECT COUNT(*) as cnt FROM users WHERE email NOT LIKE '%@scholarpathusa.example.com' AND role = 'admin' AND active = 1").get() as { cnt: number }).cnt;
    if (remaining > 0) {
      demo.forEach((u) => db.prepare('DELETE FROM users WHERE id = ?').run(u.id));
      console.log('[setup] Removed legacy demo admin/editor accounts.');
    } else {
      console.warn('[setup] WARNING: legacy demo accounts exist with publicly known passwords. Create a real admin and remove them.');
    }
  }

  const catCount = (db.prepare('SELECT COUNT(*) as cnt FROM categories').get() as { cnt: number }).cnt;
  if (catCount === 0) {
    const stmt = db.prepare(`
      INSERT INTO categories (slug, name, short_name, description, seo_title, seo_description, swatch_class, text_class, border_class, surface_class, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    SCHOLARSHIP_CATEGORIES.forEach((c, idx) => {
      stmt.run(
        c.slug,
        c.name,
        c.shortName,
        c.description,
        c.seoTitle,
        c.seoDescription,
        c.swatchClass,
        c.textClass,
        c.borderClass,
        c.surfaceClass,
        idx
      );
    });
  }

  const uniCount = (db.prepare('SELECT COUNT(*) as cnt FROM universities').get() as { cnt: number }).cnt;
  if (uniCount === 0) {
    const stmt = db.prepare(`
      INSERT INTO universities (slug, name, short_name, initials, city, state, state_code, institution_type, acceptance_rate, avg_aid_package, undergrad_enrollment, website, overview, financial_aid_policy, is_sample_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    UNIVERSITIES.forEach((u) => {
      stmt.run(
        u.slug,
        u.name,
        u.shortName,
        u.initials,
        u.city,
        u.state,
        u.stateCode,
        u.institutionType,
        u.acceptanceRate,
        u.avgAidPackage,
        u.undergradEnrollment,
        u.website,
        u.overview,
        u.financialAidPolicy,
        u.isSampleData ? 1 : 0
      );
    });
  }

  const schCount = (db.prepare('SELECT COUNT(*) as cnt FROM scholarships').get() as { cnt: number }).cnt;
  if (schCount === 0) {
    const stmt = db.prepare(`
      INSERT INTO scholarships (
        id, slug, title, university_slug, university_name, state, state_code, category,
        secondary_categories_json, degree_levels_json, fields_of_study_json,
        amount_display, amount_numeric, coverage_summary, covers_tuition, covers_housing,
        covers_books, includes_stipend, renewable, deadline_iso, deadline_label,
        gpa_min, featured, is_sample_data, status, tags_json, seo_title, seo_description,
        last_updated, overview, eligibility_json, required_documents_json,
        application_steps_json, official_url, faqs_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', '[]', '', '', ?, ?, ?, ?, ?, ?, ?)
    `);
    SCHOLARSHIPS.forEach((s) => {
      stmt.run(
        s.id,
        s.slug,
        s.title,
        s.universitySlug,
        s.universityName,
        s.state,
        s.stateCode,
        s.category,
        JSON.stringify(s.secondaryCategories || []),
        JSON.stringify(s.degreeLevels),
        JSON.stringify(s.fieldsOfStudy),
        s.amountDisplay,
        s.amountNumeric,
        s.coverageSummary,
        s.coversTuition ? 1 : 0,
        s.coversHousing ? 1 : 0,
        s.coversBooks ? 1 : 0,
        s.includesStipend ? 1 : 0,
        s.renewable,
        s.deadlineISO,
        s.deadlineLabel,
        s.gpaMin,
        s.featured ? 1 : 0,
        s.isSampleData ? 1 : 0,
        s.lastUpdated,
        s.overview,
        JSON.stringify(s.eligibility),
        JSON.stringify(s.requiredDocuments),
        JSON.stringify(s.applicationSteps),
        s.officialUrl,
        JSON.stringify(s.faqs)
      );
    });
  }

  const guideCount = (db.prepare('SELECT COUNT(*) as cnt FROM guides').get() as { cnt: number }).cnt;
  if (guideCount === 0) {
    const stmt = db.prepare(`
      INSERT INTO guides (
        slug, title, seo_title, seo_description, category_label, excerpt,
        author_name, author_role, author_bio, published_date, last_updated,
        read_minutes, image_key, custom_image_url, status, tags_json, sections_json, faqs_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', 'published', '[]', ?, ?)
    `);
    EDITORIAL_GUIDES.forEach((g) => {
      stmt.run(
        g.slug,
        g.title,
        g.seoTitle,
        g.seoDescription,
        g.categoryLabel,
        g.excerpt,
        g.authorName,
        g.authorRole,
        g.authorBio,
        g.publishedDate,
        g.lastUpdated,
        g.readMinutes,
        g.imageKey,
        JSON.stringify(g.sections),
        JSON.stringify(g.faqs)
      );
    });
  }

  const legalCount = (db.prepare('SELECT COUNT(*) as cnt FROM legal_pages').get() as { cnt: number }).cnt;
  if (legalCount === 0) {
    const stmt = db.prepare(`
      INSERT INTO legal_pages (slug, title, seo_title, seo_description, sections_json, last_updated)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    DEFAULT_LEGAL_PAGES.forEach((lp) => {
      stmt.run(
        lp.slug,
        lp.title,
        lp.seoTitle,
        lp.seoDescription,
        JSON.stringify(lp.sections),
        lp.lastUpdated
      );
    });
  }

  // Refresh the shipped legal text once (versioned), and add pages introduced later.
  const legalVer = db.prepare("SELECT value_json FROM site_settings WHERE key = 'legal_content_version'").get() as { value_json: string } | undefined;
  if (!legalVer || JSON.parse(legalVer.value_json) !== LEGAL_CONTENT_VERSION) {
    const upsert = db.prepare(`
      INSERT INTO legal_pages (slug, title, seo_title, seo_description, sections_json, last_updated)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET title = excluded.title, seo_title = excluded.seo_title,
        seo_description = excluded.seo_description, sections_json = excluded.sections_json, last_updated = excluded.last_updated
    `);
    DEFAULT_LEGAL_PAGES.forEach((lp) => {
      const prev = db.prepare('SELECT last_updated FROM legal_pages WHERE slug = ?').get(lp.slug) as { last_updated: string } | undefined;
      // Replace only text that is still the originally shipped seed (never overwrite owner edits).
      if (!prev || prev.last_updated === '2026-11-15') {
        upsert.run(lp.slug, lp.title, lp.seoTitle, lp.seoDescription, JSON.stringify(lp.sections), lp.lastUpdated);
      }
    });
    db.prepare(
      `INSERT INTO site_settings (key, value_json, updated_at) VALUES ('legal_content_version', ?, ?)
       ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at`
    ).run(JSON.stringify(LEGAL_CONTENT_VERSION), new Date().toISOString());
  }

  const settingsCount = (db.prepare("SELECT COUNT(*) as cnt FROM site_settings WHERE key = 'general'").get() as { cnt: number }).cnt;
  if (settingsCount === 0) {
    const now = new Date().toISOString();
    const stmt = db.prepare('INSERT INTO site_settings (key, value_json, updated_at) VALUES (?, ?, ?)');
    Object.entries(DEFAULT_SETTINGS).forEach(([k, val]) => {
      stmt.run(k, JSON.stringify(val), now);
    });
  }

  const mediaCount = (db.prepare('SELECT COUNT(*) as cnt FROM media_assets').get() as { cnt: number }).cnt;
  if (mediaCount === 0) {
    const now = new Date().toISOString();
    const stmt = db.prepare(
      'INSERT INTO media_assets (id, title, url, alt_text, category, width, height, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const defaults = [
      ['media_hero_campus', 'Campus Quad & Library Hero', '/images/hero_campus_library_1794638342764.jpg', 'Diverse U.S. college students walking across a sunlit red-brick university quad toward the campus library', 'Hero', 1408, 768],
      ['media_graduation', 'Commencement Graduates', '/images/students_graduation_success_1794638342911.jpg', 'Diverse graduating university students in navy and gold academic gowns celebrating scholarship completion on campus', 'Guides', 1280, 960],
      ['media_stem_lab', 'STEM Research Lab', '/images/stem_research_lab_1794638342903.jpg', 'Diverse university STEM students collaborating at a sunlit laboratory bench with scientific instruments', 'STEM', 1280, 960],
      ['media_reading_room', 'Library Reading Room', '/images/university_reading_room_1794638343996.jpg', 'Students studying in a sunlit American university library reading room with oak tables and brass lamps', 'Financial Aid', 1280, 960],
      ['media_counselor_essay', 'Counselor Essay Advising', '/images/counselor_student_essay_1794638343904.jpg', 'High school senior reviewing scholarship application essays and financial aid portal with a college advisor', 'Essays', 1280, 960],
    ] as const;

    defaults.forEach(([id, title, url, alt, cat, w, h]) => {
      stmt.run(id, title, url, alt, cat, w, h, now);
    });
  }
}

seedDatabaseIfEmpty();

// ---------- Schema & data migrations (idempotent) ----------
function addColumnIfMissing(table: string, column: string, ddl: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!cols.some((c) => c.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
}
// Editorial workflow: Draft -> Pending Review -> Needs Revision -> Reviewed (human sign-off). Publishing stays in `status`.
for (const table of ['guides', 'scholarships']) {
  addColumnIfMissing(table, 'review_status', "TEXT NOT NULL DEFAULT 'pending_review'");
  addColumnIfMissing(table, 'reviewed_by', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(table, 'reviewed_at', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(table, 'review_notes', "TEXT NOT NULL DEFAULT ''");
}
addColumnIfMissing('guides', 'sources_json', "TEXT NOT NULL DEFAULT '[]'");
addColumnIfMissing('guides', 'publish_at', "TEXT NOT NULL DEFAULT ''");
addColumnIfMissing('guides', 'image_alt', "TEXT NOT NULL DEFAULT ''");

// Image files moved from /src/assets/images to /images (works in production builds).
db.prepare("UPDATE media_assets SET url = REPLACE(url, '/src/assets/images/', '/images/') WHERE url LIKE '/src/assets/images/%'").run();

// Replace invented people/credentials and placeholder contact details that earlier versions shipped.
db.prepare(
  `UPDATE guides SET author_name = 'ScholarPath USA Editorial', author_role = 'Editorial Team',
     author_bio = 'Prepared by the ScholarPath USA editorial team. See the Editorial Policy for how guides are reviewed and corrected.'
   WHERE author_name IN ('Dr. Elena Morales, Ed.D.', 'Marcus Vance, M.Ed.', 'Priya Nair, M.S.')`
).run();
{
  const row = db.prepare("SELECT value_json FROM site_settings WHERE key = 'general'").get() as { value_json: string } | undefined;
  if (row) {
    try {
      const g = JSON.parse(row.value_json);
      let changed = false;
      for (const k of ['contactEmail', 'advertisingEmail']) {
        if (typeof g[k] === 'string' && /@scholarpathusa\.example\.com$/.test(g[k])) { g[k] = ''; changed = true; }
      }
      if (g.location === 'Boston, Massachusetts, USA') { g.location = ''; changed = true; }
      if (g.editorialTeamLead === 'Dr. Elena Morales, Ed.D.') { g.editorialTeamLead = ''; changed = true; }
      if (g.ga4MeasurementId === 'G-XXXXXXXXXX') { g.ga4MeasurementId = ''; changed = true; }
      if (g.googleSiteVerification === 'YOUR_GOOGLE_SEARCH_CONSOLE_TOKEN') { g.googleSiteVerification = ''; changed = true; }
      if (changed) db.prepare("UPDATE site_settings SET value_json = ?, updated_at = ? WHERE key = 'general'").run(JSON.stringify(g), new Date().toISOString());
    } catch { /* leave as is */ }
  }
  const mrow = db.prepare("SELECT value_json FROM site_settings WHERE key = 'monetization'").get() as { value_json: string } | undefined;
  if (mrow) {
    try {
      const m = JSON.parse(mrow.value_json);
      let changed = false;
      if (m.adsensePublisherId === 'ca-pub-0000000000000000') { m.adsensePublisherId = ''; changed = true; }
      if (m.medianetCustomerId === '8CU000000') { m.medianetCustomerId = ''; changed = true; }
      if (m.medianetSiteId === 'medianet-site-placeholder') { m.medianetSiteId = ''; changed = true; }
      if (m.revbitSiteId === 'revbit-site-placeholder-id') { m.revbitSiteId = ''; changed = true; }
      if (typeof m.adsTxtContent === 'string' && m.adsTxtContent.includes('pub-0000000000000000')) { m.adsTxtContent = ''; changed = true; }
      for (const k of Object.keys(m.slots || {})) {
        if (/^[1-4]000000\d{3}$/.test(m.slots[k].slotCode || '')) { m.slots[k].slotCode = ''; changed = true; }
      }
      if (changed) db.prepare("UPDATE site_settings SET value_json = ?, updated_at = ? WHERE key = 'monetization'").run(JSON.stringify(m), new Date().toISOString());
    } catch { /* leave as is */ }
  }
}

// A guide is publicly visible only when published and any scheduled publish time has passed.
export const LIVE_GUIDE_SQL = "status = 'published' AND (publish_at = '' OR publish_at <= strftime('%Y-%m-%dT%H:%M', 'now'))";
export function isGuideLive(row: { status: string; publish_at?: string }) {
  return row.status === 'published' && (!row.publish_at || row.publish_at <= new Date().toISOString().slice(0, 16));
}

export const REVIEW_STATUSES = ['draft', 'pending_review', 'needs_revision', 'reviewed'] as const;

// Row mapper helpers
export function mapScholarshipRow(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    universitySlug: row.university_slug,
    universityName: row.university_name,
    state: row.state,
    stateCode: row.state_code,
    category: row.category,
    secondaryCategories: JSON.parse(row.secondary_categories_json || '[]'),
    degreeLevels: JSON.parse(row.degree_levels_json || '[]'),
    fieldsOfStudy: JSON.parse(row.fields_of_study_json || '[]'),
    amountDisplay: row.amount_display,
    amountNumeric: Number(row.amount_numeric),
    coverageSummary: row.coverage_summary,
    coversTuition: Boolean(row.covers_tuition),
    coversHousing: Boolean(row.covers_housing),
    coversBooks: Boolean(row.covers_books),
    includesStipend: Boolean(row.includes_stipend),
    renewable: row.renewable,
    deadlineISO: row.deadline_iso,
    deadlineLabel: row.deadline_label,
    gpaMin: Number(row.gpa_min),
    featured: Boolean(row.featured),
    isSampleData: Boolean(row.is_sample_data),
    status: row.status || 'published',
    tags: JSON.parse(row.tags_json || '[]'),
    seoTitle: row.seo_title || '',
    seoDescription: row.seo_description || '',
    lastUpdated: row.last_updated,
    overview: row.overview,
    eligibility: JSON.parse(row.eligibility_json || '[]'),
    requiredDocuments: JSON.parse(row.required_documents_json || '[]'),
    applicationSteps: JSON.parse(row.application_steps_json || '[]'),
    officialUrl: row.official_url,
    faqs: JSON.parse(row.faqs_json || '[]'),
    reviewStatus: row.review_status || 'pending_review',
    reviewedBy: row.reviewed_by || '',
    reviewedAt: row.reviewed_at || '',
    reviewNotes: row.review_notes || '',
  };
}

export function mapCategoryRow(row: any) {
  return {
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    description: row.description,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    swatchClass: row.swatch_class,
    textClass: row.text_class,
    borderClass: row.border_class,
    surfaceClass: row.surface_class,
    sortOrder: Number(row.sort_order),
  };
}

export function mapUniversityRow(row: any) {
  return {
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    initials: row.initials,
    city: row.city,
    state: row.state,
    stateCode: row.state_code,
    institutionType: row.institution_type,
    acceptanceRate: row.acceptance_rate,
    avgAidPackage: row.avg_aid_package,
    undergradEnrollment: row.undergrad_enrollment,
    website: row.website,
    overview: row.overview,
    financialAidPolicy: row.financial_aid_policy,
    isSampleData: Boolean(row.is_sample_data),
  };
}

export function mapGuideRow(row: any) {
  return {
    slug: row.slug,
    title: row.title,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    categoryLabel: row.category_label,
    excerpt: row.excerpt,
    authorName: row.author_name,
    authorRole: row.author_role,
    authorBio: row.author_bio,
    publishedDate: row.published_date,
    lastUpdated: row.last_updated,
    readMinutes: Number(row.read_minutes),
    imageKey: row.image_key,
    customImageUrl: row.custom_image_url || '',
    status: row.status || 'published',
    tags: JSON.parse(row.tags_json || '[]'),
    sections: JSON.parse(row.sections_json || '[]'),
    faqs: JSON.parse(row.faqs_json || '[]'),
    reviewStatus: row.review_status || 'pending_review',
    reviewedBy: row.reviewed_by || '',
    reviewedAt: row.reviewed_at || '',
    reviewNotes: row.review_notes || '',
    sources: JSON.parse(row.sources_json || '[]'),
    publishAt: row.publish_at || '',
    imageAlt: row.image_alt || '',
  };
}

export function getAllSettings() {
  const rows = db.prepare('SELECT key, value_json FROM site_settings').all() as Array<{ key: string; value_json: string }>;
  const settings: any = structuredClone(DEFAULT_SETTINGS);
  rows.forEach((r) => {
    if (!(r.key in DEFAULT_SETTINGS)) return;
    try {
      settings[r.key] = JSON.parse(r.value_json);
    } catch {
      // keep default
    }
  });
  return settings;
}
