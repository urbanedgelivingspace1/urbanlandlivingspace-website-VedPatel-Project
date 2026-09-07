# M19 Deployment Preparation and Pre-Launch Qualification

## Disposition and hard boundary

**M19: CONDITIONAL HOLD.** Engineering deployment preparation is complete. The local release
candidate has an explicit environment contract, Netlify/Supabase procedures, migration and storage
checks, a successful isolated restore drill, rollback and DNS plans, and production smoke/hold
criteria. No staging or production account, deployment target, provider credential, DNS control,
real launch content, legal approval, or physical device was available in this session. Those items
remain named launch gates rather than inferred successes.

This runbook does not authorize production. It must not be used to deploy production, change DNS,
run production migrations, create real credentials, import customer data, send real email, or enable
billing without the approvals identified below.

## Release identification

| Item | Value |
|---|---|
| M18 QA commit | `bc68a2c` |
| M18 handoff commit | `e8d6258` |
| M19 implementation/runbook commit | `b8ffaa0` |
| Release convention | `urbanedge-v1-rc.<n>` for candidates; `urbanedge-v1.0.0` only after explicit launch approval |
| Deployment identity | Git SHA + Netlify deploy ID + latest applied Supabase migration |
| Latest migration | `20260906030000_m17_security_hardening.sql` |

Only a clean committed SHA may be deployed. Record the Netlify deploy ID and Supabase migration list
next to that SHA before promotion.

## M18 transfer register

`BLOCKING` means production launch cannot proceed. `NON-BLOCKING` means the integration may remain
disabled under the accepted architecture without weakening persistence, privacy, or security.

| Requirement | Owner | Status | Evidence | Class | Exact action | Codex-safe now | Approval |
|---|---|---|---|---|---|---|---|
| Separate staging and production Supabase/Auth/Storage | Technical operator + owner | BLOCKED | No authorized cloud project refs or access supplied | BLOCKING | Owner creates/controls two projects; operator records refs and applies the procedure below | Documentation only | OWNER APPROVAL REQUIRED |
| Netlify staging deployment, noindex | Technical operator | BLOCKED | No authorized Netlify site/repository connection supplied | BLOCKING | Create a branch/deploy preview against staging Supabase and execute staging gates | Documentation only | Owner access required; no production approval implied |
| Deployed TLS/HSTS/CSP/cookies/health/edge logs | Technical operator | DEPLOYMENT-TIME CHECK | Local M17 header tests pass; no deployed response exists | BLOCKING | Run the header and health checks below on staging, then production after approval | Yes after staging access | Production observation requires owner launch approval |
| Turnstile hostname/action | Technical operator | BLOCKED | Server validates hostname/action and now rejects incomplete preview/production configuration | BLOCKING | Create separate staging and production widgets; enter exact hostnames and scoped keys | Code/runbook complete | Owner/provider access required |
| Resend identity and delivery | Business owner + operator | OWNER APPROVAL REQUIRED | Durable CRM survives `SKIPPED`/failed delivery; no real email sent | BLOCKING for launch notifications | Verify owned sending subdomain, SPF/DKIM/DMARC, sender/reply-to/recipient; send only approved synthetic staging test | Documentation only | Owner approval required |
| Malware scanning | Security owner | BLOCKED | Missing remote scanner leaves documents `PENDING`; trusted access/public evidence remains denied | BLOCKING for document workflows | Approve/configure a scanner or explicitly keep upload workflows unavailable/pending | Fail-closed implementation complete | Owner/payment approval for any paid scanner |
| Encrypted backup | Operations owner | OWNER APPROVAL REQUIRED | Local logical/full dump procedure and restore drill pass; no production destination exists | BLOCKING | Select owner-controlled encrypted storage, establish weekly/pre-change job, record checksum and retention | Procedure/drill complete | Owner selects destination/access |
| Restore and rollback rehearsal | Technical operator | BLOCKED | Local isolated restore passes; no Netlify staging deployment exists for application rollback rehearsal | BLOCKING | Restore latest staging backup and exercise prior Netlify deploy promotion | Local restore complete | Staging access required |
| Canonical domain and DNS | Domain owner + operator | OWNER APPROVAL REQUIRED | Canonical apex is fixed in code/architecture; current DNS provider/account/records not supplied | BLOCKING | Export zone, inventory records, copy provider-generated web/email records, approve cutover | Plan complete | OWNER APPROVAL REQUIRED |
| Contact/business configuration | Business owner | OWNER APPROVAL REQUIRED | Unconfigured actions degrade honestly; `PLH-005` remains | BLOCKING | Approve and enter phone, WhatsApp, email, reply-to, address/hours and Living Space URL | Validation/runbook only | OWNER APPROVAL REQUIRED |
| Map/style/attribution | Business owner + operator | OWNER APPROVAL REQUIRED | Map remains unavailable when unset; production configuration is restricted to approved OpenFreeMap | NON-BLOCKING if map remains absent; BLOCKING if advertised | Approve exact OpenFreeMap style and visible attribution, then stage-test CSP/functionality | Yes after value supplied | OWNER APPROVAL REQUIRED |
| Privacy-safe analytics | Business/privacy owner | OWNER APPROVAL REQUIRED | Analytics events exclude contact/message/CRM identifiers; provider beacon is not configured | NON-BLOCKING | Approve Cloudflare Web Analytics or keep disabled | Yes after approval | OWNER APPROVAL REQUIRED if enabled |
| Real inventory/media/content/brand | Business/editorial owner | OWNER APPROVAL REQUIRED | Repository seed is synthetic-only; `PLH-003`/`004` remain | BLOCKING | Enter real records through M6–M9 workflow, approve media, brand lockup and editorial copy | Workflow ready | OWNER APPROVAL REQUIRED |
| Verification/legal/consent wording | Qualified Gujarat property counsel + owner | LEGAL APPROVAL REQUIRED | Public verification copy policy remains disabled; `PLH-007` remains | BLOCKING | Counsel approves exact Terms/Privacy/Disclaimer/consent/verification copy; record approver/date/version | Technical gate complete | QUALIFIED COUNSEL + OWNER |
| Staging security and functional smoke | Technical operator | BLOCKED | Full local suites pass; no staging target exists | BLOCKING | Run the staged suites/checklists below using synthetic data only, then clean fixtures | Yes after access | Staging authorization/access required |
| Staging performance and field monitoring | Technical operator | BLOCKED | M18 local home LCP median 3.09 s; no CDN/staging/field evidence | BLOCKING for staging baseline; field data is post-launch observation | Measure five routes on staging and enable privacy-safe Web Vitals monitoring | Yes after staging | Analytics approval if monitoring is enabled |
| Safari/iOS/Android physical-device QA | QA owner | BLOCKED | Chromium/WebKit automation passed; no physical devices supplied | BLOCKING | Execute the physical-device matrix below and attach device/OS/browser evidence | No device access | Owner/device access required |
| Provider/data/deploy/launch approvals | Business owner | OWNER APPROVAL REQUIRED | No production operation was attempted | BLOCKING | Record named approvers and explicit approvals in the final launch record | No | Explicit approval required per action |

The M18 recommended redundant verification index cleanup is not a launch blocker and is deferred; a
new production migration solely for cleanup would add unnecessary M19 risk. The prior local PostgREST
reset remains a watch item for staging. Hero render-blocking CSS is investigated only if representative
staging media reproduces materially poor LCP.

## Environment model

| Concern | Local | Preview/staging | Production |
|---|---|---|---|
| `APP_ENV` | `local` or guarded `test` | `preview` | `production` |
| Application URL | loopback | stable Netlify preview/branch URL or approved staging host | `https://urbanedgelandspace.com` |
| Supabase | local CLI stack | `urbanedge-landspace-staging` | `urbanedge-landspace-production` |
| Database/storage/auth | disposable/synthetic | separate staging, synthetic data only | production project, approved real data only |
| Secrets | ignored local file/test injection | Netlify deploy-preview/branch context | Netlify production context |
| Turnstile | disabled or official test keys | staging widget and preview hostname | production widget and apex hostname |
| Email | omitted/Mailpit | verified staging identity if approved; synthetic recipients only | verified production identity/destinations |
| Analytics | disabled | disabled unless explicitly approved for staging | approved privacy-safe Cloudflare Web Analytics |
| Canonical/indexing | local origin; noindex | exact staging origin; `noindex, nofollow`; empty sitemap | apex canonical; indexability gates active |

Never place production values in local/test fixtures. Netlify `CONTEXT` must agree with `APP_ENV`:
production context requires `production`; deploy previews/branch deploys cannot use `production`.
Public phone, WhatsApp, address, and hours are versioned `app_settings` business data rather than
environment variables. They remain owner-approved database configuration and must be staged before
production entry.

## Authoritative environment-variable contract

Empty optional values are treated as absent. Secret values live only in provider secret stores.
`CONTEXT`, `DEPLOY_ID`, and `DEPLOY_PRIME_URL` are Netlify-owned metadata, not user secrets.

| Name | Boundary | Requirement | Local | Preview/staging | Production | Safe failure/source |
|---|---|---|---|---|---|---|
| `APP_ENV` | server/build | Required | `local`/`test` | `preview` | `production` | Invalid value fails parsing; application operator |
| `NEXT_PUBLIC_SITE_URL` | public | Required | loopback allowed | HTTPS non-production origin | exact apex canonical | Deploy build fails on unsafe deployed origin; Netlify/domain plan |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Required | local API URL | staging HTTPS URL | production HTTPS URL | Missing/invalid fails; Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public, non-privileged | Required | local publishable key | staging key | production key | Missing fails; safety relies on RLS/grants; Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | server secret | Required | local synthetic key | staging secret | production secret | Missing fails; never browser-visible; Supabase |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | public | Required when deployed | optional/test | required staging widget | required production widget | Pair/absence fails deployed build; Cloudflare |
| `TURNSTILE_SECRET_KEY` | server secret | Required when deployed | optional/test | required staging secret | required production secret | Pair/absence fails deployed build; Cloudflare |
| `HMAC_SECRET` | server secret | Required when deployed | optional deterministic test fallback | required unique secret | required independent secret | Missing deployed build fails; password generator/secret store |
| `RESEND_API_KEY` | server secret | Optional runtime, launch-gated | omit | all-or-none provider group | all-or-none provider group | Missing group records `SKIPPED` after CRM commit; Resend |
| `EMAIL_FROM` | server config | With Resend group | omit | approved staging sender | approved production sender | Partial group fails; business/Resend |
| `EMAIL_REPLY_TO` | server config | With Resend group | omit | approved staging reply-to | approved production reply-to | Partial group fails; business owner |
| `ADMIN_NOTIFICATION_EMAIL` | server config/PII | With Resend group | omit | synthetic/admin staging destination | approved production admin destination | Partial group fails; business owner |
| `NEXT_PUBLIC_MAP_STYLE_URL` | public | Optional pair | omit or local-approved | HTTPS approved style | HTTPS `tiles.openfreemap.org` style | Missing pair disables map; OpenFreeMap |
| `NEXT_PUBLIC_MAP_PROVIDER` | public | Optional pair | omit/label | `OpenFreeMap` if enabled | `OpenFreeMap` if enabled | Partial/unapproved production pair fails |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | public | Optional, default off | `false`/omit | `false` unless approved | `true` only after approval | Omission disables provider behavior; privacy owner |
| `WEBHOOK_SIGNING_SECRET` | server secret | Optional/future | omit | only if webhook added | only if webhook added | No active webhook depends on it |
| five `STORAGE_*_BUCKET` names | server config | Optional defaults | canonical defaults | keep canonical defaults | keep canonical defaults | Missing uses migration-aligned names; repository |
| `STORAGE_SIGNED_URL_TTL_SECONDS` | server config | Optional default `120` | 60–300 | 60–300 | 60–300 | Invalid fails; architecture |
| `MEDIA_STORAGE_BUDGET_BYTES` | server config | Optional default 1 GiB | default | align staging quota | align production quota | Invalid fails; operations |
| `MEDIA_STORAGE_WARNING_PERCENT` | server config | Optional default 70 | default | approved threshold | approved threshold | Invalid fails |
| `MEDIA_STORAGE_HARD_STOP_PERCENT` | server config | Optional default 90 | default | approved threshold | approved threshold | Invalid fails/non-essential uploads stop |
| `MALWARE_SCAN_ENDPOINT` | server config | Optional but workflow launch-gated | omit | HTTPS approved scanner | HTTPS approved scanner | Missing deployed scanner leaves files `PENDING` and inaccessible |
| `MALWARE_SCAN_TOKEN` | server secret | Optional with endpoint | omit | provider secret | provider secret | Token without endpoint fails |
| `TEST_SUPABASE_PROJECT_REF` | test-only | Stateful tests | local/staging test ref | staging ref only during synthetic test run | never used | Guard rejects match with production |
| `PRODUCTION_SUPABASE_PROJECT_REF` | test safety marker | Stateful tests | real ref/name marker only; no credential | comparison only | never test target | Guard rejects equality |
| `TEST_TARGET_URL` | test-only | Stateful tests | loopback | staging origin | never production | Guard rejects production origin |
| `PRODUCTION_SITE_URL` | test safety marker | Stateful tests | canonical apex | canonical apex | canonical apex | Comparison only |
| `TEST_SAFETY_TOKEN` | non-secret test guard | Stateful tests | exact repository constant | exact repository constant | never set for production runs | Missing/wrong value refuses tests |

`.env.example` contains names, safe defaults, and blank placeholders only.

## Deployment validation behavior

- Preview and production require HTTPS site/Supabase URLs, a complete Turnstile pair, and HMAC.
- Production requires exactly `https://urbanedgelandspace.com` and rejects preview/localhost
  canonicals.
- Preview rejects the apex and `www` production hostnames.
- Resend and map groups reject partial configuration.
- Production map configuration, if enabled, must remain on the approved OpenFreeMap host.
- Missing malware scanning remains deliberately fail-closed at the document state/access boundary.
- Unset email, maps, and analytics do not weaken CRM persistence or privacy; their launch relevance is
  represented in this register.
- Indexing now uses `APP_ENV`, not a Vercel-specific variable. Any undefined/local/test/preview value
  is noindex; only `production` permits indexable metadata/sitemap behavior.

## Exact staging deployment procedure

Do not continue if a step would affect production, attach billing, expose real data, or use a
developer-only account as the permanent owner.

1. Owner creates or selects `urbanedge-landspace-staging` in an owner-controlled Supabase
   organization and records project ref/region securely.
2. From a clean checkout of the candidate SHA, run `npm ci`, `npm run qa`, `supabase db reset`,
   `supabase db lint --level warning`, and `supabase test db` locally.
3. Link only after checking the displayed ref: `supabase link --project-ref <STAGING_REF>`.
4. Run `supabase migration list --linked`, then `supabase db push --linked --dry-run`. Confirm exactly
   the 17 checksummed migrations below and no remote-only drift.
5. Apply staging only: `supabase db push --linked`. Do not use `--include-seed`; repository seed is
   synthetic local test data, not a cloud/production seed.
6. Verify tables/RLS/grants/views/functions and the five migration-created buckets using the SQL
   checks from M18/M17. Configure Supabase Auth Site URL and redirect allow-list to only the exact
   staging origin; do not use wildcards.
7. Owner creates/connects the Netlify site without publishing production. Use current automatic
   OpenNext support (do not pin the legacy adapter). Framework settings: `npm run build`, publish
   directory `.next`, Node version satisfying `package.json`.
8. In Netlify, assign separate deploy-context values. Deploy Preview/branch values must use
   `APP_ENV=preview`, the staging Supabase keys, unique staging HMAC, staging Turnstile keys, and the
   exact stable Netlify/approved staging origin. Production values must not be exposed to previews.
9. Add the exact preview hostname to the staging Turnstile widget. If email testing is approved, use
   only a verified staging sender and synthetic/internal recipient.
10. Deploy the candidate to a non-production branch/deploy preview. Record Git SHA, Netlify deploy
    ID/URL, migration list and timestamp. Confirm the response has `X-Robots-Tag: noindex, nofollow`,
    metadata is noindex, `robots.txt` disallows `/`, and `sitemap.xml` contains no URLs.
11. Execute the functional/security/header/performance checklists below with synthetic data. Clean
    mutable fixtures where practical; preserve audit evidence required to explain the run.

No staging deployment was run in M19 because no authorized site/project/credentials were available.

## Provider re-check (2026-09-07)

Only current deployment facts were rechecked; no product/legal research was reopened.

| Provider | Current authoritative fact | M19 decision |
|---|---|---|
| Netlify | Free: $0, 300 credits/month hard limit, no auto-recharge, custom domain/SSL and unlimited deploy previews; no SLA and service may pause/terminate | Still fits the approved zero-cost candidate; monitor 50/75/100% notices and require approval for any paid plan |
| Supabase | Free: two active projects, 500 MB DB, 1 GB file storage, 5 GB uncached + 5 GB cached egress, 50k MAU; low-activity pausing; no automatic/downloadable backups | Still fits staging + production with weekly logical backups and hard operational thresholds |
| Resend | Free transactional: 3,000/month and 100/day; owned verified domain required | Fits low-volume notifications; provider remains unconfigured and launch-gated |
| Turnstile | Free: 20 widgets, 10 hostnames/widget, unlimited challenges; server-side verification mandatory; tokens are single-use and 5 minutes | Fits; separate staging/production widgets and exact hostname/action checks required |
| OpenFreeMap | Free, as-is, no availability warranty and may discontinue; documented MapLibre style URL | Fits accepted portable map layer with no-SLA/disabled fallback and correct attribution |
| Cloudflare Web Analytics | Free privacy-first RUM; provider says it does not collect/use visitor personal data | Optional and non-blocking; enable only after privacy/business approval |

Sources:

- <https://www.netlify.com/pricing/>
- <https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/>
- <https://www.netlify.com/legal/self-serve-subscription-agreement/>
- <https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/>
- <https://supabase.com/pricing>
- <https://supabase.com/docs/guides/platform/backups>
- <https://supabase.com/docs/guides/platform/free-project-pausing>
- <https://resend.com/docs/knowledge-base/what-is-resend-pricing>
- <https://resend.com/docs/dashboard/domains/introduction>
- <https://developers.cloudflare.com/turnstile/plans/>
- <https://developers.cloudflare.com/turnstile/get-started/server-side-validation/>
- <https://openfreemap.org/tos/>
- <https://openfreemap.org/quick_start/>
- <https://developers.cloudflare.com/web-analytics/about/>

No reviewed provider forces a paid plan today. A paid tier, paid credits, add-on, billing method, SLA,
PITR, or paid scanner remains owner/payment approval-gated.

## Supabase fresh-environment, storage, and admin procedure

### Migration manifest

The lexically ordered filenames are deterministic; all 17 applied from zero in M18 and remain
unchanged in M19. SHA-256 values at M19:

```text
e052a9ac468f438c73bc25b6308216bfef70d40759f01d639263f49ac7ad864a  20260903030000_extensions_enums_utilities.sql
8ecc3068786079ab2c8996f30c3df6fa29e8ba1bba50c32d78b8fcd3a386f061  20260903030100_authoritative_schema.sql
1b320659dd4057a30fa26e9702db652822b388ca0a538aaeb4c182a742a6b699  20260903030200_integrity_triggers_indexes.sql
149525e5a38e04fddd7c24afbb88336c6d40585479c2d435ef0b2b1ec43c189a  20260903040000_public_safe_projections.sql
e8d6b051f048514a06edad07806654305faf1baf9c64a7b8454b7a14d7ded1a7  20260903050000_rls_grants_authorization.sql
604b1f0c7387b051fe0a788671596b4a8c6b751b03218faaaefdb1c0adcfc2b2  20260903060000_property_draft_services.sql
fc23eb95ac9f3132258faf98375366632f1644f2ab2dba0fb9964c7d826ed6c4  20260903070000_media_private_storage.sql
0d7a8c3c8273a7a521bb79ca167d2a77dfb5879bd0649bb09b23c0e9ef8204db  20260903080000_verification_workflow.sql
b6805f3d6d580d0218313605178f6cccd1012f562c3983c9157afb11b2e042ee  20260903090000_property_publication_gate.sql
c2d688285f90848de1774a999cdfb65b15db311dbe3e9397e9a674bffb385f5d  20260905010000_m10_public_property_detail.sql
61a54a2f29dbbf51c6506b700cb23f6acb07c9b9437c8a4bc9ccb7f5e53035f7  20260905020000_m11_public_property_search.sql
3383951f96db876e8aee32cbc93ef0d163f1e1655e21b6d996f776a7fd6ebb52  20260905030000_m12_crm_core.sql
4f49460c1a6583288931427c4988fd373fe84954baa49899005e3df5ba1da560  20260905040000_m13_public_demand_intake.sql
11d8dab70e5e20f5a0645d8cc26169aa8ebcbe636be38d26998fb7291b3c63a0  20260905050000_m14_site_visit_operations.sql
b634384deceebdacd8fdd559cb6abc34d9b1ea2360163ee24ab0f13972e64ced  20260906010000_m15_owner_submission_workflow.sql
fb7115a5735c7b0d804a443e25774a9694d50a9885f5addaac6a2eb870753694  20260906020000_m16_content_seo.sql
8f48d0e33e36bd863c3749f48c140d7667441ca0a059e1889df44ab0432f383f  20260906030000_m17_security_hardening.sql
```

There is no localhost, synthetic-fixture, or test-data dependency in migrations. M12 deliberately
replaces the legacy lead enum and drops the obsolete type; this is acceptable for a fresh staging/
production environment but is not assumed reversible on a populated database. Other `DELETE`
statements are bounded service behavior or expired rate/idempotency cleanup, not deployment data
purges. Use forward-fix or verified restore for migration failures; never blindly downgrade.

### Storage result

Migration `20260903070000_media_private_storage.sql` creates/updates:

| Bucket | Public | Object limit | Allowed types |
|---|---:|---:|---|
| `property-media-public` | yes | 15 MiB | WebP, PDF |
| `property-media-private` | no | 15 MiB | WebP, PDF |
| `verification-documents-private` | no | 20 MiB | PDF, JPEG, PNG |
| `owner-submissions-private` | no | 20 MiB | PDF, JPEG, PNG |
| `guide-media-public` | yes | 10 MiB | WebP |

No anonymous/authenticated `storage.objects` list/write policy exists. Object paths are
server-generated; private reads require an authorized short-lived signed URL; public promotion is an
immutable controlled operation. Bucket creation is migration-controlled—do not recreate it manually.
Provider-side tasks are limited to applying migrations, checking displayed bucket settings/usage, and
configuring CORS/host behavior only if the deployed adapter requires it.

### Initial admin

1. Owner approves the named admin and controls the destination mailbox.
2. Use Supabase Auth Dashboard invitation/password-recovery flow; never choose or store a hard-coded
   password in Git, SQL, chat, or a runbook.
3. After the invited user exists, run a reviewed one-time statement in the target project, replacing
   placeholders only in the private operator session:

```sql
insert into public.admin_profiles (user_id, display_name, role, is_active)
select id, '<APPROVED DISPLAY NAME>', 'ADMIN', true
from auth.users
where lower(email) = lower('<APPROVED ADMIN EMAIL>')
on conflict (user_id) do update
set display_name = excluded.display_name,
    role = excluded.role,
    is_active = excluded.is_active,
    updated_at = now();
```

4. Verify one matching Auth user, one active profile, minimum required role, successful login, admin
   access, non-admin denial, inactive-admin denial, secure cookies, and recovery flow.
5. Create no real production admin until explicitly authorized. Enable provider-account MFA and an
   owner-controlled recovery path; application MFA is an owner policy gate if required before launch.

## Backup strategy and restore evidence

Production minimum: weekly full logical DB backup, plus pre-migration and pre-major-import backups.
The operations owner must encrypt the artifact, store it outside Supabase in owner-controlled storage,
retain at least four weekly copies unless policy requires longer, record SHA-256, and perform a monthly
restore test. RPO is up to seven days under the minimum schedule; RTO is manual and has no SLA.
Storage binaries are not in a database logical dump: retain approved originals and separately export
critical public/private objects with a manifest/checksum under the same encryption/access policy.

Current installed syntax validated in M19:

```sh
supabase db dump --db-url "$SUPABASE_DB_URL" --file <encrypted-work-area>/schema.sql
supabase db dump --db-url "$SUPABASE_DB_URL" --data-only --use-copy --file <encrypted-work-area>/data.sql
shasum -a 256 <encrypted-work-area>/schema.sql <encrypted-work-area>/data.sql
```

Do not place a raw dump, database password, or encryption key in Git or shell history. Obtain the DB
URL through the provider's secure operator flow and clear temporary plaintext after encryption and
verification.

M19 local restore drill (synthetic data only, 2026-09-07):

- created schema/data CLI dumps and a full custom-format `pg_dump` artifact outside the repository;
- SHA-256 of the full artifact:
  `a636fde8adee305326272e0fd8639f802d40bab181a9384e7994250a5fda733c`;
- restored into empty isolated database `urbanedge_m19_restore_drill` in the local Supabase Postgres
  container using the local `supabase_admin` role after a first `postgres`-role attempt correctly
  failed on a managed Realtime function setting;
- source/restored counts matched exactly for properties 73, owner submissions 9, leads 32, site
  visits 11, property verifications 297, audit logs 243, app settings 2, guides 1, Auth users 11,
  buckets 5, Storage objects 21, and migration records 17;
- restored database reported 64 public tables with forced RLS, 95 public/storage policies, and the
  exact five public/private bucket flags;
- the isolated database and plaintext temporary artifacts were removed after evidence capture.

This proves the local recovery mechanics. It does not claim that a production backup destination or
production schedule exists; those remain owner/operations launch gates.

## Rollback, DNS, TLS, and release procedure

### Application/configuration rollback

Record the prior known-good Netlify deploy ID before promotion. For application/configuration failure,
verify DB compatibility, restore prior context values if necessary, promote the prior deploy, smoke
test, and log the incident. Never roll back code across an incompatible schema.

### Database/provider/security rollback

- Failed pre-apply migration: stop; do not modify production.
- Failed partial migration: hold traffic/mutations, preserve logs, assess transaction state, prefer a
  corrective migration; restore only from a verified backup with destructive-production approval.
- Provider failure: keep durable CRM writes; disable the optional map/analytics/email surface as the
  accepted fallback. Turnstile failure remains fail-closed for public mutation.
- Security/privacy defect: immediately hold launch or roll back application; revoke/rotate exposed
  secrets; disable affected public workflow; do not restore exposure for conversion convenience.
- Bad release/data: preserve evidence, identify last compatible Git/deploy/migration set, then choose
  prior deploy, forward-fix, or approved restore.

### DNS plan (not executed)

The provider/account is not yet evidenced. The approved target is Cloudflare Free authoritative DNS
with the registrar retained, apex canonical, and `www` permanently redirected to apex.

1. Owner confirms registrar, Cloudflare, Netlify and Resend ownership/recovery access.
2. Export the complete current DNS zone; inventory web, mail, verification and unrelated records.
3. Lower relevant TTLs in advance if approved; record old values and rollback values.
4. Copy—not invent—the exact Netlify apex/domain-verification records shown for the created site.
5. Copy—not invent—the exact Resend SPF/DKIM records; add an owner-approved DMARC policy.
6. Compare Cloudflare import against the exported zone before changing nameservers.
7. After explicit cutover approval, change only the required records/nameservers; verify apex, `www`,
   email authentication and unrelated services.
8. Roll back to the recorded old nameservers/records if the critical smoke fails and the prior service
   remains valid. Respect DNS propagation; do not repeatedly oscillate records.

TLS is Netlify-managed. Validate HTTP→HTTPS, one-hop `www`→apex, certificate chain/expiry, mixed
content, cookies and headers before accepting HSTS. The current code sends two-year HSTS with
`includeSubDomains; preload` in production; do **not** submit to the preload list in M19. Confirm every
subdomain is HTTPS-capable and obtain separate owner approval before any preload submission.

Header command after staging exists:

```sh
curl -fsSIL https://<STAGING_HOST>/
curl -fsSIL https://<STAGING_HOST>/admin/login
curl -fsSL https://<STAGING_HOST>/robots.txt
curl -fsSL https://<STAGING_HOST>/sitemap.xml
```

Record CSP, HSTS expectation (absent on preview), `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, frame protections, COOP, noindex, cookies, health output and edge errors. Repeat
against production only after launch approval; HSTS and the production canonical redirect are
deployment-time checks.

## Staging security, functional, performance, and device gates

### Security smoke

Using synthetic staging data only, verify unpublished-property denial; anonymous/admin boundary;
inactive/non-admin denial; private bucket list/read denial; signed URL authorization/expiry; public
form origin, Fetch Metadata, Turnstile, rate/replay and body/file limits; private-coordinate absence in
HTML/RSC/JSON-LD/maps/sitemap; privileged RPC denial; health authorization; deployed headers; and
noindex/empty sitemap. Record request/response evidence without secrets or PII.

### Functional smoke

Exercise public discovery, filters, a published property, inquiry, requirement, CRM receipt, visit
request and admin lifecycle, owner submission with safe synthetic attachments, review/conversion to
Draft, media promotion, verification, gated publication and guide publish/unpublish. Confirm no owner
submission auto-publishes, no visit auto-confirms, no claim auto-verifies, and notification failure
does not lose CRM data. Remove synthetic mutable fixtures where practical.

### Performance

On the deployment-equivalent staging build with representative approved media, run mobile Lighthouse
at least three times for `/`, `/properties`, one eligible location/category page, one property detail,
and one guide. Record median FCP/LCP/CLS/TBT and environment/CDN notes. Do not call this field Core Web
Vitals. Investigate the hero/render path only if the home median remains materially above 2.5 s and
profiling attributes it to application code. After approved production launch, use privacy-safe RUM
to observe LCP/INP/CLS; no field result can exist beforehand.

### Physical devices

Record real model, OS and browser version for Safari/macOS, iPhone/iOS Safari and Android/Chrome.
Check home, search/filter, detail/gallery/map, inquiry/requirement/contact, Sell Your Land attachments,
sticky mobile CTA, admin login and one critical admin mutation. Record keyboard/focus, orientation,
zoom/text-size, overflow and form recovery. Emulation is supplemental and cannot satisfy this gate.

## Business, content, legal, SEO, analytics, and operations

- Business owner must approve public name, phone, WhatsApp, email/reply-to/recipient, address/hours,
  social links, Living Space cross-link, brand lockup and contact wording. Missing actions stay absent.
- First real inventory enters through draft creation, media/source/provenance, verification/claim,
  privacy mode and M9 publication validation. No direct finished-listing SQL import is allowed.
- Launch-content scan must find no synthetic/test inventory, fake statistics, placeholder media,
  dummy contacts, localhost/staging URLs, lorem ipsum, TODO copy or unapproved legal claims.
- Terms, Privacy, Disclaimer, all consent versions, property disclaimers and every public verification
  label require recorded version/approver/date. Qualified Gujarat counsel approval is mandatory for
  verification wording; until then the M8 policy gate stays disabled.
- Production SEO check covers apex canonicals/OG, redirects, sitemap, robots, properties, guides,
  curated location pages, noindex filters, structured data and 404/closed-property behavior. Do not
  submit Search Console/sitemaps before production authorization.
- Analytics may contain only approved event name, public page/category context and coarse device/
  country data. It must not contain contact fields, messages, CRM/owner IDs, private coordinates,
  document paths or secrets. Disabled analytics is not a release blocker.
- Operations owner checks the admin security/health page, CRM notification outcomes, pending malware
  scans, Netlify usage/errors, Supabase DB/storage/egress/pausing, Resend delivery/quota, Turnstile
  analytics and application logs. Never log PII, credentials, private coordinates or document URLs.

### Zero-cost thresholds

| Provider | Limit/baseline | Warn/action | Hard stop/upgrade gate |
|---|---|---|---|
| Netlify Free | 300 credits/month | review provider notices at 50% and 75%; reduce nonessential previews | at 100% service may pause; paid plan/credits require approval |
| Supabase DB | 500 MB | investigate at 70%; owner warning at 85% | 90% freeze nonessential growth; provider read-only/restriction risk at quota |
| Supabase Storage | 1 GB | 70% investigate; 85% owner warning | 90% stop nonessential uploads; 95% storage freeze |
| Supabase egress | 5 GB uncached + 5 GB cached | investigate at 70% of either bucket | restrict nonessential media; paid upgrade requires approval |
| Supabase projects | 2 active Free projects | local + staging + production topology uses exactly two cloud projects | no third cloud dev project; paid change requires approval |
| Resend Free | 100/day, 3,000/month | warn at 70/day or 70% monthly | preserve CRM, skip/defer secondary mail; paid plan requires approval |
| Turnstile Free | 20 widgets, 10 hostnames/widget, unlimited verification | review at 70% widget/hostname capacity and abuse anomalies | consolidate approved hosts or seek owner-approved plan/change |
| OpenFreeMap | no published SLA | monitor map failures/latency and retain text/directions fallback | disable map enhancement; provider change requires architecture/owner approval |
| Cloudflare Web Analytics | free privacy-first RUM | review retention/limits in dashboard when enabled | disable rather than send PII or activate paid tooling |

## Production smoke test (run only after explicit launch approval)

1. Load apex homepage over HTTPS; verify one-hop canonical behavior and final approved content.
2. Search by keyword/filter and open an approved published property.
3. Confirm property details, availability, privacy-safe map/location and responsive media.
4. Submit one explicitly approved non-destructive test inquiry; confirm success and durable CRM receipt.
5. Confirm notification outcome without exposing customer data.
6. Log in as the approved admin and confirm active-admin access plus non-admin/private-storage denial.
7. Check `/robots.txt`, `/sitemap.xml`, canonical/OG/structured data and no private/filtered URLs.
8. Check CSP, HSTS, content-type, referrer, permissions, frame, COOP and secure cookie headers.
9. Check database/auth/storage, Turnstile, email, malware-scan and monitoring/provider health.
10. Record Git SHA, Netlify deploy ID, migration version, operator, timestamp and outcome.

## Mandatory launch hold/rollback triggers

Hold or roll back for any auth bypass; inactive/non-admin access; private data/coordinate/document
exposure; RLS/grant regression; broken/partial migration; unavailable database/auth/storage; wrong
Supabase environment; production canonical pointing to localhost/staging; failed HTTPS/certificate;
critical CSP/header failure; publication-gate/privacy failure; forms losing or duplicating durable
submissions; Turnstile bypass; real content/legal approval mismatch; severe outage; or inability to
identify the deployed Git/deploy/migration set. Email/map/analytics provider failure alone uses the
documented safe degradation unless the owner defined it as a launch-critical dependency.

## Reconciliation of `14-PRE-LAUNCH-CHECKLIST.md`

Every checkbox in each cited subsection inherits the status below unless a split row states otherwise.
This is the authoritative M19 reconciliation; unchecked boxes in the source checklist are not implied
PASS.

| Checklist scope | M19 status | Evidence / action |
|---|---|---|
| §1 ownership names, targets, window, approvers | OWNER APPROVAL REQUIRED | No names/accounts/window supplied; candidate and clean-build rule documented |
| §2.1 real inventory | OWNER APPROVAL REQUIRED | Workflow qualified; no approved real inventory supplied |
| §2.2 owner/source authority | OWNER APPROVAL REQUIRED | Private model qualified; real records/consents absent |
| §3 contact destinations | OWNER APPROVAL REQUIRED | Disabled safely; all real values pending |
| §4.1 provider/domain ownership | OWNER APPROVAL REQUIRED | Owner-controlled accounts/recovery not evidenced |
| §4.2 canonical selection | PASS | Non-`www` apex fixed in architecture/code; owner sign-off remains §4.1 |
| §4.2 deployed redirect/TLS/HSTS/mixed content | DEPLOYMENT-TIME CHECK | Cannot be observed without approved deployment/domain |
| §4.3 DNS | OWNER APPROVAL REQUIRED | Exact provider-generated records/account details pending; plan complete |
| §5.1 environment identity/secret store | DEPLOYMENT-TIME CHECK | Contract enforced; real context values absent |
| §5.2 baseline variables | OWNER APPROVAL REQUIRED | Matrix complete; provider/business values pending |
| §5.3 secret boundary | PASS | M18 secret/history/client-output checks pass; M19 adds no secret |
| §6 production Supabase | OWNER APPROVAL REQUIRED | Procedure ready; project not created/selected |
| §7.1 migration readiness | PASS | 17 ordered checksummed migrations; M18 reset/lint/600 assertions |
| §7.2 production migration | OWNER APPROVAL REQUIRED | Backup/review/explicit destructive gate required before execution |
| §7.3 real data/import | OWNER APPROVAL REQUIRED | No real data supplied; seed is synthetic-only |
| §8 production demo removal | DEPLOYMENT-TIME CHECK | Inspect fresh production before launch; no production DB exists |
| §9.1 bucket separation/policies | PASS | Migration-controlled five-bucket contract and RLS/storage tests pass |
| §9.2 real assets | OWNER APPROVAL REQUIRED | No approved property media/brand lockup supplied |
| §10.1 production backup | OWNER APPROVAL REQUIRED | Procedure proven locally; encrypted destination/schedule pending |
| §10.2 restore proof | PASS | Synthetic isolated full restore and integrity comparison pass |
| §10.3 recovery ownership | OWNER APPROVAL REQUIRED | Provider recovery access not supplied |
| §11 rollback plan | PASS | App/config/database/storage/DNS/provider plan and triggers documented |
| §12 legal text | LEGAL APPROVAL REQUIRED | Technical pages/provisional copy exist; qualified approval absent |
| §13 verification wording | LEGAL APPROVAL REQUIRED | M8 copy gate remains disabled pending counsel |
| §14 consent/Sell Your Land wording | LEGAL APPROVAL REQUIRED | Versioned technical consent exists; final legal/business approval absent |
| §15.1 metadata | OWNER APPROVAL REQUIRED | System qualified; final business/editorial copy pending |
| §15.2 canonicalization | PASS | Central apex canonical and `www` redirect code present |
| §15.3 thin-page protection | DEPLOYMENT-TIME CHECK | Quality gates pass locally; real inventory/content review pending |
| §16 robots/sitemap technical behavior | PASS | Local automated coverage; preview logic corrected to `APP_ENV` |
| §16 deployed/search-console actions | DEPLOYMENT-TIME CHECK | Staging/production observation and submission not authorized |
| §17 analytics/observability | OWNER APPROVAL REQUIRED | Privacy-safe boundary exists; provider/config/owner pending |
| §18 local security audit | PASS | M17/M18 complete; M19 configuration regression added |
| §18 deployed security/TLS/CSP/log review | DEPLOYMENT-TIME CHECK | Staging unavailable |
| §19 RLS/authorization | PASS | 600 pgTAP assertions and M18 actor matrix; staging repeat pending |
| §20 form abuse controls | DEPLOYMENT-TIME CHECK | Local pass; real Turnstile/edge behavior pending |
| §21 email delivery | OWNER APPROVAL REQUIRED | Durable failure behavior passes; domain/sender/delivery absent |
| §22 admin credentials/MFA/recovery | OWNER APPROVAL REQUIRED | Secure bootstrap documented; real account absent |
| §23 local performance | PASS | M18 metrics recorded; no CLS/TBT blocker |
| §23 staging/field performance | DEPLOYMENT-TIME CHECK | Home local median LCP 3.09 s transferred; no staging/field data |
| §24 automated responsive/browser coverage | PASS | Eight widths, Chromium and WebKit passed in M18 |
| §24 physical devices | BLOCKED | Real Safari/iOS/Android evidence unavailable |
| §25 accessibility | PASS | Axe, keyboard/semantic and responsive evidence passed M18; staging spot-check pending |
| §26 public staging UX/conversion | BLOCKED | Exact smoke defined; no staging target |
| §27 admin staging operations | BLOCKED | Exact smoke defined; no staging target |
| §28 provider/cost approval | OWNER APPROVAL REQUIRED | Current facts rechecked; no paid service authorized |
| §29 production-only action approvals | OWNER APPROVAL REQUIRED | No production operation authorized/performed |
| §30 GO/NO-GO | OWNER APPROVAL REQUIRED | Current decision is HOLD |
| §31 launch sequence | PASS | Procedure is prepared; execution remains owner-gated |
| §32 immediate live smoke | DEPLOYMENT-TIME CHECK | Checklist prepared; production not deployed |
| §33 recovery procedure | PASS | Backup/restore/rollback/DNS procedures documented and local restore proven |
| §34 recurring operations | OWNER APPROVAL REQUIRED | Named operations owner/schedule activation pending |
| §35 approval register | OWNER APPROVAL REQUIRED | Roles are identified; people/signatures/dates absent |
| §36 technical release | BLOCKED | Local engineering prep complete; external gates remain |
| §36 business/legal release | LEGAL APPROVAL REQUIRED | No owner/counsel acceptance supplied |
| §37 final decision | BLOCKED | `HOLD — DO NOT LAUNCH` until all required external/deployment gates pass |

## Unresolved launch gates

Staging deployment and smoke; staging rollback rehearsal; owner-controlled provider projects/accounts
and recovery paths; all real contextual secrets/URLs; approved scanner or disabled document workflow;
encrypted production backup destination/schedule; real business contacts/brand/inventory/media/content;
qualified legal approvals; actual DNS records/cutover approval; deployed TLS/HSTS/CSP/health/log
observation; staging performance; physical Safari/iOS/Android checks; named release/rollback/payment/
destructive-action owners; and explicit production migration/deployment/data/provider/launch approval.

## M19 change validation

M19 changes only deployment safety and documentation; there is no schema migration or ADR. The final
local release-candidate evidence is:

| Check | Result |
|---|---|
| Clean database rebuild | PASS — all 17 migrations plus synthetic seed |
| Database lint | PASS — no schema errors |
| Database policies/invariants | PASS — 15 files / 600 pgTAP assertions |
| Property ID concurrency | PASS — 24 parallel inserts |
| Unit tests | PASS — 22 files / 151 tests |
| Component tests | PASS — 15 files / 55 tests |
| Guarded integrations | PASS — 12 files / 52 tests |
| Guarded Chromium E2E | PASS — 56 scenarios; M16 focused rerun 8/8 |
| Static/security checks | PASS — lint, Prettier, strict TypeScript, 17-client boundary scan, 404-file/current-history secret scan |
| Production-context build | PASS — Next.js 16.3.4 webpack, static generation and client-bundle secret scan |
| Isolated restore drill | PASS — full local dump restored as `supabase_admin`; row counts, Auth, buckets, objects, 64 forced-RLS tables and 95 policies matched; test database and plaintext artifacts removed |

The first production-context build attempt could not resolve Google Fonts inside the restricted
sandbox. The unchanged build passed when network access was allowed; this was an execution-environment
limitation, not an application failure. All stateful tests used the guarded disposable local project.
No real credentials or customer data were used.

## Supabase Cloud migration portability remediation

During the initial staging migration to Supabase Cloud project `xrqulhapgjqgymrfuclo`, migrations 1–6
applied successfully, while migration 7 (`20260903070000_media_private_storage.sql`) failed transactionally
and rolled back. The failure surfaced two genuine PostgreSQL 17 / Supabase Cloud portability defects:

1. **Grant sequencing defect**: Migrations 7 and 8 created public-safe views under `urbanedge_public_projection`,
   then reset the role and revoked projection membership *before* attempting `grant select ... to anon, authenticated`.
   In local Docker, the migration user is a superuser and can grant privileges on views owned by any role; on
   Supabase Cloud, the migration user is non-superuser and loses the authority to grant SELECT on views owned
   by `urbanedge_public_projection` once it is no longer assuming or a member of that role.
2. **PostgreSQL 16/17 grantor-tracking & admin-option defect**: In PostgreSQL 16+, role memberships track
   `(roleid, member, grantor)`. A role granting membership via `GRANTED BY <role>` must ensure `<role>` has
   `ADMIN OPTION` on the target role. On Supabase Cloud, `postgres` holds `ADMIN OPTION` on `urbanedge_public_projection`,
   while the connecting CLI user (`cli_login_postgres`) is a member of `postgres`. Attempting a bare self-grant
   or self-revoke without resolving a grantor with `ADMIN OPTION` resulted in `ERROR: no possible grantors (SQLSTATE XX000)`.

### Why historical migrations were corrected before first cloud deployment

Historical migrations 7 through 17 were corrected directly rather than patched through an incremental forward
migration because migration 7 failed on its very first run in a fresh cloud project. A repair migration cannot
succeed if the base migration chain cannot initialize a fresh database from zero. By standardizing the verified
grantor resolution pattern across migrations 7, 8, 9, 10, 11, 16, and 17, the entire migration history is
genuinely portable across local Docker, Supabase Cloud staging, and future Supabase Cloud production.

### Verified grantor resolution pattern

Across all affected migrations, projection role assumption and cleanup were standardized to:
- Dynamically resolve a grantor possessing `ADMIN OPTION` on `urbanedge_public_projection` accessible to the
  executing user:
  ```sql
  select r.rolname into grantor_role
  from pg_auth_members m
  join pg_roles r on r.oid = m.member
  where m.roleid = 'urbanedge_public_projection'::regrole
    and m.admin_option = true
    and (r.rolname = current_user or pg_has_role(current_user, r.oid, 'MEMBER'))
  order by (r.rolname = current_user) desc
  limit 1;
  ```
- Issue `grant urbanedge_public_projection to <current_user> with inherit false, set true granted by <grantor_role>`.
- Execute all view creations, replacements, and `grant select ... to anon, authenticated` calls under
  `set role urbanedge_public_projection;` before resetting the role.
- Deterministically revoke the exact temporary membership row by matching the recorded grantor from `pg_auth_members`.

### Post-fix local verification

A complete clean local rebuild (`supabase db reset`) from migration 1 through 17 plus synthetic seed passed with:
- Database lint: PASS (0 schema errors)
- pgTAP test suite: PASS (15 files, 600/600 assertions passed)
- Property code concurrency: PASS (24 parallel inserts)
- Static, boundary, secret, unit, and component tests: PASS
- Next.js webpack production build: PASS

### Staging deployment verification (`xrqulhapgjqgymrfuclo`)

Following local qualification and preflight cleanup:
- Residual diagnostic grant to `cli_login_postgres` revoked using recorded grantor (`postgres`).
- Active migration role restored deterministically via `set role postgres;` across all 7 projection migrations.
- `supabase db push --dry-run`: cleanly identified migrations 7–17.
- `supabase db push`: all 11 remaining migrations (7 through 17) applied without manual SQL intervention.
- `supabase migration list --linked`: all 17 migrations verified synchronized.
- Application tables: 64 total tables, 64 with RLS enabled, 64 forcing RLS (100%).
- Public projections: 15 views owned by `urbanedge_public_projection`; SELECT-only for `anon`/`authenticated`; `public_property_search` restricted behind RPC.
- Function execution: `search_public_properties` executable by `anon`/`authenticated`; `is_active_admin` restricted to `authenticated`; 0 unauthorized public functions; 0 SECURITY DEFINER functions without empty search_path.
- Storage buckets: 5 buckets verified (`guide-media-public` [public], `property-media-public` [public], `property-media-private` [private], `verification-documents-private` [private], `owner-submissions-private` [private]).
- Role memberships: 0 unexpected temporary memberships; permanent cluster-wide admin option preserved.

**PRODUCTION LAUNCH AUTHORIZED: NO**
