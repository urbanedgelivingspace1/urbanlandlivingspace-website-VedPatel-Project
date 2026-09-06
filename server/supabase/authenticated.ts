import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getServerEnvironment } from "@/server/env";
import type { Database } from "@/types/database";

export async function createAuthenticatedServerClient() {
  const environment = getServerEnvironment();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                httpOnly: true,
                sameSite: "lax",
                secure: environment.APP_ENV === "production",
              }),
            );
          } catch {
            // Server Components cannot set cookies. Middleware/action boundaries refresh them.
          }
        },
      },
    },
  );
}
