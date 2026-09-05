# UrbanEdge Land Space — Implementation State and Agent Handoff

This is the live record of what has actually happened. Update it after every meaningful implementation, migration, security, test, milestone or approval-gate change. Never record planned work as completed work.

## 1. Project Snapshot

| Field | Current value |
|---|---|
| Project | UrbanEdge Land Space |
| Repository | `/Users/vedpatel/Desktop/UrbanLand_website` |
| Current branch | `main` |
| Latest relevant commits | M12 implementation `8170559`; this handoff checkpoint follows it; prior M11 checkpoint `3342810` |
| Working tree | CLEAN after the M12 handoff commit |
| Current milestone | M12 — CRM Core and Admin Operational Pipeline |
| Current milestone status | COMPLETE |
| Last completed milestone | M12 — CRM Core and Admin Operational Pipeline |
| Next milestone | M13 — Public Demand Conversions (not begun) |
| Last updated | 2026-09-05 21:59:37 IST |
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
| M13 Public Inquiry, Buyer Requirement, Contact and Intent Events | NOT_STARTED | — | — | — |
| M14 Site Visit Request and Manual Coordination | NOT_STARTED | — | — | — |
| M15 Sell Your Land Owner Submission and Conversion | NOT_STARTED | — | — | — |
| M16 Guides, Locations, SEO and Crawl Control | NOT_STARTED | — | — | Redirect-history ADR/migration gate already recorded |
| M17 Security Hardening and Privacy Regression Closure | NOT_STARTED | — | — | — |
| M18 Full Testing and Production-Build Qualification | NOT_STARTED | — | — | — |
| M19 Deployment Preparation, Staging Validation and Production Approval Gate | NOT_STARTED | — | — | Production operations remain approval-gated |

## 4. Current Work

Objective achieved: M12 is the single private operational CRM. Public search remains read-only, publication-gated and isolated from CRM; no M13 public form or public verification wording was introduced.

Relevant sources:

- owner's implementation brief;
- embedded master prompt and finalized architecture;
- `12-IMPLEMENTATION-ROADMAP.md`, M12;
- CRM data/backend/admin/security/testing contracts in documents `03`, `04`, `05`, `08`, `11` and `13`;
- ADR-0001's separation of follow-up work from the site-visit lifecycle;
- ADR-0004's exact terminal status and structured follow-up reconciliation;
- `docs/architecture/IMPLEMENTATION-LEDGER.md`.

Principal M12 files:

- `features/crm/domain/*`, `server/services/crm.ts` and the CRM Server Actions
- `app/(admin)/admin/(protected)/leads/*`, `requirements/*` and `follow-ups/page.tsx`
- `components/admin/lead-form.tsx` and the CRM additions to the admin shell/dashboard
- `supabase/migrations/20260905030000_m12_crm_core.sql`
- `supabase/tests/010_m12_crm_core.test.sql` and M12 unit, component, integration and E2E coverage
- `docs/adr/0004-m12-crm-status-and-follow-up-reconciliation.md`
- `docs/architecture/IMPLEMENTATION-LEDGER.md`
- this handoff file.

Dependencies/blockers: M12 is complete against the isolated local Supabase stack on ports `55320`–`55327`. No production database/storage operation is authorized. Lawyer approval for any public verification copy remains an explicit future gate; the seed approves none. Real inventory/media, public contact values and a production map provider/style remain pre-launch inputs, not M12 blockers.

Required M12 checks: private lead CRUD, exact controlled transitions, requirement integrity, append-oriented activities/notes, structured follow-up history and India-time queues, manual property match/reject/remove, duplicate contact detection/reuse without destructive merge, bounded protected discovery, admin/non-admin/public actor separation, privacy-safe audit, responsive/keyboard/accessibility behavior, complete regression and production build. All pass locally.

## 5. Completed Implementation

### Foundation

Next.js 16 App Router, React 19, strict TypeScript, Tailwind 4, shadcn configuration, ESLint, Prettier, environment validation, server-only graph enforcement, secret scanning, public/admin route-group shells, error/not-found foundations, Vitest/component/Playwright scaffolds, synthetic builders, a stateful-test production guard, local Supabase structure and GitHub Actions CI are implemented and validated.

### Database

Twelve ordered migrations implement 54 application tables and 32 enum types. M12 adds private `lead_follow_ups`, reconciles `lead_status` to the exact twelve-state owner pipeline, extends CRM activity types, adds duplicate/filter indexes and provides nine service-role-only transactional CRM RPCs. The prior generated public search document, typed bounded search RPC, publication projections and all privacy boundaries remain unchanged. The schema retains UUID keys, immutable sequence-backed references, foreign keys, checks, partial uniqueness, typed-value/category/audit triggers, updated timestamps, public-safe views and service-role-only domain transactions. `supabase/seed.sql` contains only repeatable India/Gujarat/service-district/unit/reference conversions. Applied and tested only in disposable local Supabase; never applied to production.

### Server contracts

Separate public/admin/CRM DTOs, typed Supabase rows, explicit public property/reference queries, a defensive public-property projector, centralized public-location/media/business-config helpers, price/area formatters, seven executable state machines and shared Zod schemas are implemented. M12 adds normalized lead/requirement/transition/follow-up validation and one server-only CRM service boundary whose exported operations all reauthorize the actor. `PostgresSearchProvider` continues to own public discovery. Public page loaders consume only bounded published projections and fail to safe empty/not-found states. Browser, anonymous server, authenticated server, privileged server and test-actor Supabase helpers remain separate; privileged helpers import `server-only`.

### RLS

All 54 application tables have RLS. Authenticated browser identities receive database-profile-gated read access only; business writes remain server-owned. The private follow-up table follows the same active-admin read/service-only write model, and all nine CRM RPCs deny `anon` and `authenticated`. Fourteen explicit public views remain owned by a `NOLOGIN`, `NOBYPASSRLS` projection role and contain no CRM rows or PII. Anonymous actors may execute only the bounded public search RPC; they cannot select the internal search projection or any base table. Anonymous direct business-table writes and all client audit mutation are denied. `write_audit_log` and service-role-only domain transactions remain the trusted mutation/audit paths.

### Admin Authentication

Supabase email/password login and logout are implemented with cookie refresh in `proxy.ts`. `requireActiveAdmin()` verifies the server session with `auth.getUser()` and matches it to an active database profile. `/admin/dashboard` is dynamically rendered, no-store, and inaccessible to anonymous, non-admin and inactive-admin actors. The responsive shell includes grouped navigation and account/session controls.

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

All public property queries use explicit field lists. Published-only projection views and the M11 typed projection-owned RPC remain the sole anonymous data sources, and `public_property_indexability` is the safe later sitemap/robots source. Publish, unpublish, availability, public-media and verification changes revalidate inventory, property, admin preview and sitemap paths. M16 sitemap/robots rendering remains not implemented.

### Public Website

M11 extends the completed M10 responsive navy/gold public shell with a compact homepage search entry and a server-rendered discovery workspace. Desktop uses a sticky filter rail; mobile uses an accessible bottom sheet with focus entry, Tab containment, Escape dismissal and body-scroll control. Active chips, honest totals, loading submission copy, zero/failure recovery, sort controls and pagination preserve the visual and semantic card system.

`/properties`, `/search`, three category landings and Buy/Rent/Lease landings now use one bounded search provider and canonical `PropertyCard`. `/properties/[property-slug]` remains the approved detail route and M10 experience. Closed listings retain accurate detail pages but are excluded from default discovery until an explicit availability filter is selected; inaccessible slugs and out-of-range search pages return real 404 responses.

MapLibre is integrated as an opt-in client enhancement using its separately copied worker. It never mounts for hidden locations and receives only approved public coordinates for exact/approximate modes. Video/drone/360 embeds remain consent-gated. Contact actions read centralized public settings and stay disabled or absent when real values are unavailable; no CRM mutation exists before M13.

### Search

M11 is complete. The stable URL contract is `q`, `propertyId`, `category`, `transaction`, `district`, `taluka`, `place`, `locality`, `minArea`, `maxArea`, `areaUnit`, `minPrice`, `maxPrice`, `pricing`, `availability`, `agriTenure`, `agriIrrigation`, `naStatus`, `naPurpose`, `industrialType`, `industrialPower`, `sort` and `page`. Unknown, invalid, repeated or out-of-order state is normalized with a permanent redirect; `page=1`, the default sort and the default square-foot unit are omitted.

The PostgreSQL function applies AND semantics. Exact `UE-LS-######` input takes the identity path; keyword rank uses only public code/title/descriptions/landmark/address plus public geography names. Numeric INR budget uses interval overlap for `EXACT_TOTAL`/`PRICE_RANGE`, excludes POR/per-unit rows and exposes POR as an explicit class. Strict area converts six standard units and includes only `AUTHORITATIVE` normalized square metres. Default availability is Available plus Under Negotiation; Sold/Rented/Leased are explicit and Off Market is rejected. Recommended, newest, oldest, price ascending/descending and area ascending/descending sorts all end with stable ID ordering. Visitor pages use 12 results; RPC page size is capped at 48 and page at 100.

### CRM

M12 implements a single private brokerage CRM over the approved `parties`, `leads`, `lead_requirements`, `lead_properties` and `lead_activities` model plus structured `lead_follow_ups`. New leads start at `NEW`; server-owned transitions enforce the exact twelve-stage lifecycle and evidence prerequisites for contact attempts, confirmed requirements, active matches, nurture planning and terminal outcomes. Closed states are terminal and clear the open-work pointer.

Admin creation normalizes phone/email and surfaces likely duplicates. When the normalized signals identify exactly one existing party, a confirmed new intent reuses that contact but creates a separate lead; ambiguous signals never select an arbitrary party and no destructive merge exists. Lead notes are append-oriented, actor-attributed activities. Requirements reuse lead-level transaction/category/geography/budget fields and store only requirement-specific area, frontage, road width and notes. Matches remain manual, status-bearing and reversible; no automated recommendation/contact system exists.

The protected inbox is bounded to 100 results and filters by free text, stage, category, transaction, source, district, assignee, created dates and follow-up state. The pipeline, lead workspace, requirement lists and 200-row follow-up queue provide the operational views. Follow-up history stores UTC `timestamptz`, type, context, note, creation/completion actors, completion time and outcome; the UI derives overdue/today/upcoming/completed buckets in Asia/Kolkata. M13 public intake and M14 visit scheduling remain unimplemented.

### Site Visits

Not implemented.

### Sell Your Land

Not implemented.

### SEO

M11 search SEO extends the M10 baseline. Unfiltered `/properties` and valid unfiltered numbered pages are index/follow with self canonicals. Normalized filter and sort combinations are noindex/follow with normalized self canonicals. `page=1` redirects away; out-of-range pages are 404. `/search` is noindex and permanently redirects query state to `/properties`. M16 still owns sitemap/robots rendering, guide/location scale-out and broader crawl control.

### Security

The M1–M11 protections remain intact. M12 CRM routes and every read/write service require `requireActiveAdmin()`; browser roles receive no mutation privileges and cannot execute CRM RPCs. Database and browser canaries prove anonymous, authenticated non-admin and inactive-admin actors cannot read leads, requirements, follow-ups or guessed lead IDs. Public projections remain lead-free and contain no contact data, notes, requirement data, follow-up detail or activity. Generic audits retain actor/entity/change/status identifiers but omit contact PII and note bodies; richer business context stays in the private activity timeline.

### Testing

The complete current local suite passes: 372 pgTAP assertions, the 24-worker Property ID concurrency test, 102 Vitest unit tests, 31 component tests, 30 guarded application integration tests and 32 guarded Chromium E2E scenarios. Lint, Prettier verification, strict typecheck, 15-client server-boundary scan, 281-file secret scan, clean database reset/lint and the Next.js 16 webpack production build also pass. M12 browser coverage includes lead create/edit, invalid transition exclusion, qualification, requirement save, match/remove/relink, follow-up schedule and every derived queue bucket, completion, attributed activity/note rendering, closed won/lost, bounded search/filtering, mobile overflow, keyboard submission, axe accessibility and anonymous/non-admin/inactive denial.

Final mobile Lighthouse on the local production homepage scored Performance 95, Accessibility 100, Best Practices 100 and SEO 100, with FCP 1.22 s, lab LCP 2.92 s, CLS 0 and TBT 28 ms. The no-layout-shift and interaction results pass; the throttled local LCP remains above the 2.5 s field target and must be remeasured on staging/real traffic rather than represented as achieved.

### Deployment Preparation

Not implemented or configured.

## 6. Repository / Important File Map

```text
app/                                       Next.js App Router
  (public)/                                M11 public shell, search/category/transaction/property routes
  (admin)/admin/                           protected property, verification, media and M12 CRM operations
  error.tsx / global-error.tsx / not-found.tsx
components/foundation/                     M1 shell components
components/public/                         canonical M10 cards, collections, detail/media/location/actions and shell
components/search/                         M11 filter rail/sheet, chips, sort, pagination, entry and results
components/admin/                          protected shell, property/media/verification and lead form UI
config/                                    site and environment schemas
features/crm/                              M12 lead/follow-up contracts, validation and pipeline helpers
features/search/                           normalized M11 query and provider contracts
lib/                                       shared/test/privacy/SEO/Supabase boundaries
server/                                    server-only env and domain-layer boundaries
  services/crm.ts                          authorized M12 CRM read/write services
  search/                                  PostgreSQL public-search provider
supabase/                                  local config, 12 migrations, repeatable seed and pgTAP suites
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
  runbooks/
    README.md                               runbook scope and production guardrails
```

There is no `.openai/hosting.json`; no hosting/deployment is configured. The approved Living Space logo reference is present, while the old reference-app source is intentionally unavailable. Git is on `main`. The `.gitignore` excludes secrets, environment files, dependencies, generated output including the copied MapLibre worker, local Supabase runtime and provider state. M0–M12 are complete; M13 has not begun.

## 7. Database State

| Item | Actual state |
|---|---|
| Migration files | Twelve ordered migrations through `20260905030000_m12_crm_core.sql` |
| Tables created | 54 application tables: the authoritative 49, four typed M8 workflow/policy tables and private M12 `lead_follow_ups` |
| Enums created | 32 enum types; `lead_status` has the exact twelve M12 states and `lead_activity_type` includes service-owned follow-up/match/closure events |
| Functions/triggers | Prior generators/integrity/draft/media/verification/publication/search functions plus nine service-only CRM transactions |
| Views/public projections | 14 whitelisted public views plus one private projection-owner search view; none contains CRM data |
| Indexes | Baseline publication/geography/offers/media/visit/verification/content/audit indexes plus normalized contact, CRM filtering and follow-up queue indexes |
| Storage buckets | Five local migration-controlled buckets: two intentional public buckets and three private buckets; no browser object mutation/list policies |
| RLS policies | Enabled on all 54 tables; active-admin read policy on each plus narrowly scoped projection-owner policies |
| Seed data | Safe repeatable India, Gujarat, Ahmedabad/Gandhinagar, 9 units and 5 non-local standard conversions |
| Local database | Running isolated Supabase project `urbanedge-land-space-local` on `55320`–`55327` |
| Development/staging application | Nothing applied |
| Production | Nothing applied; no production operation authorized |

The 54-table inventory, 32 enum types, twelve-migration order, 14 explicit public-safe projections, five-bucket boundary, RLS grants and M6–M12 service transactions are implemented and validated locally.

## 8. RLS / Security State

Database integrity, server module boundaries, RLS, grants and privacy projections are implemented and tested locally. Browser roles cannot write business tables, execute M6–M12 mutation RPCs, list private objects, upload to any controlled bucket or change bucket visibility. Every property, media, verification, publication and CRM Server Action reauthorizes with `requireActiveAdmin()` before privileged work; RPCs repeat the active-admin actor check and are executable only by `service_role`. Private signing additionally checks the active, clean, non-archived document and active property, then audits the resource ID/purpose without paths or URL. Anonymous/non-admin path guesses fail; unpublished inventory/media, CRM data, private evidence/documents, source details, exact coordinates, EXIF and owner contact data remain outside public outputs.

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
| `/properties/[property-slug]` | COMPLETE / TESTED | Approved canonical detail route with safe category facts, media, privacy-aware location, availability, metadata and actions |
| Other canonical public routes | NOT_STARTED | Implemented only in their roadmap milestones; future links do not prefetch absent routes |

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
| `/api/admin/private-documents/[id]/download` | COMPLETE / TESTED | Active-admin-only late-bound temporary signed redirect; generic denial and no-store response |
| Other canonical admin routes | NOT_STARTED | Implemented only in their domain milestones |

The planned route inventory and route-specific data/authorization sources are in the implementation ledger.

## 10. Business State Machines

Pure executable state machines implement property publication, property availability, lead, owner-submission, site-visit, verification and guide/content transitions. The M12 lead machine uses `NEW`, `CONTACT_ATTEMPTED`, `QUALIFIED`, `REQUIREMENT_CONFIRMED`, `PROPERTY_MATCHED`, `SITE_VISIT_REQUESTED`, `SITE_VISIT_CONFIRMED`, `SITE_VISIT_COMPLETED`, `NEGOTIATION`, `NURTURE`, `CLOSED_WON` and `CLOSED_LOST`; database transitions enforce the same allow-list and evidence checks. Unit/database tests cover allowed and denied transitions, while services own authorization, locking, transactional side effects and audit.

ADR-0001 remains enforced in code: `REQUESTED`, `CONTACTED`, `PROPOSED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`, `RESCHEDULED` are the visit states; `FOLLOW_UP_REQUIRED` is absent. Completed visits are terminal while CRM follow-up stays in `lead_follow_ups` with `leads.next_follow_up_at` as its open-work pointer.

## 11. External Providers / Infrastructure

| Provider/capability | State | Notes |
|---|---|---|
| Supabase | LOCAL_ONLY | Isolated local project runs on `55320`–`55327`; a new dedicated remote project is still required and must never share Living Space |
| Netlify | NOT_CONFIGURED | Free tier is architecture target; no site created |
| Email / Resend | NOT_CONFIGURED | No key/domain/sending enabled |
| Maps / OpenFreeMap + MapLibre | CLIENT_READY / PROVIDER_NOT_CONFIGURED | Consent-free lazy MapLibre client and worker are integrated; no map mounts without an approved style/provider, and hidden listings never receive a point |
| Analytics / Cloudflare Web Analytics | NOT_CONFIGURED | No identifier/configuration |
| Cloudflare Turnstile | NOT_CONFIGURED | No widget/site key/secret |
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

## 14. Known Issues

### Blocking

None. Every M12 completion criterion passes locally; M13 has not begun.

### Important

1. **Provider facts are dated.** Revalidate current terms/free limits before configuration or launch.
2. **ESLint compatibility warning.** Clean install succeeds, but npm reports ESLint 9 as deprecated; Next 16's bundled lint plugins do not yet declare ESLint 10 peer compatibility. Upgrade when the dependency set supports it without overrides.
3. **Supabase CLI update available.** Local validation used pinned CLI `2.104.0`; `2.116.0` is available. Upgrade only with a reviewed migration/reset regression run.
4. **Field performance still needs staging evidence.** The final throttled local homepage Lighthouse LCP was 2.92 s against the 2.5 s field target; CLS and TBT were healthy. Recheck with the selected host/CDN, approved imagery and real-user monitoring before launch.

### Minor

- The unchanged M9 publication E2E scenario timed out once while waiting for its admin page during the final 32-scenario parallel run; its immediate single-worker rerun passed in 10.4 s. Treat recurrence as test-load flakiness to investigate rather than suppressing the assertion.

### Deferred / Future

1. Persistent SEO redirect history decision in M16.

## 15. Architecture Decisions Made During Coding

| ADR | Decision | Reason | Affected Areas |
|---|---|---|---|
| `ADR-0001` | Keep site-visit lifecycle separate from CRM follow-up; do not add `FOLLOW_UP_REQUIRED` to `site_visit_status` | A completed visit can simultaneously require follow-up; visit outcome and operational work are independent | Database enum, visit service, CRM follow-up, admin derived views, tests |
| `ADR-0002` | Keep one media registry with mutually exclusive hosted-object and canonical external-provider locators | Required video/drone/360 URLs cannot truthfully satisfy document `03`'s non-null Storage columns; fake objects or duplicate tables would violate the media architecture | `media_assets`, migration, public DTO/projection, storage service, safe embeds, tests |
| `ADR-0003` | Persist evidence provenance, applicability, exceptions, professional review, history and public-copy approval as separate typed verification concepts | Notes and generic pass counts cannot preserve scope, currentness, attribution or safe public-claim gates | Verification schema/RPCs, service, admin workflow, public projection and tests |
| `ADR-0004` | Use the owner-mandated twelve-state CRM pipeline and add private structured follow-up history while retaining `leads.next_follow_up_at` as the open-work pointer | The legacy `WON`/`LOST`/`CLOSED` labels and one timestamp could not represent exact M12 outcomes or append-preserving follow-up details | Lead enum/data migration, follow-up table, CRM RPCs/services/UI, RLS/audit and tests |

Production migration, bucket creation, map-provider selection, contact configuration, malware-provider activation, lawyer copy approval and public deployment remain unperformed approval gates.

The non-ADR M0 reconciliation decisions are recorded in `docs/DECISIONS.md`: later finalized documents refine master examples where the master describes them as recommendations/high-level guidance; the owner-designated design report is the authoritative Living Space brand/design reference; the approved Living Space logo is a reference asset rather than an automatically relabeled Land Space logo; missing photography may use only clearly marked development placeholders tracked for replacement.

## 16. Deviations From Architecture

No business/domain implementation deviation exists.

Document `05`'s treatment of `FOLLOW_UP_REQUIRED` as a visit status is intentionally superseded by ADR-0001 under the owner's explicit resolution. The underlying source document was not edited; the accepted deviation is documented and linked from the ledger.

Documentation placement deviation: the roadmap requested an implementation ledger but did not prescribe its filename; it was created as `docs/architecture/IMPLEMENTATION-LEDGER.md`. This is organizational only and does not change architecture.

Build-tooling note: the default production build uses Next's supported webpack builder because Turbopack's PostCSS worker cannot bind an internal local port on this execution host. `npm run build:turbo` remains available for diagnostics. This does not change application architecture or production output requirements.

## 17. Pending Owner Decisions / Approval Gates

Future explicit approval gates (not currently requested):

- public legal/verification terminology requires qualified Gujarat property-lawyer approval under the verification architecture;
- production infrastructure and production deployment;
- production database migrations;
- DNS/domain changes;
- real customer/inventory/private-document imports;
- destructive production operations;
- production email activation;
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
- approved MapLibre-compatible map style/provider and attribution;
- social links;
- analytics identifiers;
- domain/DNS configuration;
- Search Console configuration.

Do not invent production values or fabricate property/geography records to populate the UI.

## 19. Exact Next Actions

1. Preserve the clean M12 checkpoint; M13 remains unstarted until the owner explicitly continues it.
2. Before M13, read its public-demand conversion sources and reuse the M12 CRM domain/service contracts rather than creating public-only lead storage.
3. Keep browser roles unable to read CRM rows or execute privileged CRM mutations; public intake must enter through a bounded server-owned adapter.
4. Keep all verification public copy disabled until wording receives the recorded lawyer approval required by its policy row.
5. Consume `public_property_indexability` only when M16 implements sitemap/robots rendering; do not reimplement publication readiness in search or public UI.
6. Configure and validate approved map and malware-scanning providers before staging/production use; both currently fail safely when absent.

## 20. Resume Instructions For The Next Coding Agent

> You are continuing an existing UrbanEdge Land Space implementation after M12. M0–M12 are complete and M13 has not begun. Read this file, `docs/architecture/IMPLEMENTATION-LEDGER.md`, ADR-0001 through ADR-0004 and the M13 public-demand sources before any M13 work. The local database is disposable and isolated; production remains untouched. Reuse the M12 server/domain CRM interfaces for public intake; do not create public-only lead tables or grant browser CRM mutations. Preserve the M11 search contract, M9 publication boundary, public-safe projections, location privacy and scoped public-copy gate.

Special warning: owner submissions must never auto-publish, site-visit requests must never auto-confirm, and no public payload may contain owner PII, private documents/evidence/internal notes, unpublished inventory or exact coordinates for approximate/hidden listings.
