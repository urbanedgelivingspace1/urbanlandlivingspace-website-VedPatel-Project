import Link from "next/link";
import { listAdminGuides } from "@/server/services/content";

export default async function Page() {
  const guides = await listAdminGuides();
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold tracking-wider text-amber-700 uppercase">Publishing</p>
          <h1 className="mt-2 text-3xl font-bold">Guides</h1>
          <p className="mt-2 text-slate-600">
            Draft, review, preview and publish controlled educational content.
          </p>
        </div>
        <Link className="button button-primary" href="/admin/guides/new">
          Create guide
        </Link>
      </div>
      <div className="mt-7 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Guide</th>
              <th>Status</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {guides.map((guide) => (
              <tr key={guide.id}>
                <td>
                  <strong>{guide.title}</strong>
                  <br />
                  <span className="text-xs text-slate-500">/guides/{guide.slug}</span>
                </td>
                <td>{guide.status}</td>
                <td>{new Date(guide.updated_at).toLocaleDateString("en-IN")}</td>
                <td>
                  <Link className="text-link" href={`/admin/guides/${guide.id}`}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
