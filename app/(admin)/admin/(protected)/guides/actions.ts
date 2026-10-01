"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { guideInputSchema } from "@/features/content/domain/validation";
import { requireActiveAdmin } from "@/server/auth/authorization";
import { saveGuide, setGuideStatus } from "@/server/services/content";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const positive = (formData: FormData, key: string) =>
  text(formData, key) ? Number(text(formData, key)) : undefined;

export async function saveGuideAction(id: string | null, formData: FormData) {
  await requireActiveAdmin();
  const parsed = guideInputSchema.parse({
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    excerpt: text(formData, "excerpt"),
    bodyMarkdown: text(formData, "bodyMarkdown"),
    categoryId: text(formData, "categoryId"),
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
    heroObjectPath: text(formData, "heroObjectPath"),
    heroAltText: text(formData, "heroAltText"),
    heroWidth: positive(formData, "heroWidth"),
    heroHeight: positive(formData, "heroHeight"),
  });
  const guideId = await saveGuide(id, parsed);
  revalidateTag("public-guides", "max");
  revalidatePath("/guides");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/guides");
  redirect(`/admin/guides/${guideId}?saved=1`);
}

export async function guideStatusAction(id: string, formData: FormData) {
  await requireActiveAdmin();
  const status = text(formData, "status");
  if (status !== "REVIEW" && status !== "PUBLISHED" && status !== "UNPUBLISHED")
    throw new Error("Invalid guide status.");
  await setGuideStatus(id, status);
  revalidateTag("public-guides", "max");
  revalidatePath("/guides");
  revalidatePath("/guides/[guide-slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath(`/admin/guides/${id}`);
}
