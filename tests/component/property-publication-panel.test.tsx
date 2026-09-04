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
    expect(screen.getByRole("heading", { name: "Publication readiness" })).toBeVisible();
    expect(screen.getByText("Choose an approved cover image.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Publish property" })).toBeDisabled();
  });

  it("keeps warnings visible when publication has no blockers", () => {
    render(
      <PropertyPublicationPanel
        readiness={{ ...base, ready: true, blockers: [] }}
        expectedUpdatedAt="2026-09-04T00:00:00Z"
        publishAction={action}
        unpublishAction={action}
      />,
    );
    expect(screen.getByText("Public verification copy remains disabled.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Publish property" })).toBeEnabled();
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
    await user.click(screen.getByRole("button", { name: "Publish property" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Publication blocked.");
    expect(screen.getByRole("button", { name: "Publish property" })).toBeEnabled();
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
    expect(screen.getByRole("button", { name: "Unpublish property" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Publish property" })).not.toBeInTheDocument();
  });
});
