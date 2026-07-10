#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = process.cwd();
const BASELINE_RELATIVE_PATH = "scripts/spacing-token-baseline.v1.json";
const TARGET_DIRS = ["app", "components", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"]);
const SPACING_PREFIX = "(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-x|space-y)";
const ALLOWED_SPACING_KEYS = new Set([
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "10",
  "12",
  "14",
  "16",
  "20",
  "24",
  "30",
]);

const arbitraryPxRe = new RegExp(`\\b${SPACING_PREFIX}-\\[[^\\]]*\\d+(?:\\.\\d+)?px[^\\]]*\\]`, "g");
const halfStepRe = new RegExp(`\\b${SPACING_PREFIX}-([0-9]+\\.5)\\b`, "g");
const numericKeyRe = new RegExp(`\\b${SPACING_PREFIX}-([0-9]+)\\b`, "g");
const inlineStylePxLiteralRe =
  /\b(?:padding(?:Top|Right|Bottom|Left)?|margin(?:Top|Right|Bottom|Left)?|gap|rowGap|columnGap)\s*:\s*['"]\d+(?:\.\d+)?px['"]/g;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(absolute));
      continue;
    }
    if (!entry.isFile() || !EXTENSIONS.has(path.extname(entry.name))) continue;
    results.push(absolute);
  }
  return results;
}

function relativePath(root, file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

function lineNumberFromIndex(content, index) {
  return content.slice(0, index).split("\n").length;
}

function signature(item) {
  return `${item.rule}\u0000${item.file}\u0000${item.snippet}`;
}

export function collectSpacingViolations(root = ROOT) {
  const violations = [];

  for (const dir of TARGET_DIRS) {
    const absoluteDir = path.join(root, dir);
    if (!fs.existsSync(absoluteDir)) continue;

    for (const file of walk(absoluteDir)) {
      const relativeFile = relativePath(root, file);
      const content = fs.readFileSync(file, "utf8");

      for (const match of content.matchAll(arbitraryPxRe)) {
        violations.push({
          file: relativeFile,
          line: lineNumberFromIndex(content, match.index ?? 0),
          rule: "no-arbitrary-px-utility",
          snippet: match[0],
        });
      }

      for (const match of content.matchAll(halfStepRe)) {
        violations.push({
          file: relativeFile,
          line: lineNumberFromIndex(content, match.index ?? 0),
          rule: "no-new-half-step-utility",
          snippet: match[0],
        });
      }

      for (const match of content.matchAll(numericKeyRe)) {
        const key = match[1];
        if (ALLOWED_SPACING_KEYS.has(key)) continue;
        violations.push({
          file: relativeFile,
          line: lineNumberFromIndex(content, match.index ?? 0),
          rule: "disallowed-spacing-key",
          snippet: match[0],
        });
      }

      for (const match of content.matchAll(inlineStylePxLiteralRe)) {
        violations.push({
          file: relativeFile,
          line: lineNumberFromIndex(content, match.index ?? 0),
          rule: "no-inline-spacing-px-literal",
          snippet: match[0],
        });
      }
    }
  }

  return violations;
}

export function buildSpacingBaseline(violations) {
  const counts = new Map();
  for (const item of violations) {
    const key = signature(item);
    const current = counts.get(key) ?? { file: item.file, rule: item.rule, snippet: item.snippet, count: 0 };
    current.count += 1;
    counts.set(key, current);
  }

  return {
    schema_version: "spacing-token-baseline.v1",
    policy: "Known spacing-token debt is count-locked by file, rule, and token. New, increased, or stale debt fails the guard.",
    violations: [...counts.values()].sort((a, b) => signature(a).localeCompare(signature(b))),
  };
}

export function validateSpacingBaseline(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    throw new Error("baseline must be an object");
  }
  if (document.schema_version !== "spacing-token-baseline.v1") {
    throw new Error("baseline schema_version must be spacing-token-baseline.v1");
  }
  if (!Array.isArray(document.violations)) {
    throw new Error("baseline violations must be an array");
  }

  const keys = [];
  for (const [index, item] of document.violations.entries()) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`baseline violations[${index}] must be an object`);
    }
    for (const field of ["file", "rule", "snippet"]) {
      if (typeof item[field] !== "string" || item[field].length === 0) {
        throw new Error(`baseline violations[${index}].${field} must be a non-empty string`);
      }
    }
    if (!Number.isInteger(item.count) || item.count < 1) {
      throw new Error(`baseline violations[${index}].count must be a positive integer`);
    }
    keys.push(signature(item));
  }

  const sortedKeys = [...keys].sort((a, b) => a.localeCompare(b));
  if (new Set(keys).size !== keys.length) {
    throw new Error("baseline violations must not contain duplicate signatures");
  }
  if (keys.some((key, index) => key !== sortedKeys[index])) {
    throw new Error("baseline violations must be sorted by rule, file, and snippet");
  }

  return document;
}

export function compareSpacingBaseline(violations, baseline) {
  const current = buildSpacingBaseline(violations).violations;
  const currentByKey = new Map(current.map((item) => [signature(item), item]));
  const baselineByKey = new Map(baseline.violations.map((item) => [signature(item), item]));
  const firstOccurrence = new Map();
  for (const item of violations) {
    const key = signature(item);
    if (!firstOccurrence.has(key)) firstOccurrence.set(key, item);
  }

  const newOrIncreased = current
    .filter((item) => item.count > (baselineByKey.get(signature(item))?.count ?? 0))
    .map((item) => ({
      ...item,
      baseline_count: baselineByKey.get(signature(item))?.count ?? 0,
      line: firstOccurrence.get(signature(item))?.line ?? null,
    }));
  const stale = baseline.violations
    .filter((item) => item.count > (currentByKey.get(signature(item))?.count ?? 0))
    .map((item) => ({
      ...item,
      current_count: currentByKey.get(signature(item))?.count ?? 0,
    }));

  return { newOrIncreased, stale };
}

function loadBaseline(root) {
  const baselinePath = path.join(root, BASELINE_RELATIVE_PATH);
  if (!fs.existsSync(baselinePath)) {
    throw new Error(`missing baseline: ${BASELINE_RELATIVE_PATH}`);
  }

  return validateSpacingBaseline(JSON.parse(fs.readFileSync(baselinePath, "utf8")));
}

function run() {
  const args = process.argv.slice(2);
  const allowedArgs = new Set(["--print-baseline"]);
  const unknownArgs = args.filter((arg) => !allowedArgs.has(arg));
  if (unknownArgs.length > 0) {
    console.error(`Unknown argument(s): ${unknownArgs.join(", ")}`);
    process.exit(2);
  }

  const violations = collectSpacingViolations(ROOT);
  if (args.includes("--print-baseline")) {
    process.stdout.write(`${JSON.stringify(buildSpacingBaseline(violations), null, 2)}\n`);
    return;
  }

  let baseline;
  try {
    baseline = loadBaseline(ROOT);
  } catch (error) {
    console.error(`Spacing token baseline invalid: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  const comparison = compareSpacingBaseline(violations, baseline);
  if (comparison.newOrIncreased.length > 0 || comparison.stale.length > 0) {
    console.error("Spacing token guard failed against the checked-in baseline:");
    for (const item of comparison.newOrIncreased) {
      console.error(
        `- [new-or-increased:${item.rule}] ${item.file}:${item.line ?? "?"} -> ${item.snippet} (current=${item.count}, baseline=${item.baseline_count})`
      );
    }
    for (const item of comparison.stale) {
      console.error(
        `- [stale-baseline:${item.rule}] ${item.file} -> ${item.snippet} (current=${item.current_count}, baseline=${item.count})`
      );
    }
    console.error("Remove the new debt or intentionally regenerate and review the baseline with --print-baseline.");
    process.exit(1);
  }

  console.log(
    `Spacing token guard passed (${violations.length} known occurrence(s), ${baseline.violations.length} locked signature(s)).`
  );
}

if (path.resolve(process.argv[1] ?? "") === path.resolve(SCRIPT_PATH)) {
  run();
}
