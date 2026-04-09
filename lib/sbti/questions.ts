import type { SbtiQuestion } from "@/lib/sbti/types";

function option(
  id: string,
  labelZh: string,
  impacts: SbtiQuestion["options"][number]["impacts"]
) {
  return {
    id,
    label: {
      zh: labelZh,
      en: labelZh,
    },
    impacts,
  };
}

function question(
  id: string,
  order: number,
  promptZh: string,
  options: SbtiQuestion["options"]
): SbtiQuestion {
  return {
    id,
    order,
    prompt: {
      zh: promptZh,
      en: promptZh,
    },
    options,
    dimensionWeights: {},
  };
}

export const SBTI_QUESTIONS: SbtiQuestion[] = [
  question("q01", 1, "我希望自己一直往上走，变得更强一点。", [
    option("A", "不认同", { initiative: 28, stability: 44 }),
    option("B", "中立", { initiative: 52, stability: 56 }),
    option("C", "认同", { initiative: 84, novelty_seeking: 64, rhythm_control: 68 }),
  ]),
  question("q02", 2, "我心里一直有想认真追求的东西。", [
    option("A", "不认同", { initiative: 24, reflection: 42 }),
    option("B", "中立", { initiative: 50, reflection: 56 }),
    option("C", "认同", { initiative: 82, reflection: 70, stability: 66 }),
  ]),
  question("q03", 3, "我做事更在意成果和成长，而不是一味躲风险。", [
    option("A", "不认同", { novelty_seeking: 34, stability: 62 }),
    option("B", "中立", { novelty_seeking: 54, stability: 54 }),
    option("C", "认同", { novelty_seeking: 78, initiative: 76, ambiguity_tolerance: 62 }),
  ]),
  question("q04", 4, "我做决定通常比较果断，不太喜欢拖着不定。", [
    option("A", "不认同", { expression_directness: 34, reflection: 70 }),
    option("B", "中立", { expression_directness: 54, reflection: 56 }),
    option("C", "认同", { expression_directness: 82, initiative: 72 }),
  ]),
  question("q05", 5, "你在路上遇到一个很可爱的小女孩，她笑着递给你一根棒棒糖，你第一反应更像：", [
    option("A", "哇，她也太可爱了吧，还给我糖！", { warmth: 84, emotional_openness: 76, social_drive: 68 }),
    option("B", "有点懵，先愣一下再说。", { reflection: 64, signal_sensitivity: 56 }),
    option("C", "这不会是什么新型整活吧，先保持距离。", { boundary_awareness: 84, stability: 72 }),
  ]),
  question("q06", 6, "谈恋爱后，如果对方特别黏人，你更接近：", [
    option("A", "我会觉得挺甜的。", { warmth: 82, emotional_openness: 74 }),
    option("B", "都行，看状态。", { ambiguity_tolerance: 60, warmth: 56 }),
    option("C", "我还是更需要自己的独处空间。", { boundary_awareness: 84, reflection: 68 }),
  ]),
  question("q07", 7, "你平时更偏向哪类爱好？", [
    option("A", "吃吃喝喝，到处逛逛", { social_drive: 70, playfulness: 74 }),
    option("B", "艺术或审美类兴趣", { aesthetic_showcase: 88, reflection: 58 }),
    option("C", "小酌或夜生活", { novelty_seeking: 78, group_energy: 72, playfulness: 70 }),
    option("D", "运动或健身", { stability: 72, rhythm_control: 78, initiative: 62 }),
  ]),
  question("q08", 8, "别人说你“执行力强”，你心里更像哪句？", [
    option("A", "真到最后关头，我确实能硬着头皮推进。", { initiative: 66, stability: 56 }),
    option("B", "有时候是这样。", { initiative: 52, stability: 52 }),
    option("C", "是的，事情本来就该往前推。", { initiative: 86, expression_directness: 70 }),
  ]),
  question("q09", 9, "在感情里，我会担心自己被对方丢下。", [
    option("A", "是的", { signal_sensitivity: 82, emotional_openness: 76 }),
    option("B", "偶尔", { signal_sensitivity: 58, emotional_openness: 56 }),
    option("C", "不是", { stability: 74, boundary_awareness: 68 }),
  ]),
  question("q10", 10, "我很渴望和信任的人快速熟起来，像认识很久一样。", [
    option("A", "认同", { social_drive: 78, warmth: 86, emotional_openness: 78 }),
    option("B", "中立", { warmth: 58, social_drive: 54 }),
    option("C", "不认同", { boundary_awareness: 76, reflection: 66 }),
  ]),
  question("q11", 11, "这题没有标准题干，请凭感觉选一项：", [
    option("A", "想来想去，还是 A 吧", { reflection: 74 }),
    option("B", "要不就 B？", { ambiguity_tolerance: 58, playfulness: 48 }),
    option("C", "不会就先选 C", { initiative: 60, expression_directness: 56 }),
  ]),
  question("q12", 12, "朋友带了 ta 的朋友一起来玩，你更可能处于哪种状态？", [
    option("A", "会有点不适应，像原本的二人局被打断了", { boundary_awareness: 76, stability: 70 }),
    option("B", "看现场感觉，能玩就玩", { ambiguity_tolerance: 58, group_energy: 54 }),
    option("C", "会主动把对方也当成新朋友认识一下", { social_drive: 84, group_energy: 80, warmth: 70 }),
  ]),
  question("q13", 13, "如果你很喜欢的人同时具备很多理想特质，你会更接近：", [
    option("A", "会开心，但仍会提醒自己别陷太深", { boundary_awareness: 80, reflection: 68 }),
    option("B", "大概会在理智和心动之间来回摇摆", { emotional_openness: 62, reflection: 62 }),
    option("C", "会非常珍惜，甚至容易有点恋爱脑", { emotional_openness: 82, warmth: 78, signal_sensitivity: 70 }),
  ]),
  question("q14", 14, "我不喜欢纯发散式空谈，对一些哲学或人生问题会认真想一想。", [
    option("A", "并没有", { reflection: 24, playfulness: 58 }),
    option("B", "有一点", { reflection: 54 }),
    option("C", "是的", { reflection: 88, ambiguity_tolerance: 66 }),
  ]),
  question("q15", 15, "我其实很清楚“真正的自己”大概是什么样。", [
    option("A", "不认同", { stability: 30, reflection: 48 }),
    option("B", "中立", { stability: 56, reflection: 58 }),
    option("C", "认同", { stability: 84, reflection: 78 }),
  ]),
  question("q16", 16, "对方五个多小时没回消息，后来解释说睡着了，你更可能怎么想？", [
    option("A", "这么久没回，我很难完全不多想", { signal_sensitivity: 82, emotional_openness: 72 }),
    option("B", "会在信任和怀疑之间摇摆", { signal_sensitivity: 64, reflection: 58 }),
    option("C", "也许 ta 今天真的太累了", { warmth: 76, stability: 68 }),
  ]),
  question("q17", 17, "如果你看到一段很长、很丧、很自我否定的独白，你第一反应更接近：", [
    option("A", "我有点被戳到了", { emotional_openness: 84, signal_sensitivity: 76 }),
    option("B", "我有点懵，先看看再说", { reflection: 58, ambiguity_tolerance: 48 }),
    option("C", "这不是我的状态", { stability: 74, boundary_awareness: 58 }),
  ]),
  question("q18", 18, "我做事通常是有明确目标的。", [
    option("A", "不认同", { rhythm_control: 24, initiative: 32 }),
    option("B", "中立", { rhythm_control: 52, initiative: 50 }),
    option("C", "认同", { rhythm_control: 84, initiative: 82 }),
  ]),
  question("q19", 19, "临近考试，晚上本该复习，但有人约你出去玩，你更接近：", [
    option("A", "就这一次，先出去再说", { novelty_seeking: 80, playfulness: 68, rhythm_control: 30 }),
    option("B", "看情况，可能会请个假或调整一下", { ambiguity_tolerance: 58, rhythm_control: 54 }),
    option("C", "都快考试了，还是先把正事处理完", { stability: 82, rhythm_control: 84 }),
  ]),
  question("q20", 20, "你会觉得大多数人本质上是善良的吗？", [
    option("A", "我没那么乐观，很多人只是守规矩", { boundary_awareness: 72, warmth: 34 }),
    option("B", "也许吧", { warmth: 54, ambiguity_tolerance: 54 }),
    option("C", "我还是愿意相信好人更多", { warmth: 84, emotional_openness: 60 }),
  ]),
  question("q21", 21, "有时我会突然觉得，人生未必真有一个确定答案，人也常常被欲望推着走。", [
    option("A", "我很能共鸣", { reflection: 84, ambiguity_tolerance: 76 }),
    option("B", "有时会这样想，但不绝对", { reflection: 60, ambiguity_tolerance: 58 }),
    option("C", "我不太认同这种看法", { stability: 72, rhythm_control: 64 }),
  ]),
  question("q22", 22, "我常常会因为一个特别鲜明的点，迅速记住一个人。", [
    option("A", "认同", { signal_sensitivity: 84, aesthetic_showcase: 64 }),
    option("B", "中立", { signal_sensitivity: 58 }),
    option("C", "不认同", { reflection: 40, signal_sensitivity: 30 }),
  ]),
  question("q23", 23, "在不同的人和场景面前，我会表现出不太一样的自己。", [
    option("A", "不认同", { stability: 80, expression_directness: 66 }),
    option("B", "中立", { stability: 56, ambiguity_tolerance: 52 }),
    option("C", "认同", { group_energy: 64, social_drive: 58, ambiguity_tolerance: 70 }),
  ]),
  question("q24", 24, "说到计划这件事，我更像：", [
    option("A", "变化通常比计划来得更快", { ambiguity_tolerance: 76, rhythm_control: 34 }),
    option("B", "有时会计划，有时随缘", { rhythm_control: 54, ambiguity_tolerance: 56 }),
    option("C", "我其实不太爱做计划", { novelty_seeking: 62, rhythm_control: 22 }),
  ]),
  question("q25", 25, "在任何关系里，我都希望保留一块稳定的个人空间。", [
    option("A", "很认同", { boundary_awareness: 88, reflection: 68 }),
    option("B", "看情况", { boundary_awareness: 58, ambiguity_tolerance: 56 }),
    option("C", "不太认同", { warmth: 74, emotional_openness: 62 }),
  ]),
  question("q26", 26, "我会觉得自己不够好，身边很多人都比我更优秀。", [
    option("A", "确实", { signal_sensitivity: 80, stability: 26 }),
    option("B", "有时", { signal_sensitivity: 60, stability: 48 }),
    option("C", "不是", { stability: 82, initiative: 62 }),
  ]),
  question("q27", 27, "你已经在马桶上坐了很久，还是没结果，这时你更像：", [
    option("A", "再等等，说不定下一分钟就成了", { ambiguity_tolerance: 70, stability: 42 }),
    option("B", "一边给自己打气，一边继续努力", { initiative: 68, stability: 58 }),
    option("C", "直接用最有效的办法赶紧解决", { expression_directness: 76, rhythm_control: 82 }),
  ]),
  question("q28", 28, "我喜欢把话说直，不太爱绕圈子。", [
    option("A", "认同", { expression_directness: 88, initiative: 64 }),
    option("B", "偏中立", { expression_directness: 54 }),
    option("C", "不认同", { warmth: 62, reflection: 66 }),
  ]),
  question("q29", 29, "你和网友聊得不错，对方提议线下见一面，你更可能：", [
    option("A", "网上聊聊可以，真见面我还是会谨慎", { boundary_awareness: 82, reflection: 60 }),
    option("B", "见也行，顺其自然", { ambiguity_tolerance: 60, social_drive: 54 }),
    option("C", "我会认真准备一下，甚至有点期待", { social_drive: 78, aesthetic_showcase: 68, emotional_openness: 62 }),
  ]),
  question("q30", 30, "有时候我明明已经意识到某件事不太对，但还是不太愿意说破。更接近你的原因是：", [
    option("A", "这种情况比较少", { expression_directness: 80, boundary_awareness: 68 }),
    option("B", "可能是顾及关系和场面", { warmth: 74, boundary_awareness: 58 }),
    option("C", "我不想显得自己太拧巴或太敏感", { signal_sensitivity: 80, reflection: 64 }),
  ]),
  question("q31", 31, "外界对我的评价，很多时候并不会真正左右我。", [
    option("A", "不认同", { signal_sensitivity: 80, stability: 34 }),
    option("B", "中立", { stability: 54, reflection: 54 }),
    option("C", "认同", { stability: 82, boundary_awareness: 70 }),
  ]),
];
