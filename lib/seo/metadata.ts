import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { absoluteCanonical, approvedSameSitePath } from "./canonical";
import { effectiveRobots, INDEX_FOLLOW, type IndexPolicy } from "./robots";

type PublicMetadataInput = Readonly<{
  title: string;
  absoluteTitle?: boolean;
  description: string;
  path: string;
  canonicalPath?: string | null;
  robots?: IndexPolicy;
  type?: "website" | "article";
  image?: Readonly<{
    url: string;
    width?: number | null;
    height?: number | null;
    alt: string;
  }> | null;
  publishedTime?: string | null;
  modifiedTime?: string | null;
}>;

export function buildPublicMetadata(input: PublicMetadataInput): Metadata {
  const canonical = absoluteCanonical(approvedSameSitePath(input.canonicalPath, input.path));
  const image = input.image
    ? {
        url: input.image.url,
        width: input.image.width ?? undefined,
        height: input.image.height ?? undefined,
        alt: input.image.alt,
      }
    : {
        url: absoluteCanonical(siteConfig.socialImage.path),
        width: siteConfig.socialImage.width,
        height: siteConfig.socialImage.height,
        alt: siteConfig.socialImage.alt,
      };
  const images = [image];
  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical },
    robots: effectiveRobots(input.robots ?? INDEX_FOLLOW),
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: siteConfig.name,
      locale: "en_IN",
      type: input.type ?? "website",
      images,
      ...(input.type === "article"
        ? {
            publishedTime: input.publishedTime ?? undefined,
            modifiedTime: input.modifiedTime ?? undefined,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: images.map(({ url }) => url),
    },
  };
}
