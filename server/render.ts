import { db, getAllSettings, LIVE_GUIDE_SQL } from './db.ts';

/** Minimal server-side page metadata + readable body so crawlers see real content without running JavaScript. */

const esc = (v: unknown) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface PageInfo {
  status: number;
  title: string;
  description: string;
  path: string;
  noindex: boolean;
  body: string;
}

const STATIC_PAGES: Record<string, { title: string; description: string; noindex?: boolean }> = {
  '/scholarships': { title: 'Search U.S. University Scholarships | ScholarPath USA', description: 'Browse U.S. university scholarships by funding type, degree level and state, with links to each official source.' },
  '/universities': { title: 'U.S. Universities Directory | ScholarPath USA', description: 'Financial aid policies and listed scholarships at U.S. colleges and universities.' },
  '/guides': { title: 'Scholarship & Financial Aid Guides | ScholarPath USA', description: 'Plain-language guides to scholarships, FAFSA, CSS Profile and essays for U.S. students and families.' },
  '/quiz': { title: 'Scholarship Eligibility Quiz | ScholarPath USA', description: 'Answer a few questions to see which listed scholarships may fit your profile.' },
  '/compare': { title: 'Compare Scholarships | ScholarPath USA', description: 'Compare up to three scholarships side by side.' },
  '/about': { title: 'About ScholarPath USA | Mission & Editorial Standards', description: 'What ScholarPath USA is, who it is for, and how we label, review and correct scholarship information.' },
  '/contact': { title: 'Contact ScholarPath USA', description: 'Send a question, correction or partnership inquiry to the ScholarPath USA team.' },
  '/advertise': { title: 'Advertise With ScholarPath USA', description: 'Partnership and advertising information for ScholarPath USA.' },
  '/sitemap': { title: 'HTML Sitemap | ScholarPath USA', description: 'Index of all pages on ScholarPath USA.' },
  '/search': { title: 'Search | ScholarPath USA', description: 'Search scholarships, universities and guides.', noindex: true },
  '/saved': { title: 'Saved Scholarships | ScholarPath USA', description: 'Your saved scholarships.', noindex: true },
  '/admin': { title: 'Admin | ScholarPath USA', description: 'Site administration.', noindex: true },
  '/admin/login': { title: 'Admin Sign In | ScholarPath USA', description: 'Site staff sign in.', noindex: true },
};

const LEGAL_SLUGS: Record<string, string> = {
  '/privacy-policy': 'privacy-policy',
  '/terms': 'terms',
  '/disclaimer': 'disclaimer',
  '/cookie-policy': 'cookie-policy',
  '/editorial-policy': 'editorial-policy',
};

export function resolvePage(rawPath: string): PageInfo {
  const path = rawPath.replace(/\/+$/, '') || '/';
  const settings = getAllSettings();
  const brand = settings.general.brandName;
  const showSample = Boolean(settings.general.showSampleData);

  if (path === '/') {
    return {
      status: 200,
      title: `${brand} – Find U.S. University Scholarships`,
      description: settings.homepage.heroSubtitle,
      path,
      noindex: false,
      body: `<main><h1>${esc(settings.homepage.heroTitle)}</h1><p>${esc(settings.homepage.heroSubtitle)}</p></main>`,
    };
  }

  if (STATIC_PAGES[path]) {
    const p = STATIC_PAGES[path];
    return { status: 200, title: p.title, description: p.description, path, noindex: Boolean(p.noindex), body: `<main><h1>${esc(p.title.split('|')[0].trim())}</h1><p>${esc(p.description)}</p></main>` };
  }

  if (LEGAL_SLUGS[path]) {
    const row = db.prepare('SELECT * FROM legal_pages WHERE slug = ?').get(LEGAL_SLUGS[path]) as any;
    if (row) {
      const sections = JSON.parse(row.sections_json || '[]') as Array<{ heading: string; body: string }>;
      return {
        status: 200, title: row.seo_title, description: row.seo_description, path, noindex: false,
        body: `<main><h1>${esc(row.title)}</h1>${sections.map((s) => `<h2>${esc(s.heading)}</h2><p>${esc(s.body)}</p>`).join('')}</main>`,
      };
    }
  }

  let m = path.match(/^\/guides\/([a-z0-9-]+)$/);
  if (m) {
    const g = db.prepare(`SELECT * FROM guides WHERE slug = ? AND ${LIVE_GUIDE_SQL}`).get(m[1]) as any;
    if (g) {
      const sections = JSON.parse(g.sections_json || '[]') as Array<{ heading: string; paragraphs?: string[]; bullets?: string[] }>;
      return {
        status: 200, title: g.seo_title, description: g.seo_description, path, noindex: false,
        body: `<main><article><h1>${esc(g.title)}</h1><p>${esc(g.excerpt)}</p>${sections
          .map((s) => `<h2>${esc(s.heading)}</h2>${(s.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('')}${s.bullets?.length ? `<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}`)
          .join('')}</article></main>`,
      };
    }
  }

  m = path.match(/^\/scholarships\/([a-z0-9-]+)$/);
  if (m) {
    const c = db.prepare('SELECT * FROM categories WHERE slug = ?').get(m[1]) as any;
    if (c) return { status: 200, title: c.seo_title, description: c.seo_description, path, noindex: false, body: `<main><h1>${esc(c.name)}</h1><p>${esc(c.description)}</p></main>` };
  }

  m = path.match(/^\/scholarship\/([a-z0-9-]+)$/);
  if (m) {
    const s = db.prepare(`SELECT * FROM scholarships WHERE slug = ? AND status = 'published' ${showSample ? '' : 'AND is_sample_data = 0'}`).get(m[1]) as any;
    if (s) {
      return {
        status: 200, title: s.seo_title || `${s.title} | ${brand}`, description: s.seo_description || `${s.university_name}: ${s.amount_display}. Eligibility, deadline and how to apply.`, path,
        noindex: Boolean(s.is_sample_data),
        body: `<main><h1>${esc(s.title)}</h1><p>${esc(s.overview)}</p><p>Official source: <a href="${esc(s.official_url)}" rel="noopener noreferrer">${esc(s.university_name)}</a></p></main>`,
      };
    }
  }

  m = path.match(/^\/university\/([a-z0-9-]+)$/);
  if (m) {
    const u = db.prepare(`SELECT * FROM universities WHERE slug = ? ${showSample ? '' : 'AND is_sample_data = 0'}`).get(m[1]) as any;
    if (u) return { status: 200, title: `${u.short_name} Scholarships & Aid | ${brand}`, description: `Scholarships and financial aid at ${u.name}.`, path, noindex: Boolean(u.is_sample_data), body: `<main><h1>${esc(u.name)}</h1><p>${esc(u.overview)}</p></main>` };
  }

  return { status: 404, title: `Page not found | ${brand}`, description: 'This page could not be found.', path, noindex: true, body: '<main><h1>Page not found</h1></main>' };
}

export function applyPage(template: string, info: PageInfo, baseUrl: string, bootstrap?: unknown): string {
  const title = info.title.length > 60 ? `${info.title.slice(0, 57)}...` : info.title;
  const desc = info.description.length > 160 ? `${info.description.slice(0, 157)}...` : info.description;
  const canonical = `${baseUrl}${info.path === '/' ? '/' : info.path}`;
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${esc(desc)}" />`)
    .replace(/<meta\s+property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${esc(desc)}" />`)
    .replace(/<meta\s+name="twitter:title"[\s\S]*?\/>/, `<meta name="twitter:title" content="${esc(title)}" />`)
    .replace(/<meta\s+name="twitter:description"[\s\S]*?\/>/, `<meta name="twitter:description" content="${esc(desc)}" />`);
  const extra =
    `<link rel="canonical" href="${esc(canonical)}" />\n    <meta property="og:url" content="${esc(canonical)}" />` +
    (info.noindex ? '\n    <meta name="robots" content="noindex, follow" />' : '');
  const preload = info.path === '/' ? '\n    <link rel="preload" as="image" href="/images/hero_campus_library_1794638342764.jpg" fetchpriority="high" />' : '';
  html = html.replace('</head>', `    ${extra}${preload}\n  </head>`);
  if (bootstrap) {
    const json = JSON.stringify(bootstrap).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, '');
    html = html.replace('</head>', `    <script>window.__BOOTSTRAP__=${json};</script>\n  </head>`);
  }
  html = html.replace('<div id="root"></div>', `<div id="root">${info.body}</div>`);
  return html;
}
