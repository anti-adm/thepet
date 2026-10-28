# The Pet Creator Starter Guide — Phase 1

Buildless, mobile-first HTML/CSS/JavaScript storefront. No framework or runtime dependencies; deploy `dist/` as static assets. Run `python3 -m http.server 4173 --directory dist` from this directory.

## Design and behavior
Warm cream, dusty rose, mauve, editorial DM Serif Display and DM Sans (self-hosted). All nine brief sections are present. Responsive WebP photos were generated using Ada's three supplied photos as identity references. Product pages are illustrative CSS mockups, not completed download files.

Hero and navigation purchase links lead to the offer. `handlePurchaseIntent` in `dist/app.js` is the single checkout integration boundary. It currently displays an accessible, dismissible pending-checkout dialog. No payment collection or simulated success exists. FAQ buttons support keyboard use, `aria-expanded`, animated panels, and reduced-motion preferences. Native dialogs manage focus and Escape dismissal. Footer content opens explicitly pending notices.

## Verification
- JavaScript syntax: `node --check dist/app.js` passed.
- Local HTTP response: 200.
- Browser overflow checks passed at 320, 375, 390, 430, 768, 1024, 1280, 1440 px.
- Mobile and full desktop layouts visually inspected.
- FAQ expansion, pending checkout, Escape dismissal, privacy notice and dialog close verified in the browser.
- No build, TypeScript, or lint system is required by this static stack.

## Before commercial launch / Phase 2
Provide actual guide PDF, pitch templates, media kit, tracker, checklist, contact details and approved privacy, terms and refund content. Replace illustrative previews if real previews become available. Integrate Stripe Checkout using a server-created session, webhook-verified fulfillment, protected files and authorized downloads, with success/error states and optional email delivery. Do not fulfill from a frontend redirect alone. No Phase 2 backend is implemented.

Generated photography is in `dist/assets/ada-hero.webp` and `dist/assets/ada-portrait.webp`, with 640px responsive derivatives. Generation prompts and provenance are recorded in `IMAGE-PROMPTS.md`.

## Motion and floral update
`dist/motion.css` and `dist/motion.js` add a short first-session paw welcome, staggered hero and scroll reveals, hand-drawn SVG botanical accents, and restrained hover/press feedback. Welcome waits at least 850ms and at most 1800ms for hero readiness, then fades; a separate 2600ms fail-safe removes the entrance class if enhancement fails. It never locks scrolling and keyboard/pointer input dismisses it. Session storage is optional and guarded. Observer animations run once, use transform/opacity, and are disconnected per element after entry. Focus reveals its ancestors immediately. Reduced-motion and printing expose all content without motion. SVG stems draw once; no continuous animation loops or added libraries.

Update QA: JS syntax checks passed. Browser checked 320, 390, 768 and 1440px without horizontal overflow. First-visit paw welcome, completed entrance, scroll reveals, decorative composition and purchase dialog inspected; no browser console errors observed. Reduced-motion fallbacks reviewed in source (OS preference was not changed).

## Price and copy update
Price is now $10 in both offers, SEO/social metadata and the pending-checkout dialog. Removed repeated instant-access captions, the illustrative-preview caption, generic section eyebrows, decorative slogans, and filler photo/footer text. Purchase buttons consistently say GET THE GUIDE. Core product details, the FAQ and honest pending-checkout behavior remain. Product art remains an illustrative mockup, not an actual delivered file.

## GitHub Pages
Public website: https://anti-adm.github.io/thepet/
Source repository: https://github.com/anti-adm/thepet

The `main` branch contains all source, assets and project documentation. GitHub Pages serves the root of `gh-pages`, generated from `dist/` without a build step.

To publish subsequent changes after committing them:
```sh
git push github main
git subtree split --prefix dist -b pages-release
git push github pages-release:gh-pages
git branch -D pages-release
```
The `.openai/hosting.json` file is retained for the existing Sites project; GitHub Pages does not use it.

## Mobile readability and identity update
The full name appears in a two-line lockup: THE PET CREATOR / STARTER GUIDE. Ada's generated transparent face-and-paw logo is used in the header/footer, favicon and Apple touch icon; the original master and prompt are in `branding/`.

Replaced emoji-prone Unicode arrows, hearts, search and star symbols with inline SVG, and checklist ticks with CSS strokes. Main reading copy is 16px, chapter titles 18px, FAQ controls 16px, footer links 14px and hero product label 14px (13px at the narrowest width). Decorative microcopy was removed from product mockups. Colors and spacing were adjusted for readability, with no horizontal overflow at 320/375/390/430/768/1024/1440px. Mobile chapter and icon sections and desktop header visually inspected; FAQ and checkout dialog verified. This is browser viewport QA, not a physical iPhone test.

## Vultr deployment
Primary domain: https://westieada.com/ (www redirects to the primary domain).
Static releases live in `/srv/pet-guide/releases/`, selected by `/srv/pet-guide/current`. Existing Caddy serves the site with automatic HTTPS. Private future deliverables belong outside this web root in `/var/lib/pet-guide/private`.
GitHub Pages is the previous deployment; do not use its publish commands for production updates. Stripe, transactional email and protected download endpoints are not implemented yet.

## Sandbox checkout (2026-10-29)
`/checkout.html` uses Stripe Payment Element with the Checkout Sessions API (`ui_mode: elements`, API version `2026-09-30.endive`). `/api/checkout` creates a fixed-price USD 10 session. The server refuses live keys or a live/recurring/wrong-amount Price. Secrets are in `/etc/pet-guide.env` (root-only), never the repository. The service runs as `pet-guide` on loopback port 8791 behind Caddy, with SQLite order/event storage outside the web root.

`POST /api/stripe/webhook` accepts signed snapshot events. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`. Set `STRIPE_WEBHOOK_SECRET` in the server environment file and restart `pet-guide` to enable handling. Until then the endpoint returns 503, allowing Stripe retries. No fulfillment is performed. `/api/order` retrieves the current Stripe status for the opaque HttpOnly order cookie; it does not turn a browser redirect into a fulfilled order.

Validation: sandbox card payment completed through the custom UI, confirmed server-side as `paid`, USD 1000 cents. Signed-event, duplicate-event, tampered-payload, invalid-signature, cross-origin, invalid-input and missing-order tests passed using an isolated temporary database. The browser return navigation was blocked by stale local DNS; the actual order-status API was verified independently. Genuine Stripe webhook delivery remains to be verified after configuring its signing secret. PDF, email, live purchase consent, legal terms, taxes, refunds/disputes and production hardening remain future steps.

Run server smoke tests with the sandbox environment loaded: `node --env-file=/etc/pet-guide.env server/smoke-test.mjs`. They start a temporary loopback service on port 8792 and clean up its database.
