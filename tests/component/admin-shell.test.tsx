import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminShell } from "@/components/admin/admin-shell";

describe("AdminShell", () => {
  it("renders an accessible mobile/desktop navigation and session control", () => {
    render(
      <AdminShell
        admin={{
          userId: "40000000-0000-4000-8000-000000000003",
          email: "admin@example.invalid",
          displayName: "Synthetic Admin",
          role: "ADMIN",
        }}
        signOutAction={vi.fn()}
      >
        <h1>Protected content</h1>
      </AdminShell>,
    );

    expect(screen.getByText("Urban Land")).toBeVisible();
    expect(screen.getByText("Brokerage Admin")).toBeVisible();
    expect(screen.getAllByRole("navigation", { name: "Admin" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Sign out" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Protected content" })).toBeVisible();
  });
});
