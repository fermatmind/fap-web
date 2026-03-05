import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CAREER_ROOT = path.join(ROOT, "content", "career");
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type ValidationResult = {
  errors: string[];
  warnings: string[];
};

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  const stack = [dir];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && fullPath.endsWith(".mdx")) {
        out.push(fullPath);
      }
    }
  }

  return out.sort((a, b) => a.localeCompare(b));
}

function readFrontmatter(content: string): string {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : "";
}

function hasKey(frontmatter: string, key: string): boolean {
  const re = new RegExp(`^${key}:`, "m");
  return re.test(frontmatter);
}

function getKeyValue(frontmatter: string, key: string): string {
  const re = new RegExp(`^${key}:\\s*(.+)$`, "m");
  const match = frontmatter.match(re);
  if (!match) return "";
  return match[1].trim().replace(/^"|"$/g, "");
}

function validatePairing(
  files: string[],
  expectedUnique: number,
  result: ValidationResult,
  label: string
): Set<string> {
  const keySet = new Set<string>();

  for (const file of files) {
    const locale = path.basename(file, ".mdx");
    if (locale !== "en" && locale !== "zh") {
      result.errors.push(`${label}: invalid locale filename ${file}`);
      continue;
    }

    const key = path.dirname(file);
    keySet.add(key);
  }

  if (keySet.size !== expectedUnique) {
    result.errors.push(`${label}: expected ${expectedUnique} unique entries, found ${keySet.size}`);
  }

  for (const key of keySet) {
    const enPath = path.join(key, "en.mdx");
    const zhPath = path.join(key, "zh.mdx");
    if (!fs.existsSync(enPath) || !fs.existsSync(zhPath)) {
      result.errors.push(`${label}: missing bilingual pair under ${key}`);
    }
  }

  return keySet;
}

function validateFiles(
  files: string[],
  requiredKeys: string[],
  result: ValidationResult,
  label: string
) {
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const frontmatter = readFrontmatter(raw);

    if (!frontmatter) {
      result.errors.push(`${label}: missing frontmatter in ${file}`);
      continue;
    }

    for (const key of requiredKeys) {
      if (!hasKey(frontmatter, key)) {
        result.errors.push(`${label}: missing key '${key}' in ${file}`);
      }
    }

    if (hasKey(frontmatter, "updatedAt")) {
      const updatedAt = getKeyValue(frontmatter, "updatedAt");
      if (!DATE_RE.test(updatedAt)) {
        result.errors.push(`${label}: invalid updatedAt format in ${file} -> ${updatedAt}`);
      }
    }

    if (hasKey(frontmatter, "publishedAt")) {
      const publishedAt = getKeyValue(frontmatter, "publishedAt");
      if (!DATE_RE.test(publishedAt)) {
        result.errors.push(`${label}: invalid publishedAt format in ${file} -> ${publishedAt}`);
      }
    }
  }
}

function validateUniqueSlugs(files: string[], result: ValidationResult, label: string) {
  const seen = new Set<string>();
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const frontmatter = readFrontmatter(raw);
    const slug = getKeyValue(frontmatter, "slug");
    if (!slug) continue;

    const key = `${slug}::${path.basename(file, ".mdx")}`;
    if (seen.has(key)) {
      result.errors.push(`${label}: duplicate slug/locale ${key}`);
      continue;
    }
    seen.add(key);
  }
}

function validate() {
  const result: ValidationResult = {
    errors: [],
    warnings: [],
  };

  const jobsDir = path.join(CAREER_ROOT, "jobs");
  const industriesDir = path.join(CAREER_ROOT, "industries");
  const guidesDir = path.join(CAREER_ROOT, "guides");
  const mbtiDir = path.join(CAREER_ROOT, "recommendations", "mbti");
  const big5Dir = path.join(CAREER_ROOT, "recommendations", "big5");

  const jobFiles = listFiles(jobsDir);
  const industryFiles = listFiles(industriesDir);
  const guideFiles = listFiles(guidesDir);
  const mbtiFiles = listFiles(mbtiDir);
  const big5Files = listFiles(big5Dir);

  validatePairing(jobFiles, 30, result, "jobs");
  validatePairing(industryFiles, 12, result, "industries");
  validatePairing(guideFiles, 20, result, "guides");
  validatePairing(mbtiFiles, 16, result, "mbti recommendations");
  validatePairing(big5Files, 15, result, "big5 recommendations");

  validateFiles(
    jobFiles,
    [
      "slug",
      "locale",
      "title",
      "summary",
      "industry_slug",
      "salary_range",
      "job_outlook",
      "skills",
      "work_contents",
      "growth_path",
      "fit_personality",
      "mbti_primary",
      "mbti_secondary",
      "riasec_vector",
      "big5_targets",
      "iq_range",
      "eq_range",
      "market_demand",
      "updatedAt",
    ],
    result,
    "jobs"
  );

  validateFiles(
    industryFiles,
    [
      "slug",
      "locale",
      "title",
      "summary",
      "overview",
      "hot_jobs",
      "salary_overview",
      "growth_outlook",
      "trends",
      "updatedAt",
    ],
    result,
    "industries"
  );

  validateFiles(
    guideFiles,
    ["slug", "locale", "title", "summary", "category", "publishedAt", "updatedAt"],
    result,
    "guides"
  );

  validateFiles(
    [...mbtiFiles, ...big5Files],
    [
      "locale",
      "profile_type",
      "key",
      "title",
      "summary",
      "recommended_jobs",
      "work_env",
      "strengths",
      "risks",
      "updatedAt",
    ],
    result,
    "recommendations"
  );

  validateUniqueSlugs(jobFiles, result, "jobs");
  validateUniqueSlugs(industryFiles, result, "industries");
  validateUniqueSlugs(guideFiles, result, "guides");

  if (result.errors.length > 0) {
    console.error("Career content validation failed:\n");
    for (const err of result.errors) {
      console.error(`- ${err}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Career content validation passed.");
  console.log(`Jobs: ${jobFiles.length} files`);
  console.log(`Industries: ${industryFiles.length} files`);
  console.log(`Guides: ${guideFiles.length} files`);
  console.log(`MBTI recommendations: ${mbtiFiles.length} files`);
  console.log(`Big5 recommendations: ${big5Files.length} files`);
}

validate();
