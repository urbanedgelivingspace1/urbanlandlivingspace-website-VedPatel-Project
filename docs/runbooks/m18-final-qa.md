# M18 Final QA and Release Qualification

## Disposition

**M18: PASS.** Every locally verifiable MUST PASS criterion succeeded from a clean, isolated test state. There is no open local product, security, privacy, data-integrity, test-isolation or build blocker. Checks that require a deployed environment, real provider credentials, owner-controlled production data, professional approval or physical devices are explicitly transferred to M19/pre-launch below.

This is an M18 engineering qualification, not a production-readiness or launch approval. M19 has not begun and no production operation was performed.

## Qualified build and environment

| Item | Evidence |
|---|---|
| Application source under test | `6b112b8d0f90c599fd2953489453b6be5c2a4781` (`docs: record M17 completion handoff`) |
| Branch | `main` |
| Qualification date | 2026-09-07 |
| Host | Local macOS arm64 workstation |
| Runtime | Node.js `24.14.0`; npm `11.9.0`; supported by the repository engine range |
| Framework | Next.js `16.3.4`, production webpack build |
| Database tooling | Supabase CLI `2.104.0`; Docker `29.7.2` |
| Isolation | Dedicated disposable local Supabase stack on loopback ports `55320`–`55327`; synthetic fixtures and synthetic admin only |
| Configuration | Repository `.env.example` plus test-only injected local values; no `.env.local`, production credentials, real customer data or paid provider activation |

`npm ci` installed 510 locked packages successfully. `supabase db reset` rebuilt all 17 migrations in order and applied the repeatable seed. The application then built and started with the documented npm commands. No uncommitted source, manually created bucket, prior database row or production-shaped environment was required.

## Complete automated evidence

| Gate | Result | Evidence |
|---|---|---|
| Lockfile install | PASS | `npm ci`; 510 packages installed |
| Clean database rebuild | PASS | All 17 migrations and seed applied from zero |
| Database lint | PASS | `supabase db lint --level warning`; no errors |
| Database/RLS/storage/privilege suite | PASS | 15 pgTAP files; **600 assertions** |
| Property ID concurrency | PASS | 24 parallel inserts; 24 distinct immutable IDs |
| Unit | PASS | 22 files; **147 tests** |
| Component | PASS | 15 files; **55 tests** |
| Guarded integration | PASS | 12 files; **52 tests** |
| Guarded E2E | PASS | **56 Chromium scenarios** in the definitive full run |
| Lint | PASS | ESLint |
| Formatting | PASS | Prettier check |
| Strict TypeScript | PASS | `tsc --noEmit` |
| Server/client boundary | PASS | 17 client entries inspected |
| Secret scanning | PASS | 403 current files plus reachable Git history after the QA report was added |
| Test safety | PASS | 5 guard tests; production-shaped targets rejected |
| Dependency audit | PASS | `npm audit --audit-level=high`; 0 vulnerabilities |
| Production build | PASS | Next.js 16.3.4 webpack build; client-output secret scan passed |

The full E2E run covers the integrated buyer, requirement, visit, owner, admin inventory, CRM and content journeys rather than isolated pages. Database assertions cover the supporting transactions, constraints, transitions, RLS, grants, projections, storage boundaries and privacy invariants.

## Definition-of-Done reconciliation

The authoritative Definition of Done contains 702 numbered criteria. The ranges below are exhaustive: every identifier in each inclusive range inherits the recorded result. `PASS` means the criterion has local code/test/build/manual evidence or the product safely disables the unconfigured capability. `BLOCKED / REQUIRES EXTERNAL VALIDATION` means the implementation boundary is present but the acceptance evidence can only be produced in M19/staging/pre-launch. No criterion is silently treated as satisfied.

| Criteria | Result | M18 evidence or transfer |
|---|---|---|
| `ARCH-001`–`ARCH-028` | PASS | Modular-monolith boundaries, server ownership, route/data maps, adapter boundaries and five accepted ADRs reviewed; no new contradiction |
| `PUB-001`–`PUB-049` | PASS | Publication, availability, archive, projection and public-detail database/integration/E2E coverage |
| `SEARCH-001`–`SEARCH-021` | PASS | PostgreSQL provider, URL state, bounded filters/sorts/pagination, closed inventory and noindex search coverage |
| `DATA-001`–`DATA-022` | PASS | Clean migration, constraint, trigger, seed, identifier and cross-domain integrity evidence |
| `ADMIN-001`–`ADMIN-040` | PASS | Active-admin authorization and complete protected inventory/content/CRM/visit/submission workflows |
| `DB-001`–`DB-024` | PASS | Zero-state rebuild, lint, 600 assertions, actual object inventory and concurrency run |
| `RLS-001`–`RLS-022` | PASS | Forced RLS, deny-by-default grants, actor matrix and hostile REST/RPC/storage checks |
| `PRIV-001`–`PRIV-022` | PASS | Public DTO/projection scans and browser-output/privacy regression across HTML, RSC, metadata, JSON-LD and sitemap |
| `SEC-001`–`SEC-003` | PASS | Validation, authorization and secret/client-boundary controls |
| `SEC-004` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Production Turnstile key/hostname verification belongs to M19; local/test bypass is explicit and production fails closed |
| `SEC-005`–`SEC-008` | PASS | Origin, Fetch Metadata, rate/replay, upload and request-bound tests |
| `SEC-009` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Deployed TLS/HSTS and observed edge CSP require staging/production; environment-aware header tests pass locally |
| `SEC-010`–`SEC-015` | PASS | Cookies, redirects, errors, dependency audit, scans and hostile-path coverage |
| `SEC-016` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Production health/readiness observation requires deployed infrastructure; local safe health behavior passes |
| `SEC-017` | PASS | Security evidence and residual gates are documented in the M17 and M18 runbooks |
| `CRM-001`–`CRM-024` | PASS | Twelve-stage pipeline, parties, opportunities, requirements, matches, activities, follow-ups and closure evidence |
| `REQ-001`–`REQ-008` | PASS | Public requirement to private CRM journey, validation, consent and matching evidence |
| `SELL-001`–`SELL-023` | PASS | Private multipart owner flow, documents, review, provenance and Draft-only conversion evidence |
| `VISIT-001`–`VISIT-013` | PASS | REQUESTED-only public intake and protected contact/propose/confirm/outcome/follow-up workflow evidence |
| `VER-001`–`VER-029` | PASS | Scoped checks, evidence provenance, professional-review model and disabled unapproved public copy |
| `VER-030` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Final Gujarat property-lawyer approval of public wording is pre-launch; without it, copy remains disabled |
| `MEDIA-001`–`MEDIA-034` | PASS | Hosted/external locators, private documents, transformation, approval, quota and failure controls |
| `SEO-001`–`SEO-004` | PASS | Metadata, canonical construction, robots and sitemap tests |
| `SEO-005` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Canonical-host redirects require the selected deployed host/domain |
| `SEO-006`–`SEO-026` | PASS | Indexability gates, noindex search, breadcrumbs, redirects and accurate structured-data tests |
| `SEO-027` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Staging must remain noindex and excluded from production sitemap |
| `SEO-028`–`SEO-031` | PASS | Local 404, closed-property, guide and crawl-boundary evidence |
| `SEO-032` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Final production editorial/professional review requires approved real content |
| `SEO-033` | PASS | Local SEO evidence is recorded below |
| `OBS-001`–`OBS-018` | PASS | Privacy-minimized audits, workflow histories, provider outcomes and safe error/log tests |
| `OBS-019`–`OBS-020` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Deployed health checks and launch log review require M19 infrastructure |
| `RESP-001`–`RESP-014` | PASS | Exact-width responsive suites plus Chromium/WebKit smoke; no overflow or inaccessible actions found |
| `PERF-001`–`PERF-002` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Staging-equivalent and field LCP/INP evidence is required; local synthetic results are recorded below |
| `PERF-003`–`PERF-013` | PASS | Bounded SSR queries/results, image behavior, pagination and production build checks |
| `PERF-014` | PASS | Local performance report and staging transfer are recorded below |
| `TEST-001`–`TEST-012` | PASS | Full clean-state static, unit, component, database, integration, E2E, security and isolation matrix |
| `TEST-013` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Full staging smoke requires M19 deployment |
| `TEST-014`–`TEST-058` | PASS | Critical journeys, hostile paths, responsive/accessibility, recovery and regression coverage |
| `BUILD-001`–`BUILD-009` | PASS | Clean lockfile install, environment validation, build, start and artifact scans |
| `BUILD-010`–`BUILD-011` | PASS | Qualified source commit and release evidence are identified |
| `BUILD-012` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Preview/staging deploy is an M19 operation |
| `DOC-001`–`DOC-013` | PASS | README, local runbook, ledger, handoff, ADRs, security/QA runbooks and environment example reconciled |
| `DOC-014` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Owner-controlled production ownership/access record requires M19 infrastructure |
| `DOC-015`–`DOC-020` | PASS | Deployment, backup, rollback, provider, privacy and incident requirements are documented |
| `DOC-021` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Legal approval evidence remains owner/professional controlled |
| `DOC-022`–`DOC-023` | PASS | Placeholder/pre-launch register and M18 tested-build record are current |
| `INFRA-001`–`INFRA-007` | PASS | Dedicated-project/configuration/adapter design and local isolation are implemented |
| `INFRA-008`–`INFRA-023` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Hosting, DNS, TLS, production providers, budgets and environment controls require M19/pre-launch |
| `BACKUP-001` | PASS | Source-of-truth migration/seed strategy is tested from zero |
| `BACKUP-002`–`BACKUP-017` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Encrypted production backup, restore drill, retention and ownership evidence require real infrastructure |
| `ROLL-001`–`ROLL-005` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Deployed release/rollback artifacts require M19 |
| `ROLL-006` | PASS | Migrations are forward-only and were rebuilt from zero |
| `ROLL-007` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Hosting rollback execution requires staging |
| `ROLL-008`–`ROLL-010` | PASS | Application preserves safe feature/provider degradation and data boundaries |
| `ROLL-011`–`ROLL-018` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Operational rehearsal, owners and production communications require M19/pre-launch |
| `LEGAL-001`–`LEGAL-007` | PASS | Current public content avoids guarantees, auto-verification, unsupported claims and unsafe consent behavior |
| `LEGAL-008`–`LEGAL-010` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Final professional copy review and owner acceptance require approved production content |
| `STAGE-001`–`STAGE-027` | BLOCKED / REQUIRES EXTERNAL VALIDATION | These criteria expressly require an M19 staging environment |
| `PROD-001`–`PROD-018` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Production provisioning and approval were intentionally not performed |
| `LIVE-001`–`LIVE-020` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Launch/cutover observation requires explicit later approval |
| `REC-001`–`REC-018` | BLOCKED / REQUIRES EXTERNAL VALIDATION | Post-launch recommended checks cannot occur before launch; retained as recommended operational work |

M18's Definition-of-Done result is therefore **PASS for the local release-qualification scope**, with every external criterion transferred rather than assumed. The complete product Definition of Done remains open until the transferred criteria are evidenced in their designated stage.

## Whole-system journeys and invariants

| Journey | Result | Evidence |
|---|---|---|
| Buyer discovery | PASS | Home/category/search/filter/property/inquiry E2E; published-safe projections and canonical URL state |
| Buyer requirement | PASS | Zero-result/search context to requirement submission and private CRM persistence |
| Site visit | PASS | Property request to CRM queue, contacted, proposed, confirmed, completed and separate follow-up |
| Owner flow | PASS | Multipart submission/documents, admin review/approval, one Draft conversion, verification and publication-readiness evaluation |
| Admin inventory | PASS | Create, media, verification, gated publish, public page, availability, unpublish and archive |
| CRM | PASS | Lead, requirement, match, follow-up, visit, negotiation and won/lost closure |
| Content | PASS | Guide draft, preview, publish, public canonical route and unpublish |

Cross-milestone assertions explicitly pass: owner submissions never auto-publish; owner claims never auto-verify; public visit intake never auto-confirms; publication always uses the M9 gate; unapproved verification copy remains disabled; unpublished inventory, private coordinates, CRM, evidence, documents, notes and audit data do not enter public outputs; closed properties cannot appear Available; search consumes published-safe inventory; arbitrary filters remain noindex.

## Public, admin, form and recovery QA

The 56-scenario E2E suite exercises all public route families, all protected admin domains and every business-critical form. It covers populated/empty/error states, canonical navigation, media fallbacks, disabled configuration, validation, maximum/request bounds, malformed values, duplicate/replay protection, stale writes, keyboard operation, responsive behavior, focus/error feedback and recoverable value preservation.

Failure tests confirm durable CRM/submission state survives absent or failed notification delivery, with `SKIPPED`/bounded failure outcomes and no replay duplication. Turnstile and malware scanning fail closed outside local/test when required configuration is absent. Invalid routes/search state, media/external-video failure, map configuration absence, database/service errors and malicious redirect inputs produce bounded safe behavior without leaking internals. Operational workflow events retain actor attribution while security audits remain privacy-minimized.

Manual semantic review of the production-built homepage confirmed primary navigation, one clear H1, search form labeling, category and featured-property links, meaningful section headings, footer and legal navigation. No manual production-data mutation was needed.

## Responsive, accessibility and browser qualification

Existing exact-width E2E coverage spans **320, 375, 390, 430, 768, 1024, 1440 and 1728 px** across home, search, property detail, public forms, guides/locations, inventory, CRM, visits and owner submissions. Assertions cover horizontal overflow, sticky/action visibility, dialogs, tables/navigation and mobile keyboard flows.

Automated axe checks and component/E2E assertions cover landmarks, headings, labels, error association, focus management, dialogs, status messaging, alt text, breadcrumbs and keyboard operation. Manual semantic/keyboard-oriented review supplements axe; no conversion-blocking WCAG 2.2 AA issue was found.

Chromium is the primary full E2E target. A separate production-build smoke passed in headless **Chromium and WebKit** for 13 representative routes at 390 and 1728 px, including a published property, eligible site-visit route, protected-admin redirect and true 404. Real Safari/iOS/Android device coverage remains a pre-launch external check.

## Performance and SEO

Lighthouse `13.4.1` ran against the production build with local synthetic data:

| Page | Perf | A11y | Best Practices | SEO | FCP | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Home | 92 | 100 | 100 | 100 | 1.52 s | 3.28 s | 0 | 33 ms |
| Properties | 93 | 100 | 100 | 100 | 1.36 s | 3.13 s | 0 | 36 ms |
| Location/category | 94 | 100 | 100 | 69 | 1.36 s | 2.98 s | 0 | 34 ms |
| Property detail | 94 | 100 | 100 | 100 | 1.36 s | 3.01 s | 0 | 36 ms |
| Guide | 97 | 100 | 100 | 100 | 1.06 s | 2.66 s | 0 | 55 ms |

Two repeat home samples were Performance 93 with LCP 3.09 s, making the three-sample median 3.09 s. The location SEO score reflects its intentional `noindex` quality gate, not a missing tag. No critical performance regression or blocking long task/CLS issue was found, but local LCP remains above the 2.5 s field target. Staging/CDN/approved-image measurement and field monitoring are mandatory M19/pre-launch evidence. A non-blocking follow-up is to review render-blocking CSS around the hero H1 after representative production media is available.

Automated and manual evidence verifies titles/descriptions, canonicals, Open Graph, accurate JSON-LD, breadcrumbs, robots, bounded sitemap, property/guide/location indexability, filtered-search noindex, closed-property semantics, redirect history and true 404 responses. No private route, crawl trap, fabricated rating/review or unsupported verification/legal claim was found.

## Database and code-quality review

Actual post-migration public-schema inventory:

- 64 application tables, all with RLS enabled and forced;
- 15 views, including the internal non-browser search projection;
- 181 indexes and 7 sequences;
- 32 enum types;
- 71 functions, including 58 `SECURITY DEFINER` functions;
- 57 non-internal triggers;
- 95 RLS policies;
- 14 anonymous-readable public projections;
- one anonymous executable RPC (`search_public_properties()`), with authenticated access additionally limited to `is_active_admin()`.

No orphan application table, obsolete public mutation function, unexpected browser privilege, migration drift or legacy visit-follow-up state was found. One benign redundant index pair exists on `property_verifications(property_id, check_definition_id)`: the non-unique helper index duplicates the column order of the unique constraint index. Removing it is a **RECOMMENDED**, non-blocking future migration after query-plan review; M18 does not add schema risk for this cleanup.

A focused repository scan found no application `TODO`, `FIXME`, `HACK`, `console.log`, `debugger`, experimental authorization bypass or test-only production path. No broad cosmetic refactor was undertaken. Documentation scope/instructions found during QA were corrected. No application bug, schema migration or ADR was required in M18.

## Flaky-test finding

The first complete E2E attempt passed 55 of 56 scenarios. Kong logs showed the remaining M7 property-readiness request received one upstream PostgREST connection reset and returned 502; the database and container remained healthy, with no restart, OOM or product crash. The UI displayed the intended generic safe recovery error. The focused M7 suite then passed 2/2; after restarting only the disposable local PostgREST container, the definitive full suite passed 56/56 with unchanged assertions and zero local retries.

Classification: **local test-infrastructure transient**, not a product defect. The safe failure state was confirmed. Retain serial stateful E2E execution and investigate if the reset recurs in CI/staging.

## Configuration and provider audit

Environment validation centrally covers application mode, canonical origin, Supabase public/server credentials, contact/WhatsApp settings, Turnstile, Resend, map provider/style, analytics and test-target safety. Storage buckets/limits are migration/config owned; server-only credentials are separated and scanned from client output. Missing local contact/map/media/provider configuration renders an honest disabled/degraded state. Production validation remains fail-closed where security depends on a provider.

No real email was sent. Notification absence is recorded after the durable transaction and cannot duplicate/undo CRM or submission state. No production malware scanner was activated; local tests verify the adapter and fail-closed production boundary, while operational scanner configuration remains pre-launch required.

## Issue classification and M19 transfer

### Blockers

None.

### Pre-launch required

- create and verify the separate staging/production Supabase/Auth/Storage environments;
- deploy staging, keep it noindex and run the full staging smoke/authorization/privacy suite;
- verify deployed TLS, HSTS, CSP/reporting, cookies, health/readiness and edge logs;
- configure and verify production Turnstile hostname/action, Resend identity/delivery and the approved malware scanner;
- complete encrypted backup plus restore and rollback rehearsals;
- approve and configure canonical domain, DNS, callbacks, contact destinations, map/style attribution and privacy-safe analytics;
- replace/approve synthetic inventory, media, business settings and brand lockup using the pre-launch register;
- obtain qualified Gujarat property-lawyer approval for public verification/legal/consent wording;
- measure staging Lighthouse on deployment-equivalent media/CDN and establish production field LCP/INP monitoring;
- complete real Safari/iOS/Android device checks and owner acceptance;
- obtain every explicit production migration, deployment, data-import, provider and launch approval before acting.

### Recommended

- review removal of the redundant non-unique property-verification index in a future approved migration;
- watch for another local PostgREST connection reset in CI/staging before treating the transient as systemic;
- profile render-blocking hero CSS with approved production media after staging exists.

## Change record and final gate

- Bugs found/fixed: no application defect; two stale documentation statements corrected.
- Schema/migration changes: none.
- ADRs created: none.
- Production operations: none.
- M19: not begun.

M18 is complete when this report, the implementation ledger and the handoff are committed and the working tree is clean. The final commit identifiers and clean-tree confirmation are recorded in the handoff/final completion response.
