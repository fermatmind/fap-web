#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EXPECTED_PRINT_ASSET_HASH = "sha256:47e448da9695373f0cfe11116f7b6e3998d9b7501cb44c8c5a6c0b1e7073c726";

const PRINT_ASSET_INPUTS = [
  "app/(localized)/[locale]/(app)/result/[id]",
  "app/globals.css",
  "components/result/RichResultReport.tsx",
  "components/result/mbti",
  "lib/result/pdfSurface.ts",
  "proxy.ts",
];

const IGNORED_DIRS = new Set(["node_modules", ".next", "coverage", "out", "dist", ".git"]);

function collectFiles(inputPath) {
  const absolutePath = path.join(ROOT, inputPath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing print asset input: ${inputPath}`);
  }

  const stat = statSync(absolutePath);
  if (stat.isFile()) {
    return [inputPath];
  }

  if (!stat.isDirectory()) {
    return [];
  }

  const files = [];
  const stack = [inputPath];
  while (stack.length > 0) {
    const relativeDir = stack.pop();
    const absoluteDir = path.join(ROOT, relativeDir);
    const entries = readdirSync(absoluteDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;

      const relativeEntry = path.join(relativeDir, entry.name);
      if (entry.isDirectory()) {
        stack.push(relativeEntry);
      } else if (entry.isFile() && /\.(css|js|jsx|mjs|ts|tsx|json)$/.test(entry.name)) {
        files.push(relativeEntry);
      }
    }
  }

  return files;
}

function computePrintAssetHash() {
  const files = [...new Set(PRINT_ASSET_INPUTS.flatMap(collectFiles))].sort();
  const hash = createHash("sha256");

  for (const file of files) {
    hash.update(file);
    hash.update("\0");
    hash.update(readFileSync(path.join(ROOT, file)));
    hash.update("\0");
  }

  return {
    hash: `sha256:${hash.digest("hex")}`,
    files,
  };
}

function main() {
  const args = new Set(process.argv.slice(2));
  const result = computePrintAssetHash();
  const payload = {
    ok: result.hash === EXPECTED_PRINT_ASSET_HASH,
    expected_hash: EXPECTED_PRINT_ASSET_HASH,
    actual_hash: result.hash,
    file_count: result.files.length,
    inputs: PRINT_ASSET_INPUTS,
  };

  if (args.has("--json")) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(`[mbti-pdf-print-asset-hash] expected=${payload.expected_hash} actual=${payload.actual_hash} files=${payload.file_count}`);
  }

  if (args.has("--check") && !payload.ok) {
    process.exit(1);
  }
}

main();
