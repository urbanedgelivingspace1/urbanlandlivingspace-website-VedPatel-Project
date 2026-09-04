import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getPublicEnvironment } from "@/config/public-environment-schema";
import type { Database } from "@/types/database";

export function createPublicServerClient() {
  const environment = getPublicEnvironment();
  return createClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
