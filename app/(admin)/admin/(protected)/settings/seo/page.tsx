import { siteConfig } from "@/config/site";
export default function Page() {
  return (
    <section>
      <p className="text-sm font-bold tracking-wider text-amber-700 uppercase">Configuration</p>
      <h1 className="mt-2 text-3xl font-bold">SEO settings</h1>
      <p className="mt-2 max-w-3xl text-slate-600">
        Production identity remains centralized. Approval-gated contact and social values are not
        invented here.
      </p>
      <dl className="admin-detail-list mt-8">
        <div>
          <dt>Business name</dt>
          <dd>{siteConfig.name}</dd>
        </div>
        <div>
          <dt>Canonical origin</dt>
          <dd>{siteConfig.defaultUrl}</dd>
        </div>
        <div>
          <dt>Launch geography</dt>
          <dd>{siteConfig.launchRegion}</dd>
        </div>
        <div>
          <dt>Location route scope</dt>
          <dd>Ahmedabad and Gandhinagar only</dd>
        </div>
        <div>
          <dt>Search filters</dt>
          <dd>noindex, follow; excluded from sitemap</dd>
        </div>
      </dl>
    </section>
  );
}
