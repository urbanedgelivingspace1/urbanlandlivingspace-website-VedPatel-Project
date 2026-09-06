"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { seoPageInputSchema } from "@/features/content/domain/validation";
import { isSafeRedirectPath } from "@/lib/seo/redirects";
import { requireActiveAdmin } from "@/server/auth/authorization";
import {
  getAdminSeoPage,
  listAdminSeoPages,
  recordSeoRedirect,
  saveSeoPage,
  seoPageAdminQuality,
  setSeoPageStatus,
} from "@/server/services/content";
import { loadFixedPublicSearch } from "@/server/queries/public-search";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

export async function saveSeoPageAction(id: string, formData: FormData) {
  await requireActiveAdmin();
  const input = seoPageInputSchema.parse({
    title: text(formData, "title"),
    introText: text(formData, "introText"),
    bodyMarkdown: text(formData, "bodyMarkdown"),
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
  });
  await saveSeoPage(id, input);
  revalidatePath("/locations/[city]", "page");
  revalidatePath("/locations/[city]/[category]", "page");
  revalidatePath("/sitemap.xml");
  redirect(`/admin/locations/${id}?saved=1`);
}

export async function seoPageStatusAction(id: string, formData: FormData) {
  await requireActiveAdmin();
  const status = text(formData, "status");
  if (status !== "REVIEW" && status !== "PUBLISHED" && status !== "NOINDEX")
    throw new Error("Invalid SEO page status.");
  if (status === "PUBLISHED") {
    const [page, siblings] = await Promise.all([getAdminSeoPage(id), listAdminSeoPages()]);
    if (!page) throw new Error("SEO page not found.");
    const city = page.slug.includes("gandhinagar") ? "gandhinagar" : "ahmedabad";
    const inventory = await loadFixedPublicSearch(
      { district: city, category: page.land_category ?? undefined },
      48,
    );
    const result = await seoPageAdminQuality(
      { ...page, status: "PUBLISHED" },
      inventory.status === "ready" ? inventory.properties.length : 0,
      siblings,
      false,
    );
    if (!result.indexable || result.duplicateWarning)
      throw new Error(
        `Indexability gate failed. ${[...result.blockers, ...(result.duplicateWarning ? ["Sibling content similarity is at least 70% and requires editorial revision."] : [])].join(" ")}`,
      );
  }
  await setSeoPageStatus(id, status);
  revalidatePath("/locations/[city]", "page");
  revalidatePath("/locations/[city]/[category]", "page");
  revalidatePath("/sitemap.xml");
}

export async function recordSeoRedirectAction(formData: FormData) {
  await requireActiveAdmin();
  const source = text(formData, "sourcePath");
  const destination = text(formData, "destinationPath");
  const entityType = text(formData, "entityType");
  if (!isSafeRedirectPath(source) || !isSafeRedirectPath(destination) || source === destination)
    throw new Error("Use distinct, safe same-site paths without query strings or fragments.");
  if (
    entityType !== "PROPERTY" &&
    entityType !== "GUIDE" &&
    entityType !== "SEO_PAGE" &&
    entityType !== "ROUTE"
  )
    throw new Error("Invalid redirect entity type.");
  await recordSeoRedirect(source, destination, entityType);
  revalidatePath("/admin/seo");
}
