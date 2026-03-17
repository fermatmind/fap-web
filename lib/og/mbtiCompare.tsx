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

function buildCompareOgView(viewModel?: MbtiCompareInviteViewModel | null): CompareOgView {
  const status = viewModel?.status === "ready" || viewModel?.status === "purchased"
    ? "ready"
    : "pending";

  return {
    status,
    inviter: resolveParticipantLabel(viewModel?.inviterCard ?? null, "MBTI"),
    invitee: resolveParticipantLabel(viewModel?.inviteeCard ?? null, "MBTI"),
    compare: {
      title: viewModel?.compareSummary?.title || "MBTI 对比邀请",
      summary: truncateText(
        viewModel?.compareSummary?.summary || "查看 MBTI 对比邀请",
        180
      ),
      sharedCount: viewModel?.compareSummary?.sharedCount ?? null,
      divergingCount: viewModel?.compareSummary?.divergingCount ?? null,
    },
  };
}

export function buildCompareMetadataCopy(viewModel?: MbtiCompareInviteViewModel | null): {
  title: string;
  description: string;
} {
  if (!viewModel) {
    return {
      title: "MBTI 对比邀请｜FermatMind",
      description: "查看 MBTI 对比邀请",
    };
  }

  const isReady = viewModel.status === "ready" || viewModel.status === "purchased";
  const inviterCode = viewModel.inviterCard?.displayType || viewModel.inviterCard?.canonicalTypeCode;
  const inviteeCode = viewModel.inviteeCard?.displayType || viewModel.inviteeCard?.canonicalTypeCode;
  const description = viewModel.compareSummary?.summary || "查看 MBTI 对比邀请";

  if (!isReady) {
    return {
      title: inviterCode
        ? `${inviterCode} 邀请你来测 MBTI 并对比｜FermatMind`
        : "MBTI 对比邀请｜FermatMind",
      description,
    };
  }

  return {
    title: inviterCode && inviteeCode
      ? `${inviterCode} × ${inviteeCode} MBTI 对比｜FermatMind`
      : "MBTI 对比邀请｜FermatMind",
    description,
  };
}

export function renderCompareOgImage(viewModel?: MbtiCompareInviteViewModel | null) {
  const view = buildCompareOgView(viewModel);
  const isPending = view.status === "pending";
  const title = isPending
    ? view.inviter.typeCode || "MBTI 对比邀请"
    : `${view.inviter.typeCode || "MBTI"} × ${view.invitee.typeCode || "MBTI"}`;
  const subtitle = isPending
    ? view.inviter.typeName || "邀请你来测并完成对比"
    : (view.compare.title || "MBTI 对比");
  const narrative = isPending
    ? "邀请你来测并完成对比"
    : truncateText(view.compare.summary || "查看对比结果", 160);

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              borderRadius: 999,
              border: "1px solid rgba(191, 219, 254, 0.45)",
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
              marginTop: 26,
              fontSize: 24,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#bfdbfe",
            }}
          >
            {isPending ? "MBTI 对比邀请" : "MBTI 对比"}
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
                {view.inviter.typeName || "MBTI 对比邀请"}
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
                  {view.invitee.typeName || "MBTI 对比邀请"}
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
