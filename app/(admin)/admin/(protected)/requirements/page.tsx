import { listRequirements } from "@/server/services/crm";
import { RequirementList } from "@/components/admin/requirement-list";

export default async function RequirementsPage() {
  const items = await listRequirements();
  return <RequirementList items={items} title="Buyer requirements" />;
}
