import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/server/services/crm");
vi.mock("@/server/services/site-visits");
vi.mock("@/server/services/property-drafts");

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AdminDashboardPage from "@/app/(admin)/admin/(protected)/dashboard/page";
import ProtectedAdminError from "@/app/(admin)/admin/(protected)/error";
import * as crmService from "@/server/services/crm";
import * as propertyDraftsService from "@/server/services/property-drafts";
import * as siteVisitsService from "@/server/services/site-visits";

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders pipeline cards successfully when backend services fulfill", async () => {
    vi.mocked(crmService.getDashboardLeadMetrics).mockResolvedValue({ newLeadsCount: 1 });
    vi.mocked(crmService.getDashboardFollowUpMetrics).mockResolvedValue({
      overdueCount: 1,
      todayCount: 1,
    });
    vi.mocked(siteVisitsService.getDashboardSiteVisitMetrics).mockResolvedValue({
      requestedCount: 1,
      visitsTodayCount: 1,
      visitFollowUpsCount: 1,
    });
    vi.mocked(propertyDraftsService.getDashboardPropertyMetrics).mockResolvedValue({
      draftCount: 1,
    });
    vi.mocked(crmService.listFollowUps).mockResolvedValue([]);
    vi.mocked(siteVisitsService.listSiteVisits).mockResolvedValue([]);

    const ui = await AdminDashboardPage();
    render(ui);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    expect(screen.getByText("Draft properties")).toBeVisible();
    expect(screen.getByText("New leads")).toBeVisible();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders gracefully with a database notice banner when upstream services reject", async () => {
    vi.mocked(crmService.getDashboardLeadMetrics).mockRejectedValue(new Error("Invalid API key"));
    vi.mocked(crmService.getDashboardFollowUpMetrics).mockRejectedValue(
      new Error("Invalid API key"),
    );
    vi.mocked(siteVisitsService.getDashboardSiteVisitMetrics).mockRejectedValue(
      new Error("Invalid API key"),
    );
    vi.mocked(propertyDraftsService.getDashboardPropertyMetrics).mockRejectedValue(
      new Error("Invalid API key"),
    );
    vi.mocked(crmService.listFollowUps).mockRejectedValue(new Error("Invalid API key"));
    vi.mocked(siteVisitsService.listSiteVisits).mockRejectedValue(new Error("Invalid API key"));

    const ui = await AdminDashboardPage();
    render(ui);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.getByText("Some information could not be loaded")).toBeVisible();
    expect(screen.queryByText(/SUPABASE_SERVICE_ROLE_KEY/)).not.toBeInTheDocument();
    expect(screen.getByText("Draft properties")).toBeVisible();
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

    expect(screen.getByRole("heading", { name: "Unable to load this page" })).toBeVisible();
    const tryAgainBtn = screen.getByRole("button", { name: "Try again" });
    expect(tryAgainBtn).toBeVisible();
    await user.click(tryAgainBtn);
    expect(reset).toHaveBeenCalledOnce();
  });
});
