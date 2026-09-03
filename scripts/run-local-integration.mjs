import { execFileSync, spawnSync } from "node:child_process";

const status = JSON.parse(
  execFileSync("supabase", ["status", "-o", "json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }),
);

const environment = {
  ...process.env,
  APP_ENV: "test",
  NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000",
  NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: status.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
  TEST_SUPABASE_PROJECT_REF: "urbanedge-land-space-local",
  PRODUCTION_SUPABASE_PROJECT_REF: "urbanedge-land-space-production",
  TEST_TARGET_URL: status.API_URL,
  PRODUCTION_SITE_URL: "https://urbanedgelandspace.invalid",
  TEST_SAFETY_TOKEN: "urbanedge-landspace-synthetic-test-only",
};

const result = spawnSync("npm", ["run", "test:integration"], {
  env: environment,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
