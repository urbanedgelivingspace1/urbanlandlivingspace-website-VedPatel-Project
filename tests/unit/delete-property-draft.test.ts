// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockUpdate = vi.fn();
const mockInsert = vi.fn();
const mockMaybeSingle = vi.fn();
const mockRpc = vi.fn();

const mockClient = {
  rpc: mockRpc.mockResolvedValue({ error: null }),
  from: vi.fn((table: string) => {
    if (table === "properties") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            is: vi.fn(() => ({
              maybeSingle: mockMaybeSingle,
            })),
          })),
        })),
        update: mockUpdate.mockImplementation(() => ({
          eq: vi.fn(() => ({
            is: vi.fn(() => ({ error: null })),
          })),
        })),
      };
    }
    if (table === "audit_logs") {
      return {
        insert: mockInsert.mockResolvedValue({ error: null }),
      };
    }
    return {};
  }),
};

vi.mock("@/server/auth/authorization", () => ({
  requireActiveAdmin: vi.fn(async () => ({
    userId: "admin-uuid-123",
    role: "SYSTEM_ADMIN",
  })),
}));

vi.mock("@/server/supabase/privileged", () => ({
  createPrivilegedServerClient: vi.fn(() => mockClient),
}));

describe("deletePropertyDraft service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully soft-deletes a draft property and logs audit action", async () => {
    const { deletePropertyDraft } = await import("@/server/services/property-drafts");

    mockMaybeSingle.mockResolvedValue({
      data: {
        id: "prop-123",
        publication_status: "DRAFT",
        availability_status: "AVAILABLE",
        updated_at: "2026-09-10T10:00:00Z",
        property_code: "UE-LS-000001",
        listing_title: "Test Draft Land",
        archived_at: null,
        archived_by: null,
      },
      error: null,
    });

    await deletePropertyDraft("prop-123", "2026-09-10T10:00:00Z");

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        deleted_by: "admin-uuid-123",
        publication_status: "ARCHIVED",
        availability_status: "OFF_MARKET",
      }),
    );
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_admin_id: "admin-uuid-123",
        action: "DELETE",
        entity_type: "property",
        entity_id: "prop-123",
      }),
    );
  });

  it("prevents deleting a published property", async () => {
    const { deletePropertyDraft } = await import("@/server/services/property-drafts");

    mockMaybeSingle.mockResolvedValue({
      data: {
        id: "prop-published",
        publication_status: "PUBLISHED",
        availability_status: "AVAILABLE",
        updated_at: "2026-09-10T10:00:00Z",
        property_code: "UE-LS-000002",
        listing_title: "Live Land",
      },
      error: null,
    });

    await expect(deletePropertyDraft("prop-published")).rejects.toThrow(
      /Published properties cannot be deleted directly/,
    );
  });

  it("detects concurrency conflict when expectedUpdatedAt does not match", async () => {
    const { deletePropertyDraft } = await import("@/server/services/property-drafts");

    mockMaybeSingle.mockResolvedValue({
      data: {
        id: "prop-stale",
        publication_status: "DRAFT",
        availability_status: "AVAILABLE",
        updated_at: "2026-09-10T12:00:00Z",
        property_code: "UE-LS-000003",
        listing_title: "Stale Draft",
      },
      error: null,
    });

    await expect(deletePropertyDraft("prop-stale", "2026-09-10T10:00:00Z")).rejects.toThrow();
  });

  it("deleteProperty unpublishes and soft-deletes a published property", async () => {
    const { deleteProperty } = await import("@/server/services/property-drafts");

    mockMaybeSingle.mockResolvedValue({
      data: {
        id: "prop-published",
        publication_status: "PUBLISHED",
        availability_status: "AVAILABLE",
        updated_at: "2026-09-10T10:00:00Z",
        property_code: "UE-LS-000002",
        listing_title: "Live Land",
        archived_at: null,
        archived_by: null,
      },
      error: null,
    });

    await deleteProperty("prop-published", "2026-09-10T10:00:00Z");

    expect(mockRpc).toHaveBeenCalledWith("unpublish_property", expect.anything());
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        deleted_by: "admin-uuid-123",
        publication_status: "ARCHIVED",
        availability_status: "OFF_MARKET",
      }),
    );
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_admin_id: "admin-uuid-123",
        action: "DELETE",
        entity_type: "property",
        entity_id: "prop-published",
      }),
    );
  });

  it("safely handles properties with null district_id and null display_area_unit_id without throwing", async () => {
    const { listAdminProperties } = await import("@/server/services/property-drafts");

    mockClient.from = vi.fn((table: string) => {
      if (table === "properties") {
        return {
          select: vi.fn(() => ({
            is: vi.fn(() => ({
              order: vi.fn(() => ({
                range: vi.fn(async () => ({
                  data: [
                    {
                      id: "prop-null-fields",
                      property_code: "UE-LS-000004",
                      listing_title: "Draft with nulls",
                      land_category: "AGRICULTURAL",
                      primary_transaction_type: "BUY",
                      district_id: null,
                      display_area_value: 5,
                      display_area_unit_id: null,
                      availability_status: "AVAILABLE",
                      publication_status: "DRAFT",
                      updated_at: "2026-09-10T10:00:00Z",
                    },
                  ],
                  count: 1,
                  error: null,
                })),
              })),
            })),
          })),
        };
      }
      if (table === "districts" || table === "area_units") {
        return {
          select: vi.fn(() => ({
            in: vi.fn(async () => ({ data: [], error: null })),
          })),
        };
      }
      if (
        table === "property_offers" ||
        table === "media_assets" ||
        table === "private_documents"
      ) {
        return {
          select: vi.fn(() => ({
            in: vi.fn(() => ({
              eq: vi.fn(() => ({
                is: vi.fn(async () => ({ data: [], error: null })),
              })),
              is: vi.fn(async () => ({ data: [], error: null })),
            })),
          })),
        };
      }
      return {};
    }) as typeof mockClient.from;

    const result = await listAdminProperties();
    expect(result.items).toHaveLength(1);
    expect(result.items[0]!.districtName).toBe("Unknown district");
    expect(result.items[0]!.areaUnit).toBe("Unknown unit");
  });
});
