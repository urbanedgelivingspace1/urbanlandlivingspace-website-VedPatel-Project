import { notFound } from "next/navigation";
import { GuideForm } from "@/components/admin/content-forms";
import { getAdminGuide, listAdminGuideCategories } from "@/server/services/content";
import { saveGuideAction } from "../../actions";

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const id = (await params).id;
  const [guide, categories] = await Promise.all([getAdminGuide(id), listAdminGuideCategories()]);
  if (!guide) notFound();
  return (
    <section className="max-w-4xl">
      <p className="text-sm font-bold tracking-wider text-amber-700 uppercase">Guide editor</p>
      <h1 className="mt-2 text-3xl font-bold">Edit {guide.title}</h1>
      <GuideForm action={saveGuideAction.bind(null, id)} guide={guide} categories={categories} />
    </section>
  );
}
