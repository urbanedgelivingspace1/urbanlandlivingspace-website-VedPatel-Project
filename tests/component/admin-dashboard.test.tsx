import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/server/services/crm");
vi.mock("@/server/services/site-visits");
vi.mock("@/server/services/owner-submissions");

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AdminDashboardPage from "@/app/(admin)/admin/(protected)/dashboard/page";
import ProtectedAdminError from "@/app/(admin)/admin/(protected)/error";
import * as crmService from "@/server/services/crm";
import * as ownerSubmissionsService from "@/server/services/owner-submissions";
import * as siteVisitsService from "@/server/services/site-visits";

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders pipeline cards successfully when backend services fulfill", async () => {
    vi.mocked(crmService.listLeads).mockResolvedValue([{ id: "lead-1", status: "NEW" } as never]);
    vi.mocked(crmService.listFollowUps).mockResolvedValue([
      { due_at: "2026-09-07T12:00:00Z", completed_at: null } as never,
    ]);
    vi.mocked(siteVisitsService.listSiteVisits).mockResolvedValue([
      { status: "REQUESTED", bucket: "TODAY", hasOpenFollowUp: true } as never,
    ]);
    vi.mocked(ownerSubmissionsService.listOwnerSubmissions).mockResolvedValue([
      { id: "sub-1", status: "NEW" } as never,
    ]);

    const ui = await AdminDashboardPage();
    render(ui);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    expect(screen.getByText("New owner submissions")).toBeVisible();
    expect(screen.getByText("New leads")).toBeVisible();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders gracefully with a database notice banner when upstream services reject", async () => {
    vi.mocked(crmService.listLeads).mockRejectedValue(new Error("Invalid API key"));
    vi.mocked(crmService.listFollowUps).mockRejectedValue(new Error("Invalid API key"));
    vi.mocked(siteVisitsService.listSiteVisits).mockRejectedValue(new Error("Invalid API key"));
    vi.mocked(ownerSubmissionsService.listOwnerSubmissions).mockRejectedValue(
      new Error("Invalid API key"),
    );

    const ui = await AdminDashboardPage();
    render(ui);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.getByText("Database Service Notice")).toBeVisible();
    expect(screen.getByText(/SUPABASE_SERVICE_ROLE_KEY/)).toBeVisible();
    // Pipeline cards still render without crashing
    expect(screen.getByText("New owner submissions")).toBeVisible();
    expect(screen.getByText("New leads")).toBeVisible();
  });
});

describe("ProtectedAdminError", () => {
  it("renders workspace error boundary with retry capability", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(
      <ProtectedAdminError
        error={Object.assign(new Error("Database connection lost"), { digest: "12345" })}
        reset={reset}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Unable to load administrative workspace" }),
    ).toBeVisible();
    const tryAgainBtn = screen.getByRole("button", { name: "Try again" });
    expect(tryAgainBtn).toBeVisible();
    await user.click(tryAgainBtn);
    expect(reset).toHaveBeenCalledOnce();
  });
});
