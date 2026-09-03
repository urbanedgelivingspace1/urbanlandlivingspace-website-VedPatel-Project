"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnvironment } from "@/config/public-environment-schema";
import type { Database } from "@/types/database";

export function createPublicBrowserClient() {
  const environment = getPublicEnvironment();
  return createBrowserClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
