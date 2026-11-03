import type { Questionnaire } from "@/lib/questionnaires/types";
export const matteringLandingSections: Questionnaire["guide"] = [
  {
    "id": "mattering-purpose",
    "title": {
      "en": "Mattering and anti-mattering: two experiences of significance",
      "zh": "被重视感与不被重视感：两类人际体验"
    },
    "paragraphs": [
      {
        "en": "Mattering concerns feeling significant to other people: being noticed, listened to, missed or relied upon. Anti-mattering concerns feeling insignificant, invisible or as though one’s voice does not count. This page presents the five-item General Mattering Scale (GMS) and five-item Anti-Mattering Scale (AMS) as separate self-report readings.",
        "zh": "被重视感关注感到自己对他人重要，例如被注意、被倾听、会被惦念或被依靠。不被重视感关注感到无足轻重、被忽视，或自己的声音不算数。本页将五题一般被重视感量表（GMS）与五题不被重视感量表（AMS）作为两项独立自报读法。"
      },
      {
        "en": "Both concern your perception of relationships, not your inherent worth or a verified inventory of what other people think. All ten questions, two separate scores and both complete guides are free. The guides can also be read without answering, registering or sharing a personal experience.",
        "zh": "两项都关注你对人际关系的感受，不是个人固有价值，也不是经核实的他人看法清单。十道题、两项独立分数和两份完整指南全部免费，也可不作答、不注册、不分享个人经历直接阅读指南。"
      }
    ]
  },
  {
    "id": "mattering-gms",
    "title": {
      "en": "What the five GMS questions cover",
      "zh": "GMS五题覆盖哪些体验"
    },
    "paragraphs": [
      {
        "en": "The selected GMS asks about importance to others, attention, being missed, interest in what you say and others depending on you. These are five prompts contributing to one five-item sum, not five separately scored subscales. Looking at a particular response can help identify an experience to discuss; it does not produce a validated subscale score.",
        "zh": "本版GMS询问自己对他人的重要性、受到的注意、离开时是否被惦念、他人对自己言语的兴趣，以及被依靠的程度。五个提示共同构成一项五题加总，不是五个单独计分的分量表。某条回答可提示值得讨论的体验，但不生成已验证的分项分数。"
      },
      {
        "en": "Being relied upon is one part of this wording, not an obligation to make yourself indispensable. Frequent requests can be supportive or burdensome depending on the situation. A total cannot establish reciprocity, healthy boundaries or whether someone would welcome further responsibility; those require the person’s own account and the actual relationship.",
        "zh": "被依靠只是题文中的一个方面，不要求把自己变得不可替代。频繁被请求可能让人感到支持，也可能带来负担，需结合情境。总分不能证明互惠、边界健康或愿意承担更多责任，这些需要本人说明与实际关系证据。"
      }
    ]
  },
  {
    "id": "mattering-ams",
    "title": {
      "en": "What anti-mattering adds beyond low positive attention",
      "zh": "不被重视感为何不只是正向关注较少"
    },
    "paragraphs": [
      {
        "en": "The AMS asks about feeling that you do not matter, being made to feel insignificant or invisible, feeling that you will never matter to certain people and feeling that someone does not care what you think or say. It gives these experiences their own five-item sum rather than treating them as reverse-keyed GMS questions.",
        "zh": "AMS询问感到自己不重要、被对待得无足轻重或像隐形人、觉得自己永远不会被某些人重视，以及感到有人不在乎自己的想法或言语。它将这些体验单独五题加总，不把它们当作GMS的反向题。"
      },
      {
        "en": "A person can feel noticed in some relationships and overlooked in others. Therefore a larger GMS does not mathematically require a smaller AMS. Reading both supports a more specific conversation about where experiences differ; the website does not infer a hidden cause, identify a responsible person or classify a relationship as harmful from the totals.",
        "zh": "一个人可能在某些关系中感到被注意，在另一些关系中感到被忽视。因此GMS较大不要求AMS在数学上较小。两项并读有助于具体讨论体验在哪里不同；网站不凭总分推断隐藏原因、认定责任人或将关系判为有害。"
      }
    ]
  },
  {
    "id": "mattering-answer",
    "title": {
      "en": "How to answer: general experiences and four response anchors",
      "zh": "怎样作答：一般相处体验与四个选项锚点"
    },
    "paragraphs": [
      {
        "en": "Consider your experiences with people in general. The selected protocol does not impose a past-week or past-month recall window. Use the same broad reference while answering rather than switching between your closest friend for one item and an unrelated difficult encounter for the next. There is no correct or socially desirable answer.",
        "zh": "请回顾与一般人的相处体验。所选方案没有额外限定过去一周或一个月。作答时尽量保持同一整体参照，不要一题只想到最亲密朋友，下一题又只想到无关的困难接触。没有正确答案，也不需要迎合期待。"
      },
      {
        "en": "Each item offers 1 Not at all, 2 A little, 3 Somewhat and 4 A lot. These anchors express degrees on this response scale; they are not counts of people or percentages of occasions. There is no unscored option in this ten-item edition. You can stop without completing it and still read every public guide.",
        "zh": "每题提供1完全没有、2有一点、3有些、4很多。它们表达本回答量尺上的程度，不是人数或事件百分比。本十题版没有未评分选项；可以停止作答，仍能阅读全部公开指南。"
      }
    ]
  },
  {
    "id": "mattering-scores",
    "title": {
      "en": "Separate 5–20 scores, with worked arithmetic",
      "zh": "分别5至20分：可复算的计分示例"
    },
    "paragraphs": [
      {
        "en": "Add the five GMS answers, and separately add the five AMS answers. Every item contributes its selected value from 1 to 4, with no reverse coding. For example, GMS answers 1, 2, 3, 4, 2 sum to 12; AMS answers 4, 3, 2, 1, 2 also sum to 12. Equal totals do not establish a balance point or cancel either experience.",
        "zh": "GMS五个回答相加，AMS另外五个回答相加。每题按所选1至4分直接计入，没有反向计分。例如GMS回答1、2、3、4、2合计12；AMS回答4、3、2、1、2也合计12。相等不代表平衡点，也不会抵消任何一项体验。"
      },
      {
        "en": "Each total ranges from 5 to 20 and requires all five valid answers under this site’s completeness rule. Missing values are not replaced by zero, an average or the other scale. The page calculates no combined score, subtraction, percentile, high–low band or clinical cutoff. A total of 12 is not 60 percent worth or a probability of a condition.",
        "zh": "每项范围为5至20分，按本站完整度规则需要该项全部五个有效回答。缺答不补零、平均值或另一量表的数值。页面不计算综合分、差值、百分位、高低分档或临床切点。12分不是个人价值达到百分之六十，也不是某种状况的概率。"
      }
    ]
  },
  {
    "id": "mattering-research",
    "title": {
      "en": "Published research and this website’s evidence boundary",
      "zh": "发表研究与本网页的证据范围"
    },
    "paragraphs": [
      {
        "en": "Flett and colleagues’ 2022 AMS development article reproduces the GMS and AMS item sets in Table 2. Krygsman and colleagues’ 2022 study examines longitudinal associations among mattering, anti-mattering and depression symptoms in young adulthood. These are different research questions; neither makes this webpage a diagnostic test or supplies a universal threshold for an individual visitor.",
        "zh": "Flett等2022年的AMS开发论文在表2列出GMS与AMS题目；Krygsman等2022年的研究考察成年早期被重视感、不被重视感与抑郁症状的纵向关联。这些研究回答的问题不同，都不能使本网页成为诊断测试，也不提供适用于每位访客的通用阈值。"
      },
      {
        "en": "A reported association does not establish that one person’s score caused a difficulty, predict what will happen to them or verify anyone else’s intentions. Scientific interpretation must retain the instrument version, sample, language, response anchors and study design. The source citations below provide that research context; the webpage’s presentation has not received independent validation or author endorsement.",
        "zh": "研究中的关联不证明某个人的分数导致了困难，不预测其未来，也不核实他人意图。科学解读应保留工具版本、样本、语言、选项锚点与研究设计。下方来源提供研究背景；本网页的呈现尚无独立验证或原作者背书。"
      }
    ]
  },
  {
    "id": "mattering-versions",
    "title": {
      "en": "GMS-5, GMS-6 and translations are not interchangeable",
      "zh": "五题GMS、六题版与译本不能直接互换"
    },
    "paragraphs": [
      {
        "en": "This edition contains five GMS items and five AMS items. It does not add the extra care-related item of GMS-6, administer a fear-of-not-mattering inventory or score a workplace-specific mattering model. Similar names do not establish identical questions, response ranges or interpretations. Check the actual version before comparing any numbers.",
        "zh": "本版包括五题GMS与五题AMS，不添加GMS-6中关于被关心的额外题目，不施测害怕不被重视的量表，也不计分职场专用被重视感模型。名称相近不证明题目、回答范围或解释相同，比较数字前应先核对实际版本。"
      },
      {
        "en": "Chinese here is a new working translation of the selected English items and anchors. Research on a separately translated Chinese scale cannot validate these exact wordings. Shared identifiers and arithmetic help preserve implementation consistency but do not demonstrate cross-language measurement equivalence. Avoid interpreting differences across languages as personal change.",
        "zh": "这里的中文是依据所选英文题目与锚点新作的工作译本。另一个中文译本的研究不能验证这些具体措辞。相同标识与算式有助于保持实现一致，但不证明跨语言测量等值；不要把换语言后的差别解释为个人变化。"
      }
    ]
  },
  {
    "id": "mattering-use",
    "title": {
      "en": "Use the result for a conversation, not a verdict",
      "zh": "用结果开启交谈，不把它当作判决"
    },
    "paragraphs": [
      {
        "en": "Choose one concrete situation that comes to mind and describe what happened, what you understood and what you would welcome next. For example, you might ask a trusted person whether there is a convenient time to hear your idea. This is an optional communication experiment, not a prescribed treatment or a promise to improve a score.",
        "zh": "选择想到的一件具体事情，分别说明发生了什么、自己怎样理解，以及接下来希望得到什么。例如询问信任的人是否有合适时间听一个想法。这是可自愿尝试的沟通方式，不是规定治疗，也不承诺提高分数。"
      },
      {
        "en": "You do not need to earn recognition by taking on unwanted responsibilities. If these feelings are persistent or interfere with daily life, you can discuss the experiences with a qualified professional without waiting for a score threshold. Answers stay in current-page memory; reloading, changing language, leaving or clearing removes them. Sharing copies general explanation links only.",
        "zh": "不需要靠承担不愿承担的责任来换取认可。若这些感受持续存在或影响日常生活，可以直接与合格专业人士讨论，不必等待达到分数阈值。回答仅存于当前页面内存；刷新、换语言、离开或清除会移除。分享只复制通用解释链接。"
      }
    ]
  }
];
export const matteringLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "What is the difference between GMS and AMS?",
      "zh": "GMS与AMS有什么区别？"
    },
    "answer": {
      "en": "GMS asks about feeling important, noticed, missed, listened to and relied upon. AMS asks about feeling insignificant, invisible or not listened to. Each has its own five-item sum. AMS is not obtained by subtracting GMS from a maximum.",
      "zh": "GMS询问感到重要、被注意、被惦念、被倾听和被依靠；AMS询问感到无足轻重、隐形或不被倾听。各自五题加总，AMS不是用某个满分减去GMS得到的。"
    }
  },
  {
    "question": {
      "en": "Can I feel valued and overlooked at the same time?",
      "zh": "被重视与被忽视的感受可以同时存在吗？"
    },
    "answer": {
      "en": "Yes. Different people and interactions may evoke different experiences. Both sums may be relatively large within their own ranges, but the page assigns no combined category, contradiction label or relationship diagnosis.",
      "zh": "可以。不同的人与互动可能带来不同体验。两项在各自范围内都可能较大，但页面不派发组合类型、矛盾标签或关系诊断。"
    }
  },
  {
    "question": {
      "en": "Does 12 out of 20 mean 60 percent mattering?",
      "zh": "20分中得到12分就是被重视程度60%吗？"
    },
    "answer": {
      "en": "No. Twelve is a sum of five ordinal response values. The minimum is 5, not zero. Dividing by 20 does not produce a validated percentage, percentile or probability, and the site does not make that conversion.",
      "zh": "不是。12是五个有序选项数值之和，最低分是5而非零。除以20不能得到已验证的百分比、百分位或概率，本站不作该换算。"
    }
  },
  {
    "question": {
      "en": "Is there a score that proves I need treatment?",
      "zh": "有没有能证明需要治疗的分数？"
    },
    "answer": {
      "en": "No clinical cutoff is used here. The totals describe responses, not a diagnosis or treatment decision. If experiences are persistent or disruptive, discuss them directly with a qualified professional; a threshold is not required to ask for support.",
      "zh": "本页不使用临床切点。总分描述回答，不作诊断或治疗决定。如果感受持续或干扰生活，可直接咨询合格专业人士；寻求支持不需要先达到阈值。"
    }
  },
  {
    "question": {
      "en": "Are low mattering and low self-esteem the same?",
      "zh": "被重视感较少与自尊较低是一回事吗？"
    },
    "answer": {
      "en": "No. These items concern perceived significance to other people; self-esteem concerns how someone evaluates themselves. Related concepts need not be interchangeable. This page does not administer a self-esteem scale or infer its score from GMS or AMS.",
      "zh": "不是。这些题目关注感到自己对他人重要，自尊关注自我评价。概念相关也不能互换；本页不施测自尊量表，也不从GMS或AMS推算自尊分数。"
    }
  },
  {
    "question": {
      "en": "Does depending on me mean a relationship is healthy?",
      "zh": "别人依靠我就说明关系健康吗？"
    },
    "answer": {
      "en": "Not necessarily. The GMS includes perceived dependence, but a response cannot establish consent, reciprocity or the burden involved. Read the situation and your boundaries rather than trying to become indispensable to raise a number.",
      "zh": "不一定。GMS包含感到被依靠，但回答不能证明同意、互惠或负担程度。应结合情境与自己的边界理解，不必为了提高数字而变得不可替代。"
    }
  },
  {
    "question": {
      "en": "Can I compare my score with a student average on another website?",
      "zh": "能和其他网站的学生平均分比较吗？"
    },
    "answer": {
      "en": "Not as a personal ranking. Check the exact items, anchors, language, sample and scoring first. A published student sample is not automatically representative of you; this edition supplies no population norms or percentile conversion.",
      "zh": "不能直接当作个人排名。应先核对具体题目、锚点、语言、样本与计分。发表研究的学生样本不自动代表你，本版不提供人群常模或百分位换算。"
    }
  },
  {
    "question": {
      "en": "Can I start without agreeing to save or upload responses?",
      "zh": "可以不同意保存或上传回答直接开始吗？"
    },
    "answer": {
      "en": "Yes. Start test opens the first question without a required checkbox. No draft or result is saved by this tool, and item choices are not uploaded. Optional activity counting is off by default and is not required for the test. All full guides remain freely readable.",
      "zh": "可以。点击开始测试直接进入第一题，没有必选复选框。本工具不保存草稿或结果，不上传逐题选择。可选使用计数默认关闭，不是答题条件，全部完整指南始终免费可读。"
    }
  }
];
