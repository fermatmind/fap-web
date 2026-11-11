import { prepareSelectedResultProfile } from "./prepare-profile";
import content from "./disc.json";
import type { QuestionnaireProfile, QuestionnaireSection, Text } from "../types";

const section = (id: string, title: Text, ...paragraphs: Text[]): QuestionnaireSection => ({ id, title, paragraphs });
const text = (zh: string, en: string): Text => ({ zh, en });
const directions: Record<string, Text> = {
  DOMINANCE: text("D·推进处理", "D · Moving things forward"),
  INFLUENCE: text("I·表达带动", "I · Engaging through expression"),
  STEADINESS: text("S·稳定支持", "S · Steady support"),
  CONSCIENTIOUSNESS: text("C·规范核对", "C · Standards and checks"),
};
const needs: Record<string, Text> = {
  DOMINANCE: text("这次是否需要先定一个可撤回的下一步？", "Does this situation need a reversible next step first?"),
  INFLUENCE: text("是否需要先把想法说清楚，让别人有机会回应？", "Does the idea need explaining so others can respond?"),
  STEADINESS: text("安排是否符合彼此能持续承担的节奏？", "Does the arrangement fit a pace both people can sustain?"),
  CONSCIENTIOUSNESS: text("哪些依据或完成条件需要先核对？", "Which evidence or completion criteria need checking first?"),
};

/** Presentation only. Source questionnaire, score assignment and public identities stay authoritative. */
export function discResultProfile(profile: QuestionnaireProfile, reader = content, displayText: (source: string) => string = source => source): QuestionnaireProfile {
  if (!Object.hasOwn(reader, profile.id)) return profile;
  const editorial = (reader as Record<string, { headline: Text; summary: Text; sections: QuestionnaireSection[] }>)[profile.id];
  if (!editorial || !profile.directionIds.every(id => directions[id])) return profile;
  const text = (zh: string, en: string): Text => ({ zh: displayText(zh), en });
  const tied = profile.directionIds.length > 1;
  const labels = profile.directionIds.map(id => directions[id]);
  const count = section("editorial-counts", text("先读清这次计数", "Read the counts before the description"),
    text("24题每题在两个方向中选一项，所选方向加1；四个计数合计24，每个方向有12次被选机会。次数比较的是本题组中的相对选择，不是能力、人格浓度或人群百分位。较少选择也不表示缺少某种品质。", "Across 24 paired questions, each selection adds 1 to one direction. The four counts sum to 24, and each direction has 12 opportunities to be selected. Counts compare choices within this question set, rather than ability, personality concentration or population percentile. Fewer selections do not establish an absent quality."),
    tied ? text("所有最高并列完整保留；两项、三项、四项并列都不按题号或字母顺序选主型。四项并列时，每项必为6。相同计数并不说明两种做法同样熟练，也不能证明你能灵活切换。", "Every highest tie is retained. Two-, three- and four-way ties do not acquire a primary type from question or letter order. In a four-way tie each count must be 6. Equal counts do not demonstrate equal skill or flexible switching.") : text("最高只表示比本次其余三个计数大；领先1次与领先多次不能直接解释为类型稳定程度。本站未建立“接近就算混合型”的阈值，也不把计数转换成MBTI字母或职业匹配率。", "Highest means only greater than the other three counts in this attempt. A one-count lead and a larger lead cannot be directly interpreted as type stability. No near-tie blended-type threshold, MBTI conversion or career-match percentage has been established."));
  const sections = [count];
  if (tied) sections.push(section("editorial-directions", text("逐项核对，不合成新人格", "Review the directions separately"), ...profile.directionIds.map(id => text(
    `${directions[id].zh}：${needs[id].zh}这是回顾情境的问题，不是由并列计数推定的能力。`,
    `${directions[id].en}: ${needs[id].en} This is a question for reviewing a situation, not an ability inferred from tied counts.`))));
  sections.push(...editorial.sections);
  if (tied) sections.push(section("editorial-conversation", text("把并列结果变成一次对话", "Turn the tie into a conversation"),
    text(`可以说：“这次${labels.map(t => t.zh).join("、")}的计数并列最高。我们先分别看看：${profile.directionIds.map(id => needs[id].zh).join("")}哪一问最符合这件事？”请对方举一个符合或不符合的例子，而不是为你选主型。`,
      `Try: “${labels.map(t => t.en).join(" / ")} tied for the highest count in this attempt. Let us consider these questions separately: ${profile.directionIds.map(id => needs[id].en).join(" ")} Which matters most here?” Invite an example that fits or does not fit, rather than asking someone to assign your primary type.`)));
  sections.push(section("editorial-reality-check", text("怎样判断这段解读是否适用", "Check the reading against experience"),
    text("挑一件最近发生、自己愿意回顾的小事，写下当时的目标、限制、实际做法和结果，再找一个没有采用这种做法的反例。若描述不合适，可以保留不认同；不需要把经历改写成符合标签的故事。上面的场景是编辑举例，不能从所选选项反推出你真实做过什么。", "Choose a recent, ordinary event you are comfortable reviewing. Note the goal, constraints, action and outcome, then find a counterexample where you used another approach. You may reject a description that does not fit. The situations above are editorial examples; selected options cannot establish what you actually did.")));
  sections.push(section("editorial-share", text("愿意分享时，可以这样介绍", "A way to introduce the result if you want to share"),
    text(`“我这次DISC原始选择中，${labels.map(t => t.zh).join("、")}${tied ? "并列最高" : "次数最高"}。我想观察它在具体事情中是否符合，也欢迎你说一个不同的例子。”只分享自己愿意公开的部分；这段话是可自行复制的表达示例，不会自动发布任何成绩。`,
      `“In this DISC attempt, ${labels.map(t => t.en).join(" / ")} ${tied ? "tied for the highest count" : "had the highest count"}. I want to check how this fits particular situations, and would welcome a different example.” Share only what you choose to make public. This is wording you can copy yourself; it does not publish a score automatically.`),
    text("朋友结果不同时，可以比较同一情境下各自需要什么；结果相同时，也可以找出做法不同的地方。任何组合都不能证明关系匹配、谁更适合负责，或谁必须迁就谁。公开结果链接展示通用解读，不包含你的个人计数或答案。", "If a friend has a different result, compare what each of you needs in the same situation. If the result is the same, look for differences in action. No combination establishes compatibility, responsibility or who must accommodate whom. A public result link shows a general reading without your personal counts or answers.")));
  sections.push(section("editorial-method", text("方法与解释范围", "Method and interpretation scope"),
    text("本版为费马原创24题二选一问卷，尚未建立信度、效度、常模或跨语言等值。每个选项只在它与另一选项配对的条件下被选择；低计数可能表示相比之下更常选择另一做法，不能解释为绝对不喜欢或不会。", "This is FermatMind’s original 24-item paired-choice questionnaire, without established reliability, validity, population norms or cross-language equivalence. Each option is chosen against its paired alternative; a lower count can reflect choosing the alternative more often, rather than an absolute dislike or inability."),
    text("DISC有不同题本与报告系统。Everything DiSC官方说明包含12种风格，本版15份报告来自4个单项最高和11种最高并列组合，数量相近不表示模型相同。该官方来源仅用于辨别版本，不为本题本提供效度或认证。这里的建议是可选择的日常观察练习，不是诊断、招聘筛选或关系预测。", "DISC has different instruments and report systems. Everything DiSC describes 12 styles; this edition’s 15 reports come from 4 single-highest outcomes and 11 highest-tie combinations. They are not equivalent models. The official source helps distinguish editions and does not validate or certify this questionnaire. Suggestions here are optional everyday observations, without diagnostic, hiring or relationship-prediction authority.")));
  // Keep the separately sourced naming explanation available under its stable anchor.
  sections.push(...profile.sections.filter(s => s.id === "thai-four-animals-labels"));
  return { ...profile, headline: editorial.headline, summary: editorial.summary, sections };
}

export const discReading = { attribute: "disc", select: discResultProfile, references: [{ title: { zh: "版本比较来源：Everything DiSC官方模型说明", en: "Edition comparison source: Everything DiSC’s official model explanation" }, url: "https://www.everythingdisc.com/what-is-disc/" }] };

export function prepareDiscResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  return prepareSelectedResultProfile("disc", profile, discReading);
}
