// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const rpc = vi.fn();

vi.mock("@/server/auth/authorization", () => ({
  requireActiveAdmin: vi.fn(async () => ({
    userId: "97000000-0000-4000-8000-000000000001",
    role: "ADMIN",
  })),
}));

vi.mock("@/server/supabase/privileged", () => ({
  createPrivilegedServerClient: vi.fn(() => ({ rpc })),
}));

describe("deleteCompletedLeadFollowUp service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes exactly the selected completed follow-up through the admin-only RPC", async () => {
    rpc.mockResolvedValue({
      data: "97000000-0000-4000-8000-000000000004",
      error: null,
    });
    const { deleteCompletedLeadFollowUp } = await import("@/server/services/crm");

    await expect(deleteCompletedLeadFollowUp("97000000-0000-4000-8000-000000000007")).resolves.toBe(
      "97000000-0000-4000-8000-000000000004",
    );
    expect(rpc).toHaveBeenCalledWith("delete_completed_lead_follow_up", {
      requested_actor_id: "97000000-0000-4000-8000-000000000001",
      requested_follow_up_id: "97000000-0000-4000-8000-000000000007",
    });
  });

  it("surfaces database failures so the action can keep the record visible", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "COMPLETED_FOLLOW_UP_NOT_FOUND" } });
    const { deleteCompletedLeadFollowUp } = await import("@/server/services/crm");

    await expect(
      deleteCompletedLeadFollowUp("97000000-0000-4000-8000-000000000008"),
    ).rejects.toThrow("COMPLETED_FOLLOW_UP_NOT_FOUND");
  });
});
