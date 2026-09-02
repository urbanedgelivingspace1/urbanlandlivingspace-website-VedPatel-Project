# URBANEDGE LAND SPACE — PRODUCTION DEFINITION OF DONE

**File:** `13-DEFINITION-OF-DONE.md`  
**System:** UrbanEdge Land Space V1  
**Status:** Authoritative production completion / release acceptance contract  
**Launch geography:** Ahmedabad + Gandhinagar, Gujarat  
**Application:** Next.js App Router + TypeScript modular monolith  
**Database/Auth/Storage:** Dedicated Supabase PostgreSQL/Auth/Storage  
**Deployment target:** Netlify + separate Local / Preview-Staging / Production environments  
**Definition date:** 31 August 2026

> **Purpose** — This document defines the final, uncompromising standard for calling UrbanEdge Land Space V1 **complete, production-ready and releasable**. It converts the established product requirements, architecture, security model, testing plan and implementation roadmap into verifiable pass/fail criteria.
>
> **Coding-agent rule** — Codex or any implementation agent **must not** declare the application complete, production-ready, launch-ready, finished, done, delivered or equivalent while **any MUST PASS criterion in this document is FAIL, UNVERIFIED, NOT TESTED, NOT APPLICABLE WITHOUT RECORDED JUSTIFICATION, or otherwise unresolved**.
>
> **No visual-completion shortcut** — Screens rendering, routes existing, a development server running, or a successful happy-path demo does **not** satisfy this Definition of Done.

---

# 1. Authority and Completion Rule

This Definition of Done derives from the approved V1 contract set:

1. `LANDSPACE_PRODUCT_REQUIREMENTS.md`
2. `01-MASTER-WEBSITE-ARCHITECTURE.md`
3. `02-PAGE-ROUTE-UX-ARCHITECTURE.md`
4. `03-DATABASE-SCHEMA-ARCHITECTURE.md`
5. `04-BACKEND-API-BUSINESS-LOGIC.md`
6. `05-ADMIN-CRM-ARCHITECTURE.md`
7. `06-VERIFICATION-WORKFLOW.md`
8. `07-SEO-ARCHITECTURE.md`
9. `08-SECURITY-PRIVACY-RLS.md`
10. `09-MEDIA-STORAGE-ARCHITECTURE.md`
11. `10-INFRASTRUCTURE-DEPLOYMENT.md`
12. `11-TESTING-QA-PLAN.md`
13. `12-IMPLEMENTATION-ROADMAP.md`

If implementation reveals a contradiction or missing persistent business concept, the dependent work is **not done** until the contradiction is resolved through an explicit ADR/schema amendment, migration where required, updated tests and updated documentation.

## 1.1 Status vocabulary

Every criterion must have exactly one status:

| Status | Meaning | Completion effect |
|---|---|---|
| `PASS` | Implemented, tested and evidenced | Satisfies the criterion |
| `FAIL` | Known defect or requirement violation | Blocks completion |
| `UNVERIFIED` | Believed implemented but not proven | Blocks completion |
| `NOT TESTED` | Test/evidence does not exist or has not run | Blocks completion |
| `DEFERRED — RECOMMENDED` | Enhancement explicitly outside MUST PASS | Does not block V1 completion |
| `N/A — APPROVED` | Truly not applicable, with recorded rationale and owner approval | Allowed only where this document explicitly permits conditional applicability |

`TODO`, `mostly done`, `works locally`, `manual check later`, `probably safe`, `known issue`, `temporary workaround`, and similar states are **not PASS**.

## 1.2 Release decision

The V1 release decision has only three valid outcomes:

### `PASS`

All MUST PASS criteria are `PASS`. Any remaining recommended enhancement is documented and creates no security, privacy, legal, business-representation, data-integrity, accessibility or operational-readiness risk.

### `CONDITIONAL HOLD`

No active P0 security/privacy leak is known, but one or more mandatory validations remain incomplete, including staging, accessibility, performance, editorial/legal approval, migration, backup/restore, provider configuration or deployment validation.

**Result:** Do not deploy and do not call the application complete.

### `FAIL`

Any MUST PASS failure exists, including but not limited to:

- production build failure;
- migration uncertainty;
- RLS failure;
- exact-location leakage;
- owner-PII leakage;
- private-document leakage;
- admin authorization bypass;
- unsafe public projection;
- owner submission auto-publication;
- site-visit auto-confirmation;
- misleading sold/rented/leased state;
- unsupported verification/legal claim;
- uncontrolled SEO/indexing behavior;
- production test-data contamination;
- missing verified backup/restore capability.

## 1.3 Evidence rule

A MUST PASS item is not PASS until evidence exists in at least one appropriate form:

- automated test result;
- database/RLS test result;
- deployed HTTP/HTML assertion;
- CI build artifact;
- staging smoke result;
- accessibility report;
- performance report;
- security/privacy leakage scan;
- migration log;
- backup/restore record;
- screenshot/manual QA record where automation is insufficient;
- owner/professional approval record where the architecture requires human approval.

The final release-gate report must identify the release commit/build, environment and date.

---

# 2. Non-Negotiable V1 Architecture Invariants — MUST PASS

These criteria are unconditional. A violation means the application is not V1-complete.

- [ ] **ARCH-001** Land Space is a separate product/repository from UrbanEdge Living Space.
- [ ] **ARCH-002** Land Space uses a dedicated Supabase project/database and does not share the Living Space production database.
- [ ] **ARCH-003** The application is a single deployable Next.js + TypeScript modular monolith; no unapproved separate backend/microservice architecture has been introduced.
- [ ] **ARCH-004** Next.js App Router is the route architecture.
- [ ] **ARCH-005** Public pages are server-rendered by default; Client Components are limited to genuine browser interaction.
- [ ] **ARCH-006** Public and admin route/application boundaries are distinct.
- [ ] **ARCH-007** Server Actions and/or narrow Route Handlers own first-party mutations; the browser is not trusted to mutate protected business state directly.
- [ ] **ARCH-008** Public code consumes explicit public-safe projections/DTOs and does not fetch private rows then hide fields client-side.
- [ ] **ARCH-009** PostgreSQL is the V1 search engine; no unapproved Algolia/Elasticsearch/paid search dependency is required.
- [ ] **ARCH-010** Search state is URL-based, shareable, bookmarkable, server-readable and reproducible after reload.
- [ ] **ARCH-011** Public property/listing content required for discovery and SEO is present in initial HTML, not dependent on hydration.
- [ ] **ARCH-012** Publication status and availability status are separate state dimensions.
- [ ] **ARCH-013** Draft validation and publication validation are separate; incomplete drafts can exist but incomplete public listings cannot publish.
- [ ] **ARCH-014** Owner submissions never auto-publish.
- [ ] **ARCH-015** Site-visit requests never auto-confirm or auto-book a calendar slot.
- [ ] **ARCH-016** Verification is scoped, evidence-backed and dated; no universal `verified = true`, `clear_title`, `government_approved`, `developable` or equivalent Boolean is used as a broad legal claim.
- [ ] **ARCH-017** Exact/private coordinates are never sent to the browser for `APPROXIMATE` or `HIDDEN` listings.
- [ ] **ARCH-018** Owner PII, private documents, verification evidence, internal notes and sensitive commercial information remain private.
- [ ] **ARCH-019** Public listing media and private owner/legal documents are separate storage/business responsibilities.
- [ ] **ARCH-020** RLS is mandatory across protected Supabase application data.
- [ ] **ARCH-021** Service-role and privileged secrets remain server-only.
- [ ] **ARCH-022** Important admin mutations are auditable.
- [ ] **ARCH-023** Schema changes are migration-controlled and committed; manual dashboard edits are not the schema source of truth.
- [ ] **ARCH-024** No production database migration is blindly triggered by a Git push.
- [ ] **ARCH-025** External provider failure does not erase already-committed core business state when the business operation can succeed without that provider.
- [ ] **ARCH-026** No paid/auto-recharge dependency is silently enabled; any required paid service is an explicit approval gate.
- [ ] **ARCH-027** V1 remains a curated brokerage product, not an open public marketplace.
- [ ] **ARCH-028** V1 contains no buyer account dependency, seller dashboard dependency, public agent marketplace, payment gateway, in-app transaction workflow, AI chatbot, automatic valuation or automatic appointment-booking dependency.

---

# 3. Public Website and Core UX — MUST PASS

## 3.1 Route and shell availability

- [ ] **PUB-001** `/` renders a functional homepage with UrbanEdge Land Space identity, Ahmedabad + Gandhinagar scope, Agricultural/NA/Industrial categories, Buy/Rent/Lease discovery and visible `Explore Land` / `Sell Your Land` paths.
- [ ] **PUB-002** `/properties` renders the primary search/results experience.
- [ ] **PUB-003** `/agricultural-land` exists and presents category-appropriate discovery/content.
- [ ] **PUB-004** `/na-land` exists and does not imply `NA = development guaranteed`.
- [ ] **PUB-005** `/industrial-land` exists and distinguishes industrial context appropriately, including GIDC/non-GIDC where data supports it.
- [ ] **PUB-006** `/buy`, `/rent` and `/lease` provide valid discovery entry points or equivalent approved routing without collapsing distinct transaction semantics.
- [ ] **PUB-007** `/properties/[property-slug]` renders a public property detail page for valid published/retained public records.
- [ ] **PUB-008** `/sell-your-land`, `/requirements`, `/site-visit`, `/about`, `/contact`, `/terms`, `/privacy`, `/disclaimer` and required confirmation/error routes exist or have approved equivalent route handling.
- [ ] **PUB-009** Public header/navigation is usable on desktop and mobile.
- [ ] **PUB-010** Footer exposes appropriate discovery, company, contact and legal navigation.
- [ ] **PUB-011** Public pages never expose admin controls or private-data affordances to anonymous users.
- [ ] **PUB-012** Unknown routes return a real, useful 404 state rather than a blank screen or generic 200 fallback.

## 3.2 Homepage

- [ ] **PUB-013** Homepage clearly communicates land-only positioning and launch geography within the initial experience.
- [ ] **PUB-014** Homepage exposes a working land-search path.
- [ ] **PUB-015** Category and transaction quick-discovery paths work.
- [ ] **PUB-016** Featured/new inventory, if shown, contains only currently public-safe eligible records.
- [ ] **PUB-017** Empty featured inventory degrades to a useful discovery CTA rather than an empty/broken module.
- [ ] **PUB-018** Trust copy uses scoped, supportable language and contains no unsupported numerical or legal guarantee claims.

## 3.3 Property result card

Every public result card must:

- [ ] **PUB-019** show stable Property ID;
- [ ] **PUB-020** show category and transaction;
- [ ] **PUB-021** show title and broad public-safe location;
- [ ] **PUB-022** show area with unit;
- [ ] **PUB-023** show valid price mode/price, including `Price on Request` without fabricated values;
- [ ] **PUB-024** show availability appropriately;
- [ ] **PUB-025** show only approved public media;
- [ ] **PUB-026** never show owner phone/email or internal/private fields;
- [ ] **PUB-027** navigate to the correct property detail;
- [ ] **PUB-028** generate WhatsApp context with Property ID when that action is offered.

## 3.4 Property detail

Every representative published property detail must:

- [ ] **PUB-029** show Property ID, category, transaction, title, area, broad public-safe location, price mode and availability above or near the first major content block;
- [ ] **PUB-030** render a functional approved image/gallery or deterministic placeholder;
- [ ] **PUB-031** present land-category-specific facts without residential metaphors such as BHK/rooms/floor-plan hierarchy;
- [ ] **PUB-032** show `Enquire Now`, WhatsApp, Call and Site Visit paths where the property is eligible for active conversion;
- [ ] **PUB-033** preserve Property ID context in inquiry/WhatsApp and appropriate tracking context in Call analytics;
- [ ] **PUB-034** label location precision honestly as Exact, Approximate or Hidden/available through UrbanEdge;
- [ ] **PUB-035** show only approved scoped verification labels/explanations;
- [ ] **PUB-036** show public media/document links only when those assets exist and are approved;
- [ ] **PUB-037** omit empty video/drone/360/brochure modules when corresponding media is absent;
- [ ] **PUB-038** visibly handle Sold/Leased/Rented/Unavailable/Withdrawn/temporarily unavailable states and not present them as active inventory;
- [ ] **PUB-039** replace misleading active-conversion CTAs on closed inventory with an approved recovery path such as `Find Similar Land` or `Tell UrbanEdge Your Requirement`;
- [ ] **PUB-040** contain the required public disclaimer/link to disclaimer;
- [ ] **PUB-041** never expose owner PII, negotiation notes, private verification notes, private document references or exact private coordinates.

## 3.5 Errors, loading and recovery

- [ ] **PUB-042** Core public data-loading states use structural feedback and do not produce blank screens.
- [ ] **PUB-043** Search failure preserves current filters and offers retry/recovery.
- [ ] **PUB-044** No-results state explains that no matching land is currently listed and provides a buyer-requirement path.
- [ ] **PUB-045** Property-media failure degrades without crashing the property page.
- [ ] **PUB-046** Map failure does not block property facts or conversion actions.
- [ ] **PUB-047** Public form validation preserves valid entered data and identifies invalid fields.
- [ ] **PUB-048** Server/provider submission failure displays a recoverable user-safe error without exposing internal details.
- [ ] **PUB-049** No critical public route produces an unhandled exception, blank page or hydration-dependent disappearance of primary content.

---

# 4. Search and Discovery — MUST PASS

- [ ] **SEARCH-001** Search reads only published/public-eligible property projections.
- [ ] **SEARCH-002** Unpublished, Draft, Review and private/archived-only inventory cannot appear as active search results.
- [ ] **SEARCH-003** User can search/filter by launch-geography dimensions appropriate to V1: district and supported taluka/village/locality hierarchy.
- [ ] **SEARCH-004** User can filter by land category: Agricultural, NA, Industrial.
- [ ] **SEARCH-005** User can filter by transaction: Buy, Rent, Lease.
- [ ] **SEARCH-006** User can filter by area range.
- [ ] **SEARCH-007** User can filter by budget/price where the listing price mode makes that meaningful.
- [ ] **SEARCH-008** Availability filtering does not represent sold/rented/leased inventory as available.
- [ ] **SEARCH-009** Property ID exact lookup works for a valid Property ID.
- [ ] **SEARCH-010** Relevant category-specific filters implemented for core V1 use cases produce correct results when data exists.
- [ ] **SEARCH-011** Search query parameters are stable, readable, shareable and restored after page reload.
- [ ] **SEARCH-012** Browser back/forward preserves meaningful search state.
- [ ] **SEARCH-013** Pagination is server-side/URL-preserving and does not discard filters.
- [ ] **SEARCH-014** Sorting options offered by the UI map to real data semantics and produce deterministic results.
- [ ] **SEARCH-015** Active filter chips/count reflect user-applied state accurately.
- [ ] **SEARCH-016** Mobile filtering is usable without obscuring result recovery/actions.
- [ ] **SEARCH-017** Zero results is a valid state and does not throw, return misleading fallback inventory, or silently broaden filters.
- [ ] **SEARCH-018** Zero-results buyer requirement submits to the central CRM as a generic requirement rather than a fake property inquiry.
- [ ] **SEARCH-019** PostgreSQL indexes needed for critical V1 filters/lookups exist.
- [ ] **SEARCH-020** Scaled synthetic-data tests show no unbounded/N+1/full-dataset behavior that violates the accepted V1 performance baseline.
- [ ] **SEARCH-021** The full property dataset is not shipped to the browser for client-side filtering.

---

# 5. Geography, Property Identity, Area and Pricing — MUST PASS

## 5.1 Property identity

- [ ] **DATA-001** Every public property has a stable unique immutable Property ID using the approved `UE-LS-...` convention or an explicitly approved replacement.
- [ ] **DATA-002** Property IDs are concurrency-safe.
- [ ] **DATA-003** Property IDs are never reused after archive/deletion/history retention.
- [ ] **DATA-004** Property ID is independent from mutable category and slug.
- [ ] **DATA-005** Slug changes do not change Property ID.

## 5.2 Geography and parcel model

- [ ] **DATA-006** Ahmedabad and Gandhinagar are data/configuration, not hard-coded as the only possible districts in core domain code.
- [ ] **DATA-007** Core hierarchy supports State → District → Taluka/Sub-district → Village/Locality.
- [ ] **DATA-008** Planning authority, TP scheme, OP/FP, GIDC estate, ward/PIN/survey references are modeled separately from the administrative geography hierarchy.
- [ ] **DATA-009** No fabricated location rows are created merely to populate filters/SEO.
- [ ] **DATA-010** Public selectors expose only active/service-area/inventory-supported locations according to the architecture.
- [ ] **DATA-011** One property can represent multiple parcels where required.
- [ ] **DATA-012** Government/source parcel identifiers are not conflated with UrbanEdge Property ID.

## 5.3 Area

- [ ] **DATA-013** Area uses numeric values plus explicit units.
- [ ] **DATA-014** Original/source area value and unit can be retained where supplied.
- [ ] **DATA-015** Standardized area values used for search are derived with recorded conversion/provenance where required.
- [ ] **DATA-016** The system does not assume one universal Gujarat Bigha/Vigha/Guntha conversion rule.
- [ ] **DATA-017** Area displays never omit the unit.

## 5.4 Pricing

- [ ] **DATA-018** `Price on Request` is represented as a real structured price mode, not a fake numeric price.
- [ ] **DATA-019** Numeric money fields use appropriate PostgreSQL numeric types and are not floating-point approximations.
- [ ] **DATA-020** Total price, per-unit price, ranges, negotiability and rent/lease basis are represented only where applicable.
- [ ] **DATA-021** Public filters/structured data do not invent numeric prices for POR listings.
- [ ] **DATA-022** Internal/private minimum acceptable price or confidential commercial information cannot leak into public DTOs.

---

# 6. Admin Authentication and Application — MUST PASS

## 6.1 Authentication/authorization

- [ ] **ADMIN-001** Admin authentication uses Supabase Auth or the approved equivalent within the established architecture.
- [ ] **ADMIN-002** Anonymous requests to protected admin pages are denied/redirected safely and cannot receive protected data in the response.
- [ ] **ADMIN-003** Authentication alone does not grant admin access; active admin authorization is checked server-side/database-side.
- [ ] **ADMIN-004** Inactive/non-admin authenticated identities cannot invoke admin mutations.
- [ ] **ADMIN-005** Client-side `isAdmin` state is never the authorization boundary.
- [ ] **ADMIN-006** Session expiration and unauthorized states fail safely without leaking resource existence or private payloads.

## 6.2 Admin shell and dashboard

- [ ] **ADMIN-007** `/admin` operational shell is separate from public navigation and is usable on required desktop/tablet/mobile workflows.
- [ ] **ADMIN-008** Dashboard answers what needs attention through actionable data such as new leads, owner submissions, overdue follow-ups, site visits and inventory pending review.
- [ ] **ADMIN-009** Dashboard metrics derive from authoritative business data and do not substitute vanity metrics for operational state.
- [ ] **ADMIN-010** Admin health/configuration view reveals readiness/state but never raw secrets.

## 6.3 Property management

Admin can verifiably:

- [ ] **ADMIN-011** list/search/filter properties;
- [ ] **ADMIN-012** create a new property draft;
- [ ] **ADMIN-013** save incomplete drafts without accidental publication;
- [ ] **ADMIN-014** edit shared property fields;
- [ ] **ADMIN-015** edit category-specific fields with category-appropriate validation;
- [ ] **ADMIN-016** manage location mode and public-safe coordinates;
- [ ] **ADMIN-017** manage structured price mode;
- [ ] **ADMIN-018** manage publication status independently from availability;
- [ ] **ADMIN-019** manage media;
- [ ] **ADMIN-020** manage scoped verification;
- [ ] **ADMIN-021** see linked leads and site visits;
- [ ] **ADMIN-022** preview public output through the same public-safe projection used by the live public page;
- [ ] **ADMIN-023** publish only after publication validation passes;
- [ ] **ADMIN-024** unpublish/archive without deleting CRM/history unexpectedly;
- [ ] **ADMIN-025** restore an archived property only to a safe non-public state first, never directly to Published;
- [ ] **ADMIN-026** change closed availability states without leaving stale active CTAs/search state.

## 6.4 Publication gate

A property cannot publish unless all mandatory publication requirements for its state are satisfied, including:

- [ ] **ADMIN-027** public title/identity;
- [ ] **ADMIN-028** category and transaction;
- [ ] **ADMIN-029** valid public-safe location mode;
- [ ] **ADMIN-030** area and price mode;
- [ ] **ADMIN-031** required category-specific data under configured rules;
- [ ] **ADMIN-032** availability;
- [ ] **ADMIN-033** at least one approved cover image where the media architecture requires it for public publication;
- [ ] **ADMIN-034** verification/public-claim consistency;
- [ ] **ADMIN-035** required public disclaimer/copy policy;
- [ ] **ADMIN-036** no unresolved publication-blocking validation error.

Publication must be blocked if its required audit operation fails.

## 6.5 Admin data safety

- [ ] **ADMIN-037** Public/private distinctions are visually and functionally clear when editing property/submission/verification/media records.
- [ ] **ADMIN-038** Destructive/high-impact actions require deliberate confirmation or equivalent safeguard.
- [ ] **ADMIN-039** Sensitive admin errors do not expose secrets, signed URLs, database internals or private binary contents.
- [ ] **ADMIN-040** Audit log is inspectable and not editable through normal admin UI.

---

# 7. Database and Migrations — MUST PASS

## 7.1 Source of truth and reproducibility

- [ ] **DB-001** All schema objects required by V1 are represented in committed migrations.
- [ ] **DB-002** A clean local/test database can be created from zero using the migration set.
- [ ] **DB-003** Clean migration/reset succeeds without manual dashboard repair.
- [ ] **DB-004** Upgrade-path migration tests succeed for schema/data changes included in the release.
- [ ] **DB-005** Database lint passes where supported by the chosen tooling/version.
- [ ] **DB-006** Production migration set for the release is explicitly identified and reviewed.
- [ ] **DB-007** Destructive/data-changing production migrations have documented risk, backup and correction/rollback strategy.
- [ ] **DB-008** Production migration execution is approval-gated and not automatically coupled to an ordinary Git push.

## 7.2 Integrity

- [ ] **DB-009** Foreign keys enforce required entity relationships.
- [ ] **DB-010** Check constraints/enums prevent invalid core states where the architecture requires a finite state model.
- [ ] **DB-011** Uniqueness constraints protect stable identifiers/slugs where required.
- [ ] **DB-012** Property category-specific extension rows cannot silently represent a different category.
- [ ] **DB-013** Publication and availability fields cannot be conflated into one status.
- [ ] **DB-014** Lead ↔ property relation supports many-to-many.
- [ ] **DB-015** Site visit references both a lead and a property.
- [ ] **DB-016** Owner submission conversion relationships remain traceable.
- [ ] **DB-017** Verification evidence can be traced to its verification/check/source/private document as designed.
- [ ] **DB-018** Audit data is append-oriented/append-only according to the security architecture.
- [ ] **DB-019** Normal business records archive rather than hard-delete where history is required.
- [ ] **DB-020** PII deletion/anonymization, if implemented, is policy-driven and audited.

## 7.3 Query/index readiness

- [ ] **DB-021** Critical search/property-ID/CRM follow-up queries have required indexes.
- [ ] **DB-022** High-value queries have been reviewed on representative synthetic scale and do not depend on accidental sequential scans/unbounded result sets beyond accepted V1 limits.
- [ ] **DB-023** Pagination queries are bounded.
- [ ] **DB-024** No `SELECT *`-style public data path bypasses explicit public projections.

---

# 8. RLS and Authorization — MUST PASS

## 8.1 Global RLS posture

- [ ] **RLS-001** RLS is enabled on every protected application table exposed through Supabase.
- [ ] **RLS-002** Database grants are restrictive; RLS is not treated as the only authorization layer.
- [ ] **RLS-003** Anonymous users have no broad direct read/write grants to sensitive base tables.
- [ ] **RLS-004** Authenticated-but-not-admin users receive no accidental CRM/inventory/verification/document access.
- [ ] **RLS-005** Active-admin checks are enforced in the database/server authorization path.
- [ ] **RLS-006** Service-role access exists only in server-only codepaths and is never used as a browser authorization shortcut.

## 8.2 Mandatory negative matrix

Automated tests must prove anonymous users cannot read or mutate:

- [ ] **RLS-007** leads;
- [ ] **RLS-008** lead activities/internal CRM data;
- [ ] **RLS-009** parties/owner private PII;
- [ ] **RLS-010** owner submissions;
- [ ] **RLS-011** owner-submission private documents;
- [ ] **RLS-012** private documents/evidence;
- [ ] **RLS-013** private exact coordinates;
- [ ] **RLS-014** internal verification notes/evidence;
- [ ] **RLS-015** audit logs;
- [ ] **RLS-016** unpublished/private properties;
- [ ] **RLS-017** admin settings that are not explicitly public.

Automated tests must also prove:

- [ ] **RLS-018** non-admin authenticated users cannot invoke protected admin mutations;
- [ ] **RLS-019** inactive admin users cannot invoke protected admin mutations;
- [ ] **RLS-020** public forms cannot mass-assign admin/status/owner/internal fields;
- [ ] **RLS-021** direct public CRM/table inserts outside approved server mutation boundaries are denied;
- [ ] **RLS-022** every security-sensitive migration retains or updates corresponding RLS tests.

Any RLS matrix failure is a release FAIL.

---

# 9. Privacy and Exact-Location Protection — MUST PASS

## 9.1 Location modes

- [ ] **PRIV-001** `EXACT`, `APPROXIMATE` and `HIDDEN` are represented as distinct location/publication modes.
- [ ] **PRIV-002** Public default is `APPROXIMATE` unless an explicit property-level decision changes it.
- [ ] **PRIV-003** Internal/exact coordinates and public-safe coordinates are stored/handled independently.
- [ ] **PRIV-004** Approximate coordinates are chosen through controlled public-location logic and are not an uncontrolled client derivation from exact coordinates.
- [ ] **PRIV-005** Hidden listings do not emit a public coordinate.

## 9.2 No exact-coordinate leakage

For `APPROXIMATE` and `HIDDEN` fixtures, unique private-coordinate canaries must be absent from:

- [ ] **PRIV-006** rendered HTML;
- [ ] **PRIV-007** React Server Component payloads/client props;
- [ ] **PRIV-008** JSON/API responses;
- [ ] **PRIV-009** JSON-LD/structured data;
- [ ] **PRIV-010** Open Graph/social metadata;
- [ ] **PRIV-011** map/client state;
- [ ] **PRIV-012** analytics events;
- [ ] **PRIV-013** application logs;
- [ ] **PRIV-014** emails/notifications to public recipients;
- [ ] **PRIV-015** browser-visible source/network payloads.

## 9.3 Owner/customer privacy

- [ ] **PRIV-016** Owner phone/email/private identity fields are absent from public DTOs/pages/search/indexing.
- [ ] **PRIV-017** Buyer/lead contact information is not exposed through public endpoints.
- [ ] **PRIV-018** Internal notes, bypass-risk notes, rejection reasons, negotiation notes and commission data are private.
- [ ] **PRIV-019** Public analytics does not become a shadow CRM or PII dumping ground.
- [ ] **PRIV-020** Sensitive data is not written to ordinary logs unnecessarily.
- [ ] **PRIV-021** Privacy/consent fields required by public forms are stored and retrievable for operational/audit purposes.
- [ ] **PRIV-022** The public Privacy page accurately describes the implemented collection/use model and has received the required business/legal review before production.

---

# 10. Security Hardening — MUST PASS

- [ ] **SEC-001** Every protected mutation performs authentication where required, authorization, input validation, domain-rule validation, mutation and required audit/activity recording in the correct order.
- [ ] **SEC-002** Client-supplied status, owner IDs, admin flags, publication flags and internal IDs are verified/ignored/rejected rather than trusted.
- [ ] **SEC-003** Public forms are server-owned and rate-limited according to the approved abuse model.
- [ ] **SEC-004** Turnstile/anti-bot is configured for production where required by the architecture and validated server-side.
- [ ] **SEC-005** CAPTCHA/anti-bot failure does not silently bypass abuse controls.
- [ ] **SEC-006** Origin/CSRF protections appropriate to Next.js Server Actions/handlers are configured.
- [ ] **SEC-007** Rich text/guide/property content is sanitized or rendered through a controlled safe format; XSS fixtures cannot execute.
- [ ] **SEC-008** External URLs are parsed/validated; arbitrary untrusted HTML/iframe sources are not rendered.
- [ ] **SEC-009** Security headers are configured and verified in the deployed environment, including CSP, content-type protection, referrer policy, permissions policy, frame protection and HSTS where appropriate to the final production HTTPS setup.
- [ ] **SEC-010** CSP allows only the required reviewed providers/origins and does not solve integration problems by broadly enabling unsafe sources.
- [ ] **SEC-011** Secret scan finds no committed production secret.
- [ ] **SEC-012** No service-role key, private API key, Turnstile secret or other privileged credential exists in `NEXT_PUBLIC_*` or the browser bundle.
- [ ] **SEC-013** `.env.example` contains variable names/examples only, never real secrets.
- [ ] **SEC-014** Error responses do not disclose stack traces, SQL, private object paths, raw signed URLs, secrets or private binary contents to public users.
- [ ] **SEC-015** Audit/log payloads redact secrets and private binary contents.
- [ ] **SEC-016** Production health checks report configuration state, not secret values.
- [ ] **SEC-017** Security regression tests in `11-TESTING-QA-PLAN.md` all pass for the release candidate.

---

# 11. CRM and Lead Management — MUST PASS

## 11.1 Central CRM model

- [ ] **CRM-001** All structured inquiries create or attach to the central CRM as designed.
- [ ] **CRM-002** Listing-specific inquiry retains Property ID/property relation.
- [ ] **CRM-003** Generic buyer requirement enters CRM as `buyer_requirement` or approved equivalent without a fake Property ID.
- [ ] **CRM-004** Lead source is captured using configurable source data rather than scattered hard-coded branches.
- [ ] **CRM-005** One lead can link to multiple properties.
- [ ] **CRM-006** One property can link to multiple leads.
- [ ] **CRM-007** Lead activity timeline records meaningful chronological actions.
- [ ] **CRM-008** Open leads support next follow-up date/type/note/completion state.
- [ ] **CRM-009** Dashboard/query can surface overdue, today and upcoming follow-ups.
- [ ] **CRM-010** Structured loss reasons are available for Closed Lost.
- [ ] **CRM-011** Closed Won/Closed Lost/Nurture capture required outcome/follow-up data under the configured state rules.

## 11.2 Pipeline/state machine

The V1 pipeline supports the approved stages:

`New → Contact Attempted → Qualified → Requirement Confirmed → Property Matched → Site Visit Requested → Site Visit Confirmed → Site Visit Completed → Negotiation → Nurture / Closed Won / Closed Lost`

- [ ] **CRM-012** Every allowed transition is tested.
- [ ] **CRM-013** Every forbidden transition is rejected.
- [ ] **CRM-014** Terminal/closed lead behavior is enforced.
- [ ] **CRM-015** Re-open/reactivation, where allowed, is explicit and auditable.
- [ ] **CRM-016** Stage changes write activity/audit records as required.
- [ ] **CRM-017** Lead mutation failure does not leave partial related records.

## 11.3 Inquiry behavior

- [ ] **CRM-018** Inquiry server validation rejects malformed/abusive payloads.
- [ ] **CRM-019** Successful inquiry creates durable lead/activity state before optional email/analytics provider calls are treated as completed.
- [ ] **CRM-020** Email notification failure does not roll back an already-created lead.
- [ ] **CRM-021** Analytics failure does not roll back an already-created lead.
- [ ] **CRM-022** Duplicate-submit protections/idempotency behavior prevents accidental uncontrolled duplicate business records according to the backend contract.
- [ ] **CRM-023** WhatsApp clicks record the configured analytics intent event and preserve Property ID context.
- [ ] **CRM-024** Call clicks record the configured analytics intent event without claiming call completion.

---

# 12. Buyer Requirement — MUST PASS

- [ ] **REQ-001** Public buyer-requirement form collects the required contact, transaction, land type, geography, budget, area, intended-use/timeline/notes and consent fields according to the approved form schema.
- [ ] **REQ-002** Email remains optional where the product requirements specify optional email.
- [ ] **REQ-003** Validation errors preserve entered data.
- [ ] **REQ-004** Successful submission creates a CRM lead plus first-class buyer requirement data.
- [ ] **REQ-005** No arbitrary property is attached merely to satisfy a schema requirement.
- [ ] **REQ-006** Admin can view, qualify, update and match multiple candidate properties to the requirement.
- [ ] **REQ-007** Requirement-to-property matches are traceable through the CRM/activity model.
- [ ] **REQ-008** Requirement success copy promises review/contact but not an unsupported fixed response time.

---

# 13. Sell Your Land / Owner Submission — MUST PASS

## 13.1 Public submission

- [ ] **SELL-001** Sell Your Land clearly states that submission is for UrbanEdge review and is not instant publication.
- [ ] **SELL-002** The flow supports intent, land type, owner/contact, location, area, commercials, category-specific details, media/documents and consent as defined by the V1 form architecture.
- [ ] **SELL-003** Owner relationship can represent Owner, Co-owner, Authorized representative, Broker/intermediary or Other as configured.
- [ ] **SELL-004** Location visibility preference supports Exact/Approximate/Hidden without granting automatic public-location authority.
- [ ] **SELL-005** Original area/unit is preserved; standardized search values do not overwrite source input.
- [ ] **SELL-006** Confidential/internal commercial fields such as minimum acceptable price remain private.
- [ ] **SELL-007** Supporting owner documents upload to the private workflow, not public listing media.
- [ ] **SELL-008** Required consent/declaration/publication-review acknowledgements are captured.
- [ ] **SELL-009** User data survives validation errors and normal step changes during the active flow.
- [ ] **SELL-010** Success copy states that UrbanEdge will review before any listing is created.

## 13.2 Submission workflow

The admin workflow supports the approved states/equivalent state model:

`Submitted → Contacted → Documents Requested → Under Review → Verification In Progress → Approved for Listing → Published / On Hold / Rejected / Closed`

- [ ] **SELL-011** New owner submission is private by default.
- [ ] **SELL-012** Submission does not create a published property.
- [ ] **SELL-013** Admin can contact/request documents/review/hold/reject/approve through explicit state transitions.
- [ ] **SELL-014** Invalid submission transitions are rejected.
- [ ] **SELL-015** Rejection/hold/closure remains internally traceable.
- [ ] **SELL-016** Owner documents remain private throughout normal submission processing.

## 13.3 Conversion to property

- [ ] **SELL-017** Conversion is an explicit authenticated admin action.
- [ ] **SELL-018** Conversion copies approved structured fields but allows public title, description, location mode, price mode, media and verification output to differ from owner-submitted data.
- [ ] **SELL-019** Converted listing starts as `DRAFT`, never `PUBLISHED`.
- [ ] **SELL-020** Private owner documents do not become public media by copy/visibility accident.
- [ ] **SELL-021** Conversion is transactional/atomic enough that failure leaves no partial usable property graph.
- [ ] **SELL-022** Source submission ↔ resulting property remains traceable.
- [ ] **SELL-023** Conversion and sensitive submission status changes are audited.

---

# 14. Site Visits — MUST PASS

- [ ] **VISIT-001** Public site-visit flow makes clear that submitted date/time is a request, not an automatic booking.
- [ ] **VISIT-002** Request captures property context, preferred date/time window, contact details and optional alternate/note as defined.
- [ ] **VISIT-003** Successful request creates a site-visit record linked to both lead and property.
- [ ] **VISIT-004** Initial site-visit state is `REQUESTED` or approved equivalent.
- [ ] **VISIT-005** Anonymous/public users cannot set `CONFIRMED`, `COMPLETED`, outcome or other privileged visit states.
- [ ] **VISIT-006** Only authorized admin logic can confirm/reschedule/complete/cancel the visit.
- [ ] **VISIT-007** Approved statuses include Requested, Contacted, Proposed, Confirmed, Rescheduled, Completed, No Show, Cancelled and Follow-up Required or semantically equivalent states.
- [ ] **VISIT-008** Allowed state transitions are tested.
- [ ] **VISIT-009** Forbidden state transitions are rejected.
- [ ] **VISIT-010** Visit confirmation is atomic with required related CRM/activity/audit changes.
- [ ] **VISIT-011** Outcome/follow-up can be recorded after a completed/no-show/cancelled visit as appropriate.
- [ ] **VISIT-012** Admin can view Today/Upcoming/Follow-up/Completed/Cancelled/No-show operational states.
- [ ] **VISIT-013** No automatic external calendar-booking dependency is required for V1 completion.

---

# 15. Verification and Trust Claims — MUST PASS

## 15.1 Data model and workflow

- [ ] **VER-001** Verification uses scoped check definitions/rows rather than one property-level verified Boolean.
- [ ] **VER-002** Verification statuses support the configured finite workflow including review/pass/fail/requires-review/expired concepts where used.
- [ ] **VER-003** Evidence is linked to each public-claim-supporting verification check.
- [ ] **VER-004** Evidence provenance/source class can distinguish owner-provided, reviewed, source-verified and professional-review material as required.
- [ ] **VER-005** Reviewer identity and review date are recorded for public-claim-supporting checks.
- [ ] **VER-006** Scope/public explanation is recorded for public claims.
- [ ] **VER-007** Risk/exceptions/recheck data is retained where the verification architecture requires it.
- [ ] **VER-008** Evidence replacement/revocation/supersession does not silently erase history.
- [ ] **VER-009** Recheck/expiry can invalidate a public claim under configured policy.
- [ ] **VER-010** Professional-review-required states can be represented without falsely converting them into an UrbanEdge legal conclusion.

## 15.2 Public claim gate

A public verification label is blocked if any required support is missing or invalid, including:

- [ ] **VER-011** failed status;
- [ ] **VER-012** requires-review status;
- [ ] **VER-013** missing required evidence;
- [ ] **VER-014** missing required source/provenance;
- [ ] **VER-015** missing reviewer;
- [ ] **VER-016** missing review date;
- [ ] **VER-017** missing scope/public explanation;
- [ ] **VER-018** unresolved blocking exception;
- [ ] **VER-019** required professional review absent;
- [ ] **VER-020** expired/recheck-due claim under configured policy;
- [ ] **VER-021** unapproved/blacklisted wording.

## 15.3 Public wording safety

- [ ] **VER-022** Public UI never displays an unexplained generic `Verified` badge as a title/legal guarantee.
- [ ] **VER-023** Public claims use approved scoped wording such as Information Reviewed, Documents Reviewed, Location Reviewed, Site Visited, Survey/Mapni Evidence Reviewed, Planning/Zoning Check Completed, GIDC Records Reviewed or Legal Review Completed — Scoped when actually supported.
- [ ] **VER-024** Documents Reviewed does not imply title guarantee.
- [ ] **VER-025** NA status does not imply automatic development permission.
- [ ] **VER-026** GIDC context does not imply freehold ownership or universal authority approval.
- [ ] **VER-027** Search of records does not imply dispute-free status.
- [ ] **VER-028** Verification does not claim UrbanEdge is a government authority/title insurer/legal-certification system.
- [ ] **VER-029** Public verification output contains only approved label, approved scope/explanation and approved date/context—not raw notes/evidence/private documents.
- [ ] **VER-030** Final public verification/disclaimer wording that makes legally consequential claims has the required qualified Gujarat property-lawyer/professional approval, or such claims remain disabled.

---

# 16. Media and Storage — MUST PASS

## 16.1 Public media

- [ ] **MEDIA-001** Multiple property images are supported.
- [ ] **MEDIA-002** Public gallery ordering is deterministic.
- [ ] **MEDIA-003** Exactly one active cover is enforced where a cover is required; publication is blocked if required cover is missing.
- [ ] **MEDIA-004** Admin can reorder/set cover/edit alt text/caption/archive/replace approved media.
- [ ] **MEDIA-005** Public image delivery uses responsive dimensions/loading strategy and avoids unnecessary eager loading below the fold.
- [ ] **MEDIA-006** Broken/missing images fall back without breaking the property page.
- [ ] **MEDIA-007** Public media objects contain no owner PII, private legal evidence, exact-coordinate metadata, internal notes or signed private URLs.
- [ ] **MEDIA-008** Public image processing strips GPS/private EXIF metadata; a geotagged test fixture proves it.
- [ ] **MEDIA-009** Image/content validation inspects real file content and does not trust declared MIME type alone.
- [ ] **MEDIA-010** Executable/HTML/malformed masquerading files are rejected.
- [ ] **MEDIA-011** SHA-256/checksum or approved duplicate-control metadata is persisted where required by the media architecture.
- [ ] **MEDIA-012** Server controls object paths/names; anonymous clients do not choose trusted storage destinations arbitrarily.
- [ ] **MEDIA-013** Public media publication/promotion is an explicit controlled operation, not a visibility toggle on a private document.

## 16.2 Private documents

- [ ] **MEDIA-014** Owner/legal/verification documents live in private storage/buckets.
- [ ] **MEDIA-015** Anonymous and non-admin users cannot list/read private objects.
- [ ] **MEDIA-016** Private document access is authorized against the resource before a signed URL is created.
- [ ] **MEDIA-017** Signed URLs are short-lived and generated as late as possible.
- [ ] **MEDIA-018** Signed URLs are never persisted as durable database fields.
- [ ] **MEDIA-019** Signed URLs cannot be document/path-swapped to access another private asset.
- [ ] **MEDIA-020** Expired signed URLs cease to grant access.
- [ ] **MEDIA-021** Archived/deleted private objects do not receive new signed URLs.
- [ ] **MEDIA-022** Private document view/download is auditable without logging file content or raw signed URL.
- [ ] **MEDIA-023** User-submitted private documents pass malware scanning before becoming trusted verification evidence.
- [ ] **MEDIA-024** Scan states distinguish pending/clean/infected/failed or approved equivalents.
- [ ] **MEDIA-025** Infected/failed files cannot become trusted verification evidence or public media.

## 16.3 External media

- [ ] **MEDIA-026** Supported external video/drone/360 URLs use HTTPS and validated allowlisted providers/URL patterns.
- [ ] **MEDIA-027** External URLs are normalized/sanitized before storage/render.
- [ ] **MEDIA-028** UI uses provider-specific safe embed components rather than arbitrary user-provided iframe HTML.
- [ ] **MEDIA-029** CSP includes only reviewed media/embed origins actually required.

## 16.4 Lifecycle and quotas

- [ ] **MEDIA-030** Media uses archive-before-delete for normal retirement.
- [ ] **MEDIA-031** Hard deletion, if supported, is a separate auditable retention operation.
- [ ] **MEDIA-032** Storage health/quota thresholds are monitored/surfaced according to infrastructure/media configuration.
- [ ] **MEDIA-033** V1 does not require hosting large video/360 binaries in Supabase Storage.
- [ ] **MEDIA-034** No orphaned private/public object accumulation is knowingly left unresolved before launch where reconciliation detects it.

---

# 17. SEO and Crawl Control — MUST PASS

## 17.1 Server-rendered content and metadata

- [ ] **SEO-001** Homepage, category pages, published property detail pages, required legal/info pages and other approved indexable pages have meaningful primary content in initial HTML.
- [ ] **SEO-002** Metadata is generated server-side using the approved Next.js metadata architecture.
- [ ] **SEO-003** Every representative indexable page has a unique/appropriate title and meta description.
- [ ] **SEO-004** Every indexable page has exactly one approved canonical.
- [ ] **SEO-005** Canonical host redirects to the production canonical host correctly.
- [ ] **SEO-006** Open Graph/social metadata contains only public-safe media/location/data.
- [ ] **SEO-007** Breadcrumbs are visible/crawlable where required and represented in structured data where configured.

## 17.2 Search/filter crawl control

- [ ] **SEO-008** Arbitrary `/properties?...` filter combinations follow the approved noindex/crawl policy and do not explode into uncontrolled programmatic SEO pages.
- [ ] **SEO-009** Empty/default query parameters do not produce uncontrolled duplicate canonical states.
- [ ] **SEO-010** Valid pagination canonicalization is correct.
- [ ] **SEO-011** Page 1 normalization is correct.
- [ ] **SEO-012** Out-of-range pagination returns the approved 404/not-found behavior rather than indexable thin content.

## 17.3 Property lifecycle SEO

- [ ] **SEO-013** Property slug changes create a permanent one-hop redirect from historical approved slug to current canonical.
- [ ] **SEO-014** Removed/private properties do not generically redirect to the homepage.
- [ ] **SEO-015** Sold/Rented/Leased public pages, when intentionally retained, visibly and structurally represent their closed state.
- [ ] **SEO-016** Closed-property structured data availability matches visible availability.
- [ ] **SEO-017** POR listings emit no fake numeric price in structured data.
- [ ] **SEO-018** Structured data never includes private/exact coordinates for Approximate/Hidden listings.
- [ ] **SEO-019** Structured data never invents ratings, reviews, legal approval, availability or price.

## 17.4 Sitemap/robots/indexing

- [ ] **SEO-020** `robots.txt` is valid and references the production sitemap.
- [ ] **SEO-021** Sitemap XML is valid.
- [ ] **SEO-022** Every sitemap URL returns canonical indexable HTTP 200.
- [ ] **SEO-023** Sitemap contains no redirecting URL.
- [ ] **SEO-024** Sitemap contains no 404/5xx URL.
- [ ] **SEO-025** Sitemap excludes admin/private/noindex/search-state URLs.
- [ ] **SEO-026** Admin routes are not indexable.
- [ ] **SEO-027** Preview/staging is noindex/access-restricted according to the infrastructure plan.
- [ ] **SEO-028** Privacy leakage tests cover HTML, RSC, APIs, JSON-LD and social metadata.

## 17.5 Location/content quality

- [ ] **SEO-029** Ahmedabad/Gandhinagar category/location landing pages become indexable only if they satisfy the architecture's meaningful inventory/original-content quality gate.
- [ ] **SEO-030** No geography/category page is automatically generated into the index merely because a database location exists.
- [ ] **SEO-031** No mass thin village-page strategy is enabled.
- [ ] **SEO-032** Guide/legal content, if published, has the required editorial/professional review for its risk level.
- [ ] **SEO-033** Dates are not auto-updated merely to simulate freshness.

---

# 18. Analytics, Audit and Observability — MUST PASS

## 18.1 Business analytics

- [ ] **OBS-001** The system records the required core business events or equivalent metrics for property views, inquiry, WhatsApp click, Call click, site-visit request, buyer requirement and owner submission.
- [ ] **OBS-002** Property analytics can distinguish at least views and high-intent conversion signals needed for V1 operations.
- [ ] **OBS-003** Lead source attribution is retained for CRM analysis.
- [ ] **OBS-004** Analytics events contain no unnecessary owner PII, private exact coordinates, private document paths or internal notes.
- [ ] **OBS-005** Analytics provider failure cannot roll back durable lead/submission/property state.

## 18.2 Audit

Sensitive changes produce append-only audit records including actor, action, entity, identifier, timestamp and safe before/after context where practical.

At minimum, audit coverage exists for:

- [ ] **OBS-006** publish/unpublish/archive/restore;
- [ ] **OBS-007** material price changes;
- [ ] **OBS-008** availability changes;
- [ ] **OBS-009** public coordinate/location-mode changes;
- [ ] **OBS-010** verification/public badge changes;
- [ ] **OBS-011** owner-submission conversion/rejection/high-impact state changes;
- [ ] **OBS-012** lead stage/high-impact CRM changes where required;
- [ ] **OBS-013** private document view/download/delete operations where required;
- [ ] **OBS-014** relevant media promotion/archive changes.

- [ ] **OBS-015** Audit rows never store raw secrets, private binary contents or durable signed URLs.
- [ ] **OBS-016** Audit history is distinct from ordinary lead activity timeline.

## 18.3 Operational logging/health

- [ ] **OBS-017** Unexpected action/query/integration failures are logged at useful boundaries.
- [ ] **OBS-018** Logs redact secrets and minimize sensitive PII.
- [ ] **OBS-019** Production health/config readiness can show database/storage/email/anti-bot/map/analytics configuration state without revealing credentials.
- [ ] **OBS-020** Launch smoke verifies no active P0 errors in logs/health.

---

# 19. Responsiveness — MUST PASS

Required public/admin workflows must be manually and/or automatically validated across the project's responsive breakpoint contract, including compact mobile, large mobile/small tablet, desktop and large desktop states.

- [ ] **RESP-001** No unintended horizontal overflow on required public routes.
- [ ] **RESP-002** Public header/navigation remains usable at required widths.
- [ ] **RESP-003** Homepage search controls stack/flow without clipping.
- [ ] **RESP-004** Property results are readable and actionable on mobile.
- [ ] **RESP-005** Mobile filter sheet/panel can open, edit, clear/apply and close without trapping the user.
- [ ] **RESP-006** Property detail becomes a usable single-column flow on mobile.
- [ ] **RESP-007** Mobile conversion actions do not cover content or keyboard input.
- [ ] **RESP-008** Gallery interaction works on mobile without layout breakage.
- [ ] **RESP-009** Sell Your Land multi-step form is fully usable on mobile.
- [ ] **RESP-010** Buyer requirement and site-visit forms are usable on mobile.
- [ ] **RESP-011** Legal/content pages remain readable on narrow screens.
- [ ] **RESP-012** Admin critical workflows remain operational on mobile/tablet, especially lead follow-up, submission review, site-visit status, property status and quick notes.
- [ ] **RESP-013** Admin wide-table data has an approved responsive representation rather than unreadable squeezed columns.
- [ ] **RESP-014** Touch targets and interactive controls are practically usable on touch devices.

---

# 20. Accessibility — MUST PASS

- [ ] **A11Y-001** Automated axe/core accessibility suite has no unresolved serious or critical violations on core pages.
- [ ] **A11Y-002** Public and admin primary navigation is keyboard accessible.
- [ ] **A11Y-003** Visible focus indicators exist for interactive controls.
- [ ] **A11Y-004** Semantic heading hierarchy is coherent on representative pages.
- [ ] **A11Y-005** Form controls have programmatic labels.
- [ ] **A11Y-006** Required/invalid states are communicated without color alone.
- [ ] **A11Y-007** Form validation errors are associated/announced appropriately and focus recovery works for long forms.
- [ ] **A11Y-008** Dialogs, menus, filter sheets and lightboxes manage focus and close accessibly.
- [ ] **A11Y-009** Icon-only controls have accessible names.
- [ ] **A11Y-010** Text/background contrast passes the project's accepted accessibility target.
- [ ] **A11Y-011** Reduced-motion preference is honored for non-essential motion.
- [ ] **A11Y-012** Images have meaningful alt text where informative and appropriate empty/functional alternatives where decorative.
- [ ] **A11Y-013** Property status/verification cannot be understood only through color.
- [ ] **A11Y-014** Core conversion flows can be completed without a mouse.
- [ ] **A11Y-015** Accessibility regressions found during QA have permanent tests where practical.

---

# 21. Performance — MUST PASS

Performance is a release gate, not a post-launch aspiration.

- [ ] **PERF-001** A representative Lighthouse/performance run is recorded for homepage, results and property detail in staging or production-parity conditions.
- [ ] **PERF-002** The release has an explicitly accepted LCP/INP/CLS baseline/budget; no critical regression remains unresolved.
- [ ] **PERF-003** Primary page content is server-rendered and useful before hydration.
- [ ] **PERF-004** The full property dataset is never shipped client-side for filtering.
- [ ] **PERF-005** Images reserve dimensions/aspect ratio to avoid avoidable layout shift.
- [ ] **PERF-006** Below-the-fold images/media are lazy-loaded where appropriate.
- [ ] **PERF-007** Primary/cover images use an appropriate responsive/preload/priority strategy.
- [ ] **PERF-008** Maps and heavy third-party integrations do not block primary content.
- [ ] **PERF-009** Gallery does not eagerly load every large asset by default.
- [ ] **PERF-010** Search/property-ID/listing-detail queries are performant on scaled synthetic V1 data.
- [ ] **PERF-011** No new unbounded query or N+1 issue exists on critical workflows.
- [ ] **PERF-012** Public/admin pagination prevents uncontrolled large response sets.
- [ ] **PERF-013** External-provider failure/degradation does not make core public pages unusable.
- [ ] **PERF-014** Performance test evidence is attached to the release gate; `not measured` is not PASS.

---

# 22. Testing and QA — MUST PASS

## 22.1 Required test layers

The repository has implemented and passing coverage for:

- [ ] **TEST-001** unit tests for critical domain helpers/rules;
- [ ] **TEST-002** component tests for critical interactive UI/form behavior;
- [ ] **TEST-003** integration tests for server actions/services and database interactions;
- [ ] **TEST-004** database constraint tests;
- [ ] **TEST-005** RLS actor/negative matrix tests;
- [ ] **TEST-006** storage/private-document security tests;
- [ ] **TEST-007** E2E critical workflow tests;
- [ ] **TEST-008** accessibility tests;
- [ ] **TEST-009** responsive viewport tests;
- [ ] **TEST-010** SEO HTTP/HTML/canonical/robots/sitemap tests;
- [ ] **TEST-011** performance baseline tests;
- [ ] **TEST-012** production build tests;
- [ ] **TEST-013** staging full-smoke tests;
- [ ] **TEST-014** security/privacy leakage regression tests.

## 22.2 Mandatory critical workflows

Automated or deployment-level tests cover:

- [ ] **TEST-015** Draft → publication blockers → publish;
- [ ] **TEST-016** publish blocked when required audit write fails;
- [ ] **TEST-017** unpublish/archive/restore behavior;
- [ ] **TEST-018** search/filter/sort/pagination/Property ID;
- [ ] **TEST-019** inquiry creates lead/activity;
- [ ] **TEST-020** inquiry survives email failure;
- [ ] **TEST-021** generic buyer requirement without fake property;
- [ ] **TEST-022** Sell Your Land remains private;
- [ ] **TEST-023** owner-submission conversion creates Draft only;
- [ ] **TEST-024** conversion rollback leaves no partial property;
- [ ] **TEST-025** site visit begins Requested and admin confirms manually;
- [ ] **TEST-026** site-visit state/transaction atomicity;
- [ ] **TEST-027** full CRM allowed/forbidden transition matrix;
- [ ] **TEST-028** Nurture/Lost/Closed prerequisites/terminal behavior;
- [ ] **TEST-029** verification claim/evidence/publication gates;
- [ ] **TEST-030** media upload/cover/public/private separation;
- [ ] **TEST-031** private signed URL authorization/expiry/path-swap;
- [ ] **TEST-032** EXIF privacy stripping;
- [ ] **TEST-033** sold/rented/leased/off-market public behavior;
- [ ] **TEST-034** exact/approximate/hidden location leakage;
- [ ] **TEST-035** owner PII/private canary leakage;
- [ ] **TEST-036** canonical/robots/sitemap/structured data;
- [ ] **TEST-037** 404/error/degraded provider states.

## 22.3 CI gates

A clean CI/release run performs the equivalent of:

```text
npm ci
secret scan
lint
typecheck
unit/component tests
local Supabase start/reset/migrations
database constraints
RLS/storage tests
integration tests
production build
preview/staging deploy
Playwright core E2E
axe/accessibility
SEO checks
security leakage checks
release report
```

- [ ] **TEST-038** `npm ci` succeeds.
- [ ] **TEST-039** blocking lint passes.
- [ ] **TEST-040** TypeScript typecheck passes.
- [ ] **TEST-041** unit/component/integration tests pass.
- [ ] **TEST-042** clean DB reset/migration suite passes.
- [ ] **TEST-043** production build passes.
- [ ] **TEST-044** critical E2E passes.
- [ ] **TEST-045** security/privacy regression passes.
- [ ] **TEST-046** no P0 security test is quarantined/flaky/ignored.
- [ ] **TEST-047** flaky critical tests are fixed rather than hidden behind excessive retries.
- [ ] **TEST-048** Every fixed privacy/security/publication/CRM-state/SEO bug has a regression test where practical.

## 22.4 Test data protection

- [ ] **TEST-049** Local/staging fixtures are synthetic and clearly marked.
- [ ] **TEST-050** No real owner document is used in automated tests.
- [ ] **TEST-051** No real customer/owner PII is used in automated tests.
- [ ] **TEST-052** No real private coordinates are used in automated tests.
- [ ] **TEST-053** No raw production CRM/database dump is copied into local/staging/CI.
- [ ] **TEST-054** Test bootstrap hard-fails if configured against production environment/project/domain for destructive suites.
- [ ] **TEST-055** Automated tests cannot mutate production DB/Auth/Storage.
- [ ] **TEST-056** Automated tests do not send mail to real production recipients.
- [ ] **TEST-057** Synthetic analytics/load/fuzzing events do not pollute production analytics.
- [ ] **TEST-058** Malware/fuzz/EXIF attack fixtures are never uploaded to production storage.

---

# 23. Production Build — MUST PASS

- [ ] **BUILD-001** Production `npm run build` succeeds on a clean dependency installation.
- [ ] **BUILD-002** No TypeScript error remains.
- [ ] **BUILD-003** No blocking lint error remains.
- [ ] **BUILD-004** Required environment variables fail fast if missing rather than producing a silent insecure deployment.
- [ ] **BUILD-005** No server-only module/secret is imported into a client bundle.
- [ ] **BUILD-006** Metadata/route generation succeeds for the production build.
- [ ] **BUILD-007** Sitemap generation succeeds and does not produce invalid/private URLs.
- [ ] **BUILD-008** No static/server route crashes during build-time generation.
- [ ] **BUILD-009** Runtime/Node configuration is compatible with the approved Netlify target.
- [ ] **BUILD-010** The exact release commit/build/deployment identifier is recorded.
- [ ] **BUILD-011** No unreviewed major dependency upgrade is included in the release candidate.
- [ ] **BUILD-012** Preview/staging deploy uses production-parity build behavior closely enough to validate the release.

---

# 24. Documentation — MUST PASS

The implementation is not done if only the original architecture documents exist but operational implementation knowledge is missing.

- [ ] **DOC-001** README explains local setup, prerequisites and core commands.
- [ ] **DOC-002** `.env.example` documents required environment variable names and public/server classification.
- [ ] **DOC-003** Database migration procedure is documented.
- [ ] **DOC-004** Production migration approval procedure is documented.
- [ ] **DOC-005** RLS/security architecture and test execution are documented enough for another engineer to validate them.
- [ ] **DOC-006** Public/private data boundary is documented, including exact-location handling.
- [ ] **DOC-007** Storage bucket roles and private-document signed-URL flow are documented.
- [ ] **DOC-008** Owner submission → conversion → property publication workflow is documented.
- [ ] **DOC-009** CRM stage definitions and transition rules are documented.
- [ ] **DOC-010** Site-visit states/manual confirmation rule are documented.
- [ ] **DOC-011** Verification claim/evidence/public wording policy is documented.
- [ ] **DOC-012** SEO indexability/canonical/sitemap/closed-property behavior is documented.
- [ ] **DOC-013** Provider configuration is documented without embedding secrets.
- [ ] **DOC-014** Production environment/account ownership/recovery information is documented in an owner-controlled location.
- [ ] **DOC-015** Backup procedure is documented.
- [ ] **DOC-016** Restore procedure is documented.
- [ ] **DOC-017** Application/database/storage/domain rollback procedure is documented.
- [ ] **DOC-018** Secret rotation/recovery procedure is documented.
- [ ] **DOC-019** Production incident/health-check procedure is documented at the level needed to identify common provider/configuration failure.
- [ ] **DOC-020** Provider quota/free-tier constraints and upgrade decision gates are documented.
- [ ] **DOC-021** Required legal/editorial approval records for public verification/disclaimer content are stored/referenced.
- [ ] **DOC-022** Any architecture deviation has an ADR; no silent divergence remains.
- [ ] **DOC-023** `13-DEFINITION-OF-DONE.md` release checklist has a completed evidence-backed release record for the shipped build.

---

# 25. Infrastructure and Environment Separation — MUST PASS

## 25.1 Environment matrix

- [ ] **INFRA-001** LOCAL, PREVIEW/STAGING and PRODUCTION are distinct deployment/configuration contexts.
- [ ] **INFRA-002** Production Supabase is separate from staging/development.
- [ ] **INFRA-003** Staging uses synthetic data, not production business data.
- [ ] **INFRA-004** Production secrets are absent from local/preview where not required.
- [ ] **INFRA-005** Preview/staging cannot accidentally use production DB/Auth/Storage through default configuration.
- [ ] **INFRA-006** Environment identity is programmatically detectable for safeguards/health checks.
- [ ] **INFRA-007** Staging is noindex/access-restricted according to the SEO/deployment architecture.

## 25.2 Hosting/domain/DNS

- [ ] **INFRA-008** Netlify production site exists under the approved account ownership/recovery model.
- [ ] **INFRA-009** Production technical URL passes smoke before domain cutover.
- [ ] **INFRA-010** Production canonical domain is configured as `https://urbanedgelandspace.com` or an explicitly approved replacement.
- [ ] **INFRA-011** HTTPS works and canonical host redirects are correct.
- [ ] **INFRA-012** DNS ownership/records and recovery path are documented.
- [ ] **INFRA-013** Domain changes are minimized and have a rollback/recovery plan.

## 25.3 Providers

- [ ] **INFRA-014** Supabase database/auth/storage production configuration is complete.
- [ ] **INFRA-015** Public/private storage buckets and policies are configured.
- [ ] **INFRA-016** Email provider/domain is configured and a production-safe delivery verification passes.
- [ ] **INFRA-017** Turnstile/anti-bot production host/configuration is valid.
- [ ] **INFRA-018** Approved MapLibre/OpenFreeMap-compatible map provider is configured and failure degrades gracefully.
- [ ] **INFRA-019** Google Maps URL handoff works without requiring a paid Google Maps Platform API dependency.
- [ ] **INFRA-020** Analytics is configured and verified.
- [ ] **INFRA-021** Provider credentials are stored as secrets in the appropriate environment, not source code.
- [ ] **INFRA-022** Provider free/commercial-use constraints have been reviewed for production suitability.
- [ ] **INFRA-023** No accidental paid subscription, auto-recharge or unapproved billable dependency is enabled.

---

# 26. Backups and Recovery — MUST PASS

The production database is not considered safely operational merely because Supabase hosts it. The zero-cost-first plan requires independent logical backups.

## 26.1 Backup implementation

- [ ] **BACKUP-001** `supabase/migrations/` and seed/reference artifacts are committed/versioned in Git.
- [ ] **BACKUP-002** A production logical database dump/export procedure exists using current validated Supabase/PostgreSQL tooling.
- [ ] **BACKUP-003** Production backup files are never committed to Git.
- [ ] **BACKUP-004** Production backups containing customer/owner/private data are encrypted at rest.
- [ ] **BACKUP-005** Backup process includes integrity/checksum verification.
- [ ] **BACKUP-006** Backup storage location is owner-controlled and access-restricted.
- [ ] **BACKUP-007** Minimum operational schedule is established: weekly full logical DB backup plus pre-migration and pre-major-content-change backup/export.
- [ ] **BACKUP-008** Critical storage/media recovery responsibilities are documented because DB dumps do not contain Storage object binaries.
- [ ] **BACKUP-009** Critical object paths/media inventory/original-asset retention or export strategy is sufficient for the agreed V1 recovery posture.

## 26.2 Restore verification

- [ ] **BACKUP-010** A fresh production-like logical backup has been restored into a disposable local/staging database before launch.
- [ ] **BACKUP-011** Backup decryptability has been tested where encryption is used.
- [ ] **BACKUP-012** Backup checksum has been verified before restore.
- [ ] **BACKUP-013** Restored database passes smoke queries for properties, leads, submissions, verification and other critical relations.
- [ ] **BACKUP-014** Restore-test result/date is recorded.
- [ ] **BACKUP-015** Ongoing restore verification cadence is documented; the infrastructure plan's monthly restore-test expectation is accepted unless superseded by a stronger approved policy.

> A backup that has never been restored is **not verified** and does not satisfy this Definition of Done.

## 26.3 Recovery expectations

- [ ] **BACKUP-016** V1 RPO/RTO limitations of the zero-cost/manual recovery model are explicitly documented and accepted by the owner.
- [ ] **BACKUP-017** If the business requires recovery objectives stronger than the free-tier/manual architecture can support, production release is blocked until an approved infrastructure upgrade is selected.

---

# 27. Rollback and Migration Safety — MUST PASS

## 27.1 Application rollback

- [ ] **ROLL-001** A previous known-good Netlify deployment can be identified/promoted/redeployed.
- [ ] **ROLL-002** The release documents the last known-good rollback target.
- [ ] **ROLL-003** Database compatibility is checked before application rollback.
- [ ] **ROLL-004** Environment-variable rollback/recovery is documented.
- [ ] **ROLL-005** Application rollback procedure has been exercised or otherwise validated in staging/controlled conditions.

## 27.2 Database rollback/correction

- [ ] **ROLL-006** Migrations are forward-compatible where practical.
- [ ] **ROLL-007** Production migration has a corrective-migration or logical-restore plan appropriate to its risk.
- [ ] **ROLL-008** Team/owner understands that application rollback does not automatically roll back database state.
- [ ] **ROLL-009** No production plan assumes unavailable Free-tier point-in-time recovery.

## 27.3 Storage/domain rollback

- [ ] **ROLL-010** Public media uses immutable-object/relational-selection behavior sufficient to restore a previous active asset without overwriting historical binaries.
- [ ] **ROLL-011** Domain cutover is performed only after technical-URL verification and has a documented recovery path.

## 27.4 Production migration gate

Before any production migration:

- [ ] **ROLL-012** release working tree/commit is clean and identified;
- [ ] **ROLL-013** migration is reviewed;
- [ ] **ROLL-014** same migration succeeds in staging;
- [ ] **ROLL-015** backup/export is complete where schema/data risk exists;
- [ ] **ROLL-016** affected tables/lock/time impact are reviewed;
- [ ] **ROLL-017** correction/rollback plan is written;
- [ ] **ROLL-018** explicit production approval is recorded.

---

# 28. Legal, Trust and Public-Representation Readiness — MUST PASS

This section does not turn the software team into legal counsel; it ensures the product does not launch with known unsupported representations.

- [ ] **LEGAL-001** Terms, Privacy and Disclaimer pages exist and match the implemented product boundaries.
- [ ] **LEGAL-002** Public copy does not claim title guarantee, legal guarantee, guaranteed investment return, universal agricultural purchase eligibility, universal government approval or risk-free status.
- [ ] **LEGAL-003** Agricultural-land content does not implement or market a universal buyer-eligibility rule without current qualified legal confirmation.
- [ ] **LEGAL-004** NA content distinguishes stated NA/status information from development permission/buildability.
- [ ] **LEGAL-005** Industrial/GIDC content distinguishes GIDC authority context from private industrial land and avoids extending GIDC claims to private inventory.
- [ ] **LEGAL-006** RERA is optional/property-specific; the system does not require or invent a RERA number for every land parcel.
- [ ] **LEGAL-007** Official government references, if presented, are represented as references—not as unimplemented live integrations.
- [ ] **LEGAL-008** Public verification labels/disclaimer copy have the required professional/legal review before launch, or higher-risk labels remain disabled.
- [ ] **LEGAL-009** Legally consequential guide content, if published, has the required editorial/professional review.
- [ ] **LEGAL-010** Business accepts that final transaction/legal due diligence, drafting, payment and registration remain offline/human-assisted and the public UX does not claim otherwise.

---

# 29. Final Staging Validation — MUST PASS

The final release candidate must pass full staging smoke after staging migrations and provider configuration.

## 29.1 Public staging smoke

- [ ] **STAGE-001** Homepage loads successfully.
- [ ] **STAGE-002** Search/results load and filter correctly.
- [ ] **STAGE-003** Representative Agricultural property detail loads.
- [ ] **STAGE-004** Representative NA property detail loads.
- [ ] **STAGE-005** Representative Industrial property detail loads.
- [ ] **STAGE-006** Approximate-location privacy fixture passes.
- [ ] **STAGE-007** Hidden-location privacy fixture passes.
- [ ] **STAGE-008** Closed-property state renders correctly.
- [ ] **STAGE-009** Inquiry flow succeeds.
- [ ] **STAGE-010** Buyer requirement succeeds.
- [ ] **STAGE-011** Sell Your Land submission succeeds and remains private.
- [ ] **STAGE-012** Site-visit request succeeds and remains unconfirmed until admin action.
- [ ] **STAGE-013** Public media loads; private media remains protected.
- [ ] **STAGE-014** Map works or fails gracefully.
- [ ] **STAGE-015** 404/error states work.
- [ ] **STAGE-016** Canonical, robots and sitemap pass.

## 29.2 Admin staging smoke

- [ ] **STAGE-017** Admin login succeeds with staging admin.
- [ ] **STAGE-018** Protected admin page is inaccessible anonymously.
- [ ] **STAGE-019** Property draft/edit/publication gate works.
- [ ] **STAGE-020** Leads/activities/follow-ups work.
- [ ] **STAGE-021** Owner submissions and conversion work.
- [ ] **STAGE-022** Verification workflow/public preview works.
- [ ] **STAGE-023** Site-visit confirmation/state changes work.
- [ ] **STAGE-024** Media/private document handling works.
- [ ] **STAGE-025** Audit/health surfaces work without secret leakage.

## 29.3 Release report

- [ ] **STAGE-026** Final release-gate report is generated.
- [ ] **STAGE-027** Final staging release decision is `PASS`, not Conditional Hold or Fail.

---

# 30. Production Readiness Before Cutover — MUST PASS

Before production release/cutover:

- [ ] **PROD-001** Owner has approved production service choices and production-only actions.
- [ ] **PROD-002** Account ownership/recovery is documented for Netlify, Supabase, DNS, email, Turnstile, analytics and other required providers.
- [ ] **PROD-003** Production Supabase project is separate and correctly identified.
- [ ] **PROD-004** Production environment variables are complete.
- [ ] **PROD-005** No production secret is present in source control or `NEXT_PUBLIC_*`.
- [ ] **PROD-006** Production public/private buckets and policies are configured.
- [ ] **PROD-007** Production email provider/domain is configured.
- [ ] **PROD-008** Production Turnstile/site configuration is ready.
- [ ] **PROD-009** Production map provider configuration is ready.
- [ ] **PROD-010** Production analytics is ready.
- [ ] **PROD-011** Production canonical host/DNS plan is ready.
- [ ] **PROD-012** Production technical URL is healthy.
- [ ] **PROD-013** Required backup/export has completed.
- [ ] **PROD-014** Backup restore has already been verified.
- [ ] **PROD-015** Migration version/set is known.
- [ ] **PROD-016** Rollback target/build is known.
- [ ] **PROD-017** No accidental paid/auto-recharge service is enabled.
- [ ] **PROD-018** Final release report is `PASS`.

---

# 31. Final Live Smoke After Approved Deployment — MUST PASS

Use only safe production checks. Do not pollute production with destructive QA.

- [ ] **LIVE-001** Production homepage returns successfully over canonical HTTPS.
- [ ] **LIVE-002** Production search/results return correctly.
- [ ] **LIVE-003** Representative published property detail returns correctly.
- [ ] **LIVE-004** Representative closed-property state is not misleading.
- [ ] **LIVE-005** Admin login works.
- [ ] **LIVE-006** Admin private page remains inaccessible anonymously.
- [ ] **LIVE-007** Public media loads.
- [ ] **LIVE-008** Private document remains protected from anonymous/public access.
- [ ] **LIVE-009** Exact private-coordinate canary/private test property does not leak through public output.
- [ ] **LIVE-010** One explicitly approved safe production form flow succeeds without creating harmful test pollution.
- [ ] **LIVE-011** Email delivery is verified.
- [ ] **LIVE-012** Turnstile is verified.
- [ ] **LIVE-013** Public map is verified.
- [ ] **LIVE-014** Analytics ingestion is verified without sensitive payloads.
- [ ] **LIVE-015** Canonical host/metadata is verified.
- [ ] **LIVE-016** `robots.txt` is verified.
- [ ] **LIVE-017** `sitemap.xml` is verified.
- [ ] **LIVE-018** Deployment identifier/commit is recorded.
- [ ] **LIVE-019** No P0 error appears in health/logs after deployment.
- [ ] **LIVE-020** Final live smoke result is recorded as PASS.

A deployment is not considered successfully released until this live smoke passes.

---

# 32. Recommended Enhancements — NON-BLOCKING FOR V1

The following are desirable but do **not** block V1 completion unless an explicit later client decision promotes one to MUST PASS. They must never be used as an excuse to weaken a MUST PASS criterion.

## 32.1 Public discovery/content

- [ ] **REC-001** Advanced filters beyond the core V1 filter set.
- [ ] **REC-002** Exact public map mode for selected intentionally disclosed properties.
- [ ] **REC-003** Hidden public map mode UI beyond the required privacy-safe backend support, if not needed by launch inventory.
- [ ] **REC-004** Additional public guide/blog content beyond the minimum legal/information pages.
- [ ] **REC-005** Additional curated Ahmedabad/Gandhinagar SEO location/category pages beyond pages justified by inventory/content.
- [ ] **REC-006** Additional related-property recommendation sophistication.
- [ ] **REC-007** Optional list/grid view switching if not required by launch UX.

## 32.2 Rich media

- [ ] **REC-008** External standard video support where inventory contains suitable media.
- [ ] **REC-009** Drone video support.
- [ ] **REC-010** Public PDF brochure support beyond any launch-critical property need.
- [ ] **REC-011** 360° external-tour support.
- [ ] **REC-012** Richer image metadata/capture-date presentation.

These are enhancements only if omitted entirely. **If implemented, they must still satisfy all relevant security/privacy/media/accessibility/SEO MUST PASS rules.**

## 32.3 Admin/operations

- [ ] **REC-013** Email admin alerts beyond the required durable CRM record.
- [ ] **REC-014** Rich calendar-style site-visit visualization; manual confirmation remains mandatory.
- [ ] **REC-015** Drag-and-drop CRM pipeline; explicit stage controls are sufficient for V1.
- [ ] **REC-016** Advanced cross-property media management/asset tooling.
- [ ] **REC-017** More advanced analytics dashboards beyond required V1 business metrics.
- [ ] **REC-018** Additional provider automation after operational volume justifies it.

## 32.4 Future-only features explicitly not required

The following are **not V1 completion requirements** and must not be added merely to make the product appear more complete:

- buyer accounts;
- seller dashboard/accounts;
- public agent accounts/marketplace;
- public reviews;
- memberships/paid listings;
- payment gateway;
- in-app messaging;
- AI chatbot;
- automatic valuation;
- mortgage tools;
- WhatsApp Business API dependency;
- SMS automation;
- automatic full calendar booking;
- full legal due-diligence/title-guarantee product;
- online registration/transaction closing;
- microservices/event bus/search cluster without a demonstrated need.

---

# 33. Codex Completion Protocol — MUST FOLLOW

Before Codex can state that UrbanEdge Land Space V1 is complete:

1. Every MUST PASS item in Sections 2–31 must have a resolved status.
2. Every MUST PASS item must be `PASS` unless that criterion explicitly allows `N/A — APPROVED` and the approval/rationale is recorded.
3. No criterion may be treated as PASS solely because implementation code exists.
4. No criterion may be treated as PASS solely because a developer manually clicked through one happy path.
5. Security/privacy/RLS/backup/build criteria require explicit evidence.
6. Any known privacy/security leak is an immediate FAIL regardless of feature completeness.
7. Any public legal/trust claim without required approval/support is an immediate FAIL or must be disabled.
8. Any owner submission that can become public without explicit admin publication is an immediate FAIL.
9. Any site-visit request that can become confirmed without authorized admin action is an immediate FAIL.
10. Any closed property still represented as available is an immediate FAIL.
11. Any automated test pointing at production is an immediate FAIL.
12. Any unverified backup/restore posture is at least a CONDITIONAL HOLD.
13. Any production build failure is an immediate FAIL.
14. Any required staging smoke failure is a FAIL/HOLD until corrected and rerun.
15. Any unresolved P0 or meaningful P1 issue is release-blocking.
16. Recommended enhancements may remain deferred only when they do not create a gap in a MUST PASS criterion.
17. If an implementation decision contradicts the authoritative architecture, Codex must not silently normalize the divergence; an ADR/amendment must resolve it.
18. Codex must produce the final release-gate result as exactly one of:

```text
PASS
CONDITIONAL HOLD
FAIL
```

Only `PASS` permits the phrase **production-ready**.

---

# 34. Final Production Acceptance Statement

UrbanEdge Land Space V1 may be called **DONE** only when the team can prove all of the following simultaneously:

> The public can discover only intentionally published, public-safe Agricultural, NA and Industrial land in the supported Ahmedabad/Gandhinagar market; search and property pages are server-rendered, responsive, accessible, performant and SEO-safe; Property IDs, geography, pricing, area, publication and availability are structurally correct; buyer inquiries and generic requirements reliably enter one central CRM; owner submissions remain private and can only become Draft listings through explicit admin conversion; site visits begin as requests and require manual admin confirmation; verification claims are scoped, evidence-backed, dated, attributable and professionally reviewed where required; media is validated and public media cannot expose private documents or EXIF coordinates; owner PII, private documents, internal notes and exact parcel coordinates remain private at database, storage, server, HTML, RSC, API, analytics, email and browser boundaries; RLS and admin authorization deny unauthorized access; sensitive changes are audited; SEO canonicals, robots, sitemap and structured data are controlled and privacy-safe; all mandatory tests and the production build pass; Local/Staging/Production are isolated; backups are encrypted and actually restorable; rollback is known; providers and secrets are production-ready; staging and live smoke tests pass; and no unresolved MUST PASS item remains.

If any part of that statement cannot be proven, the application is **not complete**.

---

# 35. Final Release Gate Checklist

This condensed checklist does not replace the detailed criteria above; it is the final sign-off summary.

## Product/public

- [ ] All required public routes/workflows pass.
- [ ] Search, property detail and no-results requirement flow pass.
- [ ] Sold/Rented/Leased/Unavailable states are accurate.
- [ ] Public copy contains no unsupported guarantees.

## Admin/business operations

- [ ] Admin auth/authorization pass.
- [ ] Property CRUD/publication gate pass.
- [ ] CRM/activity/follow-up pass.
- [ ] Sell Your Land/private conversion pass.
- [ ] Site-visit manual confirmation pass.
- [ ] Verification workflow/pass gates pass.
- [ ] Audit history pass.

## Data/security/privacy

- [ ] Clean migrations pass.
- [ ] Constraints/indexes pass.
- [ ] RLS full negative matrix passes.
- [ ] Exact-location leakage scan passes.
- [ ] Owner-PII leakage scan passes.
- [ ] Private-document security tests pass.
- [ ] Secret scan/security headers/XSS tests pass.

## Media/SEO/quality

- [ ] Media upload/public-private separation/EXIF tests pass.
- [ ] Canonical/robots/sitemap/structured-data tests pass.
- [ ] Accessibility release threshold passes.
- [ ] Responsive suite passes.
- [ ] Performance baseline/budget passes.

## Build/operations

- [ ] CI mandatory chain passes.
- [ ] Production build passes.
- [ ] Staging full QA passes.
- [ ] Production environment/provider configuration complete.
- [ ] Backup/export complete and encrypted as required.
- [ ] Backup restore tested successfully.
- [ ] Rollback target/procedure verified.
- [ ] Owner/professional approvals complete where required.
- [ ] Final release decision is `PASS`.
- [ ] Final live production smoke passes.

**Final rule:** if any checkbox in a MUST PASS section is unresolved, Codex must report the application as **NOT DONE**.
