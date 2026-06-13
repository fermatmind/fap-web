function collectJsonLdTypes(value, types) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectJsonLdTypes(item, types);
    }
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  const type = value["@type"];
  if (typeof type === "string") {
    types.push(type);
  } else if (Array.isArray(type)) {
    for (const item of type) {
      if (typeof item === "string") {
        types.push(item);
      }
    }
  }

  for (const item of Object.values(value)) {
    collectJsonLdTypes(item, types);
  }
}

export function extractJsonLdTypesFromValue(value) {
  const types = [];
  collectJsonLdTypes(value, types);
  return types;
}

export function extractJsonLdTypesFromHtml(html) {
  const scripts = [...String(html || "").matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const types = [];

  for (const script of scripts) {
    try {
      types.push(...extractJsonLdTypesFromValue(JSON.parse(script[1])));
    } catch {
      types.push("parse_error");
    }
  }

  return types;
}
