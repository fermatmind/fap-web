import { Temporal } from "@js-temporal/polyfill";

export type NatalTimeChoice = { occurrence: "earlier" | "later"; utc: string; offset: string; future: boolean };
export type NatalTimeResult =
  | { status: "resolved"; utc: string; epochMilliseconds: number; offset: string; before1970: boolean }
  | { status: "choose-time"; choices: NatalTimeChoice[] }
  | { status: "invalid"; reason: "known-time" | "date" | "time" | "zone" | "gap" | "occurrence" | "range" | "future" | "clock" };

/** Resolve the supplied civil minute. Never infer a zone or silently disambiguate a fold. */
export function resolveNatalTime(input: { date: unknown; time: unknown; zone: unknown; knownTime: unknown; occurrence?: unknown }, now: unknown): NatalTimeResult {
  if (input.knownTime !== true) return { status: "invalid", reason: "known-time" };
  if (typeof now !== "number" || !Number.isSafeInteger(now)) return { status: "invalid", reason: "clock" };
  if (typeof input.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { status: "invalid", reason: "date" };
  if (typeof input.time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) return { status: "invalid", reason: "time" };
  if (typeof input.zone !== "string" || input.zone.length > 128 || (input.zone !== "UTC"
    && !/^[A-Za-z][A-Za-z0-9._+-]*(?:\/[A-Za-z0-9._+-]+)+$/.test(input.zone))) return { status: "invalid", reason: "zone" };
  if (input.occurrence !== undefined && input.occurrence !== "" && input.occurrence !== "earlier" && input.occurrence !== "later") return { status: "invalid", reason: "occurrence" };
  let local: Temporal.PlainDateTime;
  let current: Temporal.Instant;
  try {
    local = Temporal.PlainDateTime.from(`${input.date}T${input.time}`, { overflow: "reject" });
    current = Temporal.Instant.fromEpochMilliseconds(now);
  } catch { return { status: "invalid", reason: "date" }; }
  if (local.year < 1900) return { status: "invalid", reason: "range" };
  const choices: (NatalTimeChoice & { epochMilliseconds: number })[] = [];
  try {
    for (const occurrence of ["earlier", "later"] as const) {
      const zoned = local.toZonedDateTime(input.zone, { disambiguation: occurrence });
      if (!zoned.toPlainDateTime().equals(local)) continue;
      const instant = zoned.toInstant(), utc = instant.toString();
      if (!choices.some(choice => choice.utc === utc)) choices.push({ occurrence, utc, offset: zoned.offset,
        future: Temporal.Instant.compare(instant, current) > 0, epochMilliseconds: instant.epochMilliseconds });
    }
  } catch { return { status: "invalid", reason: "zone" }; }
  if (!choices.length) return { status: "invalid", reason: "gap" };
  if (choices.length === 2 && !input.occurrence) return { status: "choose-time", choices: choices.map(({ occurrence, utc, offset, future }) => ({ occurrence, utc, offset, future })) };
  const selected = choices.length === 1 ? choices[0] : choices.find(choice => choice.occurrence === input.occurrence);
  if (!selected) return { status: "invalid", reason: "occurrence" };
  if (selected.future) return { status: "invalid", reason: "future" };
  if (Temporal.Instant.compare(Temporal.Instant.from(selected.utc), Temporal.Instant.from("1899-12-31T00:00:00Z")) < 0) return { status: "invalid", reason: "range" };
  return { status: "resolved", utc: selected.utc, epochMilliseconds: selected.epochMilliseconds, offset: selected.offset,
    before1970: local.year < 1970 || selected.epochMilliseconds < 0 };
}

/** Only explicit decimal text; no coercion of blank values, units or nonfinite numbers. */
export function readNatalGeography(latitude: unknown, longitude: unknown, confirmed: unknown): { latitude: number; longitude: number } | null {
  const decimal = (value: unknown): number | null => typeof value === "string" && value.length <= 24
    && /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value) && Number.isFinite(Number(value)) ? Number(value) : null;
  const lat = decimal(latitude), lon = decimal(longitude);
  if (confirmed !== true || lat === null || lon === null || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { latitude: lat === 0 ? 0 : lat, longitude: lon === 0 ? 0 : lon };
}
