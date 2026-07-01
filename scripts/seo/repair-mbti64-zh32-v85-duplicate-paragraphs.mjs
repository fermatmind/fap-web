#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MODULE_REPLACEMENTS = {
  "core-reading": [
    "{label} 的这一页更适合先当作一张行为地图来看：先观察他们如何收集信息，再看他们如何筛掉噪音，最后才判断这种模式在工作、关系和压力里是否反复出现。这样读，类型不会变成身份标签，而会变成一组可验证的线索。",
    "放到真实生活里，{label} 的核心张力通常会出现在选择顺序上：他们先追求{primary_drive}，再处理外界反馈。{variant_mode}会影响他们接收反馈的速度，但不改变这类人需要把判断放回具体情境里验证的事实。",
    "如果只用几个形容词概括 {label}，很容易漏掉他们的动态变化。更准确的读法是：看他们在信息不完整、他人期待不一致、时间压力上升时，是否仍然沿用同一套判断与恢复方式。",
  ],
  "rational-standard": [
    "{label} 的理性判断需要同时回答三个问题：证据是否足够，反例是否改变结论，情绪信号是否提示关系或执行成本。把这三件事分开，他们的理性就不只是坚持观点，而是让判断更可更新。",
    "在会议、学习或关系讨论里，{label} 如果只追求结论正确，别人可能只感到被评判；如果他们先说明证据、限制条件和下一步验证方式，理性就会变成共同解决问题的工具。",
    "{variant_sentence} 这意味着他们需要练习把早期反馈当作数据，而不是把所有质疑都看成干扰。成熟的理性不是排除感受，而是把事实、感受和后果放进同一个判断框架。",
  ],
  "independence-control": [
    "{label} 的独立性在团队里最好被翻译成清楚的边界：哪些部分需要独立推进，哪些节点欢迎评审，哪些风险需要共同承担。这样独立不会削弱合作，反而能降低误解和重复沟通成本。",
    "当 {label} 直接跳到结论时，周围人可能以为他们不需要协作。更有效的做法是先说明自己想保留判断空间，再邀请他人补充盲点、资源和执行限制，独立才会变成可靠分工。",
    "独立不是拒绝关系，也不是拒绝团队。对 {label} 来说，关键是让别人知道他们不是为了赢得控制权，而是为了保护判断质量、责任边界和长期执行节奏。",
  ],
  "willpower-ambition": [
    "{label} 的高标准更适合用在少数关键目标上。若所有事情都被推到同一强度，长期主义会变成消耗；若能区分必须卓越、可以达标和应该放弃，驱动力才更稳定。",
    "在项目推进中，{label} 需要把标准拆成质量、时间、成本和关系四个维度。不是每个维度都能同时拉满；真正成熟的高标准，是知道哪一项值得投入，哪一项只是完美主义的噪音。",
    "{variant_sentence} 因此他们最好定期检查：自己是在靠长期意义推进，还是在用过高标准回避不确定性。这个区别会决定高标准是帮助完成目标，还是让人长期疲惫。",
  ],
  "curiosity-revision": [
    "{label} 的好奇心不只是寻找新观点，而是测试旧解释是否还成立。一个新想法如果不能改变观察方式、选择顺序或行动策略，就还没有真正进入修正过程。",
    "当他们遇到相反证据时，最有价值的问题不是“谁对谁错”，而是“这个证据改变了哪一层判断”。这样 {label} 既能保留独立思考，也能避免把稳定观点变成封闭系统。",
    "更成熟的修正方式，是把好奇心落到小实验里：换一种沟通顺序，试一次不同的反馈节奏，或者重新定义成功标准。这样新信息不会停留在概念层，而会进入真实行为。",
  ],
  "emotional-blindspot": [
    "{label} 的压力信号常常先出现在身体和节奏里：睡眠变浅、反复检查、语气变硬、想快速退出对话。先命名这些信号，再决定休息、沟通或调整计划，会比继续硬撑更有效。",
    "情绪在这里不是判断的敌人，而是系统状态提示。{label} 如果能把紧张、失望或被冒犯感拆成具体信息，就能更早发现边界、信任或期待出了问题。",
    "{variant_sentence} 所以压力修复不应只靠继续分析。更稳妥的动作是暂停、确认事实、说明感受来源，再决定是否要调整任务、关系边界或恢复节奏。",
  ],
  "social-friction": [
    "{label} 的社交摩擦通常不是缺少善意，而是表达顺序让别人先感到压力。把“我看到的问题”改成“我为什么这样判断、我希望我们如何一起修正”，会更容易被听见。",
    "在反馈场景里，{label} 可以把判断拆成三句：事实是什么，影响是什么，下一步希望怎么验证。这样既不牺牲清晰度，也能让对方感到自己被纳入讨论。",
    "他们不需要把表达变得圆滑到失真，但需要区分直接和突然。直接说明证据、意图和共同目标，会比只抛出结论更容易建立信任。",
  ],
  "career-workflow": [
    "{label} 的职业优势不应被理解成固定岗位答案，而是任务结构偏好：他们更适合在目标清楚、责任边界明确、反馈可追踪的环境里发挥判断力。",
    "容易卡住的场景通常是权责模糊、标准频繁改变或反馈只停留在情绪层。此时 {label} 需要先把问题转成可验证条件，而不是立刻把协作低效理解成个人阻力。",
    "在 deadline 面前，{label} 最需要确认的是最低可交付标准、关键风险和哪些部分可以后续迭代。这样他们既能保留质量意识，也不会因为想一次做完而拖慢整体推进。",
  ],
  relationships: [
    "{label} 在关系里表达在意的方式，往往不是持续热烈，而是认真规划、承担问题和记住关键承诺。对方如果只等待即时情绪回应，可能会低估这种更安静的投入。",
    "亲密关系里的修复需要被说出来。{label} 可以把承诺拆成三句话：我在意什么，我能承担什么，我希望我们怎样调整。这样对方听到的不只是判断，也能听到合作意愿。",
    "当冲突出现时，{label} 需要避免把关系完全当作问题求解。先确认对方的感受和边界，再进入原因分析，反而能让他们的判断更有现实影响力。",
  ],
  "faq-boundary": [
    "FAQ 的价值是把搜索问题转成安全使用方式：哪些描述反复出现，哪些只在压力下出现，哪些需要用 Big Five、RIASEC 或真实反馈补充验证。这样类型不会变成最终判决。",
    "{label} 的结果更适合帮助读者提出下一步问题，而不是替他们做决定。职业、关系和成长选择仍然需要结合能力、环境、经历和具体目标来判断。",
    "如果读者想继续使用这一页，最好把答案当作观察清单：先记录真实场景，再看哪些模式稳定出现，最后决定要调整沟通、节奏还是任务边界。",
  ],
};

const DEFAULT_REPLACEMENTS = [
  "{label} 的这一段需要回到具体场景理解。比起重复结论，更有价值的是观察他们在压力、协作和反馈中如何调整判断，以及哪些边界会影响这种调整是否有效。",
  "对 {label} 来说，这里真正需要补充的是机制：他们怎样形成判断，怎样接收反例，又怎样把新的信息转成下一步行动。只有这样，类型描述才不会停在标签层。",
  "{variant_sentence} 因此这一模块最好被读成一组可验证问题，而不是固定答案：这个模式是否反复出现，是否有例外，是否需要用现实反馈重新校准。",
];

export function repairZhDuplicateParagraphsInPage(page) {
  if (page?.locale !== "zh" || !Array.isArray(page.modules)) return page;
  const repaired = structuredClone(page);
  repaired.modules = repairModules(repaired.modules, pageContext(repaired));
  return repaired;
}

export function repairZhDuplicateParagraphsInRows(rows) {
  return rows.map((row) => {
    if (row?.locale !== "zh") return row;
    const repaired = structuredClone(row);
    if (Array.isArray(repaired.modules)) repaired.modules = repairModules(repaired.modules, pageContext(repaired));
    if (Array.isArray(repaired.raw_page?.modules)) {
      repaired.raw_page.modules = repairModules(repaired.raw_page.modules, pageContext(repaired.raw_page));
    }
    return repaired;
  });
}

export function findExactParagraphDuplicates(row) {
  const duplicates = [];
  const seen = new Map();
  for (const [moduleIndex, section] of (row.modules ?? []).entries()) {
    for (const [paragraphIndex, paragraph] of (section.paragraphs ?? []).entries()) {
      const text = normalizeParagraph(paragraph);
      if (!text || text.length < 12) continue;
      const previous = seen.get(text);
      const location = {
        path: row.path,
        module_id: section.id ?? `module_${moduleIndex}`,
        module_index: moduleIndex,
        paragraph_index: paragraphIndex,
        text_prefix: text.slice(0, 96),
      };
      if (previous) {
        duplicates.push({ first: previous, duplicate: location, text });
      } else {
        seen.set(text, location);
      }
    }
  }
  return duplicates;
}

function repairModules(modules, context) {
  const seen = new Map();
  const duplicateOrdinalByModule = new Map();
  return modules.map((section, moduleIndex) => {
    const next = { ...section };
    next.paragraphs = (section.paragraphs ?? []).map((paragraph, paragraphIndex) => {
      const text = normalizeParagraph(paragraph);
      if (!text || text.length < 12) return paragraph;
      if (!seen.has(text)) {
        seen.set(text, { moduleIndex, paragraphIndex });
        return paragraph;
      }
      const moduleId = section.id ?? "default";
      const ordinal = duplicateOrdinalByModule.get(moduleId) ?? 0;
      duplicateOrdinalByModule.set(moduleId, ordinal + 1);
      return replacementFor(moduleId, ordinal, context);
    });
    return next;
  });
}

function replacementFor(moduleId, ordinal, context) {
  const options = MODULE_REPLACEMENTS[moduleId] ?? DEFAULT_REPLACEMENTS;
  const template = options[ordinal % options.length];
  const rendered = renderTemplate(template, context);
  if (ordinal < options.length) return rendered;
  return `${rendered} 这一点尤其适合放在 ${context.label} 的第 ${ordinal + 1} 个具体场景里继续验证。`;
}

function renderTemplate(template, context) {
  return template
    .replaceAll("{label}", context.label)
    .replaceAll("{primary_drive}", context.primary_drive)
    .replaceAll("{variant_mode}", context.variant_mode)
    .replaceAll("{variant_sentence}", context.variant_sentence);
}

function pageContext(page) {
  const type = String(page.type_code ?? "").toUpperCase();
  const variant = String(page.variant ?? "").toUpperCase();
  const label = `${type}-${variant}`;
  const aVariant = variant === "A";
  return {
    label,
    primary_drive: inferPrimaryDrive(type),
    variant_mode: aVariant ? "更稳定的自我确认" : "更敏感的压力校准",
    variant_sentence: aVariant
      ? `${label} 的 A 型稳定感能帮助他们在外界评价摇摆时保留方向，但也可能低估早期反馈。`
      : `${label} 的 T 型敏感度能帮助他们更早发现风险，但也可能把不确定信号放大成必须立刻处理的问题。`,
  };
}

function inferPrimaryDrive(type) {
  const map = {
    INTJ: "长期系统和证据判断",
    INTP: "概念澄清和逻辑一致",
    ENTJ: "效率、责任和结果推进",
    ENTP: "可能性探索和观点测试",
    INFJ: "意义、洞察和关系边界",
    INFP: "价值一致和内在真实",
    ENFJ: "影响力、照顾和共同目标",
    ENFP: "热情、选择和持续承诺",
    ISTJ: "秩序、责任和可靠执行",
    ISFJ: "照顾、稳定和具体承诺",
    ESTJ: "规则、执行和责任落地",
    ESFJ: "关系秩序和共同照顾",
    ISTP: "现实问题和操作自由",
    ISFP: "真实感受和温和边界",
    ESTP: "现场判断和行动反馈",
    ESFP: "体验、连接和当下回应",
  };
  return map[type] ?? "判断、行动和反馈校准";
}

function normalizeParagraph(paragraph) {
  return String(paragraph ?? "").replace(/\s+/g, " ").trim();
}

function getArgValue(name) {
  const prefix = `${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function resolvePath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
}

function main() {
  const input = resolvePath(
    getArgValue("--input") ??
      "docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-package-2026-07-01.json",
  );
  const output = resolvePath(getArgValue("--output") ?? input);
  const packageJson = JSON.parse(fs.readFileSync(input, "utf8"));
  packageJson.recommendations = repairZhDuplicateParagraphsInRows(packageJson.recommendations ?? []);
  fs.writeFileSync(output, `${JSON.stringify(packageJson, null, 2)}\n`);
  const remaining = packageJson.recommendations.flatMap((row) => findExactParagraphDuplicates(row));
  console.log(JSON.stringify({ ok: remaining.length === 0, output, remaining_duplicates: remaining.length }, null, 2));
  if (remaining.length) process.exitCode = 1;
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) main();
