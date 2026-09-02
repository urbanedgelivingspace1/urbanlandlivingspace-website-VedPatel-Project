# URBANEDGE LAND SPACE — IMPLEMENTATION ROADMAP

**File:** `12-IMPLEMENTATION-ROADMAP.md`  
**System:** UrbanEdge Land Space V1  
**Status:** Authoritative implementation sequence / coding-agent handoff  
**Launch geography:** Ahmedabad + Gandhinagar, Gujarat  
**Application:** Next.js App Router + TypeScript  
**Database/Auth/Storage:** Dedicated Supabase PostgreSQL/Auth/Storage  
**Deployment target:** Netlify with separate Local / Preview-Staging / Production environments  
**Roadmap date:** 31 August 2026

> **Purpose** — Convert the approved UrbanEdge Land Space architecture into the exact dependency-ordered build sequence a coding agent should follow. Every milestone below has explicit prerequisites, outputs, validation/tests and a definition of completion.
>
> **Implementation rule** — Do not begin a downstream milestone merely because its UI can be mocked. If it depends on a database shape, public/private projection, state transition, RLS policy, storage rule or publication contract, that dependency must be implemented and validated first.
>
> **Schedule rule** — This roadmap deliberately contains no calendar or duration estimates.

---

# 1. Source of Authority

This roadmap derives from the approved architecture set:

1. `01-MASTER-WEBSITE-ARCHITECTURE.md`
2. `02-PAGE-ROUTE-UX-ARCHITECTURE.md`
3. `03-DATABASE-SCHEMA-ARCHITECTURE.md`
4. `04-BACKEND-API-BUSINESS-LOGIC.md`
5. `05-ADMIN-CRM-ARCHITECTURE.md`
6. `06-VERIFICATION-WORKFLOW.md`
7. `07-SEO-ARCHITECTURE.md`
8. `08-SECURITY-PRIVACY-RLS.md`
9. `09-MEDIA-STORAGE-ARCHITECTURE.md`
10. `10-INFRASTRUCTURE-DEPLOYMENT.md`
11. `11-TESTING-QA-PLAN.md`

If implementation reveals a contradiction or a genuinely missing persistent business concept, stop the dependent implementation, write an ADR/schema amendment, add a migration where required, update the affected contract, and only then continue.

Tests must verify the architecture; tests must not silently redefine it.

---

# 2. Non-Negotiable Implementation Invariants

The coding agent must preserve all of the following from the first commit onward.

1. UrbanEdge Land Space is a **new, independent Next.js + TypeScript modular monolith**.
2. It uses a **dedicated Supabase project/database**, separate from UrbanEdge Living Space.
3. Public pages are **server-rendered by default**.
4. Client Components are used only where browser interaction requires them.
5. Public and admin routes remain separate.
6. Public code consumes **explicit public-safe projections**.
7. Exact private coordinates are never sent to the browser for `APPROXIMATE` or `HIDDEN` listings.
8. Owner PII, private documents, verification evidence and internal notes remain private.
9. RLS is mandatory.
10. Service-role credentials remain server-only.
11. Public forms mutate business state through server-owned actions/handlers; they do not receive broad anonymous table-write permissions.
12. Property publication and availability are separate state dimensions.
13. Draft validation and publication validation are separate.
14. Owner submissions never auto-publish.
15. Site-visit requests never auto-confirm.
16. Verification is scoped, evidence-backed and dated; no universal `verified = true` concept is introduced.
17. PostgreSQL is the V1 search engine.
18. Search state is URL-based, shareable and server-readable.
19. Public listing content must be present in initial HTML.
20. Public and private storage responsibilities remain separate.
21. Important admin mutations are audited.
22. Email/analytics/provider failure must not roll back already committed durable business state.
23. Synthetic test/staging data must never be written to production.
24. No paid service is silently enabled.
25. No production database migration is triggered blindly by a Git push.

---

# 3. Execution Model

## 3.1 Default build mode: serial

This roadmap is intentionally written as a **single dependency-ordered stream**.

Do not split database, RLS, property, CRM, media, verification, search or SEO implementation into parallel tracks before their shared contracts are frozen.

The default dependency chain is:

```text
M0 Architecture Lock
  ↓
M1 Foundation / Tooling / Test Bootstrap
  ↓
M2 Database & Migrations
  ↓
M3 Server Contracts / Public Projections
  ↓
M4 RLS / Authorization Data Boundary
  ↓
M5 Admin Authentication
  ↓
M6 Property CRUD
  ↓
M7 Media & Private Storage
  ↓
M8 Verification
  ↓
M9 Publication Gate / Public Projection Freeze
  ↓
M10 Public Property Experience
  ↓
M11 Search
  ↓
M12 CRM Core
  ↓
M13 Public Inquiry / Requirement Conversions
  ↓
M14 Site Visits
  ↓
M15 Sell Your Land
  ↓
M16 Content / SEO
  ↓
M17 Security Hardening
  ↓
M18 Full QA / Release Qualification
  ↓
M19 Deployment Preparation / Staging Gate
```

## 3.2 What may be parallelized

Only work that does **not** depend on an unsettled contract may run in parallel.

Examples that are safe only after the relevant milestone has frozen its contract:

- visual styling of already-defined components;
- copy/content entry against a stable route/data shape;
- additional unit tests against a frozen service contract;
- documentation/runbook work;
- accessibility refinements that do not alter business state.

Examples that must **not** be parallelized ahead of dependencies:

- property UI before property schema and publication rules are complete;
- public property pages before public-safe DTOs/projections and RLS are proven;
- verification UI before verification/evidence storage rules are implemented;
- Sell Your Land document handling before private storage authorization exists;
- CRM forms before lead/requirement/activity state machines exist;
- SEO structured data before public property/location projections are frozen;
- search filters before normalized fields and indexes exist.

---

# 4. Coding-Agent Stop Rules

The coding agent must stop the current downstream feature and resolve the contract first if any of these occur:

- a required table/column/relation does not exist in the approved schema;
- a required business state has no defined transition rule;
- public output requires a private field to be fetched and hidden client-side;
- a storage workflow requires private objects to be public;
- an anonymous form appears to require direct table insert permission;
- a publication rule cannot be implemented without inventing new semantics;
- SEO needs persistent redirect history or another new persistent model not yet represented;
- a provider requires a paid plan not already approved;
- a production-only action is required before the owner approval gate.

Do **not** solve these by:

- ad hoc JSON blobs;
- client-side flags;
- hard-coded exceptions;
- disabling RLS;
- exposing service-role keys;
- using fake placeholder production data;
- weakening the publication gate;
- converting a server-owned mutation into direct browser CRUD.

---

# 5. Milestone Summary

| Milestone | Name | Primary dependency | Exit gate |
|---|---|---|---|
| M0 | Architecture lock | Approved docs | No unresolved implementation-affecting contradiction |
| M1 | Foundation/tooling/test bootstrap | M0 | Clean local app + CI skeleton + production test guard |
| M2 | Database/migrations | M1 | Full clean migration + constraint suite passes |
| M3 | Server contracts/public projections | M2 | Typed DTO/query/state contracts compile and leak-safe projections exist |
| M4 | RLS/authorization data boundary | M3 | Actor-matrix RLS tests pass |
| M5 | Admin authentication | M4 | Active admin can enter; all others are blocked |
| M6 | Property CRUD | M5 | Draft inventory lifecycle works with audit and constraints |
| M7 | Media/private storage | M6 | Public media and private document boundaries proven |
| M8 | Verification | M7 | Scoped evidence workflow works without unsafe public claims |
| M9 | Publication gate | M8 | Atomic publish/unpublish/availability workflow proven |
| M10 | Public property experience | M9 | Public-only SSR property discovery/detail is functional |
| M11 | Search | M10 | URL-based PostgreSQL search is complete and bounded |
| M12 | CRM core | M11 | Lead/requirement/activity pipeline works with controlled transitions |
| M13 | Public demand conversions | M12 | Inquiry/requirements/contact events reliably enter CRM |
| M14 | Site visits | M13 | Request → manual confirmation → outcome lifecycle works |
| M15 | Sell Your Land | M14 | Owner submission → review → draft conversion works, never auto-publishes |
| M16 | Content/SEO | M15 | Canonical/indexing/structured-data/content gates pass |
| M17 | Security hardening | M16 | Security/privacy regression suite passes |
| M18 | Full QA | M17 | P0/P1 release gates pass in staging-quality environment |
| M19 | Deployment preparation | M18 | Production-ready checklist complete; launch remains approval-gated |

---

# 6. M0 — Architecture Lock and Implementation Ledger

## Objective

Translate the approved architecture into an implementation ledger before changing application code.

This milestone prevents later feature code from making local decisions that contradict shared architecture.

## Prerequisites

- Approved architecture documents 01–11 are available.
- No implementation branch is treated as authoritative over the architecture.

## Outputs

Create or confirm:

```text
docs/
  architecture/
  adr/
  runbooks/
```

Create an implementation ledger containing:

- authoritative route map;
- authoritative table inventory;
- authoritative enum/state catalogue;
- public/private field classification;
- public DTO/projection inventory;
- admin-only DTO inventory;
- state-machine list:
  - property publication;
  - property availability;
  - owner submission;
  - lead;
  - site visit;
  - verification;
  - guide/content;
- storage classification:
  - public listing media;
  - private owner/legal documents;
- provider boundary list:
  - email;
  - anti-bot;
  - maps;
  - analytics;
  - future search;
- production approval gates;
- known architecture additions that require explicit ADR/migration rather than ad hoc code.

Record that the SEO architecture may require a persistent redirect-history mechanism. Do not invent its storage during feature implementation; resolve it through a controlled schema amendment in M16 if it is not already present.

## Validation / tests

Perform an architecture consistency review:

- every public route has an identified public data source;
- every admin route has an identified authorization boundary;
- every public mutation has a server-owned path;
- every private document path is private;
- every exact coordinate source is classified private;
- every workflow maps to existing tables/states;
- no V1 feature requires buyer accounts, seller dashboards, payment, in-app chat, automatic calendar booking, external search or microservices.

## Definition of completion

M0 is complete only when:

- [ ] the implementation ledger exists;
- [ ] all architecture documents are referenced;
- [ ] no unresolved contradiction affects the next milestone;
- [ ] all known required schema concepts are either already approved or explicitly marked for later ADR;
- [ ] the coding agent has a single authoritative route/state/data map.

**Do not begin M1 if an architecture contradiction could change repository, database or security structure.**

---

# 7. M1 — Repository Foundation, Tooling and Test Bootstrap

## Objective

Create the stable project shell and quality harness before domain implementation.

Testing starts here. Full QA happens later, but the project must be testable and production-safe from the beginning.

## Prerequisites

- M0 complete.

## Outputs

### Repository/application foundation

Establish the approved structure:

```text
app/
  (public)/
  (admin)/
  api/
components/
features/
lib/
  supabase/
  validation/
  seo/
  privacy/
  formatting/
server/
  actions/
  queries/
  services/
  integrations/
types/
config/
supabase/
  migrations/
  seed/
tests/
  unit/
  integration/
  e2e/
docs/
public/
```

Configure:

- Next.js App Router;
- TypeScript strictness appropriate to production code;
- linting;
- formatting;
- path aliases;
- server-only module boundaries;
- environment parser/validator;
- `.env.example` with variable names only;
- global public layout shell placeholder;
- admin route-group placeholder;
- error/not-found foundations.

### Test foundation

Install/configure the approved test layers:

- unit test runner;
- component test support;
- Playwright E2E scaffold;
- accessibility tooling;
- local Supabase test/bootstrap helpers;
- test data builders;
- scripts for:
  - lint;
  - typecheck;
  - unit;
  - component;
  - integration;
  - E2E;
  - build;
  - full QA.

### Production-safety test bootstrap

Before any data-writing tests exist, implement a test bootstrap that refuses to run destructive/integration fixtures when the environment identifies production.

At minimum, refuse when:

- `APP_ENV=production`;
- Supabase project reference matches production;
- canonical production URL is present in a test-target variable;
- an explicit test-only safety token is absent where the project chooses to use one.

### Initial CI

Create CI steps that can already run:

```text
install
→ lint
→ typecheck
→ unit
→ component
→ build
```

Database/integration/E2E stages may be placeholders until later milestones, but the pipeline structure must exist.

## Validation / tests

- fresh clone installs cleanly;
- `npm run lint` passes;
- `npm run typecheck` passes;
- baseline unit test passes;
- baseline component test passes;
- baseline production build passes;
- test bootstrap intentionally fails against a production-shaped configuration;
- server-only import guard prevents privileged modules from entering client components;
- root public/admin route groups compile.

## Definition of completion

M1 is complete only when:

- [ ] a fresh clone can build without manual source edits;
- [ ] environment variables are validated;
- [ ] no secret is committed;
- [ ] CI skeleton runs;
- [ ] test bootstrap refuses production;
- [ ] application route groups match the approved public/admin separation;
- [ ] domain feature work can be added without reorganizing the repository.

---

# 8. M2 — Database Schema, Migrations, Reference Data and Constraints

## Objective

Implement the approved PostgreSQL/Supabase schema as migration-controlled source of truth before feature code depends on it.

This milestone is the main schema freeze for V1 business features.

## Prerequisites

- M1 complete.
- Local Supabase or an equivalent disposable PostgreSQL/Supabase test environment works.

## Outputs

## 8.1 Migration discipline

Create ordered SQL migrations for:

- required PostgreSQL extensions;
- enums;
- tables;
- foreign keys;
- check constraints;
- unique constraints;
- indexes;
- sequences/functions;
- timestamp/update helpers;
- reference data structures;
- approved seed/reference data.

Do not make manual dashboard edits the schema source of truth.

## 8.2 Implement the authoritative V1 table inventory

Implement the database architecture's tables in dependency order.

### Geography/reference

```text
countries
states
districts
subdistricts
places
localities
geography_aliases

planning_authorities
development_plan_zones
tp_schemes
tp_plots
gidc_estates
area_units
area_conversion_rules
source_references
```

### Property/inventory

```text
properties
property_offers
property_parcels
parcel_identifiers
property_locations
property_planning_context

property_agricultural
property_na
property_industrial

property_attribute_definitions
property_attribute_options
property_attribute_values

parties
property_parties
property_source_links
```

### Media/documents

```text
media_assets
private_documents
owner_submission_documents
```

### Verification

```text
verification_check_definitions
property_verifications
verification_evidence
```

### Owner submission

```text
owner_submissions
```

### CRM

```text
leads
lead_requirements
lead_properties
lead_activities
site_visits
```

### Content/SEO/admin

```text
guide_categories
guides
seo_pages
admin_profiles
app_settings
```

### Analytics/audit

```text
analytics_events
audit_logs
```

If the approved database document contains additional implementation details for a table, follow that document rather than this summary.

## 8.3 Property identity

Implement concurrency-safe property code generation:

```text
UE-LS-000001
```

Requirements:

- sequence-backed;
- immutable;
- unique;
- not generated client-side;
- never reused.

## 8.4 Geography and units

Seed only approved/reference-safe data.

Local/staging may include synthetic service-area fixtures.

Production seed is limited to:

- required configuration;
- verified geography/reference data;
- approved public settings/defaults.

Do not seed fake properties, owners, leads, documents or testimonials into production.

## 8.5 Constraint implementation

At minimum enforce:

### Properties

- property-code format/uniqueness;
- case-insensitive public slug uniqueness;
- positive area values;
- authoritative area provenance requirements;
- publication/archive consistency.

### Offers

- one active offer per property/transaction;
- one active primary offer;
- `EXACT_TOTAL`, `PRICE_RANGE`, `PER_UNIT`, `PRICE_ON_REQUEST` rules;
- non-negative monetary values;
- term ordering.

### Parcels/identifiers

- valid sequence numbers;
- controlled uniqueness where source permits;
- no accidental universal uniqueness assumption for government references.

### Media

- relational support for one active cover per property.

### Lead/property

- no duplicate `(lead_id, property_id)`.

### Owner submission

- unique submission reference;
- one converted property relationship;
- converted-state consistency.

### Verification

- evidence linkage integrity.

### Site visit

- relationship integrity and timestamp consistency where enforced at DB level.

## 8.6 Index baseline

Add indexes required by approved query shapes:

- publication/availability;
- geography;
- property code;
- slug;
- offer transaction/price;
- media by property/order;
- lead activity timeline;
- follow-up dates;
- submission status;
- visit status/date;
- verification property/check;
- content publication.

Search-specific tuning can add index migrations in M11 after real query plans are available, but must not change business semantics.

## Validation / tests

Automate:

```text
clean database
→ apply all migrations from zero
→ seed safe reference fixtures
→ run database tests
```

Test:

- every constraint listed above;
- foreign-key behavior;
- no unexpected cascade deletion of business history;
- archive semantics;
- UUID generation;
- property code concurrency;
- UTC timestamp storage;
- Asia/Kolkata date/time round-trips;
- migration reset from zero.

For data-changing later migrations, also test:

```text
known prior schema + representative data
→ apply migration
→ assert preservation/transformation
```

## Definition of completion

M2 is complete only when:

- [ ] the full approved V1 schema exists as migrations;
- [ ] `supabase db reset` or equivalent clean rebuild succeeds;
- [ ] reference seeds are safe and repeatable;
- [ ] database constraint tests pass;
- [ ] property IDs are concurrency safe;
- [ ] destructive cascade behavior has been tested;
- [ ] no feature needs an unapproved table/column to begin M3;
- [ ] production synthetic-data seeding is impossible by default.

**Schema freeze gate:** downstream milestones may add controlled indexes or explicitly approved additive migrations, but must not invent new persistent business concepts without ADR/schema amendment.

---

# 9. M3 — Server Data Contracts, State Machines and Public-Safe Projections

## Objective

Define the server-side trust boundary and stable data contracts before enabling public/admin data access.

RLS needs to protect a known set of resources; UI needs stable DTOs; therefore these contracts come before feature pages.

## Prerequisites

- M2 complete.

## Outputs

## 9.1 Supabase client boundaries

Implement distinct helpers for:

- browser-safe public Supabase client, only where genuinely needed;
- server authenticated client;
- server privileged/service-role client;
- test actor clients.

Privileged client modules must be server-only.

## 9.2 Typed query/service boundaries

Create initial domain modules under:

```text
server/queries/
server/services/
features/*/
```

Do not build a generic repository layer.

Implement stable types for:

- public property card;
- public property detail;
- public media;
- public verification summary;
- public location;
- public geography selectors;
- admin property detail;
- admin lead/submission/verification models;
- safe settings.

## 9.3 Explicit public-safe projections

Create public views/query projections for intentionally public data.

Public property output may include only approved fields such as:

- published property identity;
- title/description;
- land category;
- public transaction/price presentation;
- public area;
- approved geography;
- public-safe location coordinates;
- availability;
- approved media;
- approved verification summaries;
- public SEO fields.

It must exclude:

- owner PII;
- exact private coordinates unless `EXACT` is intentionally public;
- private document object paths;
- verification evidence;
- internal notes;
- confidential commercial values;
- audit/admin metadata.

## 9.4 Location privacy transformer

Implement a single server-owned location projection rule:

```text
EXACT
→ approved public exact point may be returned

APPROXIMATE
→ only public approximate point/text may be returned

HIDDEN
→ no public coordinates
```

The private exact coordinates must never be loaded into a client DTO and removed later.

## 9.5 State machines

Implement pure, unit-testable transition definitions for:

- property publication;
- property availability;
- lead pipeline;
- owner submission;
- site visit;
- verification/content states where transition controls are required.

The browser must not decide valid transitions.

## 9.6 Validation schemas

Create shared server-side validation schemas for:

- property draft edits;
- offers;
- category-specific data;
- location;
- media metadata;
- verification edits;
- leads/requirements;
- site visits;
- owner submissions;
- public forms.

Frontend validation may reuse compatible schemas, but server validation is authoritative.

## Validation / tests

Unit test:

- public location projection;
- price formatting/modes;
- area conversion;
- state-machine allowed/denied transitions;
- public DTO serialization;
- server-only module boundaries.

Integration test public projections against canary data containing obvious private markers:

```text
PRIVATE_OWNER_EMAIL_CANARY
PRIVATE_EXACT_LAT_CANARY
PRIVATE_DOC_PATH_CANARY
INTERNAL_NOTE_CANARY
```

Assert those markers never appear in public projection results.

## Definition of completion

M3 is complete only when:

- [ ] public DTOs/projections are explicit;
- [ ] admin DTOs are separate;
- [ ] exact-coordinate projection is centralized and tested;
- [ ] state machines are executable code, not comments;
- [ ] validation schemas exist for upcoming mutations;
- [ ] privileged clients are server-only;
- [ ] public canary leakage tests pass.

---

# 10. M4 — RLS, Grants and Authorization Data Boundary

## Objective

Enforce least privilege at the database layer before any real admin or public feature depends on it.

## Prerequisites

- M3 complete.
- Public and admin data contracts are known.

## Outputs

## 10.1 Enable RLS

Enable RLS on every application table exposed through Supabase.

Use deny-by-default grants/policies.

## 10.2 Actor model

Support testable actor contexts:

```text
ANON
AUTHENTICATED_NON_ADMIN
INACTIVE_ADMIN
ACTIVE_ADMIN
SERVER_PRIVILEGED
```

V1 remains a single-active-admin operating model, but policy structure stays future-compatible.

## 10.3 Anonymous read policy

Anonymous users may read only intentionally public-safe resources such as:

- published property projections;
- approved public media metadata;
- active public geography;
- published guides;
- published/approved SEO pages;
- approved public settings;
- public verification summaries.

## 10.4 Anonymous direct write denial

Direct anonymous insert/update/delete must be denied for business tables including:

- `leads`;
- `lead_activities`;
- `owner_submissions`;
- `site_visits`;
- `properties`;
- publication state;
- verification;
- private document metadata;
- audit logs;
- admin profiles.

Public forms will use server-owned mutation paths later.

## 10.5 Admin policy

An authenticated identity must also satisfy the active admin-profile rule.

Do not trust client-supplied `isAdmin` state.

Active admin may access only the admin resources allowed by architecture; audit logs remain append-only/read-only through trusted paths as designed.

## 10.6 Private data denial

Anonymous and non-admin identities must be unable to read:

- parties/private PII;
- owner submissions;
- leads;
- lead activities;
- private documents;
- private exact coordinates;
- verification evidence;
- internal verification notes;
- audit logs;
- unpublished properties;
- private settings.

## 10.7 Trusted audit path

Implement a server-owned audit writer; direct client modification of audit history remains denied.

## Validation / tests

Run the full RLS actor matrix directly against Supabase/PostgreSQL policies.

Required negative tests include:

- guessed property UUID for unpublished inventory;
- guessed lead UUID;
- guessed submission UUID;
- guessed private document metadata ID;
- guessed verification evidence ID;
- guessed exact-location row;
- authenticated non-admin trying admin writes;
- inactive admin trying admin writes;
- attacker-supplied admin-like client field;
- direct attempt to update publication status;
- direct attempt to modify audit log.

Public projection tests must prove:

- only approved columns are returned;
- `APPROXIMATE` and `HIDDEN` never return private exact coordinates;
- unpublished rows do not appear;
- private document paths do not appear.

## Definition of completion

M4 is complete only when:

- [ ] all application tables have intended RLS posture;
- [ ] direct anonymous business writes are denied;
- [ ] non-admin authenticated users cannot gain admin access;
- [ ] inactive admin access is denied;
- [ ] public reads expose only approved projections;
- [ ] audit history cannot be client-edited;
- [ ] the RLS negative-test matrix passes.

**Do not build privileged admin workflows before this milestone passes.**

---

# 11. M5 — Admin Authentication and Admin Shell

## Objective

Create the authenticated operational boundary that all private workflows will use.

## Prerequisites

- M4 complete.

## Outputs

## 11.1 Supabase Auth

Implement:

- `/admin/login`;
- sign-in;
- sign-out;
- session refresh behavior;
- server-side session retrieval;
- active `admin_profiles` authorization check.

## 11.2 Authorization helper

Create one reusable server authorization primitive:

```text
requireActiveAdmin()
```

It should return the trusted admin identity or fail securely.

Every admin Server Action/service uses this boundary.

Do not scatter fragile role checks across components.

## 11.3 Admin route protection

Protect `/admin/...` at the server/route boundary.

Middleware may be used narrowly if justified, but the actual privileged operation must still authorize server-side.

## 11.4 Admin shell

Implement:

- dark top bar;
- light/collapsible sidebar;
- admin navigation groups;
- account/session controls;
- authenticated layout;
- unauthorized/session-expired states;
- mobile-operational shell.

Initial navigation may link to placeholders only for routes whose feature milestone is not complete.

## 11.5 Admin audit/auth observability

Record safe auth/admin authorization failures as operational logs.

If login/logout audit events are part of the approved audit implementation, record them through the trusted audit path.

## Validation / tests

Integration/component/E2E:

- active admin can log in;
- active admin can load `/admin/dashboard`;
- anonymous is rejected/redirected;
- authenticated non-admin is rejected;
- inactive admin is rejected;
- session expiry does not expose cached private data;
- logout clears admin access;
- admin layout does not appear in public routes;
- browser bundle does not contain service-role key.

## Definition of completion

M5 is complete only when:

- [ ] Supabase Auth works end-to-end;
- [ ] active admin-profile authorization is enforced server-side;
- [ ] all non-authorized actor tests pass;
- [ ] admin shell is usable on desktop/mobile;
- [ ] future admin features have one standard authorization boundary.

---

# 12. M6 — Property Domain Services and Admin Property CRUD

## Objective

Implement the curated inventory system as an admin-only workflow before exposing it publicly.

This milestone creates and edits drafts; it does not weaken publication requirements simply because media/verification come later.

## Prerequisites

- M5 complete.
- Property schema/state contracts from M2–M3 are frozen.

## Outputs

## 12.1 Property server services

Implement:

- create property draft;
- read admin property;
- update property draft;
- archive/restore where approved;
- edit classification;
- edit geography;
- edit location visibility and coordinates;
- edit area/unit data;
- edit offers/pricing;
- edit parcels/identifiers;
- edit planning context;
- edit Agricultural extension;
- edit NA extension;
- edit Industrial extension;
- manage property parties/source links;
- change availability through controlled transition;
- generate/update public slug under approved rules;
- write audit entries for sensitive changes.

## 12.2 Draft validation

Allow incomplete drafts where architecture allows them.

Do not equate:

```text
record can be saved
```

with:

```text
record can be published
```

## 12.3 Admin UI

Implement:

```text
/admin/properties
/admin/properties/new
/admin/properties/[id]
/admin/properties/[id]/edit
```

Include:

- searchable/filterable inventory list;
- Property ID;
- category;
- transaction;
- location;
- area;
- price/POR;
- availability;
- publication;
- verification placeholder/state summary;
- media placeholder/state summary;
- updated date.

Property edit/detail should be organized around stable domain sections.

## 12.4 Publication action placeholder

The admin may see publication readiness, but `Publish` must remain blocked until the complete publication gate is implemented in M9.

Do not add a temporary unsafe publish bypass.

## 12.5 Concurrency

Use optimistic concurrency/version checking where the backend architecture requires protection against overwriting important admin edits.

## Validation / tests

Unit/integration:

- property code generation;
- create draft;
- edit every shared field group;
- category-specific table consistency;
- offers invariant;
- parcel relation integrity;
- location visibility update;
- availability transitions;
- archive behavior;
- audit creation for sensitive mutations;
- invalid client-supplied admin/status fields rejected;
- draft can be incomplete;
- publish remains blocked when readiness dependencies are missing.

Component/E2E:

- admin creates Agricultural draft;
- admin creates NA draft;
- admin creates Industrial draft;
- admin edits price/area/location;
- admin sees validation errors without losing valid input;
- anonymous cannot call property mutation actions.

## Definition of completion

M6 is complete only when:

- [ ] full admin draft CRUD works for all three land categories;
- [ ] offers/parcels/location/category extensions persist correctly;
- [ ] audit records exist for sensitive changes;
- [ ] availability is controlled separately from publication;
- [ ] no public route can expose a draft;
- [ ] no temporary publication bypass exists;
- [ ] property CRUD integration tests pass.

---

# 13. M7 — Media, Public Storage and Private Document Storage

## Objective

Implement storage security and media operations before verification and Sell Your Land rely on files/documents.

## Prerequisites

- M6 complete.
- Property identity exists.
- Admin auth/RLS are proven.

## Outputs

## 13.1 Storage buckets

Create separate storage responsibilities for:

- approved public/controlled listing media;
- private owner/legal/verification documents.

Bucket names and policies must be environment-specific configuration, not hard-coded secrets.

## 13.2 Public media upload pipeline

Implement server-owned upload handling:

```text
authorize
→ validate payload/file
→ inspect type
→ enforce size
→ sanitize/transform where applicable
→ strip sensitive EXIF where required
→ checksum
→ generate server-owned immutable object path
→ upload
→ persist media metadata
→ approve/associate/order/cover
```

Support V1 media:

- images;
- brochure/PDF where approved public;
- safe external video URLs;
- drone video URLs;
- 360 URLs.

Do not force large video binaries into Supabase Storage.

## 13.3 Private document pipeline

Private documents:

- remain in a private bucket;
- use server-owned paths;
- are never exposed through a permanent public URL;
- are accessed only after authorization;
- use short-lived signed URLs when operational access is required;
- record sensitive access where required by audit policy.

## 13.4 Media admin

Implement:

```text
/admin/properties/[id]/media
/admin/media
```

Capabilities:

- upload;
- reorder;
- choose cover;
- archive/remove;
- public/private classification;
- preview;
- detect failed/unused media.

## 13.5 Immutability/rollback

Do not overwrite public media objects in place when stable immutable paths are the approved model.

Prefer:

```text
old object archived
new object activated
```

## Validation / tests

Test:

- allowed MIME types;
- disallowed MIME/type spoofing;
- file-size limits;
- checksum duplicate behavior;
- EXIF stripping where applicable;
- server-owned paths;
- one-cover invariant;
- reorder;
- archived media exclusion;
- unauthorized private access denied;
- signed URL expires;
- anonymous cannot list private bucket;
- private document path never enters public property projection;
- public media still loads through public-safe path;
- malformed external video/360 URL rejected.

## Definition of completion

M7 is complete only when:

- [ ] public and private storage are separate;
- [ ] upload validation is server-owned;
- [ ] public media can be ordered/covered safely;
- [ ] private documents require authorization;
- [ ] signed private access is short-lived;
- [ ] private storage regression tests pass;
- [ ] public media rollback strategy works.

---

# 14. M8 — Verification Workflow and Verification Admin

## Objective

Implement scoped, evidence-backed verification now that properties and private evidence storage exist.

## Prerequisites

- M7 complete.
- Verification schema is available.
- Private documents are protected.

## Outputs

## 14.1 Verification definitions

Seed/configure approved scoped checks such as:

- revenue records reviewed;
- VF7/VF8A/VF6 where applicable;
- registration records reviewed;
- encumbrance/search reviewed;
- NA order reviewed;
- planning/TP checks;
- GIDC records reviewed;
- location reviewed;
- site visit completed;
- survey/mapni evidence reviewed;
- legal review completed;
- access evidence reviewed;
- litigation/government-claim screening where approved.

Definitions remain configurable and category-aware.

## 14.2 Verification service

Implement:

- start/in-review/update verification;
- attach evidence;
- record source/provenance;
- reviewer;
- reviewed date;
- risk;
- scope statement;
- internal notes;
- referral/professional-review requirement;
- recheck/expiry where designed;
- approved public label/explanation;
- public visibility toggle under rules.

Do not introduce:

```text
property.verified = true
```

## 14.3 Evidence distinctions

Preserve distinctions between:

- owner-provided;
- reviewed;
- source-verified;
- professional review.

Superseded/expired/revoked evidence must not silently continue supporting a current public claim.

## 14.4 Admin UI

Implement:

```text
/admin/verification
/admin/verification/queue
/admin/verification/[property-id]
/admin/properties/[id]/verification
```

Show:

- check;
- status;
- evidence;
- reviewer;
- date;
- risk;
- scope;
- internal notes;
- public wording;
- referral requirement;
- recheck state.

## 14.5 Public-safe verification projection

Implement only approved labels/explanations.

Public verification output must not contain:

- raw evidence;
- private documents;
- source metadata that is private;
- internal reviewer notes;
- broad legal-certainty claims.

Public legal/verification wording remains subject to the approval requirements stated in the verification architecture.

## Validation / tests

Test:

- each status transition;
- evidence required rules;
- reviewer/date persistence;
- risk/referral fields;
- expired check behavior;
- blocked public claim when evidence is missing/invalid;
- public explanation uses approved safe fields only;
- private evidence cannot be read anonymously;
- no generic Verified badge/output;
- NA does not imply automatic development permission;
- GIDC context does not imply freehold ownership;
- review does not imply dispute-free/title guarantee.

## Definition of completion

M8 is complete only when:

- [ ] verification is represented as scoped checks;
- [ ] evidence/provenance/reviewer/date/risk are persisted;
- [ ] private evidence stays private;
- [ ] public wording is an explicit safe projection;
- [ ] professional referral can be represented;
- [ ] unsafe/legal-overbroad claims are blocked;
- [ ] verification tests pass.

---

# 15. M9 — Complete Property Publication Gate and Public Projection Freeze

## Objective

Finish the publication transaction only after property, media and verification dependencies exist.

This milestone is the gate that makes inventory eligible for public discovery.

## Prerequisites

- M6 property CRUD complete.
- M7 media complete.
- M8 verification complete.
- M4 RLS complete.

## Outputs

## 15.1 Publication validator

Implement one authoritative publication-readiness service.

At minimum validate:

- public title;
- category;
- transaction/primary offer;
- area;
- price mode;
- public-safe geography;
- location visibility;
- safe coordinate state;
- availability;
- required category data;
- approved cover/public media;
- required verification/public claim consistency;
- approved public description/copy;
- required disclaimers/configuration;
- SEO/public slug readiness.

Database insert validity is not enough.

## 15.2 Atomic publication service

Implement the approved mutation sequence:

```text
require active admin
→ load current property/admin state
→ validate publication readiness
→ validate sensitive/public projections
→ apply publication transition atomically
→ record published_at/published_by
→ append audit
→ commit
→ revalidate public caches/routes
→ trigger non-critical integrations after commit
```

If the transaction fails, publication must roll back.

## 15.3 Unpublish/archive/availability

Implement controlled actions for:

- unpublish;
- archive;
- restore if approved;
- mark sold;
- mark rented;
- mark leased;
- mark off-market;
- negotiation/other availability states where approved.

Closed inventory must not look available.

## 15.4 Public projection freeze

Freeze the V1 public property DTO contracts here.

After this milestone:

- public pages query the public projection;
- SEO consumes the same safe projection;
- search consumes the same safe property eligibility logic;
- clients do not query base tables and hide fields.

## 15.5 Cache/revalidation

Implement revalidation/invalidation after:

- publish;
- unpublish;
- availability change;
- public media change;
- public verification change;
- relevant SEO field/slug change.

Operational/private pages must not depend on stale public cache behavior.

## Validation / tests

Integration:

- valid property publishes;
- invalid property cannot publish;
- missing cover blocks publication where required;
- invalid location state blocks publication;
- unsafe verification claim blocks publication;
- transaction rolls back on database failure;
- audit exists;
- revalidation failure does not corrupt durable state;
- email/analytics failure after commit does not roll back publication;
- unpublish removes active discovery;
- sold/rented/leased state changes public CTA/eligibility as intended;
- exact/private coordinate canary never appears in public output;
- private document canary never appears.

E2E admin:

```text
draft
→ complete fields
→ add media
→ add verification
→ preview
→ publish
→ public property becomes available
→ change availability
→ public state updates
→ unpublish/archive
```

## Definition of completion

M9 is complete only when:

- [ ] publication is an explicit authorized atomic action;
- [ ] incomplete/unsafe properties cannot publish;
- [ ] public projection is frozen and leak-tested;
- [ ] closed-property states cannot be misrepresented;
- [ ] publication/unpublication revalidation works;
- [ ] no client-side publication bypass exists.

---

# 16. M10 — Public Property Experience

## Objective

Build the public land-discovery experience on top of proven published/public-safe data.

## Prerequisites

- M9 complete.

## Outputs

## 16.1 Public shell

Implement the approved UrbanEdge public shell:

- public header;
- mobile menu;
- footer;
- fonts/design tokens;
- accessible navigation;
- global error/loading states;
- navy/gold UrbanEdge visual system;
- responsive container/section primitives.

## 16.2 Homepage

Implement `/` with:

- product/category/geography proposition;
- search entry;
- quick category/transaction discovery;
- trust/scoped-verification explanation;
- featured public properties;
- Ahmedabad/Gandhinagar discovery;
- Sell Your Land CTA;
- guides placeholder/content slot;
- requirement CTA.

Homepage property data must be public-safe.

## 16.3 Category/transaction discovery shells

Implement initial public pages:

```text
/agricultural-land
/na-land
/industrial-land
/buy
/rent
/lease
```

They may use a simple current-inventory query before the full search UI from M11.

## 16.4 Property detail

Implement:

```text
/properties/[property-slug]
```

Server-render:

- Property ID;
- category;
- transaction;
- title;
- area;
- public price/POR;
- broad public location;
- public media;
- category-specific facts;
- public-safe map state;
- public verification summaries;
- availability;
- related inventory;
- disclaimers;
- inquiry/WhatsApp/call/site-visit entry points.

The CTAs may route to not-yet-complete conversion forms until M13–M14, but must not create business records through temporary unsafe code.

## 16.5 Closed property UX

Implement public behavior for:

- SOLD;
- RENTED;
- LEASED;
- OFF_MARKET or other non-available states.

Replace misleading active CTAs with:

- Find Similar Land;
- Tell UrbanEdge Your Requirement;
- contextual contact paths.

## 16.6 Error/empty/media fallback

Implement:

- true 404 for invalid public slug where policy requires;
- unavailable/closed state;
- image fallback;
- map failure fallback;
- related-properties empty state;
- non-blocking external media failure.

## Validation / tests

Component/E2E:

- homepage SSR has core content;
- property card uses only public fields;
- property detail initial HTML contains core facts before hydration;
- APPROXIMATE label shown correctly;
- HIDDEN location contains no coordinates;
- EXACT uses only approved public point;
- public verification explanations render;
- owner PII not present;
- private document links not present;
- closed-property CTA changes correctly;
- 404 works;
- keyboard navigation works;
- required mobile breakpoints do not overflow;
- primary content remains usable if map fails.

## Definition of completion

M10 is complete only when:

- [ ] public core pages are server-rendered;
- [ ] property detail is the main public qualification surface;
- [ ] public property output uses frozen safe DTOs only;
- [ ] location privacy is represented honestly;
- [ ] closed inventory is not misrepresented;
- [ ] public shell is responsive/accessibility-ready;
- [ ] no public feature requires private base-table access.

---

# 17. M11 — PostgreSQL Search and URL-State Discovery

## Objective

Implement the complete search/results workflow after published property data and public DTOs are stable.

## Prerequisites

- M10 complete.
- Published/public property eligibility is frozen.
- Geography and pricing fields are stable.

## Outputs

## 17.1 Search provider boundary

Define:

```text
SearchProvider
```

Implement:

```text
PostgresSearchProvider
```

Do not add Algolia/Elasticsearch.

## 17.2 Search parser

Implement an allow-listed URL query parser for:

- keyword;
- Property ID;
- district;
- taluka/subdistrict;
- village/locality;
- land category;
- transaction;
- area min/max;
- price/budget where meaningful;
- availability;
- category-specific filters;
- sort;
- page.

Unknown query parameters are not SQL instructions.

## 17.3 Search query

Implement bounded, indexed server-side search:

- published only;
- public-safe only;
- pagination;
- deterministic sort;
- normalized geography relations;
- typed filters;
- exact property-code lookup;
- keyword matching/full-text/trigram only where justified.

## 17.4 Search-specific index migration

Based on representative query plans, add only the indexes/extensions needed for the approved query contract.

This is a controlled performance migration, not a schema redesign.

## 17.5 `/properties`

Implement:

- SSR initial results;
- result count;
- sort;
- desktop filter rail;
- tablet/mobile filter sheet;
- active filter chips;
- Clear All;
- URL-preserving pagination;
- no-result recovery;
- buyer requirement CTA.

## 17.6 Search utility

Implement `/search` and Property ID fast-path behavior.

Do not create an enumeration endpoint that leaks unpublished property existence.

## 17.7 URL normalization

Normalize:

- empty/default parameters;
- duplicate values;
- page=1 behavior;
- stable parameter ordering where the chosen implementation supports it.

SEO index/noindex behavior is finalized in M16.

## Validation / tests

Unit:

- parser allow-list;
- normalization;
- sort;
- page boundaries;
- Property ID detection;
- search state serialization.

Integration:

- only published properties returned;
- unpublished/archived private inventory excluded;
- filter combinations;
- area/price logic;
- POR handling;
- category-specific filters;
- pagination;
- deterministic results;
- bounded query;
- scaled synthetic-data performance;
- no N+1 query pattern.

E2E:

- search from home;
- modify filters;
- refresh preserves state;
- back/forward preserves state;
- mobile filter sheet;
- no-results requirement CTA;
- property ID search.

## Definition of completion

M11 is complete only when:

- [ ] search state lives in URL parameters;
- [ ] V1 search uses PostgreSQL;
- [ ] public results are SSR;
- [ ] pagination is server-side;
- [ ] unpublished/private records cannot be inferred;
- [ ] representative query performance is acceptable;
- [ ] no unbounded/N+1 search query remains.

---

# 18. M12 — CRM Core and Admin Operational Pipeline

## Objective

Build the central internal CRM before public inquiry forms depend on it.

## Prerequisites

- M11 complete.
- Lead/requirement/activity/site-visit schema exists.
- Admin auth and RLS are proven.

## Outputs

## 18.1 Lead service

Implement:

- create lead;
- deduplication rules from backend contract;
- load lead;
- update structured requirement fields;
- controlled stage transition;
- follow-up scheduling;
- close won/lost/nurture;
- structured loss reason;
- assign property links;
- activity append;
- audit sensitive transitions where required.

## 18.2 Requirement service

Implement first-class buyer requirements:

- no property required;
- area range;
- budget;
- transaction;
- category;
- geography;
- intended use;
- matching notes;
- matched/unmatched handling.

## 18.3 Property matching

Implement:

```text
Lead ↔ many Properties
Property ↔ many Leads
```

with explicit match records and timeline activity.

Do not invent AI recommendations; matching is operational/manual in V1.

## 18.4 Admin CRM routes

Implement:

```text
/admin/dashboard
/admin/leads
/admin/leads/pipeline
/admin/leads/[id]
/admin/requirements
/admin/requirements/unmatched
/admin/requirements/[id]
```

Dashboard should answer:

> What needs attention today?

Prioritize:

- new leads;
- overdue follow-ups;
- submissions;
- visits;
- review queues.

## 18.5 Activity timeline

Append operational memory for:

- lead creation;
- contact attempt;
- contacted;
- note;
- requirement update;
- property match;
- site-visit events;
- offer/follow-up;
- status changes;
- loss/close.

Do not use analytics as a shadow CRM.

## Validation / tests

Unit:

- complete allowed/denied lead transition matrix;
- dedupe logic;
- next-follow-up rules;
- close/loss rules.

Integration:

- lead + initial activity created transactionally;
- requirement persisted separately;
- multiple properties can link;
- duplicate link denied;
- transition rollback on failure;
- activity timeline ordering;
- inactive/anonymous actor cannot mutate CRM.

E2E:

- admin opens new lead;
- qualifies requirement;
- matches properties;
- schedules follow-up;
- moves through stages;
- closes won/lost/nurture;
- dashboard counts update.

## Definition of completion

M12 is complete only when:

- [ ] CRM is the single operational lead system;
- [ ] requirements are first-class;
- [ ] state transitions are server-controlled;
- [ ] activity timeline is durable;
- [ ] property matching works;
- [ ] follow-up and loss reasons work;
- [ ] CRM RLS/authorization tests pass.

---

# 19. M13 — Public Inquiry, Buyer Requirement, Contact and Intent Events

## Objective

Connect public conversion actions to the already-working CRM.

## Prerequisites

- M12 complete.
- Public property experience exists.
- Server validation/RLS boundaries exist.

## Outputs

## 19.1 Inquiry server action

Implement the full transaction:

```text
validate
→ abuse/rate-limit checks
→ create/find party as approved
→ create/dedupe lead
→ link property
→ create lead activity
→ commit
→ send email notification
→ record analytics
→ return safe success
```

Email is post-commit.

If email fails:

```text
lead remains durable
→ user receives success if business save succeeded
→ notification failure is logged
```

## 19.2 Buyer requirement form

Implement:

```text
/requirements
/requirements/thank-you
```

Create:

- lead;
- lead requirement;
- initial activity/source context.

No account is required.

## 19.3 Contact form

Implement `/contact` as a shorter general-contact conversion into the CRM using the appropriate inquiry/source type.

## 19.4 WhatsApp/call intent events

Implement:

- WhatsApp link with Property ID context;
- call `tel:` link;
- safe analytics intent events.

A click is an intent signal, not proof of a completed conversation.

## 19.5 Abuse baseline

Public mutations must not wait until M17 to receive basic abuse protection.

Implement now:

- payload validation;
- request-size limits;
- honeypot where used;
- rate limiting;
- idempotency/duplicate-submit protection;
- Turnstile provider boundary where configured;
- safe origin/CSRF behavior consistent with Next.js/server-action architecture.

M17 later performs complete cross-system hardening.

## 19.6 Email provider boundary

Implement provider adapter and safe templates.

Never include private documents or unnecessary sensitive data in notification payloads.

## Validation / tests

Integration:

- valid inquiry creates durable lead/activity/property link;
- duplicate submit behavior is controlled;
- email failure does not rollback lead;
- analytics failure does not rollback lead;
- rate limit blocks abuse without DB insert;
- Turnstile failure blocks when required;
- validation errors create no business state;
- anonymous cannot bypass action and insert directly into CRM tables;
- source/property context preserved.

E2E:

- property inquiry;
- generic buyer requirement;
- contact;
- WhatsApp link includes Property ID;
- call link works;
- success/thank-you states;
- field errors preserve valid input.

## Definition of completion

M13 is complete only when:

- [ ] public demand reliably enters CRM;
- [ ] server-owned actions are the only public business-write path;
- [ ] notification failure cannot corrupt business state;
- [ ] duplicate/abuse controls exist;
- [ ] direct anonymous DB writes remain denied;
- [ ] public confirmation wording does not promise unperformed actions.

---

# 20. M14 — Site Visit Request and Manual Coordination

## Objective

Implement site visits as a CRM-linked operational workflow with manual confirmation.

## Prerequisites

- M13 complete.
- Leads/properties exist.
- Public property pages exist.

## Outputs

## 20.1 Public site-visit request

Implement:

```text
/site-visit
/site-visit/thank-you
```

Capture:

- property context;
- contact/lead context;
- preferred date/time window;
- alternate time where supported;
- note;
- consent.

Public wording must make clear:

> This is a request, not an automatic booking.

## 20.2 Visit service/state machine

Implement controlled transitions:

```text
REQUESTED
→ CONTACTED
→ PROPOSED
→ CONFIRMED
→ COMPLETED
```

with allowed alternate outcomes such as:

- RESCHEDULED;
- CANCELLED;
- NO_SHOW.

No public request may set `CONFIRMED`.

## 20.3 Admin routes

Implement:

```text
/admin/site-visits
/admin/site-visits/calendar
/admin/site-visits/[id]
```

Support:

- today/upcoming;
- follow-up required;
- proposed/confirmed;
- completed/cancelled/no-show;
- outcome;
- next action.

## 20.4 CRM activity integration

Every important visit transition appends the appropriate lead activity.

## Validation / tests

Unit:

- full visit transition matrix;
- date/time validation;
- UTC/Asia-Kolkata display conversion.

Integration:

- request creates/links correct lead/property/visit;
- request does not confirm;
- admin confirms explicitly;
- transition activity recorded;
- invalid transition denied;
- archived/unavailable property behavior follows business rule.

E2E:

```text
property detail
→ request visit
→ thank-you says requested
→ admin sees request
→ admin proposes/confirms
→ admin completes/reschedules/cancels
→ lead timeline updates
```

## Definition of completion

M14 is complete only when:

- [ ] public request never auto-confirms;
- [ ] admin can coordinate full visit lifecycle;
- [ ] visit remains linked to lead and property;
- [ ] timezone handling is correct;
- [ ] visit transitions are tested.

---

# 21. M15 — Sell Your Land Owner Submission and Conversion

## Objective

Implement owner acquisition only after private document storage, property drafts, verification and admin queues exist.

## Prerequisites

- M14 complete.
- M7 private storage complete.
- M6 property draft CRUD complete.
- M8 verification model complete.
- M12 CRM/admin operational shell complete.

## Outputs

## 21.1 Public Sell Your Land wizard

Implement:

```text
/sell-your-land
/sell-your-land/thank-you
```

Use the approved multi-step sequence:

1. Intent
2. Land Type
3. Owner
4. Location
5. Land Area
6. Commercials
7. Property Details
8. Media
9. Documents
10. Consent

No authenticated saved-draft account is required in V1.

Preserve active-session input through validation/re-render.

## 21.2 Submission transaction

Server-owned submission path:

```text
validate
→ abuse checks
→ create/find party
→ create owner submission
→ attach safe uploaded assets/documents
→ create operational activity/notification as designed
→ commit
→ send email after commit
→ return received confirmation
```

A submission is not a property.

## 21.3 Submission admin

Implement:

```text
/admin/submissions
/admin/submissions/[id]
/admin/submissions/[id]/convert
```

Support:

- contact;
- docs requested;
- under review;
- verification pending;
- approved;
- rejected;
- on hold;
- converted;
- closed;
- next action;
- notes;
- private documents.

## 21.4 Controlled conversion

Implement:

```text
submission
→ authorized admin conversion
→ create property DRAFT
→ copy only intended fields
→ keep owner/private docs private
→ select/sanitize public fields
→ choose public location mode
→ save draft
```

Never:

```text
submission
→ published property
```

Conversion uniqueness must be enforced.

## 21.5 Verification handoff

Converted drafts may enter the existing verification workflow.

Do not mark owner-provided documents as professionally/source verified merely because they were uploaded.

## Validation / tests

Unit/integration:

- valid submission persists;
- invalid step data does not create partial business state unless explicitly designed;
- document permissions remain private;
- email failure does not rollback submission;
- duplicate/abuse controls;
- conversion creates one draft only;
- conversion cannot auto-publish;
- copied private owner data does not enter public description/location/media;
- rejected/on-hold state transitions;
- source/provenance distinctions preserved.

E2E:

```text
owner submits land
→ thank-you says received/review
→ admin sees submission
→ requests/reviews docs
→ converts to property draft
→ draft remains unpublished
→ admin completes normal property verification/publication flow
```

## Definition of completion

M15 is complete only when:

- [ ] owner submission is a separate private workflow;
- [ ] private documents remain private;
- [ ] submission conversion is explicit and unique;
- [ ] converted property starts as `DRAFT`;
- [ ] no owner submission wording implies instant publication;
- [ ] full Sell Your Land E2E passes.

---

# 22. M16 — Guides, Locations, SEO and Crawl Control

## Objective

Implement SEO only after public property/search/content behavior is stable so metadata and structured data do not encode unsafe or temporary contracts.

## Prerequisites

- M15 complete.
- Public property/search routes are stable.
- Public projections are frozen.
- Publication/availability behavior is stable.

## 22.1 SEO schema amendment gate

Before coding redirect persistence, check whether the approved schema already has the required persistent redirect-history mechanism.

If not:

```text
write ADR/schema amendment
→ add typed redirect-history table/constraints via migration
→ test migration from zero
→ continue SEO implementation
```

Do not store redirect history in process memory, ad hoc JSON or a mutable settings blob.

No other new SEO persistence concept should be invented without the same controlled process.

## Outputs

## 22.2 Content admin/public routes

Implement the approved content flows needed for V1:

```text
/guides
/guides/[guide-slug]
/guides/category/[category-slug]

/locations/ahmedabad
/locations/gandhinagar
/locations/[city]/[category]

/about
/contact
/terms
/privacy
/disclaimer
```

Admin:

```text
/admin/guides
/admin/locations
/admin/seo
/admin/settings/seo
```

Content publication remains controlled.

## 22.3 SEO modules

Implement:

```text
lib/seo/
  canonical.ts
  metadata.ts
  robots.ts
  structured-data.ts
  breadcrumbs.ts
  indexability.ts
  sitemap.ts
  redirects.ts
  privacy-safe-seo.ts
```

## 22.4 Metadata/canonical

Implement server-rendered:

- title;
- description;
- canonical;
- Open Graph;
- robots;
- breadcrumbs.

Only public-safe data may enter SEO output.

## 22.5 Search URL indexing policy

Search/filter URLs are primarily user-state URLs.

Implement the architecture's rules for:

- noindex/high-cardinality combinations;
- canonical normalization;
- pagination;
- out-of-range 404;
- page=1 normalization.

Do not turn every filter combination into an indexable landing page.

## 22.6 Structured data

Implement only truthful visible structured data such as:

- Organization;
- WebSite;
- BreadcrumbList;
- appropriate property/listing representation;
- FAQ where actually present.

Never emit:

- fake price for `PRICE_ON_REQUEST`;
- false availability;
- private coordinates;
- raw verification/legal claims;
- ratings/reviews not present.

## 22.7 Property lifecycle SEO

Implement correct behavior for:

- slug change → permanent one-hop redirect;
- sold/rented/leased public state;
- archived/unpublished URL policy;
- canonical stability.

## 22.8 Curated location SEO gate

A location/category page becomes indexable only if it satisfies the approved quality gate such as:

- meaningful inventory and/or substantial original content;
- valid canonical;
- useful internal links;
- approved publication/index flag.

Do not generate thin village pages at scale.

## 22.9 Sitemap/robots

Implement:

- canonical sitemap URLs only;
- indexable 200 URLs only;
- admin/private exclusion;
- `robots.txt` with sitemap reference and crawl controls.

## Validation / tests

Technical SEO tests:

- canonical host/path;
- metadata in initial HTML;
- query/filter noindex behavior;
- pagination canonical;
- out-of-range page 404;
- property JSON-LD uses public-safe data;
- approximate/hidden coordinates absent;
- closed availability matches structured data;
- POR emits no fake price;
- slug redirect is permanent one-hop;
- sitemap contains only allowed canonical 200 URLs;
- robots references sitemap;
- `/admin` is not indexable;
- location/category page fails indexability when quality gate fails;
- Open Graph uses public-safe media;
- breadcrumbs visible + structured.

Content tests:

- draft guide not public;
- published guide public;
- risky legal/verification wording follows configured approval workflow.

## Definition of completion

M16 is complete only when:

- [ ] server-rendered metadata exists for indexable pages;
- [ ] canonical/index/noindex rules are deterministic;
- [ ] sitemap/robots are correct;
- [ ] structured data cannot leak private data;
- [ ] closed-property structured data is truthful;
- [ ] slug redirect history is persistent and controlled;
- [ ] thin location SEO is blocked;
- [ ] SEO tests pass.

---

# 23. M17 — Security Hardening and Privacy Regression Closure

## Objective

Perform the full-system security pass after all public/admin workflows exist.

Security fundamentals were implemented earlier; this milestone closes gaps across the assembled system.

## Prerequisites

- M16 complete.
- All public/admin mutation surfaces now exist.

## Outputs

## 23.1 Mutation security review

For every Server Action/Route Handler, verify the sequence:

```text
authenticate where required
→ authorize
→ validate
→ abuse/CSRF/origin checks
→ apply domain rules
→ mutate transactionally
→ audit/activity
→ return safe result
```

Public actions also require appropriate:

- rate limiting;
- payload limits;
- idempotency;
- honeypot/Turnstile controls;
- origin protections.

## 23.2 IDOR review

Attempt guessed IDs across:

- properties;
- unpublished inventory;
- leads;
- submissions;
- private documents;
- verification evidence;
- site visits;
- audit entries;
- media.

Authorization must not depend on hiding links.

## 23.3 Security headers

Configure appropriate production headers including:

- CSP;
- `X-Content-Type-Options`;
- Referrer Policy;
- Permissions Policy;
- frame protection;
- HSTS when production domain/HTTPS policy is ready.

CSP must match actual dependencies and avoid broad unsafe allowances.

## 23.4 XSS/content hardening

Ensure guide/property rich content uses:

- safe structured content/Markdown; or
- robust sanitization.

No arbitrary untrusted HTML rendering.

## 23.5 Secrets/logging

Audit:

- environment variables;
- `NEXT_PUBLIC_*`;
- server/client bundles;
- logs;
- analytics payloads;
- error reporting.

Never log:

- passwords/tokens;
- service keys;
- raw private documents;
- private exact coordinates;
- unnecessary owner PII;
- full sensitive lead payloads.

## 23.6 Private document access

Revalidate:

- authorization;
- signed URL lifetime;
- access audit where required;
- object-path privacy;
- no public indexing.

## 23.7 Exact-location leakage scan

Automate scans over:

- HTML;
- RSC payloads;
- client props/state;
- route-handler responses;
- JSON-LD;
- Open Graph/social metadata;
- analytics payloads;
- source maps/build artifacts where relevant.

## 23.8 Operational health

Implement admin-only health view that exposes state, not secret values:

- database reachable;
- storage reachable;
- public/private bucket configured;
- email configured;
- Turnstile configured;
- site URL;
- analytics;
- map provider;
- migration/environment identity.

## Validation / tests

Run security regression suite:

- RLS actor matrix;
- direct DB/API write denial;
- IDOR;
- exact-location leakage;
- private-document leakage;
- owner PII leakage;
- admin auth bypass;
- inactive admin;
- CSRF/origin;
- rate limit;
- Turnstile;
- payload size;
- malicious content/XSS;
- signed URL expiry;
- audit tampering;
- secret/client bundle scan;
- security-header checks;
- logs do not contain canary secrets/PII.

## Definition of completion

M17 is complete only when:

- [ ] no known exact-location leak exists;
- [ ] no private-document leak exists;
- [ ] no admin authorization bypass exists;
- [ ] public actions have abuse controls;
- [ ] security headers are production-ready;
- [ ] untrusted content is sanitized/structured;
- [ ] secrets stay server-only;
- [ ] logs/analytics are privacy-safe;
- [ ] security regression suite passes.

---

# 24. M18 — Full Testing, Accessibility, Responsive, SEO, Performance and Production-Build Qualification

## Objective

Execute the authoritative QA plan across the complete assembled product.

This is not the first time tests run; it is the first **full release qualification**.

## Prerequisites

- M17 complete.
- All V1 critical workflows implemented.

## Outputs

## 24.1 Static quality gate

Require:

```text
lint
typecheck
production build
```

with zero release-blocking failure.

## 24.2 Unit completion

Ensure coverage of critical pure logic:

- property code;
- price/area;
- public location projection;
- publication blockers;
- lead state machine;
- submission state machine;
- visit state machine;
- verification/public claim rules;
- search normalization;
- SEO canonical/indexability helpers.

## 24.3 Component completion

Test critical UI states:

- property cards/detail;
- filters/sheets;
- forms;
- confirmation/errors;
- admin property forms;
- lead pipeline/detail;
- submission wizard/admin;
- verification display;
- media controls;
- closed-property state.

## 24.4 Database/RLS completion

Run:

- clean migration;
- upgrade-path migration where relevant;
- constraints;
- actor matrix;
- storage policies;
- public projection leakage;
- private document abuse.

## 24.5 Application integration completion

Required integrations:

- publish transaction;
- inquiry transaction;
- email-failure semantics;
- owner submission/conversion;
- site-visit lifecycle;
- CRM transitions;
- verification evidence/public projection;
- media cover/private behavior;
- cache revalidation;
- provider degradation.

## 24.6 E2E critical workflow suite

At minimum:

1. Home.
2. Search.
3. Property detail.
4. Inquiry.
5. WhatsApp.
6. Call.
7. Buyer requirement.
8. Site-visit request.
9. Sell Your Land.
10. Admin login.
11. Create draft property.
12. Add/edit media.
13. Add verification.
14. Publish.
15. Property appears publicly.
16. Lead pipeline.
17. Match property.
18. Site visit manual confirmation.
19. Submission conversion to draft.
20. Sold state.
21. Rented state.
22. Leased state.
23. Unpublish/archive.
24. 404/error state.
25. Exact-coordinate leakage regression.
26. Private-document access regression.

## 24.7 Accessibility

Run automated and manual checks:

- axe on core pages;
- keyboard-only flows;
- visible focus;
- forms/error association;
- modal/sheet focus;
- reduced motion;
- no color-only state;
- touch targets.

No serious/critical unresolved accessibility violation on core release routes.

## 24.8 Responsive

Validate required viewports around the architecture's breakpoint model:

```text
compact mobile
large mobile/small tablet
desktop transition
large desktop
wide desktop
```

Specifically verify:

- mobile search/filter;
- property detail CTA does not cover content;
- Sell Your Land wizard;
- critical admin mobile workflows;
- no unintended horizontal overflow.

## 24.9 SEO

Run the M16 technical suite against a production build/staging deployment.

## 24.10 Performance

Record representative baselines for:

- homepage;
- search results;
- property detail;
- guide/location page;
- admin operational page.

Verify:

- primary content server-rendered;
- no full property dataset shipped client-side;
- responsive image strategy;
- maps/heavy integrations do not block primary content;
- no critical LCP/INP/CLS regression from accepted baseline;
- scaled search remains acceptable;
- no new unbounded query/N+1.

## 24.11 Test data policy

Confirm:

- local/staging data is synthetic;
- no real owner documents;
- no real customer PII;
- no real private coordinates;
- no production CRM dump;
- fixtures are clearly marked DEMO/TEST/STAGING;
- test bootstrap refuses production.

## 24.12 Release report

Produce a release-gate report with only:

```text
PASS
CONDITIONAL HOLD
FAIL
```

Definitions:

### PASS

All P0/P1 gates pass. Remaining P2 items do not create meaningful security/privacy/legal/business misrepresentation.

### CONDITIONAL HOLD

No active P0 leak/bypass, but a required staging, accessibility, performance, editorial/legal, migration/backup or provider validation remains incomplete.

### FAIL

Any P0 failure, meaningful unresolved P1, build failure, migration uncertainty, RLS/privacy failure, exact-location leak, private-document leak, admin auth bypass, misleading closed-property state or uncontrolled SEO/indexing behavior.

## Definition of completion

M18 is complete only when:

- [ ] CI runs required static/unit/component/build gates;
- [ ] clean migration and RLS suites pass;
- [ ] critical E2E suite passes;
- [ ] privacy/security regression passes;
- [ ] accessibility passes release threshold;
- [ ] responsive suite passes;
- [ ] SEO suite passes;
- [ ] performance baseline is recorded/acceptable;
- [ ] production build passes;
- [ ] synthetic data safeguards pass;
- [ ] release decision is `PASS` before M19 is considered production-ready.

---

# 25. M19 — Deployment Preparation, Staging Validation and Production Approval Gate

## Objective

Prepare reproducible infrastructure and staging so production launch is a deliberate approval-gated operation.

This milestone does not silently launch production.

## Prerequisites

- M18 release qualification complete.
- Required owner/service approvals available for infrastructure setup.
- No release-blocking issue remains.

## Outputs

## 25.1 Environment matrix

Establish and verify:

```text
LOCAL
PREVIEW / STAGING
PRODUCTION
```

Rules:

| Configuration | Local | Staging | Production |
|---|---|---|---|
| Supabase | local/dev | separate staging project | separate production project |
| Real business data | no | no | yes |
| Synthetic data | yes | yes | no |
| Production secrets | no | no | yes |
| Real recipients | normally no | controlled | yes |
| Destructive migrations | local only | controlled | approval required |
| Backups | optional | optional | required |

## 25.2 Hosting/preview

Configure:

- Netlify site;
- preview deploys;
- staging environment;
- canonical production domain configuration prepared;
- no blind production DB migration hook.

Every production-bound change should follow:

```text
feature branch
→ PR
→ Netlify Preview
→ staging Supabase migration
→ E2E/accessibility/smoke
→ review
```

## 25.3 Provider configuration

Configure/test approved provider boundaries:

- Supabase;
- email/Resend or approved provider;
- Turnstile;
- MapLibre/OpenFreeMap or approved map provider;
- Google Maps URL handoff;
- analytics;
- DNS/Cloudflare where approved.

No paid/auto-recharge service is enabled without explicit approval.

## 25.4 Secrets/environment

Verify:

- `.env.example` names only;
- no production key in preview/local;
- no secret in `NEXT_PUBLIC_*`;
- environment identity visible to server health checks;
- secret rotation/recovery procedure documented.

## 25.5 Backup and restore

Document and test:

- logical database backup/export;
- checksum;
- secure storage;
- decryptability if encrypted;
- restore into disposable local/staging DB;
- smoke queries after restore;
- result record.

A backup that has never been restored is not considered verified.

## 25.6 Rollback

Document/test:

### Application

- identify/promote previous known-good Netlify deploy;
- verify DB compatibility.

### Database

Prefer forward-compatible migrations.

For failure:

- corrective migration; or
- restore from logical backup where appropriate.

Do not assume code rollback automatically rolls back database state.

### Storage

Use immutable-object/relational-selection rollback.

### Domain

Validate on technical URL before production-domain cutover.

## 25.7 Production migration procedure

Require:

```text
migration reviewed
→ staging migration succeeds
→ backup/export if schema/data risk
→ rollback/correction plan written
→ owner approval
→ controlled production migration
```

A Git push must not directly perform destructive production mutation.

## 25.8 Staging final smoke

Verify:

### Public

- home;
- search;
- representative property;
- closed-property state;
- inquiry/requirement;
- Sell Your Land;
- site visit;
- media;
- map;
- 404;
- canonical/robots/sitemap.

### Admin

- login;
- private page blocked anonymously;
- property edit/publish;
- leads;
- submissions;
- verification;
- site visits;
- audit/health.

### Privacy

- private document protected;
- exact coordinates protected;
- owner PII absent from public payloads.

## 25.9 Production-readiness checklist

Before any production cutover, confirm:

- owner approved service choices;
- account ownership/recovery documented;
- production Supabase project is separate;
- production secrets complete;
- production buckets configured;
- email domain/provider configured;
- Turnstile production site configured;
- map provider configured;
- analytics configured;
- backup/restore verified;
- migration version known;
- rollback target known;
- production technical URL healthy;
- canonical host/DNS plan ready;
- final release report is PASS;
- no accidental paid service/auto-recharge enabled.

## Definition of completion

M19 is complete only when:

- [ ] local, staging and production configurations are separated;
- [ ] staging passes full smoke;
- [ ] production secrets/providers are ready but controlled;
- [ ] backup restore has been tested;
- [ ] rollback is documented/tested;
- [ ] migration procedure is controlled;
- [ ] production health view reveals state, not secrets;
- [ ] owner approval gate is explicit;
- [ ] the system is ready for a deliberate production release without changing architecture.

---

# 26. Cross-Milestone Dependency Rules

The following dependencies are mandatory.

## Database before feature UI

```text
M2 schema
→ M3 server contracts
→ feature services
→ feature UI
```

Never start with a form and invent storage fields afterward.

## Public projection before public page

```text
M3 public DTO
→ M4 RLS
→ M9 publication eligibility
→ M10 public page
```

Never fetch a private row and “hide” sensitive fields in React.

## Admin auth before private workflows

```text
M4 authorization policy
→ M5 authenticated admin
→ M6+ admin mutations
```

## Media before verification documents / owner documents

```text
M7 private storage
→ M8 verification evidence
→ M15 owner document workflow
```

## Verification before final publication

```text
M8 scoped verification
→ M9 publication gate
```

The property draft can exist earlier; publication cannot bypass the verification/public-claim rules.

## Public property before search

```text
M9 public eligibility
→ M10 public property DTO/render
→ M11 search
```

Search must not define a separate, looser public data model.

## CRM before public forms

```text
M12 CRM
→ M13 inquiry/requirements
→ M14 site visits
```

Public conversion forms are adapters into the CRM; they are not separate data silos.

## Property/private storage/verification before Sell Your Land conversion

```text
M6 property draft
+ M7 private docs
+ M8 verification
+ M12 admin workflow
→ M15 Sell Your Land
```

## Stable public behavior before SEO

```text
M9 publication lifecycle
+ M10 public page
+ M11 URL search
→ M16 canonical/indexing/structured data
```

SEO must describe actual product behavior, not anticipated behavior.

## Complete feature surface before final hardening

```text
all public/admin flows
→ M17 full security review
→ M18 release QA
```

---

# 27. Migration Policy During Implementation

After M2, migrations are still allowed, but their purpose is constrained.

## Allowed without business-model redesign

- indexes;
- performance-supporting generated/search columns if already implied by approved search architecture;
- constraints that enforce an already-approved invariant;
- schema corrections discovered by tests;
- controlled SEO redirect-history addition explicitly approved through ADR/schema amendment;
- verification policy additions explicitly required by the approved workflow and recorded through migration/ADR.

## Requires explicit architecture amendment

- new business entity;
- new public/private visibility concept;
- new role/permission model;
- new transaction type;
- new owner/customer account model;
- new property category;
- new publication state;
- new verification semantics;
- new persistent workflow not represented in current architecture.

## Never acceptable as a shortcut

- generic `data jsonb` to avoid schema design;
- client-only status;
- magic string hidden in notes;
- unvalidated settings JSON for business-critical behavior;
- direct production dashboard schema edits.

---

# 28. Testing Is Continuous, Not Deferred

Each milestone exits through tests.

The cumulative test pyramid grows as follows:

```text
M1
  static/unit/component/build bootstrap

M2
  database migration/constraint tests

M3
  DTO/state/projection tests

M4
  RLS actor matrix

M5
  auth E2E

M6
  property CRUD integration/E2E

M7
  storage security/media tests

M8
  verification evidence/public-claim tests

M9
  publication transaction/leakage tests

M10
  public SSR/accessibility/responsive tests

M11
  search parser/query/performance tests

M12
  CRM transition tests

M13
  public conversion/provider-failure tests

M14
  site-visit lifecycle tests

M15
  owner submission/conversion tests

M16
  technical SEO tests

M17
  security/privacy regression

M18
  complete cross-system release qualification

M19
  staging/infrastructure/backup/rollback smoke
```

A milestone is not complete because its screens render. Its business/security tests must pass.

---

# 29. Implementation Deliverable Standard

Every milestone PR should contain, where applicable:

- migrations;
- domain types;
- server validation;
- server queries/services/actions;
- UI/routes;
- audit/activity integration;
- unit tests;
- integration tests;
- component tests;
- E2E coverage for the newly completed workflow;
- architecture/ADR update if a contract changed;
- environment-variable updates in `.env.example`;
- runbook update for operational changes.

Do not merge code that adds a critical mutation without its authorization and failure tests.

---

# 30. Production Data Prohibition During Build

The following must never be used as ordinary development/staging test fixtures:

- real owner documents;
- real legal records;
- real customer/lead PII;
- real private exact coordinates;
- production CRM exports;
- production authentication secrets;
- production service-role key.

Use clearly synthetic data:

```text
DEMO
TEST
STAGING
```

The test harness must actively refuse known production targets.

---

# 31. Feature Completion Order — Concise Coding Agent Checklist

The coding agent should execute in this exact order:

```text
[ ] M0  Lock architecture and implementation ledger.
[ ] M1  Create repository/tooling/test/CI foundation.
[ ] M2  Implement full database schema and migrations.
[ ] M3  Implement typed server contracts, state machines and public projections.
[ ] M4  Implement and prove RLS/authorization data boundaries.
[ ] M5  Implement Supabase admin authentication and private shell.
[ ] M6  Implement admin property draft CRUD and availability lifecycle.
[ ] M7  Implement public media + private document storage/security.
[ ] M8  Implement scoped verification/evidence workflow.
[ ] M9  Implement atomic property publication gate and freeze public property DTO.
[ ] M10 Implement public property/home/category/detail experience.
[ ] M11 Implement PostgreSQL search and URL-based result state.
[ ] M12 Implement CRM leads/requirements/activities/matching/admin pipeline.
[ ] M13 Implement inquiry/requirements/contact/WhatsApp/call conversions.
[ ] M14 Implement site-visit request and manual admin confirmation.
[ ] M15 Implement Sell Your Land and controlled conversion to property DRAFT.
[ ] M16 Implement guides/locations/SEO/canonical/robots/sitemap/structured data.
[ ] M17 Perform full security/privacy hardening.
[ ] M18 Run full testing/QA/accessibility/responsive/SEO/performance/build release gate.
[ ] M19 Prepare staging/infrastructure/backups/rollback and production approval gate.
```

Do not reorder M2–M9.

Do not implement M13 before M12.

Do not implement M15 document/conversion behavior before M7/M8.

Do not finalize M16 SEO before M9–M11 public lifecycle/search behavior is stable.

Do not treat M17 as permission to skip security work in earlier milestones; it is the full-system hardening pass.

---

# 32. Final Definition of Implementation Complete

UrbanEdge Land Space V1 implementation is complete only when the coding agent can prove all of the following together:

### Foundation

- [ ] modular monolith repository structure is stable;
- [ ] strict TypeScript/lint/build gates pass;
- [ ] CI exists;
- [ ] tests refuse production targets.

### Database

- [ ] all approved migrations rebuild from zero;
- [ ] constraints and referential integrity pass;
- [ ] property code generation is concurrency-safe;
- [ ] production seed contains no fake business data.

### RLS/auth

- [ ] RLS actor matrix passes;
- [ ] public can read only public-safe data;
- [ ] direct anonymous business writes are denied;
- [ ] only active admin can operate private workflows;
- [ ] service-role key is server-only.

### Property

- [ ] full property draft CRUD works;
- [ ] availability is separate from publication;
- [ ] publication is explicit, atomic and validated;
- [ ] sold/rented/leased/off-market states are truthful;
- [ ] audit exists for sensitive changes.

### Privacy

- [ ] exact private coordinates do not leak;
- [ ] owner PII does not leak;
- [ ] private documents do not leak;
- [ ] verification evidence/internal notes do not leak.

### Media/verification

- [ ] public/private storage split works;
- [ ] upload validation/security works;
- [ ] verification is scoped/evidence-backed/detailed internally;
- [ ] public claims are safe and limited.

### Public experience/search

- [ ] core public content is server-rendered;
- [ ] property detail uses public-safe projection;
- [ ] PostgreSQL search is URL-driven, paginated and bounded;
- [ ] no-result and closed-property recovery paths work.

### CRM/conversion

- [ ] inquiry enters CRM durably;
- [ ] buyer requirements are first-class;
- [ ] lead stage transitions are enforced;
- [ ] property matching and activity timeline work;
- [ ] site visits are manually confirmed;
- [ ] Sell Your Land creates a private submission and converts only to a draft.

### SEO

- [ ] canonical/index/noindex behavior is deterministic;
- [ ] robots/sitemap are correct;
- [ ] structured data is truthful and privacy-safe;
- [ ] thin location pages cannot index automatically;
- [ ] slug redirects are persistent one-hop redirects.

### Security

- [ ] IDOR, RLS, exact-location, private-document and admin-bypass regression suites pass;
- [ ] CSP/security headers are configured;
- [ ] abuse controls exist on public mutations;
- [ ] secrets/logs/analytics are privacy-safe.

### QA/deployment

- [ ] production build passes;
- [ ] E2E critical workflows pass;
- [ ] accessibility/responsive gates pass;
- [ ] performance baseline is acceptable;
- [ ] staging passes full smoke;
- [ ] backup restore has been tested;
- [ ] rollback procedure is known;
- [ ] production environment is separate;
- [ ] no paid service is enabled without approval;
- [ ] production release remains an explicit owner-approved operation.

The implementation target is therefore:

> **A reproducible, migration-controlled, deny-by-default, server-owned UrbanEdge Land Space V1 where schema and security contracts are fixed before dependent UI, only intentionally published public-safe land can reach search/SEO, CRM and owner workflows preserve durable brokerage history, exact coordinates and private evidence remain private, and every production release is gated by automated QA plus deliberate infrastructure approval.**
