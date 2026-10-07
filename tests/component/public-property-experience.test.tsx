import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PropertyActions } from "@/components/public/property-actions";
import { PropertyCard } from "@/components/public/property-card";
import { PropertyCollection } from "@/components/public/property-collection";
import { PropertyBrochureLink } from "@/components/public/property-brochure-link";
import { PropertyFacts } from "@/components/public/property-facts";
import { PropertyGallery } from "@/components/public/property-gallery";
import { GoogleMapsEmbed } from "@/components/public/google-maps-embed";
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

  it("shows the cover photo first even when its stored order is later", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://synthetic.supabase.co");
    render(
      <PropertyGallery
        title="Synthetic property"
        coverId="media-cover"
        media={[
          {
            id: "media-first",
            mediaType: "IMAGE",
            objectPath: "properties/synthetic/media/first.webp",
            altText: "First stored image",
            width: 1200,
            height: 800,
          },
          {
            id: "media-cover",
            mediaType: "IMAGE",
            objectPath: "properties/synthetic/media/cover.webp",
            altText: "Selected cover image",
            width: 1200,
            height: 800,
          },
        ]}
      />,
    );

    expect(screen.getByAltText("Selected cover image")).toBeVisible();
    expect(screen.getByText("1 / 2")).toBeVisible();
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

  it("constructs a safe Google Maps iframe and rejects an invalid stored source", () => {
    const { rerender } = render(
      <GoogleMapsEmbed
        url="https://www.google.com/maps/embed?pb=test-map"
        title="Near IIT Gandhinagar, Palaj"
      />,
    );

    const map = screen.getByTitle("Near IIT Gandhinagar, Palaj map");
    expect(map).toHaveAttribute("src", "https://www.google.com/maps/embed?pb=test-map");
    expect(map).toHaveAttribute("loading", "lazy");
    expect(map).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");

    rerender(<GoogleMapsEmbed url="https://evil.example.com/embed" title="Unsafe" />);
    expect(screen.queryByTitle("Unsafe map")).not.toBeInTheDocument();
  });

  it("renders one Download Brochure CTA for Drive and legacy hosted brochures", () => {
    const { rerender } = render(
      <PropertyBrochureLink
        brochure={{
          id: "drive-brochure",
          mediaType: "BROCHURE",
          objectPath: null,
          externalUrl: "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz_12345/view",
          externalProvider: "GOOGLE_DRIVE",
          externalMediaId: "1AbCdEfGhIjKlMnOpQrStUvWxYz_12345",
          altText: null,
          width: null,
          height: null,
        }}
      />,
    );
    expect(screen.getByRole("link", { name: /Download Brochure/ })).toHaveAttribute(
      "href",
      "https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMnOpQrStUvWxYz_12345",
    );

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://synthetic.supabase.co");
    rerender(
      <PropertyBrochureLink
        brochure={{
          id: "hosted-brochure",
          mediaType: "BROCHURE",
          objectPath: "properties/synthetic/media/brochure.pdf",
          altText: null,
          width: null,
          height: null,
        }}
      />,
    );
    expect(screen.getByRole("link", { name: /Download Brochure/ })).toHaveAttribute(
      "href",
      "https://synthetic.supabase.co/storage/v1/object/public/property-media-public/properties/synthetic/media/brochure.pdf",
    );
  });
});
