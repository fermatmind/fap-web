import type { Questionnaire } from "@/lib/questionnaires/types";
export const energyRhythmLandingSections: Questionnaire["guide"] = [
  {
    "id": "energy-rhythm-scope",
    "title": {
      "en": "Energy & Flow Profile: four recent-experience topics",
      "zh": "精力与专注节奏自评：四组近期经验"
    },
    "paragraphs": [
      {
        "en": "This original twenty-item self-report asks about the past two weeks. Its four five-item topics concern earlier parts of your waking day, bounded effort blocks, low-interruption conditions and willingness to return after ordinary pauses. Each topic has its own record and complete guide.",
        "zh": "本原创二十题自评回看过去两周，每组五题，分别观察清醒时段较早的活动偏好、有边界的分段投入、低干扰条件与普通暂停后的返回意愿。四组各有独立记录和完整指南。"
      },
      {
        "en": "The title uses energy and flow as everyday language. The questions do not establish biological energy, a circadian phase or a psychological flow state. The useful output is a structured account of what felt inviting in recent situations, rather than a diagnosis or an optimal timetable.",
        "zh": "标题中的精力与节奏用于描述日常体验，题目不确定生理能量、昼夜节律相位或心理学心流状态。有用的结果是整理近期哪些情境让你愿意投入，而不是诊断或最优时间表。"
      }
    ]
  },
  {
    "id": "energy-rhythm-topics",
    "title": {
      "en": "What each topic can help you notice",
      "zh": "四个主题分别观察什么"
    },
    "paragraphs": [
      {
        "en": "Earlier-day items compare earlier and later parts of a waking day when demands are reasonably comparable; they do not require a particular clock time. Effort-block items concern visible stopping points, separate passes and opportunities to reassess, without prescribing a fixed work–break interval.",
        "zh": "较早时段题目比较负担大致相当时，清醒一天中较早与较晚部分的投入偏好，不指定钟点。分段投入题目关注可见的停止点、分次处理与重新判断的机会，不规定固定工作休息间隔。"
      },
      {
        "en": "Focus-condition items concern notifications, visible materials and predictable surroundings. Pause-noticing items concern the willingness you noticed after a pause. Wanting quiet does not show greater attention capacity; feeling ready to return does not demonstrate restored performance or explain why the feeling changed.",
        "zh": "专注条件题目关注通知、眼前材料与可预期的环境。暂停感受题目关注暂停后察觉的返回意愿。喜欢安静不证明注意能力更强，愿意返回也不证明表现已恢复，或解释感受变化的原因。"
      }
    ]
  },
  {
    "id": "energy-rhythm-response",
    "title": {
      "en": "Keep the two-week reference consistent",
      "zh": "保持两周参照与选项含义一致"
    },
    "paragraphs": [
      {
        "en": "Use recent activities you could reasonably choose, rather than an ideal routine or the most unusual day you remember. A rating of 1–5 describes how well the statement fits. Three means partly describes it or depends; it is a numeric response, not an unscored uncertainty category.",
        "zh": "以近期有一定选择空间的活动为参照，不按理想作息或最特殊的一天回答。1至5表示题文符合程度；3表示部分符合或视情况，是数字回答，不是不计分的不确定类别。"
      },
      {
        "en": "Choose the unscored option when there was no suitable opportunity or you prefer not to rate. Every prompt still needs a response before a personal record appears. An unscored response is excluded from arithmetic; an unanswered prompt prevents completion. Neither is silently replaced by zero.",
        "zh": "没有合适机会或不想评价时可选不评分。生成个人记录前，每题仍需回应。不评分项排除在运算之外，未回答则不能完成，两者都不会被悄悄补为零。"
      }
    ]
  },
  {
    "id": "energy-rhythm-calculation",
    "title": {
      "en": "Recalculate a mean and its coverage together",
      "zh": "把均值与回答覆盖一起复算"
    },
    "paragraphs": [
      {
        "en": "For each five-item topic, add only numeric ratings. With at least three numeric answers, divide the sum by their count and round to one decimal. Ratings 2, 3, 4, 4 and one unscored response give a sum of 13, coverage 4/5 and a mean of 3.3/5. There are no reverse-scored items.",
        "zh": "每组五题只加总数字项，至少三项数字才用原始和除以数字项数，并保留一位小数。2、3、4、4与一项不评分，得到原始和13、覆盖4/5、均值3.3/5。题目没有反向计分。"
      },
      {
        "en": "Ratings 4, 4 and three unscored responses retain a sum of 8 and coverage 2/5, but no mean. Three fours and two unscored responses give 12, 3/5 and 4.0/5. The threshold is this edition’s display rule, not evidence that three answers ensure reliable measurement.",
        "zh": "4、4与三项不评分保留原始和8、覆盖2/5，但不计算均值；三个4与两项不评分则为12、3/5、4.0/5。这个门槛是本版展示规则，不证明三项回答就能确保可靠测量。"
      }
    ]
  },
  {
    "id": "energy-rhythm-interpretation",
    "title": {
      "en": "Four separate readings, without a winning type",
      "zh": "四组分别阅读，不选胜出类型"
    },
    "paragraphs": [
      {
        "en": "A larger mean indicates greater endorsement of that topic’s wording among the rated items. The four means are not added, ranked or converted into a dominant energy type. All four full guides remain available even when a topic has too few numeric responses or every response is unscored.",
        "zh": "均值较大表示已评分题目中，对该组说法的认同更高。四组均值不相加、不排名，也不生成主导精力型。即使某组数字不足或全部不评分，四篇完整指南仍可阅读。"
      },
      {
        "en": "Equal means can hide different item patterns and different coverage. Five threes and ratings 1, 2, 3, 4, 5 both average 3.0, despite different answers. Read the item record and compare situations before drawing a practical conclusion; decimal precision is not a percentile or an accuracy estimate.",
        "zh": "相同均值可能隐藏不同逐项模式与覆盖。五个3和1、2、3、4、5均为3.0，但回答不同。作实际判断前，应回看逐题记录和具体情境；小数精度不是百分位或准确率。"
      }
    ]
  },
  {
    "id": "energy-rhythm-research",
    "title": {
      "en": "Flow research and chronotype tools measure other constructs",
      "zh": "心流研究与作息型工具测量其他概念"
    },
    "paragraphs": [
      {
        "en": "Flow research distinguishes a state during an activity from a more general disposition to experience flow. Research instruments examine multiple features of that experience and require their own validation. The FSS-2 and DFS-2 validation study illustrates that distinction. [1] This page’s low-interruption preferences do not administer either instrument.",
        "zh": "心流研究区分活动中的状态与较一般的心流体验倾向，研究工具考察体验的多个方面，并需各自的验证。FSS-2与DFS-2的验证研究体现了这种区分。[1] 本页的低干扰偏好并未施测其中任何工具。"
      },
      {
        "en": "This page also records no sleep or wake times and assigns no morningness–eveningness category. Earlier in a waking day is a relative activity reference, not a biological-clock reading. External findings cannot supply reliability, norms, causal effects or English–Chinese equivalence for this original twenty-item edition.",
        "zh": "本页也不记录入睡或起床时间，不分配晨型或夜型。清醒一天中较早是相对活动参照，不是生物钟测量。外部研究不能为本原创二十题版本提供信度、常模、因果效果或中英文等值证据。"
      }
    ]
  },
  {
    "id": "energy-rhythm-application",
    "title": {
      "en": "An optional observation in one ordinary activity",
      "zh": "可选：在一项普通活动中观察"
    },
    "paragraphs": [
      {
        "en": "Choose one low-stakes activity and one condition to notice, such as whether silencing an optional notification changes your willingness to continue. Keep the task and available time reasonably comparable. Note both a fitting example and a counterexample rather than trying to increase every mean.",
        "zh": "可选一项轻量活动和一个条件，例如关闭一条非必要通知后，自己是否更愿意继续。尽量保持任务和可用时间大致相当，同时记录符合与不符合的例子，而不是设法提高每组均值。"
      },
      {
        "en": "This observation is voluntary and does not establish a treatment or productivity effect. The questionnaire does not select an ideal block length, prescribe sleep changes or assess attention disorders, fatigue or recovery capacity. A later score difference may reflect opportunities, interpretation or recent circumstances as well as changed preferences.",
        "zh": "这种观察自愿进行，不能确立治疗或生产力效果。问卷不选择理想分段长度、不规定睡眠调整，也不评估注意障碍、疲劳或恢复能力。之后读数不同，可能与机会、理解、近期情境或偏好变化有关。"
      }
    ]
  },
  {
    "id": "energy-rhythm-access",
    "title": {
      "en": "Full explanations and private answer records",
      "zh": "完整解释与私人回答记录"
    },
    "paragraphs": [
      {
        "en": "Use the public guides to understand each topic before or after answering. Your personal record reports numeric coverage, sums and available means separately, alongside all twenty responses. The guides explain examples and limits; they are not evidence that a particular guide describes your whole personality.",
        "zh": "答题前后均可通过公开指南了解主题。个人记录分别显示数字覆盖、原始和、可计算的均值与全部二十项回应。指南解释例子与范围，不证明某篇指南描述了你的整个人格。"
      },
      {
        "en": "Calculation takes place in the browser. Saving progress is optional; a tab-session draft expires after 24 hours and clears on completion, retake or exit-and-clear. The copy action provides public guide links without private answers or means. Starting the questionnaire goes directly to the first question.",
        "zh": "计算在浏览器内完成，保存进度自愿；标签页会话草稿24小时后失效，完成、重测或退出清除即删除。复制仅提供公开指南链接，不含私人回答或均值。点击开始直接进入第一题。"
      }
    ]
  }
];
export const energyRhythmLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does earlier-day mean early morning?",
      "zh": "较早时段就是清晨吗？"
    },
    "answer": {
      "en": "No. It refers to an earlier part of your own waking day under reasonably comparable demands, not a clock-time or sleep-timing category.",
      "zh": "不是。它指负担大致相当时，你清醒一天中较早的部分，不是钟点或睡眠时点分类。"
    }
  },
  {
    "question": {
      "en": "Is a rating of three uncertainty?",
      "zh": "3分表示不确定吗？"
    },
    "answer": {
      "en": "Three is a numeric partly-describes-it / depends response. Use the separate unscored option when you do not want to provide a rating.",
      "zh": "3是部分符合／视情况的数字回答，不想提供评分时应选择另列的不评分选项。"
    }
  },
  {
    "question": {
      "en": "Why is a mean withheld after two numeric answers?",
      "zh": "为什么两项数字不显示均值？"
    },
    "answer": {
      "en": "Each five-item topic requires at least three numeric answers under this edition’s display rule. Its count and available raw sum remain visible.",
      "zh": "本版展示规则要求每组五题至少三项数字；数字项数和可用原始和仍保留。"
    }
  },
  {
    "question": {
      "en": "Can all four topics be high together?",
      "zh": "四组能同时较高吗？"
    },
    "answer": {
      "en": "Yes. They are independently rated topics, not mutually exclusive types. The page does not select a winner or calculate an overall score.",
      "zh": "可以。四组独立评分，不是互斥类型，页面不选胜出项，也不计算总分。"
    }
  },
  {
    "question": {
      "en": "Does the focus topic measure a flow state?",
      "zh": "专注条件是否测量心流状态？"
    },
    "answer": {
      "en": "No. Preferring fewer interruptions does not establish the multidimensional experience assessed in flow research. [1]",
      "zh": "不测量。偏好较少干扰，不等于心流研究所评估的多方面体验。[1]"
    }
  },
  {
    "question": {
      "en": "Does a higher pause mean prove recovery?",
      "zh": "暂停感受均值较高是否证明恢复更好？"
    },
    "answer": {
      "en": "No. It summarizes reported willingness after ordinary pauses, without measuring recovery, performance change or the cause of a change.",
      "zh": "不证明。它概括普通暂停后的自报投入意愿，没有测量恢复、表现变化或变化原因。"
    }
  },
  {
    "question": {
      "en": "Can two different answer patterns have the same mean?",
      "zh": "不同回答可以有相同均值吗？"
    },
    "answer": {
      "en": "Yes. Five threes and 1, 2, 3, 4, 5 both average 3.0. Check the item responses and numeric coverage as well as the mean.",
      "zh": "可以。五个3与1、2、3、4、5都平均3.0，应同时查看逐项回应与数字覆盖。"
    }
  },
  {
    "question": {
      "en": "Do I have to achieve a score before reading the guides?",
      "zh": "必须取得分数才能看指南吗？"
    },
    "answer": {
      "en": "No. All four complete public guides are available without a personal record, including when you prefer not to rate any item.",
      "zh": "不需要。无需个人记录即可阅读四篇完整公开指南，包括不想为任何题目评分时。"
    }
  }
];
export const energyRhythmLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "FSS-2 and DFS-2 validation: state and dispositional flow",
      "zh": "FSS-2与DFS-2验证研究：状态与倾向的区分"
    },
    "url": "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.818036/full"
  }
];
