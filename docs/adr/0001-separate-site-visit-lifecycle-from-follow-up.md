# ADR-0001: Separate Site-Visit Lifecycle From CRM Follow-Up

- **Status:** Accepted
- **Date:** 2026-09-03
- **Decision owner:** UrbanEdge project owner
- **Scope:** Site-visit persistence, state transitions, CRM follow-up, admin filters and tests

## Context

`03-DATABASE-SCHEMA-ARCHITECTURE.md` defines the authoritative `site_visit_status` enum as:

```text
REQUESTED
CONTACTED
PROPOSED
CONFIRMED
COMPLETED
CANCELLED
NO_SHOW
RESCHEDULED
```

`05-ADMIN-CRM-ARCHITECTURE.md` repeats those lifecycle states but also names `FOLLOW_UP_REQUIRED` as if it were a site-visit status. Its admin list design includes a “Follow-up Required” view and its completion workflow says a completed visit may need follow-up.

Those two documents conflict at the persistence boundary. More importantly, `FOLLOW_UP_REQUIRED` is not mutually exclusive with the visit lifecycle. A visit may be `COMPLETED` while a lead still needs another call, a new visit, negotiation follow-up or nurture action. Replacing `COMPLETED` with `FOLLOW_UP_REQUIRED` would lose what happened to the visit and mix scheduling state with CRM work state.

The owner explicitly resolved this conflict on 3 September 2026: do not add `FOLLOW_UP_REQUIRED` as a `site_visit_status`; represent follow-up through the established CRM/lead follow-up model.

## Decision

### Canonical persisted site-visit states

Retain the `site_visit_status` enum from document `03` without adding `FOLLOW_UP_REQUIRED`:

```text
REQUESTED
CONTACTED
PROPOSED
CONFIRMED
COMPLETED
CANCELLED
NO_SHOW
RESCHEDULED
```

The product term “scheduled” describes the scheduling phase. It is not an additional persisted enum in V1:

- `PROPOSED` means UrbanEdge has proposed a time that is not yet confirmed.
- `CONFIRMED` means the visit has a mutually confirmed time.
- `RESCHEDULED` records that a previously proposed/confirmed time changed; the visit must then receive new proposed or confirmed times through the controlled service.

### Canonical lifecycle

```text
[*] -> REQUESTED

REQUESTED -> CONTACTED | CANCELLED
CONTACTED -> PROPOSED | CANCELLED
PROPOSED -> CONFIRMED | RESCHEDULED | CANCELLED
CONFIRMED -> COMPLETED | RESCHEDULED | NO_SHOW | CANCELLED
RESCHEDULED -> PROPOSED | CONFIRMED | CANCELLED

COMPLETED -> terminal for this visit
CANCELLED -> terminal for this visit
NO_SHOW -> terminal for this visit
```

Re-engagement after a terminal visit creates CRM follow-up and, when appropriate, a new site-visit record. It does not rewrite the historical outcome of the prior visit.

All transitions are server-owned and auditable. `CONFIRMED` requires confirmed start/end times. `COMPLETED` requires `completed_at` plus an outcome/feedback note according to the existing architecture.

### Follow-up representation

Post-visit follow-up is represented by the lead/CRM model, not the visit status:

- `leads.next_follow_up_at` stores the next due time;
- the lead’s next-action context records the operational action in the service/DTO layer;
- `lead_activities` receives `FOLLOW_UP_SCHEDULED` and supporting notes/activity events;
- lead status may move to `NEGOTIATION`, `NURTURE` or `LOST` after a completed visit according to the lead state machine;
- an admin “Follow-up Required” view is a derived operational query, not a persisted visit status.

The derived view/filter should select leads/visits whose follow-up is due or required using CRM data, for example a non-terminal lead with `next_follow_up_at` due, or an explicitly recorded follow-up activity/action. It must not infer that every completed visit requires the same follow-up.

If implementation proves that a durable structured `next_action` is required and no approved typed field can represent it, use a separate ADR and additive migration. Do not add an ad hoc JSON flag to `site_visits`.

## Consequences

Benefits:

- a visit retains its true scheduling/outcome lifecycle;
- completed visits can simultaneously have pending CRM work;
- follow-up queues use the existing lead/activity model;
- analytics can distinguish visit outcomes from follow-up workload;
- document `03` remains the database authority without an unnecessary enum addition.

Trade-offs:

- the admin “Follow-up Required” view requires a join/derived query across visit, lead and activity/follow-up data;
- service tests must cover visit-state and lead-follow-up changes together where a workflow performs both;
- UI copy must avoid presenting “Follow-up Required” as a visit lifecycle badge.

## Affected architecture references

- `03-DATABASE-SCHEMA-ARCHITECTURE.md`
  - Section 6.21 `site_visit_status`: retained unchanged.
  - Section 26.1 `leads`: `next_follow_up_at` remains the primary due-time field.
  - Section 26.4 `lead_activities`: `FOLLOW_UP_SCHEDULED` remains the timeline event.
  - Section 27.1 `site_visits`: no follow-up status is added.
- `04-BACKEND-API-BUSINESS-LOGIC.md`
  - Site-visit service must enforce the lifecycle above and coordinate CRM activity/follow-up without conflating states.
- `05-ADMIN-CRM-ARCHITECTURE.md`
  - Sections describing `FOLLOW_UP_REQUIRED` as a visit status are superseded by this ADR.
  - “Follow-up Required” remains a valid derived admin list/view label.
- `11-TESTING-QA-PLAN.md`
  - Tests must prove a visit can remain `COMPLETED` while its lead has pending follow-up.
  - Tests must reject `FOLLOW_UP_REQUIRED` as a value of `site_visit_status`.
- `12-IMPLEMENTATION-ROADMAP.md`
  - M2 uses the unchanged document `03` enum.
  - M3 implements separate visit and CRM follow-up state contracts.
  - M12/M14 implement and test the derived follow-up behavior.

## Schema and migration impact

- No new `site_visit_status` value.
- No M2 schema amendment is required for this conflict.
- No migration exists yet; when M2 creates the enum, it must use the eight canonical document `03` values.
- A future typed `next_action` persistence addition is permitted only through a separate approved ADR/migration if the existing lead/activity model is insufficient.

## Test impact

Required tests include:

1. `FOLLOW_UP_REQUIRED` cannot be persisted as `site_visit_status`.
2. A visit can transition to `COMPLETED` with its required completion data.
3. Completing a visit can atomically or transactionally record the appropriate lead activity and `next_follow_up_at` when follow-up is selected.
4. The completed visit remains `COMPLETED` while the derived follow-up queue includes it through CRM state.
5. Clearing/completing the CRM follow-up removes it from the derived queue without mutating the historical visit outcome.
6. Rescheduling cannot falsely leave the visit/lead presented as currently confirmed without new confirmed times.

## Alternatives considered

### Add `FOLLOW_UP_REQUIRED` to `site_visit_status`

Rejected. It makes a non-exclusive operational condition replace or compete with the visit lifecycle outcome.

### Add a Boolean `follow_up_required` to `site_visits`

Rejected for V1. It duplicates CRM follow-up state, risks drift and does not represent due time, action or history.

### Infer follow-up from every completed visit

Rejected. Not every completed visit has the same next action, and inference would create inaccurate queues.

## Approval and compatibility

This ADR records the owner’s explicit resolution and requires no paid service or production action. It is compatible with the authoritative database enum and the existing CRM fields. It supersedes only the conflicting treatment of `FOLLOW_UP_REQUIRED` as a site-visit lifecycle state.
