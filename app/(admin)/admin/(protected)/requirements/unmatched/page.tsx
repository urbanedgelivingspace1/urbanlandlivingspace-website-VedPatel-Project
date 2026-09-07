import { listRequirements } from "@/server/services/crm";
import { RequirementList } from "@/components/admin/requirement-list";

export default async function UnmatchedRequirementsPage() {
  return <RequirementList items={await listRequirements(true)} title="Unmatched requirements" />;
}
