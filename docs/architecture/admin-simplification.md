# Admin simplification (M20)

## Operating model

The normal admin workflow is **People → Properties → Visits → Deals**. The admin UI uses business terms—lead, property, document, review, follow-up, site visit, and deal—while the existing RLS, audit, evidence, and verification machinery remains behind the workspace.

Primary navigation is:

- Workspace: Dashboard
- Inventory: Properties
- CRM: Leads, Follow-ups, Site Visits
- Content: Guides, SEO
- Settings: Settings; Security & Audit is visible only to ADMIN and SUPER_ADMIN roles

Owner Submissions, Requirements, Media, and Verification are no longer primary navigation entries. Their routes and historical data remain available, and their normal operations now live within lead or property workspaces.

## Workflows

### Seller

`/sell-your-land` is one short contact form. It asks for required name and phone/WhatsApp plus optional email, Sell/Rent/Lease intent, land type, location, and message. The server retains Turnstile, honeypot, validation, rate limiting, consent, and idempotency controls. A successful submission creates a `SELLER_LEAD`; it never creates or publishes a property automatically.

The seller lead workspace includes contact shortcuts, intake facts, private seller documents, follow-ups, activity, and every explicitly linked seller property. **Create Property from Lead** opens a draft with only known values prefilled. The stable relationship is `property_source_links(source_type = 'SELLER_LEAD', source_reference = lead.id)`, so one seller lead can create zero or many parcels without conflating seller ownership with buyer matching.

### Buyer

The buyer workspace retains the requirement, many-to-many property matches, follow-ups, visits, negotiation, and history. `/admin/leads?view=unmatched_buyers` is the canonical unmatched-buyer preset. `lead_properties` remains the buyer/property many-to-many relationship. Closing a lead as `CLOSED_WON` or `CLOSED_LOST` does not alter property availability.

### Property

`/admin/properties` uses bounded, paginated summary queries and compact cards. Search, category, publication, availability, district, sorting, and pagination remain available. Cards do not load verification trees or document history.

The property workspace has exactly six server-selected tabs: Overview, Media, Documents, Review, Interested Buyers, and Activity. Overview is the default. Media, document records, publication readiness, buyer/visit details, and activity are loaded only for the tab that needs them. Saving a property is distinct from publishing it; property creation always starts as `DRAFT`.

Publication and availability are independent. Publish and unpublish are explicit server-authorized actions. Availability is changed explicitly, and marking a property sold requires confirmation and writes an audit event. Draft-only archive behavior follows the existing database transition constraints.

## Documents and review

M20 reuses `verification-documents-private` rather than adding a bucket. Inspection showed that it is private, has no browser object-mutation policy, already supports short-lived audited signed URLs, and does not require a `verification_evidence` link. Reuse avoids duplicating access and retention controls.

Ordinary property objects use the controlled path `properties/<property-id>/documents/<uuid>.<ext>`. Seller intake objects use `leads/<lead-id>/documents/<uuid>.<ext>`. Registration is performed by server-only service-role RPCs after active-admin authorization. Client-supplied bucket, visibility, and object path values are rejected. The UI provides multi-select/drag-and-drop batch upload, an optional controlled tag, per-file result, and retry. Uploading a file does not create a verification result and does not mark a review as passed.

Review is an optional internal check. The advanced verification route, definitions, evidence, provenance rules, professional-review structures, and history remain intact and accessible through **Advanced Review**. They are no longer ordinary marketing publication prerequisites.

## Marketing readiness

`property_publication_readiness` remains the authoritative server-side gate and is rechecked by the publish mutation. M20 limits blockers to public marketing rules:

- required core listing data and valid slug/category/transaction
- positive area and a valid price for the selected price mode (`PRICE_ON_REQUEST` needs no number)
- an approved public cover image
- configured location privacy
- marketable availability
- absence of prohibited legal-guarantee claims

Category-detail completeness is advisory and category-aware, not a blocker. Deep legal verification is independent. The publish service still authorizes the admin, writes audit history, changes publication state safely, and revalidates the established public listing/category paths. Public pages continue to read only the established public-safe projection; drafts and private document data are excluded.

## Migration and historical data

`20260910010000_m20_simplify_publication_and_intake.sql` is additive/forward-only. It adds `SELLER_LEAD` if missing, extends existing consent/intake/rate contracts without removing legacy owner intake, adds seller-source and active-lead-document indexes, adds the server-only lead-document registration function, and updates readiness/intake RPCs while retaining their authorization semantics.

No historical table, column, property, media row, owner submission, requirement, verification row, evidence row, or audit row is removed. Existing open `owner_submissions` are intentionally **not auto-mirrored** in M20: the current schema does not provide an enforced one-to-one lead reference suitable for a duplicate-safe automatic conversion. The legacy submission route remains the safe management path. A future opt-in backfill should first add a stable source link, record an audit entry, use a unique constraint for idempotency, and support reversing only the generated link/lead records.

## Rollback

Application rollback is a revert of the M20 application commits on `staging`. Database rollback must be forward-only: deploy a new migration restoring the previous RPC bodies/constraints if required. Never run `db reset`, down migrations, delete enum labels, remove historical rows, or make the private bucket public on staging or production. Leaving the additive `SELLER_LEAD` enum value and indexes in place is harmless during an application rollback.

## Verification record

Baseline before the arc: typecheck and production build passed; 45 Vitest files with 269 tests passed; lint had five pre-existing explicit-`any` errors; formatting reported ten files. The clean disposable local database was rebuilt through M20, and all 16 pgTAP files / 619 assertions passed, including seller 0..N properties, buyer many-to-many, publication without deep verification, prohibited claims, RLS/private documents, draft/public projection, `CLOSED_WON` independence, and explicit SOLD behavior.

The property list is limited to 24 summary records per page and the workspace tab queries are lazy. These are architectural performance changes, not a latency guarantee. Numeric staging before/after timings and Netlify smoke URLs belong in the execution report after an actual staging deploy; they must not be inferred from local timings.
