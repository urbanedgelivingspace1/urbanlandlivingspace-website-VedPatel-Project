import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PropertyDraftForm } from "@/components/admin/property-draft-form";
import { PropertyEditGuard } from "@/components/admin/property-edit-guard";
import { PropertyWorkflow } from "@/components/admin/property-workflow";

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
    expect(screen.getByText("Draft listing")).toBeVisible();
    expect(screen.queryByRole("button", { name: /^publish$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save & Next →" })).toBeVisible();
    expect(screen.queryByRole("group", { name: "Location Coordinates" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Private latitude")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Listing latitude")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Primary transaction")).toHaveValue("SELL");
    expect(screen.getByRole("option", { name: "Sell" })).toBeInTheDocument();
  });

  it("lets published-property edits save or save and continue", () => {
    render(
      <PropertyDraftForm
        action={vi.fn(async (state) => state)}
        references={references}
        submitLabel="Save Changes"
        propertyId="20000000-0000-4000-8000-000000000001"
        isPublished={true}
        deleteAction={vi.fn(async () => undefined)}
      />,
    );

    expect(screen.getByRole("button", { name: "Save Changes" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Save & Next →" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Delete property" })).toBeVisible();
    expect(screen.getByText("Live on website")).toBeVisible();
    expect(screen.getByRole("button", { name: "Save Changes" })).toHaveClass("button-primary");
    expect(screen.getByRole("button", { name: "Save & Next →" })).toHaveClass("button-secondary");
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

  it("loads a saved Google Maps embed when editing an existing property", () => {
    const embedUrl = "https://www.google.com/maps/embed?pb=saved-property-map";
    render(
      <PropertyDraftForm
        action={vi.fn(async (state) => state)}
        references={references}
        submitLabel="Save Draft"
        initialValues={{ googleMapsEmbedUrl: embedUrl }}
      />,
    );

    expect(screen.getByLabelText("Google Maps Embed")).toHaveValue(embedUrl);
    expect(screen.getByTitle("Google Maps location preview")).toHaveAttribute("src", embedUrl);
    expect(screen.getByText("Google Maps location added successfully.")).toBeVisible();
  });

  it("guards Save & Next against a double submit", async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (state) => state);
    render(<PropertyDraftForm action={action} references={references} submitLabel="Save Draft" />);

    await user.dblClick(screen.getByRole("button", { name: "Save & Next →" }));

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
  });

  it("keeps the edit form valid when the delete control is present", () => {
    const { container } = render(
      <PropertyDraftForm
        action={vi.fn(async (state) => state)}
        references={references}
        submitLabel="Save Draft"
        propertyId="20000000-0000-4000-8000-000000000001"
        deleteAction={vi.fn(async () => undefined)}
      />,
    );

    expect(screen.getByRole("button", { name: "Delete draft" })).toBeVisible();
    expect(container.querySelector("form form")).toBeNull();
  });

  it("reports dirty state when values change and clean state when they are restored", async () => {
    const user = userEvent.setup();
    const onDirtyChange = vi.fn();
    render(
      <PropertyDraftForm
        action={vi.fn(async (state) => state)}
        references={references}
        submitLabel="Create draft"
        initialValues={{ listingTitle: "Original title" }}
        onDirtyChange={onDirtyChange}
      />,
    );

    const title = screen.getByLabelText("Property title (optional)");
    await user.clear(title);
    await user.type(title, "Updated title");
    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true));

    await user.clear(title);
    await user.type(title, "Original title");
    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(false));
  });

  it("warns before leaving the page when the form has unsaved changes", async () => {
    const user = userEvent.setup();
    render(
      <PropertyDraftForm
        action={vi.fn(async (state) => state)}
        references={references}
        submitLabel="Save Draft"
      />,
    );

    await user.type(screen.getByLabelText("Property title (optional)"), "Unsaved title");
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("blocks workflow section navigation while the edit form is dirty", async () => {
    const user = userEvent.setup();
    render(
      <PropertyEditGuard>
        <PropertyWorkflow currentStep="details" propertyId="20000000-0000-4000-8000-000000000001">
          <PropertyDraftForm
            action={vi.fn(async (state) => state)}
            references={references}
            submitLabel="Save Draft"
            initialValues={{ listingTitle: "Original title" }}
          />
        </PropertyWorkflow>
      </PropertyEditGuard>,
    );

    await user.type(screen.getByLabelText("Property title (optional)"), " changed");
    await user.click(screen.getByRole("link", { name: /Photos & DocumentsAvailable/ }));

    expect(screen.getByRole("alert")).toHaveTextContent("You have unsaved changes");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please save the changes to move forward to other sections.",
    );
  });
});
