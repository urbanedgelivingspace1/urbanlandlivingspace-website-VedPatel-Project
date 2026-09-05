import { describe, expect, it } from "vitest";

import type { LeadStatus } from "@/features/admin/contracts";
import { SITE_VISIT_STATUSES } from "@/features/site-visits/domain/contracts";
import {
  SITE_VISIT_TRANSITIONS,
  canTransitionSiteVisit,
  classifyVisitTime,
  crmStageForVisitMilestone,
  indiaLocalDateTimeToUtc,
  propertyVisitConflict,
  toIndiaLocalDateTime,
} from "@/features/site-visits/domain/workflow";
import { visitTransitionInputSchema } from "@/features/site-visits/domain/validation";

describe("M14 site-visit workflow", () => {
  it("defines every allowed and forbidden state edge without follow-up as a state", () => {
    expect(SITE_VISIT_STATUSES).not.toContain("FOLLOW_UP_REQUIRED");
    expect(SITE_VISIT_TRANSITIONS.REQUESTED).toEqual(["CONTACTED", "CANCELLED"]);
    expect(SITE_VISIT_TRANSITIONS.CONTACTED).toEqual(["PROPOSED", "CANCELLED"]);
    expect(SITE_VISIT_TRANSITIONS.PROPOSED).toEqual(["CONFIRMED", "RESCHEDULED", "CANCELLED"]);
    expect(SITE_VISIT_TRANSITIONS.CONFIRMED).toEqual([
      "COMPLETED",
      "RESCHEDULED",
      "CANCELLED",
      "NO_SHOW",
    ]);
    for (const from of SITE_VISIT_STATUSES)
      for (const to of SITE_VISIT_STATUSES)
        expect(canTransitionSiteVisit(from, to)).toBe(SITE_VISIT_TRANSITIONS[from].includes(to));
    expect(canTransitionSiteVisit("REQUESTED", "CONFIRMED")).toBe(false);
    expect(canTransitionSiteVisit("COMPLETED", "REQUESTED")).toBe(false);
  });

  it("validates operation-specific timestamps, reasons, contact and completion outcome", () => {
    expect(
      visitTransitionInputSchema.safeParse({
        expectedVersion: 1,
        nextStatus: "PROPOSED",
        timezone: "Asia/Kolkata",
        startAt: "2099-01-01T03:30:00.000Z",
        endAt: "2099-01-01T04:30:00.000Z",
      }).success,
    ).toBe(true);
    for (const input of [
      { expectedVersion: 1, nextStatus: "CONTACTED" },
      { expectedVersion: 1, nextStatus: "RESCHEDULED" },
      { expectedVersion: 1, nextStatus: "CANCELLED" },
      { expectedVersion: 1, nextStatus: "COMPLETED" },
      {
        expectedVersion: 1,
        nextStatus: "PROPOSED",
        startAt: "2099-01-01T05:30:00.000Z",
        endAt: "2099-01-01T04:30:00.000Z",
      },
    ])
      expect(visitTransitionInputSchema.safeParse(input).success).toBe(false);
  });

  it("round-trips India local date/time through authoritative UTC", () => {
    expect(indiaLocalDateTimeToUtc("2026-09-05T12:00")).toBe("2026-09-05T06:30:00.000Z");
    expect(toIndiaLocalDateTime("2026-09-05T06:30:00.000Z")).toBe("2026-09-05T12:00");
    expect(() => indiaLocalDateTimeToUtc("05/09/2026 12:00")).toThrow();
  });

  it("classifies schedule windows using Asia/Kolkata calendar days", () => {
    const now = new Date("2026-09-05T20:00:00.000Z"); // 01:30 IST on 6 September
    expect(classifyVisitTime("2026-09-05T19:00:00.000Z", now)).toBe("TODAY");
    expect(classifyVisitTime("2026-09-06T20:00:00.000Z", now)).toBe("UPCOMING");
    expect(classifyVisitTime("2026-09-04T06:30:00.000Z", now)).toBe("PAST");
    expect(classifyVisitTime(null, now)).toBe("UNSCHEDULED");
  });

  it("blocks unavailable inventory and surfaces a conflict without changing history", () => {
    expect(
      propertyVisitConflict({
        publicationStatus: "PUBLISHED",
        availabilityStatus: "AVAILABLE",
      }),
    ).toBeNull();
    expect(
      propertyVisitConflict({
        publicationStatus: "DRAFT",
        availabilityStatus: "AVAILABLE",
      }),
    ).toMatch(/not currently published/i);
    expect(
      propertyVisitConflict({
        publicationStatus: "PUBLISHED",
        availabilityStatus: "SOLD",
      }),
    ).toMatch(/sold/i);
  });

  it("maps only truthful operational milestones to CRM stages", () => {
    expect(crmStageForVisitMilestone("NEW", "CONTACTED")).toBe("SITE_VISIT_REQUESTED");
    expect(crmStageForVisitMilestone("SITE_VISIT_REQUESTED", "PROPOSED")).toBe(
      "SITE_VISIT_REQUESTED",
    );
    expect(crmStageForVisitMilestone("SITE_VISIT_REQUESTED", "CONFIRMED")).toBe(
      "SITE_VISIT_CONFIRMED",
    );
    expect(crmStageForVisitMilestone("SITE_VISIT_CONFIRMED", "RESCHEDULED")).toBe(
      "SITE_VISIT_REQUESTED",
    );
    expect(crmStageForVisitMilestone("SITE_VISIT_CONFIRMED", "COMPLETED")).toBe(
      "SITE_VISIT_COMPLETED",
    );
    expect(crmStageForVisitMilestone("NEGOTIATION", "CONTACTED")).toBe(
      "NEGOTIATION" satisfies LeadStatus,
    );
  });
});
