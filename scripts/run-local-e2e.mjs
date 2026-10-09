import { execFileSync, spawnSync } from "node:child_process";

const status = JSON.parse(
  execFileSync("supabase", ["status", "-o", "json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }),
);

const playwrightPort = process.env.PLAYWRIGHT_PORT ?? "3100";

const environment = {
  ...process.env,
  APP_ENV: "test",
  NEXT_DIST_DIR: ".next/playwright",
  PLAYWRIGHT_PORT: playwrightPort,
  NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${playwrightPort}`,
  NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: status.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
  TEST_SUPABASE_PROJECT_REF: "urbanedge-land-space-local",
  PRODUCTION_SUPABASE_PROJECT_REF: "urbanedge-land-space-production",
  TEST_TARGET_URL: status.API_URL,
  PRODUCTION_SITE_URL: "https://urbanedgelandspace.invalid",
  TEST_SAFETY_TOKEN: "urbanedge-landspace-synthetic-test-only",
};

const result = spawnSync("npm", ["exec", "playwright", "test", "--", ...process.argv.slice(2)], {
  env: environment,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
