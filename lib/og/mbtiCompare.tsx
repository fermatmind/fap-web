import type { MbtiCompareInviteResponse } from "@/lib/api/v0_3";

type CompareProfileView = {
  typeCode: string;
  typeName: string;
  title: string;
  subtitle: string;
  summary: string;
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

function normalizeCount(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}

function normalizeProfile(value: unknown): CompareProfileView {
  const record = asRecord(value);

  return {
    typeCode: normalizeText(record?.type_code),
    typeName: normalizeText(record?.type_name),
    title: normalizeText(record?.title),
    subtitle: normalizeText(record?.subtitle),
    summary: normalizeText(record?.summary),
  };
}

function normalizeCompareSummary(value: unknown): CompareSummaryView {
  const record = asRecord(value);

  return {
    title: normalizeText(record?.title, "MBTI 对比邀请"),
    summary: truncateText(normalizeText(record?.summary, "查看对比结果"), 180),
    sharedCount: normalizeCount(record?.shared_count),
    divergingCount: normalizeCount(record?.diverging_count),
  };
}

function normalizeStatus(status: unknown): "pending" | "ready" {
  const normalized = normalizeText(status).toLowerCase();
  if (normalized === "ready" || normalized === "purchased") {
    return "ready";
  }

  return "pending";
}

function normalizeCompareOgView(data?: MbtiCompareInviteResponse | null): CompareOgView {
  return {
    status: normalizeStatus(data?.status),
    inviter: normalizeProfile(data?.inviter),
    invitee: normalizeProfile(data?.invitee),
    compare: normalizeCompareSummary(data?.compare),
  };
}

export function buildCompareMetadataCopy(data?: MbtiCompareInviteResponse | null): {
  title: string;
  description: string;
} {
  if (!data) {
    return {
      title: "MBTI 对比邀请｜FermatMind",
      description: "查看 MBTI 对比邀请",
    };
  }

  const status = normalizeStatus(data.status);
  const inviter = normalizeProfile(data.inviter);
  const invitee = normalizeProfile(data.invitee);
  const compare = normalizeCompareSummary(data.compare);

  if (status === "pending") {
    return {
      title: inviter.typeCode
        ? `${inviter.typeCode} 邀请你来测 MBTI 并对比｜FermatMind`
        : "MBTI 对比邀请｜FermatMind",
      description: normalizeText(
        inviter.summary,
        data.primary_cta_label,
        "查看 MBTI 对比邀请"
      ),
    };
  }

  const pairDescription = inviter.typeName && invitee.typeName
    ? `${inviter.typeName} 与 ${invitee.typeName} 的 MBTI 对比`
    : "查看 MBTI 对比邀请";

  return {
    title: inviter.typeCode && invitee.typeCode
      ? `${inviter.typeCode} × ${invitee.typeCode} MBTI 对比｜FermatMind`
      : "MBTI 对比邀请｜FermatMind",
    description: normalizeText(compare.summary, pairDescription),
  };
}

export function renderCompareOgImage(data?: MbtiCompareInviteResponse | null) {
  const view = normalizeCompareOgView(data);
  const hasContractData = Boolean(data);
  const isPending = view.status === "pending";
  const title = isPending
    ? (hasContractData ? (view.inviter.typeCode || "MBTI 对比邀请") : "MBTI 对比邀请")
    : `${view.inviter.typeCode || "MBTI"} × ${view.invitee.typeCode || "MBTI"}`;
  const subtitle = isPending
    ? (hasContractData ? (view.inviter.typeName || "邀请你来测并完成对比") : "查看对比结果")
    : (view.compare.title || "MBTI 对比");
  const narrative = isPending
    ? truncateText(
        normalizeText(
          hasContractData ? view.inviter.subtitle : "",
          hasContractData ? view.inviter.summary : "",
          hasContractData ? "邀请你来测并完成对比" : "查看对比结果"
        ),
        160
      )
    : truncateText(
        normalizeText(view.compare.summary, "查看对比结果"),
        160
      );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top right, rgba(56, 189, 248, 0.24), transparent 34%), linear-gradient(135deg, #0b1020 0%, #172554 44%, #f8fafc 100%)",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -120,
          left: -90,
          width: 330,
          height: 330,
          borderRadius: 999,
          background: "rgba(59, 130, 246, 0.2)",
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
            background: "rgba(8, 15, 33, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            padding: 34,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "66%",
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
                  marginTop: 24,
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
                  marginTop: 12,
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
                  marginTop: 20,
                  maxWidth: 640,
                  fontSize: 24,
                  lineHeight: 1.4,
                  color: "#cbd5e1",
                }}
              >
                {narrative}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 24,
                borderTop: "1px solid rgba(226, 232, 240, 0.18)",
                fontSize: 22,
              }}
            >
              <div style={{ display: "flex", color: "#cbd5e1" }}>
                {isPending ? "邀请你来测并完成对比" : "公开可分享的 MBTI 对比摘要"}
              </div>
              <div
                style={{
                  display: "flex",
                  borderRadius: 999,
                  background: "rgba(191, 219, 254, 0.12)",
                  border: "1px solid rgba(191, 219, 254, 0.22)",
                  padding: "12px 20px",
                  color: "#eff6ff",
                }}
              >
                {isPending ? "开始测试" : "查看对比"}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "34%",
              gap: 14,
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
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
                  color: "#bfdbfe",
                }}
              >
                {isPending ? "邀请者" : "人格组合"}
              </div>

              {isPending ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 36,
                      fontWeight: 700,
                    }}
                  >
                    {view.inviter.typeCode || "MBTI"}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 24,
                      color: "#e2e8f0",
                    }}
                  >
                    {view.inviter.typeName || "MBTI 对比邀请"}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      borderRadius: 22,
                      background: "rgba(15, 23, 42, 0.34)",
                      padding: "14px 16px",
                      width: "48%",
                    }}
                  >
                    <div style={{ display: "flex", fontSize: 16, color: "#cbd5e1" }}>Inviter</div>
                    <div style={{ display: "flex", fontSize: 28, fontWeight: 700 }}>{view.inviter.typeCode || "MBTI"}</div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      borderRadius: 22,
                      background: "rgba(15, 23, 42, 0.34)",
                      padding: "14px 16px",
                      width: "48%",
                    }}
                  >
                    <div style={{ display: "flex", fontSize: 16, color: "#cbd5e1" }}>Invitee</div>
                    <div style={{ display: "flex", fontSize: 28, fontWeight: 700 }}>{view.invitee.typeCode || "MBTI"}</div>
                  </div>
                </div>
              )}
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
                  color: "#bfdbfe",
                }}
              >
                {isPending ? "下一步" : "公开摘要"}
              </div>

              {isPending ? (
                <div
                  style={{
                    display: "flex",
                    fontSize: 22,
                    lineHeight: 1.4,
                    color: "#e2e8f0",
                  }}
                >
                  邀请你来测并完成对比
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        borderRadius: 20,
                        background: "rgba(15, 23, 42, 0.34)",
                        padding: "12px 14px",
                        width: "48%",
                      }}
                    >
                      <div style={{ display: "flex", fontSize: 16, color: "#cbd5e1" }}>Shared</div>
                      <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#dbeafe" }}>
                        {view.compare.sharedCount ?? "--"}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        borderRadius: 20,
                        background: "rgba(15, 23, 42, 0.34)",
                        padding: "12px 14px",
                        width: "48%",
                      }}
                    >
                      <div style={{ display: "flex", fontSize: 16, color: "#cbd5e1" }}>Diverging</div>
                      <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#dbeafe" }}>
                        {view.compare.divergingCount ?? "--"}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      fontSize: 20,
                      lineHeight: 1.4,
                      color: "#e2e8f0",
                    }}
                  >
                    {view.compare.summary}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
