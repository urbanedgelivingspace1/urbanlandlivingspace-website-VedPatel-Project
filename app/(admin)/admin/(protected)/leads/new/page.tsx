import Link from "next/link";
import { createLeadAction } from "../actions";
import { LeadForm } from "@/components/admin/lead-form";
import { getCrmReferenceData } from "@/server/services/crm";
export default async function NewLeadPage() {
  const refs = await getCrmReferenceData();
  return (
    <section className="mx-auto max-w-4xl">
      <Link href="/admin/leads" className="text-sm font-semibold text-[var(--brand-navy)]">
        ← Leads
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Add Lead</h1>
      <p className="mt-2 mb-6 text-slate-600">
        Add the contact details you have now. You can fill in requirements and schedule follow-ups
        next.
      </p>
      <LeadForm action={createLeadAction} districts={refs.districts} />
    </section>
  );
}
