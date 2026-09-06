import { z } from "zod";

import { containsUnsafeSeoClaim } from "@/lib/seo/privacy-safe-seo";

const slug = z
  .string()
  .trim()
  .min(3)
  .max(220)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.");
const safeText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .refine(
      (value) => !containsUnsafeSeoClaim(value),
      "Remove unsupported verification, approval or guarantee wording.",
    );
const optional = (maximum: number) => safeText(maximum).optional().or(z.literal(""));

export const guideInputSchema = z
  .object({
    title: safeText(240).min(10),
    slug,
    excerpt: optional(500),
    bodyMarkdown: safeText(30_000).min(150),
    categoryId: z.uuid().optional().or(z.literal("")),
    seoTitle: optional(220),
    seoDescription: optional(320),
    heroObjectPath: z.string().trim().max(500).optional().or(z.literal("")),
    heroAltText: optional(300),
    heroWidth: z.coerce.number().int().positive().optional(),
    heroHeight: z.coerce.number().int().positive().optional(),
  })
  .superRefine((value, context) => {
    const mediaValues = [
      value.heroObjectPath,
      value.heroAltText,
      value.heroWidth,
      value.heroHeight,
    ];
    if (mediaValues.some(Boolean) && !mediaValues.every(Boolean))
      context.addIssue({
        code: "custom",
        path: ["heroObjectPath"],
        message: "Hero path, alt text, width and height must be supplied together.",
      });
    if (value.heroObjectPath && !/^[a-zA-Z0-9][a-zA-Z0-9/_-]*\.webp$/.test(value.heroObjectPath))
      context.addIssue({
        code: "custom",
        path: ["heroObjectPath"],
        message: "Use an approved WebP object path from guide-media-public.",
      });
  });
export type GuideInput = z.infer<typeof guideInputSchema>;

export const seoPageInputSchema = z.object({
  title: safeText(240).min(10),
  introText: safeText(2_000).min(40),
  bodyMarkdown: safeText(40_000).min(150),
  seoTitle: safeText(220).min(10),
  seoDescription: safeText(320).min(50),
});
export type SeoPageInput = z.infer<typeof seoPageInputSchema>;
