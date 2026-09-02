# URBANEDGE LAND SPACE — BACKEND / API / BUSINESS LOGIC ARCHITECTURE

**File:** `04-BACKEND-API-BUSINESS-LOGIC.md`  
**System:** UrbanEdge Land Space V1  
**Parent architecture:** `01-MASTER-WEBSITE-ARCHITECTURE.md`  
**UX / route architecture:** `02-PAGE-ROUTE-UX-ARCHITECTURE.md`  
**Database architecture:** `03-DATABASE-SCHEMA-ARCHITECTURE.md`  
**Product requirements:** `LANDSPACE_PRODUCT_REQUIREMENTS.md`  
**Status:** Production backend/application-service contract / coding-agent handoff  
**Launch geography:** Ahmedabad + Gandhinagar, Gujarat  
**Expansion:** Gujarat → India  
**Architecture date:** 29 August 2026

---

# 0. PURPOSE AND AUTHORITY

This document defines the **complete backend/application-service architecture** for UrbanEdge Land Space V1.

It translates the preceding architecture documents into implementable rules for:

- Server Actions;
- Route Handlers;
- server-only application services;
- repositories and query modules;
- request/domain validation boundaries;
- DTOs and public projections;
- property lifecycle and publication logic;
- lead creation and CRM state transitions;
- owner-submission intake and conversion;
- site-visit workflows;
- pricing and area formatting/conversion;
- property-ID generation;
- search-query construction;
- email notification delivery;
- rate limiting and form-abuse controls;
- transaction boundaries;
- concurrency behavior;
- error semantics;
- exact-coordinate privacy;
- private-document privacy;
- audit and cache invalidation behavior.

This document does **not** introduce a separate backend product or contradict the parent architecture. The system remains a single deployable Next.js modular monolith backed by Supabase PostgreSQL/Auth/Storage.

The database architecture explicitly requires server-owned mutations, explicit public-safe projections, scoped verification, separate private/public coordinates, private documents, transactional publishing/inquiry/conversion boundaries, and RLS. The product requirements explicitly make UrbanEdge a curated brokerage-led system where owner submissions do not auto-publish. The UX architecture assigns business behavior to server actions/services rather than form components.

---

# 1. EXECUTIVE ARCHITECTURAL POSITION

UrbanEdge Land Space V1 uses:

```text
Next.js App Router
    +
Server Components
    +
Server Actions
    +
Narrow Route Handlers
    +
Server-only application/domain services
    +
Selective repositories/query modules
    +
Supabase PostgreSQL/Auth/Storage
```

There is deliberately **no**:

- NestJS/Express backend;
- GraphQL layer;
- broad REST API for the website itself;
- microservice fleet;
- Kafka/RabbitMQ event bus;
- generic repository framework;
- giant PL/pgSQL business engine;
- client-owned business persistence model.

The preferred first-party path is:

```text
Public Server Component
    → server query
    → public projection
    → PostgreSQL
```

and:

```text
Public/Admin Client Component
    → Server Action
    → validation / authorization / abuse controls
    → application service
    → repository/query module
    → transaction where required
    → safe result
```

An HTTP Route Handler is introduced only when an actual HTTP endpoint is required by a browser/file/integration protocol.

---

# 2. CORE BACKEND PRINCIPLES

1. **The browser requests operations; it does not decide business state.**
2. **Public database rows are not public DTOs.**
3. **Private data is absent from public projections, not merely hidden in the UI.**
4. **Business workflows belong in application services, not page components.**
5. **Database constraints protect invariants; services protect business workflows.**
6. **Server Actions are the default first-party mutation interface.**
7. **Route Handlers are exceptional and purpose-driven.**
8. **Transactions exist where multiple writes constitute one business fact.**
9. **External network calls should not hold critical database transactions open.**
10. **Email success is not business-state success.**
11. **Owner submission conversion creates a draft property; it never publishes automatically.**
12. **A site-visit request is not a confirmed visit.**
13. **Published does not mean legally guaranteed or title-certified.**
14. **Verification badges are scoped trust signals.**
15. **Property ID is a stable business identifier independent of slug and source land identifiers.**
16. **Search is a typed query specification, never arbitrary SQL from the client.**
17. **Audit records are append-only.**
18. **Business data normally archives rather than hard-deletes.**
19. **No raw owner/document/private-coordinate data enters public analytics, SEO, email or public logs.**
20. **The architecture remains Gujarat-ready without hard-coding Gujarat legal rules as universal Indian rules.**

---

# 3. RESPONSIBILITY MATRIX

| Concern | UI | Server Action | Route Handler | Service | Query/Repository | DB/RLS |
|---|---|---|---|---|---|---|
| Field UX validation | Yes | No | No | No | No | No |
| Input schema validation | No | Entry | Entry | Authoritative | No | Partial |
| Authentication | No | Yes | Yes | Receives actor | No | RLS support |
| Authorization | No | Entry | Entry | Re-check for sensitive workflows | No | RLS |
| Business rules | No | No | No | Yes | No | Invariants |
| Public projection | No | No | No | Yes | Yes | Optional views |
| Search construction | URL/UI only | No | No | Yes | Yes | SQL |
| Property publication | No | Entry | No | Yes | Yes | Transactional constraints |
| Lead creation | No | Entry | Optional | Yes | Yes | Transactional constraints |
| Owner conversion | No | Entry | No | Yes | Yes | Transactional |
| Site-visit confirmation | No | Entry | No | Yes | Yes | Transactional |
| Email | No | No | No | Adapter/service | No | No |
| Rate limiting | Hint only | Yes | Yes | Policy helper | No | Optional backing store |
| Private document access | No | Yes | Yes | Yes | Yes | RLS/storage |
| Exact-coordinate protection | No | No | No | Projection service | Public query only | RLS/separation |
| Audit | No | No | No | Yes | Insert | Append-only |
| Cache invalidation | No | No | No | Emits targets | No | No |

---

# 4. REPOSITORY / FOLDER ARCHITECTURE

Recommended structure:

```text
app/
├── (public)/
│   ├── page.tsx
│   ├── properties/
│   ├── property/[slug]/
│   ├── agricultural-land/
│   ├── na-land/
│   ├── industrial-land/
│   ├── sell-your-land/
│   ├── requirements/
│   ├── site-visit/
│   ├── guides/
│   └── locations/
│
├── (admin)/admin/
│   ├── properties/
│   ├── submissions/
│   ├── leads/
│   ├── visits/
│   ├── verification/
│   ├── content/
│   └── settings/
│
└── api/
    ├── health/route.ts
    ├── uploads/route.ts
    ├── integrations/...
    └── webhooks/...

features/
├── properties/
│   ├── actions/
│   ├── queries/
│   ├── services/
│   ├── domain/
│   ├── schemas/
│   └── dto/
├── search/
├── geography/
├── pricing/
├── media/
├── verification/
├── submissions/
├── leads/
├── site-visits/
├── content/
├── analytics/
└── settings/

server/
├── auth/
├── authorization/
├── db/
├── validation/
├── rate-limit/
├── abuse/
├── audit/
├── notifications/
├── storage/
└── integrations/
    ├── email/
    ├── anti-bot/
    └── maps/

lib/
├── privacy/
├── formatting/
├── seo/
└── utilities/

tests/
├── unit/
├── integration/
└── e2e/
```

## Ownership rules

### `app/`
Framework entry points and route composition only. No large business workflows.

### `features/*/actions/`
Thin Server Action wrappers.

### `features/*/services/`
Business workflows and orchestration.

### `features/*/domain/`
Pure state machines, calculations, validation helpers and rules.

### `features/*/queries/`
Read composition and public/admin query contracts.

### `server/`
Cross-cutting infrastructure that must remain server-only.

### `lib/`
Small cross-cutting pure helpers and framework-neutral utilities.

---

# 5. SERVER-ONLY TRUST BOUNDARY

Any module that can access:

- service-role credentials;
- private documents;
- owner PII;
- exact coordinates;
- admin records;
- internal notes;
- anti-bot secrets;
- email API credentials;
- private storage keys;

must be server-only.

Use an explicit marker where appropriate:

```ts
import "server-only";
```

Public components must never import a privileged service and then try to hide fields later.

Required direction:

```text
UI
  ↓
Action / Page
  ↓
Service / Query
  ↓
Repository / Supabase
```

Forbidden direction:

```text
UI
  ↓
Service-role Supabase client
```

---

# 6. AUTHENTICATION AND ACTOR CONTEXT

## 6.1 Actor types

### Anonymous

Can:

- browse public inventory;
- submit allowed public forms;
- request site visits;
- generate public interaction events.

Cannot read private application state.

### Admin

Authenticated through Supabase Auth and represented by an active `admin_profiles` record.

The UI state `isAdmin === true` is never an authority decision.

## 6.2 Request-scoped actor contract

```ts
type ActorContext =
  | {
      kind: "anonymous";
      requestId: string;
      ipHash?: string;
    }
  | {
      kind: "admin";
      userId: string;
      adminProfileId: string;
      role: string;
      requestId: string;
      ipHash?: string;
    };
```

Resolve actor context at the boundary rather than passing raw Supabase session objects through the entire system.

## 6.3 Admin authorization

`requireAdmin()` must verify:

1. authenticated identity;
2. active admin profile;
3. role/permission for the operation;
4. resource-level authorization where needed.

Authentication answers **who**. Authorization answers **what they may do**.

---

# 7. VALIDATION ARCHITECTURE

Validation is intentionally layered.

## Layer A — client validation

Purpose:

- instant UX feedback;
- required fields;
- basic formatting.

Not trusted.

## Layer B — server request schema

Use one runtime validation system, such as Zod.

Responsibilities:

- type checks;
- lengths;
- enumerations;
- number ranges;
- UUID format;
- consent requirements;
- normalization.

## Layer C — domain validation

Responsibilities:

- cross-field semantics;
- state transitions;
- geography hierarchy;
- publication requirements;
- offer semantics;
- site-visit timing;
- conversion preconditions.

## Layer D — database constraints

Responsibilities:

- foreign keys;
- uniqueness;
- check constraints;
- concurrency invariants;
- archive/deletion rules.

No single layer should be treated as the whole validation system.

---

# 8. INPUT NORMALIZATION

Normalize server-side:

- surrounding whitespace;
- repeated whitespace;
- case where business semantics allow;
- email formatting;
- phone representation;
- empty optional strings to `null` where appropriate;
- property-code lookup format;
- slug format;
- query-string values;
- numeric strings.

Do not normalize away source meaning.

For example, an owner-provided local-unit area must retain:

```text
original value
original unit
normalized value
conversion provenance
```

---

# 9. DTO ARCHITECTURE

Database rows are never public contracts.

## 9.1 `PublicPropertyCardDTO`

Conceptually:

```ts
type PublicPropertyCardDTO = {
  propertyCode: string;
  slug: string;
  category: "AGRICULTURAL" | "NA" | "INDUSTRIAL";
  transaction: "BUY" | "RENT" | "LEASE";
  title: string;
  location: {
    district: string;
    subdistrict?: string;
    locality?: string;
    displayAddress?: string;
    visibility: "EXACT" | "APPROXIMATE" | "HIDDEN";
    latitude?: number;
    longitude?: number;
  };
  area: PublicAreaDTO;
  price: PublicPriceDTO;
  highlights: string[];
  coverMedia?: PublicMediaDTO;
  verificationSignals: PublicVerificationDTO[];
  availability: string;
  publishedAt: string;
};
```

## 9.2 `PublicPropertyDetailDTO`

May additionally include:

- public description;
- category-specific public attributes;
- public planning information;
- approved parcel identifiers;
- public connectivity;
- public media;
- public verification explanations;
- related public properties.

It must not include:

- owner contact;
- private documents;
- private notes;
- broker/source data;
- internal lead relations;
- internal verification notes;
- private coordinates.

## 9.3 Admin DTOs

Admin DTOs may include sensitive operational data, but still should be purpose-built. Never pass entire database rows or storage objects to the UI unnecessarily.

## 9.4 Safe action envelope

```ts
type ActionResult<T> =
  | { ok: true; data: T; requestId: string }
  | {
      ok: false;
      code:
        | "VALIDATION_ERROR"
        | "UNAUTHORIZED"
        | "FORBIDDEN"
        | "NOT_FOUND"
        | "CONFLICT"
        | "RATE_LIMITED"
        | "ABUSE_REJECTED"
        | "BUSINESS_RULE_VIOLATION"
        | "TEMPORARY_FAILURE";
      message: string;
      fieldErrors?: Record<string, string[]>;
      requestId: string;
    };
```

Never return raw SQL, raw Supabase errors, stack traces, storage secrets, or private data.

---

# 10. PUBLIC PROJECTION ARCHITECTURE

The database architecture calls for public-safe projections such as:

```text
public_property_listings
public_property_detail
```

The application must also have explicit TypeScript projection functions:

```text
toPublicPropertyCard()
toPublicPropertyDetail()
toPublicVerification()
toPublicMedia()
toPublicMapPoint()
```

The public property contract should resemble:

```text
propertyCode
slug
category
transaction
title
description
area
price
location
media
scopedVerification
```

and not:

```sql
SELECT * FROM properties;
```

This is a hard rule because schema evolution must not accidentally make new private columns public.

---

# 11. PRIVATE-COORDINATE SECURITY CONTRACT

This is a **hard privacy invariant**.

The database architecture already distinguishes:

- exact/private coordinates;
- public-safe coordinates;
- location visibility.

The application must preserve that separation end-to-end.

## 11.1 Visibility rules

```text
EXACT
  → public exact coordinates only when exact public disclosure is explicitly approved

APPROXIMATE
  → only public-safe approximate coordinates

HIDDEN
  → no public coordinates
```

## 11.2 Forbidden public payload

Never send:

```ts
{
  exactLatitude,
  exactLongitude,
  publicLatitude,
  publicLongitude,
  locationVisibility: "APPROXIMATE"
}
```

and hide exact coordinates in the component. They have already leaked.

## 11.3 Correct public payload

```ts
{
  latitude: publicLatitude,
  longitude: publicLongitude,
  visibility: "APPROXIMATE"
}
```

For `HIDDEN`, coordinates are absent entirely.

## 11.4 Exact coordinate must be absent from

- HTML;
- Server Component props;
- RSC/client payloads;
- JSON-LD;
- public APIs;
- analytics;
- public logs;
- public map props;
- public email templates;
- Open Graph data.

## 11.5 Exact-location approval

Storage of an exact coordinate and approval for public disclosure are different facts. A property being stored exactly does not imply it may be published exactly.

If the schema lacks a distinct approval column, the publication service must enforce the equivalent policy.

---

# 12. PRIVATE-DOCUMENT SECURITY CONTRACT

Owner/legal documents are private business data.

## 12.1 Rules

Private documents:

- live in private storage;
- are not in public DTOs;
- are not in public queries;
- do not get public storage URLs;
- are not indexed;
- are not copied into analytics;
- are not logged.

## 12.2 Signed access

An admin-only signed URL may be created only after:

1. `requireAdmin()`;
2. document lookup;
3. authorization check;
4. retention/archive check.

Generate signed URLs as late as possible.

## 12.3 Storage reference

Persist storage object references, not temporary signed URLs.

## 12.4 Audit

Document access is a sensitive audit action:

```text
DOCUMENT_ACCESS
```

Never audit-log binary contents or raw signed URLs.

## 12.5 Public media vs private documents

`media_assets` and `private_documents` remain separate concepts even though both ultimately use Storage.

A public PDF brochure is public media only after explicit approval. A title deed remains a private document.

---

# 13. SERVER ACTION INVENTORY

Server Actions are the preferred first-party mutation interface.

## Public

```text
submitPropertyInquiry()
submitBuyerRequirement()
submitOwnerLandSubmission()
requestSiteVisit()
recordPublicInteraction()
```

## Properties

```text
createPropertyDraft()
updatePropertyDraft()
duplicatePropertyAsDraft()
requestPropertyReview()
publishProperty()
unpublishProperty()
archiveProperty()
restoreProperty()
changePropertyAvailability()
updatePropertyLocation()
updatePropertyOffer()
```

## Media

```text
registerMedia()
setPropertyCoverMedia()
reorderPropertyMedia()
archiveMediaAsset()
restoreMediaAsset()
```

## Verification

```text
startPropertyVerification()
updatePropertyVerification()
addVerificationEvidence()
completePropertyVerification()
markVerificationForRecheck()
```

## Owner submissions

```text
updateOwnerSubmissionStatus()
requestSubmissionDocuments()
convertOwnerSubmissionToProperty()
rejectOwnerSubmission()
placeOwnerSubmissionOnHold()
closeOwnerSubmission()
```

## CRM

```text
updateLead()
transitionLeadStatus()
addLeadActivity()
matchLeadToProperty()
unmatchLeadFromProperty()
scheduleLeadFollowUp()
recordLeadOutcome()
```

## Site visits

```text
proposeSiteVisit()
confirmSiteVisit()
rescheduleSiteVisit()
completeSiteVisit()
cancelSiteVisit()
recordSiteVisitNoShow()
```

## Content/settings

```text
publishGuide()
unpublishGuide()
archiveGuide()
publishSeoPage()
unpublishSeoPage()
updateAppSetting()
```

Every action remains a thin entry point. The service owns the business workflow.

---

# 14. ROUTE HANDLER POLICY

Route Handlers exist only where HTTP itself is part of the contract.

## Appropriate uses

```text
GET  /api/health
POST /api/uploads/...
POST /api/webhooks/...
POST /api/integrations/...
```

Examples:

- external provider callback;
- signed-upload protocol;
- integration endpoint;
- health endpoint.

## Do not create generic CRUD endpoints

Avoid unnecessary routes such as:

```text
POST /api/properties
POST /api/leads
POST /api/submissions
POST /api/site-visits
```

when the caller is a first-party Next.js UI. Server Actions are simpler and keep the API surface smaller.

## Internal server-to-server calls

A Server Component should not call its own HTTP endpoint to fetch data:

```text
page.tsx → fetch(/api/property) → service → DB
```

Prefer:

```text
page.tsx → query → DB
```

---

# 15. QUERY MODULE ARCHITECTURE

## Public properties

```text
searchPublicProperties(input)
getPublicPropertyBySlug(slug)
getPublicPropertyByCode(code)
getFeaturedPublicProperties(options)
getSimilarPublicProperties(propertyId, options)
```

## Geography

```text
getActiveDistricts()
getActiveSubdistricts(districtId)
getActivePlaces(subdistrictId)
getLocalities(placeId)
resolveGeographySearchTerm(term)
```

## Admin properties

```text
getAdminPropertyById(id)
listAdminProperties(filters)
getPropertyOperationalSummary(id)
getPropertyLinkedLeads(id)
getPropertyVerificationHistory(id)
getPropertyDocuments(id)
```

## Leads

```text
getLeadById(id)
listLeads(filters)
getLeadRequirements(leadId)
getLeadTimeline(leadId)
getLeadProperties(leadId)
getUpcomingFollowUps(window)
```

## Submissions

```text
getOwnerSubmission(id)
listOwnerSubmissions(filters)
getSubmissionDocuments(id)
```

## Visits

```text
getSiteVisit(id)
listSiteVisits(filters)
getTodayVisits()
getUpcomingVisits()
```

---

# 16. SELECTIVE REPOSITORY POLICY

Repositories are useful when persistence complexity is meaningful.

## Appropriate repositories

```text
PropertyRepository
LeadRepository
OwnerSubmissionRepository
SiteVisitRepository
VerificationRepository
```

Useful methods may include:

```text
findPublicBySlug()
findAdminById()
insertDraft()
updateOffer()
lockForPublish()
findLeadByNormalizedPhone()
lockSubmissionForConversion()
lockVisitForConfirmation()
```

## Avoid

Do not build:

```text
BaseRepository<T>
GenericCrudRepository<T>
RepositoryForEveryTable
```

A small query does not need three abstraction layers.

---

# 17. SERVICE INVENTORY

## PropertyService

- create draft;
- update draft;
- duplicate;
- availability;
- archive/restore.

## PublicationService

- publication validation;
- publish/unpublish;
- public-state integrity;
- cache invalidation targets.

## SearchService

- normalize filters;
- resolve codes/aliases;
- construct query specification;
- public projection.

## PricingService

- validate commercial representation;
- format public pricing;
- resolve price display mode.

## AreaService

- validate source area;
- apply conversion rules;
- return normalized values/provenance.

## LeadService

- create/resolve contact;
- create/update requirements;
- property links;
- status transitions;
- activity timeline.

## OwnerSubmissionService

- public intake;
- status transitions;
- document requests;
- conversion.

## SiteVisitService

- request;
- proposal;
- confirmation;
- reschedule;
- completion/cancellation.

## VerificationService

- check lifecycle;
- evidence;
- scoped public signal.

## MediaService

- media registration;
- cover;
- ordering;
- archive;
- public/private classification.

## NotificationService

- notification intent;
- provider adapter;
- retry/failure state.

---

# 18. PROPERTY STATE MODEL

Publication and availability are separate dimensions.

## Publication

```text
DRAFT
  ↓
UNDER_REVIEW
  ↓
PUBLISHED
  ↓
UNPUBLISHED
  ↓
ARCHIVED
```

Possible restoration:

```text
ARCHIVED → DRAFT / UNDER_REVIEW
```

## Availability

```text
AVAILABLE
UNDER_NEGOTIATION
SOLD
RENTED
LEASED
OFF_MARKET
```

Examples that must be possible:

```text
PUBLISHED + SOLD
PUBLISHED + UNDER_NEGOTIATION
DRAFT + AVAILABLE
UNPUBLISHED + AVAILABLE
```

Public search may exclude unavailable inventory while public detail may continue to show a sold/leased property for a controlled period.

---

# 19. PROPERTY STATE-TRANSITION RULES

Recommended transitions:

```text
DRAFT → UNDER_REVIEW
DRAFT → PUBLISHED         [only through publish service]
UNDER_REVIEW → DRAFT
UNDER_REVIEW → PUBLISHED
PUBLISHED → UNPUBLISHED
PUBLISHED → ARCHIVED
UNPUBLISHED → UNDER_REVIEW
UNPUBLISHED → PUBLISHED
UNPUBLISHED → ARCHIVED
ARCHIVED → DRAFT          [explicit restore]
```

All high-impact transitions are service-controlled and audited.

Never allow generic admin code to write `publication_status` arbitrarily.

---

# 20. PROPERTY ID GENERATION

Canonical V1 identifier:

```text
UE-LS-000001
```

Rules:

- PostgreSQL sequence-backed;
- concurrency safe;
- six decimal digits;
- immutable;
- never reused;
- independent of slug;
- independent of land category;
- not a survey/parcel/government ID.

Forbidden:

```text
SELECT MAX(property_code)
```

or client-side counters.

Recommended mechanism:

```text
nextval(urbanedge_property_code_seq)
    ↓
UE-LS-%06d
```

The code should be allocated at property creation and returned as part of the draft/admin DTO.

If the sequence reaches `999999`, creation must stop rather than silently changing the public identifier contract.

---

# 21. PROPERTY SLUG RULES

Property slug is separate from Property ID.

Rules:

- human-readable;
- unique among non-deleted records;
- generated deterministically;
- stable after publication unless an explicit admin change occurs;
- title changes do not silently create URL churn;
- slug change requires audit and redirect/canonical strategy.

---

# 22. PROPERTY DRAFT CREATION

`createPropertyDraft()`:

```text
requireAdmin
  ↓
parse + normalize
  ↓
validate draft shape
  ↓
allocate property UUID
  ↓
allocate UE-LS code
  ↓
insert properties
  ↓
insert supplied extension/offer/location records
  ↓
audit CREATE
  ↓
return AdminPropertyDraftDTO
```

A draft may be incomplete.

A draft is not publicly searchable.

---

# 23. PUBLISHING VALIDATION

Publishing is a controlled business decision.

## Base requirements

A publishable property must have:

- valid Property ID;
- title;
- category;
- supported transaction;
- valid active geography;
- area;
- public description;
- valid price representation;
- valid slug;
- public contact path;
- public-safe location representation;
- approved public media or explicit no-image approval;
- valid category-specific data;
- no publication-blocking unresolved issue.

## Category rules

### Agricultural

Minimum:

- category;
- area;
- location;
- description.

Optional typed/public fields may include irrigation, water source, road access, fencing, soil, current use.

### NA

Minimum:

- category;
- area;
- location;
- description.

Any public NA/status claim must be supported by the appropriate stored evidence and scoped wording.

### Industrial

Minimum:

- category;
- area;
- location;
- description.

If GIDC is claimed, the GIDC relationship/estate context must be internally consistent.

## Offer rules

### POR

```text
price_mode = PRICE_ON_REQUEST
```

No numeric total required.

### Exact total

```text
price_mode = EXACT_TOTAL
price_total > 0
currency = INR
```

### Range

```text
minimum > 0
maximum > 0
minimum <= maximum
```

### Per unit

```text
unit_price > 0
price_basis is defined
```

### Negotiability

`is_negotiable` is separate from the price mode.

---

# 24. PUBLICATION BLOCKER DTO

Example:

```ts
type PublicationBlocker = {
  code:
    | "MISSING_TITLE"
    | "MISSING_DESCRIPTION"
    | "MISSING_LOCATION"
    | "INVALID_AREA"
    | "MISSING_PRIMARY_OFFER"
    | "MISSING_PUBLIC_MEDIA"
    | "INVALID_CATEGORY_DATA"
    | "PRIVATE_LOCATION_NOT_SAFE"
    | "VERIFICATION_REQUIRED"
    | "INVALID_SLUG";
  message: string;
  fieldPath?: string;
};
```

Admin UI should display these as actionable problems rather than a generic failure.

---

# 25. PUBLISH TRANSACTION

Publishing must be atomic.

```text
BEGIN
  lock property
  load/lock active offer state
  validate publication requirements
  validate location privacy
  validate category extension
  validate public media
  validate public verification output
  transition publication state
  set published_at
  set published_by
  insert audit row
COMMIT

post-commit:
  revalidate public paths/tags
  optional notification
```

If any business validation fails, nothing is published.

External calls must not be performed inside the transaction.

---

# 26. PROPERTY UPDATES AFTER PUBLICATION

High-impact changes:

- category;
- transaction;
- public location visibility;
- public coordinate;
- material land-use claim;
- verification signal;
- parcel/public identifier exposure;
- owner relationship.

These require explicit validation and audit; material changes may return the property to review according to policy.

Routine changes such as description/media order can remain published if publication requirements still pass.

Price and availability changes require audit because they materially affect conversion/business state.

---

# 27. PRICE / OFFER SERVICE

`property_offers` is the source of truth for price/offer semantics.

Public representation:

```ts
type PublicPriceDTO = {
  mode: "POR" | "EXACT_TOTAL" | "RANGE" | "PER_UNIT";
  primaryLabel: string;
  secondaryLabel?: string;
  currency?: "INR";
  negotiable?: boolean;
};
```

## INR formatting

Use Indian grouping:

```text
₹25,00,000
₹1,25,00,000
```

Abbreviated forms may be used where the UI deliberately chooses them:

```text
₹25 Lakh
₹1.25 Cr
```

Detailed property pages should prefer precise, unambiguous values.

## POR

Render:

```text
Price on Request
```

Never treat a null numeric price as `₹0`.

## Per-unit

Always include the basis:

```text
₹18,000 / sq yd
```

## Rent/Lease

Use the offer's actual commercial semantics. Do not infer legal contract meaning from a UI label.

---

# 28. AREA CONVERSION SERVICE

The source area model must preserve original value/unit and standardized metrics.

```ts
type AreaInput = {
  value: number;
  unitId: string;
};
```

Output:

```ts
type AreaResult = {
  original: {
    value: number;
    unitCode: string;
    unitLabel: string;
  };
  standardized: {
    squareFeet?: number;
    squareYard?: number;
    squareMetre?: number;
    acre?: number;
    hectare?: number;
  };
  normalizationStatus:
    | "AUTHORITATIVE"
    | "SOURCE_DECLARED"
    | "PROVISIONAL"
    | "UNKNOWN";
  conversionReference?: string;
};
```

Conversions must use `area_conversion_rules`.

Do not hard-code ambiguous local units in components.

Store enough precision for comparison/filtering; format separately for display.

---

# 29. GEOGRAPHY VALIDATION

The normalized hierarchy is:

```text
Country
→ State
→ District
→ Subdistrict/Taluka
→ Place
→ Locality
```

Planning authority, TP scheme, TP plot, GIDC estate and source identifiers are separate dimensions.

When a mutation receives multiple geography IDs, verify their hierarchy.

Example invalid request:

```text
district = Ahmedabad
place = Gandhinagar place
```

must be rejected even if both IDs are structurally valid UUIDs.

---

# 30. PUBLIC SEARCH ARCHITECTURE

Search input becomes a typed query specification before reaching persistence.

```ts
type PublicPropertySearchQuery = {
  keyword?: string;
  propertyCode?: string;
  category?: LandCategory[];
  transaction?: TransactionType[];
  districtIds?: string[];
  subdistrictIds?: string[];
  placeIds?: string[];
  localityIds?: string[];
  price?: {
    min?: number;
    max?: number;
    includePor?: boolean;
  };
  area?: {
    min?: number;
    max?: number;
    unitId?: string;
  };
  availability?: string[];
  priceModes?: string[];
  roadAccess?: string;
  roadWidthMin?: number;
  sort: "NEWEST" | "OLDEST" | "PRICE_LOW" | "PRICE_HIGH" | "AREA_LARGE" | "AREA_SMALL";
  page: number;
  pageSize: number;
};
```

## Normalization

- trim;
- cap keyword length;
- cap page size;
- reject unknown sort;
- reject negative ranges;
- clamp page values;
- validate UUIDs;
- resolve aliases where useful.

Suggested operational limits:

```text
page >= 1
pageSize <= 48
keyword <= 120 chars
```

These are configuration-level limits, not business meaning.

---

# 31. SEARCH QUERY CONSTRUCTION

Pipeline:

```text
URL/query input
   ↓
parseSearchParams()
   ↓
normalizeSearchInput()
   ↓
validateSearchInput()
   ↓
buildPropertySearchSpec()
   ↓
execute indexed DB query
   ↓
public projection
   ↓
pagination result
```

No raw SQL fragment, `ORDER BY` expression or `SELECT` clause can originate from the browser.

---

# 32. SEARCH SEMANTICS

## Across dimensions

Default:

```text
AND
```

Example:

```text
category IN (NA, INDUSTRIAL)
AND district = Gandhinagar
AND area >= 10000
```

## Within a dimension

Use OR semantics for multi-select values:

```text
category IN (...)
```

## Property code

`UE-LS-000001` is an exact identity lookup, not fuzzy search.

## Keyword search

Use public-safe indexed fields such as:

- public title;
- public description;
- public geography names/aliases;
- public category vocabulary;
- property code.

Never keyword-search:

- owner phone;
- internal notes;
- private documents;
- broker source;
- internal verification notes.

---

# 33. PRICE FILTER SEMANTICS

POR listings do not have a comparable numeric price.

Recommended rule:

```text
numeric price filter
    → numeric offers only
    → POR excluded by default
```

An explicit `includePor` option may include them as a separate result class if product UX later requires it.

Never treat missing numeric price as zero.

---

# 34. AREA FILTER SEMANTICS

Compare normalized area values according to known conversion rules.

Do not compare source strings or local-unit names directly.

If conversion is ambiguous or provisional, the system should either:

- use only authoritative normalized fields;
- or exclude the record from strict numeric filtering while still allowing it in ordinary browsing.

This behavior should be explicit, not silently approximate.

---

# 35. SEARCH SORTING AND PAGINATION

Allowed sorts only:

```text
NEWEST
OLDEST
PRICE_LOW
PRICE_HIGH
AREA_LARGE
AREA_SMALL
```

Add deterministic tie-breakers, for example:

```text
updated_at DESC, id DESC
```

Use server-side pagination.

Do not fetch the entire public dataset into the browser.

Future cursor pagination can be introduced behind the same query-service interface if inventory growth requires it.

---

# 36. PUBLIC PROPERTY DETAIL QUERY

`getPublicPropertyBySlug()` must:

1. normalize slug;
2. enforce public eligibility in the query;
3. fetch public-safe geography;
4. fetch active public offer;
5. fetch approved public media;
6. fetch public verification summaries;
7. fetch allowed category/planning information;
8. convert location through the privacy projection;
9. produce `PublicPropertyDetailDTO`.

It must never load owner/private-document records merely because they are convenient joins.

---

# 37. SIMILAR PROPERTY SERVICE

Deterministic V1 priority:

1. same category;
2. same transaction;
3. same district;
4. same subdistrict;
5. similar area;
6. similar numeric price;
7. exclude current property;
8. exclude unpublished/off-market inventory unless explicitly configured.

No AI recommendation infrastructure is necessary for V1.

---

# 38. LEAD CREATION MODEL

Lead data requirements include:

- lead ID/reference;
- name;
- phone;
- email;
- source;
- inquiry type;
- buyer type;
- preferred transaction;
- land type;
- budget;
- desired area min/max;
- district/taluka/locality;
- intended use;
- status;
- next follow-up;
- last contacted;
- notes.

A lead may link to many properties.

A property may link to many leads.

---

# 39. PROPERTY INQUIRY FLOW

```text
submitPropertyInquiry()
  ↓
request context
  ↓
rate limit
  ↓
honeypot / anti-bot
  ↓
request schema validation
  ↓
public property eligibility
  ↓
contact normalization
  ↓
TRANSACTION
    resolve/create party
    create/reuse lead as policy allows
    create/merge requirement profile if supplied
    link property
    create LEAD_CREATED activity
    create relevant activity
  ↓
COMMIT
  ↓
notification
  ↓
return safe lead reference
```

---

# 40. LEAD DEDUPLICATION

A normalized phone number is the primary practical contact identity signal.

Email can be a secondary signal.

Name alone is never sufficient for automatic identity merge.

Recommended behavior:

- same phone + active related lead → reuse party, create new activity/property relation where appropriate;
- same phone + materially new business intent → create a new lead while reusing party;
- historical closed lead → new lead may be created;
- ambiguous match → admin review rather than automatic merge.

---

# 41. LEAD CREATION TRANSACTION

The core business operation must be atomic:

```text
BEGIN
  resolve/create party
  create lead
  create/update active requirement profile
  create lead-property relation if applicable
  create activity
COMMIT
```

Email is not part of this transaction.

If notification fails after commit, the lead still exists.

---

# 42. BUYER REQUIREMENT SUBMISSION

`submitBuyerRequirement()` creates a lead-bearing requirement workflow.

Conceptually:

```text
party
+
lead
+
lead_requirements
+
LEAD_CREATED activity
+
REQUIREMENT_UPDATED activity
```

The server owns the lead status. The browser cannot submit `QUALIFIED`, `MATCHED`, or any other internal state.

---

# 43. LEAD STATE MACHINE

Authoritative V1 statuses:

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
WON
LOST
NURTURE
CLOSED
```

Rules:

- `NEW` is initial state;
- `CONTACT_ATTEMPTED` requires a contact-attempt activity;
- `QUALIFIED` requires admin qualification;
- `REQUIREMENT_CONFIRMED` requires reviewed requirement data;
- `PROPERTY_MATCHED` requires at least one meaningful property relation;
- `SITE_VISIT_CONFIRMED` requires an actual confirmed site visit;
- `WON` requires a real outcome;
- `LOST` should use structured loss reason where supported;
- `NURTURE` should have a future follow-up or explicit reactivation policy.

---

# 44. LEAD STATUS TRANSITION SERVICE

Use:

```text
transitionLeadStatus(leadId, nextStatus, reason?)
```

Service validates:

- current state;
- allowed next state;
- required activity;
- required reason/note;
- site-visit dependencies.

Transactionally update:

```text
lead.status
+
lead.updated_at
+
STATUS_CHANGED activity
+
audit
```

---

# 45. LEAD-PROPERTY MATCHING

`lead_properties` is many-to-many.

Matching may store an internal deterministic score.

Potential score dimensions:

- category;
- transaction;
- district;
- subdistrict;
- area fit;
- budget fit;
- intended use;
- availability.

The score is an internal operational aid, not a public guarantee.

---

# 46. PROPERTY AVAILABILITY DURING INQUIRY

A property may change state between page render and form submit.

The server must re-check current public eligibility.

If unavailable, a safe workflow may:

- create a general lead for alternatives;
- mark the specific property relation as unavailable/stale;
- route the lead to similar-property follow-up.

Do not create a false impression that the target property is still available.

---

# 47. SELL YOUR LAND — PUBLIC SUBMISSION

The owner workflow is:

```text
submitOwnerLandSubmission()
  ↓
rate limit
  ↓
honeypot / anti-bot
  ↓
request validation
  ↓
consent check
  ↓
geography validation
  ↓
area validation
  ↓
contact normalization
  ↓
TRANSACTION
    resolve/create party
    create owner_submission
    attach already-registered private documents where applicable
  ↓
COMMIT
  ↓
admin notification
  ↓
return submission reference
```

The result is a **submission reference**, not a Property ID.

---

# 48. OWNER SUBMISSION STATE MACHINE

Source workflow:

```text
NEW
CONTACTED
DOCS_REQUESTED
UNDER_REVIEW
VERIFICATION_PENDING
APPROVED
REJECTED
ON_HOLD
CONVERTED
CLOSED
```

Typical transitions:

```text
NEW → CONTACTED
CONTACTED → DOCS_REQUESTED / UNDER_REVIEW
DOCS_REQUESTED → UNDER_REVIEW
UNDER_REVIEW → VERIFICATION_PENDING / APPROVED / REJECTED
VERIFICATION_PENDING → APPROVED / ON_HOLD
APPROVED → CONVERTED
ON_HOLD → UNDER_REVIEW
REJECTED → CLOSED
CONVERTED → CLOSED
```

Reversal is allowed only through explicit admin action with audit.

---

# 49. OWNER-SUBMISSION CONVERSION

`convertOwnerSubmissionToProperty()` is a protected business operation.

## Preconditions

- admin authorized;
- submission not already converted;
- conversion-eligible status;
- minimum required structured data exists;
- category is valid;
- primary transaction is valid.

## Transaction

```text
BEGIN
  lock submission
  verify converted_property_id IS NULL
  allocate property UUID
  allocate UE-LS code
  create properties row
  create category extension row
  create property location
  create property offer where supplied
  create property parcel(s) where approved data exists
  create property-party owner relationship
  create source/submission relation
  associate approved private documents
  initialize verification records where applicable
  set submission status = CONVERTED
  set converted_property_id
  write audits
COMMIT
```

The resulting property is always:

```text
DRAFT
```

Publishing is a separate operation.

---

# 50. CONVERSION FIELD-MAPPING POLICY

Automatically reusable source facts:

- category;
- transaction;
- geography;
- original/source area;
- source description;
- owner relationship;
- private documents;
- source media references.

Require admin curation before public use:

- title;
- public description;
- price display;
- public location mode;
- public coordinate;
- verification badges;
- public media selection;
- public parcel identifiers.

Never copy directly to public output:

- owner phone/email;
- minimum acceptable price;
- internal notes;
- private coordinate;
- raw document URLs;
- bypass-risk notes;
- internal verification comments.

---

# 51. SITE-VISIT REQUEST

`requestSiteVisit()` creates a request, not a booking.

Input:

- contact/lead identity;
- property ID;
- preferred start/end;
- optional alternative time;
- message;
- consent.

Flow:

```text
anti-abuse
  ↓
validation
  ↓
public property eligibility
  ↓
TRANSACTION
  party
  lead
  property relation
  site_visit = REQUESTED
  activity
COMMIT
  ↓
admin notification
```

---

# 52. SITE-VISIT STATE MACHINE

```text
REQUESTED
CONTACTED
PROPOSED
CONFIRMED
COMPLETED
CANCELLED
NO_SHOW
RESCHEDULED
```

Rules:

- public request starts at `REQUESTED`;
- only admin action can confirm;
- confirmation requires a confirmed time;
- completion requires an actual visit outcome;
- rescheduling does not silently overwrite historical context;
- sold/off-market properties cannot be blindly confirmed.

---

# 53. SITE-VISIT CONFIRMATION TRANSACTION

```text
BEGIN
  lock site visit
  validate current status
  validate requested/proposed time
  validate property operational availability
  set confirmed timestamps
  set status = CONFIRMED
  transition lead if appropriate
  add SITE_VISIT_CONFIRMED activity
  audit
COMMIT
```

No calendar provider is required in V1.

---

# 54. MEDIA SERVICE

Responsibilities:

- registration;
- visibility;
- ordering;
- cover selection;
- archive/restore;
- public-safe URL generation.

## Cover invariant

At most one active public cover per property.

Use database partial uniqueness plus a transaction.

## Public media

Public eligibility requires:

```text
visibility = PUBLIC
AND not archived
AND property/publication policy allows publication
```

Private document records never satisfy public media requirements.

---

# 55. MEDIA UPLOAD BOUNDARY

Recommended two-phase flow:

```text
request upload authorization
  ↓
validate file constraints
  ↓
perform upload
  ↓
register media/document metadata
```

Do not treat a successful Storage upload as automatic public publication.

Accepted file types should remain narrow and configurable, for example:

```text
PDF
JPG/JPEG
PNG
WEBP
```

Exact size/count limits belong in configuration.

---

# 56. PRIVATE DOCUMENT UPLOAD

Document upload must validate:

- file type;
- actual file safety where practical;
- size;
- number of files;
- filename length;
- suspicious extensions/double extensions.

Private storage reference is persisted only after successful upload registration.

Do not place document contents into logs, analytics, emails or audit snapshots.

---

# 57. VERIFICATION SERVICE

Verification is scoped and evidence-backed.

Possible V1 signals include:

```text
DOCUMENT_REVIEWED
LOCATION_REVIEWED
SITE_VISITED
SURVEY_REFERENCE_REVIEWED
LAND_USE_REVIEWED
PLANNING_REFERENCE_REVIEWED
```

Public output should contain:

```text
signal type
status
public label
public explanation
reviewed date
recheck date when relevant
```

Do not expose:

- internal note;
- raw evidence file ID;
- reviewer contact;
- private legal assessment.

---

# 58. VERIFICATION SEMANTICS

`PUBLISHED` is not `VERIFIED`.

`VERIFIED` is not a universal database state.

A scoped check such as:

```text
Location Reviewed
```

must not silently become:

```text
Legally Clear Property
```

The application must keep publication validation and verification correctness as separate concerns.

`recheck_at` is an operational reminder, not a universal statutory expiry rule.

---

# 59. NOTIFICATION ARCHITECTURE

Email is a notification integration.

Core business state lives in PostgreSQL.

Notification types may include:

```text
ADMIN_NEW_LEAD
ADMIN_OWNER_SUBMISSION
ADMIN_SITE_VISIT_REQUEST
PUBLIC_INQUIRY_ACK
PUBLIC_OWNER_SUBMISSION_ACK
PUBLIC_SITE_VISIT_REQUEST_ACK
```

The exact V1 set may be smaller, but notification behavior must remain isolated from core business persistence.

---

# 60. EMAIL FLOW

Correct order:

```text
validate
  ↓
abuse controls
  ↓
DB transaction
  ↓
COMMIT
  ↓
notification service
  ↓
email provider
```

Never keep a property/lead transaction open while waiting for an email provider.

## Failure semantics

```text
DB success + email failure
    → business operation remains successful
    → notification failure recorded
```

```text
DB failure + email would have succeeded
    → business operation fails
    → do not report success based on email
```

---

# 61. EMAIL IDEMPOTENCY

Use an idempotency key where practical:

```text
ADMIN_NEW_LEAD:{leadId}
PUBLIC_INQUIRY_ACK:{leadId}
SITE_VISIT_CONFIRMATION:{visitId}:{confirmedStartAt}
```

This prevents action retries from producing duplicate notifications.

---

# 62. EMAIL TEMPLATE SAFETY

Templates receive dedicated DTOs.

Example:

```ts
type AdminNewLeadEmailDTO = {
  leadReference: string;
  contactName: string;
  contactPhone: string;
  inquiryType: string;
  propertyCode?: string;
  propertyTitle?: string;
  source: string;
  createdAt: string;
};
```

Never pass a complete database row to an email renderer.

Public acknowledgement emails must never contain:

- private coordinates;
- private document links;
- owner PII;
- internal notes;
- internal verification commentary.

---

# 63. RATE LIMITING

Required for public mutations:

```text
submitPropertyInquiry
submitBuyerRequirement
submitOwnerLandSubmission
requestSiteVisit
```

Also rate-limit expensive or abuse-sensitive upload initialization.

Rate-limit key may use:

```text
action + privacy-preserving IP hash + route
```

and optionally a normalized phone hash for form abuse protection.

Do not retain raw IP data longer than the chosen operational/privacy policy requires.

Limits should be action-specific and configurable rather than one global number.

---

# 64. FORM ABUSE CONTROLS

Use multiple layers:

## Honeypot

Hidden field that normal users never fill.

## Turnstile / anti-bot

If enabled:

```text
client token
  ↓
server verification
  ↓
provider response
```

Do not trust a client-reported success value.

## Rate limit

Still required even with CAPTCHA/Turnstile.

## Timing heuristic

Optionally reject implausibly fast submissions, but never use this as the sole control.

## Duplicate submission guard

Short-lived idempotency key/payload fingerprint.

## Payload limits

Cap:

- names;
- emails;
- phones;
- message size;
- URL count;
- document count/size.

## Plain-text fields

Escape/strip arbitrary HTML from public text unless a separately sanitized rich-text path exists.

If abuse is rejected, do not create partial CRM/submission records.

---

# 65. PUBLIC MUTATION SECURITY PIPELINE

Every public mutation follows:

```text
Request
  ↓
requestId
  ↓
rate limit
  ↓
honeypot
  ↓
anti-bot
  ↓
request schema
  ↓
normalization
  ↓
domain validation
  ↓
public eligibility check
  ↓
transaction
  ↓
commit
  ↓
post-commit notification/revalidation
  ↓
safe ActionResult
```

---

# 66. TRANSACTION BOUNDARIES

A transaction is required when multiple writes represent one business fact.

## Must be transactional

- property draft + related core rows where atomicity is required;
- property publication;
- property archive/unpublish plus audit;
- availability transition plus audit/activity;
- public inquiry creation;
- buyer requirement creation;
- owner submission creation;
- owner submission conversion;
- lead status transition;
- site-visit confirmation;
- site-visit cancellation where lead/audit state also changes;
- verification completion with evidence/state changes;
- cover-media reassignment;
- primary-offer reassignment.

## No transaction required

- public read;
- search;
- price formatting;
- area calculation when not persisting results;
- WhatsApp URL creation;
- Google Maps navigation URL generation;
- email delivery itself;
- route revalidation;
- ordinary analytics emission.

---

# 67. TRANSACTION IMPLEMENTATION REQUIREMENT

Do not claim atomicity across multiple independent HTTP calls.

If the selected Supabase access pattern cannot create a real PostgreSQL transaction, use a narrowly scoped PostgreSQL RPC/function or another supported server-side transactional mechanism.

A real transaction means:

```text
BEGIN
writes
COMMIT
```

not:

```text
call 1 succeeded
call 2 succeeded
therefore it is transactional
```

---

# 68. DATABASE RPC POLICY

Good uses:

- property-code allocation;
- atomic cover update;
- atomic primary-offer update;
- tightly bounded owner-submission conversion;
- tightly bounded lead creation where required.

Bad uses:

- rendering DTOs;
- sending email;
- general business orchestration;
- external provider calls;
- giant CRM workflows.

Keep SQL functions small, typed and testable.

---

# 69. OWNER CONVERSION RPC OPTION

If application-level Supabase calls cannot be composed transactionally, a narrow function such as:

```text
convert_owner_submission_to_property(...)
```

may atomically:

- lock submission;
- allocate Property ID;
- create property;
- copy approved relations;
- mark submission converted;
- return new property identity.

Authorization and precondition validation remain application responsibilities.

---

# 70. CONCURRENCY CONTROL

## Property ID

Sequence-based.

## Publish

Lock property or use conflict-safe version/state checks.

## Cover media

Database unique partial index + transaction.

## Primary offer

Database unique partial index + transaction.

## Owner conversion

Lock submission and require `converted_property_id IS NULL`.

## Site-visit confirmation

Lock visit and reject a stale concurrent mutation.

## Lead transitions

Use status comparison/row locking for high-value transitions.

---

# 71. OPTIMISTIC CONCURRENCY FOR ADMIN EDITS

For admin forms where overwrite is costly, use `updated_at` as a version token.

Pattern:

```text
client loaded updated_at = T1
        ↓
admin edits
        ↓
update WHERE id = X AND updated_at = T1
```

If no row updates:

```text
CONFLICT
```

Do not silently overwrite a newer edit.

---

# 72. IDEMPOTENCY

Public actions should use short-lived idempotency for expensive duplicate-sensitive operations:

- inquiry;
- buyer requirement;
- owner submission;
- site-visit request.

Server behavior:

1. validate token;
2. detect recent successful operation;
3. return prior safe reference when appropriate;
4. avoid duplicate business records.

Idempotency storage is not a long-term CRM record.

---

# 73. PROPERTY AVAILABILITY SERVICE

`changePropertyAvailability()` must:

1. authenticate;
2. authorize;
3. validate current → next transition;
4. transactionally update availability;
5. write audit;
6. optionally add affected lead activities when explicitly configured;
7. revalidate public inventory.

Do not mass-notify every linked lead automatically in V1.

---

# 74. PUBLIC AVAILABILITY SEMANTICS

Public search should normally show only currently marketable listings.

A public detail may remain accessible for controlled historical/SEO purposes, for example:

```text
PUBLISHED + SOLD
```

In that case:

- show the sold state;
- remove primary conversion actions if appropriate;
- show similar properties;
- retain general UrbanEdge contact.

Never imply current availability after the record is known to be sold/leased/rented.

---

# 75. LEAD LOSS REASONS

Recommended structured reasons:

```text
BUDGET_MISMATCH
LOCATION_MISMATCH
SIZE_MISMATCH
PROPERTY_SOLD
PROPERTY_UNAVAILABLE
ELIGIBILITY_REQUIRES_CONFIRMATION
LEGAL_DOCUMENT_CONCERN
TIMING_CHANGED
COMPETITOR_PROPERTY
BUYER_UNRESPONSIVE
NOT_INTERESTED
DUPLICATE
OTHER
```

Free text supplements the structured reason.

---

# 76. FOLLOW-UP MANAGEMENT

Lead follow-up fields remain operational:

- next follow-up date;
- follow-up type;
- note;
- completion state.

Dashboard queries derive:

```text
OVERDUE
TODAY
NEXT_7_DAYS
```

Do not store redundant `isOverdue` unless a later performance requirement justifies denormalization.

---

# 77. ANALYTICS VS AUDIT

## Analytics

Describes user behavior:

- property view;
- search usage;
- WhatsApp click;
- call click;
- form start/submit.

## Audit

Describes admin/business changes:

- publish;
- unpublish;
- price change;
- availability change;
- verification change;
- document access;
- submission conversion.

Analytics never replaces audit.

---

# 78. SAFE ANALYTICS PAYLOADS

Analytics may contain:

```text
public property ID
public Property Code
route
event type
safe timestamp
```

Do not send:

- phone;
- email;
- owner name;
- private coordinates;
- document IDs;
- internal notes;
- internal verification comments.

A WhatsApp click is an analytics event, not automatically a CRM lead.

---

# 79. LOGGING POLICY

Every request should have:

```text
requestId
route/action
safe actor kind
duration
outcome
error category
safe entity reference
```

Never log:

- passwords;
- auth tokens;
- signed URLs;
- document contents;
- exact private coordinates;
- anti-bot secrets;
- unnecessary raw PII.

---

# 80. ERROR SEMANTICS

Use a small, stable error vocabulary.

## `VALIDATION_ERROR`

Input shape/field issue.

## `UNAUTHORIZED`

No required authentication.

## `FORBIDDEN`

Authenticated but not authorized.

## `NOT_FOUND`

Resource is unavailable to the caller.

For public properties, do not reveal that a missing property exists internally but is unpublished.

## `CONFLICT`

Examples:

- stale edit;
- already converted submission;
- already confirmed site visit;
- state changed concurrently.

## `RATE_LIMITED`

Use safe retry-later message.

## `ABUSE_REJECTED`

Generic anti-abuse response; do not reveal detection signals.

## `BUSINESS_RULE_VIOLATION`

Valid shape but invalid operation.

## `TEMPORARY_FAILURE`

Transient infrastructure/provider issue.

---

# 81. ERROR TRANSLATION

Typical mappings:

```text
Unique violation
  → CONFLICT

Foreign-key violation
  → VALIDATION_ERROR or BUSINESS_RULE_VIOLATION

Check constraint failure
  → BUSINESS_RULE_VIOLATION

RLS denial
  → FORBIDDEN

Timeout
  → TEMPORARY_FAILURE

Provider email failure
  → notification failure, not mutation failure
```

Never expose:

- SQL constraint names;
- table names;
- stack traces;
- provider internals.

---

# 82. PUBLIC ERROR PRIVACY

A public request for:

```text
unpublished-property-id
```

must not return:

```text
Property exists but is unpublished.
```

Return not-found/safe-unavailable semantics.

Similarly, a public error must never expose owner data, document paths, private coordinates, or database details.

---

# 83. ADMIN ERROR UX

Admin errors may be more informative but still safe.

Example:

```text
Property could not be published.

Blocked checks:
- public-safe map point missing
- cover image not selected
```

This is preferable to:

```text
PGRST... foreign key violation ...
```

---

# 84. CACHE / REVALIDATION CONTRACT

After successful public-state mutations, invalidate only affected public surfaces.

Examples:

## Publish

- property detail;
- property search;
- category page;
- district/location page;
- homepage featured inventory;
- sitemap when relevant.

## Unpublish/archive

Same surfaces as applicable.

## Availability

Property detail + active search/location/category surfaces.

Services can return:

```ts
{
  paths: string[];
  tags?: string[];
}
```

Framework-specific revalidation happens outside the business transaction after commit.

---

# 85. CACHE PRIVACY

Never publicly cache:

- lead DTOs;
- owner PII;
- private coordinates;
- private documents;
- admin DTOs;
- internal notes.

Public cache keys must be based on public properties and public query state only.

---

# 86. PUBLIC MAP CONTRACT

The public map component must consume only:

```ts
type PublicMapPoint = {
  latitude?: number;
  longitude?: number;
  visibility: "EXACT" | "APPROXIMATE" | "HIDDEN";
};
```

It must never receive an object containing both exact and approximate coordinates.

Admin map may use exact location after authorization.

---

# 87. PUBLIC NAVIGATION URL

Google Maps/navigation URLs should be generated from an approved public location.

For hidden/private locations:

- no public navigation URL;
- admin-only navigation when authorized.

Private coordinate query strings must never appear in public HTML.

---

# 88. PUBLIC DESCRIPTION SANITIZATION

Public text is plain text or controlled/sanitized Markdown.

No arbitrary user HTML.

Owner submission `source_description` is source material and must not automatically become the final public description.

Internal notes are never concatenated into public text.

---

# 89. SEO DATA PIPELINE

Property SEO metadata must derive only from public-safe data:

```text
PublicPropertyDetailDTO
    ↓
metadata builder
    ↓
Next.js Metadata
```

Do not build JSON-LD directly from raw database rows.

JSON-LD must not contain:

- private coordinates;
- owner contact;
- internal verification notes;
- private documents.

---

# 90. GUIDE / SEO PAGE PUBLISHING

Guide and SEO publishing follow the same server-owned model:

```text
validate
→ sanitize
→ review-state validation
→ write publication state
→ audit
→ revalidate
```

Do not publish empty/thin location content simply because a URL exists.

The parent architecture explicitly treats programmatic SEO as quality-gated.

---

# 91. SETTINGS SERVICE

`updateAppSetting()` must:

- require admin;
- validate key exists and is permitted;
- validate configured value type;
- redact secrets from audit;
- write audit;
- trigger targeted cache invalidation.

Secrets remain environment configuration, not `app_settings`.

Never place:

- service-role key;
- email API key;
- Turnstile secret;
- storage credentials

in application settings.

---

# 92. PUBLIC CONTACT BUILDERS

WhatsApp/call links must be generated from trusted business configuration and public context.

Example:

```text
Hi UrbanEdge, I am interested in Property UE-LS-000001.
```

Do not insert private owner details or exact hidden location into the public URL/message.

---

# 93. ADMIN CONTACT RECIPIENTS

Admin notification recipients are server-selected from trusted configuration.

A public form may never choose:

```text
notifyEmail = attacker@example.com
```

---

# 94. EXPORT ARCHITECTURE

Exports of:

- leads;
- owner submissions;
- owners/parties;
- audit records

are privileged operations.

Requirements:

- require admin;
- audit the export;
- minimize columns;
- exclude private coordinates/documents by default;
- never produce public URLs accidentally.

---

# 95. BULK ADMIN OPERATIONS

Safe candidates:

- archive selected drafts;
- safe availability updates;
- media housekeeping.

Bulk publish should not bypass per-property validation.

Recommended behavior:

```text
property A → published
property B → blocked
property C → conflict
```

rather than one all-or-nothing transaction across unrelated properties.

---

# 96. PROPERTY DUPLICATION

`duplicatePropertyAsDraft()`:

- allocates a new UUID;
- allocates a new Property ID;
- copies safe structural data;
- may copy approved media references where appropriate;
- does not copy publication state;
- does not blindly copy verification results;
- handles owner/private relations explicitly.

Result is always `DRAFT`.

---

# 97. PROPERTY DELETE / ARCHIVE

Normal business operation is archive:

```text
PUBLISHED / UNPUBLISHED / DRAFT
    → ARCHIVED
```

Do not hard-delete properties because their history matters to:

- leads;
- site visits;
- audit;
- verification;
- reporting.

True deletion is exceptional and must be audited.

---

# 98. PRIVATE DOCUMENT RETENTION

Documents may need policy-driven archival/deletion/anonymization.

Do not create duplicate copies in:

- logs;
- audit snapshots;
- analytics;
- email attachments;
- public media storage.

---

# 99. FORM RESULT SEMANTICS

### Success

```text
ok = true
```

User sees confirmation.

### Validation error

Show field-level errors.

### Rate limit

Show retry-later message.

### Abuse rejection

Show generic unable-to-submit message.

### Conflict

Explain the operational conflict without sensitive details.

### Temporary failure

Ask the user to retry without implying business state when persistence is unknown.

---

# 100. FAILURE MATRIX

| Stage | Failure | Business state | User result |
|---|---|---|---|
| Validation | invalid input | none | validation error |
| Abuse | bot/rate-limit | none | abuse/rate-limited |
| Transaction | DB failure | rolled back | temporary/business error |
| Commit | success | durable | success |
| Email after commit | provider failure | durable | success + internal notification failure |
| Revalidation | failure | durable | success; log operational issue |
| Analytics | failure | durable | success |

This separation is mandatory.

---

# 101. ADMIN DRAFT AUTOSAVE

Autosave is optional.

If implemented:

- save only draft fields;
- debounce;
- use optimistic concurrency;
- never autosave destructive transitions;
- never autosave publication;
- never silently change availability.

---

# 102. TIME / TIMEZONE POLICY

Database timestamps use UTC / `timestamptz`.

V1 business timezone:

```text
Asia/Kolkata
```

Site visits are stored as absolute timestamps; display converts them to the business/user timezone.

Never store important confirmed visit times as timezone-less strings.

---

# 103. QUERY PERFORMANCE CONTRACT

Public queries must:

- be indexed;
- be bounded;
- avoid N+1 relationships;
- project only required fields;
- paginate server-side.

Admin dashboard counts should use aggregate queries rather than loading every record into application memory.

---

# 104. N+1 AVOIDANCE

Avoid:

```text
for each property:
  query media
  query verification
  query geography
```

Prefer:

- public database view;
- joins;
- batched `IN` queries;
- precomposed queries.

---

# 105. PUBLIC SERVER COMPONENT RULE

A Server Component reads directly through server query modules:

```ts
const property = await getPublicPropertyBySlug(slug);
```

It should not call its own REST API.

A Client Component uses:

- URL state;
- Server Actions;
- client-only interaction state.

It should not query sensitive Supabase tables directly.

---

# 106. PUBLIC SEARCH / URL STATE

Query parameters carry search state.

Example:

```text
/properties?category=AGRICULTURAL&district=GANDHINAGAR&areaMin=5
```

The server parser allow-lists supported parameters.

Unknown parameters may be ignored or stripped for canonicalization.

The query parser is not a SQL transport.

---

# 107. NO BACKEND SAVED-SEARCH FEATURE IN V1

The UX architecture allows URL-backed search state.

V1 does not require authenticated saved searches.

Do not add saved-search persistence merely because it is a common real-estate feature.

---

# 108. ADMIN SEARCH

Admin search can expose additional internal fields:

- owner name;
- owner phone;
- survey reference;
- submission reference;
- verification status;
- internal state.

It still uses authorization and explicit admin DTOs.

---

# 109. PUBLIC PROPERTY-ID LOOKUP

Public property code lookup is safe only through the public projection.

If the underlying property is unpublished/archived:

- public query returns not-found/unavailable semantics;
- admin query may still retrieve it.

Do not build an enumeration API that reveals private inventory.

---

# 110. STATE MACHINE ENFORCEMENT RULE

For each high-value workflow there must be one authoritative transition service:

```text
Property publication → publishProperty()
Lead status → transitionLeadStatus()
Submission workflow → updateOwnerSubmissionStatus()
Site visit confirmation → confirmSiteVisit()
Verification → update/completeVerification()
```

Generic CRUD must not bypass these state machines.

---

# 111. PUBLIC FORM SECURITY AGAINST MASS ASSIGNMENT

Never spread request objects into inserts/updates.

Forbidden:

```ts
insert(formData)
```

Required:

```ts
insert({
  name: input.name,
  phone: normalizedPhone,
  ...
})
```

Reject/ignore client fields such as:

```text
status
published
publishedAt
createdBy
assignedTo
verificationStatus
ownerPartyId
privateLatitude
privateLongitude
```

---

# 112. IDOR PROTECTION

A valid UUID is not proof of authorization.

Every sensitive resource lookup must verify:

```text
actor authorization
+
resource existence
+
relationship/policy
```

Especially for:

- private documents;
- owner parties;
- leads;
- submissions;
- exact coordinates;
- audit logs.

---

# 113. PUBLIC FIELD CLASSIFICATION

Conceptually classify every important field:

```text
PUBLIC
ADMIN
PRIVATE
VERIFICATION
SYSTEM
```

Examples:

| Field | Classification |
|---|---|
| Property Code | PUBLIC |
| Title | PUBLIC |
| Description | PUBLIC |
| Public coordinates | PUBLIC |
| Exact coordinates | PRIVATE |
| Owner phone | PRIVATE |
| Owner email | PRIVATE |
| Internal notes | ADMIN/PRIVATE |
| Public verification label | PUBLIC |
| Verification internal note | PRIVATE |
| Private document key | PRIVATE |
| Lead note | PRIVATE |
| Audit IP hash | ADMIN/PRIVATE |

Any new schema field must receive a classification before implementation.

---

# 114. PUBLIC DTO GOLDEN RULE

If a field is not explicitly listed in the public DTO:

> It does not exist for the public application.

No object spreading. No raw row return.

---

# 115. PUBLIC SEARCH COUNT PRIVACY

Search count must be calculated from the same public eligibility predicate used for results.

Never:

```text
count all matches
→ hide private/unpublished records
```

Otherwise the count itself leaks internal information.

---

# 116. PUBLIC ELIGIBILITY PREDICATE

Conceptually:

```ts
isPubliclyEligibleProperty(property) =
  publicationStatus === "PUBLISHED"
  && deletedAt == null
  && archivedAt == null
  && publicFieldsValid === true;
```

Search and detail may apply additional availability rules, but both are based on explicit public eligibility rather than UI filtering.

---

# 117. ADMIN DOCUMENT ACCESS DTO

Admin document access may return:

```text
id
role
fileName
mimeType
size
createdAt
accessUrl
```

The URL is generated late and must expire.

---

# 118. PROPERTY PUBLICATION + VERIFICATION DISTINCTION

Publication validation answers:

> Can UrbanEdge publicly represent this listing in its current state?

Verification answers:

> What specific evidence/review has UrbanEdge performed on a particular aspect?

These are intentionally different service responsibilities.

---

# 119. AGRICULTURAL ELIGIBILITY RULE

Do not encode a universal rule that every site visitor may legally buy agricultural land.

If a buyer may need professional/legal eligibility confirmation, store/route that as a qualification concern, for example:

```text
ELIGIBILITY_REQUIRES_CONFIRMATION
```

Do not turn a legal research statement into a permanent universal application rule.

---

# 120. NA LAND RULE

The backend must not infer:

```text
NA = unlimited development rights
```

Public language must reflect the actual stored evidence and scope.

---

# 121. INDUSTRIAL / GIDC RULE

If industrial inventory is represented as GIDC:

- estate/authority relationship must be consistent;
- public language must reflect actual evidence;
- GIDC assumptions must not be generalized to private industrial land.

---

# 122. OWNER-SOURCE PRIVACY

A property may be sourced through an owner, co-owner, representative or broker/intermediary.

The public product does not need the source relationship.

Public CTA routes users to UrbanEdge.

Internal source relations remain admin-only.

---

# 123. PROPERTY PARCEL AGGREGATION

A public property can represent multiple parcels.

Lead conversations generally target the listing/property, not one government parcel.

Parcel identifiers are public only when deliberately approved.

---

# 124. SOURCE PROVENANCE

For material source-backed facts, retain source references/evidence.

Do not replace source records with a marketing assertion such as:

```text
verified = true
```

The source architecture explicitly rejects a monolithic verification boolean.

---

# 125. AUDIT ARCHITECTURE

Sensitive changes create append-only audit rows.

Important actions:

```text
CREATE
UPDATE
PUBLISH
UNPUBLISH
ARCHIVE
RESTORE
DELETE
LOGIN
LOGOUT
EXPORT
DOCUMENT_ACCESS
VERIFICATION_CHANGE
STATUS_CHANGE
```

Audit should include:

```text
actor_admin_id
entity_type
entity_id
action
occurred_at
ip_hash
user_agent_hash
changed_fields
before_state
safely-redacted after_state
reason
```

Never store raw document contents.

---

# 126. AUDIT REDACTION

Before writing snapshots, redact fields such as:

- exact private coordinates;
- document contents;
- secret values;
- full credentials;
- unnecessary PII.

Audit is for accountability, not for creating a second uncontrolled copy of sensitive data.

---

# 127. NOTIFICATION FAILURE VISIBILITY

Notification failures should be observable to admins without blocking the business workflow.

Operational options:

```text
FAILED
PENDING
SENT
```

If a dedicated notification/outbox table is not included in V1, retain an operationally useful structured error record rather than silently dropping provider failures.

If reliability later demands durable retries, add a narrowly scoped outbox/notification table rather than an event bus.

---

# 128. NO UNNECESSARY ASYNC ARCHITECTURE

Do not add:

- Kafka;
- RabbitMQ;
- Temporal;
- worker clusters

for ordinary V1 operations.

Potential future async workloads such as large media processing can be isolated later.

---

# 129. WEBHOOK SECURITY

Any future external webhook must:

1. verify signature;
2. validate schema;
3. enforce idempotency;
4. resolve business record safely;
5. transact material state changes;
6. audit when required;
7. return provider-compatible response.

Never trust webhook payload IDs merely because they are UUIDs.

---

# 130. HEALTH ENDPOINT

Optional public endpoint:

```text
GET /api/health
```

It may expose only coarse health status.

Detailed operational health is admin-only:

```text
database reachable
storage configured
email configured
anti-bot configured
site URL configured
WhatsApp configured
analytics configured
```

Never expose secrets or connection strings.

---

# 131. DEPLOYMENT ENVIRONMENT BEHAVIOR

The parent architecture uses:

```text
LOCAL
→ PREVIEW/STAGING
→ PRODUCTION
```

Never run automated destructive tests against production.

Production mutations and migrations must be deliberate.

Backend code must not assume a single environment-specific URL or hard-coded admin account.

---

# 132. SECURITY REGRESSION TESTS

High-priority tests:

### Public property leakage

A property fixture contains:

```text
public approximate coordinates
private exact coordinates
owner phone
private document
internal verification note
```

Assert public output contains only:

```text
public-safe fields
```

### Private document

Anonymous access must fail.

### Owner PII

Anonymous query cannot retrieve owner phone/email.

### Unpublished inventory

Public slug/code lookup cannot reveal internal existence.

### Analytics

No PII/private coordinates in emitted payload.

### Email

Public templates contain public DTO only.

---

# 133. TRANSACTION REGRESSION TESTS

## Publish

Force audit write failure:

Expected:

```text
property not published
```

## Owner conversion

Force mid-conversion failure:

Expected:

```text
no partial property
submission remains unconverted
```

## Lead creation

Force activity write failure:

Expected:

```text
no partially-created lead transaction unless an explicitly designed idempotent recovery path is used
```

## Visit confirmation

Force lead-transition failure:

Expected:

```text
visit confirmation not half-written
```

---

# 134. CONCURRENCY TESTS

Run parallel operations for:

- property-code generation;
- publish;
- owner conversion;
- primary offer;
- cover media;
- lead transition;
- site-visit confirmation.

Expected outcomes are deterministic:

```text
success
or
conflict
```

not silent last-write-wins for business-critical transitions.

---

# 135. SEARCH TEST SUITE

Verify:

- AND across dimensions;
- OR within multi-select dimension;
- exact Property ID lookup;
- price range;
- POR semantics;
- area conversion;
- pagination;
- stable sorting;
- invalid filters;
- public/private field exclusion;
- empty results;
- public count correctness.

---

# 136. PROPERTY PUBLIC-PROJECTION SNAPSHOT

Maintain a representative fixture containing:

```text
owner phone
owner email
private exact latitude/longitude
public approximate latitude/longitude
internal note
private document
public image
private verification evidence
```

Snapshot the public DTO and assert sensitive data is absent.

This should be a permanent regression test.

---

# 137. PUBLIC MAP LEAKAGE TEST

The property detail response should be inspected for:

- rendered HTML;
- RSC payload;
- serialized props;
- JSON-LD;
- map props;
- analytics event payloads.

For APPROXIMATE/HIDDEN properties, exact coordinates must appear nowhere.

---

# 138. RLS TEST MATRIX

Test as:

```text
anonymous
authenticated non-admin if applicable
admin
```

Anonymous must not access:

- leads;
- private parties/PII;
- owner submissions;
- private documents;
- exact private coordinates;
- internal verification notes;
- audit logs.

Do not consider "the UI did not show it" a valid security test.

---

# 139. SERVICE RESULT CONTRACTS

Expected business conditions should be represented as typed results rather than thrown exceptions whenever reasonable.

Example:

```ts
type PublishResult =
  | { kind: "published"; propertyId: string; propertyCode: string }
  | { kind: "blocked"; blockers: PublicationBlocker[] }
  | { kind: "conflict"; reason: string };
```

Unexpected infrastructure/programmer errors may use exceptions and are translated at the boundary.

---

# 140. ACTION THINNESS RULE

A Server Action should look conceptually like:

```text
getActor
→ validate
→ call service
→ map result
```

It should not contain:

- 300 lines of SQL;
- email templates;
- state-machine logic;
- storage details;
- public projection rules.

---

# 141. SERVICE COMPOSITION — PROPERTY INQUIRY

```text
submitPropertyInquiry
  ├─ getRequestContext
  ├─ checkRateLimit
  ├─ checkHoneypot
  ├─ verifyTurnstile
  ├─ parse/normalize
  ├─ getPublicPropertyEligibility
  ├─ transaction
  │   ├─ resolveParty
  │   ├─ createLead
  │   ├─ createRequirement
  │   ├─ linkProperty
  │   └─ addActivity
  ├─ commit
  ├─ notify
  └─ return safe reference
```

---

# 142. SERVICE COMPOSITION — PUBLISH

```text
publishProperty
  ├─ requireAdmin
  ├─ load/lock property
  ├─ validate publication
  ├─ validate public location
  ├─ validate public media
  ├─ validate category data
  ├─ validate public verification output
  ├─ write publication state
  ├─ write audit
  ├─ commit
  ├─ revalidate
  └─ optional notification
```

---

# 143. SERVICE COMPOSITION — OWNER CONVERSION

```text
convertOwnerSubmissionToProperty
  ├─ requireAdmin
  ├─ lock submission
  ├─ validate preconditions
  ├─ transaction
  │   ├─ allocate property identity
  │   ├─ create property
  │   ├─ create extension
  │   ├─ create location
  │   ├─ create offer
  │   ├─ create parcel relations
  │   ├─ create property-party relation
  │   ├─ attach source/doc relations
  │   ├─ mark submission converted
  │   └─ audit
  ├─ commit
  └─ return draft property
```

---

# 144. SERVICE COMPOSITION — SITE VISIT

```text
requestSiteVisit
  ├─ anti-abuse
  ├─ validate
  ├─ property eligibility
  ├─ transaction
  │   ├─ resolve lead
  │   ├─ link property
  │   ├─ create site visit REQUESTED
  │   └─ add activity
  └─ notify
```

Confirmation is a separate service with a separate transaction.

---

# 145. PUBLIC CONTACT IDENTITY POLICY

Phone/email are CRM data.

They are not public property metadata by default.

Public users interact with:

```text
UrbanEdge contact channels
```

rather than direct owner contact.

---

# 146. PUBLIC DOCUMENT / MEDIA POLICY

Public brochures may be exposed through `media_assets` only after explicit approval.

Private legal/title documents remain outside public projections.

The media service must reject an attempt to create a public DTO from a private document record.

---

# 147. ADMIN PROPERTY HEALTH CHECK

Recommended server service:

```text
validatePublicProjectionIntegrity(propertyId)
```

Checks:

- title/description;
- active geography;
- offer representation;
- public media;
- public verification signals;
- coordinate privacy;
- public-safe parcel fields;
- DTO serialization safety.

This can be run before publish and in tests.

---

# 148. NOT-FOUND PRIVACY

Public property not-found semantics should collapse:

- invalid slug;
- unpublished property;
- archived property;
- deleted property

into the appropriate public not-found/unavailable response.

Admin routes can expose the underlying internal state.

---

# 149. PUBLIC ERROR BOUNDARIES

If a homepage featured query fails, static content should still render.

If public search fails, filters remain available and a retry state is shown.

If a property detail fails, render a safe 404/error state rather than a blank page.

No raw server errors are serialized into UI state.

---

# 150. SERVER/CLIENT SPLIT FOR PUBLIC SEARCH

The UX architecture uses URL-backed filters.

Recommended flow:

```text
Client filter controls
  ↓
URL update
  ↓
Server-rendered page/query
  ↓
Public search DTO
```

Client-side behavior may show loading UI, but the dataset remains server-fetched and bounded.

---

# 151. SERVER/CLIENT SPLIT FOR ADMIN

Admin forms may be Client Components for interaction, but business decisions still call Server Actions.

Example:

```text
Admin publish button
  ↓
publishProperty()
  ↓
server validation
  ↓
transaction
```

The client cannot set `PUBLISHED` directly.

---

# 152. DOMAIN RULE: PUBLISHED IS NOT CERTIFICATION

The system must use wording consistent with:

> publication is an UrbanEdge representation state, not legal title certification.

Any public trust signal must state what was actually checked.

---

# 153. DOMAIN RULE: OWNER SUBMISSION IS NOT INVENTORY

An owner submission is an intake object.

It can be incomplete.

It is not searchable public inventory.

Only conversion creates the separate property record.

---

# 154. DOMAIN RULE: PROPERTY ID IS NOT PARCEL ID

```text
UE-LS-000001
```

identifies the UrbanEdge listing.

Survey, city-survey, TP/FP/OP, GIDC plot and ULPIN values identify underlying/source land records.

Do not merge these concepts.

---

# 155. DOMAIN RULE: PROPERTY CAN HAVE MULTIPLE PARCELS

A listing may aggregate multiple parcels.

Application services must not assume:

```text
one property = one parcel
```

Lead/property relations target the listing-level property unless a future workflow explicitly adds parcel-level targeting.

---

# 156. DOMAIN RULE: ONE PRIMARY OFFER

The property may have historical/multiple offers, but only one active primary offer should exist under the database constraint.

`updatePropertyOffer()` must use a transaction if it changes primary designation.

---

# 157. DOMAIN RULE: ONE PUBLIC COVER

The property may have many media assets.

At most one active public cover image.

Cover selection is transactional.

---

# 158. DOMAIN RULE: PUBLIC LOCATION MUST BE SAFE

The public projection must not derive a public location from internal raw coordinates simply because no public coordinate was stored.

If safe public mapping is unavailable:

- publish a text/broad location only;
- or block publication according to configured policy.

Never fall back to exposing the exact internal coordinate.

---

# 159. DOMAIN RULE: PUBLIC SEARCH DOES NOT EXPOSE PRIVATE FILTERS

The search API must reject/ignore attempts to filter by:

- owner;
- phone;
- source broker;
- internal notes;
- exact coordinates;
- private verification notes;
- private documents.

---

# 160. DOMAIN RULE: OWNER CONTACT IS SERVER-SELECTED

Any email/WhatsApp/call destination for public users is built from trusted business configuration.

Client cannot replace the destination with an arbitrary number.

---

# 161. DOMAIN RULE: PUBLIC LEAD SOURCE IS CONTROLLED

The server determines trustworthy source context such as:

```text
PROPERTY_PAGE
SEARCH_PAGE
HOME
SELL_YOUR_LAND
REQUIREMENTS
SITE_VISIT
CONTACT
GUIDE
```

Do not trust arbitrary client strings for reporting categories.

---

# 162. DOMAIN RULE: ADMIN NOTES NEVER ENTER PUBLIC COPY

The service layer must use explicit field mapping.

No generic object merge between:

```text
admin property object
```

and:

```text
public property DTO
```

---

# 163. DOMAIN RULE: PRIVATE DOCUMENT IDS NEVER ENTER PUBLIC DTO

Even an opaque UUID is an information boundary.

Public DTOs should not carry private document IDs that could be used to probe storage or admin APIs.

---

# 164. DOMAIN RULE: EXACT COORDINATE NEVER ENTER ANALYTICS

Property-view and map events use the public Property ID and safe public location category only.

Never emit exact latitude/longitude as analytics metadata.

---

# 165. DOMAIN RULE: EMAIL DOES NOT CONTROL TRANSACTION COMMIT

Email providers can be slow or unavailable.

The application transaction ends first.

Notification delivery is a secondary effect.

---

# 166. DOMAIN RULE: ROLLBACK MEANS NO FALSE BUSINESS STATE

If a transactional service fails before commit:

```text
no partial business state
```

This is especially important for:

- publish;
- conversion;
- lead creation;
- visit confirmation.

---

# 167. DOMAIN RULE: PUBLIC ABSENCE IS SAFER THAN PARTIAL PRIVATE DATA

When the application cannot safely construct a public projection, it should omit the sensitive field or block publication instead of falling back to the internal field.

Examples:

```text
no public coordinate
```

is safer than:

```text
use private coordinate temporarily
```

---

# 168. IMPLEMENTATION DEPENDENCY DIRECTION

Required:

```text
app/page
   ↓
feature query/action
   ↓
service/domain
   ↓
repository/query
   ↓
Supabase/Postgres
```

Integrations:

```text
service
   ↓
integration adapter
   ↓
email / anti-bot / storage / map provider
```

Avoid:

```text
component → provider SDK
component → direct DB table
service → UI
repository → email
```

---

# 169. TESTING LAYERS

## Unit

- property code formatting/generation helper;
- price formatting;
- area conversion;
- public location projection;
- publication blockers;
- lead state machine;
- submission state machine;
- visit state machine;
- search normalization.

## Integration

- Supabase/RLS;
- publish transaction;
- inquiry transaction;
- owner conversion;
- private document access;
- public projections;
- concurrency.

## E2E

Required business journeys include:

1. homepage;
2. property search;
3. property detail;
4. WhatsApp CTA;
5. inquiry;
6. site visit request;
7. Sell Your Land;
8. admin login;
9. draft property;
10. media;
11. verification;
12. publish;
13. property appears publicly;
14. lead pipeline;
15. close/unpublish inventory;
16. coordinate leakage test.

---

# 170. TESTING DEFINITION OF DONE

Do not call the backend complete merely because methods exist.

It is complete only when tests prove:

```text
public projections are safe
private resources are inaccessible to anonymous users
business state transitions are enforced
transactions roll back correctly
Property IDs are concurrency safe
search is server-side and bounded
email failure cannot corrupt business state
owner conversion never auto-publishes
site-visit request never auto-confirms
```

---

# 171. BACKEND PRE-IMPLEMENTATION CHECKLIST

## Architecture

- [ ] Server Actions defined.
- [ ] Route Handlers limited.
- [ ] Server-only modules identified.
- [ ] Services separated from queries.
- [ ] Repositories introduced only where useful.

## Public/private

- [ ] Explicit public DTOs.
- [ ] Exact/private coordinates isolated.
- [ ] Private documents isolated.
- [ ] Owner PII isolated.
- [ ] Public analytics safe.
- [ ] Public email safe.

## Business logic

- [ ] Property state machine.
- [ ] Lead state machine.
- [ ] Submission state machine.
- [ ] Site-visit state machine.
- [ ] Publication validation.
- [ ] Scoped verification rules.

## Data integrity

- [ ] Property ID sequence.
- [ ] Transaction-capable write path.
- [ ] Primary-offer invariant.
- [ ] Cover invariant.
- [ ] Conversion uniqueness.
- [ ] Optimistic concurrency where needed.

## Abuse/security

- [ ] Rate limiting.
- [ ] Honeypot.
- [ ] Turnstile where configured.
- [ ] Idempotency.
- [ ] Payload limits.
- [ ] IDOR tests.
- [ ] RLS tests.

## Notifications

- [ ] Post-commit email.
- [ ] Safe templates.
- [ ] Duplicate prevention.
- [ ] Failure logging.

---

# 172. REJECTED BACKEND ARCHITECTURES

## Separate API server

Rejected for V1 because the workload does not justify another deployment/auth/network boundary.

## GraphQL

Rejected because there is no current multi-client schema requirement and explicit DTOs are clearer for this product.

## Full REST API

Rejected because first-party Next.js pages do not need HTTP hops for internal operations.

## Generic repository framework

Rejected because it obscures rather than protects the relational model.

## Event bus

Rejected because V1 workflows are straightforward and synchronous.

## Giant PL/pgSQL workflow engine

Rejected because application business logic is easier to test and evolve in the server service layer.

## Client-side direct CRUD

Rejected because it weakens trust boundaries and risks private data leakage.

---

# 173. COMPLETE V1 BACKEND SURFACE

## Server queries

```text
searchPublicProperties
getPublicPropertyBySlug
getPublicPropertyByCode
getFeaturedPublicProperties
getSimilarPublicProperties
getAdminPropertyById
listAdminProperties
getLeadById
listLeads
getLeadTimeline
getOwnerSubmission
listOwnerSubmissions
getSiteVisit
listSiteVisits
getGuide
getSeoPage
getOperationalHealth
```

## Server Actions

```text
submitPropertyInquiry
submitBuyerRequirement
submitOwnerLandSubmission
requestSiteVisit
recordPublicInteraction

createPropertyDraft
updatePropertyDraft
duplicatePropertyAsDraft
requestPropertyReview
publishProperty
unpublishProperty
archiveProperty
restoreProperty
changePropertyAvailability
updatePropertyLocation
updatePropertyOffer

registerMedia
setPropertyCoverMedia
reorderPropertyMedia
archiveMediaAsset
restoreMediaAsset

startPropertyVerification
updatePropertyVerification
addVerificationEvidence
completePropertyVerification
markVerificationForRecheck

updateOwnerSubmissionStatus
requestSubmissionDocuments
convertOwnerSubmissionToProperty
rejectOwnerSubmission
placeOwnerSubmissionOnHold
closeOwnerSubmission

updateLead
transitionLeadStatus
addLeadActivity
matchLeadToProperty
unmatchLeadFromProperty
scheduleLeadFollowUp
recordLeadOutcome

proposeSiteVisit
confirmSiteVisit
rescheduleSiteVisit
completeSiteVisit
cancelSiteVisit
recordSiteVisitNoShow

publishGuide
unpublishGuide
archiveGuide
publishSeoPage
unpublishSeoPage
updateAppSetting
```

## Route Handlers only when justified

```text
GET  /api/health
POST /api/uploads/*
POST /api/webhooks/*
POST /api/integrations/*
```

---

# 174. FINAL ARCHITECTURAL INVARIANTS

The implementation must preserve these invariants above all convenience:

### Invariant 1 — Server owns business state

The browser cannot directly decide:

```text
published
verified
qualified
confirmed
converted
assigned
```

### Invariant 2 — Public data is an explicit projection

Public code never returns raw rows.

### Invariant 3 — Private coordinates are never returned to the public browser unless exact public disclosure has explicitly been approved.

### Invariant 4 — Private documents never enter public projections, public storage paths or public emails.

### Invariant 5 — Owner submissions never auto-publish.

### Invariant 6 — Site-visit requests never auto-confirm.

### Invariant 7 — Publication and availability remain separate.

### Invariant 8 — Property ID and source parcel identifier remain separate.

### Invariant 9 — Core multi-write business operations are truly transactional.

### Invariant 10 — Email/analytics/map calls cannot corrupt or determine database business state.

### Invariant 11 — Verification is scoped evidence, not universal legal certification.

### Invariant 12 — Public errors do not reveal private inventory or internal implementation details.

---

# 175. IMPLEMENTATION HANDOFF

A coding agent implementing this document should treat the following as hard acceptance criteria:

```text
PUBLIC
  → explicit safe DTOs
  → server-rendered queries
  → no private data in payloads

ADMIN
  → authenticated + authorized
  → service-owned workflows
  → audit on sensitive state changes

FORMS
  → rate limited
  → anti-bot protected where enabled
  → idempotent where appropriate
  → transactional business persistence

PROPERTY
  → sequence-based UE-LS code
  → draft/review/publish lifecycle
  → independent availability
  → publication validation

OWNER
  → submission workflow
  → private documents
  → explicit conversion
  → conversion creates DRAFT only

LEADS
  → party/lead/requirement/activity model
  → many-to-many property links
  → controlled status machine

VISITS
  → request/propose/confirm/complete lifecycle
  → manual confirmation only

SEARCH
  → typed filters
  → server-side query
  → bounded pagination
  → public projection only

PRIVACY
  → exact coordinates absent from public payloads
  → private documents absent from public payloads
  → owner PII absent from public payloads

FAILURE
  → transaction rollback before commit
  → notification failure after commit does not undo business state
  → public errors are safe
```

This is the intended V1 backend/application-service contract.
