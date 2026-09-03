# Supabase boundary

`browser.ts` contains only the anonymous-key browser helper. Authenticated and privileged helpers
live under `server/supabase/`, import `server-only`, and cannot be reached from a client dependency
graph. M4 will add the actor-matrix RLS/grant enforcement. No Living Space backend configuration is
reused.
