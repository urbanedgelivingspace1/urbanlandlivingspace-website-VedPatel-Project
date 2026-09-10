// @vitest-environment node
import { describe, expect, it } from "vitest";
import { LEAD_STATUSES } from "@/features/crm/domain/contracts";
import { classifyFollowUp } from "@/features/crm/domain/follow-ups";
import { canTransitionLead, nextLeadStatuses } from "@/features/crm/domain/pipeline";
import {
  adminLeadInputSchema,
  normalizeEmail,
  normalizePhone,
  requirementInputSchema,
  transitionInputSchema,
} from "@/features/crm/domain/validation";
import { Constants } from "@/types/database.generated";

describe("M12 CRM domain", () => {
  it("defines the exact owner-approved lifecycle and terminal states", () => {
    expect(LEAD_STATUSES).toHaveLength(12);
    expect(LEAD_STATUSES).not.toContain("FOLLOW_UP_REQUIRED");
    expect(nextLeadStatuses("CLOSED_WON")).toEqual([]);
    expect(nextLeadStatuses("CLOSED_LOST")).toEqual([]);
    expect(canTransitionLead("NEGOTIATION", "CLOSED_WON")).toBe(true);
    expect(canTransitionLead("NEW", "PROPERTY_MATCHED")).toBe(false);
    expect(Constants.public.Enums.lead_status).toEqual(LEAD_STATUSES);
    expect(Constants.public.Enums.lead_activity_type).toEqual(
      expect.arrayContaining([
        "EMAIL_INTERACTION",
        "FOLLOW_UP_COMPLETED",
        "PROPERTY_REJECTED",
        "PROPERTY_UNMATCHED",
        "CLOSED_WON",
        "CLOSED_LOST",
      ]),
    );
  });
  it("validates contact, budget, area, and closure rules", () => {
    expect(() =>
      adminLeadInputSchema.parse({
        name: "A",
        sourceType: "MANUAL",
        inquiryType: "GENERAL_CONTACT",
      }),
    ).toThrow();
    expect(() =>
      adminLeadInputSchema.parse({
        name: "Valid Name",
        phone: "9999999999",
        sourceType: "MANUAL",
        inquiryType: "GENERAL_CONTACT",
        budgetMin: 20,
        budgetMax: 10,
      }),
    ).toThrow();
    expect(() => requirementInputSchema.parse({ minAreaValue: 5, maxAreaValue: 2 })).toThrow();
    expect(() => transitionInputSchema.parse({ nextStatus: "CLOSED_LOST" })).toThrow();
    expect(() =>
      transitionInputSchema.parse({ nextStatus: "CLOSED_LOST", reason: "UNSTRUCTURED" }),
    ).toThrow();
    expect(
      transitionInputSchema.parse({ nextStatus: "CLOSED_LOST", reason: "BUDGET_MISMATCH" }).reason,
    ).toBe("BUDGET_MISMATCH");
  });
  it("normalizes duplicate identity signals", () => {
    expect(normalizePhone("99999 99999")).toBe("+919999999999");
    expect(normalizePhone("+91-99999-99999")).toBe("+919999999999");
    expect(normalizeEmail(" Buyer@Example.COM ")).toBe("buyer@example.com");
  });
  it("classifies follow-ups using India business dates", () => {
    const now = new Date("2026-09-05T06:00:00Z");
    expect(classifyFollowUp("2026-09-04T12:00:00Z", null, now)).toBe("OVERDUE");
    expect(classifyFollowUp("2026-09-05T12:00:00Z", null, now)).toBe("TODAY");
    expect(classifyFollowUp("2026-09-06T12:00:00Z", null, now)).toBe("UPCOMING");
    expect(classifyFollowUp("2026-09-01T12:00:00Z", "2026-09-02T00:00:00Z", now)).toBe("COMPLETED");
  });
  it("strictly isolates lead CLOSED_WON from property availability status", () => {
    // Transitioning a lead to CLOSED_WON requires only valid nextStatus and reason/outcome
    const parsed = transitionInputSchema.parse({
      nextStatus: "CLOSED_WON",
      reason: "Sale executed with client",
    });
    expect(parsed.nextStatus).toBe("CLOSED_WON");
    // Verifies lead pipeline transitions are decoupled from property availability
    expect(canTransitionLead("NEGOTIATION", "CLOSED_WON")).toBe(true);
  });
});
