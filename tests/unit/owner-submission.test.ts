// @vitest-environment node

import { describe, expect, it } from "vitest";

import { RATE_POLICIES } from "@/features/intake/domain/abuse";
import { OWNER_PRIVACY_NOTICE_VERSION } from "@/features/owner-submissions/domain/contracts";
import {
  isPotentialOwnerDuplicate,
  ownerDuplicateSignals,
} from "@/features/owner-submissions/domain/duplicates";
import { ownerSubmissionInputSchema } from "@/features/owner-submissions/domain/validation";
import { ownerSubmissionMachine } from "@/features/workflows/domain/state-machines";

const valid = {
  action: "OWNER_LAND_SUBMISSION" as const,
  idempotencyKey: "95000000-0000-4000-8000-000000000001",
  ownerIntent: "SELL" as const,
  landCategory: "AGRICULTURAL" as const,
  name: "Synthetic Owner",
  phone: "9876543210",
  preferredContact: "PHONE" as const,
  ownerRelationship: "OWNER" as const,
  districtId: "00000000-0000-4000-8000-000000000003",
  talukaText: "Sanand",
  villageText: "Synthetic village",
  locationVisibilityPreference: "APPROXIMATE" as const,
  areaValue: 2,
  areaUnitId: "10000000-0000-4000-8000-000000000006",
  priceMode: "PRICE_ON_REQUEST" as const,
  negotiable: true,
  sourceDescription: "Productive land with road access claimed by the owner.",
  categoryClaims: { tenureClaim: "Owner-provided old tenure claim" },
  mediaClaims: {},
  contactConsent: true as const,
  informationDeclaration: true as const,
  privacyConsent: true as const,
  publicationReviewAcknowledgement: true as const,
  documentCertificationAcknowledgement: true as const,
  privacyNoticeVersion: OWNER_PRIVACY_NOTICE_VERSION,
};

describe("M15 owner submission domain", () => {
  it("normalizes contact details while preserving owner intent as private supply", () => {
    expect(ownerSubmissionInputSchema.parse(valid)).toMatchObject({
      phone: "+919876543210",
      ownerIntent: "SELL",
      landCategory: "AGRICULTURAL",
    });
  });

  it("requires all five explicit acknowledgements", () => {
    expect(() => ownerSubmissionInputSchema.parse({ ...valid, privacyConsent: false })).toThrow();
    expect(() =>
      ownerSubmissionInputSchema.parse({ ...valid, documentCertificationAcknowledgement: false }),
    ).toThrow();
  });

  it("validates coordinate pairs and commercial shapes", () => {
    expect(() => ownerSubmissionInputSchema.parse({ ...valid, privateLatitude: 22.9 })).toThrow();
    expect(() =>
      ownerSubmissionInputSchema.parse({ ...valid, priceMode: "EXACT_TOTAL" }),
    ).toThrow();
    expect(() =>
      ownerSubmissionInputSchema.parse({ ...valid, priceMode: "PER_UNIT", askingPricePerUnit: 50 }),
    ).toThrow();
  });

  it("rejects markup and excessive links in owner-provided claims", () => {
    expect(() =>
      ownerSubmissionInputSchema.parse({
        ...valid,
        sourceDescription: "<script>not safe</script>",
      }),
    ).toThrow();
    expect(() =>
      ownerSubmissionInputSchema.parse({
        ...valid,
        categoryClaims: { accessClaim: "https://a.invalid https://b.invalid https://c.invalid" },
      }),
    ).toThrow();
  });

  it("accepts only HTTPS media claims without embedded credentials", () => {
    expect(
      ownerSubmissionInputSchema.parse({
        ...valid,
        mediaClaims: { videoUrl: "https://video.example/watch/123" },
      }).mediaClaims.videoUrl,
    ).toBe("https://video.example/watch/123");
    expect(() =>
      ownerSubmissionInputSchema.parse({
        ...valid,
        mediaClaims: { videoUrl: "javascript:alert(1)" },
      }),
    ).toThrow();
    expect(() =>
      ownerSubmissionInputSchema.parse({
        ...valid,
        mediaClaims: { videoUrl: "https://user:secret@video.example/watch/123" },
      }),
    ).toThrow();
  });

  it("allows conversion only from approved and only through the dedicated action", () => {
    expect(ownerSubmissionMachine.APPROVED).toContain("CONVERTED");
    expect(ownerSubmissionMachine.NEW).not.toContain("CONVERTED" as never);
    expect(ownerSubmissionMachine.UNDER_REVIEW).not.toContain("CONVERTED" as never);
  });

  it("uses the strict owner-intake abuse budget", () => {
    expect(RATE_POLICIES.OWNER_LAND_SUBMISSION).toEqual({ attempts: 3, windowSeconds: 1_800 });
  });

  it("surfaces safe duplicate signals without merging separate submissions", () => {
    const base = {
      id: "one",
      partyId: "party-one",
      districtId: valid.districtId,
      landCategory: "AGRICULTURAL" as const,
      areaValue: 2,
      surveyReference: "Survey 42/A",
    };
    const contactMatch = ownerDuplicateSignals(base, {
      ...base,
      id: "two",
      areaValue: 4,
      surveyReference: "different",
    });
    expect(contactMatch).toContain("Same owner/contact");
    expect(isPotentialOwnerDuplicate(contactMatch)).toBe(true);

    const similarityMatch = ownerDuplicateSignals(base, {
      ...base,
      id: "three",
      partyId: "party-three",
      areaValue: 2.1,
      surveyReference: "different",
    });
    expect(similarityMatch).toEqual(["Same district", "Same land type", "Similar area"]);
    expect(isPotentialOwnerDuplicate(similarityMatch)).toBe(true);
    expect(ownerDuplicateSignals(base, base)).toEqual([]);
  });
});
