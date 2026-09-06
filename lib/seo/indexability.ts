import type { LandCategory } from "@/types/database";

export type SeoPageKind = "DISTRICT" | "DISTRICT_CATEGORY" | "CATEGORY" | "TRANSACTION";
export type SeoQualityInput = Readonly<{
  kind: SeoPageKind;
  published: boolean;
  noindex: boolean;
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  intro: string | null;
  body: string | null;
  canonicalPath: string | null;
  activeInventoryCount: number;
  internalLinkCount: number;
  category?: LandCategory | null;
}>;
export type SeoQualityResult = Readonly<{
  indexable: boolean;
  wordCount: number;
  blockers: readonly string[];
}>;

export function markdownWordCount(value: string | null | undefined): number {
  return (value ?? "")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_`>\[\]()-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function evaluateSeoPageQuality(input: SeoQualityInput): SeoQualityResult {
  const wordCount = markdownWordCount(`${input.intro ?? ""} ${input.body ?? ""}`);
  const blockers: string[] = [];
  if (!input.published || input.noindex) blockers.push("Page is not approved for indexing.");
  if (!input.title.trim()) blockers.push("A unique H1 is required.");
  if (!input.seoTitle?.trim()) blockers.push("A unique SEO title is required.");
  if (!input.seoDescription?.trim()) blockers.push("A useful meta description is required.");
  if (!input.canonicalPath?.startsWith("/"))
    blockers.push("A same-site canonical path is required.");
  if (!input.intro?.trim()) blockers.push("A useful introduction is required.");
  if (input.internalLinkCount < 2)
    blockers.push("At least two contextual internal links are required.");
  const thresholds =
    input.kind === "DISTRICT_CATEGORY"
      ? { inventory: 3, supported: 350, editorial: 1_000 }
      : input.kind === "DISTRICT"
        ? { inventory: 3, supported: 350, editorial: 900 }
        : { inventory: 3, supported: 250, editorial: 700 };
  if (!(
    (input.activeInventoryCount >= thresholds.inventory && wordCount >= thresholds.supported) ||
    wordCount >= thresholds.editorial
  )) {
    blockers.push(
      `Content needs ${thresholds.supported} words with ${thresholds.inventory} active listings, or ${thresholds.editorial} words of evergreen editorial value.`,
    );
  }
  return { indexable: blockers.length === 0, wordCount, blockers };
}

export function normalizedContentSimilarity(left: string, right: string): number {
  const tokens = (value: string) =>
    new Set(
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean),
    );
  const a = tokens(left);
  const b = tokens(right);
  if (a.size === 0 && b.size === 0) return 1;
  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

export function isGuideCategoryIndexable(
  description: string | null,
  guides: readonly Readonly<{ title: string; excerpt: string | null }>[],
): boolean {
  const visibleEditorialText = [
    description ?? "",
    ...guides.flatMap(({ title, excerpt }) => [title, excerpt ?? ""]),
  ].join(" ");
  return guides.length >= 2 && markdownWordCount(visibleEditorialText) >= 120;
}
