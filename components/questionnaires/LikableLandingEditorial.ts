import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

export const likableLandingSummaries: Record<string, { zh: string; en: string }> = {
  "warmth": {
    "zh": "温暖侧重：回看留意感受、回应困难与让人适应的选择。核对对方想要陪伴还是空间；不把自报留意当作读心或他人已经感到被理解。",
    "en": "Warmth emphasis: revisit noticing feelings, responding to difficulty and allowing time to settle. Check whether company or space is wanted, without treating self-reported attention as mind-reading or proof of feeling understood."
  },
  "follow-through": {
    "zh": "兑现侧重：从说明范围、更新进度与落实下一步阅读本次计数。也保留及时说明做不到的情况；答应更多并非更可靠，完成情况仍需实际行动核对。",
    "en": "Follow-through emphasis: read choices about scope, progress updates and agreed next steps. Include acknowledging when something cannot be done. Accepting more is not greater reliability; actual completion still needs checking."
  },
  "lightness": {
    "zh": "轻松侧重：关注缓和拘谨、恢复活力与尊重边界的幽默。结合对方的反应判断是否合时宜，不要求你持续逗笑别人或回避严肃话题。",
    "en": "Lightness emphasis: examine easing reserve, restoring energy and boundary-respecting humour. Check timing through the other person’s response, without a duty to entertain continually or avoid serious topics."
  },
  "curiosity": {
    "zh": "好奇侧重：从细节、依据和愿意分享的范围继续了解。指南区分提问、理解与回应，保留不回答的空间；不由问题数量推断受欢迎程度。",
    "en": "Curiosity emphasis: explore details, reasons and what someone is willing to share. Distinguish asking, understanding and responding while leaving room not to answer, without using question counts to infer popularity."
  },
  "boundaries": {
    "zh": "边界侧重：阅读表达立场、说明限制、拒绝与允许暂停的选择。核对真实表达和对方选择空间能否同时保留，不把直率当作忽略影响的理由。",
    "en": "Boundaries emphasis: read choices about positions, limits, refusal and pauses. Check whether honest expression and another person’s choice can both remain, rather than using directness to excuse disregarding impact."
  },
  "warmth-follow-through": {
    "zh": "温暖与兑现并列：回应感受与落实安排在本次同为最高。可以核对怎样将“我听见了”变成双方确认的下一步，同时避免未经询问便接管对方事务。",
    "en": "Warmth and follow-through tie: responding to feelings and implementing agreements share the highest count. Explore a mutually confirmed next step after acknowledging someone, without taking over uninvited."
  },
  "warmth-lightness": {
    "zh": "温暖与轻松并列：留意感受和带来活力同为最高。区分需要陪伴的时刻与适合轻松表达的时刻，避免用玩笑替代对困难的回应。",
    "en": "Warmth and lightness tie: noticing feelings and adding energy lead together. Distinguish moments for company from moments for ease, without replacing acknowledgment of difficulty with a joke."
  },
  "warmth-curiosity": {
    "zh": "温暖与好奇并列：情绪回应和继续了解同为最高。核对追问是否接住了已说出的内容，也允许对方只想被听见而不想继续说明。",
    "en": "Warmth and curiosity tie: emotional acknowledgment and exploring further lead together. Check whether a question follows what was said, while allowing someone to be heard without explaining more."
  },
  "warmth-boundaries": {
    "zh": "温暖与边界并列：留意他人与说明限制同为最高。通过安静陪伴、拒绝和暂停的情境，探索关心与选择空间如何并存，而非用迎合证明善意。",
    "en": "Warmth and boundaries tie: noticing others and stating limits lead together. Explore care alongside choice through company, refusal and pauses, rather than proving goodwill through compliance."
  },
  "follow-through-lightness": {
    "zh": "兑现与轻松并列：完成约定和缓和紧绷同为最高。核对轻松表达是否帮助推进，还是遮住了需要直说的进度与变更。",
    "en": "Follow-through and lightness tie: agreements and easing tension share the lead. Check whether ease supports the task or obscures progress and changes that need a clear update."
  },
  "follow-through-curiosity": {
    "zh": "兑现与好奇并列：落实行动与了解依据同为最高。回看提问如何帮助澄清范围，以及何时需要结束讨论、确认下一步，避免把了解更多当成已经完成。",
    "en": "Follow-through and curiosity tie: action and exploring reasons lead together. Examine questions that clarify scope and when to confirm a next step, without equating further exploration with completion."
  },
  "follow-through-boundaries": {
    "zh": "兑现与边界并列：进展说明与真实限制同为最高。可以把可完成的部分、时间与不能承担的部分分开说清楚，保留重新协商约定的机会。",
    "en": "Follow-through and boundaries tie: progress and honest limits lead together. Clarify what can be done, when and what cannot be taken on, while retaining room to renegotiate."
  },
  "lightness-curiosity": {
    "zh": "轻松与好奇并列：带来活力和展开话题同为最高。核对新话题能否让双方参与，也留意对方是否更需要安静或结束交流。",
    "en": "Lightness and curiosity tie: energy and opening topics lead together. Check whether a new angle supports both people’s participation, while noticing a wish for quiet or an ending."
  },
  "lightness-boundaries": {
    "zh": "轻松与边界并列：缓和气氛与说明真实状态同为最高。阅读怎样在小尴尬时轻松承认限制，而不靠玩笑回避拒绝或强迫别人继续。",
    "en": "Lightness and boundaries tie: ease and honest expression lead together. Explore acknowledging a limit in an awkward moment without using humour to avoid refusal or press for continued interaction."
  },
  "curiosity-boundaries": {
    "zh": "好奇与边界并列：继续了解与尊重不说同为最高。核对提问前是否确认意愿，表达不同立场时能否留下差异，而非要求对方交代私人经历。",
    "en": "Curiosity and boundaries tie: exploring and respecting silence lead together. Check willingness before asking and allow differing views, without requiring someone to account for private experiences."
  },
  "warmth-follow-through-lightness": {
    "zh": "温暖、兑现与轻松并列：感受、约定和活力共同达到最高。可以从一次紧张的共同活动回看三者的顺序：先确认需要，再说明安排，最后判断轻松表达是否合适。",
    "en": "Warmth, follow-through and lightness tie: feelings, agreements and energy share the lead. Revisit their sequence in a tense shared activity: check needs, clarify plans and consider whether ease fits."
  },
  "warmth-follow-through-curiosity": {
    "zh": "温暖、兑现与好奇并列：回应、落实和了解共同达到最高。核对是否听清困难、问明范围并确认下一步；三项计数相同不表示三种行为在每个场景都一样多。",
    "en": "Warmth, follow-through and curiosity tie: acknowledgment, action and exploration share the lead. Check whether difficulty was heard, scope clarified and a next step confirmed; equal counts do not establish equal use everywhere."
  },
  "warmth-follow-through-boundaries": {
    "zh": "温暖、兑现与边界并列：关心、约定和限制共同达到最高。通过需要帮助的情境，区分愿意回应、实际能做和需要拒绝的部分，不以承担全部任务证明关心。",
    "en": "Warmth, follow-through and boundaries tie: care, agreements and limits lead together. Distinguish willingness, capacity and what needs declining when help is requested, without taking everything on to prove care."
  },
  "warmth-lightness-curiosity": {
    "zh": "温暖、轻松与好奇并列：感受、活力和展开交流共同达到最高。回看一个话题怎样被接住和继续，也检查是否留出了沉默与不解释的空间。",
    "en": "Warmth, lightness and curiosity tie: feelings, energy and exploration lead together. Revisit how a topic was received and extended, while checking room for silence and not explaining."
  },
  "warmth-lightness-boundaries": {
    "zh": "温暖、轻松与边界并列：照顾感受、缓和紧张与真实表达共同达到最高。可以核对一次疲惫交流中，陪伴、轻松和暂停分别是否出于双方意愿。",
    "en": "Warmth, lightness and boundaries tie: attention, ease and honesty lead together. In a tiring conversation, check whether company, lightness and a pause each matched both people’s wishes."
  },
  "warmth-curiosity-boundaries": {
    "zh": "温暖、好奇与边界并列：情绪回应、了解与选择空间共同达到最高。区分对方想谈什么、想被怎样回应，以及哪些内容愿意保留，不把理解变成追问到底。",
    "en": "Warmth, curiosity and boundaries tie: acknowledgment, exploration and choice lead together. Distinguish what someone wants to discuss, how to respond and what stays private, without turning understanding into persistent questioning."
  },
  "follow-through-lightness-curiosity": {
    "zh": "兑现、轻松与好奇并列：任务、活力和新角度共同达到最高。回看讨论是否既有参与空间，也有明确收束；轻松讨论本身不代表约定已落实。",
    "en": "Follow-through, lightness and curiosity tie: tasks, energy and new angles lead together. Check for room to participate and a clear conclusion; an enjoyable discussion does not establish that an agreement was implemented."
  },
  "follow-through-lightness-boundaries": {
    "zh": "兑现、轻松与边界并列：安排、缓和与限制共同达到最高。核对计划变化时能否同时说清事实、承认不便并保留调整机会，不用气氛好来掩盖不确定。",
    "en": "Follow-through, lightness and boundaries tie: plans, ease and limits lead together. When plans change, clarify facts, acknowledge inconvenience and leave room to adjust rather than hiding uncertainty behind a pleasant tone."
  },
  "follow-through-curiosity-boundaries": {
    "zh": "兑现、好奇与边界并列：行动依据、约定与真实限制共同达到最高。可以检查请求是否问清、责任是否确认、拒绝是否可行，避免把澄清当作默认答应。",
    "en": "Follow-through, curiosity and boundaries tie: reasons, agreements and limits lead together. Check whether a request was clarified, responsibility confirmed and refusal possible; clarification is not automatic acceptance."
  },
  "lightness-curiosity-boundaries": {
    "zh": "轻松、好奇与边界并列：活跃交流、继续了解与允许暂停共同达到最高。阅读怎样邀请而不催促、提问而不越界，并在兴趣或精力改变时结束话题。",
    "en": "Lightness, curiosity and boundaries tie: energy, exploration and pauses lead together. Explore inviting without pushing, asking without intruding and ending a topic when interest or energy changes."
  },
  "follow-through-lightness-curiosity-boundaries": {
    "zh": "兑现、轻松、好奇与边界四项并列：四种入口共同最高，温暖相对少选。少选温暖不证明缺少关心；请回看实际取舍，再核对约定、讨论与余量。",
    "en": "Follow-through, lightness, curiosity and boundaries tie: four approaches lead, with warmth less selected. That does not establish a lack of care. Revisit actual tradeoffs, agreements, discussion and capacity."
  },
  "warmth-lightness-curiosity-boundaries": {
    "zh": "温暖、轻松、好奇与边界四项并列：互动感受与交流入口共同最高，兑现相对少选。它不证明不守约；可以另看真实约定的进展，避免把题组排序当作履约评价。",
    "en": "Warmth, lightness, curiosity and boundaries tie: four approaches lead, with follow-through less selected. That does not establish broken promises. Check real agreements separately rather than treating a question-set ranking as a performance judgment."
  },
  "warmth-follow-through-curiosity-boundaries": {
    "zh": "温暖、兑现、好奇与边界四项并列：关心、行动、了解和限制共同最高，轻松相对少选。无需据此练习表演幽默；可核对当时是否更需要认真、安静或明确安排。",
    "en": "Warmth, follow-through, curiosity and boundaries tie: care, action, exploration and limits lead, with lightness less selected. There is no duty to perform humour; check whether seriousness, quiet or clear planning better fitted the moment."
  },
  "warmth-follow-through-lightness-boundaries": {
    "zh": "温暖、兑现、轻松与边界四项并列：四种做法共同最高，好奇相对少选。少追问不等于不感兴趣；可以核对是否已有足够信息，以及对方是否希望继续展开。",
    "en": "Warmth, follow-through, lightness and boundaries tie: four approaches lead, with curiosity less selected. Fewer questions do not establish disinterest. Check whether enough information was available and whether further discussion was wanted."
  },
  "warmth-follow-through-lightness-curiosity": {
    "zh": "温暖、兑现、轻松与好奇四项并列：四种做法共同最高，边界相对少选。它不证明没有边界；请回看表达限制、拒绝和暂停在实际互动中是否可行。",
    "en": "Warmth, follow-through, lightness and curiosity tie: four approaches lead, with boundaries less selected. That does not establish absent boundaries. Revisit whether stating limits, declining and pausing were possible in the actual interaction."
  },
  "all-five-tied": {
    "zh": "五项全部并列：五方向各4次，总和20，没有唯一顶部。它表示这组配对中的计数相同，不证明全面均衡或完美社交；指南帮助从具体答案寻找情境和顺序上的差异。",
    "en": "All five tie: each direction has four counts, totalling twenty without a sole leader. Equal counts in these pairs do not establish complete balance or perfect social skill. Use specific answers to explore differences in context and sequence."
  }
};

export function likableLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return likableLandingSummaries[profile.id]?.[locale] ?? profile.summary[locale];
}

export function likableCurrentEntryCopy(text: string, locale: "zh" | "en") {
  return locale === "zh"
    ? text
      .replace("直接开始、完整免费与可选草稿", "直接开始、完整免费与隐私")
      .replace("默认不保存，只有主动保存才提供本标签页24小时内恢复；完成、清除或重测即删除。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("默认不保存，答案在浏览器内计分。只有主动保存的本标签页草稿才可在24小时内恢复，完成、清除或重测即删除。", "答案在浏览器内计分。这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
    : text
      .replace("Direct start, full free access and optional drafts", "Direct start, full free access and privacy")
      .replace("Saving is off by default; an explicitly saved tab draft can be restored within twenty-four hours and is deleted on completion, clearing or retake.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Saving is off by default and answers are scored in the browser. Only an explicitly saved tab draft is restorable within twenty-four hours and it is deleted on completion, clearing or retake.", "Answers are scored in the browser. This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.");
}
