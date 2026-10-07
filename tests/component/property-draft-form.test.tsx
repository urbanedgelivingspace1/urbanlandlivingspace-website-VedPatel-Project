import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

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
  afterEach(() => {
    cleanup();
  });
  it("renders stable draft sections and keeps publication unavailable", () => {
    render(
      <PropertyDraftForm
        action={vi.fn(async (state) => state)}
        references={references}
        submitLabel="Create draft"
      />,
    );
    for (const section of [
      "Basic Details",
      "Location & Land Details",
      "Price",
      "Property Location",
      "Location Coordinates",
      "Survey / Parcel Details",
      "Planning Information",
      "Agricultural Details",
      "Owner Details",
      "Source Details",
    ]) {
      expect(screen.getByRole("group", { name: section })).toBeInTheDocument();
    }
    expect(screen.getByRole("group", { name: "Basic Details" })).toBeVisible();
    expect(screen.getByRole("group", { name: "Location & Land Details" })).toBeVisible();
    expect(screen.getByRole("group", { name: "Price" })).toBeVisible();
    expect(screen.getByRole("group", { name: "Property Location" })).toBeVisible();
    expect(screen.getByLabelText(/^Location Title/)).toBeInTheDocument();
    expect(screen.getByLabelText("Google Maps Embed")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "NA Details" })).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Industrial Details" })).not.toBeInTheDocument();
    expect(screen.getByText(/Continue when you are ready to add photos/)).toBeVisible();
    expect(screen.queryByRole("button", { name: /^publish$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save & Next →" })).toBeVisible();
    expect(screen.getByLabelText("Private latitude")).toBeInTheDocument();
    expect(screen.getByLabelText("Private longitude")).toBeInTheDocument();
    expect(screen.getByLabelText("Listing latitude")).toBeInTheDocument();
    expect(screen.getByLabelText("Listing longitude")).toBeInTheDocument();
  });

  it("submits Save & Next with an explicit server-controlled intent", async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (state, formData: FormData) => ({
      ...state,
      values: { submitIntent: String(formData.get("submitIntent")) },
    }));
    render(<PropertyDraftForm action={action} references={references} submitLabel="Save Draft" />);

    await user.click(screen.getByRole("button", { name: "Save & Next →" }));

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect((action.mock.calls[0]?.[1] as FormData).get("submitIntent")).toBe("save-next");
  });

  it("guards Save & Next against a double submit", async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (state) => state);
    render(<PropertyDraftForm action={action} references={references} submitLabel="Save Draft" />);

    await user.dblClick(screen.getByRole("button", { name: "Save & Next →" }));

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
  });

  it("renders the testing helper toolbar and prefill buttons when allowTestPresets is true", () => {
    render(
      <PropertyDraftForm
        action={vi.fn(async (state) => state)}
        references={references}
        submitLabel="Create draft"
        allowTestPresets={true}
      />,
    );

    expect(screen.getByTestId("test-fill-helper")).toBeVisible();
    expect(screen.getByTestId("btn-fill-sample-draft")).toBeVisible();
    expect(screen.getByTestId("btn-fill-sample-na")).toBeVisible();
    expect(screen.getByTestId("btn-fill-sample-industrial")).toBeVisible();
    expect(screen.getByTestId("btn-bottom-prefill")).toBeVisible();
  });

  it("never renders the testing helper toolbar or prefill buttons in production (allowTestPresets is false/omitted)", () => {
    render(
      <PropertyDraftForm
        action={vi.fn(async (state) => state)}
        references={references}
        submitLabel="Create draft"
      />,
    );

    expect(screen.queryByTestId("test-fill-helper")).not.toBeInTheDocument();
    expect(screen.queryByTestId("btn-fill-sample-draft")).not.toBeInTheDocument();
    expect(screen.queryByTestId("btn-bottom-prefill")).not.toBeInTheDocument();
  });

  it("populates all draft fields with valid sample data when clicking prefill button", () => {
    const { container } = render(
      <PropertyDraftForm
        action={vi.fn(async (state) => state)}
        references={references}
        submitLabel="Create draft"
        allowTestPresets={true}
      />,
    );

    const prefillBtn = screen.getByTestId("btn-fill-sample-draft");
    prefillBtn.click();

    // Verify confirmation notice
    expect(
      screen.getByText(/Form prefilled with Agricultural Farmland example data/),
    ).toBeVisible();

    // Verify key fields in DOM
    const form = container.querySelector("form")!;
    const titleInput = form.elements.namedItem("listingTitle") as HTMLInputElement;
    const categorySelect = form.elements.namedItem("landCategory") as HTMLSelectElement;
    const districtSelect = form.elements.namedItem("districtId") as HTMLSelectElement;
    const areaInput = form.elements.namedItem("displayAreaValue") as HTMLInputElement;
    const priceAmountInput = form.elements.namedItem("priceAmount") as HTMLInputElement;
    const tenureInput = form.elements.namedItem("tenureType") as HTMLInputElement;
    const roadTouchCheckbox = form.elements.namedItem("roadTouch") as HTMLInputElement;

    expect(titleInput.value).toMatch(/^Sanand 2\.5 Acre Farmland/);
    expect(categorySelect.value).toBe("AGRICULTURAL");
    expect(districtSelect.value).toBe("00000000-0000-4000-8000-000000000003");
    expect(areaInput.value).toBe("2.5");
    expect(priceAmountInput.value).toBe("12500000");
    expect(tenureInput.value).toBe("OLD_TENURE");
    expect(roadTouchCheckbox.checked).toBe(true);
  });

  it("switches to NA commercial sample data properly", () => {
    const { container } = render(
      <PropertyDraftForm
        action={vi.fn(async (state) => state)}
        references={references}
        submitLabel="Create draft"
        allowTestPresets={true}
      />,
    );

    const naBtn = screen.getByTestId("btn-fill-sample-na");
    naBtn.click();

    expect(screen.getByText(/Form prefilled with NA Commercial example data/)).toBeVisible();

    const form = container.querySelector("form")!;
    const categorySelect = form.elements.namedItem("landCategory") as HTMLSelectElement;
    const naStatusInput = form.elements.namedItem("naStatus") as HTMLInputElement;
    const areaInput = form.elements.namedItem("displayAreaValue") as HTMLInputElement;

    expect(categorySelect.value).toBe("NA");
    expect(naStatusInput.value).toBe("ORDER_ISSUED");
    expect(areaInput.value).toBe("1200");
  });
});
