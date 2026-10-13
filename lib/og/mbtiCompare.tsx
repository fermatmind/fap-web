import { canonicalUrl } from "@/lib/site";
import type { Locale } from "@/lib/i18n/locales";
import type { MbtiCompareInviteViewModel } from "@/lib/mbti/compareInvite";

type CompareProfileView = {
  typeCode: string;
  typeName: string;
};

type CompareSummaryView = {
  title: string;
  summary: string;
  sharedCount: number | null;
  divergingCount: number | null;
};

type CompareOgView = {
  status: "pending" | "ready";
  inviter: CompareProfileView;
  invitee: CompareProfileView;
  compare: CompareSummaryView;
};

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function resolveParticipantLabel(
  card: MbtiCompareInviteViewModel["inviterCard"] | MbtiCompareInviteViewModel["inviteeCard"],
  fallback: string
): CompareProfileView {
  return {
    typeCode: card?.displayType || card?.canonicalTypeCode || fallback,
    typeName: card?.typeName || card?.title || card?.displayType || fallback,
  };
}

function buildCompareOgView(viewModel: MbtiCompareInviteViewModel | null | undefined, locale: Locale): CompareOgView {
  const status = viewModel?.status === "ready" || viewModel?.status === "purchased"
    ? "ready"
    : "pending";

  return {
    status,
    inviter: resolveParticipantLabel(viewModel?.inviterCard ?? null, "MBTI"),
    invitee: resolveParticipantLabel(viewModel?.inviteeCard ?? null, "MBTI"),
    compare: {
      title: viewModel?.compareSummary?.title || (locale === "zh" ? "MBTI 对比邀请" : "MBTI compare invite"),
      summary: truncateText(
        viewModel?.compareSummary?.summary || (locale === "zh" ? "查看 MBTI 对比邀请" : "View this MBTI compare invite"),
        180
      ),
      sharedCount: viewModel?.compareSummary?.sharedCount ?? null,
      divergingCount: viewModel?.compareSummary?.divergingCount ?? null,
    },
  };
}

export function buildCompareMetadataCopy(viewModel?: MbtiCompareInviteViewModel | null, locale: Locale = "zh"): {
  title: string;
  description: string;
} {
  if (!viewModel) {
    return {
      title: (locale === "zh" ? "MBTI 对比邀请｜FermatMind" : "MBTI compare invite | FermatMind"),
      description: (locale === "zh" ? "查看 MBTI 对比邀请" : "View this MBTI compare invite"),
    };
  }

  const isReady = viewModel.status === "ready" || viewModel.status === "purchased";
  const inviterCode = viewModel.inviterCard?.displayType || viewModel.inviterCard?.canonicalTypeCode;
  const inviteeCode = viewModel.inviteeCard?.displayType || viewModel.inviteeCard?.canonicalTypeCode;
  const description = viewModel.compareSummary?.summary || (locale === "zh" ? "查看 MBTI 对比邀请" : "View this MBTI compare invite");

  if (!isReady) {
    return {
      title: inviterCode
        ? (locale === "zh" ? `${inviterCode} 邀请你来测 MBTI 并对比｜FermatMind` : `${inviterCode} invites you to take MBTI and compare | FermatMind`)
        : (locale === "zh" ? "MBTI 对比邀请｜FermatMind" : "MBTI compare invite | FermatMind"),
      description,
    };
  }

  return {
    title: inviterCode && inviteeCode
      ? (locale === "zh" ? `${inviterCode} × ${inviteeCode} MBTI 对比｜FermatMind` : `${inviterCode} × ${inviteeCode} MBTI comparison | FermatMind`)
      : (locale === "zh" ? "MBTI 对比邀请｜FermatMind" : "MBTI compare invite | FermatMind"),
    description,
  };
}

export function renderCompareOgImage(viewModel?: MbtiCompareInviteViewModel | null, locale: Locale = "zh") {
  const view = buildCompareOgView(viewModel, locale);
  const isPending = view.status === "pending";
  const title = isPending
    ? view.inviter.typeCode || (locale === "zh" ? "MBTI 对比邀请" : "MBTI compare invite")
    : `${view.inviter.typeCode || "MBTI"} × ${view.invitee.typeCode || "MBTI"}`;
  const subtitle = isPending
    ? view.inviter.typeName || (locale === "zh" ? "邀请你来测并完成对比" : "You are invited to take the test and compare results")
    : (view.compare.title || (locale === "zh" ? "MBTI 对比" : "MBTI comparison"));
  const narrative = isPending
    ? (locale === "zh" ? "邀请你来测并完成对比" : "You are invited to take the test and compare results")
    : truncateText(view.compare.summary || (locale === "zh" ? "查看对比结果" : "View the comparison results"), 160);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background:
          "radial-gradient(circle at top right, rgba(56, 189, 248, 0.22), transparent 34%), linear-gradient(135deg, #0b1020 0%, #172554 48%, #f8fafc 100%)",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: 44,
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            borderRadius: 36,
            background: "rgba(8, 15, 33, 0.82)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            padding: 34,
          }}
        >
          {/* ImageResponse renders native image elements. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={canonicalUrl("/brand/mark-20261013.png")} alt="FermatMind" width={56} height={56} />

          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 24,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#bfdbfe",
            }}
          >
            {isPending ? (locale === "zh" ? "MBTI 对比邀请" : "MBTI compare invite") : (locale === "zh" ? "MBTI 对比" : "MBTI comparison")}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 16,
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.02,
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontSize: 34,
              fontWeight: 600,
              lineHeight: 1.1,
              color: "#e2e8f0",
            }}
          >
            {subtitle}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 22,
              maxWidth: 860,
              fontSize: 24,
              lineHeight: 1.45,
              color: "#cbd5e1",
            }}
          >
            {narrative}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                minWidth: 220,
                borderRadius: 24,
                background: "rgba(15, 23, 42, 0.34)",
                padding: "18px 20px",
              }}
            >
              <div style={{ display: "flex", fontSize: 16, color: "#cbd5e1" }}>Inviter</div>
              <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
                {view.inviter.typeCode || "MBTI"}
              </div>
              <div style={{ display: "flex", fontSize: 18, color: "#e2e8f0" }}>
                {view.inviter.typeName || (locale === "zh" ? "MBTI 对比邀请" : "MBTI compare invite")}
              </div>
            </div>

            {!isPending ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  minWidth: 220,
                  borderRadius: 24,
                  background: "rgba(15, 23, 42, 0.34)",
                  padding: "18px 20px",
                }}
              >
                <div style={{ display: "flex", fontSize: 16, color: "#cbd5e1" }}>Invitee</div>
                <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
                  {view.invitee.typeCode || "MBTI"}
                </div>
                <div style={{ display: "flex", fontSize: 18, color: "#e2e8f0" }}>
                  {view.invitee.typeName || (locale === "zh" ? "MBTI 对比邀请" : "MBTI compare invite")}
                </div>
              </div>
            ) : null}
          </div>

          {!isPending ? (
            <div
              style={{
                display: "flex",
                gap: 16,
                marginTop: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  borderRadius: 24,
                  background: "rgba(191, 219, 254, 0.12)",
                  padding: "18px 20px",
                  minWidth: 180,
                }}
              >
                <div style={{ display: "flex", fontSize: 16, color: "#cbd5e1" }}>Shared</div>
                <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
                  {view.compare.sharedCount ?? "--"}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  borderRadius: 24,
                  background: "rgba(191, 219, 254, 0.12)",
                  padding: "18px 20px",
                  minWidth: 180,
                }}
              >
                <div style={{ display: "flex", fontSize: 16, color: "#cbd5e1" }}>Diverging</div>
                <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
                  {view.compare.divergingCount ?? "--"}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
