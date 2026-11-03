import type { Questionnaire } from "@/lib/questionnaires/types";

export const dexterLandingSections: Questionnaire["guide"] = [
  {
    "id": "dexter-scope",
    "title": {
      "zh": "这份Dexter角色测试探索什么？六种谜题社团贡献",
      "en": "What does this Dexter Character Test explore? Six puzzle-club contributions"
    },
    "paragraphs": [
      {
        "zh": "Paramount原剧发行目录确认德克斯特、黛布拉、安吉尔、马苏卡、多克斯和拉圭尔塔都在原剧人物名单中。[1] 本版取六个名字，组织虚构纸上谜题社团中的有限选择：描述细节、说清问题、让人参与、演示趣味机关、核对主张，以及协调范围与分工。人物名单是背景依据，六种解释与题目则由费马独立创作。",
        "en": "Paramount’s original-series distribution catalog identifies Dexter, Debra, Angel, Masuka, Doakes and LaGuerta in its cast.[1] This edition uses their names for limited choices in an invented paper-puzzle club: describing details, stating a question, including people, demonstrating a playful mechanism, checking a claim and coordinating scope and roles. The cast supplies background; these six interpretations and the questions are independently authored."
      },
      {
        "zh": "24个情境只涉及虚构卡片、玩具机关、活动说明和自愿分工，不需要回忆剧集、接触真实案件或具有法医知识。每题问给定四种做法里你较想先做什么，而不是你能做得多好。结果比较本次选择，不把剧中人物的整段经历、严重伤害或心理特征移植给作答者。",
        "en": "Twenty-four situations involve invented cards, toy mechanisms, instructions and voluntary roles, without episode recall, real cases or forensic knowledge. Each asks which of four offered actions you would prefer first rather than how well you could perform it. Results compare this attempt, without transferring a character’s whole history, serious harms or psychological characteristics to the reader."
      }
    ]
  },
  {
    "id": "dexter-observation",
    "title": {
      "zh": "德克斯特与多克斯：描述所见，与检查解释",
      "en": "Dexter and Doakes: describe observations or examine an explanation"
    },
    "paragraphs": [
      {
        "zh": "面对两张互相矛盾的虚构线索卡，德克斯特角度先记录字样、布局和细小差别；多克斯角度先指出哪一个主张无法同时成立，并问什么信息能解释差异。前者提供可核对的描述，后者检查解释与规则是否相容。这两种做法可以先后出现，不构成“观察者”和“怀疑者”的固定人格分类。",
        "en": "With two conflicting fictional clue cards, the Dexter lens first records wording, layout and small differences. The Doakes lens identifies which claims cannot both hold and asks what information could explain the discrepancy. One supplies checkable descriptions; the other examines consistency between an explanation and its rules. They can occur in sequence without establishing fixed observer or sceptic personality categories."
      },
      {
        "zh": "另设一张游戏卡写“红盒”，另一张图却画蓝盒。可先说出两处原样内容，再询问是否印刷错误、不同轮次或有意设置。发现差异尚未证明有人说谎；提出质疑也需要允许答案改变自己的看法。这里的例子只用于讨论虚构材料，不授予调查真实人物、辨认谎言或判断危险的能力。",
        "en": "For a fresh example, a game card says red box while a drawing shows a blue box. Describe both before asking whether the difference is a printing error, another round or intentional. A discrepancy does not establish deception, and a challenge should allow an answer to change your view. This concerns invented materials, not investigating real people, detecting lies or judging danger."
      }
    ]
  },
  {
    "id": "dexter-questions",
    "title": {
      "zh": "黛布拉与拉圭尔塔：补齐问题，与形成约定",
      "en": "Debra and LaGuerta: clarify a question or establish an agreement"
    },
    "paragraphs": [
      {
        "zh": "社团讨论停住时，黛布拉角度把缺少的信息说成一个可回答的问题，例如“这一轮到底要比较什么？”拉圭尔塔角度则帮助约定下一步、参与者自选角色和停止点。问清楚不等于已经分工，列出分工也不代表大家都明白问题；两种贡献分别处理信息缺口与行动安排。",
        "en": "When a club discussion stalls, the Debra lens turns the information gap into an answerable question, such as what this round is comparing. The LaGuerta lens helps agree on a next step, voluntarily chosen roles and a stopping point. Clarification does not itself allocate work, and allocated work does not guarantee a shared understanding. The contributions address an information gap and an action arrangement respectively."
      },
      {
        "zh": "另设活动只剩十分钟，传单还有一处规则未写清。可以先问“读者按哪一步开始”，再约定谁愿意补一句话、谁核对版面，以及时间到后保留哪些内容。直接提问需要留下回答空间，清楚计划需要允许拒绝或修改角色。较高计数不能据此证明更诚实、更有管理才能或应该领导别人。",
        "en": "For a fresh session with ten minutes left and one unclear leaflet rule, first ask which step a reader should begin with. Then agree who wishes to add a sentence, who checks the layout and what remains when time ends. Direct questions leave room for answers; clear plans allow roles to be declined or revised. Higher counts establish neither greater honesty nor management skill or authority over others."
      }
    ]
  },
  {
    "id": "dexter-participation",
    "title": {
      "zh": "安吉尔与马苏卡：让人加入，与让点子可体验",
      "en": "Angel and Masuka: make participation accessible or let an idea be tried"
    },
    "paragraphs": [
      {
        "zh": "有人中途加入谜题桌，安吉尔角度先简短回顾，并给对方参与、旁观或稍后再来的选择。马苏卡角度更想展示玩具机关或用一个轻松例子让点子变得具体。欢迎处理“人怎样进入活动”，演示处理“点子怎样被体验”；两者都可以温和，也都需要看对方实际是否愿意。",
        "en": "When someone joins a puzzle table late, the Angel lens offers a short recap and a choice to join, watch or return later. The Masuka lens prefers showing a toy mechanism or a light example that makes an idea tangible. Welcome addresses entry into an activity; demonstration addresses experiencing an idea. Both can be considerate and both depend on whether others actually wish to participate."
      },
      {
        "zh": "另设一位新伙伴说想先看一轮：可以说明目前进度，把可选的机关演示留到对方有兴趣时。没有接受邀请，不代表欢迎失败；没有笑，也不代表不喜欢你。把计数读成当前的活动选择，比推断共情、受欢迎程度、幽默天赋或职业实验能力更贴近本卷实际收集的信息。",
        "en": "If a new partner wants to watch one round first, explain the current stage and leave the optional demonstration until they are interested. Declining an invitation does not establish a failed welcome, and not laughing does not establish personal dislike. Reading counts as activity choices stays closer to the information collected than inferring empathy, popularity, comic talent or professional laboratory skill."
      }
    ]
  },
  {
    "id": "dexter-counts",
    "title": {
      "zh": "24题怎样计数？出现机会、选项位置与缺席",
      "en": "How are twenty-four choices counted? Exposure, position and absence"
    },
    "paragraphs": [
      {
        "zh": "每题选择只给明确映射的一位人物加1，六项总和固定为24。每人出现16题，分别在A、B、C、D位置出现四次；其余八题没有该人物选项。缺席不能当成拒绝，也不补零分问答。单项范围0—16，表示出现时实际被选了多少次，不是与人物相似的百分比。",
        "en": "Each choice adds one raw count to its mapped character, keeping the six-count total at twenty-four. Each character appears in sixteen items, four times in each of A, B, C and D, and is absent from eight items. Absence is not rejection or an additional scored response. A count from zero through sixteen records selections when offered, not a percentage resemblance."
      },
      {
        "zh": "各人物出现次数相同使本卷机会可核对，但这不能证明题目难度相同、心理特征等值或结果有效。四选一还意味着选了观察细节，就暂未选当题的其他三种做法，不能推出你从不提问、关心或计划。应同时保留情境、替代选项和原始计数，避免只凭最高名字给自己下定义。",
        "en": "Equal exposure makes opportunities checkable but establishes neither equal item difficulty, equivalent psychological traits nor validated results. Choosing observation also leaves three offered alternatives unselected for that item; it cannot show that you never question, care or plan. Keep the context, alternatives and raw counts together rather than define yourself by the highest name."
      }
    ]
  },
  {
    "id": "dexter-ties",
    "title": {
      "zh": "怎样读并列？全部保留，而非主副人格",
      "en": "How should ties be read? Preserve every highest count"
    },
    "paragraphs": [
      {
        "zh": "六项依次4、4、4、4、4、4时，总和24，六位都同为最高。系统显示六份完整指南，共42个指南小节，不按字母、人物出场顺序或随机数抽一个。若是6、6、3、3、3、3，则前两位并列，显示两份全文。最高并列是本题组的算术关系，不是多重人格或隐藏身份。",
        "en": "Counts of 4, 4, 4, 4, 4, 4 sum to twenty-four and put all six characters at the top. All six full guides appear, comprising forty-two guide sections, without a winner chosen by alphabet, cast order or randomness. Counts of 6, 6, 3, 3, 3, 3 retain the first two full guides. A highest tie is an arithmetic relation in this bank, not multiple personalities or a hidden identity."
      },
      {
        "zh": "相差一次的结果仍按实际计数显示，本版没有经过验证的“接近就合并”阈值。可以主动读相邻公开指南，找一个符合和一个不符合的近期活动例子。不要把次高自动叫作副人格，也不要把低计数当作缺乏那种贡献；全部六份指南始终公开，阅读顺序不改变算法。",
        "en": "A one-count gap remains visible; this edition has no validated threshold for merging near scores. You may read adjacent public guides and find one fitting and one non-fitting recent activity example. A runner-up is not automatically a secondary personality, and a lower count is not a missing contribution. All six guides stay public, and reading order does not change scoring."
      }
    ]
  },
  {
    "id": "dexter-session",
    "title": {
      "zh": "把结果放回同一场活动：例子、取舍与小尝试",
      "en": "Return results to one activity: examples, trade-offs and a small trial"
    },
    "paragraphs": [
      {
        "zh": "想象同一场纸上谜题活动：先观察卡片，再说出未解问题；有人到场时补一段回顾，用机关示例展示规则，再检验解释，最后约定收尾。六种贡献可以由同一个人在不同时间完成。本卷问相对先选什么，不要求一人只能占一个角色，也不要求所有情境都保持同一种回应。",
        "en": "In one paper-puzzle session, a person could inspect cards, state an unanswered question, recap for an arrival, demonstrate a mechanism, check the explanation and agree how to finish. One person may contribute all six at different moments. This bank asks relative first preferences, without restricting each person to one role or requiring the same response in every situation."
      },
      {
        "zh": "可以从结果挑一个自愿的小尝试，例如把“看到什么”和“认为意味着什么”写成两列，再请愿意的伙伴补充其他解释；也可以试一句具体问题或一份可修改的短计划。观察交流是否更清楚、是否有负担，比证明角色标签更实用。这些是可选活动建议，本版没有测得它们的干预效果。",
        "en": "Choose an optional small trial, such as separating what is observed from what it might mean and inviting a willing partner to suggest another explanation. Alternatively try one specific question or a short revisable plan. Observe clarity and burden rather than try to prove a character label. These are optional activity suggestions, without measured intervention effects for this edition."
      }
    ]
  },
  {
    "id": "dexter-boundaries",
    "title": {
      "zh": "角色比较、科学证据与双语使用条件",
      "en": "Character comparison, scientific evidence and bilingual conditions"
    },
    "paragraphs": [
      {
        "zh": "官方名单能核人物身份，算法可复算能核计数；它们都不是信度、效度、常模或临床证据。本站未建立这24题的心理测量验证，不用它判断精神状态、犯罪风险、道德价值、MBTI或真实法医能力。原剧人物包含复杂而严重的行为，结果不会把这些行为赋给你，也不为其伤害提供正当化。",
        "en": "A cast list checks identities and a reproducible algorithm checks counts; neither supplies reliability, validity, norms or clinical evidence. This twenty-four-item edition has no established psychometric validation for mental state, crime risk, moral worth, MBTI or real forensic ability. The original characters have complex and seriously harmful actions; a result neither assigns those actions to you nor justifies their harm."
      },
      {
        "zh": "中英文都保留24题、六项映射、完整指南和全部最高并列；文字完整对应不等于已经证明跨语言分数等价。开始直接进入题目，无需额外同意、邮箱或注册；约7分钟不设限时。答案在浏览器计数，可选草稿24小时失效，完成、重测或退出清除即删除。可选分享仅含公开人物名与链接，不含答案或计数。",
        "en": "Both languages retain twenty-four items, six mappings, full guides and every highest tie; complete translation does not establish cross-language score equivalence. Start opens questions directly without another agreement, email or signup; seven minutes is untimed. Answers are counted in the browser. Optional drafts expire after twenty-four hours and clear on completion, retake or exit-and-clear. Optional sharing contains public character names and a link, not answers or counts."
      }
    ]
  }
];

export const dexterLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "德克斯特与多克斯的角度有什么区别？",
      "en": "How do the Dexter and Doakes lenses differ?"
    },
    "answer": {
      "zh": "前者先描述虚构材料的细节，后者检查主张是否有依据、矛盾如何解决。两种做法可以先后使用，不代表法医能力或真实识人能力。",
      "en": "One first describes invented details; the other checks support for a claim and how contradictions can be resolved. Both may be used in sequence, without establishing forensic skill or insight into real people."
    }
  },
  {
    "question": {
      "zh": "黛布拉与拉圭尔塔都在推进活动吗？",
      "en": "Do Debra and LaGuerta both move an activity forward?"
    },
    "answer": {
      "zh": "可以，但侧重不同：黛布拉先说清缺少的问题，拉圭尔塔先帮助形成范围、角色与收尾约定。问清楚与分好工不是同一件事。",
      "en": "They can, with different priorities: Debra states the missing question; LaGuerta helps agree on scope, roles and a stopping point. Clarifying information differs from allocating work."
    }
  },
  {
    "question": {
      "zh": "安吉尔与马苏卡怎样区分？",
      "en": "How are Angel and Masuka distinguished?"
    },
    "answer": {
      "zh": "安吉尔先让参与更容易，马苏卡先通过自愿的趣味演示让点子可体验。两者都要尊重旁观或拒绝，不以笑声或参与人数评能力。",
      "en": "Angel prioritises accessible participation; Masuka makes an idea tangible through optional playful demonstration. Both respect watching or declining, without grading ability by laughter or attendance."
    }
  },
  {
    "question": {
      "zh": "为什么人物没出现在题目中不算被拒绝？",
      "en": "Why is an absent character not rejected?"
    },
    "answer": {
      "zh": "每题只提供六位中的四位，其他两位没有被比较。每人共出现16题、缺席八题；只给实际选择的映射人物加一次。",
      "en": "Each item offers four of six characters; the absent two were not compared. Each appears sixteen times and is absent eight times. Only the mapped selected character receives a count."
    }
  },
  {
    "question": {
      "zh": "六项全是4会发生什么？",
      "en": "What happens when all six counts are four?"
    },
    "answer": {
      "zh": "总和24，六位全部最高并列，保留六份完整指南和42个指南小节，不随机选一位，也不按顺序破同分。",
      "en": "They sum to twenty-four and retain all six full guides with forty-two guide sections. No character is randomly selected and ordering does not break the tie."
    }
  },
  {
    "question": {
      "zh": "六项6、6、3、3、3、3怎样阅读？",
      "en": "How should 6, 6, 3, 3, 3, 3 be read?"
    },
    "answer": {
      "zh": "前两位同为最高，显示两份完整指南；其他四项仍保留实际计数，可读公开指南，不派主副人格。",
      "en": "The first two share the highest count and retain both full guides. The other four keep their counts and public guides remain available, without primary or secondary personality assignments."
    }
  },
  {
    "question": {
      "zh": "重测换人物就表示我变了吗？",
      "en": "Does a different character on a retake mean I have changed?"
    },
    "answer": {
      "zh": "不能仅凭名字判断。选项理解、参照活动、熟悉题目和一次选择变化都可能影响最高项。本版没有用于量化变化的重测研究。",
      "en": "The name alone cannot establish change. Interpretation, reference activity, familiarity and one changed choice can affect the highest count. This edition has no retest research quantifying change."
    }
  },
  {
    "question": {
      "zh": "能用结果判断MBTI或职业吗？",
      "en": "Can the result determine MBTI or a career?"
    },
    "answer": {
      "zh": "不能。角色选择计数与MBTI、职业兴趣或能力评估有不同题目和用途，需要分别作答及相应证据，不能按人物名换算。",
      "en": "No. Character counts differ in questions and purpose from MBTI, vocational interests or ability assessment, requiring their own responses and evidence rather than a conversion from a character name."
    }
  },
  {
    "question": {
      "zh": "点击开始后还要确认同意吗？",
      "en": "Must I confirm another agreement after starting?"
    },
    "answer": {
      "zh": "不需要。开始直接进入24题，中英文题目和全部指南免费，无需邮箱、账号、付款或前置测试。",
      "en": "No. Start opens twenty-four items directly. Both languages and every complete guide are free without email, an account, payment or a prerequisite test."
    }
  }
];
