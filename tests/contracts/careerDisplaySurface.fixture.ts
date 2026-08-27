import { CAREER_DISPLAY_SUPPORTED_COMPONENTS } from "@/lib/career/displaySurface";
import { CAREER_VISUAL_GROUPS } from "@/lib/career/careerVisualGroups";

type SelectedCareerDisplaySurfaceFixtureInput = {
  slug: "actors" | "data-scientists" | "registered-nurses" | "accountants-and-auditors" | string;
  locale?: "en" | "zh";
  titleEn?: string;
  titleZh?: string;
  presentationV2?: "enhanced" | "legacy" | false;
};

function buildAccountantsAiImpactFixture() {
  const bls = "https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm";
  const ilo = "https://www.ilo.org/publications/generative-ai-and-jobs-refined-global-index-occupational-exposure";
  const cicpa = "https://www.cicpa.org.cn/xxfb/news/202603/t20260305_65842.html";
  return {
    heading: "AI 会取代会计师和审计师吗？",
    answer: "AI 更可能先替代标准化任务，而不是一次性消灭整个职业；专业判断、证据评价和责任仍由人承担。",
    method_cards: [
      { 概念: "AI 能处理哪些会计与审计任务？", 含义: "任务层面的技术可处理性不等于企业已经采用，也不等于岗位会消失。" },
      { 概念: "哪些会计与审计任务会真正自动化？", 含义: "落地取决于数据、系统、控制、成本和监管。" },
      { 概念: "AI 会减少会计师和审计师岗位吗？", 含义: "岗位变化还受到需求、效率、服务扩张和组织采用方式影响。" },
    ],
    task_rows: [
      { 工作方向: "会计", 任务: "凭证识别与分类", 当前变化: "已可高度自动化", 人的控制点: "例外处理与政策判断" },
      { 工作方向: "会计", 任务: "报表与披露初稿", 当前变化: "AI 增强、人工复核", 人的控制点: "估计、披露和报表责任" },
      { 工作方向: "审计", 任务: "异常识别", 当前变化: "AI 增强", 人的控制点: "证据评价和追加程序" },
      { 工作方向: "审计", 任务: "审计意见与签字", 当前变化: "必须由人负责", 人的控制点: "职业怀疑和法律责任" },
    ],
    evidence_intro: "权威来源看似矛盾，是因为职业预测、雇主预期和任务暴露测量对象不同。",
    evidence_rows: [
      { 来源: "BLS", 研究对象: "美国职业预测", 结论: "就业预计增长 5%。", 使用限制: "不能说明每个岗位都安全。", 链接: bls },
      { 来源: "ILO", 研究对象: "全球任务暴露", 结论: "多数岗位更可能被重组。", 使用限制: "暴露不等于裁员。", 链接: ilo },
      { 来源: "中注协", 研究对象: "中国注册会计师执业", 结论: "AI 不能替代专业判断。", 使用限制: "聚焦审计责任边界。", 链接: cicpa },
    ],
    difference_intro: "会计建立记录，审计独立评价记录和控制是否可靠。",
    difference_rows: [
      { 方向: "企业会计", AI主要改变: "交易处理和报表初稿", 仍由人负责: "政策、估计和报表责任" },
      { 方向: "外部／内部审计", AI主要改变: "异常筛查和底稿初稿", 仍由人负责: "证据评价和审计意见" },
    ],
    responsibility_intro: "AI 可以参与处理，但专业人员仍需复核、留痕并负责。",
    responsibility_steps: [
      { 步骤: "任务输入", 说明: "确认数据和目的。" },
      { 步骤: "AI 处理", 说明: "执行分类与筛查。" },
      { 步骤: "人工复核", 说明: "验证事实与结论。" },
      { 步骤: "证据留痕", 说明: "记录输入、输出和采用理由。" },
      { 步骤: "专业签字／责任", 说明: "由专业人员承担最终责任。" },
    ],
    risk_rows: [
      { 风险: "虚构信息", 为什么重要: "可能引用不存在的事实。", 控制方式: "核验原始来源。" },
      { 风险: "数据泄露", 为什么重要: "底稿包含敏感信息。", 控制方式: "使用获批环境和脱敏。" },
      { 风险: "自动化偏误", 为什么重要: "可能削弱职业怀疑。", 控制方式: "设置人工复核和升级点。" },
    ],
    action_rows: [
      { 人群: "学生", 应对重点: "先掌握会计、审计和数据基础。" },
      { 人群: "会计人员", 应对重点: "加强政策、控制和经营解释。" },
      { 人群: "审计人员", 应对重点: "加强证据评价和职业怀疑。" },
    ],
    questions: [
      { 问题: "会计师会被 AI 取代吗？", 回答: "标准化任务会减少，但整个职业不会一次性消失。", 来源: "BLS", 链接: bls },
      { 问题: "审计师会被 AI 取代吗？", 回答: "AI 不能替代证据评价和意见责任。", 来源: "中注协", 链接: cicpa },
      { 问题: "哪些任务最容易受影响？", 回答: "录入、分类、匹配和基础对账暴露最高。", 来源: "ILO", 链接: ilo },
    ],
    authority_links: [
      { 来源: "BLS", 类型: "官方职业预测", 适用范围: "美国就业与薪资", 链接: bls },
      { 来源: "ILO", 类型: "任务暴露研究", 适用范围: "全球生成式 AI 暴露", 链接: ilo },
      { 来源: "中注协", 类型: "行业执业提示", 适用范围: "中国审计责任边界", 链接: cicpa },
    ],
    transition: "明确任务变化后，还需要结合薪资、供需和个人适配继续判断。",
  };
}

export function buildDisplaySurfaceClaimPermissions(overrides: Record<string, unknown> = {}) {
  return {
    integrity_state: "full",
    allow_strong_claim: true,
    allow_ai_strategy: true,
    allow_salary_comparison: true,
    allow_market_signal: true,
    allow_local_proxy_wage: false,
    blocked_claims: [],
    warnings: [],
    evidence_basis: {
      salary: "official",
      ai_exposure: "central_score",
      market_signal: "sample",
      crosswalk: "direct",
    },
    ...overrides,
  };
}

export function buildActorsDisplaySurfaceFixture() {
  return {
    surface_version: "display.surface.v1",
    asset_type: "career_job_public_display",
    asset_role: "formal_pilot_master",
    status: "ready_for_pilot",
    subject: {
      canonical_slug: "actors",
    },
    claim_permissions: buildDisplaySurfaceClaimPermissions(),
    component_order: [...CAREER_DISPLAY_SUPPORTED_COMPONENTS] as string[],
    asset: {
      template_name: "Fermat Career Job Display Template",
      asset_role: "formal_pilot_master",
      asset_type: "career_job_public_display",
      slug: "actors",
      release_gate: "must-not-render",
    },
    page: {
      zh: {
        path: "/zh/career/jobs/actors",
        hero: {
          h1: "演员",
          subtitle: "Actors",
          quick_answer: "演员是把剧本语义、人物关系和情绪节奏转化为镜头或舞台表达的职业。",
          primary_cta: {
            label: "测量我的职业兴趣",
            href: "/zh/tests/holland-career-interest-test-riasec",
          },
        },
        sections: [
          {
            id: "fermat_quick_fit",
            component: "FermatDecisionCard",
            heading: "费马快速判断",
            fit_title: "更适合你，如果",
            fit_items: ["能长期训练", "能承受反馈", "能管理机会"],
            caution_title: "需要谨慎，如果",
            caution_items: ["只喜欢被看见", "不能承受落选", "拒绝不稳定收入"],
          },
          {
            id: "china_snapshot",
            component: "CareerSnapshotCard",
            heading: "职业快照：中国大陆参考",
            rows: [
              ["行业代理", "文化、体育和娱乐业"],
              ["使用边界", "行业参考，不是演员个人收入"],
            ],
            body: "中国大陆数据只作为行业代理参考。",
            source_key: "nbs_2024_wage",
          },
          {
            id: "us_bls_snapshot",
            component: "CareerSnapshotCard",
            heading: "海外参考：美国 BLS 数据",
            rows: [
              ["中位时薪", "$23.33"],
              ["就业增长", "0%"],
            ],
            body: "BLS 显示演员通常是项目制和兼职形态。",
            source_key: "bls_actors_ooh",
          },
          {
            id: "fit_decision",
            component: "FitDecisionChecklist",
            heading: "如何判断自己是否适合演员？",
            intro: "不要只问自己有没有表演欲。",
            checks: [
              { title: "训练承受", question: "能否重复练台词和镜头感？", note: "训练是基本盘。" },
              { title: "反馈承受", question: "能否处理试镜失败？", note: "反馈密度很高。" },
            ],
          },
          {
            id: "riasec_fit",
            component: "RIASECFitBlock",
            heading: "什么兴趣类型更适合做演员？",
            profile: ["艺术型 A 主导", "企业型 E 辅助", "社会型 S 支撑"],
            body: ["A + E + S 同时成立，才更接近可持续演员路径。"],
          },
          {
            id: "personality_fit",
            component: "PersonalityFitBlock",
            heading: "性格内向的人可以当演员吗？",
            answer: "可以，但要看能力结构。",
            traits: ["高开放性", "反馈承受力"],
            body: ["内向者如果具备观察力和长期训练能力，也可能形成优势。"],
          },
          {
            id: "definition",
            component: "DefinitionBlock",
            heading: "演员到底是做什么的？",
            body: ["演员把剧本、人物关系、身体动作和情绪控制转化为表演结果。"],
            source_key: "onet_actors",
          },
          {
            id: "ai_description",
            component: "CareerAiDescriptionBlock",
            heading: "AI 职业解读",
            intro: "基于职业数据和大五人格框架的 AI 解读，帮助理解职业匹配的深层逻辑。",
            body: [
              "职业定义基于 BLS O*NET 标准分类，任务描述来自职业信息网络数据库。",
              "AI 影响评估基于公开研究的任务暴露分析，非预测性结论。",
            ],
            source_key: "onet_definition",
          },
          {
            id: "responsibilities",
            component: "ResponsibilitiesBlock",
            heading: "演员的日常工作包括什么？",
            items: ["阅读剧本", "参加试镜", "记忆台词"],
          },
          {
            id: "work_context",
            component: "WorkContextBlock",
            heading: "演员通常在哪些场景工作？",
            contexts: ["影视剧组", "短剧项目", "配音棚"],
            body: "它通常不是稳定坐班。",
            entry_table: [["院校路径", "强调训练体系"]],
          },
          {
            id: "market_signal",
            component: "MarketSignalCard",
            heading: "招聘样本提示：短剧演员岗位常见要求",
            signal_meta: [
              ["信号类型", "单条招聘 JD 样本"],
              ["捕获时间", "2026-05-02"],
              ["有效期", "2026-08-02"],
              ["使用边界", "样本信号，不代表行业统计"],
            ],
            body: "短剧演员岗位会强调镜头感和快速记台词。",
            keywords: ["镜头感", "快速记台词"],
            interpretation: "这说明岗位也考验快速执行。",
            source_keys: ["zhaopin_short_drama_actor_sample"],
          },
          {
            id: "comparison",
            component: "AdjacentCareerComparisonTable",
            heading: "演员、配音演员、主持人有什么区别？",
            rows: [["演员 vs 配音演员", "演员依赖身体和镜头存在感", "声音表现强的人"]],
          },
          {
            id: "ai_impact",
            component: "AIImpactTable",
            heading: "AI 会不会替代演员？",
            score: "7/10，较高",
            rows: [["背景角色", "现场互动"]],
            question: "哪些环节会被加速？",
            fermat_view: "风险是能否升级到 AI 难以复制的部分。",
          },
          {
            id: "career_risks",
            component: "CareerRiskCards",
            heading: "做演员最大的风险是什么？",
            intro: "演员职业具有高不确定性。",
            career_risks: ["收入不稳定", "项目空档期"],
            caveat: "这不是收入预测。",
          },
          {
            id: "career_path",
            component: "CareerPathBlock",
            heading: "职业发展路径",
            intro: "入门、中级、高级、专家四级的职级定义、薪资范围和核心技能。",
            rows: [
              ["入门级 (Entry)", "0-2年经验", "基础技能训练", "协助执行"],
              ["中级 (Mid)", "3-5年经验", "独立执行", "项目负责"],
              ["高级 (Senior)", "6-10年经验", "团队带领", "策略制定"],
              ["专家级 (Expert)", "10+年经验", "行业影响力", "标准制定"],
            ],
            caveat: "职级数据为行业参考，不是薪资预测或晋升保证。",
            source_key: "career_path_baseline",
          },
          {
            id: "contract_risks",
            component: "ContractRiskBlock",
            heading: "合同与项目风险",
            checks: ["片酬是多少？", "是否包含补拍？"],
            warning: "警惕模糊邀约。",
          },
          {
            id: "next_steps",
            component: "NextStepsBlock",
            heading: "如果想做演员，下一步该准备什么？",
            steps: [{ title: "准备职业材料", items: ["模卡", "试镜片段"] }],
            cta: {
              label: "开始霍兰德职业兴趣测试",
              href: "/zh/tests/holland-career-interest-test-riasec",
            },
          },
          {
            id: "faq",
            component: "CareerFAQBlock",
            heading: "常见问题",
            items: [
              { question: "普通人想做演员，应该先去横店跑组吗？", answer: "不建议把横店当成唯一入口。" },
              { question: "没有表演院校背景，可以做演员吗？", answer: "可以尝试，但不能只靠热情。" },
            ],
          },
        ],
      },
      en: {
        path: "/en/career/jobs/actors",
        hero: {
          h1: "Actors",
          subtitle: "演员",
          quick_answer: "Actors interpret scripted or improvised roles through voice, gesture, movement, timing, and emotional control.",
          primary_cta: {
            label: "Measure my career interests",
            href: "/en/tests/holland-career-interest-test-riasec",
          },
        },
        sections: [
          {
            id: "fermat_quick_fit",
            component: "FermatDecisionCard",
            heading: "Fermat Quick Fit",
            fit_title: "Acting may fit you if",
            fit_items: ["You can train repeatedly", "You can handle rejection", "You can manage opportunities"],
            caution_title: "Be careful if",
            caution_items: ["You only enjoy visibility", "You need stable income", "You avoid auditions"],
          },
          {
            id: "us_bls_snapshot",
            component: "CareerSnapshotCard",
            heading: "Career Snapshot: U.S. Reference",
            rows: [
              ["Median hourly wage", "$23.33"],
              ["Employment growth", "0%"],
            ],
            body: "BLS describes acting as project-based work.",
            source_key: "bls_actors_ooh",
          },
          {
            id: "china_reference",
            component: "CareerSnapshotCard",
            heading: "Mainland China Reference",
            rows: [["Industry proxy", "Culture, sports, and entertainment"]],
            body: "China wage data is industry-level reference only.",
            source_key: "nbs_2024_wage",
          },
          {
            id: "fit_decision",
            component: "FitDecisionChecklist",
            heading: "How to Decide Whether Acting Fits You",
            intro: "Do not ask only whether you like performing.",
            checks: [
              { title: "Training tolerance", question: "Can you rehearse repeatedly?", note: "Practice is the base." },
              { title: "Rejection tolerance", question: "Can you handle auditions?", note: "Feedback is dense." },
            ],
          },
          {
            id: "riasec_fit",
            component: "RIASECFitBlock",
            heading: "RIASEC Fit",
            profile: ["Artistic-primary", "Enterprising-secondary", "Social-support"],
            body: ["High Artistic drive without Enterprising stamina can create weak career execution."],
          },
          {
            id: "personality_fit",
            component: "PersonalityFitBlock",
            heading: "Personality Fit",
            answer: "Acting favors Openness, feedback tolerance, and recovery speed.",
            body: ["Introverted actors can succeed when observation and emotional precision are strong."],
          },
          {
            id: "definition",
            component: "DefinitionBlock",
            heading: "What Do Actors Do?",
            body: ["Actors play parts in stage, television, radio, video, film, or other settings."],
            source_key: "onet_actors",
          },
          {
            id: "ai_description",
            component: "CareerAiDescriptionBlock",
            heading: "AI Career Analysis",
            intro: "AI-powered career interpretation based on occupational data and the Big Five personality framework.",
            body: [
              "The career definition follows BLS O*NET Standard Occupational Classification.",
              "AI impact assessment is based on task exposure analysis from public research, not predictive claims.",
            ],
            source_key: "onet_definition",
          },
          {
            id: "responsibilities",
            component: "ResponsibilitiesBlock",
            heading: "Core Responsibilities",
            items: ["Study scripts", "Attend auditions", "Memorize lines"],
          },
          {
            id: "work_context",
            component: "WorkContextBlock",
            heading: "Where Do Actors Work?",
            contexts: ["production studios", "theaters", "voice studios"],
            body: "Assignments can last from a day to a few months.",
          },
          {
            id: "market_signal",
            component: "MarketSignalCard",
            heading: "What Skills Does the Market Signal?",
            signal_meta: [
              ["Signal type", "Job-posting sample"],
              ["Captured at", "2026-05-02"],
              ["Expires at", "2026-08-02"],
              ["Usage", "Example only, not market-wide statistics"],
            ],
            body: "A short-drama actor job posting sample lists camera presence and quick script learning.",
            keywords: ["camera presence", "quick script learning"],
            source_keys: ["zhaopin_short_drama_actor_sample"],
          },
          {
            id: "comparison",
            component: "AdjacentCareerComparisonTable",
            heading: "Actors Compared With Adjacent Roles",
            rows: [["Actors vs Voice Actors", "Actors rely on body and camera presence.", "People with strong vocal expression"]],
          },
          {
            id: "ai_impact",
            component: "AIImpactTable",
            heading: "Will AI Replace Actors?",
            score: "7/10, relatively high",
            rows: [["Background roles", "Live interaction"]],
            question: "Which parts still require human judgment?",
            fermat_view: "The risk is failing to move toward what AI cannot cheaply replicate.",
          },
          {
            id: "career_risks",
            component: "CareerRiskCards",
            heading: "What Are the Biggest Risks of Acting?",
            intro: "Acting is financially volatile.",
            career_risks: ["short assignments", "income instability"],
            caveat: "This page is not an income forecast.",
          },
          {
            id: "career_path",
            component: "CareerPathBlock",
            heading: "Career Path",
            intro: "Four career levels with role definitions, salary ranges, and core skills.",
            rows: [
              ["Entry", "0-2 years", "Foundation training", "Assisted execution"],
              ["Mid", "3-5 years", "Independent execution", "Project ownership"],
              ["Senior", "6-10 years", "Team leadership", "Strategy development"],
              ["Expert", "10+ years", "Industry influence", "Standard setting"],
            ],
            caveat: "Career path data is an industry reference, not a salary prediction or promotion guarantee.",
            source_key: "career_path_baseline",
          },
          {
            id: "contract_risks",
            component: "ContractRiskBlock",
            heading: "Contract and Project Risks",
            checks: ["What is the rate?", "Are reshoots included?"],
            note: "Eligibility evidence cannot be assumed.",
            source_key: "sag_aftra_eligibility",
          },
          {
            id: "next_steps",
            component: "NextStepsBlock",
            heading: "What Should You Prepare Next?",
            steps: [{ title: "Build your baseline actor kit", items: ["headshot", "self-tape reel"] }],
            cta: {
              label: "Start the Holland Career Interest Test",
              href: "/en/tests/holland-career-interest-test-riasec",
            },
          },
          {
            id: "faq",
            component: "CareerFAQBlock",
            heading: "FAQ",
            items: [
              { question: "Is acting a good career for creative people?", answer: "Creativity alone is not enough." },
              { question: "Do actors need formal training?", answer: "Formal education is not always required, but training is common." },
            ],
          },
        ],
      },
    },
    support_components: {
      review_validity: {
        last_reviewed: "2026-05-02",
        next_review_due: "2026-08-02",
        market_signal_expiry: "2026-08-02",
      },
      boundary_notice: {
        zh: ["职业兴趣测试和人格测试不能保证试镜成功。"],
        en: ["Career interest tests and personality tests do not guarantee casting or income."],
      },
    },
    sources: {
      bls_actors_ooh: {
        label: "BLS Occupational Outlook Handbook: Actors",
        url: "https://www.bls.gov/ooh/entertainment-and-sports/actors.htm",
        usage: "U.S. employment, wage, outlook, work pattern, education and training.",
      },
      onet_actors: {
        label: "O*NET Online: Actors 27-2011.00",
        url: "https://www.onetonline.org/link/details/27-2011.00",
        usage: "Definition, tasks and responsibilities.",
      },
      nbs_2024_wage: {
        label: "National Bureau of Statistics of China: 2024 wage data",
        url: "https://www.stats.gov.cn/xxgk/sjfb/zxfb2020/202505/t20250516_1959826.html",
        usage: "China culture, sports and entertainment industry proxy wage.",
      },
      zhaopin_short_drama_actor_sample: {
        label: "Zhaopin short-drama actor job-posting sample",
        url: "https://www.zhaopin.com/jobdetail/CCL1513997570J40874660413.htm",
        captured_at: "2026-05-02",
        expires_at: "2026-08-02",
        usage: "Single JD sample only, not market-wide statistics.",
      },
    },
    structured_data_from_visible_content: {
      faq_page: {
        en: {
          "@type": "FAQPage",
          mainEntity: [{ name: "Hidden FAQ should not be trusted", acceptedAnswer: { text: "tracking_json" } }],
        },
      },
      occupation: {
        "@type": "Occupation",
        name: "Actors",
        raw_ai_exposure_score: 7,
      },
    },
    tracking_json: {
      raw_ai_exposure_score: 7,
    },
  };
}

export function buildSelectedCareerDisplaySurfaceFixture({
  slug,
  locale = "en",
  titleEn = "Data Scientists",
  titleZh = "数据科学家",
  presentationV2 = false,
}: SelectedCareerDisplaySurfaceFixtureInput) {
  const isZh = locale === "zh";
  const title = isZh ? titleZh : titleEn;
  const secondaryTitle = isZh ? titleEn : titleZh;
  const path = `/${locale}/career/jobs/${slug}`;
  const primaryCtaHref = `/${locale}/tests/holland-career-interest-test-riasec`;

  const fixture = {
    surface_version: "display.surface.v1",
    asset_type: "career_job_public_display",
    asset_role: "formal_pilot_master",
    status: "ready_for_pilot",
    subject: {
      canonical_slug: slug,
      soc_code: "15-0000",
      onet_code: "15-0000.00",
    },
    claim_permissions: buildDisplaySurfaceClaimPermissions(),
    component_order: [...CAREER_DISPLAY_SUPPORTED_COMPONENTS] as string[],
    asset: {
      template_name: "Fermat Career Job Display Template",
      asset_role: "formal_pilot_master",
      asset_type: "career_job_public_display",
      slug,
      release_gate: "must-not-render",
    },
    page: {
      locale: isZh ? "zh-CN" : "en",
      content: {
        path,
        breadcrumb: [],
        hero: {
          h1: title,
          title,
          quick_answer: isZh
            ? `${title} 是一个真实后端 component-keyed display_surface_v1 测试页面。`
            : `${title} is a real backend component-keyed display_surface_v1 test page.`,
        },
        primary_cta: {
          label: isZh ? "测量我的职业兴趣" : "Measure my career interests",
          href: primaryCtaHref,
          test_slug: "holland-career-interest-test-riasec",
          subject_key: slug,
          subject_kind: "career_job",
          entry_surface: "career_job_detail",
          target_action: "start_riasec_test",
          source_page_type: "career_job_detail",
        },
        secondary_cta: {
          label: isZh ? "继续比较职业兴趣" : "Continue comparing career interests",
          hrefs: [
            primaryCtaHref,
            `/${locale}/tests/mbti-personality-test-16-personality-types`,
            `/${locale}/tests/big-five-personality-test-ocean-model`,
          ],
        },
        fermat_decision_card: {
          title: isZh ? "费马快速判断" : "Fermat Quick Fit",
          summary: isZh ? `${title} 适合能持续处理证据、反馈和复杂任务的人。` : `${title} fits people who can sustain evidence work, feedback, and complex tasks.`,
          caveat: isZh ? "这不是录用、收入或长期发展保证。" : "This is not a guarantee of hiring, income, or long-term outcomes.",
        },
        career_snapshot_primary_locale: {
          id: "us_bls_snapshot",
          component: "CareerSnapshotCard",
          heading: isZh ? "职业快照：中国大陆参考" : "Career Snapshot: U.S. Reference",
          body: isZh ? `${title} 的事实基础来自官方职业来源和市场信号边界。` : `${title} uses official occupational sources and bounded market-signal context.`,
          rows: [
            ["Occupation", title],
            ["SOC Code", slug === "registered-nurses" ? "29-1141" : slug === "accountants-and-auditors" ? "13-2011" : "15-2051"],
            ["O*NET Code", slug === "registered-nurses" ? "29-1141.00" : slug === "accountants-and-auditors" ? "13-2011.00" : "15-2051.00"],
          ],
        },
        career_snapshot_secondary_locale: {
          limitation: isZh ? "跨市场数据只作为参考，不是本地薪资承诺。" : "Cross-market data is reference only, not a local salary promise.",
          salary_data_type: "official_reference",
        },
        fit_decision_checklist: {
          checks: [
            {
              title: isZh ? "工作结构承受" : "Work-structure tolerance",
              question: isZh ? "你能长期处理复杂任务和反馈吗？" : "Can you sustain complex work and feedback?",
              note: isZh ? "适配取决于日常工作结构。" : "Fit depends on daily work structure.",
            },
          ],
        },
        riasec_fit_block: {
          profile: ["Investigative-primary", "Conventional-support"],
          body: [isZh ? "RIASEC 是工作风格参考，不是命运判断。" : "RIASEC is work-style guidance, not a destiny judgment."],
        },
        personality_fit_block: {
          answer: isZh ? `${title} 需要可靠性、学习能力和反馈恢复。` : `${title} rewards reliability, learning, and feedback recovery.`,
          body: [isZh ? "人格匹配不是诊断。" : "Personality fit is not a diagnosis."],
        },
        definition_block: isZh ? `${title} 负责把职业任务转化为可验证的工作结果。` : `${title} turns occupational tasks into accountable work outcomes.`,
        career_ai_description_block: {
          id: "career_ai_description",
          component: "CareerAiDescriptionBlock",
          heading: isZh ? "AI 职业解读" : "AI Career Analysis",
          body: isZh ? "AI 可以加速重复任务，但证据判断和责任仍由人承担。" : "AI can accelerate repeatable tasks, while people remain accountable for evidence and judgment.",
        },
        career_path_block: {
          id: "career_path",
          component: "CareerPathBlock",
          heading: isZh ? "职业发展路径" : "Career Path",
          rows: [[isZh ? "起步" : "Entry", isZh ? "建立基础" : "Build a foundation"]],
        },
        responsibilities_block: [isZh ? "分析任务要求" : "Analyze task requirements", isZh ? "维护工作记录" : "Maintain work records"],
        work_context_block: {
          target_queries: [`${title} career`, `${title} salary`],
          search_intent_type: ["career_exploration", "career_fit"],
        },
        market_signal_card: {
          snapshot: {
            body: isZh ? "市场信号只作为样本参考。" : "Market signals are sample references only.",
            rows: [
              ["Signal type", "sample"],
              ["Usage", "Example only, not market-wide statistics"],
            ],
          },
          sample_only_notice: true,
        },
        adjacent_career_comparison_table: [
          [`${title} vs adjacent roles`, "Different work boundary", "People comparing nearby paths"],
        ],
        ai_impact_table: {
          label: "moderate-high",
          score_normalized: "7/10",
          explanation: isZh ? "AI 可能加速部分任务，但不是简单替代预测。" : "AI may accelerate some tasks, but this is not a simple replacement prediction.",
          source: "FermatMind interpretation; not an official labor-market fact source.",
        },
        career_risk_cards: {
          caveat: isZh ? "本页不是收入预测。" : "This page is not an income forecast.",
        },
        contract_project_risk_block: {
          caveat: isZh ? "确认合同、证照和责任边界。" : "Confirm contract, credential, and responsibility boundaries.",
        },
        next_steps_block: {
          cta: {
            label: isZh ? "开始霍兰德职业兴趣测试" : "Start the Holland Career Interest Test",
            href: primaryCtaHref,
          },
          steps: [
            {
              title: isZh ? "验证兴趣适配" : "Validate interest fit",
              items: [isZh ? "先做 RIASEC，再结合 MBTI 或 Big Five。" : "Start with RIASEC, then compare with MBTI or Big Five."],
            },
          ],
        },
        faq_block: {
          items: [
            {
              question: isZh ? `${title} 适合普通人探索吗？` : `Is ${title} a good career fit?`,
              answer: isZh ? "可以探索，但要结合事实来源和工作风格。" : "It can be explored, but should be checked against facts and work style.",
            },
            {
              question: isZh ? `${title} 会被 AI 取代吗？` : `Will AI replace ${title}?`,
              answer: isZh ? "不要做简单替代判断，应拆分任务看风险。" : "Do not use a simple replacement claim; inspect task-level risk.",
            },
          ],
        },
        related_next_pages: {
          intro: isZh ? "继续比较后端发布的相邻职业。" : "Compare adjacent careers published by the backend.",
          links: [
            {
              slug: "financial-analysts",
              source: "self_pick",
              nofollow: false,
              title_en: "Financial Analysts",
            },
          ],
        },
        source_card: {
          source_refs: "sources_json.references",
        },
        review_validity_card: {
          last_reviewed: "2026-05-03",
          next_review_due: "2026-08-03",
        },
        boundary_notice: [
          isZh ? "这不是收入、录用或晋升保证。" : "This page is not an income, hiring, or promotion guarantee.",
          isZh ? "AI 解读不是官方职业事实来源。" : "AI interpretation is not an official occupational fact source.",
        ],
        final_cta: {
          label: isZh ? "测量我的职业兴趣" : "Measure my career interests",
          href: primaryCtaHref,
          test_slug: "holland-career-interest-test-riasec",
          subject_key: slug,
          subject_kind: "career_job",
          entry_surface: "career_job_detail",
          target_action: "start_riasec_test",
          source_page_type: "career_job_detail",
        },
      },
    },
    sources: {
      references: [
        {
          label: `O*NET Online: ${title}`,
          url: "https://www.onetonline.org/",
          usage: "Official occupational definition and work-context reference.",
          source_type: "official",
        },
        {
          label: "FermatMind interpretation",
          usage: "FermatMind synthesis; not an official occupational fact source.",
          source_type: "interpretation",
        },
      ],
    },
    structured_data_from_visible_content: {
      faq_page: {
        "@type": "FAQPage",
        mainEntity: [{ name: "Hidden FAQ should not be trusted", acceptedAnswer: { text: "tracking_json" } }],
      },
      occupation: {
        "@type": "Occupation",
        name: secondaryTitle,
      },
    },
    tracking_json: {
      raw_ai_exposure_score: 7,
    },
  };

  if (isZh) {
    const presentation = buildCareerPresentationV1Fixture({ titleZh, titleEn, href: primaryCtaHref });
    const defaultPresentationLead = presentation.hero.lead;
    // Test-only compatibility: legacy KG fixtures mutate quick_answer after construction.
    // Expose that deterministic test content through the formal projection so production
    // code remains presentation_v1-only and never falls back to the legacy Hero field.
    Object.defineProperty(presentation.hero, "lead", {
      enumerable: true,
      configurable: true,
      get: () => fixture.page.content.hero?.quick_answer ?? defaultPresentationLead,
    });
    Object.assign(fixture, {
      presentation_v1: presentation,
    });
    Object.assign(fixture.page.content, {
      breadcrumb: { label: title, slug },
      career_snapshot_primary_locale: {
        callout: `${title} 的一句话职业画像。`,
        scene: `${title} 的真实工作场景来自后端已发布正文。`,
        salary: {
          bls_table: [
            { 指标: "2025 薪资 · 10 分位", 数值: "$56,020", 说明: "税前月均等值约 $4,668；O*NET 2025 工资分位｜https://www.onetonline.org/link/localwages/13-2011.00?zip=75001" },
            { 指标: "2025 薪资 · 25 分位", 数值: "$67,020", 说明: "税前月均等值约 $5,585；O*NET 2025 工资分位｜https://www.onetonline.org/link/localwages/13-2011.00?zip=75001" },
            { 指标: "2025 薪资 · 中位数", 数值: "$83,680", 说明: "税前月均等值约 $6,973；BLS 2025 工资数据｜https://www.bls.gov/news.release/ocwage.t01.htm" },
            { 指标: "2025 薪资 · 75 分位", 数值: "$109,810", 说明: "税前月均等值约 $9,151；O*NET 2025 工资分位｜https://www.onetonline.org/link/localwages/13-2011.00?zip=75001" },
            { 指标: "2025 薪资 · 90 分位", 数值: "$144,090", 说明: "税前月均等值约 $12,008；O*NET 2025 工资分位｜https://www.onetonline.org/link/localwages/13-2011.00?zip=75001" },
            { 指标: "2024–2034 就业 · 就业规模", 数值: "157.98 万 → 165.26 万人", 说明: "净增加约 7.28 万人；BLS 职业展望｜https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm" },
            { 指标: "2024–2034 就业 · 增长率", 数值: "约 5%", 说明: "高于或接近全职业平均；BLS 职业展望｜https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm" },
            { 指标: "2024–2034 就业 · 年均职位空缺", 数值: "124,200 个", 说明: "包含替代需求；BLS 职业展望｜https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm" },
          ],
          china_ai_row: slug === "accountants-and-auditors"
            ? "AI 更可能造成岗位价值分化：基础录入岗位更容易受到自动化挤压，承担关账、报表、审计证据、内控和复核责任的人员仍在承担判断与责任。"
            : "7/10，较高",
          china_class_row: "官方工资分位、招聘顾问基本月薪范围和单个岗位样本必须分开阅读。",
          china_edu_table: [
            { 学历段: "一线城市 · 应收应付／总账／财务分析", 岗位方向: "¥8,000–20,000", 说明: "月薪 1 万可处于专业岗常见区间。" },
            { 学历段: "二线城市 · 应收应付／总账／财务分析", 岗位方向: "¥6,000–15,000", 说明: "月薪 1 万通常进入专业岗中高区间。" },
            { 学历段: "制造业 · 全盘／总账会计", 岗位方向: "¥8,000–10,000", 说明: "通常要求 ERP、成本、税务和报表。" },
            { 学历段: "事务所审计／企业内审", 岗位方向: "¥8,000–10,000", 说明: "通常要求项目、证据或内控能力。" },
          ],
          china_industry_table: [
            { 行业: "岗位责任与经验", 需求: "独立结账、报表、审计与复核责任影响薪资。" },
            { 行业: "城市、企业与行业", 需求: "不同城市和企业不能共用一个工资区间。" },
            { 行业: "资格、系统与数据能力", 需求: "证书与系统能力只有在岗位需要时才形成价值。" },
          ],
          china_intl: "任仕达 2026 薪酬指南｜https://www.randstad.cn/s3fs-media/cn/public/2026-01/full_report-cn-_2026_market_outlook_salary_guide._1.pdf?VersionId=U3OTHrqNC4P5y8OSSUqJNe03m5xla54s",
          china_name_row: "会计师和审计师一个月工资多少？",
          china_open: "月薪 1 万必须放回城市、企业类型、岗位职责和工资口径中判断。",
          china_open_note: "工作几年能拿到月薪 1 万没有统一答案，独立完成和承担责任比年限更重要。",
          china_ref: "人社部企业薪酬调查｜https://www.mohrss.gov.cn/SYrlzyhshbzb/laodongguanxi_/fwyd/202506/t20250627_544623.html",
          china_salary_note: "工资数据均为税前参考，月均等值不是到手工资，也不构成个人收入承诺。",
          china_salary_table: [
            { "城市/区间": "全国基准", 月薪参考: "中位年工资 7.85 万元，月均等值约 ¥6,540。" },
            { "城市/区间": "北上广深 · 一线城市招聘市场", 月薪参考: "专业岗位基本月薪大致为 ¥8,000–20,000。" },
            { "城市/区间": "省会、新一线等核心城市 · 招聘市场", 月薪参考: "专业岗位基本月薪大致为 ¥6,000–15,000。" },
          ],
          china_soc_row: "中国没有适用于所有城市、企业和岗位的统一月薪。",
          sources_note: "ILO 研究｜https://www.ilo.org/resource/article/generative-ai-work-what-it-means-jobs-europe-and-beyond",
          us_growth: "5%",
          us_median: "$83,680",
        },
      },
      career_snapshot_secondary_locale: {
        bls_table: [
          { 指标: "2025 薪资 · 10 分位", 数值: "$56,020", 说明: "税前月均等值约 $4,668；O*NET 2025 工资分位｜https://www.onetonline.org/link/localwages/13-2011.00?zip=75001" },
          { 指标: "2025 薪资 · 25 分位", 数值: "$67,020", 说明: "税前月均等值约 $5,585；O*NET 2025 工资分位｜https://www.onetonline.org/link/localwages/13-2011.00?zip=75001" },
          { 指标: "2025 薪资 · 中位数", 数值: "$83,680", 说明: "税前月均等值约 $6,973；BLS 2025 工资数据｜https://www.bls.gov/news.release/ocwage.t01.htm" },
          { 指标: "2025 薪资 · 75 分位", 数值: "$109,810", 说明: "税前月均等值约 $9,151；O*NET 2025 工资分位｜https://www.onetonline.org/link/localwages/13-2011.00?zip=75001" },
          { 指标: "2025 薪资 · 90 分位", 数值: "$144,090", 说明: "税前月均等值约 $12,008；O*NET 2025 工资分位｜https://www.onetonline.org/link/localwages/13-2011.00?zip=75001" },
          { 指标: "2024–2034 就业 · 就业规模", 数值: "157.98 万 → 165.26 万人", 说明: "净增加约 7.28 万人；BLS 职业展望｜https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm" },
          { 指标: "2024–2034 就业 · 增长率", 数值: "约 5%", 说明: "高于或接近全职业平均；BLS 职业展望｜https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm" },
          { 指标: "2024–2034 就业 · 年均职位空缺", 数值: "124,200 个", 说明: "包含替代需求；BLS 职业展望｜https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm" },
        ],
        heading: "美国会计师和审计师工资多少？",
        direct_answer: "按 BLS 2025 全国工资数据，会计师和审计师年薪中位数为 $83,680，折合税前月均约 $6,973；10% 的从业者年薪不高于 $56,020，10% 的从业者年薪不低于 $144,090。这里的全国数据合并统计会计师与审计师，不是入门工资、到手月薪或某个城市的岗位报价。",
        wage_heading: "2025 年美国工资分布",
        interpretation_heading: "美国会计师和审计师工资怎么理解？",
        interpretation_rows: [
          { question: "年薪 $83,680 是入门工资吗？", answer: "不是。这是全体会计师和审计师的全国中位数：一半从业者低于它，一半高于它。入门岗位更适合参考 10–25 分位，并结合所在州、城市和岗位职责。" },
          { question: "税前月均 $6,973 是到手工资吗？", answer: "不是。它只是把 $83,680 年薪除以 12 得到的税前月均等值，不能代替实际工资单；联邦与州税、福利扣款、奖金和发薪周期都会改变每月到账金额。" },
          { question: "美国审计师一定比会计师工资高吗？", answer: "不能从这组官方数据得出。BLS 与 O*NET 使用合并职业代码 13-2011，未在全国工资分位中分别公布企业会计、外部审计和内部审计的中位数；应比较同一地区、行业和责任层级的具体岗位。" },
          { question: "CPA 会保证会计师或审计师加薪吗？", answer: "不会。BLS 认为 CPA 等专业认证可能改善求职前景，但没有给出统一工资溢价。是否加薪仍取决于岗位是否使用签字、报告、税务、审计或管理责任。" },
        ],
        industry_heading: "不同行业的美国工资差多少？",
        industry_rows: [
          { industry: "金融与保险", median: "$87,980", note: "高于 2024 年全职业合并中位数；行业数据反映雇主结构，不代表个人报价。" },
          { industry: "公司与企业管理", median: "$86,010", note: "常见于集团总部和管理型财务职能，职责范围仍会造成较大差异。" },
          { industry: "政府（不含州和地方教育及医院）", median: "$81,120", note: "接近 2024 年全国职业中位数，不能直接与私人部门福利结构互换比较。" },
          { industry: "会计、税务、簿记与薪酬服务", median: "$80,510", note: "包含公共会计和相关专业服务；忙季、职级和客户责任不会体现在单一中位数中。" },
        ],
        factors_heading: "哪些因素真正影响美国会计和审计工资？",
        factor_rows: [
          { factor: "地区与生活成本", answer: "BLS/O*NET 支持按州、都会区或 ZIP Code 查询。同一职业的工资会随当地人才供需和生活成本变化，全国中位数不能代替本地报价。" },
          { factor: "经验、岗位层级与责任", answer: "从初级执行到独立关账、项目复核、客户沟通、签字或团队管理，责任范围通常比单纯工作年限更能解释工资差异。" },
          { factor: "雇主、专业方向与资格", answer: "公共会计、企业会计、内审、税务和 IT 审计的职责不同；CPA 等资格可能改善求职前景，但只有岗位实际使用相关能力时才可能形成工资优势。" },
        ],
        outlook_heading: "2024–2034 年美国就业前景",
        boundary: "2025 工资分位来自 BLS OEWS／O*NET；2024 行业中位数和 2024–2034 就业预测使用不同统计时期，不能拼成同一组趋势。OEWS 不覆盖自雇者，也不提供个人税后月薪或具体公司的岗位报价。",
        authority_sources: "BLS 2025 全国工资数据｜https://www.bls.gov/news.release/ocwage.t01.htm；O*NET 2025 工资分位与地区查询｜https://www.onetonline.org/link/localwages/13-2011.00?zip=75001；BLS 职业展望、行业工资与就业预测｜https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm",
        growth: "5%",
        median: "$83,680",
      },
      fit_decision_checklist: {
        boundary: "这不是录用、收入或长期发展保证。",
        how: "先核对日常任务，再结合职业兴趣测评。",
        suit: `${title} 适合愿意持续处理证据、反馈和复杂任务的人。`,
      },
      riasec_fit_block: {
        fit_interest: "RIASEC 用于解释兴趣结构，不做决定论判断。",
        interest: "兴趣满足感来自完成可验证的工作结果。",
        riasec: "ICE",
        riasec_short: "研究型 I + 常规型 C + 企业型 E",
      },
      personality_fit_block: {
        callout: "人格信号只用于工作方式反思。",
        disclaimer: "该匹配为概率性参考，不是诊断。",
        traits: ["可靠性", "学习能力", "反馈恢复"],
      },
      career_ai_description_block: {
        heading: "AI 职业解读",
        body: ["AI 可以加速重复任务，但证据判断和责任仍由人承担。"],
      },
      work_context_block: `${title} 的工作场景与协作边界来自后端公开正文。`,
      career_quick_answers_block: {
        availability: "published",
        schema_version: "career.quick_answers.v1",
        heading: isZh ? "职业速答" : "Career quick answers",
        items: ["qa3", "qa2", "qa1"].map((key) => ({
          key,
          question: isZh ? `${title} 的 ${key} 问题` : `${title} ${key} question`,
          answer: isZh
            ? `${title} 的 ${key} 回答来自后端公开正文。`
            : `${title} ${key} answer comes from the published backend projection.`,
          table: {
            rows: [
              {
                label: isZh ? "核心结论" : "Core finding",
                value: isZh ? `${key} 主要内容` : `${key} primary value`,
                alternate_value: null,
                secondary_value: null,
              },
              {
                label: isZh ? "补充维度" : "Additional dimension",
                value: isZh ? "主值" : "Primary value",
                alternate_value: isZh ? "备选值" : "Alternate value",
                secondary_value: isZh ? "第二备选值" : "Secondary value",
              },
            ],
          },
        })),
      },
      onet_structured_fields_block: {
        availability: "published",
        schema_version: "career.onet_structured_fields.v1",
        heading: isZh ? "O*NET 结构化字段" : "O*NET structured fields",
        rows: [
          { label: "O*NET-SOC Code", value: "15-0000.00", alternate_value: null, secondary_value: null },
          {
            label: isZh ? "职业族" : "Job family",
            value: isZh ? "测试职业族" : "Published occupational family",
            alternate_value: isZh ? "补充分类" : "Related classification",
            secondary_value: null,
          },
        ],
      },
      market_signal_card: {
        callout: "市场信号仅作方向参考。",
        facts: ["信号不是就业保证。"],
        intro: "本板块呈现后端已发布的市场信号。",
        signals: ["复合能力需求持续变化。"],
      },
      adjacent_career_comparison_table: [
        { 职业: "相邻职业", 区别: "工作边界不同", "AI 影响": "按任务结构比较" },
      ],
      ai_impact_table: slug === "accountants-and-auditors" ? buildAccountantsAiImpactFixture() : {
        ai_head_sub: "AI 改变任务，不等于简单取代岗位。",
        ai_s1_bls: "劳动力市场数据来自公开来源。",
        ai_s1_p: "重复任务更容易被自动化。",
        ai_s2_accel: ["资料整理与初步分析"],
        ai_s2_auto: ["标准化录入"],
        ai_s3_list: ["责任判断与沟通"],
        ai_s4_p: "AI 曝光评分衡量任务可复制程度。",
        ai_s4_p2: "高曝光不等于岗位消失。",
        ai_s5_persona: [{ 人群: "在职从业者", 建议: "提升工具协同与判断能力。" }],
        ai_s6_tools: [{ 工具: "分析工具", 定位: "任务协同", 代表能力: "信息整理" }],
        ai_s7_trends: ["人机协作成为常态。"],
      },
      career_risk_cards: {
        badge: "责任 · 压力 · 技术变化",
        callout: "风险清单用于职业探索。",
        fact: "职业风险来自责任边界和任务变化。",
        risks: ["截止压力", "持续学习"],
      },
      career_path_block: [{ 路径: "入门", 说明: "建立基础能力", 风险: "中" }],
      contract_project_risk_block: "确认合同、证照、交付物与责任边界。",
      next_steps_block: {
        hot_skills: ["数据分析", "沟通"],
        responsibilities: ["分析任务要求", "维护工作记录"],
        skills: ["批判性思维", "书面表达"],
      },
      source_card: {
        eeat_signals: { author: "FermatMind 职业内容团队", source: "后端公开职业来源", updated_at: "2026-08" },
        note: "事实与说明均来自后端已发布 projection。",
      },
      review_validity_card: { last_reviewed: "2026-08" },
    });
  }

  if (presentationV2) {
    Object.assign(fixture, {
      presentation_v2: buildCareerPresentationV2Fixture({
        locale,
        title,
        href: primaryCtaHref,
        contentState: presentationV2,
        componentOrder: fixture.component_order,
      }),
    });
  }

  return fixture;
}

export function buildCareerPresentationV2Fixture({
  locale,
  title,
  href,
  contentState,
  componentOrder = CAREER_DISPLAY_SUPPORTED_COMPONENTS,
}: {
  locale: "zh" | "en";
  title: string;
  href: string;
  contentState: "enhanced" | "legacy";
  componentOrder?: readonly string[];
}) {
  const isZh = locale === "zh";
  return {
    contract_version: "career.detail.presentation.v2",
    design_authority: { id: "universal-career-dossier-v2" },
    template_id: "career-dossier-universal-v2",
    locale: isZh ? "zh-CN" : "en",
    hero: {
      title,
      lead: isZh ? `${title} 的权威职业档案。` : `Authoritative career dossier for ${title}.`,
      badges: [{ key: "identity", text: isZh ? "权威职业内容" : "Authoritative career content" }],
      stats: [{ key: "soc", label: "SOC", value: "15-0000", source_label: null }],
      ai_exposure: null,
      cta: { label: isZh ? "测量我的职业兴趣" : "Measure my career interests", href },
    },
    groups: CAREER_VISUAL_GROUPS.flatMap((group) => {
      const componentIds = group.componentIds.filter((componentId) => componentOrder.includes(componentId));
      if (componentIds.length === 0) return [];
      return [{
        id: group.id,
        label: isZh ? group.label : ({
          overview: "Career overview",
          "quick-decision": "Quick decision",
          profile: "Career profile",
          "direction-comparison": "Career direction comparison",
          "ai-impact": "AI impact",
          "china-salary": "Chinese mainland salary reference",
          "us-salary": "United States salary reference",
          fit: "Fit map",
          risk: "Risks and change",
          path: "Development path",
          "market-signals": "Market signals",
          sources: "Questions and sources",
        } as const)[group.id],
        component_ids: componentIds,
        content_state: contentState,
        ...(contentState === "legacy" ? { pending_enrichment: "display_placeholder" } : {}),
      }];
    }),
  };
}

export function buildCareerPresentationV1Fixture({
  titleZh = "会计师和审计师",
  titleEn = "Accountants and auditors",
  href = "/zh/tests/holland-career-interest-test-riasec",
}: {
  titleZh?: string;
  titleEn?: string;
  href?: string;
} = {}) {
  return {
    contract_version: "career.detail.presentation.v1",
    design_authority: {
      id: "career-dossier-page-v1.2",
      sha256: "85c71abac0180a6807222b297e66b0dd611ca79a5cc4bd17db5da416459eafe7",
    },
    hero: {
      title_zh: titleZh,
      title_en: titleEn,
      soc_code: "15-0000",
      onet_code: "15-0000.00",
      badges: [
        { key: "interest", text: "常规型 C 主导 · 研究型 I 辅助", availability: "published" },
        { key: "scene", text: "典型场景：企业财务 / 专业服务", availability: "published" },
        { key: "risk", text: "主要风险：责任 · 压力 · 技术变化", availability: "published" },
      ],
      lead: `${titleZh} 的正式 presentation_v1 导语。`,
      ai_exposure: {
        value: 7,
        scale: 10,
        display_value: "7/10",
        label: "AI任务暴露",
        note: "任务暴露不等于自动化率或岗位消失概率。",
        metric_kind: "fermatmind_internal_rubric",
        source_label: "FermatMind 任务级 rubric",
        availability: "published",
      },
      stats: [
        { key: "us_median_pay", label: "美国年薪中位数", value: "$100,000", source_label: "BLS 公开参考", source_keys: ["salary.bls_table.中位年薪"], availability: "published" },
        { key: "us_growth", label: "就业增长", value: "+5%", source_label: "BLS 公开参考", source_keys: ["salary.bls_table.就业增长"], availability: "published" },
        { key: "employment", label: "美国在岗人数", value: "1,000 人", source_label: "BLS 公开参考", source_keys: ["salary.bls_table.在岗人数"], availability: "published" },
        { key: "annual_openings", label: "美国年均职位空缺", value: "100 个", source_label: null, source_keys: ["salary.bls_table.年均职位空缺"], availability: "published" },
        { key: "ai_exposure", label: "AI任务暴露", value: "7/10", source_label: "FermatMind 任务级 rubric", source_keys: ["identity.ai_score"], availability: "published" },
      ],
      cta: {
        label: `测我的职业兴趣是否适合${titleZh}`,
        href,
        availability: "published",
      },
    },
    notices: {
      snapshot_callout: `${titleZh} 的一句话职业画像。`,
      salary_boundary: "薪资为来源有界参考，不构成收入预测。",
      usage_boundary: ["本页用于职业探索，不构成录用或收入保证。"],
    },
  };
}
