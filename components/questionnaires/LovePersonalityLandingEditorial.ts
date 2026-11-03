import type { Questionnaire } from "@/lib/questionnaires/types";

export const lovePersonalityLandingSections: Questionnaire["guide"] = [
  {
    "id": "love-four-entry-model",
    "title": {
      "zh": "恋爱人格测试测什么？四种互动入口与本次选择",
      "en": "What does the Love Personality Test explore? Four entries into interaction"
    },
    "paragraphs": [
      {
        "zh": "想说出需要、听清回应、调整联系节奏，或处理一次分歧时，你更自然先做什么？本页用24道原创成对选择，比较清楚表达、留意回应、调节靠近与空间、参与分歧修复四种入口。名称方便回看具体做法；测试不把人分成固定恋爱人格，也不观察你的真实对话表现。",
        "en": "When you want to express a need, understand a response, adjust contact or address disagreement, what feels like a more natural starting point? Twenty-four original paired choices compare Clear Expression, Attuned Response, Space Regulation and Repair Engagement. These names help describe offered actions. They neither assign a fixed love personality nor observe your actual conversations."
      },
      {
        "zh": "请选择你愿意回看的普通关系情境，比较两项中当前更贴近自己的做法，不必证明自己总是如此。两种做法可能都重要；二选一只记录这一题的相对取舍。无需伴侣共同作答、聊天记录或联系方式；不想回答某个情境时，可以结束作答并独立阅读全部指南。",
        "en": "Use ordinary relationship situations you are comfortable reflecting on and choose the response closer to you now. Both actions may matter; a paired choice records only that item’s relative preference. No partner participation, chat history or contact details are required. If a situation is not something you want to answer, stop and read every public guide independently."
      }
    ]
  },
  {
    "id": "love-speaking-listening",
    "title": {
      "zh": "清楚表达与留意回应：信息怎样进入对话？",
      "en": "Clear Expression and Attuned Response: bringing information into a conversation"
    },
    "paragraphs": [
      {
        "zh": "清楚表达关注把观察、感受、需要或安排说出来。新例：原定通话临时取消，可以说“我原本留了这段时间，想确认之后怎样安排”。这句话让需要更具体，但不使对方必须接受，也不证明表达者更坦诚或更会沟通；仍要核对对方是否愿意谈、怎样理解。",
        "en": "Clear Expression concerns putting observations, feelings, needs or arrangements into words. Fresh example: after a planned call is cancelled, you might say, “I kept this time free and would like to clarify our next arrangement.” The request becomes concrete without obliging agreement or proving superior honesty or communication skill. Willingness to talk and actual understanding still need checking."
      },
      {
        "zh": "留意回应关注先听、核对含义与确认当下意愿。在同一情境中，可以先问“你现在想说明情况，还是另找时间？”提问不等于已经理解，沉默也不能自动解释成拒绝或不在意。留意对方的同时，自己的需要同样可以说出；本项次数不评定同理心、善良或读心能力。",
        "en": "Attuned Response concerns listening, checking meaning and asking about current willingness. In the same scene, you might ask, “Would you like to explain now, or choose another time?” Asking does not establish understanding; silence does not automatically mean rejection or indifference. Your own needs can also be expressed. This count rates neither empathy, kindness nor mind-reading."
      }
    ]
  },
  {
    "id": "love-space-repair",
    "title": {
      "zh": "调节空间与参与修复：时机和下一步是两个问题",
      "en": "Space Regulation and Repair Engagement: timing and a next step are different questions"
    },
    "paragraphs": [
      {
        "zh": "调节靠近与空间关注联系强度、独处和暂停的时机。比如一次讨论已超出自己当下余量，可以先减少交流，并在愿意且可行时说明是否计划再联系。暂停不自动等于回避型依恋，也不保证双方会平静；本页没有固定的最佳独处时长，具体安排仍需双方明确沟通。",
        "en": "Space Regulation concerns contact intensity, time alone and possible pauses. When a discussion exceeds your available capacity, you might reduce interaction and, if wanted and feasible, explain whether you intend to reconnect. A pause neither establishes avoidant attachment nor guarantees calm. This page prescribes no optimal time alone; actual arrangements still need explicit communication."
      },
      {
        "zh": "参与分歧修复关注澄清具体影响、商量可拒绝的小步骤或核对是否继续讨论。在普通安排误会中，可以提议先修正日历里的时间，而不要求立刻解决所有分歧。提出步骤与步骤被接受、实施、产生效果，是不同事实。停止同样可以是选择；遇到暴力、胁迫或持续伤害，次数不能把责任归为双方风格不合。",
        "en": "Repair Engagement concerns clarifying an impact, offering a small step that can be declined or checking whether discussion should continue. For an ordinary scheduling misunderstanding, correcting a calendar time need not resolve every disagreement. Proposing a step, its acceptance, its execution and its effect are different observations. Stopping remains an option. Violence, coercion or continuing harm cannot be assigned to a mutual style mismatch by these counts."
      }
    ]
  },
  {
    "id": "love-counting-worked",
    "title": {
      "zh": "24题怎样计数？相对选择、固定总数与并列算例",
      "en": "How are twenty-four items counted? Relative choices, a fixed total and worked ties"
    },
    "paragraphs": [
      {
        "zh": "四个方向的六种两两配对各出现4次；每个方向参与12次，在A、B位置各6次。选中一个方向便记1次，因此四项合计固定为24，每项为0至12。多选一个方向，会使另一项少得到这一次选择；这类题组内相对计数不能当成四项独立的关系能力评分。",
        "en": "The six pairs among four directions each appear four times. Each direction participates twelve times, six in each displayed position. Selecting it adds one count. Four counts therefore total twenty-four, with each ranging from zero to twelve. Choosing one direction gives that item’s other direction no count. These within-bank relative totals are not four independent relationship-ability ratings."
      },
      {
        "zh": "可复算示例：24题都选A，四项均为6次，显示四方向并列。只将第1题改成B，表达为5、回应为7、空间为6、修复为6，回应成为唯一最高项。另一个可出现的结果是8、8、4、4，对应表达与回应并列。系统保留所有相同最高项，不按题号或字母破同分；相差1次也不会自动合并。",
        "en": "Worked example: choosing A throughout produces six counts for every direction, a four-way tie. Change only item one to B: Expression has five, Response seven, Space six and Repair six; Response is uniquely highest. Another reachable result is eight, eight, four, four, tying Expression and Response. Every equally highest entry remains. Question order and codes do not break ties, and one-count differences are not automatically merged."
      }
    ]
  },
  {
    "id": "love-fifteen-guides",
    "title": {
      "zh": "15种完整结果怎样读？并列集合不规定行为顺序",
      "en": "How should you read fifteen full results? A tied set does not prescribe an order"
    },
    "paragraphs": [
      {
        "zh": "四个单项、六种双项、四种三项和一种四项并列，共15份完整指南。单项各有11节，并列各有10节，总计154节：包括题目对应、具体场景、时机与反馈、限制和可选小步骤。作答后显示本次对应全文；所有公开指南也可事先免费阅读，不会因此生成私人分数。",
        "en": "Four single leaders, six two-way ties, four three-way ties and one four-way tie have fifteen full guides. Singles contain eleven sections each and ties ten each, totalling 154 sections on choices, scenes, timing, feedback, limits and optional steps. A completed attempt displays its corresponding full guide. Every public guide is also free to read beforehand without generating private scores."
      },
      {
        "zh": "例如表达与空间并列，可比较“尽早说清安排”和“等到双方有余量再谈”分别出现在哪次经历。并列本身并未测量先后顺序，也不证明你会在压力下灵活切换。四项均6次同样不表示完美平衡；低项只是本题组较少选中，不表示不会爱、没有边界或必须练习某一种做法。",
        "en": "For an Expression–Space tie, compare occasions when you explained an arrangement promptly with occasions when you waited for available capacity. The tie does not measure their order or demonstrate flexible switching under pressure. Four counts of six do not establish perfect balance. A lower count means fewer selections here, not an inability to love, absent boundaries or an obligation to practise that response."
      }
    ]
  },
  {
    "id": "love-research-method",
    "title": {
      "zh": "关系研究说明什么？区分互动过程与类型标签",
      "en": "What does relationship research establish? Interaction processes and type labels"
    },
    "paragraphs": [
      {
        "zh": "Laurenceau等在1998年的两项日记研究中，考察一次次互动中的自我披露、对方披露、感知到的回应与亲密体验，发现这些变量存在关联，回应在其模型中起部分中介作用。[1] 这是关于具体互动的研究背景，不是本页四入口的定义来源，也不能证明多选“表达”或“回应”就会改善关系。",
        "en": "Two diary studies by Laurenceau and colleagues in 1998 examined disclosure, perceived responsiveness and intimacy in individual interactions, finding associations and partial mediation by responsiveness.[1] This is background on interaction processes, not the source of our four-entry definitions. It does not establish that selecting Expression or Response more often improves a relationship."
      },
      {
        "zh": "Impett、Park与Muise在2024年的综述中指出，现有研究未为“每人有单一主要爱的语言”“类别恰好为五种”“匹配即可带来更高满意度”等核心主张提供强支持，并讨论强迫选择与独立评分的差异。[2] 本页也应把相对选择与实际体验分开：题本尚未完成信度、效度、常模及中英文等值验证，外部论文不能替代这些研究。",
        "en": "A 2024 review by Impett, Park and Muise found limited support for central love-language assumptions about one primary language, exactly five categories and benefits from matching. It also discusses forced choices versus independent ratings.[2] Our relative choices must likewise remain separate from lived outcomes. This bank has no completed reliability, validity, norm or bilingual-equivalence studies; external papers cannot supply them."
      }
    ]
  },
  {
    "id": "love-models-context",
    "title": {
      "zh": "与爱的语言、依恋和爱的能力有什么区别？",
      "en": "How does this differ from love languages, attachment and capacity to love?"
    },
    "paragraphs": [
      {
        "zh": "爱的语言通常讨论什么表达方式让人感到被关心；依恋测量讨论亲近关系中的担心或退缩等构念；爱的能力量表则有自己的领域、条目与证据。本页仅比较四类题定互动入口，不把空间次数换成回避分，把回应次数换成共情分，也不把修复次数当作关系成熟度。",
        "en": "Love-language approaches concern expressions through which care is experienced; attachment instruments address constructs such as relationship anxiety or avoidance; capacity-to-love scales have their own domains, items and evidence. This page only compares four offered interaction entries. Space counts do not become avoidance, Response counts empathy or Repair counts relational maturity."
      },
      {
        "zh": "回看时可只选一个普通事件，分开记录“我说了什么”“我观察到什么”“对方明确说了什么”，再标出仍不确定的部分。例子可以支持、修正或不符合某段说明，都值得保留。不要由自己的结果推断伴侣在想什么，也不要求对方测试、提供记录或照着你的最高项回应。",
        "en": "For reflection, choose one ordinary episode and separate what you said, what you observed and what the other person explicitly said. Mark what remains uncertain. Examples may support, qualify or contradict a guide. Your result cannot reveal a partner’s thoughts or require them to take a test, provide records or respond according to your highest count."
      }
    ]
  },
  {
    "id": "love-start-private",
    "title": {
      "zh": "怎样开始与保存？完整结果免费，分享由你决定",
      "en": "How do I start and save? Free full results and optional sharing"
    },
    "paragraphs": [
      {
        "zh": "点击开始直接进入第一题，没有额外的同意勾选、邮箱或账号步骤。24题完整回答后才生成解释，约6分钟是阅读估计，不是限时。两项都不适用时，可以结束，不会把未答记成零分。重新作答请尽量使用同一参照情境，比较实际选择变化，不用新旧标签判断关系是否变好。",
        "en": "Start opens the first question directly, without an extra agreement checkbox, email or account step. Interpretation follows all twenty-four answers; roughly six minutes is an estimate, not a time limit. If neither response fits, stop without unanswered items becoming zero scores. For a retake, use a consistent reference context and compare choices rather than judging relationship progress from labels."
      },
      {
        "zh": "答案在当前浏览器计算，不随计分请求上传。默认不保存；主动临时保存后，本标签页可在24小时内恢复，完成、重测或清除时移除。复制分享仅含结果名称和公开说明链接，不含答案或原始次数。可以只读、写私人草稿或在此结束，不要求联系任何人。",
        "en": "Answers are calculated in this browser without a scoring upload. Saving is off by default. Optional temporary saving supports recovery in this tab for twenty-four hours and is removed on completion, retaking or clearing. Copying shares only a result name and public-guide link, without answers or counts. Reading, making a private note or stopping here are all options; no contact with anyone is required."
      }
    ]
  }
];

export const lovePersonalityLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "恋爱人格测试能判断我爱得深不深吗？",
      "en": "Can this test tell how deeply I love?"
    },
    "answer": {
      "zh": "不能。它记录24次成对选择的分配，不测爱的强度、承诺程度、实际照顾行为或关系质量。原始次数更高只表示在这些题目里相对更常选了该方向。",
      "en": "No. It records the distribution of twenty-four paired choices, not depth of love, commitment, actual care or relationship quality. A higher count only means more selections for that direction in this bank."
    }
  },
  {
    "question": {
      "zh": "表达与回应并列，是不是先说再听的类型？",
      "en": "Does an Expression–Response tie mean I speak first and listen next?"
    },
    "answer": {
      "zh": "不是。并列是两个方向原始次数相同且最高，题目没有测量真实先后顺序、自动切换或两种方式的配合效果；顺序需另看具体经历。",
      "en": "No. It means equally highest raw counts. The items do not measure actual order, automatic switching or how effectively the two responses combine. Concrete episodes are needed to examine sequence."
    }
  },
  {
    "question": {
      "zh": "四项都是6次，算完美平衡吗？",
      "en": "Do four counts of six mean perfect balance?"
    },
    "answer": {
      "zh": "不算。24次选择平均分配为6、6、6、6，说明本次没有唯一最高项，不证明四项能力同等成熟，也不表示测试失效。四项并列有自己的完整指南。",
      "en": "No. Six choices per direction means no unique leader in this attempt. It establishes neither equally mature abilities nor test failure. A four-way tie has its own complete guide."
    }
  },
  {
    "question": {
      "zh": "两个人次数相同，代表更适合在一起吗？",
      "en": "Do matching counts mean two people are more compatible?"
    },
    "answer": {
      "zh": "不能。同样总数可能来自不同题目选择；题本没有伴侣双人数据或关系结局预测模型。可以自愿讨论一件具体安排，不把分数当作配对结论。",
      "en": "No. Identical totals can arise from different item choices. The bank has no dyadic partner data or relationship-outcome prediction model. Voluntarily discuss a concrete arrangement without treating scores as a matching verdict."
    }
  },
  {
    "question": {
      "zh": "选择空间更多，就属于回避型依恋吗？",
      "en": "Does choosing Space more often mean avoidant attachment?"
    },
    "answer": {
      "zh": "不能这样换算。空间项观察的是联系强度与时机的题定选择，没有按依恋量表测量回避构念。需要独处、疲惫或不愿谈某个话题，应分别结合当时信息理解。",
      "en": "No conversion is supported. Space items concern offered contact-intensity and timing choices; they do not measure avoidance through an attachment instrument. Solitude, tiredness and unwillingness to discuss a topic need their own contextual information."
    }
  },
  {
    "question": {
      "zh": "没有恋爱对象也可以阅读或作答吗？",
      "en": "Can I read or answer without a current partner?"
    },
    "answer": {
      "zh": "可以直接阅读全部15份指南。作答时只回看自己愿意观察、与题意相关的经历，尽量保持同一参照情境；缺少适用经验时，可以结束，不强行想象或替别人作答。",
      "en": "All fifteen guides can be read directly. If answering, use relevant experiences you are comfortable reflecting on and keep a consistent context. Without applicable experience, stop rather than invent answers or answer for someone else."
    }
  },
  {
    "question": {
      "zh": "修复次数较高，是不是应该继续一段关系？",
      "en": "Does a high Repair count mean I should keep a relationship going?"
    },
    "answer": {
      "zh": "不是。它不判断关系去留、伤害责任或对方意愿。指南中的修复仅是安全且自愿条件下的可选行动，任何结果都不要求原谅、复合或继续接触。",
      "en": "No. It determines neither whether to stay, responsibility for harm nor another person’s wishes. Repair suggestions are optional actions under safe, voluntary conditions. No result requires forgiveness, reconciliation or continued contact."
    }
  },
  {
    "question": {
      "zh": "读过全部说明，会不会影响计分？",
      "en": "Does reading all guides change the scoring?"
    },
    "answer": {
      "zh": "阅读不会改动公式或生成私人结果；自己阅读后的理解可能影响之后的选择，所以重测时可记录参照情境和作答条件。公开指南随时免费，不必先答完。",
      "en": "Reading changes neither the formula nor generates a private result. What you learn may influence later choices, so note your reference context and conditions when retaking. Public guides remain free without first completing the quiz."
    }
  }
];

export const lovePersonalityLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "Laurenceau等（1998）：自我披露、感知回应与亲密互动的日记研究",
      "en": "Laurenceau et al. (1998): diary research on disclosure, perceived responsiveness and intimacy"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/9599440/"
  },
  {
    "title": {
      "zh": "Impett、Park与Muise（2024）：从关系科学角度评估爱的语言",
      "en": "Impett, Park & Muise (2024): evaluating love languages through relationship science"
    },
    "url": "https://journals.sagepub.com/doi/10.1177/09637214231217663"
  }
];
