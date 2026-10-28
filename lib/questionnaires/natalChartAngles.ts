import * as Astronomy from "astronomy-engine";
import { natalWholeSignHouse, readNatalCoordinate, type NatalCoordinate } from "./natalChartCoordinates";

export type NatalAdditionalAngle = { status: "computed"; coordinate: NatalCoordinate; house: number | null }
  | { status: "unavailable"; reason: "pole" | "plane" | "geometry" | "ascendant" };
export type NatalAdditionalAngles = Record<"mc" | "ic" | "descendant", NatalAdditionalAngle>;
type BasisVector = { x: number; y: number; z: number };
type MeridianResult = { status: "computed"; coordinate: NatalCoordinate; meridianNorm: number; upperDot: number }
  | { status: "unavailable"; reason: "plane" | "geometry" };
const normalize = (degrees: number) => ((degrees % 360) + 360) % 360;

/** Epsilons on the engine's normalized basis are numerical conventions, not calibrated accuracy bounds. */
export function solveNatalUpperMeridian(x: BasisVector, y: BasisVector, thetaDegrees: number): MeridianResult {
  try {
    if (![x.x, x.y, x.z, y.x, y.y, y.z, thetaDegrees].every(Number.isFinite)) return { status: "unavailable", reason: "geometry" };
    const theta = thetaDegrees * Math.PI / 180, c = Math.cos(theta), s = Math.sin(theta);
    const a = -s * x.x + c * x.y, b = -s * y.x + c * y.y, meridianNorm = Math.hypot(a, b);
    if (![a, b, meridianNorm].every(Number.isFinite)) return { status: "unavailable", reason: "geometry" };
    if (meridianNorm <= 1e-10) return { status: "unavailable", reason: "plane" };
    let root = Math.atan2(-a, b);
    const projection = (angle: number) => c * (Math.cos(angle) * x.x + Math.sin(angle) * y.x)
      + s * (Math.cos(angle) * x.y + Math.sin(angle) * y.y);
    let upperDot = projection(root);
    if (upperDot < 0) { root += Math.PI; upperDot = projection(root); }
    if (![root, upperDot].every(Number.isFinite) || upperDot <= 1e-12) return { status: "unavailable", reason: "geometry" };
    const coordinate = readNatalCoordinate(normalize(root * 180 / Math.PI));
    return coordinate ? { status: "computed", coordinate, meridianNorm, upperDot } : { status: "unavailable", reason: "geometry" };
  } catch { return { status: "unavailable", reason: "geometry" }; }
}

function ascendantCoordinate(input: unknown): NatalCoordinate | null {
  try {
    if (!input || typeof input !== "object" || Array.isArray(input)) return null;
    const value = input as Record<string, unknown>;
    if (value.status !== "computed" || !value.coordinate || typeof value.coordinate !== "object" || Array.isArray(value.coordinate)) return null;
    return readNatalCoordinate((value.coordinate as Record<string, unknown>).longitude);
  } catch { return null; }
}

/** No I/O; call after existing public civil-time/range gates. MC is independent of a failed nonpolar ASC. */
export function calculateNatalAdditionalAngles(epochMilliseconds: number, latitude: number, longitude: number, ascendant: unknown): NatalAdditionalAngles {
  const unavailable = (reason: "pole" | "geometry"): NatalAdditionalAngles => ({ mc: { status: "unavailable", reason }, ic: { status: "unavailable", reason }, descendant: { status: "unavailable", reason } });
  if (!Number.isSafeInteger(epochMilliseconds) || Math.abs(epochMilliseconds) > 8640000000000000
    || ![latitude, longitude].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return unavailable("geometry");
  if (Math.abs(Math.cos(latitude * Math.PI / 180)) <= 1e-12) return unavailable("pole");
  const asc = ascendantCoordinate(ascendant);
  const placement = (coordinate: NatalCoordinate): NatalAdditionalAngle => ({ status: "computed", coordinate, house: asc ? natalWholeSignHouse(coordinate.longitude, asc.longitude) : null });
  const dc = asc ? readNatalCoordinate(normalize(asc.longitude + 180)) : null;
  const descendant: NatalAdditionalAngle = dc ? placement(dc) : { status: "unavailable", reason: "ascendant" };
  try {
    const time = new Astronomy.AstroTime(new Date(epochMilliseconds)), rotation = Astronomy.Rotation_ECT_EQD(time);
    const x = Astronomy.RotateVector(rotation, new Astronomy.Vector(1, 0, 0, time)), y = Astronomy.RotateVector(rotation, new Astronomy.Vector(0, 1, 0, time));
    const meridian = solveNatalUpperMeridian(x, y, Astronomy.SiderealTime(time) * 15 + longitude);
    if (meridian.status === "unavailable") return { mc: meridian, ic: meridian, descendant };
    const ic = readNatalCoordinate(normalize(meridian.coordinate.longitude + 180));
    return { mc: placement(meridian.coordinate), ic: ic ? placement(ic) : { status: "unavailable", reason: "geometry" }, descendant };
  } catch { return { mc: { status: "unavailable", reason: "geometry" }, ic: { status: "unavailable", reason: "geometry" }, descendant }; }
}
