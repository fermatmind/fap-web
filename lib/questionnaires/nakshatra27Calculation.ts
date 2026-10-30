import { Ecliptic, GeoMoon, MakeTime, Vector } from "astronomy-engine";
import { classifyNakshatraLongitude, NAKSHATRA_SPICA_J2000, type NakshatraSector } from "./nakshatra27";
import { resolveNatalTime, type NatalTimeResult } from "./natalChartTime";

export type NakshatraInput = { date: unknown; time: unknown; zone: unknown; knownTime: unknown; placeConfirmed: unknown; occurrence?: unknown };
export type NakshatraReadout = NakshatraSector & { utc: string; offset: string; zone: string; before1970: boolean; moonLongitude: number; spicaLongitude: number; ayanamsa: number; referenceLongitude: number };
export type NakshatraResult = Exclude<NatalTimeResult, { status: "resolved" }> | { status: "invalid"; reason: "input" | "place" } | { status: "unavailable" } | { status: "complete"; reading: NakshatraReadout };
const wrap = (value: number) => ((value % 360) + 360) % 360;

/** Fixed FK5 J2000 catalogue direction. No proper motion, aberration or parallax is modeled. */
export function spicaReferenceLongitude(instant: Date): number {
  const time = MakeTime(instant), ra = NAKSHATRA_SPICA_J2000.raHours * Math.PI / 12, dec = NAKSHATRA_SPICA_J2000.decDegrees * Math.PI / 180;
  return Ecliptic(new Vector(Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec), time)).elon;
}

/** Geocentric Moon and fixed catalogue reference use the same true ecliptic-of-date transformation. */
export function calculateNakshatra(input: unknown, now: number): NakshatraResult {
  if (input === null || typeof input !== "object" || ![Object.prototype, null].includes(Object.getPrototypeOf(input))) return { status: "invalid", reason: "input" };
  const values = input as NakshatraInput, time = resolveNatalTime(values, now);
  if (time.status !== "resolved") return time;
  if (values.placeConfirmed !== true) return { status: "invalid", reason: "place" };
  try {
    const instant = new Date(time.epochMilliseconds), moonLongitude = Ecliptic(GeoMoon(instant)).elon, spicaLongitude = spicaReferenceLongitude(instant);
    if (![moonLongitude, spicaLongitude].every(Number.isFinite)) return { status: "unavailable" };
    const referenceLongitude = wrap(moonLongitude - spicaLongitude + 180), sector = classifyNakshatraLongitude(referenceLongitude);
    if (!sector) return { status: "unavailable" };
    return { status: "complete", reading: { ...sector, utc: time.utc, offset: time.offset, zone: values.zone as string, before1970: time.before1970,
      moonLongitude, spicaLongitude, ayanamsa: wrap(spicaLongitude - 180), referenceLongitude } };
  } catch { return { status: "unavailable" }; }
}
