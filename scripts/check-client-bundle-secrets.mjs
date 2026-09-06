import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const staticRoot = resolve(root, ".next/static");
const textExtensions = new Set([".js", ".json", ".map", ".txt"]);
const forbiddenNames = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "TURNSTILE_SECRET_KEY",
  "HMAC_SECRET",
  "WEBHOOK_SIGNING_SECRET",
  "MALWARE_SCAN_TOKEN",
  "RESEND_API_KEY",
];
const configuredSecretValues = forbiddenNames
  .map((name) => process.env[name])
  .filter((value) => typeof value === "string" && value.length >= 16);

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

if (!existsSync(staticRoot)) {
  process.stdout.write("Client bundle secret scan skipped because .next/static is absent.\n");
  process.exit(0);
}

const violations = [];
for (const file of filesUnder(staticRoot)) {
  if (!textExtensions.has(extname(file))) continue;
  const content = readFileSync(file, "utf8");
  if (
    forbiddenNames.some((name) => content.includes(name)) ||
    configuredSecretValues.some((value) => content.includes(value))
  )
    violations.push(relative(root, file));
}

if (violations.length > 0) {
  process.stderr.write(
    `Server secret reference detected in client output:\n${violations.join("\n")}\n`,
  );
  process.exit(1);
}

process.stdout.write("Client bundle secret scan passed.\n");
