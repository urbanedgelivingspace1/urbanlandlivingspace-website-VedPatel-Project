import Link from "next/link";
import { listAdminSeoPages, listSeoRedirects } from "@/server/services/content";
import { recordSeoRedirectAction } from "./actions";

export default async function Page() {
  const [pages, redirects] = await Promise.all([listAdminSeoPages(), listSeoRedirects()]);
  return (
    <section>
      <p className="text-sm font-bold tracking-wider text-amber-700 uppercase">Publishing</p>
      <h1 className="mt-2 text-3xl font-bold">SEO pages and redirects</h1>
      <p className="mt-2 max-w-3xl text-slate-600">
        Only the eight governed Ahmedabad/Gandhinagar routes can be edited. Effective indexing still
        depends on the content and inventory gate.
      </p>
      <div className="mt-7 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Status</th>
              <th>Type</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id}>
                <td>/{page.slug}</td>
                <td>{page.status}</td>
                <td>{page.page_type.replaceAll("_", " ")}</td>
                <td>
                  <Link className="text-link" href={`/admin/locations/${page.id}`}>
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Record a permanent route migration</h2>
          <p className="mt-2 text-sm text-slate-600">
            Use only for a genuine canonical successor. Historical entity redirects are flattened to
            one hop.
          </p>
          <form action={recordSeoRedirectAction} className="admin-form mt-5">
            <label>
              Old path
              <input name="sourcePath" required placeholder="/properties/old-slug" />
            </label>
            <label>
              Canonical destination
              <input name="destinationPath" required placeholder="/properties/current-slug" />
            </label>
            <label>
              Entity type
              <select name="entityType">
                <option>PROPERTY</option>
                <option>GUIDE</option>
                <option>SEO_PAGE</option>
                <option>ROUTE</option>
              </select>
            </label>
            <button className="button button-primary" type="submit">
              Record 308 redirect
            </button>
          </form>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Active redirects</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {redirects.map((item) => (
              <li key={item.id}>
                <code>{item.source_path}</code> → <code>{item.destination_path}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
