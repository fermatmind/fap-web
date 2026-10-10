import { closeSync, constants, fstatSync, lstatSync, openSync, readFileSync } from "node:fs";
import path from "node:path";

const KEYS = ["CONTENT_RELEASE_REVALIDATE_SECRET", "CONTENT_RELEASE_REVALIDATE_REDIS_URL", "CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN"] as const;
export type ContentReleaseRuntime = Record<(typeof KEYS)[number], string>;

function readPrivate(file: string): string {
  const fd = openSync(file, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.uid !== process.getuid?.() || stat.size > 32768 || (stat.mode & 0o077) !== 0) throw new Error("REVALIDATION_CONFIG_REJECTED");
    return readFileSync(fd, "utf8");
  } finally { closeSync(fd); }
}

export function resolveContentReleaseRuntime(directory = process.cwd(), environment: Record<string, string | undefined> = process.env): ContentReleaseRuntime {
  const file = path.join(directory, ".content-release-runtime.json");
  let deployed = false;
  try {
    const revisionFile = path.join(directory, "REVISION");
    const stat = lstatSync(revisionFile);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== process.getuid?.() || (stat.mode & 0o022) !== 0 || stat.size > 128 || !/^[a-f0-9]{40}$/.test(readFileSync(revisionFile, "utf8").trim())) throw new Error("REVALIDATION_CONFIG_REJECTED");
    const root = lstatSync(directory);
    if (!root.isDirectory() || root.isSymbolicLink() || root.uid !== process.getuid?.() || (root.mode & 0o022) !== 0) throw new Error("REVALIDATION_CONFIG_REJECTED");
    deployed = true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw new Error("REVALIDATION_CONFIG_REJECTED");
  }
  let source: unknown;
  try { source = JSON.parse(readPrivate(file)); } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw new Error("REVALIDATION_CONFIG_REJECTED");
    // Legacy releases must not inherit credentials from a different active release.
    return Object.fromEntries(KEYS.map(key => [key, deployed ? "" : environment[key] ?? ""])) as ContentReleaseRuntime;
  }
  if (!source || typeof source !== "object" || Array.isArray(source) || Object.keys(source).sort().join(",") !== [...KEYS].sort().join(",")) throw new Error("REVALIDATION_CONFIG_REJECTED");
  const values = source as ContentReleaseRuntime;
  for (const key of KEYS) {
    if (typeof values[key] !== "string" || !values[key] || values[key].length > 8192 || values[key] !== values[key].trim() || /[\x00-\x1f\x7f]/.test(values[key])) throw new Error("REVALIDATION_CONFIG_REJECTED");
  }
  if (values.CONTENT_RELEASE_REVALIDATE_SECRET.length < 24) throw new Error("REVALIDATION_CONFIG_REJECTED");
  return values;
}
