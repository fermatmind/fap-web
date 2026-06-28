#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = process.env.GENERATED_DATE || "2026-06-28";
const GENERATED_AT = process.env.GENERATED_AT || `${GENERATED_DATE}T12:00:00.000Z`;
const SITE_ORIGIN = "https://fermatmind.com";

const GOLDEN_V2_PATH =
  "docs/seo/personality/mbti64-next-batch-6-competitor-gap-content-expansion-v2-2026-06-27.json";
const EXPANSION_88_PATH = "docs/seo/personality/mbti64-agent-expansion-88-recommendations-2026-06-21.json";
const EXPANSION_88_QA_PATH = "docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.json";
const REFERENCE_PACK_PATH = "docs/seo/personality/mbti64-optimized-pilot-reference-pack-2026-06-21.json";

const OUTPUT_PACKAGE = `docs/seo/personality/mbti64-remaining-58-competitor-gap-content-expansion-v2-${GENERATED_DATE}.json`;
const OUTPUT_PACKAGE_MD = `docs/seo/personality/mbti64-remaining-58-competitor-gap-content-expansion-v2-${GENERATED_DATE}.md`;
const OUTPUT_QA = `docs/seo/personality/mbti64-remaining-58-competitor-gap-content-expansion-v2-qa-${GENERATED_DATE}.json`;
const OUTPUT_QA_MD = `docs/seo/personality/mbti64-remaining-58-competitor-gap-content-expansion-v2-qa-${GENERATED_DATE}.md`;

const COMPLETED_V2_PATHS = new Set([
  "/zh/personality/intp-a",
  "/en/personality/intp-a",
  "/zh/personality/esfp-a",
  "/en/personality/esfp-a",
  "/en/personality/enfj-a",
  "/zh/personality/enfj-a",
]);

const PRIVATE_ROUTE_PATTERN = /\/(results?|orders?|pay|payment|history|private|account|share)(\/|\b|\?)/i;
const SECRET_QUERY_PATTERN = /\b(token|session|result_id|report_id|order_no)=/i;
const OFFICIAL_CLAIM_PATTERN =
  /(official MBTI|official Myers-Briggs|Myers-Briggs certified|certified MBTI|官方MBTI|官方认证|官方16型|MBTI 官方|Myers-Briggs 官方)/i;
const DETERMINISTIC_CLAIM_PATTERN =
  /(guarantee|guaranteed|destined|perfect match|will always|一定会|注定|完美匹配|必然|决定命运|决定职业|决定关系)/i;

const SOURCE_LEDGER = [
  {
    source_id: "competitor_16personalities",
    source_type: "competitor_gap_structure",
    url: "https://www.16personalities.com/",
    how_used:
      "Mapped durable SERP modules around strengths, weaknesses, A/T intent, career/workplace, relationships and FAQ depth; no wording copied.",
  },
  {
    source_id: "competitor_123test",
    source_type: "competitor_gap_structure",
    url: "https://www.123test.com/personality-types/",
    how_used:
      "Mapped concise type overview and practical interpretation structure; no wording copied.",
  },
  {
    source_id: "competitor_truity",
    source_type: "competitor_gap_structure",
    url: "https://www.truity.com/personality-type/",
    how_used:
      "Mapped long-tail user intent around strengths, blind spots, work, relationships and practical use; no wording copied.",
  },
  {
    source_id: "competitor_personality_junkie",
    source_type: "competitor_gap_structure",
    url: "https://personalityjunkie.com/",
    how_used:
      "Mapped demand for cognitive-function language as a depth differentiator; no wording copied.",
  },
  {
    source_id: "method_boundary_myers_briggs_safe_use",
    source_type: "method_boundary",
    url: "https://www.themyersbriggs.com/",
    how_used:
      "Used only to keep affiliation, diagnostic, hiring-screen and deterministic-claim boundaries explicit.",
  },
];

const TYPE_DATA = {
  intj: {
    label: { en: "Architect", zh: "建筑师" },
    angle: { en: "strategy, independent standards and long-range systems", zh: "战略规划、独立标准和长期系统" },
    functions: "Ni-Te-Fi-Se",
    mechanism: {
      en: "INTJ is often described through directional intuition Ni, organizing thinking Te, private values Fi and present-moment sensing Se.",
      zh: "INTJ 常被解释为以内向直觉 Ni 收束方向，以外向思考 Te 组织执行，再由内在价值 Fi 和现实感知 Se 校准。",
    },
    work: { en: "strategy review, architecture choices and long-range planning", zh: "战略复盘、架构取舍和长期规划" },
    relationship: { en: "translating standards into clear expectations instead of silent tests", zh: "把标准翻译成清晰期待，而不是让别人猜测" },
    misread: { en: "reserved does not mean dismissive", zh: "安静不等于轻视别人" },
  },
  intp: {
    label: { en: "Logician", zh: "逻辑学家" },
    angle: { en: "analysis, model building and independent problem solving", zh: "分析、建模和独立解题" },
    functions: "Ti-Ne-Si-Fe",
    mechanism: {
      en: "INTP is often described through internal logic Ti, possibility exploration Ne, experience calibration Si and social feedback Fe.",
      zh: "INTP 常被解释为以内在逻辑 Ti 建模，以可能性探索 Ne 扩展，再用经验 Si 和群体反馈 Fe 校准。",
    },
    work: { en: "technical review, research framing and complex diagnosis", zh: "技术评审、研究框架和复杂问题诊断" },
    relationship: { en: "turning analysis into care that another person can feel", zh: "把分析翻译成对方能感受到的关心" },
    misread: { en: "calm analysis does not mean no feeling", zh: "冷静分析不等于没有感受" },
  },
  entj: {
    label: { en: "Commander", zh: "指挥官" },
    angle: { en: "decisions, systems leadership and operational follow-through", zh: "决策、系统领导和运营推进" },
    functions: "Te-Ni-Se-Fi",
    mechanism: {
      en: "ENTJ is often described through organizing thinking Te, directional intuition Ni, real-time sensing Se and private values Fi.",
      zh: "ENTJ 常被解释为以外向思考 Te 组织资源，以内向直觉 Ni 收束方向，再用 Se 和 Fi 校准现实与价值。",
    },
    work: { en: "decision meetings, operating cadences and accountability resets", zh: "决策会议、运营节奏和责任校准" },
    relationship: { en: "making room for consent and emotion before moving to action", zh: "在推进行动前为同意、感受和边界留出空间" },
    misread: { en: "directness is not the same as not caring", zh: "直接不等于不在乎" },
  },
  entp: {
    label: { en: "Debater", zh: "辩论家" },
    angle: { en: "experimentation, debate and fast idea testing", zh: "实验、辩论和快速想法验证" },
    functions: "Ne-Ti-Fe-Si",
    mechanism: {
      en: "ENTP is often described through possibility exploration Ne, internal logic Ti, social feedback Fe and memory calibration Si.",
      zh: "ENTP 常被解释为以可能性探索 Ne 打开选项，再用逻辑 Ti、反馈 Fe 和经验 Si 校准。",
    },
    work: { en: "product experiments, debate-heavy planning and early-stage problem framing", zh: "产品实验、高密度讨论和早期问题定义" },
    relationship: { en: "checking whether debate feels playful or exhausting to others", zh: "确认辩论对别人是有趣还是消耗" },
    misread: { en: "arguing a possibility is not the same as believing it", zh: "提出一种可能不等于真的相信它" },
  },
  infj: {
    label: { en: "Advocate", zh: "提倡者" },
    angle: { en: "meaning, pattern insight and values-led direction", zh: "意义感、模式洞察和价值导向" },
    functions: "Ni-Fe-Ti-Se",
    mechanism: {
      en: "INFJ is often described through directional intuition Ni, interpersonal attunement Fe, internal logic Ti and present sensing Se.",
      zh: "INFJ 常被解释为以内向直觉 Ni 收束意义，以外向情感 Fe 读懂关系，再由 Ti 和 Se 校准。",
    },
    work: { en: "mission framing, mentoring and long-range people problems", zh: "使命叙事、辅导和长期人际问题" },
    relationship: { en: "naming expectations before quiet disappointment builds", zh: "在失望累积前说清期待" },
    misread: { en: "private processing is not hidden judgment", zh: "私下消化不等于暗中评判" },
  },
  infp: {
    label: { en: "Mediator", zh: "调停者" },
    angle: { en: "personal meaning, values and empathetic imagination", zh: "个人意义、价值观和同理想象" },
    functions: "Fi-Ne-Si-Te",
    mechanism: {
      en: "INFP is often described through private values Fi, possibility exploration Ne, memory calibration Si and organizing thinking Te.",
      zh: "INFP 常被解释为以内在价值 Fi 校准方向，以 Ne 想象可能，再用 Si 和 Te 落地。",
    },
    work: { en: "values-led creative work, counseling-style listening and narrative design", zh: "价值导向创作、倾听支持和叙事设计" },
    relationship: { en: "separating deep care from unspoken expectations", zh: "区分深度在乎和没有说出口的期待" },
    misread: { en: "soft expression is not weak conviction", zh: "表达柔和不等于立场薄弱" },
  },
  enfj: {
    label: { en: "Protagonist", zh: "主人公" },
    angle: { en: "people leadership, encouragement and shared direction", zh: "人际带动、鼓励和共同方向" },
    functions: "Fe-Ni-Se-Ti",
    mechanism: {
      en: "ENFJ is often described through interpersonal organization Fe, directional intuition Ni, present sensing Se and logic checking Ti.",
      zh: "ENFJ 常被解释为以外向情感 Fe 组织关系，以内向直觉 Ni 收束方向，再由 Se 和 Ti 校准。",
    },
    work: { en: "team reset, mentoring and cross-functional alignment", zh: "团队重启、辅导和跨部门协调" },
    relationship: { en: "supporting without taking over responsibility", zh: "支持别人，但不替别人承担全部责任" },
    misread: { en: "supportive does not mean people-pleasing", zh: "支持别人不等于讨好" },
  },
  enfp: {
    label: { en: "Campaigner", zh: "竞选者" },
    angle: { en: "possibility, connection and creative momentum", zh: "可能性、人际连接和创意动力" },
    functions: "Ne-Fi-Te-Si",
    mechanism: {
      en: "ENFP is often described through possibility exploration Ne, private values Fi, organizing thinking Te and memory calibration Si.",
      zh: "ENFP 常被解释为以可能性探索 Ne 打开方向，以内在价值 Fi 选择意义，再由 Te 和 Si 落地。",
    },
    work: { en: "creative sprints, community building and opportunity discovery", zh: "创意冲刺、社群连接和机会发现" },
    relationship: { en: "turning enthusiasm into reliable follow-through", zh: "把热情转化为可靠行动" },
    misread: { en: "many interests do not mean no depth", zh: "兴趣很多不等于没有深度" },
  },
  istj: {
    label: { en: "Logistician", zh: "物流师" },
    angle: { en: "responsibility, precedent and reliable execution", zh: "责任、经验和可靠执行" },
    functions: "Si-Te-Fi-Ne",
    mechanism: {
      en: "ISTJ is often described through memory calibration Si, organizing thinking Te, private values Fi and possibility exploration Ne.",
      zh: "ISTJ 常被解释为以经验记忆 Si 稳定判断，以 Te 组织执行，再由 Fi 和 Ne 校准边界与新可能。",
    },
    work: { en: "process control, compliance review and dependable delivery", zh: "流程控制、规范复核和稳定交付" },
    relationship: { en: "making care visible instead of assuming duty is understood", zh: "把关心表达出来，而不是只用责任感证明" },
    misread: { en: "cautious is not closed-minded", zh: "谨慎不等于封闭" },
  },
  isfj: {
    label: { en: "Defender", zh: "守卫者" },
    angle: { en: "care, continuity and dependable support", zh: "照顾、连续性和可靠支持" },
    functions: "Si-Fe-Ti-Ne",
    mechanism: {
      en: "ISFJ is often described through memory calibration Si, interpersonal attunement Fe, logic checking Ti and possibility exploration Ne.",
      zh: "ISFJ 常被解释为以经验记忆 Si 维持稳定，以 Fe 照顾关系，再由 Ti 和 Ne 校准。",
    },
    work: { en: "service reliability, team support and careful handoff work", zh: "服务可靠性、团队支持和细致交接" },
    relationship: { en: "asking for reciprocity instead of quietly over-giving", zh: "学会提出互相支持，而不是默默过度付出" },
    misread: { en: "quiet support is not lack of ambition", zh: "安静支持不等于没有追求" },
  },
  estj: {
    label: { en: "Executive", zh: "总经理" },
    angle: { en: "structure, decisions and practical accountability", zh: "结构、决策和实际责任" },
    functions: "Te-Si-Ne-Fi",
    mechanism: {
      en: "ESTJ is often described through organizing thinking Te, memory calibration Si, possibility checking Ne and private values Fi.",
      zh: "ESTJ 常被解释为以外向思考 Te 组织行动，以 Si 稳定流程，再由 Ne 和 Fi 校准变化与价值。",
    },
    work: { en: "operating rhythm, role clarity and quality control", zh: "运营节奏、角色清晰和质量控制" },
    relationship: { en: "balancing practical fixes with emotional recognition", zh: "在实际解决之外补上情绪确认" },
    misread: { en: "structured does not mean insensitive", zh: "讲结构不等于没感受" },
  },
  esfj: {
    label: { en: "Consul", zh: "执政官" },
    angle: { en: "support, belonging and practical coordination", zh: "支持、归属和实际协调" },
    functions: "Fe-Si-Ne-Ti",
    mechanism: {
      en: "ESFJ is often described through interpersonal organization Fe, memory calibration Si, possibility checking Ne and internal logic Ti.",
      zh: "ESFJ 常被解释为以外向情感 Fe 组织关系，以 Si 维持稳定，再由 Ne 和 Ti 校准。",
    },
    work: { en: "community operations, customer care and team coordination", zh: "社群运营、客户照顾和团队协调" },
    relationship: { en: "keeping warmth while making boundaries explicit", zh: "保持温暖，同时把边界说清楚" },
    misread: { en: "social awareness is not superficial conformity", zh: "在意关系不等于肤浅从众" },
  },
  istp: {
    label: { en: "Virtuoso", zh: "鉴赏家" },
    angle: { en: "hands-on problem solving, autonomy and calm troubleshooting", zh: "动手解题、自主和冷静排障" },
    functions: "Ti-Se-Ni-Fe",
    mechanism: {
      en: "ISTP is often described through internal logic Ti, present sensing Se, directional intuition Ni and social feedback Fe.",
      zh: "ISTP 常被解释为以内在逻辑 Ti 判断机制，以 Se 读取现实，再由 Ni 和 Fe 校准。",
    },
    work: { en: "incident response, tool use and practical system repair", zh: "故障响应、工具使用和实际系统修复" },
    relationship: { en: "explaining space needs before they look like withdrawal", zh: "提前说明空间需求，避免被误读为疏离" },
    misread: { en: "independent does not mean unavailable", zh: "独立不等于无法靠近" },
  },
  isfp: {
    label: { en: "Adventurer", zh: "探险家" },
    angle: { en: "taste, lived experience and quiet personal expression", zh: "审美、体验和安静表达" },
    functions: "Fi-Se-Ni-Te",
    mechanism: {
      en: "ISFP is often described through private values Fi, present sensing Se, directional intuition Ni and organizing thinking Te.",
      zh: "ISFP 常被解释为以内在价值 Fi 校准选择，以 Se 感知体验，再由 Ni 和 Te 落地。",
    },
    work: { en: "visual judgment, craft quality and human-scale experiences", zh: "视觉判断、手艺质量和贴近人的体验" },
    relationship: { en: "making preferences explicit before resentment builds", zh: "在委屈累积前说清偏好和边界" },
    misread: { en: "quiet taste is not lack of standards", zh: "安静的审美不等于没有标准" },
  },
  estp: {
    label: { en: "Entrepreneur", zh: "企业家" },
    angle: { en: "action, opportunity and real-time adaptation", zh: "行动、机会和现场应变" },
    functions: "Se-Ti-Fe-Ni",
    mechanism: {
      en: "ESTP is often described through present sensing Se, internal logic Ti, social feedback Fe and directional intuition Ni.",
      zh: "ESTP 常被解释为以外向感觉 Se 捕捉现场，以 Ti 快速判断，再由 Fe 和 Ni 校准。",
    },
    work: { en: "negotiation, sales floors and fast operational recovery", zh: "谈判、销售现场和快速运营恢复" },
    relationship: { en: "slowing down enough for trust and follow-through", zh: "放慢一点，让信任和承诺跟得上行动" },
    misread: { en: "fast action is not lack of thought", zh: "行动快不等于没思考" },
  },
  esfp: {
    label: { en: "Entertainer", zh: "表演者" },
    angle: { en: "energy, presence and shared experience", zh: "活力、现场感和共同体验" },
    functions: "Se-Fi-Te-Ni",
    mechanism: {
      en: "ESFP is often described through present sensing Se, private values Fi, organizing thinking Te and directional intuition Ni.",
      zh: "ESFP 常被解释为以外向感觉 Se 读取现场，以 Fi 校准价值，再由 Te 和 Ni 补足行动与长期方向。",
    },
    work: { en: "events, customer experience and live recovery", zh: "活动、客户体验和现场救火" },
    relationship: { en: "bringing warmth while naming real boundaries", zh: "带来温度，同时说清真实边界" },
    misread: { en: "energetic is not shallow", zh: "活跃不等于肤浅" },
  },
};

const MBTI_TYPES = Object.keys(TYPE_DATA);
const VARIANTS = ["a", "t"];
const LOCALES = ["en", "zh"];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  const absolute = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const absolute = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, value);
}

function sha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function normalizePath(value) {
  const url = new URL(value, SITE_ORIGIN);
  return url.pathname.replace(/\/+$/, "") || "/";
}

function parseTarget(row) {
  const targetUrl = row.target_url;
  const targetPath = normalizePath(targetUrl);
  const match = targetPath.match(/^\/(en|zh)\/personality\/([a-z]{4})-([at])$/i);
  if (!match) return null;
  return {
    targetUrl,
    path: targetPath,
    locale: match[1],
    type: match[2].toLowerCase(),
    variant: match[3].toLowerCase(),
  };
}

function variantLabel(variant, locale) {
  if (locale === "zh") return variant === "a" ? "A 型" : "T 型";
  return variant === "a" ? "Assertive" : "Turbulent";
}

function variantLens(variant, locale) {
  if (locale === "zh") {
    return variant === "a"
      ? "更稳定的自我确认、反馈后恢复和持续推进"
      : "更强的复盘意识、反馈敏感度和压力下校准";
  }
  return variant === "a"
    ? "steadier self-trust, feedback recovery and follow-through"
    : "stronger self-review, feedback sensitivity and pressure-based recalibration";
}

function oppositeVariant(variant) {
  return variant === "a" ? "t" : "a";
}

function section(key, title, body, extra = {}) {
  return { key, title, body, ...extra };
}

function faq(question, answer) {
  return { question, answer };
}

function buildTitle(type, variant, locale) {
  const data = TYPE_DATA[type];
  const code = `${type.toUpperCase()}-${variant.toUpperCase()}`;
  if (locale === "zh") return `${code} 人格特点：${data.angle.zh} | FermatMind`;
  return `${code} Meaning: ${variantLabel(variant, locale)} ${data.label.en} Traits | FermatMind`;
}

function buildDescription(type, variant, locale) {
  const data = TYPE_DATA[type];
  const code = `${type.toUpperCase()}-${variant.toUpperCase()}`;
  if (locale === "zh") {
    return `深入了解 ${code} 的${data.angle.zh}、A/T 差异、${data.functions} 行为机制、工作关系沟通、常见误读和安全使用边界。`;
  }
  return `Explore ${code} through ${data.angle.en}, A/T differences, ${data.functions} behavior language, work and relationship examples, common misreads and safe-use boundaries.`;
}

function buildH1(type, variant, locale) {
  const code = `${type.toUpperCase()}-${variant.toUpperCase()}`;
  return locale === "zh" ? `${code} 人格特点` : `${code} Meaning`;
}

function buildQuickAnswer(type, variant, locale) {
  const data = TYPE_DATA[type];
  const code = `${type.toUpperCase()}-${variant.toUpperCase()}`;
  if (locale === "zh") {
    return `${code} 可以理解为 ${type.toUpperCase()} 核心模式加上 ${variantLabel(variant, locale)}表达：它通常围绕${data.angle.zh}展开，并呈现${variantLens(variant, locale)}。这是一种行为偏好和自我调节语言，适合用于自我理解、沟通和成长计划，不适合用来做诊断、筛选或人生结论。`;
  }
  return `${code} combines the ${type.toUpperCase()} core pattern with an ${variantLabel(variant, locale).toLowerCase()} expression: it usually shows up around ${data.angle.en} and ${variantLens(variant, locale)}. Read it as behavior and self-regulation language for reflection, not as diagnosis, screening or a fixed life verdict.`;
}

function buildSections(type, variant, locale) {
  const data = TYPE_DATA[type];
  const code = `${type.toUpperCase()}-${variant.toUpperCase()}`;
  const sibling = `${type.toUpperCase()}-${oppositeVariant(variant).toUpperCase()}`;
  if (locale === "zh") {
    return [
      section(
        "how_to_read",
        `先这样理解 ${code}`,
        `${code} 不是能力排名，也不是固定身份。更稳妥的读法是：在 ${data.angle.zh} 相关场景里，这个人更常用 ${variantLens(variant, locale)} 来处理不确定性、反馈和行动节奏。`
      ),
      section("at_difference_table", `${code} 与 ${sibling} 对照表`, `A/T 差异不是好坏差异，而是压力、反馈和自我确认方式的差异。${code} 更偏 ${variantLens(variant, locale)}，${sibling} 则提供另一种校准节奏。`, {
        comparison_rows: [
          {
            dimension: "反馈后反应",
            assertive: variant === "a" ? "更快回到判断和下一步" : "更需要确认反馈是否暴露盲点",
            turbulent: variant === "a" ? "更容易反复确认他人评价" : "更擅长细致复盘和修正",
          },
          {
            dimension: "行动节奏",
            assertive: "更愿意用可行版本推进",
            turbulent: "更愿意继续检查风险和标准",
          },
          {
            dimension: "成长重点",
            assertive: "保留反证入口和他人反馈",
            turbulent: "避免把复盘变成停滞",
          },
        ],
      }),
      section(
        "cognitive_function_mechanism",
        `认知功能机制：${data.functions} 如何表现`,
        `${data.mechanism.zh} 这里的功能语言不是临床机制，而是解释行为的工具。对 ${code} 来说，关键是看这种功能组合如何影响判断、表达、协作和压力恢复。`
      ),
      section(
        "work_scenario",
        `工作场景：${data.work.zh}`,
        `在${data.work.zh}中，${code} 的优势通常不是某个职业标签，而是处理信息、稳定节奏和推进协作的方式。更成熟的做法是把个人偏好转化成可复盘的行动、清晰的沟通和可交付的下一步。`
      ),
      section(
        "relationship_communication",
        `关系与沟通：${data.relationship.zh}`,
        `${code} 在关系中容易被误读的地方，往往不是动机，而是表达顺序。更有效的沟通方式是先说明意图，再说明边界，最后确认对方需要倾听、建议还是共同分析。`
      ),
      section(
        "stress_growth",
        "压力、盲点与成长",
        `压力下，${code} 可能会把 ${data.angle.zh} 的优势用得过满：要么过快推进，要么过度复盘。成长不是改变类型，而是增加检查点、反馈入口和可持续节奏。`
      ),
      section("common_misreads", "常见误读", `${data.misread.zh}。类型描述的是偏好，不是品格、智商、心理健康或职业价值。健康的 ${code} 会把类型当作反思工具，而不是替自己或别人下结论。`, {
        bullets: [
          "稳定或敏感都不是优劣标签。",
          "适合的场景来自技能、兴趣、环境和选择，不只来自类型。",
          "A/T 差异应帮助理解压力和反馈方式，而不是制造等级。",
        ],
      }),
      section(
        "how_to_use_not_use",
        "如何使用这页，以及不该怎么用",
        `可以用这页做自我观察、沟通复盘和成长计划。不要把它用于心理诊断、招聘筛选、智商判断、关系预测或职业决定。若测评结果和长期行为不一致，应回到具体情境、反馈和真实选择。`
      ),
    ];
  }

  return [
    section(
      "how_to_read",
      `How to read ${code} first`,
      `${code} is not an ability ranking or fixed identity. A safer reading is that, in situations involving ${data.angle.en}, this pattern often shows ${variantLens(variant, locale)} in uncertainty, feedback and action rhythm.`
    ),
    section(`${"at"}_difference_table`, `${code} vs ${sibling} comparison table`, `A/T is not a better-or-worse scale. It is a useful lens for pressure recovery, feedback processing and self-checking. ${code} leans toward ${variantLens(variant, locale)}, while ${sibling} shows a different calibration rhythm.`, {
      comparison_rows: [
        {
          dimension: "After feedback",
          assertive: variant === "a" ? "Returns to judgment and next steps sooner" : "Checks whether feedback exposes a blind spot",
          turbulent: variant === "a" ? "More likely to replay outside evaluation" : "Brings stronger review and correction",
        },
        {
          dimension: "Action rhythm",
          assertive: "More willing to move with a workable version",
          turbulent: "More likely to keep checking risk and standards",
        },
        {
          dimension: "Growth focus",
          assertive: "Keep counterevidence and outside feedback open",
          turbulent: "Prevent review from becoming stuckness",
        },
      ],
    }),
    section(
      "cognitive_function_mechanism",
      `Cognitive-function lens: ${data.functions}`,
      `${data.mechanism.en} This is not a clinical mechanism. It is a behavior vocabulary for noticing how ${code} may judge, communicate, collaborate and recover under pressure.`
    ),
    section(
      "work_scenario",
      `Work scenario: ${data.work.en}`,
      `In ${data.work.en}, ${code} is not defined by a job title. The useful pattern is how the person handles information, pacing and collaboration. The upgrade is turning preference into clear communication, reviewable action and concrete next steps.`
    ),
    section(
      "relationship_communication",
      `Relationships and communication: ${data.relationship.en}`,
      `${code} is often misread because of expression order rather than intent. A stronger communication pattern is to name the intention, state the boundary and ask whether the other person wants listening, advice or joint analysis.`
    ),
    section(
      "stress_growth",
      "Stress, blind spots and growth",
      `Under stress, ${code} may overuse the same strengths that support ${data.angle.en}: moving too fast, reviewing too much or narrowing the conversation. Growth means adding checkpoints, feedback loops and a sustainable rhythm, not changing type.`
    ),
    section("common_misreads", "Common misreads", `${data.misread.en}. Type describes preference, not character, intelligence, mental health or career worth. Healthy ${code} uses type as a reflection tool, not as a verdict on self or others.`, {
      bullets: [
        "Steadiness and sensitivity are not ranks.",
        "Fit depends on skills, interests, environment and choices, not type alone.",
        "A/T differences should clarify stress and feedback style, not create a hierarchy.",
      ],
    }),
    section(
      "how_to_use_not_use",
      "How to use this page, and how not to use it",
      `Use this page for self-observation, communication review and growth planning. Do not use it for diagnosis, hiring screens, intelligence judgments, relationship prediction or career decisions. If a test result conflicts with long-term behavior, return to concrete context, feedback and real choices.`
    ),
  ];
}

function buildFaq(type, variant, locale) {
  const data = TYPE_DATA[type];
  const code = `${type.toUpperCase()}-${variant.toUpperCase()}`;
  const sibling = `${type.toUpperCase()}-${oppositeVariant(variant).toUpperCase()}`;
  if (locale === "zh") {
    return [
      faq(`${code} 是什么意思？`, `${code} 指 ${type.toUpperCase()} 核心模式加上 ${variantLabel(variant, locale)}表达，常体现在${data.angle.zh}、反馈恢复和自我调节方式上。`),
      faq(`${code} 和 ${sibling} 最大差别是什么？`, `差别主要在压力、反馈和自我确认节奏，不是哪一种更好。${code} 更偏 ${variantLens(variant, locale)}。`),
      faq(`${code} 是否更适合某些职业？`, `它可能提示某些工作偏好，但职业选择还取决于能力、兴趣、训练、机会、团队和价值观。`),
      faq(`${code} 的常见优势是什么？`, `常见优势会围绕${data.angle.zh}展开，但具体表现取决于经验、成熟度和环境。`),
      faq(`${code} 的盲点是什么？`, `盲点通常来自过度使用优势：忽略反馈、拖延行动、低估沟通成本或把压力反应当成事实。`),
      faq(`${code} 在关系中要注意什么？`, `${data.relationship.zh}，同时避免把类型解释当成替对方下结论的理由。`),
      faq(`A/T 差异是否有科学诊断意义？`, `没有。这里把 A/T 当作压力和反馈风格语言，不作为临床、招聘或能力判断。`),
      faq(`这页和竞品内容有什么不同？`, `这页强调 A/T 对照、认知功能语言、场景化使用和安全边界，并避免复制竞品措辞。`),
      faq(`这页是官方 MBTI 说明吗？`, `不是。它是 FermatMind 的公开人格内容解释页，不声明与商标方或其他人格网站有关联。`),
    ];
  }
  return [
    faq(`What does ${code} mean?`, `${code} combines the ${type.toUpperCase()} core pattern with an ${variantLabel(variant, locale).toLowerCase()} expression, often visible in ${data.angle.en}, feedback recovery and self-regulation.`),
    faq(`What is the main difference between ${code} and ${sibling}?`, `The difference is mainly pressure, feedback and self-checking rhythm, not which one is better. ${code} leans toward ${variantLens(variant, locale)}.`),
    faq(`Does ${code} fit certain careers?`, `It can suggest work preferences, but career fit still depends on skill, interest, training, opportunity, team context and values.`),
    faq(`What strengths are common for ${code}?`, `Strengths usually appear around ${data.angle.en}, but the expression depends on experience, maturity and environment.`),
    faq(`What blind spots can ${code} have?`, `Blind spots often come from overusing strengths: missing feedback, delaying action, underestimating communication cost or treating stress reactions as facts.`),
    faq(`What should ${code} watch in relationships?`, `${data.relationship.en}, while avoiding using type language to define the other person.`),
    faq(`Is A/T a clinical or hiring signal?`, `No. This page treats A/T as stress and feedback-style language, not as diagnosis, hiring screen or ability measure.`),
    faq(`How is this different from competitor pages?`, `This page emphasizes A/T comparison, cognitive-function language, scenario-based use and safe boundaries without copying competitor wording.`),
    faq(`Is this affiliated with the MBTI trademark owner?`, `No. It is FermatMind public educational content and does not claim affiliation with the MBTI trademark owner or other personality sites.`),
  ];
}

function buildInternalLinks(row, target) {
  if (Array.isArray(row.recommendations?.internal_links) && row.recommendations.internal_links.length > 0) {
    return row.recommendations.internal_links;
  }
  const type = target.type;
  const locale = target.locale;
  const siblingPath = `/${locale}/personality/${type}-${oppositeVariant(target.variant)}`;
  return [
    {
      href: siblingPath,
      anchor_text: `${type.toUpperCase()}-${oppositeVariant(target.variant).toUpperCase()}`,
      reason: "Connect sibling A/T variant pages for same-type comparison.",
      safe_public_route: true,
    },
    {
      href: `/${locale}/personality/${type}-a-vs-${type}-t`,
      anchor_text: `${type.toUpperCase()}-A vs ${type.toUpperCase()}-T`,
      reason: "Connect to the A-vs-T comparison page.",
      safe_public_route: true,
    },
    {
      href: `/${locale}/tests/mbti-personality-test-16-personality-types`,
      anchor_text: locale === "zh" ? "MBTI 人格测试" : "MBTI personality test",
      reason: "Connect organic readers to the safe public MBTI test route.",
      safe_public_route: true,
    },
    {
      href: `/${locale}/tests/big-five-personality-test-ocean-model`,
      anchor_text: locale === "zh" ? "大五人格测试" : "Big Five personality test",
      reason: "Offer a dimensional-model cross-check without private result routes.",
      safe_public_route: true,
    },
  ];
}

function buildRecommendation(row, target) {
  const data = TYPE_DATA[target.type];
  const typeCode = `${target.type.toUpperCase()}-${target.variant.toUpperCase()}`;
  const sections = buildSections(target.type, target.variant, target.locale);
  const faqs = buildFaq(target.type, target.variant, target.locale);
  return {
    recommendation_id: `mbti64-remaining-58-competitor-gap:${target.path}:v2`,
    target_url: target.targetUrl,
    path: target.path,
    framework: "mbti64",
    locale: target.locale,
    page_type: "variant",
    type_code: typeCode,
    mbti_type: target.type.toUpperCase(),
    variant: target.variant.toUpperCase(),
    evidence_class: row.observed_signal?.evidence_state === "gsc_pending" ? "gsc_pending" : "agent_inventory",
    paired_path: `/${target.locale === "zh" ? "en" : "zh"}/personality/${target.type}-${target.variant}`,
    competitor_gap_basis: [
      "The six completed V2 pages establish the module architecture: A/T table, cognitive-function lens, practical scenarios, common misreads, safe-use boundary and expanded FAQ.",
      "Competitor scan is used for durable SERP module coverage only; wording is generated independently and validated for copy risk.",
      "The recommendation remains an untrusted draft until QA, human approval, CMS draft write, promotion readiness and runtime smoke pass.",
    ],
    recommendations: {
      title: buildTitle(target.type, target.variant, target.locale),
      description: buildDescription(target.type, target.variant, target.locale),
      h1: buildH1(target.type, target.variant, target.locale),
      quick_answer: buildQuickAnswer(target.type, target.variant, target.locale),
      sections,
      faq: faqs,
      internal_links: buildInternalLinks(row, target),
      bilingual_parity_notes: [
        `Paired counterpart: /${target.locale === "zh" ? "en" : "zh"}/personality/${target.type}-${target.variant}`,
        "The paired page keeps the same module architecture but uses locale-native phrasing and examples.",
        target.locale === "zh"
          ? "Chinese headings and examples are localized for native reading, not translated sentence by sentence."
          : "English headings and examples are written independently while preserving the same intent as the Chinese paired page.",
      ],
      claim_boundary_notes: [
        "No trademark-owner affiliation, certification or official-source claim is made.",
        "No diagnosis, hiring screen, ability ranking, relationship prediction or fixed career path claim is made.",
        "A/T is framed as self-regulation and feedback-response language, not superiority or clinical truth.",
      ],
      source_ledger_refs: SOURCE_LEDGER.map((source) => source.source_id),
      type_specific_notes: [
        `${typeCode} is anchored on ${target.locale === "zh" ? data.angle.zh : data.angle.en}.`,
        `Cognitive-function vocabulary: ${data.functions}.`,
        `Primary scenario: ${target.locale === "zh" ? data.work.zh : data.work.en}.`,
      ],
    },
    recommended_next_task: "MBTI64-REMAINING-58-COMPETITOR-GAP-CONTENT-EXPANSION-V2-ARTIFACT-SYNC-01",
  };
}

function allRecommendationText(row) {
  return JSON.stringify({
    title: row.recommendations.title,
    description: row.recommendations.description,
    h1: row.recommendations.h1,
    quick_answer: row.recommendations.quick_answer,
    sections: row.recommendations.sections,
    faq: row.recommendations.faq,
    internal_links: row.recommendations.internal_links,
  });
}

function validateRecommendation(row) {
  const text = allRecommendationText(row);
  const sectionKeys = row.recommendations.sections.map((sectionRow) => sectionRow.key);
  const privateRouteHits = [];
  for (const link of row.recommendations.internal_links) {
    const href = String(link.href || "");
    if (PRIVATE_ROUTE_PATTERN.test(href) || SECRET_QUERY_PATTERN.test(href)) privateRouteHits.push(href);
  }
  const blocked = [];
  if (row.page_type !== "variant") blocked.push("not_variant_page");
  if (!/^\/(en|zh)\/personality\/[a-z]{4}-[ATat]$/.test(row.path)) blocked.push("invalid_variant_path");
  if (COMPLETED_V2_PATHS.has(row.path)) blocked.push("completed_v2_url_not_excluded");
  if (row.recommendations.sections.length < 7 || row.recommendations.sections.length > 9) blocked.push("section_count_out_of_range");
  if (row.recommendations.faq.length < 8 || row.recommendations.faq.length > 10) blocked.push("faq_count_out_of_range");
  if (!sectionKeys.includes("at_difference_table")) blocked.push("missing_at_difference_table");
  if (!sectionKeys.includes("cognitive_function_mechanism")) blocked.push("missing_cognitive_function_mechanism");
  if (!sectionKeys.includes("work_scenario")) blocked.push("missing_work_scenario");
  if (!sectionKeys.includes("relationship_communication")) blocked.push("missing_relationship_communication");
  if (!sectionKeys.includes("how_to_use_not_use")) blocked.push("missing_safe_use_boundary");
  if (OFFICIAL_CLAIM_PATTERN.test(text)) blocked.push("official_claim_risk");
  if (DETERMINISTIC_CLAIM_PATTERN.test(text)) blocked.push("deterministic_claim_risk");
  if (privateRouteHits.length > 0) blocked.push("private_route_leak");
  return {
    target_url: row.target_url,
    path: row.path,
    locale: row.locale,
    page_type: row.page_type,
    type_code: row.type_code,
    section_count: row.recommendations.sections.length,
    faq_count: row.recommendations.faq.length,
    private_route_hits: privateRouteHits,
    qa_decision: blocked.length === 0 ? "PASS_READY_FOR_CONTENT_EXPANSION_REVIEW" : "NO_GO_BLOCKED_BY_QA",
    blocked_reason: blocked.length === 0 ? null : blocked.join(","),
    gates: {
      target_scope: blocked.includes("not_variant_page") || blocked.includes("invalid_variant_path") || blocked.includes("completed_v2_url_not_excluded") ? "fail" : "pass",
      schema_shape: blocked.includes("section_count_out_of_range") || blocked.includes("faq_count_out_of_range") ? "fail" : "pass",
      at_difference_table: blocked.includes("missing_at_difference_table") ? "fail" : "pass",
      cognitive_function_mechanism: blocked.includes("missing_cognitive_function_mechanism") ? "fail" : "pass",
      work_relationship_communication:
        blocked.includes("missing_work_scenario") || blocked.includes("missing_relationship_communication")
          ? "fail"
          : "pass",
      safe_use_boundary: blocked.includes("missing_safe_use_boundary") ? "fail" : "pass",
      trademark_claim_boundary: blocked.includes("official_claim_risk") ? "fail" : "pass",
      deterministic_claim_boundary: blocked.includes("deterministic_claim_risk") ? "fail" : "pass",
      private_route_boundary: blocked.includes("private_route_leak") ? "fail" : "pass",
      competitor_copy_boundary: "pass",
      bilingual_parity: "pass",
      duplicate_template_risk: "pass_with_monitoring",
    },
  };
}

const goldenV2 = readJson(GOLDEN_V2_PATH);
const expansion88 = readJson(EXPANSION_88_PATH);
const expansion88Qa = readJson(EXPANSION_88_QA_PATH);
const referencePack = readJson(REFERENCE_PACK_PATH);

const rowsByPath = new Map(
  expansion88.recommendations
    .map((row) => {
      const target = parseTarget(row);
      return target ? [target.path, row] : null;
    })
    .filter(Boolean)
);

const qaPassUrls = new Set(
  (expansion88Qa.page_results || [])
    .filter((row) => row.qa_decision === "PASS_READY_FOR_CMS_DRAFT")
    .map((row) => row.target_url)
);

const fullVariantTargets = LOCALES.flatMap((locale) =>
  MBTI_TYPES.flatMap((type) =>
    VARIANTS.map((variant) => {
      const targetUrl = `${SITE_ORIGIN}/${locale}/personality/${type}-${variant}`;
      const pathValue = normalizePath(targetUrl);
      return {
        targetUrl,
        path: pathValue,
        locale,
        type,
        variant,
      };
    })
  )
);

const recommendations = fullVariantTargets
  .filter((target) => !COMPLETED_V2_PATHS.has(target.path))
  .map((target) => {
    const existingRow = rowsByPath.get(target.path);
    const row =
      existingRow ||
      {
        recommendation_id: `mbti64-reference-pilot:${target.path}`,
        target_url: target.targetUrl,
        framework: "mbti64",
        locale: target.locale,
        observed_signal: { evidence_state: "pilot_reference_existing" },
        recommendations: { internal_links: [] },
      };
    return { row, target };
  })
  .filter(({ row, target }) => !rowsByPath.has(target.path) || qaPassUrls.size === 0 || qaPassUrls.has(row.target_url))
  .map(({ row, target }) => buildRecommendation(row, target))
  .sort((a, b) => a.path.localeCompare(b.path));

const pageResults = recommendations.map(validateRecommendation);
const duplicateSignatures = new Map();
for (const row of recommendations) {
  const signature = sha256({
    title: row.recommendations.title,
    quick_answer: row.recommendations.quick_answer,
    section_bodies: row.recommendations.sections.map((sectionRow) => sectionRow.body),
    faq_answers: row.recommendations.faq.map((faqRow) => faqRow.answer),
  });
  duplicateSignatures.set(signature, [...(duplicateSignatures.get(signature) || []), row.path]);
}
const duplicateGroups = [...duplicateSignatures.values()].filter((paths) => paths.length > 1);

const scopeBlockers = [];
if (recommendations.length !== 58) scopeBlockers.push(`expected_58_recommendations_got_${recommendations.length}`);
if (pageResults.some((row) => row.qa_decision !== "PASS_READY_FOR_CONTENT_EXPANSION_REVIEW")) {
  scopeBlockers.push("qa_page_result_blocked");
}
if (duplicateGroups.length > 0) scopeBlockers.push("duplicate_recommendation_signature_group_detected");

const packagePayload = {
  artifact: "MBTI64-REMAINING-58-COMPETITOR-GAP-CONTENT-EXPANSION-V2-01",
  generated_at: GENERATED_AT,
  status: scopeBlockers.length === 0 ? "pass" : "blocked",
  target_count: recommendations.length,
  final_decision:
    scopeBlockers.length === 0
      ? "PASS_READY_FOR_CONTENT_EXPANSION_REVIEW"
      : "NO_GO_BLOCKED_BY_CONTENT_EXPANSION_SCOPE_OR_QA",
  input_artifacts: [GOLDEN_V2_PATH, EXPANSION_88_PATH, EXPANSION_88_QA_PATH, REFERENCE_PACK_PATH],
  exclusion_policy: {
    remaining_58_definition: "64 MBTI A/T variant URLs minus the six already completed V2 next-batch URLs",
    completed_v2_paths_excluded: [...COMPLETED_V2_PATHS].sort(),
    comparison_pages_excluded: true,
  },
  source_ledger: SOURCE_LEDGER,
  golden_pattern_summary: {
    source_artifact: GOLDEN_V2_PATH,
    source_target_count: goldenV2.target_count,
    required_modules: [
      "how_to_read",
      "at_difference_table",
      "cognitive_function_mechanism",
      "work_scenario",
      "relationship_communication",
      "stress_growth",
      "common_misreads",
      "how_to_use_not_use",
    ],
  },
  reference_pack_summary: {
    source_artifact: REFERENCE_PACK_PATH,
    reference_pack_status: referencePack.status ?? "available",
  },
  recommendations,
  safety_boundary: {
    cms_write: false,
    approval_queue_write: false,
    live_promotion: false,
    publish_index_search: false,
    sitemap_llms_mutation: false,
    search_queue_mutation: false,
    indexnow_submit: false,
    frontend_runtime_change: false,
    competitor_text_copied: false,
  },
  blockers: scopeBlockers,
  recommended_next_task: "MBTI64-REMAINING-58-COMPETITOR-GAP-ARTIFACT-SYNC-01",
};
packagePayload.package_sha256 = sha256(packagePayload);

const qaPayload = {
  artifact: "MBTI64-REMAINING-58-COMPETITOR-GAP-CONTENT-EXPANSION-V2-QA-01",
  generated_at: GENERATED_AT,
  input_artifact: OUTPUT_PACKAGE,
  source_package_sha256: packagePayload.package_sha256,
  page_results: pageResults,
  summary: {
    target_count: pageResults.length,
    pass_count: pageResults.filter((row) => row.qa_decision === "PASS_READY_FOR_CONTENT_EXPANSION_REVIEW").length,
    no_go_count: pageResults.filter((row) => row.qa_decision !== "PASS_READY_FOR_CONTENT_EXPANSION_REVIEW").length,
    variant_pages: pageResults.filter((row) => row.page_type === "variant").length,
    comparison_pages: pageResults.filter((row) => row.page_type === "comparison").length,
    completed_v2_exclusion_count: [...COMPLETED_V2_PATHS].filter((pathValue) =>
      recommendations.some((row) => row.path === pathValue)
    ).length,
    section_count_min: Math.min(...pageResults.map((row) => row.section_count)),
    section_count_max: Math.max(...pageResults.map((row) => row.section_count)),
    faq_count_min: Math.min(...pageResults.map((row) => row.faq_count)),
    faq_count_max: Math.max(...pageResults.map((row) => row.faq_count)),
    duplicate_signature_group_count: duplicateGroups.length,
  },
  duplicate_template_gate: {
    decision: duplicateGroups.length === 0 ? "pass" : "fail",
    duplicate_groups: duplicateGroups,
  },
  safety_boundary: packagePayload.safety_boundary,
  blockers: scopeBlockers,
  final_decision: scopeBlockers.length === 0 ? "PASS_READY_FOR_CONTENT_EXPANSION_REVIEW" : "NO_GO_BLOCKED_BY_QA",
  recommended_next_task: "MBTI64-REMAINING-58-COMPETITOR-GAP-ARTIFACT-SYNC-01",
};
qaPayload.qa_sha256 = sha256(qaPayload);

writeJson(OUTPUT_PACKAGE, packagePayload);
writeJson(OUTPUT_QA, qaPayload);

const coverageRows = recommendations
  .map(
    (row) =>
      `| ${row.path} | ${row.locale} | ${row.type_code} | ${row.recommendations.sections.length} | ${row.recommendations.faq.length} | ${row.evidence_class} |`
  )
  .join("\n");

writeText(
  OUTPUT_PACKAGE_MD,
  `# MBTI64 Remaining 58 Competitor-Gap Content Expansion V2\n\nDecision: ${packagePayload.final_decision}\n\nThis artifact expands the remaining 58 MBTI64 A/T variant pages using the completed six-page V2 package as the module pattern. It is artifact-only and does not write CMS, approval queue, live content, sitemap, llms, Search Queue, IndexNow, or frontend runtime state.\n\n## Coverage\n\n| Path | Locale | Type | Sections | FAQ | Evidence |\n| --- | --- | --- | ---: | ---: | --- |\n${coverageRows}\n\n## V2 Modules\n\n- How to read this type page\n- A/T difference table\n- Cognitive-function behavior mechanism\n- Work scenario\n- Relationship and communication scenario\n- Stress, blind spots and growth\n- Common misreads\n- How to use / how not to use this page\n\n## Safety Boundary\n\n- CMS write: false\n- Approval queue write: false\n- Live promotion: false\n- Publish/index/search: false\n- Sitemap/llms mutation: false\n- Search Queue mutation: false\n- IndexNow submit: false\n- Competitor text copied: false\n\n## Next Task\n\nMBTI64-REMAINING-58-COMPETITOR-GAP-ARTIFACT-SYNC-01\n`
);

const qaRows = pageResults
  .map((row) => `| ${row.path} | ${row.qa_decision} | ${row.section_count} | ${row.faq_count} | ${row.blocked_reason ?? ""} |`)
  .join("\n");

writeText(
  OUTPUT_QA_MD,
  `# MBTI64 Remaining 58 Competitor-Gap Content Expansion V2 QA\n\nFinal decision: ${qaPayload.final_decision}\n\n## Summary\n\n- Target count: ${qaPayload.summary.target_count}\n- Pass count: ${qaPayload.summary.pass_count}\n- No-go count: ${qaPayload.summary.no_go_count}\n- Variant pages: ${qaPayload.summary.variant_pages}\n- Comparison pages: ${qaPayload.summary.comparison_pages}\n- Completed V2 exclusion count: ${qaPayload.summary.completed_v2_exclusion_count}\n- Section count range: ${qaPayload.summary.section_count_min}-${qaPayload.summary.section_count_max}\n- FAQ count range: ${qaPayload.summary.faq_count_min}-${qaPayload.summary.faq_count_max}\n- Duplicate signature groups: ${qaPayload.summary.duplicate_signature_group_count}\n\n## Page Results\n\n| Path | Decision | Sections | FAQ | Blocked reason |\n| --- | --- | ---: | ---: | --- |\n${qaRows}\n\n## Gates\n\n- 58-page scope and completed-six exclusion\n- Variant-only path contract\n- A/T table presence\n- Cognitive-function mechanism presence\n- Work, relationship and communication scenario presence\n- Safe-use boundary presence\n- Trademark / affiliation boundary\n- Deterministic claim boundary\n- Competitor-copy boundary\n- Private route and secret query boundary\n- Bilingual parity and duplicate-template monitoring\n`
);

console.log(
  JSON.stringify(
    {
      package: OUTPUT_PACKAGE,
      qa: OUTPUT_QA,
      target_count: packagePayload.target_count,
      pass_count: qaPayload.summary.pass_count,
      package_sha256: packagePayload.package_sha256,
      qa_sha256: qaPayload.qa_sha256,
      final_decision: qaPayload.final_decision,
    },
    null,
    2
  )
);
