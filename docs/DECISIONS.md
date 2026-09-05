# UrbanEdge Land Space — Implementation Decisions

This file records meaningful implementation assumptions and decisions that do not replace formal ADRs. Persistent-model, state-machine, security-boundary or other architectural changes require an ADR.

## Accepted decisions

### D-001 — Finalized architecture refines recommended master examples

The master prompt uses recommendation/example language for routes, property IDs, price modes, entity names and a high-level milestone outline. The owner's implementation brief explicitly says later finalized architecture decisions supersede older research examples where resolved and directs execution through `12-IMPLEMENTATION-ROADMAP.md`.

Therefore:

- use `UE-LS-000001` rather than category-coded IDs;
- use document `02`'s canonical route tree;
- use document `03`'s tables/enums/constraints;
- use roadmap M0–M19 as the build sequence.

This is source reconciliation, not an architecture deviation.

### D-002 — Living Space design report is the authoritative brand/design reference

The owner confirmed on 2026-09-03 that the old Living Space repository will not be provided and designated `URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md` as the authoritative Living Space brand/design reference. It may guide the M1 design-token foundation. This designation does not authorize treating the old repository as part of Land Space, copying its implementation, sharing its backend, or claiming direct inspection of unavailable source files.

### D-003 — Missing photography uses explicit development placeholders only

If actual photography/media is unavailable when a later public-UI milestone needs it, use clearly identified development placeholders. Never represent placeholder imagery as a real property. Track each replacement in the handoff placeholder register and pre-launch documentation.

### D-004 — Git baseline and source-resolution history

The documentation-only baseline commit was created while accurately recording the unresolved reference-source input. The owner then resolved that limitation by designating the design report as authoritative and confirming the repository will not be supplied. The approved logo asset and resulting M0 completion records belong in a follow-up M0 completion commit; no commit may claim direct old-repository inspection.

### D-005 — Approved logo is a reference asset, not a relabeled Land Space logo

`UrbanEdge_Living_Space_Logo_HD.jpg` is an approved UrbanEdge Living Space brand asset and is valid for extracting visual character and brand colors. It must not be silently presented as a purpose-built UrbanEdge Land Space logo. A Land Space-specific wordmark/lockup remains a separately approved brand deliverable if the product needs one.

### D-006 — M11 public search comparability and discovery defaults

M11 uses one URL parser and one PostgreSQL provider for `/properties`, `/search`, category landings and transaction landings. Default discovery includes only `AVAILABLE` and `UNDER_NEGOTIATION`; `SOLD`, `RENTED` and `LEASED` require an explicit availability filter, and `OFF_MARKET` is rejected.

Numeric INR budget filters use overlap semantics for `EXACT_TOTAL` and `PRICE_RANGE` offers only. `PRICE_ON_REQUEST` is available through the explicit `pricing=por` class and `PER_UNIT` is not treated as a comparable total. Strict area filters use only `AUTHORITATIVE` normalized square-metre values and support the exact standard conversions `sq_m`, `sq_ft`, `sq_yd`, `var`, `acre` and `hectare`; ambiguous local units remain displayable but are excluded from strict numeric filtering. These are implementation-level applications of documents `03`, `04`, `07`, `08` and roadmap M11, not a new state model or security boundary, so no ADR is required.

## Formal ADRs

- `ADR-0001`: site-visit lifecycle remains separate from CRM follow-up. `FOLLOW_UP_REQUIRED` is not a `site_visit_status`.
- `ADR-0002`: hosted storage objects and canonical external media locators coexist in one constrained media registry.
- `ADR-0003`: verification provenance, applicability, exceptions, professional review, history and public-copy approval are separate typed concepts.
- `ADR-0004`: M12 uses the exact twelve-state owner CRM pipeline and private structured follow-up history without coupling follow-up to site visits.
