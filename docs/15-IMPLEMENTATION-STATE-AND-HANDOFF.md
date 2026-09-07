# UrbanEdge Land Space — Implementation State and Agent Handoff

This is the live record of what has actually happened. Update it after every meaningful implementation, migration, security, test, milestone or approval-gate change. Never record planned work as completed work.

## 1. Project Snapshot

| Field | Current value |
|---|---|
| Project | UrbanEdge Land Space |
| Repository | `/Users/vedpatel/Desktop/UrbanLand_website` |
| Current branch | `main` |
| Latest relevant commits | M18 QA/report `bc68a2c`; M18 handoff `e8d6258`; M19 implementation/runbook `b8ffaa0`; this handoff checkpoint follows it |
| Working tree | CLEAN after the M19 handoff commit |
| Current milestone | M19 — Deployment Preparation, Staging Validation and Production Approval Gate |
| Current milestone status | CONDITIONAL HOLD — local preparation complete; external launch gates remain |
| Last completed milestone | M18 — Full Testing and Production-Build Qualification |
| Next milestone | Resolve the named staging/provider/owner/legal/device gates; production remains unauthorized |
| Last updated | 2026-09-07 |
| Last updating agent | Codex |

## 2. Source-of-Truth Documents

Owner-defined priority:

1. `00-MASTER-CODEX-BUILD-PROMPT.md` — present as the final embedded document in `/Users/vedpatel/Desktop/merged (1).md`, lines 56904–62392; read in full and applied as highest priority
2. `LANDSPACE_PRODUCT_REQUIREMENTS.md`
3. `LEGAL_VERIFICATION_REPORT.md`
4. `03-DATABASE-SCHEMA-ARCHITECTURE.md`
5. Other numbered architecture documents
6. `LAND_DATA_MODEL_REPORT.md`
7. `URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md`

Supplied numbered documents:

- `01-MASTER-WEBSITE-ARCHITECTURE.md`
- `02-PAGE-ROUTE-UX-ARCHITECTURE.md`
- `03-DATABASE-SCHEMA-ARCHITECTURE.md`
- `04-BACKEND-API-BUSINESS-LOGIC.md`
- `05-ADMIN-CRM-ARCHITECTURE.md`
- `06-VERIFICATION-WORKFLOW.md`
- `07-SEO-ARCHITECTURE.md`
- `08-SECURITY-PRIVACY-RLS.md`
- `09-MEDIA-STORAGE-ARCHITECTURE.md`
- `10-INFRASTRUCTURE-DEPLOYMENT.md`
- `11-TESTING-QA-PLAN.md`
- `12-IMPLEMENTATION-ROADMAP.md`
- `13-DEFINITION-OF-DONE.md`
- `14-PRE-LAUNCH-CHECKLIST.md`

Supporting documents:

- `LANDSPACE_PRODUCT_REQUIREMENTS.md`
- `LAND_DATA_MODEL_REPORT.md`
- `LEGAL_VERIFICATION_REPORT.md`
- `URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md`

Implementation-facing source map:

- `docs/architecture/IMPLEMENTATION-LEDGER.md`
- `docs/architecture/SOURCE-MANIFEST.md`
- `docs/REQUIREMENTS.md`
- `docs/DECISIONS.md`

Accepted ADR:

- `docs/adr/0001-separate-site-visit-lifecycle-from-follow-up.md` supersedes document `05` only where it treats `FOLLOW_UP_REQUIRED` as a visit status. It retains document `03`'s eight visit states and uses CRM follow-up state instead.
- Full master-prompt review confirms ADR-0001 remains compatible: the master contains no `FOLLOW_UP_REQUIRED` visit state and uses `SCHEDULED` as a high-level lifecycle phase, which document `03` refines into `PROPOSED`, `CONFIRMED` and `RESCHEDULED`.
- `docs/adr/0002-hosted-and-external-media-locators.md` is accepted for M7. It preserves one `media_assets` registry while resolving hosted-object requirements versus mandatory external video/drone/360 locators through mutually exclusive constrained fields.
- `docs/adr/0003-verification-provenance-and-professional-review.md` is accepted for M8. It persists evidence provenance, professional review, exceptions, applicability, history and lawyer-approved public copy as separate typed concepts.
- `docs/adr/0004-m12-crm-status-and-follow-up-reconciliation.md` is accepted for M12. It adopts the owner-mandated twelve-state pipeline and adds private structured follow-up history while retaining ADR-0001 separation from site visits.
- `docs/adr/0005-m16-seo-redirects-and-guide-hero-media.md` is accepted for M16. It persists chain-flattened canonical redirects, makes published-guide slug migration atomic and constrains guide hero media to approved public assets.

Resolved source limitation:

- UrbanEdge Living Space repository: owner confirmed it will not be provided and must not block M0.
- Authoritative Living Space reference: `URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md`, by owner direction dated 2026-09-03.
- Approved logo/reference asset: `UrbanEdge_Living_Space_Logo_HD.jpg`, present and inspected.

The design report governs Living Space brand/design reference only. It does not authorize source-code/backend coupling, and the approved Living Space logo must not be silently relabeled as a finished Land Space-specific logo.

## 3. Milestone Progress

| Milestone | Status | Started | Completed | Evidence / Notes |
|---|---|---|---|---|
| M0 Architecture Lock and Implementation Ledger | COMPLETE | 2026-09-03 | 2026-09-03 | Master prompt and architecture reviewed; owner-designated design report and approved logo inspected; consistency checks pass; ADR-0001 reconfirmed; Git baseline established |
| M1 Repository Foundation, Tooling and Test Bootstrap | COMPLETE | 2026-09-03 | 2026-09-03 | Clean install, lint, formatting, strict typecheck, unit/component tests, safety guard, boundary/secret checks and webpack production build pass; public/admin route shells compile |
| M2 Database Schema, Migrations, Reference Data and Constraints | COMPLETE | 2026-09-03 | 2026-09-03 | 49 tables, 24 enums, 3 ordered migrations, safe repeatable seed, 38 pgTAP tests, 24-way code concurrency test, two clean resets and database lint pass |
| M3 Server Data Contracts, State Machines and Public-Safe Projections | COMPLETE | 2026-09-03 | 2026-09-03 | Seven public-safe views, separate public/admin DTOs, centralized location privacy, executable state machines, validation schemas, server-only privileged clients and canary tests pass |
| M4 RLS, Grants and Authorization Data Boundary | COMPLETE | 2026-09-03 | 2026-09-03 | All 49 tables use RLS; 10 explicit public views, active-admin reads, server-privileged writes, trusted audit and 40 actor-matrix checks pass |
| M5 Admin Authentication and Admin Shell | COMPLETE | 2026-09-03 | 2026-09-03 | Local Auth E2E, active/inactive/non-admin denial, reusable authorization, protected dashboard, logout/session clearing, mobile shell and accessibility pass |
| M6 Property Domain Services and Admin Property CRUD | COMPLETE | 2026-09-03 | 2026-09-03 | Transactional draft services and protected list/detail/create/edit UX pass all database, unit, integration, component, E2E, security and build checks; publication remains blocked |
| M7 Media, Public Storage and Private Document Storage | COMPLETE | 2026-09-03 | 2026-09-03 | Five-bucket boundary, normalized/approved media, private documents, signed access, audits, quota controls and protected admin UX pass complete local qualification |
| M8 Verification Workflow and Verification Admin | COMPLETE | 2026-09-04 | 2026-09-04 | Configurable scoped checks, typed provenance, professional referrals, exceptions, history, public-safe disclosure gate and protected admin workflow pass complete local qualification |
| M9 Publication Gate and Public Projection Freeze | COMPLETE | 2026-09-04 | 2026-09-04 | Authoritative database readiness, atomic publish/unpublish, protected grouped admin UX/preview, closed availability, safe projections/indexability, revalidation, audit and complete regression gates pass |
| M10 Public Property Experience | COMPLETE | 2026-09-04 | 2026-09-05 | Server-rendered public home/shell, category and transaction landings, published inventory, canonical card/detail experiences, safe media/location/availability behavior, baseline SEO, responsive/accessibility/privacy checks and complete regressions pass |
| M11 PostgreSQL Search and URL-State Discovery | COMPLETE | 2026-09-05 | 2026-09-05 | Typed PostgreSQL provider, allow-listed public search projection/RPC, URL-owned filters/sorts/page, canonical/noindex rules, accessible desktop/mobile discovery, category/transaction integration and complete regression/query-plan/security gates pass |
| M12 CRM Core and Admin Operational Pipeline | COMPLETE | 2026-09-05 | 2026-09-05 | Private lead/party/requirement/match/activity/follow-up services, exact pipeline, protected inbox/pipeline/detail/requirements/follow-up routes, duplicate warning/contact reuse, dashboard queue, RLS/audit privacy and full local qualification pass |
| M13 Public Inquiry, Buyer Requirement, Contact and Intent Events | COMPLETE | 2026-09-05 | 2026-09-05 | Published-property inquiry, structured requirement, short contact, REQUESTED-only visit intake, intent events, atomic M12 CRM persistence, consent, abuse controls, post-commit notifications/analytics and complete local qualification pass |
| M14 Site Visit Request and Manual Coordination | COMPLETE | 2026-09-05 | 2026-09-05 | Protected queue/calendar/workspace, atomic manual lifecycle, India-time scheduling, conflict warnings, CRM synchronization, append-only history and separate terminal follow-up work pass complete local qualification |
| M15 Sell Your Land Owner Submission and Conversion | COMPLETE | 2026-09-06 | 2026-09-06 | Private ten-step intake, scanned owner documents, five consents, abuse/replay controls, protected assignment/review/history, non-destructive duplicate signals and explicit idempotent Draft-only conversion pass complete local qualification |
| M16 Guides, Locations, SEO and Crawl Control | COMPLETE | 2026-09-06 | 2026-09-06 | Curated Ahmedabad/Gandhinagar location architecture, guide publishing/admin, centralized metadata/canonicals, robots/sitemap, structured data, redirects, internal linking and privacy/crawl regression pass complete local qualification |
| M17 Security Hardening and Privacy Regression Closure | COMPLETE | 2026-09-06 | 2026-09-06 | Forced RLS, least-privilege view/RPC ACLs, SECURITY DEFINER review, storage/upload/admin/public-action/browser/session hardening, actor/hostile-path matrix and complete local regression pass |
| M18 Full Testing and Production-Build Qualification | COMPLETE | 2026-09-07 | 2026-09-07 | Clean zero-state qualification, exhaustive 702-criterion DoD reconciliation, integrated journeys, responsive/accessibility/browser/performance/SEO/privacy/security/recovery review and definitive full regression/build pass |
| M19 Deployment Preparation, Staging Validation and Production Approval Gate | CONDITIONAL HOLD | 2026-09-07 | — | Local deployment preparation, restore drill, current provider review and full release-candidate qualification pass; staging/provider/owner/legal/device/field evidence remains unavailable and production operations remain approval-gated |

## 4. Current Work

M19 local engineering preparation is complete under a conditional hold. The release candidate has a
strict local/preview/production environment contract, Netlify/Supabase staging plan, current provider
and quota review, ordered migration/storage/admin bootstrap checks, successful isolated restore drill,
rollback/DNS/TLS/CSP procedures, staged smoke/performance/device plans, business/legal/content/SEO/
analytics/operations gates and an exhaustive pre-launch checklist reconciliation. No staging or
production target, real credential, DNS control, legal approval, approved launch content or physical
device was available, so no such item is marked PASS and production is not authorized.

Relevant sources:

- owner's implementation brief;
- embedded master prompt and finalized architecture;
- `10-INFRASTRUCTURE-DEPLOYMENT.md`, `12-IMPLEMENTATION-ROADMAP.md` M19 and `14-PRE-LAUNCH-CHECKLIST.md`;
- route, data, backend, media, infrastructure, testing, completion and pre-launch contracts in documents `01` through `14`;
- the M18 transfer register and complete M0–M18 application, privacy, publication, workflow, crawl and security boundaries;
- `docs/architecture/IMPLEMENTATION-LEDGER.md`.

Principal M19 files:

- `docs/runbooks/m19-deployment-preparation.md`
- `config/environment-schema.ts`, `next.config.ts` and `lib/seo/robots.ts`
- `docs/PRE-LAUNCH-PLACEHOLDERS.md`, `supabase/migrations/README.md` and `README.md`
- `docs/architecture/IMPLEMENTATION-LEDGER.md`
- this handoff file.

Dependencies/blockers: no local engineering blocker remains. Staging and production Netlify/Supabase
targets, provider credentials and recovery ownership, real Turnstile/Resend/scanner behavior, encrypted
production backup scheduling, deployed TLS/HSTS/CSP/logs/rollback, DNS control, approved business
configuration/inventory/media/brand/editorial copy, qualified legal approval, physical devices and
staging/field performance evidence remain blocking or explicit approval gates.

Required M19 checks: launch-gate transfer/reconciliation; authoritative environment/provider/migration/
storage/admin/backup/restore/rollback/DNS/security/operations procedures; local restore proof; clean
database/static/unit/component/integration/E2E/build regression; and honest classification of every
unavailable staging/owner/legal/device/field criterion. All locally executable checks pass; external
criteria retain `BLOCKED`, `OWNER APPROVAL REQUIRED`, `LEGAL APPROVAL REQUIRED` or
`DEPLOYMENT-TIME CHECK` status.

## 5. Completed Implementation

### Foundation

Next.js 16 App Router, React 19, strict TypeScript, Tailwind 4, shadcn configuration, ESLint, Prettier, environment validation, server-only graph enforcement, secret scanning, public/admin route-group shells, error/not-found foundations, Vitest/component/Playwright scaffolds, synthetic builders, a stateful-test production guard, local Supabase structure and GitHub Actions CI are implemented and validated. M19 makes deployment validation fail closed for unsafe origins, incomplete security/provider pairs and Netlify/application-environment mismatches; only explicit `APP_ENV=production` is indexable.

### Database

Seventeen ordered migrations implement 64 application tables and 32 enum types. M17 adds no table or enum: it forces RLS on every application table, resets projection/function ACLs to deny-by-default, hardens migration-role defaults and adds one service-only aggregate storage-budget function. Applied and tested only in disposable local Supabase; never applied to production.

### Server contracts

Separate public/admin/content/CRM/site-visit/owner-submission DTOs, typed Supabase rows, explicit queries, centralized privacy/formatting/SEO helpers, executable state machines and shared Zod schemas are implemented. M17 adds testable security-header and health models, credential-free HTTPS normalization, streamed multipart bounds and a scalar storage-usage contract. Route handlers/actions re-authorize and database functions preserve workflow locks/invariants. Browser, anonymous server, authenticated server, privileged server and test-actor Supabase helpers remain separate; privileged helpers import `server-only`.

### RLS

All 64 application tables have RLS enabled and forced, with the active-admin read policy on all 64. Browser roles have no table mutation grant. Fourteen approved projections are directly readable; the fifteenth public-prefixed search backing view is denied and reachable only through the bounded search RPC. Of 71 functions, only search is anonymous and authenticated sessions additionally receive the non-mutating admin predicate. All mutation/audit/storage functions are service-only; all 58 definer functions use empty search paths and trusted owners.

### Admin Authentication

Supabase email/password login and logout are implemented with cookie refresh in `proxy.ts`. `requireActiveAdmin()` verifies the server session with `auth.getUser()` and matches it to an active database profile. Admin cookies are explicitly HttpOnly, SameSite=Lax and Secure in production. Protected routes are dynamic/no-store and inaccessible to anonymous, non-admin and inactive-admin actors. `/admin/settings/security` shows safe readiness summaries only after fresh authorization.

### Properties

M6 property administration is implemented. A narrow service-role-only database transaction creates or updates Draft properties after every calling Server Action passes `requireActiveAdmin()`. It persists the shared core, generated slug, one category-correct Agricultural/NA/Industrial extension, structured primary offer, separated private/public location, parcel and normalized source identifier, planning context, existing-party relationship and source provenance. The immutable sequence-backed Property ID is never accepted from the client and remains unchanged across edits and category changes.

`/admin/properties`, `/admin/properties/new`, `/admin/properties/[id]` and `/admin/properties/[id]/edit` provide searchable/filterable inventory, draft creation/editing, status/media/verification summaries, controlled availability transitions and safe archive/restore. Draft validation remains intentionally narrower than publication readiness. The property detail now presents the authoritative eight-group readiness report, explicit publication confirmation, audited unpublish reason and an admin-only noindex public-safe preview.

Important writes use `updated_at` optimistic concurrency. Availability, archive and restore are dedicated transactions rather than arbitrary status writes. Draft save, availability, archive and restore audits are actor-attributed and omit private coordinates/notes. Exact coordinates are excluded from ordinary detail data and loaded only by the explicit protected edit route with an `EXACT_LOCATION_ACCESS` audit.

### Media

M7 media is complete. Property images accept real JPEG/PNG/WebP content up to 10 MB, enforce safe dimensions/pixel counts, auto-orient, normalize to WebP and strip EXIF/GPS/device metadata. Original filenames never become object paths. Public text rejects exact coordinates and obvious contact details. Checksums deduplicate within property; 20 staged/30 approved image limits, one active brochure and a 150 MB public hosted-media budget are transactionally guarded.

Five exact buckets are migration-controlled. Images and approved marketing brochures stage in `property-media-private` and move to immutable `property-media-public` objects only through approval. Legal/owner/future verification files register in `private_documents` under `verification-documents-private`; pending/infected/failed files cannot receive trusted access. Browser actors receive no direct Storage mutation/list policy. Authorized clean documents use non-persisted 60–300 second signed URLs after `requireActiveAdmin()`, per-record checks and a path-free `DOCUMENT_ACCESS` audit.

YouTube/Vimeo video, drone video and Matterport 360 use canonical allowlisted HTTPS metadata under ADR-0002, provider-specific sandboxed embeds and reviewed CSP origins; no video/360 binary hosting exists. `/admin/properties/[id]/media` supports upload, metadata, preview, approval, cover, ordering, archive/restore and private evidence. `/admin/media` inventories failed/unused assets and configurable registry storage health. M9 requires one approved public cover image with truthful alt text while staged/private assets remain ineligible and excluded.

### Verification

M8 verification is complete. Twenty-seven configurable definitions cover ten common, six Agricultural, five NA and six Industrial/GIDC checks, with category/transaction applicability and required/conditional policy. Per-property rows preserve applicability separately from review status and support explicit scope, limitation, risk, recheck and disclosure eligibility.

Evidence links carry typed source class and provenance from `RECEIVED` through review/source/professional verification, plus supersession/revocation. Clean private-file handling is necessary but never treated as authenticity. Open exceptions and required professional referrals block completion or disclosure until resolved. Professional reviews preserve type, scope, reviewer attribution, materials, dates and outcome; every material transition appends history and an actor-attributed verification audit.

The protected queue/workspace supports initialization, applicability decisions, source/evidence linking, provenance advancement, exceptions, lawyer/surveyor referrals, status transitions, rechecks and disclosure review. Public output exposes only scoped, limited, current, eligible passed results backed by approved copy. No public copy is approved by seed and no universal verified score/flag exists; M9 uses required internal check state without inventing public verification wording.

### Publication

M9 publication is complete. `property_publication_readiness()` evaluates the current database state and returns structured blockers/warnings across identity, content, category data, location privacy, offer/price, media, claims/verification and public projection. It requires a valid immutable Property ID/slug, public copy/address/area, one category-correct extension, one matching consistent primary offer, a source/party relationship, a public approved cover with alt text and the current scoped identity plus category evidence checks. `PRICE_ON_REQUEST` remains valid without a number. Unsafe legal/approval/guarantee wording is blocked; absent lawyer-approved verification copy produces a warning and no public verification claim.

`publish_property()` locks the row, checks optimistic concurrency, reruns readiness and atomically transitions only Draft/Under Review/Unpublished records to Published with actor/time/audit. `unpublish_property()` requires a specific reason and removes the record from every public projection without deleting it. Availability remains independent: Published records can become Under Negotiation or accurately retain Sold/Rented/Leased. Archive requires prior unpublish and always sets Off Market; restore returns to a private Available Draft.

All public property queries use explicit field lists. Published-only projection views and the M11 typed projection-owned RPC remain the sole anonymous property data sources, and `public_property_indexability` is the authoritative sitemap source. Publish, unpublish, availability, public-media and verification changes revalidate inventory, property, admin preview and sitemap paths. M16 consumes that boundary without duplicating readiness logic; closed published pages retain truthful canonical detail while default discovery excludes them.

### Public Website

M11 extends the completed M10 responsive navy/gold public shell with a compact homepage search entry and a server-rendered discovery workspace. Desktop uses a sticky filter rail; mobile uses an accessible bottom sheet with focus entry, Tab containment, Escape dismissal and body-scroll control. Active chips, honest totals, loading submission copy, zero/failure recovery, sort controls and pagination preserve the visual and semantic card system.

`/properties`, `/search`, three category landings and Buy/Rent/Lease landings now use one bounded search provider and canonical `PropertyCard`. `/properties/[property-slug]` remains the approved detail route and M10 experience. Closed listings retain accurate detail pages but are excluded from default discovery until an explicit availability filter is selected; inaccessible slugs and out-of-range search pages return real 404 responses.

MapLibre is integrated as an opt-in client enhancement using its separately copied worker. It never mounts for hidden locations and receives only approved public coordinates for exact/approximate modes. Video/drone/360 embeds remain consent-gated. M13 adds a compact inquiry to active property detail, structured `/requirements` plus thank-you, short `/contact`, REQUESTED-only `/site-visit` plus thank-you and a safe call/WhatsApp intent redirect. Search zero-state and category/transaction landings pass only editable public taxonomy into requirement prefill. Forms preserve valid input on errors, announce pending/success/error states and remain usable from 320 px through desktop without collision with sticky actions.

### Search

M11 is complete. The stable URL contract is `q`, `propertyId`, `category`, `transaction`, `district`, `taluka`, `place`, `locality`, `minArea`, `maxArea`, `areaUnit`, `minPrice`, `maxPrice`, `pricing`, `availability`, `agriTenure`, `agriIrrigation`, `naStatus`, `naPurpose`, `industrialType`, `industrialPower`, `sort` and `page`. Unknown, invalid, repeated or out-of-order state is normalized with a permanent redirect; `page=1`, the default sort and the default square-foot unit are omitted.

The PostgreSQL function applies AND semantics. Exact `UE-LS-######` input takes the identity path; keyword rank uses only public code/title/descriptions/landmark/address plus public geography names. Numeric INR budget uses interval overlap for `EXACT_TOTAL`/`PRICE_RANGE`, excludes POR/per-unit rows and exposes POR as an explicit class. Strict area converts six standard units and includes only `AUTHORITATIVE` normalized square metres. Default availability is Available plus Under Negotiation; Sold/Rented/Leased are explicit and Off Market is rejected. Recommended, newest, oldest, price ascending/descending and area ascending/descending sorts all end with stable ID ordering. Visitor pages use 12 results; RPC page size is capped at 48 and page at 100.

### CRM

M12 implements a single private brokerage CRM over the approved `parties`, `leads`, `lead_requirements`, `lead_properties` and `lead_activities` model plus structured `lead_follow_ups`. New leads start at `NEW`; server-owned transitions enforce the exact twelve-stage lifecycle and evidence prerequisites for contact attempts, confirmed requirements, active matches, nurture planning and terminal outcomes. Closed states are terminal and clear the open-work pointer.

Admin creation normalizes phone/email and surfaces likely duplicates. When the normalized signals identify exactly one existing party, a confirmed new intent reuses that contact but creates a separate lead; ambiguous signals never select an arbitrary party and no destructive merge exists. Lead notes are append-oriented, actor-attributed activities. Requirements reuse lead-level transaction/category/geography/budget fields and store only requirement-specific area, frontage, road width and notes. Matches remain manual, status-bearing and reversible; no automated recommendation/contact system exists.

The protected inbox is bounded to 100 results and filters by free text, stage, category, transaction, source, district, assignee, created dates and follow-up state. The pipeline, lead workspace, requirement lists and 200-row follow-up queue provide the operational views. M13 submissions appear in these unchanged operational views with `WEBSITE` source, canonical route/property context, requirement/property relation, private activity/consent and next-action context. Unambiguous normalized contact matches reuse the party but every separate demand event remains a distinct `NEW` opportunity; no public submission is auto-qualified or treated as a confirmed match.

### Site Visits

M13 intake still creates exactly one `REQUESTED` visit for an active published property and never auto-confirms it. M14 adds the active-admin operations queue, India-time calendar and visit workspace. The enforced graph is `REQUESTED -> CONTACTED | CANCELLED`, `CONTACTED -> PROPOSED | CANCELLED`, `PROPOSED -> CONFIRMED | RESCHEDULED | CANCELLED`, `CONFIRMED -> COMPLETED | RESCHEDULED | CANCELLED | NO_SHOW`, `RESCHEDULED -> CONFIRMED | RESCHEDULED | CANCELLED`, and `NO_SHOW -> RESCHEDULED | CANCELLED`; `COMPLETED` and `CANCELLED` are terminal.

Contact records a bounded private outcome. Proposal and rescheduling require a valid future India-time slot; confirmation adopts the current future proposal. Completion and no-show require the confirmed start to have passed, while cancellation/rescheduling require reasons. Scheduling transitions recheck active published property availability and surface overlapping property visits as an admin warning. Every visit write locks the row, checks `version`, appends private actor-attributed event history and CRM activity, and writes a generic audit without copying operational free text. CRM stages advance to requested/confirmed/completed and unwind confirmed state truthfully on reschedule, no-show or cancellation. Follow-up is linked M12 CRM work created only after a terminal outcome; no `FOLLOW_UP_REQUIRED` visit state exists.

### Sell Your Land

M15 is complete. `/sell-your-land` is a responsive ten-step owner form for sell/rent/lease intent and Agricultural, NA and Industrial land. It captures normalized contact and relationship, private location preferences/coordinates, original area unit, commercial expectations, category-specific owner claims, optional video/drone/virtual-tour links, photos, brochure/supporting documents and five explicit versioned acknowledgements. Conditional fields and uploads remain selected across validation failures, error summaries are announced/focusable, and the receipt page promises review only—not acceptance, verification or publication.

The same-origin multipart route checks content length before parsing and then enforces typed body bounds, a honeypot, trusted origin, privacy-HMAC rate buckets, 24-hour payload-bound idempotency and exact Turnstile hostname/action when configured. Files are limited to PDF/JPEG/PNG, 10 files and 20 MB combined, validated by signature, scanned before registration and stored only in `owner-submissions-private` with server-generated paths. Post-commit notifications are durable and cannot roll back or duplicate intake.

`/admin/submissions` provides bounded status/category/intent/district/assignee/document/date/text filters. The detail workspace exposes only an explicit admin DTO and supports assignment, exact transition actions, document requests, notes, append-only history, consent review, scan state and authorized short-lived document access. Possible duplicates are warnings based on normalized contact, survey/block, district/category and similar area; records are never automatically merged or deleted.

Conversion is a separate confirmation route available only from `APPROVED`. The transaction locks and version-checks the submission, creates exactly one immutable-ID property in `DRAFT`, preserves source/owner/category/location/commercial provenance, links private documents, initializes applicable verification rows as `NOT_STARTED`, records history/audit and marks the submission `CONVERTED`. Replays return the same conversion; no media is promoted and no public projection or publication transition occurs.

### SEO and Content

M16 completes the production content/crawl architecture. `/locations/ahmedabad` and `/locations/gandhinagar` plus the Agricultural, NA and Industrial child routes use explicit `seo_pages` records, unique useful content, relevant SSR discovery, buyer/owner CTAs, guides and natural internal links. The eight seeded pages are intentionally public `NOINDEX` baselines until an active admin explicitly promotes a quality-approved record; inventory changes never toggle their eligibility. Category and transaction landings now have distinct long-form guidance, metadata and the same stable usefulness threshold.

`/guides`, `/guides/[guide-slug]` and `/guides/category/[category-slug]` expose only published content with safe same-site Markdown links, public dates, category/topic context and approved hero media. The protected guide/location/SEO/settings routes support draft creation, editing, preview, publish/unpublish, SEO fields and explicit indexability. Published guide slug migration is atomic and persists a chain-flattened canonical redirect; missing property, guide and curated-location paths consult redirect history only after normal lookup fails.

Central utilities own canonical URLs, metadata, Open Graph, robots, sitemap eligibility, breadcrumb items and privacy-safe JSON-LD. Filtered/sorted search stays `noindex, follow`; page-one/query ordering remains normalized and out-of-range pages remain true 404s. The bounded sitemap contains only approved static/category/transaction pages, indexable curated content, published indexable properties and published indexable guides. Robots disallow admin, preview and private route families and reference the canonical sitemap. Visible and structured breadcrumbs match. JSON-LD is limited to `Organization`, `WebSite`, `CollectionPage`, `Article`, `RealEstateListing` and `BreadcrumbList`, never private coordinates, owner/CRM/evidence data, fake ratings or unsupported legal claims.

### Security

M17 closes inherited/default ACLs and records the complete actor/resource and hostile-path matrices in `docs/runbooks/m17-security-hardening.md`. Owner PII, CRM state, exact private coordinates, private documents/paths, evidence, reviewer identities and unpublished identifiers remain absent from public HTML, RSC data, metadata, Open Graph, JSON-LD and sitemaps. Public mutations require typed bounded input, exact origin, Fetch Metadata defense, HMAC rate/replay identities and server-side Turnstile outside local/test. Uploads retain signature/dimension/malware/path checks and now have a streamed 21 MiB ceiling. CSP and core headers are centralized; production excludes unsafe evaluation and enables HSTS. Current files, reachable Git history and production client output are secret-scanned.

### Testing

The M18 clean-state local suite passes: 600 pgTAP assertions, the 24-worker Property ID concurrency test, 147 Vitest unit tests, 55 component tests, 52 guarded integration tests and a definitive 56-scenario Chromium E2E run. Lint, Prettier, strict typecheck, 17-client server-boundary scan, 403-file/current-history secret scan after adding the QA report, test-safety guards, dependency audit, client-bundle secret scan, clean database reset/lint and the Next.js 16.3.4 webpack production build also pass. Playwright remains single-worker because milestone mutation suites share one guarded database and synthetic admin actor.

M18 Lighthouse against the local production build reports Performance 92–97, Accessibility 100, Best Practices 100 and SEO 100 on four indexable representative pages; the intentionally `noindex` location baseline scores SEO 69. The three-sample home LCP median is 3.09 s, CLS is 0 and TBT is at most 55 ms across the five-page sample. This is synthetic local evidence, not field evidence; staging/CDN/approved-media measurement and production LCP/INP monitoring remain mandatory.

### Deployment Preparation

Not implemented or configured.

## 6. Repository / Important File Map

```text
app/                                       Next.js App Router
  (public)/                                public shell, discovery, property, intake, guide, location and legal/company routes
  (admin)/admin/                           protected property, verification, media, CRM, visit, owner-intake and content operations
  error.tsx / global-error.tsx / not-found.tsx
components/foundation/                     M1 shell components
components/public/                         canonical public cards, detail/media/location/actions, conversion forms and shell
components/search/                         M11 filter rail/sheet, chips, sort, pagination, entry and results
components/admin/                          protected shell, property/media/verification/lead/visit UI
config/                                    site and environment schemas
features/crm/                              M12 lead/follow-up contracts, validation and pipeline helpers
features/intake/                           M13 public intake contracts, validation, prefill and abuse helpers
features/owner-submissions/                M15 owner intake contracts, validation and duplicate signals
features/site-visits/                      M14 visit contracts, validation, state/time/conflict helpers
features/search/                           normalized M11 query and provider contracts
features/content/                          M16 guide/SEO contracts and validation
lib/seo/                                   canonical, metadata, robots, sitemap, breadcrumb and structured-data policy
lib/                                       shared/test/privacy/SEO/Supabase boundaries
server/                                    server-only env and domain-layer boundaries
  services/crm.ts                          authorized M12 CRM read/write services
  services/public-intake.ts                M13 public-to-private transactional adapter and secondary effects
  services/owner-submissions.ts            M15 private intake, review, document and conversion services
  services/site-visits.ts                  authorized M14 queue/detail and workflow services
  services/content.ts                      authorized M16 guide/SEO editorial services
  queries/public-content.ts                public-safe M16 guide/location/redirect reads
  integrations/                            Turnstile and Resend provider boundaries
  search/                                  PostgreSQL public-search provider
supabase/                                  local config, 17 migrations, repeatable seed and pgTAP suites
tests/                                     complete unit, component, integration and E2E regressions
scripts/                                   secret and server-boundary checks
.github/workflows/ci.yml                   M1 CI gate
package.json / package-lock.json           pinned reproducible toolchain

01-MASTER-WEBSITE-ARCHITECTURE.md ... 14-PRE-LAUNCH-CHECKLIST.md
LANDSPACE_PRODUCT_REQUIREMENTS.md
LAND_DATA_MODEL_REPORT.md
LEGAL_VERIFICATION_REPORT.md
URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md
UrbanEdge_Living_Space_Logo_HD.jpg          approved brand-reference asset
.gitignore                                      secrets/local/build/Supabase exclusions

docs/
  REQUIREMENTS.md                           reconciled product/technical/privacy contract
  DECISIONS.md                              M0 decision register
  PRE-LAUNCH-PLACEHOLDERS.md                required placeholder replacement register
  15-IMPLEMENTATION-STATE-AND-HANDOFF.md   live implementation truth
  architecture/
    IMPLEMENTATION-LEDGER.md               reconciled M0 route/data/state/security map
    SOURCE-MANIFEST.md                     source-handling note
  adr/
    README.md                               ADR policy/template fields
    0001-separate-site-visit-lifecycle-from-follow-up.md
                                            accepted site-visit/CRM decision
    0002-hosted-and-external-media-locators.md
                                            accepted hosted/external media decision
    0003-verification-provenance-and-professional-review.md
                                            accepted scoped verification persistence decision
    0004-m12-crm-status-and-follow-up-reconciliation.md
                                            accepted pipeline/follow-up reconciliation
    0005-m16-seo-redirects-and-guide-hero-media.md
                                            accepted canonical-history and public guide-media decision
  runbooks/
    README.md                               runbook scope and production guardrails
    local-development.md                    isolated local workflow and guarded qualification commands
    m17-security-hardening.md               actor/resource matrix and production-only security gates
    m18-final-qa.md                         final local QA evidence and M19/pre-launch transfer
    m19-deployment-preparation.md           authoritative deployment and launch-gate register
```

There is no `.openai/hosting.json`; no hosting/deployment is configured. The approved Living Space logo reference is present, while the old reference-app source is intentionally unavailable. Git is on `main`. The `.gitignore` excludes secrets, environment files, dependencies, generated output including the copied MapLibre worker, local Supabase runtime and provider state. M0–M18 are complete; M19 local engineering preparation is complete under a conditional hold and production remains unauthorized.

## 7. Database State

| Item | Actual state |
|---|---|
| Migration files | Seventeen ordered migrations through `20260906030000_m17_security_hardening.sql` |
| Tables created | 64 application tables; M16 adds `seo_redirects` |
| Enums created | 32 enum types; M13 extends `lead_activity_type` with property-inquiry and general-contact receipt events |
| Functions/triggers | 71 public functions; 58 definer functions use empty search paths; mutation/audit/storage-budget functions are service-only |
| Views/public projections | 15 explicit `public_%` views; 14 are browser-readable and the search backing view is RPC-only; none contains CRM or owner data |
| Indexes | 181; one benign duplicate-column-order verification helper index is a recommended future query-plan-reviewed cleanup |
| Storage buckets | Five local migration-controlled buckets: two intentional public buckets and three private buckets; no browser object mutation/list policies |
| RLS policies | 95; enabled and forced on all 64 tables, with active-admin reads, service-owned mutations and narrowly scoped projection-owner policies |
| Seed data | Safe repeatable India/Gujarat/Ahmedabad/Gandhinagar reference data, 9 units, 5 non-local standard conversions, 3 guide categories, one baseline published guide and 8 public `NOINDEX` curated SEO records |
| Local database | Running isolated Supabase project `urbanedge-land-space-local` on `55320`–`55327` |
| Development/staging application | Nothing applied |
| Production | Nothing applied; no production operation authorized |

The 64 tables, 15 views, 181 indexes, 7 sequences, 32 enums, 71 functions, 58 definer functions, 57 non-internal triggers, 95 policies, seventeen-migration order, five-bucket boundary, forced RLS grants and M6–M17 service transactions are inspected and validated locally.

## 8. RLS / Security State

Database integrity, server module boundaries, RLS, grants and privacy projections are implemented and tested locally. Browser roles cannot write business tables, execute mutation/audit/storage RPCs, list private objects, upload to controlled buckets or change bucket visibility. Projection and function ACLs are explicit; future migration-role defaults are deny-by-default. Admin actions require `requireActiveAdmin()`, and anonymous/non-admin path guesses fail. Owner/CRM/contact data, internal drafts, private evidence/documents/paths, source details, exact coordinates and EXIF remain outside public and SEO outputs.

## 9. Routes Implemented

### Public routes

| Route | Status | Notes |
|---|---|---|
| `/` | COMPLETE / TESTED | Server-rendered public home with discovery, categories, featured published inventory, trust/process/service/verification/content/CTA sections |
| `/properties` | COMPLETE / TESTED | Canonical SSR search workspace with URL-owned keyword/ID, filters, sorts and numbered pagination |
| `/search` | COMPLETE / TESTED | Noindex fast entry; normalized queries permanently redirect to `/properties` |
| `/agricultural-land` | COMPLETE / TESTED | Agricultural guidance and current published category inventory |
| `/na-land` | COMPLETE / TESTED | NA guidance and current published category inventory |
| `/industrial-land` | COMPLETE / TESTED | Industrial/GIDC guidance and current published category inventory |
| `/buy`, `/rent`, `/lease` | COMPLETE / TESTED | Transaction-specific collections through the shared M11 provider with refinement links |
| `/locations/ahmedabad`, `/locations/gandhinagar` | COMPLETE / TESTED | Curated SSR district content with explicit stable indexability, inventory discovery, guides and owner/buyer CTAs |
| `/locations/[city]/[category]` | COMPLETE / TESTED | Exactly six approved Ahmedabad/Gandhinagar × Agricultural/NA/Industrial combinations; arbitrary combinations are 404 |
| `/guides` | COMPLETE / TESTED | Published-only guide index with category discovery and empty-state behavior |
| `/guides/[guide-slug]` | COMPLETE / TESTED | Published Article content, safe Markdown, approved hero media, dates, breadcrumbs and canonical redirects |
| `/guides/category/[category-slug]` | COMPLETE / TESTED | Published-only topic archive with canonical/noindex policy |
| `/about`, `/terms`, `/privacy`, `/disclaimer` | COMPLETE / TESTED | Version-controlled public company/legal information with intentional metadata and crawl behavior |
| `/robots.txt`, `/sitemap.xml` | COMPLETE / TESTED | Deterministic crawl policy and bounded eligible canonical URL inventory |
| `/properties/[property-slug]` | COMPLETE / TESTED | Approved canonical detail route with safe facts/media/location and compact active-property inquiry |
| `/requirements` | COMPLETE / TESTED | Structured no-account buyer requirement with safe discovery/category/transaction prefill |
| `/requirements/thank-you` | COMPLETE / TESTED | Safe receipt confirmation without internal identifiers or promises |
| `/contact` | COMPLETE / TESTED | Short general-contact conversion into the same private CRM |
| `/site-visit` | COMPLETE / TESTED | Active-property preferred-window intake only; never auto-confirms |
| `/site-visit/thank-you` | COMPLETE / TESTED | Safe REQUESTED-only confirmation with public Property ID where applicable |
| `/sell-your-land` | COMPLETE / TESTED | Ten-step private owner intake for all V1 intents/categories with conditional claims, bounded uploads and five consents |
| `/sell-your-land/submit` | COMPLETE / TESTED | Same-origin server-only multipart handler with pre-parse size gate and abuse/file validation |
| `/sell-your-land/thank-you` | COMPLETE / TESTED | Receipt reference and review-only wording; no acceptance, verification or publication promise |
| `/api/public/intent/[intent]` | COMPLETE / TESTED | Published-property call/WhatsApp redirect with bounded privacy-safe intent analytics |

### Admin routes

| Route | Status | Notes |
|---|---|---|
| `/admin` | REDIRECT / TESTED | Redirects into the protected dashboard boundary |
| `/admin/login` | COMPLETE / TESTED | Generic validation/auth/authorization states; never reveals account existence |
| `/admin/dashboard` | COMPLETE / TESTED | Active-admin-only dynamic route with responsive accessible shell |
| `/admin/properties` | COMPLETE / TESTED | Protected searchable/filterable inventory with operational summaries |
| `/admin/properties/new` | COMPLETE / TESTED | Three-category draft creation and retained validation state |
| `/admin/properties/[id]` | COMPLETE / TESTED | Protected detail, eight-group authoritative publication readiness and controlled publish/unpublish/availability/archive actions |
| `/admin/properties/[id]/edit` | COMPLETE / TESTED | Shared/category-specific edit with optimistic concurrency and audited exact-location access |
| `/admin/properties/[id]/preview` | COMPLETE / TESTED | Active-admin-only, noindex preview composed exclusively from public-safe fields |
| `/admin/properties/[id]/media` | COMPLETE / TESTED | Protected staging, media metadata/order/cover/approval/archive and private-document workflow |
| `/admin/properties/[id]/verification` | COMPLETE / TESTED | Protected alias into the property verification workspace |
| `/admin/verification` | COMPLETE / TESTED | Protected verification overview and queue entry point |
| `/admin/verification/queue` | COMPLETE / TESTED | Protected risk/review/recheck work queue |
| `/admin/verification/[propertyId]` | COMPLETE / TESTED | Protected scoped-check, evidence, exception, referral, history and disclosure workflow |
| `/admin/media` | COMPLETE / TESTED | Protected global registry, failed/unused candidates and configured storage-budget status |
| `/admin/leads` | COMPLETE / TESTED | Protected bounded lead/contact search with stage, demand, geography, source, assignee, date and follow-up filters |
| `/admin/leads/new` | COMPLETE / TESTED | Admin lead creation with normalized duplicate detection and explicit new-opportunity confirmation |
| `/admin/leads/pipeline` | COMPLETE / TESTED | Exact twelve-lane operational pipeline |
| `/admin/leads/[id]` | COMPLETE / TESTED | Contact/demand edit, requirement, matching, activity/note, follow-up/history and controlled transition workspace |
| `/admin/requirements` | COMPLETE / TESTED | Protected buyer demand book |
| `/admin/requirements/unmatched` | COMPLETE / TESTED | Protected zero-match requirement queue |
| `/admin/requirements/[id]` | COMPLETE / TESTED | Canonical redirect into the owning lead workspace |
| `/admin/follow-ups` | COMPLETE / TESTED | India-time overdue/today/upcoming/completed operational queue |
| `/admin/site-visits` | COMPLETE / TESTED | Bounded protected queue with text, status, India-time bucket, assignee and follow-up filters |
| `/admin/site-visits/calendar` | COMPLETE / TESTED | Protected India-time operational calendar grouped by day; no external booking provider |
| `/admin/site-visits/[id]` | COMPLETE / TESTED | Contact/propose/confirm/reschedule/outcome controls, conflict warning, versioning, history, notes and separate CRM follow-up |
| `/admin/submissions` | COMPLETE / TESTED | Protected bounded owner queue with status/category/intent/geography/assignee/document/date/search filters |
| `/admin/submissions/[id]` | COMPLETE / TESTED | Assignment, transitions, notes, consents, claims, duplicate warnings, documents and append-only history |
| `/admin/submissions/[id]/convert` | COMPLETE / TESTED | Explicit approved-only confirmation producing one private Draft property |
| `/admin/submissions/[id]/documents/[documentId]` | COMPLETE / TESTED | Active-admin late-bound short-lived owner-document redirect with generic denial |
| `/admin/guides`, `/admin/guides/new`, `/admin/guides/[id]`, `/admin/guides/[id]/edit`, `/admin/guides/[id]/preview` | COMPLETE / TESTED | Protected draft/edit/preview/publish/unpublish workflow with SEO fields, safe body and approved hero media |
| `/admin/locations`, `/admin/locations/[id]`, `/admin/locations/[id]/edit` | COMPLETE / TESTED | Protected curated location review and editing |
| `/admin/seo`, `/admin/settings/seo` | COMPLETE / TESTED | Protected SEO-page/indexability review and centralized crawl configuration summary |
| `/api/admin/private-documents/[id]/download` | COMPLETE / TESTED | Active-admin-only late-bound temporary signed redirect; generic denial and no-store response |
| Other canonical admin routes | NOT_STARTED | Implemented only in their domain milestones |

The planned route inventory and route-specific data/authorization sources are in the implementation ledger.

## 10. Business State Machines

Pure executable state machines implement property publication, property availability, lead, owner-submission, site-visit, verification and guide/content transitions. The M12 lead machine uses `NEW`, `CONTACT_ATTEMPTED`, `QUALIFIED`, `REQUIREMENT_CONFIRMED`, `PROPERTY_MATCHED`, `SITE_VISIT_REQUESTED`, `SITE_VISIT_CONFIRMED`, `SITE_VISIT_COMPLETED`, `NEGOTIATION`, `NURTURE`, `CLOSED_WON` and `CLOSED_LOST`; database transitions enforce the same allow-list and evidence checks. Unit/database tests cover allowed and denied transitions, while services own authorization, locking, transactional side effects and audit.

ADR-0001 remains enforced in code: `REQUESTED`, `CONTACTED`, `PROPOSED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`, `RESCHEDULED` are the visit states; `FOLLOW_UP_REQUIRED` is absent. `COMPLETED` and `CANCELLED` are terminal; `NO_SHOW` can be explicitly rescheduled or cancelled. CRM follow-up stays in `lead_follow_ups` with `leads.next_follow_up_at` as its open-work pointer.

## 11. External Providers / Infrastructure

| Provider/capability | State | Notes |
|---|---|---|
| Supabase | LOCAL_ONLY | Isolated local project runs on `55320`–`55327`; a new dedicated remote project is still required and must never share Living Space |
| Netlify | NOT_CONFIGURED | Free tier is architecture target; no site created |
| Email / Resend | ADAPTER_COMPLETE / NOT_CONFIGURED | Post-commit adapter and delivery outcomes implemented; no key/domain/sending enabled, so local delivery records become `SKIPPED` |
| Maps / OpenFreeMap + MapLibre | CLIENT_READY / PROVIDER_NOT_CONFIGURED | Consent-free lazy MapLibre client and worker are integrated; no map mounts without an approved style/provider, and hidden listings never receive a point |
| Analytics / Cloudflare Web Analytics | PRIVATE_EVENT_SINK_COMPLETE / EXTERNAL_NOT_CONFIGURED | Privacy-safe conversion and intent events persist locally; no external identifier/configuration |
| Cloudflare Turnstile | ADAPTER_COMPLETE / NOT_CONFIGURED | Exact server-side hostname/action verification is ready; disabled only for local/test and fail-closed elsewhere |
| Domain / Cloudflare DNS | NOT_CONFIGURED | No DNS changes performed |
| Google Search Console | NOT_CONFIGURED | No property configured |
| Malware scanning | LOCAL_TEST_ADAPTER_ONLY | EICAR denial and remote scanner adapter exist; preview/production remains `PENDING` and inaccessible until an approved endpoint is configured |
| PostgreSQL search | LOCAL_COMPLETE | Native generated `tsvector`, partial indexes, typed RPC and server provider are complete; no external search provider is used |

Provider terms, limits and pricing must be revalidated before activation because the architecture snapshot is dated 31 August 2026. No paid service, billing or auto-recharge has been activated.

## 12. Environment Variables

No environment file or values currently exist. Required names only:

| Variable | Local | Preview/Staging | Production | Visibility |
|---|---:|---:|---:|---|
| `APP_ENV` | Yes | Yes | Yes | Server/runtime identity |
| `NEXT_PUBLIC_SITE_URL` | Yes | Yes | Yes | Public |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Yes | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Yes | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Yes | Yes | Server secret |
| `RESEND_API_KEY` | Optional/local stub | Yes | Yes | Server secret |
| `EMAIL_FROM` | Optional/local stub | Yes | Yes | Server configuration |
| `EMAIL_REPLY_TO` | Optional/local stub | Yes | Yes | Server configuration |
| `ADMIN_NOTIFICATION_EMAIL` | Optional/local stub | Yes | Yes | Server configuration |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional/test key | Yes | Yes | Public |
| `TURNSTILE_SECRET_KEY` | Optional/test key | Yes | Yes | Server secret |
| `NEXT_PUBLIC_MAP_STYLE_URL` | Yes | Yes | Yes | Public |
| `NEXT_PUBLIC_MAP_PROVIDER` | Yes | Yes | Yes | Public |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Yes | Yes | Yes | Public |
| `HMAC_SECRET` | If selected | If selected | If selected | Server secret |
| `WEBHOOK_SIGNING_SECRET` | If selected | If selected | If selected | Server secret |
| `STORAGE_*_BUCKET` (five names) | Defaults available | Required | Required | Server configuration; exact bucket responsibilities |
| `STORAGE_SIGNED_URL_TTL_SECONDS` | Default `120` | 60–300 | 60–300 | Server configuration |
| `MEDIA_STORAGE_BUDGET_BYTES` | Default local budget | Required | Required | Server configuration |
| `MEDIA_STORAGE_WARNING_PERCENT` | Default `70` | Required | Required | Server configuration |
| `MEDIA_STORAGE_HARD_STOP_PERCENT` | Default `90` | Required | Required | Server configuration |
| `MALWARE_SCAN_ENDPOINT` / `MALWARE_SCAN_TOKEN` | Optional deterministic test adapter | Required before trusted remote uploads | Required before trusted uploads | Server configuration / secret |
| `TEST_SUPABASE_PROJECT_REF` | Test only | Test only | No | Test safety identity |
| `PRODUCTION_SUPABASE_PROJECT_REF` | Block-list reference | CI-protected block-list reference | No test use | Safety comparison only |
| `TEST_TARGET_URL` | Test only | Test only | No | Test safety target |
| `PRODUCTION_SITE_URL` | Block-list reference | CI-protected block-list reference | Public canonical value | Safety comparison only |
| `TEST_SAFETY_TOKEN` | Test-only non-secret guard | Test-only non-secret guard | No | Explicit stateful-test acknowledgement |

The environment schema and `.env.example` contain names only. Never store actual secret values in this document.

## 13. Tests Actually Run

| Test / Command | Result | Date | Notes |
|---|---|---|---|
| `find docs -maxdepth 3 -type f -print` | PASS | 2026-09-03 | Confirmed four initial M0 documentation files before this handoff file was added |
| `wc -l docs/architecture/IMPLEMENTATION-LEDGER.md` | PASS | 2026-09-03 | Ledger exists with 638 lines at the time checked |
| Required handoff section check (`1..20`) | PASS | 2026-09-03 | All 20 required numbered sections are present |
| Milestone inventory check (`M0..M19`) | PASS | 2026-09-03 | All roadmap milestones are represented in the progress table |
| Ledger source-reference check | PASS | 2026-09-03 | Every supplied architecture/research filename is referenced |
| Ledger/handoff M0 consistency scan | PASS | 2026-09-03 | Owner-approved source limitation is recorded; master/design/logo inputs are resolved; former site-visit conflict remains consistently resolved |
| Embedded master-prompt location and sequential full read | PASS | 2026-09-03 | Read `/Users/vedpatel/Desktop/merged (1).md` lines 56904–62392 in full; treated as highest-priority source |
| Master-to-final-architecture reconciliation | PASS | 2026-09-03 | High-level/example differences are documented in `docs/REQUIREMENTS.md`, `docs/DECISIONS.md` and the ledger; no unresolved architecture contradiction found |
| Living Space source limitation resolution | PASS | 2026-09-03 | Owner designated the design report authoritative and confirmed the repository will not be provided or block M0 |
| Approved logo inspection | PASS | 2026-09-03 | 4267×4267 RGB JPEG visually inspected; SHA-256 recorded in source manifest |
| ADR-0001 source/decision review | PASS | 2026-09-03 | Owner resolution mapped to documents `03`, `04`, `05`, `11` and `12`; no schema addition introduced |
| ADR-0001 master compatibility review | PASS | 2026-09-03 | Master contains no `FOLLOW_UP_REQUIRED` visit state; detailed scheduling refinement remains compatible |
| ADR-0001 structural/negative validation | PASS | 2026-09-03 | Required decision sections exist; no instruction adds `FOLLOW_UP_REQUIRED` to the visit enum |
| Git repository initialization | PASS | 2026-09-03 | Initialized `main`; baseline commit `a9d6fba6f0d3312c6ee848327f3d7122e90fd430` created from the reviewed documentation-only staged set |
| Baseline tracked-file safety scan | PASS | 2026-09-03 | No tracked `.env`, dependency/build, local Supabase/provider state or credential-shaped token was detected |
| `.gitignore` policy review | PASS | 2026-09-03 | Excludes `.env`/secrets, dependencies, generated builds/tests, local Supabase/provider state, logs and editor/OS artifacts; preserves example env files and migration source |
| `npm ci` | PASS | 2026-09-03 | Lockfile-clean install completed; 479 packages audited with zero reported vulnerabilities |
| `npm run lint` | PASS | 2026-09-03 | ESLint completed with zero warnings/errors |
| `npm run format:check` | PASS | 2026-09-03 | All non-authoritative-source implementation files match Prettier |
| `npm run typecheck` | PASS | 2026-09-03 | Strict TypeScript completed with no errors |
| `npm test` | PASS | 2026-09-03 | 3 files / 9 baseline unit and component tests passed |
| Guarded integration smoke | PASS | 2026-09-03 | Safe synthetic target accepted; 1 integration foundation test passed |
| Production-shaped integration target | PASS (REFUSED AS REQUIRED) | 2026-09-03 | Guard exited non-zero at `APP_ENV=production` before stateful tests ran |
| `npm run check:server-boundaries` | PASS | 2026-09-03 | Dependency graph checked 2 client entries; no server-only path reachable |
| `npm run check:secrets` | PASS | 2026-09-03 | 89 tracked/candidate files scanned; no credential-shaped value detected |
| `npm run test:e2e -- --list` | PASS | 2026-09-03 | Two Chromium/axe foundation tests discovered; browser execution deferred |
| M3 clean database rebuild | PASS | 2026-09-03 | All four migrations and repeatable safe seed applied from zero twice during M3 validation |
| `npm run build` | PASS | 2026-09-03 | Next.js 16 webpack production build compiled `/`, `/_not-found` and `/admin` as static routes |
| `supabase db reset` (twice) | PASS | 2026-09-03 | Recreated from zero, applied all migrations and repeated safe seed without error |
| Database metadata inventory | PASS | 2026-09-03 | Exactly 49 public application tables and 24 public enums |
| `supabase test db` | PASS | 2026-09-03 | 61 total pgTAP checks: 38 M2 integrity checks plus 23 M3 view-shape, publication, privacy-marker and closed-grant assertions |
| Property-code concurrency | PASS | 2026-09-03 | 24 parallel inserts produced 24 distinct canonical `UE-LS-######` codes and fixtures were removed |
| `supabase db lint --level warning` | PASS | 2026-09-03 | No schema/function errors found |
| M3 unit suite | PASS | 2026-09-03 | 6 files / 22 tests cover location privacy, DTO serialization, pricing, area conversion, state transitions, validation and safety |
| M3 server-boundary check | PASS | 2026-09-03 | 3 client entry graphs checked; privileged/authenticated/test server modules are unreachable |
| M3 production build | PASS | 2026-09-03 | Next.js webpack build remains clean with the typed Supabase boundary installed |
| M4 clean database rebuild | PASS | 2026-09-03 | Fifth migration applies all grants, functions, view ownership and RLS policies from zero |
| M4 actor matrix | PASS | 2026-09-03 | 40 checks cover all-table RLS, anon, non-admin, inactive admin, active admin, service role, guessed IDs, public projection and audit boundaries |
| Aggregate database suite | PASS | 2026-09-03 | 3 files / 101 pgTAP checks pass after M4 |
| M4 application QA | PASS | 2026-09-03 | Lint, format, strict typecheck, boundary/secret checks, 22 unit tests, component test and production build pass |
| M5 unit/component suite | PASS | 2026-09-03 | 27 unit and 2 component tests cover authorization decisions, responsive shell/session controls and prior contracts |
| Guarded local Auth E2E | PASS | 2026-09-03 | 7 Chromium scenarios cover active login/dashboard/logout, anonymous, non-admin, inactive admin, invalid credentials, session clearing, public-shell isolation, mobile shell and axe accessibility |
| M5 production build | PASS | 2026-09-03 | `/admin/login` and no-store `/admin/dashboard` compile with the session-refresh proxy; secret/boundary scan remains green |
| M6 clean database rebuild | PASS | 2026-09-03 | All six migrations and repeatable safe seed apply from zero in isolated local Supabase |
| M6 database/RLS suite | PASS | 2026-09-03 | 4 files / 136 pgTAP assertions cover prior schema/projections/RLS plus category drafts, related persistence, audit privacy, stale writes, controlled status and public exclusion |
| M6 guarded integration suite | PASS | 2026-09-03 | 2 files / 6 tests create Agricultural, NA and Industrial drafts through the application adapter and verify edit/conflict/audit behavior |
| M6 unit/component suite | PASS | 2026-09-03 | 36 unit and 3 component tests cover prior contracts plus draft/category/offer/slug/publication-blocker validation and the stable admin form sections |
| Complete guarded local E2E | PASS | 2026-09-03 | 13 Chromium scenarios cover all prior auth/accessibility behavior plus three category drafts, edit, retained validation input, blocked publication and anonymous denial |
| M6 production build | PASS | 2026-09-03 | Next.js 16 webpack build compiles all four dynamic property-admin routes; strict typecheck succeeds |
| M7 clean database rebuild | PASS | 2026-09-03 | All seven migrations and repeatable seed apply from zero; only harmless already-granted view notices occur |
| M7 database/RLS suite | PASS | 2026-09-03 | 5 files / 187 pgTAP assertions cover prior contracts plus five buckets, locator invariants, actor grants, cover/order/archive, private docs, audits, limits and public exclusion |
| M7 database lint | PASS | 2026-09-03 | `supabase db lint --level warning` reports no schema errors or warnings |
| M7 guarded integration suite | PASS | 2026-09-03 | 3 files / 12 tests cover real Storage upload/promotion, public delivery, external dedupe, private actor/path/bucket denial, signed path-swap/expiry and audit privacy |
| M7 unit/component suite | PASS | 2026-09-03 | 10 files / 46 unit tests and 5 files / 7 component tests cover real-content validation, EXIF stripping, PII/location rejection, provider normalization/safe embeds, DTO isolation and admin states |
| Complete guarded local E2E | PASS | 2026-09-03 | 15 Chromium scenarios cover all prior auth/property behavior plus M7 staged/public media, EXIF upload, private evidence/access, anonymous denial and continued draft status |
| M7 application QA/build | PASS | 2026-09-03 | Lint, Prettier, strict typecheck, five-client boundary scan, 177-file secret scan and Next.js 16 webpack production build all pass; M7 routes compile dynamically |
| Property-code concurrency regression | PASS | 2026-09-03 | 24 parallel inserts still produce 24 distinct immutable canonical Property IDs after M7 |
| M8 clean database rebuild | PASS | 2026-09-04 | All eight migrations and repeatable seed apply from zero in isolated local Supabase |
| M8 database/RLS suite | PASS | 2026-09-04 | 6 files / 238 pgTAP assertions cover prior contracts plus typed verification workflow, transitions, evidence, referrals, exceptions, history, public projection and actor denial |
| M8 database lint | PASS | 2026-09-04 | `supabase db lint --level warning` reports no schema errors or warnings |
| M8 guarded integration suite | PASS | 2026-09-04 | 4 files / 16 tests cover real service initialization, evidence/provenance, invalid transitions, review gates, disclosure and prior storage/property behavior |
| M8 unit/component suite | PASS | 2026-09-04 | 11 files / 62 unit tests and 6 files / 9 component tests cover selection policy, evidence eligibility, safe copy, DTO isolation and protected workspace states |
| Complete guarded local E2E | PASS | 2026-09-04 | 17 Chromium scenarios cover all prior workflows plus M8 initialization, scoped evidence/review flow, invalid transition, anonymous/non-admin denial and continued draft status |
| M8 application QA/build | PASS | 2026-09-04 | Lint, Prettier, strict typecheck, six-client boundary scan, secret scan and Next.js 16 webpack production build pass; all verification routes compile dynamically |
| Property-code concurrency regression | PASS | 2026-09-04 | 24 parallel inserts still produce 24 distinct immutable canonical Property IDs after M8 |
| M9 clean database rebuild | PASS | 2026-09-04 | All nine migrations and repeatable seed apply from zero in isolated local Supabase |
| M9 database/RLS suite | PASS | 2026-09-04 | 7 files / 277 pgTAP assertions cover prior contracts plus readiness, atomic publish/unpublish, availability independence, archive safety, public/indexability projection and browser-role denial |
| M9 database lint | PASS | 2026-09-04 | `supabase db lint --level warning` reports no schema errors or warnings |
| M9 guarded integration suite | PASS | 2026-09-04 | 5 files / 22 tests cover blocked readiness, media/check completion, atomic publish, hidden-location projection, Sold status, unpublish removal and evidence regression plus all prior service flows |
| M9 unit/component suite | PASS | 2026-09-04 | 12 files / 73 unit tests and 7 files / 14 component tests cover pricing/category/location/claim policy, structured readiness groups, blocker/warning states, confirmation, unpublish and accessible retained errors |
| Complete guarded local E2E | PASS | 2026-09-04 | 18 Chromium scenarios cover all prior workflows plus admin preview, incomplete denial, full M9 publish/availability/unpublish lifecycle, public privacy and anonymous/non-admin publication denial |
| M9 application QA/build | PASS | 2026-09-04 | Lint, Prettier, strict typecheck, seven-client boundary scan, 203-file secret scan and Next.js 16 webpack production build pass; preview compiles dynamically |
| Property-code concurrency regression | PASS | 2026-09-04 | 24 parallel inserts still produce 24 distinct immutable canonical Property IDs after M9 |
| M10 clean database rebuild | PASS | 2026-09-05 | All ten migrations and repeatable seed apply from zero in isolated local Supabase |
| M10 database/RLS suite | PASS | 2026-09-05 | 8 files / 294 pgTAP assertions cover prior contracts plus detail/parcel projection shape, published eligibility, category context and location/privacy canaries |
| M10 database lint | PASS | 2026-09-05 | `supabase db lint` reports no schema errors |
| M10 guarded integration suite | PASS | 2026-09-05 | 5 files / 23 tests cover published-to-public DTO behavior, draft exclusion and exact/approximate/hidden location transitions plus all prior services |
| M10 unit/component suite | PASS | 2026-09-05 | 13 files / 80 unit tests and 8 files / 20 component tests cover public projection/formatting, canonical cards, gallery, category facts, status, map/media/actions and empty states |
| Complete guarded local E2E | PASS | 2026-09-05 | 23 Chromium scenarios cover the full M0–M10 suite; M10 exercises SSR HTML, categories, detail/media/price/area, privacy modes, closed/404 states, eight target widths, keyboard behavior and axe checks |
| M10 application QA/build | PASS | 2026-09-05 | Lint, Prettier, strict typecheck, 13-client boundary scan, 242-file secret scan, unit/component suites and Next.js 16 webpack production build pass |
| Property-code concurrency regression | PASS | 2026-09-05 | 24 parallel inserts still produce 24 distinct immutable canonical Property IDs after M10 |
| M10 Lighthouse production snapshot | PASS WITH FOLLOW-UP | 2026-09-05 | Mobile homepage: Performance 95, Accessibility 100, Best Practices 100, SEO 100; FCP 1.22 s, LCP 2.92 s, CLS 0, TBT 28 ms. Remeasure the 2.5 s LCP field target on staging/real traffic |
| M11 clean database rebuild | PASS | 2026-09-05 | All eleven migrations and repeatable seed apply from zero in isolated local Supabase |
| M11 database/RLS suite | PASS | 2026-09-05 | 9 files / 334 pgTAP assertions cover every prior contract plus search projection ownership/privileges, publication exclusion, exact ID, keyword, AND/category filters, POR, budget/area, availability, every supported sort, hierarchy/token/applicability validation and bounds |
| M11 database lint | PASS | 2026-09-05 | `supabase db lint --level warning` reports no schema/function errors or warnings |
| M11 query-plan evidence | PASS | 2026-09-05 | Selective public keyword uses `properties_public_search_document_idx`; strict area uses `properties_public_authoritative_area_idx` (0.014 ms on the rolled-back 2,000-row sample); default discovery and primary offer checks use their dedicated indexes |
| M11 guarded integration suite | PASS | 2026-09-05 | 6 files / 26 tests include real anonymous-provider exact identity, fixed category reuse and bounded geography/category facets plus every prior service integration |
| M11 unit/component suites | PASS | 2026-09-05 | 14 files / 98 unit tests and 9 files / 25 component tests cover parser normalization/bounds/conversions/every sort, cards, zero states, chips, mobile dialog and pagination plus all prior behavior |
| Complete guarded local E2E | PASS | 2026-09-05 | 30 Chromium scenarios cover M0–M11; M11 adds home/fast search, exact/unpublished ID, combined filters, URL reload/history/share/clear-all, facets/chips/sorts, 12-item pagination, zero/unpublished states, canonical/noindex, true 404, mobile focus/overflow and axe |
| M11 application QA/build | PASS | 2026-09-05 | Clean reset, database lint/tests, concurrency, lint, Prettier, strict typecheck, boundary/secret scans, unit/component/integration/E2E suites and Next.js 16 webpack production build pass |
| M12 clean database rebuild | PASS | 2026-09-05 | All twelve migrations and repeatable seed apply from zero in isolated local Supabase |
| M12 database/RLS suite | PASS | 2026-09-05 | 10 files / 372 pgTAP assertions cover prior contracts plus exact pipeline inventory, atomic creation and attributed intake notes, contact reuse with separate opportunities, transition prerequisites, won-property and structured-loss closure rules, requirement/match/follow-up integrity, audit privacy, public denial and browser-role RPC denial |
| M12 guarded integration suite | PASS | 2026-09-05 | 7 files / 30 tests cover atomic lead creation, duplicate detection/contact reuse, requirement persistence, invalid rollback, manual matching, follow-up history and privacy-safe audits plus all prior services |
| M12 unit/component suites | PASS | 2026-09-05 | 15 files / 102 unit tests and 10 files / 31 component tests cover exact transition rules, validation, normalization, India-time queue buckets, lead form/list/empty states, twelve pipeline lanes, requirement list, complete lead workspace and follow-up controls plus all prior behavior |
| Complete guarded local E2E | PASS | 2026-09-05 | All 32 Chromium scenarios pass. The final parallel run completed 31 scenarios and exposed one M9 publication timeout under load; that unchanged scenario passed its immediate single-worker rerun in 10.4 s. M12 adds protected lead create/edit, invalid-transition exclusion, qualification/requirement, match/remove/relink, all follow-up buckets/completion, notes/activity, closed-won/lost, search/filter, mobile/keyboard/axe checks and anonymous/non-admin/inactive denial |
| M12 application QA/build | PASS | 2026-09-05 | Lint, Prettier, strict typecheck, boundary/secret scans, unit/component/integration/E2E suites and Next.js 16 webpack production build pass with all CRM routes dynamic |
| M13 clean database rebuild/lint | PASS | 2026-09-05 | All thirteen migrations plus repeatable seed rebuild from zero; `supabase db lint --level warning` reports no errors or warnings |
| M13 database/RLS suite | PASS | 2026-09-05 | 11 files / 433 pgTAP assertions cover all prior contracts plus atomic intake, published-property eligibility, source/consent integrity, returning-party/new-lead behavior, replay retention, rate limiting, notification durability, RLS/RPC denial and PII exclusion |
| M13 guarded integration suite | PASS | 2026-09-05 | 8 files / 36 tests cover property inquiry, replay, structured requirement, REQUESTED-only visit, post-commit secondary failure and live rate limiting plus every prior service |
| M13 unit/component suites | PASS | 2026-09-05 | 16 files / 116 unit tests and 11 files / 38 component tests cover normalization, validation, safe prefill, HMAC/origin/body bounds, Turnstile, notification behavior and all four forms including pending/error/focus/preserved-input/success states |
| Complete guarded local E2E | PASS | 2026-09-05 | All 37 Chromium scenarios pass in the definitive serial run. M13 adds published inquiry/admin/property attribution, distinct returning opportunity, zero-result structured requirement, REQUESTED-only visit, malformed/honeypot/unpublished/replay/rate defenses, intent redirects, safe output, six widths, keyboard and axe coverage |
| M13 application QA/build | PASS | 2026-09-05 | Lint, Prettier, strict typecheck, 16-client boundary scan, 302-file secret scan, unit/component/integration/E2E suites and Next.js 16.3.4 webpack production build pass |
| M14 clean database rebuild/lint | PASS | 2026-09-05 | All fourteen migrations plus repeatable seed rebuild from zero; `supabase db lint --level warning` reports no errors or warnings |
| M14 database/RLS suite | PASS | 2026-09-05 | 12 files / 479 pgTAP assertions cover all prior contracts plus visit schema, exact transitions, time/property gates, stale versions, CRM synchronization, append-only history/audit privacy, follow-up separation and browser-role denial |
| M14 guarded integration suite | PASS | 2026-09-05 | 9 files / 40 tests cover real admin authorization, contact/propose/confirm/reschedule/outcome workflows, conflicts, version rejection, CRM side effects and follow-up linkage plus every prior service |
| M14 unit/component suites | PASS | 2026-09-05 | 17 files / 122 unit tests and 12 files / 42 component tests cover state availability, India-time conversion/buckets, conflicts, queue/workspace rendering and accessible operation controls plus all prior behavior |
| Complete guarded local E2E | PASS | 2026-09-05 | All 40 Chromium scenarios pass in the definitive serial M0–M14 run; M14 adds end-to-end confirmed/completed/follow-up, reschedule/no-show/cancel, filters/calendar/conflict, responsive/keyboard/axe and anonymous/non-admin denial coverage |
| M14 application QA/build | PASS | 2026-09-05 | Lint, Prettier, strict typecheck, 16-client boundary scan, 318-file secret scan, unit/component/integration/E2E suites and Next.js 16.3.4 webpack production build pass with all visit routes dynamic |
| Property-code concurrency regression | PASS | 2026-09-05 | 24 parallel inserts still produce 24 distinct immutable Property IDs after M14 |
| M15 clean database rebuild/lint | PASS | 2026-09-06 | All fifteen migrations plus repeatable seed rebuild from zero; `supabase db lint --level warning` reports no schema errors or warnings |
| M15 database/RLS suite | PASS | 2026-09-06 | 13 files / 523 pgTAP assertions cover prior contracts plus private owner schema, consent/event integrity, exact transitions, assignment/version gates, append-only history, Draft conversion, audit/provenance and browser-role denial |
| M15 guarded integration suite | PASS | 2026-09-06 | 10 files / 45 tests cover real private submission, replay, documents, workflow authorization, duplicate warnings and one-time Draft conversion plus every prior service |
| M15 unit/component suites | PASS | 2026-09-06 | 18 files / 129 unit tests and 14 files / 49 component tests cover validation, claims, abuse/file limits, transitions, duplicates, queue/detail/conversion rendering, preserved errors and all prior behavior |
| Complete guarded local E2E | PASS | 2026-09-06 | All 43 Chromium scenarios pass in the definitive clean serial M0–M15 run; M15 adds Agricultural/Industrial variants, mobile keyboard/overflow and full NA upload, protected review and Draft conversion with anonymous denial |
| M15 application QA/build | PASS | 2026-09-06 | Lint, Prettier, strict typecheck, 17-client boundary scan, 339-file secret scan, unit/component/integration/E2E suites and Next.js 16.3.4 webpack production build pass with all owner routes dynamic |
| Property-code concurrency regression | PASS | 2026-09-06 | 24 parallel inserts still produce 24 distinct immutable Property IDs after M15 |
| M16 clean database rebuild/lint | PASS | 2026-09-06 | All sixteen migrations plus repeatable seed rebuild from zero; the M16 migration and seed also passed repeated clean resets |
| M16 database/RLS suite | PASS | 2026-09-06 | 14 files / 567 pgTAP assertions cover prior contracts plus redirect integrity/flattening, guide slug/media constraints, content eligibility/projections, active-admin reads and browser-role mutation denial |
| M16 guarded integration suite | PASS | 2026-09-06 | 11 files / 49 tests cover approved SEO content, filtered-search noindex, guide draft/public behavior, sitemap eligibility, canonical redirects and every prior service integration |
| M16 unit/component suites | PASS | 2026-09-06 | 19 files / 139 unit tests and 15 files / 55 component tests cover metadata, canonicals, robots, sitemap, routes, breadcrumbs, structured data, slug behavior, closed properties, location/guide/breadcrumb/content/empty states and prior behavior |
| Complete guarded local E2E | PASS | 2026-09-06 | All 51 Chromium scenarios pass in the definitive clean serialized M0–M16 run; M16 adds eight scenarios spanning both districts, six combinations, quality/indexability, privacy-safe property metadata/JSON-LD, sitemap, guide/admin exclusion, breadcrumb parity, mobile overflow and axe |
| M16 application QA/build | PASS | 2026-09-06 | Lint, Prettier, strict typecheck, 17-client boundary scan, 389-file secret scan, all test layers and Next.js 16.3.4 webpack production build pass; primary SEO content is server-rendered and crawl payloads are bounded |
| Property-code concurrency regression | PASS | 2026-09-06 | 24 parallel inserts still produce 24 distinct immutable Property IDs after M16 |
| M17 clean database rebuild/lint | PASS | 2026-09-06 | All seventeen migrations plus repeatable seed rebuild from zero; `supabase db lint --level warning` reports no schema errors |
| M17 database/RLS suite | PASS | 2026-09-06 | 15 files / 600 pgTAP assertions cover every prior contract plus all-table forced RLS, current/future ACL denial, function allowlists, definer safety, projection ownership/privacy and exact storage policy |
| M17 guarded integration suite | PASS | 2026-09-06 | 12 files / 52 tests cover live anonymous/non-admin base-table, backing-view, service-RPC, projection-mutation and private/public Storage denial plus every prior service |
| M17 unit/component suites | PASS | 2026-09-06 | 22 files / 147 unit tests and 15 files / 55 component tests cover CSP/header modes, origin/Fetch Metadata, HTTPS destinations, owner media URLs, safe health classification and all prior behavior |
| Complete guarded local E2E | PASS | 2026-09-06 | All 56 Chromium scenarios pass; M17 adds deployed-header, protected-ID/path guess, cookie, health-page, hostile-origin, wrong/oversized multipart, search injection and malicious-redirect coverage to every M0–M16 regression |
| M17 application QA/build | PASS | 2026-09-06 | Lint, Prettier, strict typecheck, 17-client boundary scan, 402-file/current-history secret scan, unit/component suites and Next.js 16.3.4 webpack production build pass; client output also passes its postbuild secret scan |
| Dependency/security advisory audit | PASS | 2026-09-06 | Production-only and complete dependency trees report 0 vulnerabilities at high audit level; available updates are non-blocking minor versions |
| Property-code concurrency regression | PASS | 2026-09-06 | 24 parallel inserts still produce 24 distinct immutable Property IDs after M17 |
| M18 clean environment/database | PASS | 2026-09-07 | Locked install succeeds; all 17 migrations and synthetic seed rebuild from zero; database lint is clean; actual schema objects and privileges were inspected |
| M18 complete automated matrix | PASS | 2026-09-07 | 600 pgTAP assertions, 24-way concurrency, 147 unit, 55 component, 52 guarded integration and definitive 56-scenario Chromium E2E pass |
| M18 static/security/build | PASS | 2026-09-07 | Lint, Prettier, strict TypeScript, 17-client boundary scan, 403-file/current-history and client-output secret scans, 5 safety tests, 0 high-level dependency vulnerabilities and production build pass |
| M18 manual/cross-browser/responsive/a11y | PASS | 2026-09-07 | Semantic production-build review plus Chromium/WebKit smoke at 390/1728; exact E2E widths cover 320/375/390/430/768/1024/1440/1728; axe and keyboard assertions pass |
| M18 performance/SEO | PASS | 2026-09-07 | Five-page local Lighthouse sample records Perf 92–97, A11y/BP 100, indexable-page SEO 100, CLS 0 and TBT ≤55 ms; 3.09 s home median LCP transferred to staging/field validation |
| M18 Definition of Done | PASS | 2026-09-07 | All 702 identifiers are exhaustively reconciled in `docs/runbooks/m18-final-qa.md`; every local MUST PASS succeeds and inherently external evidence is explicitly transferred |
| M19 environment/deployment safety | PASS | 2026-09-07 | Preview/production validation, canonical separation, Turnstile/HMAC/email/map/scanner pairing, Netlify context matching, non-production noindex and empty sitemap are implemented and regression-tested |
| M19 database/recovery preparation | PASS | 2026-09-07 | All 17 migrations are checksummed/audited; five buckets and secure initial-admin bootstrap are documented; local full restore matches row/Auth/storage/RLS/policy evidence and its isolated artifacts were removed |
| M19 complete automated matrix | PASS | 2026-09-07 | Clean 17-migration reset and lint, 600 pgTAP assertions, 24-way concurrency, 151 unit, 55 component, 52 guarded integration and definitive 56-scenario Chromium E2E pass |
| M19 static/security/build | PASS | 2026-09-07 | Lint, Prettier, strict TypeScript, 17-client boundary scan, 404-file/current-history secret scan and Next.js 16.3.4 production-context webpack build/client-output scan pass |
| M19 external launch gates | CONDITIONAL HOLD | 2026-09-07 | No staging/deployed/provider/legal/content/device/field evidence was available; exact owners, evidence, actions and approvals are recorded in `docs/runbooks/m19-deployment-preparation.md` |

## 14. Known Issues

### Blocking

Production launch is blocked by the external gates named in the M19 transfer register: staging and
production provider targets/credentials, staged smoke and rollback evidence, DNS and deployed
security observation, owner-approved business/content/analytics/operations inputs, qualified legal
approval, physical-device checks and staging/field performance. No local code or test blocker remains.

### Important

1. **Provider facts are current only as of 2026-09-07.** M19 revalidated the official Netlify, Supabase, Resend, Turnstile, OpenFreeMap and Cloudflare Web Analytics terms/limits; recheck them again at configuration or launch.
2. **ESLint compatibility warning.** Clean install succeeds, but npm reports ESLint 9 as deprecated; Next 16's bundled lint plugins do not yet declare ESLint 10 peer compatibility. Upgrade when the dependency set supports it without overrides.
3. **Supabase CLI update available.** Local validation used pinned CLI `2.104.0`; `2.116.0` is available. Upgrade only with a reviewed migration/reset regression run.
4. **Field performance still needs staging evidence.** The M18 three-sample local homepage Lighthouse LCP median was 3.09 s against the 2.5 s field target; CLS and TBT were healthy. Recheck with the selected host/CDN, approved imagery and real-user monitoring before launch.

### Minor

- Stateful milestone mutation suites share one guarded database and synthetic admin actor, so Playwright is intentionally configured for one worker. The definitive clean M18 run passed all 56 scenarios; no assertion was suppressed.
- The first M18 full E2E attempt encountered one upstream local PostgREST connection reset. The focused suite passed, the disposable service was restarted, and the definitive unchanged full suite passed 56/56. Treat recurrence in CI/staging as an infrastructure signal to investigate.
- One non-unique `property_verifications` helper index repeats the column order of its unique constraint index. It is non-blocking; remove it only in a future approved migration after query-plan review.

### Deferred / Future

1. Broader geography, external CMS, sitemap sharding and automatic programmatic SEO remain outside V1 unless a later approved milestone introduces them.

## 15. Architecture Decisions Made During Coding

| ADR | Decision | Reason | Affected Areas |
|---|---|---|---|
| `ADR-0001` | Keep site-visit lifecycle separate from CRM follow-up; do not add `FOLLOW_UP_REQUIRED` to `site_visit_status` | A completed visit can simultaneously require follow-up; visit outcome and operational work are independent | Database enum, visit service, CRM follow-up, admin derived views, tests |
| `ADR-0002` | Keep one media registry with mutually exclusive hosted-object and canonical external-provider locators | Required video/drone/360 URLs cannot truthfully satisfy document `03`'s non-null Storage columns; fake objects or duplicate tables would violate the media architecture | `media_assets`, migration, public DTO/projection, storage service, safe embeds, tests |
| `ADR-0003` | Persist evidence provenance, applicability, exceptions, professional review, history and public-copy approval as separate typed verification concepts | Notes and generic pass counts cannot preserve scope, currentness, attribution or safe public-claim gates | Verification schema/RPCs, service, admin workflow, public projection and tests |
| `ADR-0004` | Use the owner-mandated twelve-state CRM pipeline and add private structured follow-up history while retaining `leads.next_follow_up_at` as the open-work pointer | The legacy `WON`/`LOST`/`CLOSED` labels and one timestamp could not represent exact M12 outcomes or append-preserving follow-up details | Lead enum/data migration, follow-up table, CRM RPCs/services/UI, RLS/audit and tests |
| `ADR-0005` | Persist canonical redirects, atomically migrate published guide slugs and constrain guide hero media to approved public assets | Editable published slugs require durable history without redirect chains, while public guide imagery must reuse the existing approved-media boundary | Redirect table/RLS/RPCs, guide schema/services/admin, route fallback, sitemap and tests |

Production migration, bucket creation, map-provider selection, contact configuration, malware-provider activation, lawyer copy approval and public deployment remain unperformed approval gates.

No M14, M15, M17, M18 or M19 ADR was created. M14 implements ADR-0001 directly. M15 uses the already-approved owner state model, private-document boundary and Draft publication gate. M16 creates ADR-0005 to close the explicitly recorded redirect-history and guide-media persistence gaps. M17 hardens those approved boundaries without changing the domain architecture. M18 adds qualification evidence and documentation corrections only. M19 adds deployment guardrails and operational evidence without changing the approved topology or domain model.

The non-ADR M0 reconciliation decisions are recorded in `docs/DECISIONS.md`: later finalized documents refine master examples where the master describes them as recommendations/high-level guidance; the owner-designated design report is the authoritative Living Space brand/design reference; the approved Living Space logo is a reference asset rather than an automatically relabeled Land Space logo; missing photography may use only clearly marked development placeholders tracked for replacement.

## 16. Deviations From Architecture

No business/domain implementation deviation exists.

Document `05`'s treatment of `FOLLOW_UP_REQUIRED` as a visit status is intentionally superseded by ADR-0001 under the owner's explicit resolution. The underlying source document was not edited; the accepted deviation is documented and linked from the ledger.

Documentation placement deviation: the roadmap requested an implementation ledger but did not prescribe its filename; it was created as `docs/architecture/IMPLEMENTATION-LEDGER.md`. This is organizational only and does not change architecture.

Build-tooling note: the default production build uses Next's supported webpack builder because Turbopack's PostCSS worker cannot bind an internal local port on this execution host. `npm run build:turbo` remains available for diagnostics. This does not change application architecture or production output requirements.

## 17. Pending Owner Decisions / Approval Gates

Open explicit approval gates:

- public legal/verification terminology requires qualified Gujarat property-lawyer approval under the verification architecture;
- production infrastructure and production deployment;
- production database migrations;
- DNS/domain changes;
- real customer/inventory/private-document imports;
- destructive production operations;
- production email activation;
- final privacy/consent wording and production Turnstile/notification configuration;
- any paid service, billing, auto-recharge or plan upgrade.

## 18. Placeholder / Pre-Launch Data

The placeholder register records five open pre-launch inputs and two resolved foundations. M10 renders honest empty/media/contact/map states when real inputs are absent. No production property imagery or inventory is shown. Every open item must be replaced or explicitly approved before launch.

The following real inputs remain unavailable/unconfigured:

- Land Space-specific logo/lockup, if distinct from the approved Living Space reference asset;
- approved property photography/media;
- phone and WhatsApp destination;
- public email and sending identity;
- office address;
- Living Space cross-link destination;
- real property inventory;
- final lawyer-approved public verification/legal copy;
- final lawyer-approved public contact-consent/privacy copy;
- approved MapLibre-compatible map style/provider and attribution;
- social links;
- analytics identifiers;
- domain/DNS configuration;
- Search Console configuration.

Do not invent production values or fabricate property/geography records to populate the UI.

## 19. Exact Next Actions

1. Preserve M19 implementation/runbook commit `b8ffaa0` and this clean handoff; use `docs/runbooks/m19-deployment-preparation.md` as the authoritative launch register.
2. Obtain owner-controlled Netlify and separate staging/production Supabase access, then execute only the staging procedure with synthetic data and `APP_ENV=preview`.
3. Collect the required staging TLS/HSTS/CSP/log, Supabase/Auth/Storage, Turnstile, approved-email/scanner, rollback, smoke, performance and physical-device evidence.
4. Obtain explicit owner approvals for provider/cost/recovery/DNS/business/content/analytics/operations values and qualified Gujarat property-counsel approval for legal/verification/consent wording.
5. Reconcile every remaining `BLOCKED`, `OWNER APPROVAL REQUIRED`, `LEGAL APPROVAL REQUIRED` and `DEPLOYMENT-TIME CHECK` row before seeking one explicit production-launch approval.
6. Preserve forced RLS/default-deny ACLs, streamed upload bounds, origin/Fetch Metadata, rate/replay, secure cookies, non-production noindex and every public privacy/publication/verification invariant.
7. Do not deploy production, run its migrations, change DNS, enter real credentials/data or activate paid providers without the exact approval named in the register.

## 20. Resume Instructions For The Next Coding Agent

> You are continuing UrbanEdge Land Space after M19 implementation/runbook commit `b8ffaa0` and the following clean handoff commit. M0–M18 are complete; M19 is on a CONDITIONAL HOLD because local engineering preparation passes but staging/provider/owner/legal/device/field evidence remains unavailable. Read this file, `docs/runbooks/m19-deployment-preparation.md`, `docs/architecture/IMPLEMENTATION-LEDGER.md`, the M18/M17 runbooks and ADR-0001 through ADR-0005 before acting. Treat the M19 transfer register and pre-launch reconciliation as authoritative. The local database is disposable and production remains untouched. Do not convert any external row to PASS without its named evidence and approval; do not launch, migrate production, change DNS, enter real secrets/data, enable billing or submit search properties without explicit authorization. Preserve forced RLS/default ACLs, explicit projections/RPCs, upload/origin/session/header/secret defenses, non-production noindex and all privacy/publication/workflow/verification invariants.

Special warning: owner submissions must never auto-publish, site-visit requests must never auto-confirm, and no public payload may contain owner PII, private documents/evidence/internal notes, unpublished inventory or exact coordinates for approximate/hidden listings.
