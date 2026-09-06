import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { categoryLandingEditorialText } from "@/components/public/category-landing";
import { GuideCard } from "@/components/public/guide-card";
import { GuideIndex } from "@/components/public/guide-index";
import { LocationLanding } from "@/components/public/location-landing";
import { SafeMarkdown } from "@/components/public/safe-markdown";
import { transactionLandingEditorialText } from "@/components/public/transaction-landing";
import type { PublicGuide, PublicSeoPage } from "@/features/content/domain/contracts";
import { markdownWordCount } from "@/lib/seo/indexability";

vi.mock("@/server/queries/public-search", () => ({
  loadFixedPublicSearch: vi.fn(async () => ({ status: "ready", properties: [] })),
}));

const guide: PublicGuide = {
  id: "16000000-0000-4000-8000-000000000010",
  title: "A practical checklist before you enquire about land",
  slug: "practical-checklist-before-enquiring-about-land",
  excerpt: "Compare the public facts and prepare property-specific questions.",
  body: "## Start with intended use\n\nPlan appropriate independent checks.",
  categoryId: "16000000-0000-4000-8000-000000000001",
  categoryName: "Land Buying",
  categorySlug: "land-buying",
  publishedAt: "2026-09-06T00:00:00.000Z",
  updatedAt: "2026-09-06T00:00:00.000Z",
  seoTitle: "Land enquiry checklist | UrbanEdge",
  seoDescription: "A practical land enquiry checklist.",
  canonicalPath: "/guides/practical-checklist-before-enquiring-about-land",
  hero: null,
};

const location: PublicSeoPage = {
  id: "16000000-0000-4000-8000-000000000101",
  kind: "DISTRICT",
  slug: "locations/ahmedabad",
  districtId: "00000000-0000-4000-8000-000000000003",
  category: null,
  title: "Land in Ahmedabad",
  intro: "Useful public-safe context for discovering land across Ahmedabad district.",
  body: "## Compare deliberately\n\nUse category, access and area context.\n\n## Plan next steps\n\nComplete property-specific professional checks.",
  seoTitle: "Land in Ahmedabad | UrbanEdge",
  seoDescription: "Curated land discovery in Ahmedabad.",
  canonicalPath: "/locations/ahmedabad",
  publishedAt: "2026-09-06T00:00:00.000Z",
  status: "NOINDEX",
};

describe("M16 content page components", () => {
  it("keeps every permanent category and transaction route above its inventory-supported editorial floor", () => {
    for (const category of ["AGRICULTURAL", "NA", "INDUSTRIAL"] as const)
      expect(markdownWordCount(categoryLandingEditorialText(category))).toBeGreaterThanOrEqual(250);
    for (const transaction of ["BUY", "RENT", "LEASE"] as const)
      expect(
        markdownWordCount(transactionLandingEditorialText(transaction)),
      ).toBeGreaterThanOrEqual(250);
  });

  it("renders visible accessible breadcrumbs in the supplied hierarchy", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Ahmedabad", href: "/locations/ahmedabad" },
          { label: "NA Land" },
        ]}
      />,
    );
    const navigation = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(navigation).getByRole("link", { name: "Ahmedabad" })).toHaveAttribute(
      "href",
      "/locations/ahmedabad",
    );
    expect(within(navigation).getByText("NA Land")).toHaveAttribute("aria-current", "page");
  });

  it("renders a guide card with a canonical public route and useful excerpt", () => {
    render(<GuideCard guide={guide} />);
    expect(screen.getByRole("heading", { name: guide.title })).toBeVisible();
    expect(screen.getByText(guide.excerpt as string)).toBeVisible();
    expect(screen.getByRole("link", { name: "Read guide" })).toHaveAttribute(
      "href",
      `/guides/${guide.slug}`,
    );
  });

  it("renders guide category navigation, structured data and a truthful empty state", () => {
    const { container } = render(
      <GuideIndex
        guides={[]}
        categories={[
          {
            id: "16000000-0000-4000-8000-000000000001",
            name: "Land Buying",
            slug: "land-buying",
            description: "Practical preparation.",
            sortOrder: 10,
          },
        ]}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Guide categories" })).toBeVisible();
    expect(screen.getByRole("heading", { name: /No published guides/ })).toBeVisible();
    expect(container.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
  });

  it("renders a server-first location article, next steps, categories and empty inventory", async () => {
    const { container } = render(await LocationLanding({ page: location, city: "ahmedabad" }));
    expect(screen.getByRole("heading", { level: 1, name: "Land in Ahmedabad" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Compare deliberately" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Refine this published search/ })).toHaveAttribute(
      "href",
      "/properties?district=ahmedabad",
    );
    expect(screen.getByRole("link", { name: /NA Land/ })).toHaveAttribute(
      "href",
      "/locations/ahmedabad/na-land",
    );
    expect(screen.getByText(/No matching published land/)).toBeVisible();
    expect(container.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
  });

  it("renders controlled Markdown and never turns protocol-relative content into a link", () => {
    render(
      <SafeMarkdown
        value={
          "## Useful heading\n\nRead [the guide](/guides/checklist).\n\nDo not visit [outside](//attacker.invalid)."
        }
      />,
    );
    expect(screen.getByRole("heading", { name: "Useful heading" })).toBeVisible();
    expect(screen.getByRole("link", { name: "the guide" })).toHaveAttribute(
      "href",
      "/guides/checklist",
    );
    expect(screen.queryByRole("link", { name: "outside" })).not.toBeInTheDocument();
  });
});
