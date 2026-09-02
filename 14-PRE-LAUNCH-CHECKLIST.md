# URBANEDGE LAND SPACE — FINAL OPERATIONAL PRE-LAUNCH CHECKLIST

**File:** `14-PRE-LAUNCH-CHECKLIST.md`  
**System:** UrbanEdge Land Space V1  
**Launch geography:** Ahmedabad + Gandhinagar, Gujarat  
**Primary domain:** `https://urbanedgelandspace.com`  
**Purpose:** Final operational launch gate after implementation, testing, staging validation and Definition of Done completion.

---

# 0. Launch Rule

UrbanEdge Land Space **must not be launched** while any required checklist item below is unresolved.

Every required item must be one of:

- `PASS` — completed and evidenced;
- `N/A — APPROVED` — genuinely not applicable, with rationale and owner approval;
- `HOLD` — incomplete or awaiting approval; blocks launch;
- `FAIL` — failed validation; blocks launch.

`TODO`, `almost done`, `works locally`, `will fix after launch`, `probably configured`, `manual check later`, and similar states are not acceptable.

## Approval tags

Use these tags exactly where applicable:

- **[OWNER APPROVAL]** — UrbanEdge/domain owner must explicitly approve before execution or launch.
- **[PAYMENT APPROVAL]** — explicit approval is required before activating a paid plan, attaching billing details, enabling automatic charges, or exceeding the approved zero-cost baseline.
- **[DESTRUCTIVE-PRODUCTION APPROVAL]** — explicit approval is required before any production action that can delete, overwrite, irreversibly transform, anonymize, truncate, restore over, or otherwise materially risk live data.
- **[QUALIFIED COUNSEL APPROVAL]** — approval by qualified Gujarat property counsel is required for public legal/verification/consent wording identified below.

A single action may require more than one tag.

---

# 1. Final Release Ownership

- [ ] Release owner is named.
- [ ] Technical deploy operator is named.
- [ ] UrbanEdge business owner who can give **[OWNER APPROVAL]** is named.
- [ ] Qualified Gujarat property counsel responsible for legal/verification wording approval is identified.
- [ ] Person authorized to give **[PAYMENT APPROVAL]** is identified.
- [ ] Person authorized to give **[DESTRUCTIVE-PRODUCTION APPROVAL]** is identified.
- [ ] Release commit / immutable build identifier is recorded.
- [ ] Production environment and deployment target are recorded.
- [ ] Final launch window and rollback decision-maker are recorded.
- [ ] No unreviewed local working-tree build will be deployed directly to production.
- [ ] All MUST PASS items in `13-DEFINITION-OF-DONE.md` are `PASS` before this checklist can become `PASS`.

---

# 2. Real Property Inventory and Business Data

## 2.1 Launch inventory

- [ ] **[OWNER APPROVAL]** Ahmedabad launch inventory is confirmed as real, current and authorized for publication.
- [ ] **[OWNER APPROVAL]** Gandhinagar launch inventory is confirmed as real, current and authorized for publication.
- [ ] Every published property has a valid immutable UrbanEdge Property ID.
- [ ] Every published property has the correct land category: Agricultural, NA or Industrial.
- [ ] Every published property has the correct supported transaction intent: Buy, Rent or Lease.
- [ ] Every published property has an explicit publication state and an explicit availability state.
- [ ] Sold/Rented/Leased/Off-Market property records are not presented as available.
- [ ] Every listing has a reviewed title, description, broad location and category-specific details.
- [ ] Area values, source units and normalized units have been checked.
- [ ] Local-unit conversion rules have a documented source where conversion is shown.
- [ ] Price mode is intentional for every property, including `Price on Request` where used.
- [ ] No fake price, placeholder amount or dummy negotiability value exists to satisfy search/filter logic.
- [ ] Road access, frontage, infrastructure, planning, NA, agricultural and industrial claims have been checked against the available evidence and are not inferred beyond that evidence.
- [ ] Public location mode is intentionally set per property: `EXACT`, `APPROXIMATE` or `HIDDEN`.
- [ ] `APPROXIMATE` remains the default unless a specific property has been deliberately approved otherwise.
- [ ] Exact private coordinates are absent from all public payloads for `APPROXIMATE` and `HIDDEN` listings.
- [ ] Every property intended for launch passes the publication gate.
- [ ] No owner submission has become public automatically.
- [ ] Any off-market/sensitive inventory has an intentional public presentation policy.

## 2.2 Owner and source information

- [ ] Owner / co-owner / authorized representative / broker relationships are correctly recorded where applicable.
- [ ] Private owner phone numbers and email addresses are not exposed publicly unless an explicit future business decision allows it.
- [ ] Supporting ownership/source records required for internal operations are present.
- [ ] Owner documents are kept private.
- [ ] Internal brokerage, negotiation and sourcing notes are absent from public projections.
- [ ] Third-party/broker-submitted inventory has the required authority/consent record before publication.
- [ ] **[OWNER APPROVAL]** Final set of live properties and publication states is approved before public launch.

---

# 3. Client Contact Details and Conversion Destinations

- [ ] **[OWNER APPROVAL]** Official UrbanEdge Land Space business name is confirmed.
- [ ] **[OWNER APPROVAL]** Public business phone number is confirmed.
- [ ] **[OWNER APPROVAL]** Public WhatsApp number is confirmed.
- [ ] **[OWNER APPROVAL]** Public contact email is confirmed.
- [ ] **[OWNER APPROVAL]** Email reply-to address is confirmed.
- [ ] **[OWNER APPROVAL]** Office address, if published, is confirmed.
- [ ] **[OWNER APPROVAL]** Business hours, if published, are confirmed.
- [ ] Header, footer, contact page and all conversion surfaces use the same approved contact details.
- [ ] `tel:` links dial the approved number.
- [ ] WhatsApp links open the approved number.
- [ ] Property-specific WhatsApp messages preserve the Property ID.
- [ ] Generic WhatsApp flows do not leak unnecessary private customer data in the URL.
- [ ] `mailto:` destinations use the approved business email.
- [ ] Inquiry, requirement, Sell Your Land and site-visit notifications reach the correct production recipient.
- [ ] No staging/developer/personal phone number or email remains in production content or configuration.

---

# 4. Domain, DNS and TLS

## 4.1 Ownership

- [ ] **[OWNER APPROVAL]** Domain ownership/control is confirmed.
- [ ] Domain registrar account is owned or controlled by the client/business, not solely by a developer.
- [ ] Cloudflare account is owned or controlled by the client/business.
- [ ] Production Netlify organization/site is owned or controlled by the client/business.
- [ ] Production Supabase organization/project is owned or controlled by the client/business.
- [ ] Resend organization/domain is owned or controlled by the client/business.
- [ ] At least one owner-controlled recovery path exists for every production provider.

## 4.2 Canonical domain

- [ ] Canonical production host is confirmed as `https://urbanedgelandspace.com`, unless an explicit approved decision changes it.
- [ ] **[OWNER APPROVAL]** Canonical host choice is approved.
- [ ] `www` versus apex redirect policy is fixed and tested.
- [ ] Redirect is one-hop and permanent where applicable.
- [ ] HTTP redirects to HTTPS.
- [ ] TLS certificate is active and valid.
- [ ] No mixed-content warnings exist.
- [ ] HSTS is enabled only after domain/proxy behavior is validated.

## 4.3 DNS cutover

- [ ] Existing DNS zone is exported/snapshotted before changes.
- [ ] Existing unrelated records are inventoried.
- [ ] TTLs are lowered in advance where operationally practical.
- [ ] Netlify web records are copied from current provider instructions; no DNS value is hand-invented.
- [ ] Resend verification records are copied from current provider instructions; no email-authentication value is hand-invented.
- [ ] SPF is valid.
- [ ] DKIM is valid.
- [ ] DMARC is present and intentionally configured.
- [ ] No unrelated DNS record is lost.
- [ ] Final DNS zone is documented.
- [ ] **[OWNER APPROVAL]** Change of authoritative nameservers / production DNS cutover is approved before execution.

---

# 5. Production Environment Variables and Secrets

## 5.1 Environment identity

- [ ] `APP_ENV=production`.
- [ ] `NEXT_PUBLIC_SITE_URL` points to the canonical production URL.
- [ ] Production environment variables are stored only in the approved production secret/configuration system.
- [ ] Staging/local values are not reused accidentally in production.
- [ ] Production deployment visibly reports the correct environment identity without exposing secrets.

## 5.2 Required baseline variables

Confirm the implemented equivalents of:

```dotenv
APP_ENV=production
NEXT_PUBLIC_SITE_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=
EMAIL_FROM=
EMAIL_REPLY_TO=

NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

NEXT_PUBLIC_MAP_STYLE_URL=
NEXT_PUBLIC_MAP_PROVIDER=

NEXT_PUBLIC_ANALYTICS_ENABLED=

HMAC_SECRET=
WEBHOOK_SIGNING_SECRET=
```

- [ ] Every required production variable is present.
- [ ] No obsolete variable controls active behavior.
- [ ] No production secret is missing and silently falling back to development behavior.

## 5.3 Secret-boundary audit

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- [ ] `RESEND_API_KEY` is server-only.
- [ ] `TURNSTILE_SECRET_KEY` is server-only.
- [ ] `HMAC_SECRET` is server-only if implemented.
- [ ] `WEBHOOK_SIGNING_SECRET` is server-only if implemented.
- [ ] No secret appears in any `NEXT_PUBLIC_*` variable.
- [ ] No secret exists in Git history intended for release.
- [ ] No real secret exists in `.env.example`.
- [ ] No secret is exposed in browser bundles, HTML, JSON, RSC payloads, analytics, logs, URLs or client storage.
- [ ] Any secret exposed during development has been rotated before launch.

---

# 6. Production Supabase Project

- [ ] **[OWNER APPROVAL]** Dedicated production Supabase project exists.
- [ ] Production project is separate from staging.
- [ ] Production project is separate from UrbanEdge Living Space.
- [ ] Project reference and region are documented.
- [ ] Database connectivity is verified.
- [ ] Supabase Auth is enabled/configured for the required admin flow.
- [ ] Production admin profile maps correctly to the production auth user.
- [ ] Storage buckets exist in the production project.
- [ ] RLS is enabled on every applicable application table.
- [ ] `FORCE ROW LEVEL SECURITY` is enabled where required by the implemented security contract.
- [ ] Broad anonymous/authenticated grants have been revoked where not explicitly required.
- [ ] Public access occurs through approved public-safe projections.
- [ ] Service-role credentials are used only from trusted server code.
- [ ] Production health check confirms database/storage/auth configuration without revealing secret values.

---

# 7. Production Migration Approval and Data Load

## 7.1 Migration readiness

- [ ] Migration set is committed and versioned.
- [ ] Clean local Supabase reset/apply succeeds.
- [ ] Migration from the staging baseline succeeds.
- [ ] Staging schema matches the intended production schema.
- [ ] Migration SQL has received technical review.
- [ ] Schema changes are not being performed manually as an undocumented substitute for migrations.
- [ ] Migration order and dependencies are documented.
- [ ] Required seed/reference data is separated from demo/test data.
- [ ] Production migration output/logging will be retained.

## 7.2 Approval before production migration

- [ ] Current production backup/export exists before any migration that can affect existing data.
- [ ] Migration rollback/correction plan is written.
- [ ] Forward-fix path is written for non-reversible migrations.
- [ ] Expected lock time / operational impact is understood where relevant.
- [ ] **[OWNER APPROVAL]** Applying the production migration is approved before execution.
- [ ] **[DESTRUCTIVE-PRODUCTION APPROVAL]** Any migration containing `DROP`, destructive `ALTER`, truncation, irreversible data transformation, mass overwrite, destructive backfill, data anonymization or equivalent risk has separate explicit approval.
- [ ] Destructive production migration is not auto-run merely because code was merged.
- [ ] Migration is blocked if the exact applied migration set cannot be identified.

## 7.3 Production seed / real data policy

Production seed may contain only approved:

- configuration;
- verified geography/reference data;
- public settings;
- legal/SEO defaults.

It must not contain fake properties, fake owners, fake leads, fake private documents or fake testimonials represented as real.

- [ ] **[OWNER APPROVAL]** Insertion/import of real production property inventory is approved.
- [ ] **[OWNER APPROVAL]** Upload/import of real private owner/legal documents is approved.
- [ ] Imported real data has been spot-checked against source records.
- [ ] Import scripts are idempotent or otherwise safely controlled.
- [ ] Re-running an import cannot silently duplicate properties, owners, leads or documents.

---

# 8. Demo/Test Data Removal

- [ ] Production contains no `DEMO`, `TEST`, `STAGING`, sample or placeholder property represented as real.
- [ ] Production contains no fake owner records.
- [ ] Production contains no fake leads.
- [ ] Production contains no fake site visits.
- [ ] Production contains no fake verification evidence.
- [ ] Production contains no fake private documents.
- [ ] Production contains no test admin account unless explicitly retained for a documented operational reason.
- [ ] Production contains no placeholder legal text.
- [ ] Production contains no placeholder phone/email/WhatsApp.
- [ ] Production contains no lorem ipsum or stock/test listing description.
- [ ] Production contains no broken placeholder media.
- [ ] Search results, featured listings and SEO pages show only approved production data.
- [ ] If removal requires deleting existing production records, **[DESTRUCTIVE-PRODUCTION APPROVAL]** is recorded before deletion.
- [ ] A backup/export exists before mass deletion of contaminated production data.

---

# 9. Storage, Real Images and Assets

## 9.1 Bucket separation

- [ ] Public listing media and private owner/legal/verification documents are in separate access domains/buckets.
- [ ] Anonymous users cannot list or read private buckets.
- [ ] Private object paths are not exposed through public property projections.
- [ ] Private signed URLs are short-lived and authorization-checked.
- [ ] Private document access is auditable where required.
- [ ] Public media rollback/replacement behavior has been tested.

## 9.2 Real launch assets

- [ ] All launch property cover images are real and approved.
- [ ] Additional property images are real and correspond to the subject property/context.
- [ ] No unauthorized third-party watermark remains.
- [ ] No misleading old/neighbouring-property image is presented as the subject property.
- [ ] Road/access/context images are accurate.
- [ ] Industrial infrastructure images are accurate where shown.
- [ ] Drone/video/360/brochure links are valid where published.
- [ ] Empty media tabs/components are hidden.
- [ ] Image alt text is meaningful.
- [ ] Image sizes/compression are suitable for production.
- [ ] Images are served through the intended responsive/loading pipeline.
- [ ] Public images do not expose private EXIF geolocation.
- [ ] Object/file names do not contain owner phone numbers, private survey references or exact private coordinates.
- [ ] Site logos, favicons, social/OG images and other brand assets are final production assets.
- [ ] No placeholder logo, developer icon or staging artwork remains.

---

# 10. Backup, Restore and Recovery Readiness

## 10.1 Pre-launch backup

- [ ] A current logical production database backup/export exists.
- [ ] Backup filename includes date/time and environment identity.
- [ ] Backup is stored outside the live production database.
- [ ] Backup access is restricted.
- [ ] Storage asset recovery/export approach is documented.
- [ ] Critical configuration needed to recreate the environment is documented without exposing secrets publicly.

## 10.2 Restore proof

- [ ] Latest backup has been restore-tested according to the infrastructure policy.
- [ ] Restore procedure is documented step-by-step.
- [ ] Restore test proves critical entities survive: properties, owner submissions, leads, site visits, verification, audit history and required settings.
- [ ] Recovery time expectations are understood operationally even if no SLA is promised.
- [ ] Supabase Free limitations, including backup/inactivity limitations, are documented for the owner.
- [ ] Weekly production logical backup process is established.
- [ ] Monthly restore-test process is established.

## 10.3 Recovery ownership

- [ ] Owner-controlled access exists to the domain registrar.
- [ ] Owner-controlled access exists to Cloudflare.
- [ ] Owner-controlled access exists to Netlify.
- [ ] Owner-controlled access exists to Supabase.
- [ ] Owner-controlled access exists to Resend.
- [ ] Recovery contacts are documented securely.
- [ ] Developer personal account is not the only recovery path.

---

# 11. Rollback Plan

- [ ] Last known good application build/deployment is identified.
- [ ] Rollback deployment procedure is documented.
- [ ] Database migration compatibility with the previous build is understood.
- [ ] A forward-fix plan exists where database migration rollback is unsafe.
- [ ] DNS rollback values are recorded before cutover.
- [ ] Email DNS rollback impact is understood.
- [ ] Storage/media rollback procedure is documented.
- [ ] Cache/revalidation behavior after rollback is understood.
- [ ] Rollback smoke-test checklist exists.
- [ ] Rollback decision authority is named.
- [ ] Rollback trigger conditions are written, including security leak, migration corruption, auth failure, widespread form failure or severe production regression.
- [ ] **[DESTRUCTIVE-PRODUCTION APPROVAL]** Database restore-over-live, down-migration, mass data rollback or other data-overwriting rollback requires explicit destructive-production approval.
- [ ] A rollback is not considered safe if it would reintroduce a known privacy/security defect.

---

# 12. Legal Text Approval

The architecture is a software/product baseline, not legal advice. Production legal wording must be reviewed at the appropriate professional level.

- [ ] Final `/terms` text exists.
- [ ] Final `/privacy` text exists.
- [ ] Final `/disclaimer` text exists.
- [ ] Brokerage/service boundary is accurately described.
- [ ] Listing-information limitations are accurately described.
- [ ] Availability limitations are accurately described.
- [ ] Location-precision limitations are accurately described.
- [ ] Verification limitations are accurately described.
- [ ] Government/third-party authority limitations are accurately described.
- [ ] No title guarantee is stated or implied.
- [ ] No legal-clearance guarantee is stated or implied.
- [ ] No development/buildability guarantee is stated or implied.
- [ ] No universal agricultural buyer eligibility claim is stated.
- [ ] No generic claim that NA status guarantees development rights is stated.
- [ ] No claim that GIDC context automatically establishes a particular ownership/transfer status is stated.
- [ ] Retention/privacy/consent wording has been reviewed for current applicable requirements.
- [ ] **[QUALIFIED COUNSEL APPROVAL] [OWNER APPROVAL]** Final Terms/Privacy/Disclaimer text is approved for production.
- [ ] Approval record contains approver, date and approved version/hash/document reference.
- [ ] No unapproved legal copy remains in CMS/settings/code.

---

# 13. Verification Wording Approval by Qualified Counsel

Public verification wording remains a launch blocker until professionally approved.

- [ ] Every public verification label has a defined scope.
- [ ] Every public verification explanation says what was checked.
- [ ] Every public verification explanation avoids claiming what was not checked.
- [ ] Each public verification state can be tied to evidence, reviewer and review date.
- [ ] No generic property-level `Verified` claim or equivalent legal-certainty badge exists.
- [ ] Public verification output does not expose raw evidence, private documents or internal reviewer notes.
- [ ] Expired, superseded or revoked evidence cannot support a current public claim.
- [ ] `Information Reviewed`, `Documents Reviewed`, `Location Reviewed`, `Site Visited`, `Survey Reviewed`, `Legal Review Completed` or equivalent labels are used only with their approved definitions.
- [ ] Wording makes clear that verification is a trust signal, not a title guarantee.
- [ ] Legal-review language does not imply government certification or title insurance.
- [ ] High-risk/uncertain matters route to professional review rather than being auto-resolved by software.
- [ ] **[QUALIFIED COUNSEL APPROVAL]** Exact public verification labels, explanations and disclaimers are approved by qualified Gujarat property counsel.
- [ ] **[OWNER APPROVAL]** UrbanEdge approves which verification signals are actually enabled publicly.
- [ ] Approved wording is version-controlled/configured so later edits do not silently bypass counsel approval.
- [ ] Any post-approval material wording change triggers re-review before publication.

---

# 14. Owner Consent and Sell Your Land Text

- [ ] Sell Your Land clearly states that submission does not create an instant public listing.
- [ ] Owner is informed that UrbanEdge will review the information before publication.
- [ ] Permission-to-contact wording is present.
- [ ] Information-submission declaration is present.
- [ ] Privacy/data-use consent wording is present.
- [ ] Publication-subject-to-review acknowledgement is present.
- [ ] Document-submission wording states that documents are supplied for UrbanEdge review and do not by themselves constitute legal certification.
- [ ] Consent event is recordable with timestamp/source as designed.
- [ ] Consent wording covers the actual production fields and workflows.
- [ ] Third-party/broker/intermediary submission consent/authority wording is resolved.
- [ ] **[QUALIFIED COUNSEL APPROVAL] [OWNER APPROVAL]** Final owner consent and related privacy wording is approved before production use.
- [ ] Consent version in production matches the approved version.
- [ ] No unchecked or preselected consent is used where affirmative consent is required.
- [ ] Validation prevents submission when required consent is absent.

---

# 15. SEO Metadata and Indexing

## 15.1 Core metadata

- [ ] Homepage has final title and description.
- [ ] Agricultural Land page has final title and description.
- [ ] NA Land page has final title and description.
- [ ] Industrial Land page has final title and description.
- [ ] Buy/Rent/Lease discovery pages have intentional metadata/indexing behavior.
- [ ] Ahmedabad page has final unique metadata.
- [ ] Gandhinagar page has final unique metadata.
- [ ] Approved location × category pages have unique useful metadata.
- [ ] Property pages generate unique metadata from public-safe data.
- [ ] Guide pages have reviewed metadata.
- [ ] Legal pages have intentional robots/indexing behavior.
- [ ] Open Graph data uses only approved public-safe media and fields.
- [ ] Structured data contains no fake ratings, reviews, price, availability, legal approval or private exact coordinates.

## 15.2 Canonicalization

- [ ] Canonical host is consistent.
- [ ] Every indexable page emits an intended canonical.
- [ ] Duplicate query-parameter orders do not create conflicting canonicals.
- [ ] Tracking parameters are not canonicalized as unique pages.
- [ ] Filter/search state follows the approved noindex/crawl policy.
- [ ] Page-1 and pagination canonical rules are correct.
- [ ] Slug-change redirects are permanent and one-hop.
- [ ] Removed/private property routes do not generically redirect to the homepage.

## 15.3 Thin-page protection

- [ ] Ahmedabad/Gandhinagar location/category pages are indexable only when they satisfy the content/inventory quality gate.
- [ ] No village/locality page is indexable merely because a database row exists.
- [ ] No mass thin programmatic SEO rollout is enabled.
- [ ] Empty/low-value search combinations are not indexable.

---

# 16. Sitemap, Robots and Search Console

- [ ] `/robots.txt` returns HTTP 200.
- [ ] `robots.txt` references the production sitemap.
- [ ] Admin/private routes are not intentionally exposed for indexing.
- [ ] Preview/staging remains noindex/access-restricted according to policy.
- [ ] `/sitemap.xml` returns valid XML.
- [ ] Every sitemap URL returns a canonical, indexable HTTP 200.
- [ ] Sitemap contains no redirect URL.
- [ ] Sitemap contains no 404/5xx URL.
- [ ] Sitemap contains no `noindex` URL.
- [ ] Sitemap excludes admin/private/search-state/thank-you URLs unless an explicit approved policy says otherwise.
- [ ] Sitemap includes only approved live property/content URLs.
- [ ] Representative canonical/robots/sitemap checks pass on the final production domain.

## Search Console

- [ ] Google Search Console property is prepared for the canonical domain.
- [ ] Ownership verification method is controlled by the client/business.
- [ ] After production domain is live, canonical domain verification is completed.
- [ ] `/sitemap.xml` is submitted.
- [ ] Representative URLs are inspected: homepage, each core category, Ahmedabad, Gandhinagar, at least one approved location/category page, representative property pages, and a guide.
- [ ] Post-launch monitoring owner is assigned for indexing, canonical, soft-404, crawl and structured-data issues.

---

# 17. Analytics and Observability

- [ ] Production analytics is intentionally enabled.
- [ ] Analytics provider/configuration is production-specific.
- [ ] Property view event works.
- [ ] Search event works where implemented.
- [ ] Inquiry event works.
- [ ] WhatsApp click event works.
- [ ] Call click event works.
- [ ] Site-visit request event works.
- [ ] Buyer requirement event works.
- [ ] Owner submission event works.
- [ ] Lead/source attribution reaches the CRM as designed.
- [ ] Analytics contains no unnecessary owner PII.
- [ ] Analytics contains no exact private coordinates.
- [ ] Analytics contains no private document paths.
- [ ] Analytics contains no secrets or auth tokens.
- [ ] Analytics failure cannot roll back durable business state.
- [ ] Production error/health logging is active.
- [ ] Operational health shows configuration state without secret values.
- [ ] Audit logging exists for required sensitive admin mutations.
- [ ] No invasive session replay, covert fingerprinting or unapproved ad pixel is enabled.

---

# 18. Security Audit

- [ ] Final security review has been run against the release build.
- [ ] Dependency/security audit has no unresolved launch-blocking vulnerability.
- [ ] Service-role key is absent from client bundles.
- [ ] Server-only modules are not imported into browser code.
- [ ] Admin authorization checks authenticated identity plus active admin profile.
- [ ] Authenticated non-admin access is denied.
- [ ] Inactive admin access is denied.
- [ ] Direct public writes to protected CRM/application tables are denied.
- [ ] Public forms mutate only through server-owned actions/handlers.
- [ ] Public-safe DTO/projection audit is complete.
- [ ] Owner PII leakage scan passes.
- [ ] Exact-coordinate leakage scan passes.
- [ ] Private-document leakage scan passes.
- [ ] Internal verification-note leakage scan passes.
- [ ] Audit-log leakage scan passes.
- [ ] Unpublished-property leakage scan passes.
- [ ] Sensitive storage object enumeration is denied.
- [ ] Signed private-document URL authorization and expiry are verified.
- [ ] Content rendering is protected against unsafe HTML/XSS.
- [ ] Security headers are present and reviewed, including CSP, content-type, referrer, permissions and frame protections as implemented.
- [ ] Cookies/session settings are secure in production.
- [ ] No secret appears in logs, analytics or error pages.
- [ ] High-risk admin actions require the intended confirmation/authorization path.
- [ ] Security audit evidence/report is attached to the release record.

---

# 19. RLS and Authorization Test Results

RLS proof must test database grants/policies directly; hidden UI controls are not proof.

Required actor contexts:

```text
ANON
AUTHENTICATED_NON_ADMIN
INACTIVE_ADMIN
ACTIVE_ADMIN
SERVER_PRIVILEGED
```

- [ ] CI/schema audit confirms RLS is enabled on every required application table.
- [ ] CI/schema audit fails closed on any newly introduced unprotected table.
- [ ] Anonymous user can read only intended public-safe projections.
- [ ] Anonymous user cannot read leads.
- [ ] Anonymous user cannot read owner/party private fields.
- [ ] Anonymous user cannot read owner submissions.
- [ ] Anonymous user cannot read private documents.
- [ ] Anonymous user cannot read verification evidence.
- [ ] Anonymous user cannot read exact private coordinates.
- [ ] Anonymous user cannot read internal verification notes.
- [ ] Anonymous user cannot read audit logs.
- [ ] Anonymous user cannot read unpublished/private properties.
- [ ] Anonymous direct insert/update/delete against protected business tables is denied.
- [ ] Authenticated non-admin cannot access admin business data.
- [ ] Inactive admin cannot access admin routes/actions/private documents.
- [ ] Active admin can perform only the intended authorized operations.
- [ ] `service_role` is exercised only from trusted test/server paths.
- [ ] Public view/projection definitions use explicit approved columns rather than unsafe `SELECT *` from sensitive evolving base tables.
- [ ] RLS test report is saved with the release record.
- [ ] Any failed RLS/privacy test makes launch `FAIL`.

---

# 20. Form Protection and Abuse Controls

- [ ] Inquiry form validates server-side.
- [ ] Buyer Requirement form validates server-side.
- [ ] Sell Your Land form validates server-side.
- [ ] Site Visit request validates server-side.
- [ ] Contact form validates server-side.
- [ ] Client validation improves UX but is not authoritative.
- [ ] Cloudflare Turnstile or approved equivalent is configured for production where required.
- [ ] Turnstile secret is server-only.
- [ ] Production hostname is accepted by the anti-bot configuration.
- [ ] Server verifies anti-bot response; client completion alone is not trusted.
- [ ] Rate limiting is enabled for public form endpoints/actions.
- [ ] Duplicate-submit protection is present.
- [ ] Idempotency/duplicate behavior has been tested for critical forms.
- [ ] Origin/CSRF protections are applied according to the implemented mutation pattern.
- [ ] Invalid/abusive payloads do not create partial CRM state.
- [ ] File uploads validate type, content, size and authorization server-side.
- [ ] File-type spoofing test passes.
- [ ] Public error messages do not expose internal stack traces, secrets or private identifiers.
- [ ] Anti-bot/provider failure behavior is intentional and does not corrupt saved data.

---

# 21. Email Delivery

- [ ] **[OWNER APPROVAL]** Production email sending is approved before enabling live notifications.
- [ ] Resend production domain is verified.
- [ ] SPF passes.
- [ ] DKIM passes.
- [ ] DMARC policy is present and documented.
- [ ] `EMAIL_FROM` uses the approved production sender.
- [ ] `EMAIL_REPLY_TO` uses the approved address.
- [ ] Inquiry notification is delivered.
- [ ] Buyer requirement notification is delivered.
- [ ] Sell Your Land notification is delivered.
- [ ] Site-visit request notification is delivered.
- [ ] Contact-form notification is delivered.
- [ ] Email content contains enough context to act without leaking unnecessary sensitive data.
- [ ] Email failure does not roll back an already-saved lead/submission/site-visit request.
- [ ] Email provider failure is visible operationally.
- [ ] Production recipient is not a staging/developer address.
- [ ] Provider quota/free-tier limits are documented.
- [ ] No automatic paid upgrade/overage behavior is enabled without **[PAYMENT APPROVAL]**.

---

# 22. Admin Credentials, MFA and Account Recovery

- [ ] Production admin account uses an owner-approved business-controlled email identity.
- [ ] Default/demo password has been replaced.
- [ ] Password is unique and strong.
- [ ] Credentials are not stored in source code, tickets, public docs or chat logs intended as project artifacts.
- [ ] MFA is enabled where the provider/product supports it and is operationally practical.
- [ ] Supabase/hosting/DNS/email-provider accounts have MFA enabled where applicable.
- [ ] Backup/recovery codes are stored securely under owner control where providers issue them.
- [ ] At least one owner-controlled recovery route exists.
- [ ] Developer is not the sole account owner/recovery contact.
- [ ] Former/test admin access is removed or explicitly disabled.
- [ ] Inactive admin profile test passes.
- [ ] Admin logout/session-expiry behavior is tested.
- [ ] Admin route cannot be accessed anonymously.
- [ ] Private document access fails for unauthenticated/non-admin actors.
- [ ] Credential rotation procedure is documented.
- [ ] Secret/account recovery procedure identifies who can restore access if the primary admin loses credentials.

---

# 23. Performance Readiness

- [ ] Production build is reproducible from a clean checkout.
- [ ] `npm ci` succeeds.
- [ ] Lint passes.
- [ ] Typecheck passes.
- [ ] Test suite passes.
- [ ] Production build passes.
- [ ] Lighthouse/performance report is recorded for representative public pages.
- [ ] No critical LCP/INP/CLS regression remains against the accepted baseline.
- [ ] Core property/listing content is server-rendered.
- [ ] Full property dataset is not shipped to the browser.
- [ ] Images use responsive sizing/loading.
- [ ] Primary hero/cover image loading is intentional.
- [ ] Heavy map/media integrations do not block primary content.
- [ ] Search query performance is acceptable on scaled synthetic data.
- [ ] No unbounded production query is known.
- [ ] Results pagination does not fetch an unnecessary full inventory.
- [ ] Mobile network/CPU behavior is acceptable for the launch experience.
- [ ] No known free-tier quota risk makes normal launch traffic immediately unsafe.

---

# 24. Mobile QA

Test at the architecture's representative breakpoints and real mobile interaction patterns.

- [ ] Mobile header/menu works.
- [ ] Mobile menu is keyboard/screen-reader operable where applicable.
- [ ] Homepage search stacks correctly.
- [ ] Search filters open/close correctly in mobile sheet.
- [ ] Filter sheet scrolls without trapping content.
- [ ] Filter `Clear` and `Apply` actions remain reachable.
- [ ] Listing cards render without clipped information.
- [ ] Property detail is readable as a single-column flow.
- [ ] Property detail CTA/sticky action does not cover content or form fields.
- [ ] WhatsApp action works on mobile.
- [ ] Call action works on mobile.
- [ ] Inquiry form is usable on mobile.
- [ ] Site-visit form is usable on mobile.
- [ ] Buyer requirement form is usable on mobile.
- [ ] Sell Your Land multi-step flow is usable on mobile.
- [ ] Keyboard opening does not hide critical form actions.
- [ ] Gallery swipe/tap behavior works.
- [ ] Map is usable without blocking page scrolling.
- [ ] Critical admin lead/submission/site-visit/property-status workflows remain usable on mobile.
- [ ] No unintended horizontal page overflow exists at required viewports.

---

# 25. Accessibility QA

- [ ] Axe/core automated accessibility suite has no unresolved serious/critical violation.
- [ ] Keyboard-only navigation works for core public routes.
- [ ] Keyboard-only navigation works for core admin routes.
- [ ] Visible focus states exist.
- [ ] Heading order is meaningful.
- [ ] Form inputs have associated labels.
- [ ] Required fields are communicated accessibly.
- [ ] Validation errors are associated/announced.
- [ ] Error summary/focus behavior works on long forms.
- [ ] Dialogs, lightboxes and filter sheets manage focus correctly.
- [ ] Escape/close controls work where appropriate.
- [ ] Icon-only controls have accessible names.
- [ ] Status is not communicated by color alone.
- [ ] Text and control contrast meets the accepted accessibility baseline.
- [ ] Touch targets are usable.
- [ ] Images have appropriate alt text or are intentionally decorative.
- [ ] Reduced-motion preference is respected.
- [ ] No critical content is inaccessible before hydration.
- [ ] Final manual accessibility QA evidence is attached to the release record.

---

# 26. Public UX and Conversion Smoke

Before domain cutover, run on the production technical URL:

- [ ] Home loads.
- [ ] Agricultural category loads.
- [ ] NA category loads.
- [ ] Industrial category loads.
- [ ] Buy/Rent/Lease discovery behavior works.
- [ ] Search results load.
- [ ] Filters work.
- [ ] Sorting works.
- [ ] Pagination preserves URL state.
- [ ] Property ID search works.
- [ ] Representative Agricultural property loads.
- [ ] Representative NA property loads.
- [ ] Representative Industrial property loads.
- [ ] `Price on Request` property displays correctly.
- [ ] Exact-location property behaves correctly if any are approved.
- [ ] Approximate-location property behaves correctly.
- [ ] Hidden-location property behaves correctly.
- [ ] Sold/Rented/Leased state behaves correctly.
- [ ] Inquiry creates the correct CRM record.
- [ ] WhatsApp click uses the correct number/context.
- [ ] Call click uses the correct number.
- [ ] Buyer requirement creates the correct CRM record.
- [ ] Site visit creates a request, not an automatic confirmation.
- [ ] Sell Your Land creates a private submission, not a public property.
- [ ] Contact form works.
- [ ] 404 works.
- [ ] Empty search state offers requirement capture.
- [ ] External video/drone/360/brochure failure does not break the page.

---

# 27. Admin Operational Smoke

- [ ] Admin login works.
- [ ] Dashboard loads.
- [ ] Property list loads.
- [ ] Property create/edit draft works.
- [ ] Publication validation blocks incomplete property.
- [ ] Approved property can be published.
- [ ] Property can be unpublished.
- [ ] Availability can be updated.
- [ ] Closed property public state updates correctly.
- [ ] Media upload/reorder/cover selection works.
- [ ] Private documents remain private.
- [ ] Owner submission queue works.
- [ ] Submission status changes work.
- [ ] Submission conversion creates a draft property without auto-publishing.
- [ ] Verification workflow saves scoped evidence/status/reviewer/date.
- [ ] Lead inbox works.
- [ ] Lead stage changes work.
- [ ] Lead activity timeline records required events.
- [ ] Buyer requirement matching works.
- [ ] Site-visit status workflow works.
- [ ] Guide/content workflow works for approved content.
- [ ] SEO landing-page controls work.
- [ ] Settings show correct business contact information.
- [ ] Audit trail records required sensitive changes.

---

# 28. Provider and Cost Approval Gate

The intended V1 baseline is cost-conscious/free-tier where reasonably possible.

- [ ] Current provider plans and commercial-use terms have been rechecked before launch.
- [ ] Provider quotas are documented.
- [ ] Automatic charge behavior is documented.
- [ ] No provider has been silently switched to a paid plan.
- [ ] No billing/payment method has been attached without approval.
- [ ] No paid Google Maps Platform API or other unapproved paid map dependency is active.
- [ ] No unapproved paid search, analytics, monitoring, storage, email, SMS or WhatsApp API dependency is active.
- [ ] **[PAYMENT APPROVAL] [OWNER APPROVAL]** Any paid upgrade/provider activation is explicitly approved before activation.
- [ ] **[PAYMENT APPROVAL] [OWNER APPROVAL]** Any billing method attachment or automatic recharge/overage setting is explicitly approved before activation.
- [ ] If no payment approval exists, the launch configuration remains within the approved zero-cost baseline.
- [ ] Provider-limit documentation records provider, plan, price, quota, commercial-use status, billing behavior, SLA/backup caveat, last verification date and upgrade trigger.

---

# 29. Production-Only Approval Gate

The following must not happen silently.

- [ ] **[OWNER APPROVAL]** Create/activate production infrastructure.
- [ ] **[OWNER APPROVAL]** Connect the real production domain.
- [ ] **[OWNER APPROVAL]** Change authoritative DNS.
- [ ] **[OWNER APPROVAL]** Apply production database migrations.
- [ ] **[OWNER APPROVAL]** Insert/import real production property inventory.
- [ ] **[OWNER APPROVAL]** Upload real private owner/legal documents.
- [ ] **[OWNER APPROVAL]** Enable production email sending.
- [ ] **[OWNER APPROVAL]** Publish/cut over the public website.
- [ ] **[OWNER APPROVAL] [PAYMENT APPROVAL]** Upgrade a provider or enable a paid feature.
- [ ] **[OWNER APPROVAL] [PAYMENT APPROVAL]** Attach billing/payment details.
- [ ] **[DESTRUCTIVE-PRODUCTION APPROVAL]** Run destructive production migrations.
- [ ] **[DESTRUCTIVE-PRODUCTION APPROVAL]** Delete or mass-overwrite production business data.
- [ ] **[DESTRUCTIVE-PRODUCTION APPROVAL]** Restore a backup over current production data.
- [ ] **[DESTRUCTIVE-PRODUCTION APPROVAL]** Perform irreversible anonymization/retention deletion.
- [ ] **[DESTRUCTIVE-PRODUCTION APPROVAL]** Delete production storage objects in bulk.
- [ ] Approval records include approver, date/time, action, environment and affected release/migration identifier.

---

# 30. Final Pre-Cutover GO / NO-GO

All must be true immediately before public cutover:

- [ ] Definition of Done is `PASS`.
- [ ] Staging/full production-technical-URL smoke is `PASS`.
- [ ] Real inventory is approved.
- [ ] Business contact details are approved.
- [ ] Legal text is approved.
- [ ] Verification wording has **[QUALIFIED COUNSEL APPROVAL]**.
- [ ] Owner consent wording has required legal/business approval.
- [ ] Production environment variables are complete.
- [ ] Dedicated Supabase production project is healthy.
- [ ] Migrations are approved and applied.
- [ ] RLS/storage policies are applied.
- [ ] RLS test results are green.
- [ ] Security audit is green.
- [ ] Backup/export exists.
- [ ] Restore procedure has been tested.
- [ ] Rollback build/procedure is identified.
- [ ] Public/private storage boundaries are verified.
- [ ] Real assets are loaded.
- [ ] Demo/test data is absent.
- [ ] Email delivery is verified.
- [ ] Form protection is verified.
- [ ] Admin credentials/recovery/MFA checks are complete.
- [ ] SEO metadata is final.
- [ ] `robots.txt` is final.
- [ ] `sitemap.xml` is final.
- [ ] Search Console ownership path is ready.
- [ ] Analytics is configured.
- [ ] Performance validation is acceptable.
- [ ] Mobile QA is `PASS`.
- [ ] Accessibility QA is `PASS`.
- [ ] DNS rollback data is recorded.
- [ ] No unapproved paid service/billing is active.
- [ ] **[OWNER APPROVAL]** Explicit production launch approval is recorded.

**If any item above is not `PASS`, launch status is `HOLD` or `FAIL`.**

---

# 31. Exact Launch Sequence

1. Confirm release commit/build.
2. Confirm pre-launch backup/export.
3. Confirm owner launch approval.
4. Confirm no unresolved security/privacy/legal blocker.
5. Confirm migration state and schema version.
6. Confirm production site is healthy on technical URL.
7. Confirm production email, Turnstile, maps and analytics.
8. **[OWNER APPROVAL]** Apply final production data/inventory changes if any.
9. **[OWNER APPROVAL]** Perform DNS/custom-domain cutover.
10. Verify TLS and canonical redirects.
11. Verify public homepage/results/property pages.
12. Verify one approved safe form submission.
13. Verify email delivery.
14. Verify admin login and anonymous denial.
15. Verify private document remains private.
16. Verify canonical/robots/sitemap on the public domain.
17. Verify analytics reception.
18. Record production deployment identifier, DNS state and launch timestamp.
19. Move release status to `LIVE — MONITORING`.
20. Begin post-launch smoke and monitoring immediately.

---

# 32. Immediate Post-Launch Smoke

Use only safe production checks; do not create unnecessary real customer/business data.

## Public

- [ ] Canonical homepage loads over HTTPS.
- [ ] `www`/apex redirect behaves as approved.
- [ ] Results load.
- [ ] Representative live property loads.
- [ ] Representative closed property has correct Sold/Rented/Leased behavior.
- [ ] Approximate/hidden location remains private.
- [ ] Public media loads.
- [ ] WhatsApp uses the correct production number.
- [ ] Call uses the correct production number.
- [ ] Contact details are correct everywhere checked.
- [ ] One approved safe production form test succeeds.
- [ ] Email notification arrives.
- [ ] Turnstile/anti-bot is accepted.
- [ ] Map/provider loads or gracefully degrades.
- [ ] No visible demo/test data appears.

## Admin/security

- [ ] Admin login works.
- [ ] Anonymous `/admin` access fails.
- [ ] Anonymous private-document access fails.
- [ ] Private exact coordinates are absent from anonymous responses.
- [ ] No unexpected P0/P1 error is present in production logs/health.
- [ ] Audit record appears for any sensitive launch-time admin mutation.

## SEO/analytics

- [ ] Canonical is correct.
- [ ] `robots.txt` is correct.
- [ ] `sitemap.xml` is correct.
- [ ] Representative sitemap URLs return canonical indexable 200 responses.
- [ ] Analytics receives expected test events.
- [ ] Search Console domain verification is completed.
- [ ] Sitemap is submitted to Search Console.

---

# 33. Recovery Procedure

The production recovery runbook must contain at least:

```text
1. Identify incident and severity.
2. Freeze further risky production mutations.
3. Preserve logs/evidence.
4. Determine whether application rollback alone is sufficient.
5. Determine whether database forward-fix is safer than restore/down-migration.
6. Confirm latest safe backup and its timestamp.
7. Obtain required approval before destructive recovery.
8. Restore/redeploy.
9. Re-run security/privacy/RLS smoke checks.
10. Re-run public conversion smoke checks.
11. Re-run canonical/robots/sitemap checks where domain/deploy changed.
12. Verify email/analytics/provider configuration.
13. Record incident, action, data impact and final state.
```

- [ ] Recovery runbook is accessible to the authorized operator.
- [ ] Recovery does not depend on one developer's personal account.
- [ ] Backup location/access is known.
- [ ] Last-known-good build is known.
- [ ] DNS rollback state is known.
- [ ] Provider recovery contacts are known.
- [ ] **[DESTRUCTIVE-PRODUCTION APPROVAL]** Restore-over-live, destructive down-migration, mass deletion or mass overwrite cannot proceed without explicit approval.
- [ ] Recovery success criteria include privacy/RLS validation, not merely "site loads."

---

# 34. Ongoing Operations Activated at Launch

## Weekly

- [ ] Production DB logical backup.
- [ ] Inspect Supabase database/storage usage.
- [ ] Inspect Netlify usage/credits.
- [ ] Inspect email usage/quota.
- [ ] Inspect error/notification failures.

## Monthly

- [ ] Restore-test latest backup.
- [ ] Verify DNS.
- [ ] Verify TLS.
- [ ] Review admin accounts.
- [ ] Review MFA/recovery access.
- [ ] Review Turnstile usage.
- [ ] Review analytics.
- [ ] Review dependency/security updates.
- [ ] Review provider terms/free-tier limits.

## Quarterly

- [ ] Provider commercial-terms review.
- [ ] Cost/upgrade trigger review.
- [ ] Disaster-recovery rehearsal.
- [ ] Secret-rotation assessment.
- [ ] Domain ownership/access review.

---

# 35. Approval Register

Complete before release.

| Approval | Required approver | Status | Evidence / reference |
|---|---|---|---|
| Production infrastructure | UrbanEdge owner |  |  |
| Real launch inventory | UrbanEdge owner |  |  |
| Public business contact details | UrbanEdge owner |  |  |
| Canonical domain choice | UrbanEdge owner |  |  |
| Authoritative DNS change | UrbanEdge owner |  |  |
| Production DB migration | UrbanEdge owner |  |  |
| Destructive production migration, if any | Authorized destructive-production approver |  |  |
| Real private document upload | UrbanEdge owner |  |  |
| Production email sending | UrbanEdge owner |  |  |
| Terms / Privacy / Disclaimer | UrbanEdge owner + qualified counsel as required |  |  |
| Public verification labels/explanations | Qualified Gujarat property counsel + UrbanEdge owner |  |  |
| Owner consent wording | Qualified counsel + UrbanEdge owner |  |  |
| Paid provider/feature, if any | Authorized payment approver + UrbanEdge owner |  |  |
| Billing/payment method, if any | Authorized payment approver + UrbanEdge owner |  |  |
| Production publication/cutover | UrbanEdge owner |  |  |
| Destructive rollback/restore, if required | Authorized destructive-production approver |  |  |

---

# 36. Final Sign-Off

## Technical release

- [ ] Release commit/build:
- [ ] Production deployment ID:
- [ ] Production migration version:
- [ ] Backup reference:
- [ ] Rollback deployment/build:
- [ ] RLS test report:
- [ ] Security audit report:
- [ ] Accessibility report:
- [ ] Performance report:
- [ ] Mobile QA record:
- [ ] Production smoke record:

## Business/legal release

- [ ] Inventory approval record:
- [ ] Contact-details approval record:
- [ ] Legal text approval record:
- [ ] Qualified-counsel verification-wording approval record:
- [ ] Owner consent approval record:
- [ ] Domain/DNS approval record:
- [ ] Production launch approval record:
- [ ] Payment approval record, if applicable:
- [ ] Destructive-production approval record, if applicable:

---

# 37. Final Decision

Choose exactly one:

## `PASS — APPROVED FOR PRODUCTION`

Use only when every mandatory item is `PASS` or explicitly `N/A — APPROVED`, all required human approvals are recorded, and no unresolved security, privacy, legal, migration, backup, data-integrity, accessibility, performance, SEO or operational blocker remains.

## `HOLD — DO NOT LAUNCH`

Use when there is no known active critical security leak but one or more mandatory approvals/validations remain incomplete, including:

- owner approval;
- qualified-counsel approval;
- migration approval;
- backup/restore validation;
- RLS/security results;
- email/domain/provider configuration;
- mobile/accessibility/performance QA;
- Search/SEO production validation.

## `FAIL — DO NOT LAUNCH`

Use for any launch-blocking defect, including:

- production build failure;
- migration uncertainty or unapproved destructive migration;
- RLS failure;
- admin authorization bypass;
- owner-PII leakage;
- private-document leakage;
- exact-location leakage;
- unsafe public verification/legal claim;
- invalid owner consent implementation;
- real/demo data contamination;
- missing recovery capability;
- corrupted or unverified backup;
- uncontrolled indexing;
- misleading availability state;
- accidental paid-service/billing activation;
- inability to identify a safe rollback target.

**UrbanEdge Land Space is not production-ready until this checklist reaches `PASS — APPROVED FOR PRODUCTION`.**
