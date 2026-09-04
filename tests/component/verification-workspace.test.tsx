import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VerificationWorkspace } from "@/components/admin/verification-workspace";
import type { AdminVerificationDetail } from "@/features/verification/domain/contracts";

const action = vi.fn(async () => ({ ok: true, message: "done" }));
const detail: AdminVerificationDetail = {
  property: {
    id: "20000000-0000-4000-8000-000000000001",
    propertyCode: "UE-LS-000001",
    title: "Synthetic agricultural land",
    category: "AGRICULTURAL",
    transactionType: "BUY",
    publicationStatus: "DRAFT",
  },
  checks: [
    {
      id: "81000000-0000-4000-8000-000000000001",
      status: "IN_REVIEW",
      applicability: "APPLICABLE",
      applicabilityReason: "Agricultural category and sale context",
      riskLevel: "HIGH",
      scope: "Review the named VF-7 reference for the recorded parcel and date.",
      limitations: "Does not establish complete title or boundaries.",
      reviewerNotes: null,
      reviewedAt: null,
      checkDate: null,
      recheckAt: null,
      referralRequired: false,
      referralType: null,
      publicVisible: false,
      publicDisclosureEligible: false,
      publicCopyApproved: false,
      definition: {
        id: "80000000-0000-4000-8000-000000000001",
        code: "VF7_REVIEWED",
        name: "VF-7 reference reviewed",
        description: "Review only where applicable.",
        categoryScope: "AGRICULTURAL",
        transactionScope: null,
        sourceClass: "OFFICIAL_ADMINISTRATIVE_PRACTICE",
        requiredEvidence: true,
        minimumProvenance: "SOURCE_VERIFIED",
        evidenceTypes: ["OFFICIAL_RECORD"],
        lawyerRequired: false,
        surveyorRequired: false,
        recheckDays: 90,
        riskIfFailed: "HIGH",
      },
      evidence: [
        {
          id: "82000000-0000-4000-8000-000000000001",
          evidenceType: "OWNER_DOCUMENT",
          provenance: "RECEIVED",
          sourceClass: "URBANEDGE_OPERATIONAL_POLICY",
          supportsCheck: true,
          reference: "SYN-VF7",
          observedDate: "2026-09-04",
          privateDocumentId: "83000000-0000-4000-8000-000000000001",
          privateDocumentName: "private-record.pdf",
          scanStatus: "CLEAN",
          sourceReferenceId: null,
          sourceName: null,
          createdAt: "2026-09-04T00:00:00Z",
        },
      ],
      exceptions: [
        {
          id: "84000000-0000-4000-8000-000000000001",
          severity: "MEDIUM",
          summary: "Recorded area differs between supplied references.",
          limitation: "Area correspondence is unresolved.",
          blocksPublicDisclosure: true,
          status: "OPEN",
        },
      ],
      professionalReviews: [],
    },
  ],
  documents: [
    {
      id: "83000000-0000-4000-8000-000000000001",
      name: "private-record.pdf",
      documentType: "OWNER_DOCUMENT",
      scanStatus: "CLEAN",
      archivedAt: null,
    },
    {
      id: "83000000-0000-4000-8000-000000000002",
      name: "pending-record.pdf",
      documentType: "OWNER_DOCUMENT",
      scanStatus: "PENDING",
      archivedAt: null,
    },
  ],
  sources: [],
  history: [
    {
      id: 1,
      checkId: "81000000-0000-4000-8000-000000000001",
      eventType: "STATUS_CHANGED",
      fromStatus: "NOT_STARTED",
      toStatus: "IN_REVIEW",
      occurredAt: "2026-09-04T00:00:00Z",
      reason: null,
    },
  ],
};

const props = {
  detail,
  initializeAction: vi.fn(async () => ({ ok: true, message: "done" })),
  transitionAction: action,
  linkEvidenceAction: action,
  advanceEvidenceAction: action,
  applicabilityAction: action,
  exceptionAction: action,
  professionalReviewAction: action,
  recordSourceAction: action,
  retireEvidenceAction: action,
  resolveExceptionAction: action,
  updateProfessionalReviewAction: action,
};

describe("VerificationWorkspace", () => {
  it("presents scoped controls, provenance, exceptions, and the lawyer-copy block", () => {
    render(<VerificationWorkspace {...props} />);
    expect(
      screen.getByText(/No universal verification or legal-clearance status exists/),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "VF-7 reference reviewed" })).toBeVisible();
    expect(screen.getByText(/OWNER DOCUMENT/)).toBeVisible();
    expect(screen.getByText(/Recorded area differs/)).toBeVisible();
    expect(
      screen.getByText(/lawyer-approved public-copy policy is intentionally absent/),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Apply guarded transition" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Record exception" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Request scoped review" })).toBeVisible();
  });

  it("disables pending private evidence at the attachment boundary and exposes labels", () => {
    render(<VerificationWorkspace {...props} />);
    expect(
      screen
        .getAllByRole("option", { name: /pending-record\.pdf · PENDING/ })
        .every((option) => option.hasAttribute("disabled")),
    ).toBe(true);
    expect(screen.getAllByRole("combobox", { name: "Private document" })[0]).toBeVisible();
    expect(screen.getAllByLabelText("Evidence observed date")[0]).toBeVisible();
    expect(screen.getAllByLabelText("Recheck date")[0]).toBeVisible();
    expect(screen.getAllByRole("heading", { name: "Verification history" })[0]).toBeVisible();
  });
});
