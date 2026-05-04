import { CAREER_DISPLAY_COMPONENT_ORDER } from "@/lib/career/displaySurface";

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

  return {
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
          related_tests: [
            primaryCtaHref,
            `/${locale}/tests/mbti-personality-test-16-personality-types`,
            `/${locale}/tests/big-five-personality-test-ocean-model`,
          ],
          related_jobs: [],
          related_guides: [],
          validation_policy: {
            related_tests: "stable_routes_allowed",
            related_jobs: "requires_later_live_validation",
            related_guides: "requires_later_live_validation",
            render_policy: "hide_or_plain_text_if_unvalidated",
          },
        },
        source_card: {
          source_refs: "sources_json.references",
        },
        review_validity_card: {
          last_reviewed: "2026-05-03",
          next_review_due: "2026-08-03",
        },
        boundary_notice: {
          release_gates: {
            sitemap: false,
            llms: false,
            paid: false,
            backlink: false,
          },
        },
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
}
