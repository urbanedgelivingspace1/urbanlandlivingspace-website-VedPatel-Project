import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SiteVisitDetailPage from "@/app/(admin)/admin/(protected)/site-visits/[id]/page";
import SiteVisitsPage from "@/app/(admin)/admin/(protected)/site-visits/page";
import { SiteVisitDetailWorkspace } from "@/components/admin/site-visit-workspace";
import type {
  SiteVisitListItem,
  SiteVisitWorkspace,
} from "@/features/site-visits/domain/contracts";

const service = vi.hoisted(() => ({
  listSiteVisits: vi.fn(),
  getSiteVisitReferenceData: vi.fn(),
  getSiteVisitWorkspace: vi.fn(),
}));
vi.mock("@/server/services/site-visits", () => service);
vi.mock("@/app/(admin)/admin/(protected)/site-visits/actions", () => ({
  transitionSiteVisitAction: vi.fn(),
  addSiteVisitNoteAction: vi.fn(),
  scheduleSiteVisitFollowUpAction: vi.fn(),
}));

const item: SiteVisitListItem = {
  id: "visit-1",
  reference: "UE-SV-000001",
  version: 2,
  status: "REQUESTED",
  leadId: "lead-1",
  leadReference: "UE-LD-000001",
  leadName: "M14 Visitor",
  phone: "+919999999999",
  propertyId: "property-1",
  propertyCode: "UE-LS-000001",
  propertyTitle: "Sanand farmland",
  availability: "AVAILABLE",
  publication: "PUBLISHED",
  requestedStartAt: "2099-01-02T03:30:00.000Z",
  proposedStartAt: null,
  confirmedStartAt: null,
  effectiveStartAt: "2099-01-02T03:30:00.000Z",
  bucket: "UPCOMING",
  assignedName: null,
  hasOpenFollowUp: false,
  updatedAt: "2026-09-05T06:30:00.000Z",
};

function workspace(status = item.status): SiteVisitWorkspace {
  return {
    visit: {
      ...item,
      status,
      proposedStartAt:
        status === "REQUESTED" || status === "CONTACTED" ? null : "2099-01-02T04:30:00.000Z",
      confirmedStartAt: ["CONFIRMED", "COMPLETED", "NO_SHOW"].includes(status)
        ? "2026-09-05T03:30:00.000Z"
        : null,
      requestedEndAt: "2099-01-02T06:30:00.000Z",
      proposedEndAt:
        status === "REQUESTED" || status === "CONTACTED" ? null : "2099-01-02T05:30:00.000Z",
      confirmedEndAt: ["CONFIRMED", "COMPLETED", "NO_SHOW"].includes(status)
        ? "2026-09-05T05:30:00.000Z"
        : null,
      timezone: "Asia/Kolkata",
      meetingInstructions: null,
      contactOutcome: status === "REQUESTED" ? null : "Reached visitor",
      contactedAt: status === "REQUESTED" ? null : "2026-09-05T06:30:00.000Z",
      completedAt: status === "COMPLETED" ? "2026-09-05T06:30:00.000Z" : null,
      cancelledAt: status === "CANCELLED" ? "2026-09-05T06:30:00.000Z" : null,
      cancellationReason: status === "CANCELLED" ? "Visitor unavailable" : null,
      noShowAt: status === "NO_SHOW" ? "2026-09-05T06:30:00.000Z" : null,
      outcome: status === "COMPLETED" ? "Interested" : null,
      requestNotes: "Morning preferred",
      leadEmail: "m14@example.invalid",
      propertyConflict: null,
    },
    events: [
      {
        id: "event-1",
        type: "REQUESTED",
        fromStatus: null,
        toStatus: "REQUESTED",
        previousStartAt: null,
        newStartAt: item.requestedStartAt,
        reason: null,
        note: "Manual confirmation required",
        actorName: "System",
        occurredAt: "2026-09-05T06:30:00.000Z",
      },
    ],
    followUps: [],
  };
}

const action = vi.fn(async () => undefined);
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("M14 site-visit operations components", () => {
  it("renders a bounded accessible queue with all operational filters", async () => {
    service.listSiteVisits.mockResolvedValue([item]);
    service.getSiteVisitReferenceData.mockResolvedValue({
      admins: [{ user_id: "admin-1", display_name: "Visit Admin" }],
    });
    render(await SiteVisitsPage({ searchParams: Promise.resolve({ status: "REQUESTED" }) }));
    expect(screen.getByRole("heading", { name: "Site visit queue" })).toBeVisible();
    expect(screen.getByLabelText("Search site visits")).toBeVisible();
    expect(screen.getByLabelText("Visit status")).toHaveValue("REQUESTED");
    expect(screen.getByLabelText("Schedule window")).toBeVisible();
    expect(screen.getByLabelText("Follow-up state")).toBeVisible();
    expect(screen.getByRole("link", { name: item.reference })).toBeVisible();
    expect(screen.getByText("Record contact")).toBeVisible();
  });

  it("renders the protected detail context and distinct contact operation", async () => {
    service.getSiteVisitWorkspace.mockResolvedValue(workspace());
    render(
      await SiteVisitDetailPage({
        params: Promise.resolve({ id: item.id }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(screen.getByRole("heading", { name: /M14 Visitor · UE-LS-000001/ })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Operational timeline" })).toBeVisible();
    expect(screen.getByLabelText("Contact outcome")).toBeRequired();
    expect(screen.queryByRole("button", { name: "Confirm visit" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open CRM lead →" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Open property →" })).toBeVisible();
  });

  it("exposes proposal, explicit confirmation, reschedule, outcome and destructive controls only in valid states", () => {
    const renderState = (status: SiteVisitWorkspace["visit"]["status"]) => {
      const view = render(
        <SiteVisitDetailWorkspace
          workspace={workspace(status)}
          transitionAction={action}
          noteAction={action}
          followUpAction={action}
        />,
      );
      return view;
    };
    let view = renderState("CONTACTED");
    expect(screen.getByRole("button", { name: "Save proposal" })).toBeVisible();
    view.unmount();
    view = renderState("PROPOSED");
    expect(screen.getByRole("button", { name: "Confirm visit" })).toBeVisible();
    expect(screen.getByLabelText("Reschedule reason")).toBeRequired();
    expect(screen.getByText("Cancel visit")).toBeVisible();
    view.unmount();
    view = renderState("CONFIRMED");
    expect(screen.getByRole("button", { name: "Mark completed" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Record no-show" })).toBeVisible();
    view.unmount();
    renderState("COMPLETED");
    expect(screen.getByRole("button", { name: "Schedule separate follow-up" })).toBeVisible();
    expect(screen.getByText(/terminal operational state/i)).toBeVisible();
  });

  it("surfaces property conflict with text and keeps status independent of color", () => {
    const conflicted = workspace("CONFIRMED");
    render(
      <SiteVisitDetailWorkspace
        workspace={{
          ...conflicted,
          visit: { ...conflicted.visit, propertyConflict: "Property is sold." },
        }}
        transitionAction={action}
        noteAction={action}
        followUpAction={action}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Property is sold");
    expect(screen.getByRole("heading", { name: "Operational controls" })).toBeVisible();
  });
});
