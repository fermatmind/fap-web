type CrisisResourceItem = Record<string, unknown>;

function firstString(node: CrisisResourceItem, keys: string[]): string {
  for (const key of keys) {
    const value = node[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}

function normalizeResource(node: unknown, index: number): { id: string; label: string; href?: string } | null {
  if (!node || typeof node !== "object" || Array.isArray(node)) return null;

  const item = node as CrisisResourceItem;
  const label =
    firstString(item, ["title", "label", "name", "text", "display", "value"]) || `Resource ${index + 1}`;
  const url = firstString(item, ["url", "href", "link"]);
  const phone = firstString(item, ["phone", "tel", "hotline"]);

  if (url) {
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return {
      id: `url-${index}`,
      label,
      href,
    };
  }

  if (phone) {
    return {
      id: `phone-${index}`,
      label: `${label}: ${phone}`,
      href: `tel:${phone}`,
    };
  }

  return {
    id: `text-${index}`,
    label,
  };
}

export function CrisisOverlay({
  locale,
  resources,
  reasons,
}: {
  locale: "en" | "zh";
  resources?: Array<Record<string, unknown>>;
  reasons?: string[];
}) {
  const isZh = locale === "zh";
  const normalizedResources = Array.isArray(resources)
    ? resources.map((item, index) => normalizeResource(item, index)).filter((item): item is { id: string; label: string; href?: string } => item !== null)
    : [];
  const normalizedReasons = Array.isArray(reasons)
    ? reasons.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  return (
    <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
      <h3 className="m-0 text-base font-semibold">
        {isZh ? "重要：请优先关注安全与支持资源" : "Important: prioritize immediate safety and support"}
      </h3>
      <p className="m-0">
        {isZh
          ? "当前结果触发了危机提示。请优先联系可信任的人或专业支持渠道。"
          : "This report includes a crisis alert. Please prioritize trusted contacts or professional support channels."}
      </p>

      {normalizedReasons.length > 0 ? (
        <ul className="m-0 list-disc space-y-1 pl-5">
          {normalizedReasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : null}

      {normalizedResources.length > 0 ? (
        <ul className="m-0 list-disc space-y-1 pl-5">
          {normalizedResources.map((resource) => (
            <li key={resource.id}>
              {resource.href ? (
                <a
                  href={resource.href}
                  target={resource.href.startsWith("http") ? "_blank" : undefined}
                  rel={resource.href.startsWith("http") ? "noreferrer" : undefined}
                  className="font-medium text-rose-900 underline"
                >
                  {resource.label}
                </a>
              ) : (
                resource.label
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
