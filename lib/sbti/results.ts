import {
  SBTI_DIMENSIONS,
  type SbtiArchetype,
  type SbtiDimensionDescriptor,
  type SbtiDimensionKey,
  type SbtiScoreVector,
} from "@/lib/sbti/types";

function vector(values: Record<SbtiDimensionKey, number>): SbtiScoreVector {
  return SBTI_DIMENSIONS.reduce((acc, key) => {
    acc[key] = values[key];
    return acc;
  }, {} as SbtiScoreVector);
}

export const SBTI_DIMENSION_DESCRIPTORS: SbtiDimensionDescriptor[] = [
  { key: "social_drive", label: { zh: "社交驱动", en: "Social drive" }, leftPole: { zh: "慢热", en: "Slow warm-up" }, rightPole: { zh: "外放", en: "Outgoing" } },
  { key: "expression_directness", label: { zh: "表达直给", en: "Direct expression" }, leftPole: { zh: "含蓄", en: "Subtle" }, rightPole: { zh: "直接", en: "Direct" } },
  { key: "novelty_seeking", label: { zh: "新鲜偏好", en: "Novelty seeking" }, leftPole: { zh: "稳妥", en: "Steady" }, rightPole: { zh: "尝鲜", en: "Adventurous" } },
  { key: "boundary_awareness", label: { zh: "边界感", en: "Boundary sense" }, leftPole: { zh: "松弛", en: "Loose" }, rightPole: { zh: "清晰", en: "Clear" } },
  { key: "emotional_openness", label: { zh: "情绪敞开", en: "Emotional openness" }, leftPole: { zh: "收着", en: "Reserved" }, rightPole: { zh: "外露", en: "Open" } },
  { key: "playfulness", label: { zh: "玩心", en: "Playfulness" }, leftPole: { zh: "克制", en: "Restrained" }, rightPole: { zh: "会玩", en: "Playful" } },
  { key: "stability", label: { zh: "稳定需求", en: "Stability need" }, leftPole: { zh: "随性", en: "Flexible" }, rightPole: { zh: "求稳", en: "Stable" } },
  { key: "initiative", label: { zh: "主动开场", en: "Initiative" }, leftPole: { zh: "跟随", en: "Follow" }, rightPole: { zh: "带头", en: "Lead" } },
  { key: "signal_sensitivity", label: { zh: "信号敏感", en: "Signal sensitivity" }, leftPole: { zh: "钝感", en: "Blunt" }, rightPole: { zh: "敏锐", en: "Sensitive" } },
  { key: "group_energy", label: { zh: "群体能量", en: "Group energy" }, leftPole: { zh: "小圈偏好", en: "Small circle" }, rightPole: { zh: "大场适配", en: "Big group" } },
  { key: "reflection", label: { zh: "反刍思考", en: "Reflection" }, leftPole: { zh: "即时", en: "Immediate" }, rightPole: { zh: "回味", en: "Reflective" } },
  { key: "aesthetic_showcase", label: { zh: "风格展示", en: "Style display" }, leftPole: { zh: "低调", en: "Low-key" }, rightPole: { zh: "显眼", en: "Expressive" } },
  { key: "ambiguity_tolerance", label: { zh: "模糊耐受", en: "Ambiguity tolerance" }, leftPole: { zh: "要确定", en: "Need certainty" }, rightPole: { zh: "能即兴", en: "Improvises" } },
  { key: "warmth", label: { zh: "关系温度", en: "Warmth" }, leftPole: { zh: "克制", en: "Cool" }, rightPole: { zh: "柔和", en: "Warm" } },
  { key: "rhythm_control", label: { zh: "节奏掌控", en: "Rhythm control" }, leftPole: { zh: "随流", en: "Go with flow" }, rightPole: { zh: "有安排", en: "Structured" } },
];

export const SBTI_ARCHETYPES: SbtiArchetype[] = [
  {
    code: "SPARK",
    name: { zh: "星火发起者", en: "Spark Starter" },
    tagline: { zh: "到场就想把气氛点亮的人", en: "Lights the room fast" },
    summary: { zh: "你偏主动、直接、会带节奏，适合做破冰、开场、拉人进入状态的那个角色。", en: "You tend to initiate, speak directly, and kick things into motion." },
    friendshipTip: { zh: "友情提示：热闹是你的天赋，但别把别人的慢热误判成冷淡。", en: "Not everyone warms up at your speed." },
    disclaimer: { zh: "这是娱乐画像，不代表你在所有场景都一定这样。", en: "Entertainment only." },
    centroid: vector({ social_drive: 86, expression_directness: 82, novelty_seeking: 70, boundary_awareness: 48, emotional_openness: 66, playfulness: 83, stability: 42, initiative: 90, signal_sensitivity: 54, group_energy: 88, reflection: 32, aesthetic_showcase: 72, ambiguity_tolerance: 74, warmth: 68, rhythm_control: 55 }),
  },
  {
    code: "WARM",
    name: { zh: "柔光共鸣者", en: "Soft Resonator" },
    tagline: { zh: "会先接住情绪，再把人慢慢拉近", en: "Leads with warmth" },
    summary: { zh: "你很会感受场上的细微变化，擅长用温度、耐心和理解感让别人放下戒备。", en: "You read the room carefully and create safety with warmth." },
    friendshipTip: { zh: "友情提示：你很会照顾人，也记得把自己的边界写清楚。", en: "Warmth still needs boundaries." },
    disclaimer: { zh: "这是娱乐画像，不作情感、相亲或关系判断依据。", en: "Entertainment only." },
    centroid: vector({ social_drive: 58, expression_directness: 48, novelty_seeking: 52, boundary_awareness: 72, emotional_openness: 82, playfulness: 56, stability: 68, initiative: 44, signal_sensitivity: 88, group_energy: 52, reflection: 70, aesthetic_showcase: 40, ambiguity_tolerance: 46, warmth: 92, rhythm_control: 66 }),
  },
  {
    code: "WAVE",
    name: { zh: "自由漫游者", en: "Free Floater" },
    tagline: { zh: "好玩和新鲜感永远排得很前", en: "Chases fresh energy" },
    summary: { zh: "你对有趣、变化、临场化很敏感，容易被新的局、新的人、新的体验点燃。", en: "You are energized by novelty, movement, and fresh situations." },
    friendshipTip: { zh: "友情提示：你的即兴感很迷人，但收尾也算体验的一部分。", en: "Improvisation is great; endings still matter." },
    disclaimer: { zh: "这是娱乐画像，不作重大决策依据。", en: "Entertainment only." },
    centroid: vector({ social_drive: 76, expression_directness: 61, novelty_seeking: 92, boundary_awareness: 38, emotional_openness: 58, playfulness: 90, stability: 28, initiative: 64, signal_sensitivity: 44, group_energy: 74, reflection: 25, aesthetic_showcase: 66, ambiguity_tolerance: 88, warmth: 55, rhythm_control: 24 }),
  },
  {
    code: "ANCHOR",
    name: { zh: "稳定掌舵者", en: "Steady Anchor" },
    tagline: { zh: "局面再花，也想让流程落到地上", en: "Grounds the room" },
    summary: { zh: "你更关注节奏、边界和可持续感，适合在好玩之外补上秩序和收束。", en: "You bring structure, closure, and steadiness to otherwise loose situations." },
    friendshipTip: { zh: "友情提示：你是场上的稳定器，但别把所有变化都当成风险。", en: "Structure helps, but not every surprise is danger." },
    disclaimer: { zh: "这是娱乐画像，不代表职业或能力结论。", en: "Entertainment only." },
    centroid: vector({ social_drive: 42, expression_directness: 58, novelty_seeking: 26, boundary_awareness: 90, emotional_openness: 42, playfulness: 30, stability: 92, initiative: 62, signal_sensitivity: 64, group_energy: 38, reflection: 72, aesthetic_showcase: 24, ambiguity_tolerance: 22, warmth: 54, rhythm_control: 94 }),
  },
  {
    code: "MUSE",
    name: { zh: "灵感策展人", en: "Mood Curator" },
    tagline: { zh: "有风格、有感觉，也很会营造氛围", en: "Designs the vibe" },
    summary: { zh: "你会被审美、表达和场景质感驱动，擅长把一件普通的事做出记忆点。", en: "You care about style, feeling, and turning moments into something memorable." },
    friendshipTip: { zh: "友情提示：审美是你的超能力，但别让表现欲压过真实感。", en: "Style works best when it still feels honest." },
    disclaimer: { zh: "这是娱乐画像，不作专业人格结论。", en: "Entertainment only." },
    centroid: vector({ social_drive: 62, expression_directness: 57, novelty_seeking: 80, boundary_awareness: 45, emotional_openness: 75, playfulness: 72, stability: 36, initiative: 55, signal_sensitivity: 71, group_energy: 58, reflection: 54, aesthetic_showcase: 94, ambiguity_tolerance: 74, warmth: 62, rhythm_control: 43 }),
  },
  {
    code: "ECHO",
    name: { zh: "轻盈观察者", en: "Quiet Echo" },
    tagline: { zh: "表面安静，内里其实很会感受", en: "Quiet outside, vivid inside" },
    summary: { zh: "你不是最先冲到前面的人，但你会看、会想、会在关键时刻给出很准的反馈。", en: "You may not lead the volume, but you notice patterns and respond precisely." },
    friendshipTip: { zh: "友情提示：慢一点不是没想法，记得给别人看见你的存在感。", en: "Your quiet read is valuable; let people see it." },
    disclaimer: { zh: "这是娱乐画像，不是心理诊断。", en: "Entertainment only." },
    centroid: vector({ social_drive: 34, expression_directness: 32, novelty_seeking: 48, boundary_awareness: 70, emotional_openness: 54, playfulness: 42, stability: 64, initiative: 28, signal_sensitivity: 84, group_energy: 30, reflection: 90, aesthetic_showcase: 34, ambiguity_tolerance: 44, warmth: 58, rhythm_control: 60 }),
  },
  {
    code: "PULSE",
    name: { zh: "节奏调频师", en: "Pulse Tuner" },
    tagline: { zh: "不一定最吵，但很会把节奏拧顺", en: "Tunes the pace" },
    summary: { zh: "你对什么时候该推进、什么时候该缓一缓很有感觉，适合做局面的节奏控制器。", en: "You sense when to push, when to pause, and how to keep flow coherent." },
    friendshipTip: { zh: "友情提示：你很会控场，也别忘了给别人一点自由发挥空间。", en: "Control works best with room to breathe." },
    disclaimer: { zh: "这是娱乐画像，不代表领导力测量结果。", en: "Entertainment only." },
    centroid: vector({ social_drive: 56, expression_directness: 63, novelty_seeking: 52, boundary_awareness: 78, emotional_openness: 48, playfulness: 44, stability: 80, initiative: 74, signal_sensitivity: 69, group_energy: 57, reflection: 64, aesthetic_showcase: 36, ambiguity_tolerance: 46, warmth: 50, rhythm_control: 90 }),
  },
  {
    code: "GLOW",
    name: { zh: "氛围编织者", en: "Glow Weaver" },
    tagline: { zh: "喜欢让大家都舒服地卷进来", en: "Draws people in softly" },
    summary: { zh: "你既不想太硬，也不想太闷，更擅长用轻松感和共鸣感把一群人连起来。", en: "You connect people through ease, lightness, and a shared mood." },
    friendshipTip: { zh: "友情提示：你让场子舒服的能力很强，但别总替所有人兜底。", en: "Comfort is a gift; it should not become unpaid labor." },
    disclaimer: { zh: "这是娱乐画像，不作招聘或团队筛选依据。", en: "Entertainment only." },
    centroid: vector({ social_drive: 72, expression_directness: 54, novelty_seeking: 64, boundary_awareness: 58, emotional_openness: 72, playfulness: 76, stability: 52, initiative: 58, signal_sensitivity: 78, group_energy: 80, reflection: 46, aesthetic_showcase: 58, ambiguity_tolerance: 66, warmth: 86, rhythm_control: 50 }),
  },
];
