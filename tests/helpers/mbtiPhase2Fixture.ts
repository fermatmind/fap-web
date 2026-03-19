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

function resolveProjectionSectionTitle(key: string): string {
  switch (key) {
    case "traits.decision_style":
      return "决策模式";
    case "career.collaboration_fit":
      return "团队协作匹配";
    case "career.work_environment":
      return "工作环境偏好";
    case "career.next_step":
      return "职业下一步";
    case "growth.stress_recovery":
      return "压力与恢复";
    case "relationships.communication_style":
      return "沟通与协作";
    default:
      return key;
  }
}

function createProjectionSectionShell(key: string): Record<string, unknown> {
  return {
    key,
    title: resolveProjectionSectionTitle(key),
    render: "rich_text",
    body_md: "",
    payload: {},
    source: "projection",
  };
}

function getProjectionSection(reportData: ReportResponse, key: string): Record<string, unknown> {
  const projection = reportData.mbti_public_projection_v1 as Record<string, unknown> | null | undefined;
  const sections = Array.isArray(projection?.sections) ? projection.sections : [];
  let section = sections.find((item) => asRecord(item)?.key === key);
  if (!section || !asRecord(section)) {
    section = createProjectionSectionShell(key);
    sections.push(section);
    if (projection) {
      projection.sections = sections;
    }
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
    side: "T",
    side_label: "思考",
    pct: 59,
    delta: 9,
    state: "balanced",
    band: "boundary",
  };
  const jpAxis = {
    axis: "JP",
    axis_label: "生活方式",
    side: "J",
    side_label: "判断",
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
  const roleFitKeys = [
    "role_fit.role.NF",
    `role_fit.primary.EI.E.${eiBand}`,
    "role_fit.support.JP.J.boundary",
    "role_fit.identity.T",
    "role_fit.boundary.JP",
    "role_fit.boundary.TF",
  ];
  const collaborationFitKeys = [
    `collaboration_fit.primary.EI.E.${eiBand}`,
    "collaboration_fit.support.TF.T.boundary",
    "collaboration_fit.identity.T",
    "collaboration_fit.boundary.TF",
    "collaboration_fit.boundary.JP",
    "collaboration_fit.decision_boundary.TF",
    "collaboration_fit.decision_boundary.JP",
  ];
  const workEnvPreferenceKeys = [
    `work_env.primary.EI.E.${eiBand}`,
    "work_env.support.JP.J.boundary",
    "work_env.identity.T",
    "work_env.boundary.JP",
    "work_env.boundary.TF",
    "work_env.preference.high_collaboration",
  ];
  const careerNextStepKeys = [
    "career_next_step.primary.TF.T.boundary",
    "career_next_step.support.JP.J.boundary",
    "career_next_step.identity.T",
    "career_next_step.boundary.TF",
    "career_next_step.boundary.JP",
    "career_next_step.theme.clarify_decision_criteria",
  ];

  const personalization = {
    schema_version: "mbti.personalization.phase5a.v1",
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
            ? "在工作里，你通常先用把能量投向外部互动、讨论与现场反馈开局，再用收拢重点、快速定版把节奏拉回可执行。T 身份层会放大你对反馈和结果波动的感知。"
            : "在工作里，你通常先用把能量投向外部互动、讨论与现场反馈开局，再用收拢重点、快速定版把节奏拉回可执行。T 身份层会放大你对反馈和结果波动的感知。",
        style_key: workStyleKey,
        style_keys: [
          workStyleKey,
          "work.support.JP.J.boundary",
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
          "在关系里，你常先以按逻辑、结构和可验证性来判断稳定边界，再通过外部互动和反馈决定要靠近、回应还是设边界。",
        style_key: "relationships.primary.TF.T.boundary",
        style_keys: [
          "relationships.primary.TF.T.boundary",
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
        summary: "做决定时，你通常先靠逻辑、结构和可验证性来判断缩小范围，再用收拢重点和明确优先级确认是否值得推进。",
        style_key: "decision.primary.TF.T.boundary",
        style_keys: [
          "decision.primary.TF.T.boundary",
          "decision.support.JP.J.boundary",
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
        summary: "压力升高时，你容易先滑向收拢范围、快速定版来求稳；恢复阶段则更需要外部互动与反馈把你拉回可用区。",
        style_key: "stress_recovery.primary.JP.J.boundary",
        style_keys: [
          "stress_recovery.primary.JP.J.boundary",
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
        summary: "沟通里，你通常先以外部互动和反馈发起，再用逻辑框架与协作边界修正对齐。",
        style_key: communicationStyleKey,
        style_keys: [
          communicationStyleKey,
          "communication.support.TF.T.boundary",
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
      "work.support.JP.J.boundary",
      "work.identity.T",
      "work.boundary.JP",
      "work.boundary.TF",
    ],
    relationship_style_keys: [
      "relationships.primary.TF.T.boundary",
      "relationships.support.EI.E.clear",
      "relationships.identity.T",
      "relationships.boundary.TF",
      "relationships.boundary.JP",
    ],
    decision_style_keys: [
      "decision.primary.TF.T.boundary",
      "decision.support.JP.J.boundary",
      "decision.identity.T",
      "decision.boundary.TF",
      "decision.boundary.JP",
    ],
    stress_recovery_keys: [
      "stress_recovery.primary.JP.J.boundary",
      "stress_recovery.support.EI.E.clear",
      "stress_recovery.identity.T",
      "stress_recovery.boundary.JP",
      "stress_recovery.boundary.TF",
    ],
    communication_style_keys: [
      communicationStyleKey,
      "communication.support.TF.T.boundary",
      "communication.identity.T",
      "communication.boundary.TF",
      "communication.boundary.JP",
    ],
    work_style_summary:
      "在工作里，你通常先用把能量投向外部互动、讨论与现场反馈开局，再用收拢重点、快速定版把节奏拉回可执行。T 身份层会放大你对反馈和结果波动的感知。",
    role_fit_keys: roleFitKeys,
    collaboration_fit_keys: collaborationFitKeys,
    work_env_preference_keys: workEnvPreferenceKeys,
    career_next_step_keys: careerNextStepKeys,
    variant_keys: {
      overview: overviewVariantKey,
      trait_overview: traitOverviewVariantKey,
      "traits.decision_style": "traits.decision_style:TF.T.boundary:identity.T:boundary.TF",
      "career.summary": `career.summary:EI.E.${eiBand}:identity.T:boundary.JP`,
      "career.collaboration_fit": `career.collaboration_fit:EI.E.${eiBand}:identity.T:boundary.TF`,
      "career.work_environment": `career.work_environment:EI.E.${eiBand}:identity.T:boundary.JP`,
      "career.advantages": `career.advantages:EI.E.${eiBand}:identity.T:boundary.JP`,
      "growth.summary": `growth.summary:EI.E.${eiBand}:identity.T:boundary.TF`,
      "growth.stress_recovery": "growth.stress_recovery:JP.J.boundary:identity.T:boundary.JP",
      "growth.drainers": "growth.drainers:JP.J.boundary:identity.T:boundary.JP",
      "relationships.summary": "relationships.summary:TF.T.boundary:identity.T:boundary.TF",
      "relationships.communication_style": `relationships.communication_style:EI.E.${eiBand}:identity.T:boundary.TF`,
      "relationships.rel_advantages": `relationships.rel_advantages:EI.E.${eiBand}:identity.T:boundary.TF`,
      "relationships.rel_risks": "relationships.rel_risks:TF.T.boundary:identity.T:boundary.TF",
      "career.next_step": "career.next_step:TF.T.boundary:identity.T:boundary.TF",
    },
    pack_id: "MBTI.cn-mainland.zh-CN.v0.3",
    engine_version: "v1.2",
    dynamic_sections_version: "phase5a.v1",
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

  updateSection(reportData, "traits.decision_style", {
    variantKey: "traits.decision_style:TF.T.boundary:identity.T:boundary.TF",
    sceneKey: "decision",
    styleKey: "decision.primary.TF.T.boundary",
    primaryAxis: tfAxis,
    supportAxis: jpAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: "traits.decision_style.axis_strength.TF.T.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "做决定时，这条轴靠近中线，所以你不是单一路径地下判断，而是会在两套入口之间切换。",
      },
      {
        id: "traits.decision_style.decision.TF.T",
        kind: "decision",
        label: "决策场景",
        text: "放到决策里，这条主轴会决定你先用哪一种入口缩小范围：你更容易先按逻辑、结构和可验证性来判断。",
      },
      {
        id: "traits.decision_style.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "traits.decision_style.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "做决定时，决策偏好靠近中线意味着你并不是摇摆不定，而是在两套判断入口之间来回校准。",
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
        kind: "work_style",
        label: "工作风格桥接",
        text: "放到工作方式上，这条主轴会决定你默认怎么开工、怎么协作、怎么接收反馈：你更容易先把能量投向外部互动、讨论与现场反馈。",
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

  updateSection(reportData, "career.collaboration_fit", {
    variantKey: `career.collaboration_fit:EI.E.${eiBand}:identity.T:boundary.TF`,
    sceneKey: "communication",
    styleKey: communicationStyleKey,
    primaryAxis: eiAxis,
    supportAxis: tfAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: `career.collaboration_fit.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在团队协作里，外倾已经很鲜明。你更容易把问题直接拉到桌面上，也更需要团队跟得上你的反馈速度。"
            : "在团队协作里，外倾已经是你较稳定的默认对齐方式。你通常会先通过互动确认方向，再推进下一步。",
      },
      {
        id: "career.collaboration_fit.collaboration_fit.EI.E",
        kind: "collaboration_fit",
        label: "协作匹配桥接",
        text: "放到团队协作里，这条主轴会决定你更自然的对齐、配合与修正方式：你更容易先把能量投向外部互动、讨论与现场反馈。",
      },
      {
        id: "career.collaboration_fit.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在协作里更敏感于反馈质量、标准清晰度和协作中的微小失真。",
      },
      {
        id: "career.collaboration_fit.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "在团队里，决策偏好靠近中线意味着你会在标准与关系之间来回校准。别人如果只看到其中一面，就会误判你到底是在推进结果，还是在照顾人。",
      },
    ],
  });

  updateSection(reportData, "career.work_environment", {
    variantKey: `career.work_environment:EI.E.${eiBand}:identity.T:boundary.JP`,
    sceneKey: "work",
    styleKey: workStyleKey,
    primaryAxis: eiAxis,
    supportAxis: jpAxis,
    boundaryAxes: ["JP", "TF"],
    blocks: [
      {
        id: `career.work_environment.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在工作环境上，外倾已经很鲜明。高互动、高反馈、高节奏的环境更容易把你的效率拉满。"
            : "在工作环境上，外倾已经是你较稳定的默认入口。环境越能提供互动和反馈，你越容易更快进入状态。",
      },
      {
        id: "career.work_environment.work_env.EI.E",
        kind: "work_env",
        label: "工作环境桥接",
        text: "放到工作环境里，这条主轴会决定你更需要哪类节奏、边界和反馈方式：你更容易先把能量投向外部互动、讨论与现场反馈。",
      },
      {
        id: "career.work_environment.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会放大你对环境噪音、反馈质量和结果波动的感知，所以环境匹配会直接影响你是否稳定输出。",
      },
      {
        id: "career.work_environment.boundary.JP",
        kind: "boundary",
        label: "边界深解释",
        text: "在工作环境上，生活方式靠近中线意味着你既需要一定结构，也需要一定弹性。真正适配你的不是绝对死板或绝对松散，而是节奏感可被商量的环境。",
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

  updateSection(reportData, "career.next_step", {
    variantKey: "career.next_step:TF.T.boundary:identity.T:boundary.TF",
    sceneKey: "decision",
    styleKey: "decision.primary.TF.T.boundary",
    primaryAxis: tfAxis,
    supportAxis: jpAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: "career.next_step.axis_strength.TF.T.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "职业下一步上，这条轴靠近中线，说明你做选择时不是只看一个标准，而是会在两套入口之间反复校准。",
      },
      {
        id: "career.next_step.career_next_step.TF.T",
        kind: "career_next_step",
        label: "职业下一步桥接",
        text: "放到职业下一步，这条主轴提示你先去试一个更贴近自己的动作：先把你看重的判断标准写清楚，再用一次真实对话或岗位验证去校正，而不是只在脑内继续拉扯。",
      },
      {
        id: "career.next_step.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你更在意这一步是否真的靠谱，所以与其逼自己马上定案，不如先把标准说清楚、再去验证。",
      },
      {
        id: "career.next_step.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "在职业选择上，决策偏好靠近中线并不代表你不稳定，而是你会同时守住标准与关系、速度与准确度。最有效的下一步，是让这两条线都能被看见。",
      },
    ],
  });

  updateSection(reportData, "growth.drainers", {
    variantKey: "growth.drainers:JP.J.boundary:identity.T:boundary.JP",
    sceneKey: "stress_recovery",
    styleKey: "stress_recovery.primary.JP.J.boundary",
    primaryAxis: jpAxis,
    supportAxis: eiAxis,
    boundaryAxes: ["JP", "TF"],
    blocks: [
      {
        id: "growth.drainers.axis_strength.JP.J.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "在压力与恢复上，这条轴靠近中线，意味着你在过载时和恢复时可能会切到不同挡位。",
      },
      {
        id: "growth.drainers.scene.JP.J",
        kind: "scene",
        label: "场景应用",
        text: "放到压力与恢复里，这条主轴通常会变成你最先启动的自救方式：你更容易先收拢范围、快速定版，再用结构把局面稳住。",
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

  updateSection(reportData, "growth.stress_recovery", {
    variantKey: "growth.stress_recovery:JP.J.boundary:identity.T:boundary.JP",
    sceneKey: "stress_recovery",
    styleKey: "stress_recovery.primary.JP.J.boundary",
    primaryAxis: jpAxis,
    supportAxis: eiAxis,
    boundaryAxes: ["JP", "TF"],
    blocks: [
      {
        id: "growth.stress_recovery.axis_strength.JP.J.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "在压力与恢复上，这条轴靠近中线，意味着你在过载时和恢复时可能会切到不同挡位。",
      },
      {
        id: "growth.stress_recovery.stress_recovery.JP.J",
        kind: "stress_recovery",
        label: "压力恢复场景",
        text: "放到压力与恢复里，这条主轴通常会变成你最先启动的自救方式：你更容易先收拢范围、快速定版，再用结构把局面稳住。",
      },
      {
        id: "growth.stress_recovery.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "growth.stress_recovery.boundary.JP",
        kind: "boundary",
        label: "边界深解释",
        text: "压力上来时，生活方式靠近中线意味着你可能先滑向判断来收拢局面，再在恢复阶段把弹性找回来。",
      },
    ],
  });

  updateSection(reportData, "relationships.summary", {
    variantKey: "relationships.summary:TF.T.boundary:identity.T:boundary.TF",
    sceneKey: "relationships",
    styleKey: "relationships.primary.TF.T.boundary",
    primaryAxis: tfAxis,
    supportAxis: eiAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: "relationships.summary.axis_strength.TF.T.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "在人际里，这条轴接近边界，意味着你不会一直用同一种方式靠近别人；不同关系会唤起你不同侧的表达。",
      },
      {
        id: "relationships.summary.scene.TF.T",
        kind: "scene",
        label: "场景应用",
        text: "放到关系里，这条主轴通常会变成一种相处节奏：你更容易先按逻辑、结构和可验证性来判断。如果对方没有读懂这一点，就容易把你的方式误解成距离感、迟疑或控制感。",
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
        text: "在人际里，决策偏好靠近中线意味着你不会永远只走思考这一条路。你可能先用思考稳住边界，遇到压力或误解时又改用情感修复关系。",
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

  updateSection(reportData, "relationships.communication_style", {
    variantKey: `relationships.communication_style:EI.E.${eiBand}:identity.T:boundary.TF`,
    sceneKey: "communication",
    styleKey: communicationStyleKey,
    primaryAxis: eiAxis,
    supportAxis: tfAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: `relationships.communication_style.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在沟通里，外倾已经很鲜明。别人通常会先感受到这一侧，因此误读也往往从这里开始。"
            : "在沟通里，外倾已经是你更常见的起手方式，但当场景变化时，另一侧仍会迅速进场补位。",
      },
      {
        id: "relationships.communication_style.communication.EI.E",
        kind: "communication",
        label: "沟通协作场景",
        text: "放到沟通里，这条主轴通常会变成你的起手表达方式：你更容易先把能量投向外部互动、讨论与现场反馈，再用逻辑框架把协作收束起来。",
      },
      {
        id: "relationships.communication_style.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "relationships.communication_style.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "沟通里，决策偏好靠近中线意味着你不会永远只用一种表达方式；别人如果只看到前半段，常会误读你的真实意图。",
      },
    ],
  });

  updateSection(reportData, "relationships.rel_risks", {
    variantKey: "relationships.rel_risks:TF.T.boundary:identity.T:boundary.TF",
    sceneKey: "decision",
    styleKey: "decision.primary.TF.T.boundary",
    primaryAxis: tfAxis,
    supportAxis: jpAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: "relationships.rel_risks.axis_strength.TF.T.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "做决定时，这条轴靠近中线，所以你不是单一路径地下判断，而是会在两套入口之间切换。",
      },
      {
        id: "relationships.rel_risks.scene.TF.T",
        kind: "scene",
        label: "场景应用",
        text: "放到决策里，这条主轴会决定你先用哪一种入口缩小范围：你更容易先按逻辑、结构和可验证性来判断。",
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
        text: "做决定时，决策偏好靠近中线意味着你并不是摇摆不定，而是在两套判断入口之间来回校准。你可能先用思考开路，再用情感复核；场景一变，顺序也会反过来。",
      },
    ],
  });

  return reportData;
}
