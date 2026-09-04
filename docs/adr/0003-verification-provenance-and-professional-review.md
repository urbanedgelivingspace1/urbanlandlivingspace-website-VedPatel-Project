# ADR-0003: Persist Verification Provenance and Professional Review Separately

- **Status:** Accepted
- **Date:** 2026-09-04
- **Decision owner:** UrbanEdge project owner through the approved M8 implementation brief
- **Scope:** Verification evidence provenance, applicability, exceptions, professional referrals, history and public-safe summaries

## Context

The approved schema already separates check definitions, property-scoped check results, private
documents and evidence links. The M7 handoff nevertheless records two implementation-blocking M8
gaps: evidence provenance/lifecycle and professional-review persistence. Storing those distinctions
inside reviewer notes would make owner-provided, reviewed, source-verified and professionally
reviewed material indistinguishable and unauditable.

M8 also requires explicit applicability, limitations, exceptions, recheck state and public-copy
approval. None of those may be inferred from a generic pass count or a document upload.

## Decision

Extend the approved relational model additively:

- typed `source_class`, `evidence_provenance_state` and `verification_applicability` values;
- policy fields on check definitions for evidence requirements, minimum provenance and lawyer-copy
  approval;
- explicit applicability, limitations and disclosure eligibility on each property check;
- append-only `verification_history` rows for state and material workflow changes;
- first-class `verification_exceptions` with resolution state;
- scoped `professional_reviews` with controlled professional type and outcome;
- provenance/review/supersession/revocation fields on evidence links;
- expanded structured source-reference metadata rather than arbitrary legal notes.

Private documents may support a check only while active and `CLEAN`. Linking a document never
changes its provenance above `RECEIVED`. Evidence can advance only through a server-owned,
actor-attributed review action. Superseded or revoked evidence cannot satisfy a current result.

Check definitions are configurable and category/transaction-aware. Initialization records both
applicable and non-applicable definitions so an administrator can see why a check was selected;
applicability is never represented as a verification status.

Public verification rows require all of the following: a scoped passed result, current evidence,
no unresolved blocking exception, explicit disclosure eligibility and visibility, and a definition
whose public copy has received lawyer approval. The initial M8 seed deliberately marks all public
copy unapproved, so no consumer-facing verification claim is enabled before the approval gate and
M9 publication work.

## Consequences

- No `property.verified` field or universal score exists.
- Property lifecycle, publication, availability, applicability and check result remain independent.
- Professional review is attributable and scoped without exposing a report or professional identity
  publicly.
- Rechecks create fresh review work and preserve the previous result in history.
- Public output is an explicit projection and never joins private documents, evidence notes, source
  metadata, exact coordinates or owner PII.
- The migration is additive and safe for the existing empty M8 verification workflow.

## Alternatives considered

### Store provenance and professional review in notes

Rejected. Free text cannot enforce lifecycle, authorization, source class, reviewer attribution or
public-boundary rules.

### Treat a clean upload as verified evidence

Rejected. Malware scanning establishes safe file handling only; it does not establish authenticity,
currency, authority or legal sufficiency.

### Add a property-level verification Boolean or score

Rejected. It would create the overbroad legal implication expressly prohibited by the architecture.

## Approval and compatibility

This ADR resolves the persistence gates already called out by the accepted M7 handoff and the
owner-approved M8 brief. It activates no paid provider, performs no production operation, and does
not authorize any public legal wording. Production migration, malware-provider activation, lawyer
copy approval and publication remain separate approval gates.
