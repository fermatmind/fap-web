import type { ShareSummaryResponse } from "@/lib/api/v0_3";

const TECHNICAL_TAG_PREFIXES = [
  "axis:",
  "state:",
  "type:",
  "role:",
  "strategy:",
  "borderline:",
] as const;

type ShareDimensionView = {
  key: string;
  label: string;
  detail: string;
};

type ShareOgView = {
  typeCode: string;
  typeName: string;
  subtitle: string;
  narrative: string;
  rarity: string;
  tags: string[];
  dimensions: ShareDimensionView[];
  ctaLabel: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== "string" && typeof value !== "number") {
      continue;
    }

    const normalized = String(value).trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function resolveRarity(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return normalizeText(value);
  }

  const record = asRecord(value);
  return normalizeText(record?.label, record?.text, record?.value, record?.title);
}

function isPublicTag(tag: string): boolean {
  const normalized = tag.trim().toLowerCase();
  if (!normalized) return false;
  return !TECHNICAL_TAG_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => normalizeText(item))
        .filter((tag) => tag.length > 0 && isPublicTag(tag))
    )
  ).slice(0, 3);
}

function normalizePercent(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  const normalized = value > 1 ? value : value * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

function normalizeDimensions(value: unknown): ShareDimensionView[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      const record = asRecord(item);
      if (!record) {
        return null;
      }

      const label = normalizeText(record.label, record.code, `Dimension ${index + 1}`);
      const pct = normalizePercent(record.pct);
      const side = normalizeText(record.side_label, record.side);
      const state = normalizeText(record.state);
      const detailParts = [side, pct !== null ? `${pct}%` : "", state].filter(Boolean);

      if (!label || detailParts.length === 0) {
        return null;
      }

      return {
        key: normalizeText(record.code, label, index + 1),
        label,
        detail: detailParts.join(" · "),
      };
    })
    .filter((item): item is ShareDimensionView => Boolean(item))
    .slice(0, 5);
}

function normalizeShareOgView(data?: ShareSummaryResponse | null): ShareOgView {
  const typeCode = normalizeText(data?.type_code, "FermatMind MBTI");
  const typeName = normalizeText(data?.type_name, data?.title, "人格类型分享");
  const subtitle = normalizeText(data?.subtitle, "公开可分享的人格类型摘要");
  const narrative = truncateText(
    normalizeText(data?.summary, data?.tagline, "查看这份 MBTI 分享摘要。"),
    180
  );
  const rarity = normalizeText(resolveRarity(data?.rarity));
  const tags = normalizeTags(data?.tags);
  const dimensions = normalizeDimensions(data?.dimensions);
  const ctaLabel = normalizeText(data?.primary_cta_label, "开始测试");

  return {
    typeCode,
    typeName,
    subtitle,
    narrative,
    rarity,
    tags,
    dimensions,
    ctaLabel,
  };
}

export function buildShareMetadataCopy(data?: ShareSummaryResponse | null): {
  title: string;
  description: string;
} {
  const typeCode = normalizeText(data?.type_code);
  const typeName = normalizeText(data?.type_name);
  const fallbackTitle = normalizeText(data?.title, typeCode, "人格类型分享");
  const title = typeCode && typeName
    ? `${typeCode} · ${typeName}｜FermatMind`
    : `${fallbackTitle}｜FermatMind`;
  const description = normalizeText(
    data?.summary,
    data?.subtitle,
    data?.tagline,
    "查看人格类型分享"
  );

  return { title, description };
}

export function renderShareOgImage(data?: ShareSummaryResponse | null) {
  const view = normalizeShareOgView(data);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top left, rgba(16, 185, 129, 0.22), transparent 34%), linear-gradient(135deg, #07131f 0%, #10253c 46%, #f3f8f5 100%)",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -110,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: 999,
          background: "rgba(52, 211, 153, 0.22)",
        }}
      />
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 42,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            borderRadius: 34,
            background: "rgba(7, 19, 31, 0.78)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            padding: 34,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "68%",
              justifyContent: "space-between",
              paddingRight: 24,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  borderRadius: 999,
                  border: "1px solid rgba(167, 243, 208, 0.48)",
                  background: "rgba(15, 23, 42, 0.32)",
                  padding: "10px 16px",
                  fontSize: 22,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                FermatMind
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 24,
                  fontSize: 24,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#a7f3d0",
                }}
              >
                MBTI 分享
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 16,
                  fontSize: 66,
                  fontWeight: 800,
                  lineHeight: 1.02,
                }}
              >
                {view.typeCode}
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 10,
                  fontSize: 36,
                  fontWeight: 600,
                  lineHeight: 1.08,
                  color: "#e2e8f0",
                }}
              >
                {view.typeName}
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 18,
                  fontSize: 22,
                  lineHeight: 1.4,
                  color: "#cbd5e1",
                }}
              >
                {view.subtitle}
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 18,
                  maxWidth: 650,
                  fontSize: 24,
                  lineHeight: 1.4,
                  color: "#e2e8f0",
                }}
              >
                {view.narrative}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 24,
                borderTop: "1px solid rgba(226, 232, 240, 0.18)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  color: "#cbd5e1",
                }}
              >
                开始了解你的人格轮廓
              </div>
              <div
                style={{
                  display: "flex",
                  borderRadius: 999,
                  background: "rgba(167, 243, 208, 0.14)",
                  border: "1px solid rgba(167, 243, 208, 0.28)",
                  padding: "12px 20px",
                  fontSize: 22,
                  color: "#ecfdf5",
                }}
              >
                {view.ctaLabel}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "32%",
              gap: 14,
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                borderRadius: 28,
                background: "rgba(248, 250, 252, 0.08)",
                border: "1px solid rgba(248, 250, 252, 0.12)",
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 18,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#a7f3d0",
                }}
              >
                稀有度
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 30,
                  fontWeight: 700,
                  lineHeight: 1.15,
                }}
              >
                {view.rarity || "Public-safe summary"}
              </div>

              {view.tags.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  {view.tags.map((tag) => (
                    <div
                      key={tag}
                      style={{
                        display: "flex",
                        borderRadius: 999,
                        background: "rgba(236, 253, 245, 0.12)",
                        border: "1px solid rgba(167, 243, 208, 0.24)",
                        padding: "8px 14px",
                        fontSize: 18,
                        color: "#d1fae5",
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                borderRadius: 28,
                background: "rgba(248, 250, 252, 0.08)",
                border: "1px solid rgba(248, 250, 252, 0.12)",
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 18,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#a7f3d0",
                }}
              >
                维度摘要
              </div>

              {view.dimensions.length > 0 ? (
                view.dimensions.map((dimension) => (
                  <div
                    key={dimension.key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderRadius: 20,
                      background: "rgba(15, 23, 42, 0.34)",
                      padding: "12px 14px",
                      fontSize: 18,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        width: "52%",
                        color: "#e2e8f0",
                      }}
                    >
                      {dimension.label}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        width: "48%",
                        justifyContent: "flex-end",
                        textAlign: "right",
                        color: "#a7f3d0",
                      }}
                    >
                      {dimension.detail}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    display: "flex",
                    borderRadius: 20,
                    background: "rgba(15, 23, 42, 0.34)",
                    padding: "12px 14px",
                    fontSize: 18,
                    color: "#cbd5e1",
                  }}
                >
                  人格倾向摘要将在这里展示
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
