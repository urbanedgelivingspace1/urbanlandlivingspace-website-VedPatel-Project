# UrbanEdge Land Space

UrbanEdge Land Space is an independent Next.js application for curated land discovery and
brokerage-led operations in Ahmedabad and Gandhinagar. The implementation follows the serial
milestones in `12-IMPLEMENTATION-ROADMAP.md`.

## Local foundation

Requirements:

- Node.js 22 LTS (the repository also supports compatible Node.js 24 releases)
- npm 11
- Supabase CLI for database milestones beginning at M2

Install and validate:

```sh
npm ci
npm run qa
```

Start the development server:

```sh
npm run dev
```

Copy `.env.example` to an ignored local environment file only when a milestone needs provider
configuration. Never commit real values.

## Safety boundaries

- This repository never shares the Living Space database, auth, storage or deployment.
- Stateful tests refuse production-shaped targets and require an explicit synthetic-test token.
- Public code must use public-safe DTOs/projections once the data layer exists.
- M1 contains foundation placeholders only; it does not contain real property inventory.
