function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return fallback;

  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

export function isImmersiveSingleFlowEnabled(): boolean {
  return parseBoolean(process.env.NEXT_PUBLIC_IMMERSIVE_SINGLE_FLOW_ENABLED, true);
}
