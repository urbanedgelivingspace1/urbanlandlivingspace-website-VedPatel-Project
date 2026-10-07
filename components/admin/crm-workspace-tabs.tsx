import { WorkspaceTabs } from "@/components/admin/admin-ui";

export type CrmWorkspace = "leads" | "pipeline" | "follow-ups" | "site-visits";

export const crmWorkspaceTabs = [
  { key: "leads", label: "Leads", href: "/admin/leads" },
  { key: "pipeline", label: "Pipeline", href: "/admin/leads/pipeline" },
  { key: "follow-ups", label: "Follow-ups", href: "/admin/follow-ups" },
  { key: "site-visits", label: "Site visits", href: "/admin/site-visits" },
] as const;

export function CrmWorkspaceTabs({ active }: Readonly<{ active: CrmWorkspace }>) {
  return <WorkspaceTabs label="CRM workspaces" active={active} tabs={crmWorkspaceTabs} />;
}
