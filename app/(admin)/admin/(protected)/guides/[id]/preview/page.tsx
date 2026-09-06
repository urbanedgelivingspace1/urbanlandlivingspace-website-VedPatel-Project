import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { SafeMarkdown } from "@/components/public/safe-markdown";
import { getAdminGuide } from "@/server/services/content";

export const metadata = {
  title: "Protected guide preview",
  robots: { index: false, follow: false },
};
export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const guide = await getAdminGuide((await params).id);
  if (!guide) notFound();
  return (
    <article className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm sm:p-10">
      <Breadcrumbs
        items={[{ label: "Admin guides", href: "/admin/guides" }, { label: "Protected preview" }]}
      />
      <p className="mt-8 rounded-lg bg-amber-100 p-3 text-sm font-semibold">
        Protected preview · {guide.status} · not public or indexable
      </p>
      <h1 className="mt-7 text-4xl font-bold">{guide.title}</h1>
      <p className="mt-4 text-lg text-slate-600">{guide.excerpt}</p>
      <div className="mt-8">
        <SafeMarkdown value={guide.body_markdown} />
      </div>
    </article>
  );
}
