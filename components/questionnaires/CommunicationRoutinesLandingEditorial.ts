import type { Text } from "@/lib/questionnaires/types";

export const communicationRoutinesSections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "context-purpose",
    "title": {
      "en": "Five everyday topics: describe the setting before assigning a label",
      "zh": "五个日常主题：先描述情境，再理解经历"
    },
    "paragraphs": [
      {
        "en": "Twenty original descriptions help adults recall their own past four weeks: joining an exchange, clarity in communication, changes and familiar routines, details and sustained interest, and using visual arrangements. Four descriptions belong to each topic. The page keeps each selected label visible and provides five complete public readings.",
        "zh": "二十条原创描述，供成年人回顾本人过去四周的交流参与、沟通清楚程度、变化与熟悉安排、细节与持续兴趣，以及视觉安排使用情况。每组四条，页面保留逐条所选标签，并提供五篇完整公开读法。"
      },
      {
        "en": "The topics organize remembered situations, not five calibrated abilities or a single cognitive profile. Helpful arrangements and difficult moments may appear in the same record. A clear agenda may help you participate while a fast conversation leaves too little response time; neither recollection cancels the other.",
        "zh": "主题用于整理记得的情境，不是五项校准能力，也不组成单一认知档案。有帮助的安排与困难片刻可以同时出现：明确议程可能帮助参与，快速谈话却仍可能没有留够回应时间；两种回忆不互相抵消。"
      }
    ]
  },
  {
    "id": "exchange-and-clarity",
    "title": {
      "en": "Wanting to participate is different from finding a turn",
      "zh": "想参与交流，与找到接话时机不同"
    },
    "paragraphs": [
      {
        "en": "The first topic separates wanting to join a group, quiet time after an activity, an explicit purpose and time to form a response. Someone may want company and also want a pause between conversations. The page does not know the group’s pace, shared background or language demands, and does not turn uncertainty about timing into a social-skill score.",
        "zh": "第一组区分想参加多人谈话、活动后想安静、交流目的明确，以及组织回应需要的时间。一个人可以想与人相处，也想在两段交流之间暂停。页面不了解群体节奏、共同背景或语言要求，不把接话时机的不确定转为社交能力分数。"
      },
      {
        "en": "The clarity topic asks about indirect requests, requesting explicit instructions, a useful written agreement and uncertainty about literal or playful meaning. Asking what an action or deadline means is a communication choice. It does not establish that the listener lacks empathy or that the speaker intended to confuse them. No private message or conversation needs to be uploaded or repeated.",
        "zh": "清楚表达主题涉及间接请求、请对方说清指示、有用的文字约定，以及不确定字面或玩笑含义。询问行动或期限，是一种沟通选择，不证明听者缺乏同理心，也不判断说者故意制造歧义。无需上传私人消息或重复某段谈话。"
      }
    ]
  },
  {
    "id": "routine-and-interest",
    "title": {
      "en": "Familiar arrangements, change and sustained interest have context",
      "zh": "熟悉安排、适应变化与持续兴趣，都有具体语境"
    },
    "paragraphs": [
      {
        "en": "A changed plan may require practical updates as well as time to adjust. Knowing a sequence or receiving notice before a transition can be useful without making a routine compulsory. This record cannot identify rigidity or decide that a helpful arrangement should be removed. It asks about an existing situation, without surprise tasks or tests of tolerance.",
        "zh": "计划变化可能既需要实际调整，也需要适应时间。知道顺序或在转换活动前得到提示，可以有帮助，而不表示安排必须固定。记录不识别僵化，也不决定撤掉有帮助的安排；只回顾已有情境，不设置突然变化或耐受测试。"
      },
      {
        "en": "Details and interest concern exploring a chosen subject, noticing an inconsistency, continuing after an immediate question is answered and looking for a pattern. Interest is different from expertise: the page does not verify the inconsistency or the pattern, measure work quality or rank concentration. More or less time on a subject is not a target implied by the record.",
        "zh": "细节与兴趣涉及探索自选主题、注意不一致、眼前问题回答后继续了解，以及寻找规律。兴趣不同于专长：页面不核实不一致或规律，不测工作质量，也不排名专注力。记录不要求在主题上投入更多或更少时间。"
      }
    ]
  },
  {
    "id": "visual-and-separate",
    "title": {
      "en": "External visual aids, internal imagery and spatial tasks are different",
      "zh": "外部视觉辅助、内在意象与空间任务，是不同问题"
    },
    "paragraphs": [
      {
        "en": "Using a diagram, arranging visible notes, wanting a visual example and responding to a changed layout describe external material in an ordinary task. They do not measure vividness of a mental image, accuracy on a rotation problem, visual acuity or a fixed visual learner type. A written format can help one task while a diagram helps another.",
        "zh": "使用示意图、摆放可见笔记、希望有视觉示例，以及布局改变后的做法，描述的是普通任务中的外部材料。不测脑内画面的生动程度、旋转题正确率、视力或固定视觉学习类型。同一个人可以在某项任务中使用文字，在另一项中使用示意图。"
      },
      {
        "en": "Separate sensory-response, sensory-perception, executive-function, focus-and-energy, camouflaging and imagery resources retain their own questions and methods. You may choose one for its specific question without transferring answers or combining results. Shared terminology does not justify a common total, radar chart, neurotype or ability ranking.",
        "zh": "独立的感官反应、感官知觉、执行功能、专注精力、社交伪装及意象资源，各自保留题目与方法。可根据具体问题自愿选择，不转移回答或合并结果。术语相近，不构成共同总分、雷达图、神经类型或能力排名的依据。"
      }
    ]
  },
  {
    "id": "context-count-example",
    "title": {
      "en": "How six category counts retain four observations",
      "zh": "六类计数怎样保留四条观察"
    },
    "paragraphs": [
      {
        "en": "Each observation offers did not notice on relevant occasions, rarely, sometimes, often, very often and unscored. A fictional set of often, sometimes, often and unscored gives counts of 0, 0, 1, 2, 0 and 1 in that order. The denominator is four descriptions, not four conversations, mistakes, days or hours. The numeric category IDs are labels, not points.",
        "zh": "每条可选有相关机会时没有注意到、很少、有时、较常、经常，以及未计分。虚构示例中，四条分别选较常、有时、较常与未计分，按上述顺序计为0、0、1、2、0、1。分母是四条描述，不是四段谈话、四次失误、四天或四小时。数字类别标识是标签，不是点数。"
      },
      {
        "en": "No relevant occasion, unclear recall and withholding share the explicit unscored option. They do not become did not notice or a zero in an average. All twenty may be unscored. Helpful descriptions are not reversed, and difficult descriptions are not added together: there is no total, mean, highest topic or preferred answer pattern.",
        "zh": "没有相关机会、回忆不清与保留回答，均可使用明确的未计分选项，不变成没有注意到，也不为均值补零。二十条可以全部未计分。有帮助的描述不反向，困难描述不合分；没有总分、平均值、最高主题或优选答法。"
      }
    ]
  },
  {
    "id": "context-evidence",
    "title": {
      "en": "A recent-context reflection is not an autism assessment",
      "zh": "近期情境回顾，不是自闭症评估"
    },
    "paragraphs": [
      {
        "en": "These twenty original bilingual descriptions are not AQ, RAADS-R, a validated short form or a cognitive test battery. Published findings for those instruments do not validate this form’s categories, establish norms or demonstrate English–Chinese measurement equivalence. The four weeks specify a recall window, not developmental history or a diagnostic duration.",
        "zh": "本二十条原创双语描述不是AQ、RAADS-R、经验证的短版或认知测验组。其他工具的发表发现，不能验证本题本的类别、确立常模或证明中英文测量等值。四周规定回顾窗口，不是发展史或诊断持续时间。"
      },
      {
        "en": "NIMH describes adult autism evaluation as a professional process that considers communication, sensory experiences, interests and repetitive behaviour, sometimes alongside early developmental history. This page does not carry out that evaluation. Neither frequent selections nor few selections establish or exclude autism, and no identity or access-to-support decision follows from these counts. [1]",
        "zh": "NIMH介绍的成人自闭症评估，是考虑沟通、感官经历、兴趣及重复行为等内容的专业过程，有时还会了解早期发展史。本页不执行这种评估。频繁或少量选择，均不能确定或排除自闭症；这些计数不决定身份或支持资格。[1]"
      }
    ]
  },
  {
    "id": "context-reading-use",
    "title": {
      "en": "Use a complete reading for a question about one actual setting",
      "zh": "围绕一个真实场景，阅读完整指南"
    },
    "paragraphs": [
      {
        "en": "Each guide includes what the topic describes, category interpretation, a fictional example, uncertainty, separate resources, an optional practical question and privacy. The same full text is open before any answers and after every record. A guide is not a personalised finding simply because you opened it.",
        "zh": "每篇指南包括主题所指、类别读法、虚构例子、不确定性、独立资源、可选实用问题及隐私。相同全文在任何作答前、所有记录后开放。打开一篇指南，并不表示它是对你的个人发现。"
      },
      {
        "en": "If useful, bring one ordinary question to a conversation: whether the next action is explicit, a transition already has notice or a preferred format is available. Keep agreed support and privacy intact. You do not need forced eye contact, sensory exposure, a timed task or a repeated uncomfortable interaction. Professional support can be discussed without completing the form or proving a count.",
        "zh": "若有用，可以围绕一件普通事情沟通：下一步是否明确、转换活动前是否已有提示，或偏好的形式是否可用。保留约定支持与隐私。无需强迫眼神接触、感官暴露、计时任务或重复不舒服的互动。无需完成表单或证明计数，也能讨论专业支持需要。"
      }
    ]
  },
  {
    "id": "context-privacy-revisit",
    "title": {
      "en": "One start, a private record and later differences",
      "zh": "一次开始、私人记录与后来差异"
    },
    "paragraphs": [
      {
        "en": "One start opens the first observation without another agreement screen. Adults recall their own situations; there is no identity, private transcript, file upload or performance demonstration. Answers stay in current-page memory without drafts, submission, questionnaire analytics or a personal-result address. Copying contains only the public title and entry.",
        "zh": "点击一次开始即进入第一条观察，没有额外同意页。由成年人回顾本人情境，不要求身份、私人对话记录、上传文件或表现演示。回答只留当前页面内存，不存草稿、不提交、不作问卷分析，也不生成个人结果地址。复制只含公开标题与入口。"
      },
      {
        "en": "Exit, clear, retake, reload and leaving remove the record. A later category difference can reflect opportunities, people present, language, memory or interpretation; it is not a validated measure of improved communication, changed cognition or treatment effect. There is no retake schedule or instruction to make a count fall.",
        "zh": "退出、清除、重做、刷新及离页会移除记录。后来类别差异可能反映机会、在场的人、语言、回忆或理解，不是经验证的沟通改善、认知变化或治疗效果指标。没有重测日程，也不要求降低某项计数。"
      }
    ]
  }
];

export const communicationRoutinesFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "What will I receive after the twenty observations?",
      "zh": "二十条观察完成后会得到什么？"
    },
    "answer": {
      "en": "Five separate six-category records retaining all twenty individual labels, plus five complete public guides. There is no combined score, highest theme, diagnostic result or ranking of communication ability.",
      "zh": "五组分别呈现的六类记录，保留二十条逐项标签，并提供五篇完整公开指南。不生成综合分数、最高主题、诊断结果或沟通能力排名。"
    }
  },
  {
    "question": {
      "en": "Why can helpful arrangements and difficulties both be frequent?",
      "zh": "为什么有帮助的安排和困难都可以较常出现？"
    },
    "answer": {
      "en": "They describe different experiences. A written agreement can help while an indirect request remains unclear on another occasion. No item is reversed or subtracted to make them agree.",
      "zh": "它们描述不同经历。文字约定可以有用，另一次间接请求也可能不清楚。题目不作反向或相减，不要求两种描述一致。"
    }
  },
  {
    "question": {
      "en": "Does wanting quiet mean I dislike other people?",
      "zh": "想安静一会儿，就表示不喜欢别人吗？"
    },
    "answer": {
      "en": "No. Wanting company, wanting to contribute and needing a pause can coexist. This record does not infer your intentions, other people’s reactions or how friendly you are.",
      "zh": "不是。想与人相处、想作出贡献和需要暂停，可以同时存在。记录不推断意图、别人反应或友善程度。"
    }
  },
  {
    "question": {
      "en": "Does asking for explicit instructions show poor understanding?",
      "zh": "请求明确指示，就说明理解不好吗？"
    },
    "answer": {
      "en": "No. A message may lack an action, deadline or shared context. The form does not assess the message itself or measure language comprehension; it records the clarification you recall.",
      "zh": "不是。信息可能缺少行动、期限或共同背景。本表单不评定消息本身，也不测语言理解，只记录回忆中的澄清行为。"
    }
  },
  {
    "question": {
      "en": "Does keeping a familiar routine establish rigidity?",
      "zh": "保留熟悉安排，就能确定僵化吗？"
    },
    "answer": {
      "en": "No. A familiar sequence may be practical or helpful, and an unexpected change may require updates. The page cannot establish a cause or require you to remove a support to test flexibility.",
      "zh": "不能。熟悉顺序可能实用或有帮助，意外变化也可能需要更新安排。页面不确定原因，也不要求撤掉支持来测试灵活性。"
    }
  },
  {
    "question": {
      "en": "Does noticing detail prove high intelligence or hyperfocus?",
      "zh": "注意细节，能证明高智力或过度专注吗？"
    },
    "answer": {
      "en": "No. Recalled interest does not verify a detail, pattern or performance. The page has no timed task, correct answers or cognitive norms, and does not judge the value of an interest.",
      "zh": "不能。回忆中的兴趣，不核实细节、规律或实际表现。页面没有计时任务、标准答案或认知常模，也不评判兴趣的价值。"
    }
  },
  {
    "question": {
      "en": "What if I had no opportunity to notice a description?",
      "zh": "没有相关机会时怎么选？"
    },
    "answer": {
      "en": "Choose the explicit unscored option, also available for unclear recall or withholding. It stays separate from did not notice on relevant occasions. All twenty can be unscored without losing access to any guide.",
      "zh": "可选明确的未计分选项；回忆不清或保留回答时同样可选。它与有相关机会时没有注意到分开。二十条全部未计分，也不影响阅读任何指南。"
    }
  },
  {
    "question": {
      "en": "Is it free, and can I use it to assess somebody else?",
      "zh": "是否免费，能用来评估别人吗？"
    },
    "answer": {
      "en": "All descriptions, records and full guides are free without registration. One start opens the first observation. This is adult self-recall, not a child, proxy or workplace-performance assessment; other people’s private experiences cannot be supplied by observation.",
      "zh": "全部描述、记录和完整指南均免费，无需注册，点击一次开始即进入第一条。本版是成年人自我回顾，不是儿童、代评或工作表现评估；观察不能代替别人的私人经历。"
    }
  }
];

export const communicationRoutinesReadingSummaries: Record<string, Text> = {
  "joining-an-exchange-reading": {
    "en": "Read turn-taking, response time, quiet after activity and knowing the purpose without judging friendliness or social ability.",
    "zh": "分别阅读接话时机、回应时间、活动后想安静及知道目的的经历，不评友善或社交能力。"
  },
  "communication-clarity-reading": {
    "en": "Distinguish an unclear request, a clarification, a written agreement and literal or playful meaning in their contexts.",
    "zh": "结合具体语境，区分不清楚的请求、澄清行为、文字约定，以及字面或玩笑含义。"
  },
  "changes-and-routines-reading": {
    "en": "Consider practical changes, transition notice and familiar sequences while preserving existing support and uncertainty.",
    "zh": "理解实际变化、过渡提示与熟悉顺序，保留现有支持和不确定性。"
  },
  "details-and-interest-reading": {
    "en": "Explore remembered curiosity and attention to detail without equating interest with expertise, verified patterns or performance.",
    "zh": "阅读记得的好奇与细节关注，区分兴趣、专长、经核实的规律及实际表现。"
  },
  "visual-arrangements-reading": {
    "en": "Read external diagrams, visible notes and layouts separately from internal imagery, spatial ability and learning-type labels.",
    "zh": "分别理解外部示意图、可见笔记与布局，区分内在意象、空间能力及学习类型标签。"
  }
};
