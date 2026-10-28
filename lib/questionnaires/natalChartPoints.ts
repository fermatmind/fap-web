import * as Astronomy from "astronomy-engine";
import { natalWholeSignHouse, readNatalCoordinate, type NatalCoordinate } from "./natalChartCoordinates";

type Vector3 = { x: number; y: number; z: number };
type PointDirection = { status: "computed"; coordinate: NatalCoordinate }
  | { status: "unavailable"; reason: "geometry" | "plane" | "eccentricity" };
export type NatalSensitivePoint = { status: "computed"; coordinate: NatalCoordinate; house: number | null; period?: "day" | "night" }
  | { status: "unavailable"; reason: "geometry" | "plane" | "eccentricity" | "ascendant" | "horizon" };
export type NatalSensitivePoints = Record<"north-node" | "south-node" | "lilith" | "fortune", NatalSensitivePoint>;
type LunarDirections = Record<"north-node" | "south-node" | "lilith", PointDirection>;
const normalize = (degrees: number) => ((degrees % 360) + 360) % 360;
const norm = (v: Vector3) => Math.hypot(v.x, v.y, v.z);
const finite = (v: Vector3) => [v.x, v.y, v.z].every(Number.isFinite);
const cross = (a: Vector3, b: Vector3): Vector3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const failedLunar = (): Record<"north-node" | "south-node" | "lilith", Extract<PointDirection, { status: "unavailable" }>> => ({ "north-node": { status: "unavailable", reason: "geometry" }, "south-node": { status: "unavailable", reason: "geometry" }, lilith: { status: "unavailable", reason: "geometry" } });
function direction(v: Vector3): PointDirection {
  if (!finite(v)) return { status: "unavailable", reason: "geometry" };
  if (Math.hypot(v.x, v.y) <= 1e-10) return { status: "unavailable", reason: "plane" };
  const coordinate = readNatalCoordinate(normalize(Math.atan2(v.y, v.x) * 180 / Math.PI));
  return coordinate ? { status: "computed", coordinate } : { status: "unavailable", reason: "geometry" };
}

/** Two-body osculating eccentricity vector; this is one explicitly named lunar-apogee variant. */
export function solveNatalLunarApogee(e: Vector3, toECT: (value: Vector3) => Vector3): PointDirection {
  try {
    const eNorm = norm(e);
    if (!finite(e) || !Number.isFinite(eNorm)) return { status: "unavailable", reason: "geometry" };
    if (eNorm <= 1e-10 || eNorm >= 1) return { status: "unavailable", reason: "eccentricity" };
    return direction(toECT({ x: -e.x / eNorm, y: -e.y / eNorm, z: -e.z / eNorm }));
  } catch { return { status: "unavailable", reason: "geometry" }; }
}

/** Geometric EQJ state, AU/AU-day. Thresholds on unit directions/eccentricity are numerical conventions only. */
export function solveNatalLunarPoints(r: Vector3, v: Vector3, massProduct: number, toECT: (value: Vector3) => Vector3): LunarDirections {
  try {
    const radius = norm(r), h = cross(r, v), hNorm = norm(h);
    if (!finite(r) || !finite(v) || !finite(h) || ![radius, hNorm, massProduct].every(Number.isFinite)
      || radius === 0 || hNorm === 0 || massProduct <= 0) return failedLunar();
    const result: LunarDirections = failedLunar();
    try {
      const hECT = toECT({ x: h.x / hNorm, y: h.y / hNorm, z: h.z / hNorm });
      const north: PointDirection = finite(hECT) ? direction({ x: -hECT.y, y: hECT.x, z: 0 }) : { status: "unavailable", reason: "geometry" };
      result["north-node"] = north;
      const south = north.status === "computed" ? readNatalCoordinate(normalize(north.coordinate.longitude + 180)) : null;
      result["south-node"] = south ? { status: "computed", coordinate: south } : north;
    } catch { /* An independent apogee direction may still be available. */ }
    try {
      const vh = cross(v, h), e = { x: vh.x / massProduct - r.x / radius, y: vh.y / massProduct - r.y / radius, z: vh.z / massProduct - r.z / radius };
      result.lilith = solveNatalLunarApogee(e, toECT);
    } catch { /* Nodes remain usable if the independent apogee calculation fails. */ }
    return result;
  } catch { return failedLunar(); }
}

/** Unrefracted geocentric apparent Sun-center horizon convention, not physical sunrise or twilight. */
export function solveNatalFortune(ascendant: unknown, sun: unknown, moon: unknown, sunHorizonUnitZ: unknown): NatalSensitivePoint {
  const asc = readNatalCoordinate(ascendant), s = readNatalCoordinate(sun), m = readNatalCoordinate(moon);
  if (!asc) return { status: "unavailable", reason: "ascendant" };
  if (!s || !m) return { status: "unavailable", reason: "geometry" };
  if (typeof sunHorizonUnitZ !== "number" || (!Number.isFinite(sunHorizonUnitZ) || Math.abs(sunHorizonUnitZ) > 1)) return { status: "unavailable", reason: "geometry" };
  if (Math.abs(sunHorizonUnitZ) <= 1e-12) return { status: "unavailable", reason: "horizon" };
  const period = sunHorizonUnitZ > 0 ? "day" : "night";
  const coordinate = readNatalCoordinate(normalize(period === "day" ? asc.longitude + m.longitude - s.longitude : asc.longitude + s.longitude - m.longitude));
  return coordinate ? { status: "computed", coordinate, house: natalWholeSignHouse(coordinate.longitude, asc.longitude), period } : { status: "unavailable", reason: "geometry" };
}

/** No I/O; call only after original public time/geography gates. Lunar-state failure leaves Fortune independent. */
export function calculateNatalSensitivePoints(epochMilliseconds: number, latitude: number, longitude: number, ascendant: unknown, placements: readonly { body: string; coordinate: { longitude: number } }[]): NatalSensitivePoints {
  let lunar: LunarDirections = failedLunar(), fortune: NatalSensitivePoint = { status: "unavailable", reason: "geometry" };
  const unavailable: NatalSensitivePoints = { ...failedLunar(), fortune };
  if (!Number.isSafeInteger(epochMilliseconds) || Math.abs(epochMilliseconds) > 8640000000000000) return unavailable;
  let time: Astronomy.AstroTime;
  try { time = new Astronomy.AstroTime(new Date(epochMilliseconds)); } catch { return unavailable; }
  let asc: NatalCoordinate | null = null;
  try {
    if (ascendant && typeof ascendant === "object" && !Array.isArray(ascendant)) {
      const a = ascendant as Record<string, unknown>;
      if (a.status === "computed" && a.coordinate && typeof a.coordinate === "object" && !Array.isArray(a.coordinate)) asc = readNatalCoordinate((a.coordinate as Record<string, unknown>).longitude);
    }
  } catch { /* Missing ASC withholds houses and Fortune, not lunar directions. */ }
  try {
    const state = Astronomy.GeoMoonState(time), rotation = Astronomy.Rotation_EQJ_ECT(time);
    lunar = solveNatalLunarPoints({ x: state.x, y: state.y, z: state.z }, { x: state.vx, y: state.vy, z: state.vz }, Astronomy.MassProduct(Astronomy.Body.Earth) + Astronomy.MassProduct(Astronomy.Body.Moon), value => Astronomy.RotateVector(rotation, new Astronomy.Vector(value.x, value.y, value.z, time)));
  } catch { /* Existing body positions, angles and independently computed Fortune remain valid. */ }
  if (!asc) fortune = { status: "unavailable", reason: "ascendant" };
  else try {
    if (![latitude, longitude].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) throw new Error("Invalid horizon coordinates");
    const horizon = Astronomy.RotateVector(Astronomy.Rotation_EQJ_HOR(time, new Astronomy.Observer(latitude, longitude, 0)), Astronomy.GeoVector(Astronomy.Body.Sun, time, true));
    const length = norm(horizon);
    const z = finite(horizon) && Number.isFinite(length) && length > 0 ? horizon.z / length : NaN;
    const sun = placements.find(p => p.body === "sun"), moon = placements.find(p => p.body === "moon");
    fortune = solveNatalFortune(asc.longitude, sun?.coordinate.longitude, moon?.coordinate.longitude, z);
  } catch { /* A horizon failure withholds only Fortune. */ }
  const place = (point: PointDirection): NatalSensitivePoint => point.status === "computed" ? { ...point, house: asc ? natalWholeSignHouse(point.coordinate.longitude, asc.longitude) : null } : point;
  return { "north-node": place(lunar["north-node"]), "south-node": place(lunar["south-node"]), lilith: place(lunar.lilith), fortune };
}
