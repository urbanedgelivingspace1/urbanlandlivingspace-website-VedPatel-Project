import { existsSync } from "node:fs";
import path from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { siteConfig, siteIcons } from "@/config/site";
import { guideInputSchema, seoPageInputSchema } from "@/features/content/domain/validation";
import { buildPublicMetadata, withoutSiteNameSuffix } from "@/lib/seo/metadata";
import {
  evaluateSeoPageQuality,
  isGuideCategoryIndexable,
  markdownWordCount,
  normalizedContentSimilarity,
} from "@/lib/seo/indexability";
import {
  absoluteCanonical,
  approvedSameSitePath,
  normalizeCanonicalPath,
} from "@/lib/seo/canonical";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import { flattenRedirects, isSafeRedirectPath } from "@/lib/seo/redirects";
import { effectiveRobots, INDEX_FOLLOW, NOINDEX_NOFOLLOW } from "@/lib/seo/robots";
import { isSitemapEligiblePath, staticIndexablePaths } from "@/lib/seo/sitemap";
import { organizationJsonLd, propertyJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";
import { safeSeoText, serializeJsonLd } from "@/lib/seo/privacy-safe-seo";
import { buildPublicPropertyDetail } from "@/tests/builders/public-property";

const words = (count: number) =>
  Array.from({ length: count }, (_, index) => `word${index}`).join(" ");

describe("M16 canonical, metadata and crawl policy", () => {
  it("normalizes canonical paths deterministically and rejects off-site overrides", () => {
    expect(normalizeCanonicalPath("/Locations/Ahmedabad/?utm_source=test&b=2&a=1")).toBe(
      "/locations/ahmedabad?a=1&b=2",
    );
    expect(absoluteCanonical("/guides/checklist")).toBe(
      "https://theurbanedgelandspace.com/guides/checklist",
    );
    expect(approvedSameSitePath("https://attacker.invalid/private", "/safe")).toBe("/safe");
  });

  it("emits complete public metadata and forces previews to noindex", () => {
    const metadata = buildPublicMetadata({
      title: "Useful Ahmedabad land guide",
      description: "A public-safe description.",
      path: "/guides/useful",
      robots: INDEX_FOLLOW,
    });
    expect(metadata.alternates).toEqual({
      canonical: "https://theurbanedgelandspace.com/guides/useful",
    });
    expect(metadata.title).toBe("Useful Ahmedabad land guide");
    expect(metadata.openGraph).toMatchObject({
      title: "Useful Ahmedabad land guide",
      url: "https://theurbanedgelandspace.com/guides/useful",
      images: [
        {
          url: "https://theurbanedgelandspace.com/brand/urbanedge-social-share.png",
          width: 1200,
          height: 630,
        },
      ],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: ["https://theurbanedgelandspace.com/brand/urbanedge-social-share.png"],
    });
    expect(effectiveRobots(INDEX_FOLLOW, "preview")).toEqual(NOINDEX_NOFOLLOW);
    expect(effectiveRobots(INDEX_FOLLOW, undefined)).toEqual(NOINDEX_NOFOLLOW);
    expect(effectiveRobots(INDEX_FOLLOW, "production")).toEqual(INDEX_FOLLOW);
  });

  it("emits exact brand-only homepage metadata without changing internal title behavior", () => {
    const metadata = buildPublicMetadata({
      title: siteConfig.name,
      absoluteTitle: true,
      description: siteConfig.description,
      path: "/",
      robots: INDEX_FOLLOW,
    });

    expect(metadata.title).toEqual({ absolute: "UrbanEdge Land Space" });
    expect(metadata.openGraph).toMatchObject({
      title: "UrbanEdge Land Space",
      url: "https://theurbanedgelandspace.com/",
    });
    expect(metadata.twitter).toMatchObject({ title: "UrbanEdge Land Space" });
    expect(metadata.alternates).toEqual({ canonical: "https://theurbanedgelandspace.com/" });
    expect(siteConfig.description).toContain("UrbanEdge Land Space");
    expect(siteConfig.description).toContain("Agricultural Land");
    expect(siteConfig.description).toContain("NA Land");
    expect(siteConfig.description).toContain("Industrial Land");
    expect(siteConfig.description).toContain("Ahmedabad");
    expect(siteConfig.description).toContain("Gandhinagar");
    expect(siteConfig.description.length).toBeLessThanOrEqual(175);
  });

  it("removes legacy brand suffixes before the root title template is applied", () => {
    expect(withoutSiteNameSuffix("Agricultural Land | UrbanEdge")).toBe("Agricultural Land");
    expect(withoutSiteNameSuffix("Land Guide | UrbanEdge Land Space")).toBe("Land Guide");
    expect(withoutSiteNameSuffix("About UrbanEdge Land Space")).toBe("About UrbanEdge Land Space");
    expect(
      buildPublicMetadata({
        title: "Land in Ahmedabad | UrbanEdge",
        description: "Land discovery in Ahmedabad.",
        path: "/locations/ahmedabad",
        robots: INDEX_FOLLOW,
      }).title,
    ).toBe("Land in Ahmedabad");
  });

  it("uses one stable brand favicon artwork and keeps structured-data names aligned", async () => {
    expect(siteIcons).toEqual({
      icon: [{ url: "/favicon.png", type: "image/png", sizes: "512x512" }],
      apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
    });

    const faviconPath = path.resolve(process.cwd(), "public/favicon.png");
    const appleIconPath = path.resolve(process.cwd(), "public/apple-touch-icon.png");
    expect(existsSync(faviconPath)).toBe(true);
    expect(existsSync(appleIconPath)).toBe(true);
    await expect(sharp(faviconPath).metadata()).resolves.toMatchObject({
      format: "png",
      width: 512,
      height: 512,
    });
    await expect(sharp(appleIconPath).metadata()).resolves.toMatchObject({
      format: "png",
      width: 180,
      height: 180,
    });

    expect(websiteJsonLd().name).toBe(siteConfig.name);
    expect(
      organizationJsonLd({
        phone: null,
        email: null,
        officeAddress: null,
        livingSpaceUrl: null,
      }).name,
    ).toBe(siteConfig.name);
  });

  it("keeps filters, private surfaces and query URLs out of the sitemap", () => {
    expect(staticIndexablePaths).toEqual([
      "/",
      "/properties",
      "/guides",
      "/about",
      "/contact",
      "/sell-your-land",
    ]);
    for (const path of [
      "/properties",
      "/guides",
      "/about",
      "/contact",
      "/sell-your-land",
      "/agricultural-land",
      "/na-land",
      "/industrial-land",
      "/locations/ahmedabad",
      "/locations/gandhinagar",
    ])
      expect(isSitemapEligiblePath(path)).toBe(true);
    expect(isSitemapEligiblePath("/properties?category=na")).toBe(false);
    expect(isSitemapEligiblePath("/admin/guides")).toBe(false);
    expect(isSitemapEligiblePath("/privacy")).toBe(false);
  });
});

describe("M16 quality and editorial controls", () => {
  const input = {
    kind: "DISTRICT_CATEGORY" as const,
    published: true,
    noindex: false,
    title: "Agricultural Land in Ahmedabad",
    seoTitle: "Agricultural Land in Ahmedabad | UrbanEdge",
    seoDescription: "Useful public land discovery context for Ahmedabad.",
    intro: words(100),
    body: words(250),
    canonicalPath: "/locations/ahmedabad/agricultural-land",
    activeInventoryCount: 3,
    internalLinkCount: 4,
    category: "AGRICULTURAL" as const,
  };

  it("requires editorial quality plus inventory or a stronger evergreen body", () => {
    expect(evaluateSeoPageQuality(input)).toMatchObject({ indexable: true, wordCount: 350 });
    expect(evaluateSeoPageQuality({ ...input, activeInventoryCount: 2 }).blockers[0]).toMatch(
      /Content needs 350 words/,
    );
    expect(
      evaluateSeoPageQuality({ ...input, activeInventoryCount: 0, body: words(900) }).indexable,
    ).toBe(true);
    expect(evaluateSeoPageQuality({ ...input, noindex: true }).indexable).toBe(false);
  });

  it("counts controlled Markdown and detects near-duplicate sibling copy", () => {
    expect(markdownWordCount("## Heading\n\nUseful [land guide](/guides/checklist)")).toBe(4);
    expect(normalizedContentSimilarity("land access water records", "land access water")).toBe(
      0.75,
    );
  });

  it("keeps guide categories noindex until multiple guides provide substantive visible copy", () => {
    expect(
      isGuideCategoryIndexable("Short category.", [{ title: "Only guide", excerpt: words(150) }]),
    ).toBe(false);
    expect(
      isGuideCategoryIndexable("Focused land guidance.", [
        { title: "First useful guide", excerpt: words(60) },
        { title: "Second useful guide", excerpt: words(60) },
      ]),
    ).toBe(true);
  });

  it("enforces safe guide slugs, complete media and non-promissory copy", () => {
    const base = {
      title: "A sufficiently useful guide title",
      slug: "useful-land-guide",
      excerpt: "A concise public excerpt.",
      bodyMarkdown: words(160),
      categoryId: "",
      seoTitle: "Useful land guide | UrbanEdge",
      seoDescription: "A sufficiently useful public SEO description for the guide.",
      heroObjectPath: "",
      heroAltText: "",
    };
    expect(guideInputSchema.safeParse(base).success).toBe(true);
    expect(guideInputSchema.safeParse({ ...base, slug: "Unsafe Slug" }).success).toBe(false);
    expect(
      guideInputSchema.safeParse({ ...base, bodyMarkdown: `${words(150)} Clear title guaranteed.` })
        .success,
    ).toBe(false);
    expect(
      guideInputSchema.safeParse({
        ...base,
        heroObjectPath: "guides/hero.webp",
        heroAltText: "",
      }).success,
    ).toBe(false);
    expect(
      seoPageInputSchema.safeParse({
        title: "Legally approved land page",
        introText: words(45),
        bodyMarkdown: words(160),
        seoTitle: "A useful title",
        seoDescription: words(55),
      }).success,
    ).toBe(false);
  });
});

describe("M16 structured data, breadcrumbs and redirects", () => {
  it("matches visible breadcrumb order with canonical structured data", () => {
    const data = breadcrumbJsonLd([
      { label: "Home", href: "/" },
      { label: "Ahmedabad", href: "/locations/ahmedabad" },
      { label: "NA Land" },
    ]);
    expect(data.itemListElement.map(({ name }) => name)).toEqual(["Home", "Ahmedabad", "NA Land"]);
    expect(data.itemListElement[1]).toMatchObject({
      item: "https://theurbanedgelandspace.com/locations/ahmedabad",
    });
  });

  it("never emits hidden coordinates, numeric POR prices or available status for closed land", () => {
    const hidden = buildPublicPropertyDetail({
      location: { visibility: "HIDDEN", label: "Ahmedabad", point: null },
      price: {
        transactionType: "BUY",
        mode: "PRICE_ON_REQUEST",
        currency: "INR",
        amount: null,
        minimum: null,
        maximum: null,
        perUnit: null,
        unitCode: null,
        negotiable: false,
      },
      availability: "SOLD",
    });
    const serialized = serializeJsonLd(propertyJsonLd(hidden, [{ label: "Home", href: "/" }]));
    expect(serialized).not.toContain("latitude");
    expect(serialized).not.toContain('"price":');
    expect(serialized).toContain("https://schema.org/OutOfStock");
    expect(serialized).not.toContain("InStock");
    expect(serializeJsonLd({ value: "</script><script>attack</script>" })).not.toContain("<");
  });

  it("accepts only bounded same-site redirects and flattens chains", () => {
    expect(isSafeRedirectPath("/guides/old-slug")).toBe(true);
    expect(isSafeRedirectPath("//attacker.invalid")).toBe(false);
    expect(isSafeRedirectPath("/guide?next=/private")).toBe(false);
    expect(
      flattenRedirects([{ sourcePath: "/oldest", destinationPath: "/old" }], "/old", "/current"),
    ).toEqual([{ sourcePath: "/oldest", destinationPath: "/current" }]);
    expect(safeSeoText("Clear title guaranteed", "Safe fallback")).toBe("Safe fallback");
  });
});
