# Invitation platform

A React 19 / TypeScript invitation storefront with a long, anchored homepage, an eight-design catalogue, immersive video demo, six-section resumable order, preview studio and lightweight customer account. Built with Tailwind v4, shadcn/ui, Framer Motion, react-hook-form and Zod. English / Urdu language selection includes RTL layout.

## Runtime and demo boundary

The Lovable preview uses the platform-required **TanStack Start + TanStack Router** rather than React Router. No Lovable Cloud, Supabase, backend, admin panel or real payment processing is connected. Every application-data operation passes through `src/services/api.ts`; print operations pass through the provider adapter in `src/services/print.ts`.

The mock adapter stores drafts, credit balances, unlocked products, sharing addresses and RSVP responses in **this browser's localStorage**. Resume links include a random order ID and secret. They are not cross-device links until the adapter is replaced by WordPress. Secrets in query strings are demo-only; use a production session and secure exchange with WordPress. Uploads store filenames only. Payments, print estimates, purchases and premium export unlocking are explicitly demonstrations. The low-resolution, watermarked PNG download is real; high-resolution assets and actual AI generation are not implemented.

Eight invitation designs and a sample animated intro are included. Other design demos show their own artwork; the intro video is an illustrative shared sample. Example pricing, reviews, contact and payment information are illustrative and must be replaced before launch. Contact settings live in `src/config.ts`. No funds should be sent to the demo account numbers.

## Development

- `bun install`
- `bun run dev`
- `bun run test`
- `bun run build` — platform deployment
- `bun run build:wordpress` — standalone browser bundle in `dist-wordpress/` with `main.js` and `main.css`, no hashed entry filenames. This optional export configuration is provided separately from the hosted deployment; its output still needs validation in the target WordPress theme.

All endpoints below are proposed custom plugin contracts, not existing WordPress core endpoints. Endpoint URLs are centralized in `src/config.ts`; replace the mock implementations in place to connect WordPress without changing the UI. Adapt WooCommerce product IDs for the store's actual products. Do not put WooCommerce consumer secrets in browser code.

## Service-to-endpoint map

| Function | Method / endpoint |
|---|---|
| `getSiteContent()` | GET `/wp-json/invitations/v1/site-content` — ACF options mapped to the bilingual schema |
| `getDesigns()` | GET `/wp-json/invitations/v1/designs` |
| `getTiers()` | GET `/wp-json/invitations/v1/tiers` |
| `getCreditPacks()` | GET `/wp-json/invitations/v1/credit-packs` |
| `createOrder(input)` | POST `/wp-json/invitations/v1/orders` |
| `saveOrderDraft(order)` | PATCH `/wp-json/invitations/v1/orders/:id/draft` |
| `getOrderByKey(id,key)` | GET `/wp-json/invitations/v1/orders/:id?key=:key` — validate secret server-side |
| `getOrders()` | GET `/wp-json/invitations/v1/orders` — authenticated customer |
| `submitOrder(id,key)` | POST `/wp-json/invitations/v1/orders/:id/submit` |
| `generatePreview(id,key)` | POST `/wp-json/invitations/v1/orders/:id/preview` — queue real generation |
| `checkSlugAvailability(slug)` | GET `/wp-json/invitations/v1/slug-availability?slug=...` |
| `getCredits()` | GET `/wp-json/invitations/v1/credits` |
| `buyCredits(packId)` | POST `/wp-json/wc/store/v1/cart/add-item`, then POST `/wp-json/wc/store/v1/checkout`; grant credits only from verified completed WooCommerce order |
| `unlockExport(id,key,format)` | POST `/wp-json/invitations/v1/orders/:id/downloads` — atomically debit credits, idempotent |
| `getDownloads(id)` | GET `/wp-json/invitations/v1/orders/:id/downloads` |
| `getInvitationLink(id)` | GET `/wp-json/invitations/v1/orders/:id/link` |
| `setInvitationLink(id,slug)` | PATCH `/wp-json/invitations/v1/orders/:id/link` |
| `getSharedInvitation(slug)` | GET `/wp-json/invitations/v1/invitations/:slug` — expose public invitation fields only |
| `getRsvpResponses(id)` | GET `/wp-json/invitations/v1/orders/:id/rsvp` — authenticated host |
| `submitRsvp(id,response)` | POST `/wp-json/invitations/v1/orders/:id/rsvp` — public guest, rate-limited |
| `payNow(id,key)` | POST `/wp-json/wc/store/v1/checkout`; confirm payment server-side before unlocking |
| `getOrderPrice(order)` / `getPaymentDue(order)` | Pure mock pricing helpers; replace totals with WooCommerce-calculated amounts |
| `downloadFreePreview(image,order)` | Browser canvas download now; later signed watermarked preview asset from generation service |
| `PrintProvider.quote(style,quantity)` | POST `/wp-json/invitations/v1/print/quote` |
| `PrintProvider.createPrintOrder(quote)` | POST `/wp-json/invitations/v1/print/orders` |
| `PrintProvider.trackOrder(id)` | GET `/wp-json/invitations/v1/print/orders/:id` |

Proposed custom shared-invitation endpoint is represented in config alongside other endpoints. Production services must use appropriate nonce/session validation and never trust client prices, credits or payment receipts. Provider credentials belong on the WordPress server.

## Content schema / ACF mapping

`src/mocks/content.ts` exports `SiteContent` and `{ en: SiteContent, ur: SiteContent }`. Load with `getSiteContent()`. This object contains **all marketing sections**, FAQ answers, reviews, package-section wording, footer and default SEO text.

Mirror these groups in ACF options (one group per language):

- `seo`: `title`, `description`
- `nav`: repeater `{ id, label }`
- `hero`: `eyebrow`, `title`, `line`, `emphasis`, `description`, `browse`, `demo`, `trust`, `rating`, `note`, `badge`, `phone`, `tag`
- `benefits`: text repeater
- `designs`: `eyebrow`, `title`, `emphasis`, `text`, `all`, `styles`, `from`, `more`, `empty`, `emptyText`, `footer`
- `how`: heading fields + `steps[] { title, text }`
- `comparison`: heading fields + `labels[]`, `columns[]`, `values[][]`
- `features`: heading fields + `items[] { title, text }`
- `free`: heading fields + `previewTitle`, `previewItems[]`, `paidTitle`, `paidItems[]`, `note`
- `pricing`: heading fields + launch/popular/choose/once text, credit headings, credit labels and print-add-on note
- `print`: heading fields + `items[] { id, name, description, price }`, quantity/quote labels and disclaimer
- `reviews`: heading fields + `items[] { name, event, quote, initials }`
- `faq`: heading fields + `items[] { q, a }`
- `final`: `eyebrow`, `title`, `emphasis`, `text`, `cta`
- `footer`: description, contact labels, copyright, terms/privacy/refund, legal, social labels
- `order`: introduction, edition descriptions, help, draft notice, next steps and trust statements

`Design`, `Tier`, `CreditPack`, `Order`, `OrderDetails` and `Rsvp` contracts are exported from `src/services/types.ts`. Catalogue mock data is in `src/mocks/products.ts`. Product names/descriptions/features are product data, suitable for WooCommerce product metadata. Shared UI labels use `src/i18n/en.json` and `ur.json`; some demo form labels and catalogue data are currently English in both modes and should be localised fully before launch.

`FaqSchema` receives FAQ items as a prop and emits FAQPage JSON-LD. Use Rank Math for the remaining production SEO; adjust duplicate FAQ output if Rank Math also emits FAQ schema. Each hosted content route provides sensible unique metadata, with no generic Lovable defaults.

## WordPress theme integration

1. Generate the optional browser bundle with `bun run build:wordpress`. Copy `main.js`, `main.css` and any generated `assets/` into your theme's `invitation-app/` directory.
2. Render `<div id="root"></div>` in the theme template. The standalone entry is `src/wordpress.tsx`.
3. Enqueue `main.css` as a stylesheet and `main.js` as a **module script** (WordPress script modules API, or a `script_loader_tag` filter adding `type="module"`). Cache-bust through the enqueue version, not the filename.
4. Load Cormorant Garamond, Manrope, Noto Nastaliq Urdu and Noto Sans Arabic in the theme head (or self-host them). The hosted app adds preconnect/font links through its root head.
5. Before the module, inject `window.__SITE_DATA__ = { content: { en: ..., ur: ... }, designs: [...], tiers: [...], creditPacks: [...] }` with WordPress `wp_json_encode` and escaping. These values take priority over the service fallback. Missing values use mocks now; change the adapter fallback to fetch its configured endpoint for production.
6. The client uses path-based TanStack routing (`/`, `/order`, `/studio`, `/account`, `/invitation/:slug`). Configure WordPress rewrite/template rules so these paths all return the same mount template. If deployed below a subdirectory, configure the router basepath and template rules before deployment. Do not ship a separate React Router implementation.
7. Replace Lovable CDN media URLs with theme media-library URLs for portability if hosting outside Lovable. All supplied asset pointers are in `src/assets/`.
8. Disable/replace mock storage, checkout confirmations and demo account details. Connect real uploads, generation queues, user accounts, signed download assets and print fulfillment before launch.

## Checks

The test suite covers draft secrecy, autosave/submission status regression, split payments, 5/15/40 credit packs, locked high-quality exports, slug availability and print quantities, plus index route matching. Browser verification checks the homepage, live video, a real-input order, same-browser resume, watermarked download, credit unlock and account readback.
