import { GuideForm } from "@/components/admin/content-forms";
import { listAdminGuideCategories } from "@/server/services/content";
import { saveGuideAction } from "../actions";

export default async function Page() {
  const categories = await listAdminGuideCategories();
  return (
    <section className="max-w-4xl">
      <p className="text-sm font-bold tracking-wider text-amber-700 uppercase">New draft</p>
      <h1 className="mt-2 text-3xl font-bold">Create guide</h1>
      <p className="mt-2 text-slate-600">
        Content remains private until it passes review and is explicitly published.
      </p>
      <GuideForm action={saveGuideAction.bind(null, null)} categories={categories} />
    </section>
  );
}
