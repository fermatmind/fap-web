import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

// Follow the generator's actual static import graph, including JSON and package
// locks. UI components outside this graph do not change artifact compatibility.
export function llmsGeneratorFingerprint(root = process.cwd()) {
  const visited = new Map();
  const walk = (filename) => {
    const relative = path.relative(root, filename).replaceAll(path.sep, "/");
    if (relative.startsWith("../") || visited.has(relative)) return;
    const source = readFileSync(filename, "utf8");
    visited.set(relative, source);
    if (filename.endsWith(".json")) return;
    for (const imported of ts.preProcessFile(source, true, true).importedFiles) {
      const specifier = imported.fileName;
      if (!specifier.startsWith("@/") && !specifier.startsWith(".")) continue;
      const target = specifier.startsWith("@/") ? path.join(root, specifier.slice(2)) : path.resolve(path.dirname(filename), specifier);
      const resolved = [target, ...[".ts", ".tsx", ".mjs", ".js", ".json", "/index.ts", "/index.tsx"].map((extension) => target + extension)]
        .find((candidate) => existsSync(candidate) && path.extname(candidate));
      if (!resolved) throw new Error(`Unresolved llms generator dependency: ${relative}`);
      walk(resolved);
    }
  };
  walk(path.join(root, "lib/seo/llmsFullRoute.ts"));
  for (const name of ["pnpm-lock.yaml", "package.json", "tsconfig.json", "scripts/release/llms-generator-fingerprint.mjs"]) {
    visited.set(name, readFileSync(path.join(root, name), "utf8"));
  }
  const hash = createHash("sha256");
  for (const [name, source] of [...visited.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    hash.update(name).update("\0").update(source).update("\0");
  }
  return hash.digest("hex");
}
