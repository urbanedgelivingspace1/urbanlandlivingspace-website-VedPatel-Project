# M17 Security Hardening and Privacy Regression Closure

**Status:** complete locally on 6 September 2026

**Scope:** engineering security review of the M0–M16 application and isolated local Supabase stack

**Not a certification:** this is not an external penetration test or legal/privacy certification.

## Outcome

M17 closes inherited browser grants, forces RLS on every application table, narrows function execution, hardens browser/request/session controls, adds hostile-path regression coverage and exposes a safe admin-only readiness view. No production system was accessed or changed.

## Findings and fixes

| Surface | Finding | Resolution |
|---|---|---|
| Table authorization | All 64 application tables had RLS, but 63 did not force it. | All 64 now use `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`; the active-admin read policy remains on all 64. |
| Default privileges | Supabase defaults could grant future public-schema objects to browser roles. | Migration-role default table, sequence and function privileges are revoked from `anon` and `authenticated`; every public surface is explicitly opted in. |
| Public views | Five views inherited owner-issued `ALL` grants when ownership moved to the locked projection role. | ACLs are rewritten while temporarily assuming the non-login projection owner. Browser roles receive `SELECT` on 14 approved views only; the search backing view is denied. |
| Functions/RPCs | PostgreSQL's default `PUBLIC EXECUTE` and an authenticated audit-writer grant made the function boundary broader than intended. | All 71 public functions are deny-by-default. Browser execution is limited to `search_public_properties`; authenticated sessions additionally receive `is_active_admin`. Mutation/audit/storage RPCs are service-only. |
| SECURITY DEFINER | Two M16 functions retained a non-empty `search_path`. | All 58 definer functions now have an empty `search_path`, schema-qualified relations, trusted non-browser owners and no dynamic SQL. |
| Storage budget | Usage checks transferred every stored file-size row to the application. | One service-only aggregate RPC returns only total bytes, keeping work and private metadata inside PostgreSQL. |
| Multipart intake | `Content-Length` was checked, but a missing header allowed parsing before the total body limit was known. | The owner handler now requires multipart content and reads the stream with a hard 21 MiB ceiling before parsing. Logical limits remain 10 files / 20 MiB. |
| Origin/CSRF | Exact `Origin` checks existed. | Requests now also reject an explicit `Sec-Fetch-Site: cross-site`; missing or incorrect origins still fail closed. |
| External URLs | Public business settings and owner media claims accepted syntactically valid non-HTTPS URLs. | Public outbound destinations and owner media claims require credential-free HTTPS; invalid public email/URL settings are omitted. Provider embeds remain normalized and allowlisted separately. |
| Browser headers | CSP covered only a subset of directives and core headers were absent. | A testable policy adds default/base/form/frame/object/script/style/image/font/connect/frame/media/worker/manifest controls plus nosniff, referrer, permissions, frame and opener policies. HSTS and insecure-request upgrading are production-only. |
| Session cookies | Supabase SSR cookie options were not explicitly hardened for this server-rendered admin. | Auth cookies are explicitly `HttpOnly`, `SameSite=Lax`, and `Secure` in production; local E2E verifies the effective flags. |
| Secrets/client boundary | Current-tree scans existed but did not cover reachable history or built client output. | Secret scanning covers current files and reachable Git history; the production build scans `.next/static` for server-secret names and configured secret values. Existing transitive client-import scanning remains mandatory. |
| Operations | No consolidated safe security/config readiness view existed. | `/admin/settings/security` re-authorizes an active admin and shows boolean/summary health only—never keys, tokens, PII or object paths. |

## Effective database boundary

- Tables: 64 application tables; 64 RLS-enabled; 64 force RLS; 64 active-admin read policies.
- Views: 15 explicit `public_%` projections; 14 directly readable by browser roles; `public_property_search` is reachable only through its bounded RPC.
- Functions: 71; 58 `SECURITY DEFINER`; all 58 use empty `search_path`; none contains dynamic `EXECUTE`.
- Anonymous grants: 14 projection `SELECT` grants and the bounded search RPC only.
- Authenticated grants: read grants remain RLS-filtered; non-admin rows are empty. No table mutation grant and no service mutation RPC is browser-executable.
- `urbanedge_public_projection`: `NOLOGIN`, `NOINHERIT`, no `BYPASSRLS`, and no base-table mutation grants.
- `service_role`: the only application role allowed to execute mutation, audit and storage-budget RPCs; its use remains confined to `server-only` modules.

## Actor/resource matrix

The entries below describe direct database/Storage API capability. Admin UI mutations still require a fresh active-admin check and then a server-owned service call. `—` means denied. `R/C/U/D/X` mean READ, CREATE, UPDATE, DELETE/ARCHIVE and EXECUTE.

| Resource/action | Anonymous | Authenticated non-admin | Inactive admin | Active admin browser | Service role |
|---|---:|---:|---:|---:|---:|
| Approved public projections | R | R | R | R | R |
| Search backing view | — | — | — | — | R |
| Bounded public search RPC | X | X | X | X | X |
| Private property/base rows | — | — | — | R | R/C/U/D |
| Parties and CRM | — | — | — | R | R/C/U/D/X |
| Owner submissions | — | — | — | R | R/C/U/D/X |
| Site visits/follow-ups | — | — | — | R | R/C/U/D/X |
| Verification/evidence/history | — | — | — | R | R/C/U/D/X |
| Editorial drafts/redirect history | — | — | — | R | R/C/U/D/X |
| Audit log | — | — | — | R | R/C/X |
| Admin predicate | — | X (false) | X (false) | X (true) | X |
| Mutation/audit RPCs | — | — | — | — | X |
| Public Storage object download by known path | R | R | R | R | R |
| Private Storage list/download | — | — | — | — | R/C/U/D |
| Any browser Storage mutation | — | — | — | — | R/C/U/D |
| Admin pages/actions | — | — | — | authorized session only | server execution |
| Security-health page | — | — | — | R | probe execution |

Active-admin direct table writes remain denied by grants. The final column represents server-owned operations after application authorization, validation and workflow checks—not a browser capability.

## Hostile-path matrix

| Attack | Expected result | Regression evidence |
|---|---|---|
| Guess unpublished slug | indistinguishable 404; no private canary | M10 and M17 E2E |
| Guess lead, owner-submission or site-visit ID | login redirect/denial; no record body | M12, M14 and M17 E2E |
| Guess private object path | no object/listing/signed path | M7 integration/E2E and M17 integration/E2E |
| Invoke service RPC as anon/non-admin | permission denied | M17 pgTAP and integration |
| Manipulate publication | authoritative readiness/version gate rejects | M9 pgTAP/integration/E2E |
| Manipulate verification/evidence | applicability, provenance, actor and transition gates reject | M8 pgTAP/integration/E2E |
| Manipulate CRM association | active-admin/service validation rejects invalid relation/state | M12 pgTAP/integration/E2E |
| Manipulate owner conversion | only APPROVED, current-version submission converts once to DRAFT | M15 pgTAP/integration/E2E |
| Search injection | bounded typed query; no executable reflection | M11 unit/integration and M17 E2E |
| Malicious redirect | same-site path validation; no external `Location` | M16 unit/integration and M17 E2E |
| Malicious external media URL | HTTPS/provider/ID or credential-free HTTPS validation rejects | M7 and M17 unit/integration |
| Excessive form traffic | HMAC bucket policy returns rate-limited state | M13 unit/integration/E2E |
| Duplicate replay | same payload replays once; changed payload conflicts | M13/M15 pgTAP/integration/E2E |
| Oversized/wrong multipart payload | 413/415 before business processing | M17 E2E |
| Hostile or missing origin | generic rejection; cross-site Fetch Metadata rejected | M13/M15 unit/E2E and M17 E2E |
| Expired/invalid signed URL | authorization, CLEAN state and short TTL required | M7 integration/E2E |
| Hidden/approximate coordinate extraction | exact coordinate/note canaries absent from HTML, RSC, SEO and JSON-LD | M3/M10/M16 pgTAP, integration and E2E |

## Browser and application controls

- Admin protection is layered: `/admin/:path*` session refresh, dynamic/no-store protected layout, `requireActiveAdmin()` in pages/services/actions, and service-only mutations. Claims alone never confer admin access.
- Public actions derive action/property context server-side, validate bounded Zod schemas, reject honeypots and untrusted origins, rate-limit HMAC identities and verify Turnstile hostname plus action. Local/test bypasses are explicit; preview/production fail closed.
- Idempotency values are UUIDs hashed before storage. Transactions lock the idempotency row and reject same-key/different-payload replays; notifications and analytics are emitted only on the first committed event.
- Uploads validate extension-independent signatures, allowlisted MIME, image dimensions/pixels, normalized WebP with metadata stripped, passive PDFs, malware state, file count/total size and deterministic private paths. Private URLs are minted only after re-authorization and expire in 60–300 seconds.
- User text is length-bounded plain text or controlled Markdown. SQL is parameterized through Supabase/PostgREST and fixed RPCs. Embedded media is provider/ID normalized, sandboxed and click-to-load.
- Admin/private responses use dynamic rendering and `private, no-store` at the proxy/download boundary. Public cacheable payloads originate only from publish-gated projections.
- SEO output uses public projections and centralized canonical/robots/sitemap/JSON-LD utilities. Robots directives are not treated as authorization.

## CSP rationale

Production excludes `unsafe-eval`. `unsafe-inline` remains for scripts/styles because the application preserves static/SSR caching and Next.js currently emits required inline bootstrap/style content without per-request nonces. A nonce-based CSP would force every page dynamic. This is an accepted, documented tradeoff; sources are otherwise explicit, framing is denied globally, object embedding is disabled, forms are same-origin and external frames are limited to Turnstile, YouTube Privacy-Enhanced, Vimeo and Matterport.

## Dependency and static evidence

- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- Available package updates were minor releases; none addressed a known installed vulnerability, so M17 did not introduce unrelated dependency churn.
- `supabase db lint --level warning`: no schema errors.
- ESLint, strict TypeScript, Prettier, server/client transitive boundary scan, current-tree/history secret scan and built-client secret scan pass.

## Accepted and deferred risks

- CSP retains `unsafe-inline` for Next.js static/SSR compatibility, as described above. Move to per-request nonces only with an explicit caching/performance architecture decision.
- Storage-budget enforcement is an aggregate preflight rather than a transactional reservation across Storage and PostgreSQL. Per-file/count ceilings, immutable paths and hard-stop checks limit impact; monitor and revisit if concurrent upload volume grows beyond the single-admin V1 model.
- Local Next development logs rejected Server Component authorization errors with stack traces. Responses expose only redirects/generic messages and production suppresses detailed client errors; production log access must remain restricted and retention reviewed.
- Public media object paths are intentionally public locators for the two public buckets. Private bucket names/paths and document metadata remain excluded from every public projection.
- This review does not validate provider dashboards, deployed TLS, CDN behavior, production cookies, DNS, callbacks or real traffic.

## Production-only gates retained for M19/pre-launch

- Observe deployed CSP/security headers and HTTPS-only HSTS behavior.
- Confirm production Supabase auth, RLS, function grants, Storage bucket visibility/CORS and service-key placement.
- Verify real Turnstile hostname/action, Resend sender/recipient, malware scanner and provider callback configuration.
- Verify environment-secret rotation/ownership, restricted production logs, backup/recovery and incident contacts.
- Re-run dependency advisories, full release tests and a real deployed client-bundle inspection from the release commit.
- Recheck staging LCP and real-user performance with approved media/provider configuration.

## Local qualification evidence

- Clean database reset: all 17 ordered migrations and seed applied to the isolated local project.
- Database: 15 pgTAP files, 600 assertions.
- Concurrency: 24 parallel property-code inserts, all unique.
- Unit: 22 files, 147 tests.
- Component: 15 files, 55 tests.
- Integration: 12 files, 52 tests.
- Chromium E2E: 56 scenarios, including M0–M16 regression and M17 hostile paths.
- Full QA: ESLint, Prettier, strict TypeScript, 17-client server-boundary scan, 402-file/current-history secret scan, unit/component suites and the Next.js 16.3.4 webpack production build pass; the postbuild client-bundle secret scan also passes.
