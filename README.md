# Photosnap Studio

A photography storytelling experience with a precise, responsive editorial layout, interactive plan comparison, and a working invitation service.

**[Live website](https://photosnap-studio.ramtinbabaei-portfolio.workers.dev)** · **[Source code](https://github.com/RamtinBabaei/photosnap-studio)**

Built by **Ramtin Babaei** with React, TypeScript, Tailwind CSS and Cloudflare Workers.

## Experience

- Four core pages: Home, Stories, Features and Pricing.
- Sixteen gallery stories and a featured photo essay, each with a dedicated reader and sharing action.
- Monthly/yearly billing switch and a responsive feature comparison table.
- Plan-aware invitation form with inline validation, loading, success, retry and failure states.
- Real invitation persistence in a private D1 database; case-insensitive email uniqueness.
- Accessible mobile navigation, keyboard support, focus handling, reduced-motion support and meaningful image descriptions.
- Twenty-four prerendered HTML routes with individual metadata, canonical links, sitemap and a genuine HTTP 404 fallback.
- Locally served WebP imagery and fonts, route-level code splitting, CDN caching and no third-party analytics.

This is a complete **marketing website and invitation service**, not a subscription photo-hosting product. The feature descriptions and prices are sample marketing content. The preview does not create photographer accounts, accept uploads, send email invitations or charge money. This boundary is also disclosed beside the form and on the privacy page.

## Technology

| Layer             | Choice                                     | Reason                                                            |
| ----------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| Interface         | React 19, TypeScript, Tailwind CSS 4       | Typed components and a small, reusable design system              |
| Build and routing | Vite 8, React Router 7                     | Fast development, lazy routes and static prerendering             |
| API               | TypeScript on Cloudflare Workers           | Same-origin edge API without an always-on server                  |
| Validation        | Zod 4                                      | Shared client/server input contract                               |
| Database          | Cloudflare D1 / SQLite                     | Durable, indexed storage for a bounded invitation workflow        |
| Quality           | Vitest, Testing Library, workerd, axe-core | Component, security, persistence and browser accessibility checks |
| Operations        | Wrangler, GitHub Actions                   | Reproducible builds, migrations and deployment                    |

There is no need for global state libraries, a separate Express server, PostgreSQL, Docker, authentication, or a payment SDK for this scope. See [architectural decisions](docs/ARCHITECTURE.md).

## Run locally in VS Code

Install **Node.js 22.12 or newer** (Node 22 LTS is used by CI) and Git.

```bash
git clone https://github.com/RamtinBabaei/photosnap-studio.git
cd photosnap-studio
code .
npm ci
npm run dev
```

In VS Code, use **Terminal → New Terminal** for the commands. If `code .` is unavailable, choose **File → Open Folder** and select `photosnap-studio`.

Open **http://localhost:4173**. The development launcher applies local database migrations and starts both Vite and the Worker API. No Cloudflare login or secrets are needed for local development. Local requests use a local SQLite database under `.wrangler/state`; they never write to production.

To confirm it works:

1. Open all four pages from the navigation.
2. On Pricing, toggle Yearly: Basic becomes `$190.00`, Pro `$390.00`, Business `$990.00` per year.
3. Choose a plan and confirm the invitation form carries that plan and billing preference.
4. Submit an empty form to inspect validation; submit valid details and consent to see the saved-request confirmation.
5. Open **http://localhost:4173/api/health**. It should return `{"status":"ok"}` after checking database connectivity.

Stop both development processes with **Ctrl+C**. See [LOCAL_SETUP_FA.md](docs/LOCAL_SETUP_FA.md) for Persian instructions and troubleshooting.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run test:integration
npm run build:worker
npm audit
```

The integration suite starts an isolated real `workerd` instance and a temporary local D1 database, then removes its own temporary state. It tests validation, origin checks, persistence, duplicate requests, SQL parameterization, rate limiting and scheduled data retention. It does not contact the live database.

For repeatable browser checks, while the development server is running:

```bash
npm run review:browser
```

Open **http://localhost:4173/__qa.html** and select **Run responsive suite**. The review checks five pages at 320, 375, 768, 1024 and 1440 CSS pixels for horizontal overflow, broken loaded images and axe accessibility violations. The iframe uses the real browser CSS viewport. Clean the temporary review files before deployment:

```bash
npm run review:clean
```

Executed checks, review findings, fixes and verification limits are documented in [TESTING_REPORT.md](docs/TESTING_REPORT.md). No Lighthouse score or unexecuted cross-browser certification is claimed.

## Production build and deployment

```bash
npm run build
npm run build:worker
npx wrangler login
npm run db:remote
npx wrangler deploy
```

`npm run build` emits the optimized frontend and prerendered routes in `dist/`. `build:worker` validates and bundles the backend without publishing. Wrangler deploys the frontend and API together with the bindings in `wrangler.jsonc`.

For your own Cloudflare account, create a database with `npx wrangler d1 create photosnap-production`, replace the database ID in `wrangler.jsonc`, and set your production origin in `scripts/prerender.mjs` before building. Database IDs are resource identifiers, not credentials.

The included **Quality checks** workflow runs on pushes and pull requests. The **Deploy to Cloudflare** workflow is manually triggered and requires repository secrets named `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; configure a scoped token for Workers scripts and D1. Credentials from interactive development are never committed. The initial live deployment does not depend on these GitHub secrets.

## API and privacy

| Endpoint            | Behavior                                                     |
| ------------------- | ------------------------------------------------------------ |
| `GET /api/health`   | Checks D1 connectivity; returns a non-cached health response |
| `POST /api/invites` | Validates and saves a consented invitation request           |

The API requires JSON, the same origin, bounded request bodies, valid fields and consent. It uses parameterized SQL and an atomic database-backed limit of five valid submissions per IP-derived key per fifteen minutes. Duplicate emails receive the same response without exposing whether someone else is registered. The API offers **no public endpoint for listing requests**.

Invitation data is retained for up to 90 days, with daily scheduled cleanup. Rate-limit keys are a daily rotating SHA-256 hash of the connecting IP; raw IPs are not stored in the application database. Hosting infrastructure may process standard access logs. Do not treat hashing as complete anonymization. Removal requests can be made through the contact address on the privacy page.

## Project map

```text
src/components/   Shared layout, typography actions, responsive imagery and grids
src/pages/        Home, gallery, features, pricing, invitation, reader, privacy, 404
src/data/         Typed story catalogue, feature matrix and image dimensions
shared/           Validation contract and pricing data
worker/           Same-origin API and scheduled retention handler
migrations/       Versioned SQLite schema
tests/            Component and API contract tests
scripts/          Prerendering, development and real D1 integration/browser review
public/           Self-hosted images, icons and security header rules
docs/             Architecture, setup and verification records
.github/workflows/ Quality gate and opt-in deployment
```

## Design and asset credits

The visual specification and sample photography come from the [Photosnap design challenge](https://www.frontendmentor.io/challenges/photosnap-multipage-website-nMDSrNmNW) by Frontend Mentor. The original asset files were retrieved from a public asset snapshot at [osamanazakat/photosnap](https://github.com/osamanazakat/photosnap); no implementation code was reused. Images were converted to WebP for this implementation. DM Sans is distributed under its bundled SIL Open Font License. Original story titles and photographer names are design sample data; reader essays are illustrative editorial content.

Original application code is MIT licensed. Third-party designs, images, icons and fonts retain their respective rights and are not relicensed by this repository. Check the original rights before reusing those assets commercially.
