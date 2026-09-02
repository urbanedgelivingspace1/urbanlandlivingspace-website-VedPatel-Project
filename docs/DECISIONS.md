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

### D-002 — Living Space design report is evidence, not source-code custody

`URBANEDGE_LIVINGSPACE_DESIGN_REPORT.md` contains detailed code-derived findings and may guide reversible M1 design-token foundations. It does not authorize treating the missing Living Space repository as part of Land Space, copying its implementation, or claiming that the current agent inspected unavailable source files.

### D-003 — Missing photography uses explicit development placeholders only

If actual photography/media is unavailable when a later public-UI milestone needs it, use clearly identified development placeholders. Never represent placeholder imagery as a real property. Track each replacement in the handoff placeholder register and pre-launch documentation.

### D-004 — Git baseline waits for complete M0 source custody

The owner authorized Git initialization and a baseline M0 commit after the promised sources are located, inspected and reconciled. Until an exact read-only Living Space source path and logo/asset path exist, do not create a commit that misleadingly describes the source set as complete.

## Formal ADRs

- `ADR-0001`: site-visit lifecycle remains separate from CRM follow-up. `FOLLOW_UP_REQUIRED` is not a `site_visit_status`.
