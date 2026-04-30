const JSON_LD_SCRIPT_ESCAPE_MAP: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

export function serializeJsonLd(data: unknown): string {
  const json = JSON.stringify(data);
  const serialized = json === undefined ? "null" : json;

  return serialized.replace(/[<>&\u2028\u2029]/g, (character) => JSON_LD_SCRIPT_ESCAPE_MAP[character]);
}
