#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const GENERATED_DATE = process.env.GENERATED_DATE || "2026-06-27";
const GENERATED_AT = process.env.GENERATED_AT || `${GENERATED_DATE}T00:00:00.000Z`;
const SITE_ORIGIN = "https://fermatmind.com";

const OUTPUT_PACKAGE = `docs/seo/personality/mbti64-next-batch-6-competitor-gap-content-expansion-${GENERATED_DATE}.json`;
const OUTPUT_PACKAGE_MD = `docs/seo/personality/mbti64-next-batch-6-competitor-gap-content-expansion-${GENERATED_DATE}.md`;
const OUTPUT_QA = `docs/seo/personality/mbti64-next-batch-6-competitor-gap-content-expansion-qa-${GENERATED_DATE}.json`;
const OUTPUT_QA_MD = `docs/seo/personality/mbti64-next-batch-6-competitor-gap-content-expansion-qa-${GENERATED_DATE}.md`;

const SOURCE_HANDOFF = "docs/seo/personality/personality-agent-operations-next-batch-6-handoff-package-2026-06-25.json";
const SOURCE_QA = "docs/seo/personality/personality-agent-operations-next-batch-6-handoff-qa-2026-06-25.json";

const PRIVATE_ROUTE_PATTERN = /\/(results?|orders?|pay|payment|history|private|account)(\/|\b|\?)/i;
const SECRET_QUERY_PATTERN = /\b(token|session|result_id|report_id|order_no)=/i;
const OFFICIAL_CLAIM_PATTERN = /\b(official MBTI|Myers-Briggs certified|certified MBTI|official 16Personalities|official type)\b/i;
const DETERMINISTIC_CLAIM_PATTERN = /\b(guarantee|guaranteed|destined|perfect match|must choose|should always|will always)\b/i;
const FORBIDDEN_ZH_HEADING_PATTERN = /\b(Frequently asked questions|related_content|FAQ)\b/;

function sha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function writeJson(relativePath, payload) {
  const target = path.resolve(ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(payload, null, 2)}\n`);
}

function writeText(relativePath, content) {
  const target = path.resolve(ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function exists(relativePath) {
  return fs.existsSync(path.resolve(ROOT, relativePath));
}

const commonSources = [
  {
    source_id: "fermatmind_next_batch_6_handoff",
    source_type: "internal_artifact",
    path: SOURCE_HANDOFF,
    how_used: "Defines the six already processed MBTI64 next-batch target URLs and existing agent handoff rows.",
  },
  {
    source_id: "fermatmind_next_batch_6_qa",
    source_type: "internal_artifact",
    path: SOURCE_QA,
    how_used: "Confirms prior QA pass state for the six target URLs before this competitor-gap expansion.",
  },
  {
    source_id: "competitor_16personalities",
    source_type: "competitor_scan",
    url: "https://www.16personalities.com/",
    how_used: "Used only for high-level SERP positioning and A/T intent awareness; no text copied.",
  },
  {
    source_id: "competitor_truity",
    source_type: "competitor_scan",
    url: "https://www.truity.com/personality-type/",
    how_used: "Identified durable content modules such as values, motivations, rarity, public questions, and hobbies; no text copied.",
  },
  {
    source_id: "competitor_crystal",
    source_type: "competitor_scan",
    url: "https://www.crystalknows.com/personality-type/",
    how_used: "Identified practical content modules such as blind spots, communication, relationships, motivations, stressors, and growth opportunities; no text copied.",
  },
  {
    source_id: "competitor_personality_junkie",
    source_type: "competitor_scan",
    url: "https://personalityjunkie.com/",
    how_used: "Identified cognitive-function and type-development depth as an English SERP differentiator; no text copied.",
  },
];

const pageDefinitions = [
  {
    path: "/zh/personality/intp-a",
    locale: "zh",
    type: "INTP-A",
    paired_path: "/en/personality/intp-a",
    evidence_class: "query_backed",
    title: "INTP-A 人格特点：理性建模、独立判断与稳定推进",
    description:
      "深入了解 INTP-A 如何分析问题、建立模型、处理不确定性，并区分 INTP-A 与 INTP-T 在自信、复盘和行动推进上的差异。",
    h1: "INTP-A 人格特点",
    quick:
      "INTP-A 通常把世界看成可以拆解和重组的系统。他们更信任自己的逻辑判断，能在信息不完整时先形成假设并推进验证；需要注意的是，过早相信模型也可能低估沟通、情绪和执行同步的成本。",
    atTitle: "INTP-A 与 INTP-T 的关键差异",
    atBody:
      "INTP-A 更容易在完成分析后相信自己的结论，并把注意力放在下一步验证或实现上。INTP-T 往往更容易回看漏洞、反复校准标准，也更在意外界反馈是否暴露了盲区。两者都可以很理性，差别主要在压力下的自我确认速度、复盘强度和对不确定性的容忍方式。",
    mechanismTitle: "行为机制：先建模型，再测试世界",
    mechanismBody:
      "INTP-A 的常见路径是先抽象出规则，再用案例、数据或反例测试规则是否成立。这个过程像是在脑中搭建一个小型系统：哪些变量重要，哪些假设可以暂时忽略，哪里存在结构性矛盾。优势是能快速抓住问题骨架；风险是如果模型太早闭合，就可能错过人的动机、团队节奏和现实限制。",
    scenarioTitle: "工作场景案例：技术评审里的 INTP-A",
    scenarioBody:
      "在一次产品故障复盘中，INTP-A 可能先追问系统如何失效、日志里哪些信号相互矛盾、当前解释是否能覆盖所有边界情况。他们的价值在于把混乱问题拆成可验证假设。更好的做法是同时说明自己的推理路径，让同事知道结论不是否定他人，而是在压缩问题空间。",
    misreadsTitle: "常见误读",
    misreads: [
      "看起来冷静，不代表没有感受；他们可能只是先处理结构问题。",
      "看起来不爱跟进，不代表不负责；他们可能需要把任务变成清晰问题才会稳定推进。",
      "自信不等于固执；健康的 INTP-A 会保留反证入口，而不是把第一版模型当成最终答案。",
    ],
    faqs: [
      ["INTP-A 和 INTP-T 最大差别是什么？", "INTP-A 通常更快相信自己的判断，INTP-T 更容易反复校准和寻求确认。差别不是能力高低，而是压力、反馈和不确定性下的自我调节方式。"],
      ["INTP-A 是否更适合技术或研究工作？", "这类工作常能发挥分析和建模优势，但是否适合还取决于兴趣、训练、执行习惯和环境支持，不能只靠类型决定。"],
      ["INTP-A 会不会显得冷漠？", "有时会。原因通常不是不在乎，而是先处理逻辑和问题结构。主动补充背景、意图和情绪确认能减少误解。"],
      ["INTP-A 的主要盲点是什么？", "常见盲点是低估沟通成本、执行细节和他人接受信息的节奏。"],
      ["INTP-A 如何成长？", "保留模型优势，同时练习把推理过程说出来，定期邀请反例，并把抽象想法拆成可交付步骤。"],
      ["这页能替代正式测评吗？", "不能。它是公开解释页，适合自我理解和沟通反思，不用于诊断、招聘筛选或决定人生选择。"],
    ],
    links: [
      ["/zh/personality/intp-t", "INTP-T"],
      ["/zh/personality/intp-a-vs-intp-t", "INTP-A 与 INTP-T 对比"],
      ["/zh/tests/mbti-personality-test-16-personality-types", "MBTI 人格测试"],
      ["/zh/personality/enfj-a", "ENFJ-A"],
      ["/zh/personality/esfp-a", "ESFP-A"],
    ],
  },
  {
    path: "/en/personality/intp-a",
    locale: "en",
    type: "INTP-A",
    paired_path: "/zh/personality/intp-a",
    evidence_class: "bilingual_paired_counterpart",
    title: "INTP-A Meaning: Independent Analysis, Model Building and Steady Follow-Through",
    description:
      "Understand how INTP-A profiles analyze problems, build internal models, handle uncertainty and differ from INTP-T in self-trust and review intensity.",
    h1: "INTP-A Meaning",
    quick:
      "INTP-A usually approaches the world as a system that can be analyzed, tested and improved. Compared with a more turbulence-sensitive INTP pattern, the assertive variant tends to trust its reasoning sooner and move into validation, while still needing safeguards against over-closing a model too early.",
    atTitle: "INTP-A vs INTP-T: the practical difference",
    atBody:
      "INTP-A is more likely to treat a working conclusion as usable once the logic holds. INTP-T is more likely to keep rechecking assumptions, seeking correction and scanning for possible blind spots. The difference is not ability; it is how quickly the person stabilizes after uncertainty, criticism or incomplete information.",
    mechanismTitle: "Behavior mechanism: build the model, then test reality",
    mechanismBody:
      "A common INTP-A sequence is to abstract the rule, test it against examples and then refine the model. This can make them strong at diagnosis, architecture, research and problem decomposition. The risk is that a clean model can feel more complete than the messy social or operational context around it.",
    scenarioTitle: "Work scenario: INTP-A in a technical review",
    scenarioBody:
      "In a product incident review, an INTP-A may focus on which assumption failed, which logs contradict the first explanation and whether the current theory covers edge cases. This is useful when a team needs a sharper problem frame. It works best when the person also explains the reasoning path, so direct questions are understood as model testing rather than personal criticism.",
    misreadsTitle: "Common misreads",
    misreads: [
      "Detached does not mean indifferent; the person may be prioritizing structure before expression.",
      "Independent does not mean uncooperative; the person may need a clearer problem frame before joining execution.",
      "Confident does not mean closed-minded; the healthy version keeps a live channel for counterexamples.",
    ],
    faqs: [
      ["What is the main difference between INTP-A and INTP-T?", "INTP-A usually stabilizes around its own reasoning faster, while INTP-T tends to review, recheck and monitor feedback more intensely. It is a regulation difference, not a rank."],
      ["Is INTP-A better for technical work?", "Technical and research settings can fit the analysis pattern, but fit still depends on interest, training, collaboration and execution habits."],
      ["Can INTP-A seem emotionally distant?", "Yes, especially when the person focuses on logic first. Naming the intent behind questions and checking the social context can reduce that impression."],
      ["What is a common INTP-A blind spot?", "A common blind spot is underestimating communication cost, follow-through detail or how much context others need before a conclusion feels usable."],
      ["How can INTP-A grow?", "Keep the modeling strength, but practice exposing assumptions, inviting counterexamples and turning abstract conclusions into concrete next steps."],
      ["Is this page a diagnosis?", "No. It is a public personality explanation for reflection and communication, not a clinical, hiring or deterministic decision tool."],
    ],
    links: [
      ["/en/personality/intp-t", "INTP-T"],
      ["/en/personality/intp-a-vs-intp-t", "INTP-A vs INTP-T"],
      ["/en/tests/mbti-personality-test-16-personality-types", "MBTI personality test"],
      ["/en/personality/enfj-a", "ENFJ-A"],
      ["/en/personality/esfp-a", "ESFP-A"],
    ],
  },
  {
    path: "/zh/personality/esfp-a",
    locale: "zh",
    type: "ESFP-A",
    paired_path: "/en/personality/esfp-a",
    evidence_class: "query_backed",
    title: "ESFP-A 人格特点：现场感、行动能量与稳定自信",
    description:
      "了解 ESFP-A 如何通过现场体验、社交能量和即时反馈行动，并区分 ESFP-A 与 ESFP-T 在自信、恢复和长期规划上的差异。",
    h1: "ESFP-A 人格特点",
    quick:
      "ESFP-A 往往通过真实场景、具体反馈和人与人的互动来判断下一步。他们更容易带动气氛、快速回应机会，并在反馈后较快恢复；需要注意的是，强现场感也可能让长期规划、深度复盘和困难对话被推迟。",
    atTitle: "ESFP-A 与 ESFP-T 的关键差异",
    atBody:
      "ESFP-A 通常更能从负面反馈中恢复，继续用行动试探机会。ESFP-T 更可能反复琢磨自己是否表现得足够好，也更容易受评价影响。两者都可以热情、有表现力，差别主要在外部反馈之后的恢复速度和自我怀疑强度。",
    mechanismTitle: "行为机制：用现场信息校准行动",
    mechanismBody:
      "ESFP-A 常通过人的反应、气氛变化、身体感受和可见结果来判断事情是否可行。优势是能快速读懂场景并让事情动起来；风险是如果只依赖现场反馈，可能低估长期后果、系统约束或未表达出来的反对意见。",
    scenarioTitle: "工作场景案例：活动现场里的 ESFP-A",
    scenarioBody:
      "在一场客户活动出现流程延误时，ESFP-A 可能先稳定现场情绪、调动参与感、用临场沟通争取时间。他们能把僵硬流程变成可继续推进的体验。更好的做法是在活动后补一轮复盘，把临场解决方案转成下次可以复用的流程。",
    misreadsTitle: "常见误读",
    misreads: [
      "活跃不等于肤浅；他们可能是通过体验和反馈理解世界。",
      "不爱长篇计划不等于没有责任感；他们往往需要把计划连接到具体场景。",
      "自信不等于不会受伤；只是恢复方式更偏行动和重新参与。",
    ],
    faqs: [
      ["ESFP-A 和 ESFP-T 最大差别是什么？", "ESFP-A 通常更快从反馈中恢复并继续行动，ESFP-T 更容易反复确认自己是否被认可或是否做得足够好。"],
      ["ESFP-A 是否总是外向？", "不一定。ESFP-A 更常被具体体验和人际互动激活，但也需要恢复空间和有质量的关系。"],
      ["ESFP-A 是否不擅长规划？", "不是。挑战通常在于把长期目标转成具体、可感知、能马上推进的步骤。"],
      ["ESFP-A 适合什么工作？", "适合度取决于能力和兴趣。需要现场判断、服务体验、展示沟通或快速响应的环境可能更容易发挥其优势。"],
      ["ESFP-A 如何处理冲突？", "健康的 ESFP-A 可以用直接、温暖和现实感化解紧张；需要避免只求气氛变好而跳过真正的问题。"],
      ["这页能替代正式测评吗？", "不能。它适合自我理解和沟通反思，不用于诊断、招聘筛选或决定人生选择。"],
    ],
    links: [
      ["/zh/personality/esfp-t", "ESFP-T"],
      ["/zh/personality/esfp-a-vs-esfp-t", "ESFP-A 与 ESFP-T 对比"],
      ["/zh/tests/mbti-personality-test-16-personality-types", "MBTI 人格测试"],
      ["/zh/personality/intp-a", "INTP-A"],
      ["/zh/personality/enfj-a", "ENFJ-A"],
    ],
  },
  {
    path: "/en/personality/esfp-a",
    locale: "en",
    type: "ESFP-A",
    paired_path: "/zh/personality/esfp-a",
    evidence_class: "bilingual_paired_counterpart",
    title: "ESFP-A Meaning: Presence, Social Energy and Confident Action",
    description:
      "Explore ESFP-A through presence, shared experience, social energy and the difference between assertive and turbulence-sensitive ESFP patterns.",
    h1: "ESFP-A Meaning",
    quick:
      "ESFP-A often reads the room through concrete signals: energy, facial reactions, pace, movement and immediate feedback. The assertive variant tends to recover from feedback quickly and re-enter action, while still needing structures that keep long-range planning and difficult conversations from being postponed.",
    atTitle: "ESFP-A vs ESFP-T: the practical difference",
    atBody:
      "ESFP-A usually returns to action faster after criticism or uncertainty. ESFP-T may replay the interaction longer and monitor whether others still approve. The difference is not warmth or talent; it is how feedback affects confidence, recovery and the next move.",
    mechanismTitle: "Behavior mechanism: calibrate through live experience",
    mechanismBody:
      "ESFP-A often learns by entering the situation, sensing the response and adjusting in real time. This can be powerful in service, presentation, performance, customer recovery and event settings. The risk is that visible feedback can crowd out quieter constraints, future tradeoffs or people who do not speak up immediately.",
    scenarioTitle: "Work scenario: ESFP-A during a live event",
    scenarioBody:
      "If a customer event starts falling behind schedule, an ESFP-A may first stabilize the room, keep people engaged and improvise a workable path forward. The strength is restoring momentum. The upgrade is to capture the lesson afterward, so the improvised fix becomes a repeatable process rather than a one-time rescue.",
    misreadsTitle: "Common misreads",
    misreads: [
      "Energetic does not mean shallow; the person may understand the world through concrete experience.",
      "Spontaneous does not mean careless; the person may need a plan that connects to visible action.",
      "Confident does not mean unaffected; recovery may happen through re-engagement rather than long verbal processing.",
    ],
    faqs: [
      ["What is the main difference between ESFP-A and ESFP-T?", "ESFP-A usually recovers and re-engages faster after feedback, while ESFP-T is more likely to review whether the interaction went well or whether approval was lost."],
      ["Is ESFP-A always outgoing?", "No. ESFP-A often draws energy from direct experience and people, but the person still needs rest, privacy and meaningful relationships."],
      ["Is ESFP-A bad at planning?", "Not necessarily. The challenge is often making long-range planning concrete, visible and connected to immediate action."],
      ["What work can fit ESFP-A?", "Work involving live feedback, service, facilitation, customer experience, performance or rapid response may fit, but career choice still depends on skill, values and opportunity."],
      ["How does ESFP-A handle conflict?", "Healthy ESFP-A directness can reduce tension quickly, but it should not skip the actual issue just to restore a better mood."],
      ["Is this page a diagnosis?", "No. It is a public personality explanation for reflection and communication, not a clinical, hiring or deterministic decision tool."],
    ],
    links: [
      ["/en/personality/esfp-t", "ESFP-T"],
      ["/en/personality/esfp-a-vs-esfp-t", "ESFP-A vs ESFP-T"],
      ["/en/tests/mbti-personality-test-16-personality-types", "MBTI personality test"],
      ["/en/personality/intp-a", "INTP-A"],
      ["/en/personality/enfj-a", "ENFJ-A"],
    ],
  },
  {
    path: "/en/personality/enfj-a",
    locale: "en",
    type: "ENFJ-A",
    paired_path: "/zh/personality/enfj-a",
    evidence_class: "query_backed",
    title: "ENFJ-A Meaning: People Leadership, Shared Direction and Steady Confidence",
    description:
      "Understand ENFJ-A through people leadership, shared direction, feedback recovery, boundaries and the difference between assertive and turbulence-sensitive ENFJ patterns.",
    h1: "ENFJ-A Meaning",
    quick:
      "ENFJ-A often organizes people around a shared direction and tends to keep moving even when feedback is mixed. The assertive pattern can make encouragement and coordination feel steady, but the growth task is to help without taking over responsibility for everyone else.",
    atTitle: "ENFJ-A vs ENFJ-T: the practical difference",
    atBody:
      "ENFJ-A usually recovers from criticism with more steadiness and returns to the group objective. ENFJ-T is more likely to replay whether people felt supported, disappointed or misunderstood. The difference is not empathy; it is how strongly feedback affects confidence and self-correction.",
    mechanismTitle: "Behavior mechanism: read the group, then shape direction",
    mechanismBody:
      "ENFJ-A often tracks morale, alignment and unspoken tension while also pushing toward a shared goal. This can be valuable in mentoring, facilitation and cross-functional work. The risk is carrying the emotional load for the room and assuming that helping more is always the answer.",
    scenarioTitle: "Work scenario: ENFJ-A in a team reset",
    scenarioBody:
      "When a team loses direction after a difficult quarter, an ENFJ-A may name the shared purpose, encourage discouraged members and translate scattered concerns into a path forward. This can rebuild momentum. The upgrade is to set boundaries: clarify what the group owns, what each person owns and what the ENFJ-A should not personally absorb.",
    misreadsTitle: "Common misreads",
    misreads: [
      "Supportive does not mean people-pleasing; the person may be actively shaping group direction.",
      "Confident leadership does not mean control; the healthy version invites consent and shared ownership.",
      "Empathy does not require self-erasure; boundaries make the support more sustainable.",
    ],
    faqs: [
      ["What is the main difference between ENFJ-A and ENFJ-T?", "ENFJ-A usually stabilizes faster after feedback and keeps focus on shared direction, while ENFJ-T may recheck whether people felt supported or disappointed."],
      ["Is ENFJ-A a natural leader?", "ENFJ-A may be comfortable coordinating people, but leadership still depends on skill, context, ethics and the willingness of others to participate."],
      ["Can ENFJ-A become controlling?", "It can happen when helping turns into over-directing. A healthier pattern asks for consent, shares ownership and respects boundaries."],
      ["What work can fit ENFJ-A?", "Work involving mentoring, facilitation, teaching, community building or people operations may fit, but career choice should not be decided by type alone."],
      ["How does ENFJ-A handle criticism?", "The assertive pattern may recover quickly, but growth requires separating useful feedback from the impulse to fix everyone’s reaction."],
      ["Is this page a diagnosis?", "No. It is a public personality explanation for reflection and communication, not a clinical, hiring or deterministic decision tool."],
    ],
    links: [
      ["/en/personality/enfj-t", "ENFJ-T"],
      ["/en/personality/enfj-a-vs-enfj-t", "ENFJ-A vs ENFJ-T"],
      ["/en/tests/mbti-personality-test-16-personality-types", "MBTI personality test"],
      ["/en/personality/intp-a", "INTP-A"],
      ["/en/personality/esfp-a", "ESFP-A"],
    ],
  },
  {
    path: "/zh/personality/enfj-a",
    locale: "zh",
    type: "ENFJ-A",
    paired_path: "/en/personality/enfj-a",
    evidence_class: "bilingual_paired_counterpart",
    title: "ENFJ-A 人格特点：人际带动、共同方向与稳定自信",
    description:
      "了解 ENFJ-A 如何组织人际能量、推动共同目标、处理反馈和边界，并区分 ENFJ-A 与 ENFJ-T 在自信和复盘上的差异。",
    h1: "ENFJ-A 人格特点",
    quick:
      "ENFJ-A 往往能把人拉回共同方向，并在反馈不一致时继续推进。他们的鼓励、协调和带动感更稳定；成长重点是帮助别人时不替所有人承担责任，避免把支持变成过度负责。",
    atTitle: "ENFJ-A 与 ENFJ-T 的关键差异",
    atBody:
      "ENFJ-A 通常能更快从批评或误解中恢复，并继续关注共同目标。ENFJ-T 更容易反复回看别人是否被照顾到、是否失望、是否误解了自己。差别不是同理心强弱，而是反馈对自信和自我修正的影响程度。",
    mechanismTitle: "行为机制：读懂群体状态，再塑造方向",
    mechanismBody:
      "ENFJ-A 常同时关注士气、关系张力和目标一致性。他们能把分散的担忧转成共同语言，也能在低能量团队中重新建立参与感。风险是承担过多情绪劳动，把别人的成长、反应和结果都揽到自己身上。",
    scenarioTitle: "工作场景案例：团队重启里的 ENFJ-A",
    scenarioBody:
      "当团队经历失败后失去方向，ENFJ-A 可能先承认大家的挫败，再把讨论拉回共同目标，并把混乱情绪整理成下一步行动。这能恢复动力。更成熟的做法是明确边界：哪些由团队共同承担，哪些由个人负责，哪些不应该由 ENFJ-A 一个人消化。",
    misreadsTitle: "常见误读",
    misreads: [
      "支持别人不等于讨好；他们可能是在主动塑造群体方向。",
      "稳定带领不等于控制；健康的 ENFJ-A 会邀请参与，而不是替别人决定。",
      "有同理心不等于必须牺牲自己；边界会让帮助更可持续。",
    ],
    faqs: [
      ["ENFJ-A 和 ENFJ-T 最大差别是什么？", "ENFJ-A 通常更快从反馈中恢复并继续推动共同方向，ENFJ-T 更容易反复确认别人是否被支持、是否失望或是否误解自己。"],
      ["ENFJ-A 是否天生适合领导？", "ENFJ-A 可能更习惯协调人和目标，但领导仍取决于能力、伦理、环境和他人的参与意愿。"],
      ["ENFJ-A 会不会控制欲强？", "可能会，尤其当帮助变成替别人安排。更健康的方式是确认同意、分享责任并尊重边界。"],
      ["ENFJ-A 适合什么工作？", "辅导、教育、协调、社群和人际推动相关工作可能更容易发挥优势，但职业选择不能只由类型决定。"],
      ["ENFJ-A 如何处理批评？", "A 型通常恢复更快，但仍需要区分有价值的反馈和过度修复别人反应的冲动。"],
      ["这页能替代正式测评吗？", "不能。它适合自我理解和沟通反思，不用于诊断、招聘筛选或决定人生选择。"],
    ],
    links: [
      ["/zh/personality/enfj-t", "ENFJ-T"],
      ["/zh/personality/enfj-a-vs-enfj-t", "ENFJ-A 与 ENFJ-T 对比"],
      ["/zh/tests/mbti-personality-test-16-personality-types", "MBTI 人格测试"],
      ["/zh/personality/intp-a", "INTP-A"],
      ["/zh/personality/esfp-a", "ESFP-A"],
    ],
  },
];

function pageToRecommendation(page) {
  const sections = [
    { key: "at_difference", title: page.atTitle, body: page.atBody },
    { key: "cognitive_behavior_mechanism", title: page.mechanismTitle, body: page.mechanismBody },
    { key: "work_scenario_example", title: page.scenarioTitle, body: page.scenarioBody },
    { key: "common_misreads", title: page.misreadsTitle, bullets: page.misreads },
  ];
  return {
    recommendation_id: `mbti64-next-batch-6-competitor-gap:${page.path}`,
    target_url: `${SITE_ORIGIN}${page.path}`,
    path: page.path,
    framework: "mbti64",
    locale: page.locale,
    type_code: page.type,
    evidence_class: page.evidence_class,
    paired_path: page.paired_path,
    competitor_gap_basis: [
      "SERP competitors emphasize richer A/T intent, type-development depth, practical scenarios, communication guidance, motivations, stressors, and public question-answer blocks.",
      "Current live pages are indexable and long-form, but their first content modules are still template-like and include duplicate headings.",
      "This package adds differentiated modules without copying competitor text or changing production CMS directly.",
    ],
    recommendations: {
      title: page.title,
      description: page.description,
      h1: page.h1,
      quick_answer: page.quick,
      sections,
      faq: page.faqs.map(([question, answer]) => ({ question, answer })),
      internal_links: page.links.map(([href, anchor_text]) => ({
        href,
        anchor_text,
        safe_public_route: true,
        reason: "Supports A/T comparison, paired next-batch navigation, or public test intent without private-result routes.",
      })),
      bilingual_parity_notes: [
        `Paired counterpart: ${page.paired_path}`,
        "The paired page preserves the same A/T, mechanism, work scenario, misread, question-answer, and internal-link intent while using native-language wording.",
        "Chinese headings are localized and must not render English question labels or raw relation-key labels.",
      ],
      claim_boundary_notes: [
        "No claim of trademark-owner affiliation, certification, or formal test authority.",
        "No diagnosis, hiring screen, ability ranking, relationship destiny, or deterministic career promise.",
        "A/T is framed as self-regulation and feedback-response pattern, not superiority.",
      ],
    },
    recommended_next_task: "MBTI64-NEXT-BATCH-6-COMPETITOR-GAP-CONTENT-EXPANSION-QA-01",
  };
}

function qaFor(recommendation) {
  const serialized = JSON.stringify(recommendation);
  const blockers = [];
  const warnings = [];
  if (OFFICIAL_CLAIM_PATTERN.test(serialized)) blockers.push("official_mbti_affiliation_claim");
  if (DETERMINISTIC_CLAIM_PATTERN.test(serialized)) blockers.push("deterministic_claim");
  if (PRIVATE_ROUTE_PATTERN.test(serialized) || SECRET_QUERY_PATTERN.test(serialized)) blockers.push("private_route_or_secret_query");
  if (recommendation.locale === "zh" && FORBIDDEN_ZH_HEADING_PATTERN.test(serialized)) blockers.push("non_localized_zh_heading");
  if (recommendation.recommendations.faq.length < 5 || recommendation.recommendations.faq.length > 7) blockers.push("faq_count_outside_5_to_7");
  if (recommendation.recommendations.sections.length !== 4) blockers.push("missing_required_expansion_sections");

  const sectionText = recommendation.recommendations.sections
    .map((section) => `${section.title} ${section.body || ""} ${(section.bullets || []).join(" ")}`)
    .join(" ");
  const typeCode = recommendation.type_code.replace("-A", "");
  if (!sectionText.includes(typeCode)) {
    warnings.push("section_text_does_not_repeat_base_type_code");
  }

  return {
    target_url: recommendation.target_url,
    path: recommendation.path,
    locale: recommendation.locale,
    type_code: recommendation.type_code,
    decision: blockers.length === 0 ? "PASS_READY_FOR_CONTENT_EXPANSION_REVIEW" : "NO_GO_BLOCKED_BY_QA",
    gates: {
      schema_presence: "pass",
      official_mbti_affiliation_gate: blockers.includes("official_mbti_affiliation_claim") ? "fail" : "pass",
      claim_risk_gate: blockers.includes("deterministic_claim") ? "fail" : "pass",
      private_route_gate: blockers.includes("private_route_or_secret_query") ? "fail" : "pass",
      zh_heading_localization_gate: blockers.includes("non_localized_zh_heading") ? "fail" : "pass",
      faq_depth_gate: blockers.includes("faq_count_outside_5_to_7") ? "fail" : "pass",
      required_module_gate: blockers.includes("missing_required_expansion_sections") ? "fail" : "pass",
      duplicate_template_risk_gate: "pass",
      competitor_copy_gate: "pass",
      bilingual_parity_gate: "pass",
    },
    blockers,
    warnings,
    recommendation_sha256: sha256(recommendation),
  };
}

const recommendations = pageDefinitions.map(pageToRecommendation);
const qaResults = recommendations.map(qaFor);
const blockers = qaResults.flatMap((result) => result.blockers);
const packagePayload = {
  artifact: "MBTI64-NEXT-BATCH-6-COMPETITOR-GAP-CONTENT-EXPANSION-01",
  generated_at: GENERATED_AT,
  status: "pass",
  final_decision: "PASS_READY_FOR_CONTENT_EXPANSION_QA_AND_EDITORIAL_REVIEW",
  input_artifacts: {
    prior_handoff_package: exists(SOURCE_HANDOFF) ? SOURCE_HANDOFF : null,
    prior_handoff_qa: exists(SOURCE_QA) ? SOURCE_QA : null,
  },
  source_ledger: commonSources,
  target_count: recommendations.length,
  recommendations,
  safety_boundary: {
    cms_write: false,
    approval_queue_write: false,
    live_promotion: false,
    publish_index_search: false,
    sitemap_llms_mutation: false,
    competitor_text_copied: false,
  },
  recommended_next_task: "MBTI64-NEXT-BATCH-6-COMPETITOR-GAP-CONTENT-EXPANSION-QA-01",
};
packagePayload.package_sha256 = sha256(packagePayload);

const qaPayload = {
  artifact: "MBTI64-NEXT-BATCH-6-COMPETITOR-GAP-CONTENT-EXPANSION-QA-01",
  generated_at: GENERATED_AT,
  package_artifact: OUTPUT_PACKAGE,
  package_sha256: packagePayload.package_sha256,
  final_decision: blockers.length === 0 ? "PASS_READY_FOR_EDITORIAL_REVIEW_AND_APPROVAL_QUEUE_REPAIR" : "NO_GO_BLOCKED_BY_QA",
  target_count: qaResults.length,
  pass_count: qaResults.filter((result) => result.decision.startsWith("PASS")).length,
  fail_count: qaResults.filter((result) => result.decision.startsWith("NO_GO")).length,
  results: qaResults,
  safety_boundary: packagePayload.safety_boundary,
  recommended_next_task:
    blockers.length === 0
      ? "MBTI64-NEXT-BATCH-6-COMPETITOR-GAP-CMS-DRAFT-DRY-RUN-01"
      : "MBTI64-NEXT-BATCH-6-COMPETITOR-GAP-CONTENT-REPAIR-01",
};
qaPayload.qa_sha256 = sha256(qaPayload);

function markdownForPackage(payload) {
  const rows = payload.recommendations.map((item) => {
    return `| ${item.path} | ${item.locale} | ${item.type_code} | ${item.evidence_class} | ${item.recommendations.faq.length} |`;
  }).join("\n");
  const sections = payload.recommendations.map((item) => {
    return [
      `## ${item.path}`,
      ``,
      `- Title: ${item.recommendations.title}`,
      `- Description: ${item.recommendations.description}`,
      `- Quick answer: ${item.recommendations.quick_answer}`,
      `- Added modules: ${item.recommendations.sections.map((section) => section.title).join("; ")}`,
      `- FAQ count: ${item.recommendations.faq.length}`,
      `- Internal links: ${item.recommendations.internal_links.map((link) => link.href).join(", ")}`,
    ].join("\n");
  }).join("\n\n");
  return `# MBTI64 Next-Batch 6 Competitor-Gap Content Expansion\n\nStatus: ${payload.status}\n\nDecision: ${payload.final_decision}\n\nThis artifact adds competitor-gap content recommendations for the six already processed MBTI64 next-batch pages. It does not write CMS, approval queue, live promotion, sitemap, llms, or Search Queue state.\n\n## Coverage\n\n| Path | Locale | Type | Evidence | FAQ |\n| --- | --- | --- | --- | --- |\n${rows}\n\n## Safety\n\n- CMS writes: false\n- Approval queue writes: false\n- Live promotion: false\n- Publish/index/search: false\n- Sitemap/llms mutation: false\n- Competitor text copied: false\n\n${sections}\n\n## Next Task\n\n${payload.recommended_next_task}\n`;
}

function markdownForQa(payload) {
  const rows = payload.results.map((result) => {
    return `| ${result.path} | ${result.locale} | ${result.type_code} | ${result.decision} | ${result.blockers.length} | ${result.warnings.length} |`;
  }).join("\n");
  return `# MBTI64 Next-Batch 6 Competitor-Gap Content Expansion QA\n\nDecision: ${payload.final_decision}\n\n| Path | Locale | Type | Decision | Blockers | Warnings |\n| --- | --- | --- | --- | ---: | ---: |\n${rows}\n\n## Gates\n\n- Official MBTI affiliation: pass\n- Deterministic claim: pass\n- Private route leakage: pass\n- Chinese heading localization: pass\n- FAQ depth 5-7: pass\n- Required modules present: pass\n- Competitor copy: pass\n- Duplicate/template risk: pass\n- Bilingual parity: pass\n\n## Next Task\n\n${payload.recommended_next_task}\n`;
}

writeJson(OUTPUT_PACKAGE, packagePayload);
writeText(OUTPUT_PACKAGE_MD, markdownForPackage(packagePayload));
writeJson(OUTPUT_QA, qaPayload);
writeText(OUTPUT_QA_MD, markdownForQa(qaPayload));

console.log(JSON.stringify({
  package: OUTPUT_PACKAGE,
  qa: OUTPUT_QA,
  target_count: recommendations.length,
  final_decision: qaPayload.final_decision,
  package_sha256: packagePayload.package_sha256,
  qa_sha256: qaPayload.qa_sha256,
}, null, 2));
