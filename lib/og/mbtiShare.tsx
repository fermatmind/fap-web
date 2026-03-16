import type { MbtiSharePageViewModel } from "@/lib/mbti/publicProjection";

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

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function buildShareOgView(viewModel?: MbtiSharePageViewModel | null): ShareOgView {
  const card = viewModel?.card;

  return {
    typeCode: card?.canonicalTypeCode || card?.displayType || "FermatMind MBTI",
    typeName: card?.typeName || card?.title || card?.displayType || "人格类型分享",
    subtitle: card?.subtitle || card?.tagline || "公开可分享的人格类型摘要",
    narrative: truncateText(
      card?.summary || card?.subtitle || card?.tagline || "查看这份 MBTI 分享摘要。",
      180
    ),
    rarity: card?.rarity || "",
    tags: (card?.publicTags ?? []).slice(0, 3),
    dimensions: (card?.dimensions ?? [])
      .map((dimension) => {
        const detail = [
          dimension.sideLabel || dimension.side,
          `${dimension.percent}%`,
          dimension.state,
        ].filter(Boolean).join(" · ");

        if (!dimension.label || !detail) {
          return null;
        }

        return {
          key: dimension.code || dimension.label,
          label: dimension.label,
          detail,
        };
      })
      .filter((dimension): dimension is ShareDimensionView => Boolean(dimension))
      .slice(0, 5),
    ctaLabel: viewModel?.primaryCtaLabel || "开始测试",
  };
}

export function buildShareMetadataCopy(viewModel?: MbtiSharePageViewModel | null): {
  title: string;
  description: string;
} {
  const card = viewModel?.card;
  const fallbackTitle = card?.title || card?.displayType || card?.canonicalTypeCode || card?.typeName || "MBTI 分享摘要";

  return {
    title: card?.canonicalTypeCode && card.typeName
      ? `${card.canonicalTypeCode} · ${card.typeName}｜FermatMind`
      : `${fallbackTitle}｜FermatMind`,
    description: card?.summary || card?.subtitle || card?.tagline || "查看人格类型分享",
  };
}

export function renderShareOgImage(viewModel?: MbtiSharePageViewModel | null) {
  const view = buildShareOgView(viewModel);

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
