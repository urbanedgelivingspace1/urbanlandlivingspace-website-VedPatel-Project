import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import FollowUpsPage from "@/app/(admin)/admin/(protected)/follow-ups/page";
import LeadDetailPage from "@/app/(admin)/admin/(protected)/leads/[id]/page";
import LeadsPage from "@/app/(admin)/admin/(protected)/leads/page";
import PipelinePage from "@/app/(admin)/admin/(protected)/leads/pipeline/page";
import { RequirementList } from "@/components/admin/requirement-list";
import { LeadForm } from "@/components/admin/lead-form";
import type { LeadListItem, LeadWorkspace } from "@/features/crm/domain/contracts";

const service = vi.hoisted(() => ({
  listLeads: vi.fn(),
  getCrmReferenceData: vi.fn(),
  getLeadWorkspace: vi.fn(),
  searchMatchableProperties: vi.fn(),
  listFollowUps: vi.fn(),
  listRequirements: vi.fn(),
}));
vi.mock("@/server/services/crm", () => service);
vi.mock("@/server/services/site-visits", () => ({
  listSiteVisits: vi.fn(),
  getSiteVisitReferenceData: vi.fn(),
}));
vi.mock("@/app/(admin)/admin/(protected)/leads/actions", () => ({
  addActivityAction: vi.fn(),
  completeFollowUpAction: vi.fn(),
  deleteLeadAction: vi.fn(),
  matchPropertyAction: vi.fn(),
  saveRequirementAction: vi.fn(),
  scheduleFollowUpAction: vi.fn(),
  transitionLeadAction: vi.fn(),
  unmatchPropertyAction: vi.fn(),
  updateLeadAction: vi.fn(),
  uploadSellerLeadDocumentsAction: vi.fn(),
}));

const lead: LeadListItem = {
  id: "lead-1",
  leadReference: "UE-LD-000001",
  name: "M12 Buyer",
  phone: "+919999999999",
  email: "buyer@example.invalid",
  status: "QUALIFIED",
  sourceType: "MANUAL",
  buyerType: "INVESTOR",
  transaction: "BUY",
  category: "AGRICULTURAL",
  districtName: "Ahmedabad",
  localityText: "Sanand",
  budgetMin: 1_000_000,
  budgetMax: 3_000_000,
  nextFollowUpAt: "2026-09-06T06:30:00.000Z",
  lastContactedAt: "2026-09-05T06:30:00.000Z",
  createdAt: "2026-09-05T05:30:00.000Z",
  updatedAt: "2026-09-05T06:30:00.000Z",
  matchCount: 1,
};
const refs = {
  districts: [{ id: "district-1", name: "Ahmedabad" }],
  units: [{ id: "unit-1", display_name: "Acre", symbol: "ac" }],
  properties: [
    {
      id: "property-1",
      property_code: "UE-LS-000001",
      listing_title: "Sanand farmland",
      land_category: "AGRICULTURAL",
      primary_transaction_type: "BUY",
      availability_status: "AVAILABLE",
    },
  ],
  admins: [{ user_id: "admin-1", display_name: "CRM Admin" }],
};
const workspace: LeadWorkspace = {
  lead: {
    ...lead,
    partyId: "party-1",
    sourceDetail: "Referral",
    inquiryType: "BUYER_REQUIREMENT",
    intendedUse: "Investment",
    notesInternal: "Private intake",
    closedAt: null,
    lossReason: null,
  },
  requirement: {
    id: "requirement-1",
    minAreaValue: 1,
    maxAreaValue: 3,
    areaUnitId: "unit-1",
    areaUnitLabel: "Acre",
    preferredRoadWidthMMin: 9,
    preferredFrontageMMin: 20,
    notes: "Near Ahmedabad",
  },
  matches: [
    {
      id: "match-1",
      propertyId: "property-1",
      propertyCode: "UE-LS-000001",
      title: "Sanand farmland",
      category: "AGRICULTURAL",
      transaction: "BUY",
      availability: "AVAILABLE",
      status: "ACTIVE",
      notes: "Candidate",
      matchedAt: "2026-09-05T06:00:00.000Z",
    },
  ],
  documents: [],
  followUps: [
    {
      id: "follow-up-1",
      type: "CALL",
      context: "Discuss match",
      note: "Private follow-up",
      dueAt: "2026-09-06T06:30:00.000Z",
      completedAt: null,
      outcome: null,
      actorName: "CRM Admin",
    },
  ],
  activities: [
    {
      id: "activity-1",
      type: "NOTE_ADDED",
      at: "2026-09-05T06:00:00.000Z",
      note: "Buyer asked for highway access",
      metadata: null,
      actorName: "CRM Admin",
      propertyId: null,
    },
  ],
};

afterEach(cleanup);

service.searchMatchableProperties.mockResolvedValue([]);

describe("M12 CRM components", () => {
  it("provides an accessible lead editor with the approved demand taxonomy", async () => {
    const action = vi.fn(async () => ({
      ok: false,
      message: "Possible existing contact with 1 lead.",
      duplicateCount: 1,
    }));
    render(
      <LeadForm
        action={action}
        districts={[{ id: "00000000-0000-4000-8000-000000000003", name: "Ahmedabad" }]}
      />,
    );
    expect(screen.getByLabelText("Full name")).toBeRequired();
    expect(screen.getByLabelText("Phone")).toHaveAttribute("type", "tel");
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Transaction")).toHaveAccessibleName("Transaction");
    expect(screen.getByLabelText("Land category")).toHaveAccessibleName("Land category");
    expect(screen.getByRole("button", { name: "Add Lead" })).toBeEnabled();
    await userEvent.selectOptions(screen.getByLabelText("Transaction"), "BUY");
    expect(screen.getByLabelText("Transaction")).toHaveValue("BUY");
  });

  it("renders the bounded lead inbox, discovery controls, and empty state", async () => {
    service.listLeads.mockResolvedValueOnce([lead]);
    service.getCrmReferenceData.mockResolvedValue(refs);
    const populated = await LeadsPage({ searchParams: Promise.resolve({ q: "M12" }) });
    const view = render(populated);
    expect(screen.getByRole("heading", { name: "Leads" })).toBeVisible();
    expect(screen.getAllByRole("link", { name: "M12 Buyer" })[0]).toBeVisible();
    expect(screen.getByLabelText("Stage")).toBeVisible();
    expect(screen.getByLabelText("Next action")).toBeVisible();
    expect(screen.getByLabelText("Assigned to")).toBeInTheDocument();
    view.unmount();

    service.listLeads.mockResolvedValueOnce([]);
    render(await LeadsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { name: "No leads found" })).toBeVisible();
  });

  it("renders every pipeline lane and keeps empty lanes explicit", async () => {
    service.listLeads.mockResolvedValue([lead]);
    render(await PipelinePage());
    expect(screen.getByRole("heading", { name: "Pipeline" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Interested 1" })).toContainElement(
      screen.getByRole("link", { name: /M12 Buyer/ }),
    );
    expect(screen.getAllByText("No leads")).toHaveLength(8);
  });

  it("renders the operational lead workspace controls and attributed history", async () => {
    service.getLeadWorkspace.mockResolvedValue(workspace);
    service.getCrmReferenceData.mockResolvedValue(refs);
    render(
      await LeadDetailPage({
        params: Promise.resolve({ id: lead.id }),
        searchParams: Promise.resolve({}),
      }),
    );
    for (const heading of [
      "Overview",
      "Requirement",
      "Property matches",
      "Activity timeline",
      "Next action",
      "Lead stage",
      "Follow-up history",
    ])
      expect(screen.getByRole("heading", { name: heading })).toBeVisible();
    expect(screen.getByText("Buyer asked for highway access")).toBeVisible();
    expect(screen.getByText("Private intake")).toBeVisible();
    expect(screen.getByText("CRM Admin")).toBeVisible();
    expect(screen.getByRole("button", { name: "Remove match" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Complete follow-up" })).toBeEnabled();
    expect(screen.getByLabelText("Private note")).toHaveAccessibleName("Private note");
    expect(screen.getByText("Current stage")).toBeVisible();
    expect(screen.getAllByText("Interested").length).toBeGreaterThan(0);
    expect(screen.getByRole("option", { name: "Follow up later" })).toBeInTheDocument();
    expect(screen.queryByText("Nurture")).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("Move lead to"), "CLOSED_LOST");
    expect(screen.getByLabelText("Why is it not going ahead?")).toBeVisible();
    expect(screen.getByRole("option", { name: "Customer stopped replying" })).toBeInTheDocument();
  });

  it("prefills a draft from only the seller information that is actually known", async () => {
    const sellerWorkspace: LeadWorkspace = {
      ...workspace,
      lead: {
        ...workspace.lead,
        id: "seller-lead-1",
        leadReference: "UE-LD-000002",
        name: "M12 Seller",
        inquiryType: "SELLER_LEAD",
        transaction: "LEASE",
        category: "NA",
        districtName: "Ahmedabad",
        localityText: "Sanand",
        budgetMin: 12_500_000,
        budgetMax: 12_500_000,
      },
      requirement: {
        ...workspace.requirement!,
        minAreaValue: 2,
        maxAreaValue: 2,
      },
      matches: [],
      sellerProperties: [
        {
          id: "property-1",
          propertyCode: "UE-LS-000001",
          title: "Existing parcel",
          category: "NA",
          transaction: "LEASE",
          availability: "AVAILABLE",
          publicationStatus: "DRAFT",
          createdAt: "2026-09-05T06:00:00.000Z",
        },
      ],
    };
    service.getLeadWorkspace.mockResolvedValue(sellerWorkspace);
    service.getCrmReferenceData.mockResolvedValue(refs);

    render(
      await LeadDetailPage({
        params: Promise.resolve({ id: sellerWorkspace.lead.id }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(screen.getByRole("heading", { name: "Seller property" })).toBeVisible();
    expect(screen.getByRole("link", { name: /UE-LS-000001/ })).toBeVisible();
    const createLink = screen.getByRole("link", { name: /Add Property/ });
    const href = createLink.getAttribute("href");
    expect(href).toBeTruthy();
    const draftUrl = new URL(href!, "https://admin.example.invalid");
    expect(draftUrl.pathname).toBe("/admin/properties/new");
    expect(Object.fromEntries(draftUrl.searchParams)).toMatchObject({
      partyId: "party-1",
      sourceType: "SELLER_LEAD",
      sourceName: "UE-LD-000002",
      sourceReference: "seller-lead-1",
      category: "NA",
      transaction: "LEASE",
      districtId: "district-1",
      localityText: "Sanand",
      areaValue: "2",
      areaUnitId: "unit-1",
      priceMode: "EXACT_TOTAL",
      priceAmount: "12500000",
    });
    expect(draftUrl.searchParams.has("title")).toBe(false);
  });

  it("supports the canonical unmatched buyer preset without showing sellers", async () => {
    service.listLeads.mockResolvedValue([
      { ...lead, id: "buyer-unmatched", matchCount: 0 },
      { ...lead, id: "buyer-matched", name: "Matched Buyer", matchCount: 1 },
      {
        ...lead,
        id: "seller-unmatched",
        name: "Unmatched Seller",
        inquiryType: "SELLER_LEAD",
        matchCount: 0,
      },
    ]);
    service.getCrmReferenceData.mockResolvedValue(refs);

    render(await LeadsPage({ searchParams: Promise.resolve({ view: "unmatched_buyers" }) }));

    expect(screen.getAllByRole("link", { name: "M12 Buyer" })[0]).toBeVisible();
    expect(screen.queryByRole("link", { name: "Matched Buyer" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Unmatched Seller" })).not.toBeInTheDocument();
  });

  it("separates follow-up buckets and exposes completion controls", async () => {
    service.listFollowUps.mockResolvedValue([
      {
        id: "follow-up-1",
        lead_id: lead.id,
        follow_up_type: "CALL",
        context: "Discuss match",
        note: "Private follow-up",
        due_at: "2026-09-04T06:30:00.000Z",
        completed_at: null,
        completed_by: null,
        outcome: null,
        created_at: "2026-09-03T06:30:00.000Z",
        created_by: "admin-1",
        leadName: lead.name,
        leadReference: lead.leadReference,
        leadStatus: lead.status,
      },
    ]);
    render(await FollowUpsPage({ searchParams: Promise.resolve({ bucket: "OVERDUE" }) }));
    expect(screen.getByRole("link", { name: /Overdue/ })).toBeVisible();
    expect(screen.getByRole("link", { name: /Today/ })).toBeVisible();
    expect(screen.getByRole("link", { name: /Upcoming/ })).toBeVisible();
    expect(screen.getByRole("link", { name: /Completed/ })).toBeVisible();
    await userEvent.click(screen.getByText("Complete"));
    expect(screen.getByLabelText(`Outcome for ${lead.leadReference}`)).toBeVisible();
  });

  it("renders structured requirement rows and an explicit empty state", () => {
    const requirement = {
      id: "requirement-1",
      lead_id: lead.id,
      min_area_value: 1,
      max_area_value: 3,
      area_unit_id: "unit-1",
      normalized_min_area_sqm: null,
      normalized_max_area_sqm: null,
      preferred_road_width_m_min: null,
      preferred_frontage_m_min: null,
      preferred_use_text: "Near Ahmedabad",
      created_at: "2026-09-05T06:00:00.000Z",
      updated_at: "2026-09-05T06:00:00.000Z",
    };
    const view = render(
      <RequirementList
        title="Buyer requirements"
        items={[{ requirement, lead, matchCount: 1, areaUnit: "Acre" }]}
      />,
    );
    expect(screen.getByRole("link", { name: lead.name })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Matches" })).toBeVisible();
    view.unmount();
    render(<RequirementList title="Buyer requirements" items={[]} />);
    expect(screen.getByText("No buyer requirements found.")).toBeVisible();
  });

  it("renders delete lead button and handles user confirmation", async () => {
    service.getLeadWorkspace.mockResolvedValueOnce(workspace);
    service.getCrmReferenceData.mockResolvedValueOnce(refs);
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    const { deleteLeadAction } = await import("@/app/(admin)/admin/(protected)/leads/actions");
    render(
      await LeadDetailPage({
        params: Promise.resolve({ id: lead.id }),
        searchParams: Promise.resolve({}),
      }),
    );

    const deleteButtons = screen.getAllByTestId("btn-delete-lead");
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);

    await userEvent.click(deleteButtons[0]!);
    expect(confirmSpy).toHaveBeenCalled();
    expect(deleteLeadAction).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
