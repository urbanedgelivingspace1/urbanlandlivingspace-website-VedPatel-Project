// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockUpdate = vi.fn();
const mockInsert = vi.fn();
const mockMaybeSingle = vi.fn();

const mockClient = {
  from: vi.fn((table: string) => {
    if (table === "leads") {
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

describe("deleteLead service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully soft-deletes an active lead and logs audit action", async () => {
    const { deleteLead } = await import("@/server/services/crm");

    mockMaybeSingle.mockResolvedValue({
      data: {
        id: "lead-uuid-123",
        lead_reference: "LEAD-0001",
        status: "NEW",
        archived_at: null,
      },
      error: null,
    });

    await deleteLead("lead-uuid-123");

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        archived_at: expect.any(String),
        updated_by: "admin-uuid-123",
      }),
    );
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_admin_id: "admin-uuid-123",
        action: "DELETE",
        entity_type: "lead",
        entity_id: "lead-uuid-123",
        changed_fields: ["archived_at"],
        before_state: {
          archived_at: null,
          status: "NEW",
        },
      }),
    );
  });

  it("throws error when lead is not found or already deleted", async () => {
    const { deleteLead } = await import("@/server/services/crm");

    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    await expect(deleteLead("non-existent-lead")).rejects.toThrow(
      "Lead not found or already deleted.",
    );
  });
});
