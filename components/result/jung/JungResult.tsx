import Link from "next/link";

const archetypes = {
  hero: ["英雄", "Hero", "突破挑战", "Overcoming a challenge", "停下似乎就等于退让", "Pausing may feel like giving up", "拆分难题，先问团队愿意承担多少", "Break down the challenge and ask what the team can take on", "把原本可以求助的难题也揽下来", "Taking on a challenge that could be shared"],
  sage: ["智者", "Sage", "理解缘由", "Understanding why", "担心建立在错误依据上", "Worrying about relying on a weak premise", "在证据足以试行时约定复查点", "Agree on a review point once there is enough evidence to try", "在信息已够作小试时还一再推迟", "Delaying a small trial after enough information is available"],
  explorer: ["探索者", "Explorer", "亲自发现", "Discovering firsthand", "担心选择越来越少", "Worrying that options will close", "把试验限定在一个任务内，并分享发现", "Bound an experiment to one task and share what you learn", "每次遇到重复工作就换方向", "Changing direction every time the work becomes repetitive"],
  creator: ["创造者", "Creator", "做出自己的表达", "Giving an idea its own form", "担心成品失去原意", "Worrying that the work will lose its intent", "先交一个能讨论的版本，再改表现形式", "Share a draft people can discuss before refining its form", "反复打磨表达，让团队一直等初稿", "Refining the expression so long that teammates cannot see a draft"],
  ruler: ["统治者", "Ruler", "建立能运转的秩序", "Making coordination work", "担心职责不清拖住整体", "Worrying that unclear responsibilities will stall the group", "明确交接和决定权，同时留出自主空间", "Clarify handoffs and decision rights while leaving room for autonomy", "把团队每一步都变成审批", "Turning every step into an approval"],
  caregiver: ["照顾者", "Caregiver", "回应实际需要", "Responding to practical needs", "担心有人被落下", "Worrying someone will be left without support", "先问对方需要什么，约定自己能帮到哪里", "Ask what help is wanted and agree on what you can offer", "在对方提出需要前就接管任务", "Taking over before finding out what help someone wants"],
  magician: ["魔术师", "Magician", "促成实际转变", "Making a transformation possible", "担心局面只能照旧", "Worrying the situation cannot change", "选一个小环节验证新的组合有没有用", "Test whether a new combination works in one small part", "把每个小问题都当成整体转型的机会", "Treating each small problem as a reason to overhaul the whole process"],
  lover: ["情人", "Lover", "维护重视的联结", "Sustaining a valued connection", "担心重视的关系变得疏远", "Worrying that a valued connection will fade", "给彼此专注的时间，也把不同需求说清", "Give each other attention and state differing needs clearly", "因为重视关系而拖延必要的分歧", "Putting off a necessary disagreement to protect the relationship"],
  jester: ["弄臣", "Jester", "给日常留一点玩趣", "Making room for play", "担心气氛变得紧绷", "Worrying the atmosphere will grow stiff", "轻松一下后，回到大家要解决的具体问题", "Lighten the mood, then return to the concrete issue", "每逢困难就转成玩笑，使问题留在原处", "Making light of every difficulty and leaving the issue unresolved"],
  everyperson: ["凡人", "Everyperson", "自然参与与归属", "Belonging through ordinary participation", "担心谁被当作局外人", "Worrying someone will be treated as an outsider", "留出人人能参与的任务，也听听少数意见", "Offer tasks anyone can join and listen to minority views", "为了让大家一致而忽略有价值的异议", "Overlooking useful dissent for the sake of agreement"],
  innocent: ["天真者", "Innocent", "保存简单与希望", "Keeping things simple and hopeful", "担心事情失去可信的起点", "Worrying there is no trustworthy place to start", "找到最小可行步骤，再核对仍需处理的困难", "Find a small first step and check what difficulties remain", "为了恢复轻松而略过仍需解决的问题", "Moving back to a comfortable routine before addressing an unresolved issue"],
  rebel: ["反叛者", "Rebel", "挑战无谓的约束", "Challenging needless constraints", "担心旧规则压掉选择", "Worrying old rules will shut out alternatives", "指出具体代价，并给出一个可试的替代方案", "Name the actual cost and offer one alternative to try", "把仍有价值的惯例和无谓的规则一起推翻", "Discarding useful practices along with unnecessary rules"],
} as const;

const functions = {
  Ni: ["从零散线索推想一个可能走向", "Connect scattered clues into one likely direction"],
  Ne: ["从一个线索展开多种可能", "Generate multiple possibilities from one starting point"],
  Ti: ["检查定义和推论是否一致", "Check whether definitions and inferences are consistent"],
  Te: ["用可核对的标准推进决定", "Move decisions forward using verifiable criteria"],
  Fi: ["对照个人认同的价值与边界", "Check choices against personal values and boundaries"],
  Fe: ["根据共同约定与他人的反应调整做法", "Respond to shared expectations and other people's reactions"],
  Si: ["用具体经验和过去的细节作对照", "Compare the present with specific past experiences"],
  Se: ["随眼前可观察到的变化即时调整", "Adapt to observable changes in real time"],
} as const;

type Axis = { left: string; right: string; difference: number; lean: string | null };
type Candidate = { type: string; stack: string[]; fit: number };
type Projection = {
  scores: Record<string, number>;
  primary?: string[];
  secondary?: string[];
  near_leaders?: string[];
  axes?: Axis[];
  candidates?: Candidate[];
  stability?: string;
};

const own = (object: object, key: string) => Object.hasOwn(object, key);

export function JungResult({ scale, locale, payload }: { scale: string; locale: "zh" | "en"; payload: unknown }) {
  const zh = locale === "zh";
  const archetype = scale === "JUNG_ARCHETYPES";
  const expected = Object.keys(archetype ? archetypes : functions);
  const result = payload as Projection | undefined;
  if (!result?.scores || !expected.every((key) => typeof result.scores[key] === "number" && Number.isFinite(result.scores[key]) && result.scores[key] >= 0 && result.scores[key] <= 100)) {
    return <p role="status">{zh ? "当前无法读取报告，请刷新重试。" : "This report is unavailable. Refresh to try again."}</p>;
  }
  const name = (key: string) => archetype && own(archetypes, key) ? archetypes[key as keyof typeof archetypes][zh ? 0 : 1] : key;
  const role = (key: string) => own(functions, key) ? functions[key as keyof typeof functions][zh ? 0 : 1] : "";
  const ranked = [...expected].sort((a, b) => result.scores[b] - result.scores[a]);
  const primary = (result.primary ?? []).filter((key) => own(archetypes, key));
  const secondary = (result.secondary ?? []).filter((key) => own(archetypes, key));
  const scores = (score: number) => new Intl.NumberFormat(zh ? "zh-CN" : "en", { maximumFractionDigits: 1 }).format(score);
  const leader = result.candidates?.[0];

  return (
    <article className="mx-auto max-w-3xl space-y-8 py-8" data-result-visible-root>
      <h1 className="text-3xl font-semibold">{archetype
        ? (zh ? "荣格十二原型测评报告" : "Jungian Archetypes Report")
        : (zh ? "荣格八维认知功能测评报告" : "Jungian Cognitive Functions Report")}</h1>
      <section aria-labelledby="jung-scores">
        <h2 className="text-xl font-semibold" id="jung-scores">{zh ? "本次维度分布" : "Your score profile"}</h2>
        <p>{zh ? "每个维度独立换算为 0–100，分数反映本次自评，未使用人群常模。" : "Each dimension uses its own 0–100 scale. Scores reflect this self-report and use no population norms."}</p>
        <ul className="mt-4 grid gap-2">
          {ranked.map((key) => <li key={key} className="grid grid-cols-[minmax(5rem,9rem)_1fr_3rem] items-center gap-2">
            <span>{name(key)}</span>
            <meter className="w-full" min={0} max={100} value={result.scores[key]} aria-label={name(key)} />
            <span>{scores(result.scores[key])}</span>
          </li>)}
        </ul>
      </section>
      {archetype ? <>
        <section>
          <h2 className="text-xl font-semibold">{zh ? "主导与辅助原型" : "Primary and secondary archetypes"}</h2>
          {!primary.length ? <p>{zh ? "这次各维度很接近。可先比较具体情境。" : "Your scores are close together. Start by comparing specific situations."}</p> : <p>{primary.map(name).join(zh ? "、" : ", ")}{secondary.length ? " + " + secondary.map(name).join(zh ? "、" : ", ") : (primary.length > 1 ? (zh ? " 并列" : " (tied)") : "")}</p>}
          {(result.near_leaders?.length ?? 0) > 1 && <p>{zh ? "接近最高分" : "Near the highest score"} · {result.near_leaders?.map(name).join(zh ? "、" : ", ")}</p>}
          {primary.length === 1 && secondary.length > 0 && <p>{zh ? "回想一次共同任务：哪种动机让你开始，哪种帮助你继续？两者发生冲突时，你先照顾了什么？" : "Recall a shared task. Which motive got you started and which kept you involved? When they competed, which did you act on first?"}</p>}
        </section>
        {[...primary, ...secondary].map((key) => {
          const reading = archetypes[key as keyof typeof archetypes];
          return <section key={key} className="space-y-2">
            <h2 className="text-xl font-semibold">{name(key)}</h2>
            <p><strong>{zh ? "核心渴望" : "Core desire"}</strong> · {reading[zh ? 2 : 3]}</p>
            <p><strong>{zh ? "可能担心的事" : "Possible concern"}</strong> · {reading[zh ? 4 : 5]}</p>
            <p><strong>{zh ? "过度使用时的盲区" : "When overused"}</strong> · {reading[zh ? 8 : 9]}</p>
            <p><strong>{zh ? "团队协作建议" : "Working with a team"}</strong> · {reading[zh ? 6 : 7]}</p>
          </section>;
        })}
        <Link className="underline" href={`/${locale}/career/jobs/technical-writers`}>{zh ? "职业任务示例：技术写作者如何把复杂流程解释清楚" : "Example career tasks: how technical writers explain a complex process"}</Link>
      </> : <>
        <section>
          <h2 className="text-xl font-semibold">{zh ? "四组功能轴" : "Four function axes"}</h2>
          <ul>{result.axes?.map((axis) => <li key={axis.left}>{axis.left} / {axis.right} · {scores(axis.difference)} · {axis.lean ?? (zh ? "接近" : "Close")}</li>)}</ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold">{zh ? "功能栈候选" : "Type candidates by stack fit"}</h2>
          <p>{result.stability === "concentrated" ? (zh ? "在此模型下较集中" : "More concentrated in this model") : result.stability === "unstable" ? (zh ? "候选容易随小幅分数变化而改变" : "Small score changes could shift the candidates") : (zh ? "本次分布不足以给出候选" : "This score profile does not support a candidate list")}</p>
          <ol>{result.candidates?.map((candidate) => <li key={candidate.type}>{candidate.type} · {candidate.stack.join(" → ")}</li>)}</ol>
          {leader && result.stability === "concentrated" && <p>{zh ? "候选主导与辅助" : "Candidate dominant and auxiliary"} · {role(leader.stack[0])} · {role(leader.stack[1])}</p>}
          <p>{zh ? "先回忆两个具体决定，对照自己如何获取信息、怎样下判断，再看它与四组 MBTI 偏好哪些相符、哪些需要再观察。" : "Recall two decisions and consider how you gathered information and judged the options. Compare those examples with the four MBTI preference pairs."}</p>
          <Link href={`/${locale}/tests/mbti-personality-test-16-personality-types`}>{zh ? "查看 MBTI 四组偏好测评" : "Explore the four MBTI preference pairs"}</Link>
        </section>
        <section>
          <h2 className="text-xl font-semibold">{zh ? "压力下的情境自查" : "Reflecting on stressful situations"}</h2>
          <p>{zh ? "如果同一种做法反复卡住，回想当时忽略了什么原本可用的策略（Loop）。如果压力下的反应和平时明显不同，记下触发事件以及具体影响（Grip）。" : "If you got stuck repeating one approach, recall which normally available strategy you set aside (Loop). If your reaction under pressure differed from your usual response, note the trigger and its concrete impact (Grip)."}</p>
        </section>
      </>}
    </article>
  );
}
