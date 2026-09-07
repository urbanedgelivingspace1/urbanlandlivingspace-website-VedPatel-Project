# Local Development Runbook

## Install and validate

1. Use Node.js 22 LTS or a compatible Node.js version allowed by `package.json`.
2. Run `npm ci`.
3. Run `npm run qa` before committing.
4. Run `npm run dev` for the local application.

For a complete stateful local qualification after the Supabase stack is running:

```sh
supabase db reset
supabase db lint --level warning
supabase test db
npm run test:db:concurrency
npm run test:integration:local
npm run test:e2e:local
npm run build
```

`npm start` serves the production build. The database, integration and E2E commands above are
intentionally separate from the fast stateless `npm run qa` gate.

## Environment handling

Copy `.env.example` to `.env.local` only when configuration is required. The local file is ignored.
Do not use production credentials locally. No real secret belongs in examples, tests, fixtures,
documentation or shell history.

## Stateful test protection

Stateful application integration tests must run through `npm run test:integration:local`, and the
browser suite through `npm run test:e2e:local`. The guarded scripts require:

- `APP_ENV=test`;
- distinct test and production Supabase project references;
- distinct test and production origins;
- the explicit non-secret synthetic-test safety token defined by the repository guard.

The guard failing is a safety success. Never weaken it to make a test run against an uncertain
target.

## Current scope

M0–M18 are complete in the local repository. M18 is the final local whole-system qualification; its
report is `m18-final-qa.md`. M19 has not begun. Database migrations, RLS, seed and the complete
application regression suite run only against the isolated local Supabase project unless a later
production operation is explicitly approved.

## Site-visit operations

- Use `/admin/site-visits` for the bounded operations queue, `/admin/site-visits/calendar` for the
  grouped schedule and `/admin/site-visits/[id]` for mutation controls and private history.
- The UI displays and accepts visit times in `Asia/Kolkata`; the database persists timestamptz values.
- A public request is only `REQUESTED`. Contact, propose and confirm it manually; there is no automatic
  booking, calendar-provider sync or reminder-provider integration.
- A stale-version response means another tab or actor changed the visit. Reload the workspace before
  applying another operation.
- Proposal, confirmation and rescheduling require active published inventory in an operational
  availability state. Treat property-time conflicts as an explicit admin warning to resolve.
- Visit completion and follow-up are separate. Schedule terminal-visit follow-up through the CRM
  control; never rewrite the visit outcome or add a `FOLLOW_UP_REQUIRED` visit state.
