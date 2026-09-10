import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

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
      status: "PASSED",
      applicability: "APPLICABLE",
      applicabilityReason: "Core property identity",
      riskLevel: "LOW",
      scope:
        "Review parcel references and owner identity against title records and district revenue register.",
      limitations: "Does not establish boundary certification.",
      reviewerNotes: null,
      reviewedAt: "2026-09-08T00:00:00Z",
      checkDate: "2026-09-08",
      recheckAt: null,
      referralRequired: false,
      referralType: null,
      publicVisible: true,
      publicDisclosureEligible: true,
      publicCopyApproved: true,
      definition: {
        id: "80000000-0000-4000-8000-000000000001",
        code: "PROPERTY_IDENTITY_REVIEWED",
        name: "Property identity / parcel references",
        description: "Compare property and parcel references.",
        categoryScope: null,
        transactionScope: null,
        sourceClass: "OFFICIAL_ADMINISTRATIVE_PRACTICE",
        requiredEvidence: true,
        minimumProvenance: "REVIEWED",
        evidenceTypes: ["OWNER_DOCUMENT", "OFFICIAL_RECORD"],
        lawyerRequired: false,
        surveyorRequired: false,
        recheckDays: 365,
        riskIfFailed: "HIGH",
      },
      evidence: [
        {
          id: "82000000-0000-4000-8000-000000000001",
          evidenceType: "OWNER_DOCUMENT",
          provenance: "REVIEWED",
          sourceClass: "OFFICIAL_ADMINISTRATIVE_PRACTICE",
          supportsCheck: true,
          reference: "SYN-DOC",
          observedDate: "2026-09-08",
          privateDocumentId: "83000000-0000-4000-8000-000000000001",
          privateDocumentName: "owner-7-12.pdf",
          scanStatus: "CLEAN",
          sourceReferenceId: null,
          sourceName: null,
          createdAt: "2026-09-08T00:00:00Z",
        },
      ],
      exceptions: [],
      professionalReviews: [],
    },
    {
      id: "81000000-0000-4000-8000-000000000002",
      status: "IN_REVIEW",
      applicability: "APPLICABLE",
      applicabilityReason: "Agricultural revenue records",
      riskLevel: "HIGH",
      scope: null,
      limitations: null,
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
        id: "80000000-0000-4000-8000-000000000002",
        code: "REVENUE_RECORDS_REVIEWED",
        name: "Revenue records reviewed",
        description: "Review applicable revenue records.",
        categoryScope: "AGRICULTURAL",
        transactionScope: null,
        sourceClass: "OFFICIAL_ADMINISTRATIVE_PRACTICE",
        requiredEvidence: true,
        minimumProvenance: "SOURCE_VERIFIED",
        evidenceTypes: ["OFFICIAL_RECORD", "OFFICIAL_PORTAL_RESULT"],
        lawyerRequired: false,
        surveyorRequired: false,
        recheckDays: 90,
        riskIfFailed: "HIGH",
      },
      evidence: [
        {
          id: "82000000-0000-4000-8000-000000000002",
          evidenceType: "OFFICIAL_RECORD",
          provenance: "RECEIVED",
          sourceClass: "OFFICIAL_ADMINISTRATIVE_PRACTICE",
          supportsCheck: true,
          reference: "7-12-RECORD",
          observedDate: "2026-09-08",
          privateDocumentId: "83000000-0000-4000-8000-000000000001",
          privateDocumentName: "owner-7-12.pdf",
          scanStatus: "CLEAN",
          sourceReferenceId: null,
          sourceName: null,
          createdAt: "2026-09-08T00:00:00Z",
        },
      ],
      exceptions: [
        {
          id: "84000000-0000-4000-8000-000000000001",
          severity: "MEDIUM",
          summary: "Area mismatch between 7/12 and sale deed",
          limitation: "Area discrepancy",
          blocksPublicDisclosure: true,
          status: "OPEN",
        },
      ],
      professionalReviews: [],
    },
    {
      id: "81000000-0000-4000-8000-000000000003",
      status: "NOT_STARTED",
      applicability: "APPLICABLE",
      applicabilityReason: "Title encumbrance search",
      riskLevel: "HIGH",
      scope: null,
      limitations: null,
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
        id: "80000000-0000-4000-8000-000000000003",
        code: "ENCUMBRANCE_SEARCH_REVIEWED",
        name: "Encumbrance / search review",
        description: "Scoped search against official registries.",
        categoryScope: null,
        transactionScope: null,
        sourceClass: "PROFESSIONAL_DUE_DILIGENCE",
        requiredEvidence: true,
        minimumProvenance: "SOURCE_VERIFIED",
        evidenceTypes: ["OFFICIAL_SEARCH_RESULT"],
        lawyerRequired: true,
        surveyorRequired: false,
        recheckDays: 90,
        riskIfFailed: "HIGH",
      },
      evidence: [],
      exceptions: [],
      professionalReviews: [],
    },
  ],
  documents: [
    {
      id: "83000000-0000-4000-8000-000000000001",
      name: "owner-7-12.pdf",
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
      toStatus: "PASSED",
      occurredAt: "2026-09-08T00:00:00Z",
      reason: "Completed identity review",
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

describe("VerificationWorkspace Guided Admin Experience", () => {
  it("removes internal engineering and legal jargon from the normal interface", () => {
    render(<VerificationWorkspace {...props} />);

    // Internal jargon must NOT be visible in normal UI
    expect(screen.queryByText(/Scoped Result/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Guarded State Machine/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Apply guarded transition/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Independent from result/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^SOURCE_VERIFIED$/i)).not.toBeInTheDocument();

    // Human-friendly terminology is visible
    expect(screen.getByText(/Independent legal due diligence/i)).toBeVisible();
    expect(
      screen.getByText(/Verification helps UrbanEdge record what we actually checked/i),
    ).toBeVisible();
  });

  it("keeps verification independent from marketing publication", () => {
    render(<VerificationWorkspace {...props} />);
    expect(screen.getByText(/not required to market or publish/i)).toBeVisible();
    expect(screen.queryByText(/^REQUIRED TO PUBLISH$/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Return to marketing readiness/i })).toBeVisible();
  });

  it("collapses optional due diligence checks by default without rendering giant forms", () => {
    render(<VerificationWorkspace {...props} />);

    // Optional checks collapsed by default
    expect(screen.getAllByText(/OPTIONAL DUE DILIGENCE/i)[0]).toBeVisible();
    const toggleBtn = screen.getByRole("button", { name: /View 3 optional checks/i });
    expect(toggleBtn).toBeVisible();

    // Check heading for optional encumbrance check is not rendered until expanded
    expect(
      screen.queryByRole("heading", { name: "Encumbrance / search review" }),
    ).not.toBeInTheDocument();

    // Open optional checks
    fireEvent.click(toggleBtn);
    expect(screen.getByRole("heading", { name: "Encumbrance / search review" })).toBeVisible();
  });

  it("provides step-by-step guided workflow when opening an incomplete check", () => {
    render(<VerificationWorkspace {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /View 3 optional checks/i }));
    // Click "Continue check" on the Revenue records check
    const continueButtons = screen.getAllByRole("button", { name: /Continue check/i });
    fireEvent.click(continueButtons[0]!);

    // Step 1: Explain what to do
    expect(screen.getByText(/Why are we checking this\?/i)).toBeVisible();
    expect(screen.getByText(/What should you check\?/i)).toBeVisible();
    expect(screen.getByText(/What documents can you use\?/i)).toBeVisible();

    // Advance to Step 2 (Documents & Proof)
    fireEvent.click(screen.getByRole("button", { name: /Continue to proof →/i }));
    expect(screen.getByText(/Step 2 of 5 · Add proof/i)).toBeVisible();
    expect(screen.getAllByText(/owner-7-12\.pdf/i)[0]).toBeVisible();

    // Advance to Step 3 (Review method)
    fireEvent.click(screen.getByRole("button", { name: /Continue to review method →/i }));
    expect(screen.getByText(/Step 3 of 5 · Review method/i)).toBeVisible();
    expect(screen.getByText(/I checked it against an official source/i)).toBeVisible();

    // Advance to Step 4 (Outcome)
    fireEvent.click(screen.getByRole("button", { name: /Continue to review outcome →/i }));
    expect(screen.getByText(/Step 4 of 5 · Review outcome/i)).toBeVisible();
    expect(screen.getByText(/Everything looks consistent/i)).toBeVisible();

    // Advance to Step 5 (Summary & Save)
    fireEvent.click(screen.getByRole("button", { name: /Continue to summary & save →/i }));
    expect(screen.getByText(/Step 5 of 5 · Review Summary & Confirmation/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /^Save review$/i })).toBeVisible();
  });

  it("houses advanced controls under Advanced options", () => {
    render(<VerificationWorkspace {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /View 3 optional checks/i }));
    // Open the Revenue records card
    const continueButtons = screen.getAllByRole("button", { name: /Continue check/i });
    fireEvent.click(continueButtons[0]!);

    // Advanced options button exists
    const advBtn = screen.getAllByRole("button", {
      name: /Advanced options \(exceptions, referrals, relevance & disclosure\)/i,
    })[0]!;
    expect(advBtn).toBeVisible();

    // Click to expand advanced options
    fireEvent.click(advBtn);
    expect(screen.getByText(/Is this check relevant\?/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /Save relevance/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /Record issue/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /Request professional review/i })).toBeVisible();
  });

  it("handles available property documents dropdown selection and auto-populates reference", () => {
    render(<VerificationWorkspace {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /View 3 optional checks/i }));
    // Open the Revenue records card
    const continueButtons = screen.getAllByRole("button", { name: /Continue check/i });
    fireEvent.click(continueButtons[0]!);

    // Move to Step 2
    fireEvent.click(screen.getByRole("button", { name: /Continue to proof →/i }));

    // The dropdown is rendered with available options count
    const select = screen.getByLabelText(/Available property documents/i);
    expect(select).toBeVisible();
    expect(
      screen.getByRole("option", { name: /Choose an uploaded document \(2 available\)…/i }),
    ).toBeInTheDocument();

    // Select the clean document
    fireEvent.change(select, { target: { value: "83000000-0000-4000-8000-000000000001" } });
    expect((select as HTMLSelectElement).value).toBe("83000000-0000-4000-8000-000000000001");

    // Document reference field auto-populates with the document name
    const refInput = screen.getByLabelText(/Document \/ reference number/i);
    expect((refInput as HTMLInputElement).value).toBe("owner-7-12.pdf");
  });

  it("renders helpful empty state and allows inline document upload when no documents exist", () => {
    const detailWithoutDocs = {
      ...detail,
      documents: [],
    };
    const uploadMock = vi.fn(async () => ({ ok: true, message: "Uploaded" }));
    render(
      <VerificationWorkspace
        {...props}
        detail={detailWithoutDocs}
        uploadDocumentAction={uploadMock}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /View 3 optional checks/i }));
    // Open check and go to Step 2
    const continueButtons = screen.getAllByRole("button", { name: /Continue check/i });
    fireEvent.click(continueButtons[0]!);
    fireEvent.click(screen.getByRole("button", { name: /Continue to proof →/i }));

    // Empty state message
    expect(screen.getByText(/No private documents uploaded yet for this property/i)).toBeVisible();
    expect(
      screen.getByRole("option", { name: /No uploaded documents found for this property/i }),
    ).toBeInTheDocument();

    // Toggle inline uploader
    const uploadBtn = screen.getByRole("button", {
      name: /\+ Upload a new private document for this property/i,
    });
    expect(uploadBtn).toBeVisible();
    fireEvent.click(uploadBtn);

    expect(screen.getByText(/Upload new private document/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /Upload & Scan Document/i })).toBeVisible();
  });
});
