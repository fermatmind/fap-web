function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function fallbackHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a_${(hash >>> 0).toString(16)}`;
}

export async function computeManifestHash(payload: {
  manifestHash?: string | null;
  packId?: string | null;
  dirVersion?: string | null;
  contentPackageVersion?: string | null;
}): Promise<string> {
  const explicit = normalize(payload.manifestHash);
  if (explicit) {
    return explicit;
  }

  const source = [
    normalize(payload.packId) || "unknown_pack",
    normalize(payload.dirVersion) || "unknown_dir",
    normalize(payload.contentPackageVersion) || "unknown_content",
  ].join("|");

  const subtleCrypto =
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    (globalThis.crypto as Crypto | undefined)?.subtle
      ? (globalThis.crypto as Crypto)
      : null;

  if (subtleCrypto?.subtle && typeof TextEncoder !== "undefined") {
    try {
      const encoded = new TextEncoder().encode(source);
      const digest = await subtleCrypto.subtle.digest("SHA-256", encoded);
      const bytes = Array.from(new Uint8Array(digest));
      return bytes.map((item) => item.toString(16).padStart(2, "0")).join("");
    } catch {
      return fallbackHash(source);
    }
  }

  return fallbackHash(source);
}

export function clearBig5ClientCaches(): void {
  if (typeof window === "undefined") return;

  const keys = [
    "fm_big5_attempt_v1",
    "fm_big5_last_report_v1",
    "fm_big5_last_order_v1",
  ];

  for (const key of keys) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage cleanup failures.
    }
  }
}
