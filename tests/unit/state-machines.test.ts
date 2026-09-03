// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  leadMachine,
  ownerSubmissionMachine,
  propertyAvailabilityMachine,
  propertyPublicationMachine,
  siteVisitMachine,
  verificationMachine,
} from "@/features/workflows/domain/state-machines";
import {
  assertTransition,
  canTransition,
  InvalidStateTransitionError,
} from "@/features/workflows/domain/state-machine";

describe("approved state machines", () => {
  it("allows approved transitions", () => {
    expect(canTransition(propertyPublicationMachine, "DRAFT", "UNDER_REVIEW")).toBe(true);
    expect(canTransition(propertyPublicationMachine, "ARCHIVED", "DRAFT")).toBe(true);
    expect(canTransition(propertyAvailabilityMachine, "AVAILABLE", "UNDER_NEGOTIATION")).toBe(true);
    expect(canTransition(ownerSubmissionMachine, "APPROVED", "CONVERTED")).toBe(true);
    expect(canTransition(leadMachine, "SITE_VISIT_COMPLETED", "NEGOTIATION")).toBe(true);
    expect(canTransition(siteVisitMachine, "PROPOSED", "CONFIRMED")).toBe(true);
    expect(canTransition(verificationMachine, "EXPIRED", "IN_REVIEW")).toBe(true);
  });

  it("keeps completed visits terminal while CRM follow-up remains separate", () => {
    expect(siteVisitMachine.COMPLETED).toEqual([]);
    expect(Object.keys(siteVisitMachine)).not.toContain("FOLLOW_UP_REQUIRED");
  });

  it("rejects direct publish restore and terminal lead rewrites", () => {
    expect(() => assertTransition(propertyPublicationMachine, "ARCHIVED", "PUBLISHED")).toThrow(
      InvalidStateTransitionError,
    );
    expect(canTransition(leadMachine, "WON", "NURTURE")).toBe(false);
  });
});
