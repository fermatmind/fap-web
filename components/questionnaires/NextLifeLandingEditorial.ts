import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Original symbolic form; editorial background does not validate its scores. */
export const nextLifeLandingSections: QuestionnaireSection[] = [
  {
    "id": "next-imagination-purpose",
    "title": {
      "zh": "来世之路测试是什么？用重新开始想象讨论日常愿望",
      "en": "What is the Next Life Quiz? A fresh-start story about ordinary wishes"
    },
    "paragraphs": [
      {
        "zh": "这里的“来世”是一个虚构前提：如果日常可以重新安排，你想为哪些活动保留时间？题目涉及房间、午后、约定、笔记、困难和小小贡献。它没有询问死亡经历、宗教立场或真实转世记忆，也不根据姓名、出生日期或面容抽取命运。计数来自实际选项，不是随机分配故事。",
        "en": "Here, next life is a fictional premise: if daily life could be rearranged, which activities would you protect? Items concern a room, an afternoon, promises, notebooks, difficulties and small contributions. They ask for no encounters with death, religious position or reincarnation memories. Names, birth dates and faces do not generate a destiny; actual selections determine counts rather than a random story assignment."
      },
      {
        "zh": "题目允许你想象一种暂时没有实现的愿望，但选择不证明你现在拥有相应生活、技能或机会。喜欢共同吃饭的人未必常能组织聚会；想修补东西的人也未必学过维修。把“我想留出什么”与“我已经做得怎样”分开，才能避免把期待误读成能力报告。",
        "en": "You may imagine a wish that is not currently realised, but selecting it establishes no existing lifestyle, skill or opportunity. Someone drawn to shared meals may rarely be able to arrange them; someone drawn to repair may have no repair training. Separate what you want to make room for from what you already do well."
      }
    ]
  },
  {
    "id": "next-six-paths",
    "title": {
      "zh": "六条路径怎样区分？看活动，也看愿意承担的代价",
      "en": "How do the six paths differ? Consider activities and their costs"
    },
    "paragraphs": [
      {
        "zh": "跨海旅人重在亲身接触陌生环境，可能接受反复当新手的麻烦；四季园丁重在持续照看、等待与回访，不只是喜欢自然风景。相同的公园散步，可以是发现一条陌生小路，也可以是隔周回来看看同一株植物。名称没有规定远行费用、园艺经验或某种高低等级。",
        "en": "The Sea-route Traveller emphasises unfamiliar encounters, including being a beginner again; the Seasonal Gardener emphasises repeated care, waiting and return, rather than scenery alone. One park visit could involve discovering an unfamiliar path or returning to observe the same plant. Neither name requires travel spending, gardening experience or a higher status."
      },
      {
        "zh": "长桌主人重在能逐渐熟悉的相聚与共同生活；修补工匠重在制作、试错和让东西继续有用。为朋友准备便饭可以包含两种侧重：更在意坐下来相处，或更在意把一件仍可用的东西修好。相聚需尊重是否愿意参加，制作需考虑能力与安全，均不要求替所有人负责。",
        "en": "The Long-table Host emphasises gathering and shared everyday life; the Repair Workshop Maker emphasises making, trial and continued usefulness. Preparing a simple meal for friends may involve both: valuing time together or restoring something useful. Gathering respects willingness to participate; making respects skill and safety. Neither requires taking responsibility for everyone."
      },
      {
        "zh": "街角记录者重在把观察转成可分享的表达；夜窗研究者重在追问、核对和容许答案暂时未明。记录一次街角变化可以侧重“怎样讲出来”，也可以侧重“究竟为什么变化”。两者可同时存在；记录者不等于艺术天赋，研究者不等于高智商，六个象征身份都不是职业资格。",
        "en": "The Street-corner Chronicler emphasises turning observations into shareable expression; the Night-window Investigator emphasises inquiry, checking and tolerating unresolved questions. A changing street may prompt how to tell its story or why it changed. Both interests can coexist. Chronicler establishes no artistic talent, Investigator no high IQ, and none of the symbolic identities grants professional qualifications."
      }
    ]
  },
  {
    "id": "next-count-denominator",
    "title": {
      "zh": "18次选择如何计分？每条路径12次出现",
      "en": "How are eighteen choices counted? Twelve appearances per path"
    },
    "paragraphs": [
      {
        "zh": "每题提供六条路径中的四条，轮流省略，选中哪条就给哪条加1。每条全卷出现12次，在A、B、C、D四个位置各出现3次，最高可能12次；六项计数总和固定为18。这些安排让各方向拥有相同的出现次数，不等于已经证实题目难度、吸引力或测量质量相同。",
        "en": "Each item offers four of the six paths with rotating omission; the selected path gains one count. Each appears twelve times, three in each A–D position, for a maximum of twelve selections per path. The six counts sum to eighteen. Equal appearances do not establish equal item difficulty, appeal or measurement quality."
      },
      {
        "zh": "例如按六条路径的页面次序，6、6、2、2、1、1合计18，旅人与园丁同为最高，两份完整结果都会出现。6÷18表示全部选择中的份额，6÷12表示该路径出现时被选中的份额；分母回答不同问题。本站保留原始次数，不把任一比值解释为转世概率、人格浓度或人群百分位。",
        "en": "For example, counts of 6, 6, 2, 2, 1, 1 in page order sum to eighteen, with Traveller and Gardener both highest and both full reports shown. Dividing 6 by 18 describes a share of all selections; dividing it by 12 describes a share of that path’s appearances. These denominators answer different questions. Neither ratio is presented as reincarnation probability, personality concentration or population percentile."
      }
    ]
  },
  {
    "id": "next-ties-lower",
    "title": {
      "zh": "并列、相近与低计数：不强行选唯一身份",
      "en": "Ties, nearby counts and lower counts: no forced single identity"
    },
    "paragraphs": [
      {
        "zh": "六项各3次也是有效结果，六份完整说明全部保留。最高次数相同就并列，不按字母、题号或报告顺序破同分；但5与4虽然接近，仍是不同计数。本版没有经验证的近分阈值、置信区间或重测变化标准，不能把差一次说成已经确定的偏好差异。",
        "en": "Six counts of three form a valid result with all six complete guides retained. Equal maxima stay tied without an alphabet, question-number or report-order tiebreaker. Five and four remain different counts despite proximity. This edition has no validated near-score threshold, confidence interval or reliable-change standard, so a one-choice gap establishes no definite preference difference."
      },
      {
        "zh": "低计数只表示这批受限选项里较少先选该路径，不说明你拒绝友谊、缺乏好奇心或不愿创造。每题只有四条可选，选择一条就放下其余几条。可以读较低路径的反例，看看未选的是活动本身、当时的代价，还是更想优先保留别的部分。",
        "en": "A lower count means choosing that path less often among these restricted menus, not rejecting friendship or lacking curiosity or creativity. Only four paths are offered per item, and selecting one sets others aside. Read a lower path’s counterexamples and consider whether its activity, its cost or another priority influenced the choice."
      }
    ]
  },
  {
    "id": "next-research-boundary",
    "title": {
      "zh": "想象未来的研究能说明什么？不等于验证来世预测",
      "en": "What can future-imagination research show? Not validation of reincarnation predictions"
    },
    "paragraphs": [
      {
        "zh": "Addis等研究让参与者在提示后构建并展开过去或未来事件，比较相关脑活动，发现回忆与想象既有共同也有不同过程。[1] 这提供的是事件想象的研究背景；本站没有进行脑活动测量，也没有按该实验评估你的记忆或想象能力。研究未来想象，不等于证实问卷能看到下一生。",
        "en": "Addis and colleagues asked participants to construct and elaborate past or future events after cues, finding shared and distinct neural activity.[1] That supplies background on imagining events. This quiz records no brain activity and does not assess your memory or imagination using that experiment. Studying future imagination does not establish a questionnaire’s ability to see another lifetime."
      },
      {
        "zh": "Wilson等的实验讨论人们过度关注一件未来事件、忽略其他日常活动时，可能高估情绪影响持续多久。[2] 因此，阅读一个吸引人的新生活故事时，也可问它的普通星期一包含什么。这个阅读问题不保证预测更准；两项外部研究都没有验证本站18题、六种路径或其中英文测量等价性。",
        "en": "Wilson and colleagues examined overestimating how long an event would influence feelings when other future activities receive too little attention.[2] When reading an appealing life story, ask what its ordinary Monday includes as well. That prompt guarantees no better prediction, and neither external study validates these eighteen items, six paths or English–Chinese measurement equivalence."
      }
    ]
  },
  {
    "id": "next-present-experiment",
    "title": {
      "zh": "怎样把想象带回现在？从一件小事开始核对",
      "en": "How can imagination inform the present? Check one small activity"
    },
    "paragraphs": [
      {
        "zh": "选择一条愿意尝试的路径，先缩小到无需重大决定的活动：附近一条新路线、照看一盆植物、一顿自愿相聚的便饭、能力范围内的简单修补、一小段记录，或一个可以慢慢查证的问题。再写下所需时间、资源、他人同意和愿意接受的麻烦；没有条件时，可以只读故事，不需要证明自己配得上结果。",
        "en": "Choose a path you want to explore and reduce it to an activity without major commitments: a nearby new route, tending a plant, a voluntary shared meal, a safe repair within your skills, a short piece of writing or a question to investigate gradually. Consider time, resources, others’ consent and acceptable difficulties. If circumstances do not permit it, reading is enough; no result must be earned through action."
      },
      {
        "zh": "尝试后分别记录吸引你的部分、实际代价和不符合预想之处，不只收集支持结果的例子。这些是可选反思，不是经过本题本验证的干预。不要仅凭一份故事决定辞职、迁居、关系或其他重大选择；若另想了解工作活动兴趣，可独立了解RIASEC，而不是把六条路径换算成职业代码。",
        "en": "Afterwards, note the appealing part, actual costs and what did not fit your expectations rather than collecting confirmation alone. These are optional reflections, not interventions validated by this form. A story alone should not decide employment, relocation, relationships or other major choices. Work-activity interests can be explored separately with RIASEC, without converting these paths into occupational codes."
      }
    ]
  },
  {
    "id": "next-privacy-comparison",
    "title": {
      "zh": "免费范围、草稿与前世测试的区别",
      "en": "Free content, drafts and the distinction from the Past Life Quiz"
    },
    "paragraphs": [
      {
        "zh": "18题、全部计数与六份完整指南均免费，不需账户或另一测评解锁。答案留在浏览器；只有主动保存才创建本标签页草稿，24小时失效，完成、清除或重测即删除。未保存时刷新会丢失本次作答。分享的是公开指南链接，不包含个人答案或次数，也不会把故事认定为你的真实身份。",
        "en": "All eighteen items, counts and six complete guides are free without an account or another assessment to unlock them. Answers stay in the browser. Only an explicit save creates a tab draft, expiring after twenty-four hours and cleared on completion, clearing or retake. Refreshing without saving loses the attempt. Sharing uses a public guide link without personal answers or counts, not a statement of your real identity."
      },
      {
        "zh": "前世测试围绕历史活动意象；来世之路则围绕重新安排日常时想保留的活动和愿意付出的代价。两份题目与结果集合独立，不互相证明，也不提供宗教结论、命运概率或人格诊断。可以只选你喜欢的一个故事阅读，也可以不认同任何路径后结束。",
        "en": "The Past Life Quiz uses historical activity imagery; this quiz concerns activities and costs you would protect when rearranging everyday life. Their questions and result sets are independent and do not verify each other. Neither supplies religious conclusions, destiny probabilities or personality diagnoses. Read one story you like or finish without identifying with any path."
      }
    ]
  }
];

export const nextLifeLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "来世之路测试需要相信转世吗？",
      "en": "Must I believe in reincarnation to take this quiz?"
    },
    "answer": {
      "zh": "不需要。重新开始一生只是虚构前提，题目讨论想保留的日常活动，不要求或评判信仰。",
      "en": "No. Beginning a lifetime again is a fictional premise for discussing everyday activities you want to preserve. Belief is neither required nor judged."
    }
  },
  {
    "question": {
      "zh": "六条路径是六种科学人格类型吗？",
      "en": "Are the six paths scientific personality types?"
    },
    "answer": {
      "zh": "不是。它们是费马原创生活故事比喻，尚无本题本的信度、效度、常模或跨语言测量等价证据。",
      "en": "No. They are original FermatMind life-story metaphors, without established form-specific reliability, validity, norms or cross-language measurement equivalence."
    }
  },
  {
    "question": {
      "zh": "每条出现12次，为什么总计18次？",
      "en": "Why twelve appearances per path but eighteen total selections?"
    },
    "answer": {
      "zh": "每题四个选项，18题共72次展示，六条各12次；每题只选一个，所以最终六项计数之和为18。",
      "en": "Four options on each of eighteen items give seventy-two appearances, twelve per path. Only one is chosen per item, so final counts sum to eighteen."
    }
  },
  {
    "question": {
      "zh": "6、6、2、2、1、1会得到什么结果？",
      "en": "What happens with counts of 6, 6, 2, 2, 1, 1?"
    },
    "answer": {
      "zh": "旅人与园丁同为最高6次，两份完整报告都显示；其他四项计数仍保留，不按顺序挑唯一赢家。",
      "en": "Traveller and Gardener tie at six and both full reports display. The remaining counts stay visible, without choosing one winner by ordering."
    }
  },
  {
    "question": {
      "zh": "六项各3次是不是没有结果？",
      "en": "Do six counts of three mean no result?"
    },
    "answer": {
      "zh": "不是，六条全部最高并列，六份六节指南均保留。这记录本次选择的并列，不代表一个人拥有六种完整生活。",
      "en": "No. All six tie highest, retaining all six six-section guides. This records a tied attempt, not possession of six complete lifestyles."
    }
  },
  {
    "question": {
      "zh": "很少选长桌主人，是不是不重视关系？",
      "en": "Does rarely choosing Host mean I do not value relationships?"
    },
    "answer": {
      "zh": "不能这样推断。每题受限的选项和你更想优先保留的活动都会影响计数，低计数不等于否定一项价值。",
      "en": "No. Restricted menus and the activities you prioritise affect counts. A lower count does not establish rejection of a value."
    }
  },
  {
    "question": {
      "zh": "修补工匠和夜窗研究者能说明职业天赋吗？",
      "en": "Do Maker and Investigator establish career talent?"
    },
    "answer": {
      "zh": "不能。题目问想保留的活动和愿意接受的代价，没有考查维修技能、研究能力或现实工作表现。",
      "en": "No. Items ask about preferred activities and acceptable costs, without testing repair skills, research ability or actual work performance."
    }
  },
  {
    "question": {
      "zh": "研究未来想象，是否证明这个测试科学准确？",
      "en": "Does research on future imagination validate this quiz?"
    },
    "answer": {
      "zh": "不证明。文献研究的是事件想象与情感预测，[1][2] 没有验证本站题目，也不支持转世或命运概率。",
      "en": "No. The cited studies concern event imagination and affective forecasting,[1][2] not validation of these items or probabilities of reincarnation or destiny."
    }
  },
  {
    "question": {
      "zh": "开始前需要输入姓名、生日或上传照片吗？",
      "en": "Must I enter a name or birth date or upload a photo?"
    },
    "answer": {
      "zh": "不需要。开始直接进入18题，无额外同意、邮箱、注册或其他测评要求，完整解读免费。",
      "en": "No. Start opens eighteen items directly without another agreement, email, signup or prerequisite assessment. Full guides are free."
    }
  },
  {
    "question": {
      "zh": "想象中的喜欢，和实际尝试不一致怎么办？",
      "en": "What if an imagined preference differs from an actual experience?"
    },
    "answer": {
      "zh": "保留这种差异，比较具体活动、限制和代价。故事是提出问题的入口，不要求你按标签生活或重复作答直到满意。",
      "en": "Keep the difference and compare the activity, limits and costs. A story opens questions without requiring life by a label or repeated attempts until satisfied."
    }
  }
];
