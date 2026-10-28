import * as Astronomy from "astronomy-engine";
import { NATAL_BODIES, readNatalCoordinate, type NatalBody } from "./natalChartCoordinates";

// A disclosed numerical label convention, not a calibrated station/precision bound.
export const NATAL_STATION_TOLERANCE_DEGREES_PER_DAY = 0.0001;
export type NatalMotionClass = "direct" | "retrograde" | "near-stationary";
export type NatalMotion = { status: "unavailable" }
  | { status: "computed"; motion: NatalMotionClass; speedDegreesPerDay: number; comparisonSpeedDegreesPerDay: number };
export type NatalMotionReadout = Record<NatalBody, NatalMotion>;

export function natalLongitudeRate(before: unknown, after: unknown, elapsedDays: unknown): number | null {
  const a = readNatalCoordinate(before), b = readNatalCoordinate(after);
  if (!a || !b || typeof elapsedDays !== "number" || !Number.isFinite(elapsedDays) || elapsedDays <= 0) return null;
  let difference = b.longitude - a.longitude;
  if (difference > 180) difference -= 360;
  else if (difference < -180) difference += 360;
  const speed = difference / elapsedDays;
  return Number.isFinite(speed) ? speed : null;
}

export function classifyNatalMotionRates(speed60: unknown, speed30: unknown): NatalMotion {
  if (typeof speed60 !== "number" || !Number.isFinite(speed60) || typeof speed30 !== "number" || !Number.isFinite(speed30)) return { status: "unavailable" };
  const classify = (speed: number): NatalMotionClass => Math.abs(speed) <= NATAL_STATION_TOLERANCE_DEGREES_PER_DAY
    ? "near-stationary" : speed < 0 ? "retrograde" : "direct";
  const motion = classify(speed30);
  return classify(speed60) === motion
    ? { status: "computed", motion, speedDegreesPerDay: speed30, comparisonSpeedDegreesPerDay: speed60 }
    : { status: "unavailable" };
}

const bodyMap = {
  sun: Astronomy.Body.Sun, moon: Astronomy.Body.Moon, mercury: Astronomy.Body.Mercury, venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars, jupiter: Astronomy.Body.Jupiter, saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus, neptune: Astronomy.Body.Neptune, pluto: Astronomy.Body.Pluto,
} as const;

/** Call only after the existing civil-time/range/future gates. Neighbors are internal +/-60s, never new birth inputs. */
export function calculateNatalMotion(epochMilliseconds: unknown): NatalMotionReadout {
  const valid = typeof epochMilliseconds === "number" && Number.isSafeInteger(epochMilliseconds)
    && Math.abs(epochMilliseconds) <= 8640000000000000 - 60000;
  const results = {} as NatalMotionReadout;
  for (const body of NATAL_BODIES) {
    results[body] = { status: "unavailable" };
    if (!valid) continue;
    try {
      const longitude = (offset: number) => Astronomy.Ecliptic(Astronomy.GeoVector(bodyMap[body], new Date(epochMilliseconds + offset), true)).elon;
      const speed60 = natalLongitudeRate(longitude(-60000), longitude(60000), 120000 / 86400000);
      const speed30 = natalLongitudeRate(longitude(-30000), longitude(30000), 60000 / 86400000);
      results[body] = classifyNatalMotionRates(speed60, speed30);
    } catch { /* A failure with one body must not erase other motion labels or any placement. */ }
  }
  return results;
}
