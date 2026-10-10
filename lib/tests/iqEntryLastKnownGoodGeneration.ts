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

export const EQ_PUBLIC_ENTRY_SLUG = "eq-test-emotional-intelligence-assessment";
export const EQ_EXISTING_PUBLIC_PATHS = [
  `/zh/tests/${EQ_PUBLIC_ENTRY_SLUG}`,
  `/en/tests/${EQ_PUBLIC_ENTRY_SLUG}`,
  "/zh/articles/eq-test-tool-guide",
  "/en/articles/eq-test-tool-guide",
  "/zh/career/guides/iq-eq-balance-at-work",
  "/en/career/guides/iq-eq-balance-at-work",
];

function generationPath(locale: Locale, scale: "iq" | "eq"): string {
  const directory = process.env.FERMATMIND_TEST_LANDING_LKG_DIR
    || path.join(tmpdir(), "fermatmind-test-landing-lkg");
  return path.join(directory, `${scale}-entry-lkg-generation.${locale}.v1`);
}

/** Read the shared pointer on every request, including another PM2 worker. */
async function readEntryLkgGeneration(locale: Locale, scale: "iq" | "eq"): Promise<string> {
  let token: string;
  try {
    token = (await readFile(generationPath(locale, scale), "utf8")).trim();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return "baseline";
    throw error;
  }
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error(`${scale.toUpperCase()}_ENTRY_LKG_GENERATION_INVALID`);
  return token;
}

/** Rotate only the selected two entry keys; old and late writes stay in their old generation. */
async function invalidateEntryLkgGenerations(scale: "iq" | "eq"): Promise<void> {
  for (const locale of ["zh", "en"] as const) {
    const target = generationPath(locale, scale);
    await mkdir(path.dirname(target), { recursive: true });
    const directory = await mkdtemp(path.join(path.dirname(target), `.${scale}-entry-lkg-`));
    try {
      const candidate = path.join(directory, "generation");
      await writeFile(candidate, `${randomBytes(32).toString("hex")}\n`, { flag: "wx", mode: 0o600 });
      await rename(candidate, target);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
}

export async function readIqEntryLkgGeneration(locale: Locale): Promise<string> {
  return readEntryLkgGeneration(locale, "iq");
}

export async function invalidateIqEntryLkgGenerations(): Promise<void> {
  return invalidateEntryLkgGenerations("iq");
}

export async function readEqEntryLkgGeneration(locale: Locale): Promise<string> {
  return readEntryLkgGeneration(locale, "eq");
}

export async function invalidateEqEntryLkgGenerations(): Promise<void> {
  return invalidateEntryLkgGenerations("eq");
}
