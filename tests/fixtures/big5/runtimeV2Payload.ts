const DOMAINS = {
  O: { score: 59, band: "mid" },
  C: { score: 32, band: "low" },
  E: { score: 20, band: "low" },
  A: { score: 55, band: "mid" },
  N: { score: 68, band: "high" },
} as const;

const TRAITS = {
  O: { zh: "开放性", en: "Openness" },
  C: { zh: "尽责性", en: "Conscientiousness" },
  E: { zh: "外向性", en: "Extraversion" },
  A: { zh: "宜人性", en: "Agreeableness" },
  N: { zh: "情绪性", en: "Emotional sensitivity" },
} as const;

function block(
  moduleKey: string,
  kind: string,
  suffix: string,
  content: Record<string, unknown>,
) {
  return {
    block_key: `${moduleKey}.${suffix}`,
    block_kind: kind,
    module_key: moduleKey,
    content,
    projection_refs: ["interpretation_scope"],
    registry_refs: [`test_registry:${suffix}`],
    safety_level: "standard",
    evidence_level: "registry_backed",
    shareable: false,
    content_source: "registry_asset",
    fallback_policy: "omit_block",
  };
}

export function createRuntimeV2Payload(options: { percentileAllowed?: boolean } = {}) {
  const percentileAllowed = options.percentileAllowed === true;
  const domains = Object.fromEntries(Object.entries(DOMAINS).map(([code, domain]) => [
    code,
    percentileAllowed ? { ...domain, percentile: domain.score } : { ...domain },
  ]));

  const traitBars = Object.entries(DOMAINS).map(([code, domain]) => block(
    "module_01_hero",
    "trait_bars",
    `domain_registry.${code.toLowerCase()}_${domain.band}.v1`,
    { trait: { code }, band: { internal_band: domain.band } },
  ));

  const traitDeepDives = Object.entries(DOMAINS).map(([code, domain]) => {
    const label = TRAITS[code as keyof typeof TRAITS];
    return block(
      "module_03_trait_deep_dive",
      "trait_deep_dive",
      `domain_registry.${code.toLowerCase()}_${domain.band}.v1`,
      {
        trait: { code, label_zh: label.zh, label_en: label.en },
        band: {
          internal_band: domain.band,
          display_band_label_zh: `${label.zh}区间`,
          display_band_label_en: `${label.en} band`,
        },
        title_zh: `${label.zh}的连续特质解读`,
        title_en: `${label.en} continuous-trait reading`,
        summary_zh: `${label.zh}核心摘要用于异常降级展示。`,
        summary_en: `${label.en} core summary for safe degradation.`,
        body_zh: `${label.zh}正文只解释当前连续维度位置和现实表现。`,
        body_en: `${label.en} body explains the current continuous score position.`,
        benefit_zh: `${label.zh}优势来自在适合场景中使用这一倾向。`,
        benefit_en: `${label.en} strength appears in supportive situations.`,
        cost_zh: `${label.zh}代价会在环境不匹配时增加消耗。`,
        cost_en: `${label.en} trade-off grows when the environment mismatches.`,
        common_misread_zh: `${label.zh}常见误读是把连续倾向当作固定身份。`,
        common_misread_en: `${label.en} is often misread as a fixed identity.`,
        action_zh: `${label.zh}行动是回到一个具体场景做小步验证。`,
        action_en: `${label.en} action is to test one small step in context.`,
      },
    );
  });

  return {
    schema_version: "fap.big5.result_page.v2",
    payload_key: "big5_result_page_v2",
    scale_code: "BIG5_OCEAN",
    content_version: "big5_result_page_v2.runtime.v2",
    package_version: "big5_result_page_v2_v0_4",
    canonical_profile_key: "sensitive_independent_thinker",
    projection_v2: {
      schema_version: "fap.big5.projection.v2",
      attempt_id: "attempt-runtime-v2-test",
      result_version: "big5-engine-v7",
      scale_code: "BIG5_OCEAN",
      form_code: "big5_120",
      domains,
      domain_bands: Object.fromEntries(Object.entries(DOMAINS).map(([code, value]) => [code, value.band])),
      facets: [],
      facet_highlights: [{ key: "N1", bucket: "very_high" }],
      norm_status: "CALIBRATED",
      norm_group_id: "norm-group-current",
      norm_version: "norm-v7",
      quality_status: "valid",
      quality_flags: [],
      profile_signature: {
        signature_key: "sensitive_independent_thinker",
        label_key: "signature.sensitive_independent_thinker",
        is_fixed_type: false,
        system: "trait_signature",
      },
      dominant_couplings: [{ coupling_key: "n_high_x_o_mid" }],
      interpretation_scope: "high_tension_profile",
      confidence_flags: [],
      safety_flags: ["non_diagnostic", "not_type_system"],
      percentile_display_allowed: percentileAllowed,
      public_fields: ["domains", "domain_bands", "facet_highlights"],
      internal_only_fields: [],
    },
    modules: [
      {
        module_key: "module_00_trust_bar",
        blocks: [block("module_00_trust_bar", "trust_bar", "boundary.v1", {
          boundary_zh: "结果描述连续特质，不用于诊断或固定身份分类。",
          boundary_en: "This result describes continuous traits and is not diagnostic.",
        })],
      },
      {
        module_key: "module_01_hero",
        blocks: [
          block("module_01_hero", "hero_summary", "profile_signature.v1", {
            title_zh: "结果摘要｜辅助理解画像",
            title_en: "Result summary | interpretive profile",
            label_role_zh: "辅助理解标签",
            label_role_en: "Interpretive aid",
            body_zh: "这是一段非固定类型的画像正文，只帮助理解当前分数结构。",
            body_en: "This non-type profile body helps interpret the current score structure.",
          }),
          ...traitBars,
        ],
      },
      {
        module_key: "module_02_quick_understanding",
        blocks: [block("module_02_quick_understanding", "quick_cards", "scope.v1", {
          title_zh: "三分钟理解",
          title_en: "Three-minute view",
          summary_zh: "短摘要只保留当前最重要的一条阅读线索。",
          summary_en: "The short card keeps one primary interpretation cue.",
        })],
      },
      { module_key: "module_03_trait_deep_dive", blocks: traitDeepDives },
      {
        module_key: "module_04_coupling",
        blocks: [block("module_04_coupling", "coupling_cards", "n_high_x_o_mid.v1", {
          coupling_key: "n_high_x_o_mid",
          involved_traits: [{ trait: "N", trait_label_zh: "情绪性" }, { trait: "O", trait_label_zh: "开放性" }],
          title_zh: "情绪性与开放性的共同作用",
          title_en: "Emotional sensitivity and openness together",
          body_zh: "这组维度共同影响风险感知和复杂信息处理。",
          body_en: "These dimensions jointly shape risk sensing and complex processing.",
          benefit_zh: "协同优势是更早发现复杂场景里的细微信号。",
          benefit_en: "The combined strength is earlier detection of subtle signals.",
          cost_zh: "张力成本是内部处理时间变长并增加心理负荷。",
          cost_en: "The tension cost is longer internal processing and added load.",
          action_zh: "行动是先区分真实问题和不确定性压力。",
          action_en: "The action is to separate real problems from uncertainty pressure.",
        })],
      },
      {
        module_key: "module_05_facet_reframe",
        blocks: [block("module_05_facet_reframe", "facet_reframe", "n1_high.v1", {
          facet_key: "N1",
          facet_direction: "high",
          facet_label_zh: "焦虑预警",
          facet_label_en: "Anxiety alerting",
          title_zh: "N1 偏高的情境解释",
          title_en: "Context for a high N1 signal",
          body_zh: "这一细分信号来自有限题项推断，需要结合真实场景理解。",
          body_en: "This facet signal is inferred from limited items and needs context.",
          benefit_zh: "细分优势是能更早觉察潜在风险和环境变化。",
          benefit_en: "The facet strength is earlier awareness of possible risks.",
          cost_zh: "细分代价是事情发生前可能已经承担心理成本。",
          cost_en: "The facet cost is carrying load before events occur.",
          action_zh: "细分行动是把预警改写成一个可验证的问题。",
          action_en: "The facet action is to turn the alert into a testable question.",
          facet_support: { inference_only: true, confidence: "medium" },
        })],
      },
      {
        module_key: "module_06_application_matrix",
        blocks: [block("module_06_application_matrix", "application_matrix", "workplace.v1", {
          scenario: "workplace",
          scenario_label_zh: "工作场景",
          scenario_label_en: "Workplace",
          title_zh: "工作场景中的使用方式",
          title_en: "Using the pattern at work",
          body_zh: "工作正文把当前维度结构放回任务和反馈节奏。",
          body_en: "The workplace body returns the pattern to tasks and feedback cycles.",
          benefit_zh: "场景优势是把复杂判断转成可见的工作价值。",
          benefit_en: "The situational strength turns judgment into visible work value.",
          cost_zh: "场景代价是低反馈环境会放大观望和内部消耗。",
          cost_en: "The situational cost is more internal load under low feedback.",
          action_zh: "场景行动是先确认目标、标准和下一次反馈时间。",
          action_en: "The situational action is to confirm goals, standards, and feedback timing.",
          repair_zh: "修复方式是把误解落到一个具体请求上。",
          repair_en: "Repair by turning the misunderstanding into one concrete request.",
        })],
      },
      {
        module_key: "module_07_collaboration_manual",
        blocks: [block("module_07_collaboration_manual", "collaboration_manual", "collaboration.v1", {
          scenario: "collaboration",
          title_zh: "协作说明书",
          title_en: "Collaboration manual",
          body_zh: "协作正文说明适合的沟通、反馈和边界节奏。",
          body_en: "The collaboration body explains communication, feedback, and boundaries.",
          benefit_zh: "协作优势是提前识别风险并保留细腻判断。",
          benefit_en: "The collaboration strength is early risk detection with nuance.",
          cost_zh: "协作摩擦成本是表达滞后时贡献容易被低估。",
          cost_en: "The collaboration friction is being underestimated when expression lags.",
          action_zh: "协作行动是提前约定沟通方式和反馈节点。",
          action_en: "The collaboration action is to agree on communication and feedback points.",
        })],
      },
      {
        module_key: "module_08_share_save",
        blocks: [block("module_08_share_save", "share_save", "safe_actions.v1", {
          summary_zh: "分享只使用当前页面安全链接，不携带敏感分数正文。",
          summary_en: "Sharing uses the safe page URL without sensitive score copy.",
          actions: ["share", "save"],
        })],
      },
      {
        module_key: "module_09_feedback_data_flywheel",
        blocks: [block("module_09_feedback_data_flywheel", "feedback_block", "feedback.v1", {
          summary_zh: "反馈入口会打开真实的结果反馈表单。",
          summary_en: "The feedback control opens the real result feedback form.",
          action_label_zh: "提交结果反馈",
          action_label_en: "Send result feedback",
          feedback_url: "/support?topic=result-feedback",
        })],
      },
      {
        module_key: "module_10_method_privacy",
        blocks: [block("module_10_method_privacy", "method_boundary", "method.v1", {
          title_zh: "方法与边界",
          title_en: "Method and boundaries",
          form_zh: "120 道自陈题",
          form_en: "120 self-report items",
          scoring_zh: "五个连续维度按既有计分模型换算。",
          scoring_en: "Five continuous domains use the established scoring model.",
          error_zh: "自陈测量会受情境、状态和作答方式影响。",
          error_en: "Self-report measurement is affected by context and response style.",
          non_diagnostic_zh: "结果不是医疗或心理诊断，也不替代专业评估。",
          non_diagnostic_en: "The result is not a medical or psychological diagnosis.",
          boundary_zh: "结果用于自我理解，不用于招聘筛选或固定身份分类。",
          boundary_en: "Use the result for reflection, not hiring or fixed identity labels.",
        })],
      },
    ],
  };
}
