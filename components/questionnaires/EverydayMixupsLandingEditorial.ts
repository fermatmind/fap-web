import type { Questionnaire } from "@/lib/questionnaires/types";
export const everydayMixupsLandingSections: Questionnaire["guide"] = [
  {
    "id": "mixups-scope",
    "title": {
      "en": "What this Stupidity Test actually does",
      "zh": "这份“犯蠢测试”实际在做什么"
    },
    "paragraphs": [
      {
        "en": "Twelve original situations invite you to recognize a harmless everyday mix-up. Each offers four examples drawn from six editorial themes: Wrong Target, Wrong Version, One Thing Left Out, Done Twice, Mixed-up Amount and Unspoken Handoff. Choose the example you recognize most readily, even if the resemblance is approximate. Recognition is not an admission that it happened to you.",
        "zh": "12道原创情境邀请你辨认无害的日常小乌龙。每题从六个编辑主题中提供四个例子：对象错位、版本拿错、漏了一项、多做一遍、数量串台和交接没说清。选较容易认出的例子，即使只是大致相像；有印象不等于承认事情发生在你身上。"
      },
      {
        "en": "The playful search name is not a verdict about a person. There is no right-answer key, IQ score, error-rate estimate or fixed personality type. Six descriptive guides explain scenes, counterexamples and differences between outcomes. You may disagree with the editorial mapping or read the guides without answering.",
        "zh": "趣味入口名称不裁定一个人怎样。这里没有正确答案表、智商分、失误率估计或固定人格类型。六篇描述性指南解释情境、反例与结果之间的区别；你可以不同意编辑映射，也可以不答题直接阅读。"
      }
    ]
  },
  {
    "id": "mixups-target-version",
    "title": {
      "en": "Wrong Target or Wrong Version: check where and which copy",
      "zh": "对象错位与版本拿错：去哪里、用哪一份"
    },
    "paragraphs": [
      {
        "en": "Wrong Target concerns the destination or object: the intended label reaches a neighboring box or a page enters another folder. Wrong Version concerns which copy is used: the destination is intended, but the text predates the latest edit. These describe different visible outcomes even when both involve a document.",
        "zh": "对象错位关注去处或对象：该用的标签贴到旁边盒子，或页面放进另一文件夹。版本拿错关注使用哪一份：去处符合原意，文字却是最新修改之前的稿件。即使都涉及文档，两者描述的可见结果也不同。"
      },
      {
        "en": "Imagine a club has a revised poster. Sending the revised poster to another club illustrates a target mismatch; sending the older poster to the intended club illustrates a version mismatch. A deliberate preview to a test list is a counterexample, not automatically an error. The page cannot reconstruct intent from a selected option.",
        "zh": "例如兴趣小组有一张修订海报：把修订稿发给另一小组，说明对象错位；把旧稿发给本小组，说明版本拿错。若本来就约好向测试名单预览，则是反例，不自动算错误。页面无法从一个选项还原意图。"
      }
    ]
  },
  {
    "id": "mixups-missing-repeat",
    "title": {
      "en": "One Thing Left Out or Done Twice: absence and duplication",
      "zh": "漏了一项与多做一遍：缺少和重复"
    },
    "paragraphs": [
      {
        "en": "One Thing Left Out concerns a needed element that is absent, such as a poster’s room number or the cards needed to start a game. Done Twice concerns a repeated contribution, such as an identical page included twice. The examples describe what is missing or duplicated, without deciding whether anyone was inattentive or forgetful.",
        "zh": "漏了一项关注所需元素缺失，例如海报少了房间号、桌游少了开局卡牌。多做一遍关注贡献重复，例如同一页面收进两次。这些例子描述缺少或重复了什么，不判断谁注意力不足或健忘。"
      },
      {
        "en": "A second copy may be intentional when two people need one each; leaving out an optional decoration may follow the agreed plan. Look at the task requirement before calling an outcome a mix-up. A real event can include both an omission and a duplicate, although each quiz option has only one declared theme.",
        "zh": "若两个人各需要一份，第二份可能正合本意；不放可选装饰，也可能符合约定。先看任务要求，再判断是否是乌龙。现实事件可以同时包含遗漏和重复，但每个题目选项只对应一个明确主题。"
      }
    ]
  },
  {
    "id": "mixups-amount-handoff",
    "title": {
      "en": "Mixed-up Amount or Unspoken Handoff: quantity and responsibility",
      "zh": "数量串台与交接没说清：数量和职责"
    },
    "paragraphs": [
      {
        "en": "Mixed-up Amount concerns a number, unit, pair count or scale: five players becomes five tables, or millimeters becomes centimeters. Unspoken Handoff concerns who is doing an action: both helpers assume the other is bringing, saving or sending something. Neither theme establishes mathematical ability, reliability or a communication disorder.",
        "zh": "数量串台关注数字、单位、成对数量或比例，例如五位玩家变成五桌，毫米变成厘米。交接没说清关注谁来行动：两位帮手都以为由对方带来、保存或发送。两类都不能据此确立数学能力、可靠性或沟通障碍。"
      },
      {
        "en": "For a small fictional display, a lid cut in the wrong unit is an amount example. A finished lid that nobody brings because each maker expected the other is a handoff example. If responsibilities were deliberately shared or the dimensions changed by agreement, those details matter more than resemblance to a category.",
        "zh": "以虚构小展台为例，盒盖按错误单位裁剪，是数量例子；盒盖做好后，双方都以为对方会带而无人带来，是交接例子。若职责本就共同承担，或尺寸经过协商改变，这些细节比与类别相像更重要。"
      }
    ]
  },
  {
    "id": "mixups-counts",
    "title": {
      "en": "Twelve choices, balanced exposure and every highest tie",
      "zh": "12次选择、均衡出现与完整最高并列"
    },
    "paragraphs": [
      {
        "en": "Each selected option adds one to its declared theme. All six counts sum to twelve. Every theme appears in eight of the twelve questions, twice in each of the four visible answer positions. Not being offered a theme in a question is not rejecting it; eight is its exposure in this bank, not the number of real-life opportunities to make a mistake.",
        "zh": "每个选中选项为其明确主题加1次，六项计数合计12。每个主题出现在12题中的8题里，四个可见答位各2次。一题没有提供某主题，不算拒绝该主题；8是本题本的出现次数，不是现实中出错的机会数。"
      },
      {
        "en": "For example, counts 3, 3, 2, 2, 1, 1 retain the first two themes together; six counts of 2 retain all six. The bank permits 57 distinct highest-theme sets. A five-way highest tie is impossible with twelve choices across six themes: five at 2 leave 2 for the sixth, making a six-way tie. This arithmetic does not create a validated psychological classification.",
        "zh": "例如3、3、2、2、1、1保留前两个最高主题；六项都是2则全部保留。本题本允许57种不同的最高主题集合。12次选择分配给六个主题时，不可能恰好五项并列最高：若五项各2，剩下第六项也是2，成为六项并列。这种算术不构成经过验证的心理分类。"
      }
    ]
  },
  {
    "id": "mixups-research",
    "title": {
      "en": "An outcome does not reveal why it happened",
      "zh": "看见结果，不等于知道成因"
    },
    "paragraphs": [
      {
        "en": "In human-factors guidance, the UK Health and Safety Executive distinguishes unintended actions, omissions and errors of judgment, and emphasizes task and system conditions. [1] These occupational-safety concepts are background, not the six categories used here. This entertainment bank does not investigate incidents or classify their causes.",
        "zh": "英国健康与安全执行局的人因资料区分非预期动作、遗漏与判断错误，并重视任务和系统条件。[1] 这些职业安全概念仅作为背景，不是本页的六个类别。本娱乐题本不调查事件，也不分类成因。"
      },
      {
        "en": "Knowing that an older draft was used does not tell us whether labels were unclear, access was limited or an agreement changed. A selected example supplies even less evidence: it records recognition between offered scenes. Do not use a count to diagnose attention, memory, intelligence or motives, or to judge another person’s competence.",
        "zh": "知道用了旧稿，仍不能确定是否标签不清、访问受限或约定变了。题目选择提供的证据更少，只记录对所给例子的辨认。不要用计数诊断注意力、记忆、智力或动机，也不凭它判断别人的胜任能力。"
      }
    ]
  },
  {
    "id": "mixups-reading",
    "title": {
      "en": "How to use the six full guides without labeling yourself",
      "zh": "怎样读六篇完整指南，而不给自己贴标签"
    },
    "paragraphs": [
      {
        "en": "Begin with the themes that share the highest count, then compare their scenes and counterexamples. Each guide includes a theme definition, an ordinary scene, a counterexample, comparison with the other five, an optional small observation, context, scoring and source scope. All eight sections are public and remain complete for ties.",
        "zh": "可以先读全部最高主题，再比较情境和反例。每篇包含主题定义、日常场面、反例、与另外五类的比较、可选小观察、情境、计分及来源范围八节。八节均公开开放，并列时也完整保留。"
      },
      {
        "en": "If useful, privately choose one harmless example and distinguish the intended output from what was present. Checking a destination, copy, missing element, duplicate, quantity or handoff can make the description clearer. This is optional, not a treatment plan or a promise to prevent future mistakes. You need not supply the real event to the website.",
        "zh": "若有用，可以私下选一个无害例子，把原定输出与实际存在的东西分开看。核对去处、稿件、缺项、重复、数量或交接，可以让描述更清楚。这是可选观察，不是治疗方案，也不保证预防以后出错，无需把真实事件提供给网站。"
      }
    ]
  },
  {
    "id": "mixups-privacy",
    "title": {
      "en": "Free access, incomplete attempts and optional saving",
      "zh": "免费阅读、未完成作答与自愿保存"
    },
    "paragraphs": [
      {
        "en": "All twelve valid choices are needed before personal counts or interpretations appear. There is no scored skip option; if none of the four examples fits, leave without a result and read every guide. Empty or unknown choices are not filled with a guessed answer, and the page does not turn unfinished work into a zero score.",
        "zh": "12题都有效选择后才出现个人计数或解释。本题本没有计分跳过选项；四项都不适合时，可以无结果退出并阅读全部指南。空白或未知选择不猜测填补，也不会把未完成作答变成零分。"
      },
      {
        "en": "Answers are processed in the browser. Saving is voluntary and uses this tab’s session storage for up to 24 hours; completion, retake or exit-and-clear removes the draft. Copying includes public theme names and a public link without answers or counts. English and Chinese use the same mapping; cross-language measurement equivalence and psychometric validity have not been established.",
        "zh": "回答在浏览器处理，自愿保存使用本标签页会话存储，最多24小时，完成、重测或退出清除即删除草稿。复制包含公开主题名称与公开链接，不含答案或计数。中英文使用相同映射，但尚未建立跨语言测量等值或心理测量效度。"
      }
    ]
  }
];
export const everydayMixupsLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is this a trick-question or general-knowledge test?",
      "zh": "这是脑筋急转弯或常识考试吗？"
    },
    "answer": {
      "en": "No. All four options describe mix-ups, without correct answers. The task is recognition, not solving riddles or proving knowledge.",
      "zh": "不是。四个选项都描述小乌龙，没有正确答案，任务是辨认，不是解谜或证明知识。"
    }
  },
  {
    "question": {
      "en": "Why are there four options but six themes?",
      "zh": "为什么每题四个选项，却有六个主题？"
    },
    "answer": {
      "en": "Each question offers four themes from the six. Across twelve questions every theme appears eight times, with balanced visible positions. An absent theme is not counted as a rejected option.",
      "zh": "每题从六个主题提供四个；12题中每主题出现8次，答位均衡。没有出现的主题不记为被拒绝选项。"
    }
  },
  {
    "question": {
      "en": "Can five themes tie for the highest count?",
      "zh": "能否恰好五个主题并列最高？"
    },
    "answer": {
      "en": "No. With twelve choices, five at a maximum of 2 leave 2 for the sixth; a higher shared maximum exceeds twelve. Six-way ties are possible.",
      "zh": "不能。12次选择中若五项最高均为2，剩余第六项也是2；五项共同更高则超过12。可以六项并列。"
    }
  },
  {
    "question": {
      "en": "Does recognizing an example establish that I made that mistake?",
      "zh": "认出一个例子，是否说明我犯过这种错？"
    },
    "answer": {
      "en": "No. You may know it from a story, a shared task or an approximate resemblance. Recognition does not verify an incident, its cause or its frequency.",
      "zh": "不说明。你可能从故事、共同任务或大致相像的情况认出它，不能确认事件、成因或频率。"
    }
  },
  {
    "question": {
      "en": "Can one real event fit more than one theme?",
      "zh": "同一真实事件能否符合多个主题？"
    },
    "answer": {
      "en": "Yes. The six editorial themes are not exhaustive or mutually exclusive in real life. One mapping per option keeps the game’s counts readable.",
      "zh": "可以。六个编辑主题在现实中并不穷尽所有情况，也不互相排斥；每选项对应一主题，只为让游戏计数清楚。"
    }
  },
  {
    "question": {
      "en": "Does a small count difference identify a primary type?",
      "zh": "计数略高，能确定主类型吗？"
    },
    "answer": {
      "en": "No fixed primary or secondary type is assigned. Exact highest ties are retained; a one-choice gap has no validated psychological interpretation.",
      "zh": "不分配固定主次类型；完全同最高才保留并列，相差一次没有经过验证的心理解释。"
    }
  },
  {
    "question": {
      "en": "Can the result show who is careless or unreliable?",
      "zh": "结果能指出谁粗心或不可靠吗？"
    },
    "answer": {
      "en": "No. Recognition counts do not establish attention, intent, ability or character. Human-factors investigation needs contextual evidence that this game does not collect. [1]",
      "zh": "不能。辨认计数不确立注意力、意图、能力或人品；人因调查需要本游戏未收集的情境证据。[1]"
    }
  },
  {
    "question": {
      "en": "Do I need to send a real file or message?",
      "zh": "需要发送真实文件或消息吗？"
    },
    "answer": {
      "en": "No. The scenes are provided. Do not supply real accounts, files, messages or another person’s experiences to complete them.",
      "zh": "不需要，页面已经提供情境，完成选择不需要真实账户、文件、消息或别人的经历。"
    }
  }
];
export const everydayMixupsLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "HSE: managing human failures (background, not this game’s taxonomy)",
      "zh": "英国HSE：人因失误管理（背景，非本游戏分类）"
    },
    "url": "https://www.hse.gov.uk/humanfactors/topics/humanfail.htm"
  }
];
