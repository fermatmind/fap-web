import {
  CAREER_DISPLAY_COMPONENT_ORDER,
  CAREER_DISPLAY_COMPONENT_ORDER_V4_2_24,
} from "@/lib/career/displaySurface";

type SelectedCareerDisplaySurfaceFixtureInput = {
  slug: "actors" | "data-scientists" | "registered-nurses" | "accountants-and-auditors" | string;
  locale?: "en" | "zh";
  titleEn?: string;
  titleZh?: string;
};

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
    asset_version: "v4.2",
    template_version: "v4.2",
    asset_type: "career_job_public_display",
    asset_role: "formal_pilot_master",
    status: "ready_for_pilot",
    subject: {
      canonical_slug: "actors",
    },
    claim_permissions: buildDisplaySurfaceClaimPermissions(),
    component_order: [...CAREER_DISPLAY_COMPONENT_ORDER] as string[],
    asset: {
      template_name: "Fermat Career Job Display Template",
      asset_version: "v4.2",
      template_version: "v4.2",
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
}: SelectedCareerDisplaySurfaceFixtureInput) {
  const isZh = locale === "zh";
  const title = isZh ? titleZh : titleEn;
  const secondaryTitle = isZh ? titleEn : titleZh;
  const path = `/${locale}/career/jobs/${slug}`;
  const primaryCtaHref = `/${locale}/tests/holland-career-interest-test-riasec`;

  const fixture = {
    surface_version: "display.surface.v1",
    asset_version: "v4.2",
    template_version: "v4.2",
    asset_type: "career_job_public_display",
    asset_role: "formal_pilot_master",
    status: "ready_for_pilot",
    subject: {
      canonical_slug: slug,
    },
    claim_permissions: buildDisplaySurfaceClaimPermissions(),
    component_order: [...CAREER_DISPLAY_COMPONENT_ORDER] as string[],
    asset: {
      template_name: "Fermat Career Job Display Template",
      asset_version: "v4.2",
      template_version: "v4.2",
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
    Object.assign(fixture.page.content, {
      breadcrumb: { label: title, slug },
      career_snapshot_primary_locale: {
        callout: `${title} 的一句话职业画像。`,
        scene: `${title} 的真实工作场景来自后端已发布正文。`,
        salary: {
          bls_table: [{ 指标: "中位年薪", 数值: "$100,000", 说明: "BLS 公开参考" }],
          china_ai_row: "7/10，较高",
          china_class_row: "中国职业分类参考",
          china_edu_table: [{ 学历段: "入门", 岗位方向: "基础岗位", 说明: "以后端公开口径为准" }],
          china_industry_table: [{ 行业: "主要行业", 需求: "公开市场参考" }],
          china_intl: "跨市场数据只作来源有界的职业探索参考。",
          china_name_row: `${title} / ${titleEn}`,
          china_open: "在招信息以后端公开数据口径为准。",
          china_ref: "中国公开数据与招聘市场样本。",
          china_salary_note: "薪资信息不是个人收入承诺。",
          china_salary_table: [{ "城市/区间": "全国参考", 月薪参考: "公开样本区间" }],
          china_soc_row: "15-0000 / 15-0000.00",
          us_growth: "5%",
          us_median: "$100,000",
        },
      },
      career_snapshot_secondary_locale: {
        bls_table: [{ 指标: "中位年薪", 数值: "$100,000", 说明: "BLS 公开参考" }],
        growth: "5%",
        median: "$100,000",
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
      market_signal_card: {
        callout: "市场信号仅作方向参考。",
        facts: ["信号不是就业保证。"],
        intro: "本板块呈现后端已发布的市场信号。",
        signals: ["复合能力需求持续变化。"],
      },
      adjacent_career_comparison_table: [
        { 职业: "相邻职业", 区别: "工作边界不同", "AI 影响": "按任务结构比较" },
      ],
      ai_impact_table: {
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

  return fixture;
}

export function buildProductionV42LegacyDisplaySurfaceFixture(
  input: SelectedCareerDisplaySurfaceFixtureInput = {
    slug: "adapted-physical-education-specialists",
    titleEn: "Adapted Physical Education Specialists",
    titleZh: "专家教育",
  }
) {
  const fixture = buildSelectedCareerDisplaySurfaceFixture(input);
  fixture.component_order = [...CAREER_DISPLAY_COMPONENT_ORDER_V4_2_24];

  delete (fixture.page.content as Record<string, unknown>).career_ai_description_block;
  delete (fixture.page.content as Record<string, unknown>).career_path_block;

  return fixture;
}
