import type { ReportResponse } from "@/lib/api/v0_3";

type EiBand = "clear" | "strong";

type MbtiPhase2FixtureOptions = {
  eiBand?: EiBand;
  eiPct?: number;
  eiDelta?: number;
};

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getProjectionMeta(reportData: ReportResponse): Record<string, unknown> {
  const projection = (reportData.mbti_public_projection_v1 ?? {}) as Record<string, unknown>;
  const meta = asRecord(projection._meta) ?? {};
  projection._meta = meta;
  reportData.mbti_public_projection_v1 = projection;
  return meta;
}

function getReportMeta(reportData: ReportResponse): Record<string, unknown> {
  const report = (reportData.report ?? {}) as Record<string, unknown>;
  const meta = asRecord(report._meta) ?? {};
  report._meta = meta;
  reportData.report = report;
  return meta;
}

function getProjectionSection(reportData: ReportResponse, key: string): Record<string, unknown> {
  const projection = reportData.mbti_public_projection_v1 as Record<string, unknown> | null | undefined;
  const sections = Array.isArray(projection?.sections) ? projection.sections : [];
  const section = sections.find((item) => asRecord(item)?.key === key);
  if (!section || !asRecord(section)) {
    throw new Error(`Expected projection section ${key}`);
  }

  return section as Record<string, unknown>;
}

function updateSection(
  reportData: ReportResponse,
  key: string,
  patch: {
    variantKey: string;
    sceneKey: string;
    styleKey: string;
    primaryAxis: Record<string, unknown>;
    supportAxis?: Record<string, unknown> | null;
    boundaryAxes: string[];
    blocks: Array<Record<string, unknown>>;
  }
) {
  const section = getProjectionSection(reportData, key);
  const payload = asRecord(section.payload) ?? {};
  payload.personalization = {
    variant_key: patch.variantKey,
    scene_key: patch.sceneKey,
    style_key: patch.styleKey,
    primary_axis: patch.primaryAxis,
    support_axis: patch.supportAxis ?? null,
    boundary_axes: patch.boundaryAxes,
    selected_blocks: patch.blocks.map((block) => normalizeText(block.id)),
  };
  payload.blocks = patch.blocks;
  section.payload = payload;
  section._meta = {
    ...(asRecord(section._meta) ?? {}),
    variant_key: patch.variantKey,
  };
}

export function applyMbtiPhase2Fixture(
  reportData: ReportResponse,
  options: MbtiPhase2FixtureOptions = {}
) {
  const eiBand = options.eiBand ?? "clear";
  const eiPct = options.eiPct ?? (eiBand === "strong" ? 77 : 67);
  const eiDelta = options.eiDelta ?? (eiBand === "strong" ? 27 : 17);

  const eiAxis = {
    axis: "EI",
    axis_label: "能量方向",
    side: "E",
    side_label: "外倾",
    pct: eiPct,
    delta: eiDelta,
    state: eiBand,
    band: eiBand,
  };
  const snAxis = {
    axis: "SN",
    axis_label: "信息偏好",
    side: "N",
    side_label: "直觉",
    pct: 64,
    delta: 14,
    state: "clear",
    band: "clear",
  };
  const tfAxis = {
    axis: "TF",
    axis_label: "决策偏好",
    side: "F",
    side_label: "情感",
    pct: 59,
    delta: 9,
    state: "balanced",
    band: "boundary",
  };
  const jpAxis = {
    axis: "JP",
    axis_label: "生活方式",
    side: "P",
    side_label: "感知",
    pct: 57,
    delta: 7,
    state: "moderate",
    band: "boundary",
  };
  const atAxis = {
    axis: "AT",
    axis_label: "身份层",
    side: "T",
    side_label: "敏感",
    pct: 68,
    delta: 18,
    state: "clear",
    band: "clear",
  };

  const overviewVariantKey = `overview:EI.E.${eiBand}:identity.T:boundary.none`;
  const traitOverviewVariantKey = `trait_overview:EI.E.${eiBand}:identity.T:boundary.none`;
  const workStyleKey = `work.primary.EI.E.${eiBand}`;
  const growthStyleKey = `growth.primary.EI.E.${eiBand}`;
  const communicationStyleKey = `communication.primary.EI.E.${eiBand}`;

  const personalization = {
    schema_version: "mbti.personalization.phase2.v1",
    locale: "zh-CN",
    type_code: "ENFP-T",
    identity: "T",
    axis_vector: {
      EI: eiAxis,
      SN: snAxis,
      TF: tfAxis,
      JP: jpAxis,
      AT: atAxis,
    },
    axis_bands: {
      EI: eiBand,
      SN: "clear",
      TF: "boundary",
      JP: "boundary",
      AT: "clear",
    },
    boundary_flags: {
      EI: false,
      SN: false,
      TF: true,
      JP: true,
      AT: false,
    },
    dominant_axes: [eiAxis, snAxis, tfAxis, jpAxis],
    scene_fingerprint: {
      work: {
        scene: "work",
        title: "你的工作模式",
        summary:
          eiBand === "strong"
            ? "在工作里，你通常先用把能量投向外部互动、讨论与现场反馈开局，再用保留弹性、边试边调把节奏拉回可执行。T 身份层会放大你对反馈和结果波动的感知。"
            : "在工作里，你通常先用把能量投向外部互动、讨论与现场反馈开局，再用保留弹性、边试边调把节奏拉回可执行。T 身份层会放大你对反馈和结果波动的感知。",
        style_key: workStyleKey,
        style_keys: [
          workStyleKey,
          "work.support.JP.P.boundary",
          "work.identity.T",
          "work.boundary.JP",
          "work.boundary.TF",
        ],
        chapter_anchor: "career",
        primary_axis: eiAxis,
        support_axis: jpAxis,
        boundary_axes: ["JP", "TF"],
      },
      relationships: {
        scene: "relationships",
        title: "你的关系模式",
        summary:
          "在关系里，你常先以按感受、关系和价值影响来判断让别人感受到你，再通过外部互动和反馈决定要靠近、回应还是设边界。",
        style_key: "relationships.primary.TF.F.boundary",
        style_keys: [
          "relationships.primary.TF.F.boundary",
          "relationships.support.EI.E.clear",
          "relationships.identity.T",
          "relationships.boundary.TF",
          "relationships.boundary.JP",
        ],
        chapter_anchor: "relationships",
        primary_axis: tfAxis,
        support_axis: eiAxis,
        boundary_axes: ["TF", "JP"],
      },
      growth: {
        scene: "growth",
        title: "你的成长模式",
        summary: "成长上，你的高杠杆点通常来自外部互动与反馈；当你再补上趋势感和整体意义时，进步会更稳定。",
        style_key: growthStyleKey,
        style_keys: [
          growthStyleKey,
          "growth.support.SN.N.clear",
          "growth.identity.T",
          "growth.boundary.TF",
          "growth.boundary.JP",
        ],
        chapter_anchor: "growth",
        primary_axis: eiAxis,
        support_axis: snAxis,
        boundary_axes: ["TF", "JP"],
      },
      decision: {
        scene: "decision",
        title: "你的决策模式",
        summary: "做决定时，你通常先靠感受、关系和价值影响来判断缩小范围，再用弹性和边试边调确认是否值得推进。",
        style_key: "decision.primary.TF.F.boundary",
        style_keys: [
          "decision.primary.TF.F.boundary",
          "decision.support.JP.P.boundary",
          "decision.identity.T",
          "decision.boundary.TF",
          "decision.boundary.JP",
        ],
        chapter_anchor: "overview",
        primary_axis: tfAxis,
        support_axis: jpAxis,
        boundary_axes: ["TF", "JP"],
      },
      stress_recovery: {
        scene: "stress_recovery",
        title: "你的压力恢复模式",
        summary: "压力升高时，你容易先滑向保留弹性、边试边调来求快或求稳；恢复阶段则更需要外部互动与反馈把你拉回可用区。",
        style_key: "stress_recovery.primary.JP.P.boundary",
        style_keys: [
          "stress_recovery.primary.JP.P.boundary",
          "stress_recovery.support.EI.E.clear",
          "stress_recovery.identity.T",
          "stress_recovery.boundary.JP",
          "stress_recovery.boundary.TF",
        ],
        chapter_anchor: "growth",
        primary_axis: jpAxis,
        support_axis: eiAxis,
        boundary_axes: ["JP", "TF"],
      },
      communication: {
        scene: "communication",
        title: "你的沟通模式",
        summary: "沟通里，你通常先以外部互动和反馈发起，再用感受、关系和价值影响修正对齐。",
        style_key: communicationStyleKey,
        style_keys: [
          communicationStyleKey,
          "communication.support.TF.F.boundary",
          "communication.identity.T",
          "communication.boundary.TF",
          "communication.boundary.JP",
        ],
        chapter_anchor: "relationships",
        primary_axis: eiAxis,
        support_axis: tfAxis,
        boundary_axes: ["TF", "JP"],
      },
    },
    work_style_keys: [
      workStyleKey,
      "work.support.JP.P.boundary",
      "work.identity.T",
      "work.boundary.JP",
      "work.boundary.TF",
    ],
    relationship_style_keys: [
      "relationships.primary.TF.F.boundary",
      "relationships.support.EI.E.clear",
      "relationships.identity.T",
      "relationships.boundary.TF",
      "relationships.boundary.JP",
    ],
    decision_style_keys: [
      "decision.primary.TF.F.boundary",
      "decision.support.JP.P.boundary",
      "decision.identity.T",
      "decision.boundary.TF",
      "decision.boundary.JP",
    ],
    stress_recovery_keys: [
      "stress_recovery.primary.JP.P.boundary",
      "stress_recovery.support.EI.E.clear",
      "stress_recovery.identity.T",
      "stress_recovery.boundary.JP",
      "stress_recovery.boundary.TF",
    ],
    variant_keys: {
      overview: overviewVariantKey,
      trait_overview: traitOverviewVariantKey,
      "career.summary": `career.summary:EI.E.${eiBand}:identity.T:boundary.JP`,
      "career.advantages": `career.advantages:EI.E.${eiBand}:identity.T:boundary.JP`,
      "growth.summary": `growth.summary:EI.E.${eiBand}:identity.T:boundary.TF`,
      "growth.drainers": "growth.drainers:JP.P.boundary:identity.T:boundary.JP",
      "relationships.summary": "relationships.summary:TF.F.boundary:identity.T:boundary.TF",
      "relationships.rel_advantages": `relationships.rel_advantages:EI.E.${eiBand}:identity.T:boundary.TF`,
      "relationships.rel_risks": "relationships.rel_risks:TF.F.boundary:identity.T:boundary.TF",
    },
    pack_id: "MBTI.cn-mainland.zh-CN.v0.3",
    engine_version: "v1.2",
  };

  getProjectionMeta(reportData).personalization = structuredClone(personalization);
  getReportMeta(reportData).personalization = structuredClone(personalization);

  updateSection(reportData, "overview", {
    variantKey: overviewVariantKey,
    sceneKey: "overview",
    styleKey: "",
    primaryAxis: eiAxis,
    supportAxis: snAxis,
    boundaryAxes: [],
    blocks: [
      {
        id: `overview.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在能量方向上，你的外倾偏好已经很鲜明。你通常不会先停在中间，而会自然把注意力和行动拉向这一侧。"
            : "在能量方向上，你已经呈现出稳定的外倾倾向；它会解释你多数第一反应，但不会压扁另一侧的可用性。",
      },
      {
        id: "overview.scene.EI.E",
        kind: "scene",
        label: "场景应用",
        text: "放到日常场景里，这条主轴通常会表现成：你更容易先把能量投向外部互动、讨论与现场反馈。这会决定别人首先从哪里理解你。",
      },
      {
        id: "overview.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
    ],
  });

  updateSection(reportData, "trait_overview", {
    variantKey: traitOverviewVariantKey,
    sceneKey: "overview",
    styleKey: "",
    primaryAxis: eiAxis,
    supportAxis: snAxis,
    boundaryAxes: [],
    blocks: [
      {
        id: `trait_overview.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在能量方向上，你的外倾偏好已经很鲜明。你通常不会先停在中间，而会自然把注意力和行动拉向这一侧。"
            : "在能量方向上，你已经呈现出稳定的外倾倾向；它会解释你多数第一反应，但不会压扁另一侧的可用性。",
      },
      {
        id: "trait_overview.scene.EI.E",
        kind: "scene",
        label: "场景应用",
        text: "放到日常场景里，这条主轴通常会表现成：你更容易先把能量投向外部互动、讨论与现场反馈。这会决定别人首先从哪里理解你。",
      },
      {
        id: "trait_overview.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
    ],
  });

  updateSection(reportData, "career.summary", {
    variantKey: `career.summary:EI.E.${eiBand}:identity.T:boundary.JP`,
    sceneKey: "work",
    styleKey: workStyleKey,
    primaryAxis: eiAxis,
    supportAxis: jpAxis,
    boundaryAxes: ["JP", "TF"],
    blocks: [
      {
        id: `career.summary.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在工作场景里，外倾已经很鲜明。匹配环境会放大你的效率，不匹配环境也会更快放大摩擦。"
            : "在工作场景里，外倾已经是你较稳定的默认工作方式。它会影响你启动任务、协作和接收反馈的第一反应。",
      },
      {
        id: "career.summary.scene.EI.E",
        kind: "scene",
        label: "场景应用",
        text: "放到工作里，这条主轴更像你的默认操作系统：你更容易先把能量投向外部互动、讨论与现场反馈。它会直接影响你更适配的岗位节奏与协作环境。",
      },
      {
        id: "career.summary.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "career.summary.boundary.JP",
        kind: "boundary",
        label: "边界深解释",
        text: "在工作里，生活方式靠近中线会让你在任务、协作和压力场景下切换齿轮。团队若只看到其中一面，就会误判你的节奏和稳定性。",
      },
    ],
  });

  updateSection(reportData, "career.advantages", {
    variantKey: `career.advantages:EI.E.${eiBand}:identity.T:boundary.JP`,
    sceneKey: "work",
    styleKey: workStyleKey,
    primaryAxis: eiAxis,
    supportAxis: jpAxis,
    boundaryAxes: ["JP", "TF"],
    blocks: [
      {
        id: `career.advantages.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在工作场景里，外倾已经很鲜明。匹配环境会放大你的效率，不匹配环境也会更快放大摩擦。"
            : "在工作场景里，外倾已经是你较稳定的默认工作方式。它会影响你启动任务、协作和接收反馈的第一反应。",
      },
      {
        id: "career.advantages.scene.EI.E",
        kind: "scene",
        label: "场景应用",
        text: "放到工作里，这条主轴更像你的默认操作系统：你更容易先把能量投向外部互动、讨论与现场反馈。它会直接影响你更适配的岗位节奏与协作环境。",
      },
      {
        id: "career.advantages.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "career.advantages.boundary.JP",
        kind: "boundary",
        label: "边界深解释",
        text: "在工作里，生活方式靠近中线会让你在任务、协作和压力场景下切换齿轮。团队若只看到其中一面，就会误判你的节奏和稳定性。",
      },
    ],
  });

  updateSection(reportData, "growth.summary", {
    variantKey: `growth.summary:EI.E.${eiBand}:identity.T:boundary.TF`,
    sceneKey: "growth",
    styleKey: growthStyleKey,
    primaryAxis: eiAxis,
    supportAxis: snAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: `growth.summary.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "成长上，你不缺方向感，缺的是校正机制。因为外倾已经很强，真正有价值的是给它加上稳定的对侧检查点。"
            : "成长上，你更适合先放大这条已经清晰的外倾优势，再为它补一条低成本的对侧校正动作。",
      },
      {
        id: "growth.summary.scene.EI.E",
        kind: "scene",
        label: "场景应用",
        text: "把它放进成长情境时，更有效的做法不是否定这条主轴，而是让它在能量方向上多带一个反向校正动作：你更容易先把能量投向外部互动、讨论与现场反馈。",
      },
      {
        id: "growth.summary.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "growth.summary.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "成长上，决策偏好靠近中线意味着你真正要学的不是选边站，而是识别什么时候该让情感先开路，什么时候该让思考接手收尾。",
      },
    ],
  });

  updateSection(reportData, "growth.drainers", {
    variantKey: "growth.drainers:JP.P.boundary:identity.T:boundary.JP",
    sceneKey: "stress_recovery",
    styleKey: "stress_recovery.primary.JP.P.boundary",
    primaryAxis: jpAxis,
    supportAxis: eiAxis,
    boundaryAxes: ["JP", "TF"],
    blocks: [
      {
        id: "growth.drainers.axis_strength.JP.P.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "在压力与恢复上，这条轴靠近中线，意味着你在过载时和恢复时可能会切到不同挡位。",
      },
      {
        id: "growth.drainers.scene.JP.P",
        kind: "scene",
        label: "场景应用",
        text: "放到压力与恢复里，这条主轴通常会变成你最先启动的自救方式：你更容易先保留弹性、边试边调，再决定最后定版。",
      },
      {
        id: "growth.drainers.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "growth.drainers.boundary.JP",
        kind: "boundary",
        label: "边界深解释",
        text: "压力上来时，生活方式靠近中线意味着你可能先滑向感知来保住当下，再在恢复阶段调回判断重新平衡。",
      },
    ],
  });

  updateSection(reportData, "relationships.summary", {
    variantKey: "relationships.summary:TF.F.boundary:identity.T:boundary.TF",
    sceneKey: "relationships",
    styleKey: "relationships.primary.TF.F.boundary",
    primaryAxis: tfAxis,
    supportAxis: eiAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: "relationships.summary.axis_strength.TF.F.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "在人际里，这条轴接近边界，意味着你不会一直用同一种方式靠近别人；不同关系会唤起你不同侧的表达。",
      },
      {
        id: "relationships.summary.scene.TF.F",
        kind: "scene",
        label: "场景应用",
        text: "放到关系里，这条主轴通常会变成一种相处节奏：你更容易先按感受、关系和价值影响来判断。如果对方没有读懂这一点，就容易把你的方式误解成距离感、迟疑或控制感。",
      },
      {
        id: "relationships.summary.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "relationships.summary.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "在人际里，决策偏好靠近中线意味着你不会永远只走情感这一条路。你可能先用情感靠近，遇到压力或误解时又改用思考保护自己。",
      },
    ],
  });

  updateSection(reportData, "relationships.rel_advantages", {
    variantKey: `relationships.rel_advantages:EI.E.${eiBand}:identity.T:boundary.TF`,
    sceneKey: "communication",
    styleKey: communicationStyleKey,
    primaryAxis: eiAxis,
    supportAxis: tfAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: `relationships.rel_advantages.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在沟通里，外倾已经很鲜明。别人通常会先感受到这一侧，因此误读也往往从这里开始。"
            : "在沟通里，外倾已经是你更常见的起手方式，但当场景变化时，另一侧仍会迅速进场补位。",
      },
      {
        id: "relationships.rel_advantages.scene.EI.E",
        kind: "scene",
        label: "场景应用",
        text: "放到沟通里，这条主轴通常会变成你的起手表达方式：你更容易先把能量投向外部互动、讨论与现场反馈。",
      },
      {
        id: "relationships.rel_advantages.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "relationships.rel_advantages.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "沟通里，决策偏好靠近中线意味着你不会永远只用一种表达方式。你可能先用情感出手，但一旦对方反馈变化，又迅速调动思考补位。",
      },
    ],
  });

  updateSection(reportData, "relationships.rel_risks", {
    variantKey: "relationships.rel_risks:TF.F.boundary:identity.T:boundary.TF",
    sceneKey: "decision",
    styleKey: "decision.primary.TF.F.boundary",
    primaryAxis: tfAxis,
    supportAxis: jpAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: "relationships.rel_risks.axis_strength.TF.F.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "做决定时，这条轴靠近中线，所以你不是单一路径地下判断，而是会在两套入口之间切换。",
      },
      {
        id: "relationships.rel_risks.scene.TF.F",
        kind: "scene",
        label: "场景应用",
        text: "放到决策里，这条主轴会决定你先用哪一种入口缩小范围：你更容易先按感受、关系和价值影响来判断。",
      },
      {
        id: "relationships.rel_risks.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "relationships.rel_risks.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "做决定时，决策偏好靠近中线意味着你并不是摇摆不定，而是在两套判断入口之间来回校准。你可能先用情感开路，再用思考复核；场景一变，顺序也会反过来。",
      },
    ],
  });

  return reportData;
}
