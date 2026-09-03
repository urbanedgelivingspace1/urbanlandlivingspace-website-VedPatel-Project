# UrbanEdge Land Space V1 — Implementation Ledger

**Ledger status:** M0–M4 COMPLETE; architecture, schema, typed contracts, public projections and database authorization boundary are reconciled and validated.

**Last reconciled:** 3 September 2026 (M4: all 49 tables use RLS; projection-owner, active-admin, closed browser-write and trusted-audit actor matrix passes)

This ledger is the single implementation-facing map required by `12-IMPLEMENTATION-ROADMAP.md`. It does not replace the source documents. When this ledger conflicts with a source, the source hierarchy in the owner's build brief applies.

## 1. Authority and source manifest

Expected authority order:

1. `00-MASTER-CODEX-BUILD-PROMPT.md` — supplied inside `/Users/vedpatel/Desktop/merged (1).md`, lines 56904–62392, under the converted heading `## 19. richtext_converted_to_markdown.md`; **read in full and applied as highest-priority source**
2. `LANDSPACE_PRODUCT_REQUIREMENTS.md`
3. `LEGAL_VERIFICATION_REPORT.md`
4. `03-DATABASE-SCHEMA-ARCHITECTURE.md`
5. Other numbered architecture documents
6. `LAND_DATA_MODEL_REPORT.md`
7. `URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md`

Supplied and referenced:

| Document | Role |
|---|---|
| `00-MASTER-CODEX-BUILD-PROMPT.md` (embedded source) | Highest-priority build contract; exact accessible location recorded above and in `SOURCE-MANIFEST.md` |
| `01-MASTER-WEBSITE-ARCHITECTURE.md` | Parent system architecture |
| `02-PAGE-ROUTE-UX-ARCHITECTURE.md` | Public/admin route and UX contract |
| `03-DATABASE-SCHEMA-ARCHITECTURE.md` | Final database authority |
| `04-BACKEND-API-BUSINESS-LOGIC.md` | Services, actions, DTOs and transitions |
| `05-ADMIN-CRM-ARCHITECTURE.md` | Admin routes and operational workflows |
| `06-VERIFICATION-WORKFLOW.md` | Scoped verification and claim policy |
| `07-SEO-ARCHITECTURE.md` | Crawl, canonical, metadata and redirect contract |
| `08-SECURITY-PRIVACY-RLS.md` | RLS, authorization and privacy boundary |
| `09-MEDIA-STORAGE-ARCHITECTURE.md` | Media lifecycle and storage policy |
| `10-INFRASTRUCTURE-DEPLOYMENT.md` | Environments, providers and deployment gates |
| `11-TESTING-QA-PLAN.md` | Test architecture and release priorities |
| `12-IMPLEMENTATION-ROADMAP.md` | Serial milestone sequence |
| `13-DEFINITION-OF-DONE.md` | Completion contract |
| `14-PRE-LAUNCH-CHECKLIST.md` | Final launch gate |
| `LANDSPACE_PRODUCT_REQUIREMENTS.md` | V1 business scope |
| `LAND_DATA_MODEL_REPORT.md` | Supporting domain research |
| `LEGAL_VERIFICATION_REPORT.md` | Legal/verification constraints; not legal advice |
| `URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md` | Brand/design reference report |

Unavailable/non-required inputs:

- UrbanEdge Living Space source repository: owner confirmed it will not be provided and must not block M0.
- Additional photography/property media: optional for development and not supplied.

The master prompt is available as an embedded converted document even though the expected standalone filename is absent. Its complete review introduced no unresolved architecture contradiction. By owner direction dated 2026-09-03, `URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md` is the authoritative Living Space brand/design reference and the old repository is out of scope. The approved `/Users/vedpatel/Desktop/UrbanLand_website/UrbanEdge_Living_Space_Logo_HD.jpg` asset was visually inspected and fingerprinted. Neither source authorizes copying Living Space backend/database/auth/storage/deployment behavior or coupling the products.

Accepted implementation decision:

- `docs/adr/0001-separate-site-visit-lifecycle-from-follow-up.md` supersedes only document `05`'s treatment of `FOLLOW_UP_REQUIRED` as a visit lifecycle state. It preserves document `03`'s eight-value database enum and represents follow-up in CRM.
- ADR-0001 remains compatible with the master prompt: the prompt uses the simplified lifecycle labels `REQUESTED`, `CONTACTED`, `SCHEDULED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`, does not define `FOLLOW_UP_REQUIRED`, and leaves detailed scheduling persistence to the later finalized architecture. Document `03` refines the conceptual `SCHEDULED` phase into `PROPOSED`, `CONFIRMED` and `RESCHEDULED` without changing the decision that follow-up belongs to CRM.

## 2. V1 boundary

The product is a curated, brokerage-led land discovery and CRM application for Ahmedabad and Gandhinagar. It is a separate Next.js App Router + TypeScript modular monolith with a dedicated Supabase project.

In scope:

- Agricultural, NA and Industrial land.
- Buy, Rent and Lease discovery.
- Public SSR discovery, property detail, guides, location pages and legal/company pages.
- Inquiry, buyer requirement, contact, site-visit request and owner-submission flows.
- Single-admin inventory, media, verification, CRM, content, settings, analytics and audit workflows.

Explicitly excluded:

- buyer accounts;
- seller dashboards;
- public agent marketplace or reviews;
- payments or memberships;
- AI chatbot or automatic valuation;
- in-app messaging;
- WhatsApp Business API or SMS dependency;
- automatic calendar booking;
- microservices;
- Elasticsearch/Algolia;
- unapproved paid services.

## 3. Canonical route map

### 3.1 Public routes and data/mutation ownership

All listing/content reads are server-side and must consume explicit public projections. No public page reads a private base row and hides fields in the browser.

| Route | Public data source | Mutation path / notes |
|---|---|---|
| `/` | `public_property_listings`, public geography/content/settings projections | Read only; featured inventory must remain publish-eligible |
| `/properties` | PostgreSQL search over `public_property_listings` | URL-owned filter/sort/page state |
| `/properties/[property-slug]` | `public_property_detail` plus related public listings | Inquiry/interaction/visit actions are server-owned |
| `/agricultural-land` | Public listing search constrained to `AGRICULTURAL`; published SEO/content projection | Read only |
| `/na-land` | Public listing search constrained to `NA`; published SEO/content projection | Read only; no development guarantee |
| `/industrial-land` | Public listing search constrained to `INDUSTRIAL`; published SEO/content projection | Read only; GIDC/non-GIDC claims scoped |
| `/buy` | Public listing search constrained to `BUY`; published SEO/content projection | Read only |
| `/rent` | Public listing search constrained to `RENT`; published SEO/content projection | Read only |
| `/lease` | Public listing search constrained to `LEASE`; published SEO/content projection | Read only |
| `/search` | Server search service over public property/content projections | Property-ID lookup never enumerates private inventory |
| `/requirements` | Public geography/options projections | `submitBuyerRequirement()` |
| `/requirements/thank-you` | Static safe confirmation | No PII or record details in URL/browser state |
| `/site-visit` | Eligible public property summary; public form options | `requestSiteVisit()` creates `REQUESTED`, never `CONFIRMED` |
| `/site-visit/thank-you` | Static safe confirmation | No booking claim |
| `/sell-your-land` | Public geography/options projections | `submitOwnerLandSubmission()`; never publishes |
| `/sell-your-land/thank-you` | Static safe confirmation | Must not imply acceptance/publication |
| `/guides` | Published guide/category projection | Read only |
| `/guides/[guide-slug]` | Published guide projection | Read only |
| `/guides/category/[category-slug]` | Published guide/category projection | Read only |
| `/locations/ahmedabad` | Published `seo_pages` projection plus eligible listings | Read only; indexability gate applies |
| `/locations/gandhinagar` | Published `seo_pages` projection plus eligible listings | Read only; indexability gate applies |
| `/locations/ahmedabad/[land-category-slug]` | Published SEO/location projection plus eligible listings | Read only; curated route only |
| `/locations/gandhinagar/[land-category-slug]` | Published SEO/location projection plus eligible listings | Read only; curated route only |
| `/about` | Version-controlled content and public business settings | Read only |
| `/contact` | Public business settings | Protected server-owned general-contact action |
| `/terms` | Version-controlled legal content | Read only |
| `/privacy` | Version-controlled legal content | Read only |
| `/disclaimer` | Version-controlled legal content | Read only |
| `/404` / not-found | Static recovery content plus safe navigation | Must return correct not-found behavior |

Canonical query parameters, rather than arbitrary path permutations, own dynamic search state.

### 3.2 Admin routes and authorization boundary

Every `/admin/*` route except `/admin/login` requires server-side session verification plus an active `admin_profiles` record. Authenticated non-admin and inactive admin identities are denied. Sensitive actions additionally pass through purpose-built services; arbitrary browser CRUD is forbidden.

```text
/admin/login
/admin/dashboard

/admin/properties
/admin/properties/new
/admin/properties/[id]
/admin/properties/[id]/edit
/admin/properties/[id]/media
/admin/properties/[id]/verification
/admin/properties/[id]/leads
/admin/properties/[id]/visits

/admin/submissions
/admin/submissions/[id]
/admin/submissions/[id]/convert

/admin/leads
/admin/leads/pipeline
/admin/leads/[id]

/admin/requirements
/admin/requirements/unmatched
/admin/requirements/[id]

/admin/site-visits
/admin/site-visits/calendar
/admin/site-visits/[id]

/admin/verification
/admin/verification/queue
/admin/verification/[property-id]

/admin/media

/admin/guides
/admin/guides/new
/admin/guides/[id]
/admin/guides/[id]/edit

/admin/locations
/admin/locations/[id]
/admin/locations/[id]/edit

/admin/seo
/admin/seo/landing-pages
/admin/seo/[id]

/admin/analytics

/admin/settings
/admin/settings/business
/admin/settings/contact
/admin/settings/lead-sources
/admin/settings/property-options
/admin/settings/seo

/admin/audit
```

`/admin/audit` is read-only for the active admin. Admin-profile provisioning and role/activation changes are privileged server operations, not self-service admin CRUD. Private-document access requires per-record authorization, a short-lived signed URL generated as late as possible, and a `DOCUMENT_ACCESS` audit record.

## 4. Authoritative table inventory

The 49 V1 application tables from `03-DATABASE-SCHEMA-ARCHITECTURE.md` are:

| Domain | Tables |
|---|---|
| Geography | `countries`, `states`, `districts`, `subdistricts`, `places`, `localities`, `geography_aliases` |
| Planning/reference | `planning_authorities`, `development_plan_zones`, `tp_schemes`, `tp_plots`, `gidc_estates`, `area_units`, `area_conversion_rules`, `source_references` |
| Property/inventory | `properties`, `property_offers`, `property_parcels`, `parcel_identifiers`, `property_locations`, `property_planning_context` |
| Category extensions | `property_agricultural`, `property_na`, `property_industrial` |
| Flexible attributes | `property_attribute_definitions`, `property_attribute_options`, `property_attribute_values` |
| Parties/sourcing | `parties`, `property_parties`, `property_source_links` |
| Media/documents | `media_assets`, `private_documents`, `owner_submission_documents` |
| Verification | `verification_check_definitions`, `property_verifications`, `verification_evidence` |
| Owner intake | `owner_submissions` |
| CRM | `leads`, `lead_requirements`, `lead_properties`, `lead_activities`, `site_visits` |
| Content/SEO | `guide_categories`, `guides`, `seo_pages` |
| Administration | `admin_profiles`, `app_settings` |
| Analytics/audit | `analytics_events`, `audit_logs` |

Canonical public property identity is a sequence-backed, immutable, never-reused `UE-LS-000001` code. Category, slug and parcel/government identifiers are separate.

## 5. Authoritative enum and controlled-value catalogue

| Type | Values |
|---|---|
| `land_category` | `AGRICULTURAL`, `NA`, `INDUSTRIAL` |
| `transaction_type` | `BUY`, `RENT`, `LEASE` |
| `property_publication_status` | `DRAFT`, `UNDER_REVIEW`, `PUBLISHED`, `UNPUBLISHED`, `ARCHIVED` |
| `property_availability_status` | `AVAILABLE`, `UNDER_NEGOTIATION`, `SOLD`, `RENTED`, `LEASED`, `OFF_MARKET` |
| `location_visibility` | `EXACT`, `APPROXIMATE`, `HIDDEN` |
| `price_mode` | `PRICE_ON_REQUEST`, `EXACT_TOTAL`, `PRICE_RANGE`, `PER_UNIT` |
| `area_normalization_status` | `AUTHORITATIVE`, `SOURCE_DECLARED`, `PROVISIONAL`, `UNKNOWN` |
| `party_type` | `INDIVIDUAL`, `COMPANY`, `PARTNERSHIP`, `TRUST`, `SOCIETY`, `GOVERNMENT`, `OTHER` |
| `property_party_role` | `OWNER`, `CO_OWNER`, `AUTHORIZED_REPRESENTATIVE`, `BROKER`, `INTERMEDIARY`, `DEVELOPER`, `INSTITUTIONAL_OWNER`, `OTHER` |
| `media_type` | `IMAGE`, `VIDEO`, `PANORAMA_360`, `BROCHURE`, `DOCUMENT_PREVIEW`, `MAP_IMAGE`, `OTHER` |
| `record_visibility` | `PUBLIC`, `ADMIN_ONLY`, `PRIVATE` |
| `verification_status` | `NOT_STARTED`, `IN_REVIEW`, `PASSED`, `PASSED_WITH_NOTE`, `FAILED`, `REQUIRES_REVIEW`, `EXPIRED` |
| `risk_level` | `NONE`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `owner_submission_status` | `NEW`, `CONTACTED`, `DOCS_REQUESTED`, `UNDER_REVIEW`, `VERIFICATION_PENDING`, `APPROVED`, `REJECTED`, `ON_HOLD`, `CONVERTED`, `CLOSED` |
| `lead_status` | `NEW`, `CONTACT_ATTEMPTED`, `QUALIFIED`, `REQUIREMENT_CONFIRMED`, `PROPERTY_MATCHED`, `SITE_VISIT_REQUESTED`, `SITE_VISIT_CONFIRMED`, `SITE_VISIT_COMPLETED`, `NEGOTIATION`, `WON`, `LOST`, `NURTURE`, `CLOSED` |
| `lead_inquiry_type` | `PROPERTY_INQUIRY`, `PRICE_INQUIRY`, `WHATSAPP_CLICK`, `CALL_CLICK`, `BUYER_REQUIREMENT`, `SITE_VISIT_REQUEST`, `GENERAL_CONTACT` |
| `buyer_type` | `INDIVIDUAL`, `INVESTOR`, `FARMER`, `DEVELOPER`, `BUILDER`, `INDUSTRIAL_BUSINESS`, `LOGISTICS_OPERATOR`, `NRI`, `BROKER`, `OTHER` |
| `lead_activity_type` | `LEAD_CREATED`, `CONTACT_ATTEMPTED`, `CONTACTED`, `NOTE_ADDED`, `WHATSAPP_CLICK`, `CALL_CLICK`, `REQUIREMENT_UPDATED`, `PROPERTY_MATCHED`, `SITE_VISIT_REQUESTED`, `SITE_VISIT_CONFIRMED`, `SITE_VISIT_COMPLETED`, `OFFER_RECEIVED`, `FOLLOW_UP_SCHEDULED`, `STATUS_CHANGED`, `DOCUMENT_REQUESTED`, `OTHER` |
| `site_visit_status` | `REQUESTED`, `CONTACTED`, `PROPOSED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`, `RESCHEDULED`; ADR-0001 explicitly excludes `FOLLOW_UP_REQUIRED` |
| `guide_status` | `DRAFT`, `REVIEW`, `PUBLISHED`, `UNPUBLISHED`, `ARCHIVED` |
| `attribute_value_type` | `TEXT`, `LONG_TEXT`, `INTEGER`, `DECIMAL`, `BOOLEAN`, `DATE`, `TIMESTAMP`, `SINGLE_OPTION`, `MULTI_OPTION` |
| `seo_page_status` | `DRAFT`, `REVIEW`, `PUBLISHED`, `NOINDEX`, `ARCHIVED` |
| `setting_value_type` | `TEXT`, `INTEGER`, `DECIMAL`, `BOOLEAN`, `URL`, `JSON` |
| `audit_action` | `CREATE`, `UPDATE`, `PUBLISH`, `UNPUBLISH`, `ARCHIVE`, `RESTORE`, `DELETE`, `LOGIN`, `LOGOUT`, `EXPORT`, `DOCUMENT_ACCESS`, `VERIFICATION_CHANGE`, `STATUS_CHANGE` |

Additional controlled values:

- Currency is an ISO-compatible `char(3)` constrained to `INR` in V1, not a PostgreSQL enum.
- Area units are rows in `area_units`; regional vocabulary must not be frozen into an enum.
- Negotiability is `is_negotiable`, not a price mode.
- `SELL` is an owner-submission intent, not a discovery `transaction_type`.

## 6. State machines

All transitions are service-owned, concurrency-checked and audited where material.

### 6.1 Property publication

```text
DRAFT -> UNDER_REVIEW
DRAFT -> PUBLISHED                 only through publication service
UNDER_REVIEW -> DRAFT
UNDER_REVIEW -> PUBLISHED
PUBLISHED -> UNPUBLISHED
PUBLISHED -> ARCHIVED
UNPUBLISHED -> UNDER_REVIEW
UNPUBLISHED -> PUBLISHED
UNPUBLISHED -> ARCHIVED
ARCHIVED -> DRAFT                  explicit restore; never direct restore to published
```

Publication validation is distinct from draft validation. Publishing must be atomic and must validate public title/content, category/transaction, valid geography, public-safe location, area/provenance, price mode, cover media or approved exception, category minima, claims/evidence and privacy.

### 6.2 Property availability

Independent states: `AVAILABLE`, `UNDER_NEGOTIATION`, `SOLD`, `RENTED`, `LEASED`, `OFF_MARKET`.

- `AVAILABLE -> UNDER_NEGOTIATION` only for a real negotiation.
- `UNDER_NEGOTIATION -> AVAILABLE` when the negotiation ends and inventory remains marketable.
- `AVAILABLE -> SOLD|RENTED|LEASED` requires outcome confirmation, audit and public-state revalidation.
- Any state may move to `OFF_MARKET` through an explicit admin action.
- Availability never implies publication, and publication never implies availability.

### 6.3 Owner submission

```text
NEW -> CONTACTED
CONTACTED -> DOCS_REQUESTED | UNDER_REVIEW
DOCS_REQUESTED -> UNDER_REVIEW
UNDER_REVIEW -> VERIFICATION_PENDING | APPROVED | REJECTED
VERIFICATION_PENDING -> APPROVED | ON_HOLD
any non-terminal active state -> ON_HOLD
ON_HOLD -> UNDER_REVIEW
REJECTED -> CLOSED
APPROVED -> CONVERTED
CONVERTED -> CLOSED
```

Conversion is explicit, transactional, idempotent and produces a `DRAFT` property only. Documents remain private and no owner submission auto-publishes.

### 6.4 Lead

```text
NEW -> CONTACT_ATTEMPTED | QUALIFIED | NURTURE | LOST | CLOSED
CONTACT_ATTEMPTED -> CONTACT_ATTEMPTED | QUALIFIED | NURTURE | LOST | CLOSED
QUALIFIED -> REQUIREMENT_CONFIRMED | PROPERTY_MATCHED | NURTURE | LOST | CLOSED
REQUIREMENT_CONFIRMED -> PROPERTY_MATCHED | NURTURE | LOST
PROPERTY_MATCHED -> SITE_VISIT_REQUESTED | NURTURE | LOST
SITE_VISIT_REQUESTED -> SITE_VISIT_CONFIRMED | NURTURE | LOST
SITE_VISIT_CONFIRMED -> SITE_VISIT_COMPLETED | NURTURE | LOST
SITE_VISIT_COMPLETED -> NEGOTIATION | NURTURE | LOST
NEGOTIATION -> WON | LOST | NURTURE
NURTURE -> CONTACT_ATTEMPTED | QUALIFIED | REQUIREMENT_CONFIRMED |
           PROPERTY_MATCHED | SITE_VISIT_REQUESTED | NEGOTIATION |
           WON | LOST | CLOSED
WON | LOST | CLOSED -> no ordinary transitions
```

Direct `NEW -> QUALIFIED` is limited to already-qualified offline/admin-entered context. Reopening a terminal opportunity is explicit and preferably creates a new linked opportunity.

### 6.5 Site visit

The visit state is independent from the lead state. Requests always start at `REQUESTED`; only an admin may propose or confirm a time. “Scheduled” is the product phase represented by `PROPOSED`, `CONFIRMED` and, during a change, `RESCHEDULED`; it is not an additional V1 enum.

Expected operational sequence:

```text
REQUESTED -> CONTACTED | CANCELLED
CONTACTED -> PROPOSED | CANCELLED
PROPOSED -> CONFIRMED | RESCHEDULED | CANCELLED
CONFIRMED -> COMPLETED | RESCHEDULED | NO_SHOW | CANCELLED
RESCHEDULED -> PROPOSED | CONFIRMED | CANCELLED
COMPLETED | CANCELLED | NO_SHOW -> terminal for that visit record
```

ADR-0001 resolves the prior conflict: `FOLLOW_UP_REQUIRED` is not a visit status. A completed visit can remain `COMPLETED` while CRM follow-up is represented by `leads.next_follow_up_at`, a `FOLLOW_UP_SCHEDULED` lead activity and purpose-built next-action context. The admin “Follow-up Required” list is a derived operational query. Re-engagement after a terminal visit creates CRM work and, where needed, a new visit record rather than rewriting the historical outcome.

### 6.6 Verification check

```text
NOT_STARTED -> IN_REVIEW
IN_REVIEW -> PASSED | PASSED_WITH_NOTE | FAILED | REQUIRES_REVIEW
PASSED | PASSED_WITH_NOTE -> EXPIRED | REQUIRES_REVIEW
EXPIRED | FAILED | REQUIRES_REVIEW -> IN_REVIEW
REQUIRES_REVIEW -> FAILED
```

There is no automatic `EXPIRED|FAILED|REQUIRES_REVIEW -> PASSED`. A new human review, scope and required evidence are mandatory. Public output additionally requires an eligible status, `public_visible`, approved label/explanation, freshness and claim-specific support.

### 6.7 Guide/content

```text
DRAFT -> REVIEW -> PUBLISHED -> UNPUBLISHED | ARCHIVED
UNPUBLISHED -> REVIEW | PUBLISHED | ARCHIVED
```

Unreviewed content never auto-publishes. SEO pages use `DRAFT`, `REVIEW`, `PUBLISHED`, `NOINDEX`, `ARCHIVED` and also require content/inventory/canonical quality gates.

## 7. Data classification and projections

### 7.1 Public-safe fields

- property code, slug, category and primary transaction;
- eligible current public offer and price presentation;
- public title, sanitized descriptions and highlights;
- public area plus supported normalization/provenance wording;
- approved geography labels, public address and permitted map point;
- availability and published timestamp;
- approved public media;
- approved public parcel identifiers, planning/category attributes and flexible attributes only when explicitly public;
- scoped public verification label, explanation, scope and reviewed date;
- published guide/SEO content;
- allowlisted public business settings.

### 7.2 Conditional fields

- Exact coordinates are public only when `location_visibility=EXACT` and exact disclosure is explicitly approved.
- Approximate listings receive only separately stored/generated public-safe coordinates.
- Hidden listings receive no coordinate fields.
- Parcel identifiers, planning facts, category details and flexible attributes require field/row-level public approval.
- App settings require an explicit allowlist even when `is_public` exists.

### 7.3 Private/admin-only fields

- exact/private coordinates for approximate or hidden listings;
- owner/party legal name, phone, email, alternate phone and consent detail;
- private documents, object paths, signed URLs and document contents;
- verification evidence, source metadata, reviewer notes, exceptions and private risk analysis;
- internal property/source/commission/negotiation notes;
- owner submissions and conversion notes;
- all lead, requirement, matching, visit and activity data;
- unpublished/draft/review/archived-only inventory and content;
- audit logs and internal analytics associations;
- service credentials and anti-bot secrets.

These fields must be absent—not CSS-hidden—from public HTML, RSC payloads, React props, APIs, JSON-LD, metadata, analytics, logs, email and browser state.

### 7.4 Public projection/DTO inventory

Database projections:

- `public_property_listings`;
- `public_property_detail`;
- safe geography/reference projections as required;
- safe public media projection;
- safe public verification projection;
- published guide/category projection;
- published SEO-page projection;
- allowlisted public-settings projection.

Application DTOs/projection functions:

- `PublicPropertyCardDTO` / `toPublicPropertyCard()`;
- `PublicPropertyDetailDTO` / `toPublicPropertyDetail()`;
- `PublicAreaDTO`;
- `PublicPriceDTO`;
- `PublicMediaDTO` / `toPublicMedia()`;
- `PublicVerificationDTO` / `toPublicVerification()`;
- `PublicMapPointDTO` / `toPublicMapPoint()`;
- `PublicGuideDTO`;
- `PublicSeoPageDTO`;
- public search result/pagination DTO;
- safe public business/geography option DTOs;
- shared discriminated `ActionResult<T>` envelope with safe error codes.

No public DTO carries owner/party IDs, private-document IDs, private storage paths, exact private coordinates, internal notes, evidence rows, raw Supabase errors or stack traces.

### 7.5 Admin-only DTO inventory

Purpose-built DTOs are required for:

- admin property list/detail/draft/edit/publication blockers;
- property offer, parcel, private location and category extensions;
- media management and private document access;
- verification queue/detail/evidence/recheck;
- owner submission list/detail/conversion preview;
- lead inbox/detail/pipeline/requirement/matches/activity;
- site visit list/detail/calendar;
- guide/category/SEO/location editing;
- settings, analytics and audit views;
- signed document-access response (short-lived URL only after authorization).

Admin DTOs may be sensitive but still must not be raw `SELECT *` rows or raw storage objects.

## 8. RLS and authorization ledger

Default posture: revoke broad grants, enable RLS on every application table, deny anonymous/authenticated-non-admin base-table access, and add only explicit policies. New tables fail closed.

| Boundary | Anonymous | Authenticated non-admin | Active admin | Trusted server/service |
|---|---|---|---|---|
| Geography/planning/reference base tables | No direct read; approved projections only | Deny | CRUD where operationally allowed | CRUD |
| Property, offer, parcel, location and category base tables | Deny; public projections only | Deny | CRUD, with state changes through services | CRUD |
| Public attribute definitions/options | Approved active projection only | Deny | CRUD | CRUD |
| Parties, ownership/source links | Deny | Deny | Authorized CRUD | CRUD |
| Media base table | Approved public-media projection only | Deny | CRUD | CRUD |
| Private documents/submission documents | Deny | Deny | Authorized read; mutations through approved service | CRUD |
| Verification base/evidence tables | Deny; scoped summary projection only | Deny | CRUD through workflow services | CRUD |
| Owner submissions | No direct insert/read; server action only | Deny | CRUD through workflow | CRUD |
| Leads/requirements/matches/activities/site visits | No direct insert/read; server action only | Deny | CRUD through workflow | CRUD |
| Guides/SEO | Published projection only | Deny | CRUD through editorial workflow | CRUD |
| `admin_profiles` | Deny | Deny | Read own/authorized; no self-escalation | CRUD/provisioning |
| `app_settings` | Allowlisted projection only | Deny | Read; server-owned write | CRUD |
| `analytics_events` | No direct read/insert; protected server ingestion | Deny | Read | CRUD |
| `audit_logs` | Deny | Deny | Read only | Append/read |

Storage RLS validates both bucket and server-generated object prefix. Knowing an object path is never authorization. Business state transitions remain server-owned even when table RLS technically allows an active admin row update.

## 9. Storage classification

| Bucket | Visibility | Allowed contents |
|---|---|---|
| `property-media-public` | Public-read after approval | Optimized approved listing images and approved public brochures/map images |
| `property-media-private` | Private | Unapproved/source property media and private working assets |
| `verification-documents-private` | Private | Legal/verification evidence and professional material |
| `owner-submissions-private` | Private | Owner uploads and submission attachments |
| `guide-media-public` | Public-read after approval | Approved published guide media |

Rules:

- public and private object paths are server-generated;
- validation checks MIME, signature, size and image metadata;
- public promotion is explicit and auditable;
- archive precedes destructive deletion;
- signed private URLs are short-lived and admin-authorized;
- large videos are external URLs in V1;
- SHA-256 duplicate detection and orphan reconciliation are required;
- private paths/URLs never enter public DTOs, logs or analytics.

## 10. Server-owned mutation inventory

Public actions:

- `submitPropertyInquiry()`;
- `submitBuyerRequirement()`;
- `submitOwnerLandSubmission()`;
- `requestSiteVisit()`;
- `recordPublicInteraction()` / protected general contact action.

Admin/domain services:

- property draft/update/duplicate/review/publish/unpublish/archive/restore/availability/location/offer;
- media register/cover/reorder/archive/restore;
- verification start/update/evidence/complete/recheck;
- owner submission transition/convert;
- lead create/update/transition/match/activity/follow-up;
- site visit contact/propose/confirm/reschedule/complete/no-show/cancel/follow-up;
- guide/SEO/location content review/publish/unpublish/archive;
- settings update, exports and private-document access.

All public mutations validate input, consent, origin/request integrity, rate limit, honeypot and Turnstile where enabled. Core multi-write persistence is transactional; notification/analytics failure after commit does not undo durable business state.

## 11. Provider boundaries

| Capability | V1 adapter/default | Rule |
|---|---|---|
| Database/Auth/Storage | Dedicated Supabase project | Never share Living Space project; migrations are source of truth |
| Hosting | Netlify Free | No automatic production DB migration; production deployment approval-gated |
| Email | Provider interface; Resend Free default | Failure after commit is recorded/retriable, not transaction-controlling |
| Anti-bot | Provider interface; Cloudflare Turnstile Free default | Server-side verification; fail safely according to form policy |
| Maps | Map adapter; MapLibre + OpenFreeMap default | Attribution required; no direct OSM tile dependency; safe coordinates only |
| Directions | Google Maps URLs | No paid Maps API/SDK dependency |
| Analytics | Analytics interface; Cloudflare Web Analytics default | No PII, private coordinates, document IDs or internal notes |
| Search | PostgreSQL in V1 | Future provider interface only; no Elasticsearch/Algolia V1 dependency |
| Video/360 | External URL/provider | No large binary hosting in V1 |
| DNS/TLS | Cloudflare Free DNS + Netlify-managed HTTPS | Production DNS/cutover owner-approved |
| Backup | Supabase CLI logical dump + encrypted owner-controlled storage | Restore must be tested; Free plan managed backups are insufficient |

Provider claims/pricing recorded in the architecture are dated 31 August 2026 and must be revalidated before provider activation or launch.

## 12. Environment variables

Public/configuration:

```dotenv
APP_ENV=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
NEXT_PUBLIC_MAP_STYLE_URL=
NEXT_PUBLIC_MAP_PROVIDER=
NEXT_PUBLIC_ANALYTICS_ENABLED=
```

Server-only secrets:

```dotenv
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_REPLY_TO=
TURNSTILE_SECRET_KEY=
HMAC_SECRET=
WEBHOOK_SIGNING_SECRET=
```

`EMAIL_FROM`/`EMAIL_REPLY_TO` are server configuration even though not credentials. No real value belongs in `.env.example`. The environment parser must reject missing/invalid required values by environment and privileged modules must be guarded with `server-only`.

Test safety additionally requires variables for an explicit test target/project reference and, if selected, a test-only safety token. Exact names are an M1 implementation detail, but tests must refuse `APP_ENV=production`, a production project reference/URL, or an absent required test safety token.

## 13. Test and evidence ledger

Required layers:

1. lint, formatting, strict typecheck and secret scan;
2. unit tests for validators, formatters, state machines, claims, location privacy and search parsing;
3. component tests for forms, property cards/details, admin state controls and accessible error/loading states;
4. database reset/migration, constraints, triggers and transaction tests;
5. RLS and storage actor-matrix tests for anonymous, non-admin, inactive admin, active admin and service role;
6. application integration tests for queries, actions, provider failures and rollback/idempotency;
7. E2E critical public/admin workflows;
8. exact-location, owner-PII, private-document, unpublished-inventory and service-key leakage scans across HTML/RSC/API/JSON-LD/logs/analytics;
9. accessibility and keyboard/screen-reader-critical-flow tests;
10. responsive tests at mobile/tablet/desktop and dense admin views;
11. SEO canonical/robots/sitemap/structured-data/status/redirect tests;
12. performance/query-bound/N+1/image tests and production build;
13. staging smoke, backup/restore and rollback evidence.

P0 release blockers include any privacy/RLS/auth/publication bypass, production contamination, transaction corruption, build failure, unsafe sitemap/indexing, misleading availability, unsupported verification claim, critical conversion-flow failure or unverified backup/restore. P1 covers incorrect search/CRM, upload bypass, canonical breakage, admin workflow failure, conversion-blocking accessibility/responsive issues and major performance regression.

Every Definition-of-Done criterion must end as `PASS` with evidence or an explicitly permitted `N/A — APPROVED`. `UNVERIFIED`, `NOT TESTED`, `FAIL` and mandatory validation gaps block release.

## 14. Production approval gates

Owner approval is mandatory before any of the following:

- creating production infrastructure;
- production deployment/cutover or publishing the website;
- connecting the real domain or changing authoritative DNS;
- applying production database migrations;
- destructive production data/storage operations;
- inserting/importing real customer, owner, lead or inventory data;
- uploading real private legal/owner documents;
- enabling production email sending;
- activating/upgrading any paid provider or feature;
- adding billing, auto-recharge or payment details.

Development, local migrations/tests and staging preparation may proceed only after their milestone prerequisites and without real private/production data.

## 15. Known architecture additions requiring ADR/migration

1. **SEO redirect history (deferred to M16):** the approved schema has no persistent redirect model. Before editable published slugs are supported, create a controlled ADR and additive typed `seo_redirects` migration, or explicitly lock published slugs and use a narrowly approved static redirect process. Never store redirect history in JSON/settings/process memory.
2. **Evidence provenance lifecycle (decision by M8):** `06-VERIFICATION-WORKFLOW.md` defines `RECEIVED`, `REVIEWED`, `SOURCE_VERIFIED`, `SUPERSEDED`, `REVOKED`, while the current schema does not persist an explicit provenance state/history. The verification document permits a future migration if stronger V1 traceability requires it. Resolve via ADR before implementing behavior that depends on those states.
3. **Professional review lifecycle (decision by M8):** the verification architecture describes a richer professional-review state machine without a dedicated table/status in the authoritative schema. V1 may model it as scoped verification definitions/results only if every required identity/scope/material/date/outcome field can be preserved without ad hoc JSON; otherwise use an ADR and migration.
4. **Site-visit follow-up status:** resolved by ADR-0001 with no schema addition; retain as a regression-test contract through M14.

## 16. Consistency review and open items

### Blocking before M1

No unresolved M0 blocker remains.

### Resolved source limitation

| ID | Finding | Resolution | Evidence |
|---|---|---|---|
| M0-R04 | The old Living Space repository will not be supplied. | The owner designated `URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md` as the authoritative Living Space brand/design reference and explicitly directed that the repository must not block M0. The supplied logo was inspected separately. | Owner direction dated 2026-09-03; `SOURCE-MANIFEST.md`; logo SHA-256 `a889d3814187ba2da98e77f7609fed09b31bc662dd5b6b655e281c1d8a32d072` |

### Resolved architecture conflict

| ID | Finding | Resolution | Evidence |
|---|---|---|---|
| M0-R01 | `03` defines `site_visit_status` without `FOLLOW_UP_REQUIRED`; `05` treated it as a status. | Follow-up is a CRM concern, not a mutually exclusive visit lifecycle. Keep the eight-value enum; derive follow-up queues from lead due-time/action/activity data. | ADR-0001; owner decision dated 2026-09-03 |
| M0-R02 | The expected standalone master-prompt filename was absent. | Located its complete converted contents inside `/Users/vedpatel/Desktop/merged (1).md`, lines 56904–62392, and reviewed it in full as the highest-priority source. | `docs/architecture/SOURCE-MANIFEST.md`; full sequential read completed 2026-09-03 |
| M0-R03 | Master examples use `UEL-AG-000001`, `/property/[slug]`, `NEGOTIABLE` price mode and a single `SCHEDULED` visit label, while later documents use `UE-LS-000001`, `/properties/[property-slug]`, `is_negotiable`, and detailed scheduling states. | Treat later finalized architecture as the approved detailed refinement of the master’s explicitly recommended/high-level examples, consistent with the owner’s hierarchy and instruction that documents `01`–`14` are the implementation contract. No new ADR is required because no governing business rule is reversed. | `docs/REQUIREMENTS.md`; `docs/DECISIONS.md`; documents `02`, `03`, `12` |

### Controlled later decisions

| ID | Finding | Milestone |
|---|---|---|
| M0-D01 | Persistent SEO redirect history absent by design | M16 ADR/migration gate |
| M0-D02 | Evidence provenance lifecycle may need persistent state/history | M8 ADR gate |
| M0-D03 | Professional review lifecycle may need dedicated persistence | M8 ADR gate |

### Review results

- Every public route has a public-safe data source or static/version-controlled content source.
- Every admin route has a server-side active-admin authorization boundary.
- Every public mutation has a server-owned action/handler.
- Every private document bucket and access path is private and authorization-gated.
- Exact coordinates are classified private unless exact disclosure is explicitly approved.
- Required workflows map to approved tables/states; the former site-visit discrepancy is resolved by ADR-0001 and later controlled additions remain milestone-gated.
- No V1 workflow requires buyer accounts, seller dashboards, payments, in-app chat, automatic booking, external search or microservices.
- The complete master prompt introduces no unresolved implementation-blocking contradiction with documents `01`–`14` under the established source hierarchy.
- ADR-0001 remains consistent with the master prompt and the owner’s explicit site-visit/follow-up decision.

## 17. Milestone status

| M0 completion criterion | Status | Evidence |
|---|---|---|
| Implementation ledger exists | PASS | This file |
| All supplied architecture documents referenced | PASS | Section 1 |
| Master prompt located and read in full | PASS | Embedded source at `/Users/vedpatel/Desktop/merged (1).md`, lines 56904–62392 |
| Owner-approved Living Space brand/design source available | PASS | Design report explicitly designated authoritative; old repository explicitly non-required |
| Approved logo/assets inspected | PASS | 4267×4267 RGB JPEG visually reviewed and fingerprinted in `SOURCE-MANIFEST.md` |
| No unresolved architecture contradiction affects the next milestone | PASS | M0-R01 through M0-R04; ADR-0001 |
| Required schema concepts approved or marked for later ADR | PASS | Sections 15–16 |
| Single authoritative route/state/data map exists | PASS | Sections 3–13 |

**M0 outcome: COMPLETE.** The owner-approved source limitation is documented, the design report and supplied logo satisfy the brand-reference inputs, the full architecture consistency review passes, ADR-0001 remains valid, all required schema concepts are approved or milestone-gated, and the authoritative route/state/data map is established. M1 may begin.

## 18. Implementation checkpoints

| Milestone | Status | Reconciled evidence |
|---|---|---|
| M1 | COMPLETE | Strict application/tooling foundation, safety guard, boundary/secret checks, tests and production build pass |
| M2 | COMPLETE | 49 tables, 24 enums, ordered migrations, repeatable safe seed, 38 integrity tests and 24-way identifier concurrency test pass |
| M3 | COMPLETE | Seven explicit public-safe views, separate public/admin DTOs, server-only privileged clients, centralized location transformer, executable state machines, validation schemas, 22 unit tests and 23 projection/canary tests pass |
| M4 | COMPLETE | RLS enabled on all 49 tables; 10 public views use a NOLOGIN/NOBYPASSRLS projection owner; active-admin reads, server-owned writes, trusted audit and 40 actor-matrix checks pass |

The schema freeze remains in force. M5 may add authentication/session and admin-shell application code but no new persistent business concept unless an ADR/schema amendment approves it.
