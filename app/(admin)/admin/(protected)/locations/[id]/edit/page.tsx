import { notFound } from "next/navigation";
import { SeoPageForm } from "@/components/admin/content-forms";
import { getAdminSeoPage } from "@/server/services/content";
import { saveSeoPageAction } from "../../../seo/actions";

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const id = (await params).id;
  const page = await getAdminSeoPage(id);
  if (!page) notFound();
  return (
    <section className="max-w-4xl">
      <p className="text-sm font-bold tracking-wider text-amber-700 uppercase">
        Curated SEO editor
      </p>
      <h1 className="mt-2 text-3xl font-bold">Edit {page.title}</h1>
      <p className="mt-2 text-slate-600">
        Routing and geography mapping are locked; only approved content fields can change.
      </p>
      <SeoPageForm action={saveSeoPageAction.bind(null, id)} page={page} />
    </section>
  );
}
