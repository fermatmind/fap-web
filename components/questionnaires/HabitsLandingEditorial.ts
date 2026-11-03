import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Entry context; original items, scoring and source-bound guides remain unchanged. */
export const habitsLandingSections: QuestionnaireSection[] = [
  {
    "id": "habits-specific-practices",
    "title": {
      "zh": "五类互动做法：分别观察什么，容易混淆什么",
      "en": "Five interaction practices: what each concerns and what it can be confused with"
    },
    "paragraphs": [
      {
        "zh": "未核对就转述关注消息来源、猜测标记、分享许可与纠正后的更新。例如把“可能换时间”传成“已经取消”，可以核对原话并向原来听到的人更新。它与经过核实的必要提醒不同；转述次数本身不能说明是否造成伤害，也不要求你公开他人的隐私来证明自己。",
        "en": "Retelling Before Checking concerns sources, marking guesses, permission to share and updating a corrected account. For example, if “the time may change” became “it is cancelled,” check the original and update those who heard your version. This differs from a necessary, checked warning. Retelling alone establishes no actual harm and does not require exposing someone else’s private information as proof."
      },
      {
        "zh": "把话题转向比较关注回应他人的经历时，是否先变成谁更难、谁更强。分享相似经历有时能建立联系；若对方正在庆祝一件事，可先问具体进展，之后再确认是否想听你的经验。这里观察谈话怎样转向，不从比较推断嫉妒、自卑或共情能力。",
        "en": "Turning Updates into Comparisons concerns shifting someone’s experience into who had it harder or did better. Sharing a similar experience can create connection. When someone is celebrating, one option is to ask about their progress first, then check whether they want your experience. The topic is the conversational turn, without inferring jealousy, low self-worth or empathy ability."
      },
      {
        "zh": "让异议留在暗示里关注希望对方猜出需要改变哪部分；被质疑时先说明立场关注回应影响之前先补充自己的理由。前者可尝试把“你看着办”改为“时间我不方便，地点可以”；后者可先问“你指的是哪一步造成了什么影响？”再说明背景。含蓄、沉默与解释都有合理用途，表达方式也受安全、文化、权力和语言条件影响。",
        "en": "Leaving Objections in Hints concerns expecting someone to infer what should change. Explaining Your Position First concerns adding reasons before examining the impact raised. One possible alternative to “you decide” is “the time does not work for me, but the location does.” For the other practice, ask which step had which effect before adding context. Indirectness, silence and explanation can all be appropriate, depending on safety, culture, power and language."
      },
      {
        "zh": "把旧争议带进新问题关注将已处理或不相关的争议加入当前话题。旧问题仍未解决、承诺未兑现或同一情况再次发生时，回顾历史可能是必要证据；不能因为题目提到“旧争议”就认定事情已经解决。可以先区分当前事实与仍待处理的旧问题，再决定分开谈还是一起谈。",
        "en": "Carrying Old Disputes Forward concerns bringing settled or unrelated disputes into a current issue. History may be necessary evidence when a problem remains unresolved, a promise is unfulfilled or the same event recurs. A question mentioning an old dispute cannot establish that it was resolved. Distinguish current facts from unfinished issues before deciding whether to discuss them separately or together."
      }
    ]
  },
  {
    "id": "habits-exact-example",
    "title": {
      "zh": "五部分怎样算分？2.25来自原始和，不从四舍五入倒推",
      "en": "How are the five parts scored? 2.25 comes from the raw sum, not rounded reconstruction"
    },
    "paragraphs": [
      {
        "zh": "20条分成五组，每组四条，全部正向计分，没有反向题。一组四个数值为1、2、3、3时，原始和9，报告显示9÷4=2.25/5；不把通用中间值2.3再当成原始均分。显示两位小数是计算格式，不证明评分间距完全相等，也不代表测量精度已经达到百分之一。",
        "en": "Twenty items form five parts of four. All are directly keyed, with no reversals. Ratings of 1, 2, 3, 3 give a raw sum of 9 and a displayed mean of 9÷4=2.25/5; the report does not reconstruct it from a generic rounded value of 2.3. Two decimal places are a calculation format, not evidence of equally spaced responses or hundredth-unit measurement precision."
      },
      {
        "zh": "另一组为4、4、4、不适用时，有效数值只有三条，该组显示资料不足；其余四组照各自完整度计算。全部20条选不适用仍可结束作答并阅读五份全文，只是没有个人均分。完成题目与获得足够评分是两件事，不会用其他组答案、平均数或所谓理想值补齐缺答。",
        "en": "With 4, 4, 4,NA in another part, only three items are numerically rated, so that part shows insufficient information. Other parts use their own completeness. Selecting NA for all twenty still finishes the attempt and leaves five full guides available, without personal means. Completing selections and supplying enough ratings are different conditions; missing entries are not filled from other parts, averages or ideal values."
      }
    ]
  },
  {
    "id": "habits-uncertainty",
    "title": {
      "zh": "符合度、不确定与不适用：同一个均分也可能来自不同回答",
      "en": "Accuracy, uncertainty and NA: equal means can hide different responses"
    },
    "paragraphs": [
      {
        "zh": "选项描述与你自述做法的符合程度，不是过去三个月发生次数。3表示不确定或视情况，仍作为数值3参与计算；单独的不适用选项则不参与均分。四条都选3，与1、1、5、5都可得到3.00，但前者可能表示情境依赖，后者表示条目之间差别较大，不能写成同一种“中等毒性”。",
        "en": "Options rate how accurately the statements describe your account, not how often an event occurred. Three is valid numerical uncertainty or conditionality; the separate NA option is excluded. Four ratings of 3 and ratings of 1, 1, 5, 5 both yield 3.00. The former may express context dependence, while the latter differs across items. Neither is a “moderate toxicity” category."
      },
      {
        "zh": "较高均分只表示你对该组四种描述给出了较高符合度；较低均分也不证明一个人值得信任、没有伤害行为或关系安全。回忆范围、题意理解、是否遇到相应场景和愿不愿意披露都可能影响回答。先核对具体条目和一个实际例子，再考虑是否有可调整的行动，比比较五项谁最高更有用。",
        "en": "A higher mean means higher stated accuracy for those four descriptions. A lower mean does not establish trustworthiness, absence of harmful conduct or relationship safety. Recall, interpretation, exposure to a situation and willingness to disclose can affect answers. Check the items against a specific example before considering an adjustment, rather than finding the highest of the five parts."
      }
    ]
  },
  {
    "id": "habits-evidence",
    "title": {
      "zh": "研究可以说明什么？道歉实验与这份原创问卷的证据不同",
      "en": "What can research support? Apology experiments and this original questionnaire need different evidence"
    },
    "paragraphs": [
      {
        "zh": "Lewicki、Polin与Lount（2016）在两项研究中，比较道歉组成及信任受损情境下的评价；组成不同与违规情境不同，道歉的被评价效果也不同。[1] 这提示说明理由、承认问题与后续行动应结合具体事件讨论，不能假设一句固定措辞就能解决所有分歧。",
        "en": "Lewicki, Polin and Lount’s 2016 two-study research compared apology components and evaluations under trust-violation scenarios. Perceived effectiveness differed by components and violation context.[1] Reasons, acknowledgement and follow-up therefore deserve context-specific consideration rather than assuming one fixed sentence resolves every disagreement."
      },
      {
        "zh": "这项外部研究没有验证本站20条题目、五组结构、评分阈值或某种修复建议的个人效果。本站是16条新编双语题加四条自有中文条目及新英文译文的原创自评，尚未建立本题本信度、效度、常模或中英文测量等价性。透明算分、双语完整解释与心理测量验证是不同工作，不能相互替代。",
        "en": "That study validates neither these twenty items, the five-part structure, score thresholds nor an individual outcome from a suggested repair. This original self-reflection form contains sixteen new bilingual items plus four owned Chinese items with new English translations. Form-specific reliability, validity, norms and English–Chinese measurement equivalence are not established. Transparent calculation, complete bilingual explanations and psychometric validation are distinct tasks."
      }
    ]
  },
  {
    "id": "habits-repair-review",
    "title": {
      "zh": "把结果用于一次互动复盘：事实、回应与后续核对",
      "en": "Use the result to review one interaction: facts, response and follow-up"
    },
    "paragraphs": [
      {
        "zh": "选一个低风险、自己愿意回顾的事件，不必向网站提交细节。例如发现自己转述的时间安排有误，可以先核对原消息，向同一批听者说明原话与更正，再确认是否有人据此改变了安排。这里记录“我说了什么、现在知道什么、还需更新谁”，而不是写“我就是传播谣言的人”。",
        "en": "Choose a low-stakes event you are comfortable reviewing, without submitting its details. If you passed on an incorrect schedule, check the original message, tell the same listeners what was said and what is corrected, then check whether anyone changed plans because of it. Record what you said, what you now know and who needs an update, rather than assigning yourself an identity label."
      },
      {
        "zh": "若涉及自己的遗漏，可在听清具体影响后说明背景、确认自己能负责的部分，并提出可实行的调整，例如补发资料或明确下一次通知方式。对方可以暂时不回应，也不必接受道歉或恢复信任；一次表达的效果要看后续行为和反馈。这些是可选的复盘提示，不是问卷已经证实有效的干预方案。",
        "en": "For an omission, you might first hear the specific impact, then explain context, acknowledge what you can take responsibility for and propose a feasible change, such as sending missing material or agreeing how to notify people next time. The other person can defer responding and need not accept an apology or restore trust. Outcomes require later behaviour and feedback. These are optional reflection prompts, not an intervention validated by the questionnaire."
      }
    ]
  },
  {
    "id": "habits-context-boundaries",
    "title": {
      "zh": "反例与情境边界：解释、拒绝与回顾历史也可能合理",
      "en": "Counterexamples and context: explanation, refusal and revisiting history can be reasonable"
    },
    "paragraphs": [
      {
        "zh": "被误解时说明事实，保护不宜分享的信息，用委婉方式避免不必要冲突，或对尚未解决的问题再次提出要求，都不能仅凭措辞归为有毒。本卷只问你自己的做法，缺少他人观点、互动先后和实际后果，不能裁定谁有责任，也不能把自己的一项评分强加给伴侣、同事或朋友。",
        "en": "Explaining a misunderstanding, protecting information, using indirect wording to avoid unnecessary conflict or raising an unresolved issue again cannot be classified as toxic from wording alone. This form asks about your own account without the other person’s perspective, event sequence or actual consequences. It cannot assign responsibility or transfer your rating onto a partner, colleague or friend."
      },
      {
        "zh": "如果互动缺少安全与选择余地，没有义务为了“改善分数”去当面对质、暴露隐私、道歉或继续联系。普通互动中的沟通尝试不应被套用成任何处境下都要更直接。是否参与、暂停或结束讨论，应结合实际条件和自己的边界；本卷也不负责评估危险或作临床判断。",
        "en": "Where safety or freedom to choose is absent, there is no obligation to confront someone, disclose private information, apologise or stay in contact to improve a score. A communication experiment for ordinary interactions is not a requirement to be more direct in every situation. Participation, pauses and ending a discussion depend on circumstances and boundaries; this quiz assesses neither danger nor clinical conditions."
      }
    ]
  },
  {
    "id": "habits-related-retest",
    "title": {
      "zh": "与其他测试有什么区别？重测怎样联系真实改变",
      "en": "How does this differ from other tests, and how should retakes relate to real change?"
    },
    "paragraphs": [
      {
        "zh": "五类互动主题不等于大五人格、黑暗特质、情商、依恋风格或有毒积极心态；相近的日常词语不代表相同构念、题本与计分。五份指南可以一起阅读，但没有总毒性分数、最有毒类型或善恶排名，也不能通过一项均分换算其他测试结果。",
        "en": "These five interaction topics are not Big Five traits, dark traits, emotional intelligence, attachment style or toxic positivity. Similar everyday terms do not establish the same construct, questionnaire or scoring. The five guides can be read together without a total toxicity score, a most-toxic type, a moral ranking or conversion into another test’s result."
      },
      {
        "zh": "重测时可先回看同一条目和相近情境下的例子，再比较是否真的改变了某个具体做法。一次均分下降可能来自情境、理解、缺答或回忆变化，不能直接证明人格改善或干预有效。本版也没有重测误差或有意义变化阈值，保留原始回答的差异比追求更好看的数字更有解释价值。",
        "en": "On a retake, compare the same item and similar situations before asking whether a practice changed. A lower mean could reflect context, interpretation, missingness or recall rather than personality improvement or an intervention effect. This edition has no established retest error or meaningful-change threshold. Differences between actual responses are more informative than seeking a better-looking number."
      }
    ]
  }
];

export const habitsLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "这份有毒特征测试具体观察哪五部分？",
      "en": "Which five parts does this Toxic Trait Test cover?"
    },
    "answer": {
      "zh": "未核对就转述、把话题转向比较、让异议留在暗示里、被质疑时先说明立场、把旧争议带进新问题。每部分四条，分别回看具体互动，不合并成某种人格身份。",
      "en": "Retelling before checking, turning updates into comparisons, leaving objections in hints, explaining your position first and carrying old disputes forward. Each has four items reflecting specific interactions, without combining them into a personality identity."
    }
  },
  {
    "question": {
      "zh": "五部分可以相加，找出我最有毒的地方吗？",
      "en": "Can I add the parts or identify my most toxic trait?"
    },
    "answer": {
      "zh": "本版没有这种计分。五项独立阅读，不相加、不排名。均分反映四种描述的自述符合度，没有比较五类实际伤害或风险大小。",
      "en": "This edition has no such scoring. Read five independent parts without adding or ranking them. Means reflect stated accuracy for four descriptions, without comparing actual harm or risk between topics."
    }
  },
  {
    "question": {
      "zh": "1、2、3、3为什么显示2.25，不是2.3？",
      "en": "Why do 1, 2, 3, 3 display 2.25 rather than 2.3?"
    },
    "answer": {
      "zh": "报告直接把原始和9除以四个有效评分，显示2.25/5。两位小数是格式，不是精度或统计显著性的证据，也不从已经四舍五入的一位均值倒推。",
      "en": "The report divides raw sum 9 by four valid ratings, displaying 2.25/5. Two decimals are a format, not evidence of precision or statistical significance, and are not reconstructed from a rounded one-decimal value."
    }
  },
  {
    "question": {
      "zh": "有一题不适用，会影响其他部分吗？",
      "en": "Does one NA response affect the other parts?"
    },
    "answer": {
      "zh": "只影响所在部分。该部分四条未全有数值时显示资料不足，其他部分各自计算。五份完整指南都保留，不用其他题或其他组补齐。",
      "en": "Only its own part. A part without four numeric ratings shows insufficient information; others use their own ratings. All five full guides remain available, without imputing from other items or parts."
    }
  },
  {
    "question": {
      "zh": "20条全选不适用，还能看到完整结果吗？",
      "en": "Can I finish and read the guides if all twenty responses are NA?"
    },
    "answer": {
      "zh": "可以。作答已完成，五部分均无个人均分，但五份九节完整指南仍可阅读；不把缺答记成零分、平均分或“没有问题”。",
      "en": "Yes. The attempt finishes without personal means for any part, while all five nine-section guides remain readable. Missing information is not zero, an average score or evidence that there is no problem."
    }
  },
  {
    "question": {
      "zh": "沉默、委婉、解释或拒绝，是不是都该改掉？",
      "en": "Should I stop being silent, indirect, explanatory or refusing?"
    },
    "answer": {
      "zh": "不能一概而论。这些做法可能保护隐私、安全或合理边界；先看具体情境与影响。本卷不要求对质、持续联系或用道歉换取更低分。",
      "en": "No blanket change follows. These practices can protect privacy, safety or reasonable boundaries. Consider the situation and impact. This form requires neither confrontation nor continued contact or apologies to obtain a lower score."
    }
  },
  {
    "question": {
      "zh": "旧问题还没解决，重新提起算翻旧账吗？",
      "en": "Is raising an unresolved old issue automatically carrying a grudge?"
    },
    "answer": {
      "zh": "不是。仍未履行的约定或重复发生的问题可能需要回顾历史。本部分关注已处理或不相关争议怎样进入当前话题，不能替你认定事情已经解决。",
      "en": "No. Unfulfilled agreements or recurring problems may require history. This part concerns settled or unrelated disputes entering a current topic, without deciding for you that an issue was resolved."
    }
  },
  {
    "question": {
      "zh": "较低分能证明关系安全，较高分能证明造成了伤害吗？",
      "en": "Can a low mean establish safety or a high mean establish actual harm?"
    },
    "answer": {
      "zh": "都不能。本卷只有本人自述，缺少事件、他人视角与实际后果证据；不能用分数裁定责任、诊断、风险或为任何关系作保证。",
      "en": "Neither follows. Self-report lacks event evidence, others’ perspectives and actual outcomes. Scores cannot assign responsibility, diagnosis or risk, or guarantee anything about a relationship."
    }
  },
  {
    "question": {
      "zh": "看完结果后，怎样选择一个可行的小调整？",
      "en": "How can I choose one feasible adjustment after reading the result?"
    },
    "answer": {
      "zh": "先选一个自己愿意回顾的普通事件，核对事实和影响，再决定能做什么。例如更正先前转述的信息，之后确认听者是否收到。道歉研究关注组成与情境下的评价，不保证一次表达能恢复信任。[1]",
      "en": "Review an ordinary event you choose, check facts and impact, then decide what is feasible. For example, correct information you passed on and check that listeners received it. Apology research examines components and contextual evaluations, without guaranteeing restored trust from one statement.[1]"
    }
  },
  {
    "question": {
      "zh": "点击开始后需要再次同意、注册或付费吗？",
      "en": "Does Start require another agreement, signup or payment?"
    },
    "answer": {
      "zh": "不需要，直接进入20条题目。题目、独立均分及五份全文免费，不收邮箱；临时保存须主动开启，完成、退出清除或重测会删除进度。",
      "en": "No. Start opens the twenty items directly. Questions, separate means and all five full guides are free without an email. Temporary saving is opt-in; completion, clearing on exit or retaking removes progress."
    }
  }
];
