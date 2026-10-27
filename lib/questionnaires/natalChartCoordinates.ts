export const NATAL_SIGNS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"] as const;
export const NATAL_BODIES = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"] as const;
export type NatalSign = typeof NATAL_SIGNS[number];
export type NatalBody = typeof NATAL_BODIES[number];
export type NatalCoordinate = {
  longitude: number;
  sign: NatalSign;
  signIndex: number;
  degreesWithinSign: number;
  displayDegrees: number;
  nearDisplayBoundary: boolean;
};

/** Sector first; truncate the within-sign display afterward so it never becomes30°. */
export function readNatalCoordinate(input: unknown): NatalCoordinate | null {
  if (typeof input !== "number" || !Number.isFinite(input) || input < 0 || input >= 360) return null;
  const longitude = Object.is(input, -0) ? 0 : input;
  const signIndex = Math.floor(longitude / 30), degreesWithinSign = longitude - signIndex * 30;
  return { longitude, sign: NATAL_SIGNS[signIndex], signIndex, degreesWithinSign,
    displayDegrees: Math.floor(degreesWithinSign * 10) / 10,
    // One display step is a UI notice, not a calibrated physical-error bound.
    nearDisplayBoundary: Math.min(degreesWithinSign, 30 - degreesWithinSign) < 0.1 };
}

export function natalWholeSignHouse(bodyLongitude: unknown, ascendantLongitude: unknown): number | null {
  const body = readNatalCoordinate(bodyLongitude), ascendant = readNatalCoordinate(ascendantLongitude);
  return body && ascendant ? (body.signIndex - ascendant.signIndex + 12) % 12 + 1 : null;
}

export function natalInventory(placements: readonly { body: NatalBody; coordinate: NatalCoordinate }[]) {
  if (!Array.isArray(placements) || placements.length !== 10 || Array.from(placements).some((p, index) => !p
    || p.body !== NATAL_BODIES[index] || !p.coordinate || !readNatalCoordinate(p.coordinate.longitude))) return null;
  const elements = { fire: 0, earth: 0, air: 0, water: 0 }, modalities = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const placement of placements) {
    const coordinate = readNatalCoordinate(placement.coordinate.longitude)!;
    elements[(["fire", "earth", "air", "water"] as const)[coordinate.signIndex % 4]] += 1;
    modalities[(["cardinal", "fixed", "mutable"] as const)[coordinate.signIndex % 3]] += 1;
  }
  return { elements, modalities };
}
