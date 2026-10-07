import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  PropertyReadinessSummary,
  PropertyWorkflow,
  PropertyWorkflowNavigation,
} from "@/components/admin/property-workflow";
import type { PublicationReadiness } from "@/features/properties/domain/publication";

const propertyId = "20000000-0000-4000-8000-000000000001";

afterEach(cleanup);

describe("PropertyWorkflow", () => {
  it("marks prior steps complete, the active step current, and future steps unavailable", () => {
    render(
      <PropertyWorkflow currentStep="preview" propertyId={propertyId}>
        <p>Preview content</p>
      </PropertyWorkflow>,
    );

    const workflow = screen.getByRole("navigation", { name: "Property publishing workflow" });
    expect(workflow).toHaveTextContent("Property DetailsCompleted");
    expect(workflow).toHaveTextContent("Photos & DocumentsCompleted");
    expect(workflow).toHaveTextContent("PreviewCurrent step");
    expect(workflow).toHaveTextContent("PublishUpcoming");
    expect(screen.getByText("Preview").closest("div")).toHaveAttribute("aria-current", "step");
    expect(screen.queryByRole("link", { name: /Publish Upcoming/ })).not.toBeInTheDocument();
  });

  it("marks Publish complete only for an actually published property", () => {
    render(
      <PropertyWorkflow currentStep="publish" propertyId={propertyId} isPublished>
        <p>Published content</p>
      </PropertyWorkflow>,
    );

    expect(
      screen.getByRole("navigation", { name: "Property publishing workflow" }),
    ).toHaveTextContent("PublishCompleted");
  });

  it("renders reusable previous, draft-exit, and next actions", () => {
    render(
      <PropertyWorkflowNavigation
        previousHref={`/admin/properties/${propertyId}/media`}
        previousLabel="Photos & Documents"
        secondaryHref={`/admin/properties/${propertyId}`}
        secondaryLabel="Save as Draft"
        nextHref={`/admin/properties/${propertyId}/publish`}
        nextLabel="Continue to Publish"
      />,
    );

    expect(screen.getByRole("link", { name: /← Photos & Documents/ })).toHaveAttribute(
      "href",
      `/admin/properties/${propertyId}/media`,
    );
    expect(screen.getByRole("link", { name: "Save as Draft" })).toHaveAttribute(
      "href",
      `/admin/properties/${propertyId}`,
    );
    expect(screen.getByRole("link", { name: /Continue to Publish/ })).toHaveAttribute(
      "href",
      `/admin/properties/${propertyId}/publish`,
    );
  });

  it("shows human-readable blockers with a route back to the relevant step", () => {
    const readiness: PublicationReadiness = {
      propertyId,
      propertyCode: "UE-LS-000007",
      publicSlug: "example-property",
      publicationStatus: "DRAFT",
      availabilityStatus: "AVAILABLE",
      locationVisibility: "APPROXIMATE",
      ready: false,
      blockers: [
        {
          group: "MEDIA",
          code: "APPROVED_COVER_MISSING",
          message: "Choose one approved public cover image with alt text.",
        },
      ],
      warnings: [],
      evaluatedAt: "2026-10-07T00:00:00Z",
    };

    render(<PropertyReadinessSummary readiness={readiness} />);

    expect(screen.getByRole("heading", { name: "1 thing left before publishing" })).toBeVisible();
    expect(screen.queryByText("APPROVED_COVER_MISSING")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Fix this" })).toHaveAttribute(
      "href",
      `/admin/properties/${propertyId}/media`,
    );
  });
});
