# URBANEDGE LAND SPACE — SECURITY / PRIVACY / RLS ARCHITECTURE

**File:** `08-SECURITY-PRIVACY-RLS.md`  
**System:** UrbanEdge Land Space V1  
**Launch geography:** Ahmedabad + Gandhinagar, Gujarat  
**Database:** PostgreSQL via dedicated Supabase project  
**Application:** Next.js App Router, Server Components, Server Actions, narrow Route Handlers  
**Architecture date:** 30 August 2026  
**Status:** Production security / privacy / authorization contract for implementation

> **Purpose** — This document converts the supplied UrbanEdge database, backend, admin/CRM and verification architecture into a concrete Supabase security boundary. It defines database grants, RLS concepts, storage access, privileged-server behavior, public/private projections, exact-coordinate isolation, document protection, anti-abuse controls, privacy handling, auditability and a negative-test matrix.

> **Important** — This is a software security architecture and operational privacy baseline, not legal advice. Retention periods, consent language and any jurisdiction-specific privacy obligations must be finalized against the current applicable legal requirements and reviewed by qualified counsel before production policy lock.

---

## 1. Architectural authority and source alignment

This security architecture is subordinate to and must remain compatible with the supplied project contracts:

1. `LEGAL_VERIFICATION_REPORT.md` — scoped verification, evidence provenance, professional-review flags, public-claim boundaries and legal-review limitations.
2. `03-DATABASE-SCHEMA-ARCHITECTURE.md` — authoritative table inventory, public/private boundaries, exact/public coordinates, storage buckets, RLS requirement, audit model and service-role rule.
3. `04-BACKEND-API-BUSINESS-LOGIC.md` — server-owned mutations, request validation, abuse controls, public projections, private-document handling, coordinate privacy and server-only trust boundary.
4. `05-ADMIN-CRM-ARCHITECTURE.md` — single-admin V1 operational model and privileged admin surfaces.
5. `06-VERIFICATION-WORKFLOW.md` — evidence, provenance, reviewer, dates, scoped verification and public-safe summaries.

The database architecture expressly requires explicit public-safe projections, private exact coordinates, private documents, owner PII isolation, RLS and server-only privileged keys. The same document also requires automated proof that anonymous users cannot access leads, parties/private PII, owner submissions, private documents, private coordinates, internal verification notes or audit logs.

The verification workflow further establishes that public output is a projection rather than raw evidence, and that owner-provided, reviewed, source-verified and professionally reviewed material are distinct evidence states.

The backend contract makes the browser a requester of operations, not the authority for business state; it also requires server-only handling for service-role credentials, private documents, owner PII, exact coordinates, admin records, internal notes, anti-bot secrets and private storage keys.

---

## 2. Security posture: the non-negotiable invariants

UrbanEdge V1 shall be implemented as **deny-by-default, server-owned, projection-based, least-privilege** data architecture.

### 2.1 Core security invariants

1. **RLS is enabled on every application table exposed through Supabase.**
2. **Database grants are restrictive as well as RLS-restricted.** RLS alone is not the entire API boundary; the role must also have a grant for the operation.
3. **Anonymous users do not receive direct table access to sensitive/base application tables.** Public discovery is through explicit safe projections.
4. **Authenticated-but-not-admin users are not a V1 business actor.** Authentication alone never grants CRM, inventory, verification or document access.
5. **Active admin status is checked in the database authorization path, not inferred from UI state.**
6. **Service-role credentials bypass RLS by design and therefore exist only in trusted server-side execution.** They never appear in browser code, public environment variables, logs, analytics or client payloads.
7. **Public rows and public columns are separate concepts.** RLS provides row authorization; explicit views/projections provide column isolation.
8. **Exact coordinates are never exposed by a public property row, public view, HTML, RSC payload, JSON-LD, public API, analytics event, public log or Open Graph payload.
9. **Owner identity/contact information is private by default.** Public listing pages do not disclose owner phone, email or legal name.
10. **Private documents and verification evidence live in private storage buckets and have no public URLs.**
11. **Signed URLs are short-lived capabilities created only after admin authorization and retention checks.**
12. **Owner claims, verification evidence and professional-review material never become public merely because a file was uploaded or reviewed.**
13. **No universal `verified`, `clear_title`, `government_approved` or equivalent boolean exists or is inferred.**
14. **All public verification labels are scoped, dated and explicitly approved for publication.**
15. **Public form mutations do not write directly to CRM/application tables from the anonymous browser.** They enter through server actions/route handlers with validation, rate limits, anti-bot checks and authoritative inserts.
16. **Audit records are append-only.** Ordinary admin CRUD does not include update/delete on audit logs.
17. **Normal business retirement is archive/off-market, not hard deletion.** Private-data deletion/anonymization is separate, policy-driven and audited.
18. **Unknown/new tables do not become public automatically.** New schema objects must fail closed until grants, RLS and projection review are complete.

---

## 3. Threat model

The architecture assumes an attacker can:

- skip every UI control and call PostgREST/Data API directly;
- enumerate predictable IDs, property codes, slugs or storage paths;
- submit `select=*` and relationship-expansion queries;
- send arbitrary JSON/form bodies to Server Actions or Route Handlers;
- alter hidden form fields, anti-bot fields and client-side flags;
- replay requests and upload arbitrary file content;
- obtain or guess a private storage object path;
- attempt to use a signed URL after authorization should have expired;
- impersonate `isAdmin` in client state;
- send forged Turnstile tokens;
- attempt CSRF from an attacker origin;
- inject HTML/Markdown/URLs into public content;
- search private identifiers through keyword and filter parameters;
- infer private location from analytics, maps, error messages, URLs, cache keys or logs;
- use a compromised/non-admin authenticated account;
- use an accidentally exposed publishable key against tables with overly broad grants;
- attempt direct storage API operations rather than going through the application;
- exploit a future schema change that adds a sensitive column to a public projection.

The design goal is that **the attacker can bypass the UI completely and still cannot cross the database/storage trust boundary**.

---

## 4. Trust zones

```text
┌────────────────────────────────────────────────────────────────────┐
│ Z0  PUBLIC INTERNET                                                │
│ anonymous browser, crawlers, bots, malicious clients              │
└───────────────┬────────────────────────────────────────────────────┘
                │ HTTPS only
                │ public projection reads / protected form requests
                ▼
┌────────────────────────────────────────────────────────────────────┐
│ Z1  NEXT.JS PUBLIC EDGE                                            │
│ Server Components + Server Actions + Route Handlers               │
│ validation + rate limiting + Turnstile + origin checks             │
└───────────────┬────────────────────────────────────────────────────┘
                │ user-scoped or server-scoped DB request
                ▼
┌────────────────────────────────────────────────────────────────────┐
│ Z2  SUPABASE DATA API / POSTGRES                                   │
│ grants + RLS + safe public views                                   │
└───────────────┬────────────────────────────────────────────────────┘
                │ privileged-only path
                ▼
┌────────────────────────────────────────────────────────────────────┐
│ Z3  TRUSTED SERVER                                                 │
│ service-role client; private documents; exact coordinates; PII     │
│ secrets; admin-only operations                                    │
└────────────────────────────────────────────────────────────────────┘

Storage is a parallel Z2/Z3 boundary:
public bucket → intentionally public assets only
private buckets → authorized admin download / short-lived signed URL
```

### 4.1 Rule for trust boundaries

A browser component, even a Next.js Client Component, is always **untrusted**. A Server Component is not automatically privileged either; it must use the least-privileged query path required for the operation. Any code that can handle secrets or private data is explicitly server-only.

---

## 5. Actor model and authorization

### 5.1 Actors

| Actor | Authentication | Default database posture | Allowed business scope |
|---|---|---|---|
| `anon` | none | public-safe projection only | browse published inventory/content; submit protected public forms through server |
| `authenticated` non-admin | Supabase Auth | deny on UrbanEdge business tables | no V1 business access |
| `admin` | Supabase Auth + active `admin_profiles` | full V1 operational access subject to role/resource rules | inventory, CRM, submissions, verification, documents, content, settings, audit read |
| `service_role` | server secret | bypasses RLS | trusted server operations only; never a browser actor |
| trusted worker/integration | server secret or controlled internal credential | privileged only for its exact job | webhooks, maintenance, retention, notifications, scheduled jobs |

### 5.2 Admin authorization rule

`requireAdmin()` must verify:

1. a valid authenticated Supabase identity;
2. an `admin_profiles` row matching `auth.uid()`;
3. `is_active = true`;
4. the role is authorized for the requested operation;
5. resource-level authorization for particularly sensitive actions (private document, exact coordinate, deletion/anonymization, export, credential/configuration work).

V1 has one operational role, `ADMIN`, but policies should be written through a helper such as `private.has_admin_permission(permission_code)` so future roles do not require rewriting every policy.

### 5.3 Never trust

The following are **not** authorization signals:

- `isAdmin` from React state;
- a hidden form field;
- a query parameter such as `?admin=true`;
- a property ID supplied by the browser;
- a storage object path supplied by the browser;
- a guessed signed URL;
- a `public_visible` value supplied by a client mutation;
- a client-provided `published=true` flag;
- an owner-provided claim such as `clear title` or `NA`;
- an authenticated Supabase session without checking `admin_profiles`.

---

## 6. Supabase grants + RLS strategy

Supabase access has two layers: PostgreSQL grants decide whether a role can reach an object, while RLS decides which rows are permitted. Production must use both controls. Supabase's current guidance explicitly recommends granting only what each role needs and enabling RLS on exposed tables/views; on projects with permissive legacy defaults, explicitly revoke unwanted `anon`/`authenticated` privileges rather than assuming policies remove grants. citehttps://supabase.com/docs/guides/api/securing-your-apiturn418576search0turn418576search1

### 6.1 Default grant posture

For each application table:

```sql
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.<table> FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.<table> FROM anon;
REVOKE ALL ON TABLE public.<table> FROM authenticated;
-- service_role retains the privileged server path.
```

Then explicitly grant only the required operations to `authenticated`, followed by RLS policies limiting them to an active admin actor.

For public data, grant `SELECT` on a specifically approved public projection view rather than granting `SELECT` on the underlying table wherever practical.

> **Why `FORCE ROW LEVEL SECURITY`?** It prevents the table owner from accidentally bypassing RLS in ordinary table access paths. It does not constrain `service_role`; that role is intentionally privileged and is separately protected as a server-only secret.

### 6.2 New-table safety gate

Every migration that creates a table must include, in the same migration or immediately before exposure:

```text
CREATE TABLE
→ ENABLE RLS
→ FORCE RLS where appropriate
→ REVOKE anon/authenticated
→ create explicit policies
→ explicit role GRANTs
→ add safe projection if public
→ add security test
```

No merge is complete when a newly created table remains reachable through broad default Data API grants.

### 6.3 Authorization helper functions

Create privileged helper functions in a **non-exposed schema** such as `private`:

```text
private.is_active_admin()
private.has_admin_permission(permission_code)
private.can_read_private_document(document_id)
private.can_read_exact_location(property_id)
private.assert_published_public_property(property_id)
```

Rules:

- `SECURITY DEFINER` is allowed only where it materially simplifies authorization.
- Set an explicit safe `search_path` (prefer `search_path = ''`) and schema-qualify every relation.
- Revoke public/anonymous execution.
- Do not place such functions in an API-exposed schema when their return value would disclose privileged information.
- Treat `SECURITY DEFINER` as privileged code and test it separately.

Supabase's current function guidance specifically calls for a safe `search_path` on `SECURITY DEFINER` functions and careful EXECUTE grants; its RLS performance guidance also recommends narrowly scoped `security definer` helpers for role checks when they are otherwise blocked by RLS recursion. citeturn418576search8turn418576search2

---

## 7. Public data exposure model

### 7.1 Public is a projection, not a permission accident

The public website should normally read:

```text
public_property_listings
public_property_detail
public_guides
public_seo_pages
public_* geography/reference projections as required
```

These projections may contain only data that is intentionally public.

The source architecture's public property projection includes public property code/slug/category/transaction, active public offer summary, title/description, public area, geography, safe address, public-safe coordinates, approved public media and approved public verification summaries. It explicitly excludes owner contact, private parties, private documents, private exact coordinates, internal notes, reviewer notes, rejection reasons, commission data, private lead associations and audit logs.

### 7.2 Column isolation rule

RLS is row-level. It does not safely hide one sensitive column from an otherwise permitted row. Therefore:

```text
SENSITIVE BASE TABLE
        ↓  not directly exposed to anon
EXPLICIT PUBLIC PROJECTION
        ↓  only approved columns
PUBLIC CLIENT
```

Never solve column privacy by returning a complete row and deleting fields in React.

### 7.3 Safe public-view implementation

Use a dedicated view owner/non-login role with the minimum underlying privileges needed to build a safe projection. The public role receives `SELECT` on the view, not the underlying sensitive tables.

A public view must:

- list columns explicitly;
- enforce publication eligibility;
- exclude all private/internal columns;
- avoid joins that pull private entities solely for convenience;
- never expose a raw JSON aggregate sourced from a private table;
- be regression-tested for newly added columns;
- have a stable, documented DTO contract.

---

## 8. Exact-coordinate isolation

The existing `property_locations` table contains both exact and public-safe coordinates. The security architecture therefore treats the base table as **admin/private only** and exposes only approved public fields through projections.

### 8.1 Stored fields

Private/base table fields include:

```text
private_latitude
private_longitude
private_accuracy_m
location_notes
location_source_reference_id
location_visibility
```

Public-safe fields are:

```text
public_latitude
public_longitude
public_accuracy_m
```

### 8.2 Public rules

| `location_visibility` | Public coordinates |
|---|---|
| `APPROXIMATE` | public-safe coordinates only |
| `HIDDEN` | no coordinates at all |
| `EXACT` | only when exact-public-disclosure approval exists as a separate approved business fact |

**Storage of exact coordinates is never itself permission to publish exact coordinates.**

### 8.3 Mandatory leak surfaces to test

Exact coordinates must be absent from:

- direct PostgREST table queries;
- public property views;
- RSC payloads;
- Client Component props;
- HTML source;
- JSON-LD/schema markup;
- Open Graph metadata;
- public navigation URLs;
- analytics metadata;
- public logs;
- cache keys/values;
- public emails;
- public map payloads;
- error messages;
- search indexes;
- audit snapshots intended for normal public-facing systems.

The backend architecture explicitly enumerates these surfaces as forbidden for exact coordinates. fileciteturn1file0L60-L128

### 8.4 Stronger V2 hardening option

If operational requirements eventually allow it, move exact coordinates into a dedicated `property_private_locations` table keyed by `property_id`, leaving public-safe location data in a public-capable table. This reduces the impact of accidental privilege grants because the sensitive columns no longer share a row with public coordinates.

This is an optional defense-in-depth improvement; V1 can be safe using base-table denial plus explicit public projection.

---

## 9. Private document isolation

Private documents include title/legal documents, owner submissions, verification evidence and other restricted evidence. The supplied architecture requires them to remain in private storage, outside public DTOs, public queries, analytics and logs.

### 9.1 Relational boundary

For `private_documents`:

```text
anon             → no table grant
non-admin auth   → no table grant
admin            → authorized read/write
service_role     → server-only privileged access
```

For `verification_evidence`:

```text
anon             → deny
non-admin auth   → deny
admin            → full operational read/write
service_role     → privileged server only
```

### 9.2 Signed URL flow

```text
Admin browser
   ↓ authenticated request
Server Action / Route Handler
   ↓ requireAdmin()
lookup private_documents row
   ↓ resource authorization
check archived/retention state
   ↓
create short-lived signed URL
   ↓
return only the signed capability
```

Persist:

```text
bucket + object_path
```

Never persist temporary signed URLs.

Never place signed URLs in normal audit `before_state`/`after_state`, logs, analytics or emails.

Supabase private buckets enforce access through storage RLS or short-lived signed URLs; a signed URL is explicitly designed as a time-limited download capability. citeturn131736search2turn131736search5

### 9.3 Signed URL limits

Recommended V1 defaults, configurable by document class:

| Use | Expiry |
|---|---:|
| admin inline/download document | 60–300 seconds |
| admin preview image | 60–300 seconds |
| temporary batch of evidence files | <= 5 minutes |
| public media | no signed URL needed in public bucket |

A signed URL does not eliminate authorization requirements: it may only be minted after the server has authorized the user and resource.

---

## 10. Storage bucket architecture

The database document defines these Supabase buckets: `property-media-public`, `property-media-private`, `verification-documents-private`, `owner-submissions-private`, and `guide-media-public`. It explicitly requires private buckets for documents/evidence and rejects “unguessable URL” as an access model. fileciteturn2file8L1654-L1682

### 10.1 Bucket matrix

| Bucket | Bucket visibility | Anonymous download | Anonymous upload | Auth non-admin | Admin | Service role |
|---|---|---:|---:|---:|---|---|
| `property-media-public` | Public | **YES, intentional** | NO | NO | CRUD after media authorization | CRUD |
| `property-media-private` | Private | NO | NO | NO | CRUD after property/document authorization | CRUD |
| `verification-documents-private` | Private | NO | NO | NO | CRUD after verification authorization | CRUD |
| `owner-submissions-private` | Private | NO | **NO direct** | NO | CRUD after submission authorization | CRUD |
| `guide-media-public` | Public | **YES, intentional** | NO | NO | CRUD after content authorization | CRUD |

### 10.2 Storage policy principle

Public buckets are used only for intentionally public assets. Public bucket download access effectively means anyone who has the asset URL can retrieve it, so no sensitive evidence may ever be routed into these buckets. Supabase's current bucket documentation confirms that public buckets bypass access controls for retrieving/serving files, whereas private buckets use access controls and signed URLs. citeturn131736search2

### 10.3 Storage object policy shape

For private buckets, use `storage.objects` policies that authorize an active admin and also validate the object path against an authorized relational record where practical.

Conceptually:

```sql
USING (
  bucket_id = 'verification-documents-private'
  AND (select private.is_active_admin())
  AND private.admin_can_read_storage_object(name)
)
```

Do not authorize private objects using only:

```text
name LIKE 'some-prefix/%'
```

without validating that the prefix maps to a real authorized business record.

Supabase Storage uses Postgres RLS on `storage.objects` for access-control policies and recommends distinct buckets for distinct security/access rules. citeturn131736search16turn418576search5

---

## 11. RLS policy contract for every V1 application table

### 11.1 Policy code legend

| Code | Meaning |
|---|---|
| `D` | deny / no role grant |
| `P-R` | public-safe read only through an approved projection; no direct base-table access |
| `A-R` | active-admin read |
| `A-CRUD` | active-admin create/read/update/delete subject to business workflow |
| `A-R+SRV-W` | admin read; trusted server/service writes |
| `SRV-CRUD` | trusted server/service only |
| `A-R-ND` | active-admin read; no direct update/delete |
| `P-I-SRV` | public form can submit only through server service; no direct anonymous insert |

### 11.2 Full table policy matrix

| # | Table | Anonymous | Auth non-admin | Active admin | Service role | Security intent / key RLS rule |
|---:|---|---|---|---|---|---|
| 1 | `countries` | `P-R` via public geography projection | D | A-CRUD | SRV-CRUD | Public geography labels only; mutations admin/server |
| 2 | `states` | `P-R` via public geography projection | D | A-CRUD | SRV-CRUD | Public hierarchy safe; no raw admin/source fields |
| 3 | `districts` | `P-R` via public geography projection | D | A-CRUD | SRV-CRUD | Public names/service-area metadata only through projection |
| 4 | `subdistricts` | `P-R` via public geography projection | D | A-CRUD | SRV-CRUD | Public place-selection data only |
| 5 | `places` | `P-R` via public geography projection | D | A-CRUD | SRV-CRUD | Expose only approved name/pin/service data |
| 6 | `localities` | `P-R` via public geography projection | D | A-CRUD | SRV-CRUD | Public only when `is_active` and approved for index/search |
| 7 | `geography_aliases` | D | D | A-CRUD | SRV-CRUD | Search infrastructure; aliases are not an admin-auth bypass or canonical geography record |
| 8 | `planning_authorities` | P-R via public planning projection | D | A-CRUD | SRV-CRUD | Public authority names only where property projection needs them |
| 9 | `development_plan_zones` | P-R via safe projection | D | A-CRUD | SRV-CRUD | Public zone/use labels only when policy-approved |
| 10 | `tp_schemes` | P-R via safe projection | D | A-CRUD | SRV-CRUD | Public TP context only when explicitly approved |
| 11 | `tp_plots` | P-R via safe projection | D | A-CRUD | SRV-CRUD | Public OP/FP data only if disclosure policy permits |
| 12 | `gidc_estates` | P-R via safe projection | D | A-CRUD | SRV-CRUD | Public GIDC estate name/context only; no private workflow state |
| 13 | `area_units` | P-R via safe projection | D | A-CRUD | SRV-CRUD | Public labels/symbols only; authoritative conversion controls remain admin/server |
| 14 | `area_conversion_rules` | D or safe public projection of approved rules only | D | A-CRUD | SRV-CRUD | Do not expose internal provenance or conflicting/unapproved conversion rules |
| 15 | `source_references` | D | D | A-CRUD | SRV-CRUD | Provenance is internal; public pages never query raw source notes |
| 16 | `properties` | D | D | A-CRUD | SRV-CRUD | Admin-only base table; public reads via safe projections and published-state filter |
| 17 | `property_offers` | D | D | A-CRUD | SRV-CRUD | Admin-only base; public active offer subset through projection |
| 18 | `property_parcels` | D | D | A-CRUD | SRV-CRUD | Parcel internals and notes private; public parcel facts through approved projection |
| 19 | `parcel_identifiers` | D | D | A-CRUD | SRV-CRUD | Survey/source identifiers controlled individually by `public_visibility` in public projection |
| 20 | `property_locations` | D | D | A-CRUD | SRV-CRUD | Exact/private location is admin-only; public map uses projection with safe coordinates only |
| 21 | `property_planning_context` | D | D | A-CRUD | SRV-CRUD | Internal planning notes never public; approved public planning summary via view |
| 22 | `property_agricultural` | D | D | A-CRUD | SRV-CRUD | Public-safe crop/irrigation/physical fields via projection; internal source/reviewer data stays private |
| 23 | `property_na` | D | D | A-CRUD | SRV-CRUD | Public-safe NA status/context only; never expose internal restriction/source metadata by default |
| 24 | `property_industrial` | D | D | A-CRUD | SRV-CRUD | Public-safe industrial/GIDC context through projection; internal operational details protected |
| 25 | `property_attribute_definitions` | P-R via public attribute projection | D | A-CRUD | SRV-CRUD | Only definitions marked public/active are projected |
| 26 | `property_attribute_options` | P-R via public option projection | D | A-CRUD | SRV-CRUD | Only options belonging to public/active definitions are exposed |
| 27 | `property_attribute_values` | D | D | A-CRUD | SRV-CRUD | Base values admin-only; public projection includes values only where definition + row are public and property published |
| 28 | `parties` | D | D | A-CRUD | SRV-CRUD | Owner/legal names, phone, email and notes remain private |
| 29 | `property_parties` | D | D | A-CRUD | SRV-CRUD | Ownership/authority relations are internal; no public owner relation payload |
| 30 | `property_source_links` | D | D | A-CRUD | SRV-CRUD | Source channel, party relation and internal notes are internal |
| 31 | `media_assets` | P-R via public media projection only | D | A-CRUD | SRV-CRUD | Public rows must be approved, non-archived, public bucket; private assets are not projected |
| 32 | `private_documents` | D | D | A-R+SRV-W / A-CRUD where authorized | SRV-CRUD | No public table access; object path never enters public DTOs |
| 33 | `owner_submission_documents` | D | D | A-CRUD | SRV-CRUD | Submission attachments private; linked through `private_documents` authorization |
| 34 | `verification_check_definitions` | P-R via public verification projection | D | A-CRUD | SRV-CRUD | Public labels/templates only through public projection; internal descriptions stay private |
| 35 | `property_verifications` | D | D | A-CRUD | SRV-CRUD | Admin base table; public only rows explicitly `public_visible = true` through safe projection |
| 36 | `verification_evidence` | D | D | A-CRUD | SRV-CRUD | Evidence, notes and support/rejection context are internal/private |
| 37 | `owner_submissions` | D | D | A-CRUD | SRV-CRUD | Public submission creation occurs through server action; no direct anonymous INSERT/SELECT |
| 38 | `leads` | D | D | A-CRUD | SRV-CRUD | Full CRM private; public inquiry creation via server action only |
| 39 | `lead_requirements` | D | D | A-CRUD | SRV-CRUD | Buyer preferences are private operational data |
| 40 | `lead_properties` | D | D | A-CRUD | SRV-CRUD | Matching scores/notes are internal |
| 41 | `lead_activities` | D | D | A-CRUD | SRV-CRUD | Notes/timeline are private; append activity through service |
| 42 | `site_visits` | D | D | A-CRUD | SRV-CRUD | Visitor contact/context and internal notes stay private; requests go through server |
| 43 | `guide_categories` | P-R via public content projection | D | A-CRUD | SRV-CRUD | Only active/publicly used category labels through projection |
| 44 | `guides` | P-R published only | D | A-CRUD | SRV-CRUD | Anonymous sees only `PUBLISHED`; drafts/review/archived remain admin-only |
| 45 | `seo_pages` | P-R published only | D | A-CRUD | SRV-CRUD | Anonymous sees only `PUBLISHED`/approved routes; drafts/noindex/archived protected |
| 46 | `admin_profiles` | D | D | A-R; provisioning changes privileged | SRV-CRUD | Admin cannot self-grant role or activate another account through ordinary CRUD |
| 47 | `app_settings` | D; public values only through allowlisted projection | D | A-R+SRV-W | SRV-CRUD | Secrets never stored; only approved public settings are projected |
| 48 | `analytics_events` | D direct; P-I-SRV | D | A-R | SRV-CRUD | Ingestion via server; no public reads; metadata cannot contain sensitive data |
| 49 | `audit_logs` | D | D | A-R-ND | SRV-CRUD | Append-only; no normal UPDATE/DELETE; raw docs/signatures excluded |

### 11.3 What “active admin” means in SQL policy terms

For tables marked `A-CRUD`, the conceptual policy is:

```text
FOR SELECT/INSERT/UPDATE/DELETE TO authenticated
USING / WITH CHECK:
    private.is_active_admin() = true
    AND operation-specific authorization passes
```

For V1, all active admins are operationally privileged, but sensitive actions should still pass through the server service layer for business rules, audit and workflow validation.

### 11.4 Business-state mutations remain server-owned

Even where RLS technically permits an admin row update, the admin browser should call the approved Server Action rather than issuing arbitrary Supabase table mutations. The service owns:

- state-machine validation;
- publication gates;
- transaction boundaries;
- concurrency checks;
- audit creation;
- storage coordination;
- notification behavior;
- exact-coordinate disclosure policy;
- verification workflow rules.

---

## 12. Public form write security

The backend contract explicitly defines these public Server Actions:

```text
submitPropertyInquiry()
submitBuyerRequirement()
submitOwnerLandSubmission()
requestSiteVisit()
recordPublicInteraction()
```

and the owner workflow as:

```text
rate limit
→ honeypot / anti-bot
→ request validation
→ consent check
→ geography validation
→ area validation
→ contact normalization
→ transaction
→ commit
→ admin notification
```

The public form result is a submission reference or safe confirmation, not a privileged database object dump.

### 12.1 Public mutation rule

```text
Browser
  ↓
Server Action / narrow Route Handler
  ↓
Origin / method check
  ↓
Rate limit
  ↓
Honeypot
  ↓
Turnstile validation where enabled/required
  ↓
Zod/request schema
  ↓
Consent validation
  ↓
Domain rules
  ↓
Idempotency check
  ↓
Server-owned transaction
  ↓
Safe response
```

### 12.2 Direct anonymous CRUD is forbidden

Do not grant `anon` these direct operations:

```text
INSERT into leads
INSERT into owner_submissions
INSERT into site_visits
INSERT into parties
UPDATE properties
INSERT verification_evidence
INSERT private_documents
```

The only supported public write is the server-controlled workflow.

---

## 13. Rate limiting and abuse controls

Rate limiting is defense in depth. It does not replace RLS, authorization or validation.

### 13.1 Suggested policy tiers

These are **UrbanEdge operational starting points**, not statutory limits; tune them against legitimate traffic and abuse telemetry.

| Operation | Suggested limit | Additional control |
|---|---:|---|
| property inquiry | 10 / 10 min / IP-hash | Turnstile after threshold / always if abuse rises |
| buyer requirement | 5 / 15 min / IP-hash | Turnstile required |
| site-visit request | 5 / 15 min / IP-hash | Turnstile required |
| owner submission | 3 / 15 min and 10 / 24 h / IP-hash | Turnstile required + honeypot |
| public interaction | 60 / min / anonymous session | sampling / deduplication |
| public property lookup | 120 / min / IP-hash | bounded pagination, cache |
| signed-document URL issuance | 30 / 10 min / admin | re-auth for exceptional bulk access |
| admin login failure | 5 / 15 min / identity/IP | provider-side auth protections |
| password-reset request | provider/configured | generic response to avoid account enumeration |

### 13.2 Identity for rate limiting

Use several low-risk signals instead of raw IP storage:

```text
HMAC(IP, server secret) → ip_hash
+ anonymous session identifier
+ route/action
+ optional normalized-contact fingerprint
```

Do not store raw IP addresses in application tables unless there is a separately approved operational/security need.

### 13.3 Idempotency

Public business submissions should accept a server-generated or client-generated idempotency key. The server must prevent duplicate business rows after retry.

Use a bounded retention window for idempotency records; do not use idempotency keys as permanent PII.

### 13.4 Turnstile

Turnstile is not a client-only control. The server must call Cloudflare Siteverify and validate the token before accepting a protected form. Current Cloudflare documentation states that server-side validation is mandatory; Turnstile tokens are single-use and expire after 300 seconds. citeturn131736search10

Server validation should check, where available:

- token validity;
- expected hostname/site;
- action (when using action-bound flows);
- expected success state;
- replay/duplicate failure;
- server-side rate limit result.

The Turnstile secret remains an environment secret, never an `app_settings` value exposed to admin/public clients. The supplied backend architecture explicitly prohibits storing the Turnstile secret in application settings. fileciteturn3file4L829-L849

---

## 14. Upload validation architecture

### 14.1 Validation layers

1. **Request validation:** authenticated actor, target business entity, upload purpose, file count and size.
2. **Bucket policy:** allowed MIME types and bucket-level maximum size.
3. **Binary inspection:** magic-byte/signature check; never trust the client `Content-Type` header.
4. **Content validation:** parse/verify the actual image/PDF where appropriate.
5. **Malware scanning:** required for user-submitted private documents before the document becomes trusted workflow evidence.
6. **Metadata normalization:** strip unnecessary EXIF/geolocation metadata from images destined for public media.
7. **Image safety:** reject impossible dimensions, excessive pixel counts and decompression-bomb patterns.
8. **Filename safety:** generate server-owned object names; do not use arbitrary original filenames as storage keys.
9. **Checksum:** compute `SHA-256` and persist the digest in the relational row.
10. **Atomic registration:** only register a document/media row after the upload is accepted.

### 14.2 File type baseline

Recommended V1 default allowlist:

**Public images:** JPEG, PNG, WebP.  
**Public video:** MP4 only where required.  
**Private legal evidence:** PDF, JPEG, PNG; expand only when a business need exists.  
**Disallowed by default:** HTML, JavaScript, executable files, SVG with active content, macro-enabled office documents, archive containers and arbitrary binary types.

These are operational security defaults; business exceptions must be documented and tested.

### 14.3 Storage path generation

Never accept:

```text
bucket = req.body.bucket
path = req.body.path
```

as authoritative.

Instead:

```text
purpose + server-authorized entity ID + random object identifier + normalized extension
```

The server resolves the final bucket and path.

### 14.4 Public media promotion

Private → public is a controlled transition:

```text
private upload
→ validate
→ scan
→ admin review
→ select as approved public media
→ copy/promote to public bucket
→ register media asset
→ audit
```

A private document is never made public by changing a `visibility` field alone.

---

## 15. Service-role handling and server-only secrets

### 15.1 `service_role` rules

Supabase documents that `service_role` bypasses RLS. Therefore it is equivalent to a database superpower for application purposes and must be treated as a backend secret. citeturn418576search1turn418576search12

The service-role key is allowed only in:

```text
server-only modules
server actions
server route handlers
trusted workers
controlled migrations / operational tooling
```

Never in:

```text
NEXT_PUBLIC_*
client components
browser localStorage
cookies
query strings
analytics
logs
Git repository
public HTML
public JSON
error messages
app_settings
```

### 15.2 Secret inventory

Server-only secrets include:

```text
SUPABASE_SERVICE_ROLE_KEY / server secret key
TURNSTILE_SECRET_KEY
EMAIL_PROVIDER_API_KEY
STORAGE/provider credentials if separately required
webhook signing secrets
HMAC IP/session hashing secret
other third-party integration secrets
```

`app_settings` may contain public configuration, but secrets remain environment/secret-store configuration. The supplied backend contract explicitly says service-role, email API, Turnstile and storage credentials do not belong in application settings. fileciteturn3file4L829-L849

### 15.3 Secret-use rule

A privileged service should expose a narrow business method, not a generic “run arbitrary Supabase query” function.

Bad:

```text
client → callPrivilegedQuery(sql)
```

Good:

```text
client → server action → authorize → known business operation → service role
```

---

## 16. Authorization for private resources

### 16.1 Private documents

Authorization is based on the document's relational ownership chain:

```text
private_document
  → property / party / owner_submission
  → business authorization
```

The browser cannot authorize itself by merely naming a `document_id`.

### 16.2 Exact location

Exact-location access is a distinct sensitive action. An admin read of a property does not imply permission to return exact coordinates to the browser. The route/action must explicitly request an exact-location operation, check admin status and audit the access.

Recommended audit action:

```text
EXACT_LOCATION_ACCESS
```

The existing audit enum contains `DOCUMENT_ACCESS`, `VERIFICATION_CHANGE`, `EXPORT` and other sensitive actions; the schema should be extended only by migration if an explicit exact-location audit action is adopted.

### 16.3 Exports

Exports of leads, owner submissions, parties and audit records are privileged operations. The supplied backend contract requires admin authorization, audit logging, minimized columns and exclusion of private coordinates/documents by default. fileciteturn1file8L1365-L1382

---

## 17. CSRF, Origin and request integrity

### 17.1 Server Actions

Next.js Server Actions use POST and compare the Origin header to the Host / `X-Forwarded-Host`; extra allowed origins should be configured only for legitimate proxy/reverse-proxy deployments. Current Next.js documentation describes `serverActions.allowedOrigins` for this exact use case. citeturn131736search0turn131736search1

V1 rule:

```text
Default: same-origin only.
```

Only add:

```text
allowedOrigins = [approved-proxy-domain(s)]
```

when an actual production reverse proxy requires it.

### 17.2 Route Handlers

For state-changing browser Route Handlers:

1. accept POST/PUT/PATCH/DELETE only as required;
2. validate `Origin` against an exact configured allowlist;
3. validate host / forwarded-host configuration;
4. reject unexpected cross-origin browser requests;
5. use SameSite cookies where sessions are cookie-backed;
6. use an explicit CSRF token for custom state-changing endpoints where Server Actions' built-in protections do not apply;
7. never enable credentialed `Access-Control-Allow-Origin: *`.

### 17.3 CORS

Default:

```text
No cross-origin browser API access.
```

For an explicitly required integration, allow only exact origins, methods and headers. Never expose private admin APIs to arbitrary origins.

### 17.4 Fetch metadata

For sensitive browser routes, use `Sec-Fetch-Site`/`Sec-Fetch-Mode` as a defense-in-depth signal. Do not treat it as the primary authorization control.

---

## 18. Security headers

Next.js supports response headers including HSTS, X-Frame-Options, Permissions-Policy, X-Content-Type-Options, Referrer-Policy and Content-Security-Policy. citeturn131736search3turn131736search4

### 18.1 Recommended baseline

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), browsing-topics=()
Content-Security-Policy: <nonce-based production policy>
X-Frame-Options: DENY
```

`frame-ancestors 'none'` in CSP should be treated as the primary clickjacking control when the site should never be framed. Use `SAMEORIGIN` only if the product explicitly requires same-origin framing.

### 18.2 CSP design

Start from:

```text
default-src 'self';
base-uri 'self';
object-src 'none';
frame-ancestors 'none';
form-action 'self';
img-src 'self' https: data: blob:;
media-src 'self' https: blob:;
font-src 'self' https:;
connect-src 'self' https://<supabase-project>.supabase.co;
frame-src https://challenges.cloudflare.com;
script-src 'self' 'nonce-<per-request-nonce>' https://challenges.cloudflare.com;
style-src 'self' 'nonce-<per-request-nonce>';
upgrade-insecure-requests;
```

Add only the actual third-party hosts required by the final implementation. Do not use broad `https:`/`*` for `script-src` or `connect-src` merely to make development convenient.

Next.js's current CSP guidance recommends nonces for dynamic CSP configurations and describes CSP as a control against XSS, clickjacking and code-injection attacks. citeturn131736search4

### 18.3 Admin/private cache headers

For responses containing:

```text
leads
owner PII
private coordinates
private document metadata
admin DTOs
internal notes
verification evidence
```

use:

```http
Cache-Control: private, no-store
```

Public property/content pages may be cached only from public DTOs.

---

## 19. XSS and unsafe-content controls

### 19.1 Content sources

Public content can come from:

- admin-authored guide Markdown;
- property listing descriptions;
- owner submission source descriptions;
- attribute labels/values;
- SEO page content.

Owner/user source text is never trusted as final public HTML.

### 19.2 Rules

- Prefer plain text.
- Where Markdown is required, sanitize using a strict allowlist.
- Never render arbitrary user HTML.
- Never insert unsanitized strings into `dangerouslySetInnerHTML`.
- Never construct HTML email bodies by string concatenating untrusted user values without escaping/sanitization.
- Validate URLs to allow only approved schemes (`https` / `http` where actually necessary).
- Reject `javascript:`, `vbscript:`, `file:`, malformed Unicode tricks and unsafe data URLs.
- Escape text before rendering in attributes as well as element content.
- Do not copy `owner_submissions.source_description` directly into `properties.description` without an explicit admin content-review step.

The backend contract explicitly requires plain text or controlled/sanitized Markdown, rejects arbitrary user HTML, keeps owner submission source text from automatically becoming final public descriptions, and forbids internal notes in public text. fileciteturn3file5L1092-L1100

### 19.3 JSON-LD

Generate JSON-LD from `PublicPropertyDetailDTO`, never from raw database rows. It must not contain owner contact, private coordinates, internal verification notes or private documents. fileciteturn3file4L789-L806

---

## 20. PII handling

### 20.1 PII classification

| Data | Classification | Public? | Admin? | Retention-sensitive? |
|---|---|---:|---:|---:|
| owner phone | high private PII | no | yes | yes |
| owner email | high private PII | no | yes | yes |
| owner legal name | private | no by default | yes | yes |
| lead phone/email | high private PII | no | yes | yes |
| lead notes | confidential business data | no | yes | yes |
| exact coordinates | sensitive location data | no | yes, explicit operation | yes |
| private document metadata | confidential | no | yes | yes |
| private document binary | highly restricted | no | yes, controlled | yes |
| verification internal notes | confidential | no | yes | yes |
| public listing title/description | public | yes | yes | normal content lifecycle |
| public safe location | public | yes | yes | normal content lifecycle |
| public verification summary | public scoped trust signal | yes | yes | normal content lifecycle |
| audit logs | confidential security/business | no | yes, read-only | high |

### 20.2 Data minimization

Collect only what is required for the current business operation.

Do not collect a government ID, full residential address, exact parcel coordinates, banking data or unrelated personal information merely because a future workflow might need it.

When a public inquiry can be handled with:

```text
name + phone/email + property reference + message
```

do not request additional fields.

### 20.3 PII in logs

Never log:

- raw phone numbers;
- full email addresses;
- exact coordinates;
- document paths for private evidence;
- document contents;
- access tokens;
- signed URLs;
- service-role credentials;
- Turnstile secret/token values.

Use stable non-reversible identifiers such as internal UUIDs or HMAC-based fingerprints where correlation is necessary.

---

## 21. Consent model

### 21.1 Consent is an event, not a UI checkbox boolean

For relevant person/contact records preserve:

```text
consent_recorded_at
consent_source
privacy_notice_version
terms/notice version where required
purpose category
```

The existing database includes `consent_recorded_at` and `consent_source` on `parties`; the final implementation should extend this with policy-version/purpose fields if the privacy policy requires versioned evidence.

### 21.2 Separate purposes

Do not bundle unrelated purposes into one checkbox. Conceptually separate:

```text
contact me about this inquiry
+ optional marketing communications
+ optional future property recommendations
```

The first can be necessary for handling the requested service; optional marketing consent should remain separately attributable.

### 21.3 Withdrawals

A future privacy-control workflow should permit withdrawal of optional communications without deleting core business records required for lawful business history, subject to the final legal retention policy.

Any anonymization/deletion action is itself audited.

---

## 22. Retention and deletion policy

The supplied architecture deliberately prefers archive over destructive delete and states that private-document physical deletion must be authorized, logged and retention-policy driven. It also recommends shorter retention for raw analytics and policy-driven anonymization of party PII. fileciteturn1file9L1567-L1649

### 22.1 Recommended operational starting baseline

These are **proposed engineering defaults, not statements of law**. Final values must be configurable and legally approved.

| Data class | Suggested baseline | End-of-retention action |
|---|---|---|
| raw analytics | 13 months | delete raw events after aggregates are retained |
| closed leads | 36 months after closure | archive/anonymize according to approved policy |
| closed owner submissions | 36 months after closure | archive; remove PII/documents when no longer required |
| site visits | 36 months after closure | archive/anonymize as approved |
| private documents | tied to business purpose + approved retention period | relational archive then secure object deletion |
| archived public media | 12 months after archival | delete binaries after orphan/reference check |
| audit logs | 7 years starting baseline | controlled retention purge only under approved policy |
| authentication logs | provider/configured security baseline | provider-managed retention policy |
| backups | provider/ops configured window | immutable backup expiry policy |

### 22.2 Deletion workflow

```text
retention job identifies candidate
→ legal/business hold check
→ relationship/reference check
→ archive metadata
→ anonymize PII where policy says so
→ delete storage object where permitted
→ verify object no longer accessible
→ write audit event
```

### 22.3 Business history vs PII

Do not confuse:

```text
delete record
```

with:

```text
anonymize personal fields while preserving necessary business history
```

For example, after an approved retention event:

```text
display_name = 'Archived Contact #XXXX'
phone = NULL
email = NULL
```

with a corresponding audit record.

---

## 23. Audit logging

### 23.1 Append-only model

`audit_logs` is append-only. The supplied schema defines actor, action, entity, timestamps, IP/user-agent hashes, changed fields, before/after state and reason. It explicitly requires auditing publication, availability, owner/party changes, public coordinate changes, verification changes, document access, guide publication, settings and assignment changes. fileciteturn2file2L459-L495

### 23.2 Events that require audit

At minimum:

```text
CREATE / UPDATE / PUBLISH / UNPUBLISH / ARCHIVE / RESTORE / DELETE
LOGIN / LOGOUT
EXPORT
DOCUMENT_ACCESS
VERIFICATION_CHANGE
STATUS_CHANGE
EXACT_LOCATION_ACCESS (if adopted)
PII_ANONYMIZED
PRIVATE_DOCUMENT_DELETED
PUBLIC_COORDINATE_CHANGED
ADMIN_PROFILE_CHANGED
SETTING_CHANGED
```

### 23.3 Audit payload safety

Allowed:

```text
entity_type
entity_id
actor_admin_id
changed_fields
reason
status transition
small, redacted before/after snapshots
ip_hash
user_agent_hash
```

Not allowed:

```text
raw document bytes
signed URL
service secret
full auth token
Turnstile token
full phone/email unless separately justified
private coordinate values in a routine audit snapshot
```

### 23.4 Prevent audit tampering

- No normal `UPDATE` or `DELETE` grants for `authenticated`.
- UI never exposes an edit function.
- A break-glass retention job must use a dedicated privileged path and itself write a security event outside the ordinary record if the final control model supports it.
- Database triggers/service functions should reject arbitrary actor-supplied timestamps and actors for sensitive changes.

---

## 24. Logging, analytics and cache privacy

### 24.1 Public analytics rule

`analytics_events` must remain append-oriented but must not become a dumping ground for private business data. The supplied database explicitly forbids placing full phones, emails, exact coordinates, private documents or internal notes in analytics JSON. fileciteturn1file8L1445-L1455

### 24.2 Safe analytics example

```json
{
  "event_name": "property_view",
  "property_id": "<uuid>",
  "source_channel": "organic",
  "device_class": "mobile"
}
```

Unsafe:

```json
{
  "owner_phone": "...",
  "lead_email": "...",
  "exact_latitude": 23.0,
  "private_document_path": "...",
  "internal_note": "..."
}
```

### 24.3 Cache policy

Never publicly cache:

```text
lead DTOs
owner PII
private coordinates
private documents
admin DTOs
internal notes
verification evidence
```

Public cache keys must be generated only from public query state and public property identity. The backend architecture explicitly defines these cache prohibitions. fileciteturn3file5L1046-L1057

---

## 25. Authorization and IDOR protection

RLS is necessary but not sufficient against application-level IDOR when a server endpoint uses the service role. Every privileged service method must re-check the actor against the target resource.

### 25.1 Example attack

Attacker knows:

```text
GET /api/admin/documents/2d1...
```

The server must not do:

```text
serviceRole.storage.download(document.object_path)
```

until:

```text
requireAdmin()
→ load document
→ authorize document's business resource
→ check retention/archive
→ download/create signed URL
```

### 25.2 Required IDOR tests

Test adjacent/foreign IDs for:

- properties;
- documents;
- owner submissions;
- parties;
- leads;
- site visits;
- verification rows;
- audit rows;
- exact locations.

Expected result: indistinguishable unauthorized/not-found semantics for public callers where possible, and no sensitive side-channel through error text.

---

## 26. Public verification security boundary

The verification workflow defines public-safe summaries as a separate projection from evidence.

Public may show examples such as:

```text
Revenue Records Reviewed
Location Reviewed
Documents Reviewed
Site Visit Completed
Survey/Mapni Evidence Reviewed
Planning Check Completed
```

with label, explanation, date and scope.

Never expose to public:

```text
reviewer_notes_internal
evidence_notes_internal
private_document_id
source_reference internal notes
professional reviewer contact
rejection reasons
raw evidence
```

The database architecture also warns against generic public labels such as `100% Clear Title`, `Fully Verified`, `Government Approved`, `Guaranteed Legal`, `Dispute Free` or `Guaranteed Construction` unless a separate future legal policy explicitly authorizes exact wording. fileciteturn2file2L3489-L3523

---

## 27. Search security

Public search is a typed query specification, never arbitrary SQL.

### 27.1 Public-search allowlist

Public fields may include:

```text
category
transaction
public district/subdistrict/place/locality
public area range
public price range
public title/description
property code
public attributes
```

Never keyword-search or filter on:

```text
owner phone
owner email
internal notes
private documents
source links
internal verification notes
lead activity
private parcel/source metadata
```

The backend contract explicitly forbids keyword-search over those fields. fileciteturn1file7L1199-L1219

### 27.2 Enumeration resistance

- public property-code lookup returns only published/eligible inventory;
- unpublished/archived inventory returns not-found/unavailable semantics;
- no endpoint can enumerate private properties by increasing UUIDs or codes;
- no generic `?select=*` public base-table API is permitted;
- pagination is bounded and deterministic;
- unknown query parameters do not become SQL conditions.

---

## 28. Error-response security

Public errors must never reveal:

- SQL text;
- PostgREST internals;
- table/column names if not necessary;
- object existence when existence itself is sensitive;
- private document path;
- owner identity;
- internal verification reason;
- stack traces;
- service provider secrets.

Admin errors may be more informative but still omit raw database errors and private credentials. The supplied backend architecture explicitly rejects leaking raw SQL, Supabase errors, stack traces, storage secrets or private data. fileciteturn1file0L1-L11

---

## 29. Browser/client architecture rules

### 29.1 Client Components may receive

```text
PublicPropertyCardDTO
PublicPropertyDetailDTO
PublicMapPoint
PublicGuideDTO
PublicSEO DTO
safe form state
```

### 29.2 Client Components must never receive

```text
service role key
admin profile internals
private document object path
signed URL before authorization
exact coordinates for hidden/approximate property
owner private phone/email
lead objects
private verification evidence
internal notes
source-reference internals
raw database rows
```

### 29.3 No sensitive direct Supabase client queries

A Client Component must not query sensitive Supabase tables directly. Public Server Components should use server query modules and public-safe projections; mutations use Server Actions/Route Handlers. The backend architecture explicitly states that Client Components should not query sensitive Supabase tables directly. fileciteturn1file6L1090-L1106

---

# 30. FULL RLS / AUTHORIZATION TEST MATRIX

## 30.1 Required test personas

| Persona | Token state | Fixture |
|---|---|---|
| `T-ANON` | no JWT / `anon` role | no user |
| `T-AUTH` | valid JWT, no `admin_profiles` row | ordinary authenticated user |
| `T-ADMIN` | valid JWT, active `admin_profiles` row with `ADMIN` | V1 admin |
| `T-INACTIVE` | valid JWT, inactive admin row | revoked/deactivated admin |
| `T-SERVICE` | service-role secret on trusted server | privileged backend only |
| `T-ATTACKER-ADMINFLAG` | anonymous browser with forged `isAdmin=true` UI state | proves UI bypass is useless |

## 30.2 Direct database/API read matrix

Expected result codes should be asserted at both:

1. Supabase Data API / PostgREST level; and
2. application-level server query/action level.

| Test | Persona | Operation | Resource | Expected |
|---|---|---|---|---|
| RLS-001 | T-ANON | SELECT | `properties` | **DENY / no rows** |
| RLS-002 | T-ANON | SELECT | `properties` with `select=*` | **DENY** |
| RLS-003 | T-ANON | SELECT | unpublished property by known UUID | **DENY / no row** |
| RLS-004 | T-ANON | SELECT | `property_locations` | **DENY** |
| RLS-005 | T-ANON | SELECT | exact `private_latitude/private_longitude` | **DENY** |
| RLS-006 | T-ANON | SELECT | `parties` | **DENY** |
| RLS-007 | T-ANON | SELECT | owner phone/email/legal name | **DENY** |
| RLS-008 | T-ANON | SELECT | `private_documents` | **DENY** |
| RLS-009 | T-ANON | SELECT | `verification_evidence` | **DENY** |
| RLS-010 | T-ANON | SELECT | `property_verifications` base table | **DENY** |
| RLS-011 | T-ANON | SELECT | internal verification notes | **DENY** |
| RLS-012 | T-ANON | SELECT | `owner_submissions` | **DENY** |
| RLS-013 | T-ANON | SELECT | `owner_submission_documents` | **DENY** |
| RLS-014 | T-ANON | SELECT | `leads` | **DENY** |
| RLS-015 | T-ANON | SELECT | `lead_requirements` | **DENY** |
| RLS-016 | T-ANON | SELECT | `lead_properties` | **DENY** |
| RLS-017 | T-ANON | SELECT | `lead_activities` | **DENY** |
| RLS-018 | T-ANON | SELECT | `site_visits` | **DENY** |
| RLS-019 | T-ANON | SELECT | `audit_logs` | **DENY** |
| RLS-020 | T-ANON | SELECT | `admin_profiles` | **DENY** |
| RLS-021 | T-ANON | SELECT | `app_settings` base table | **DENY** |
| RLS-022 | T-ANON | SELECT | `analytics_events` | **DENY** |
| RLS-023 | T-AUTH | SELECT | any sensitive base table | **DENY** |
| RLS-024 | T-INACTIVE | SELECT | any admin-only table | **DENY** |
| RLS-025 | T-ATTACKER-ADMINFLAG | SELECT | any admin-only table | **DENY** |
| RLS-026 | T-ANON | SELECT | public property projection | **ALLOW approved fields only** |
| RLS-027 | T-ANON | SELECT | public property detail | **ALLOW published safe row only** |
| RLS-028 | T-ANON | SELECT | public guides | **ALLOW `PUBLISHED` only** |
| RLS-029 | T-ANON | SELECT | public SEO pages | **ALLOW published/approved only** |
| RLS-030 | T-ANON | SELECT | public geography projection | **ALLOW safe reference fields only** |
| RLS-031 | T-ADMIN | SELECT | `properties` | **ALLOW** |
| RLS-032 | T-ADMIN | SELECT | exact location base row | **ALLOW** |
| RLS-033 | T-ADMIN | SELECT | `private_documents` | **ALLOW after authorization** |
| RLS-034 | T-ADMIN | SELECT | `verification_evidence` | **ALLOW** |
| RLS-035 | T-ADMIN | SELECT | `leads` | **ALLOW** |
| RLS-036 | T-ADMIN | SELECT | `audit_logs` | **ALLOW read-only** |

## 30.3 Direct database/API write matrix

| Test | Persona | Operation | Resource | Expected |
|---|---|---|---|---|
| RLS-040 | T-ANON | INSERT | `leads` | **DENY** |
| RLS-041 | T-ANON | INSERT | `owner_submissions` | **DENY** |
| RLS-042 | T-ANON | INSERT | `site_visits` | **DENY** |
| RLS-043 | T-ANON | INSERT | `analytics_events` | **DENY direct; server action only** |
| RLS-044 | T-ANON | UPDATE | `properties` | **DENY** |
| RLS-045 | T-ANON | UPDATE | `property_verifications` | **DENY** |
| RLS-046 | T-ANON | INSERT | `private_documents` | **DENY** |
| RLS-047 | T-AUTH | INSERT | `leads` | **DENY** |
| RLS-048 | T-AUTH | UPDATE | `properties` | **DENY** |
| RLS-049 | T-AUTH | INSERT | `verification_evidence` | **DENY** |
| RLS-050 | T-INACTIVE | UPDATE | `leads` | **DENY** |
| RLS-051 | T-ATTACKER-ADMINFLAG | UPDATE | `properties` | **DENY** |
| RLS-052 | T-ADMIN | INSERT | `properties` | **ALLOW only through approved server workflow; direct client CRUD may be withheld** |
| RLS-053 | T-ADMIN | UPDATE | `properties.publication_status` | **Service-layer validation required; direct unsafe state change blocked by architecture** |
| RLS-054 | T-ADMIN | UPDATE | `properties` other fields | **ALLOW via service with validation/audit** |
| RLS-055 | T-ADMIN | INSERT | `audit_logs` | **DENY direct; trusted audit path only** |
| RLS-056 | T-ADMIN | UPDATE | `audit_logs` | **DENY** |
| RLS-057 | T-ADMIN | DELETE | `audit_logs` | **DENY** |

## 30.4 Public projection leakage matrix

| Test | Attack | Expected |
|---|---|---|
| PUB-001 | `SELECT *` from public property projection | only explicitly declared public columns; never private columns |
| PUB-002 | property published but `location_visibility=HIDDEN` | no latitude/longitude fields |
| PUB-003 | property `APPROXIMATE` | only public approximate coordinates |
| PUB-004 | property `EXACT` without explicit exact-public approval | no exact coordinates |
| PUB-005 | property unpublished | no row |
| PUB-006 | property archived | no row |
| PUB-007 | public verification `public_visible=false` | absent |
| PUB-008 | verification `public_visible=true` but property unpublished | absent |
| PUB-009 | private document linked to public verification | only public verification summary, no evidence/file metadata |
| PUB-010 | owner party linked to published property | owner phone/email/legal name absent |
| PUB-011 | public parcel identifier with `public_visibility=ADMIN_ONLY` | absent |
| PUB-012 | internal planning note present | absent |
| PUB-013 | internal source link present | absent |
| PUB-014 | client adds `?select=*,parties(*)` | base table/view prevents expansion into private relationship |
| PUB-015 | search keyword equals owner phone | no private result |
| PUB-016 | guessed property code for unpublished row | not-found/unavailable semantics |

## 30.5 Storage negative-test matrix

| Test | Persona | Operation | Bucket | Expected |
|---|---|---|---|---|
| STOR-001 | T-ANON | download | `property-media-public` approved image | **ALLOW** |
| STOR-002 | T-ANON | download | `property-media-private` | **DENY** |
| STOR-003 | T-ANON | download | `verification-documents-private` | **DENY** |
| STOR-004 | T-ANON | download | `owner-submissions-private` | **DENY** |
| STOR-005 | T-ANON | upload | public media bucket | **DENY** |
| STOR-006 | T-ANON | upload | private document bucket | **DENY** |
| STOR-007 | T-AUTH | download | private document by guessed path | **DENY** |
| STOR-008 | T-INACTIVE | download | private document | **DENY** |
| STOR-009 | T-ATTACKER-ADMINFLAG | download | private document | **DENY** |
| STOR-010 | T-ADMIN | download | private document | **ALLOW after relational authorization** |
| STOR-011 | T-ADMIN | create signed URL | private document | **ALLOW; short TTL; audit** |
| STOR-012 | T-ADMIN | create signed URL | archived/deleted document | **DENY** |
| STOR-013 | T-ADMIN | signed URL reuse after expiry | private document | **DENY** |
| STOR-014 | T-ANON | direct object URL | leaked private path | **DENY** |
| STOR-015 | T-ADMIN | upload arbitrary HTML | private bucket | **DENY** |
| STOR-016 | T-ADMIN | upload executable masquerading as image | public bucket | **DENY** |
| STOR-017 | T-ADMIN | upload oversized file | any bucket | **DENY** |
| STOR-018 | T-ADMIN | upload image with private EXIF to public media | public media | strip EXIF or reject |

## 30.6 Service-role boundary tests

| Test | Scenario | Expected |
|---|---|---|
| SRV-001 | service key absent from browser bundle | pass |
| SRV-002 | `NEXT_PUBLIC_*` environment search for service key | no match |
| SRV-003 | service-role key in browser network payload | no match |
| SRV-004 | service-role key in Git history / source | no match |
| SRV-005 | service-role request from a public HTTP endpoint with attacker input | endpoint never exposes a generic DB operation |
| SRV-006 | service-role document read without `requireAdmin` | application test must fail |
| SRV-007 | service-role exact coordinate read without explicit authorization | application test must fail |
| SRV-008 | service-role export path | requires admin + purpose + audit |

---

## 31. Explicit “bypass the UI” attack suite

The following suite is mandatory before production sign-off.

### 31.1 Direct PostgREST probes

For every sensitive table, issue direct requests using the publishable key with no admin session:

```text
GET /rest/v1/parties?select=*
GET /rest/v1/private_documents?select=*
GET /rest/v1/property_locations?select=*
GET /rest/v1/verification_evidence?select=*
GET /rest/v1/leads?select=*
GET /rest/v1/owner_submissions?select=*
GET /rest/v1/audit_logs?select=*
```

Expected: denied or zero authorized rows, depending on the public API/error semantics selected. Never return sensitive rows.

### 31.2 Relationship-expansion probes

Attempt:

```text
?select=*,parties(*)
?select=*,property_locations(*)
?select=*,private_documents(*)
?select=*,verification_evidence(*)
```

Expected: public projections expose only their declared fields and cannot be expanded through hidden base relationships.

### 31.3 Filter bypass probes

Attempt exact IDs, UUIDs, property codes and filters:

```text
?id=eq.<private-id>
?property_id=eq.<private-property-id>
?or=(id.eq.<id>)
?order=id.asc
?limit=1000
```

Expected: no private result.

### 31.4 Storage path guessing

Given a known private object path:

```text
GET /storage/v1/object/.../verification-documents-private/<known-path>
```

Expected: 401/403 equivalent; no bytes.

### 31.5 UI-state forgery

Force browser state:

```js
window.__STATE__ = { isAdmin: true }
```

or alter hidden inputs:

```text
role=ADMIN
public_visible=true
location_visibility=EXACT
```

Expected: server ignores forged fields; database authorization remains unchanged.

### 31.6 Direct server-action invocation

Send crafted POST bodies directly to public Server Action endpoints:

```text
missing/forged CSRF-origin
forged admin flags
oversized payload
malformed UUIDs
unknown enum
duplicate idempotency key
forged Turnstile token
stale Turnstile token
```

Expected: reject before privileged state change.

### 31.7 Signed URL abuse

Attempt:

```text
old signed URL
replayed signed URL
signed URL for another document
signed URL with guessed path
signed URL after document archive
```

Expected: authorization/expiry/retention controls prevent access.

---

## 32. RLS regression strategy

### 32.1 Migration-time tests

Every security migration must include a matching test migration or automated test fixture covering:

```text
anon read denied for private tables
anon private storage denied
non-admin auth denied
inactive admin denied
active admin allowed
public projections safe
public form direct inserts denied
service path works only server-side
```

### 32.2 CI gates

Required gates before deployment:

```text
migration applies cleanly
RLS enabled on every application table
no broad anon/authenticated grants on sensitive tables
all public views explicitly column-listed
security tests pass
storage policies pass
no secret scan findings
no exact-coordinate leakage test failures
no private-document leakage test failures
```

### 32.3 Supabase security review

Use database tests that exercise both grants and RLS. Supabase's current security documentation specifically points to `supabase test db` as part of securing RLS-protected tables. citeturn418576search1

### 32.4 Test fixture design

Create at least:

```text
PROPERTY_PUBLIC_APPROX
PROPERTY_PUBLIC_HIDDEN
PROPERTY_PUBLIC_EXACT_UNAPPROVED
PROPERTY_UNPUBLISHED
PROPERTY_ARCHIVED
PROPERTY_WITH_PRIVATE_DOC
PROPERTY_WITH_PUBLIC_VERIFICATION
PROPERTY_WITH_INTERNAL_VERIFICATION_NOTE
PROPERTY_WITH_OWNER_PII
LEAD_PRIVATE
OWNER_SUBMISSION_PRIVATE
AUDIT_EVENT_PRIVATE
```

Each fixture is addressed by known UUIDs so attackers can test exact-target access rather than relying only on empty datasets.

---

## 33. Security-sensitive table-specific acceptance criteria

### `properties`

- direct public base-table access denied;
- public view exposes only approved fields;
- unpublished/archived rows excluded;
- publication/availability state cannot be freely mutated by anonymous clients;
- no generic legal/verified booleans introduced.

### `property_locations`

- exact coordinates inaccessible to anon/non-admin;
- public projection contains only public-safe coordinates;
- hidden property contains no coordinates in public DTO;
- exact access is explicit + audited.

### `parties`

- phone/email/legal name inaccessible to anon/non-admin;
- no public relationship expansion from property pages;
- anonymization controlled and audited.

### `private_documents`

- private bucket only;
- no public object path;
- signed URL only after authorization;
- access logged as sensitive event;
- deletion requires retention decision + audit.

### `verification_evidence`

- never public;
- source/document references protected;
- internal evidence notes protected;
- public verification is a distinct summary projection.

### `leads`

- no public read;
- no public update;
- inquiry creates only through server workflow;
- internal notes absent from analytics/public output.

### `owner_submissions`

- no public read of status or documents;
- submission reference alone is not an authorization credential;
- owner claims are claims, not verified facts;
- conversion is admin-only and never auto-publishes.

### `audit_logs`

- public deny;
- ordinary admin read only;
- no update/delete via UI/API role;
- raw documents/secrets never stored.

---

## 34. Publication and privacy separation

A record can be:

```text
stored privately
reviewed internally
partially publishable
```

at the same time.

Examples:

```text
7/12 document
  = private document
  = reviewed by admin
  = source-verified for a specific check
  = public output may be only “Revenue Records Reviewed”
```

or:

```text
exact coordinate
  = stored privately
  = known to admin
  = public visibility = APPROXIMATE
  = only public approximate point is returned
```

This follows the verification architecture's explicit rule that public output is a safe projection rather than raw evidence, and that owner-provided/reviewed/source-verified/professionally reviewed states are distinct.

---

## 35. Recommended implementation folder boundaries

```text
server/
├── auth/
├── authorization/
│   ├── require-admin.ts
│   ├── permissions.ts
│   └── resource-access.ts
├── db/
│   ├── admin-client.ts
│   ├── user-client.ts
│   └── public-client.ts
├── security/
│   ├── csrf.ts
│   ├── origin.ts
│   ├── rate-limit.ts
│   ├── turnstile.ts
│   ├── idempotency.ts
│   ├── secrets.ts
│   └── headers.ts
├── storage/
│   ├── upload-policy.ts
│   ├── signed-urls.ts
│   └── object-authorization.ts
└── audit/
    └── append-audit.ts

features/*/dto/
├── public-property.ts
├── public-verification.ts
├── public-media.ts
└── admin-*

lib/
├── privacy/
├── sanitize/
└── formatting/
```

The supplied backend architecture already requires `server/authorization`, `server/validation`, `server/rate-limit`, `server/abuse`, `server/audit`, `server/storage` and `server/integrations/anti-bot` as server-only infrastructure boundaries.

---

## 36. Security decision record: what is public vs private

### Public

```text
public property code
public slug
land category
public transaction type
public title/description
public area + approved unit
public geography labels
public address/context
public-safe coordinates
approved public media
approved public verification summaries
public guide/SEO content
approved public site/contact configuration
```

### Admin/private

```text
publication workflow state
created/updated admin identity
exact coordinates
private location notes
owner legal name
owner phone/email
party relations
source links
source notes
private parcel internals
private identifiers
private documents
verification evidence
reviewer notes
internal risk details
lead records
lead requirements
lead-property matching scores/notes
lead activities
site-visit internal notes
owner submissions
admin profiles
secret settings references
raw analytics
audit logs
```

### Never public through an accidental relational join

```text
properties → parties
properties → private_documents
properties → verification_evidence
properties → leads
properties → audit_logs
properties → exact location
owner_submissions → party contact
verification → evidence
```

---

## 37. Security checklist for production sign-off

### Database

- [ ] RLS enabled on all 49 application tables.
- [ ] `FORCE ROW LEVEL SECURITY` applied where operationally appropriate.
- [ ] No unintended `anon` grant on sensitive tables.
- [ ] No unintended `authenticated` grant on admin tables.
- [ ] Public base tables are minimized; public access is mostly through explicit projections.
- [ ] `SECURITY DEFINER` helpers use safe `search_path` and controlled EXECUTE grants.
- [ ] New-table migration template defaults to deny.

### Exact location

- [ ] `property_locations` base table is not public.
- [ ] public projection never returns exact coordinate columns.
- [ ] hidden property returns no location.
- [ ] exact coordinate access is audited.

### Documents/storage

- [ ] private buckets are private.
- [ ] private object download is RLS-controlled.
- [ ] no public URLs for private documents.
- [ ] signed URLs are short-lived.
- [ ] signed URLs are never persisted in DB.
- [ ] upload binary validation and malware scanning are active.
- [ ] public buckets contain intentionally public assets only.

### Authentication/authorization

- [ ] admin access requires active `admin_profiles`.
- [ ] inactive admin is denied.
- [ ] client `isAdmin` state has no authority.
- [ ] direct IDOR probes fail.
- [ ] service role is never browser-accessible.

### Forms/abuse

- [ ] rate limits are enforced server-side.
- [ ] honeypot is server-checked.
- [ ] Turnstile is server-verified where configured/required.
- [ ] idempotency is implemented for high-value forms.
- [ ] payload/body size limits are enforced.

### CSRF/origin

- [ ] Server Actions use same-origin protection.
- [ ] `allowedOrigins` contains only legitimate proxy origins.
- [ ] Route Handler mutations validate origin/method.
- [ ] CORS is deny-by-default.

### Web security

- [ ] HSTS enabled over production HTTPS.
- [ ] CSP deployed and tested.
- [ ] `nosniff`, Referrer-Policy and Permissions-Policy enabled.
- [ ] framing policy enabled.
- [ ] admin/private responses use no-store where appropriate.
- [ ] XSS sanitization tests pass.

### Privacy

- [ ] public DTOs explicit.
- [ ] owner PII not public.
- [ ] private coordinates not public.
- [ ] verification evidence not public.
- [ ] analytics contains no sensitive fields.
- [ ] consent records include timestamp/source/policy version as required.
- [ ] retention schedule is approved and configurable.
- [ ] anonymization/deletion workflow is audited.

### Audit

- [ ] important mutations create audit records.
- [ ] audit logs cannot be edited from normal admin UI.
- [ ] document access audited.
- [ ] exports audited.
- [ ] no raw binary content or secrets in audit.

---

## 38. Final security position

UrbanEdge V1 should be treated as a **controlled brokerage information system**, not a public database with a nicer UI.

The safe architecture is:

```text
PUBLIC USER
  ↓
explicit public projection / protected form
  ↓
server validation + abuse protection
  ↓
authorized server operation
  ↓
RLS + database constraints
  ↓
PRIVATE BUSINESS DATA
```

The key separation is:

```text
listing ≠ parcel
property row ≠ public DTO
reviewed document ≠ source-verified record
verification check ≠ legal guarantee
stored exact coordinate ≠ public exact coordinate
private document path ≠ public URL
authenticated user ≠ authorized admin
service-role access ≠ browser authority
```

A production deployment is **not security-complete** until the negative tests demonstrate that an anonymous attacker who completely ignores the UI cannot query or retrieve:

```text
exact coordinates
owner phone/email/legal identity
private documents
verification evidence
internal verification notes
leads
owner submissions
audit logs
unpublished inventory
```

and cannot turn an anonymous public form into an arbitrary write path.

---

## 39. External implementation references

These are current implementation references used to harden the Supabase/Next.js/Turnstile portions of this architecture:

- Supabase — Securing your API: https://supabase.com/docs/guides/api/securing-your-api
- Supabase — Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase — Storage buckets: https://supabase.com/docs/guides/storage/buckets/fundamentals
- Supabase — Storage access control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase — Storage signed URLs: https://supabase.com/docs/reference/javascript/file-buckets-createsignedurl
- Supabase — Database functions / `SECURITY DEFINER`: https://supabase.com/docs/guides/database/functions
- Next.js — Server Actions configuration / allowed origins: https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions
- Next.js — Data security / Server Actions and CSRF: https://nextjs.org/docs/app/guides/data-security
- Next.js — Response security headers: https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
- Next.js — Content Security Policy: https://nextjs.org/docs/app/guides/content-security-policy
- Cloudflare — Turnstile server-side validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

---

## 40. Source basis from the supplied UrbanEdge project files

The supplied database architecture establishes the authoritative V1 table inventory, including 49 application tables, and explicitly requires RLS, private exact coordinates, private buckets, owner-PII isolation, explicit public DTOs, append-only audit logs and server-only privileged keys.

The supplied backend architecture establishes the server-only trust boundary for service-role credentials, private documents, owner PII, exact coordinates, admin records, internal notes and anti-bot secrets; it also defines public projections and prohibits private data in public API surfaces.

The supplied verification workflow establishes scoped, evidence-backed verification, provenance, reviewer/date tracking, professional-review flags, recheck controls and public-safe summaries rather than universal verification claims.

The supplied admin/CRM architecture establishes a single authenticated operational admin for V1, with the admin as the central privileged actor for leads, properties, owner submissions, verification, documents, site visits, content, analytics and audit.

