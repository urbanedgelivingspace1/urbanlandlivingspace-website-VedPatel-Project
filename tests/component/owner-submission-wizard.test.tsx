import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { OwnerSubmissionWizard } from "@/components/public/owner-submission-wizard";

afterEach(cleanup);

const props = {
  idempotencyKey: "95000000-0000-4000-8000-000000000001",
  districts: [{ value: "00000000-0000-4000-8000-000000000003", label: "Ahmedabad" }],
  units: [{ value: "10000000-0000-4000-8000-000000000006", label: "Acre (ac)" }],
};

describe("M15 owner submission wizard", () => {
  it("renders exactly ten progressive steps and states the non-public boundary", () => {
    const { container } = render(<OwnerSubmissionWizard {...props} />);
    expect(container.querySelectorAll("[data-step]")).toHaveLength(10);
    expect(screen.getByText(/private request for review, not a published listing/i)).toBeVisible();
    expect(screen.getByText("Step 1 of 10")).toBeVisible();
  });

  it("moves through intent and land type without losing the selected category", async () => {
    const user = userEvent.setup();
    render(<OwnerSubmissionWizard {...props} />);
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Step 2 of 10")).toBeVisible();
    await user.click(screen.getByText("Industrial land"));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Step 3 of 10")).toBeVisible();
    expect(screen.getByRole("radio", { name: "Industrial land" })).toBeChecked();
  });

  it("keeps documents private and constrains their accepted formats", async () => {
    const { container } = render(<OwnerSubmissionWizard {...props} />);
    const documents = container.querySelector<HTMLInputElement>('input[name="documents"]');
    expect(documents).toHaveAttribute("accept", "application/pdf,image/jpeg,image/png");
    expect(container.textContent).toContain("never public listing media");
    expect(container.innerHTML).not.toMatch(/name="publicationStatus"/);
  });

  it.each([
    ["Agricultural land", "Tenure claim", "Water / irrigation"],
    ["Industrial land", "Industrial context", "Permitted-use claim"],
  ])(
    "shows the useful %s claim fields without exposing the internal property schema",
    async (category, firstField, secondField) => {
      const user = userEvent.setup();
      render(<OwnerSubmissionWizard {...props} />);
      await user.click(screen.getByRole("button", { name: "Continue" }));
      await user.click(screen.getByRole("radio", { name: category }));
      for (let step = 0; step < 5; step += 1)
        await user.click(screen.getByRole("button", { name: "Continue" }));
      expect(screen.getByLabelText(firstField)).toBeVisible();
      expect(screen.getByLabelText(secondField)).toBeVisible();
      expect(screen.getByText(/owner-provided claims/i)).toBeVisible();
    },
  );
});
