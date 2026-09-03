import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export type TestActorCredentials = Readonly<{ url: string; key: string }>;

export function createTestActorClient(credentials: TestActorCredentials) {
  if (process.env.APP_ENV !== "test") {
    throw new Error("Test actor clients are available only when APP_ENV=test.");
  }

  return createClient<Database>(credentials.url, credentials.key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
