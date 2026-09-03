// @vitest-environment node

import { describe, expect, it } from "vitest";

import { authorizeAdminIdentity, type AdminProfile } from "@/features/admin/domain/authorization";

const identity = { id: "40000000-0000-4000-8000-000000000003", email: "admin@example.invalid" };
const profile: AdminProfile = {
  user_id: identity.id,
  display_name: "Synthetic Admin",
  role: "ADMIN",
  is_active: true,
};

describe("active admin authorization", () => {
  it("returns a minimal trusted admin identity for a matching active profile", () => {
    expect(authorizeAdminIdentity(identity, profile)).toEqual({
      userId: identity.id,
      email: identity.email,
      displayName: "Synthetic Admin",
      role: "ADMIN",
    });
  });

  it("rejects an anonymous session", () => {
    expect(() => authorizeAdminIdentity(null, null)).toThrow(
      expect.objectContaining({ reason: "NO_SESSION" }),
    );
  });

  it.each([
    ["missing profile", null],
    ["inactive profile", { ...profile, is_active: false }],
    [
      "profile for another identity",
      { ...profile, user_id: "40000000-0000-4000-8000-000000000004" },
    ],
  ])("rejects %s", (_label, candidate) => {
    expect(() => authorizeAdminIdentity(identity, candidate)).toThrow(
      expect.objectContaining({ reason: "NOT_ACTIVE_ADMIN" }),
    );
  });
});
