# URBANEDGE LAND SPACE — TESTING & QA PLAN

**File:** `11-TESTING-QA-PLAN.md`  
**System:** UrbanEdge Land Space V1  
**Status:** Authoritative testing, QA and release-gate contract  
**Launch geography:** Ahmedabad + Gandhinagar, Gujarat  
**Application:** Next.js App Router + TypeScript  
**Backend:** Server Components / Server Actions / narrow Route Handlers  
**Database/Auth/Storage:** Dedicated Supabase PostgreSQL/Auth/Storage  
**Deployment target:** Netlify + separate Local / Preview-Staging / Production environments  
**Architecture date:** 31 August 2026

> **Purpose** — Define the complete test strategy for UrbanEdge Land Space V1 from the established architecture. This document is the implementation and release-quality contract for unit, integration, database/RLS, component, end-to-end, accessibility, responsive, SEO, performance, security-regression, resilience and production-build testing.
>
> **Authority** — This plan derives from and must remain compatible with:
>
> - `01-MASTER-WEBSITE-ARCHITECTURE.md`
> - `02-PAGE-ROUTE-UX-ARCHITECTURE.md`
> - `03-DATABASE-SCHEMA-ARCHITECTURE.md`
> - `04-BACKEND-API-BUSINESS-LOGIC.md`
> - `05-ADMIN-CRM-ARCHITECTURE.md`
> - `06-VERIFICATION-WORKFLOW.md`
> - `07-SEO-ARCHITECTURE.md`
> - `08-SECURITY-PRIVACY-RLS.md`
> - `09-MEDIA-STORAGE-ARCHITECTURE.md`
> - `10-INFRASTRUCTURE-DEPLOYMENT.md`
>
> If implementation changes any tested business contract, the underlying architecture must be updated through the normal architecture/ADR process. Tests must not silently redefine product behavior.

---

# 1. QA Executive Position

UrbanEdge Land Space is a curated brokerage platform containing public inventory, private owner information, legal/verification evidence, exact parcel coordinates, CRM data and operational history.

Testing therefore has two equally important jobs:

1. prove that the intended workflows work; and
2. prove that information and operations that **must not be public or allowed** remain inaccessible.

The QA model is:

```text
STATIC QUALITY
    ↓
UNIT
    ↓
COMPONENT
    ↓
DATABASE / CONSTRAINT / RLS
    ↓
APPLICATION INTEGRATION
    ↓
E2E WORKFLOWS
    ↓
SECURITY / PRIVACY REGRESSION
    ↓
ACCESSIBILITY / RESPONSIVE / SEO / PERFORMANCE
    ↓
PRODUCTION BUILD
    ↓
STAGING RELEASE GATE
    ↓
APPROVAL-GATED PRODUCTION
```

No single test layer is sufficient.

A component test cannot prove RLS.  
An RLS test cannot prove a property page has correct CTA behavior.  
An E2E test cannot replace database constraints.  
A Lighthouse score cannot prove exact coordinates are absent from an RSC payload.

---

# 2. Non-Negotiable Testing Invariants

The following are release-blocking invariants.

1. **Automated destructive tests never connect to production.**
2. **Synthetic test data never becomes production inventory, production leads or production private documents.**
3. **Anonymous users cannot read private business tables or storage objects.**
4. **Authenticated non-admin users, if such a fixture exists, receive no admin privileges.**
5. **Inactive/non-authorized admin identities cannot use admin data or mutations.**
6. **Service-role credentials never enter browser bundles, public responses or client-visible environment variables.**
7. **For `APPROXIMATE` and `HIDDEN` properties, exact coordinates never appear in any anonymous response channel.**
8. **Private documents never become public merely because the object path is known.**
9. **Owner submissions never auto-publish.**
10. **Owner-submission conversion always creates a `DRAFT` property.**
11. **Property publication only occurs through the publication service and publish gate.**
12. **Publication and availability remain independent state dimensions.**
13. **`SOLD`, `RENTED`, `LEASED` and `OFF_MARKET` properties never look `AVAILABLE` in public UX or machine-readable SEO data.**
14. **Public verification is a scoped summary; internal evidence and notes never leak.**
15. **CRM stage transitions follow the authoritative state machine and create required activity/audit history.**
16. **A site-visit request is not a confirmed booking.**
17. **Only an authorized admin can confirm a site visit.**
18. **Email/provider failure after a committed business mutation does not erase the saved business record.**
19. **A transaction failure before commit leaves no partial business state.**
20. **Every sitemap URL is a canonical, indexable, successful public URL.**
21. **Search/filter combinations do not become uncontrolled programmatic SEO pages.**
22. **Staging/preview is not indexable.**
23. **A release cannot pass while critical security, privacy, migration, build or E2E failures remain.**
24. **Production database migrations are deliberate deployment steps, not an automatic side effect of a Git push.**

---

# 3. Recommended Test Tooling

The architecture does not require a separate test platform. Keep tooling consistent with the TypeScript/Next.js/Supabase stack.

## 3.1 Baseline

| Concern | Recommended tool |
|---|---|
| Type checking | TypeScript `tsc --noEmit` |
| Lint | ESLint |
| Unit / service tests | Vitest |
| Component tests | React Testing Library + Vitest |
| DOM assertions | `@testing-library/jest-dom` |
| Database migration tests | Supabase CLI + SQL test scripts / `supabase test db` where supported |
| RLS tests | Supabase local/staging database using anon/auth/admin JWT contexts |
| E2E | Playwright |
| Accessibility automation | `@axe-core/playwright` + semantic/manual keyboard checks |
| SEO HTTP/HTML tests | Playwright/APIRequest + HTML/JSON-LD parsing |
| Performance lab checks | Lighthouse CI or scripted Lighthouse |
| Bundle/build checks | `next build` through `npm run build` |
| Secret scanning | repository/CI secret scanner |
| Dependency audit | package manager audit plus reviewed dependency updates |

If the repository already standardizes equivalent tools, keep the existing standard rather than adding redundant frameworks.

## 3.2 Test directory contract

```text
tests/
├── unit/
│   ├── properties/
│   ├── search/
│   ├── pricing/
│   ├── area/
│   ├── privacy/
│   ├── verification/
│   ├── crm/
│   ├── site-visits/
│   ├── media/
│   └── seo/
│
├── components/
│   ├── public/
│   └── admin/
│
├── integration/
│   ├── publication/
│   ├── inquiries/
│   ├── submissions/
│   ├── crm/
│   ├── site-visits/
│   ├── media/
│   ├── verification/
│   └── notifications/
│
├── db/
│   ├── migrations/
│   ├── constraints/
│   ├── rls/
│   ├── storage/
│   └── concurrency/
│
├── e2e/
│   ├── public/
│   ├── admin/
│   ├── workflows/
│   ├── seo/
│   ├── security/
│   ├── accessibility/
│   └── responsive/
│
├── fixtures/
│   ├── properties/
│   ├── users/
│   ├── submissions/
│   ├── leads/
│   ├── documents/
│   └── media/
│
└── helpers/
    ├── auth/
    ├── db/
    ├── storage/
    ├── privacy/
    └── assertions/
```

---

# 4. Test Classification and Execution Cadence

| Suite | Local | Every PR | Staging | Pre-release | Production smoke |
|---|---:|---:|---:|---:|---:|
| Lint | ✓ | ✓ | — | ✓ | — |
| Typecheck | ✓ | ✓ | — | ✓ | — |
| Unit | ✓ | ✓ | — | ✓ | — |
| Component | ✓ | ✓ | — | ✓ | — |
| DB migration/reset | ✓ | ✓ | ✓ | ✓ | Never destructive |
| DB constraints | ✓ | ✓ | ✓ | ✓ | Read-only/safe checks only |
| RLS/storage security | ✓ | ✓ | ✓ | ✓ | Narrow safe verification only |
| Integration | ✓ | ✓ | ✓ | ✓ | — |
| E2E critical workflows | Optional subset | ✓ | ✓ | ✓ | Safe smoke subset |
| Accessibility automated | Optional subset | ✓ core | ✓ full | ✓ | — |
| Responsive | — | ✓ core | ✓ | ✓ | — |
| SEO technical | — | ✓ core | ✓ | ✓ | Safe live verification |
| Lighthouse/performance | — | budget subset | ✓ | ✓ | Optional monitoring |
| Production build | ✓ | ✓ | ✓ | ✓ | Deployed artifact |
| Secret scan | ✓ | ✓ | ✓ | ✓ | — |
| Manual exploratory | — | — | ✓ | ✓ | ✓ targeted |

---

# 5. Risk-Based Priority

## P0 — Release Blocker

Any failure involving:

- private-data leakage;
- exact-coordinate leakage;
- private-document authorization;
- admin authorization;
- RLS bypass;
- service-role exposure;
- publication bypass;
- owner submission auto-publication;
- corrupted/partial transaction;
- invalid production migration;
- production build failure;
- sitemap exposing private/noindex URLs;
- staging indexing;
- misleading `AVAILABLE` state for sold/rented/leased property;
- critical inquiry/Sell Your Land/site-visit workflow failure.

## P1 — High

- search returns incorrect inventory;
- CRM state-machine violation;
- verification claim published without required support;
- upload validation bypass;
- broken canonical/redirect behavior;
- broken admin property workflow;
- accessibility issue preventing primary conversion or admin operation;
- significant responsive breakage;
- major Core Web Vitals regression.

## P2 — Normal

- non-critical visual issue;
- secondary empty-state copy;
- minor animation;
- low-impact analytics discrepancy;
- cosmetic admin density issue.

P0/P1 failures block release unless explicitly documented as an approved exception by the product owner and, where security/privacy/legal scope is affected, the relevant responsible reviewer.

---

# 6. Unit Testing Strategy

Unit tests cover deterministic logic without requiring a real browser or full database transaction.

## 6.1 Property/publication logic

Test:

- publication blocker generation;
- land-category required-field logic;
- transaction validation;
- availability/publication independence;
- high-impact change classification;
- public-safe state derivation;
- slug normalization;
- property-code formatting helper if any application-level formatting exists;
- safe redirect decision helpers.

Mandatory cases:

```text
DRAFT + valid data → still not public
UNDER_REVIEW + missing cover → blocked
UNDER_REVIEW + unsafe location → blocked
UNDER_REVIEW + unsupported public verification claim → blocked
PUBLISHED + AVAILABLE → active public
PUBLISHED + SOLD → public closed state, not active inventory
UNPUBLISHED + AVAILABLE → not discoverable
ARCHIVED + OFF_MARKET → not public
ARCHIVED restore → DRAFT, never PUBLISHED
```

## 6.2 Pricing

Test all modes:

```text
PRICE_ON_REQUEST
EXACT_TOTAL
PRICE_RANGE
PER_UNIT
```

Assertions:

- `PRICE_ON_REQUEST` emits no fake numeric value;
- exact total requires a value;
- range requires `min <= max`;
- per-unit requires amount + unit;
- negotiable flag is independent;
- currency defaults/validation remain correct;
- display formatting uses safe numeric precision.

## 6.3 Area/unit logic

Test:

- positive source area;
- normalized sqm when conversion is valid;
- source unit preserved;
- authoritative vs source-declared/provisional status;
- unsupported local conversion does not invent a value;
- boundary/precision behavior;
- min/max area search conversion.

## 6.4 Search normalization

Test:

- URL parameters parse deterministically;
- empty/default parameters are removed;
- duplicate values are normalized;
- unknown enum values reject or safely ignore per contract;
- AND across filter dimensions;
- OR within multi-select dimension;
- stable sort;
- page-number normalization;
- page 1 normalization;
- exact Property ID recognition;
- price and area range parsing;
- tracking parameters stripped from canonical state.

## 6.5 Location privacy

Unit-test the privacy transformer/projection.

Fixture contains:

```text
private exact lat/lng
public approximate lat/lng
private accuracy
public accuracy
internal location notes
```

Expected:

### `EXACT`

Only intentionally approved public coordinate is exposed.

### `APPROXIMATE`

Public approximate coordinate may be exposed. Private exact coordinate is absent.

### `HIDDEN`

No coordinate is exposed.

Test object keys as well as values: a leak is not acceptable merely because a key is `undefined` after serialization if another layer can still serialize the value.

## 6.6 Verification

Test:

- scoped status mapping;
- public label only when `public_visible = true`;
- required reviewer/date/scope;
- expired/recheck-due state;
- evidence requirement;
- professional-review-required blocker;
- failed/requires-review check cannot emit optimistic public badge;
- blocked/legal-sensitive phrase list;
- public explanation never includes internal notes/evidence paths;
- removal of a public claim can remove its claim-specific publish blocker while preserving the internal check.

## 6.7 CRM state machine

Represent the allowed transition matrix in code and test every allowed and forbidden edge.

Authoritative states:

```text
NEW
CONTACT_ATTEMPTED
QUALIFIED
REQUIREMENT_CONFIRMED
PROPERTY_MATCHED
SITE_VISIT_REQUESTED
SITE_VISIT_CONFIRMED
SITE_VISIT_COMPLETED
NEGOTIATION
NURTURE
WON
LOST
CLOSED
```

Required unit cases:

- `CONTACT_ATTEMPTED` requires contact-attempt activity;
- `QUALIFIED` requires admin qualification context;
- `REQUIREMENT_CONFIRMED` requires usable requirement;
- `PROPERTY_MATCHED` requires an active linked property;
- `SITE_VISIT_REQUESTED` requires a visit request;
- `SITE_VISIT_CONFIRMED` requires a confirmed time/record;
- `SITE_VISIT_COMPLETED` requires actual outcome;
- `LOST` requires structured loss reason;
- `NURTURE` requires future follow-up/reactivation plan;
- `WON`, `LOST`, `CLOSED` are terminal;
- terminal states cannot casually move backward.

## 6.8 Site visits

Test:

- request starts `REQUESTED`;
- confirm cannot occur without admin;
- confirm cannot occur without confirmed timestamps;
- completion cannot occur before confirmation unless architecture explicitly supports a recorded exception;
- reschedule creates/preserves history;
- cancelled/no-show do not become completed;
- sold/off-market property blocks blind confirmation;
- timezone/date handling is stable.

## 6.9 Media

Test:

- public vs private classification;
- one public cover invariant at service level;
- sort ordering;
- archive/restore;
- safe external URL allowlist/validation;
- file-type validation;
- double-extension rejection;
- filename normalization;
- public alt-text handling;
- no document record can satisfy public listing-media requirement.

## 6.10 SEO helper logic

Test:

- metadata title/description fallbacks;
- canonical normalization;
- self-canonical on indexable routes;
- filter noindex policy;
- pagination canonicals;
- sitemap eligibility;
- closed-property indexability decision;
- archived URL retirement;
- slug redirect history;
- structured-data availability;
- hidden/approximate location structured-data behavior;
- `PRICE_ON_REQUEST` schema omission of price.

---

# 7. Component Testing Strategy

Component tests verify UI behavior and accessibility semantics without requiring a full deployed application.

## 7.1 Public property card

Test:

- Property ID visible;
- category and transaction visible;
- area;
- correct price/POR display;
- availability badge;
- public-safe location only;
- no owner PII/internal fields;
- image alt behavior;
- `View Property` link uses canonical public slug;
- WhatsApp context includes Property ID but no private data;
- closed property card does not imply active availability.

## 7.2 Search/filter components

Test:

- active filters rendered as removable chips;
- filter count reflects user-applied filters;
- clearing filters updates URL intent;
- mobile bottom sheet traps focus;
- `Clear`/`Apply Filters`;
- malformed values do not crash;
- no-results CTA points to requirement capture;
- pagination preserves filters.

## 7.3 Property detail components

Test:

- core facts exist before client-only enhancements;
- CTA hierarchy;
- map mode label (`Exact`, `Approximate`, hidden wording);
- closed-state CTA replacement;
- verification badge explanation;
- gallery keyboard controls;
- fallback when image/media is unavailable;
- private fields absent from rendered props/DOM.

## 7.4 Public forms

For inquiry, requirement, site visit, contact, Sell Your Land:

- labels;
- required markers;
- inline error;
- focus on first invalid field where appropriate;
- values preserved after validation failure;
- duplicate submit protection;
- `Submitting…` state;
- recoverable server failure;
- success state;
- consent requirement;
- no account requirement.

## 7.5 Sell Your Land wizard

Test:

- step progress;
- Back/Continue;
- category-specific fields switch correctly;
- session UI state preserves previous fields;
- file rejection UX;
- owner location preference copy;
- final success copy does not say listing is live/published;
- private documents never display as public media selection.

## 7.6 Admin components

Test:

- admin publication blockers;
- public/internal visual distinction;
- destructive confirmation dialogs describe consequences;
- lead stage dialog asks target-stage-required fields;
- verification editor has scoped signals, not a single “Verified” switch;
- media cover selection;
- private document panel;
- site-visit confirm/reschedule controls;
- terminal lead state prevents ordinary stage controls.

---

# 8. Database and Migration Testing

The database is a primary security and integrity layer. Tests must run against a real disposable Supabase/PostgreSQL environment, preferably local Supabase for PRs and staging for pre-release.

## 8.1 Clean migration test

For every PR that changes `supabase/migrations`:

```text
start clean database
→ apply all migrations from zero
→ seed safe reference fixtures
→ run DB test suite
```

Failure is release-blocking.

Also test upgrade-path migrations where a migration changes existing data or constraints:

```text
known prior schema + representative old data
→ apply new migration
→ assert data preserved/transformed
```

## 8.2 Constraint tests

At minimum verify:

### Properties

- property code uniqueness;
- property code format;
- property slug case-insensitive uniqueness;
- positive display area;
- normalized area positivity;
- authoritative area provenance requirement;
- publish-required fields;
- archive/publication consistency.

### Offers

- one active offer per property/transaction;
- one primary active offer;
- exact/range/per-unit/POR constraints;
- non-negative monetary values;
- term ordering.

### Media

- at most one active cover per property;
- visibility rules;
- archived public media not eligible.

### Lead/property links

- no duplicate `(lead_id, property_id)` link.

### Site visits

- required relationship integrity;
- confirmed/completed timestamp consistency where implemented.

### Verification

- check relationship integrity;
- evidence reference requirement;
- reviewer/source constraints as implemented.

### Owner submissions

- unique submission reference;
- one resulting property association;
- converted-state consistency.

## 8.3 Referential integrity tests

Attempt invalid foreign keys and deletion behavior.

Confirm:

- business records are not cascade-deleted unexpectedly;
- leads/site visits/verifications/audit history survive expected parent lifecycle operations;
- archive is used for normal retirement;
- `SET NULL` actor references preserve history where designed.

## 8.4 Database time

Test:

- timestamps stored UTC;
- sorting unaffected by local timezone;
- date-only inputs do not shift across Asia/Kolkata boundaries;
- site-visit date/time round-trip correctly.

---

# 9. RLS and Authorization Test Matrix

RLS tests must exercise database grants and policies directly. “The button is hidden” is not an authorization test.

## 9.1 Actor contexts

Test as:

```text
ANON
AUTHENTICATED_NON_ADMIN (future-safe fixture if supported)
INACTIVE_ADMIN
ACTIVE_ADMIN
SERVER_PRIVILEGED
```

The privileged service role is only exercised inside trusted test/server code. It must never be available to browser E2E code or public client bundles.

## 9.2 Anonymous read expectations

Anonymous may read only public-safe projections of intentionally public data.

Anonymous must not read:

```text
leads
parties private fields
owner_submissions
private_documents
verification_evidence
private exact property coordinates
internal verification notes
audit_logs
unpublished properties
archived private records
admin settings containing private values
```

## 9.3 Anonymous write expectations

Direct anonymous database insert/update/delete must be denied for:

```text
leads
lead_activities
owner_submissions
site_visits
properties
property publication status
verification
private_documents metadata
audit_logs
admin_profiles
```

Public forms work through server-owned actions/handlers, not broad direct public table grants.

## 9.4 Authenticated non-admin

If present, must be denied admin reads/writes exactly as anonymous unless a future role is explicitly implemented.

Test guessed UUID access to:

- property admin record;
- lead;
- submission;
- site visit;
- private document;
- verification evidence;
- audit event.

## 9.5 Inactive admin

An authenticated account with an inactive/non-authorized admin profile must fail admin authorization.

Test:

- `/admin` route;
- direct Server Action POST;
- database access;
- signed private document request.

## 9.6 Active admin

Assert allowed access only to intended admin operations.

Even admin output must still avoid exposing secrets such as:

- service-role key;
- provider secret;
- raw auth token.

## 9.7 RLS enablement audit

CI must query schema metadata and fail if any application table that should be protected has RLS disabled.

Also fail if:

- broad `anon` grants appear on sensitive tables;
- broad `authenticated` grants bypass intended policies;
- a public view uses `SELECT *` from a sensitive evolving base table instead of explicit columns.

---

# 10. Storage Security Testing

## 10.1 Bucket contract

Expected logical separation:

```text
property-media-public
property-media-private
private legal/owner/verification storage
```

Use actual configured bucket names from implementation; tests assert the architectural role, not just the literal label.

## 10.2 Public media

Test:

- approved public image loads anonymously;
- unapproved/private staged image does not;
- archived media not used as current cover;
- object path does not encode owner phone, survey identifier or private coordinates;
- image metadata no longer contains private EXIF geolocation after processing;
- content type matches inspected binary.

## 10.3 Private documents

Test:

- guessed public URL fails;
- anonymous Supabase Storage request fails;
- non-admin signed URL request fails;
- authorized admin receives short-lived access;
- expired signed URL fails;
- guessed path signed-url request fails;
- signed URL for another document cannot be substituted;
- archived/deleted-under-retention document cannot remain accessible contrary to policy;
- access event is audited where required.

## 10.4 Upload abuse

Fixtures include:

```text
valid JPG
valid PNG
valid WEBP
valid PDF
oversized file
zero-byte file
double extension: deed.pdf.exe
image extension with non-image bytes
PDF extension with invalid binary
HTML/SVG payload if not allowed
filename with traversal sequences
very long filename
duplicate file checksum
malware-test fixture in isolated non-production test environment
```

Expected behavior:

- reject invalid type/size;
- server chooses object path;
- checksum recorded;
- malicious/suspicious document never becomes public;
- failed upload leaves no publicly usable metadata.

---

# 11. Integration Testing Strategy

Integration tests exercise real application services against a disposable database/storage environment with providers stubbed or sandboxed.

## 11.1 Publication transaction

Success path:

```text
authorized admin
→ load draft
→ satisfy gate
→ publish
→ audit created
→ published_at/by set
→ cache/revalidation target invoked
→ public projection now resolves
```

Failure injection:

- audit write fails → property remains un-published;
- cover invariant conflict → no partial publish;
- verification claim loses evidence → blocked;
- public location unsafe → blocked;
- concurrent publish → deterministic success/conflict, not corrupt state.

## 11.2 Property update after publishing

High-impact mutations must trigger review/public-integrity validation:

```text
category
transaction
land-use claim
planning claim
public coordinates
public identifier disclosure
verification signal
material property fact
```

Routine changes such as media order or minor description edits may remain published if validation passes.

Test that privacy-changing mutations are audited.

## 11.3 Inquiry

Exact flow:

```text
request context
→ rate limit
→ honeypot
→ Turnstile
→ parse/normalize
→ public property eligibility
→ transaction:
   resolve/create party
   create lead
   create requirement if applicable
   link property
   create activity
→ commit
→ notification
→ analytics
→ safe response
```

Test:

- valid inquiry;
- invalid property;
- unpublished property;
- sold property behavior according to public CTA policy;
- malformed fields;
- missing consent;
- duplicate submit/idempotency;
- rate-limit failure;
- Turnstile failure;
- activity write failure → no partial lead;
- email failure after commit → lead persists and failure is observable;
- analytics failure → business state persists;
- returned response contains no private/internal IDs unnecessarily.

## 11.4 Buyer requirement

Test:

- lead can exist without arbitrary property;
- requirement persists structured fields;
- no-result search links to this flow;
- invalid area/budget;
- duplicate submit handling;
- CRM starts at `NEW`;
- admin can later match one or more properties.

## 11.5 Sell Your Land intake

Test:

```text
public form
→ anti-abuse
→ validate
→ resolve/create party
→ create owner_submission
→ store private docs/media references safely
→ status NEW
→ notification
→ success response
```

Assertions:

- no property is created automatically;
- no public route becomes live;
- documents remain private;
- owner contact remains private;
- submission reference is not an authorization credential;
- seller claims remain claims, not verified facts.

## 11.6 Owner submission conversion

Success:

```text
APPROVED submission
→ admin conversion
→ lock submission
→ allocate unique property code
→ create property
→ category extension
→ location
→ offer
→ parcel/source relations
→ property-party relation
→ attach private source/document relations
→ set submission CONVERTED
→ audit
→ commit
→ result property DRAFT
```

Failure injection mid-transaction:

- no partial property;
- submission remains unconverted;
- no orphan relations;
- code allocator remains safe.

Parallel conversion test:

- one succeeds;
- other returns conflict;
- only one resulting property.

## 11.7 Site-visit integration

Public request:

- creates/links lead;
- creates `REQUESTED` visit;
- activity logged;
- never `CONFIRMED`.

Admin confirm:

- lock;
- validate status;
- validate confirmed time;
- validate property operational availability;
- update visit;
- transition lead if appropriate;
- activity;
- audit;
- commit.

Failure injection in lead transition:

- visit is not half-confirmed.

## 11.8 CRM stage transition integration

For each stage transition:

- check prerequisite data;
- mutate status;
- add `STATUS_CHANGED` activity;
- add stage-specific activity where required;
- update follow-up queues;
- audit if required;
- reject forbidden transition.

Special cases:

- `LOST` requires loss reason;
- `CLOSED` requires closure reason;
- `NURTURE` requires follow-up/reactivation plan;
- terminal records disappear from active/overdue queues;
- creating a new opportunity from a terminal historical lead does not silently rewrite history.

## 11.9 Verification integration

Test:

- add check;
- attach evidence;
- set reviewer/date;
- public-visible scoped wording;
- publish gate maps claim to qualifying check;
- expired/recheck state removes or blocks claim as configured;
- evidence replacement preserves history;
- internal evidence never appears in public DTO;
- lawyer/surveyor/planner/engineer referral remains distinct.

## 11.10 Media integration

Test:

- upload authorization;
- upload;
- metadata registration;
- cover transaction;
- reorder;
- archive/restore;
- public/private transition only when allowed;
- duplicate checksum handling;
- external video/360 URL registration;
- public brochure policy.

---

# 12. Concurrency Testing

Run parallel test requests because one-admin UX does not eliminate concurrent browser tabs, retries or duplicated network requests.

Required concurrency scenarios:

```text
property-code generation
publication
owner-submission conversion
primary property offer selection
public cover selection
lead stage transition
site-visit confirmation
slug change/redirect creation
```

Acceptable outcomes:

```text
one success + one explicit conflict
or idempotent same result where designed
```

Unacceptable:

```text
duplicate public ID
two covers
two primary offers
two converted properties
silent last-write-wins business transition
lost audit/activity
partial state
```

---

# 13. Critical E2E Workflow Suite

Use Playwright against preview/staging with seeded synthetic data.

## E2E-01 — Public discovery → property detail → inquiry

1. Open homepage.
2. Verify product/category/geography message is visible without waiting for client hydration.
3. Search Ahmedabad + Agricultural + Buy.
4. Verify URL contains search state.
5. Verify results are public/published only.
6. Open known property.
7. Verify Property ID, area, price/POR, broad location, availability.
8. Verify owner phone/email/private details absent.
9. Submit inquiry.
10. Verify public success.
11. Sign in as admin.
12. Verify lead exists at `NEW`.
13. Verify linked property and activity.
14. Verify notification failure, if provider stubbed to fail, does not remove lead.

## E2E-02 — No results → buyer requirement

1. Apply a synthetic filter that yields zero inventory.
2. Verify no fabricated listings.
3. Verify `Tell UrbanEdge Your Requirement`.
4. Submit requirement.
5. Verify lead appears in CRM without fake property link.
6. Admin confirms requirement.
7. Admin matches a valid property.
8. Verify CRM stage prerequisites.

## E2E-03 — Admin creates draft → publish

1. Admin login.
2. Create property draft.
3. Confirm unique `UE-LS-XXXXXX` code.
4. Try to publish while fields missing.
5. Verify actionable blockers.
6. Add safe location, area, offer, public media, required category fields.
7. Add only supported verification claims.
8. Preview through actual public projection.
9. Publish.
10. Verify audit record.
11. Anonymous search/detail now sees property.
12. Sitemap behavior matches SEO policy.
13. No private field appears in source/network.

## E2E-04 — Unsupported verification claim blocks publication

1. Draft/under-review property.
2. Select public claim such as a scoped records-reviewed label.
3. Omit required evidence/reviewer/date/scope.
4. Publish.
5. Verify blocked with exact reason.
6. Add qualifying evidence.
7. Publish succeeds.
8. Public shows only approved label/explanation.

## E2E-05 — Sell Your Land full flow

1. Open `/sell-your-land`.
2. Complete 10-step flow using synthetic owner data.
3. Upload safe synthetic private document.
4. Submit.
5. Verify thank-you states review-before-publication.
6. Anonymous search/property routes show nothing new.
7. Admin opens submission.
8. Move through permitted states.
9. Approve.
10. Convert.
11. Verify resulting property is `DRAFT`.
12. Verify owner docs remain private.
13. Curate public title/description/location/media.
14. Separate publication action required.

## E2E-06 — Site-visit request → manual confirmation

1. Open published available property.
2. Request site visit.
3. Verify success text says request, not booking.
4. Admin sees visit as `REQUESTED`.
5. Public visitor cannot confirm it.
6. Admin proposes/confirms time.
7. Verify visit `CONFIRMED` and linked lead stage/activity.
8. Complete visit with outcome.
9. Verify `SITE_VISIT_COMPLETED`.
10. Move lead appropriately.

## E2E-07 — CRM happy path

Seed a lead and walk:

```text
NEW
→ CONTACT_ATTEMPTED
→ QUALIFIED
→ REQUIREMENT_CONFIRMED
→ PROPERTY_MATCHED
→ SITE_VISIT_REQUESTED
→ SITE_VISIT_CONFIRMED
→ SITE_VISIT_COMPLETED
→ NEGOTIATION
→ WON
```

At each stage verify:

- prerequisite;
- status;
- activity timeline;
- relevant linked record;
- follow-up queue behavior;
- terminal behavior after WON.

## E2E-08 — CRM lost/nurture/closed paths

Test:

- lead to NURTURE requires future action;
- nurture reactivation is auditable;
- LOST requires structured loss reason;
- CLOSED requires closure reason;
- terminal record cannot be dragged/edited back into normal funnel;
- explicit new opportunity preserves historical lead.

## E2E-09 — Availability closed state

For each:

```text
SOLD
RENTED
LEASED
OFF_MARKET
```

1. Change status as admin.
2. Verify audit.
3. Public detail reflects status.
4. No misleading `Enquire as available` CTA.
5. Use `Find Similar Land` / requirement CTA.
6. Removed from active inventory counts/search if applicable.
7. Structured data matches.
8. Existing linked leads remain, with admin review prompt.
9. No automatic closure of all linked leads.

## E2E-10 — Unpublish/archive/restore

1. Published property.
2. Unpublish.
3. Verify no active search discovery.
4. Existing CRM records remain.
5. Archive.
6. Verify SEO outcome is 404/410 or exact successor redirect according to configured policy.
7. Restore.
8. Verify state becomes `DRAFT`, not automatically `PUBLISHED`.

## E2E-11 — Slug change

1. Published property with indexed-style old slug.
2. Admin changes slug through approved workflow.
3. Old slug permanently redirects one hop to current slug.
4. New URL self-canonical.
5. Sitemap contains current canonical only.
6. No redirect chain.
7. Old slug does not redirect to homepage.

## E2E-12 — Admin auth/session

1. Anonymous `/admin/...` access denied/redirected.
2. Invalid credentials fail safely.
3. Active admin logs in.
4. Admin can access authorized screens.
5. Log out.
6. Old session cannot continue admin actions.
7. Direct crafted action after logout fails.
8. Inactive admin fixture cannot access admin.

---

# 14. Security Regression Suite

Security tests are permanent regression tests, not one-time penetration checks.

## 14.1 Public property leakage fixture

Maintain a property containing all of:

```text
owner phone
owner email
private exact latitude
private exact longitude
public approximate latitude
public approximate longitude
private document
internal property note
internal verification note
private verification evidence
public image
public scoped verification
```

Snapshot/inspect the public DTO.

It must contain only intentionally public-safe values.

## 14.2 Exact-location leakage scanner

For `APPROXIMATE` and `HIDDEN`, scan for the exact private coordinate values in:

```text
HTML source
RSC/Flight payloads
serialized client props
JSON APIs
Server Action responses
JSON-LD
Open Graph metadata
Twitter/social metadata
map initialization data
analytics payloads
image EXIF/metadata
public object names
brochure/public PDF where applicable
logs captured by test adapter
```

The test fails if exact coordinates appear anywhere.

Do not use rounded equality only; search string variants and numeric serialization variants.

## 14.3 Private document abuse

Attempt:

- direct public URL;
- guessed object path;
- storage API anonymous read;
- non-admin read;
- stale signed URL;
- signed URL replay;
- document ID/path swap;
- archived document;
- submission reference as credential.

All must fail except explicitly authorized active-admin short-lived access.

## 14.4 Owner PII

Try to retrieve owner phone/email/legal name through:

- public property query;
- GraphQL/REST/PostgREST-style direct table endpoint if exposed by Supabase;
- nested relationship expansion;
- search endpoint;
- sitemap/metadata;
- analytics;
- error payload;
- email template intended for public user.

Expected: absent.

## 14.5 Unpublished inventory enumeration

Given known UUID/property code/slug for:

```text
DRAFT
UNDER_REVIEW
UNPUBLISHED
ARCHIVED
```

Anonymous lookup must not reveal internal existence beyond the intentionally designed generic public response.

Test property ID search too.

## 14.6 Forged Server Action/HTTP requests

Send direct crafted requests with:

```text
forged admin flag
forged owner/actor ID
forged publication status
forged availability status
missing/forged origin/CSRF context
oversized payload
malformed UUID
unknown enum
duplicate idempotency key
forged Turnstile token
stale/reused Turnstile token
unexpected additional fields
```

Expected:

- authoritative server identity used;
- forged fields ignored/rejected;
- no privileged state change.

## 14.7 XSS/content injection

Test property/guide/admin-entered text containing:

```html
<script>alert(1)</script>
<img src=x onerror=alert(1)>
<a href="javascript:alert(1)">x</a>
<iframe ...>
<style>...</style>
```

Expected:

- sanitized/escaped according to content model;
- no executable script/event handler;
- structured content still renders safely.

## 14.8 Secret exposure

CI scans:

- browser bundle;
- `.next/static`;
- generated source maps if public;
- rendered page source;
- `.env.example`;
- repository history scanning in CI where practical.

Block if:

- Supabase service-role key;
- email provider secret;
- Turnstile secret;
- private API token;
- real production credential

appears.

## 14.9 Security headers

On staging/production build verify intended headers:

- CSP;
- `X-Content-Type-Options`;
- `Referrer-Policy`;
- `Permissions-Policy`;
- frame protection;
- HSTS when appropriate on production HTTPS.

CSP test should fail if a new dependency requires broad unsafe relaxation without review.

## 14.10 Rate/abuse controls

Test:

- normal visitor succeeds;
- burst exceeds configured limit and is rejected;
- limiter does not expose private info;
- CAPTCHA/Turnstile failure is safe;
- provider outage follows defined graceful-degradation/fail-closed policy for each protected form;
- honeypot submissions rejected quietly.

---

# 15. Admin Authorization Testing

Admin authentication and authorization are separate.

## 15.1 Route level

Anonymous requests to all `/admin/*` except login must not render private content.

Test representative routes:

```text
/admin/dashboard
/admin/properties
/admin/submissions
/admin/leads
/admin/site-visits
/admin/verification
/admin/media
/admin/guides
/admin/seo
/admin/settings
/admin/audit
```

## 15.2 Server mutation level

Even if the page is inaccessible, direct actions must independently call `requireAdmin`/equivalent.

Test direct calls for:

- property update;
- publish/unpublish/archive;
- availability;
- verification;
- media visibility;
- owner-submission conversion;
- lead stage;
- site-visit confirm;
- guide/SEO publish;
- settings.

## 15.3 Database level

RLS still prevents unauthorized use if an application-route check is accidentally omitted.

This defense-in-depth test is mandatory.

---

# 16. Search Testing

The search suite must validate business correctness, privacy and URL behavior.

## 16.1 Dataset

Seed enough fixtures to cover:

- Agricultural / NA / Industrial;
- Buy / Rent / Lease;
- Ahmedabad / Gandhinagar;
- multiple talukas/localities;
- exact price / POR / range / per-unit;
- multiple area units;
- available / under negotiation / sold / rented / leased / off market;
- published / draft / unpublished / archived;
- exact / approximate / hidden location;
- featured/non-featured;
- known property IDs;
- similar words/aliases.

## 16.2 Functional assertions

- AND across dimensions;
- OR within multi-select dimension;
- exact Property ID lookup;
- keyword behavior;
- geography aliases;
- min/max price;
- POR inclusion/exclusion rules;
- area conversion;
- category-specific filters;
- stable sorting;
- bounded pagination;
- correct result count;
- no private fields;
- no unpublished inventory;
- no stale active inventory.

## 16.3 URL assertions

- filters survive refresh;
- back/forward;
- query parameter order normalized;
- duplicate parameters normalized;
- empty/default parameters stripped;
- page 1 normalized;
- page > max returns 404/valid empty policy per SEO contract—architecture requires out-of-range pagination 404;
- sort/filter states are noindex unless mapped to curated SEO page;
- tracking parameters do not become canonical.

## 16.4 Empty/error

- zero result → helpful no-results state;
- requirement CTA;
- broaden search;
- server search failure → retry while filters remain.

---

# 17. Verification Workflow Testing

Verification is a trust system and must be tested more strictly than ordinary admin form data.

## 17.1 Core chain

For every public verification claim verify deterministic trace:

```text
PUBLIC CLAIM
→ copy policy
→ check definition
→ evidence
→ provenance/source
→ reviewer
→ date
→ status
→ exceptions
→ public-safe summary
```

## 17.2 Claim examples

Test representative claims such as:

- Revenue Records Reviewed;
- Documents Reviewed;
- Location Reviewed;
- Site Visited;
- Survey/Mapni Evidence Reviewed;
- NA Order Reviewed;
- Planning/Zoning Check Completed;
- GIDC Records Reviewed;
- Legal Review Completed — Scoped.

## 17.3 Negative cases

Do not allow public label if:

- status failed;
- status requires review;
- evidence missing;
- source missing where required;
- reviewer missing;
- review date missing;
- scope missing;
- exception open;
- professional review required but absent;
- check expired/recheck due under configured claim policy;
- wording is blacklisted/unapproved.

## 17.4 History

Evidence replacement must not silently erase historical evidence/verification state.

Audit/history tests:

- status change;
- evidence add/replace/revoke;
- reviewer change;
- professional review requested/completed;
- public badge change;
- publish/unpublish related to verification.

## 17.5 Public safety

Public page may show only:

```text
approved label
approved scope/explanation
approved review date where intended
```

Never:

```text
raw legal note
owner document
personal ID
source credential
private evidence path
sensitive reviewer commentary
```

---

# 18. Media and Private Document Testing

## 18.1 Public gallery

Test:

- deterministic cover;
- order;
- lazy loading below fold;
- primary image priority;
- responsive `sizes`;
- broken image fallback;
- duplicate handling;
- archive;
- external video/360;
- brochure.

## 18.2 Public brochure

Default technical test if brochure is publicly hosted:

- `X-Robots-Tag: noindex, follow` unless specifically approved for standalone indexing;
- omitted from sitemap when noindex;
- contains no private/exact location data for approximate/hidden property;
- does not expose private document storage path.

## 18.3 Private evidence document

Test browser and API paths as described in security suite.

## 18.4 EXIF privacy

For an uploaded geotagged sample image:

1. upload to private/staging pipeline;
2. process/approve for public;
3. download public rendition;
4. inspect metadata;
5. assert GPS/private metadata absent.

---

# 19. SEO Testing Strategy

SEO testing is both unit-level and deployed HTTP/HTML-level.

## 19.1 Every deployment

Automated checks:

```text
canonical host behavior
staging noindex/access restriction
valid robots.txt
valid sitemap XML
all sitemap URLs return 200
no sitemap URL redirects
no sitemap URL returns 404/5xx
no sitemap URL emits noindex
admin routes not indexable
core pages have metadata
no duplicate canonical generation
public property query excludes private fields
```

## 19.2 Indexable page HTML

Initial HTML must contain primary value before client hydration.

Property page:

- title;
- Property ID;
- category;
- transaction;
- public-safe location;
- area;
- price/POR;
- availability;
- useful description;
- crawlable links.

SEO landing:

- H1;
- unique/editorial content;
- inventory links;
- breadcrumbs;
- internal links.

Guide:

- title;
- reviewed/publication context;
- body headings;
- internal links.

## 19.3 Canonical tests

Test:

- canonical domain/HTTPS;
- homepage;
- core category;
- Ahmedabad/Gandhinagar;
- location-category;
- property;
- guide;
- pagination;
- arbitrary filters;
- tracking params;
- page 1;
- slug history.

Rules:

- every indexable page one stable canonical;
- paginated collection self-canonical;
- arbitrary filters not treated as curated index pages;
- old slug one-hop permanent redirect;
- no homepage redirect for unrelated removed property.

## 19.4 Robots

Verify production baseline intent:

- allow public pages;
- disallow admin/API/search/high-cardinality patterns as configured;
- reference production sitemap;
- do not use robots as privacy;
- staging remains non-indexable through stronger control plus noindex defense.

## 19.5 Sitemap

Include only:

- core indexable pages;
- published eligible properties;
- published guides;
- quality-gated approved SEO pages.

Exclude:

- admin;
- search/filter states;
- thank-you pages if policy says noindex;
- drafts;
- unpublished/archived removed property URLs;
- private documents;
- noindex pages;
- redirecting URLs.

## 19.6 Structured data

Validate JSON syntax and semantic consistency.

Test:

- Organization/WebSite where configured;
- BreadcrumbList;
- property/RealEstateListing representation where used;
- visible status == structured availability;
- no fake rating/reviews;
- no fake numeric price for POR;
- approximate location uses only public approximate point;
- hidden location emits no hidden geo;
- closed property no longer appears available.

## 19.7 Closed-property SEO

For `SOLD`, `RENTED`, `LEASED` while still published:

- 200 if configured to retain;
- status prominent;
- alternative CTA;
- removed from active inventory count;
- structured availability updated;
- canonical unchanged;
- may remain indexable only if useful.

For `UNPUBLISHED`/`ARCHIVED`:

- exact successor → permanent redirect;
- otherwise 404/410;
- no sitemap;
- no active links.

## 19.8 SEO landing quality gate

Automate objective portions.

District + category Gate A requires:

- at least 3 matching `PUBLISHED` properties with availability `AVAILABLE` or `UNDER_NEGOTIATION`;
- at least 350 words original local content;
- meaningful local section;
- relevant guide/resource or strong explanatory block;
- CTA.

Gate B without inventory threshold requires:

- at least 1,000 words substantial original local content;
- at least 3 meaningful internal references;
- clear zero-inventory statement;
- no fake listings/prices/stats;
- manual approval.

Future taluka/locality gate:

- approved route + active business geography;
- >=5 active matching properties OR >=1,200 words substantial local editorial value;
- >=400 local editorial words even when inventory threshold met;
- at least two local facts/considerations;
- two useful internal links;
- manual approval;
- explicit SEO entity;
- sitemap only after approval.

Automated tests do not replace editorial judgment.

---

# 20. Accessibility Testing

Target WCAG 2.2 AA behavior as the practical product baseline unless the implementation defines a stricter target.

## 20.1 Automated axe scans

Run on representative pages:

Public:

```text
/
 /properties
 /properties/[slug]
 /agricultural-land
 /na-land
 /industrial-land
 /sell-your-land
 /requirements
 /site-visit
 /guides
 /guides/[slug]
 /locations/ahmedabad
 /contact
 /terms
 /privacy
 /disclaimer
 /404
```

Admin:

```text
/admin/dashboard
/admin/properties
/admin/properties/[id]
/admin/submissions/[id]
/admin/leads/[id]
/admin/site-visits/[id]
/admin/verification/[id]
/admin/settings
```

## 20.2 Keyboard

Manual/automated keyboard flows:

- header/mobile menu;
- search;
- filters;
- bottom sheet;
- gallery/lightbox;
- inquiry form;
- Sell Your Land wizard;
- dialogs;
- admin sidebar;
- tables/list controls;
- confirmation dialogs;
- stage-change dialog;
- media reordering alternative controls.

Requirements:

- logical tab order;
- visible focus;
- no keyboard trap;
- Escape closes modal/sheet where appropriate;
- focus returns to trigger;
- skip/navigation semantics as applicable.

## 20.3 Form accessibility

- label associated;
- instructions programmatically connected;
- error announced;
- required status not color-only;
- focus on error summary/first invalid control in long flow;
- validation does not erase values;
- touch target practical size.

## 20.4 Semantic structure

- one meaningful H1 per page where appropriate;
- heading hierarchy;
- landmarks;
- link vs button semantics;
- table headers for admin data;
- status not color-only;
- icon-only controls have labels;
- image alt text;
- decorative images empty alt.

## 20.5 Reduced motion

With `prefers-reduced-motion`:

- no unnecessary card/image motion;
- menu still usable;
- no critical feedback depends on animation.

---

# 21. Responsive Testing

Use deterministic viewport matrix.

## 21.1 Required widths

At minimum:

```text
375 × 812   compact phone
480 × 900   large phone
768 × 1024  tablet / major breakpoint
900 × 1000  search/detail transition check
992 × 900   desktop grid transition
1200 × 900  wide desktop
1440 × 1000 large desktop sanity
```

Also run one narrow 320px overflow smoke test even though the core contract starts around compact mobile.

## 21.2 Public responsive assertions

### Header

- desktop nav vs mobile menu transition;
- no wrapping/collision;
- logo safe;
- menu keyboard/touch.

### Search

- desktop filters;
- tablet/mobile filter sheet;
- result cards remain visible;
- no hidden Apply/Clear;
- no horizontal overflow.

### Property card

- one column mobile;
- metadata readable;
- buttons not squeezed.

### Detail

- desktop sidebar;
- mobile single stack;
- primary actions near top;
- sticky mobile actions do not cover keyboard/content;
- map usable full width on mobile.

### Forms

- one-column mobile;
- no clipped inputs;
- keyboard does not hide submit;
- upload controls fit;
- long validation messages wrap.

### Guides/footer

- category chips scroll correctly;
- footer stacks without overflow.

## 21.3 Admin responsive

Mobile admin critical workflows:

- lead follow-up;
- submission review;
- site-visit status;
- property availability/publication quick review;
- notes.

Tables may transform to cards/detail rather than force unusable horizontal scroll.

## 21.4 Visual-regression snapshots

Use screenshots for high-value stable surfaces, not every page pixel.

Recommended snapshots:

- homepage;
- results desktop/mobile;
- property detail desktop/mobile;
- closed property;
- Sell Your Land step;
- admin dashboard;
- admin property publish blockers;
- admin lead detail;
- filter bottom sheet.

Keep snapshot baselines reviewed, not auto-updated.

---

# 22. Error and Resilience Testing

Every intentional error state in the UX architecture must be testable.

## 22.1 Public route errors

Test:

- unknown route → real 404;
- invalid property slug;
- archived/removed property;
- property DB failure;
- map provider failure;
- image unavailable;
- guide failure;
- search failure;
- network interruption.

No blank screen.

## 22.2 Form errors

Test:

- client validation;
- server validation;
- anti-bot rejection;
- rate limit;
- database failure before transaction commit;
- email failure after commit;
- analytics failure;
- retry without losing valid form fields.

## 22.3 External integrations

### Email down

Core lead/submission/visit remains saved.

### Analytics down

Core operation succeeds.

### Map down

Property detail still shows public-safe textual location and appropriate navigation fallback.

### CAPTCHA down

Behavior follows configured security policy and displays a safe recoverable message; never bypass silently through a client flag.

## 22.4 Admin errors

- queue failure;
- property save conflict;
- publish conflict;
- expired session;
- signed URL expiry;
- upload failure;
- concurrent stage change.

Admin gets safe actionable error, not raw database/provider secrets.

---

# 23. Performance Testing

The architecture targets strong Core Web Vitals and minimal client JavaScript.

Target lab/field goals where measurable:

```text
LCP ≤ 2.5s
INP ≤ 200ms
CLS ≤ 0.1
```

at the 75th percentile for real-user metrics when enough production data exists.

## 23.1 Lighthouse pages

Test at least:

- homepage;
- `/properties`;
- representative property detail;
- one category;
- one guide;
- one location/SEO page.

Run mobile profile as primary.

## 23.2 Performance budgets

Set repository budgets after first stable implementation baseline.

Mandatory qualitative budgets from day one:

- do not ship full property dataset to browser;
- maps loaded dynamically/lazily where possible;
- below-fold images lazy;
- responsive image sizes;
- primary hero/cover appropriately prioritized;
- primary property text in server HTML;
- avoid unnecessary global client providers;
- no giant third-party script introduced without review.

Once baseline bundle metrics exist, commit numeric budgets for:

- route JS;
- LCP image size;
- total page transfer;
- long tasks;
- request count.

Do not invent unrealistic universal byte limits before the actual implementation is profiled.

## 23.3 Search/database performance

Using a representative scaled synthetic dataset:

- indexed category/district queries;
- price/area ranges;
- pagination;
- property ID lookup;
- result count.

Record `EXPLAIN (ANALYZE, BUFFERS)` for high-value queries during performance tuning in local/staging.

Fail release if a regression introduces unbounded full-table behavior at expected V1 data scale.

## 23.4 Media

Test:

- original oversized image is not blindly served if processing architecture creates derivatives;
- correct browser dimensions;
- no layout shift due to missing aspect ratio;
- lazy media below fold;
- gallery interaction does not load every large asset eagerly.

---

# 24. Production Build Testing

A feature is not release-ready merely because dev mode works.

## 24.1 Mandatory local/CI command chain

Repository scripts should support equivalent of:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Database validation:

```bash
supabase db reset
supabase db lint
supabase test db
```

where supported by the project/tool versions, plus repository migration/RLS/integration suites.

## 24.2 Build-time checks

Fail build/release on:

- TypeScript error;
- lint error configured as blocking;
- missing required environment variable;
- server-only import pulled into client bundle;
- `NEXT_PUBLIC_*` containing secret;
- invalid metadata/route generation;
- sitemap generation failure that could produce bad production output;
- build route crash;
- static generation error;
- unsupported Node/runtime configuration for Netlify.

## 24.3 Preview deployment smoke

After deployment:

- homepage 200;
- property results 200;
- representative detail 200;
- login route;
- protected admin route behavior;
- robots;
- sitemap;
- noindex staging;
- public image;
- map loads/fails gracefully;
- safe test form flow;
- basic admin login.

---

# 25. Test Data Strategy

Test data must deliberately cover both normal functionality and privacy attack cases.

## 25.1 Categories

Use three dataset classes:

### Reference data

Safe non-sensitive geography/config used for application behavior.

### Synthetic business fixtures

Clearly fake people, leads, owners, properties, documents and media.

### Security canary fixtures

Records containing unique sentinel secrets/private values used to detect leakage.

## 25.2 Naming convention

Use unmistakable synthetic names:

```text
QA Owner Approx 001
QA Lead Lost 001
QA Property Industrial Hidden 001
qa-owner-approx@example.invalid
+91 90000 00001
```

Use `.invalid` email domain where delivery is not required.

Never use a real person's identity or contact by convenience.

## 25.3 Mandatory property fixture matrix

Create at least:

```text
PROPERTY_PUBLIC_AGRICULTURAL_BUY_AVAILABLE_APPROX
PROPERTY_PUBLIC_NA_RENT_AVAILABLE_EXACT
PROPERTY_PUBLIC_INDUSTRIAL_LEASE_AVAILABLE_HIDDEN
PROPERTY_PUBLIC_UNDER_NEGOTIATION
PROPERTY_PUBLIC_SOLD
PROPERTY_PUBLIC_RENTED
PROPERTY_PUBLIC_LEASED
PROPERTY_PUBLIC_OFF_MARKET
PROPERTY_DRAFT
PROPERTY_UNDER_REVIEW
PROPERTY_UNPUBLISHED
PROPERTY_ARCHIVED
PROPERTY_PRICE_ON_REQUEST
PROPERTY_PRICE_EXACT
PROPERTY_PRICE_RANGE
PROPERTY_PRICE_PER_UNIT
PROPERTY_WITH_PRIVATE_DOC
PROPERTY_WITH_PUBLIC_VERIFICATION
PROPERTY_WITH_INTERNAL_VERIFICATION_NOTE
PROPERTY_WITH_OWNER_PII
PROPERTY_PUBLIC_EXACT_UNAPPROVED
```

## 25.4 Security canaries

Use impossible-to-confuse sentinel values:

```text
private exact latitude: 23.987654
private exact longitude: 72.123456
owner phone: +91-99999-11111
owner email: qa-private-owner-001@example.invalid
internal marker: NEVER_PUBLIC_QA_CANARY_001
document marker: PRIVATE_DOC_QA_CANARY_001
```

Public leakage scanners look for these exact values/variants.

## 25.5 Lead fixtures

At least one lead for each CRM stage plus:

- overdue follow-up;
- nurture with future date;
- lost with loss reason;
- closed with closure reason;
- won;
- multi-property matched;
- site-visit linked.

## 25.6 Owner submission fixtures

At least:

- NEW;
- DOCS_REQUESTED;
- UNDER_REVIEW;
- VERIFICATION_PENDING;
- APPROVED;
- CONVERTED;
- ON_HOLD;
- REJECTED.

## 25.7 Document/media fixtures

Keep tiny, synthetic, license-safe assets created specifically for tests.

Do not copy real owner records into a test suite.

---

# 26. What Must Never Touch Production

The following are strict prohibitions.

## 26.1 Automated test connections

No automated unit, integration, E2E, load, RLS, migration-reset, seed or destructive test may target:

- production Supabase database;
- production Storage;
- production Auth user store;
- production email recipients;
- production analytics property when synthetic events would pollute business reporting;
- production Turnstile secret in automated destructive test mode;
- production admin account for routine CI.

## 26.2 Synthetic data

Never insert into production:

- fake properties;
- QA leads;
- fake owners;
- fake site visits;
- fake verification records;
- test documents;
- synthetic audit records;
- load-test traffic.

## 26.3 Real production data

Never copy raw production data into local/CI/staging unless a separately approved sanitization/export process exists.

Particularly prohibited:

- owner PII;
- lead contact details;
- private exact coordinates;
- legal documents;
- verification evidence;
- internal notes;
- tokens/secrets.

## 26.4 Production storage

Never upload malware-test fixtures, malformed files, EXIF test images or fuzzing artifacts to production storage.

## 26.5 Production email

Automated test submissions must use provider sandboxing/test recipients or a disabled/stub notification adapter.

Never email real customers/owners from CI.

## 26.6 Production mutations

Do not test by:

- publishing/unpublishing real inventory;
- changing real availability;
- changing real verification;
- moving real CRM stages;
- altering real site visits;
- requesting/deleting real signed documents.

Production smoke uses read-only checks plus one explicitly designated safe test workflow if approved and isolated.

## 26.7 Environment protection

Implement a hard fail in test bootstrap:

```text
if environment === "production" → abort
if Supabase project ref === production ref → abort
if base URL === production domain and suite is destructive → abort
```

Maintain the production project ref/domain in CI-protected configuration used only to **block** test execution.

---

# 27. Environment Strategy

## 27.1 Local

Use for:

- fast unit/component;
- local Supabase;
- migration reset;
- RLS;
- integration;
- security attack fixtures.

Local is disposable.

## 27.2 Preview

Use per-PR application build where possible.

Preview must not receive production secrets.

For stateful tests, connect only to isolated staging/branch-safe data environment according to infrastructure capacity.

## 27.3 Staging

Closest functional production mirror.

Contains:

- synthetic inventory;
- synthetic admin;
- staging Supabase;
- staging buckets;
- staging email/Turnstile;
- SEO noindex/access restriction.

Run full:

- E2E;
- accessibility;
- responsive;
- SEO;
- security smoke;
- performance;
- migration validation.

## 27.4 Production

Contains live business data only.

Testing is:

- controlled smoke;
- health;
- canonical/robots/sitemap;
- public page;
- admin login;
- one approved safe form flow;
- provider checks.

No destructive automation.

---

# 28. CI Pipeline and Required Gates

Recommended pipeline:

```text
CHECKOUT
  ↓
npm ci
  ↓
secret scan
  ↓
lint
  ↓
typecheck
  ↓
unit + component
  ↓
start local Supabase
  ↓
db reset/migrations
  ↓
constraints + RLS + storage policy tests
  ↓
integration
  ↓
production build
  ↓
preview deploy
  ↓
Playwright core E2E
  ↓
axe
  ↓
SEO checks
  ↓
security leakage checks
  ↓
merge eligible
```

For release candidate:

```text
staging migration
→ full E2E
→ full responsive
→ accessibility
→ Lighthouse/performance
→ security regression
→ SEO full suite
→ production-build parity
→ release report
→ owner approval gate
```

---

# 29. Coverage Policy

Do not optimize for a vanity 100% line-coverage number.

Required policy:

- all P0 business/security invariants have explicit tests;
- all state-machine transitions have tests;
- all public/private projections have negative tests;
- every Server Action/application service has success + validation + authorization + failure behavior tested;
- every migration that changes security has matching RLS tests;
- every bug involving privacy, security, money-like commercial representation, publication, CRM workflow or SEO gets a permanent regression test.

Suggested starting thresholds once the codebase stabilizes:

```text
critical domain/service modules: ≥ 90% branch coverage
security/privacy/SEO helper modules: ≥ 90% branch coverage
overall application: ≥ 80% statements/lines
```

Coverage threshold exceptions must not allow untested P0 logic.

---

# 30. Flaky Test Policy

A flaky test is a product-maintenance defect.

Rules:

- no permanent `retries: 5` masking;
- E2E retries may be 1 in CI only to collect diagnostics;
- quarantine only with owner, issue and deadline;
- fix nondeterminism;
- use deterministic seed IDs;
- avoid arbitrary sleeps;
- wait for observable state;
- isolate provider integrations;
- freeze time where date logic is under test;
- clean test records transactionally or reset environment.

P0 security tests must not be quarantined for release.

---

# 31. Manual Exploratory QA

Automation does not replace human inspection.

Before major release, manually review:

## Public

- homepage first impression;
- search usability;
- property detail trust clarity;
- sold/rented/leased copy;
- map precision impression;
- verification wording;
- Sell Your Land expectations;
- form error messaging;
- no-results recovery;
- mobile menu/filter sheet.

## Admin

- “what needs attention today?” dashboard;
- publication blocker clarity;
- public vs internal data distinction;
- owner document handling;
- CRM next action;
- site visit confirmation;
- verification scope;
- destructive confirmations;
- mobile operational use.

## Legal/trust copy

Final public verification labels/disclaimer and legally consequential guide copy remain subject to the qualified professional-review requirement established by the verification architecture. Automated tests can enforce approved text/version rules; they cannot substitute for legal review.

---

# 32. Critical Security Regression Cases — Release Checklist

Every pre-release must prove:

- [ ] Anonymous cannot query leads.
- [ ] Anonymous cannot query owner submissions.
- [ ] Anonymous cannot query private party fields.
- [ ] Anonymous cannot query private documents.
- [ ] Anonymous cannot query verification evidence.
- [ ] Anonymous cannot query audit logs.
- [ ] Anonymous cannot query unpublished properties.
- [ ] Anonymous cannot retrieve exact private coordinates.
- [ ] Non-admin cannot use admin mutations.
- [ ] Inactive admin cannot use admin mutations.
- [ ] Direct public CRM inserts are denied.
- [ ] Forged admin/status fields are ignored/rejected.
- [ ] Service-role secret absent from browser bundle.
- [ ] Private signed URL expires.
- [ ] Signed URL cannot be path/document-swapped.
- [ ] Private object path is not public authorization.
- [ ] Public images contain no GPS/private EXIF.
- [ ] XSS fixtures cannot execute.
- [ ] Analytics contains no owner PII/private coordinates.
- [ ] Public email/template contains only public-safe DTO.
- [ ] Errors/logs contain no secrets/private document contents.
- [ ] Staging is not indexable.
- [ ] RLS is enabled on every protected application table.

---

# 33. Release-Gate Checklist

No production release is approved until this checklist is complete.

## 33.1 Source and build

- [ ] Working tree/release commit identified.
- [ ] `npm ci` succeeds.
- [ ] Lint passes.
- [ ] Typecheck passes.
- [ ] Unit tests pass.
- [ ] Component tests pass.
- [ ] Production `npm run build` passes.
- [ ] No unresolved P0/P1 build/runtime errors.
- [ ] No accidental major dependency upgrade in release without review.

## 33.2 Database

- [ ] Clean database migration from zero passes.
- [ ] Upgrade-path migration test passes for changed schema/data.
- [ ] Database lint passes where supported.
- [ ] Constraints pass.
- [ ] Indexes required for critical queries exist.
- [ ] RLS enabled on protected tables.
- [ ] No broad anonymous/authenticated sensitive grants.
- [ ] Production migration set reviewed and known.
- [ ] Destructive migration has explicit risk/rollback plan.
- [ ] Production migration remains approval-gated.

## 33.3 Security/privacy

- [ ] Full RLS negative matrix passes.
- [ ] Exact-coordinate leakage scan passes.
- [ ] Owner PII leakage scan passes.
- [ ] Private-document access tests pass.
- [ ] Storage policy tests pass.
- [ ] Server Action forgery tests pass.
- [ ] XSS/sanitization tests pass.
- [ ] Secret scan passes.
- [ ] Security headers verified.
- [ ] Public preview uses same public projection as production public page.
- [ ] No private/internal fields are present in public DTO snapshots.

## 33.4 Core business workflows

- [ ] Draft → publication blockers → publish passes.
- [ ] Audit write failure prevents publish.
- [ ] Search/filter/pagination passes.
- [ ] Inquiry creates correct lead/activity.
- [ ] Email failure does not undo inquiry.
- [ ] Buyer requirement works without fake property.
- [ ] Sell Your Land submission remains private.
- [ ] Submission conversion creates `DRAFT`, not `PUBLISHED`.
- [ ] Conversion rollback leaves no partial property.
- [ ] Site visit starts `REQUESTED`.
- [ ] Only admin can confirm.
- [ ] Visit confirmation transaction is atomic.
- [ ] CRM allowed-transition matrix passes.
- [ ] CRM forbidden transitions reject.
- [ ] Nurture/lost/closed prerequisites enforced.
- [ ] Terminal lead behavior correct.
- [ ] Verification claim/evidence publish-gate tests pass.
- [ ] Media cover/upload/private separation passes.
- [ ] Sold/rented/leased/off-market public behavior passes.

## 33.5 SEO

- [ ] Primary public content present in initial HTML.
- [ ] Canonical host behavior correct.
- [ ] Every representative indexable route has one valid canonical.
- [ ] Filter/search URLs follow noindex/crawl policy.
- [ ] Page 1 normalization works.
- [ ] Out-of-range pagination behavior correct.
- [ ] Slug redirect is one-hop permanent.
- [ ] Removed property does not redirect generically to homepage.
- [ ] `robots.txt` valid and references sitemap.
- [ ] Sitemap valid XML.
- [ ] Sitemap contains only canonical 200 indexable URLs.
- [ ] Sitemap excludes private/admin/noindex/search states.
- [ ] Structured data validates.
- [ ] POR has no fake numeric price.
- [ ] Structured availability matches visible state.
- [ ] Location privacy matches JSON-LD/OG.
- [ ] Breadcrumbs visible and structured.
- [ ] Staging/preview cannot be indexed.

## 33.6 Accessibility/responsive

- [ ] Axe core-page suite has no serious/critical unresolved violation.
- [ ] Keyboard flows pass.
- [ ] Forms announce/associate errors correctly.
- [ ] Focus handling for dialogs/sheets works.
- [ ] Reduced-motion behavior works.
- [ ] Mobile search/filter usable.
- [ ] Mobile property detail CTA does not cover content.
- [ ] Sell Your Land wizard usable on mobile.
- [ ] Critical admin mobile workflows usable.
- [ ] No unintended horizontal overflow at required viewports.

## 33.7 Performance

- [ ] Lighthouse run recorded for representative pages.
- [ ] No critical LCP/INP/CLS regression from accepted baseline.
- [ ] Primary content is server-rendered.
- [ ] Full property dataset not shipped client-side.
- [ ] Images use responsive/loading strategy.
- [ ] Map/heavy integrations do not block primary content.
- [ ] Search query performance acceptable on scaled synthetic data.
- [ ] No new unbounded query found.

## 33.8 Infrastructure/deployment

- [ ] Staging deployment passes full smoke.
- [ ] Production environment variables are complete.
- [ ] No secret is in `NEXT_PUBLIC_*`.
- [ ] Environment identity is correct.
- [ ] Production Supabase project is separate from staging.
- [ ] Public/private buckets configured.
- [ ] Email configured.
- [ ] Turnstile configured.
- [ ] Map provider configured.
- [ ] Analytics configured.
- [ ] Backup/export completed if migration/data risk exists.
- [ ] Backup restore procedure has been tested according to infrastructure policy.
- [ ] Rollback target/build identified.
- [ ] Production health page reveals state, not secrets.
- [ ] No accidental paid service/auto-recharge enabled.
- [ ] Owner approval obtained for production-only actions.

## 33.9 Final live smoke after approved deployment

Use only safe production checks:

- [ ] Home loads.
- [ ] Results load.
- [ ] Representative property detail loads.
- [ ] Closed-property state correct.
- [ ] Admin login works.
- [ ] Admin private page inaccessible anonymously.
- [ ] Public media loads.
- [ ] Private document remains protected.
- [ ] One approved safe form flow works.
- [ ] Email delivery verified.
- [ ] Turnstile verified.
- [ ] Map verified.
- [ ] Analytics verified.
- [ ] Canonical verified.
- [ ] `robots.txt` verified.
- [ ] `sitemap.xml` verified.
- [ ] Deployment identifier recorded.
- [ ] No P0 errors in logs/health after deployment.

---

# 34. Release Decision

Use only three outcomes.

## PASS

All P0/P1 gates pass. Any remaining P2 issue is documented and does not create privacy/security/legal/business misrepresentation.

## CONDITIONAL HOLD

No known active security leak, but a required staging, accessibility, performance, editorial/legal approval, migration/backup or provider validation is incomplete.

Do not deploy until completed.

## FAIL

Any P0 failure, unresolved P1 with meaningful business/user risk, production build failure, migration uncertainty, RLS/privacy failure, exact-location leak, private-document leak, admin authorization bypass, misleading closed-property state, or uncontrolled SEO/indexing behavior.

---

# 35. Definition of Done — Testing Architecture

This testing plan is considered implemented only when:

- [ ] test framework and scripts exist;
- [ ] CI runs lint/typecheck/unit/component/build;
- [ ] local Supabase clean migration is automated;
- [ ] database constraint tests exist;
- [ ] RLS actor matrix exists;
- [ ] storage security tests exist;
- [ ] public-property privacy canary fixture exists;
- [ ] exact-location leakage scanner exists;
- [ ] private-document abuse suite exists;
- [ ] publication transaction tests exist;
- [ ] inquiry transaction and provider-failure tests exist;
- [ ] Sell Your Land intake/conversion tests exist;
- [ ] site-visit lifecycle tests exist;
- [ ] full CRM transition matrix is tested;
- [ ] verification claim/evidence tests exist;
- [ ] media upload/cover/private tests exist;
- [ ] sold/rented/leased/off-market tests exist;
- [ ] Playwright critical workflow suite exists;
- [ ] accessibility suite exists;
- [ ] responsive viewport suite exists;
- [ ] SEO canonical/robots/sitemap/structured-data suite exists;
- [ ] production build is a required gate;
- [ ] staging full-QA gate exists;
- [ ] performance baseline/budgets exist;
- [ ] test bootstrap refuses production;
- [ ] synthetic data never touches production;
- [ ] release-gate report is produced before production deployment.

---

# 36. Final QA Contract

UrbanEdge Land Space V1 is ready to release only when the team can prove all of the following simultaneously:

> **The public can discover only intentionally published, public-safe land; the owner can submit land without accidentally publishing it; inquiries and site-visit requests reliably enter the brokerage workflow; the admin can operate inventory, verification and CRM only after authorization; private owner/legal data and exact parcel coordinates remain private at database, storage, server and browser boundaries; property/lead/site-visit state machines cannot be bypassed; sold/rented/leased inventory is never misrepresented; SEO outputs are canonical, crawl-controlled and privacy-safe; the application remains accessible, responsive and performant; migrations and production builds are reproducible; and no automated test or synthetic fixture is ever allowed to mutate production.**

That is the release-quality standard for UrbanEdge Land Space V1.
