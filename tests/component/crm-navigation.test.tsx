import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/admin/dashboard" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

import { AdminNavigation } from "@/components/admin/admin-navigation";
import { CrmWorkspaceTabs, type CrmWorkspace } from "@/components/admin/crm-workspace-tabs";

afterEach(cleanup);

describe("CRM navigation", () => {
  it("shows each CRM workspace directly in the sidebar", () => {
    render(<AdminNavigation canManageSecurity />);

    expect(screen.getByRole("link", { name: "Leads" })).toHaveAttribute("href", "/admin/leads");
    expect(screen.getByRole("link", { name: "Pipeline" })).toHaveAttribute(
      "href",
      "/admin/leads/pipeline",
    );
    expect(screen.getByRole("link", { name: "Follow-ups" })).toHaveAttribute(
      "href",
      "/admin/follow-ups",
    );
    expect(screen.getByRole("link", { name: "Site visits" })).toHaveAttribute(
      "href",
      "/admin/site-visits",
    );
    expect(screen.queryByRole("link", { name: "CRM" })).not.toBeInTheDocument();
  });

  it.each([
    ["/admin/leads", "Leads"],
    ["/admin/leads/new", "Leads"],
    ["/admin/leads/lead-1", "Leads"],
    ["/admin/leads/pipeline", "Pipeline"],
    ["/admin/follow-ups", "Follow-ups"],
    ["/admin/site-visits", "Site visits"],
    ["/admin/site-visits/visit-1", "Site visits"],
    ["/admin/site-visits/calendar", "Site visits"],
  ])("marks only the matching sidebar link active at %s", (pathname, activeLabel) => {
    navigation.pathname = pathname;
    render(<AdminNavigation canManageSecurity />);

    expect(screen.getByRole("link", { name: activeLabel })).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("link", { current: "page" })).toHaveLength(1);
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
