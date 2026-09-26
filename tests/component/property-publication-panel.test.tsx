import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PropertyPublicationPanel } from "@/components/admin/property-publication-panel";
import type { PublicationReadiness } from "@/features/properties/domain/publication";

const base: PublicationReadiness = {
  propertyId: "90000000-0000-4000-8000-000000000001",
  propertyCode: "UE-LS-000001",
  publicSlug: "synthetic-property",
  publicationStatus: "DRAFT",
  availabilityStatus: "AVAILABLE",
  locationVisibility: "HIDDEN",
  ready: false,
  blockers: [{ group: "MEDIA", code: "COVER", message: "Choose an approved cover image." }],
  warnings: [
    {
      group: "CLAIMS_VERIFICATION",
      code: "COPY",
      message: "Public verification copy remains disabled.",
    },
  ],
  evaluatedAt: "2026-09-04T00:00:00Z",
};

const action = vi.fn(async () => ({ ok: true, message: "Updated." }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("PropertyPublicationPanel", () => {
  it("shows grouped blockers and disables publish", () => {
    render(
      <PropertyPublicationPanel
        readiness={base}
        expectedUpdatedAt="2026-09-04T00:00:00Z"
        publishAction={action}
        unpublishAction={action}
      />,
    );
    expect(screen.getByRole("heading", { name: "1 item before publishing" })).toBeVisible();
    expect(screen.getByText("Choose an approved cover image.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Publish Property" })).toBeDisabled();
  });

  it("keeps optional publishing notes available when there are no blockers", () => {
    render(
      <PropertyPublicationPanel
        readiness={{ ...base, ready: true, blockers: [] }}
        expectedUpdatedAt="2026-09-04T00:00:00Z"
        publishAction={action}
        unpublishAction={action}
      />,
    );
    expect(screen.getByText("Public verification copy remains disabled.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish Property" })).toBeEnabled();
  });

  it("requires explicit publication confirmation", async () => {
    const user = userEvent.setup();
    render(
      <PropertyPublicationPanel
        readiness={{ ...base, ready: true, blockers: [] }}
        expectedUpdatedAt="2026-09-04T00:00:00Z"
        publishAction={action}
        unpublishAction={action}
      />,
    );
    expect(screen.getByRole("checkbox")).toBeRequired();
    await user.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("retains an accessible server error after a failed publish", async () => {
    const user = userEvent.setup();
    const failedAction = vi.fn(async () => ({ ok: false, message: "Publication blocked." }));
    render(
      <PropertyPublicationPanel
        readiness={{ ...base, ready: true, blockers: [] }}
        expectedUpdatedAt="2026-09-04T00:00:00Z"
        publishAction={failedAction}
        unpublishAction={action}
      />,
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Publish Property" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Publication blocked.");
    expect(screen.getByRole("button", { name: "Publish Property" })).toBeEnabled();
  });

  it("renders the audited unpublish flow for published inventory", () => {
    render(
      <PropertyPublicationPanel
        readiness={{ ...base, ready: true, blockers: [], publicationStatus: "PUBLISHED" }}
        expectedUpdatedAt="2026-09-04T00:00:00Z"
        publishAction={action}
        unpublishAction={action}
      />,
    );
    expect(screen.getByLabelText("Reason for unpublishing")).toBeRequired();
    expect(screen.getByRole("button", { name: "Unpublish" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Publish Property" })).not.toBeInTheDocument();
  });
});
