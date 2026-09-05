import Link from "next/link";
import { createLeadAction } from "../actions";
import { LeadForm } from "@/components/admin/lead-form";
import { getCrmReferenceData } from "@/server/services/crm";
export default async function NewLeadPage() {
  const refs = await getCrmReferenceData();
  return (
    <section className="mx-auto max-w-4xl">
      <Link href="/admin/leads" className="text-sm font-semibold text-[var(--brand-navy)]">
        ← Lead inbox
      </Link>
      <h1 className="font-display mt-4 text-4xl font-semibold">Create lead</h1>
      <p className="mt-2 mb-6 text-slate-600">
        Admin-created opportunity. Public conversion adapters remain deferred to M13.
      </p>
      <LeadForm action={createLeadAction} districts={refs.districts} />
    </section>
  );
}
