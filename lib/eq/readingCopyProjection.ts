import type { ReportResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import type { EqV5ReportPayload } from "@/components/result/eq/types";
import { toScaleCodeV1 } from "@/lib/scaleCodeMode";
import { EQ_READING_COPY_FIELDS } from "./readingCopyFields";

export const EQ_READING_COPY_REVISION = "eq60.reading_copy.20261030.v1";
type Row = Record<string, unknown>;
type Path = (string | number)[];
const record = (value: unknown): Row | null => value !== null && typeof value === "object" && !Array.isArray(value) ? value as Row : null;
const at = (value: unknown, path: Path): unknown => path.reduce<unknown>((current, key) => current !== null && typeof current === "object" ? (current as Row)[key] : undefined, value);
const hash = (value: unknown) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const stable = (value: unknown): string => JSON.stringify(value, (_key, child) => record(child) ? Object.fromEntries(Object.entries(child).sort(([a], [b]) => a.localeCompare(b))) : child);

function remove(target: Row, path: Path) {
  const parent = at(target, path.slice(0, -1));
  if (parent && typeof parent === "object") delete (parent as Row)[path.at(-1)!];
}

function protectedPayload(payload: EqV5ReportPayload, locale: string): Row {
  const result = structuredClone(payload) as Row;
  result.scale_code = toScaleCodeV1(String(result.scale_code));
  for (const key of ["scale_code_legacy", "scale_code_v2", "scale_uid"]) delete result[key];
  for (const slot of EQ_READING_COPY_FIELDS) {
    if (slot.locale !== "*" && slot.locale !== locale) continue;
    if (slot.route_id && at(result, ["interpretation", "route_id"]) !== slot.route_id) continue;
    if (slot.asset_path && at(result, [...slot.asset_path, "id"]) !== slot.asset_id) continue;
    if (slot.array) {
      const items = at(result, slot.array);
      if (Array.isArray(items)) items.forEach((item, index) => {
        if (record(item)?.id === slot.asset_id) remove(result, [...slot.array!, index, ...slot.tail!]);
      });
    } else if (slot.path) {
      remove(result, slot.path);
      if (slot.path.join(".") === "assets.quality_confidence.what_to_hold_lightly") remove(result, ["assets", "quality_confidence", "do_not_overread"]);
    }
  }
  if (["route.eq.balanced_integrated.primary.quality_ab", "route.eq.balanced_integrated.gap_focus.quality_ab"].includes(String(at(result, ["interpretation", "route_id"])))) {
    for (const path of MECHANISM_REFS) remove(result, path);
    remove(result, ["assets", "mechanisms"]);
  }
  return result;
}

const MECHANISM_REFS: Path[] = [["interpretation", "primary_mechanism_ids"], ["interpretation", "selected_asset_ids", "mechanism_ids"],
  ["asset_refs", "mechanism_ids"], ["asset_refs", "selected_asset_ids", "mechanism_ids"], ["assets", "personalization_route", "selected_asset_ids", "mechanism_ids"]];

export function resolveEqReadingCopy(input: ReportResponse, original: EqV5ReportPayload, locale: Locale): EqV5ReportPayload | null {
  const envelope = record(input);
  if (!envelope || !Object.hasOwn(envelope, "eq60_reading_copy_v1")) return original;
  const view = record(envelope.eq60_reading_copy_v1), reading = record(view?.report);
  const expectedLocale = locale === "zh" ? "zh-CN" : "en";
  const originalAuthority = original._meta?.eq60_private_result_authority;
  const authority = record(view?.reading_authority);
  if (!view || !reading || view.status !== "ready" || view.schema_version !== "eq60.reading_copy.v1"
    || view.revision !== EQ_READING_COPY_REVISION || view.locale !== expectedLocale
    || !originalAuthority || stable(originalAuthority) !== stable(view.original_authority)
    || authority?.schema_version !== "fap.eq60.private_result_authority.v1" || authority.authority_id !== originalAuthority.authority_id
    || authority.mode !== "canonical_active_release" || authority.pack_id !== "EQ_60" || authority.pack_version !== "v1"
    || authority.locale !== expectedLocale || typeof authority.release_id !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(authority.release_id)
    || !hash(authority.source_hash) || !hash(authority.compiled_hash)
    || !hash(view.original_report_sha256) || !hash(view.projected_report_sha256) || !Array.isArray(view.applied_keys)
    || stable(protectedPayload(original, expectedLocale)) !== stable(protectedPayload(reading as EqV5ReportPayload, expectedLocale))) return null;
  if (["route.eq.balanced_integrated.primary.quality_ab", "route.eq.balanced_integrated.gap_focus.quality_ab"].includes(String(at(reading, ["interpretation", "route_id"])))) {
    const ids = ["SA_ER_mixed", "EM_RM_mixed"];
    if (MECHANISM_REFS.some(path => stable(at(reading, path)) !== stable(ids))) return null;
    const mechanisms = at(reading, ["assets", "mechanisms"]);
    if (!Array.isArray(mechanisms) || mechanisms.length !== 2 || mechanisms.some((item, index) => {
      const mechanism = record(item);
      return !mechanism || mechanism.id !== ids[index] || mechanism.pair !== ["SA_ER", "EM_RM"][index] || mechanism.state !== "mixed";
    })) return null;
  }
  return reading as EqV5ReportPayload;
}
