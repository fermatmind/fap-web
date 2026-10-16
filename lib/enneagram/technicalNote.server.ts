import { cache } from "react";
import { buildApiUrl } from "@/lib/api-base";
import type { EnneagramTechnicalNoteResponse, EnneagramTechnicalNoteV1 } from "@/lib/api/v0_3";
import { isCanonicalEnneagramTechnicalNote } from "@/lib/enneagram/technicalNote";
import type { Locale } from "@/lib/i18n/locales";

// Request memoization shares one authoritative read between metadata and body.
// No editorial fallback or client-side second request may replace this result.
export const getPublicEnneagramTechnicalNote = cache(async (locale: Locale): Promise<EnneagramTechnicalNoteV1 | null> => {
  try {
    const response = await fetch(buildApiUrl(`/v0.3/scales/ENNEAGRAM/technical-note?locale=${locale === "zh" ? "zh-CN" : "en"}`), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;
    const payload = await response.json() as EnneagramTechnicalNoteResponse;
    const note = payload.technical_note_v1;
    if (payload.ok !== true || !isCanonicalEnneagramTechnicalNote(note, locale)
      || !note || !Array.isArray(note.sections) || note.sections.length === 0
      || !note.sections.every((section) => section && typeof section.title === "string" && typeof section.body === "string")) return null;
    return note;
  } catch {
    return null;
  }
});
