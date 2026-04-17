import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ConfidenceBoundary, ConfidenceBadge } from "@/components/career/v1/ConfidenceBoundary";
import { DecisionPathCard } from "@/components/career/v1/DecisionPathCard";
import { EvidenceDrawer } from "@/components/career/v1/EvidenceDrawer";
import { NextStepRail } from "@/components/career/v1/NextStepRail";
import { getCareerV1StateCopy } from "@/lib/career/ui/stateCopy";

describe("career V1 UI primitives", () => {
  it("renders the four V1 primitives with user-facing status language", () => {
    const html = renderToStaticMarkup(
      <>
        <ConfidenceBoundary tone="limited" title="资料仍在补充" description="部分强判断暂不展示。" />
        <ConfidenceBadge tone="complete">资料完整，可直接参考</ConfidenceBadge>
        <DecisionPathCard eyebrow="最稳妥路径" title="从结构清晰的岗位开始" summary="先验证低断裂成本。" ctaLabel="查看路径" href="/career/jobs/data-analysts" />
        <NextStepRail title="下一步" items={[{ title: "查看职业", href: "/career/jobs/data-analysts" }, { title: "回到职业库", href: "/career/jobs" }]} />
        <EvidenceDrawer title="查看评分依据"><p>formula detail</p></EvidenceDrawer>
      </>
    );

    expect(html).toContain("career-v1-confidence-boundary");
    expect(html).toContain("career-v1-confidence-badge");
    expect(html).toContain("career-v1-decision-path-card");
    expect(html).toContain("career-v1-next-step-rail");
    expect(html).toContain("career-v1-evidence-drawer");
    expect(html).toContain("资料仍在补充");
    expect(html).not.toContain("public_but_conservative");
    expect(html).not.toContain("strong_index_ready");
  });

  it("centralizes backend-status copy into V1 user language", () => {
    expect(getCareerV1StateCopy("mature_public_launch")).toMatchObject({ label: "资料完整，可直接参考", tone: "complete" });
    expect(getCareerV1StateCopy("public_but_conservative")).toMatchObject({ label: "资料仍在补充", tone: "limited" });
    expect(getCareerV1StateCopy("not_yet_mature")).toMatchObject({ label: "暂不完整，建议先看相关职业", tone: "review" });
    expect(getCareerV1StateCopy("family_handoff")).toMatchObject({ label: "先从职业家族探索", tone: "review" });
    expect(getCareerV1StateCopy("explorer_only")).toMatchObject({ label: "适合先探索，不建议直接判断", tone: "review" });
    expect(getCareerV1StateCopy("blocked")).toMatchObject({ label: "暂不提供完整页面", tone: "blocked" });
    expect(getCareerV1StateCopy("provisional")).toMatchObject({ label: "资料仍在校准", tone: "limited" });
    expect(getCareerV1StateCopy("restricted")).toMatchObject({ label: "部分内容暂不展示", tone: "limited" });
    expect(getCareerV1StateCopy("manual_only")).toMatchObject({ label: "需要人工复核", tone: "review" });
    expect(getCareerV1StateCopy("review_due")).toMatchObject({ label: "待复核", tone: "review" });
  });
});
