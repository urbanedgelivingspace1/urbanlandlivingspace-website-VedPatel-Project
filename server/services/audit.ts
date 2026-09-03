import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AuditAction, Database, Json } from "@/types/database";

export type AuditWrite = Readonly<{
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  changedFields?: readonly string[] | null;
  beforeState?: Json;
  afterState?: Json;
  reason?: string | null;
}>;

export async function writeAuditLog(
  trustedServerClient: SupabaseClient<Database>,
  input: AuditWrite,
): Promise<string> {
  const { data, error } = await trustedServerClient.rpc("write_audit_log", {
    requested_action: input.action,
    requested_entity_type: input.entityType,
    requested_entity_id: input.entityId,
    requested_changed_fields: input.changedFields ? [...input.changedFields] : input.changedFields,
    requested_before_state: input.beforeState,
    requested_after_state: input.afterState,
    requested_reason: input.reason,
  });

  if (error) throw error;
  return data;
}
