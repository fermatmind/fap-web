#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = getArgValue("--generated-date") ?? "2026-07-05";
const GENERATED_AT = getArgValue("--generated-at") ?? "2026-07-05T12:00:00.000Z";
const OUTPUT_JSON = resolveRepoPath(
  getArgValue("--output-json") ??
    `docs/seo/personality/mbti-content-15-top-blocker-assets-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = resolveRepoPath(
  getArgValue("--output-md") ??
    `docs/seo/personality/mbti-content-15-top-blocker-assets-${GENERATED_DATE}.md`,
);
const OUTPUT_CSV = resolveRepoPath(
  getArgValue("--output-csv") ??
    `docs/seo/personality/mbti-content-15-top-blocker-assets-${GENERATED_DATE}.csv`,
);

const SOURCE_LEDGER = [
  {
    source_id: "qa14_blocker_report",
    source_type: "internal_qa_artifact",
    path: "docs/seo/personality/mbti-qa-14-semantic-duplicate-gate-2026-07-04.json",
    how_used: "Select pages blocked by answer surface, scenario specificity, FAQ, or template marker gates.",
  },
  {
    source_id: "ops08_gsc_priority_queue",
    source_type: "internal_gsc_priority_artifact",
    path: "docs/seo/personality/mbti-ops-08-gsc-priority-monitoring-2026-07-04.json",
    how_used: "Rank profile and comparison targets with early GSC visibility and search opportunity.",
  },
  {
    source_id: "gsc11_query_evidence",
    source_type: "sanitized_gsc_handoff_artifact",
    path: "docs/seo/personality/mbti-gsc-11-query-evidence-export-2026-07-04.json",
    how_used: "Separate captured query rows from pending rows so copy does not overclaim unverified query fit.",
  },
  {
    source_id: "operator_chrome_gsc_7d_2026_07_05",
    source_type: "operator_visible_gsc_snapshot",
    path: "Chrome GSC visible query table, 2026-06-27..2026-07-03",
    how_used: "Treat mbti测试, intp-a, and isfp-a rows as short-window prioritization signals only.",
  },
];

const COMMON_BOUNDARY = {
  medical_diagnostic_claim: false,
  hiring_screen_claim: false,
  official_mbti_affiliation_claim: false,
  deterministic_career_claim: false,
  relationship_prediction_claim: false,
  private_result_copy_used: false,
  frontend_editorial_fallback: false,
};

const PROFILE_TARGETS = [
  {
    path: "/zh/personality/istj-a",
    code: "ISTJ-A",
    base: "ISTJ",
    variant: "A",
    archetype: "物流师",
    priority: "P0",
    status: "repair",
    gsc: "OPS08 28d: 1 click / 23 impressions / position 9.0",
    qa: ["answer_surface_gate", "scenario_specificity_gate", "faq_gate", "template_marker_gate"],
    traits: "责任感、经验校准和可靠执行",
    quick: "ISTJ-A 是偏稳定型的 ISTJ：做事常先确认规则、历史经验和交付标准，再用清单、流程和复核把承诺落地。A 型不是更优秀，而是表示在反馈和压力下更容易维持自我确认；真正的成长点是别让“我已经按规则做了”替代必要的沟通和情境更新。",
    fit: "需要稳定执行、合规复核、记录准确和长期维护的场景，例如财务流程、运营管理、质量控制、行政制度、项目收尾和档案管理。",
    unfit: "变化频繁但没有规则边界、只奖励即兴表达、长期否定复盘价值，或要求持续打破已验证流程的环境。",
    misunderstanding: "ISTJ-A 容易被误读为保守或冷淡，其实核心往往是降低失误和保护承诺；问题不在重视规则，而在规则失效时是否愿意更新判断。",
    atDifference: "ISTJ-A 与 ISTJ-T 的差异重点是反馈恢复速度和自我确认方式。A 型更快回到执行，T 型更容易再次检查风险；两者都需要保留外部证据入口。",
    work: "在工作里，ISTJ-A 适合把任务拆成验收标准、责任人、截止时间和复核点。高质量表现不是盲目服从流程，而是能说明为什么流程存在、何时需要升级例外。",
    relationship: "关系中要把“我在负责”翻译成对方听得懂的关心，例如提前说明计划、解释限制、确认对方是要建议还是安慰。",
    stress: "压力下可能把错误归因于别人不守规则，或把临时变化视为威胁。有效修正是先区分原则、流程和偏好，再决定哪些必须坚持、哪些可以调整。",
    links: ["/zh/personality/istj-t", "/zh/personality/istj-a-vs-istj-t", "/zh/personality/istj-vs-isfj"],
  },
  {
    path: "/zh/personality/istp-a",
    code: "ISTP-A",
    base: "ISTP",
    variant: "A",
    archetype: "鉴赏家",
    priority: "P0",
    status: "repair",
    gsc: "OPS08 28d: 0 clicks / 7 impressions / position 7.3; query export pending",
    qa: ["answer_surface_gate", "scenario_specificity_gate", "faq_gate", "template_marker_gate"],
    traits: "动手排障、现实观察和低噪声决策",
    quick: "ISTP-A 是偏稳定型的 ISTP：遇到问题时通常先看系统怎么运作、哪里卡住、用什么工具能最快验证。A 型让它在不确定反馈下更容易保持冷静，但也可能让别人以为他不需要解释、不需要协作。重点不是“独来独往”，而是把现场判断转成可共享的证据。",
    fit: "适合故障排查、设备维护、工程现场、数据排错、产品试验、运动技能、手作工艺和需要快速验证假设的任务。",
    unfit: "长期只有会议和抽象承诺、无法接触真实系统、错误不能被实验验证，或每一步都必须先取得情绪一致的环境。",
    misunderstanding: "ISTP-A 常被误读为疏离或冒险，其实成熟的 ISTP-A 更像冷静的现场观察者：先确认事实，再决定是否行动。",
    atDifference: "ISTP-A 比 ISTP-T 更容易相信自己的现场判断；这能加快行动，也需要用日志、数据或同伴复核防止漏看长期风险。",
    work: "工作中可把排障过程写成“现象、假设、验证、结果、下一步”，让团队理解判断来源，而不是只看到一个突然的技术决定。",
    relationship: "关系里要提前说明自己需要空间是为了恢复和思考，不是惩罚对方；表达边界时同时给出可协商的时间点。",
    stress: "压力下可能直接切断沟通、只修问题不解释，或过度相信手感。修正方式是把关键判断外化成证据，并主动同步影响范围。",
    links: ["/zh/personality/istp-t", "/zh/personality/istp-a-vs-istp-t", "/zh/personality/isfp-a"],
  },
  {
    path: "/zh/personality/isfp-a",
    code: "ISFP-A",
    base: "ISFP",
    variant: "A",
    archetype: "探险家",
    priority: "P0",
    status: "repair",
    gsc: "Chrome GSC 7d: 1 click / 4 impressions / position 5.3",
    qa: ["answer_surface_gate", "scenario_specificity_gate", "faq_gate", "template_marker_gate"],
    traits: "审美判断、体验敏感和安静表达",
    quick: "ISFP-A 是偏稳定型的 ISFP：它常通过真实体验、细节质感和个人价值来判断什么值得投入。A 型意味着在外界评价变化时更容易守住自己的偏好，但也可能让真实需要被安静地藏起来。关键不是“随性”，而是把感受、边界和作品标准表达清楚。",
    fit: "适合设计、摄影、护理体验、手作、内容创作、品牌视觉、生活方式产品和需要贴近用户感受的现场服务。",
    unfit: "只看抽象 KPI、长期否定审美和体验、要求高压辩论证明价值，或不能给个人节奏和作品迭代空间的环境。",
    misunderstanding: "ISFP-A 容易被看成没有规划或只凭感觉，其实它的判断常来自长期积累的体验标准，只是不一定用管理语言表达。",
    atDifference: "ISFP-A 比 ISFP-T 更容易保留自己的审美判断，不会因一次反馈立刻推翻选择；但仍要把主观偏好转成用户、场景和效果证据。",
    work: "工作里建议把“好不好看、舒不舒服、对不对味”拆成颜色、材质、动线、语气、使用场景和反馈记录，方便团队协作。",
    relationship: "关系中不要只靠沉默维护和平。需要在委屈累积前说明偏好、底线和可接受的调整方式。",
    stress: "压力下可能逃避冲突、延迟表达或突然退出。修正方式是提前设置低冲突沟通入口，把真实感受从结论改写成可讨论的信息。",
    links: ["/zh/personality/isfp-t", "/zh/personality/isfp-a-vs-isfp-t", "/zh/personality/istp-a"],
  },
  {
    path: "/zh/personality/esfj-a",
    code: "ESFJ-A",
    base: "ESFJ",
    variant: "A",
    archetype: "执政官",
    priority: "P0",
    status: "repair",
    gsc: "OPS08 28d: 0 clicks / 1 impression / position 8.0",
    qa: ["answer_surface_gate", "scenario_specificity_gate", "faq_gate", "template_marker_gate"],
    traits: "关系照顾、秩序协调和实际支持",
    quick: "ESFJ-A 是偏稳定型的 ESFJ：它通常先关注谁需要支持、关系是否顺畅、事情能否被安排好。A 型让它在被评价时更容易保持方向，但也可能把“大家都没问题”当成真实共识。关键是让照顾变成清晰协作，而不是替别人承担所有情绪和责任。",
    fit: "适合客户成功、社区运营、教育支持、行政协调、医疗陪伴、活动执行、团队服务和需要稳定人际秩序的岗位。",
    unfit: "长期鼓励冷漠竞争、只奖励个人英雄、规则频繁改变却不沟通原因，或把照顾型劳动视为理所当然的环境。",
    misunderstanding: "ESFJ-A 容易被误读为讨好或保守，其实健康表现是把人的需要、流程和资源整合起来，让群体运行更顺。",
    atDifference: "ESFJ-A 比 ESFJ-T 更容易相信自己的关系判断，能稳定推进协调；风险是低估隐性不满或少数人的不同需求。",
    work: "工作中要把“我来安排”升级为透明分工：谁负责、谁知情、谁有反对入口、何时复盘，而不是靠个人记忆维持秩序。",
    relationship: "关系里要避免把付出当作默认语言。直接说出期待、边界和疲惫，比等对方自动理解更可靠。",
    stress: "压力下可能过度介入别人的安排，或把冲突看成关系失败。修正方式是先确认事实和角色，再决定是否需要情感支持、资源协调或明确拒绝。",
    links: ["/zh/personality/esfj-t", "/zh/personality/esfj-a-vs-esfj-t", "/zh/personality/istj-vs-isfj"],
  },
];

const VERIFY_ONLY_PROFILE = {
  path: "/zh/personality/intp-a",
  code: "INTP-A",
  base: "INTP",
  variant: "A",
  priority: "P0",
  status: "verify_only",
  gsc: "Chrome GSC 7d: 1 click / 25 impressions / position 6.3; GSC11 captured query row: intp-a",
  verification_notes: [
    "Keep as observed opportunity target because it has current GSC query evidence.",
    "Do not rewrite body in CONTENT-15 unless QA-14 or downstream CMS dry-run flags a blocker.",
    "Verify public internal links to MBTI test, personality hub, sibling T page, and INTP A/T comparison before promotion.",
  ],
};

const COMPARISON_TARGETS = [
  {
    path: "/zh/personality/intp-a-vs-intp-t",
    pair: ["INTP-A", "INTP-T"],
    kind: "at_comparison",
    priority: "P0",
    gsc: "OPS08 28d: 0 clicks / 2 impressions / position 11.0; query export pending",
    qa: ["scenario_specificity_gate", "faq_gate"],
    title: "INTP-A 和 INTP-T 的区别：自我确认、复盘强度和行动节奏",
    maxDifference: "INTP-A 更容易在逻辑自洽后推进实验，INTP-T 更容易继续检查漏洞和外部评价。最大区别不是聪明程度，而是面对不确定性时先行动还是先复盘。",
    table: [
      ["决策启动", "先用可运行假设推进", "先补齐漏洞和反证"],
      ["被质疑时", "回到模型和证据，较快恢复", "更容易重新检查自己是否遗漏"],
      ["学习方式", "偏独立试错和系统搭建", "偏多轮校准和精细修正"],
      ["风险", "低估他人的理解成本", "把复盘拖成迟迟不发布"],
    ],
    misread: "不要把 INTP-A 看成不反思，也不要把 INTP-T 看成没主见。两者都可能很理性，只是压力下的校准顺序不同。",
    scenario: "在产品原型里，INTP-A 可能先搭一个可验证版本，让数据暴露问题；INTP-T 可能先梳理边界条件，避免实验误导。团队需要同时保留快速实验和反证复盘。",
    avoid: "不要只用外向程度、成绩或职业头衔判断 A/T。观察一个人在模型被挑战后，是先稳定推进，还是先重新检查评价和风险。",
    links: ["/zh/personality/intp-a", "/zh/personality/intp-t", "/zh/personality/intj-vs-intp"],
  },
  {
    path: "/zh/personality/intj-vs-intp",
    pair: ["INTJ", "INTP"],
    kind: "hot_comparison",
    priority: "P1",
    gsc: "OPS08 comparison backlog; no captured query row yet",
    qa: ["scenario_specificity_gate", "faq_gate"],
    title: "INTJ 和 INTP 的区别：战略收敛与模型探索",
    maxDifference: "INTJ 更容易把复杂信息收敛成路线图，INTP 更容易把问题拆成可讨论的模型。最大区别不是谁更理性，而是谁更快走向执行结构。",
    table: [
      ["问题入口", "先问长期方向和关键路径", "先问概念是否自洽"],
      ["输出形态", "路线、优先级、决策标准", "模型、假设、反例空间"],
      ["协作痛点", "觉得讨论没有推进", "觉得结论太早关闭"],
      ["成熟表现", "保留反证入口", "把模型转成可执行试验"],
    ],
    misread: "两者都可能安静、抽象、重逻辑，因此容易混淆。区别要看他们如何结束讨论：INTJ 倾向形成方向，INTP 倾向保留问题空间。",
    scenario: "做新产品定位时，INTJ 会追问哪条路径最可能赢；INTP 会追问定义、分类和假设是否站得住。好的协作是先允许模型展开，再设定决策截止点。",
    avoid: "不要用是否喜欢独处判断 INTJ/INTP，也不要把组织能力等同于 INTJ、好奇心等同于 INTP。要看信息处理后的自然落点。",
    links: ["/zh/personality/intj-a", "/zh/personality/intp-a", "/zh/personality/entj-vs-intj"],
  },
  {
    path: "/zh/personality/entj-vs-intj",
    pair: ["ENTJ", "INTJ"],
    kind: "hot_comparison",
    priority: "P1",
    gsc: "OPS08 comparison backlog; no captured query row yet",
    qa: ["scenario_specificity_gate", "faq_gate"],
    title: "ENTJ 和 INTJ 的区别：外部推进与内部战略建模",
    maxDifference: "ENTJ 更容易通过组织行动校准现实，INTJ 更容易先在内部搭好长期模型。最大区别不是领导力强弱，而是战略如何进入现实。",
    table: [
      ["推进方式", "调动资源、分责、压节奏", "先建模型、排除噪声、定方向"],
      ["压力下", "可能过快要求他人执行", "可能过久停留在内部判断"],
      ["沟通风格", "直接把问题放到桌面", "先筛掉无关信息再表达"],
      ["成熟表现", "给团队留理解空间", "让关键判断及时外化"],
    ],
    misread: "ENTJ 和 INTJ 都可能目标导向、标准高。混淆点在于：ENTJ 通常通过组织反馈修正路线，INTJ 更常通过独立推演修正路线。",
    scenario: "在危机项目里，ENTJ 可能先重排责任和节奏，INTJ 可能先确认根因和长期后果。前者防止停滞，后者防止错误方向越推越远。",
    avoid: "不要把说话强势直接判成 ENTJ，也不要把安静直接判成 INTJ。看对方遇到不确定性时，是先拉人推进，还是先收集结构证据。",
    links: ["/zh/personality/entj-a", "/zh/personality/intj-a", "/zh/personality/intj-vs-intp"],
  },
  {
    path: "/zh/personality/infj-vs-infp",
    pair: ["INFJ", "INFP"],
    kind: "hot_comparison",
    priority: "P1",
    gsc: "OPS08 comparison backlog; no captured query row yet",
    qa: ["scenario_specificity_gate", "faq_gate"],
    title: "INFJ 和 INFP 的区别：意义结构与价值真实性",
    maxDifference: "INFJ 更容易把人的处境组织成一个可理解的意义结构，INFP 更容易先确认内在价值是否真实。最大区别不是谁更温柔，而是共情之后如何判断。",
    table: [
      ["共情入口", "看关系模式和长期影响", "看个人感受和价值一致性"],
      ["表达方式", "引导、解释、连接线索", "书写、倾听、保护真实感"],
      ["冲突风险", "过度替他人解释意义", "过度退回个人感受"],
      ["成熟表现", "不替别人定义人生", "把价值转成可沟通边界"],
    ],
    misread: "两者都可能敏感、理想主义、重意义。区别在于 INFJ 更常组织关系图景，INFP 更常守住个人真实。",
    scenario: "朋友陷入困境时，INFJ 可能帮助对方看见模式和未来路径；INFP 可能先确认对方真实感受有没有被尊重。两种支持都重要，但节奏不同。",
    avoid: "不要用是否外向、是否会安慰人判断 INFJ/INFP。观察他们面对价值冲突时，是先建构整体意义，还是先确认内在真实。",
    links: ["/zh/personality/infj-a", "/zh/personality/infp-a", "/zh/personality/isfp-a"],
  },
  {
    path: "/zh/personality/istj-vs-isfj",
    pair: ["ISTJ", "ISFJ"],
    kind: "hot_comparison",
    priority: "P1",
    gsc: "OPS08 comparison backlog; no captured query row yet",
    qa: ["scenario_specificity_gate", "faq_gate"],
    title: "ISTJ 和 ISFJ 的区别：制度可靠性与照顾可靠性",
    maxDifference: "ISTJ 更容易用规则、记录和标准保证可靠，ISFJ 更容易用照顾、记忆和关系稳定保证可靠。最大区别不是谁更负责，而是责任感优先服务什么。",
    table: [
      ["可靠性的来源", "流程、证据、责任边界", "需要、习惯、关系记忆"],
      ["冲突中", "先确认规则是否被破坏", "先确认人是否被忽略"],
      ["工作优势", "复核、合规、稳定交付", "服务、支持、细节照顾"],
      ["盲点", "忽略情绪成本", "忽略边界和拒绝"],
    ],
    misread: "ISTJ 和 ISFJ 都可能认真、低调、守承诺。区别在于 ISTJ 更常先维护系统，ISFJ 更常先维护人。",
    scenario: "团队排班出错时，ISTJ 会追问流程为何失效，ISFJ 会先看谁被影响最大。成熟团队需要同时修流程和补偿人的压力。",
    avoid: "不要用是否温柔或是否严肃判断。看他们在资源有限时优先保护制度秩序，还是优先保护人的感受和安全。",
    links: ["/zh/personality/istj-a", "/zh/personality/isfj-a", "/zh/personality/esfj-a"],
  },
];

function getArgValue(name) {
  const prefix = `${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function resolveRepoPath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
}

function slugFromPath(pagePath) {
  return pagePath.split("/").filter(Boolean).at(-1);
}

function makeCanonical(pagePath) {
  return `https://fermatmind.com${pagePath}`;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function profileSections(target) {
  return [
    {
      key: "direct_answer",
      title: `${target.code} 是什么人格？`,
      body: target.quick,
    },
    {
      key: "who_it_fits",
      title: `${target.code} 适合谁参考？`,
      body: target.fit,
    },
    {
      key: "who_it_does_not_fit",
      title: `${target.code} 不适合如何使用？`,
      body: target.unfit,
    },
    {
      key: "common_misunderstanding",
      title: `${target.code} 常见误解`,
      body: target.misunderstanding,
    },
    {
      key: "at_difference",
      title: `${target.code} 与 ${target.base}-T 的差异`,
      body: target.atDifference,
      rows: [
        { dimension: "反馈恢复", assertive: "更快回到既定判断或下一步", turbulent: "更容易再次检查风险与评价" },
        { dimension: "行动校准", assertive: "偏用实践修正", turbulent: "偏用复盘修正" },
        { dimension: "成长提醒", assertive: "避免过早忽略反证", turbulent: "避免复盘过度延迟行动" },
      ],
    },
    {
      key: "career_scenario",
      title: `${target.code} 的职业场景`,
      body: target.work,
    },
    {
      key: "relationship_scenario",
      title: `${target.code} 的关系沟通`,
      body: target.relationship,
    },
    {
      key: "stress_scenario",
      title: `${target.code} 的压力与成长`,
      body: target.stress,
    },
  ];
}

function profileFaq(target) {
  return [
    {
      question: `${target.code} 是什么意思？`,
      answer: `${target.code} 指 ${target.base} 的 A 型表达，描述的是 ${target.traits} 这类偏好与压力反馈方式，不是能力等级或诊断标签。`,
    },
    {
      question: `${target.code} 和 ${target.base}-T 最大区别是什么？`,
      answer: target.atDifference,
    },
    {
      question: `${target.code} 适合哪些工作场景？`,
      answer: target.fit,
    },
    {
      question: `${target.code} 容易被误解成什么？`,
      answer: target.misunderstanding,
    },
    {
      question: `${target.code} 在关系中要注意什么？`,
      answer: target.relationship,
    },
    {
      question: `${target.code} 压力下常见盲点是什么？`,
      answer: target.stress,
    },
    {
      question: `A/T 差异能用于招聘或诊断吗？`,
      answer: "不能。A/T 在这里只作为自我观察和反馈风格语言，不能用于心理诊断、招聘筛选、能力排序或关系预测。",
    },
    {
      question: `如果测出来不是 ${target.code} 怎么办？`,
      answer: "把结果当作观察起点。可以回到 MBTI 测试、查看相近类型和对比页，再结合长期行为、他人反馈和真实选择判断。",
    },
    {
      question: `${target.code} 页面下一步应该看什么？`,
      answer: `优先看 ${target.base}-T、${target.code} 与 ${target.base}-T 对比、MBTI 测试页，以及与同类或相邻类型的对比页面。`,
    },
  ];
}

function publicInternalLinks(target) {
  return [
    ...target.links.map((href) => ({
      href,
      anchor_text: href.split("/").at(-1).toUpperCase().replaceAll("-", " "),
      reason: "Connect same-cluster public personality assets without private result routes.",
      safe_public_route: true,
    })),
    {
      href: "/zh/personality",
      anchor_text: "MBTI 人格",
      reason: "Return readers to the public MBTI hub and 32 variant index.",
      safe_public_route: true,
    },
    {
      href: "/zh/tests/mbti-personality-test-16-personality-types",
      anchor_text: "MBTI 免费测试",
      reason: "Close the public test-to-profile loop without private result URLs.",
      safe_public_route: true,
    },
  ];
}

function buildProfilePackage(target) {
  const slug = slugFromPath(target.path);
  return {
    framework: "mbti64",
    entity_type: "personality_profile_variant",
    code: target.code,
    locale: "zh",
    slug,
    target_url: makeCanonical(target.path),
    path: target.path,
    title: `${target.code} ${target.archetype}人格：特点、职业、关系与 A/T 差异`,
    summary: target.quick,
    seo: {
      title: `${target.code} ${target.archetype}人格：特点、职业、关系与 A/T 差异 | FermatMind`,
      meta_description: `${target.code} 是什么？了解 ${target.archetype} 的核心特点、适合谁、不适合谁、常见误解、A/T 差异、职业关系压力场景和 FAQ。`,
      primary_query: target.code.toLowerCase(),
      secondary_queries: [`${target.code.toLowerCase()}人格`, `${target.code.toLowerCase()} 职业`, `${target.base.toLowerCase()}-a`],
    },
    canonical: makeCanonical(target.path),
    hreflang: [
      { locale: "zh", href: makeCanonical(target.path) },
      { locale: "en", href: `https://fermatmind.com/en/personality/${slug}` },
    ],
    robots: "noindex,follow",
    launch_state: "draft_package",
    index_eligible: false,
    sitemap_eligible: false,
    llms_eligible: false,
    gsc_evidence: target.gsc,
    qa14_blockers_repaired: target.qa,
    sections: profileSections(target),
    faq: profileFaq(target),
    media: [],
    schema: {
      recommended_types_after_import: ["ProfilePage", "FAQPage", "BreadcrumbList"],
      schema_authority: "backend_cms_after_import",
    },
    method_boundary: COMMON_BOUNDARY,
    evidence_notes: [
      "Codex-native repaired draft package for backend CMS dry-run, not production CMS truth.",
      "GSC signals are used for prioritization only; pending rows do not justify speculative SERP copy claims.",
      "No competitor wording is copied; competitor coverage is used only as gap context from prior audit artifacts.",
    ],
    internal_links: publicInternalLinks(target),
    source_ledger_refs: SOURCE_LEDGER.map((source) => source.source_id),
    model_output_refs: ["codex_native_content_generation:mbti-content-15"],
    last_reviewed_at: GENERATED_AT,
  };
}

function comparisonSections(target) {
  return [
    { key: "direct_answer", title: "最大区别", body: target.maxDifference },
    {
      key: "quick_judgment_table",
      title: "快速判断表",
      rows: target.table.map(([dimension, left, right]) => ({
        dimension,
        [target.pair[0]]: left,
        [target.pair[1]]: right,
      })),
    },
    { key: "easy_misread", title: "为什么容易混淆", body: target.misread },
    { key: "real_scenario_differences", title: "真实场景差异", body: target.scenario },
    { key: "do_not_misjudge", title: "不要这样误判", body: target.avoid },
    {
      key: "next_reading",
      title: "下一步阅读",
      body: `继续查看 ${target.pair.join("、")} 的单独页面、A/T 页面和 MBTI 测试页，避免只凭一个对比标签下结论。`,
    },
  ];
}

function comparisonFaq(target) {
  const [left, right] = target.pair;
  return [
    { question: `${left} 和 ${right} 最大区别是什么？`, answer: target.maxDifference },
    { question: `为什么 ${left} 和 ${right} 容易被混淆？`, answer: target.misread },
    { question: `在工作场景怎么区分 ${left} 和 ${right}？`, answer: target.scenario },
    { question: `判断 ${left} 和 ${right} 时最容易犯什么错？`, answer: target.avoid },
    {
      question: `这个对比能决定职业或关系选择吗？`,
      answer: "不能。它只能帮助观察信息处理和压力反馈差异，重要选择仍需要结合能力、经验、价值观、环境和长期反馈。",
    },
  ];
}

function buildComparisonPackage(target) {
  const slug = slugFromPath(target.path);
  return {
    framework: "mbti64",
    entity_type: target.kind,
    code: slug,
    locale: "zh",
    slug,
    target_url: makeCanonical(target.path),
    path: target.path,
    title: target.title,
    summary: target.maxDifference,
    seo: {
      title: `${target.title} | FermatMind`,
      meta_description: `${target.pair[0]} 和 ${target.pair[1]} 有什么区别？用最大区别、快速判断表、容易误判、真实场景和 FAQ 快速判断。`,
      primary_query: `${target.pair[0].toLowerCase()} vs ${target.pair[1].toLowerCase()}`,
      secondary_queries: [`${target.pair[0].toLowerCase()}和${target.pair[1].toLowerCase()}区别`, `${slug.replaceAll("-", " ")}`],
    },
    canonical: makeCanonical(target.path),
    hreflang: [
      { locale: "zh", href: makeCanonical(target.path) },
      { locale: "en", href: `https://fermatmind.com/en/personality/${slug}` },
    ],
    robots: "noindex,follow",
    launch_state: "draft_package",
    index_eligible: false,
    sitemap_eligible: false,
    llms_eligible: false,
    gsc_evidence: target.gsc,
    qa14_blockers_repaired: target.qa,
    comparison_pair: target.pair,
    sections: comparisonSections(target),
    faq: comparisonFaq(target),
    media: [],
    schema: {
      recommended_types_after_import: ["WebPage", "FAQPage", "BreadcrumbList"],
      schema_authority: "backend_cms_after_import",
    },
    method_boundary: COMMON_BOUNDARY,
    evidence_notes: [
      "Codex-native repaired comparison draft for backend CMS dry-run, not production CMS truth.",
      "Comparison content repairs scenario specificity and FAQ depth without changing renderer code.",
      "No Search Console indexing, sitemap, llms, or production import action is performed in this PR.",
    ],
    internal_links: publicInternalLinks(target),
    source_ledger_refs: SOURCE_LEDGER.map((source) => source.source_id),
    model_output_refs: ["codex_native_content_generation:mbti-content-15"],
    last_reviewed_at: GENERATED_AT,
  };
}

function buildVerifyOnlyPackage(target) {
  const slug = slugFromPath(target.path);
  return {
    framework: "mbti64",
    entity_type: "personality_profile_variant",
    code: target.code,
    locale: "zh",
    slug,
    target_url: makeCanonical(target.path),
    path: target.path,
    status: "verify_only_no_body_rewrite",
    title: `${target.code} query-fit verification`,
    summary: "Current GSC evidence shows early demand; CONTENT-15 records verification expectations without rewriting CMS body content.",
    seo: {
      primary_query: "intp-a",
      evidence_status: "captured_query_row_plus_7d_visible_signal",
    },
    canonical: makeCanonical(target.path),
    hreflang: [
      { locale: "zh", href: makeCanonical(target.path) },
      { locale: "en", href: `https://fermatmind.com/en/personality/${slug}` },
    ],
    robots: "noindex,follow",
    launch_state: "verify_only",
    index_eligible: false,
    sitemap_eligible: false,
    llms_eligible: false,
    gsc_evidence: target.gsc,
    verification_notes: target.verification_notes,
    sections: [],
    faq: [],
    media: [],
    schema: {
      recommended_types_after_import: ["ProfilePage", "FAQPage", "BreadcrumbList"],
      schema_authority: "backend_cms_after_import",
    },
    method_boundary: COMMON_BOUNDARY,
    evidence_notes: [
      "Verify-only row because the page has visible GSC opportunity but is not a QA-14 blocker in the current artifact.",
      "Do not rewrite the body until a downstream QA/import pass identifies a concrete blocker.",
    ],
    internal_links: publicInternalLinks({
      links: ["/zh/personality/intp-t", "/zh/personality/intp-a-vs-intp-t", "/zh/personality/intj-vs-intp"],
    }),
    source_ledger_refs: SOURCE_LEDGER.map((source) => source.source_id),
    model_output_refs: [],
    last_reviewed_at: GENERATED_AT,
  };
}

function hasPrivateRoute(link) {
  return /\/(result|results|order|orders|pay|payment|account|private)\b/i.test(link.href);
}

function validatePackage(pkg) {
  const failures = [];
  const required = [
    "framework",
    "entity_type",
    "code",
    "locale",
    "slug",
    "title",
    "summary",
    "seo",
    "canonical",
    "hreflang",
    "robots",
    "launch_state",
    "index_eligible",
    "sitemap_eligible",
    "llms_eligible",
    "sections",
    "faq",
    "media",
    "schema",
    "method_boundary",
    "evidence_notes",
    "internal_links",
    "source_ledger_refs",
    "model_output_refs",
    "last_reviewed_at",
  ];
  for (const key of required) {
    if (!(key in pkg)) failures.push(`missing:${pkg.path}:${key}`);
  }
  const text = JSON.stringify(pkg);
  for (const marker of ["复制竞品", "照搬竞品", "TODO", "TBD", "placeholder", "lorem ipsum"]) {
    if (text.toLowerCase().includes(marker.toLowerCase())) failures.push(`template_marker:${pkg.path}:${marker}`);
  }
  if (pkg.internal_links.some(hasPrivateRoute)) failures.push(`private_link:${pkg.path}`);
  if (pkg.launch_state !== "draft_package" && pkg.launch_state !== "verify_only") {
    failures.push(`bad_launch_state:${pkg.path}`);
  }
  if (pkg.index_eligible || pkg.sitemap_eligible || pkg.llms_eligible) {
    failures.push(`indexability_gate_changed:${pkg.path}`);
  }
  if (pkg.status !== "verify_only_no_body_rewrite") {
    if (pkg.entity_type === "personality_profile_variant") {
      if (pkg.sections.length < 8) failures.push(`thin_sections:${pkg.path}`);
      if (pkg.faq.length < 9) failures.push(`thin_faq:${pkg.path}`);
      if (!pkg.summary.includes(pkg.code)) failures.push(`missing_code_anchor:${pkg.path}`);
    } else {
      if (pkg.sections.length < 6) failures.push(`thin_comparison_sections:${pkg.path}`);
      if (pkg.faq.length < 5) failures.push(`thin_comparison_faq:${pkg.path}`);
      if (!pkg.sections.some((section) => section.key === "quick_judgment_table" && section.rows?.length >= 4)) {
        failures.push(`missing_quick_table:${pkg.path}`);
      }
    }
  }
  return failures;
}

function toCsv(packages) {
  const headers = [
    "path",
    "entity_type",
    "code",
    "priority",
    "status",
    "gsc_evidence",
    "qa14_blockers_repaired",
    "section_count",
    "faq_count",
    "internal_link_count",
    "index_eligible",
    "next_gate",
  ];
  const rows = packages.map((pkg) => ({
    path: pkg.path,
    entity_type: pkg.entity_type,
    code: pkg.code,
    priority: pkg.priority ?? "",
    status: pkg.status ?? "repair_package",
    gsc_evidence: pkg.gsc_evidence,
    qa14_blockers_repaired: (pkg.qa14_blockers_repaired ?? []).join("|"),
    section_count: pkg.sections.length,
    faq_count: pkg.faq.length,
    internal_link_count: pkg.internal_links.length,
    index_eligible: String(pkg.index_eligible),
    next_gate: "fap-api_import_dry_run_after_operator_approval",
  }));
  return `${headers.join(",")}\n${rows
    .map((row) => headers.map((header) => csvEscape(row[header])).join(","))
    .join("\n")}\n`;
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function buildMarkdown(report) {
  const lines = [
    "# MBTI-CONTENT-15 Top Blocker Content Asset Repair",
    "",
    `Generated at: ${report.generated_at}`,
    "",
    "This artifact is a backend CMS dry-run handoff package. It does not write production CMS data, mutate sitemap/llms, submit GSC indexing, or add frontend editorial fallback content.",
    "",
    "## Summary",
    "",
    `- Final decision: ${report.final_decision}`,
    `- Repair profile packages: ${report.summary.repair_profile_count}`,
    `- Verify-only profile packages: ${report.summary.verify_only_profile_count}`,
    `- Comparison packages: ${report.summary.comparison_count}`,
    `- Package validation failures: ${report.summary.validation_failure_count}`,
    "",
    "## Targets",
    "",
    "| Priority | Path | Type | Status | GSC evidence | QA-14 blockers |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  for (const pkg of report.packages) {
    lines.push(
      `| ${pkg.priority ?? ""} | ${pkg.path} | ${pkg.entity_type} | ${pkg.status ?? "repair_package"} | ${pkg.gsc_evidence.replaceAll("|", "/")} | ${(pkg.qa14_blockers_repaired ?? []).join(", ")} |`,
    );
  }
  lines.push(
    "",
    "## Gates",
    "",
    `- Schema validation: ${report.qa_gates.schema_validation.status}`,
    `- Content depth: ${report.qa_gates.content_depth.status}`,
    `- Template risk: ${report.qa_gates.template_marker_gate.status}`,
    `- Private route boundary: ${report.qa_gates.private_route_gate.status}`,
    `- Indexability boundary: ${report.qa_gates.indexability_gate.status}`,
    "",
    "## Next Gate",
    "",
    "Run a fap-api import dry-run after operator approval. Do not promote, index, or submit these URLs until backend authority, duplicate risk, and indexability gates pass.",
  );
  return `${lines.join("\n")}\n`;
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, value);
}

async function main() {
  const profilePackages = PROFILE_TARGETS.map(buildProfilePackage);
  const verifyOnlyPackages = [buildVerifyOnlyPackage(VERIFY_ONLY_PROFILE)];
  const comparisonPackages = COMPARISON_TARGETS.map(buildComparisonPackage);
  const packages = [...profilePackages, ...verifyOnlyPackages, ...comparisonPackages].map((pkg) => ({
    ...pkg,
    priority:
      PROFILE_TARGETS.find((target) => target.path === pkg.path)?.priority ??
      COMPARISON_TARGETS.find((target) => target.path === pkg.path)?.priority ??
      VERIFY_ONLY_PROFILE.priority,
  }));
  const validationFailures = packages.flatMap(validatePackage);

  const report = {
    id: "MBTI-CONTENT-15",
    artifact: "MBTI-CONTENT-15-TOP-BLOCKER-ASSETS",
    generated_at: GENERATED_AT,
    status: validationFailures.length === 0 ? "ready_for_fap_api_dry_run_handoff" : "blocked",
    final_decision:
      validationFailures.length === 0
        ? "PASS_MBTI_CONTENT_15_READY_FOR_FAP_API_DRY_RUN"
        : "BLOCKED_MBTI_CONTENT_15_VALIDATION_FAILURE",
    input_artifacts: SOURCE_LEDGER.map((source) => source.path),
    selection_policy: {
      gsc_first: true,
      qa14_blocker_first: true,
      included_current_7d_visible_rows: ["mbti测试", "intp-a", "isfp-a"],
      excluded_actions: ["gsc_submission", "production_cms_write", "sitemap_llms_expansion", "frontend_runtime_change"],
    },
    source_ledger: SOURCE_LEDGER,
    summary: {
      package_count: packages.length,
      repair_profile_count: profilePackages.length,
      verify_only_profile_count: verifyOnlyPackages.length,
      comparison_count: comparisonPackages.length,
      validation_failure_count: validationFailures.length,
      qa14_profile_blockers_targeted: 4,
      qa14_comparison_blockers_targeted: 5,
    },
    packages,
    qa_gates: {
      schema_validation: gate(validationFailures.filter((failure) => failure.startsWith("missing:")).length === 0),
      content_depth: gate(validationFailures.filter((failure) => failure.includes("thin_")).length === 0),
      template_marker_gate: gate(validationFailures.filter((failure) => failure.startsWith("template_marker:")).length === 0),
      private_route_gate: gate(validationFailures.filter((failure) => failure.startsWith("private_link:")).length === 0),
      indexability_gate: gate(
        validationFailures.filter((failure) => failure.startsWith("indexability_gate_changed:")).length === 0,
      ),
      gsc_mutation_gate: gate(true),
      production_import_gate: gate(true),
    },
    safety_boundary: {
      artifact_only: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      db_migration_attempted: false,
      frontend_runtime_change_attempted: false,
      frontend_local_editorial_fallback_added: false,
      sitemap_llms_mutation_attempted: false,
      gsc_api_call_attempted: false,
      gsc_request_indexing_attempted: false,
      search_submission_attempted: false,
      production_deploy_attempted: false,
    },
    validation_failures: validationFailures,
    blockers: validationFailures,
    recommended_next_task:
      "Open a separate fap-api dry-run import PR after operator approval; keep promotion, sitemap/llms, and GSC indexing separate.",
  };
  report.package_sha256 = sha256(JSON.stringify(report.packages));

  await writeJson(OUTPUT_JSON, report);
  await writeText(OUTPUT_MD, buildMarkdown(report));
  await writeText(OUTPUT_CSV, toCsv(packages));

  process.stdout.write(
    JSON.stringify(
      {
        ok: validationFailures.length === 0,
        artifact: report.artifact,
        output_json: path.relative(ROOT, OUTPUT_JSON),
        output_md: path.relative(ROOT, OUTPUT_MD),
        output_csv: path.relative(ROOT, OUTPUT_CSV),
        package_count: packages.length,
        final_decision: report.final_decision,
      },
      null,
      2,
    ),
  );
}

function gate(status) {
  return { status: status ? "pass" : "fail" };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
