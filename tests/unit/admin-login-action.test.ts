// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminAuthorizationError } from "@/features/admin/domain/authorization";

const redirectMock = vi.fn((url: string) => {
  const error = new Error(`NEXT_REDIRECT:${url}`);
  (error as unknown as { digest: string }).digest = `NEXT_REDIRECT;replace;${url};307;`;
  throw error;
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockAuthenticatedClient = {
  auth: {
    signInWithPassword: mockSignInWithPassword,
    signOut: mockSignOut,
  },
};

vi.mock("@/server/supabase/authenticated", () => ({
  createAuthenticatedServerClient: vi.fn(async () => mockAuthenticatedClient),
}));

const mockRequireActiveAdmin = vi.fn();
vi.mock("@/server/auth/authorization", () => ({
  requireActiveAdmin: vi.fn(async () => mockRequireActiveAdmin()),
}));

describe("admin login server action error classification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });
    mockRequireActiveAdmin.mockResolvedValue({
      userId: "40000000-0000-4000-8000-000000000003",
      email: "admin@example.invalid",
      displayName: "Synthetic Admin",
      role: "ADMIN",
    });
  });

  async function callSignIn(email?: string, password?: string) {
    const { signInAdmin } = await import("@/app/(admin)/admin/login/actions");
    const formData = new FormData();
    if (email !== undefined) formData.set("email", email);
    if (password !== undefined) formData.set("password", password);
    return signInAdmin(formData);
  }

  it("redirects to invalid_input when email is malformed or password is too short", async () => {
    await expect(callSignIn("invalid-email", "short")).rejects.toThrow(
      "NEXT_REDIRECT:/admin/login?reason=invalid_input",
    );
    expect(redirectMock).toHaveBeenCalledWith("/admin/login?reason=invalid_input");
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("redirects to invalid_credentials on auth 400 or invalid_credentials code", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { status: 400, code: "invalid_credentials", message: "Invalid credentials" },
    });

    await expect(callSignIn("admin@example.com", "Password123!")).rejects.toThrow(
      "NEXT_REDIRECT:/admin/login?reason=invalid_credentials",
    );
    expect(redirectMock).toHaveBeenCalledWith("/admin/login?reason=invalid_credentials");
    expect(mockRequireActiveAdmin).not.toHaveBeenCalled();
  });

  it("classifies rate-limiting 429 / over_request_rate_limit without mislabeling as bad credentials", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { status: 429, code: "over_request_rate_limit", message: "Rate limit exceeded" },
    });

    await expect(callSignIn("admin@example.com", "Password123!")).rejects.toThrow(
      "NEXT_REDIRECT:/admin/login?reason=rate_limited",
    );
    expect(redirectMock).toHaveBeenCalledWith("/admin/login?reason=rate_limited");
    expect(mockRequireActiveAdmin).not.toHaveBeenCalled();
  });

  it("classifies upstream 5xx infrastructure failure as service_unavailable", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { status: 500, code: "unexpected_failure", message: "Database error" },
    });

    await expect(callSignIn("admin@example.com", "Password123!")).rejects.toThrow(
      "NEXT_REDIRECT:/admin/login?reason=service_unavailable",
    );
    expect(redirectMock).toHaveBeenCalledWith("/admin/login?reason=service_unavailable");
    expect(mockRequireActiveAdmin).not.toHaveBeenCalled();
  });

  it("handles transport/network fetch rejection gracefully as service_unavailable", async () => {
    mockSignInWithPassword.mockRejectedValueOnce(new Error("fetch failed"));

    await expect(callSignIn("admin@example.com", "Password123!")).rejects.toThrow(
      "NEXT_REDIRECT:/admin/login?reason=service_unavailable",
    );
    expect(redirectMock).toHaveBeenCalledWith("/admin/login?reason=service_unavailable");
    expect(mockRequireActiveAdmin).not.toHaveBeenCalled();
  });

  it("signs out and redirects when admin profile is inactive or non-admin", async () => {
    mockRequireActiveAdmin.mockRejectedValueOnce(new AdminAuthorizationError("NOT_ACTIVE_ADMIN"));

    await expect(callSignIn("admin@example.com", "Password123!")).rejects.toThrow(
      "NEXT_REDIRECT:/admin/login?reason=not_active_admin",
    );
    expect(mockSignOut).toHaveBeenCalledWith({ scope: "local" });
    expect(redirectMock).toHaveBeenCalledWith("/admin/login?reason=not_active_admin");
  });

  it("redirects to dashboard when credentials and admin authorization succeed", async () => {
    await expect(callSignIn("admin@example.com", "Password123!")).rejects.toThrow(
      "NEXT_REDIRECT:/admin/dashboard",
    );
    expect(redirectMock).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("signs out locally and redirects when signOutAdmin is invoked", async () => {
    const { signOutAdmin } = await import("@/app/(admin)/admin/login/actions");
    await expect(signOutAdmin()).rejects.toThrow("NEXT_REDIRECT:/admin/login?reason=signed_out");
    expect(mockSignOut).toHaveBeenCalledWith({ scope: "local" });
    expect(redirectMock).toHaveBeenCalledWith("/admin/login?reason=signed_out");
  });
});
