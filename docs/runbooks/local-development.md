# Local Development Runbook

## Install and validate

1. Use Node.js 22 LTS or a compatible Node.js version allowed by `package.json`.
2. Run `npm ci`.
3. Run `npm run qa` before committing.
4. Run `npm run dev` for the local application.

## Environment handling

Copy `.env.example` to `.env.local` only when configuration is required. The local file is ignored.
Do not use production credentials locally. No real secret belongs in examples, tests, fixtures,
documentation or shell history.

## Stateful test protection

Stateful tests must run through `npm run test:integration`. The guard requires:

- `APP_ENV=test`;
- distinct test and production Supabase project references;
- distinct test and production origins;
- the explicit non-secret synthetic-test safety token defined by the repository guard.

The guard failing is a safety success. Never weaken it to make a test run against an uncertain
target.

## Current scope

M1 provides the application and test shell only. Local database creation, migrations, RLS and seed
execution begin in their roadmap milestones.
