import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminGuide } from "@/server/services/content";
import { guideStatusAction } from "../actions";

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const guide = await getAdminGuide((await params).id);
  if (!guide) notFound();
  return (
    <section>
      <p className="text-sm font-bold tracking-wider text-amber-700 uppercase">{guide.status}</p>
      <h1 className="mt-2 text-3xl font-bold">{guide.title}</h1>
      <p className="mt-2 text-slate-600">/guides/{guide.slug}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="button button-primary" href={`/admin/guides/${guide.id}/edit`}>
          Edit
        </Link>
        <Link className="button button-outline" href={`/admin/guides/${guide.id}/preview`}>
          Protected preview
        </Link>
        {guide.status === "DRAFT" || guide.status === "UNPUBLISHED" ? (
          <form action={guideStatusAction.bind(null, guide.id)}>
            <input type="hidden" name="status" value="REVIEW" />
            <button className="button button-outline" type="submit">
              Move to review
            </button>
          </form>
        ) : null}
        {guide.status === "REVIEW" ? (
          <form action={guideStatusAction.bind(null, guide.id)}>
            <input type="hidden" name="status" value="PUBLISHED" />
            <button className="button button-primary" type="submit">
              Publish
            </button>
          </form>
        ) : null}
        {guide.status === "PUBLISHED" ? (
          <form action={guideStatusAction.bind(null, guide.id)}>
            <input type="hidden" name="status" value="UNPUBLISHED" />
            <button className="button button-outline" type="submit">
              Unpublish
            </button>
          </form>
        ) : null}
      </div>
      <dl className="admin-detail-list mt-8">
        <div>
          <dt>SEO title</dt>
          <dd>{guide.seo_title || "Missing"}</dd>
        </div>
        <div>
          <dt>Meta description</dt>
          <dd>{guide.seo_description || "Missing"}</dd>
        </div>
        <div>
          <dt>Reviewed</dt>
          <dd>
            {guide.reviewed_at
              ? new Date(guide.reviewed_at).toLocaleString("en-IN")
              : "Not reviewed"}
          </dd>
        </div>
        <div>
          <dt>Published</dt>
          <dd>
            {guide.published_at
              ? new Date(guide.published_at).toLocaleString("en-IN")
              : "Not published"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
