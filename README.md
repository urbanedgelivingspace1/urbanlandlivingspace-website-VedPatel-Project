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

## Public search

`/properties` is the canonical server-rendered search workspace. Its URL owns keyword/Property ID, category, transaction, geography, category-specific facts, comparable INR budget, authoritative area, availability, pricing class, sort and page state. `/search` is a noindex utility entry that redirects normalized searches into `/properties`; category and transaction landings use the same PostgreSQL provider and canonical property-card projection.

Default results include Available and Under Negotiation listings. Closed listings require an explicit availability filter. Numeric budget filters exclude price-on-request and per-unit offers; strict area filters exclude measurements without an authoritative normalized value.
