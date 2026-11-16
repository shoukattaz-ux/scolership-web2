import 'dotenv/config';
import crypto from 'node:crypto';
import express, { type Request, type Response, type NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import {
  db,
  getAllSettings,
  isGuideLive,
  LIVE_GUIDE_SQL,
  REVIEW_STATUSES,
  mapCategoryRow,
  mapGuideRow,
  mapScholarshipRow,
  mapUniversityRow,
} from './server/db.ts';
import { applyPage, resolvePage } from './server/render.ts';
import {
  hashPassword,
  isValidEmail,
  parseCookies,
  rateLimit,
  sanitizeRichText,
  sanitizeText,
  sanitizeUrl,
  signSessionId,
  slugify,
  verifyPassword,
  verifySignedSessionToken,
} from './server/security.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';
const SESSION_COOKIE_NAME = 'sp_session';

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  sessionId: string;
  csrfToken: string;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
    }
  }
}

function getBaseUrl(req: Request): string {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

function getAuthenticatedSession(req: Request): AuthenticatedUser | null {
  const cookies = parseCookies(req.headers.cookie);
  const rawToken = cookies[SESSION_COOKIE_NAME];
  const sessionId = verifySignedSessionToken(rawToken);
  if (!sessionId) return null;

  const row = db
    .prepare(
      `SELECT s.id as session_id, s.csrf_token, s.expires_at, u.id, u.name, u.email, u.role, u.active
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    )
    .get(sessionId) as any;

  if (!row || !row.active) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    sessionId: row.session_id,
    csrfToken: row.csrf_token,
  };
}

function requireAuth(roles?: Array<'admin' | 'editor'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = getAuthenticatedSession(req);
    if (!auth) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }
    if (roles && !roles.includes(auth.role)) {
      return res.status(403).json({ error: 'Insufficient permissions for this action.' });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const sentCsrf = req.headers['x-csrf-token'];
      if (typeof sentCsrf !== 'string' || sentCsrf !== auth.csrfToken) {
        return res.status(403).json({ error: 'Invalid or missing CSRF security token.' });
      }
    }
    req.authUser = auth;
    return next();
  };
}


/** Applies the human-review rules. Only admins can mark content Reviewed; publishing needs a prior review. */
function resolveEditorial(
  req: Request,
  body: any,
  existing: { status?: string; review_status?: string; reviewed_by?: string; reviewed_at?: string } | null
) {
  const wantsStatus = body.status === 'draft' ? 'draft' : body.status === 'published' ? 'published' : existing?.status || 'draft';
  let review = (REVIEW_STATUSES as readonly string[]).includes(body.reviewStatus)
    ? (body.reviewStatus as string)
    : existing?.review_status || 'pending_review';
  let reviewedBy = existing?.reviewed_by || '';
  let reviewedAt = existing?.reviewed_at || '';
  const isAdmin = req.authUser!.role === 'admin';

  if (review === 'reviewed' && existing?.review_status !== 'reviewed') {
    if (!isAdmin) return { error: 'Only an administrator can mark content as Reviewed after checking it.' } as const;
    reviewedBy = req.authUser!.name;
    reviewedAt = new Date().toISOString();
  }
  if (review !== 'reviewed') {
    reviewedBy = '';
    reviewedAt = '';
  }
  if (wantsStatus === 'published' && review !== 'reviewed' && existing?.status !== 'published') {
    return { error: 'Content must be marked Reviewed (by an administrator) before it can be published.' } as const;
  }
  return { status: wantsStatus, review, reviewedBy, reviewedAt } as const;
}

function cleanSources(input: unknown): Array<{ label: string; url: string }> {
  if (!Array.isArray(input)) return [];
  return input
    .map((x: any) => ({ label: sanitizeText(x?.label, 160), url: sanitizeUrl(x?.url) }))
    .filter((x) => x.label && x.url)
    .slice(0, 20);
}

function ensureSessionSecret() {
  if (process.env.SESSION_SECRET) return;
  const row = db.prepare("SELECT value_json FROM site_settings WHERE key = 'session_secret'").get() as { value_json: string } | undefined;
  if (row) {
    process.env.SESSION_SECRET = JSON.parse(row.value_json);
    return;
  }
  const secret = crypto.randomBytes(32).toString('hex');
  db.prepare("INSERT INTO site_settings (key, value_json, updated_at) VALUES ('session_secret', ?, ?)").run(
    JSON.stringify(secret),
    new Date().toISOString()
  );
  process.env.SESSION_SECRET = secret;
}

async function startServer() {
  ensureSessionSecret();
  const app = express();
  app.set('trust proxy', 1);

  // Baseline security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    if (isProduction && !_req.path.startsWith('/api/')) {
      // Allows only this site plus the Google (AdSense/Analytics/Fonts) and Media.net hosts the site can load.
      res.setHeader(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://adservice.google.com https://www.google.com https://contextual.media.net https://*.media.net",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https:",
          "connect-src 'self' https:",
          "frame-src https://googleads.g.doubleclick.net https://*.googlesyndication.com https://www.google.com https://*.media.net",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'self'",
        ].join('; ')
      );
    }
    if (isProduction) res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    if (_req.path.startsWith('/api/')) res.setHeader('Cache-Control', res.getHeader('Cache-Control') || 'no-store');
    next();
  });

  app.use(express.json({ limit: '3mb' }));

  // --- Dynamic SEO & Ad Monetization Files ---
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = getBaseUrl(req);
    const today = new Date().toISOString().split('T')[0];

    const staticRoutes = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/scholarships', priority: '0.9', changefreq: 'daily' },
      { loc: '/universities', priority: '0.8', changefreq: 'weekly' },
      { loc: '/guides', priority: '0.8', changefreq: 'weekly' },
      { loc: '/quiz', priority: '0.8', changefreq: 'monthly' },
      { loc: '/compare', priority: '0.6', changefreq: 'monthly' },
      { loc: '/about', priority: '0.6', changefreq: 'monthly' },
      { loc: '/contact', priority: '0.5', changefreq: 'monthly' },
      { loc: '/advertise', priority: '0.5', changefreq: 'monthly' },
      { loc: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
      { loc: '/disclaimer', priority: '0.3', changefreq: 'yearly' },
      { loc: '/editorial-policy', priority: '0.4', changefreq: 'yearly' },
      { loc: '/cookie-policy', priority: '0.3', changefreq: 'yearly' },
      { loc: '/sitemap', priority: '0.4', changefreq: 'weekly' },
    ];

    const categories = db.prepare('SELECT slug FROM categories ORDER BY sort_order ASC').all() as Array<{ slug: string }>;
    const scholarships = db
      .prepare("SELECT slug, last_updated FROM scholarships WHERE status = 'published' AND is_sample_data = 0")
      .all() as Array<{ slug: string; last_updated: string }>;
    const universities = db.prepare('SELECT slug FROM universities WHERE is_sample_data = 0').all() as Array<{ slug: string }>;
    const guides = db
      .prepare(`SELECT slug, last_updated FROM guides WHERE ${LIVE_GUIDE_SQL}`)
      .all() as Array<{ slug: string; last_updated: string }>;

    const allUrls = [
      ...staticRoutes,
      ...categories.map((c) => ({ loc: `/scholarships/${c.slug}`, priority: '0.85', changefreq: 'weekly' })),
      ...scholarships.map((s) => ({
        loc: `/scholarship/${s.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: s.last_updated,
      })),
      ...universities.map((u) => ({ loc: `/university/${u.slug}`, priority: '0.75', changefreq: 'monthly' })),
      ...guides.map((g) => ({
        loc: `/guides/${g.slug}`,
        priority: '0.8',
        changefreq: 'monthly',
        lastmod: g.last_updated,
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
    <lastmod>${'lastmod' in u && u.lastmod ? u.lastmod : today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=300');
    res.send(xml);
  });

  app.get('/robots.txt', (req, res) => {
    const baseUrl = getBaseUrl(req);
    res.type('text/plain').send(
      `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /saved

Sitemap: ${baseUrl}/sitemap.xml
`
    );
  });

  app.get('/ads.txt', (_req, res) => {
    const settings = getAllSettings();
    const content =
      settings.monetization?.adsTxtContent ||
      '# ScholarPath USA ads.txt configuration\n';
    res.header('Cache-Control', 'public, max-age=300');
    res.type('text/plain').send(content);
  });

  // --- Public Read APIs ---
  const buildBootstrap = () => {
    const categories = (
      db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all() as any[]
    ).map(mapCategoryRow);

    const sampleOk = Boolean(getAllSettings().general.showSampleData);
    const sampleFilter = sampleOk ? '' : ' AND is_sample_data = 0';
    const universities = (
      db.prepare(`SELECT * FROM universities ${sampleOk ? '' : 'WHERE is_sample_data = 0'} ORDER BY name ASC`).all() as any[]
    ).map(mapUniversityRow);
    const scholarships = (
      db
        .prepare(`SELECT * FROM scholarships WHERE status = 'published'${sampleFilter} ORDER BY deadline_iso ASC`)
        .all() as any[]
    ).map(mapScholarshipRow);

    const guides = (
      db.prepare(`SELECT * FROM guides WHERE ${LIVE_GUIDE_SQL} ORDER BY last_updated DESC`).all() as any[]
    ).map(mapGuideRow);

    const legalRows = db.prepare('SELECT * FROM legal_pages').all() as any[];
    const legalPages = legalRows.map((row) => ({
      slug: row.slug,
      title: row.title,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      sections: JSON.parse(row.sections_json || '[]'),
      lastUpdated: row.last_updated,
    }));

    const mediaAssets = db.prepare('SELECT * FROM media_assets ORDER BY created_at DESC').all();
    const settings = getAllSettings();

    return {
      categories,
      universities,
      scholarships,
      guides,
      legalPages,
      mediaAssets,
      settings,
    };
  };

  app.get('/api/bootstrap', (_req, res) => {
    res.header('Cache-Control', 'public, max-age=30');
    res.json(buildBootstrap());
  });

  app.get('/api/search', (req, res) => {
    const rawQ = sanitizeText(req.query.q, 120);
    if (!rawQ) {
      return res.json({ scholarships: [], universities: [], guides: [] });
    }
    const pattern = `%${rawQ}%`;
    const hideSample = !getAllSettings().general.showSampleData;
    const scholarships = (
      db
        .prepare(
          `SELECT * FROM scholarships
           WHERE status = 'published' ${hideSample ? 'AND is_sample_data = 0' : ''}
             AND (title LIKE ? OR university_name LIKE ? OR state LIKE ? OR overview LIKE ?)
           LIMIT 20`
        )
        .all(pattern, pattern, pattern, pattern) as any[]
    ).map(mapScholarshipRow);

    const universities = (
      db
        .prepare(`SELECT * FROM universities WHERE (name LIKE ? OR state LIKE ? OR city LIKE ?) ${hideSample ? 'AND is_sample_data = 0' : ''} LIMIT 10`)
        .all(pattern, pattern, pattern) as any[]
    ).map(mapUniversityRow);

    const guides = (
      db
        .prepare(`SELECT * FROM guides WHERE ${LIVE_GUIDE_SQL} AND (title LIKE ? OR excerpt LIKE ?) LIMIT 10`)
        .all(pattern, pattern) as any[]
    ).map(mapGuideRow);

    return res.json({ scholarships, universities, guides });
  });

  // --- Public Form Submission Endpoints (Rate-Limited + Validated + Sanitized) ---
  app.post(
    '/api/contact',
    rateLimit({ windowMs: 60_000, max: 10, keyPrefix: 'contact' }),
    (req, res) => {
      // Honeypot: real visitors never fill this hidden field; bots usually do.
      if (typeof req.body?.website === 'string' && req.body.website.trim() !== '') {
        return res.status(200).json({ success: true, message: 'Thank you. Your message has been received.', referenceId: 'ok' });
      }
      const name = sanitizeText(req.body?.name, 120);
      const email = sanitizeText(req.body?.email, 160);
      const topic = sanitizeText(req.body?.topic, 120) || 'General Inquiry';
      const message = sanitizeText(req.body?.message, 3000);

      if (name.length < 2) {
        return res.status(400).json({ error: 'Please provide your full name.' });
      }
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }
      if (message.length < 10) {
        return res.status(400).json({ error: 'Please include a message of at least 10 characters.' });
      }

      const id = `msg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const now = new Date().toISOString();
      db.prepare(
        "INSERT INTO contact_messages (id, name, email, topic, message, status, created_at) VALUES (?, ?, ?, ?, ?, 'new', ?)"
      ).run(id, name, email.toLowerCase(), topic, message, now);

      return res.status(200).json({
        success: true,
        message: 'Thank you. Your message has been received and we will reply by email as soon as we can.',
        referenceId: id,
      });
    }
  );

  // --- Authentication APIs ---
  app.post(
    '/api/auth/login',
    rateLimit({ windowMs: 15 * 60_000, max: 20, keyPrefix: 'auth_login' }),
    (req, res) => {
      const email = sanitizeText(req.body?.email, 160).toLowerCase();
      const password = typeof req.body?.password === 'string' ? req.body.password : '';

      if (!isValidEmail(email) || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = db
        .prepare('SELECT id, name, email, password_hash, role, active FROM users WHERE email = ?')
        .get(email) as any;

      if (!user || !user.active || !verifyPassword(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const sessionId = crypto.randomBytes(24).toString('hex');
      const csrfToken = crypto.randomBytes(24).toString('hex');
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

      db.prepare(
        'INSERT INTO sessions (id, user_id, csrf_token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
      ).run(sessionId, user.id, csrfToken, expiresAt, now.toISOString());

      const signed = signSessionId(sessionId);
      const isHttps = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https';

      res.cookie(SESSION_COOKIE_NAME, signed, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isHttps,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        csrfToken,
      });
    }
  );

  app.post('/api/auth/logout', (req, res) => {
    const auth = getAuthenticatedSession(req);
    if (auth) {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(auth.sessionId);
    }
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    return res.json({ success: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const auth = getAuthenticatedSession(req);
    if (!auth) {
      return res.json({ user: null, csrfToken: null });
    }
    return res.json({
      user: {
        id: auth.id,
        name: auth.name,
        email: auth.email,
        role: auth.role,
      },
      csrfToken: auth.csrfToken,
    });
  });

  // --- Protected Admin CMS APIs ---
  app.get('/api/admin/overview', requireAuth(['admin', 'editor']), (_req, res) => {
    const scholarships = (
      db.prepare('SELECT * FROM scholarships ORDER BY last_updated DESC').all() as any[]
    ).map(mapScholarshipRow);

    const guides = (db.prepare('SELECT * FROM guides ORDER BY last_updated DESC').all() as any[]).map(
      mapGuideRow
    );

    const categories = (
      db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all() as any[]
    ).map(mapCategoryRow);

    const universities = (db.prepare('SELECT * FROM universities ORDER BY name ASC').all() as any[]).map(
      mapUniversityRow
    );

    const mediaAssets = db.prepare('SELECT * FROM media_assets ORDER BY created_at DESC').all();
    const legalRows = db.prepare('SELECT * FROM legal_pages').all() as any[];
    const legalPages = legalRows.map((row) => ({
      slug: row.slug,
      title: row.title,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      sections: JSON.parse(row.sections_json || '[]'),
      lastUpdated: row.last_updated,
    }));

    const contactMessages = db
      .prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100')
      .all();
    const subscribers = db
      .prepare('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 200')
      .all();
    const reminders = db
      .prepare('SELECT * FROM deadline_reminders ORDER BY created_at DESC LIMIT 200')
      .all();
    const backups = db.prepare('SELECT * FROM backups ORDER BY created_at DESC LIMIT 20').all();

    return res.json({
      scholarships,
      guides,
      categories,
      universities,
      mediaAssets,
      legalPages,
      settings: getAllSettings(),
      contactMessages,
      subscribers,
      reminders,
      backups,
    });
  });

  // Scholarships CRUD
  app.post('/api/admin/scholarships', requireAuth(['admin', 'editor']), (req, res) => {
    const b = req.body || {};
    const title = sanitizeText(b.title, 200);
    const universitySlug = sanitizeText(b.universitySlug, 120);
    const uni = db.prepare('SELECT name, state, state_code FROM universities WHERE slug = ?').get(universitySlug) as any;
    if (!title || title.length < 3) {
      return res.status(400).json({ error: 'Scholarship title is required.' });
    }
    // No invented defaults: a listing must carry real, sourced facts.
    const officialUrl = sanitizeUrl(b.officialUrl);
    if (!officialUrl) {
      return res.status(400).json({ error: 'An official source URL (the sponsoring university page) is required.' });
    }
    if (!sanitizeText(b.amountDisplay, 120) || !sanitizeText(b.deadlineISO, 20) || sanitizeText(b.overview, 2000).length < 40) {
      return res.status(400).json({ error: 'Award amount, deadline, and a meaningful overview (40+ chars) are required.' });
    }
    const ed = resolveEditorial(req, b, null);
    if ('error' in ed) return res.status(400).json({ error: ed.error });

    const id = `sp_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
    const slug = slugify(b.slug || title) || id;
    const nowDate = new Date().toISOString().split('T')[0];

    const existingSlug = db.prepare('SELECT id FROM scholarships WHERE slug = ?').get(slug);
    const finalSlug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    db.prepare(`
      INSERT INTO scholarships (
        id, slug, title, university_slug, university_name, state, state_code, category,
        secondary_categories_json, degree_levels_json, fields_of_study_json,
        amount_display, amount_numeric, coverage_summary, covers_tuition, covers_housing,
        covers_books, includes_stipend, renewable, deadline_iso, deadline_label,
        gpa_min, featured, is_sample_data, status, tags_json, seo_title, seo_description,
        last_updated, overview, eligibility_json, required_documents_json,
        application_steps_json, official_url, faqs_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      finalSlug,
      title,
      universitySlug || 'custom-university',
      sanitizeText(b.universityName, 160) || uni?.name || 'U.S. University',
      sanitizeText(b.state, 60) || uni?.state || '',
      sanitizeText(b.stateCode, 4) || uni?.state_code || '',
      sanitizeText(b.category, 60) || 'merit-based',
      JSON.stringify(Array.isArray(b.secondaryCategories) ? b.secondaryCategories : []),
      JSON.stringify(Array.isArray(b.degreeLevels) && b.degreeLevels.length ? b.degreeLevels : ['Undergraduate']),
      JSON.stringify(Array.isArray(b.fieldsOfStudy) && b.fieldsOfStudy.length ? b.fieldsOfStudy : ['All Majors']),
      sanitizeText(b.amountDisplay, 120),
      Number(b.amountNumeric) || 0,
      sanitizeText(b.coverageSummary, 240) || sanitizeText(b.amountDisplay, 120),
      b.coversTuition ? 1 : 0,
      b.coversHousing ? 1 : 0,
      b.coversBooks ? 1 : 0,
      b.includesStipend ? 1 : 0,
      sanitizeText(b.renewable, 120) || 'See official source',
      sanitizeText(b.deadlineISO, 20),
      sanitizeText(b.deadlineLabel, 80) || sanitizeText(b.deadlineISO, 20),
      Number(b.gpaMin) || 3.0,
      b.featured ? 1 : 0,
      b.isSampleData === false ? 0 : 1,
      ed.status,
      JSON.stringify(Array.isArray(b.tags) ? b.tags.map((t: unknown) => sanitizeText(t, 40)) : []),
      sanitizeText(b.seoTitle, 70),
      sanitizeText(b.seoDescription, 170),
      nowDate,
      sanitizeText(b.overview, 2000),
      JSON.stringify(Array.isArray(b.eligibility) ? b.eligibility.map((x: unknown) => sanitizeText(x, 300)) : []),
      JSON.stringify(Array.isArray(b.requiredDocuments) ? b.requiredDocuments.map((x: unknown) => sanitizeText(x, 300)) : []),
      JSON.stringify(Array.isArray(b.applicationSteps) ? b.applicationSteps.map((x: unknown) => sanitizeText(x, 300)) : []),
      officialUrl,
      JSON.stringify(Array.isArray(b.faqs) ? b.faqs : [])
    );
    db.prepare('UPDATE scholarships SET review_status = ?, reviewed_by = ?, reviewed_at = ?, review_notes = ? WHERE id = ?').run(
      ed.review, ed.reviewedBy, ed.reviewedAt, sanitizeText(b.reviewNotes, 1000), id
    );

    const created = db.prepare('SELECT * FROM scholarships WHERE id = ?').get(id);
    return res.status(201).json({ scholarship: mapScholarshipRow(created) });
  });

  app.put('/api/admin/scholarships/:id', requireAuth(['admin', 'editor']), (req, res) => {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM scholarships WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Scholarship not found.' });
    }
    const b = req.body || {};
    const nowDate = new Date().toISOString().split('T')[0];
    const ed = resolveEditorial(req, b, existing);
    if ('error' in ed) return res.status(400).json({ error: ed.error });

    db.prepare(`
      UPDATE scholarships SET
        title = ?, university_slug = ?, university_name = ?, state = ?, state_code = ?,
        category = ?, degree_levels_json = ?, fields_of_study_json = ?,
        amount_display = ?, amount_numeric = ?, coverage_summary = ?,
        covers_tuition = ?, covers_housing = ?, covers_books = ?, includes_stipend = ?,
        renewable = ?, deadline_iso = ?, deadline_label = ?, gpa_min = ?,
        featured = ?, is_sample_data = ?, status = ?, tags_json = ?,
        seo_title = ?, seo_description = ?, last_updated = ?, overview = ?,
        eligibility_json = ?, required_documents_json = ?, application_steps_json = ?,
        official_url = ?, faqs_json = ?
      WHERE id = ?
    `).run(
      sanitizeText(b.title, 200) || existing.title,
      sanitizeText(b.universitySlug, 120) || existing.university_slug,
      sanitizeText(b.universityName, 160) || existing.university_name,
      sanitizeText(b.state, 60) || existing.state,
      sanitizeText(b.stateCode, 4) || existing.state_code,
      sanitizeText(b.category, 60) || existing.category,
      b.degreeLevels ? JSON.stringify(b.degreeLevels) : existing.degree_levels_json,
      b.fieldsOfStudy ? JSON.stringify(b.fieldsOfStudy) : existing.fields_of_study_json,
      sanitizeText(b.amountDisplay, 120) || existing.amount_display,
      b.amountNumeric !== undefined ? Number(b.amountNumeric) : existing.amount_numeric,
      sanitizeText(b.coverageSummary, 240) || existing.coverage_summary,
      b.coversTuition !== undefined ? (b.coversTuition ? 1 : 0) : existing.covers_tuition,
      b.coversHousing !== undefined ? (b.coversHousing ? 1 : 0) : existing.covers_housing,
      b.coversBooks !== undefined ? (b.coversBooks ? 1 : 0) : existing.covers_books,
      b.includesStipend !== undefined ? (b.includesStipend ? 1 : 0) : existing.includes_stipend,
      sanitizeText(b.renewable, 120) || existing.renewable,
      sanitizeText(b.deadlineISO, 20) || existing.deadline_iso,
      sanitizeText(b.deadlineLabel, 80) || existing.deadline_label,
      b.gpaMin !== undefined ? Number(b.gpaMin) : existing.gpa_min,
      b.featured !== undefined ? (b.featured ? 1 : 0) : existing.featured,
      b.isSampleData !== undefined ? (b.isSampleData ? 1 : 0) : existing.is_sample_data,
      ed.status,
      b.tags ? JSON.stringify(b.tags) : existing.tags_json,
      sanitizeText(b.seoTitle, 70),
      sanitizeText(b.seoDescription, 170),
      nowDate,
      sanitizeText(b.overview, 2000) || existing.overview,
      b.eligibility ? JSON.stringify(b.eligibility) : existing.eligibility_json,
      b.requiredDocuments ? JSON.stringify(b.requiredDocuments) : existing.required_documents_json,
      b.applicationSteps ? JSON.stringify(b.applicationSteps) : existing.application_steps_json,
      sanitizeUrl(b.officialUrl) || existing.official_url,
      b.faqs ? JSON.stringify(b.faqs) : existing.faqs_json,
      id
    );
    db.prepare('UPDATE scholarships SET review_status = ?, reviewed_by = ?, reviewed_at = ?, review_notes = ? WHERE id = ?').run(
      ed.review, ed.reviewedBy, ed.reviewedAt, b.reviewNotes !== undefined ? sanitizeText(b.reviewNotes, 1000) : existing.review_notes || '', id
    );

    const updated = db.prepare('SELECT * FROM scholarships WHERE id = ?').get(id);
    return res.json({ scholarship: mapScholarshipRow(updated) });
  });

  app.delete('/api/admin/scholarships/:id', requireAuth(['admin']), (req, res) => {
    const info = db.prepare('DELETE FROM scholarships WHERE id = ?').run(req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Scholarship not found.' });
    }
    return res.json({ success: true });
  });

  // Guides / Blog CRUD
  app.post('/api/admin/guides', requireAuth(['admin', 'editor']), (req, res) => {
    const b = req.body || {};
    const title = sanitizeText(b.title, 200);
    if (!title || title.length < 4) {
      return res.status(400).json({ error: 'Guide title is required.' });
    }
    const baseSlug = slugify(b.slug || title) || `guide-${Date.now()}`;
    const existing = db.prepare('SELECT slug FROM guides WHERE slug = ?').get(baseSlug);
    const slug = existing ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    const today = new Date().toISOString().split('T')[0];
    const ed = resolveEditorial(req, b, null);
    if ('error' in ed) return res.status(400).json({ error: ed.error });

    db.prepare(`
      INSERT INTO guides (
        slug, title, seo_title, seo_description, category_label, excerpt,
        author_name, author_role, author_bio, published_date, last_updated,
        read_minutes, image_key, custom_image_url, status, tags_json, sections_json, faqs_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      slug,
      title,
      sanitizeText(b.seoTitle, 70) || `${title.slice(0, 42)} | ScholarPath USA`,
      sanitizeText(b.seoDescription, 170) || sanitizeText(b.excerpt, 160),
      sanitizeText(b.categoryLabel, 80) || 'Scholarship Strategy',
      sanitizeText(b.excerpt, 400) || title,
      sanitizeText(b.authorName, 100) || req.authUser!.name,
      sanitizeText(b.authorRole, 100) || 'Editorial Team',
      sanitizeText(b.authorBio, 400) || 'Prepared by the ScholarPath USA editorial team.',
      today,
      today,
      Number(b.readMinutes) || 6,
      sanitizeText(b.imageKey, 40) || 'readingRoom',
      sanitizeUrl(b.customImageUrl),
      ed.status,
      JSON.stringify(Array.isArray(b.tags) ? b.tags : []),
      JSON.stringify(
        Array.isArray(b.sections) && b.sections.length
          ? b.sections
          : [
              {
                id: 'overview',
                heading: 'Key Takeaways',
                paragraphs: [sanitizeText(b.bodyText, 6000) || sanitizeText(b.excerpt, 400)],
              },
            ]
      ),
      JSON.stringify(Array.isArray(b.faqs) ? b.faqs : [])
    );

    db.prepare(
      'UPDATE guides SET review_status = ?, reviewed_by = ?, reviewed_at = ?, review_notes = ?, sources_json = ?, publish_at = ?, image_alt = ? WHERE slug = ?'
    ).run(
      ed.review, ed.reviewedBy, ed.reviewedAt, sanitizeText(b.reviewNotes, 1000),
      JSON.stringify(cleanSources(b.sources)), sanitizeText(b.publishAt, 26), sanitizeText(b.imageAlt, 240), slug
    );

    const created = db.prepare('SELECT * FROM guides WHERE slug = ?').get(slug);
    return res.status(201).json({ guide: mapGuideRow(created) });
  });

  app.put('/api/admin/guides/:slug', requireAuth(['admin', 'editor']), (req, res) => {
    const slug = req.params.slug;
    const existing = db.prepare('SELECT * FROM guides WHERE slug = ?').get(slug) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Guide not found.' });
    }
    const b = req.body || {};
    const today = new Date().toISOString().split('T')[0];
    const ed = resolveEditorial(req, b, existing);
    if ('error' in ed) return res.status(400).json({ error: ed.error });

    db.prepare(`
      UPDATE guides SET
        title = ?, seo_title = ?, seo_description = ?, category_label = ?,
        excerpt = ?, author_name = ?, author_role = ?, author_bio = ?,
        last_updated = ?, read_minutes = ?, image_key = ?, custom_image_url = ?,
        status = ?, tags_json = ?, sections_json = ?, faqs_json = ?
      WHERE slug = ?
    `).run(
      sanitizeText(b.title, 200) || existing.title,
      sanitizeText(b.seoTitle, 70) || existing.seo_title,
      sanitizeText(b.seoDescription, 170) || existing.seo_description,
      sanitizeText(b.categoryLabel, 80) || existing.category_label,
      sanitizeText(b.excerpt, 500) || existing.excerpt,
      sanitizeText(b.authorName, 100) || existing.author_name,
      sanitizeText(b.authorRole, 100) || existing.author_role,
      sanitizeText(b.authorBio, 400) || existing.author_bio,
      today,
      b.readMinutes !== undefined ? Number(b.readMinutes) : existing.read_minutes,
      sanitizeText(b.imageKey, 40) || existing.image_key,
      b.customImageUrl !== undefined ? sanitizeUrl(b.customImageUrl) : existing.custom_image_url,
      ed.status,
      b.tags ? JSON.stringify(b.tags) : existing.tags_json,
      b.sections ? JSON.stringify(b.sections) : existing.sections_json,
      b.faqs ? JSON.stringify(b.faqs) : existing.faqs_json,
      slug
    );
    db.prepare(
      'UPDATE guides SET review_status = ?, reviewed_by = ?, reviewed_at = ?, review_notes = ?, sources_json = ?, publish_at = ?, image_alt = ? WHERE slug = ?'
    ).run(
      ed.review, ed.reviewedBy, ed.reviewedAt,
      b.reviewNotes !== undefined ? sanitizeText(b.reviewNotes, 1000) : existing.review_notes || '',
      b.sources !== undefined ? JSON.stringify(cleanSources(b.sources)) : existing.sources_json || '[]',
      b.publishAt !== undefined ? sanitizeText(b.publishAt, 26) : existing.publish_at || '',
      b.imageAlt !== undefined ? sanitizeText(b.imageAlt, 240) : existing.image_alt || '',
      slug
    );

    const updated = db.prepare('SELECT * FROM guides WHERE slug = ?').get(slug);
    return res.json({ guide: mapGuideRow(updated) });
  });

  app.delete('/api/admin/guides/:slug', requireAuth(['admin']), (req, res) => {
    const info = db.prepare('DELETE FROM guides WHERE slug = ?').run(req.params.slug);
    if (info.changes === 0) return res.status(404).json({ error: 'Guide not found.' });
    return res.json({ success: true });
  });

  // Categories CRUD
  app.post('/api/admin/categories', requireAuth(['admin', 'editor']), (req, res) => {
    const b = req.body || {};
    const name = sanitizeText(b.name, 100);
    if (!name) return res.status(400).json({ error: 'Category name is required.' });
    const slug = slugify(b.slug || name);
    if (!slug) return res.status(400).json({ error: 'Valid slug is required.' });

    const existing = db.prepare('SELECT slug FROM categories WHERE slug = ?').get(slug);
    if (existing) return res.status(409).json({ error: 'Category slug already exists.' });

    const maxOrder = (db.prepare('SELECT COALESCE(MAX(sort_order), 0) as m FROM categories').get() as any).m;
    db.prepare(`
      INSERT INTO categories (slug, name, short_name, description, seo_title, seo_description, swatch_class, text_class, border_class, surface_class, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      slug,
      name,
      sanitizeText(b.shortName, 40) || name,
      sanitizeText(b.description, 400) || `${name} scholarships at U.S. universities.`,
      sanitizeText(b.seoTitle, 70) || `${name} Scholarships | ScholarPath USA`,
      sanitizeText(b.seoDescription, 170) || `Explore ${name} scholarships at U.S. colleges and universities.`,
      sanitizeText(b.swatchClass, 80) || 'bg-blue-700 dark:bg-blue-400',
      sanitizeText(b.textClass, 80) || 'text-blue-800 dark:text-blue-300',
      sanitizeText(b.borderClass, 80) || 'border-blue-700/25 dark:border-blue-400/30',
      sanitizeText(b.surfaceClass, 80) || 'bg-blue-50/70 dark:bg-blue-950/40',
      maxOrder + 1
    );

    const created = db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug);
    return res.status(201).json({ category: mapCategoryRow(created) });
  });

  app.put('/api/admin/categories/:slug', requireAuth(['admin', 'editor']), (req, res) => {
    const slug = req.params.slug;
    const existing = db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug) as any;
    if (!existing) return res.status(404).json({ error: 'Category not found.' });
    const b = req.body || {};

    db.prepare(`
      UPDATE categories SET
        name = ?, short_name = ?, description = ?, seo_title = ?, seo_description = ?
      WHERE slug = ?
    `).run(
      sanitizeText(b.name, 100) || existing.name,
      sanitizeText(b.shortName, 40) || existing.short_name,
      sanitizeText(b.description, 400) || existing.description,
      sanitizeText(b.seoTitle, 70) || existing.seo_title,
      sanitizeText(b.seoDescription, 170) || existing.seo_description,
      slug
    );

    const updated = db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug);
    return res.json({ category: mapCategoryRow(updated) });
  });

  app.delete('/api/admin/categories/:slug', requireAuth(['admin']), (req, res) => {
    const info = db.prepare('DELETE FROM categories WHERE slug = ?').run(req.params.slug);
    if (info.changes === 0) return res.status(404).json({ error: 'Category not found.' });
    return res.json({ success: true });
  });

  // Media Assets Upload & Delete
  app.post('/api/admin/media', requireAuth(['admin', 'editor']), (req, res) => {
    const b = req.body || {};
    const title = sanitizeText(b.title, 120);
    const altText = sanitizeText(b.altText, 240) || title;
    const category = sanitizeText(b.category, 60) || 'Editorial';
    const rawUrl = typeof b.url === 'string' ? b.url.trim() : '';

    if (!title) return res.status(400).json({ error: 'Image title is required.' });

    const isSafeDataImage = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/.test(rawUrl);
    const safeUrl = isSafeDataImage ? rawUrl : sanitizeUrl(rawUrl);
    if (!safeUrl) {
      return res.status(400).json({ error: 'Provide a valid image file (PNG/JPG/WebP) or HTTPS image URL.' });
    }
    if (safeUrl.length > 2_200_000) {
      return res.status(400).json({ error: 'Uploaded image exceeds 1.5MB limit.' });
    }

    const id = `media_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
    db.prepare(
      'INSERT INTO media_assets (id, title, url, alt_text, category, width, height, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      title,
      safeUrl,
      altText,
      category,
      Number(b.width) || 1280,
      Number(b.height) || 960,
      new Date().toISOString()
    );

    const created = db.prepare('SELECT * FROM media_assets WHERE id = ?').get(id);
    return res.status(201).json({ asset: created });
  });

  app.delete('/api/admin/media/:id', requireAuth(['admin']), (req, res) => {
    const info = db.prepare('DELETE FROM media_assets WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Media asset not found.' });
    return res.json({ success: true });
  });

  // Legal Pages Editor
  app.put('/api/admin/legal/:slug', requireAuth(['admin', 'editor']), (req, res) => {
    const slug = req.params.slug;
    const existing = db.prepare('SELECT * FROM legal_pages WHERE slug = ?').get(slug) as any;
    if (!existing) return res.status(404).json({ error: 'Legal page not found.' });

    const b = req.body || {};
    const today = new Date().toISOString().split('T')[0];
    const cleanSections = Array.isArray(b.sections)
      ? b.sections.map((s: any) => ({
          heading: sanitizeText(s.heading, 200),
          body: sanitizeRichText(s.body, 8000),
        }))
      : JSON.parse(existing.sections_json);

    db.prepare(`
      UPDATE legal_pages SET title = ?, seo_title = ?, seo_description = ?, sections_json = ?, last_updated = ?
      WHERE slug = ?
    `).run(
      sanitizeText(b.title, 160) || existing.title,
      sanitizeText(b.seoTitle, 70) || existing.seo_title,
      sanitizeText(b.seoDescription, 170) || existing.seo_description,
      JSON.stringify(cleanSections),
      today,
      slug
    );

    return res.json({ success: true, lastUpdated: today });
  });

  // Site Settings, Homepage, Menus, SEO, Monetization
  app.put('/api/admin/settings/:key', requireAuth(['admin', 'editor']), (req, res) => {
    const key = req.params.key;
    if (!['general', 'homepage', 'menus', 'monetization'].includes(key)) {
      return res.status(400).json({ error: 'Invalid settings group.' });
    }
    // Ads, analytics IDs, and contact details are site-owner decisions.
    if (key !== 'homepage' && req.authUser!.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can change this settings group.' });
    }
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid settings payload.' });
    }

    if (key === 'monetization') {
      const m = payload as any;
      if (m.adsensePublisherId && !/^ca-pub-\d{10,20}$/.test(m.adsensePublisherId)) {
        return res.status(400).json({ error: 'AdSense publisher ID must look like ca-pub-1234567890123456.' });
      }
      if (m.medianetCustomerId && !/^[A-Za-z0-9]{6,20}$/.test(m.medianetCustomerId)) {
        return res.status(400).json({ error: 'Media.net customer ID may contain only letters and digits.' });
      }
      for (const slot of Object.values(m.slots || {}) as any[]) {
        if (slot?.slotCode && !/^[A-Za-z0-9_-]{1,40}$/.test(slot.slotCode)) {
          return res.status(400).json({ error: 'Ad slot codes may contain only letters, digits, - and _.' });
        }
      }
      m.adsTxtContent = typeof m.adsTxtContent === 'string' ? m.adsTxtContent.slice(0, 5000) : '';
    }
    if (key === 'general') {
      const g = payload as any;
      if (g.googleSiteVerification && !/^[A-Za-z0-9_-]{10,100}$/.test(g.googleSiteVerification)) {
        return res.status(400).json({ error: 'Search Console token may contain only letters, digits, - and _.' });
      }
      if (g.ga4MeasurementId && !/^G-[A-Z0-9]{6,14}$/.test(g.ga4MeasurementId)) {
        return res.status(400).json({ error: 'GA4 Measurement ID must look like G-XXXXXXXXXX.' });
      }
      if (g.contactEmail && !isValidEmail(g.contactEmail)) {
        return res.status(400).json({ error: 'Contact email is not a valid address.' });
      }
    }

    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO site_settings (key, value_json, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at`
    ).run(key, JSON.stringify(payload), now);

    return res.json({ success: true, settings: getAllSettings() });
  });

  // Contact Inbox Management
  app.patch('/api/admin/inbox/:id', requireAuth(['admin', 'editor']), (req, res) => {
    const status = req.body?.status;
    if (!['new', 'reviewed', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, req.params.id);
    return res.json({ success: true });
  });

  // Users & Roles (Admin only)
  app.get('/api/admin/users', requireAuth(['admin']), (_req, res) => {
    const users = db
      .prepare('SELECT id, name, email, role, active, created_at FROM users ORDER BY created_at ASC')
      .all();
    return res.json({ users });
  });

  app.post('/api/admin/users', requireAuth(['admin']), (req, res) => {
    const name = sanitizeText(req.body?.name, 100);
    const email = sanitizeText(req.body?.email, 160).toLowerCase();
    const role = req.body?.role === 'admin' ? 'admin' : 'editor';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (name.length < 2 || !isValidEmail(email) || password.length < 8) {
      return res.status(400).json({ error: 'Name, valid email, and password (8+ chars) are required.' });
    }

    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (exists) {
      return res.status(409).json({ error: 'A user with that email already exists.' });
    }

    const id = `usr_${Date.now()}`;
    const now = new Date().toISOString();
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role, active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)'
    ).run(id, name, email, hashPassword(password), role, now);

    return res.status(201).json({
      user: { id, name, email, role, active: 1, created_at: now },
    });
  });

  app.patch('/api/admin/users/:id', requireAuth(['admin']), (req, res) => {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!existing) return res.status(404).json({ error: 'User not found.' });

    const role = req.body?.role === 'admin' ? 'admin' : req.body?.role === 'editor' ? 'editor' : existing.role;
    const active = req.body?.active !== undefined ? (req.body.active ? 1 : 0) : existing.active;
    const newPassword = typeof req.body?.password === 'string' && req.body.password.length >= 8 ? req.body.password : null;

    if (id === req.authUser!.id && active === 0) {
      return res.status(400).json({ error: 'You cannot deactivate your own active admin session.' });
    }

    db.prepare('UPDATE users SET role = ?, active = ?, password_hash = ? WHERE id = ?').run(
      role,
      active,
      newPassword ? hashPassword(newPassword) : existing.password_hash,
      id
    );

    return res.json({ success: true });
  });

  // Database Backup Export (Admin only)
  app.get('/api/admin/backup', requireAuth(['admin']), (req, res) => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      exportedBy: req.authUser!.email,
      categories: db.prepare('SELECT * FROM categories').all(),
      universities: db.prepare('SELECT * FROM universities').all(),
      scholarships: db.prepare('SELECT * FROM scholarships').all(),
      guides: db.prepare('SELECT * FROM guides').all(),
      legalPages: db.prepare('SELECT * FROM legal_pages').all(),
      siteSettings: db.prepare('SELECT * FROM site_settings').all(),
      mediaAssets: db.prepare('SELECT * FROM media_assets').all(),
      subscribersCount: (db.prepare('SELECT COUNT(*) as c FROM newsletter_subscribers').get() as any).c,
      remindersCount: (db.prepare('SELECT COUNT(*) as c FROM deadline_reminders').get() as any).c,
    };

    const backupId = `bak_${Date.now()}`;
    db.prepare('INSERT INTO backups (id, created_by, summary_json, created_at) VALUES (?, ?, ?, ?)').run(
      backupId,
      req.authUser!.email,
      JSON.stringify({
        scholarships: snapshot.scholarships.length,
        guides: snapshot.guides.length,
        categories: snapshot.categories.length,
      }),
      snapshot.exportedAt
    );

    res.header('Content-Disposition', `attachment; filename="scholarpath-backup-${snapshot.exportedAt.slice(0, 10)}.json"`);
    res.json(snapshot);
  });

  const renderHtml = (template: string, req: Request, res: Response) => {
    const info = resolvePage(req.path);
    res.status(info.status).type('html').send(applyPage(template, info, getBaseUrl(req), buildBootstrap()));
  };

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.get('*', async (req, res, next) => {
      try {
        const raw = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const template = await vite.transformIndexHtml(req.originalUrl, raw);
        renderHtml(template, req, res);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
    app.use(express.static(distPath, { maxAge: '7d', index: false }));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found.' });
      res.setHeader('Cache-Control', 'no-cache');
      renderHtml(template, req, res);
    });
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large.' });
    console.error('[error]', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarPath USA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
