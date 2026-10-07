import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PropertyWorkspace } from "@/components/admin/property-workspace";
import type { AdminPropertyDraftRecord } from "@/server/services/property-drafts";
import type { PublicationReadiness } from "@/features/properties/domain/publication";
import type { AdminMediaAssetDto } from "@/features/media/domain/contracts";
import type { PropertyInterestedBuyers } from "@/features/crm/domain/contracts";
import type { PropertyActivityItem } from "@/features/properties/domain/contracts";

const mockProperty = {
  property: {
    id: "20000000-0000-4000-8000-000000000001",
    property_code: "UE-LS-000001",
    listing_title: "Sanand Prime Agricultural Land",
    public_slug: "sanand-prime-agricultural-land",
    land_category: "AGRICULTURAL",
    primary_transaction_type: "BUY",
    publication_status: "DRAFT",
    availability_status: "AVAILABLE",
    display_area_value: 5.2,
    public_address: "Sanand, Ahmedabad District",
    created_at: "2026-09-04T00:00:00Z",
    updated_at: "2026-09-04T00:00:00Z",
    archived_at: null,
    archived_by: null,
    published_at: null,
    area_unit_id: "10000000-0000-4000-8000-000000000006",
    district_id: "00000000-0000-4000-8000-000000000003",
    legal_clearance_status: "NOT_STARTED",
    area_conversion_rule_id: null,
    area_normalization_status: "AUTHORITATIVE",
    created_by: null,
    description_public: "Lush farmland",
    hero_image_asset_id: null,
    intent_primary: "SALE",
    listing_summary_public: "Prime plot",
    notes_internal: null,
    normalized_area_sqm: 21043,
    property_type: "AGRICULTURAL_LAND",
    state_id: "00000000-0000-4000-8000-000000000001",
    status_updated_at: "2026-09-04T00:00:00Z",
    taluka_id: null,
    village_id: null,
    updated_by: null,
  },
  districtName: "Ahmedabad",
  areaUnitName: "Acre",
  location: {
    property_id: "20000000-0000-4000-8000-000000000001",
    location_visibility: "APPROXIMATE",
    public_latitude: 23.0123,
    public_longitude: 72.3456,
    public_accuracy_m: 1000,
    private_latitude: 23.0145,
    private_longitude: 72.3489,
    private_accuracy_m: 5,
    location_notes: null,
    location_source_reference_id: null,
    created_at: "2026-09-04T00:00:00Z",
    updated_at: "2026-09-04T00:00:00Z",
  },
  offer: {
    property_id: "20000000-0000-4000-8000-000000000001",
    id: "30000000-0000-4000-8000-000000000001",
    price_mode: "EXACT_TOTAL",
    price_amount: 25000000,
    is_negotiable: true,
    price_min: null,
    price_max: null,
    price_per_unit: null,
    archived_at: null,
    commercial_terms: null,
    currency_code: "INR",
    is_primary: true,
    payment_frequency: null,
    price_notes_internal: null,
    price_words_public: null,
    token_amount: null,
    created_at: "2026-09-04T00:00:00Z",
    updated_at: "2026-09-04T00:00:00Z",
  },
  parcel: {
    property_id: "20000000-0000-4000-8000-000000000001",
    parcel_label: "Survey 412/1",
    created_at: "2026-09-04T00:00:00Z",
    updated_at: "2026-09-04T00:00:00Z",
    archived_at: null,
    area_normalization_status: "AUTHORITATIVE",
    area_source_reference_id: null,
    created_by: null,
    id: "60000000-0000-4000-8000-000000000001",
    is_primary: true,
    parcel_notes_internal: null,
    spatial_data_source: null,
    updated_by: null,
    identifier: {
      id: "70000000-0000-4000-8000-000000000001",
      parcel_id: "20000000-0000-4000-8000-000000000001",
      identifier_type: "SURVEY_NUMBER",
      identifier_value: "412/1",
      is_primary: true,
      normalized_value: "412/1",
      public_visibility: "PUBLIC",
      source_reference_id: null,
      created_at: "2026-09-04T00:00:00Z",
      updated_at: "2026-09-04T00:00:00Z",
      valid_from: null,
      valid_to: null,
    },
  },
  planning: {
    property_id: "20000000-0000-4000-8000-000000000001",
    id: "planning-1",
    reservation_status: "NONE",
    road_reservation_status: "NONE",
    development_plan_zone_id: null,
    planning_authority_id: null,
    planning_notes_internal: null,
    planning_notes_public: null,
    primary_tp_plot_id: null,
    source_reference_id: null,
    tp_scheme_id: null,
    archived_at: null,
    checked_at: null,
    created_at: "2026-09-04T00:00:00Z",
    updated_at: "2026-09-04T00:00:00Z",
  },
  agricultural: {
    property_id: "20000000-0000-4000-8000-000000000001",
    irrigation_status: "CANAL_IRRIGATED",
    tenure_type: "OLD_TENURE",
    road_touch: true,
    agricultural_use_status: "ACTIVE",
    borewell_count: null,
    boundary_summary_public: null,
    built_structure_area: null,
    built_structure_area_unit_id: null,
    canal_access_status: null,
    created_at: "2026-09-04T00:00:00Z",
    created_by: null,
    current_cultivation_status: null,
    electricity_status: null,
    fencing_status: null,
    land_shape: null,
    measurement_source_reference_id: null,
    primary_irrigation_source: null,
    road_width_m: null,
    structure_present: null,
    survey_mapni_status: null,
    topography: null,
    tree_count_estimate: null,
    updated_at: "2026-09-04T00:00:00Z",
    updated_by: null,
    well_count: null,
  },
  na: null,
  industrial: null,
  partyLink: null,
  sourceLink: null,
  mediaCount: 1,
  hasApprovedCover: true,
  documentCount: 1,
  verificationCount: 2,
} as unknown as AdminPropertyDraftRecord;

const mockReadiness: PublicationReadiness = {
  propertyId: "20000000-0000-4000-8000-000000000001",
  propertyCode: "UE-LS-000001",
  publicSlug: "sanand-prime-agricultural-land",
  publicationStatus: "DRAFT",
  availabilityStatus: "AVAILABLE",
  locationVisibility: "APPROXIMATE",
  ready: false,
  blockers: [{ group: "MEDIA", code: "COVER", message: "Choose an approved cover image." }],
  warnings: [],
  evaluatedAt: "2026-09-04T00:00:00Z",
};

const mockMedia: AdminMediaAssetDto[] = [
  {
    id: "media-1",
    propertyId: "20000000-0000-4000-8000-000000000001",
    mediaType: "IMAGE",
    mediaSubtype: null,
    sourceType: "UPLOAD",
    storageBucket: "media",
    objectPath: "photo1.jpg",
    externalUrl: null,
    externalProvider: null,
    externalMediaId: null,
    mimeType: "image/jpeg",
    fileSizeBytes: 1024000,
    width: 1920,
    height: 1080,
    altText: "Lush farmland view",
    caption: "Front entrance facing road",
    visibility: "PUBLIC",
    processingStatus: "APPROVED",
    isCover: true,
    sortOrder: 1,
    approvedAt: "2026-09-04T00:00:00Z",
    archivedAt: null,
    previewUrl: "/mock/photo1.jpg",
  },
];

const driveBrochure: AdminMediaAssetDto = {
  ...mockMedia[0]!,
  id: "media-drive-brochure",
  mediaType: "BROCHURE",
  sourceType: "GOOGLE_DRIVE",
  storageBucket: null,
  objectPath: null,
  externalUrl: "https://drive.google.com/file/d/1AbCdEfGhIjKlMn/view",
  externalProvider: "GOOGLE_DRIVE",
  externalMediaId: "1AbCdEfGhIjKlMn",
  mimeType: null,
  fileSizeBytes: null,
  width: null,
  height: null,
  altText: null,
  caption: null,
  isCover: false,
  sortOrder: 2,
  previewUrl: "https://drive.google.com/file/d/1AbCdEfGhIjKlMn/view",
};

const action = vi.fn(async () => ({ ok: true, message: "Done" }));
const mutateAction = vi.fn(async () => {});

describe("PropertyWorkspace", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the property header and contextual publishing status", () => {
    render(
      <PropertyWorkspace
        property={mockProperty}
        readiness={mockReadiness}
        mediaList={mockMedia}
        publishAction={action}
        unpublishAction={action}
        changeAvailabilityAction={mutateAction}
        markPropertySoldAction={mutateAction}
        archivePropertyAction={mutateAction}
        restorePropertyAction={mutateAction}
      />,
    );

    // Executive Header elements
    expect(screen.getAllByText("UE-LS-000001")[0]).toBeVisible();
    expect(screen.getByRole("heading", { name: "Sanand Prime Agricultural Land" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Edit" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Add Photos / Brochure" })).toBeVisible();
    expect(screen.queryByRole("link", { name: "Verification" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "1 item before publishing" })).toBeVisible();
    expect(screen.queryByText("1. Listing Details")).not.toBeInTheDocument();
  });

  it("renders each of the four task-focused workspace tabs", () => {
    const mockInterestedBuyers: PropertyInterestedBuyers = {
      matches: [
        {
          id: "match-1",
          leadId: "lead-1",
          leadReference: "LD-00001",
          leadName: "Rajesh Patel",
          leadPhone: "+91 98765 43210",
          leadStatus: "QUALIFIED",
          matchedAt: "2026-09-05T00:00:00Z",
          notes: "Interested in farmland investment",
        },
      ],
      siteVisits: [
        {
          id: "visit-1",
          leadId: "lead-1",
          leadReference: "LD-00001",
          leadName: "Rajesh Patel",
          scheduledAt: "2026-09-15T10:00:00Z",
          status: "SCHEDULED",
          notes: "Morning visit requested",
        },
      ],
    };
    const activity: PropertyActivityItem[] = [
      {
        id: "activity-1",
        at: "2026-09-05T00:00:00Z",
        label: "Property updated",
        detail: "Price revised",
      },
    ];
    const props = {
      property: mockProperty,
      readiness: mockReadiness,
      mediaList: mockMedia,
      interestedBuyers: mockInterestedBuyers,
      activity,
      publishAction: action,
      unpublishAction: action,
      changeAvailabilityAction: mutateAction,
      markPropertySoldAction: mutateAction,
      archivePropertyAction: mutateAction,
      restorePropertyAction: mutateAction,
    };

    render(<PropertyWorkspace {...props} initialTab="overview" />);
    expect(screen.getByText("Property Details")).toBeVisible();
    expect(screen.getByText("Price")).toBeVisible();
    expect(screen.getByText("₹ 2,50,00,000")).toBeVisible();

    cleanup();
    render(<PropertyWorkspace {...props} initialTab="media" />);
    expect(
      screen.getByRole("heading", { name: /Photos & (Listing Media|Brochure) \(1\)/ }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Add or Manage Photos" })).toBeVisible();
    expect(screen.getByText("Front entrance facing road")).toBeVisible();
    expect(screen.queryByText(/Private Documents/)).not.toBeInTheDocument();
    expect(screen.queryByText("Add Documents")).not.toBeInTheDocument();
    expect(screen.queryByText("Document Category")).not.toBeInTheDocument();
    expect(screen.queryByText(/Drop documents here/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Upload files" })).not.toBeInTheDocument();

    cleanup();
    render(<PropertyWorkspace {...props} initialTab="buyers" />);
    expect(screen.getByRole("heading", { name: "Interested Leads & Site Visits" })).toBeVisible();
    expect(screen.getAllByText("Rajesh Patel")[0]).toBeVisible();
    expect(screen.getAllByText("LD-00001")[0]).toBeVisible();

    cleanup();
    render(<PropertyWorkspace {...props} initialTab="activity" />);
    expect(screen.getByRole("heading", { name: "Activity" })).toBeVisible();
    expect(screen.getByText("Price revised")).toBeVisible();
    expect(screen.getByRole("button", { name: "Mark Property Sold" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Change availability" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Archive property" })).toBeVisible();
  });

  it("renders a Drive brochure as a document card instead of an image", () => {
    render(
      <PropertyWorkspace
        property={mockProperty}
        readiness={mockReadiness}
        initialTab="media"
        mediaList={[...mockMedia, driveBrochure]}
        publishAction={action}
        unpublishAction={action}
        changeAvailabilityAction={mutateAction}
        markPropertySoldAction={mutateAction}
        archivePropertyAction={mutateAction}
        restorePropertyAction={mutateAction}
      />,
    );

    expect(screen.getByText("Property brochure")).toBeVisible();
    expect(screen.getByRole("img", { name: "Lush farmland view" })).toBeVisible();
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("renders delete draft button for draft properties and handles confirmation", async () => {
    const deleteAction = vi.fn(async () => {});
    const confirmSpy = vi.spyOn(window, "confirm");

    render(
      <PropertyWorkspace
        property={mockProperty}
        readiness={mockReadiness}
        initialTab="overview"
        publishAction={action}
        unpublishAction={action}
        changeAvailabilityAction={mutateAction}
        markPropertySoldAction={mutateAction}
        archivePropertyAction={mutateAction}
        restorePropertyAction={mutateAction}
        deletePropertyDraftAction={deleteAction}
      />,
    );

    const deleteButtons = screen.getAllByTestId("btn-delete-draft");
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
    const firstButton = deleteButtons[0]!;

    // Test cancellation
    confirmSpy.mockReturnValueOnce(false);
    fireEvent.click(firstButton);
    expect(confirmSpy).toHaveBeenCalled();
    expect(deleteAction).not.toHaveBeenCalled();

    // Test confirmation
    confirmSpy.mockReturnValueOnce(true);
    fireEvent.click(firstButton);
    expect(confirmSpy).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(deleteAction).toHaveBeenCalledTimes(1));

    confirmSpy.mockRestore();
  });

  it("does not render delete draft button for published properties", () => {
    const deleteAction = vi.fn(async () => {});
    const publishedProperty = {
      ...mockProperty,
      property: {
        ...mockProperty.property,
        publication_status: "PUBLISHED" as const,
      },
    };

    render(
      <PropertyWorkspace
        property={publishedProperty}
        readiness={mockReadiness}
        initialTab="overview"
        publishAction={action}
        unpublishAction={action}
        changeAvailabilityAction={mutateAction}
        markPropertySoldAction={mutateAction}
        archivePropertyAction={mutateAction}
        restorePropertyAction={mutateAction}
        deletePropertyDraftAction={deleteAction}
      />,
    );

    expect(screen.queryByTestId("btn-delete-draft")).toBeNull();
  });
});
