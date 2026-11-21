"use client";

import { useState } from "react";

const prompts = [
  {
    key: "career",
    title: "职业探索：分清喜欢、擅长与值得投入",
    description: "适合在选岗位、考虑转型，或工作做得不错却越来越累时使用。",
    text: `我在费马测试中的结果是 ISFJ-A。请把它当作自我探索的线索，不要据此判定我适合某个职业。
我想讨论的岗位或工作困扰是：[填写]。
最近一件让我有成就感的任务是：[填写实际做了什么、结果和感受]；一件让我疲惫的任务是：[填写]。
请先问我 3 个问题，区分任务兴趣、已有技能、工作环境和现实约束，等我回答后再分析。请找出至少一种与类型描述不一致的解释，不要把责任重、资源少的问题都归因于性格。
最后比较两个可探索方向，分别列出吸引我的任务、需要补充的证据、现实成本，以及一次低成本试做。说明试做后观察什么，才能决定继续还是调整。`,
  },
  {
    key: "growth",
    title: "个人成长：把一个反复卡住的问题变成练习",
    description: "适合总答应后后悔、迟迟不开始，或付出很多却缺少进展时使用。",
    text: `我的测试结果是 ISFJ-A，但请优先依据我的具体经历来分析。
我反复卡住的问题是：[填写]。最近一次发生在：[填写当时的任务、他人要求、我的想法、行动与后果]。
请先问我 3 个澄清问题，等我回答后，区分事实、我的解释，以及仍不清楚的部分。一起检查：我是否有选择空间、是否缺少技能或资源、是否担心影响关系。不要默认这些原因都存在。
请帮我选一个目前最能改变的小环节，设计一周内可尝试的练习：触发情境、具体动作、所需时间、可能障碍与简化方案。只选一个练习，并约定怎样观察它是否有帮助；如果没有帮助，下一步该修改哪项假设。`,
  },
  {
    key: "relationships",
    title: "关系沟通：把委屈说成对方能回应的请求",
    description: "适合默默付出、难以拒绝，或同一件事谈了多次仍没有改变时使用。",
    text: `我的测试结果是 ISFJ-A。请不要给对方判型、猜测动机，或仅凭我的叙述替我们决定关系去留。
最近一次摩擦是：[填写双方具体说了什么、做了什么]。我的感受是：[填写]；我希望改变的是：[填写]；我已经表达过的请求及对方回应是：[填写]。
请先问我 3 个问题，等我回答后，区分未说清的期待、双方真实分歧和已经说清但未被尊重的边界，并指出目前证据不足的地方。
帮我写一段自然的沟通表达，包含具体事实、我的感受与需要、一个可执行的请求、可协商范围和我的限制。再列出双方各自可以承担的一步，以及之后如何核对实际变化。不要把维系关系的责任全部交给我，也不要建议我靠更多付出来换取回应。`,
  },
];

function PromptCard({ prompt, open }: { prompt: typeof prompts[number]; open: boolean }) {
  const [status, setStatus] = useState("");
  const [copying, setCopying] = useState(false);
  async function copy() {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(prompt.text);
      setStatus("已复制。粘贴到你使用的 AI 中，补全方括号里的经历即可。");
    } catch {
      setStatus("未能自动复制，请选中下方提示词后手动复制。");
    } finally {
      setCopying(false);
    }
  }
  return <details open={open} className="border-t border-[#dce5e0] py-5">
    <summary className="cursor-pointer text-base font-semibold text-[#203d31]">{prompt.title}</summary>
    <p className="mb-3 mt-3 text-sm leading-7 text-[#66716b]">{prompt.description}</p>
    <textarea aria-label={`${prompt.title}提示词`} readOnly value={prompt.text} rows={8} className="block w-full resize-y rounded-xl border border-[#dce5e0] bg-[#f6f9f7] p-4 text-sm leading-7 text-[#3e5148] focus:outline-emerald-700" />
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button type="button" disabled={copying} onClick={copy} className="rounded-full bg-[#247858] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">{copying ? "正在复制…" : "复制提示词"}<span className="sr-only">：{prompt.title}</span></button>
      <p role="status" className="m-0 text-sm text-[#466253]">{status}</p>
    </div>
  </details>;
}

export function ResultEvidenceAndPrompts() {
  return <div className="space-y-8" data-testid="mbti-evidence-and-prompts">
    <section aria-labelledby="mbti-science-title" className="rounded-xl bg-white p-5 md:p-7">
      <h2 id="mbti-science-title" className="mb-3 text-2xl font-semibold text-[#203d31]">科学依据：怎样理解这份结果</h2>
      <p className="mb-6 text-sm leading-7 text-[#66716b]">框架说明帮助你理解描述，心理学研究帮助你思考行动。它们回答的问题不同，阅读时可以分开看。</p>
      <div className="space-y-5 text-sm leading-7 text-[#56645c]">
        <article className="border-t border-[#dce5e0] pt-5">
          <h3 className="mb-2 text-base font-semibold text-[#203d31]">类型描述的是偏好，能力需要另找证据</h3>
          <p>Myers-Briggs 框架将偏好视为常用的理解与行动方式。人也可以采用另一侧的方式；类型不能代替技能评价或招聘判断。本页的职业建议适合作为探索起点，是否适合仍要看实际任务、兴趣、能力和工作条件。</p>
          <a className="text-[#247858] underline underline-offset-4" href="https://www.myersbriggs.org/unique-features-of-myers-briggs/ethical-use-of-the-mbti/" target="_blank" rel="noopener noreferrer">来源：Myers & Briggs Foundation · Ethical Use（英文）</a>
        </article>
        <article className="border-t border-[#dce5e0] pt-5">
          <h3 className="mb-2 text-base font-semibold text-[#203d31]">A/T 有独立来源，不能读成心理健康等级</h3>
          <p>A/T 术语来自 16Personalities 的 NERIS 框架，讨论自我确信、自我评价和压力反应等差异，不属于原始 MBTI 四组偏好。A 不代表更优秀，T 也不是心理诊断；这一后缀不能说明你是否擅长某项工作。</p>
          <a className="text-[#247858] underline underline-offset-4" href="https://www.16personalities.com/articles/our-theory#identity" target="_blank" rel="noopener noreferrer">来源：16Personalities · Our Framework / Identity（英文）</a>
        </article>
        <article className="border-t border-[#dce5e0] pt-5">
          <h3 className="mb-2 text-base font-semibold text-[#203d31]">成长建议也要看环境，不能只要求自己更努力</h3>
          <p>自我决定理论研究自主、胜任和联结需要与动机、幸福感的关系。它提供了三个实用的检查方向：这件事是否出于自己的认同，是否有能力和资源推进，是否能感到被支持。这是一般性的研究视角，并非 ISFJ 专属规律，也不能保证某个练习对你一定有效。</p>
          <a className="text-[#247858] underline underline-offset-4" href="https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf" target="_blank" rel="noopener noreferrer">研究：Ryan & Deci（2000）· Self-Determination Theory（英文 PDF）</a>
        </article>
      </div>
      <p className="mb-0 mt-6 rounded-xl bg-[#eef5f0] p-4 text-sm leading-7 text-[#466253]">这些来源解释框架与一般研究，不等于费马题本、分数或个体建议已获得同样的验证。检验一条描述时，可以找一个符合的经历，再找一个不符合的经历：两者之间的情境差异，往往比类型标签更值得讨论。</p>
    </section>
    <section aria-labelledby="mbti-ai-title" className="rounded-xl bg-white p-5 md:p-7">
      <h2 id="mbti-ai-title" className="mb-3 text-2xl font-semibold text-[#203d31]">和 AI 聊聊：从结果走向自己的问题</h2>
      <p className="mb-5 text-sm leading-7 text-[#66716b]">选择一个当前最想解决的问题，复制提示词并补全经历。模板会请 AI 先提问、再分析，帮助你检验描述，形成一个可尝试的下一步。</p>
      {prompts.map((prompt, index) => <PromptCard key={prompt.key} prompt={prompt} open={index === 0} />)}
      <p className="mb-0 mt-3 text-sm leading-7 text-[#66716b]">这里仅复制文字，不会自动把报告发送给 AI。填写时可隐去姓名、公司及他人隐私；AI 的解释仍需与你的事实核对。</p>
    </section>
  </div>;
}
