import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function buildReportOutputDir(envValue: string | undefined, prefix: string): string {
  const configured = envValue?.trim();
  if (configured) {
    return path.resolve(configured);
  }

  return fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}_`));
}

export function writeReportFile(outputDir: string, filename: string, content: string, encoding?: BufferEncoding): void {
  if (filename !== path.basename(filename) || filename.includes("\0")) {
    throw new Error(`Unsafe report filename: ${filename}`);
  }

  const resolvedDir = path.resolve(outputDir);
  const resolvedFile = path.resolve(resolvedDir, filename);
  const relativeFile = path.relative(resolvedDir, resolvedFile);

  if (relativeFile.startsWith("..") || path.isAbsolute(relativeFile)) {
    throw new Error(`Report path escapes output dir: ${filename}`);
  }

  fs.mkdirSync(resolvedDir, { recursive: true });
  fs.writeFileSync(resolvedFile, content, encoding ?? "utf8");
}
