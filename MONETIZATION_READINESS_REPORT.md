# Monetization Readiness Report: ScholarPath USA

Audit and fixes of the existing project (React + Vite + Express + SQLite). Date: 2026-11-15.
Labels: **PASS** verified · **FIXED** found and corrected · **NEEDS ATTENTION** owner action required · **NOT VERIFIED** not confirmed.

**No approval from Google AdSense or Media.net is guaranteed or implied.** The biggest blocker is content, not code (see section 1).

## 1. Critical findings (content: owner action required)
| # | Finding | Status |
|---|---|---|
| 1 | **All 28 scholarships and 12 universities are "sample" records**: invented award amounts, GPA cutoffs, deadlines and FAQs attached to real institutions (e.g. "Purple & Gold Non-Resident Partial Award (Sample)"). Publishing fabricated facts about real universities is misleading and a thin/low-value-content risk. | **NEEDS ATTENTION**. Mitigated only: sample pages are `noindex`, excluded from `sitemap.xml`, carry a visible notice and never show ads. You must replace them with real, source-verified records (admin → Scholarships; untick "Sample / unverified" only after checking each figure on the official page). I did not invent replacements. |
| 2 | Only **4 short guides**, all `Pending Review`, no cited sources. Guide claims (e.g. the CSS Profile fee waiver threshold) need human fact-checking against official sources. | **NEEDS ATTENTION**. Review, add sources (new "Sources" field), then an admin marks each Reviewed. Ads are suppressed on guides until Reviewed. |
| 3 | Newsletter and deadline-reminder forms store emails but **nothing sends email**. Copy was softened but the features do not deliver. | **NEEDS ATTENTION**. Wire a real mailer or remove the forms before applying. |
| 4 | No real contact email / owner identity configured. | **NEEDS ATTENTION**. Admin → Settings → Contact email (the contact form works and is stored in the admin inbox). |

## 2. Problems fixed
| Problem | Fix | Files |
|---|---|---|
| Invented editorial team with fake credentials ("Dr. Elena Morales, Ed.D.", "Marcus Vance, M.Ed.", "Priya Nair, M.S.", "14 years former financial aid director", "4,000 essays") shown on About, in guide bylines/Article schema and as admin names | Removed. Guides are bylined "ScholarPath USA Editorial"; About states plainly who runs the site; existing DB rows are migrated | `AboutPage.tsx`, `data/guides.ts`, `server/db.ts`, `GuideDetailPage.tsx`, `GuideEditorModal.tsx` |
| **Public login page displayed working admin/editor passwords** and the DB seeded them | Removed from UI and seed. First admin comes from `ADMIN_EMAIL`/`ADMIN_PASSWORD` or a random one-time password printed in the server log. Legacy demo accounts are deleted once a real admin exists (**verified**: old demo login now returns 401) | `AdminLoginPage.tsx`, `server/db.ts`, `.env.example` |
| Fake office ("Boston, Massachusetts"), `@scholarpathusa.example.com` emails, placeholder GA4/Search Console/AdSense/Media.net IDs, `example.com` canonical and JSON-LD | Blank by default and hidden when blank; canonical/Organization/WebSite schema generated from the real origin; existing DB values migrated | `siteConfig.ts`, `server/db.ts`, `index.html`, `AppContext.tsx`, Layout/Contact/Privacy/Advertise pages |
| Ad slots rendered fake "Reserved responsive placement" boxes and never loaded any ad code | New `AdSlot`: renders nothing unless ads are enabled, real IDs are set, the visitor consented to advertising cookies, the page is eligible and content is not sample/unreviewed. Loads AdSense or Media.net scripts, labels "Advertisement", reserves height, collapses if the script is blocked. Never on legal/contact/search/quiz/about/admin pages. **Verified**: 0 ad requests before consent, 1 after; privacy page 0 slots | `AdSlot.tsx` |
| Analytics consent pre-ticked; GA4 never gated | Defaults to off; GA4 loads only after consent and with a valid ID | `CookieConsentBanner.tsx`, `AppContext.tsx` |
| Legal pages thin/inaccurate (Revbit, unverifiable security claims, no rights/retention/children sections) | Rewrote Privacy, Terms, Disclaimer, Cookie Policy; **added Editorial Policy & Corrections** (route, footer link, sitemap). Versioned migration never overwrites pages you edited | `server/db.ts`, `EditorialPolicyPage.tsx`, `App.tsx`, `Layout.tsx` |
| Invented defaults when creating scholarships ($20,000/yr, Jan 15 2027, ed.gov link) | Creation now requires amount, deadline, overview and an official source URL | `server.ts` |
| Admin link in public footer / Revbit controls (unsupported) | Removed | `Layout.tsx`, `AdminDashboardPage.tsx` |

## 3. New features (all persisted and tested through the API)
- **Editorial workflow**: Draft / Pending Review / Needs Revision / Reviewed on guides and scholarships; only admins can set Reviewed (records reviewer and time); publishing requires Reviewed (**verified**: unreviewed publish returns 400). Review badges shown in admin lists and on guide pages.
- **Guides**: sources list (rendered on page), scheduled publish time (applied to site, sitemap and search), featured-image alt text, reviewer notes. Scholarship editor: "Sample / unverified" toggle.
- **Security**: editors can no longer change ads/analytics/contact settings or delete content; ID/format validation on monetization and general settings; `X-Frame-Options`, HSTS (production), no-store on API; persistent session secret (random per restart before); contact-form honeypot; JSON error handling.

## 4. Security / SEO / performance status
| Area | Status |
|---|---|
| Passwords hashed (scrypt, timing-safe compare), parameterized SQL, CSRF token on writes, rate limits on login and public forms | PASS (code review + login/CSRF/role tests) |
| Content Security Policy | NEEDS ATTENTION. Not added: it must be tuned to the ad network you are approved for |
| `robots.txt`, `sitemap.xml` (sample records excluded), `ads.txt` | PASS (fetched). `ads.txt` is empty until you paste the lines your networks give you (Admin → Monetization) |
| Per-page title/description/canonical/OG, noindex on admin/404/sample pages | PASS (checked in browser) |
| Pre-rendering / SSR | NEEDS ATTENTION. Pages are client-rendered; Google renders JS but AdSense/Media.net reviewers and social crawlers see less. Consider pre-rendering |
| Performance / Core Web Vitals | NOT VERIFIED. Single 599 kB JS bundle (150 kB gzip), 5 JPEGs of 0.85–1.26 MB each; no Lighthouse run was done. Compress the images and code-split |
| Dependencies | `npm install` needs `--legacy-peer-deps` (peer conflict); `npm audit` not run → NOT VERIFIED |
| Multi-viewport check (390px and 1280px, 11 routes): no horizontal scroll, no console/page errors | PASS |

## 5. AdSense / Media.net checklist
- [ ] Replace sample directory with verified records, publish reviewed guides (NEEDS ATTENTION)
- [ ] Own domain and real contact email (NEEDS ATTENTION)
- [x] About, Contact (working form), Privacy, Terms, Disclaimer, Cookie, Editorial Policy linked in footer (PASS)
- [x] Consent-gated ad loading, labeled and CLS-reserved slots, no ads on utility/legal pages (PASS)
- [ ] After approval: Admin → Monetization → enable, enter `ca-pub-…` / Media.net customer ID and slot codes, paste `ads.txt` lines. Slots stay dark until then (do not enable earlier)
- [ ] Review each network's current program policies yourself: I had no live policy access here (NOT VERIFIED)

## 6. Not done / known limitations
Original-content creation, real photography/licenses for the 5 bundled images (licensing NOT VERIFIED), comments/helpful-votes, user-role UI beyond existing, article revision history, page-management and media-library redesign were not built. They'd be decorative or fabricated without real content. The original uploaded `data/` files are preserved in `backups/original-data/`.
