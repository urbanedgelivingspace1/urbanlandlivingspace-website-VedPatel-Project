# URBANEDGE LAND SPACE — INFRASTRUCTURE & DEPLOYMENT ARCHITECTURE

**File:** `10-INFRASTRUCTURE-DEPLOYMENT.md`  
**System:** UrbanEdge Land Space V1  
**Status:** Authoritative infrastructure/deployment architecture and handoff  
**Architecture date:** 31 August 2026  
**Launch geography:** Ahmedabad + Gandhinagar, Gujarat  
**Primary domain:** `https://urbanedgelandspace.com`

> **Purpose** — Define the complete zero-cost-first deployment architecture for the commercial UrbanEdge Land Space V1 application, including hosting, Supabase environments, domains/DNS, environment variables, preview/staging/production, email, analytics, maps, CAPTCHA/abuse controls, backups, migrations, secret management, rollback, portability and explicit upgrade gates.

> **Important commercial-use rule** — A service is **not** considered a valid zero-cost recommendation merely because a free plan exists. A free tier must also be commercially usable under the provider's current terms. Where current terms are ambiguous, restrictive, non-commercial, or operationally unsuitable, this document does not silently approve that service for production.

---

# 1. Architecture Authority

This document is subordinate to the established UrbanEdge Land Space architecture.

The parent architecture establishes:

- UrbanEdge Land Space as a new independent repository/application.
- A dedicated Supabase project/database separate from UrbanEdge Living Space.
- Next.js App Router, TypeScript and server-owned application logic.
- Supabase PostgreSQL, Auth and Storage.
- Local → Preview/Staging → Production environment separation.
- Netlify Free as the intended zero-cost hosting target.
- MapLibre-compatible map architecture with a configurable provider.
- Provider boundaries for email, analytics, anti-bot and maps.
- Versioned Supabase migrations.
- No blind/destructive production migrations.
- Backup and recovery documentation.
- No accidental paid services.
- Production deployment only after an explicit owner approval gate.

The security architecture additionally requires:

- RLS on application tables.
- Explicit public projections rather than returning sensitive base-table rows.
- Server-only privileged keys.
- Private buckets for private documents.
- Short-lived signed URLs for authorized private access.
- Server-owned public form mutations.
- Rate limiting and anti-bot protection.
- No secret in `NEXT_PUBLIC_*`.
- No sensitive information in logs.

The media architecture additionally requires:

- Separate public and private storage buckets.
- Server-generated object paths.
- Public media only after validation/approval.
- No large video binaries in V1.
- External video/360 URLs where appropriate.
- Archive-before-delete.
- Checksum-based duplicate handling.
- Public media cacheability without overwriting immutable object paths.

---

# 2. Executive Deployment Decision

## 2.1 Zero-cost-first production stack

The approved V1 baseline is:

| Layer | V1 choice | Initial cost target | Production suitability |
|---|---|---:|---|
| Application hosting | **Netlify Free** | $0 | **Approved zero-cost candidate for commercial V1**, subject to usage/terms monitoring |
| Application framework | Next.js App Router | $0 | Open-source |
| Database/Auth/Storage | **Supabase Free** | $0 | **Approved zero-cost candidate with important operational limitations** |
| Cloud staging DB | Supabase Free project | $0 | Fits one of the two free cloud projects |
| Local DB | Supabase CLI/local Postgres | $0 | Preferred |
| DNS | Cloudflare Free DNS | $0 | Approved |
| TLS | Netlify-managed HTTPS + DNS provider integration | $0 | Approved |
| Transactional email | **Resend Free** | $0 | Approved for V1 notification volume if limits are respected |
| Analytics | **Cloudflare Web Analytics** | $0 | Approved |
| CAPTCHA/anti-bot | **Cloudflare Turnstile Free** | $0 | Approved |
| Interactive map | **OpenFreeMap + MapLibre** | $0 | Approved with no-SLA awareness and provider portability |
| Navigation/directions | **Google Maps URLs** | $0 API dependency | Approved because Maps URLs do not require a Google Maps API key |
| Search | PostgreSQL/Supabase | $0 | Approved for V1 |
| Video | YouTube/external provider URLs | $0 to UrbanEdge | Approved; no large binary hosting in V1 |
| Domain registration | Existing `urbanedgelandspace.com` | Existing asset | Renewal/registration is an owner-paid dependency |
| Monitoring | Provider dashboards + structured logs + admin health checks | $0 | Approved |
| Backups | Supabase CLI logical dump + owner-controlled encrypted storage | $0 software; storage choice dependent | Required because Free plan managed backups are not downloadable |

### 2.2 Services explicitly rejected for zero-cost commercial production

**Vercel Hobby is rejected for production.**

Vercel's current Terms state that Hobby is for personal or non-commercial use, and its current pricing documentation repeats that restriction. This directly conflicts with a commercial client production website.

Use Vercel Pro only after explicit owner approval.

### 2.3 Free-tier services that are not production-approved merely because they are free

The following remain **approval-gated**:

- MapTiler Free — current free plan is limited to non-commercial use/research and therefore is **not** the V1 commercial production map provider.
- Stadia Maps Free — current free plan prohibits commercial use and therefore is **not** approved for V1 production.
- Jawg free/basic — current free offering is non-commercial; do not use for commercial V1.
- Any Google Maps Platform API/SDK usage that requires billing — **not part of the zero-cost baseline**.
- Supabase PITR — paid add-on and not part of zero-cost V1.
- Any paid Netlify plan or paid credits — owner approval required.
- Any paid email plan — owner approval required.
- Any paid observability/SLA plan — owner approval required.

---

# 3. Current Provider Verification — 31 August 2026

The provider facts below were checked against current public documentation at architecture-generation time.

## 3.1 Netlify

Current Netlify pricing lists a Free plan at `$0`, with:

- 300 credits/month;
- custom domains with SSL;
- unlimited deploy previews;
- global CDN;
- functions;
- core deployment support.

Current Netlify documentation states that the Free plan has a hard monthly credit limit and no auto-recharge option. When limits are exceeded, projects pause rather than silently creating paid overages.

Netlify's self-serve agreement says the Free Usage Tier has no SLA and may be changed, discontinued, or terminated at Netlify's discretion.

**Decision:** Netlify Free is the V1 zero-cost hosting target, but the application must remain portable and the team must not assume SLA-grade availability.

Source references:

- https://www.netlify.com/pricing/
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/
- https://www.netlify.com/legal/self-serve-subscription-agreement/

## 3.2 Vercel

Current Vercel Terms state that the Hobby plan is for personal/non-commercial use.

**Decision:** Do not use Vercel Hobby for UrbanEdge Land Space production.

Source references:

- https://vercel.com/legal/terms
- https://vercel.com/pricing

## 3.3 Supabase

Current Supabase pricing lists Free at `$0` and currently includes, per project:

- 500 MB database size;
- 1 GB file storage;
- 5 GB egress;
- 5 GB cached egress;
- 50,000 MAU;
- 2 active Free-plan projects.

The current Free plan can pause after low activity over a seven-day period.

Current Supabase documentation says managed downloadable daily backups are not available for Free-plan projects and explicitly recommends regular CLI `db dump` exports/off-site backups for Free projects.

Branching is not included in Free.

**Decision:** Supabase Free is accepted as the initial V1 database/backend tier with explicit operational safeguards. Production backup requirements cannot rely on managed downloadable backups.

Source references:

- https://supabase.com/pricing
- https://supabase.com/docs/guides/platform/free-project-pausing
- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/deployment/going-into-prod

## 3.4 Resend

Current Resend Free pricing lists:

- `$0/month`;
- 3,000 emails/month;
- 100 emails/day;
- 3 verified domains;
- 30-day data retention;
- production access without a separate approval gate.

A verified owned domain is required for sending from the client's domain.

**Decision:** Resend Free is the initial email provider for transactional notifications, provided volume remains inside the published limits.

Source references:

- https://resend.com/pricing
- https://resend.com/docs/knowledge-base/does-resend-require-production-approval
- https://resend.com/docs/dashboard/domains/introduction

## 3.5 Cloudflare Turnstile

Current Cloudflare Turnstile documentation lists a Free plan intended for small/medium businesses and most production applications.

Current Free limits include:

- up to 20 widgets;
- unlimited challenges/verification requests;
- up to 10 hostnames per widget.

**Decision:** Turnstile Free is approved as the V1 CAPTCHA/anti-bot mechanism.

Source:

- https://developers.cloudflare.com/turnstile/plans/

## 3.6 Cloudflare Web Analytics

Current Cloudflare documentation lists Cloudflare Web Analytics site limits and provides the service as part of Cloudflare's web analytics offering.

V1 uses privacy-conscious, business-focused analytics and does not use ad pixels, invasive session replay or covert fingerprinting.

**Decision:** Cloudflare Web Analytics is the zero-cost default analytics layer.

Source:

- https://developers.cloudflare.com/web-analytics/limits/

## 3.7 Cloudflare DNS

Current Cloudflare DNS documentation states that authoritative DNS is available free on all plans and does not charge for DNS queries on Free, Pro or Business plans.

**Decision:** Cloudflare Free DNS is the preferred DNS layer. The registrar remains unchanged.

Source:

- https://developers.cloudflare.com/dns/faq/

## 3.8 OpenFreeMap + MapLibre

Current OpenFreeMap documentation states:

- public instance is free;
- no registration or API key is required;
- there is no stated limit on map views/requests;
- commercial use is explicitly allowed;
- attribution is required;
- the service has no SLA guarantee.

OpenFreeMap is based on OpenStreetMap data and is intended to work with MapLibre.

**Decision:** OpenFreeMap is the preferred zero-cost map provider for V1, with a configurable provider adapter and an explicit no-SLA contingency.

Source references:

- https://openfreemap.org/
- https://openfreemap.org/quick_start/
- https://openfreemap.org/tos/

**Important:** This does not mean OpenStreetMap's public tile servers should be used directly. OSMF's public tile-service policy warns that heavy/inappropriate usage can be blocked and explicitly notes that commercial services should be especially aware that service access can be withdrawn.

Source:

- https://operations.osmfoundation.org/policies/tiles/

## 3.9 Google Maps URLs

Google Maps URLs can launch Maps, directions and search behavior without a Google Maps API key.

**Decision:** Use Google Maps URLs for the "Get Directions", navigation, and map handoff CTA. Do not make V1 dependent on Google Maps Platform APIs.

Source:

- https://developers.google.com/maps/documentation/urls/get-started

---

# 4. Final Infrastructure Topology

```text
                           ┌───────────────────────────┐
                           │      DOMAIN REGISTRAR     │
                           │ urbanedgelandspace.com    │
                           └─────────────┬─────────────┘
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │     CLOUDFLARE DNS         │
                           │     Free / Authoritative   │
                           └─────────────┬─────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
              ┌─────────────────────┐        ┌─────────────────────┐
              │   NETLIFY FREE       │        │   RESEND FREE       │
              │ Next.js application  │        │ transactional email │
              └──────────┬───────────┘        └─────────────────────┘
                         │
                         │ server-side HTTPS
                         ▼
              ┌─────────────────────────────┐
              │     SUPABASE PRODUCTION     │
              │ PostgreSQL                  │
              │ Auth                        │
              │ Storage                     │
              │ RLS                         │
              └─────────────────────────────┘

LOCAL
  └─ Supabase CLI/local Postgres
       └─ migrations + tests

PREVIEW/STAGING
  └─ Netlify Deploy Preview
       └─ Supabase STAGING project

PRODUCTION
  └─ Netlify production deploy
       └─ Supabase PRODUCTION project

PUBLIC PROVIDERS
  ├─ OpenFreeMap + MapLibre
  ├─ Google Maps URLs
  ├─ Cloudflare Turnstile
  └─ Cloudflare Web Analytics
```

---

# 5. Environment Model

## 5.1 Required environments

Exactly three logical environments are required:

```text
LOCAL
  ↓
PREVIEW / STAGING
  ↓
PRODUCTION
```

Because Supabase Free currently permits only two active Free-plan projects, the recommended topology is:

| Environment | Application | Database |
|---|---|---|
| LOCAL | local Next.js | local Supabase / local Postgres |
| PREVIEW/STAGING | Netlify deploy preview | Supabase STAGING Free project |
| PRODUCTION | Netlify production | Supabase PRODUCTION Free project |

Do **not** create a third cloud Supabase development project under Free.

## 5.2 Why local Supabase is preferred

Local development avoids consuming a cloud Supabase project for:

- destructive experiments;
- migration development;
- seed resets;
- automated integration tests;
- local file testing;
- broken-schema experiments.

Use Supabase CLI for local infrastructure where Docker/system support is practical.

## 5.3 Preview strategy

Netlify deploy previews are the application preview environment.

Every pull request should be capable of creating a preview build.

The preview build must use:

- staging site URL;
- staging Supabase project;
- staging storage;
- staging Turnstile site key/secret pair;
- staging Resend domain/sender where email testing is enabled;
- staging analytics configuration;
- demo/test data only.

Do not allow preview builds to write to production.

## 5.4 Production strategy

Production deploys use:

- production Netlify site;
- production environment variables;
- production Supabase project;
- production Storage buckets;
- production email domain;
- production Turnstile host configuration;
- production analytics;
- production domain.

Real client data must never be introduced into staging.

---

# 6. Supabase Project Architecture

## 6.1 Project separation

Create:

```text
urbanedge-landspace-staging
urbanedge-landspace-production
```

The two projects must have independent:

- project refs;
- API URLs;
- anon/publishable keys;
- service-role secrets;
- databases;
- Auth configuration;
- Storage buckets;
- RLS;
- email configuration;
- auth redirect URLs.

Never reuse production credentials in staging.

## 6.2 Supabase schema ownership

The repository is the source of truth for:

- tables;
- views;
- functions;
- policies;
- indexes;
- constraints;
- storage policies;
- reference data;
- seed data.

Manual dashboard changes may be used for provider configuration but must not become the only source of truth for database schema.

## 6.3 Required storage buckets

The authoritative media bucket set remains:

```text
property-media-public
property-media-private
verification-documents-private
owner-submissions-private
guide-media-public
```

No public bucket may contain:

- legal evidence;
- owner identity documents;
- private verification material;
- private coordinates;
- sensitive owner attachments.

## 6.4 Storage cost policy

Because Supabase Free currently includes 1 GB file storage per project, V1 must aggressively protect storage:

- compress property images;
- avoid giant originals where reprocessing policy does not require them;
- do not store large video files;
- use external video hosting;
- archive retired assets;
- detect duplicates by SHA-256;
- reconcile orphaned objects;
- log/monitor bucket usage;
- define warning thresholds.

Recommended operational thresholds:

```text
50% of quota  → observe
70%           → investigate/clean
85%           → owner-facing warning
90%           → stop non-essential uploads
95%           → production storage freeze pending decision
```

These are internal operating thresholds, not provider limits.

---

# 7. Next.js Hosting Architecture

## 7.1 Hosting target

Use:

**Netlify Free**

for the initial commercial V1.

The application must use standard Next.js APIs:

- App Router;
- Server Components;
- Server Actions;
- Route Handlers;
- standard `next/image`;
- standard `next/font`;
- framework-neutral server utilities.

Avoid deep coupling to proprietary Netlify APIs.

## 7.2 Netlify site structure

Use one Netlify site for the production application.

Use:

```text
Production:
https://urbanedgelandspace.com

Netlify default/technical domain:
<site-name>.netlify.app

Preview:
Netlify-generated deploy-preview URLs
```

A separate permanent staging hostname is optional.

Recommended:

```text
staging.urbanedgelandspace.com
```

only when it materially improves client review and the owner approves exposing/configuring that hostname.

The production site must never be replaced by a preview URL.

## 7.3 Build contract

Production build command:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

The exact script names may be adapted to the repository, but a production build must be reproducible from a clean checkout.

## 7.4 Deploy behavior

Recommended Git workflow:

```text
feature branch
   ↓
Pull Request
   ↓
Netlify Preview
   ↓
CI checks
   ↓
review / approval
   ↓
main
   ↓
production deploy
```

Never deploy unreviewed local working-tree output directly to production.

---

# 8. Domain and DNS Architecture

## 8.1 Domain

Primary:

```text
urbanedgelandspace.com
```

Canonical public host:

```text
https://urbanedgelandspace.com
```

Preferred redirect:

```text
https://www.urbanedgelandspace.com
    → 301 →
https://urbanedgelandspace.com
```

or the reverse, if client preference/brand conventions dictate. Choose one canonical host and enforce it consistently.

Do not purchase another domain for V1.

## 8.2 DNS provider

Use:

**Cloudflare Free DNS**

with the existing registrar retained.

The registrar does not need to be transferred merely to use Cloudflare DNS.

Change only the authoritative nameservers to Cloudflare when the owner approves the DNS migration.

## 8.3 Required DNS categories

Exact records are provider-generated and must be copied from the current Netlify/Resend dashboards at deployment time.

Conceptually:

### Web

```text
A / ALIAS / CNAME as instructed by Netlify
```

### Email authentication

```text
SPF
DKIM
DMARC
```

### Optional staging

```text
staging → Netlify preview/staging target
```

Do not hand-invent Netlify or Resend DNS values.

## 8.4 DNS change procedure

1. Record existing DNS.
2. Lower TTLs in advance where practical.
3. Add Cloudflare account.
4. Import DNS records.
5. Compare imported records against registrar DNS.
6. Point authoritative nameservers to Cloudflare.
7. Verify website.
8. Verify email.
9. Verify SPF/DKIM/DMARC.
10. Confirm no unrelated DNS records were lost.
11. Document the final zone.

## 8.5 DNS ownership rule

The client/domain owner must own or control:

- domain registrar account;
- Cloudflare account;
- production Netlify team/site;
- production Supabase organization/project;
- Resend organization/domain;
- any future paid provider account.

Do not make a developer's personal account the long-term owner of production infrastructure.

---

# 9. TLS / HTTPS

Production must use HTTPS only.

Requirements:

- Netlify-managed TLS;
- HTTP → HTTPS redirect;
- canonical host redirect;
- HSTS after validating domain/proxy behavior;
- no mixed content;
- secure cookies where applicable.

Do not upload or maintain custom TLS certificates in V1 unless a future architecture requires them.

---

# 10. Environment Variable Architecture

## 10.1 Rules

Use environment variables for secrets and environment-specific infrastructure configuration.

Never put secrets in:

```text
NEXT_PUBLIC_*
```

Never place secrets in:

- Git;
- `.env.example`;
- browser localStorage;
- URL query strings;
- client bundles;
- analytics events;
- public HTML;
- public JSON;
- database business settings.

## 10.2 Canonical environment variables

Recommended baseline:

```dotenv
# Environment identity
APP_ENV=local|staging|production
NEXT_PUBLIC_SITE_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_REPLY_TO=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Map configuration
NEXT_PUBLIC_MAP_STYLE_URL=
NEXT_PUBLIC_MAP_PROVIDER=

# Analytics
NEXT_PUBLIC_ANALYTICS_ENABLED=

# Optional hardening/integrations
HMAC_SECRET=
WEBHOOK_SIGNING_SECRET=
```

Actual variable names may follow the repository's implementation, but the public/private separation is mandatory.

## 10.3 Public variables

Allowed in browser:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_TURNSTILE_SITE_KEY
NEXT_PUBLIC_MAP_STYLE_URL
NEXT_PUBLIC_MAP_PROVIDER
NEXT_PUBLIC_ANALYTICS_ENABLED
```

The Supabase anon/publishable key is not itself a privileged secret. Its safety depends on the database grants/RLS architecture.

## 10.4 Server-only secrets

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
TURNSTILE_SECRET_KEY
HMAC_SECRET
WEBHOOK_SIGNING_SECRET
```

## 10.5 `.env.example`

Commit only names and safe placeholders:

```dotenv
APP_ENV=
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

Never commit real credentials.

---

# 11. Secret Management

## 11.1 Owner-of-record

Production secrets belong in the production deployment platform's secret/environment-variable store and the relevant provider's secure credential system.

The repository contains no production secrets.

## 11.2 Secret rotation

Rotate when:

- a secret is suspected exposed;
- a developer leaves access;
- the provider shows suspicious use;
- the secret appears in logs;
- the secret appears in Git history;
- the environment ownership changes.

## 11.3 Service-role key policy

The Supabase service-role credential bypasses RLS and is therefore a privileged server secret.

Allowed:

```text
server-only modules
server actions
server route handlers
trusted operational tooling
controlled migration scripts
```

Forbidden:

```text
NEXT_PUBLIC_*
client code
browser storage
cookies
query strings
analytics
logs
Git
public HTML
public JSON
database app settings
```

## 11.4 Secret names vs business settings

Do not put secrets in `app_settings`.

`app_settings` may contain business-safe configuration such as:

- business phone;
- WhatsApp number;
- office email;
- office address;
- business hours;
- social URLs;
- SEO defaults;
- notification email;
- service-area configuration.

Secrets remain environment/provider configuration.

---

# 12. Email Architecture

## 12.1 Provider

Use:

**Resend Free**

for transactional email.

Use it for:

- lead notification;
- inquiry notification;
- site visit notification;
- owner-submission notification;
- admin operational notices;
- selected confirmation emails.

## 12.2 Email architecture

```text
Public form
    ↓
Next.js server action / route handler
    ↓
PostgreSQL transaction
    ↓
notification enqueue/attempt
    ↓
Resend
    ↓
recipient
```

Email is **not** the source of truth.

If email fails:

```text
lead remains created
```

The application records notification failure separately.

## 12.3 Email identity

Recommended domain separation:

```text
updates.urbanedgelandspace.com
```

or a similarly owned transactional subdomain.

Benefits:

- isolates sending reputation;
- separates transactional email from future marketing email;
- reduces future migration complexity.

## 12.4 DNS email records

Configure provider-generated:

- SPF;
- DKIM;
- DMARC.

Start with a conservative DMARC policy appropriate to the owner's existing email environment. Do not break the client's mailbox flows by blindly replacing existing SPF/DMARC records.

## 12.5 Free-tier guardrails

Current Resend Free limits include:

```text
3,000 emails/month
100 emails/day
3 verified domains
```

Operational safeguards:

- do not send one email per page view;
- do not send repetitive admin alerts;
- debounce duplicate form notifications;
- store notification attempt state;
- monitor daily/monthly usage;
- alert before quota exhaustion;
- stop non-critical notifications if quota pressure appears.

## 12.6 Upgrade triggers

Owner approval is required when:

- > 80% of monthly email quota for two consecutive months;
- > 80% daily volume regularly;
- transactional mail needs exceed 3,000/month;
- deliverability/support/SLA needs justify paid infrastructure;
- marketing email requirements exceed the transactional design.

---

# 13. Analytics Architecture

## 13.1 Primary analytics

Use:

**Cloudflare Web Analytics**

for low-cost, privacy-conscious site analytics.

## 13.2 Business events

Application events should include:

```text
page_view
property_view
search
inquiry
whatsapp_click
call_click
site_visit_request
buyer_requirement
owner_submission
lead_source
```

## 13.3 Privacy limits

Do not implement:

- covert fingerprinting;
- third-party ad pixels;
- invasive session replay;
- unnecessary personal identifiers.

Avoid sending:

- owner phone;
- owner email;
- exact coordinates;
- private property IDs where not necessary;
- document IDs;
- private lead content.

## 13.4 Analytics failure behavior

Analytics failure must never block:

- property browsing;
- inquiry;
- site visit request;
- Sell Your Land;
- admin operations.

Analytics is non-critical.

---

# 14. Map Infrastructure

## 14.1 Map renderer

Use:

**MapLibre GL JS**

as the rendering layer.

## 14.2 Default map provider

Use:

**OpenFreeMap**

for V1 public maps.

Configure a provider interface:

```text
MapProvider
  ├── getStyleUrl()
  ├── getAttribution()
  ├── getProviderName()
  └── supports(feature)
```

Do not hard-code OpenFreeMap URLs into every component.

## 14.3 Map privacy

Public maps must use only public-safe coordinates.

Rules:

```text
EXACT private coordinate
        ↓
privacy transformation
        ↓
public-safe coordinate
        ↓
MapLibre
```

The public map must never reveal:

- exact private latitude;
- exact private longitude;
- private location notes;
- survey/reference details;
- private coordinates in hidden JSON.

## 14.4 No direct OSM tile dependency

Do not use:

```text
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

as an unrestricted production raster dependency.

Use the approved OSM-derived provider instead.

## 14.5 Navigation handoff

Use Google Maps URLs:

```text
Get Directions
    ↓
https://www.google.com/maps/dir/?api=1...
```

No Google Maps API key is required for this URL-based navigation pattern.

## 14.6 Map fallback

If the interactive map provider fails:

1. show a clear map-unavailable state;
2. show safe location text;
3. preserve "Open in Google Maps";
4. never reveal private coordinates just to repair the map;
5. do not expose provider errors to visitors.

## 14.7 Map upgrade trigger

Owner approval required when:

- map availability is repeatedly unacceptable;
- provider announces a material policy change;
- map volume becomes operationally significant;
- client requires routing/geocoding/search APIs;
- client requires SLA/support;
- public map demand exceeds the chosen provider's operational capacity.

Do not silently switch to a paid map API.

---

# 15. CAPTCHA / Abuse Protection

## 15.1 CAPTCHA

Use:

**Cloudflare Turnstile Free**

on high-abuse public mutation flows:

- inquiry;
- site visit;
- buyer requirement;
- Sell Your Land;
- contact;
- owner attachments if applicable.

## 15.2 Server-side verification

Turnstile verification must occur server-side.

Flow:

```text
Browser
  ↓
Turnstile token
  ↓
Next.js server
  ↓
Turnstile verification API
  ↓
only then:
  validation
  rate limit
  database mutation
  notification
```

Never trust a client flag such as:

```text
captchaPassed: true
```

## 15.3 Rate limiting

CAPTCHA does not replace rate limiting.

Apply defense-in-depth:

```text
per-IP / privacy-safe identifier
+
per-form
+
per-path
+
request body validation
+
Turnstile
+
origin validation
+
duplicate detection
```

The security architecture requires public mutations to enter through server-owned paths rather than direct anonymous CRM/table inserts.

## 15.4 Honeypot

Use a low-cost honeypot field in addition to Turnstile.

Example:

```text
website
```

The field should normally remain empty. Submissions that populate it can be rejected or silently dropped.

## 15.5 Abuse response

When abuse spikes:

1. rate-limit aggressively;
2. increase Turnstile enforcement;
3. disable non-essential attachment submission if necessary;
4. preserve legitimate lead capture;
5. inspect Netlify/Supabase usage;
6. avoid accidental paid overage;
7. escalate only if service limits cannot sustain the attack.

---

# 16. Public Form Infrastructure

All public forms use:

```text
browser
  ↓
Next.js server action / Route Handler
  ↓
origin check
  ↓
request size limit
  ↓
Turnstile
  ↓
rate limit
  ↓
Zod/schema validation
  ↓
normalization
  ↓
business rule checks
  ↓
Supabase transaction
  ↓
audit/activity
  ↓
notification attempt
  ↓
safe response
```

Never allow:

```text
browser
  ↓
anon INSERT into leads
```

or equivalent privileged direct writes.

---

# 17. Supabase Authentication

## 17.1 Admin auth

Only the UrbanEdge administrator needs V1 authentication.

Recommended:

- Supabase Auth;
- email/password or provider-supported secure login selected by owner;
- active admin profile check;
- optional MFA when available/appropriate;
- secure session cookies;
- explicit admin authorization on every sensitive operation.

## 17.2 Redirect URLs

Staging and production use separate allowed redirect URLs.

Conceptually:

```text
https://staging.urbanedgelandspace.com/auth/callback
https://urbanedgelandspace.com/auth/callback
```

Do not whitelist arbitrary `*` redirect destinations.

## 17.3 Authentication email

Supabase Auth email configuration should use the client-controlled email provider rather than relying indefinitely on provider defaults for production deliverability.

Resend is the preferred V1 provider.

---

# 18. Database Migration Architecture

## 18.1 Source of truth

Database schema is stored in:

```text
supabase/migrations/
```

Every schema change is represented by a migration.

## 18.2 Migration lifecycle

```text
local schema change
   ↓
migration file
   ↓
local reset/apply
   ↓
unit/integration tests
   ↓
staging migration
   ↓
staging verification
   ↓
production approval
   ↓
production migration
```

## 18.3 Migration rules

Never:

- manually change production schema without recording it;
- destroy production data as part of a normal deploy;
- combine unrelated risky schema changes into an opaque migration;
- run unknown SQL against production;
- make automatic destructive migrations part of a push-to-production button.

## 18.4 Safe migration pattern

Prefer:

### Phase A

Add new nullable column/table/index.

### Phase B

Deploy code that can read old + new state.

### Phase C

Backfill safely.

### Phase D

Switch reads/writes.

### Phase E

Remove old structure only after observation and an explicit migration decision.

This supports rollback of application versions without requiring an impossible database time travel operation.

## 18.5 Production migration gate

Before applying a production migration:

```text
[ ] clean Git state
[ ] migration reviewed
[ ] staging migration succeeded
[ ] backups/export completed
[ ] rollback plan documented
[ ] affected tables identified
[ ] expected lock/time impact reviewed
[ ] production approval recorded
```

---

# 19. Backup Architecture

## 19.1 Important Free-plan limitation

Current Supabase documentation states that managed database backups are not available for download on the Free plan.

Supabase recommends CLI/database dump exports and off-site backup handling for Free projects.

Therefore:

> **A Free Supabase project does not satisfy the required business recovery posture by itself.**

The project must have an additional logical-backup procedure.

## 19.2 Backup types

### A. Schema/migration backup

Already protected in Git:

```text
supabase/migrations/
supabase/seed/
```

### B. Database logical backup

Create with Supabase CLI / PostgreSQL dump tooling.

Conceptually:

```bash
supabase db dump --db-url "$SUPABASE_DB_URL" -f backups/prod-YYYY-MM-DD.sql
```

Use the exact current CLI syntax validated against the installed CLI version.

### C. Storage/media backup

Supabase database dumps do not contain actual Storage object binaries.

Therefore storage recovery requires:

- known object paths;
- media relational inventory;
- owner retention of original media where required;
- export/synchronization tooling for critical private assets where business policy requires it.

## 19.3 Backup contents

A logical backup may contain:

- leads;
- owner PII;
- internal notes;
- audit records;
- private document metadata;
- property data.

Therefore:

**never commit a raw production dump to Git.**

## 19.4 Backup encryption

Production backups containing client/customer data must be encrypted at rest.

Recommended flow:

```text
pg_dump
  ↓
compress
  ↓
encrypt
  ↓
checksum
  ↓
store in owner-controlled secure location
```

## 19.5 Backup frequency

Zero-cost-first minimum:

```text
Weekly full logical DB backup
+
Pre-migration backup/export
+
Pre-major-content-change backup/export
```

Higher frequency is recommended once lead volume becomes material.

## 19.6 Backup verification

At least monthly:

1. create a fresh backup;
2. verify checksum;
3. test decrypt;
4. restore to a disposable local/staging database;
5. run smoke queries;
6. record result.

A backup that has never been restored is not considered verified.

## 19.7 RPO/RTO expectations

Zero-cost V1 should explicitly document:

- **RPO:** up to approximately 7 days under the minimum weekly backup schedule, except where pre-change backups improve practical recoverability;
- **RTO:** dependent on manual restore/redeployment and therefore not SLA-grade.

If the business requires near-zero RPO or rapid automated recovery:

**paid infrastructure is required and owner approval must occur.**

---

# 20. Backup of Environment and Infrastructure Metadata

Back up/document:

```text
production domain
DNS zone
Netlify site identifiers
Supabase project refs
bucket names
migration version
email domain
email DNS records
Turnstile host configuration
analytics site configuration
provider URLs
critical environment-variable names
secret rotation dates
```

Do **not** back up raw secrets in a plaintext operational document.

---

# 21. Rollback Architecture

## 21.1 Application rollback

Primary mechanism:

```text
previous known-good Netlify deploy
```

Rollback procedure:

1. identify last known-good deployment;
2. verify database compatibility;
3. promote/redeploy the known-good build;
4. restore environment variables if changed;
5. smoke-test;
6. monitor;
7. record incident.

## 21.2 Database rollback

Database rollback is not automatically equivalent to code rollback.

Prefer forward-compatible migrations.

For destructive/data-changing failures:

- restore from logical backup where appropriate;
- or create a corrective migration;
- do not assume automatic point-in-time restore exists on Free.

## 21.3 Storage rollback

Because public media objects use stable immutable identifiers:

```text
old object remains archived
new object is activated
```

Rollback can restore the old relational media selection without overwriting binary objects.

## 21.4 Domain rollback

DNS changes should be minimized.

During initial deployment:

```text
Netlify technical URL
   ↓
verification
   ↓
production domain
```

Do not move nameservers repeatedly during incident response unless absolutely necessary.

---

# 22. Release / Deployment Procedure

## 22.1 Developer validation

Run locally:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Then:

```bash
supabase db reset
supabase db lint   # if supported by project/tooling
```

and the repository's migration/integration test suite.

## 22.2 Pull request

Every production-bound change goes through:

```text
feature branch
↓
PR
↓
Netlify Preview
↓
staging Supabase migration
↓
E2E / accessibility / smoke tests
↓
review
```

## 22.3 Production release

Ordered:

1. Confirm owner approval.
2. Confirm production secrets are present.
3. Confirm backup/export completed if schema/data risk exists.
4. Confirm migration set is known.
5. Apply migration using controlled procedure.
6. Run production build/deploy.
7. Verify application health.
8. Verify public pages.
9. Verify admin login.
10. Verify one safe form flow.
11. Verify email.
12. Verify Turnstile.
13. Verify public media.
14. Verify maps.
15. Verify analytics.
16. Verify robots/sitemap/canonical.
17. Record deployment identifier.
18. Monitor.

## 22.4 No automatic production database mutation

A Git push must not blindly:

```text
push code
→ destroy schema
→ alter production data
```

Any production migration is a deliberate deployment step.

---

# 23. Production Health Checks

Create an admin-only operational health page that exposes state, not secrets.

Checks:

```text
[ ] database reachable
[ ] storage reachable
[ ] public bucket reachable
[ ] private storage configured
[ ] email provider configured
[ ] email last attempt status
[ ] Turnstile configured
[ ] site URL configured
[ ] analytics configured
[ ] map provider configured
[ ] migration version known
[ ] environment identity known
```

Do not expose:

- secret values;
- service-role key;
- API key;
- private bucket path;
- raw provider responses containing credentials.

---

# 24. Observability Without Paid Monitoring

## 24.1 Logs

Use structured server logs for:

- request failures;
- action failures;
- integration failures;
- authorization failures;
- migration/version mismatch;
- unexpected state transitions.

## 24.2 Never log

- passwords;
- access tokens;
- service-role keys;
- Resend keys;
- Turnstile secrets;
- private documents;
- sensitive owner data unnecessarily;
- exact private coordinates;
- full lead payloads unless explicitly necessary.

## 24.3 Provider dashboards

Use free dashboards for:

- Netlify usage;
- Supabase usage;
- Resend delivery/quota;
- Turnstile usage;
- Cloudflare DNS/analytics.

No paid APM is required in V1.

---

# 25. Free-Tier Budget Guardrails

## 25.1 Netlify

Current Free plan:

```text
300 credits/month
hard limit
no auto recharge
```

Current published credit examples include:

```text
production deploy: 15 credits
preview deploy: 0 credits
compute: 10 credits / GB-hour
bandwidth: 20 credits / GB
web requests: 2 credits / 10,000 requests
```

The application must keep preview deployments because they are efficient for review without consuming production-deploy credits, subject to the provider's current rules.

Operational thresholds:

```text
50% monthly credits → observe
70%                → investigate
80%                → owner warning
90%                → freeze unnecessary production deploys
100%               → expect service pause until reset
```

Do not enable any paid recharge mechanism.

## 25.2 Supabase

Current Free plan headline limits include:

```text
500 MB DB
1 GB storage
5 GB egress
5 GB cached egress
50,000 MAU
2 active projects
```

Guardrails:

- compress photos;
- no large videos;
- avoid unnecessary Realtime;
- avoid broad data exports;
- paginate admin tables;
- optimize indexes;
- monitor database size;
- monitor storage;
- monitor egress.

## 25.3 Resend

Current Free plan:

```text
3,000 emails/month
100/day
3 verified domains
```

Guard against notification loops and spam-driven cost/limit exhaustion.

## 25.4 Turnstile

Current Free plan:

```text
20 widgets
unlimited challenges/verification requests
```

This is ample for V1.

## 25.5 Maps

OpenFreeMap currently states no request/view limit for its public instance but no SLA.

Do not confuse:

```text
free
```

with:

```text
guaranteed availability
```

---

# 26. Abuse and Cost-Explosion Protection

The largest zero-cost infrastructure risks are not ordinary users; they are:

- form spam;
- media upload abuse;
- bot traffic;
- repeated image requests;
- automated scraping;
- oversized payloads;
- email notification amplification.

Required controls:

```text
request body size limits
+
Turnstile
+
honeypot
+
rate limiting
+
duplicate detection
+
upload validation
+
image dimension limits
+
MIME inspection
+
public/private bucket separation
+
no large videos
+
email notification deduplication
```

No provider should be allowed to generate unbounded billable behavior without an explicit owner-approved paid plan.

---

# 27. Media Upload Deployment Rules

Public property images:

```text
browser upload
  ↓
server authorization
  ↓
content validation
  ↓
MIME verification
  ↓
dimension verification
  ↓
pixel-count safety check
  ↓
EXIF/GPS removal
  ↓
compression/normalization
  ↓
checksum
  ↓
private/staging object
  ↓
admin approval
  ↓
public promotion
```

Never accept:

```text
client-chosen bucket
client-chosen path
client-chosen visibility
```

Large video binaries are out of scope for V1 hosting.

---

# 28. Portability Architecture

The application must be capable of moving away from any single provider.

## 28.1 Hosting portability

Avoid:

- proprietary Netlify-only server abstractions unless necessary;
- Netlify-specific business logic;
- database logic inside deployment-specific functions where a standard Next.js route can do the job;
- platform-only environment assumptions.

Target portability:

```text
Netlify
   ↓
Vercel Pro
   ↓
self-hosted Node/Next-compatible platform
```

The V1 architecture must not require redesign to make this move.

## 28.2 Database portability

Supabase uses PostgreSQL.

Keep business logic compatible with standard PostgreSQL wherever practical.

Avoid:

- non-portable vendor data models without reason;
- embedding core business state in provider-specific features;
- storing critical business records only in third-party services.

## 28.3 Storage portability

Store:

```text
provider-neutral media metadata
+
checksum
+
object path
+
MIME
+
dimensions
+
logical ownership
```

Avoid business meaning encoded into provider-specific URLs.

## 28.4 Email portability

Implement:

```text
EmailProvider
  ├── sendTransactional()
  ├── verifyConfiguration()
  └── getStatus()
```

Then keep Resend-specific code behind the adapter.

Future providers can include:

- Postmark;
- Amazon SES;
- another SMTP/API provider.

## 28.5 Map portability

Implement:

```text
MapProvider
  ├── style
  ├── attribution
  ├── marker behavior
  └── URL capabilities
```

Never make property logic depend directly on an OpenFreeMap URL.

## 28.6 Analytics portability

Use an internal event vocabulary:

```text
property_view
search
inquiry
site_visit_request
owner_submission
whatsapp_click
call_click
```

The analytics backend consumes these events.

---

# 29. Upgrade Triggers and Approval Matrix

No paid upgrade happens automatically.

| Trigger | Current response | Paid path | Owner approval |
|---|---|---|---|
| Netlify credits approach limit | reduce deploys/optimize traffic | Personal/Pro or alternative host | **Required** |
| Netlify requires SLA | remain on free only if acceptable | paid Netlify | **Required** |
| Supabase DB near 500 MB | optimize/archive | Supabase Pro | **Required** |
| Supabase storage near 1 GB | compress/archive | paid storage/plan | **Required** |
| Supabase egress near 5 GB | reduce payloads/CDN/public downloads | Pro or storage/CDN strategy | **Required** |
| Supabase inactivity pause becomes unacceptable | keep project active or monitor | Pro | **Required** |
| Supabase backup RPO too high | improve manual backups | Pro + backups/PITR | **Required** |
| Need PITR | cannot use Free-only solution | paid Supabase PITR/plan | **Required** |
| >3,000 transactional emails/month | reduce/deduplicate | paid Resend/other provider | **Required** |
| >100 emails/day repeatedly | reduce/queue | paid email provider | **Required** |
| Map provider reliability insufficient | use fallback/provider | paid commercial map provider | **Required** |
| Need geocoding/routing API | URL-only navigation no longer enough | paid geocoding/routing | **Required** |
| Need high availability | free tiers inadequate | paid multi-provider architecture | **Required** |
| Need enterprise support | free community tiers inadequate | paid support/SLA | **Required** |

---

# 30. Cost Approval Rules

The implementation team must **never**:

- enable auto-recharge;
- attach a payment card to an optional paid service without approval;
- upgrade Netlify;
- upgrade Supabase;
- enable PITR;
- enable paid map APIs;
- enable paid email tiers;
- add paid CAPTCHA;
- buy another domain;
- add paid monitoring.

A paid change must first be documented as:

```text
SERVICE
WHY NEEDED
CURRENT FREE LIMIT
OBSERVED USAGE
FREE ALTERNATIVE
FUNCTIONAL IMPACT
ESTIMATED COST
OWNER DECISION
DATE
```

---

# 31. Production Access Ownership

The client/owner should own:

```text
domain registrar
Cloudflare account
Netlify organization/site
Supabase organization/projects
Resend organization
```

Developer accounts may have controlled access but should not be the sole account recovery path.

Recommended account hygiene:

- use organization/shared business identity where provider supports it;
- enable MFA;
- maintain at least one owner recovery path;
- avoid personal email ownership;
- document recovery contacts securely.

---

# 32. Environment Matrix

| Configuration | Local | Staging | Production |
|---|---|---|---|
| `APP_ENV` | `local` | `staging` | `production` |
| Site URL | localhost | preview/staging URL | canonical public URL |
| Supabase | local | staging project | production project |
| Real data | no | no | yes |
| Demo data | yes | yes | no |
| Real email recipients | normally no | controlled | yes |
| Resend | dev/test | staging | production |
| Turnstile | test | staging | production |
| Analytics | disabled/optional | optional | enabled |
| Maps | OpenFreeMap | OpenFreeMap | OpenFreeMap |
| Public domain | no | optional staging | yes |
| Production secrets | no | no | yes |
| Destructive migrations | yes, local only | controlled | approval required |
| Backups | optional | optional | required |

---

# 33. Staging Data Policy

Staging must not receive:

- real owner documents;
- real legal records;
- real customer PII;
- real private coordinates;
- real CRM lead dumps.

Use synthetic data that is clearly marked:

```text
DEMO
TEST
STAGING
```

Never allow staging data to accidentally appear in production.

---

# 34. Production Seed Policy

Production seed may contain only:

- required configuration;
- verified geography/reference data;
- approved public settings;
- approved legal/SEO defaults.

Never seed:

- fake property inventory;
- fake owner records;
- fake leads;
- fake documents;
- fake testimonials represented as real.

---

# 35. Deployment Checklist

## Before first staging deployment

```text
[ ] Repository builds locally
[ ] Typecheck passes
[ ] Lint passes
[ ] Unit tests pass
[ ] Migration set is complete
[ ] Local Supabase reset works
[ ] RLS tests pass
[ ] Private document tests pass
[ ] Public projection tests pass
[ ] Media validation tests pass
[ ] Turnstile integration tested
[ ] Email provider tested
[ ] Map provider tested
```

## Before production infrastructure creation

```text
[ ] Owner approved service choices
[ ] Domain ownership confirmed
[ ] Cloudflare account ownership confirmed
[ ] Netlify account ownership confirmed
[ ] Supabase production project created
[ ] Production secrets generated
[ ] Resend domain verified
[ ] Turnstile production site configured
```

## Before production database migration

```text
[ ] Migration reviewed
[ ] Staging migration successful
[ ] Production backup/export completed
[ ] Migration rollback/correction plan written
[ ] Owner approval recorded
```

## Before production domain cutover

```text
[ ] Production site healthy on technical URL
[ ] HTTPS working
[ ] Admin login working
[ ] Public property pages working
[ ] Forms working
[ ] Email working
[ ] Turnstile working
[ ] Maps working
[ ] Analytics working
[ ] Sitemap working
[ ] Robots working
[ ] Canonical host correct
[ ] 404 working
[ ] Private data leakage tests passed
```

---

# 36. Post-Deployment Smoke Test

Immediately after production launch verify:

### Public

```text
/
 /properties
 /agricultural-land
 /na-land
 /industrial-land
 /property/[slug]
 /sell-your-land
 /contact
 /guides
```

### Conversion

```text
inquiry
site visit
buyer requirement
Sell Your Land
WhatsApp
Call
```

### Admin

```text
login
property create
property edit
media upload
media reorder
cover selection
verification
publication
lead update
site visit
private document access
audit log
```

### Infrastructure

```text
database
storage
email
Turnstile
map
analytics
DNS
TLS
```

---

# 37. Failure Handling

## 37.1 Netlify unavailable

Expected fallback:

- no direct infrastructure migration during a short transient event;
- use last-known-good deployment when possible;
- if prolonged, use documented portable Next.js deployment path.

## 37.2 Supabase unavailable

Public pages should fail gracefully.

Where possible:

- cached/static content remains available;
- forms show a retry state;
- no fabricated success message;
- no false confirmation that a lead was created.

## 37.3 Email unavailable

The lead remains in PostgreSQL.

Admin can view:

```text
notification = FAILED
```

## 37.4 Map unavailable

Show:

- safe location text;
- "Open in Google Maps";
- no private coordinates.

## 37.5 Turnstile unavailable

For protected flows:

- fail closed for suspicious/unprotected submissions;
- show a retry message;
- do not bypass anti-abuse protection automatically for production.

---

# 38. Security Headers and Deployment Boundary

Production should apply the established security baseline:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), browsing-topics=()
X-Frame-Options: DENY
Content-Security-Policy: <actual nonce-based production policy>
```

CSP must include only dependencies actually used by:

- Supabase;
- Turnstile;
- maps;
- analytics;
- media embeds where explicitly approved.

Do not use:

```text
script-src *
connect-src *
```

merely to make development convenient.

---

# 39. CI/CD Guardrails

Recommended CI stages:

```text
install
↓
lint
↓
typecheck
↓
unit tests
↓
integration tests
↓
security/RLS tests
↓
production build
```

For staging/preview:

```text
deploy preview
↓
Playwright smoke tests
↓
accessibility checks
↓
SEO checks
```

For production:

```text
approval
↓
migration gate
↓
deploy
↓
post-deploy smoke tests
```

---

# 40. Git / Repository Rules

Never commit:

```text
.env
.env.local
production SQL dumps
private documents
provider API keys
service-role keys
Turnstile secrets
Resend keys
customer exports
```

Safe to commit:

```text
.env.example
migrations
seed configuration
provider adapter interfaces
deployment scripts
backup scripts without embedded secrets
documentation
test fixtures with synthetic data
```

---

# 41. Provider Adapter Boundaries

The application should use internal interfaces such as:

```ts
interface EmailProvider {
  sendTransactional(input: TransactionalEmailInput): Promise<EmailResult>;
}

interface MapProvider {
  getStyleUrl(): string;
  getAttribution(): string;
  getProviderName(): string;
}

interface AntiBotProvider {
  verifyToken(input: AntiBotVerificationInput): Promise<boolean>;
}

interface AnalyticsProvider {
  track(event: AnalyticsEvent): Promise<void> | void;
}
```

This isolates provider replacement from the domain model.

---

# 42. What Is Intentionally NOT in V1

The zero-cost-first production architecture does not include:

- paid CDN storage;
- paid object storage;
- paid managed Redis;
- paid queue systems;
- paid search engines;
- Elasticsearch/OpenSearch;
- paid maps;
- geocoding APIs;
- SMS;
- WhatsApp Business API;
- paid APM;
- paid error tracking;
- background-worker infrastructure unless a concrete provider need appears;
- large self-hosted video;
- multi-region database;
- read replicas;
- database sharding;
- paid PITR.

---

# 43. Upgrade / Scale Architecture

The migration path is intentionally:

```text
V1 Zero-Cost
    ↓
Optimize
    ↓
Identify actual bottleneck
    ↓
Owner approves specific upgrade
    ↓
Upgrade only affected layer
```

Avoid upgrading every infrastructure component just because one layer has grown.

Examples:

### More traffic, but DB is healthy

Upgrade hosting/CDN only.

### More database volume, but hosting is healthy

Upgrade Supabase only.

### More email

Upgrade email only.

### More map demand

Change map provider only.

### Higher availability requirement

Revisit hosting/database architecture as a separate project.

---

# 44. Recommended Upgrade Order

When paid infrastructure eventually becomes necessary, prefer:

1. **Supabase Pro / backup and operational reliability**
2. **Hosting tier if Netlify Free limits are reached**
3. **Paid map provider if map reliability/volume requires it**
4. **Email tier if notification volume requires it**
5. **Observability**
6. **Advanced scaling infrastructure only when measured demand justifies it**

This is a recommendation, not a pre-authorization.

---

# 45. Disaster Recovery Runbook

## Scenario A — Bad application deployment

```text
1. Stop further deploys.
2. Identify last known-good deploy.
3. Revert application deployment.
4. Verify DB compatibility.
5. Smoke-test.
6. Record incident.
```

## Scenario B — Bad migration

```text
1. Stop application mutations where necessary.
2. Identify migration.
3. Assess whether corrective migration is safer than restore.
4. Restore from logical backup if restoration is justified.
5. Re-run verified migration state.
6. Re-deploy compatible application.
```

## Scenario C — Data corruption

```text
1. Freeze affected workflow.
2. Preserve current evidence.
3. Identify last good backup.
4. Restore to disposable environment first.
5. Validate.
6. Restore/correct production.
7. Audit the incident.
```

## Scenario D — Provider outage

```text
1. Identify provider.
2. Degrade gracefully.
3. Preserve business state.
4. Do not substitute unsafe private data.
5. Activate documented fallback where available.
6. Escalate to paid/provider migration only with approval.
```

---

# 46. Ownership of Business Data

Core business data remains authoritative in UrbanEdge/Supabase:

```text
properties
publication state
availability
verification state
leads
site visits
owner submissions
buyer requirements
audit records
private documents metadata
```

External systems remain integrations:

```text
email
analytics
maps
CAPTCHA
hosting
```

If an external integration disappears, the business record must still exist.

---

# 47. Production Freeze Rules

Before production launch, freeze:

- infrastructure provider changes;
- schema changes;
- DNS experiments;
- analytics vendor changes;
- map provider changes;
- unreviewed npm dependency upgrades.

After launch, infrastructure changes require:

```text
reason
impact
rollback
owner awareness
```

---

# 48. Dependency Update Rule

Before upgrading infrastructure-sensitive packages:

- confirm Next.js compatibility with Netlify;
- confirm Supabase JS compatibility;
- confirm MapLibre compatibility;
- confirm Turnstile integration;
- run staging tests;
- run production build;
- verify provider docs if a major version is involved.

Do not upgrade a major infrastructure package in the same release as a risky database migration unless there is a compelling reason.

---

# 49. Zero-Cost Integrity Rules

The system is considered compliant with the owner's zero-cost-first policy only if all are true:

```text
[ ] production hosting is commercially permitted
[ ] no paid hosting plan has been activated
[ ] no auto-recharge is enabled
[ ] no paid map dependency is active
[ ] no paid email tier is active
[ ] no paid CAPTCHA is active
[ ] no paid observability service is required
[ ] no extra domain has been purchased
[ ] Supabase paid features are not active
[ ] the current provider limits are documented
[ ] owner-approved paid upgrade path exists
```

---

# 50. Production Approval Gate

The following actions are **explicitly owner-approval-only**:

```text
CREATE production infrastructure
CONNECT real domain
CHANGE authoritative DNS
APPLY production database migrations
INSERT real production inventory
UPLOAD real private owner/legal documents
ENABLE production email sending
PUBLISH website
UPGRADE a provider
ENABLE a paid feature
ATTACH billing/payment details
```

The implementation team may prepare everything, but these final mutations do not occur silently.

---

# 51. Exact First Deployment Sequence

## Phase 1 — Local

```text
1. Clone repository.
2. Install dependencies.
3. Create `.env.local`.
4. Start local Supabase.
5. Apply migrations.
6. Seed synthetic reference/demo data.
7. Run tests.
8. Run production build.
```

## Phase 2 — Staging

```text
1. Create/configure staging Supabase Free project.
2. Record project ref.
3. Apply migrations.
4. Create storage buckets.
5. Apply Storage/RLS policies.
6. Create staging admin.
7. Configure Resend staging sender/domain as required.
8. Configure staging Turnstile.
9. Connect Netlify repository.
10. Enable deploy previews.
11. Add staging environment variables.
12. Deploy.
13. Run E2E/accessibility/SEO tests.
```

## Phase 3 — Production preparation

```text
1. Create production Supabase project.
2. Create production storage buckets.
3. Apply migrations.
4. Apply RLS/storage policies.
5. Create production admin.
6. Configure production email domain.
7. Configure production Turnstile.
8. Configure production analytics.
9. Create production Netlify site.
10. Add production environment variables.
11. Deploy to Netlify technical URL.
12. Run full smoke suite.
13. Generate first production backup/export.
```

## Phase 4 — Domain

```text
1. Confirm owner approval.
2. Configure Cloudflare DNS.
3. Configure Netlify custom domain.
4. Add DNS records exactly as provider specifies.
5. Verify TLS.
6. Set canonical redirect.
7. Verify Resend DNS.
8. Verify SPF/DKIM/DMARC.
9. Verify robots/sitemap/canonical URLs.
```

## Phase 5 — Launch

```text
1. Confirm all production tests green.
2. Confirm free-tier limits documented.
3. Confirm no paid services activated.
4. Confirm owner approval.
5. Publish production.
6. Perform production smoke test.
7. Record deployment/version.
8. Begin regular quota/backup checks.
```

---

# 52. Backup and Operations Schedule

## Weekly

```text
[ ] production DB logical backup
[ ] inspect Supabase storage usage
[ ] inspect Netlify credit usage
[ ] inspect email usage
[ ] inspect error/notification failures
```

## Monthly

```text
[ ] restore-test latest backup
[ ] verify DNS
[ ] verify TLS
[ ] review admin accounts
[ ] review Turnstile usage
[ ] review analytics
[ ] review dependency updates
[ ] review provider terms/free-tier changes
```

## Quarterly

```text
[ ] provider commercial-term review
[ ] cost/upgrade trigger review
[ ] disaster recovery rehearsal
[ ] secret rotation assessment
[ ] domain ownership/access review
```

---

# 53. Provider Change Monitoring

Because free plans and commercial terms can change, maintain:

```text
docs/PROVIDER-LIMITS.md
```

Record:

```text
provider
plan
price
commercial-use status
quota
billing behavior
automatic-charge behavior
SLA
backup behavior
last verified date
upgrade trigger
source URL
```

The deployment architecture should be re-verified whenever:

- a provider changes pricing;
- a provider changes acceptable-use terms;
- a provider changes free-tier commercial status;
- a provider changes quotas materially;
- the client changes traffic expectations.

---

# 54. Current Verified Provider Summary

| Provider | Current Free Position | Commercial V1? | Important caveat |
|---|---|---|---|
| Netlify Free | $0, 300 credits/month | **Yes, selected** | no SLA; hard usage limit |
| Vercel Hobby | $0 | **No** | personal/non-commercial only |
| Supabase Free | $0 | **Yes, selected with safeguards** | inactivity pause; no downloadable managed backups; 2 project limit |
| Resend Free | $0, 3k/mo, 100/day | **Yes, selected** | notification volume must remain within limits |
| Cloudflare Turnstile Free | $0 | **Yes, selected** | 20 widgets |
| Cloudflare Web Analytics | $0 | **Yes, selected** | analytics is not operational APM |
| Cloudflare DNS Free | $0 | **Yes, selected** | domain registration itself is not free |
| OpenFreeMap | $0 public service | **Yes, selected** | no SLA; attribution required |
| MapTiler Free | $0 | **No** | non-commercial limitation |
| Stadia Maps Free | $0 | **No** | non-commercial limitation |
| Jawg free/basic | $0 | **No** | non-commercial limitation |
| Google Maps URLs | no API key | **Yes, selected for navigation** | not equivalent to Maps Platform API |
| Google Maps Platform APIs | pay-as-you-go | **No for zero-cost baseline** | billing-based |

---

# 55. Explicit Paid-Service Approval Template

Use this exact structure before any paid activation:

```text
SERVICE:
FEATURE:
CURRENT FREE LIMIT:
OBSERVED USAGE:
WHY FREE PATH IS NO LONGER SUFFICIENT:
FREE ALTERNATIVES CONSIDERED:
FUNCTIONAL IMPACT OF STAYING FREE:
ESTIMATED MONTHLY COST:
ESTIMATED ANNUAL COST:
AUTO-RENEWAL:
AUTO-RECHARGE:
OWNER DECISION:
APPROVAL DATE:
```

No paid activation is valid without an explicit owner decision.

---

# 56. Final Architecture Contract

UrbanEdge Land Space V1 shall be deployed as:

> **A commercially permitted zero-cost-first Next.js application hosted on Netlify Free, backed by two Supabase Free cloud projects (staging and production) plus local Supabase for development, using Cloudflare Free DNS, Resend Free for transactional notifications, Cloudflare Turnstile Free for abuse protection, Cloudflare Web Analytics for privacy-conscious analytics, OpenFreeMap + MapLibre for public maps, Google Maps URLs for navigation, server-owned migrations and mutations, manual logical database backups, strict secret separation, explicit production approval gates, and a provider-neutral architecture that can be upgraded or migrated without redesigning the business domain.**

The architecture deliberately accepts the operational limitations of free services instead of pretending they provide enterprise SLA, automatic PITR, unlimited storage, or unlimited compute.

No paid service is required for the intended V1 launch architecture **provided actual usage remains within the currently verified free limits and the business accepts the associated availability/backup constraints**.

Where a business requirement exceeds those constraints, the required paid upgrade is an explicit owner decision rather than an automatic infrastructure behavior.

---

# 57. Sources Checked at Generation Time

Primary sources:

- Netlify pricing: https://www.netlify.com/pricing/
- Netlify credit model: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
- Netlify billing limits: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/
- Netlify self-serve agreement: https://www.netlify.com/legal/self-serve-subscription-agreement/
- Vercel Terms: https://vercel.com/legal/terms
- Vercel pricing: https://vercel.com/pricing
- Supabase pricing: https://supabase.com/pricing
- Supabase free-project pausing: https://supabase.com/docs/guides/platform/free-project-pausing
- Supabase backups: https://supabase.com/docs/guides/platform/backups
- Supabase production checklist: https://supabase.com/docs/guides/deployment/going-into-prod
- Resend pricing: https://resend.com/pricing
- Resend production access: https://resend.com/docs/knowledge-base/does-resend-require-production-approval
- Resend domains: https://resend.com/docs/dashboard/domains/introduction
- Cloudflare Turnstile plans: https://developers.cloudflare.com/turnstile/plans/
- Cloudflare Web Analytics limits: https://developers.cloudflare.com/web-analytics/limits/
- Cloudflare DNS FAQ: https://developers.cloudflare.com/dns/faq/
- OpenFreeMap: https://openfreemap.org/
- OpenFreeMap quick start: https://openfreemap.org/quick_start/
- OpenFreeMap Terms: https://openfreemap.org/tos/
- OpenStreetMap tile policy: https://operations.osmfoundation.org/policies/tiles/
- Google Maps URLs: https://developers.google.com/maps/documentation/urls/get-started

---

# 58. Completion Standard

This infrastructure document is considered implemented only when:

```text
[ ] Local environment works
[ ] Staging environment works
[ ] Production environment exists but remains approval-gated until launch
[ ] Netlify commercial suitability verified
[ ] Supabase project separation verified
[ ] DNS architecture documented
[ ] Environment variable contract documented
[ ] Secret policy implemented
[ ] Resend configured/tested
[ ] Turnstile configured/tested
[ ] MapLibre/OpenFreeMap configured/tested
[ ] Google Maps URL handoff tested
[ ] Analytics configured
[ ] Backup process documented
[ ] Backup restore process tested
[ ] Migration process tested
[ ] Rollback process tested
[ ] Portability boundaries implemented
[ ] Provider limits documented
[ ] Upgrade triggers documented
[ ] No accidental paid service enabled
[ ] Production approval gate enforced
```

**End of `10-INFRASTRUCTURE-DEPLOYMENT.md`**
