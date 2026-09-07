import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/(admin)/admin/login/actions", () => ({
  signInAdmin: vi.fn(),
  signOutAdmin: vi.fn(),
}));

import AdminLoginPage from "@/app/(admin)/admin/login/page";

describe("AdminLoginPage", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders sign in form without errors initially", async () => {
    const page = await AdminLoginPage({ searchParams: Promise.resolve({}) });
    render(page);

    expect(screen.getByRole("heading", { name: "Admin sign in" })).toBeVisible();
    expect(screen.getByLabelText("Email")).toBeVisible();
    expect(screen.getByLabelText("Password")).toBeVisible();
    expect(screen.getByRole("button", { name: "Sign in securely" })).toBeVisible();
  });

  it.each([
    ["invalid_credentials", "The credentials could not be verified."],
    ["rate_limited", "Too many sign-in attempts. Please wait a moment and try again."],
    [
      "service_unavailable",
      "Authentication service is temporarily unavailable. Please try again shortly.",
    ],
    ["not_active_admin", "This account is not authorized for the admin workspace."],
    ["no_session", "Your session has expired. Sign in again."],
    ["signed_out", "You have signed out safely."],
  ])("renders proper message for reason '%s'", async (reason, expectedMessage) => {
    const page = await AdminLoginPage({ searchParams: Promise.resolve({ reason }) });
    render(page);

    expect(screen.getByRole("status")).toHaveTextContent(expectedMessage);
  });
});
