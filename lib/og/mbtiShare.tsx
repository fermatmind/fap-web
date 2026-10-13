import { canonicalUrl } from "@/lib/site";
import type { MbtiSharePageViewModel } from "@/lib/mbti/publicProjection";
import type { Locale } from "@/lib/i18n/locales";

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

function buildShareOgView(viewModel: MbtiSharePageViewModel | null | undefined, locale: Locale): ShareOgView {
  const card = viewModel?.card;
  const scaleCode = viewModel?.scaleCode === "BIG5_OCEAN" ? "Big Five" : "MBTI";

  return {
    typeCode: card?.displayType || card?.canonicalTypeCode || `FermatMind ${scaleCode}`,
    typeName: card?.typeName || card?.title || card?.displayType || (locale === "zh" ? `${scaleCode} 分享摘要` : `${scaleCode} shared summary`),
    subtitle: card?.subtitle || card?.tagline || `${scaleCode} public-safe summary`,
    narrative: truncateText(
      card?.summary || card?.subtitle || card?.tagline || `View this ${scaleCode} share summary.`,
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
    ctaLabel: viewModel?.primaryCtaLabel || (locale === "zh" ? "开始 MBTI 免费测试" : "Start the free MBTI test"),
  };
}

export function buildShareMetadataCopy(viewModel?: MbtiSharePageViewModel | null, locale: Locale = "zh"): {
  title: string;
  description: string;
} {
  const card = viewModel?.card;
  const fallbackTitle = card?.displayType || card?.title || card?.canonicalTypeCode || card?.typeName || (
    locale === "zh"
      ? viewModel?.scaleCode === "BIG5_OCEAN" ? "Big Five 分享摘要" : "MBTI 分享摘要"
      : viewModel?.scaleCode === "BIG5_OCEAN" ? "Big Five shared summary" : "MBTI shared summary"
  );

  return {
    title: card?.displayType && card.typeName
      ? `${card.displayType} · ${card.typeName}｜FermatMind`
      : `${fallbackTitle}｜FermatMind`,
    description: card?.summary || card?.subtitle || card?.tagline || (locale === "zh" ? "查看人格类型分享" : "View this personality type share"),
  };
}

export function renderShareOgImage(viewModel?: MbtiSharePageViewModel | null, locale: Locale = "zh") {
  const view = buildShareOgView(viewModel, locale);

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
              {/* ImageResponse renders native image elements. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={canonicalUrl("/brand/mark-20261013.png")} alt="FermatMind" width={56} height={56} />

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
                {locale === "zh"
                  ? viewModel?.scaleCode === "BIG5_OCEAN" ? "Big Five 分享" : "MBTI 分享"
                  : viewModel?.scaleCode === "BIG5_OCEAN" ? "Big Five share" : "MBTI share"}
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
                {locale === "zh" ? "开始了解你的人格轮廓" : "Start understanding your personality profile"}
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
                {locale === "zh" ? "稀有度" : "Rarity"}
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
                {locale === "zh" ? "维度摘要" : "Dimension summary"}
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
                  {locale === "zh" ? "人格倾向摘要将在这里展示" : "A summary of personality preferences will appear here"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
