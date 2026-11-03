import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Additional entry reading only. Source-bound guides, FAQ and full reports stay unchanged. */
export const philosopherLandingSections: QuestionnaireSection[] = [
  {
    "id": "philosopher-worked-example",
    "title": {
      "zh": "计分例子：两项并列与九项计数",
      "en": "Worked scoring: a two-way tie and nine counts"
    },
    "paragraphs": [
      {
        "zh": "按本页九个方向的顺序，4、4、2、2、2、1、1、1、1合计18，苏格拉底与亚里士多德同为最高。两份完整说明都会呈现，名单先后不决定谁更重要。4/8只表示该方向出现8次时选了4次，不是50%像某个人，也不是赞同一半学说。",
        "en": "In the listed order, counts of 4, 4, 2, 2, 2, 1, 1, 1, 1 total eighteen and give Socrates and Aristotle the joint maximum. Both complete guides appear, without list order deciding importance. Four out of eight records four selections across eight opportunities, not 50% resemblance to a person or endorsement of half a doctrine."
      },
      {
        "zh": "所有选项都选同一位置，会九项各2次，九份结果全部显示。差1次保留真实差距，但不被解释成统计显著或稳定主副型。只有18题完整作答才生成个人结果；未出现于某题的五个方向没有被你比较，不能当作被否定。",
        "en": "Choosing the same option position throughout gives two each and displays all nine results. A one-choice gap remains visible without being called statistically significant or a stable primary/secondary distinction. Personal results require all eighteen responses. The five directions absent from a question were not compared and cannot be treated as rejected."
      }
    ]
  },
  {
    "id": "philosopher-nine-questions",
    "title": {
      "zh": "九个原典入口：每个名称对应什么问题",
      "en": "Nine textual entrances: the question behind each name"
    },
    "paragraphs": [
      {
        "zh": "苏格拉底入口依据柏拉图《申辩篇》中对知识声称的检视；亚里士多德入口参考《尼各马可伦理学》第二卷的习惯与具体处境中的合宜；孔子入口涉及《论语》中的学习、实践和相处反省。《论语》也记录弟子言论，例如每日三省由曾子说出，不能把整部书每句话都当作孔子原话。[1][2][3]",
        "en": "Socrates points toward examining knowledge claims in Plato’s Apology; Aristotle toward habituation and appropriate action in particulars in Nicomachean Ethics II; Confucius toward learning, practice and reflection in relationships in the Analects. The Analects also records disciples: the daily self-examination passage is attributed to Zengzi, not Confucius.[1][2][3]"
      },
      {
        "zh": "老子入口参考《道德经》第三十七、四十八章有关无为与减损的语境；伊壁鸠鲁入口参考《致美诺伊克斯书》对欲望和取舍的讨论；爱比克泰德入口参考《手册》开篇对自身判断、行动与外在事项的区分。日常问题是本站转述，不是三者共享的一套生活处方。[4][5][6][7]",
        "en": "Laozi draws on non-action and diminishing in Daodejing chapters 37 and 48; Epicurus on desires and choices in the Letter to Menoeceus; Epictetus on judgment, action and external matters in the Enchiridion’s opening. Our everyday prompts are adaptations, not a shared prescription supplied by these texts.[4][5][6][7]"
      },
      {
        "zh": "尼采入口关联《查拉图斯特拉如是说》第二部的自我超越问题；波伏瓦入口关联《模糊性的伦理学》第二部分对自身自由与他人的讨论；马可·奥勒留入口关联《沉思录》第二卷对眼前行动及回应他人的关注。这些选段只是有限入口，不能替代作者完整思想。[8][9][10]",
        "en": "Nietzsche points toward self-overcoming in Zarathustra Part II; Beauvoir toward freedom and others in The Ethics of Ambiguity II; Marcus Aurelius toward present action and responding to others in Meditations II. These are limited reading entrances, not substitutes for complete bodies of thought.[8][9][10]"
      }
    ]
  },
  {
    "id": "philosopher-close-comparisons",
    "title": {
      "zh": "相近思路怎样区分：提问、实践与眼前回应",
      "en": "Distinguishing nearby approaches: inquiry, practice and response"
    },
    "paragraphs": [
      {
        "zh": "苏格拉底与亚里士多德在本题中都可能让讨论慢一点：一个入口先问“我们说的合适究竟是什么”，另一个先看“反复这样做会形成怎样的实践，是否适合这次情境”。这不是把两位哲学家完整划分为只问不做与只做不问；它只是解释本题选项首先关注什么。",
        "en": "Both the Socrates and Aristotle associations may slow a discussion: one first asks what appropriate means, while the other considers what repeated action establishes and whether it fits this occasion. This does not divide their whole philosophies into asking without acting versus acting without asking. It explains the first emphasis in these options."
      },
      {
        "zh": "爱比克泰德与马可·奥勒留都处在斯多亚传统中，本题仍给出不同阅读焦点：前者可用于区分自己的判断和不能保证的回应，后者可用于重新注意正在承担的事。相同传统不意味着同一本书或完全可互换的选项，也不能由次数判断谁更冷静、自律或有韧性。",
        "en": "Epictetus and Marcus Aurelius belong to the Stoic tradition but receive different reading emphases here: distinguishing judgment from a response you cannot guarantee, and returning attention to the task at hand. A shared tradition does not make books or options interchangeable, and counts measure no calm, discipline or resilience."
      },
      {
        "zh": "老子入口关注可以减少的强行安排，伊壁鸠鲁入口关注追求满足带来的后续需要；“少一点”可以来自不同理由。孔子与波伏瓦入口都可能留意他人，但本题分别强调相处中的学习实践与他人继续选择的空间。请比较理由，不要只凭一个关键词归类。",
        "en": "Questioning forced arrangements and considering the further wants created by a satisfaction are different reasons for less. Confucius and Beauvoir associations can both attend to others, while these options emphasize reflective relational practice and others’ continuing possibilities for choice respectively. Compare reasons rather than classifying by one keyword."
      }
    ]
  },
  {
    "id": "philosopher-reading-group",
    "title": {
      "zh": "一个读书小组的九种提问方式",
      "en": "Nine questions for one reading-group situation"
    },
    "paragraphs": [
      {
        "zh": "假设朋友自愿组一个小型读书会，要决定第一次怎样安排。你可以先问“大家所说的公平怎样界定”；看固定做法是否适合新成员；回看承诺是否兑现、交流是否真正在互相学习。这三条分别帮助理解本题的检视概念、具体实践与相处反省，不是古人对读书会的真实回答。",
        "en": "Imagine friends voluntarily planning a first small reading group. You could ask what fair means, whether a regular practice suits new members, or whether commitments were kept and people are learning from one another. These illustrate conceptual examination, practice in context and relational reflection, not historical answers about a reading group."
      },
      {
        "zh": "还可以问：是否增加了不必要的安排；想要的活动收益是否值得额外负担；我能怎样说明自己的建议，而不把别人一定接受当成保证。这些是减轻强求、辨别欲望成本、分开行动与结果的当代提示，不能因此断言你已经掌握道家、伊壁鸠鲁学派或斯多亚学说。",
        "en": "You might instead ask whether arrangements are unnecessarily elaborate, whether the desired benefit merits added burdens, or how to explain a suggestion without assuming others must accept it. These contemporary prompts concern forcing, costs of desires and action versus outcome. Choosing them establishes no mastery of Daoism, Epicureanism or Stoicism."
      },
      {
        "zh": "另三种入口是重新检查自己为什么沿用某个“好读书会”的标准；让其他人保留提议、拒绝和调整的空间；把注意力放回当前能认真完成的邀请与回应。可以试一句具体表达，再看真实反馈。不必扮演某位哲学家，也不需要为结果而说服别人。",
        "en": "Three further entrances question an inherited standard for a good group, leave others room to propose, decline and revise, or return attention to the invitation and response you can handle now. Try a specific expression and check actual feedback. There is no need to act as a philosopher or persuade others to confirm a result."
      }
    ]
  },
  {
    "id": "philosopher-read-and-question",
    "title": {
      "zh": "从结果进入原典：看论证，也看反例",
      "en": "Moving from results to texts: arguments and counterexamples"
    },
    "paragraphs": [
      {
        "zh": "先选最想了解的一份指南，沿链接找到相关段落，确认谁在说话、讨论什么问题、用了什么理由。哲学对话、格言式文本、书信、伦理论述与私人笔记的写法不同；不能把某句抽离上下文，直接当作今天所有情境都适用的命令。",
        "en": "Choose the guide you most want to explore, follow its link and ask who is speaking, what problem is being addressed and what reasons are offered. Dialogues, aphoristic writing, letters, ethical arguments and personal notes have different forms. A sentence removed from context is no universal command for every situation today."
      },
      {
        "zh": "中文概括是本站自己的阅读说明，英文参考页采用各自译本；词语相似不保证译法与解释完全相同。可以找一处支持当前理解的段落，再找一个使理解变复杂的反例或问题。不同意某个论点仍可以阅读它；结果不是入门资格，也不要求选定终身学派。",
        "en": "Chinese summaries are our own reading explanations, while linked English texts use their respective translations. Similar terms need not imply identical translations or interpretations. Find support for a reading, then a counterexample or question that complicates it. Disagreement still permits reading; a result is neither an admission requirement nor a lifelong school commitment."
      }
    ]
  },
  {
    "id": "philosopher-evidence-and-context",
    "title": {
      "zh": "哲学阅读联想与心理测量的区别",
      "en": "Reading associations versus psychological measurement"
    },
    "paragraphs": [
      {
        "zh": "原典可以核对思想背景，不能单独证明本页18道题怎样测到一个人。本站尚未建立该题本的信度、效度、常模或跨语言等价，九份详细指南也不构成人格验证。这里不测智力、品德、哲学知识、政治宗教身份、健康、职业或关系相容性。",
        "en": "Primary texts can substantiate intellectual context without proving what these eighteen choices measure in a person. Reliability, validity, norms and language equivalence are not established for this form; detailed guides are not personality validation. Intelligence, morality, philosophical knowledge, political or religious identity, health, careers and compatibility are not assessed."
      },
      {
        "zh": "文字熟悉程度、近期阅读和具体情境都可能影响选择。重测变化时，先比较哪些题改了、为什么改；一项次数上升不证明思想进步或道德成长。本版九入口与旧版对象及选项不同，不能直接比较新旧计数。保留自己的异议和不适用之处，比努力符合某个名称更有阅读价值。",
        "en": "Familiarity, recent reading and context may influence choices. When a retake differs, compare which responses changed and why; a higher count does not establish intellectual or moral progress. This nine-path edition differs from the older figures and options, so counts are not directly comparable. Keeping your objections and mismatches can be more useful than trying to fit a name."
      }
    ]
  }
];

export const philosopherLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "4、4、2、2、2、1、1、1、1会得到什么？",
      "en": "What result follows counts of 4,4,2,2,2,1,1,1,1?"
    },
    "answer": {
      "zh": "按目录顺序，苏格拉底与亚里士多德同为最高，两份完整指南都呈现。合计18；4/8只表示选择次数，不是人物相似度。",
      "en": "In the listed order, Socrates and Aristotle share the maximum and both full guides appear. The total is eighteen; four out of eight is a count, not personal resemblance."
    }
  },
  {
    "question": {
      "zh": "一直选择同一位置会怎样？",
      "en": "What happens if I choose the same position throughout?"
    },
    "answer": {
      "zh": "九个方向各2次，九份完整结果都保留，不按目录第一位挑一个。选项位置均衡不等于题本已经获得心理测量验证。",
      "en": "Every direction receives two counts and all nine full guides remain, without choosing the first-listed figure. Balanced positions do not establish psychometric validation."
    }
  },
  {
    "question": {
      "zh": "近分会自动变成混合哲学家吗？",
      "en": "Do close counts create a hybrid philosopher?"
    },
    "answer": {
      "zh": "不会。差一次保留实际次数，不宣称显著差异，也不自动合并。可以自愿把相近指南一起阅读，不需形成固定主副型。",
      "en": "No. A one-choice gap retains actual counts without a significant-difference claim or automatic merge. Read nearby guides together if useful, without a fixed primary/secondary identity."
    }
  },
  {
    "question": {
      "zh": "苏格拉底与亚里士多德的入口差在哪里？",
      "en": "How do the Socrates and Aristotle entrances differ?"
    },
    "answer": {
      "zh": "本题前者更先检视概念和知识声称，后者更先看反复实践与具体合宜。这是选项焦点，不是对两位哲学家完整思想的二分。",
      "en": "These options foreground examining meanings and knowledge claims versus repeated practice and what fits particulars. That is an option-level emphasis, not a division of their entire philosophies."
    }
  },
  {
    "question": {
      "zh": "为什么有两位斯多亚传统哲学家？",
      "en": "Why include two thinkers from the Stoic tradition?"
    },
    "answer": {
      "zh": "爱比克泰德与马可·奥勒留对应不同原典和有限阅读焦点。共享传统不代表选项完全相同，也不将计数当作冷静、韧性或自律分数。",
      "en": "Epictetus and Marcus Aurelius point to different texts and limited reading emphases. Their shared tradition does not make options identical or counts scores of calm, resilience or discipline."
    }
  },
  {
    "question": {
      "zh": "《论语》里的话都是孔子亲口说的吗？",
      "en": "Is every statement in the Analects attributed to Confucius?"
    },
    "answer": {
      "zh": "不是，文本也记录弟子言论。阅读时要核对说话者，例如每日三省由曾子说出；本页中文说明是概括，不是原典逐字引文。[3]",
      "en": "No; it also records disciples. Check the speaker: daily self-examination is attributed to Zengzi. This website’s explanations are summaries, not verbatim quotations.[3]"
    }
  },
  {
    "question": {
      "zh": "能靠结果判断我的知识、智力或政治立场吗？",
      "en": "Can the result establish knowledge, intelligence or political positions?"
    },
    "answer": {
      "zh": "不能。本页只记录在原创选项间优先选择的思路，不测试哲学知识或识别政治宗教身份，更不预测职业或关系相容性。",
      "en": "No. It records preferred starting points among original options, not philosophical knowledge or political and religious identity, and predicts neither careers nor compatibility."
    }
  },
  {
    "question": {
      "zh": "重测不同代表思想进步了吗？",
      "en": "Does a different retest prove intellectual progress?"
    },
    "answer": {
      "zh": "不能仅据计数判断。近期阅读、情境和措辞理解都可能影响选择；本页没有可靠改变阈值，新旧题本计数也不直接互认。",
      "en": "Not from counts alone. Recent reading, context and wording may affect choices. No reliable-change threshold is supplied, and different editions’ counts are not directly interchangeable."
    }
  },
  {
    "question": {
      "zh": "点击开始还需要再次同意吗？",
      "en": "Is another agreement needed after Start?"
    },
    "answer": {
      "zh": "不需要。开始直接进入18道题，无需注册、邮箱或前置测评；约6分钟是预计用时，不是限时，公开指南可先阅读。",
      "en": "No. Start opens eighteen questions directly without signup, email or another test. About six minutes is an estimate, not a time limit, and public guides can be read first."
    }
  }
];
