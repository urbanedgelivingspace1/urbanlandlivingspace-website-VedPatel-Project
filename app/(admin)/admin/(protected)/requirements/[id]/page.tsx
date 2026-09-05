import { notFound, redirect } from "next/navigation";
import { getRequirementLeadId } from "@/server/services/crm";
export default async function RequirementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const leadId = await getRequirementLeadId(id);
  if (!leadId) notFound();
  redirect(`/admin/leads/${leadId}#buyer-requirement`);
}
