import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import OwnerSubmissionDetailPage from "@/app/(admin)/admin/(protected)/submissions/[id]/page";
import OwnerSubmissionsPage from "@/app/(admin)/admin/(protected)/submissions/page";

const submissionId = "95000000-0000-4000-8000-000000000010";
const adminId = "95000000-0000-4000-8000-000000000001";

vi.mock("@/app/(admin)/admin/(protected)/submissions/actions", () => ({
  addOwnerSubmissionNoteAction: vi.fn(),
  assignOwnerSubmissionAction: vi.fn(),
  transitionOwnerSubmissionAction: vi.fn(),
}));

vi.mock("@/server/services/owner-submissions", () => ({
  getOwnerSubmissionFilterOptions: vi.fn(async () => ({
    districts: [{ id: "00000000-0000-4000-8000-000000000003", name: "Ahmedabad" }],
    admins: [{ user_id: adminId, display_name: "M15 Admin" }],
  })),
  listOwnerSubmissions: vi.fn(async () => [
    {
      id: submissionId,
      submission_reference: "UE-OS-000001",
      party: { display_name: "Synthetic Owner", phone: "+919876543210", email: null },
      owner_intent: "SELL",
      land_category: "NA",
      district: { name: "Ahmedabad" },
      status: "NEW",
      assignee: { display_name: "M15 Admin" },
      next_action_at: null,
      created_at: "2026-09-06T10:00:00Z",
    },
  ]),
  getOwnerSubmissionWorkspace: vi.fn(async () => ({
    submission: {
      id: submissionId,
      submission_reference: "UE-OS-000001",
      party_id: "95000000-0000-4000-8000-000000000020",
      land_category: "NA",
      owner_intent: "SELL",
      status: "APPROVED",
      owner_relationship: "OWNER",
      preferred_contact: "PHONE",
      approximate_area_value: 3,
      location_visibility_preference: "APPROXIMATE",
      village_text: "Sanand village",
      taluka_text: "Sanand",
      source_description: "Private owner source description.",
      category_claims: { naStatusClaim: "Owner says NA" },
      assigned_to: adminId,
      version: 4,
    },
    party: { display_name: "Synthetic Owner", phone: "+919876543210", email: null },
    district: { name: "Ahmedabad" },
    areaUnit: { symbol: "ac", display_name: "Acre" },
    documents: [
      {
        id: "95000000-0000-4000-8000-000000000030",
        original_file_name: "title-copy.pdf",
        document_type: "OWNER_SUPPORTING_DOCUMENT",
        mime_type: "application/pdf",
        scan_status: "PENDING",
      },
    ],
    consents: [
      { purpose: "PRIVACY_NOTICE", privacy_notice_version: "M15-OWNER-INTAKE-2026-09-06" },
    ],
    events: [
      {
        id: 1,
        event_type: "STATUS_CHANGED",
        from_status: "UNDER_REVIEW",
        to_status: "APPROVED",
        note: null,
        occurred_at: "2026-09-06T10:00:00Z",
      },
    ],
    convertedProperty: null,
    assignedAdmin: { display_name: "M15 Admin" },
    duplicateSubmissions: [
      {
        id: "95000000-0000-4000-8000-000000000040",
        submission_reference: "UE-OS-000000",
        signals: ["Same owner/contact", "Similar area"],
      },
    ],
    possibleProperties: [],
    activeAdmins: [{ user_id: adminId, display_name: "M15 Admin" }],
  })),
}));

afterEach(cleanup);

describe("M15 owner submission admin", () => {
  it("renders the bounded operational filters and private queue", async () => {
    render(await OwnerSubmissionsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { name: "Owner submissions" })).toBeVisible();
    expect(screen.getByText("Synthetic Owner")).toBeVisible();
    expect(screen.getAllByText("M15 Admin")).toHaveLength(2);
    expect(screen.getByText(/Nothing in this queue is public inventory/i)).toBeVisible();
    expect(screen.getByRole("option", { name: "Pending scan" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Unassigned" })).toBeInTheDocument();
  });

  it("separates owner claims, duplicate review, quarantined files, assignment, and conversion", async () => {
    render(
      await OwnerSubmissionDetailPage({
        params: Promise.resolve({ id: submissionId }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(screen.getByText("Owner-provided claims")).toBeVisible();
    expect(screen.getByText(/Unverified input/i)).toBeVisible();
    expect(screen.getByText(/Possible duplicates — review only/i)).toBeVisible();
    expect(screen.getByText("Quarantined")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Review assignment" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Convert to draft" })).toBeVisible();
  });
});
