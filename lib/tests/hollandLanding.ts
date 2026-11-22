export const hollandDimensions = [
  ["R", "现实型", "动手操作与修理", "观察一件设备的工作过程，记录部件和用途。", "长时间写汇报或开会，几乎没有机会动手解决具体问题。"],
  ["I", "研究型", "分析问题与证据", "找一份公开数据，试着用图表回答一个问题。", "方案频繁凭直觉拍板，留给独立分析和验证的时间很少。"],
  ["A", "艺术型", "构思与创意表达", "围绕同一个主题，设计两版海报并比较表达效果。", "长期按固定模板重复交付，几乎没有自主表达空间。"],
  ["S", "社会型", "教学与支持他人", "为新同事准备一份入门说明，听听哪里还不清楚。", "工作长期独立进行，很少接触服务对象或得到反馈。"],
  ["E", "企业型", "说服与组织推进", "为一个小活动写提案，邀请同伴分工执行。", "长期只做后台核对，难以参与决策或看到项目进展。"],
  ["C", "常规型", "整理信息与维护流程", "整理一份混乱的台账，设计一套复核规则。", "规则反复变动，团队缺少清晰的交接和复核流程。"],
] as const;

export const hollandFaq = [
  { question: "霍兰德职业兴趣测试测什么？", answer: "霍兰德测试测量你对六类工作活动的兴趣：现实型 R、研究型 I、艺术型 A、社会型 S、企业型 E 和常规型 C。它适合用来找出你愿意多接触、试做或深入了解的工作活动。" },
  { question: "60 题要做多久？结果可以免费查看吗？", answer: "约 8 分钟。费马测试（FermatMind）的霍兰德 60 题标准版可免注册免费作答，提交后可在作答的浏览器免费查看六维兴趣分数、三字代码和基础解读。" },
  { question: "如何用霍兰德结果选专业或准备转行？", answer: "从高分维度挑两三个方向，先看课程内容或岗位真实任务，再约一次访谈、旁听一节课或完成一个小项目。把体验和入行要求、时间与收入条件放在一起比较。" },
  { question: "三字代码怎么看？分数接近时该怎么办？", answer: "三字代码取六维中分数最高的三个字母。例如研究型、艺术型、社会型排在前三，代码就是 IAS。如果第二、三、四名只差几分，将相近维度一起参考，再用实际任务比较自己愿意继续做哪一类。" },
  { question: "六个维度都差不多，怎么开始探索？", answer: "先选两类你略偏好的活动，用各 30–60 分钟做一个小任务。记录哪一项更想继续做、哪一项更愿意为它练习，再结合岗位日常和工作条件比较。" },
  { question: "霍兰德、费马职业测试和 MBTI 应该先做哪个？", answer: "想知道自己对哪些工作活动感兴趣，先做霍兰德。想把兴趣、工作方式和现实条件一起梳理，选费马职业测试。想理解获取信息、做决定与协作的习惯，选 MBTI。" },
  { question: "什么时候适合再做一次霍兰德测试？", answer: "实习、换岗或体验新课程后，如果你对具体活动的喜好有了新认识，可以用同一题本重测，再对照这些经历看看哪些兴趣变得更清楚。" },
] as const;
export type HollandDimension = (typeof hollandDimensions)[number][0];
type HollandScores = Readonly<Record<HollandDimension, number>>;

export const hollandReportSamples = [
  { name: "研创探索型", scores: { R: 42, I: 80, A: 72, S: 65, E: 39, C: 36 }, task: "访谈一位目标用户，把痛点整理成一页图文设计方案。" },
  { name: "组织赋能型", scores: { R: 35, I: 41, A: 48, S: 84, E: 78, C: 70 }, task: "策划一场 30 分钟的内部分享会，统筹流程并整理签到和反馈。" },
  { name: "工程造物型", scores: { R: 82, I: 73, A: 68, S: 32, E: 38, C: 45 }, task: "拆解一个常用工具或软件原型，记录工作原理，再画一张改进草图。" },
].map(({ name, scores, task }: { name: string; scores: HollandScores; task: string }) => {
  const dimensions = hollandDimensions.map(([code, label]) => ({ code, label, score: scores[code] }));
  const ranked = [...dimensions].sort((a, b) => b.score - a.score);
  const mean = dimensions.reduce((sum, { score }) => sum + score, 0) / dimensions.length;
  return {
    name, task, dimensions, ranked,
    code: ranked.slice(0, 3).map(({ code }) => code).join(""),
    gap: ranked[0].score - ranked[1].score,
    spread: Math.sqrt(dimensions.reduce((sum, { score }) => sum + (score - mean) ** 2, 0) / dimensions.length).toFixed(1),
  };
});

export function hollandPoint(index: number, radius: number) {
  const angle = index * Math.PI / 3 - Math.PI / 2;
  return [110 + Math.cos(angle) * radius, 110 + Math.sin(angle) * radius] as const;
}
