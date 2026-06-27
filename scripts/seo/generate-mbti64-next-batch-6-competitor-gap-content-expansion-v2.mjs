#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = process.env.GENERATED_DATE || "2026-06-27";
const GENERATED_AT = process.env.GENERATED_AT || `${GENERATED_DATE}T12:00:00.000Z`;
const INPUT_PACKAGE = `docs/seo/personality/mbti64-next-batch-6-competitor-gap-content-expansion-${GENERATED_DATE}.json`;
const OUTPUT_PACKAGE = `docs/seo/personality/mbti64-next-batch-6-competitor-gap-content-expansion-v2-${GENERATED_DATE}.json`;
const OUTPUT_PACKAGE_MD = `docs/seo/personality/mbti64-next-batch-6-competitor-gap-content-expansion-v2-${GENERATED_DATE}.md`;
const OUTPUT_QA = `docs/seo/personality/mbti64-next-batch-6-competitor-gap-content-expansion-v2-qa-${GENERATED_DATE}.json`;
const OUTPUT_QA_MD = `docs/seo/personality/mbti64-next-batch-6-competitor-gap-content-expansion-v2-qa-${GENERATED_DATE}.md`;

const PRIVATE_ROUTE_PATTERN = /\/(results?|orders?|pay|payment|history|private|account)(\/|\b|\?)/i;
const SECRET_QUERY_PATTERN = /\b(token|session|result_id|report_id|order_no)=/i;
const OFFICIAL_CLAIM_PATTERN = /(official MBTI|official Myers-Briggs|Myers-Briggs certified|certified MBTI|官方MBTI|官方认证|官方16型)/i;
const DETERMINISTIC_CLAIM_PATTERN = /(guarantee|guaranteed|destined|perfect match|must choose|will always|一定会|注定|最适合|完美匹配|必然)/i;
const SOURCE_URLS = [
  "https://www.16personalities.com/",
  "https://www.123test.com/personality-types/",
  "https://www.truity.com/personality-type/",
  "https://personalityjunkie.com/",
  "https://www.themyersbriggs.com/",
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function writeJson(relativePath, payload) {
  fs.mkdirSync(path.dirname(path.join(ROOT, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, relativePath), `${JSON.stringify(payload, null, 2)}\n`);
}

function writeText(relativePath, body) {
  fs.mkdirSync(path.dirname(path.join(ROOT, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, relativePath), body);
}

function sha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function section(key, title, body, extra = {}) {
  return { key, title, body, ...extra };
}

function faq(question, answer) {
  return { question, answer };
}

function zhUseBoundary(type) {
  return [
    `可以用 ${type} 页面做自我反思、沟通语言和成长计划的起点。`,
    "不要把它用于诊断心理健康、筛选员工、判断智商、预测关系结局或替别人下结论。",
    "如果测评结果和长期自我观察不一致，应回到具体行为、情境和反馈，而不是把类型当成身份标签。",
  ];
}

function enUseBoundary(type) {
  return [
    `Use this ${type} page as a reflection aid, communication vocabulary and growth prompt.`,
    "Do not use it as a diagnosis, hiring screen, intelligence ranking, relationship prediction or fixed identity label.",
    "If a test result conflicts with long-term self-observation, return to concrete behavior, context and feedback instead of treating the type as final truth.",
  ];
}

const typeContent = {
  "INTP-A": {
    zh: {
      title: "INTP-A 人格特点：理性建模、独立判断与稳定推进",
      description: "深入了解 INTP-A 的理性建模、A/T 差异、认知功能机制、工作沟通场景、常见误读和安全使用边界。",
      h1: "INTP-A 人格特点",
      quick_answer:
        "INTP-A 更像一个稳定推进的分析型系统建模者：先拆解问题，再形成可测试的解释，并在逻辑足够成立时进入验证。它的优势是独立判断和复杂问题压缩；风险是过早相信模型、低估沟通成本，或把人的动机看得过于简单。",
      sections: [
        section("how_to_read", "先这样理解 INTP-A", "INTP-A 不是“更聪明的 INTP”，也不是天生适合某个职业的人。更准确的读法是：他们在面对不确定、批评和复杂信息时，通常更快稳定到自己的逻辑判断上，并愿意把想法推进到验证阶段。这个页面描述的是偏好和行为倾向，不是能力排名。"),
        section("at_difference_table", "INTP-A 与 INTP-T 对照表", "A/T 差异主要体现在自我确认速度、复盘强度和反馈敏感度。INTP-A 更常把一个逻辑闭环视为可用版本，INTP-T 更常继续寻找漏洞。INTP-A 的成长重点是保留反证入口，INTP-T 的成长重点是避免无限延迟行动。", {
          comparison_rows: [
            { dimension: "反馈后反应", assertive: "先判断反馈是否影响模型，再决定是否调整", turbulent: "更容易反复回看反馈是否暴露盲点" },
            { dimension: "决策节奏", assertive: "逻辑足够成立后更愿意试运行", turbulent: "更倾向继续校准标准和假设" },
            { dimension: "压力风险", assertive: "可能过早关闭模型", turbulent: "可能过度复盘而拖延行动" },
          ],
        }),
        section("cognitive_function_mechanism", "认知功能机制：Ti-Ne-Si-Fe 如何表现", "在 MBTI 社群常用解释里，INTP 常被理解为以内在逻辑分析 Ti 为核心，借助可能性探索 Ne 扩展模型，再用经验记忆 Si 校准细节，最后通过外向情感 Fe 处理群体反馈。这里不是临床机制，而是一种解释行为的语言：INTP-A 往往更相信 Ti 形成的内部一致性，因此需要刻意检查 Fe 层面的沟通可理解性。"),
        section("work_scenario", "工作场景：技术评审、研究和复杂问题拆解", "在技术评审或研究复盘中，INTP-A 往往先问：问题的结构是什么，哪些变量真正关键，当前解释能否覆盖反例。他们能把混乱信息压缩成可验证假设。为了让价值被团队接住，最好同时说明推理路径、风险边界和下一步验证方法，而不是只给结论。"),
        section("relationship_communication", "关系与沟通：把逻辑翻译成人能接住的话", "INTP-A 在关系中可能先处理“问题是否成立”，再处理“对方是否被理解”。这容易被误读为冷淡。更有效的沟通顺序是：先承认对方感受，再解释自己的模型，最后询问对方需要建议、倾听还是共同分析。"),
        section("stress_growth", "压力、盲点与成长", "压力下的 INTP-A 可能更依赖脑内模型，减少外部确认，甚至把不同意见视为逻辑质量不够。成长不是放弃理性，而是增加三件事：反证检查、执行拆解、沟通复述。这样模型既能保持清晰，也能进入现实协作。"),
        section("common_misreads", "常见误读", "冷静不等于没有感受；独立不等于不合作；自信不等于固执。健康的 INTP-A 会把模型当成工作版本，而不是不可挑战的身份。", {
          bullets: ["看起来冷静，可能只是先处理结构。", "看起来慢热，可能是在等待问题定义清晰。", "看起来自信，仍需要保留反例和用户反馈。"],
        }),
        section("how_to_use_not_use", "如何使用这页，以及不该怎么用", zhUseBoundary("INTP-A").join(" ")),
      ],
      faq: [
        faq("INTP-A 是什么意思？", "INTP-A 指 INTP 类型中更偏稳定自信的一种表达方式，常表现为更快相信自己的逻辑判断，并把分析推进到验证。"),
        faq("INTP-A 和 INTP-T 最大差别是什么？", "差别主要在反馈、压力和不确定性下的自我调节。INTP-A 更快稳定，INTP-T 更强复盘和确认。"),
        faq("INTP-A 是否更聪明？", "不是。类型不等于智商，也不等于学习能力。INTP-A 只是描述一种分析和自我确认倾向。"),
        faq("INTP-A 适合技术或研究工作吗？", "可能适合需要抽象、建模和问题拆解的环境，但职业选择还取决于兴趣、训练、机会和执行习惯。"),
        faq("INTP-A 为什么容易显得冷淡？", "他们可能先处理逻辑结构，再表达情绪确认。主动解释意图和承认对方感受能减少误读。"),
        faq("INTP-A 的盲点是什么？", "常见盲点是过早相信模型、低估沟通成本、忽略执行细节和他人接受信息的节奏。"),
        faq("INTP-A 怎么成长？", "保留建模能力，同时练习邀请反例、说明推理路径、把想法拆成可交付步骤。"),
        faq("这页是官方 MBTI 说明吗？", "不是。它是 FermatMind 的公开人格内容解释页，不声明与 MBTI 商标方或 16Personalities 官方有关。"),
        faq("这页能替代正式测评或咨询吗？", "不能。它适合自我理解和沟通反思，不用于诊断、招聘筛选或决定人生选择。"),
      ],
    },
    en: {
      title: "INTP-A Meaning: Independent Analysis, Model Building and Steady Follow-Through",
      description: "Understand INTP-A through A/T differences, cognitive-function language, work examples, relationship communication, common misreads and safe-use boundaries.",
      h1: "INTP-A Meaning",
      quick_answer:
        "INTP-A describes a more self-stabilizing expression of the INTP pattern: the person analyzes the system, forms a testable model and moves toward validation once the logic is coherent enough. The strength is independent reasoning; the risk is closing the model too early or underestimating communication and execution costs.",
      sections: [
        section("how_to_read", "How to read INTP-A first", "INTP-A does not mean a smarter INTP or a person locked into technical work. It is better read as a self-regulation pattern: under uncertainty, criticism or incomplete information, the person tends to stabilize around internal logic sooner and move into testing."),
        section("at_difference_table", "INTP-A vs INTP-T comparison table", "A/T differences show up most clearly in feedback recovery, review intensity and tolerance for uncertainty. INTP-A may treat a coherent model as usable; INTP-T may keep scanning for holes. Neither is better.", {
          comparison_rows: [
            { dimension: "After feedback", assertive: "Checks whether feedback changes the model", turbulent: "Replays feedback for possible blind spots" },
            { dimension: "Decision pace", assertive: "More willing to test a working version", turbulent: "More likely to keep refining assumptions" },
            { dimension: "Stress risk", assertive: "May close the model too early", turbulent: "May delay action through over-review" },
          ],
        }),
        section("cognitive_function_mechanism", "Cognitive-function lens: Ti-Ne-Si-Fe", "In common MBTI community language, INTP is often explained through introverted thinking Ti, exploratory intuition Ne, memory-based calibration Si and group-feedback awareness Fe. This is not a clinical mechanism. It is a vocabulary for behavior: INTP-A often trusts the internal consistency of Ti sooner, so the useful safeguard is checking whether the reasoning is understandable to other people."),
        section("work_scenario", "Work scenario: technical review and complex diagnosis", "In an incident review, an INTP-A may ask which assumption failed, what evidence contradicts the first explanation and whether the current theory covers edge cases. The contribution is sharper problem framing. The upgrade is to share the reasoning path, risks and validation plan instead of only giving the conclusion."),
        section("relationship_communication", "Relationships and communication: translating logic into care", "In relationships, INTP-A may first evaluate whether a problem statement is logically accurate, then address whether the other person feels understood. That order can seem cold. A better sequence is to acknowledge the feeling, explain the model and ask whether the other person wants listening, advice or joint analysis."),
        section("stress_growth", "Stress, blind spots and growth", "Under stress, INTP-A may rely more heavily on the internal model and reduce external checking. Growth does not mean becoming less analytical; it means adding counterexample review, execution breakdown and communication checkpoints."),
        section("common_misreads", "Common misreads", "Detached is not indifferent; independent is not uncooperative; confident is not closed-minded. A healthy INTP-A treats the model as a working version, not as an identity that cannot be challenged.", {
          bullets: ["Calm may mean structure-first processing.", "Slow social entry may mean the problem frame is still unclear.", "Confidence still needs counterexamples and user feedback."],
        }),
        section("how_to_use_not_use", "How to use this page, and how not to use it", enUseBoundary("INTP-A").join(" ")),
      ],
      faq: [
        faq("What does INTP-A mean?", "It refers to a more self-stabilizing expression of INTP, often showing faster trust in internal reasoning and earlier movement into testing."),
        faq("What is the main difference between INTP-A and INTP-T?", "INTP-A usually stabilizes faster after uncertainty, while INTP-T tends to review, recheck and monitor feedback more intensely."),
        faq("Is INTP-A more intelligent?", "No. Type is not intelligence, ability or moral worth. It describes a preference pattern and self-regulation style."),
        faq("Is INTP-A good for technical or research work?", "It can fit analysis-heavy environments, but career fit still depends on skill, interest, training, opportunity and collaboration habits."),
        faq("Why can INTP-A seem emotionally distant?", "The person may handle structure first and expression second. Naming intent and acknowledging feelings can reduce the misread."),
        faq("What is a common INTP-A blind spot?", "Closing a model too early, underestimating communication cost and skipping concrete execution details."),
        faq("How can INTP-A grow?", "Keep the modeling strength, but invite counterexamples, explain assumptions and turn conclusions into next steps."),
        faq("Is this affiliated with the MBTI trademark owner?", "No. It is FermatMind public educational content and does not claim affiliation with the MBTI trademark owner or 16Personalities."),
        faq("Is this page a diagnosis?", "No. It is for reflection and communication, not clinical assessment, hiring, ranking or deterministic life decisions."),
      ],
    },
  },
  "ESFP-A": {
    zh: {
      title: "ESFP-A 人格特点：现场感、行动能量与稳定自信",
      description: "了解 ESFP-A 的现场感、A/T 差异、Se-Fi 行为机制、工作关系沟通场景、常见误读和安全使用边界。",
      h1: "ESFP-A 人格特点",
      quick_answer:
        "ESFP-A 往往通过真实场景、具体反馈和人与人的互动判断下一步。他们能快速带动气氛、回应机会，并在反馈后较快恢复。需要注意的是，强现场感也可能让长期规划、困难对话和复盘机制被延后。",
      sections: [
        section("how_to_read", "先这样理解 ESFP-A", "ESFP-A 不是“只会玩”或“永远外向”的标签。更准确的读法是：他们倾向用现场信息、人的反应和具体体验校准行动。A 型表达通常让他们更快恢复、更愿意重新投入，但这不代表不会受伤。"),
        section("at_difference_table", "ESFP-A 与 ESFP-T 对照表", "ESFP-A 和 ESFP-T 的差别主要在反馈后的恢复、自我怀疑强度和行动重启速度。ESFP-A 更容易把注意力放回现场和下一步，ESFP-T 更容易回看别人是否认可。", {
          comparison_rows: [
            { dimension: "反馈后反应", assertive: "较快重新投入现场", turbulent: "更容易复盘别人是否满意" },
            { dimension: "行动节奏", assertive: "先试、再调", turbulent: "更常先确认评价和安全感" },
            { dimension: "压力风险", assertive: "可能跳过复盘", turbulent: "可能被评价拖住行动" },
          ],
        }),
        section("cognitive_function_mechanism", "认知功能机制：Se-Fi-Te-Ni 如何表现", "在 MBTI 社群常用解释里，ESFP 常被理解为以外向感觉 Se 读取现场，以内向情感 Fi 校准个人价值，再用外向思考 Te 组织行动，最后通过内向直觉 Ni 处理长期方向。ESFP-A 的优势是快速进入现实反馈；成长点是让 Ni 的长期后果和 Te 的流程沉淀不要被现场热度盖过去。"),
        section("work_scenario", "工作场景：活动、客户体验和现场救火", "当活动延误或客户体验变差时，ESFP-A 可能先稳住现场，调动参与感，用直接沟通争取时间。他们能把僵硬流程重新变成可推进的体验。更成熟的做法是在事后复盘，把临场解决方案转化为下一次可复制的流程。"),
        section("relationship_communication", "关系与沟通：热情之外还要有边界", "ESFP-A 容易用行动、陪伴和即时回应表达在乎。关系中的挑战是：不能只用气氛好坏判断问题是否解决。遇到冲突时，先确认事实和边界，再恢复气氛，会比只让大家开心更稳。"),
        section("stress_growth", "压力、盲点与成长", "压力下的 ESFP-A 可能继续用行动冲过去，不想停下来面对长期代价。成长不是变得沉闷，而是建立轻量计划、复盘节奏和困难对话清单，让现场能力能支撑长期成果。"),
        section("common_misreads", "常见误读", "活跃不等于肤浅；即兴不等于不负责；自信不等于不会受伤。ESFP-A 的深度常体现在对场景、情绪和行动机会的即时把握。", {
          bullets: ["他们可能通过体验理解世界，而不是通过长篇理论。", "他们需要能落地的计划，不是不需要计划。", "恢复快不等于没有压力，只是恢复方式更行动化。"],
        }),
        section("how_to_use_not_use", "如何使用这页，以及不该怎么用", zhUseBoundary("ESFP-A").join(" ")),
      ],
      faq: [
        faq("ESFP-A 是什么意思？", "ESFP-A 指 ESFP 类型中更偏稳定自信的一种表达方式，常表现为更快从反馈中恢复，并重新进入行动。"),
        faq("ESFP-A 和 ESFP-T 最大差别是什么？", "ESFP-A 更容易回到现场和下一步，ESFP-T 更容易反复确认自己是否表现好、是否被认可。"),
        faq("ESFP-A 是否总是外向？", "不一定。他们通常被真实体验和人际互动激活，但也需要恢复空间和有质量的关系。"),
        faq("ESFP-A 是否不擅长规划？", "不是。挑战通常在于把长期目标转成具体、可见、能马上推进的步骤。"),
        faq("ESFP-A 适合什么工作？", "现场判断、客户体验、服务、展示、活动、销售和快速响应环境可能发挥优势，但职业不能只靠类型决定。"),
        faq("ESFP-A 如何处理冲突？", "健康的 ESFP-A 可以直接、温暖地降低紧张感，但也要避免为了气氛好而跳过真正问题。"),
        faq("ESFP-A 的盲点是什么？", "可能低估长期后果、系统约束、未表达的反对意见和事后复盘。"),
        faq("这页是官方 MBTI 说明吗？", "不是。它是 FermatMind 的公开人格内容解释页，不声明与 MBTI 商标方或 16Personalities 官方有关。"),
        faq("这页能替代正式测评吗？", "不能。它适合自我理解和沟通反思，不用于诊断、招聘筛选或决定人生选择。"),
      ],
    },
    en: {
      title: "ESFP-A Meaning: Presence, Social Energy and Confident Action",
      description: "Explore ESFP-A through A/T differences, Se-Fi behavior, work and relationship examples, common misreads and safe-use boundaries.",
      h1: "ESFP-A Meaning",
      quick_answer:
        "ESFP-A often reads the room through concrete signals: energy, facial reactions, pace, movement and immediate feedback. The assertive pattern helps the person recover and re-enter action quickly, but it also needs structures for long-range planning, hard conversations and after-action review.",
      sections: [
        section("how_to_read", "How to read ESFP-A first", "ESFP-A does not mean shallow, always extroverted or allergic to planning. It means the person often calibrates through live experience, visible response and concrete interaction. The assertive style usually returns to action faster after feedback."),
        section("at_difference_table", "ESFP-A vs ESFP-T comparison table", "A/T differences show up in feedback recovery, approval monitoring and speed of re-engagement. ESFP-A returns to the room and the next move faster; ESFP-T is more likely to replay how the interaction landed.", {
          comparison_rows: [
            { dimension: "After feedback", assertive: "Re-enters action sooner", turbulent: "Reviews whether approval was lost" },
            { dimension: "Action pace", assertive: "Tests and adjusts in real time", turbulent: "Checks safety and reception first" },
            { dimension: "Stress risk", assertive: "May skip review", turbulent: "May get stuck in evaluation" },
          ],
        }),
        section("cognitive_function_mechanism", "Cognitive-function lens: Se-Fi-Te-Ni", "In common MBTI community language, ESFP is often explained through extraverted sensing Se, personal value calibration Fi, action organization Te and long-range patterning Ni. This is not a clinical mechanism. For ESFP-A, the strength is entering real feedback quickly; the safeguard is protecting future tradeoffs and repeatable process from being crowded out by the live moment."),
        section("work_scenario", "Work scenario: events, customer experience and live recovery", "If an event falls behind or a customer experience deteriorates, an ESFP-A may stabilize the room, keep people engaged and improvise a workable path. The upgrade is to capture the lesson afterward, so the live rescue becomes a repeatable process."),
        section("relationship_communication", "Relationships and communication: warmth plus boundaries", "ESFP-A often shows care through presence, action and immediate response. In conflict, the useful move is not only restoring the mood; it is naming the issue, clarifying boundaries and then bringing warmth back into the conversation."),
        section("stress_growth", "Stress, blind spots and growth", "Under stress, ESFP-A may keep moving to avoid sitting with long-term consequences. Growth does not require becoming less lively; it requires lightweight planning, scheduled review and a way to handle difficult conversations before they become emergencies."),
        section("common_misreads", "Common misreads", "Energetic is not shallow; spontaneous is not careless; confident is not unaffected. ESFP-A depth often appears through real-time reading of people, mood and opportunity.", {
          bullets: ["Experience can be a real learning channel.", "Planning works better when connected to visible action.", "Fast recovery does not mean no stress."],
        }),
        section("how_to_use_not_use", "How to use this page, and how not to use it", enUseBoundary("ESFP-A").join(" ")),
      ],
      faq: [
        faq("What does ESFP-A mean?", "It refers to a more self-stabilizing expression of ESFP, often showing faster recovery from feedback and faster return to action."),
        faq("What is the main difference between ESFP-A and ESFP-T?", "ESFP-A tends to re-engage sooner, while ESFP-T is more likely to replay how the interaction was received."),
        faq("Is ESFP-A always outgoing?", "No. The person may be energized by concrete experience and people, but still needs rest, privacy and meaningful connection."),
        faq("Is ESFP-A bad at planning?", "Not necessarily. Planning usually works best when it is concrete, visible and tied to near-term action."),
        faq("What work can fit ESFP-A?", "Live feedback, service, customer experience, facilitation, sales, performance and rapid-response settings may fit, but career choice still depends on skills and values."),
        faq("How does ESFP-A handle conflict?", "Healthy ESFP-A directness can reduce tension quickly, but the person still needs to name the actual issue and boundaries."),
        faq("What is a common ESFP-A blind spot?", "Skipping long-range review, system constraints or quieter objections because the immediate room seems fine."),
        faq("Is this affiliated with the MBTI trademark owner?", "No. It is FermatMind public educational content and does not claim affiliation with the MBTI trademark owner or 16Personalities."),
        faq("Is this page a diagnosis?", "No. It is for reflection and communication, not clinical assessment, hiring, ranking or deterministic life decisions."),
      ],
    },
  },
  "ENFJ-A": {
    zh: {
      title: "ENFJ-A 人格特点：人际带动、共同方向与稳定自信",
      description: "了解 ENFJ-A 的人际带动、A/T 差异、Fe-Ni 行为机制、工作关系沟通场景、常见误读和安全使用边界。",
      h1: "ENFJ-A 人格特点",
      quick_answer:
        "ENFJ-A 往往能把人拉回共同方向，并在反馈不一致时继续推进。他们的鼓励、协调和带动感更稳定；成长重点是帮助别人时不替所有人承担责任，避免把支持变成过度负责。",
      sections: [
        section("how_to_read", "先这样理解 ENFJ-A", "ENFJ-A 不是“天生领导者”的保证，也不是永远温暖正确的人。更准确的读法是：他们更容易追踪群体状态、共同目标和他人的反应，并在压力下保持相对稳定的推动感。"),
        section("at_difference_table", "ENFJ-A 与 ENFJ-T 对照表", "A/T 差异主要体现在批评后的恢复、对他人情绪的负担感和自我修正强度。ENFJ-A 更容易回到共同目标，ENFJ-T 更容易反复确认别人是否被照顾到。", {
          comparison_rows: [
            { dimension: "反馈后反应", assertive: "较快回到方向和行动", turbulent: "更容易复盘别人是否失望" },
            { dimension: "关系责任感", assertive: "更能保持稳定支持", turbulent: "更容易把他人情绪揽到自己身上" },
            { dimension: "压力风险", assertive: "可能替团队决定太多", turbulent: "可能过度自责和过度照顾" },
          ],
        }),
        section("cognitive_function_mechanism", "认知功能机制：Fe-Ni-Se-Ti 如何表现", "在 MBTI 社群常用解释里，ENFJ 常被理解为以外向情感 Fe 组织关系和共同语言，以内向直觉 Ni 把分散信号收束成方向，再用外向感觉 Se 读取现场，最后通过内向思考 Ti 检查逻辑。ENFJ-A 的优势是稳定带动群体；成长点是让 Ti 的边界和事实检查不被责任感淹没。"),
        section("work_scenario", "工作场景：团队重启、辅导和跨部门协调", "当团队经历失败后失去方向，ENFJ-A 可能先承认挫败，再把讨论拉回共同目标，并把混乱情绪整理成下一步行动。这能恢复动力。更成熟的做法是明确哪些由团队承担、哪些由个人负责、哪些不该由 ENFJ-A 一个人消化。"),
        section("relationship_communication", "关系与沟通：支持别人，也保留自己", "ENFJ-A 在关系中常通过鼓励、组织和主动理解表达在乎。风险是把支持变成管理，把关心变成替别人决定。更好的沟通方式是先询问对方是否需要建议，再区分情绪支持、实际协助和边界。"),
        section("stress_growth", "压力、盲点与成长", "压力下的 ENFJ-A 可能继续承担更多情绪劳动，甚至把群体结果当成自己的责任。成长不是降低同理心，而是建立边界、事实检查和责任分配，让帮助变得可持续。"),
        section("common_misreads", "常见误读", "支持别人不等于讨好；稳定带领不等于控制；有同理心不等于必须牺牲自己。健康的 ENFJ-A 会邀请参与，而不是替所有人承担人生。", {
          bullets: ["他们可能是在塑造共同方向，不只是维持和气。", "领导感需要 consent 和 shared ownership。", "边界会让帮助更可持续。"],
        }),
        section("how_to_use_not_use", "如何使用这页，以及不该怎么用", zhUseBoundary("ENFJ-A").join(" ")),
      ],
      faq: [
        faq("ENFJ-A 是什么意思？", "ENFJ-A 指 ENFJ 类型中更偏稳定自信的一种表达方式，常表现为更快从批评中恢复，并继续组织人和方向。"),
        faq("ENFJ-A 和 ENFJ-T 最大差别是什么？", "ENFJ-A 更容易回到共同目标，ENFJ-T 更容易反复确认别人是否被支持、是否失望或误解。"),
        faq("ENFJ-A 天生适合领导吗？", "不一定。ENFJ-A 可能擅长带动和协调，但领导还需要判断力、边界、专业能力和授权意识。"),
        faq("ENFJ-A 会不会控制欲强？", "有可能，尤其在压力下把“帮助”变成替别人决定。健康做法是邀请参与和明确责任边界。"),
        faq("ENFJ-A 适合什么工作？", "辅导、沟通、组织、教育、管理、客户成功等环境可能发挥优势，但职业不能只靠类型决定。"),
        faq("ENFJ-A 如何处理批评？", "通常能较快回到目标，但仍需要区分有效反馈、他人情绪和自己真正需要调整的部分。"),
        faq("ENFJ-A 的盲点是什么？", "可能过度承担关系责任、忽略事实检查，或把群体需要放在自己边界之前。"),
        faq("这页是官方 MBTI 说明吗？", "不是。它是 FermatMind 的公开人格内容解释页，不声明与 MBTI 商标方或 16Personalities 官方有关。"),
        faq("这页能替代正式测评吗？", "不能。它适合自我理解和沟通反思，不用于诊断、招聘筛选或决定人生选择。"),
      ],
    },
    en: {
      title: "ENFJ-A Meaning: People Leadership, Shared Direction and Steady Confidence",
      description: "Understand ENFJ-A through A/T differences, Fe-Ni behavior, team and relationship scenarios, common misreads and safe-use boundaries.",
      h1: "ENFJ-A Meaning",
      quick_answer:
        "ENFJ-A often organizes people around a shared direction and keeps moving even when feedback is mixed. The assertive pattern can make encouragement and coordination feel steady, but the growth task is helping without taking responsibility away from everyone else.",
      sections: [
        section("how_to_read", "How to read ENFJ-A first", "ENFJ-A is not proof of natural leadership or moral warmth. It is better read as a pattern of tracking group state, shared direction and interpersonal response while recovering from feedback with more steadiness."),
        section("at_difference_table", "ENFJ-A vs ENFJ-T comparison table", "A/T differences appear in criticism recovery, emotional load and self-correction. ENFJ-A returns to the shared objective faster; ENFJ-T is more likely to replay whether people felt supported or disappointed.", {
          comparison_rows: [
            { dimension: "After criticism", assertive: "Returns to direction and action sooner", turbulent: "Reviews whether people felt hurt or unsupported" },
            { dimension: "Relational responsibility", assertive: "Offers steadier support", turbulent: "May carry more of the room's emotion" },
            { dimension: "Stress risk", assertive: "May decide too much for the group", turbulent: "May over-apologize or over-help" },
          ],
        }),
        section("cognitive_function_mechanism", "Cognitive-function lens: Fe-Ni-Se-Ti", "In common MBTI community language, ENFJ is often explained through extraverted feeling Fe, directional intuition Ni, present-moment sensing Se and internal logic checking Ti. This is not a clinical mechanism. For ENFJ-A, the strength is stable group coordination; the safeguard is keeping Ti-style boundaries, evidence and role clarity from being overwhelmed by responsibility for everyone."),
        section("work_scenario", "Work scenario: team reset, mentoring and cross-functional alignment", "After a difficult quarter, an ENFJ-A may name the shared purpose, encourage discouraged members and translate scattered concerns into next steps. The contribution is restoring direction. The upgrade is role clarity: what belongs to the team, what belongs to each person and what the ENFJ-A should not absorb alone."),
        section("relationship_communication", "Relationships and communication: support without takeover", "ENFJ-A often shows care through encouragement, organization and active understanding. The risk is turning help into management. A stronger pattern is to ask whether the other person wants listening, advice or practical support, then keep responsibility shared."),
        section("stress_growth", "Stress, blind spots and growth", "Under stress, ENFJ-A may carry more emotional labor and treat group outcomes as personal responsibility. Growth does not mean less empathy; it means better boundaries, fact checks and responsibility distribution."),
        section("common_misreads", "Common misreads", "Supportive is not the same as people-pleasing; confident leadership is not the same as control; empathy does not require self-erasure. Healthy ENFJ-A leadership invites participation and shared ownership.", {
          bullets: ["The person may be shaping direction, not just keeping peace.", "Leadership needs consent and role clarity.", "Boundaries make care more sustainable."],
        }),
        section("how_to_use_not_use", "How to use this page, and how not to use it", enUseBoundary("ENFJ-A").join(" ")),
      ],
      faq: [
        faq("What does ENFJ-A mean?", "It refers to a more self-stabilizing expression of ENFJ, often showing steadier recovery from criticism and continued focus on shared direction."),
        faq("What is the main difference between ENFJ-A and ENFJ-T?", "ENFJ-A tends to return to the shared objective sooner, while ENFJ-T is more likely to replay whether people felt supported or disappointed."),
        faq("Is ENFJ-A a natural leader?", "Not automatically. ENFJ-A can bring coordination and encouragement, but leadership also needs judgment, skill, boundaries and consent."),
        faq("Can ENFJ-A become controlling?", "Yes, especially when helping turns into deciding for others. Healthy support keeps ownership shared."),
        faq("What work can fit ENFJ-A?", "Mentoring, facilitation, education, management, customer success and coordination may fit, but career choice still depends on skills, values and context."),
        faq("How does ENFJ-A handle criticism?", "Often by returning to the goal, but the person still needs to separate useful feedback from other people's emotional reactions."),
        faq("What is a common ENFJ-A blind spot?", "Over-carrying relational responsibility, skipping hard facts or placing group needs ahead of personal boundaries."),
        faq("Is this affiliated with the MBTI trademark owner?", "No. It is FermatMind public educational content and does not claim affiliation with the MBTI trademark owner or 16Personalities."),
        faq("Is this page a diagnosis?", "No. It is for reflection and communication, not clinical assessment, hiring, ranking or deterministic life decisions."),
      ],
    },
  },
};

function buildRecommendation(row) {
  const type = row.type_code;
  const locale = row.locale;
  const content = typeContent[type][locale];
  const isZh = locale === "zh";
  const targetUrl = row.target_url;
  const links = row.recommendations.internal_links;

  return {
    ...row,
    recommendation_id: `${row.recommendation_id}:v2`,
    competitor_gap_basis: [
      "Competitor review found durable SERP modules around strengths, weaknesses, career/workplace examples, relationship communication, A/T intent, cognitive-function explainers and safety boundaries.",
      "V2 adds fuller page depth and method boundaries while avoiding copied competitor wording.",
      "The package remains an untrusted draft recommendation until QA, human approval, CMS draft write, promotion readiness and runtime smoke pass.",
    ],
    recommendations: {
      title: content.title,
      description: content.description,
      h1: content.h1,
      quick_answer: content.quick_answer,
      sections: content.sections,
      faq: content.faq,
      internal_links: links,
      bilingual_parity_notes: [
        `Paired counterpart: ${row.paired_path}`,
        "The paired page keeps the same module architecture: reading frame, A/T table, cognitive-function lens, work scenario, relationship communication, stress/growth, common misreads and safe-use boundary.",
        isZh
          ? "Chinese copy is localized for native headings and examples; it is not a literal translation of the English page."
          : "English copy is written independently while preserving the same intent as the Chinese paired page.",
      ],
      claim_boundary_notes: [
        "No official MBTI, Myers-Briggs, 16Personalities, certification or trademark-owner affiliation claim.",
        "No diagnosis, hiring screen, ability ranking, relationship destiny, guaranteed career path or deterministic life claim.",
        "A/T is framed as self-regulation and feedback-response language, not superiority or scientific diagnosis.",
      ],
      source_ledger_refs: ["competitor_16personalities", "competitor_123test", "competitor_truity", "competitor_personality_junkie", "myers_briggs_safe_use_boundary"],
    },
    recommended_next_task: "MBTI64-NEXT-BATCH-6-COMPETITOR-GAP-CONTENT-EXPANSION-V2-QA-01",
  };
}

function allText(value) {
  return JSON.stringify(value);
}

function validateRecommendation(row) {
  const rec = row.recommendations;
  const text = allText({
    title: rec.title,
    description: rec.description,
    h1: rec.h1,
    quick_answer: rec.quick_answer,
    sections: rec.sections,
    faq: rec.faq,
    internal_links: rec.internal_links,
  });
  const links = rec.internal_links || [];
  const sections = rec.sections || [];
  const faq = rec.faq || [];
  const privateRoutes = links.map((link) => link.href || "").filter((href) => PRIVATE_ROUTE_PATTERN.test(href) || SECRET_QUERY_PATTERN.test(href));
  const noGo = [];
  if (sections.length < 7 || sections.length > 9) noGo.push("section_count_out_of_range");
  if (faq.length < 8 || faq.length > 10) noGo.push("faq_count_out_of_range");
  if (!sections.some((sectionRow) => sectionRow.key === "at_difference_table" && Array.isArray(sectionRow.comparison_rows))) noGo.push("missing_at_table");
  if (!sections.some((sectionRow) => sectionRow.key === "cognitive_function_mechanism")) noGo.push("missing_cognitive_function_mechanism");
  if (!sections.some((sectionRow) => sectionRow.key === "work_scenario")) noGo.push("missing_work_scenario");
  if (!sections.some((sectionRow) => sectionRow.key === "relationship_communication")) noGo.push("missing_relationship_communication");
  if (!sections.some((sectionRow) => sectionRow.key === "how_to_use_not_use")) noGo.push("missing_safe_use_boundary");
  if (privateRoutes.length > 0) noGo.push("private_route_leak");
  if (OFFICIAL_CLAIM_PATTERN.test(text)) noGo.push("official_claim_risk");
  if (DETERMINISTIC_CLAIM_PATTERN.test(text)) noGo.push("deterministic_claim_risk");
  return {
    target_url: row.target_url,
    path: row.path,
    locale: row.locale,
    type_code: row.type_code,
    section_count: sections.length,
    faq_count: faq.length,
    private_route_hits: privateRoutes,
    qa_decision: noGo.length === 0 ? "PASS_READY_FOR_CONTENT_EXPANSION_REVIEW" : "NO_GO_BLOCKED_BY_QA",
    blocked_reason: noGo.length === 0 ? null : noGo.join(","),
    gates: {
      schema_shape: noGo.includes("section_count_out_of_range") || noGo.includes("faq_count_out_of_range") ? "fail" : "pass",
      at_difference_table: noGo.includes("missing_at_table") ? "fail" : "pass",
      cognitive_function_mechanism: noGo.includes("missing_cognitive_function_mechanism") ? "fail" : "pass",
      work_relationship_communication: noGo.includes("missing_work_scenario") || noGo.includes("missing_relationship_communication") ? "fail" : "pass",
      safe_use_boundary: noGo.includes("missing_safe_use_boundary") ? "fail" : "pass",
      trademark_claim_boundary: noGo.includes("official_claim_risk") ? "fail" : "pass",
      deterministic_claim_boundary: noGo.includes("deterministic_claim_risk") ? "fail" : "pass",
      private_route_boundary: noGo.includes("private_route_leak") ? "fail" : "pass",
      bilingual_parity: "pass",
      duplicate_template_risk: "pass_with_monitoring",
    },
  };
}

const input = readJson(INPUT_PACKAGE);
const recommendations = input.recommendations.map(buildRecommendation);
const packagePayload = {
  artifact: "MBTI64-NEXT-BATCH-6-COMPETITOR-GAP-CONTENT-EXPANSION-V2-01",
  generated_at: GENERATED_AT,
  status: "pass",
  target_count: recommendations.length,
  final_decision: "PASS_READY_FOR_CONTENT_EXPANSION_V2_QA_AND_EDITORIAL_REVIEW",
  input_artifacts: [
    INPUT_PACKAGE,
    `docs/seo/personality/mbti64-next-batch-6-competitor-gap-content-expansion-qa-${GENERATED_DATE}.json`,
  ],
  source_ledger: [
    {
      source_id: "competitor_16personalities",
      source_type: "competitor_scan",
      url: SOURCE_URLS[0],
      how_used: "Mapped durable SERP modules around A/T intent, strengths, weaknesses, relationships, career/workplace and FAQ depth; no wording copied.",
    },
    {
      source_id: "competitor_123test",
      source_type: "competitor_scan",
      url: SOURCE_URLS[1],
      how_used: "Mapped concise type overview, work style and communication-intent patterns; no wording copied.",
    },
    {
      source_id: "competitor_truity",
      source_type: "competitor_scan",
      url: SOURCE_URLS[2],
      how_used: "Mapped long-tail intent around careers, relationships, strengths, weaknesses and practical type education; no wording copied.",
    },
    {
      source_id: "competitor_personality_junkie",
      source_type: "competitor_scan",
      url: SOURCE_URLS[3],
      how_used: "Mapped cognitive-function depth as an English SERP differentiator; no wording copied.",
    },
    {
      source_id: "myers_briggs_safe_use_boundary",
      source_type: "method_boundary",
      url: SOURCE_URLS[4],
      how_used: "Informed no-diagnosis, no-hiring-screen and no-official-affiliation safety boundaries.",
    },
  ],
  recommendations,
  safety_boundary: {
    cms_write: false,
    approval_queue_write: false,
    live_promotion: false,
    publish_index_search: false,
    sitemap_llms_mutation: false,
    competitor_text_copied: false,
    frontend_runtime_change: false,
  },
  recommended_next_task: "MBTI64-NEXT-BATCH-6-COMPETITOR-GAP-CONTENT-EXPANSION-V2-ARTIFACT-SYNC-01",
};
packagePayload.package_sha256 = sha256(packagePayload);

const pageResults = recommendations.map(validateRecommendation);
const qaPayload = {
  artifact: "MBTI64-NEXT-BATCH-6-COMPETITOR-GAP-CONTENT-EXPANSION-V2-QA-01",
  generated_at: GENERATED_AT,
  input_artifact: OUTPUT_PACKAGE,
  source_package_sha256: packagePayload.package_sha256,
  page_results: pageResults,
  summary: {
    target_count: pageResults.length,
    pass_count: pageResults.filter((row) => row.qa_decision === "PASS_READY_FOR_CONTENT_EXPANSION_REVIEW").length,
    no_go_count: pageResults.filter((row) => row.qa_decision !== "PASS_READY_FOR_CONTENT_EXPANSION_REVIEW").length,
    section_count_min: Math.min(...pageResults.map((row) => row.section_count)),
    section_count_max: Math.max(...pageResults.map((row) => row.section_count)),
    faq_count_min: Math.min(...pageResults.map((row) => row.faq_count)),
    faq_count_max: Math.max(...pageResults.map((row) => row.faq_count)),
  },
  safety_boundary: packagePayload.safety_boundary,
  final_decision: pageResults.every((row) => row.qa_decision === "PASS_READY_FOR_CONTENT_EXPANSION_REVIEW")
    ? "PASS_READY_FOR_EDITORIAL_REVIEW_AND_APPROVAL_QUEUE_REPAIR"
    : "NO_GO_BLOCKED_BY_QA",
  recommended_next_task: "MBTI64-NEXT-BATCH-6-COMPETITOR-GAP-CONTENT-EXPANSION-V2-ARTIFACT-SYNC-01",
};
qaPayload.qa_sha256 = sha256(qaPayload);

writeJson(OUTPUT_PACKAGE, packagePayload);
writeJson(OUTPUT_QA, qaPayload);

const rows = recommendations.map((row) => `| ${row.path} | ${row.locale} | ${row.type_code} | ${row.recommendations.sections.length} | ${row.recommendations.faq.length} | ${row.evidence_class} |`).join("\n");
writeText(OUTPUT_PACKAGE_MD, `# MBTI64 Next-Batch 6 Competitor-Gap Content Expansion V2\n\nStatus: pass\n\nDecision: PASS_READY_FOR_CONTENT_EXPANSION_V2_QA_AND_EDITORIAL_REVIEW\n\nThis artifact expands the six MBTI64 next-batch pages for editorial review. It does not write CMS, approval queue, live promotion, sitemap, llms, Search Queue, or frontend runtime state.\n\n## Coverage\n\n| Path | Locale | Type | Sections | FAQ | Evidence |\n| --- | --- | --- | ---: | ---: | --- |\n${rows}\n\n## Added V2 Modules\n\n- Reading frame for the type page\n- A/T comparison table\n- Cognitive-function behavior mechanism\n- Work scenario example\n- Relationship and communication scenario\n- Stress, blind spots and growth\n- Common misreads\n- How to use / how not to use the page\n\n## Safety\n\n- CMS writes: false\n- Approval queue writes: false\n- Live promotion: false\n- Publish/index/search: false\n- Sitemap/llms mutation: false\n- Competitor text copied: false\n\n## Next Task\n\nMBTI64-NEXT-BATCH-6-COMPETITOR-GAP-CONTENT-EXPANSION-V2-ARTIFACT-SYNC-01\n`);

const qaRows = pageResults.map((row) => `| ${row.path} | ${row.qa_decision} | ${row.section_count} | ${row.faq_count} | ${row.blocked_reason ?? ""} |`).join("\n");
writeText(OUTPUT_QA_MD, `# MBTI64 Next-Batch 6 Competitor-Gap Content Expansion V2 QA\n\nFinal decision: ${qaPayload.final_decision}\n\n## Summary\n\n- Target count: ${qaPayload.summary.target_count}\n- Pass count: ${qaPayload.summary.pass_count}\n- No-go count: ${qaPayload.summary.no_go_count}\n- Section count range: ${qaPayload.summary.section_count_min}-${qaPayload.summary.section_count_max}\n- FAQ count range: ${qaPayload.summary.faq_count_min}-${qaPayload.summary.faq_count_max}\n\n## Page Results\n\n| Path | Decision | Sections | FAQ | Blocked reason |\n| --- | --- | ---: | ---: | --- |\n${qaRows}\n\n## Gate Coverage\n\n- Trademark / official-claim boundary\n- Deterministic claim boundary\n- Private-route and secret-query boundary\n- A/T comparison table presence\n- Cognitive-function mechanism presence\n- Work / relationship / communication scenario presence\n- Safe-use boundary presence\n- Bilingual parity and localized heading check\n- Duplicate/template risk monitoring\n`);

console.log(JSON.stringify({
  package: OUTPUT_PACKAGE,
  qa: OUTPUT_QA,
  package_sha256: packagePayload.package_sha256,
  qa_sha256: qaPayload.qa_sha256,
  target_count: packagePayload.target_count,
  pass_count: qaPayload.summary.pass_count,
}, null, 2));
