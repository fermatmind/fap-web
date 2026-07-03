import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SPREADSHEET_FORMULA_PREFIX = /^[=+\-@\t\r]/;

function normalizeRoot(rootDir) {
  return path.resolve(rootDir);
}

export function assertPathInside(rootDir, targetPath, label = "path") {
  const root = normalizeRoot(rootDir);
  const resolved = path.resolve(targetPath);
  const relative = path.relative(root, resolved);
  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    return resolved;
  }
  throw new Error(`${label} must stay inside ${root}: ${targetPath}`);
}

export function resolveRepoPath(rootDir, candidatePath, label = "path") {
  if (!candidatePath || typeof candidatePath !== "string") {
    throw new Error(`${label} is required`);
  }
  const resolved = path.isAbsolute(candidatePath)
    ? path.resolve(candidatePath)
    : path.resolve(rootDir, candidatePath);
  return assertPathInside(rootDir, resolved, label);
}

export function resolveOutputDir(rootDir, candidatePath, label = "output directory") {
  if (!candidatePath || typeof candidatePath !== "string") {
    throw new Error(`${label} is required`);
  }
  const resolved = path.isAbsolute(candidatePath)
    ? path.resolve(candidatePath)
    : path.resolve(rootDir, candidatePath);
  const allowedRoots = [normalizeRoot(rootDir), normalizeRoot(os.tmpdir())];
  if (allowedRoots.some((allowedRoot) => {
    const relative = path.relative(allowedRoot, resolved);
    return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
  })) {
    return resolved;
  }
  throw new Error(`${label} must stay inside the repository or OS temp directory: ${candidatePath}`);
}

export function resolveOutputPath(rootDir, candidatePath, label = "output path") {
  if (!candidatePath || typeof candidatePath !== "string") {
    throw new Error(`${label} is required`);
  }
  const resolved = path.isAbsolute(candidatePath)
    ? path.resolve(candidatePath)
    : path.resolve(rootDir, candidatePath);
  resolveOutputDir(rootDir, path.dirname(resolved), `${label} directory`);
  return resolved;
}

export function sanitizeDateSlug(value, label = "date") {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error(`${label} must use YYYY-MM-DD and cannot contain path separators`);
  }
  return text;
}

export function csvEscape(value) {
  const text = String(value ?? "");
  const safeText = SPREADSHEET_FORMULA_PREFIX.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

export function writeJsonFile(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function writeTextFile(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value.endsWith("\n") ? value : `${value}\n`);
}
