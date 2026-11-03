import type { Questionnaire } from "@/lib/questionnaires/types";
export const relationshipHabitsLandingSections: Questionnaire["guide"] = [
  {
    "id": "relationship-habits-purpose",
    "title": {
      "en": "Relationship habits: four kinds of ordinary moments",
      "zh": "关系相处习惯：观察四类日常时刻"
    },
    "paragraphs": [
      {
        "en": "This original sixteen-prompt reflection records how often you report wanting space, keeping a mental fairness tally, delaying a wanted conversation and giving beyond your available capacity. The four parts are separate perspectives on one chosen close relationship. They do not compete for a single label, and more frequent endorsement is not automatically better or worse.",
        "zh": "本原创十六题反思记录四类自报频率：想留空间、心里记录付出是否平衡、延后本想谈的话题，以及付出超过可用余量。四部分从不同角度观察你选定的一段亲近关系，不争夺一个标签；报告得更频繁，不自动等于更好或更坏。"
      },
      {
        "en": "A wish for a pause, for example, leaves open what happened before it, how it was expressed and whether there was a later return. Similarly, noticing unequal effort does not establish the complete division of work. Read the result as a description of the stated moments from your side, then use concrete context to understand what the summary cannot tell you.",
        "zh": "例如，想暂停并未说明此前发生了什么、怎样表达、后来是否返回；注意到付出不平衡，也不能确定完整分工。应把结果读作自己一侧对所述时刻的描述，再通过具体情境理解摘要没有告诉你的部分。"
      }
    ]
  },
  {
    "id": "relationship-habits-context",
    "title": {
      "en": "One adult close person, the same three-month reference",
      "zh": "怎样作答：同一位亲近成年人、同一个三个月参照"
    },
    "paragraphs": [
      {
        "en": "Keep the same adult close person in mind throughout, without entering a name or identifying details. Review your own side over the past three months, using the five frequency anchors from never to almost always. The middle response, 3, means sometimes. It is not a neutral opinion or a rating of whether you approve of the behaviour.",
        "zh": "全程以同一位亲近的成年人为参照，不输入姓名或可识别资料。回看过去三个月自己一侧的情况，从从不到几乎每次的五个频率选项中选择；中间值3表示有时，不是观点中立，也不表示你赞同这种做法。"
      },
      {
        "en": "If no experience fits, you cannot recall enough, or you prefer not to answer, choose unscored. Do not treat an unfamiliar situation as never just to complete the summary. Different opportunities matter: one person may have faced many requests and another very few. The questionnaire does not count those opportunities, so its ratings are not event rates or directly comparable numbers of incidents.",
        "zh": "没有合适经历、回忆不足或不愿回答时，可以选未评分，不必为了生成摘要把陌生情境填成从不。机会多少也有影响：有的人面对很多请求，有的人很少遇到。本问卷没有统计这些机会，因此评分不是事件发生率，也不是可直接比较的事件次数。"
      }
    ]
  },
  {
    "id": "relationship-habits-space-fairness",
    "title": {
      "en": "Space and fairness tallies: return to what actually happened",
      "zh": "空间与心里记账：回到实际发生的事"
    },
    "paragraphs": [
      {
        "en": "The space-and-pauses prompts concern wanting uninterrupted time or room before reconnecting. Frequency alone cannot distinguish a communicated rest from an indefinite withdrawal, determine motives or identify an attachment style. In its public conflict guidance, Relate recommends considering the wider situation and choosing a calmer time to talk. [1] That contextual approach is useful here, without turning the mean into a rule about how long anyone must wait.",
        "zh": "空间与暂停题关注重新联系前想保留时间或余地的时刻。仅凭频率，不能区分已说明的休息与无期限退出，不能确定动机或依恋类型。Relate的公开冲突指南建议考虑更广情境，并选择较平静的时机沟通。[1] 这种情境视角有助于阅读本页，但不把均值变成任何人必须等待多久的规则。"
      },
      {
        "en": "Mental fairness tallies concern keeping track in your mind of initiative, favours or effort. They may point toward a question worth checking, but a tally is not an independently verified account of fairness. Look for the tasks, time, expectations and constraints you actually know about; avoid inferring another person’s contribution or intention from your own score.",
        "zh": "心里记账关注在脑中记录主动发起、帮忙或付出的时刻。它可以提示一个值得核对的问题，但不是经过独立验证的公平账目。可以查看自己确实知道的任务、时间、预期与限制，不从自己的分数推断另一人的贡献或意图。"
      }
    ]
  },
  {
    "id": "relationship-habits-delay-giving",
    "title": {
      "en": "Delayed talks and extra giving: distinguish action from explanation",
      "zh": "延后谈话与额外付出：区分行动及其解释"
    },
    "paragraphs": [
      {
        "en": "Delaying a conversation records postponing something you had wanted to discuss. The number does not establish why it was delayed or what followed. Agreeing a later time, repeatedly leaving a topic unresolved and not having a safe or practical opportunity are different situations. The prompts do not verify which explanation applies; retain the actual setting rather than assigning a character judgement.",
        "zh": "延后谈话记录的是把本想讨论的事情往后放，不确定为什么延后或之后发生什么。约定稍后再谈、反复留下未处理的话题，以及缺少安全或可行的机会，是不同情形。题目不验证哪种解释成立，应保留实际场景，不据此作性格判定。"
      },
      {
        "en": "Giving beyond capacity concerns agreeing to extra help or effort before accounting for your own available time and resources. It is distinct from all forms of generosity: freely chosen help within capacity and a commitment that exceeds it are not identical. A frequency reading does not certify kindness, diagnose people-pleasing, show that someone exploited you or determine what you owe another person.",
        "zh": "超出余量付出关注尚未充分考虑自己的可用时间与资源，就答应额外帮忙或投入。它不同于所有慷慨行为：余量内自愿帮忙，与承诺超出余量，并非同一回事。频率读数不认证善良、不诊断讨好、不证明有人利用你，也不决定你欠别人什么。"
      }
    ]
  },
  {
    "id": "relationship-habits-arithmetic",
    "title": {
      "en": "Calculation and bars: three numeric responses out of four",
      "zh": "计分与条形：四题中至少三题数字评分"
    },
    "paragraphs": [
      {
        "en": "Each part contains four prompts. Add its numeric ratings and divide by the number rated; display the mean to one decimal only when at least three ratings are numeric. For example, 2, 4 and 5 sum to 11; 11 ÷ 3 is about 3.67, displayed as 3.7 / 5 with 3/4 rated. The unscored fourth response is excluded, not replaced with zero or sometimes. No items are reverse-scored.",
        "zh": "每部分四题，将数字评分相加，再除以有效项数；至少三项数字评分时，才显示一位小数的均值。例如2、4、5之和为11，11÷3约为3.67，显示3.7/5，同时注明3/4项有效。第四项未评分被排除，不补成零或有时；本题本没有反向计分。"
      },
      {
        "en": "Two numeric fives are still insufficient for that part. The three-item requirement is a reporting rule, not an established reliability threshold. The bar places the mean between 1 never and 5 almost always. A midpoint bar is not a claim that an event happened half the time, and an empty bar at 1 still represents a valid never rating rather than missing information.",
        "zh": "只有两项数字5，仍不足以生成该部分均值。三项要求是报告规则，不是已建立的信度阈值。条形只把均值放在1从不到5几乎每次之间；位于中点不表示事件发生了一半次数，位于1的空条也仍是有效的从不评分，不是缺失资料。"
      }
    ]
  },
  {
    "id": "relationship-habits-interpret",
    "title": {
      "en": "Read separate patterns, without a red-flag total",
      "zh": "分别阅读四项，不合成红旗总分"
    },
    "paragraphs": [
      {
        "en": "All four parts can be high, low or equal. The displayed means do not add to one hundred and the page does not rank them. Equal values can also hide different responses: 1, 3 and 5 with one unscored item give 3.0, as do four ratings of 3. The first pattern includes contrasting moments and less rated coverage; the second reports sometimes throughout.",
        "zh": "四项可以都高、都低或相同，显示均值不加到百分之百，页面也不排序。相同数值可能隐藏不同回答：1、3、5加一项未评分得到3.0，四项都选3也得到3.0；前者包含差异较大的时刻且有效项较少，后者各项都报告有时。"
      },
      {
        "en": "These are self-reports about a selected recent context, not observations of another person. A high or low mean cannot establish objective fairness, a cause, an outcome, danger or safety. Comparing attempts also requires checking the person in mind, opportunity, recall and which items were rated. This original bank has no established measurement-error interval or threshold for a meaningful change.",
        "zh": "这些是对选定近期场合的自我报告，不是对另一人的观察记录。较高或较低均值都不能确定客观公平、原因、后果、危险或安全。比较两次作答时，还要核对所想的人、遇到的机会、回忆以及哪些条目获得评分。本原创题本没有已建立的测量误差区间或有意义变化阈值。"
      }
    ]
  },
  {
    "id": "relationship-habits-use",
    "title": {
      "en": "Keep one concrete observation and an optional small adjustment",
      "zh": "保留一个具体观察，选择是否作小调整"
    },
    "paragraphs": [
      {
        "en": "Pick one ordinary event behind a prompt. Separate the event, your interpretation and any action you might try. For example: “I agreed to three extra tasks before checking my calendar. Next time I could check the time I have before replying.” This is an original reflection example, not a new scored item or an instruction to refuse all help. Notice whether the adjustment is practical, without treating a lower score as the goal.",
        "zh": "可以选一道题背后的普通事件，将事件、自己的解释与可能尝试的行动分开。例如：“我还没看日程，就答应了三项额外任务。下次可以先确认可用时间，再答复。”这是原创反思例子，不是新增计分题，也不要求拒绝所有帮助。可观察调整是否可行，不把降分当目标。"
      },
      {
        "en": "You can reflect privately, stop, or discuss a specific expectation if the discussion is welcome. No result requires contacting the other person, sharing answers or accepting unwanted demands. Educational guidance from love is respect treats boundaries as personal choices to communicate and respect, rather than tools for controlling someone else. [2] This questionnaire does not assess whether any particular relationship is safe to discuss.",
        "zh": "你可以私下反思、到此停止，或在对话受欢迎时讨论一项具体预期。结果不要求联系另一人、分享答卷或接受不愿承担的要求。love is respect的教育指南将边界视为需要沟通和尊重的个人选择，不是控制别人的工具。[2] 本问卷不评估某一段关系是否适合安全地展开讨论。"
      }
    ]
  },
  {
    "id": "relationship-habits-evidence",
    "title": {
      "en": "Original method, complete guides and private answering",
      "zh": "原创方法、完整指南与私人作答"
    },
    "paragraphs": [
      {
        "en": "FermatMind independently authored these sixteen prompts and four long guides. Reliability, validity, norms and English–Chinese measurement equivalence have not been established. This is not an attachment inventory, self-silencing scale or published conflict questionnaire. The educational references explain context and boundaries; their research or professional status does not validate this original bank.",
        "zh": "这十六条题目与四篇长指南由费马独立编写，尚未建立信度、效度、常模或英中文测量等值。它不是依恋问卷、自我沉默量表或已发表冲突问卷。教育参考解释情境与边界，其研究或专业地位不验证本原创题本。"
      },
      {
        "en": "Start opens question one directly, without another participation agreement. The questions and all four full guides are free without signup. Answers stay in this page unless you explicitly save a tab draft for up to twenty-four hours; completion, exit-and-clear or retaking removes it. Sharing copies only the public title and entry link. Optional anonymous activity counting is separate and includes no answers or frequency readings.",
        "zh": "点击开始直接进入第一题，无需再同意参与声明。题目与四篇完整指南均免费，无需注册。回答保留在本页，只有主动选择才保存最多24小时的标签页草稿；完成、退出清除或重测时删除。分享只复制公开标题与入口。可选匿名活动计数独立于作答，不包含答案或频率读数。"
      }
    ]
  }
];
export const relationshipHabitsLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Whose behaviour should I rate?",
      "zh": "应该评价谁的行为？"
    },
    "answer": {
      "en": "Keep one adult close person in mind and rate only your own side over the past three months. Do not alternate between several relationships or answer as you think the other person would. No name is requested.",
      "zh": "以同一位亲近成年人为参照，只评过去三个月自己一侧的情况；不要在多段关系间切换，也不替另一人作答。无需输入姓名。"
    }
  },
  {
    "question": {
      "en": "Is sometimes the same as uncertain?",
      "zh": "有时和不确定是一回事吗？"
    },
    "answer": {
      "en": "No. Sometimes is a valid numeric 3. Uncertain, unsuitable or declined responses stay unscored. They count as responses but not as numeric observations in the mean.",
      "zh": "不是。有时是有效数字3；不确定、不适用或不愿回应时保持未评分。它算回应，不进入均值中的数字观测。"
    }
  },
  {
    "question": {
      "en": "Does wanting a pause mean avoidance or an attachment type?",
      "zh": "想暂停就代表回避或某种依恋类型吗？"
    },
    "answer": {
      "en": "No. The score does not establish purpose, communication or what happened next. A communicated pause and an indefinite withdrawal can have different contexts; this reflection does not classify either from frequency alone.",
      "zh": "不代表。分数不确定目的、沟通方式或之后发生什么。已说明的暂停与无期限退出可能有不同场合，本反思不只凭频率作分类。"
    }
  },
  {
    "question": {
      "en": "Does my mental tally prove the work is unequal?",
      "zh": "心里记账能证明付出不公平吗？"
    },
    "answer": {
      "en": "It records that you reported tracking balance, not an independently checked account of tasks, time or responsibility. Look at actual arrangements and known constraints rather than treating the mean as proof about another person.",
      "zh": "它记录你报告了心里追踪平衡的时刻，不是独立核对的任务、时间或责任账目。应查看实际安排与已知限制，不把均值当作判断别人的证据。"
    }
  },
  {
    "question": {
      "en": "How does the example produce 3.7?",
      "zh": "算例中的3.7怎样得到？"
    },
    "answer": {
      "en": "Three ratings of 2, 4, 5 sum to 11. Divide by three to get about 3.67, displayed to one decimal as 3.7. An unscored fourth item is excluded; two numeric ratings would be insufficient.",
      "zh": "2、4、5这三项之和为11，除以三约3.67，取一位小数为3.7。第四项未评分被排除，只有两项数字时则资料不足。"
    }
  },
  {
    "question": {
      "en": "Is a bar halfway across a 50% habit rate?",
      "zh": "条形到一半就表示发生率50%吗？"
    },
    "answer": {
      "en": "No. It places a mean within the ordered 1–5 response range. The page did not count incidents or opportunities, so bar width is not an event percentage, a percentile or a danger probability.",
      "zh": "不是。它只把均值定位在有序的1至5选项范围。页面没有统计事件与机会，因此条宽不是发生百分比、人群百分位或危险概率。"
    }
  },
  {
    "question": {
      "en": "Should I try to make all four numbers smaller?",
      "zh": "应该让四个数字都变小吗？"
    },
    "answer": {
      "en": "There is no target score. Consider what an actual moment meant, any useful role or cost, and a practical adjustment if wanted. The page does not establish that less of every habit is always better.",
      "zh": "本页没有目标分数。可以理解实际时刻的意义、可能用途与代价，并按意愿选择可行调整；不能据此认定每一种习惯越少越好。"
    }
  },
  {
    "question": {
      "en": "Must I share answers or accept another statement before starting?",
      "zh": "开始前必须分享答案或再同意一次吗？"
    },
    "answer": {
      "en": "No. Start enters the first question directly. Sharing, tab saving and anonymous activity counting are optional. You can also read every guide without answering or involving the other person.",
      "zh": "不需要。开始按钮直接进入第一题；分享、标签页保存和匿名活动计数均可选。也可以不作答、不让另一人参与，直接读所有指南。"
    }
  }
];
export const relationshipHabitsLandingReferences = [
  {
    "title": {
      "en": "Relate: context and communication when arguments repeat",
      "zh": "Relate：反复争论时的情境与沟通"
    },
    "url": "https://www.relate.org.uk/get-help/we-cant-stop-arguing"
  },
  {
    "title": {
      "en": "love is respect: personal boundaries and communicating choices",
      "zh": "love is respect：个人边界与选择的沟通"
    },
    "url": "https://www.loveisrespect.org/resources/what-are-my-boundaries/"
  }
];
