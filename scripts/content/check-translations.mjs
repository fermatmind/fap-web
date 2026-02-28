import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const blogJsonPath = path.resolve(ROOT_DIR, ".velite/blog.json");
const DEFAULT_REQUIRED_GROUPS = [
  "mbti-basics",
  "mbti-growth-guide",
  "mbti-narrative-portrait",
  "big-five-tool-guide",
  "big-five-growth-guide",
  "big-five-narrative-portrait",
  "clinical-depression-anxiety-pro-tool-guide",
  "clinical-depression-anxiety-pro-growth-guide",
  "clinical-depression-anxiety-pro-narrative-portrait",
  "depression-screening-standard-tool-guide",
  "depression-screening-standard-growth-guide",
  "depression-screening-standard-narrative-portrait",
  "iq-test-tool-guide",
  "iq-test-growth-guide",
  "iq-test-narrative-portrait",
  "eq-test-tool-guide",
  "eq-test-growth-guide",
  "eq-test-narrative-portrait",
];

if (!fs.existsSync(blogJsonPath)) {
  console.error(`[content] missing compiled blog data: ${blogJsonPath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(blogJsonPath, "utf8"));
const configured = String(process.env.REQUIRED_EN_TRANSLATION_GROUPS || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const requiredGroups = configured.length > 0 ? configured : DEFAULT_REQUIRED_GROUPS;

const groups = new Map();
for (const item of data) {
  const group = String(item?.translation_group || item?.slug || "").trim();
  if (!group) continue;
  const locale = String(item?.locale || "zh").toLowerCase() === "en" ? "en" : "zh";
  const entry = groups.get(group) || { zh: null, en: null };
  if (locale === "zh") {
    entry.zh = item;
  } else {
    entry.en = item;
  }
  groups.set(group, entry);
}

const errors = [];
for (const group of requiredGroups) {
  const entry = groups.get(group);
  if (!entry?.zh) {
    errors.push(`[${group}] missing zh source`);
    continue;
  }
  if (!entry?.en) {
    errors.push(`[${group}] missing en translation`);
    continue;
  }
  if (entry.en.translation_ready !== true) {
    errors.push(`[${group}] en translation exists but translation_ready !== true`);
  }
}

if (errors.length > 0) {
  console.error("[content] translation check failed");
  for (const err of errors) {
    console.error(`- ${err}`);
  }
  process.exit(1);
}

console.log(`[content] translation check passed for ${requiredGroups.length} required group(s).`);
