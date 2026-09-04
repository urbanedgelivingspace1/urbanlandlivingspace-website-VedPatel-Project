import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PropertyActions } from "@/components/public/property-actions";
import { PropertyCard } from "@/components/public/property-card";
import { PropertyCollection } from "@/components/public/property-collection";
import { PropertyFacts } from "@/components/public/property-facts";
import { PropertyGallery } from "@/components/public/property-gallery";
import { PublicMap } from "@/components/public/public-map";
import {
  buildPublicPropertyCard,
  buildPublicPropertyDetail,
} from "@/tests/builders/public-property";

const noContacts = {
  phone: null,
  whatsappNumber: null,
  email: null,
  officeAddress: null,
  livingSpaceUrl: null,
};

afterEach(() => vi.unstubAllEnvs());

describe("M10 public property experience", () => {
  it("renders a canonical card with approved values and route", () => {
    render(<PropertyCard property={buildPublicPropertyCard()} />);

    expect(screen.getByRole("heading", { name: "Synthetic agricultural land" })).toBeVisible();
    expect(screen.getByText("2.5 ac")).toBeVisible();
    expect(screen.getByText(/1,50,00,000/)).toBeVisible();
    expect(
      screen.getAllByRole("link", { name: /Synthetic agricultural land|View property/ })[0],
    ).toHaveAttribute("href", "/properties/synthetic-agricultural-land");
  });

  it("renders unavailable and empty inventory states without invented listings", () => {
    const { rerender } = render(
      <PropertyCollection result={{ status: "unavailable", properties: [] }} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("could not load");

    rerender(<PropertyCollection result={{ status: "ready", properties: [] }} />);
    expect(screen.getByText("No published land is listed here yet.")).toBeVisible();
  });

  it("shows category, planning, and public parcel facts", () => {
    render(<PropertyFacts property={buildPublicPropertyDetail()} />);

    expect(screen.getByText("Old Tenure")).toBeVisible();
    expect(screen.getByText("Synthetic Planning Authority")).toBeVisible();
    expect(screen.getByText("TEST-42")).toBeVisible();
  });

  it("provides keyboard-operable gallery selection with approved media", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://synthetic.supabase.co");
    const user = userEvent.setup();
    render(
      <PropertyGallery
        title="Synthetic property"
        media={[
          {
            id: "media-1",
            mediaType: "IMAGE",
            objectPath: "properties/synthetic/media/first.webp",
            altText: "First approved image",
            width: 1200,
            height: 800,
          },
          {
            id: "media-2",
            mediaType: "IMAGE",
            objectPath: "properties/synthetic/media/second.webp",
            altText: "Second approved image",
            width: 1200,
            height: 800,
          },
        ]}
      />,
    );

    const second = screen.getByRole("button", { name: "Show property image 2" });
    second.focus();
    await user.keyboard("{Enter}");
    expect(second).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByAltText("Second approved image")).toBeVisible();
  });

  it("does not fabricate contact channels and replaces closed CTAs", () => {
    const property = buildPublicPropertyDetail();
    const { rerender } = render(<PropertyActions property={property} config={noContacts} />);
    expect(screen.getByText("Call").closest("span[aria-disabled='true']")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp").closest("span[aria-disabled='true']")).toBeInTheDocument();

    rerender(
      <PropertyActions
        property={buildPublicPropertyDetail({ availability: "SOLD" })}
        config={noContacts}
      />,
    );
    expect(screen.getByRole("link", { name: "Find similar land" })).toHaveAttribute(
      "href",
      "/properties",
    );
    expect(screen.queryByText("Enquire now")).not.toBeInTheDocument();
  });

  it("never renders a point for hidden location and labels approximate location", () => {
    const { rerender } = render(
      <PublicMap
        location={{ visibility: "HIDDEN", label: "Ahmedabad", point: null }}
        styleUrl={null}
      />,
    );
    expect(screen.getByText("No pin or coordinate is published for this property.")).toBeVisible();

    rerender(
      <PublicMap
        location={{
          visibility: "APPROXIMATE",
          label: "Ahmedabad",
          point: { latitude: 22.99, longitude: 72.38, accuracyMetres: 2_000 },
        }}
        styleUrl={null}
      />,
    );
    expect(screen.getByText("Approximate location")).toBeVisible();
    expect(screen.getByText("Interactive map provider is not configured.")).toBeVisible();
  });
});
