import { PropertyDraftForm } from "@/components/admin/property-draft-form";
import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { getAdminReferenceData } from "@/server/services/property-drafts";

import { createPropertyDraftAction } from "../actions";

export default async function NewPropertyPage() {
  await requireActiveAdminPage();
  const references = await getAdminReferenceData();
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header>
        <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
          Inventory
        </p>
        <h1 className="font-display text-3xl font-semibold">Create property draft</h1>
        <p className="mt-1 text-sm text-slate-600">
          Only the schema-minimum core is required. Media, verification and publication remain
          separate later workflows.
        </p>
      </header>
      <PropertyDraftForm
        action={createPropertyDraftAction}
        references={references}
        submitLabel="Create draft"
      />
    </div>
  );
}
