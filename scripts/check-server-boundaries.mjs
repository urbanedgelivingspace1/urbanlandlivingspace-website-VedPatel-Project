import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoots = ["app", "components", "config", "features", "lib", "types"];
const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs"];
const importPattern =
  /(?:import|export)\s+(?:[^'\"]*?\s+from\s+)?["']([^"']+)["']|import\(["']([^"']+)["']\)/g;

function sourceFiles(directory) {
  if (!statSync(directory).isDirectory()) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return extensions.includes(extname(entry.name)) ? [path] : [];
  });
}

function resolveImport(fromFile, specifier) {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return undefined;
  const base = specifier.startsWith("@/")
    ? resolve(root, specifier.slice(2))
    : resolve(dirname(fromFile), specifier);
  const candidates = [base, ...extensions.map((extension) => `${base}${extension}`)];
  for (const extension of extensions) candidates.push(join(base, `index${extension}`));
  return candidates.find((candidate) => {
    try {
      return statSync(candidate).isFile();
    } catch {
      return false;
    }
  });
}

function importsFor(file) {
  const source = readFileSync(file, "utf8");
  const imports = [];
  for (const match of source.matchAll(importPattern)) imports.push(match[1] ?? match[2]);
  return { source, imports };
}

const allFiles = sourceRoots.flatMap((directory) => sourceFiles(resolve(root, directory)));
const clientEntries = allFiles.filter((file) =>
  /^\s*["']use client["'];/m.test(readFileSync(file, "utf8")),
);
const violations = [];

for (const entry of clientEntries) {
  const queue = [{ file: entry, chain: [entry] }];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current.file)) continue;
    visited.add(current.file);

    const normalizedFile = normalize(current.file);
    const { source, imports } = importsFor(current.file);
    if (
      normalizedFile.includes(`${normalize(root)}/server/`) ||
      /["']server-only["']/.test(source)
    ) {
      violations.push(current.chain.map((file) => relative(root, file)).join(" -> "));
      continue;
    }

    for (const specifier of imports) {
      if (specifier === "server-only" || specifier.startsWith("@/server/")) {
        violations.push(
          [...current.chain, specifier].map((file) => relative(root, file)).join(" -> "),
        );
        continue;
      }
      const importedFile = resolveImport(current.file, specifier);
      if (importedFile) queue.push({ file: importedFile, chain: [...current.chain, importedFile] });
    }
  }
}

if (violations.length > 0) {
  process.stderr.write(
    `Server-only dependency reached from client code:\n${violations.join("\n")}\n`,
  );
  process.exit(1);
}

process.stdout.write(`Server boundary check passed for ${clientEntries.length} client entries.\n`);
