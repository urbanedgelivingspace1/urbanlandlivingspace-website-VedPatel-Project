# UrbanEdge Land Space — Implementation State and Agent Handoff

This is the live record of what has actually happened. Update it after every meaningful implementation, migration, security, test, milestone or approval-gate change. Never record planned work as completed work.

## 1. Project Snapshot

| Field | Current value |
|---|---|
| Project | UrbanEdge Land Space |
| Repository | `/Users/vedpatel/Desktop/UrbanLand_website` |
| Current branch | `main` |
| Latest relevant commit | M6 completion commit `75cb00728810c6a20374cc7805bbaf917273d717`; this handoff record is the following `HEAD` commit |
| Working tree | CLEAN after the handoff-state commit |
| Current milestone | M6 — Property Domain Services and Admin Property CRUD |
| Current milestone status | COMPLETE |
| Last completed milestone | M6 — Property Domain Services and Admin Property CRUD |
| Next milestone | M7 — Media, Public Storage and Private Document Storage |
| Last updated | 2026-09-03 17:03:00 IST |
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
| M7 Media, Public Storage and Private Document Storage | NOT_STARTED | — | — | — |
| M8 Verification Workflow and Verification Admin | NOT_STARTED | — | — | Evidence/professional-review persistence decisions tracked for this milestone |
| M9 Publication Gate and Public Projection Freeze | NOT_STARTED | — | — | — |
| M10 Public Property Experience | NOT_STARTED | — | — | — |
| M11 PostgreSQL Search and URL-State Discovery | NOT_STARTED | — | — | — |
| M12 CRM Core and Admin Operational Pipeline | NOT_STARTED | — | — | — |
| M13 Public Inquiry, Buyer Requirement, Contact and Intent Events | NOT_STARTED | — | — | — |
| M14 Site Visit Request and Manual Coordination | NOT_STARTED | — | — | — |
| M15 Sell Your Land Owner Submission and Conversion | NOT_STARTED | — | — | — |
| M16 Guides, Locations, SEO and Crawl Control | NOT_STARTED | — | — | Redirect-history ADR/migration gate already recorded |
| M17 Security Hardening and Privacy Regression Closure | NOT_STARTED | — | — | — |
| M18 Full Testing and Production-Build Qualification | NOT_STARTED | — | — | — |
| M19 Deployment Preparation, Staging Validation and Production Approval Gate | NOT_STARTED | — | — | Production operations remain approval-gated |

## 4. Current Work

Objective: preserve the completed M6 checkpoint. M7 has not begun. The next task may start M7 only after reading this handoff and the M7 roadmap/security/storage sources.

Relevant sources:

- owner's implementation brief;
- embedded master prompt and finalized architecture;
- `12-IMPLEMENTATION-ROADMAP.md`, M6;
- database/backend/security contracts in documents `03`, `04` and `08`;
- ADR-0001's unchanged eight-value `site_visit_status` contract;
- `docs/architecture/IMPLEMENTATION-LEDGER.md`.

Principal M6 files:

- `supabase/migrations/20260903060000_property_draft_services.sql`
- `server/services/property-drafts.ts`
- `features/properties/domain/admin-property-draft.ts`
- `components/admin/property-draft-form.tsx`
- `app/(admin)/admin/(protected)/properties/*`
- M6 database, unit, integration, component and E2E test files
- `docs/architecture/IMPLEMENTATION-LEDGER.md`
- this handoff file.

Dependencies/blockers: M6 is complete against the isolated local Supabase stack on ports `55320`–`55327`. No production database operation is authorized. M7 remains NOT_STARTED.

Required M6 checks: draft CRUD for all categories/field groups, transition and archive behavior, audit, optimistic concurrency, invalid status rejection, incomplete draft support, blocked publication and anonymous mutation denial.

## 5. Completed Implementation

### Foundation

Next.js 16 App Router, React 19, strict TypeScript, Tailwind 4, shadcn configuration, ESLint, Prettier, environment validation, server-only graph enforcement, secret scanning, public/admin route-group shells, error/not-found foundations, Vitest/component/Playwright scaffolds, synthetic builders, a stateful-test production guard, local Supabase structure and GitHub Actions CI are implemented and validated.

### Database

Six ordered migrations implement all 49 approved application tables, 24 enum types plus the additive `EXACT_LOCATION_ACCESS` audit value, UUID keys, immutable sequence-backed references, foreign keys, checks, partial uniqueness, typed-value/category/audit triggers, updated timestamps, public-safe views, RLS/grants and M6 draft/lifecycle transactions. `supabase/seed.sql` contains only repeatable India/Gujarat/service-district/unit/reference conversions. Applied and tested only in disposable local Supabase; never applied to production.

### Server contracts

Separate public/admin DTOs, typed Supabase view rows, public property/reference queries, a centralized public-location transformer, price/area helpers, seven executable state machines and shared Zod schemas for upcoming mutations are implemented. Browser, authenticated server, privileged server and test-actor Supabase helpers are separate; privileged helpers import `server-only`.

### RLS

All 49 application tables have RLS. Authenticated browser identities receive database-profile-gated read access only; business writes remain server-owned. Ten explicit public views are owned by a `NOLOGIN`, `NOBYPASSRLS` projection role and granted to anonymous/authenticated actors. Anonymous direct business-table writes and all client audit mutation are denied. `write_audit_log` and M6's service-role-only transactions are the trusted audit-writing paths.

### Admin Authentication

Supabase email/password login and logout are implemented with cookie refresh in `proxy.ts`. `requireActiveAdmin()` verifies the server session with `auth.getUser()` and matches it to an active database profile. `/admin/dashboard` is dynamically rendered, no-store, and inaccessible to anonymous, non-admin and inactive-admin actors. The responsive shell includes grouped navigation and account/session controls.

### Properties

M6 property administration is implemented. A narrow service-role-only database transaction creates or updates Draft properties after every calling Server Action passes `requireActiveAdmin()`. It persists the shared core, generated slug, one category-correct Agricultural/NA/Industrial extension, structured primary offer, separated private/public location, parcel and normalized source identifier, planning context, existing-party relationship and source provenance. The immutable sequence-backed Property ID is never accepted from the client and remains unchanged across edits and category changes.

`/admin/properties`, `/admin/properties/new`, `/admin/properties/[id]` and `/admin/properties/[id]/edit` provide searchable/filterable inventory, draft creation/editing, status/media/verification summaries, controlled availability transitions and archive/restore. Draft validation enforces only the approved database-minimum fields; title, media and verification are not required to save. Publish is a disabled M9 placeholder and no publish action/RPC exists.

Important writes use `updated_at` optimistic concurrency. Availability, archive and restore are dedicated transactions rather than arbitrary status writes. Draft save, availability, archive and restore audits are actor-attributed and omit private coordinates/notes. Exact coordinates are excluded from ordinary detail data and loaded only by the explicit protected edit route with an `EXACT_LOCATION_ACCESS` audit.

### Media

Not implemented.

### Verification

Not implemented.

### Public Website

Not implemented.

### Search

Not implemented.

### CRM

Not implemented.

### Site Visits

Not implemented.

### Sell Your Land

Not implemented.

### SEO

Not implemented.

### Security

M1 foundation security is implemented: server environment access is marked `server-only`, client dependency graphs are checked for privileged imports, stateful tests fail closed against production-shaped targets, examples contain names only, and tracked/candidate files are secret-scanned. RLS and domain privacy enforcement begin in M2–M4.

### Testing

The complete current local suite passes: 136 pgTAP assertions, the 24-worker Property ID concurrency test, 36 Vitest unit tests, 3 component tests, 6 guarded application integration tests and 13 guarded Chromium E2E scenarios. Lint, Prettier verification, strict typecheck, server-boundary scan, secret scan and the webpack production build also pass. M6 coverage includes every category draft, shared group updates, category consistency, related persistence, stale writes, invalid client status/identity fields, controlled availability, archive/restore, audit privacy, public draft exclusion, retained validation input and anonymous denial.

### Deployment Preparation

Not implemented or configured.

## 6. Repository / Important File Map

```text
app/                                       Next.js App Router
  (public)/                                public shell and foundation page
  (admin)/admin/                           explicit admin route-group placeholder
  error.tsx / global-error.tsx / not-found.tsx
components/foundation/                     M1 shell components
config/                                    site and environment schemas
features/                                  domain-module boundary (empty in M1)
lib/                                       shared/test/privacy/SEO/Supabase boundaries
server/                                    server-only env and domain-layer boundaries
supabase/                                  local config; migrations/seed placeholders
tests/                                     unit, component, integration and E2E scaffolds
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
  runbooks/
    README.md                               runbook scope and production guardrails
```

There is no `.openai/hosting.json`; no hosting/deployment is configured. The approved Living Space logo reference is present, while the old reference-app source is intentionally unavailable. Git is on `main`. The `.gitignore` excludes secrets, environment files, dependencies, generated output, local Supabase runtime and provider state. M0–M6 are complete; M7 has not begun.

## 7. Database State

| Item | Actual state |
|---|---|
| Migration files | Six ordered migrations through `20260903060000_property_draft_services.sql` |
| Tables created | 49 authoritative V1 application tables |
| Enums created | 24 enum types; ADR-0001 eight-value `site_visit_status`, no `FOLLOW_UP_REQUIRED`; audit action extended with `EXACT_LOCATION_ACCESS` |
| Functions/triggers | Reference generators, immutable codes, `updated_at`, typed attributes/settings, category consistency, append-only audit, atomic draft save, controlled availability and archive/restore |
| Views/public projections | 10 whitelisted views: property listing/detail/media/verifications, geography, area units, settings, guide categories/guides and SEO pages |
| Indexes | Baseline publication/geography/offers/media/CRM/visit/verification/content/audit indexes |
| Storage buckets | None |
| RLS policies | Enabled on all 49 tables; active-admin read policy on each plus narrowly scoped projection-owner policies |
| Seed data | Safe repeatable India, Gujarat, Ahmedabad/Gandhinagar, 9 units and 5 non-local standard conversions |
| Local database | Running isolated Supabase project `urbanedge-land-space-local` on `55320`–`55327` |
| Development/staging application | Nothing applied |
| Production | Nothing applied; no production operation authorized |

The 49-table inventory, 24 enum types, six-migration order, ten explicit public-safe projections, RLS grants and M6 service transactions are implemented and validated locally.

## 8. RLS / Security State

Database integrity, server module boundaries, RLS, grants and privacy projections are implemented and tested locally. Browser roles cannot write business tables or execute M6 mutation RPCs. Every property Server Action reauthorizes with `requireActiveAdmin()` before a privileged transaction. An active admin browser can read protected rows only when `auth.uid()` matches an active database profile; non-admin and inactive identities see none. Exact coordinates remain outside public projections and ordinary admin detail payloads; explicit edit access is audited.

## 9. Routes Implemented

### Public routes

| Route | Status | Notes |
|---|---|---|
| `/` | SHELL_ONLY / TESTED | Responsive development-only public foundation; no property data or imagery |
| Other canonical public routes | NOT_STARTED | Implemented only in their roadmap milestones |

### Admin routes

| Route | Status | Notes |
|---|---|---|
| `/admin` | REDIRECT / TESTED | Redirects into the protected dashboard boundary |
| `/admin/login` | COMPLETE / TESTED | Generic validation/auth/authorization states; never reveals account existence |
| `/admin/dashboard` | COMPLETE / TESTED | Active-admin-only dynamic route with responsive accessible shell |
| `/admin/properties` | COMPLETE / TESTED | Protected searchable/filterable inventory with operational summaries |
| `/admin/properties/new` | COMPLETE / TESTED | Three-category draft creation and retained validation state |
| `/admin/properties/[id]` | COMPLETE / TESTED | Protected detail, M9 publication placeholder and controlled state actions |
| `/admin/properties/[id]/edit` | COMPLETE / TESTED | Shared/category-specific edit with optimistic concurrency and audited exact-location access |
| Other canonical admin routes | NOT_STARTED | Implemented only in their domain milestones |

The planned route inventory and route-specific data/authorization sources are in the implementation ledger.

## 10. Business State Machines

Pure executable state machines now implement property publication, property availability, lead, owner-submission, site-visit, verification and guide/content transitions. Unit tests cover allowed and denied transitions; later milestone services remain responsible for authorization, locking, transactional side effects and audit.

ADR-0001 remains enforced in code: `REQUESTED`, `CONTACTED`, `PROPOSED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`, `RESCHEDULED` are the visit states; `FOLLOW_UP_REQUIRED` is absent. Completed visits are terminal while CRM follow-up stays in `leads.next_follow_up_at` and activity/next-action context.

## 11. External Providers / Infrastructure

| Provider/capability | State | Notes |
|---|---|---|
| Supabase | LOCAL_ONLY | Isolated local project runs on `55320`–`55327`; a new dedicated remote project is still required and must never share Living Space |
| Netlify | NOT_CONFIGURED | Free tier is architecture target; no site created |
| Email / Resend | NOT_CONFIGURED | No key/domain/sending enabled |
| Maps / OpenFreeMap + MapLibre | NOT_CONFIGURED | No provider or style configured |
| Analytics / Cloudflare Web Analytics | NOT_CONFIGURED | No identifier/configuration |
| Cloudflare Turnstile | NOT_CONFIGURED | No widget/site key/secret |
| Domain / Cloudflare DNS | NOT_CONFIGURED | No DNS changes performed |
| Google Search Console | NOT_CONFIGURED | No property configured |
| PostgreSQL search | NOT_CONFIGURED | Database exists locally; search implementation begins at M11 |

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

## 14. Known Issues

### Blocking

None. M6 completion criteria pass; M7 has not begun.

### Important

1. **Provider facts are dated.** Revalidate current terms/free limits before configuration or launch.
2. **ESLint compatibility warning.** Clean install succeeds, but npm reports ESLint 9 as deprecated; Next 16's bundled lint plugins do not yet declare ESLint 10 peer compatibility. Upgrade when the dependency set supports it without overrides.
3. **Supabase CLI update available.** Local validation used pinned CLI `2.104.0`; `2.116.0` is available. Upgrade only with a reviewed migration/reset regression run.

### Minor

- None recorded.

### Deferred / Future

1. Persistent SEO redirect history decision in M16.
2. Verification evidence-provenance persistence decision in M8.
3. Professional-review lifecycle persistence decision in M8.

## 15. Architecture Decisions Made During Coding

| ADR | Decision | Reason | Affected Areas |
|---|---|---|---|
| `ADR-0001` | Keep site-visit lifecycle separate from CRM follow-up; do not add `FOLLOW_UP_REQUIRED` to `site_visit_status` | A completed visit can simultaneously require follow-up; visit outcome and operational work are independent | Database enum, visit service, CRM follow-up, admin derived views, tests |

No M6 ADR was required. Adding `EXACT_LOCATION_ACCESS` to the existing audit enum directly implements document `08`'s recommended explicit event for protected exact-coordinate reads; it does not change a business/domain decision. M6 also adopts the documented narrow-RPC option so related draft writes, stale-token checking and their audit record commit atomically while browser roles retain no write/execute grant.

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

The placeholder register records two open items (public foundation and provisional text wordmark) and one resolved M5 admin-foundation item. No property imagery or inventory is shown. Every open item must be replaced or explicitly approved before launch.

The following real inputs remain unavailable/unconfigured:

- Land Space-specific logo/lockup, if distinct from the approved Living Space reference asset;
- approved property photography/media;
- phone and WhatsApp destination;
- public email and sending identity;
- office address;
- real property inventory;
- final lawyer-approved public verification/legal copy;
- social links;
- analytics identifiers;
- domain/DNS configuration;
- Search Console configuration.

Do not invent production values or fabricate property/geography records to populate the UI.

## 19. Exact Next Actions

1. Preserve the clean M6 checkpoint and do not reopen publication in M7.
2. Before M7, read the M7 roadmap section plus documents `08` and `09` in full for storage/private-document gates.
3. Start M7 only in a subsequent task; no M7 storage bucket, media action or document behavior has been implemented here.

## 20. Resume Instructions For The Next Coding Agent

> You are continuing an existing UrbanEdge Land Space implementation after M6. M0–M6 are complete and M7 has not begun. Read this file, `docs/architecture/IMPLEMENTATION-LEDGER.md`, ADR-0001, the M7 section of `12-IMPLEMENTATION-ROADMAP.md`, and documents `08`, `09`, `11` and `13` before any M7 work. The local database is disposable and isolated; production remains untouched. Preserve the service-role-only property write boundary and keep publication blocked until M9.

Special warning: owner submissions must never auto-publish, site-visit requests must never auto-confirm, and no public payload may contain owner PII, private documents/evidence/internal notes, unpublished inventory or exact coordinates for approximate/hidden listings.
