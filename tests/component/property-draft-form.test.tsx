import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PropertyDraftForm } from "@/components/admin/property-draft-form";

const references = {
  districts: [{ id: "00000000-0000-4000-8000-000000000003", name: "Ahmedabad" }],
  areaUnits: [
    {
      id: "10000000-0000-4000-8000-000000000006",
      code: "acre",
      name: "Acre",
      symbol: "ac",
    },
  ],
  parties: [],
};

describe("PropertyDraftForm", () => {
  it("renders stable draft sections and keeps publication unavailable", () => {
    render(
      <PropertyDraftForm
        action={vi.fn(async (state) => state)}
        references={references}
        submitLabel="Create draft"
      />,
    );
    for (const section of [
      "Classification and copy",
      "Geography and area",
      "Commercial offer",
      "Location privacy",
      "Parcel and source identifier",
      "Planning context",
      "Agricultural fields",
      "NA fields",
      "Industrial fields",
      "Party relationship",
      "Source link",
    ]) {
      expect(screen.getByRole("group", { name: section })).toBeVisible();
    }
    expect(screen.getByText(/Publish from the property readiness panel/)).toBeVisible();
    expect(screen.queryByRole("button", { name: /^publish$/i })).not.toBeInTheDocument();
  });
});
