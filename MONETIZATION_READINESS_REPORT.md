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
| Images and bundle | FIXED. Images were served from `/src/assets/...`, a path that does not exist in a production build; moved to `/images/` and compressed 4.9 MB → 0.99 MB. Routes are code-split: main bundle 599 kB → 275 kB (82 kB gzip). **Verified** in a production run: 0 broken images, 0 console errors |
| Core Web Vitals / Lighthouse | NOT VERIFIED (no Lighthouse run). Image licensing/origin of the 5 bundled photos is NOT VERIFIED |
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

## 7. Update: items 9–14 (2026-11-16)
| Item | Result |
|---|---|
| Pre-rendering | FIXED. The server now injects each page’s title, description, canonical, robots and readable body (guides, legal pages, categories) into the HTML, embeds the site data for an instant first paint, and returns a real **404** for unknown URLs. Verified with curl |
| Content Security Policy | FIXED (production only). Allows this site plus Google AdSense/Analytics/Fonts and Media.net hosts only. `unsafe-inline` is still needed for inline scripts. Verified: no CSP errors, admin login works |
| `npm audit` | PASS: 0 vulnerabilities |
| Lighthouse (production build, local) | Desktop: Performance 97 / Accessibility 94–99 / Best Practices 96 / SEO 100, LCP 1.2 s, CLS 0 (home 96). **Mobile (simulated slow 4G): Performance ≈ 71–72, LCP ≈ 5.5 s: NEEDS ATTENTION** (JavaScript size and the hero image on throttled mobile). Fonts now use `display=optional` to remove layout shift, so first-time visitors may see fallback fonts |
| Newsletter / reminder forms | REMOVED from the site and server (they never sent mail). Copy that promised alerts was rewritten |
| Sample records hidden | DONE. The public site, search, sitemap and server-rendered pages exclude sample/unverified scholarships and universities (admin toggle "Show sample…" in Settings, off by default). The homepage shows an honest "directory update in progress" notice. **The site now has 0 listings until you add verified records** |

## 8. Update: verified scholarship import (2026-11-16)
Three records were added from official pages only (`src/data/verified-scholarships.ts`, imported by `server/db.ts` with `INSERT OR IGNORE`). All are `is_sample_data = 0`, **status draft, review_status pending_review**, with the official URL set. Nothing is Reviewed or Published; a human must check each against its page first. No new universities were added (UNC and UVA already exist as directory rows).

**Added (3)**
| Program | Official page read | Notes |
|---|---|---|
| Morehead-Cain Scholarship (UNC) | moreheadcain.org (home, about, eligibility, checklist, deadlines) | No dollar value or GPA stated. Deadlines page lists Oct 1 for the Class of 2031 cycle but infers the year, so deadline label is "See official page" (placeholder date 2099-12-31) |
| Carolina Covenant (UNC) | studentaid.unc.edu/carolina-covenant (carolinacovenant.unc.edu redirects there) | Income limits are yearly; no date stated |
| Jefferson Scholars Program, undergraduate (UVA) | jeffersonscholars.org (home, /scholarships) | Page mentions two undergraduate programs; only the combined description was readable. No deadline or materials stated |

**Could not be read (5 of the 8 allowed-host programs)**
- Robertson Scholars: `robertsonscholars.org` / `www.robertsonscholars.org` failed DNS resolution (host not reachable from this session).
- AccessUVA (`sfs.virginia.edu`): HTTP 403.
- Federal Pell Grant, FAFSA, scam-warning page (`studentaid.gov`): HTTP 503 on repeated tries.

**Not attempted** (hosts outside the allowed list, rows 6–15, 17–28 of `docs/scholarship-shortlist.md`). Rows 29–30 are reference pages, not scholarships.

Checks: server run on a temp DB, 3 records appear in `/api/admin/overview` as draft/pending_review, count stays 3 after restart; `npx tsc --noEmit` passes.

## 9. Update: more official-page scholarship records (2026-11-17)
After network access was widened, I read the official pages directly and added **7 more records** (total **10** non-sample records), all `draft` + `pending_review`, `is_sample_data = 0`, each linking to its official page with the reading date in the reviewer notes:
The Gates Scholarship, QuestBridge National College Match, Coca-Cola Scholars Program, Robertson Scholars Leadership Program, Barry Goldwater Scholarship, Post-9/11 GI Bill, Horatio Alger National Scholarship. (Earlier: Morehead-Cain, Carolina Covenant, Jefferson Scholars.)

**Not added (NOT VERIFIED)**: Federal Pell Grant and FAFSA (studentaid.gov renders with JavaScript, so no text could be read; ed.gov blocked the request), AccessUVA (403), Stamps (server error), Posse and Dell (only general pages readable; no award terms or deadlines found), NSF GRFP (site unreachable), Knight-Hennessy (page moved), SMART (portal not readable), Yellow Ribbon (page not found), National Merit (blocked). Not attempted: Hispanic Scholarship Fund, Jack Kent Cooke, UNCF, APIA Scholars, American Indian College Fund, Fulbright, Hollings, SWE.

**Caveats a reviewer must check before publishing**: several dates are for cycles that already closed (Gates, QuestBridge, Coca-Cola, Robertson) and are shown as such; Gates shows "Status: Open" beside a past deadline; Goldwater's deadline is a rule ("last Friday in January") converted to 2027-01-29; Horatio Alger windows have no year; Morehead-Cain, Carolina Covenant, GI Bill and Horatio Alger show "See official page" instead of a dated deadline.

**Display fixes made for this data**: no fake "days remaining" for undated deadlines, no "0.00 GPA" when none is stated, no empty Fields of Study block, no broken university link for national programs, "Visit Official Page" button text.

**Status: the public site still shows 0 listings** because drafts are not public. An administrator must review each record against its official page, mark it Reviewed, then publish it (Admin → Scholarships).

## 10. Update: remaining shortlist programs (2026-11-17)
Added **10 more official-page records** (total **20 non-sample records**, all `draft` + `pending_review`): HSF Scholar Program, Jack Kent Cooke College Scholarship, Jack Kent Cooke Undergraduate Transfer Scholarship, APIA Scholars, American Indian College Fund, UNCF (hub entry), Fulbright U.S. Student Program, NSF GRFP, SWE Society-Selected Scholarships, Knight-Hennessy Scholars.

**Still not added (NOT VERIFIED)**: Pell Grant, FAFSA and the scam-warning page (studentaid.gov shows no text without JavaScript), AccessUVA (403), Stamps (server error), Posse and Dell (no award terms or dates on the pages read), National Merit (blocked), Hollings (blocked), SMART (portal not readable), Yellow Ribbon (page not found). Several of these need a browser-based read or a manual copy from the official site.

**Reviewer notes**: Fulbright funds study abroad, not study at a U.S. university; UNCF is a hub entry; NSF GRFP and Knight-Hennessy deadlines were not on the pages read (shown as "See official page"); HSF, Cooke College, Fulbright and earlier-listed cycles are shown as closed. Public listings remain 0 until an administrator reviews and publishes.
