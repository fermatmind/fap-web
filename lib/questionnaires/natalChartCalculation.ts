import * as Astronomy from "astronomy-engine";
import { NATAL_BODIES, natalInventory, natalWholeSignHouse, readNatalCoordinate, type NatalBody, type NatalCoordinate } from "./natalChartCoordinates";
import { readNatalGeography, resolveNatalTime, type NatalTimeResult } from "./natalChartTime";
import { calculateNatalMotion, type NatalMotionReadout } from "./natalChartMotion";

export type NatalChartInput = { date: string; time: string; zone: string; latitude: string; longitude: string; knownTime: boolean; coordinatesConfirmed: boolean; occurrence?: "" | "earlier" | "later" };
export type NatalAscendant = { status: "computed"; coordinate: NatalCoordinate }
  | { status: "unavailable"; reason: "pole" | "plane" | "geometry" };
export type NatalChartReadout = {
  utc: string; offset: string; before1970: boolean;
  placements: { body: NatalBody; coordinate: NatalCoordinate; house: number | null }[];
  ascendant: NatalAscendant;
  motion: NatalMotionReadout;
  inventory: NonNullable<ReturnType<typeof natalInventory>>;
};
export type NatalChartResult = Exclude<NatalTimeResult, { status: "resolved" }>
  | { status: "invalid"; reason: "geography" | "input" }
  | { status: "unavailable"; reason: "ephemeris" }
  | { status: "complete"; chart: NatalChartReadout };

const bodyMap = {
  sun: Astronomy.Body.Sun, moon: Astronomy.Body.Moon, mercury: Astronomy.Body.Mercury, venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars, jupiter: Astronomy.Body.Jupiter, saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus, neptune: Astronomy.Body.Neptune, pluto: Astronomy.Body.Pluto,
} as const;

/** Ecliptic-of-date → true equator-of-date → horizon, selecting the eastern root. */
export function calculateNatalAscendant(epochMilliseconds: number, latitude: number, longitude: number): NatalAscendant {
  if (![epochMilliseconds, latitude, longitude].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return { status: "unavailable", reason: "geometry" };
  if (Math.abs(Math.cos(latitude * Math.PI / 180)) <= 1e-12) return { status: "unavailable", reason: "pole" };
  try {
    const time = new Astronomy.AstroTime(new Date(epochMilliseconds));
    const observer = new Astronomy.Observer(latitude, longitude, 0);
    const rotation = Astronomy.CombineRotation(Astronomy.Rotation_ECT_EQD(time), Astronomy.Rotation_EQD_HOR(time, observer));
    const x = Astronomy.RotateVector(rotation, new Astronomy.Vector(1, 0, 0, time));
    const y = Astronomy.RotateVector(rotation, new Astronomy.Vector(0, 1, 0, time));
    const planeNorm = Math.hypot(x.z, y.z);
    if (![x.z, y.z, planeNorm].every(Number.isFinite)) return { status: "unavailable", reason: "geometry" };
    if (planeNorm <= 1e-10) return { status: "unavailable", reason: "plane" };
    let angle = Math.atan2(-x.z, y.z);
    let horizon = Astronomy.RotateVector(rotation, new Astronomy.Vector(Math.cos(angle), Math.sin(angle), 0, time));
    if (horizon.y > 0) {
      angle += Math.PI;
      horizon = Astronomy.RotateVector(rotation, new Astronomy.Vector(Math.cos(angle), Math.sin(angle), 0, time));
    }
    // A numerically tangent root has no resolved eastern direction.
    if (![angle, horizon.x, horizon.y, horizon.z].every(Number.isFinite) || horizon.y >= -1e-12) return { status: "unavailable", reason: "geometry" };
    const coordinate = readNatalCoordinate(((angle * 180 / Math.PI) % 360 + 360) % 360);
    return coordinate ? { status: "computed", coordinate } : { status: "unavailable", reason: "geometry" };
  } catch { return { status: "unavailable", reason: "geometry" }; }
}

export function calculateNatalPlacements(epochMilliseconds: number): NatalChartReadout["placements"] | null {
  if (!Number.isFinite(epochMilliseconds)) return null;
  try {
    const instant = new Astronomy.AstroTime(new Date(epochMilliseconds));
    const placements: NatalChartReadout["placements"] = [];
    for (const body of NATAL_BODIES) {
      const coordinate = readNatalCoordinate(Astronomy.Ecliptic(Astronomy.GeoVector(bodyMap[body], instant, true)).elon);
      if (!coordinate) return null;
      placements.push({ body, coordinate, house: null });
    }
    return placements;
  } catch { return null; }
}

/** No I/O, persistence, inferred time zone, alternate time scale or birth-data logging. */
export function calculateNatalChart(input: unknown, now: number): NatalChartResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { status: "invalid", reason: "input" };
  const fields = input as Record<string, unknown>;
  if (!["date", "time", "zone", "latitude", "longitude"].every(key => typeof fields[key] === "string")
    || typeof fields.knownTime !== "boolean" || typeof fields.coordinatesConfirmed !== "boolean") return { status: "invalid", reason: "input" };
  const values = fields as unknown as NatalChartInput;
  const time = resolveNatalTime(values, now);
  if (time.status !== "resolved") return time;
  const geography = readNatalGeography(values.latitude, values.longitude, values.coordinatesConfirmed);
  if (!geography) return { status: "invalid", reason: "geography" };
  try {
    const placements = calculateNatalPlacements(time.epochMilliseconds);
    if (!placements) return { status: "unavailable", reason: "ephemeris" };
    const ascendant = calculateNatalAscendant(time.epochMilliseconds, geography.latitude, geography.longitude);
    if (ascendant.status === "computed") for (const placement of placements) placement.house = natalWholeSignHouse(placement.coordinate.longitude, ascendant.coordinate.longitude);
    const inventory = natalInventory(placements);
    if (!inventory) return { status: "unavailable", reason: "ephemeris" };
    const motion = calculateNatalMotion(time.epochMilliseconds);
    return { status: "complete", chart: { utc: time.utc, offset: time.offset, before1970: time.before1970, placements, ascendant, inventory, motion } };
  } catch { return { status: "unavailable", reason: "ephemeris" }; }
}
