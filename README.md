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
