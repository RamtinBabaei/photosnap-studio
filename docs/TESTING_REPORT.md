# Photosnap verification and debugging report

Release verification: **October 23, 2026**

Scope: four reference marketing pages, seventeen photo readers, invitation workflow, privacy page, HTTP 404 behavior, Cloudflare deployment and repository delivery.

## Executed checks

| Check                            | Result                                       | Evidence                                                                                |
| -------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| TypeScript                       | Passed                                       | `npm run typecheck`, strict mode and no emit                                            |
| ESLint                           | Passed                                       | `npm run lint`, zero warnings allowed                                                   |
| Formatting                       | Passed                                       | `npm run format:check`                                                                  |
| Component and API contract tests | **22 passed**                                | Vitest 5, four test files                                                               |
| Real Worker/database integration | **22 passed**                                | `npm run test:integration`, isolated workerd + SQLite/D1                                |
| Frontend production build        | Passed                                       | Vite client build + React server prerender                                              |
| Prerender integrity              | **24 pages, 918 local references**           | `scripts/check-build.mjs`                                                               |
| Worker bundle validation         | Passed                                       | `npm run build:worker`, Wrangler dry run                                                |
| Dependency audit                 | **0 vulnerabilities reported**               | `npm audit`, including development dependencies                                         |
| Responsive browser matrix        | **25 of 25 passed**                          | Five pages × five iframe viewport widths in Chromium                                    |
| Browser accessibility            | No axe violations in the 25-page-size matrix | axe-core, real browser DOM                                                              |
| Online route smoke checks        | Passed                                       | Home, Stories, Features, Pricing, invitation, reader, health, image and unknown route   |
| Live invitation persistence      | Passed                                       | Browser success state and D1 query confirmed `pro` + `yearly`; synthetic record removed |

The command outcomes above were actually executed. They are not inferred from the existence of configuration files.

## Pass 1 — Architecture and code quality

Reviewed routing, the component hierarchy, data ownership, shared validation, database constraints, deployment configuration and error boundaries.

Decisions and checks:

- Kept the actual reference scope as a marketing website; did not imply that sample photography-hosting features are operating services.
- Split page components from reusable grids, images, split sections and layout.
- Used one typed story catalogue to generate the readers and their prerendered routes.
- Split pricing data from the validation schema so visiting Pricing does not eagerly load Zod.
- Kept plan selection, menu state and request lifecycle local to their owning components.
- Used real invitation persistence with a private database and no public record-listing endpoint.
- Included schema constraints, migrations, a local launcher and reproducible integration scripts.
- Used the same route tree for prerendering and browser hydration.
- Ran the strict compiler, linting, formatting and the production build.

No TypeScript errors or lint warnings remained in the checked source.

## Pass 2 — Functionality and integration

### Component/API contract coverage

The 22 Vitest cases cover:

- Monthly and yearly prices, keyboard switch interaction and correct plan URLs.
- Accessible comparison data and explicit unavailable-feature labels.
- Plan and billing preselection, including hydration of static `/invite` HTML with a query-bearing browser URL.
- Name/email/consent validation, first-error focus and associated descriptions.
- A successful request, server rejection followed by retry, and a network failure without false success.
- Unique story routes, complete catalogue links, unknown-story fallback, copying a story link and denied-clipboard recovery.
- Schema strictness, email normalization, honeypot rejection and invalid enum values.
- Origin checks, content type, body size, parameterized inserts and private responses.
- Rate-limit response and Retry-After, safe database-failure responses, health checks and API method handling.
- Scheduled data-retention statements.

API contract tests use a controlled D1 test double. They are supplemented by the real database suite below; the test double alone is not treated as database-integration evidence.

### Real workerd + D1 coverage

`npm run test:integration` creates its own temporary state and starts the actual Worker runtime. All 22 checks passed:

1. Worker startup and a health query against real local D1.
2. Cross-origin rejection.
3. Incorrect content-type rejection.
4. Missing-consent rejection.
5. Invalid-email rejection.
6. Unknown-field rejection.
7. Honeypot rejection.
8. Oversized-body rejection.
9. Malformed-JSON rejection.
10. Successful invitation insert.
11. Non-cacheable personal-data response.
12. API security headers.
13. Uniform duplicate-email response.
14. A sixth valid request receives 429 and Retry-After.
15. Wrong API method receives 405.
16. Unknown API route receives 404 rather than application HTML.
17. Production HTML contains prerendered content without running client React.
18. Unknown web route serves the actual 404 page and status.
19. Database query confirms normalized email uniqueness.
20. A SQL-like name is stored literally and does not execute.
21. The scheduled retention handler executes.
22. Database query confirms expired invitations and rate-limit rows were removed.

The temporary integration database is removed afterward. These checks do not touch production records.

### Browser and deployment checks

Used the actual Chromium browser for desktop and iframe viewports at **320, 375, 768, 1024 and 1440 CSS pixels**. The matrix covers Home, Stories, Features, Pricing and Invite. It checks horizontal overflow, broken loaded images and axe violations. The final matrix reported **25 total, 0 failed**.

Also visually inspected desktop Home, mobile Home and tablet Features. Exercised mobile menu navigation to Pricing, the yearly switch, plan selection and form submission. The local browser-to-API submission reached the real saved-request confirmation.

For the live release, verified HTTP 200 on `/`, `/stories`, `/features`, `/pricing`, `/invite`, a reader and `/api/health`; verified an actual WebP response and security headers; verified that an unknown path returns HTTP 404 with the custom page. A live browser request was stored with the expected plan/billing values. The synthetic test invitation was then deleted by its exact reserved test address.

## Pass 3 — Performance, security and release readiness

### Measured build outputs

| Output              | Measured size                                                      |
| ------------------- | ------------------------------------------------------------------ |
| Main frontend entry | About **232.4 kB raw / 74.2 kB gzip**                              |
| Compiled CSS        | About **27.4 kB raw / 6.6 kB gzip**                                |
| Home hero WebP      | **19,244 bytes**                                                   |
| Backend Worker      | About **463.1 KiB raw / 98.5 KiB gzip**                            |
| Static deployment   | **89 assets**, approximately **1.3 MB** across all pages and media |
| Worker startup      | **14 ms**, as reported by the deployment API                       |

The main entry is not the entire page transfer: shared chunks, CSS, fonts and images are additional. No misleading “total page size” is derived from the main entry alone.

Verified prerendered content, lazy secondary routes, local fonts, responsive image source widths, explicit image dimensions, priority hero loading, below-fold lazy images, bounded asset caching and reduced-motion CSS. No external font, analytics or animation-engine request is necessary for the interface.

Reviewed same-origin mutation checks, streamed body limits, schema validation, parameterized SQL, database uniqueness, atomic rate limiting, safe errors, CSP, frame denial, HSTS, privacy disclosures and scheduled retention. No credentials are committed; `.env.example` contains documentation only.

### Issues found and resolved

| Finding                                                                                 | Resolution and verification                                                                                                               |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Validation errors became part of the input’s accessible name                            | Added stable label references and separate error descriptions; reran form tests                                                           |
| Plan action names did not contain the visible label                                     | Aligned accessible and visible naming; reran axe                                                                                          |
| Custom story-card labels omitted visible content                                        | Let the browser derive the name from the card; reran all 25 browser cases                                                                 |
| Selected navigation and inactive billing text fell just below contrast requirements     | Darkened the muted text; reran axe at mobile/tablet/desktop widths                                                                        |
| A 320 px iframe overflowed because a minimum body width excluded scrollbar space        | Removed that minimum width; all narrow-screen cases passed                                                                                |
| Mobile comparison headers lost their accessible column context                          | Preserved column headers and explicit cell associations                                                                                   |
| The two-port development proxy failed production-style origin checks                    | Rewrote only recognized development origins at the Vite proxy; browser submission passed                                                  |
| Direct query-bearing invitation URLs hydrated static default preferences                | Added post-hydration synchronization; wrote a regression test that first failed, then passed, and checked stored live plan/billing values |
| Native form default behavior could put fields into a GET URL before JavaScript is ready | Declared POST and the API action in the rendered form; regression assertions check both attributes                                        |
| Worker runtime startup initially encountered an environment network-interface error     | Used explicit loopback and inspector-port flags; local runtime and integration checks then passed                                         |
| The initial integration-report parser included CLI warning output                       | Kept stdout and stderr separate; all database assertions then ran successfully                                                            |
| Initial dependency audit found two development-tool advisories                          | Updated Vitest; the final full audit reported zero vulnerabilities                                                                        |

## Verification boundaries

- Chromium was exercised. Firefox, Safari, physical iOS/Android devices and assistive-technology combinations were **not** run in this environment.
- No Lighthouse run, field Core Web Vitals sample, stress test or formal penetration test was performed. No score, percentile or compliance certification is claimed.
- An axe pass is useful automated evidence, not a complete accessibility certification.
- Original gallery assets are sized for the reference cards. Added large reader views inherit that source-resolution limit.
- Interactive form validation, plan preferences and sharing require JavaScript. Static marketing content remains prerendered.
- Email invitations, photo uploads, accounts and paid subscriptions are outside this marketing-site deliverable and are clearly disclosed in the interface.
- GitHub Actions deployment requires owner-configured Cloudflare secrets. Providing a workflow does not imply those credentials were automatically installed.

These boundaries do not leave an advertised marketing-site interaction without a destination: all core navigation, story links, pricing choices and invitation actions are implemented and tested within the stated scope.
