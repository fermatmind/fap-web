#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = ["app", "components", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"]);
const SPACING_PREFIX =
  "(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-x|space-y)";
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

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(absolute));
      continue;
    }
    if (!entry.isFile()) continue;
    if (!EXTENSIONS.has(path.extname(entry.name))) continue;
    results.push(absolute);
  }
  return results;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

function lineNumberFromIndex(content, index) {
  return content.slice(0, index).split("\n").length;
}

const arbitraryPxRe = new RegExp(`\\b${SPACING_PREFIX}-\\[[^\\]]*\\d+(?:\\.\\d+)?px[^\\]]*\\]`, "g");
const halfStepRe = new RegExp(`\\b${SPACING_PREFIX}-([0-9]+\\.5)\\b`, "g");
const numericKeyRe = new RegExp(`\\b${SPACING_PREFIX}-([0-9]+)\\b`, "g");
const inlineStylePxLiteralRe =
  /\b(?:padding(?:Top|Right|Bottom|Left)?|margin(?:Top|Right|Bottom|Left)?|gap|rowGap|columnGap)\s*:\s*['"]\d+(?:\.\d+)?px['"]/g;

const violations = [];

for (const dir of TARGET_DIRS) {
  const absoluteDir = path.join(ROOT, dir);
  if (!fs.existsSync(absoluteDir)) continue;
  const files = walk(absoluteDir);

  for (const file of files) {
    const relativeFile = rel(file);
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
      const token = match[0];
      violations.push({
        file: relativeFile,
        line: lineNumberFromIndex(content, match.index ?? 0),
        rule: "no-new-half-step-utility",
        snippet: token,
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

if (violations.length > 0) {
  console.error("Spacing token guard failed:");
  for (const item of violations) {
    console.error(`- [${item.rule}] ${item.file}:${item.line} -> ${item.snippet}`);
  }
  process.exit(1);
}

console.log("Spacing token guard passed.");
