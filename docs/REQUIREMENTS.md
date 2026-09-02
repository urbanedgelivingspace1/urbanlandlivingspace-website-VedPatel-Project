# UrbanEdge Land Space V1 — Requirements and Architecture Gap Analysis

**Status:** M0 discovery record

**Last reviewed:** 2026-09-03

This document summarizes the implementation-relevant requirements and gaps discovered while reconciling the master build prompt, finalized architecture, research reports and owner decisions. It is not a replacement for the authoritative sources or the detailed implementation ledger.

## Product contract

UrbanEdge Land Space is an independent, curated, brokerage-led land discovery and operations product for Ahmedabad and Gandhinagar. It covers Agricultural, NA and Industrial land. Buy, Rent and Lease are discovery intents; Sell Your Land is a private owner-intake workflow.

V1 has anonymous public visitors and a private one-admin operation. It does not have buyer accounts, seller dashboards, a public agent marketplace, public reviews, payments, subscriptions, AI valuation/chat/recommendations, in-app messaging or automatic appointment booking.

## Technical contract

- New Next.js App Router + React + strict TypeScript modular monolith.
- New, dedicated Supabase PostgreSQL/Auth/Storage project.
- Separate source, environment, auth, database, migrations, storage and deployment from UrbanEdge Living Space.
- Server-rendered public discovery; Client Components only for genuine interaction.
- Server-owned mutations, explicit public-safe projections and deny-by-default RLS.
- PostgreSQL search with URL-owned filter state.
- Tailwind CSS with selective shadcn/Radix/Lucide use and an original UrbanEdge design system.
- Local, preview/staging and production separation.
- Netlify Free, Supabase Free and other approved zero-cost provider boundaries, subject to current-term revalidation and explicit production gates.

## Privacy and workflow invariants

- Owner PII, private documents, verification evidence, internal notes and unpublished inventory never enter public payloads.
- Exact coordinates are absent from public output for `APPROXIMATE` and `HIDDEN` listings.
- Owner submissions never auto-publish; conversion creates a draft.
- Site-visit requests never auto-confirm.
- Publication and availability are independent.
- Verification is scoped, evidence-backed and dated; no universal verified/title-clear claim.
- Provider notification failure after a durable commit does not erase business state.
- No production test data or fabricated inventory.

## Brand/design contract

The strongest source-backed UrbanEdge family language is deep navy, warm gold, Playfair Display headings, Montserrat body/UI typography, image-led real-estate presentation, elevated white cards, pill actions/badges and restrained gold section rules.

Land Space must use that family resemblance while replacing apartment/residential metaphors with land, scale, access, location, planning and verification language. It must not copy Living Space implementation debt or clone a competitor.

The detailed design report records code-derived tokens and asset names, but the actual Living Space repository and logo files are not currently visible in the accessible filesystem. Do not pretend those files were inspected in this M0 session.

## Reconciled source differences

| Topic | Older master prompt | Final implementation contract | Resolution |
|---|---|---|---|
| Public property ID | Recommends category-coded `UEL-AG/NA/IN-*` | `UE-LS-000001`, category stored separately | Explicit owner brief plus finalized document `03`; master wording is recommendation/example |
| Property detail route | Recommends `/property/[slug]` | Canonical `/properties/[property-slug]` | Document `02` is the finalized route architecture; master route list is recommended |
| Extra public routes | Recommends `/services`, `/faq` and alternate legal paths | Canonical document-`02` tree omits/renames them | Do not add excluded/unapproved routes merely from the early recommendation |
| Price negotiability | Lists `NEGOTIABLE` among flexible modes | `is_negotiable` alongside four `price_mode` values | Final document `03` normalization |
| Site-visit scheduling | Simplified `SCHEDULED` state | `PROPOSED`, `CONFIRMED`, `RESCHEDULED` scheduling phase | Final document `03` refinement, with ADR-0001 separating CRM follow-up |
| Follow-up | Admin doc `05` names `FOLLOW_UP_REQUIRED` as visit status | CRM due-time/action/activity state | Owner decision and ADR-0001 |
| Milestone outline | High-level master milestones 0–12 | Dependency-ordered roadmap M0–M19 | Owner explicitly requires `12-IMPLEMENTATION-ROADMAP.md`; later plan is the execution contract |
| Table examples | Early conceptual entity names | Final 49-table inventory | Document `03` is the database implementation authority |

These are refinements explicitly anticipated by the master prompt and implementation brief, not unresolved implementation contradictions.

## Open input gap

Filesystem searches found the master prompt only as the final embedded document in `/Users/vedpatel/Desktop/merged (1).md` (lines 56904–62392). The actual UrbanEdge Living Space repository and actual logo/assets were not found in the Land Space directory, Codex attachments, Desktop, Documents, Downloads, temporary workspace locations or accessible mounted volumes.

Consequences:

- code-derived brand findings can be used from `URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md`;
- actual logo bytes, dimensions, transparency and visual appearance cannot be verified;
- no source repository path can be recorded or protected as the supplied read-only target;
- M0 cannot honestly claim that the newly promised repository/assets were inspected.

## M0 exit assessment

The architecture itself is coherent after ADR-0001 and the reconciliations above. The only current M0 hold is source fulfillment: the explicitly required Living Space repository and logo/assets are not accessible at an identifiable location. The master prompt is available and reviewed from the merged package.
