import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/admin/dashboard" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

import { AdminNavigation, isCrmPathname } from "@/components/admin/admin-navigation";
import { CrmWorkspaceTabs, type CrmWorkspace } from "@/components/admin/crm-workspace-tabs";

afterEach(cleanup);

describe("unified CRM navigation", () => {
  it("shows one CRM sidebar item instead of four workspace links", () => {
    render(<AdminNavigation canManageSecurity />);

    expect(screen.getAllByRole("link", { name: "CRM" })).toHaveLength(1);
    expect(screen.queryByRole("link", { name: "Leads" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Pipeline" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Follow-ups" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Site visits" })).not.toBeInTheDocument();
  });

  it.each([
    "/admin/leads",
    "/admin/leads/new",
    "/admin/leads/lead-1",
    "/admin/leads/pipeline",
    "/admin/follow-ups",
    "/admin/site-visits",
    "/admin/site-visits/visit-1",
    "/admin/site-visits/calendar",
  ])("keeps CRM active at %s", (pathname) => {
    navigation.pathname = pathname;
    render(<AdminNavigation canManageSecurity />);

    expect(screen.getByRole("link", { name: "CRM" })).toHaveAttribute("aria-current", "page");
  });

  it("matches only legitimate CRM route segments", () => {
    expect(isCrmPathname("/admin/leads/pipeline")).toBe(true);
    expect(isCrmPathname("/admin/follow-ups")).toBe(true);
    expect(isCrmPathname("/admin/site-visits/calendar")).toBe(true);
    expect(isCrmPathname("/admin/leads-archive")).toBe(false);
    expect(isCrmPathname("/admin/properties")).toBe(false);
  });

  it.each<readonly [CrmWorkspace, string]>([
    ["leads", "Leads"],
    ["pipeline", "Pipeline"],
    ["follow-ups", "Follow-ups"],
    ["site-visits", "Site visits"],
  ])("renders the shared tabs with %s active", (active, activeLabel) => {
    render(<CrmWorkspaceTabs active={active} />);
    const tabs = within(screen.getByRole("navigation", { name: "CRM workspaces" }));
    const expectedRoutes = {
      Leads: "/admin/leads",
      Pipeline: "/admin/leads/pipeline",
      "Follow-ups": "/admin/follow-ups",
      "Site visits": "/admin/site-visits",
    } as const;

    for (const [label, href] of Object.entries(expectedRoutes)) {
      expect(tabs.getByRole("link", { name: label })).toHaveAttribute("href", href);
    }
    expect(tabs.getByRole("link", { name: activeLabel })).toHaveAttribute("aria-current", "page");
  });
});
