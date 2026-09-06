import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const files = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  { cwd: root },
)
  .toString("utf8")
  .split("\0")
  .filter(Boolean);
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/,
  /\bsbp_[A-Za-z0-9]{20,}\b/,
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,
];
const violations = [];

for (const file of files) {
  let content;
  try {
    content = readFileSync(resolve(root, file));
  } catch {
    continue;
  }
  if (content.includes(0)) continue;
  const text = content.toString("utf8");
  if (patterns.some((pattern) => pattern.test(text))) violations.push(file);
}

if (violations.length > 0) {
  process.stderr.write(`Potential committed secret detected in:\n${violations.join("\n")}\n`);
  process.exit(1);
}

const history = execFileSync("git", ["log", "--all", "--format=", "-p", "--", "."], {
  cwd: root,
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});
if (patterns.some((pattern) => pattern.test(history))) {
  process.stderr.write("Potential secret pattern detected in Git history.\n");
  process.exit(1);
}

process.stdout.write(
  `Secret scan passed for ${files.length} current files and the reachable Git history.\n`,
);
