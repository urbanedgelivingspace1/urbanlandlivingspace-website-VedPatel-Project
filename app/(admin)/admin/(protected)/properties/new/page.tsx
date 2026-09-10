import { isNonProductionEnvironment } from "@/config/environment-schema";
import { PropertyDraftForm } from "@/components/admin/property-draft-form";
import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { getAdminReferenceData } from "@/server/services/property-drafts";

import { createPropertyDraftAction } from "../actions";

export default async function NewPropertyPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireActiveAdminPage();
  const references = await getAdminReferenceData();
  const allowTestPresets = isNonProductionEnvironment();
  const params = (await searchParams) ?? {};
  const getParam = (key: string) => (typeof params[key] === "string" ? params[key] : undefined);

  const initialValues: Record<string, string | number | boolean | undefined> = {};
  if (getParam("partyId")) initialValues.partyId = getParam("partyId");
  if (getParam("category")) initialValues.landCategory = getParam("category");
  if (getParam("transaction")) initialValues.primaryTransactionType = getParam("transaction");
  if (getParam("districtId")) initialValues.districtId = getParam("districtId");
  if (getParam("title")) initialValues.listingTitle = getParam("title");
  if (getParam("localityText")) initialValues.landmarkText = getParam("localityText");
  if (getParam("areaValue")) initialValues.displayAreaValue = Number(getParam("areaValue"));
  if (getParam("areaUnitId")) initialValues.displayAreaUnitId = getParam("areaUnitId");
  if (getParam("priceMode")) initialValues.priceMode = getParam("priceMode");
  if (getParam("priceAmount")) initialValues.priceAmount = Number(getParam("priceAmount"));
  if (getParam("priceMinimum")) initialValues.priceMinimum = Number(getParam("priceMinimum"));
  if (getParam("priceMaximum")) initialValues.priceMaximum = Number(getParam("priceMaximum"));
  if (getParam("sourceType")) initialValues.sourceType = getParam("sourceType");
  if (getParam("sourceName")) initialValues.sourceName = getParam("sourceName");
  if (getParam("sourceReference")) initialValues.sourceReference = getParam("sourceReference");

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
        initialValues={initialValues}
        submitLabel="Create draft"
        allowTestPresets={allowTestPresets}
      />
    </div>
  );
}
