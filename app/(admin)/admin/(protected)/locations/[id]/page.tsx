import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSeoPage, listAdminSeoPages, seoPageAdminQuality } from "@/server/services/content";
import { loadFixedPublicSearch } from "@/server/queries/public-search";
import { seoPageStatusAction } from "../../seo/actions";

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const id = (await params).id;
  const [page, siblings] = await Promise.all([getAdminSeoPage(id), listAdminSeoPages()]);
  if (!page) notFound();
  const city = page.slug.includes("gandhinagar") ? "gandhinagar" : "ahmedabad";
  const inventory = await loadFixedPublicSearch(
    { district: city, category: page.land_category ?? undefined },
    48,
  );
  const quality = await seoPageAdminQuality(
    page,
    inventory.status === "ready" ? inventory.properties.length : 0,
    siblings,
    false,
  );
  const publishQuality = await seoPageAdminQuality(
    { ...page, status: "PUBLISHED" },
    inventory.status === "ready" ? inventory.properties.length : 0,
    siblings,
  );
  return (
    <section>
      <p className="text-sm font-bold tracking-wider text-amber-700 uppercase">{page.status}</p>
      <h1 className="mt-2 text-3xl font-bold">{page.title}</h1>
      <p className="mt-2 text-slate-600">/{page.slug}</p>
      <div
        className={`mt-6 rounded-xl border p-5 ${quality.indexable ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}
      >
        <h2 className="font-bold">
          Effective indexability: {quality.indexable ? "Indexable" : "Noindex"}
        </h2>
        <p className="mt-1 text-sm">
          {quality.wordCount} editorial words ·{" "}
          {inventory.status === "ready" ? inventory.properties.length : 0} matching active listings
        </p>
        {quality.blockers.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {quality.blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        ) : null}
        {quality.duplicateWarning ? (
          <p className="mt-3 text-sm font-semibold">
            Duplicate-content warning: sibling similarity is at least 70%.
          </p>
        ) : null}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="button button-primary" href={`/admin/locations/${page.id}/edit`}>
          Edit content
        </Link>
        <Link className="button button-outline" href={`/${page.slug}`} target="_blank">
          Open public route
        </Link>
        <form action={seoPageStatusAction.bind(null, page.id)}>
          <input type="hidden" name="status" value="NOINDEX" />
          <button className="button button-outline" type="submit">
            Set noindex
          </button>
        </form>
        <form action={seoPageStatusAction.bind(null, page.id)}>
          <input type="hidden" name="status" value="PUBLISHED" />
          <button
            className="button button-primary"
            type="submit"
            disabled={!publishQuality.indexable || publishQuality.duplicateWarning}
          >
            Publish as indexable
          </button>
        </form>
      </div>
    </section>
  );
}
