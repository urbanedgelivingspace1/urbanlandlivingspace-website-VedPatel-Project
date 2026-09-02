import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FoundationStatus } from "@/components/foundation/foundation-status";

describe("FoundationStatus", () => {
  it("exposes its heading and foundation principles accessibly", () => {
    render(<FoundationStatus />);

    expect(screen.getByRole("heading", { name: "Foundation principles" })).toBeInTheDocument();
    expect(screen.getByText("Independent application")).toBeVisible();
    expect(screen.getByText("Privacy-first boundary")).toBeVisible();
    expect(screen.getByText("Testable from day one")).toBeVisible();
  });
});
