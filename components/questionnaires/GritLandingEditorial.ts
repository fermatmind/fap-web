import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Entry supplement; original frequency items and source-bound guides are preserved. */
export const gritLandingSections: QuestionnaireSection[] = [
  {
    "id": "grit-two-practices",
    "title": {
      "zh": "目标延续与努力续接：方向、方法与投入有什么区别？",
      "en": "Goal continuity and returning to effort: distinguish direction, method and investment"
    },
    "paragraphs": [
      {
        "zh": "长期目标的延续关注几个月里的安排是否仍围绕同一方向，包括为目标保留位置、核对新机会与原方向的关系，以及阶段结束后怎样接续。它不是每天使用相同方法。例如长期想掌握一门语言，可以调整教材、练习场景或每周节奏，目标仍可能相同；改了方法不能直接当作兴趣不稳定。",
        "en": "Continuity of a Long-Term Aim concerns whether arrangements across months remain connected to one direction: keeping a place for it, checking new opportunities against it and connecting stages. It does not require the same daily method. An aim to learn a language can continue while materials, practice settings or weekly schedules change. A different method alone does not establish unstable interests."
      },
      {
        "zh": "受阻之后的努力续接关注有可行条件时，怎样从小障碍、慢进展、未奏效的方法或一段暂停中找到下一步。它与方向是否延续不是同一个问题：你可能方向清楚，却暂时缺少时间；也可能在每次尝试上认真投入，但正在重新考虑长期方向。两份说明可以合读，不把人分成“高高、低低”等四种类型。",
        "en": "Returning to Effort After Setbacks concerns finding a feasible next step after obstacles, slow progress, an unsuccessful approach or a pause. It is distinct from keeping a direction. Your aim may be clear while time is unavailable, or you may work seriously on each attempt while reconsidering the longer direction. Read the guides together without classifying people into four high/low types."
      }
    ]
  },
  {
    "id": "grit-reference-opportunity",
    "title": {
      "zh": "为什么先选同一目标？六个月、机会与不适用",
      "en": "Why choose one aim? Six months, opportunity and NA"
    },
    "paragraphs": [
      {
        "zh": "本卷要求回顾同一项目标，不在回答之间更换参照；不需要告诉网站目标是什么。选择的是原计划持续半年以上的目标，不要求已经坚持满半年。过去六个月中尚未开始、没有相关机会或不愿回顾的条目，可保留不适用；不要用另一个目标的经历填空，也不把没有机会写成“从不”。",
        "en": "Keep the same aim throughout without telling the website what it is. Choose an aim originally intended to last at least six months; you do not have to have pursued it for six completed months. An item may be NA if the aim had not begun during the review window, no relevant opportunity arose or you prefer not to revisit it. Do not fill gaps from a different aim or treat lack of opportunity as Never."
      },
      {
        "zh": "频率同时受工作、照护、费用、健康、学习资源与他人安排等条件影响。一次投入较少，可能是机会受限，也可能是目标已不合适，不能仅凭选项分辨。先说明自己当时有哪些可行选择，再读均分；若没有合适目标，可以不作答，或以不适用完成并先阅读公开指南。",
        "en": "Frequency depends on conditions such as work, care responsibilities, cost, health, learning resources and others’ schedules. Less activity may reflect restricted opportunity or an unsuitable aim; a response alone cannot distinguish them. Consider which choices were feasible before reading a mean. Without a suitable aim, you can stop or complete with NA and read the public guides."
      }
    ]
  },
  {
    "id": "grit-worked-scoring",
    "title": {
      "zh": "四条反向怎样处理？六条有效与五条有效的算例",
      "en": "How do the four reversals work? Examples with six versus five ratings"
    },
    "paragraphs": [
      {
        "zh": "第9、10、11、12条是反向表述，1变5、2变4、3仍为3、4变2、5变1；其余12条直接计分。不适用先排除，不当0、不做6减不适用。每部分独立计算，至少六条有效，才用该部分计分和除以有效条数；完整八条时分母为8，六条时分母为6。",
        "en": "Items 9, 10, 11 and 12 are opposing statements: 1 becomes 5, 2 becomes 4, 3 stays 3, 4 becomes 2 and 5 becomes 1. The other twelve items are direct. Exclude NA first, rather than treating it as zero or subtracting it from six. Each part needs six ratings and divides its own keyed sum by its rated count: eight for eight ratings, six for six."
      },
      {
        "zh": "例如目标延续组在反向处理后的八条值为1、1、2、2、2、2、不适用、不适用，计分和10、有效六条，显示10÷6=1.67/5。另一组若只有五个有效4，计分和20仍显示资料不足，不把20÷5显示为个人均分。均分直接来自未舍入计分和，不从通用的一位小数1.7倒推；两位小数也不证明测量精度。",
        "en": "For keyed values of 1, 1, 2, 2, 2, 2, NA, NA in goal continuity, the sum is 10 with six ratings, displaying 10÷6=1.67/5. If the other part has only five valid ratings of 4, its sum of 20 still produces insufficient information, not a personal mean of 20÷5. Report means use unrounded sums rather than reconstruction from a generic one-decimal 1.7. Two decimals do not establish measurement precision."
      }
    ]
  },
  {
    "id": "grit-standard-research",
    "title": {
      "zh": "与Grit-O、Grit-S有何区别？研究支持与本站证据",
      "en": "How does this differ from Grit-O and Grit-S? Research and form-specific evidence"
    },
    "paragraphs": [
      {
        "zh": "Duckworth将grit讨论为长期目标中的热情与坚持，强调它不同于一时强烈的愿望。[1] 本站以两个具体观察主题回顾六个月做法，并未使用她的标准量表题库。相近的主题名称不能让16道原创频率题自动成为Grit-O、Grit-S、它们的有效替代版，或多年稳定特质的测量。",
        "en": "Duckworth discusses grit as passion and perseverance for long-term goals, distinguishing it from momentary intensity.[1] This form reviews six months of practices through two specific topics without using her scale items. Similar topic names do not make sixteen original frequency items Grit-O, Grit-S, a validated replacement or a measure of a stable years-long trait."
      },
      {
        "zh": "Credé等（2017）的元分析综合88个独立样本、66,807人，指出grit与尽责性高度相关，努力坚持与结果的关联比兴趣一致性更强，并质疑单一高阶构念及广泛成功叙事。[3] 这些是所纳入量表与样本的研究，不能把关联当成个人成功概率，也不证明本站题本有效。本题本尚未建立自身信度、效度、常模和中英文测量等价性。",
        "en": "Credé et al.’s 2017 meta-analysis of 88 independent samples and 66,807 people found strong overlap with conscientiousness, stronger criterion relationships for perseverance than consistency, and questioned the higher-order construct and broad success narrative.[3] These findings concern included measures and samples, not individual success probabilities or validation of this form. Its reliability, validity, norms and English–Chinese measurement equivalence remain unestablished."
      }
    ]
  },
  {
    "id": "grit-flexible-adjustment",
    "title": {
      "zh": "坚持是否总是更好？调整、脱离与重新投入",
      "en": "Is more persistence always better? Adjustment, disengagement and reengagement"
    },
    "paragraphs": [
      {
        "zh": "Wrosch等（2003）在三项研究中考察不可达目标的脱离、替代目标的重新投入与主观幸福感的关联，提示目标调整同样值得研究。[4] 这不是“放弃就会更幸福”的因果保证，也不是对你某项目标不可达的判断。本页不能仅凭均分决定应继续还是停止。",
        "en": "Wrosch et al.’s 2003 three-study research examined associations between disengagement from unattainable goals, reengagement with alternatives and subjective well-being, supporting attention to goal adjustment.[4] It provides neither a causal guarantee that quitting improves well-being nor a judgment that your aim is unattainable. This page cannot decide continuation or stopping from means."
      },
      {
        "zh": "可以区分三个问题：方向是否仍值得投入，当前方法是否可行，继续投入的代价是否可承受。换一个练习方法、延长时间、寻求资源、休息、暂停或重新选择目标，都可能是需要考虑的方案。也不要把高均分解读成必须坚持的命令，把低均分解读成懒惰、失败或缺乏品格。",
        "en": "Consider three questions: does the direction remain worthwhile, is the current method feasible, and are the costs of continuing sustainable? Changing practice methods, extending time, seeking resources, resting, pausing or choosing another aim may all deserve consideration. A higher mean is not a command to persist, and a lower one is not a verdict of laziness, failure or poor character."
      }
    ]
  },
  {
    "id": "grit-concrete-review",
    "title": {
      "zh": "一次具体回顾：明确下一步，也保留改变方向的条件",
      "en": "A concrete review: identify a next step and conditions for changing direction"
    },
    "paragraphs": [
      {
        "zh": "例如你原计划长期学习一门语言，最近的教材难度过高。可先核对目标是否仍由自己选择、近期有没有可用时间，再考虑换更合适的材料或缩小练习。用“本周尝试哪段内容、需要什么条件、什么现象说明方法仍不合适”记录观察，而不是只要求自己更有毅力。这个例子是可选复盘，不是已经验证的训练方案。",
        "en": "Suppose you planned to study a language over the long term, but the current material is too difficult. Check whether the aim is still your choice and time is available, then consider different material or a smaller practice task. Record what to try this week, what conditions it needs and what would indicate the approach still does not fit. This is optional reflection, not a validated training programme."
      },
      {
        "zh": "下一次回顾同时记录支持和不支持原先判断的经历：一次重启可能来自得到帮助，不必解释为人格成长；停止不合适的方法也可能是对新信息的回应。没有必要反复做题直到得分变高。需要判断学习或工作成效时，还应看对应的实际任务表现与目标条件，本卷没有测验这些成效。",
        "en": "At the next review, retain experiences both supporting and challenging your earlier interpretation. Resuming may follow new help rather than personality growth, and stopping an unsuitable method may respond to new information. There is no need to repeat the quiz until scores rise. Assessing learning or work outcomes requires relevant task performance and conditions, which this form does not test."
      }
    ]
  },
  {
    "id": "grit-comparison-retest",
    "title": {
      "zh": "均分、重测与相邻概念：能比较什么？",
      "en": "Means, retakes and related concepts: what can be compared?"
    },
    "paragraphs": [
      {
        "zh": "两部分各自保留，不相加、不排序，也没有总体0—100、百分位或四个毅力等级。全选3与其他不同组合可能同为3.00，实际行为却不同；全选5经四条反向处理后两组都为4.00，并不是两组满分。低次数的投入、缺少机会与不适用也不能混为一谈。",
        "en": "Keep the parts separate, without adding or ranking them, an overall 0–100, percentiles or four grit bands. All 3s and other patterns can share a mean of 3.00 despite differing practices. All raw 5s produce 4.00 in both parts after four reversals, not full scores. Less frequent investment, absent opportunity and NA are also different."
      },
      {
        "zh": "Duckworth官方测量说明提醒，相关量表原本用于个体间差异，对干预前后细小变化的解释存在不确定性，也不鼓励在招聘或录取等高风险场景使用。[2] 本站另有原创题本，更不能借用外部重测或预测结论。目标、机会、回忆与回答方式变化都可能改变均分；本卷不能换算自控力、成长型思维、韧性、尽责性、IQ或职业胜任。",
        "en": "Duckworth’s measures guidance notes that her scales were designed for between-person differences, with uncertainty about subtle intervention-related within-person changes, and discourages high-stakes hiring or admissions use.[2] Our original form cannot borrow external retest or prediction evidence. Changes in aims, opportunities, recall and responding can affect means; they do not convert into self-control, growth mindset, resilience, conscientiousness, IQ or job competence."
      }
    ]
  }
];

export const gritLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "长期目标的延续与努力续接，是同一个分数吗？",
      "en": "Are goal continuity and returning to effort the same score?"
    },
    "answer": {
      "zh": "不是。前者回看几个月内是否围绕同一方向安排，后者回看有可行条件时如何继续尝试。每组八条独立计算，不合成总体毅力分或四种人格。",
      "en": "No. One concerns arrangements around a continuing direction; the other concerns resuming feasible effort. Each eight-item part is scored independently, without a combined grit score or four personalities."
    }
  },
  {
    "question": {
      "zh": "还没有坚持满半年，可以参加吗？",
      "en": "Can I answer before pursuing an aim for six full months?"
    },
    "answer": {
      "zh": "可以选择原计划持续半年以上的目标，不要求已经完成半年。只回顾过去六个月真实发生且有相关机会的情况，其余可选不适用；也可先读指南。",
      "en": "You can choose an aim intended to last at least six months without having completed six months. Rate only actual relevant opportunities in the review window; use NA for others or read the guides first."
    }
  },
  {
    "question": {
      "zh": "不适用与从不，有什么不同？",
      "en": "How does NA differ from Never?"
    },
    "answer": {
      "zh": "从不是有相关机会时未出现该做法，记1并按题目方向计分；不适用是没有目标、机会、资料或不愿回答，不计数值，也不补成1或3。",
      "en": "Never is a practice not occurring when relevant opportunities existed, rated 1 and keyed accordingly. NA preserves no aim, opportunity, information or willingness to answer; it is replaced with neither 1 nor 3."
    }
  },
  {
    "question": {
      "zh": "六条有效和五条有效，为什么显示不同？",
      "en": "Why are six versus five valid ratings treated differently?"
    },
    "answer": {
      "zh": "这是本版每组八条至少六条有效的显示规则，不是经研究证明的临床或能力界线。六条时以计分和除6；五条显示资料不足，另一组不受牵连。",
      "en": "This edition requires six of eight ratings per part, a display rule rather than a validated clinical or ability boundary. Six divides the keyed sum by 6; five shows insufficient information without invalidating the other part."
    }
  },
  {
    "question": {
      "zh": "10÷6为什么显示1.67，而不是1.7？",
      "en": "Why does 10÷6 display 1.67 rather than 1.7?"
    },
    "answer": {
      "zh": "报告直接使用未舍入计分和除有效条数，并格式化两位小数。不能从一位均值1.7倒推，也不能因显示位数认定差0.01有意义。",
      "en": "The report divides the unrounded sum by rated count and formats two decimals. It does not reconstruct from a one-decimal 1.7, and display precision does not establish a meaningful difference of 0.01."
    }
  },
  {
    "question": {
      "zh": "全选几乎总是，会得到满分吗？",
      "en": "Does choosing Almost always throughout give full scores?"
    },
    "answer": {
      "zh": "不会。第9—12条反向，5会变1；全选5时两组都为4.00/5。应按真实情境回答，不按看起来更理想的选项选。",
      "en": "No. Items 9–12 reverse 5 to 1, so all raw 5s give 4.00/5 in both parts. Answer for actual circumstances rather than choosing the ideal-looking option."
    }
  },
  {
    "question": {
      "zh": "毅力能预测我会不会成功，或超过多少人吗？",
      "en": "Can these means predict success or tell me how many people I outperform?"
    },
    "answer": {
      "zh": "不能。本题本没有相应预测效度或人群常模。研究中的群体关联不等于个人概率，也不能把其他量表的数据套给本卷。[3]",
      "en": "No. This form lacks corresponding predictive evidence and population norms. Group associations in research are not individual probabilities, and other scales’ data cannot be transferred here.[3]"
    }
  },
  {
    "question": {
      "zh": "换方法、休息或停止目标，是毅力不足吗？",
      "en": "Do changing methods, resting or stopping show insufficient grit?"
    },
    "answer": {
      "zh": "不能这样归类。方向、方法与可承担代价需要分开考虑；不可达目标的调整也有研究背景，但不能由本卷给出继续或停止的个人命令。[4]",
      "en": "No such classification follows. Separate direction, methods and sustainable costs. Goal adjustment has its own research background, but this form cannot prescribe whether you should continue or stop.[4]"
    }
  },
  {
    "question": {
      "zh": "能用重测分数证明训练有效，或用于招聘录取吗？",
      "en": "Can retakes prove training effectiveness or support hiring and admissions?"
    },
    "answer": {
      "zh": "不能。本版没有可靠变化阈值或相应用途验证，官方测量说明也提醒前后变化与高风险使用的限制。[2] 可对照具体条目与经历，不把分差当干预结论。",
      "en": "No. This form has neither a reliable-change threshold nor validation for those uses; official measures guidance also notes change-score and high-stakes limits.[2] Compare items and experiences without treating score differences as intervention evidence."
    }
  },
  {
    "question": {
      "zh": "开始后会要求同意、邮箱或付费解锁吗？",
      "en": "Does Start add an agreement, email request or paid unlock?"
    },
    "answer": {
      "zh": "不会，开始直接进入16条题目。两份完整指南免费，资料不足也可读；不输入目标名称。临时保存需主动开启，完成、退出清除或重测会删除。",
      "en": "No. Start opens sixteen items directly. Both full guides are free even with insufficient information, without a goal name. Saving is opt-in; completion, clearing on exit or retaking removes progress."
    }
  }
];
