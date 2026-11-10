export type TextUnits = Readonly<Record<string, { text: string }>>;

export function projectStoryCopy<T>(value: T, path: string, units: TextUnits): T {
  if (value && typeof value === "object" && "zh" in value && "en" in value && typeof value.zh === "string" && typeof value.en === "string") {
    const unit = units[path];
    if (!unit) throw new Error(`Missing Taiwan story text: ${path}`);
    return { ...value, zh: unit.text };
  }
  if (Array.isArray(value)) return value.map((item, index) => projectStoryCopy(item, `${path}/${index}`, units)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, projectStoryCopy(child, `${path}/${key}`, units)])) as T;
  }
  return value;
}
