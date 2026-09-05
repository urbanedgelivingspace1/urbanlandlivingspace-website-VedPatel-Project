# ADR-0004: M12 CRM status and follow-up reconciliation

- **Status:** Accepted
- **Date:** 2026-09-05
- **Decision owner:** UrbanEdge project owner through the approved M12 implementation brief
- **Scope:** Lead status migration, follow-up persistence, CRM services, admin operations, RLS, audit and tests

## Context

The M12 owner brief requires the terminal pipeline labels `CLOSED_WON` and `CLOSED_LOST`, and requires follow-ups to preserve type, context, due time, completion actor/time and outcome. The original schema used `WON`, `LOST`, and a generic `CLOSED`, while storing only `leads.next_follow_up_at`.

## Decision

The M12 migration replaces the legacy lead status enum with the twelve owner-approved pipeline states. Legacy `WON` and `LOST` map to the corresponding closed outcomes; legacy administrative `CLOSED` maps to `CLOSED_LOST` during migration and is no longer available for new records.

A private `lead_follow_ups` table stores append-preserving structured follow-up records. `leads.next_follow_up_at` remains the indexed operational pointer to the one open follow-up. Follow-ups remain separate from `site_visit_status`, preserving ADR-0001.

An unambiguous normalized phone/email match may reuse one existing `parties` row while each business intent creates a distinct `leads` row. Conflicting identity signals never select an arbitrary party, and M12 adds detection/association rather than destructive merging.

## Consequences

CRM actions use service-role-only RPCs after `requireActiveAdmin()`. Browser roles retain read-only active-admin access and receive no mutation grant. Public actors receive no CRM access. Audit metadata records identifiers and changed-field names, not lead contact data or note bodies.

The migration is intentionally narrow: one private table, the status reconciliation, activity vocabulary extensions and supporting indexes/RPCs. It does not introduce a second demand taxonomy, public CRM projection, public intake form, AI matcher or site-visit workflow.

## Alternatives considered

### Keep `WON`, `LOST` and generic `CLOSED` only in storage

Rejected. UI-only aliases would let service, database and reports disagree with the exact owner-approved lifecycle and could not distinguish the two required terminal outcomes reliably.

### Store follow-up detail only in activities or `leads.next_follow_up_at`

Rejected. A mutable timestamp plus free text cannot retain reschedule/completion history, controlled type/context, actor, completion time and outcome while preserving one authoritative open-work pointer.

### Add `FOLLOW_UP_REQUIRED` to the lead or visit lifecycle

Rejected. Follow-up work can coexist with multiple lifecycle states and ADR-0001 explicitly keeps it separate from the site-visit state machine.

### Reject or auto-merge duplicate contact signals

Rejected. One person may have multiple genuine opportunities, while destructive or ambiguous automatic merging risks corrupting identity and source history.

## Security, privacy and legal impact

The table has RLS and only active administrators may read it. `anon` and `authenticated` cannot execute the CRM mutation RPCs; the server role invokes them only after active-admin authorization and each function validates the actor again. No CRM field is added to public projections. Generic audit metadata excludes contact details and note bodies. This decision adds no public legal claim and requires no lawyer approval.

## Schema and migration impact

Legacy `WON` maps to `CLOSED_WON`; `LOST` and generic `CLOSED` map to `CLOSED_LOST`. The migration creates `lead_follow_ups`, one-open-follow-up and queue indexes, normalized contact indexes and service-owned RPCs. Rollback would require explicitly mapping the two new terminal outcomes back to legacy values and flattening structured follow-up history; therefore any production rollback must be reviewed as a data migration rather than dropping the table blindly.

## Test impact

Database tests freeze the exact status inventory, transition/evidence rules, structured loss reasons, duplicate contact reuse, follow-up integrity, RLS and RPC grants. Unit, component, integration and browser tests cover validation, India-time buckets, protected operations and public/non-admin denial.

## Approval and compatibility

The owner-approved M12 brief authorizes this local implementation. It preserves ADR-0001 and the M0–M11 public/property boundaries. No production migration, deployment, paid provider, public intake or site-visit operation is authorized by this ADR; those remain separate gates.
