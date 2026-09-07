import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServerEnvironment } from "@/server/env";
import type { Database } from "@/types/database";

let privilegedClient: ReturnType<typeof createClient<Database>> | undefined;

export function createPrivilegedServerClient() {
  if (!privilegedClient) {
    const environment = getServerEnvironment();
    privilegedClient = createClient<Database>(
      environment.NEXT_PUBLIC_SUPABASE_URL,
      environment.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return privilegedClient;
}
