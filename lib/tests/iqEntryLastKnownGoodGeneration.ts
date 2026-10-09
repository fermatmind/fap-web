import { randomBytes } from "node:crypto";
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Locale } from "@/lib/i18n/locales";

export const IQ_PUBLIC_ENTRY_SLUG = "iq-test-intelligence-quotient-assessment";
export const IQ_PUBLIC_ENTRY_PATHS = [
  `/zh/tests/${IQ_PUBLIC_ENTRY_SLUG}`,
  `/en/tests/${IQ_PUBLIC_ENTRY_SLUG}`,
];

function generationPath(locale: Locale): string {
  const directory = process.env.FERMATMIND_TEST_LANDING_LKG_DIR
    || path.join(tmpdir(), "fermatmind-test-landing-lkg");
  return path.join(directory, `iq-entry-lkg-generation.${locale}.v1`);
}

/** Read the shared pointer on every request, including another PM2 worker. */
export async function readIqEntryLkgGeneration(locale: Locale): Promise<string> {
  let token: string;
  try {
    token = (await readFile(generationPath(locale), "utf8")).trim();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return "baseline";
    throw error;
  }
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error("IQ_ENTRY_LKG_GENERATION_INVALID");
  return token;
}

/** Rotate only the two IQ keys; old and late writes stay in their old generation. */
export async function invalidateIqEntryLkgGenerations(): Promise<void> {
  for (const locale of ["zh", "en"] as const) {
    const target = generationPath(locale);
    await mkdir(path.dirname(target), { recursive: true });
    const directory = await mkdtemp(path.join(path.dirname(target), ".iq-entry-lkg-"));
    try {
      const candidate = path.join(directory, "generation");
      await writeFile(candidate, `${randomBytes(32).toString("hex")}\n`, { flag: "wx", mode: 0o600 });
      await rename(candidate, target);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
}
