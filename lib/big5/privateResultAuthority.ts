export const BIG5_PRIVATE_RESULT_AUTHORITY_SCHEMA = "fap.big5.private_result_authority.v1";

export type Big5PrivateResultAuthority = {
  schema_version: typeof BIG5_PRIVATE_RESULT_AUTHORITY_SCHEMA;
  mode: "canonical" | "immutable_legacy_snapshot";
  locale: string;
  source_hash: string;
  compiled_hash: string;
};

const SHA256_PATTERN = /^[a-f0-9]{64}$/;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function parseBig5PrivateResultAuthority(value: unknown): Big5PrivateResultAuthority | null {
  const authority = asRecord(value);
  if (!authority || authority.schema_version !== BIG5_PRIVATE_RESULT_AUTHORITY_SCHEMA) {
    return null;
  }

  const mode = authority.mode;
  const locale = typeof authority.locale === "string" ? authority.locale.trim() : "";
  const sourceHash = typeof authority.source_hash === "string" ? authority.source_hash.trim() : "";
  const compiledHash = typeof authority.compiled_hash === "string" ? authority.compiled_hash.trim() : "";
  if (mode !== "canonical" && mode !== "immutable_legacy_snapshot") {
    return null;
  }
  if (mode === "canonical" && (!locale || !SHA256_PATTERN.test(sourceHash) || !SHA256_PATTERN.test(compiledHash))) {
    return null;
  }
  if (mode === "immutable_legacy_snapshot" && ((sourceHash && !SHA256_PATTERN.test(sourceHash)) || (compiledHash && !SHA256_PATTERN.test(compiledHash)))) {
    return null;
  }

  return {
    schema_version: BIG5_PRIVATE_RESULT_AUTHORITY_SCHEMA,
    mode,
    locale,
    source_hash: sourceHash,
    compiled_hash: compiledHash,
  };
}

export function resolveBig5PrivateResultAuthority(payload: unknown): Big5PrivateResultAuthority | null {
  const root = asRecord(payload);
  const report = asRecord(root?.report);
  const reportMeta = asRecord(report?._meta);
  return parseBig5PrivateResultAuthority(
    root?.big5_private_result_authority ?? reportMeta?.big5_private_result_authority
  );
}

export function hasRenderableBig5PrivateResultAuthority(payload: unknown): boolean {
  return resolveBig5PrivateResultAuthority(payload) !== null;
}
