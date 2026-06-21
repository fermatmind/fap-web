#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AUDIT_DATE = process.env.AUDIT_DATE || "2026-06-21";
const GENERATED_AT = process.env.GENERATED_AT || new Date().toISOString();
const SITE_ORIGIN = "https://fermatmind.com";
const GRAPH_PATH = "docs/seo/personality/internal-link-graph-2026-06-18.json";
const REFERENCE_PACK_PATH = "docs/seo/personality/mbti64-optimized-pilot-reference-pack-2026-06-21.json";
const SCHEMA_PATH = ".agents/skills/public-profile-seo-asset-factory/schemas/public-profile-agent-recommendation.schema.json";
const OUTPUT_JSON = `docs/seo/personality/mbti64-agent-expansion-88-recommendations-${AUDIT_DATE}.json`;
const OUTPUT_MD = `docs/seo/personality/mbti64-agent-expansion-88-recommendations-${AUDIT_DATE}.md`;

const QA_REQUIRED = [
  "schema_validation",
  "trademark_claim_gate",
  "claim_risk_gate",
  "duplicate_template_gate",
  "private_route_gate",
  "result_page_leakage_gate",
  "seo_projection_gate",
  "bilingual_consistency_gate",
];

const PRIVATE_PATTERNS = [
  /\/results?\b/i,
  /\/orders?\b/i,
  /\/pay(?:ment)?\b/i,
  /\/history\b/i,
  /\/private\b/i,
  /\/account\b/i,
  /token=/i,
  /session=/i,
  /result_id=/i,
  /report_id=/i,
  /order_no=/i,
];

const TYPE_LABELS = {
  intj: { en: "INTJ Architect", zh: "INTJ 建筑师" },
  intp: { en: "INTP Logician", zh: "INTP 逻辑学家" },
  entj: { en: "ENTJ Commander", zh: "ENTJ 指挥官" },
  entp: { en: "ENTP Debater", zh: "ENTP 辩论家" },
  infj: { en: "INFJ Advocate", zh: "INFJ 提倡者" },
  infp: { en: "INFP Mediator", zh: "INFP 调停者" },
  enfj: { en: "ENFJ Protagonist", zh: "ENFJ 主人公" },
  enfp: { en: "ENFP Campaigner", zh: "ENFP 竞选者" },
  istj: { en: "ISTJ Logistician", zh: "ISTJ 物流师" },
  isfj: { en: "ISFJ Defender", zh: "ISFJ 守卫者" },
  estj: { en: "ESTJ Executive", zh: "ESTJ 总经理" },
  esfj: { en: "ESFJ Consul", zh: "ESFJ 执政官" },
  istp: { en: "ISTP Virtuoso", zh: "ISTP 鉴赏家" },
  isfp: { en: "ISFP Adventurer", zh: "ISFP 探险家" },
  estp: { en: "ESTP Entrepreneur", zh: "ESTP 企业家" },
  esfp: { en: "ESFP Entertainer", zh: "ESFP 表演者" },
};

const TYPE_ANGLES = {
  intj: { en: "strategy, independence and long-range planning", zh: "战略规划、独立判断和长期目标" },
  intp: { en: "analysis, curiosity and independent problem solving", zh: "分析、好奇心和独立解题" },
  entj: { en: "leadership, execution and systems decisions", zh: "领导、执行和系统决策" },
  entp: { en: "debate, experimentation and idea testing", zh: "辩论、实验和想法验证" },
  infj: { en: "insight, values and long-term meaning", zh: "洞察、价值感和长期意义" },
  infp: { en: "values, empathy and personal meaning", zh: "价值观、同理心和个人意义" },
  enfj: { en: "people leadership, encouragement and shared direction", zh: "人际带动、鼓励和共同方向" },
  enfp: { en: "possibility, connection and creative momentum", zh: "可能性、人际连接和创意动力" },
  istj: { en: "responsibility, order and reliable execution", zh: "责任、秩序和稳定执行" },
  isfj: { en: "care, memory and dependable support", zh: "照顾、经验记忆和可靠支持" },
  estj: { en: "structure, decisions and operational follow-through", zh: "结构、决策和运营推进" },
  esfj: { en: "support, belonging and practical coordination", zh: "支持、归属和实际协调" },
  istp: { en: "hands-on problem solving, autonomy and calm troubleshooting", zh: "动手解题、自主和冷静排障" },
  isfp: { en: "taste, experience and quiet personal expression", zh: "审美、体验和安静表达" },
  estp: { en: "action, opportunity and real-time adaptation", zh: "行动、机会和现场应变" },
  esfp: { en: "energy, presence and shared experience", zh: "活力、现场感和共同体验" },
};

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(ROOT, relativePath), "utf8"));
}

function writeFile(relativePath, content) {
  const absolute = path.resolve(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content);
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function normalizePath(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, SITE_ORIGIN);
    return url.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return raw.split("?")[0]?.split("#")[0]?.replace(/\/+$/, "") || "/";
  }
}

function decodeHtml(value) {
  const entities = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };
  return String(value || "").replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (match, entity) => entities[entity] || match);
}

function firstMatch(html, regex) {
  return decodeHtml(String(html || "").match(regex)?.[1] || "").trim();
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function fullUrl(pagePath) {
  return `${SITE_ORIGIN}${normalizePath(pagePath)}`;
}

async function fetchCurrentSurface(node) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(node.url, {
      signal: controller.signal,
      headers: { "user-agent": "FermatMind MBTI64 agent expansion dry-run" },
    });
    const html = await response.text();
    return {
      status: response.status,
      title: firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
      description: firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i),
      h1: firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
      quick_answer: "",
      faq_count: (stripTags(html).match(/\?/g) || []).length,
      internal_link_count: (html.match(/href=["']\/(?:en|zh)\//g) || []).length,
      html_sha256: sha256(html),
      private_route_hits: PRIVATE_PATTERNS.filter((pattern) => pattern.test(html)).map((pattern) => pattern.toString()),
    };
  } catch (error) {
    return {
      status: null,
      title: "",
      description: "",
      h1: "",
      quick_answer: "",
      faq_count: 0,
      internal_link_count: 0,
      fetch_error: error instanceof Error ? error.message : String(error),
      private_route_hits: [],
    };
  } finally {
    clearTimeout(timeout);
  }
}

function localeBucket(locale) {
  return locale === "zh" || locale === "zh-CN" ? "zh" : "en";
}

function variantLabel(variant, locale) {
  if (localeBucket(locale) === "zh") return variant === "a" ? "A 型" : "T 型";
  return variant === "a" ? "Assertive" : "Turbulent";
}

function variantArticlePhrase(variant, locale) {
  const label = variantLabel(variant, locale);
  if (localeBucket(locale) === "zh") return `${label}身份风格`;
  return variant === "a" ? `an ${label} identity style` : `a ${label} identity style`;
}

function variantLens(variant, locale) {
  if (localeBucket(locale) === "zh") {
    return variant === "a"
      ? "更偏向稳定自信、决策后持续推进和较少反复确认"
      : "更偏向主动复盘、对反馈敏感和在压力下持续校准";
  }
  return variant === "a"
    ? "steadier self-trust, post-decision follow-through and less repeated reassurance"
    : "active self-checking, stronger feedback sensitivity and more pressure-based recalibration";
}

function variantLensShort(variant, locale) {
  if (localeBucket(locale) === "zh") return variantLens(variant, locale);
  return variant === "a"
    ? "steady self-trust and follow-through"
    : "active self-checking and feedback sensitivity";
}

function typeLabel(type, locale) {
  return TYPE_LABELS[type]?.[localeBucket(locale)] || type.toUpperCase();
}

function typeAngle(type, locale) {
  return TYPE_ANGLES[type]?.[localeBucket(locale)] || type.toUpperCase();
}

function recommendationText(current, recommended, reason) {
  return { current: current || "", recommended, reason };
}

function buildRecommendedTitle(node) {
  const code = node.mbti_type.toUpperCase();
  if (node.page_type === "comparison") {
    if (localeBucket(node.locale) === "zh") return `${code}-A vs ${code}-T：差异、压力反应与关系沟通 | FermatMind`;
    return `${code}-A vs ${code}-T: Confidence, Stress and Work Style | FermatMind`;
  }
  if (localeBucket(node.locale) === "zh") {
    return `${code}-${node.variant.toUpperCase()} 人格特点：${typeAngle(node.mbti_type, node.locale)} | FermatMind`;
  }
  return `${code}-${node.variant.toUpperCase()} Meaning: ${variantLabel(node.variant, node.locale)} ${typeLabel(node.mbti_type, node.locale).replace(`${code} `, "")} Traits | FermatMind`;
}

function buildRecommendedDescription(node) {
  const code = node.mbti_type.toUpperCase();
  const angle = typeAngle(node.mbti_type, node.locale);
  if (node.page_type === "comparison") {
    if (localeBucket(node.locale) === "zh") {
      return `比较 ${code}-A 和 ${code}-T 如何围绕${angle}处理自信、压力恢复、反馈、工作节奏和关系沟通。`;
    }
    return `Compare ${code}-A and ${code}-T through ${angle}, confidence, stress recovery, feedback style, work rhythm and relationships.`;
  }
  if (localeBucket(node.locale) === "zh") {
    return `系统了解 ${code}-${node.variant.toUpperCase()} 的${angle}、${variantLens(node.variant, node.locale)}、优势盲点、工作风格和关系沟通。`;
  }
  return `Explore ${code}-${node.variant.toUpperCase()} through ${angle}, ${variantLensShort(node.variant, node.locale)}, strengths, blind spots and relationships.`;
}

function buildRecommendedH1(node) {
  const code = node.mbti_type.toUpperCase();
  if (node.page_type === "comparison") return `${code}-A vs ${code}-T${localeBucket(node.locale) === "zh" ? "：关键差异" : ": Key Differences"}`;
  return localeBucket(node.locale) === "zh" ? `${code}-${node.variant.toUpperCase()} 人格特点` : `${code}-${node.variant.toUpperCase()} Meaning`;
}

function buildQuickAnswer(node) {
  const code = node.mbti_type.toUpperCase();
  const angle = typeAngle(node.mbti_type, node.locale);
  if (node.page_type === "comparison") {
    if (localeBucket(node.locale) === "zh") {
      return `${code}-A 和 ${code}-T 共享同一个 ${code} 核心；在${angle}这个主题下，差异主要体现在自信稳定度、压力反应、反馈处理和自我修正方式。这个页面适合比较两种 A/T 风格，而不是判断哪一种更好。`;
    }
    return `${code}-A and ${code}-T share the same ${code} core. Within ${angle}, the useful difference is how the two A/T styles handle confidence, pressure, feedback and self-correction, not which one is better.`;
  }
  if (localeBucket(node.locale) === "zh") {
    return `${code}-${node.variant.toUpperCase()} 是 ${code} 核心加上 ${variantArticlePhrase(node.variant, node.locale)}的公开人格画像，通常会围绕${angle}展开，并呈现${variantLens(node.variant, node.locale)}。它适合用于自我理解和沟通校准，不适合作为职业或关系结论。`;
  }
  return `${code}-${node.variant.toUpperCase()} combines the ${code} core pattern with ${variantArticlePhrase(node.variant, node.locale)}. In practice, this points to ${variantLens(node.variant, node.locale)} around ${angle}. Read it as a public profile, not as a career or relationship verdict.`;
}

function buildFaq(node) {
  const code = node.mbti_type.toUpperCase();
  const angle = typeAngle(node.mbti_type, node.locale);
  if (node.page_type === "comparison") {
    if (localeBucket(node.locale) === "zh") {
      return [
        [`${code}-A 和 ${code}-T 最大差异是什么？`, `在${angle}相关情境里，主要差异通常是自信稳定度、压力反应、反馈处理和自我修正节奏，而不是 ${code} 核心是否改变。`],
        [`${code}-A 比 ${code}-T 更好吗？`, `不是。A/T 是风格差异，不是优劣等级。${code} 的不同任务场景会奖励不同的稳定性、谨慎度和修正能力。`],
        [`如何判断自己更像 ${code}-A 还是 ${code}-T？`, `观察你在${angle}相关压力、批评、选择后复盘和不确定环境中的自然反应，比只看标签更可靠。`],
        [`这个比较可以用于职业决定吗？`, `不建议直接用于职业决定。它可以帮助你理解 ${code} 在工作节奏和沟通偏好上的差异，但不能替代能力、经验和环境判断。`],
        [`A/T 是官方 MBTI 维度吗？`, `这里把 A/T 作为 FermatMind 公共画像中的身份风格层来解释，不把它表述为官方 MBTI 原生维度。`],
      ].map(([question, answer]) => ({ question, answer, reason: "Covers comparison intent and claim boundary." }));
    }
    return [
      [`What is the main ${code}-A vs ${code}-T difference?`, `Around ${angle}, the main difference is usually confidence style, stress response, feedback processing and self-correction, not a change in the ${code} core.`],
      [`Is ${code}-A better than ${code}-T?`, `No. A/T describes style differences, not a ranking. ${code} situations can reward steadiness, caution or revision in different ways.`],
      [`How can I tell whether I am ${code}-A or ${code}-T?`, `Look at your response to ${angle}-related pressure, criticism, uncertainty and post-decision review rather than treating the label as a verdict.`],
      [`Can this comparison decide my career path?`, `No. It can support ${code} work-style reflection, but it should not replace skills, experience, values or context.`],
      [`Is A/T an official MBTI dimension?`, `This page treats A/T as an identity-style layer in FermatMind public profiles, not as an official native MBTI dimension.`],
    ].map(([question, answer]) => ({ question, answer, reason: "Covers comparison intent and claim boundary." }));
  }

  if (localeBucket(node.locale) === "zh") {
    return [
      [`${code}-${node.variant.toUpperCase()} 人格特点是什么？`, `${code}-${node.variant.toUpperCase()} 通常把 ${code} 核心与 ${variantArticlePhrase(node.variant, node.locale)}结合起来，重点体现在${angle}和${variantLens(node.variant, node.locale)}。`],
      [`${code}-${node.variant.toUpperCase()} 适合什么工作环境？`, `更适合讨论${angle}相关的工作节奏、沟通方式和环境偏好，不能直接推出职业结论或招聘判断。`],
      [`${code}-${node.variant.toUpperCase()} 的优势和盲点是什么？`, `优势和盲点需要结合${variantLens(node.variant, node.locale)}看待；同一种风格在不同团队、压力和任务结构中会有不同表现。`],
      [`${code}-${node.variant.toUpperCase()} 和另一种 A/T 有什么不同？`, `主要看${variantLens(node.variant, node.locale)}如何影响压力反应、自信稳定度、反馈处理和复盘强度，而不是人格核心是否完全不同。`],
      [`这个页面可以替代测试结果吗？`, `不能。它是公共解释页，适合先理解概念；个人结果仍应以正式测试和完整报告为准。`],
    ].map(([question, answer]) => ({ question, answer, reason: "Covers variant meaning, work-style reflection and boundary." }));
  }

  return [
    [`What does ${code}-${node.variant.toUpperCase()} mean?`, `${code}-${node.variant.toUpperCase()} combines the ${code} core pattern with ${variantArticlePhrase(node.variant, node.locale)}, especially around ${angle} and ${variantLens(node.variant, node.locale)}.`],
    [`What work environment fits ${code}-${node.variant.toUpperCase()}?`, `Use the profile to reflect on ${angle}-related work rhythm, communication and environment fit, not to make a deterministic career decision.`],
    [`What are common ${code}-${node.variant.toUpperCase()} strengths and blind spots?`, `Strengths and blind spots depend on context and ${variantLens(node.variant, node.locale)}; the same style can help or hinder depending on team, pressure and task structure.`],
    [`How is ${code}-${node.variant.toUpperCase()} different from the other A/T variant?`, `The practical difference is how ${variantLens(node.variant, node.locale)} changes stress response, confidence stability, feedback processing and revision intensity.`],
    [`Can this page replace a test result?`, `No. This is a public explanation page. Personal interpretation should come from a completed test and full report context.`],
  ].map(([question, answer]) => ({ question, answer, reason: "Covers variant meaning, work-style reflection and boundary." }));
}

function buildInternalLinks(node, edges) {
  const graphLinks = edges
    .filter((edge) => edge.source_path === node.path && edge.safe_public_route === true && !edge.publish_blocker_if_any)
    .slice(0, 4)
    .map((edge) => ({
      href: normalizePath(edge.target_url),
      anchor_text: edge.anchor_text_suggestion,
      reason: edge.reason,
      safe_public_route: true,
    }));
  const testPrefix = localeBucket(node.locale) === "zh" ? "/zh" : "/en";
  const testLinks = [
    {
      href: `${testPrefix}/tests/mbti-personality-test-16-personality-types`,
      anchor_text: localeBucket(node.locale) === "zh" ? "MBTI 人格测试" : "MBTI personality test",
      reason: "Connect organic readers to the safe public MBTI test route.",
      safe_public_route: true,
    },
    {
      href: `${testPrefix}/tests/big-five-personality-test-ocean-model`,
      anchor_text: localeBucket(node.locale) === "zh" ? "大五人格测试" : "Big Five personality test",
      reason: "Offer a dimensional-model cross-check without private result routes.",
      safe_public_route: true,
    },
  ];
  return [...graphLinks, ...testLinks].filter((link) => !PRIVATE_PATTERNS.some((pattern) => pattern.test(link.href)));
}

function pickReference(node, referencePages) {
  const sameType = referencePages.find((page) => page.page_type === node.page_type && localeBucket(page.locale) === localeBucket(node.locale));
  return sameType || referencePages.find((page) => page.page_type === node.page_type) || referencePages[0];
}

function buildRecommendation(node, current, referencePack, graph) {
  const reference = pickReference(node, referencePack.pages || []);
  const recommendedTitle = buildRecommendedTitle(node);
  const recommendedDescription = buildRecommendedDescription(node);
  const recommendedH1 = buildRecommendedH1(node);
  const recommendedQuickAnswer = buildQuickAnswer(node);
  return {
    recommendation_id: `mbti64-agent-expansion-88:${node.path}`,
    target_url: fullUrl(node.path),
    framework: "mbti64",
    locale: localeBucket(node.locale) === "zh" ? "zh-CN" : "en",
    source_inputs: {
      cms_or_api_snapshot: "live_html_surface_fetch",
      reference_pack: REFERENCE_PACK_PATH,
      seo_signal: "GSC_EVIDENCE_PENDING",
      source_ledger: "docs/seo/personality/mbti64-optimized-pilot-reference-pack-2026-06-21.json",
    },
    current_surface: {
      title: current.title || "",
      description: current.description || "",
      h1: current.h1 || "",
      quick_answer: current.quick_answer || "",
      faq_count: current.faq_count || 0,
      internal_link_count: current.internal_link_count || 0,
    },
    observed_signal: {
      evidence_state: "gsc_pending",
      impressions: null,
      clicks: null,
      ctr: null,
      average_position: null,
      notes: ["GSC page/query evidence was not available in repo artifacts for the 88-page expansion at generation time."],
    },
    reference_patterns_used: [
      {
        pattern_id: reference?.page_type === "comparison" ? "a_vs_t_comparison_structure" : "variant_profile_structure",
        source_url: reference?.canonical_url || "",
        how_used: "Used for section purpose, QA boundary and internal-link pattern only; wording must not be copied verbatim.",
      },
    ],
    recommendations: {
      title: recommendationText(current.title, recommendedTitle, "Align title with type, A/T intent and single-brand suffix pattern from the optimized pilot."),
      description: recommendationText(current.description, recommendedDescription, "Make the SERP description answer the page intent while preserving method boundaries."),
      h1: recommendationText(current.h1, recommendedH1, "Keep H1 concise and aligned with the canonical page query."),
      quick_answer: recommendationText(current.quick_answer, recommendedQuickAnswer, "Add an answer-first summary that distinguishes this page without deterministic claims."),
      faq: buildFaq(node),
      internal_links: buildInternalLinks(node, graph.recommendedEdges || []),
      differentiation_notes: [
        `Differentiate ${node.path} with ${typeAngle(node.mbti_type, node.locale)} rather than generic MBTI copy.`,
        node.page_type === "comparison"
          ? "Comparison copy must compare A and T directly; do not paste two variant profiles together."
          : "Variant copy must describe this A/T pole and link to the sibling variant plus comparison page.",
        "Keep A/T as a public identity-style layer; do not state that it is official MBTI.",
      ],
    },
    qa_required: QA_REQUIRED,
    blocked_reason: null,
    status: "draft_recommendation",
  };
}

function validateRecommendationShape(recommendation) {
  const blockers = [];
  for (const key of [
    "recommendation_id",
    "target_url",
    "framework",
    "locale",
    "source_inputs",
    "current_surface",
    "observed_signal",
    "reference_patterns_used",
    "recommendations",
    "qa_required",
    "status",
  ]) {
    if (!(key in recommendation)) blockers.push(`missing ${key}: ${recommendation.target_url || recommendation.recommendation_id}`);
  }
  if (recommendation.framework !== "mbti64") blockers.push(`unexpected framework: ${recommendation.target_url}`);
  if (!["en", "zh-CN"].includes(recommendation.locale)) blockers.push(`unexpected locale: ${recommendation.target_url}`);
  if (recommendation.qa_required?.length !== QA_REQUIRED.length) blockers.push(`missing qa gates: ${recommendation.target_url}`);
  const serialized = JSON.stringify(recommendation);
  for (const pattern of PRIVATE_PATTERNS) {
    if (pattern.test(serialized)) blockers.push(`private route/token pattern in recommendation: ${recommendation.target_url}`);
  }
  return blockers;
}

function markdown(report) {
  const lines = [
    "# MBTI64 Agent Expansion 88 Recommendations",
    "",
    `Generated: ${report.generated_at}`,
    `Status: ${report.status}`,
    "",
    "## Summary",
    "",
    `- Expansion recommendations: ${report.summary.recommendation_count}`,
    `- Variant pages: ${report.summary.variant_pages}`,
    `- Comparison pages: ${report.summary.comparison_pages}`,
    `- GSC evidence state: ${report.summary.gsc_evidence_state}`,
    `- Blockers: ${report.blockers.length}`,
    `- Warnings: ${report.warnings.length}`,
    "",
    "## Sample Rows",
    "",
    "| URL | Type | Locale | Recommended title |",
    "| --- | --- | --- | --- |",
  ];
  for (const item of report.recommendations.slice(0, 12)) {
    lines.push(
      `| ${new URL(item.target_url).pathname} | ${item.target_url.includes("-vs-") ? "comparison" : "variant"} | ${item.locale} | ${item.recommendations.title.recommended.replaceAll("|", "\\|")} |`,
    );
  }
  lines.push("");
  lines.push("## Boundary");
  lines.push("");
  lines.push("- Draft recommendations only.");
  lines.push("- No CMS write, publish, indexability change, sitemap/llms mutation, Search Queue action, or search submit.");
  lines.push("- Failed or unreviewed recommendations must not enter CMS draft.");
  lines.push("");
  lines.push("## Next Task");
  lines.push("");
  lines.push(report.recommended_next_task);
  return `${lines.join("\n")}\n`;
}

async function main() {
  const graph = readJson(GRAPH_PATH);
  const referencePack = readJson(REFERENCE_PACK_PATH);
  const schema = readJson(SCHEMA_PATH);
  const pilotPaths = new Set((graph.pilotUrls || []).map((item) => item.path));
  const expansionNodes = (graph.nodes || []).filter((node) => !pilotPaths.has(node.path));
  const blockers = [];
  const warnings = [];

  if (schema.properties?.framework?.enum?.includes("mbti64") !== true) {
    blockers.push("Runner schema does not allow mbti64.");
  }
  if (referencePack.status !== "pass") {
    blockers.push(`Reference pack status is ${referencePack.status}.`);
  }
  if (expansionNodes.length !== 88) {
    blockers.push(`Expected 88 expansion nodes, found ${expansionNodes.length}.`);
  }

  const recommendations = [];
  for (const node of expansionNodes) {
    const current = await fetchCurrentSurface(node);
    if (current.private_route_hits.length > 0) {
      warnings.push(`${node.path}: live surface still reports private-route hints; recommendation body excludes them.`);
    }
    recommendations.push(buildRecommendation(node, current, referencePack, graph));
  }

  const validationBlockers = recommendations.flatMap(validateRecommendationShape);
  blockers.push(...validationBlockers);

  const targetSet = new Set(recommendations.map((item) => new URL(item.target_url).pathname));
  for (const pilotPath of pilotPaths) {
    if (targetSet.has(pilotPath)) blockers.push(`Pilot URL included in expansion recommendations: ${pilotPath}`);
  }

  const report = {
    artifact: "MBTI64-PUBLIC-PROFILE-AGENT-EXPANSION-88-01",
    version: "mbti64.agent_expansion_88_recommendations.v1",
    generated_at: GENERATED_AT,
    status: blockers.length === 0 ? "pass_ready_for_qa_gates" : "fail",
    scope:
      "Artifact-only draft recommendations for 88 non-pilot MBTI64 public personality URLs. No CMS write, publish, indexability, sitemap/llms, Search Queue, approval, or submission action.",
    inputs: {
      internal_link_graph: GRAPH_PATH,
      optimized_pilot_reference_pack: REFERENCE_PACK_PATH,
      runner_schema: SCHEMA_PATH,
    },
    summary: {
      recommendation_count: recommendations.length,
      variant_pages: recommendations.filter((item) => !item.target_url.includes("-vs-")).length,
      comparison_pages: recommendations.filter((item) => item.target_url.includes("-vs-")).length,
      pilot_urls_excluded: pilotPaths.size,
      gsc_evidence_state: "GSC_EVIDENCE_PENDING",
      qa_gate_required_count: QA_REQUIRED.length,
    },
    recommendations,
    blockers,
    warnings,
    recommended_next_task: "PERSONALITY-AGENT-QA-GATES-01",
  };

  writeFile(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
  writeFile(OUTPUT_MD, markdown(report));

  if (blockers.length) {
    console.error(`Generated ${OUTPUT_JSON} with ${blockers.length} blocker(s).`);
    process.exitCode = 1;
  } else {
    console.log(`Generated ${OUTPUT_JSON}`);
    console.log(`Generated ${OUTPUT_MD}`);
  }
}

await main();
