# Architecture and engineering decisions

## Scope

The reference describes a responsive photography marketing website. Four core pages, mobile navigation and pricing interactions are the required scope. This implementation adds readable photo essays and a small invitation service so the story and invitation actions have complete destinations.

This is not the photo-hosting service advertised by the sample marketing copy. Accounts, uploads, subscriptions and email delivery are deliberately outside the delivered product boundary and are disclosed in the interface.

## Frontend rendering

Vite produces a React application with lazy page boundaries. A second server build renders the same route tree to HTML using `renderToReadableStream` and `StaticRouter`. The prerender step waits for lazy routes to finish, writes one HTML file per public route, and generates metadata, robots.txt and a sitemap. React hydrates this content in the browser. This gives crawlers and visitors real content without waiting for application JavaScript.

The design system uses DM Sans, a restrained black/white palette, defined type scales, a shared gradient and reusable split sections. Tailwind CSS supplies reset, theme utilities, grids and small layout utilities; component-specific CSS handles the reference’s precise proportions and responsive art direction.

The public catalogue is static typed content. Local state handles the billing switch, navigation, sharing and form lifecycle. A server-state cache or global store would add complexity without improving these workflows. Validation code is loaded with the invitation route, rather than on the home page.

## Backend and database

Frontend HTML and assets are served by Cloudflare’s static asset pipeline. `/api/*` invokes the Worker first. The API uses Web Request/Response primitives, Zod validation and D1 prepared statements. No Node compatibility layer, Express process, database password or client-side database access is required.

`invites` contains a UUID, name, case-insensitive unique email, plan, billing, consent timestamp and creation timestamp. `rate_limits` contains only a daily IP-derived hash, a window timestamp and an atomic request counter. Both tables have retention indexes.

The schema enforces valid enum values and length bounds in addition to application validation. An `INSERT ... ON CONFLICT(email) DO NOTHING` makes repeated requests safe. All values are bound separately from SQL text. Rate limiting uses one atomic SQLite upsert with `RETURNING`, so concurrent requests cannot bypass the counter through a read/write race.

An invitation is acknowledged only after its database insert completes. Errors are retryable and do not clear the form. No email-delivery promise is made. The uniform duplicate response avoids providing an email-enumeration endpoint.

## Security and operations

- Require a same-origin `Origin` header and JSON for mutations; no permissive CORS.
- Reject unknown fields, absent consent, honeypot content and bodies over 2 KiB.
- Enforce the body limit while reading the stream, not just through `Content-Length`.
- Add CSP, HSTS, frame denial, MIME sniffing protection and restricted browser permissions.
- Return `Cache-Control: no-store` for API responses and sanitize public error messages.
- Expose no database browser, administrative API or request-listing endpoint in production.
- Run daily retention cleanup and keep credentials outside source control.
- Keep local and integration databases separate from production.

The Vite proxy rewrites only recognized **development** frontend origins to the local API port. Production retains strict same-origin enforcement. This avoids weakening the production API to accommodate a two-port development environment.

## Performance choices

Core marketing content is prerendered. Secondary pages and validation code are lazy loaded. Fonts are self hosted with `font-display: swap`. WebP images have explicit dimensions, correct source widths, priority loading for the main image and lazy loading below the fold. Image transforms are generated ahead of time, rather than on every request.

The interface uses lightweight opacity and transform transitions and honors reduced-motion preferences. There are no scroll listeners, animation engines, trackers, remote font requests or always-running timers in the product.

Static asset responses have cache headers and platform ETags. Stable public image filenames use a bounded one-day cache with stale-while-revalidate; they are not incorrectly marked immutable for a year. Bundle sizes and measured verification are in the testing report.

## Tradeoffs and next steps

Original gallery assets are approximately 360×500 pixels. They reproduce the design at their intended card size; the added full-page reader cannot invent high-resolution originals. Replace them with licensed higher-resolution sources before presenting the reader as a professional photography publishing service.

The fifteen-minute limit is per daily hash, so the UTC date boundary rotates that key. It is an abuse reduction measure, not proof of identity or comprehensive bot protection. A large public launch should add managed bot protection and operational alerting based on observed abuse. Large-scale email invitation delivery would require a verified mail provider and a separate delivery/consent workflow.

Deployment credentials for GitHub Actions must be configured by the repository owner; the provided workflow never stores or fabricates tokens. CI validates the build; the deployment workflow is explicit and manual.
