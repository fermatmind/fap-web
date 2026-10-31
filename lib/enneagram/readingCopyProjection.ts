import type { ReportResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { parseEnneagramPrivateResultAuthority, resolveEnneagramPrivateResultAuthority } from "./privateResultAuthority";

export const ENNEAGRAM_READING_COPY_REVISION = "enneagram.reading_copy.20261030.v1";
export type EnneagramReadingCopy = { revision: string; sourceHash: string; compiledHash: string };
type Row = Record<string, unknown>;
const record = (value: unknown): Row | null => value && typeof value === "object" && !Array.isArray(value) ? value as Row : null;
const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const hash = (value: unknown) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);

/** Remove only copy surfaces; all measurement, provenance, access and structural facts remain comparable. */
function protectedReport(input: Row): Row {
  const value = structuredClone(input);
  const protectActions = (actions: unknown) => {
    for (const item of Array.isArray(actions) ? actions : []) {
      const action = record(item);
      if (action) delete action.instruction;
    }
  };
  for (const item of Array.isArray(value.candidates) ? value.candidates : []) {
    const candidate = record(item);
    if (!candidate) continue;
    protectActions(candidate.growth_actions);
    for (const child of Array.isArray(candidate.sections) ? candidate.sections : []) {
      const section = record(child);
      if (!section) continue;
      for (const key of ["title", "lead", "paragraphs", "points", "reflection_question"]) delete section[key];
      for (const item of Array.isArray(section.levels) ? section.levels : []) {
        const level = record(item);
        if (level) delete level.title;
      }
    }
  }
  const protectModules = (modules: unknown) => {
    for (const item of Array.isArray(modules) ? modules : []) {
      const reportModule = record(item), content = record(reportModule?.content);
      if (!reportModule || !content) continue;
      if (reportModule.module_key === "growth_actions") {
        for (const item of Array.isArray(content.candidates) ? content.candidates : []) {
          protectActions(record(item)?.actions);
        }
      }
      if (reportModule.module_key === "result_overview") delete content.body;
      if (reportModule.module_key === "candidate_pair_comparison") {
        for (const item of Array.isArray(content.dimensions) ? content.dimensions : []) {
          const dimension = record(item);
          if (!dimension || !["core_motivation", "core_concern"].includes(String(dimension.dimension_key))) continue;
          for (const item of Array.isArray(dimension.sides) ? dimension.sides : []) {
            const side = record(item);
            if (side) delete side.copy;
          }
        }
      }
    }
  };
  protectModules(value.modules);
  for (const item of Array.isArray(value.pages) ? value.pages : []) protectModules(record(item)?.modules);
  return value;
}

export function resolveEnneagramReadingReport(input: ReportResponse, locale: Locale): Row | null {
  const envelope = record(input);
  const meta = record(input.report?._meta);
  const original = record(input.enneagram_report_v2) ?? record(meta?.enneagram_report_v2);
  if (!envelope || !Object.hasOwn(envelope, "enneagram_reading_copy_v1")) return original;
  const view = record(envelope.enneagram_reading_copy_v1), reading = record(view?.report_v2);
  const authority = resolveEnneagramPrivateResultAuthority(input, locale);
  const originalAuthority = parseEnneagramPrivateResultAuthority(view?.original_authority, locale);
  const readingAuthority = parseEnneagramPrivateResultAuthority(view?.reading_authority, locale);
  if (!view || view.status !== "ready" || view.schema_version !== "enneagram.reading_copy.v1"
    || view.revision !== ENNEAGRAM_READING_COPY_REVISION || view.locale !== (locale === "zh" ? "zh-CN" : "en")
    || !original || !reading || authority?.mode !== "canonical" || !same(authority, originalAuthority)
    || readingAuthority?.mode !== "canonical" || !hash(view.original_report_v2_sha256) || !hash(view.reading_report_v2_sha256)
    || !Array.isArray(view.applied_keys) || !view.applied_keys.length
    || !same(protectedReport(original), protectedReport(reading))) return null;
  return reading;
}

export function enneagramReadingCopyMetadata(input: ReportResponse, locale: Locale): EnneagramReadingCopy | undefined {
  if (!resolveEnneagramReadingReport(input, locale)) return;
  const view = record(record(input)?.enneagram_reading_copy_v1);
  const authority = parseEnneagramPrivateResultAuthority(view?.reading_authority, locale);
  return view?.status === "ready" && authority?.mode === "canonical"
    ? { revision: ENNEAGRAM_READING_COPY_REVISION, sourceHash: authority.sourceHash, compiledHash: authority.compiledHash } : undefined;
}
