const SENSITIVE_KEYS = new Set([
  "email",
  "token",
  "authorization",
  "answers",
  "answer",
  "report",
  "password",
  "secret",
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function maskValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  if (value.length <= 10) return "[redacted]";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[truncated]";
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));

  if (!isObject(value)) {
    return value;
  }

  return Object.entries(value).reduce<Record<string, unknown>>((acc, [key, raw]) => {
    const lower = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lower)) {
      acc[key] = "[redacted]";
      return acc;
    }

    if (lower.includes("attempt") || lower.includes("order")) {
      acc[key] = maskValue(raw);
      return acc;
    }

    acc[key] = redact(raw, depth + 1);
    return acc;
  }, {});
}

function shouldLogInfo() {
  return process.env.NODE_ENV !== "production";
}

export function logInfo(message: string, context?: Record<string, unknown>) {
  if (!shouldLogInfo()) return;
  if (context) {
    console.info(message, redact(context));
    return;
  }
  console.info(message);
}

export function logWarn(message: string, context?: Record<string, unknown>) {
  if (context) {
    console.warn(message, redact(context));
    return;
  }
  console.warn(message);
}

export function logError(message: string, context?: Record<string, unknown>) {
  if (context) {
    console.error(message, redact(context));
    return;
  }
  console.error(message);
}
