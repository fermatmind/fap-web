import type { Text, QuestionnaireSection } from "@/lib/questionnaires/types";
export const dogBreedSections: QuestionnaireSection[] = [
  {
    "id": "purpose",
    "title": {
      "en": "What dog breed am I? Six metaphors for human preferences",
      "zh": "我是什么犬种？六种人类偏好的比喻"
    },
    "paragraphs": [
      {
        "en": "This dog personality quiz compares preferences in human companionship and leisure. Twelve original scenarios ask how you welcome people, practise an interest, keep options open, clarify agreements, reduce demands and state your needs. Six breed names make these choices easier to discuss; the result is based on the responses you select in this questionnaire.",
        "zh": "犬系人格测试比较的是人在相处与休闲中的偏好。12道原创情境分别涉及欢迎参与、练习兴趣、保留选择、确认约定、减轻负担与说明个人需要。六个犬种名称让这些做法更容易讨论，结果依据你在本题组中的实际选择产生。"
      },
      {
        "en": "“What dog breed would I be?” and “what kind of dog am I?” describe the playful human task offered here. Pet breed identification and deciding which dog to adopt are different tasks with different information needs. This page asks for neither a pet photo nor a DNA sample and does not make an adoption recommendation.",
        "zh": "“我像什么狗”“我是什么犬种”在这里指向同一项关于人的趣味探索。鉴定宠物品种、决定适合养哪种狗是另外的任务，需要不同资料。本页不收宠物照片或DNA样本，也不根据你的娱乐结果推荐领养。"
      }
    ]
  },
  {
    "id": "answering",
    "title": {
      "en": "Answer from a recent shared activity",
      "zh": "参照一次近期相处或共同活动作答"
    },
    "paragraphs": [
      {
        "en": "Recall ordinary situations with familiar people: planning free time, trying a hobby, making room in a crowded week or adjusting a shared plan. Choose what you would more naturally prefer, not what sounds most admirable or what might produce your favourite breed. If several responses fit, choose the one that would come first; if none fits exactly, choose the closest available option.",
        "zh": "可以回想与熟人安排空闲、尝试爱好、调整繁忙日程或改变共同计划的经历。选更自然愿意采用的做法，不必选最值得称赞的一项，也不用猜怎样答才能得到喜欢的犬种。几项都贴合时，选更先出现的一项；都不完全符合时，选现有选项中最接近的一项。"
      },
      {
        "en": "Each question offers four responses, not all six themes at once. There are no correct answers, pass marks or timed tasks. About three minutes is an estimate of reading time. Complete all twelve questions before viewing counts and matched reports; an unanswered question cannot be treated as a vote for any breed.",
        "zh": "每题提供四种做法，并非同时列出六个主题。题目没有正确答案、通过线或限时任务，约3分钟只是阅读用时估计。完成全部12题后才显示计数与匹配报告，未回答不能当成对任何犬种的选择。"
      }
    ]
  },
  {
    "id": "scoring",
    "title": {
      "en": "Scoring: 12 choices, six counts and eight opportunities each",
      "zh": "计分：12次选择、六项计数、每项八次机会"
    },
    "paragraphs": [
      {
        "en": "Each selected option adds one raw choice to its assigned breed. After completion, the six counts total 12. Each breed appears eight times across the twelve questions and twice in each answer position, so its possible count is 0–8. The same complete answers always produce the same counts and highest set; scoring involves no random draw, birth date or MBTI conversion.",
        "zh": "选中一个选项，对应犬种的原始计数加1。完成后六项计数合计为12。每种犬在12题中出现8次，在四个选项位置各出现2次，因此单项范围为0—8。同样的完整答案始终得到相同计数与最高集合，计分不使用抽签、生日或MBTI换算。"
      },
      {
        "en": "The choices are relative to the alternatives offered on each question. Selecting a practice goal also leaves three other options unselected; it does not establish how much you welcome people in general. A result of 6 / 8 means six selections from eight opportunities, not a 75% breed match, a percentile or a probability that the description is true.",
        "zh": "选择是相对于每题给出的其他选项而言的。例如选了练习目标，就没有选该题另外三种做法，并不能由此判断你一般有多欢迎别人。6 / 8表示八次出现机会中选了六次，不是75%的犬种匹配度、人群百分位或描述成立的概率。"
      }
    ]
  },
  {
    "id": "ties",
    "title": {
      "en": "Exact ties and what close counts mean",
      "zh": "严格并列与近分怎样阅读"
    },
    "paragraphs": [
      {
        "en": "Every breed sharing the highest count receives its complete report. The first result in the list is not promoted to a truer or more important type. Choosing the same answer position throughout gives all six breeds two selections each: 6 × 2 = 12. Read the six reports as different prompts rather than proof of six equal personality traits.",
        "zh": "同为最高计数的犬种均显示完整报告，名单靠前的一项不会因此更真实或更重要。每题固定选择同一位置，会让六种犬各得2次，6 × 2 = 12。可以把六份报告当作不同观察提示，不将它们视为六种人格特质程度相等的证明。"
      },
      {
        "en": "A one-count gap records one more selection in this set. No measurement-error estimate or meaningful-difference threshold has been established, and nearby counts are not automatically merged. The possible ties depend on the actual question design and fixed total; the interface retains the ties produced by your answers rather than inventing every imaginable combination.",
        "zh": "差1次只记录本题组里多选了一次。本题本尚未建立测量误差估计或有意义差异阈值，也不会自动合并近分。可出现的并列受题目设计与总次数限制；页面保留实际回答产生的并列，不人为拼出所有想象中的组合。"
      }
    ]
  },
  {
    "id": "comparison",
    "title": {
      "en": "Different reasons can lead to a similar-looking action",
      "zh": "看起来相似的行动，可以有不同理由"
    },
    "paragraphs": [
      {
        "en": "Golden Retriever concerns making contact easy; Pug concerns keeping demands manageable. A short gathering could serve either reason. Border Collie favours practice and visible progress, while German Shepherd favours an agreed responsibility and its follow-through. Completing a task can involve both, without establishing intelligence or trustworthiness.",
        "zh": "金毛关注让交流容易接上，巴哥关注安排不过度增加负担；一次短聚会可以同时服务这两种需要。边牧更重视练习与可见进步，德牧更重视约定责任与后续落实；完成一件事可以同时包含两者，却不能据此判断聪明或可信程度。"
      },
      {
        "en": "Husky concerns variety and room to choose; Chihuahua concerns saying a preference or limit clearly. Declining one invitation need not mean seeking novelty, and enjoying a change does not mean someone communicates their needs directly. Return to the reason for each selected response instead of treating breed stereotypes as explanations.",
        "zh": "哈士奇关注变化和自主空间，吉娃娃关注把偏好与界限说明白。拒绝一次邀请未必为了新鲜感，喜欢变化也不表示会直接表达需要。请回到每项选择的具体理由，不让犬种刻板印象替代解释。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "What scientific evidence can and cannot establish here",
      "zh": "科学证据在本页能说明什么"
    },
    "paragraphs": [
      {
        "en": "This is an original entertainment questionnaire without established reliability, validity or population norms. A reproducible count demonstrates that the rule was applied consistently, not that six stable human personality traits have been measured. Supporting that interpretation would require studies of this exact questionnaire, language and proposed use.",
        "zh": "这是一份原创娱乐问卷，尚未建立信度、效度或人群常模。计数可复算说明规则执行一致，并不证明已经测得六种稳定的人格特质。要支持这种心理测量解释，需要针对这份具体题本、语言与拟定用途开展研究。"
      },
      {
        "en": "Research on actual dogs is a separate body of evidence. Morrill and colleagues examined owner-reported canine behaviour and genetic ancestry, finding complex relationships rather than a simple breed-to-behaviour identity. That work concerns dogs: it supplies neither a human-to-breed matching rule nor validation of this quiz. Here the six assignments are editorial metaphors. [1]",
        "zh": "真实犬类研究属于另一类证据。Morrill等人考察犬主报告的犬只行为与遗传祖源，呈现的是复杂关系，而非简单的犬种与行为一一对应。这项研究针对犬只，既不提供人与犬种的匹配规则，也不验证本问卷；这里的六种对应仍是创作比喻。[1]"
      }
    ]
  },
  {
    "id": "stereotypes",
    "title": {
      "en": "Read the six results without ranking people",
      "zh": "阅读六种结果，不给人排高低"
    },
    "paragraphs": [
      {
        "en": "Border Collie does not mean higher IQ, German Shepherd does not certify loyalty, Pug does not mean laziness, and Chihuahua does not establish aggression. The questions do not test knowledge, performance, mental health or another person’s judgment of you. The preferred responses can change with company, resources and the situation you recalled.",
        "zh": "边牧不表示智商更高，德牧不认证忠诚，巴哥不表示懒惰，吉娃娃不判断攻击性。题目没有检验知识、实际表现、心理健康或别人对你的评价；相处对象、资源条件与回想的情境都可能影响选择。"
      },
      {
        "en": "A useful reading keeps an example that fits and a counterexample that does not. You might favour a clear agreement when someone relies on you and an open plan during genuinely free time. These can coexist without needing a permanent primary type or a breed-based explanation for every disagreement.",
        "zh": "有用的读法是同时保留一个符合的实例与一个不符合的反例。别人正在依赖你时，可以优先明确约定；真正空闲时，也可以想保留开放安排。两者能够共存，不必确定一个永久主型，或用犬种解释所有分歧。"
      }
    ]
  },
  {
    "id": "application",
    "title": {
      "en": "Turn one preference into a small, checkable conversation",
      "zh": "把一种偏好转成可核对的小对话"
    },
    "paragraphs": [
      {
        "en": "Choose an upcoming low-stakes activity and state one condition: a finishing time, room to change the plan, a small practice goal or one task you can take on. Ask what the other person needs too. Afterwards, check whether the arrangement worked for both people instead of whether you acted like your breed.",
        "zh": "可以选一次低风险的近期活动，说清一个条件，例如结束时间、调整计划的空间、一项练习目标或自己能承担的任务，同时问对方需要什么。结束后看安排是否照顾了双方，而不是看自己是否表现得像结果中的犬种。"
      },
      {
        "en": "The experiment is optional and has no promised effect on social skill, relationship quality or wellbeing. Breed results do not provide a compatibility percentage, hiring score or career recommendation. Real choices about work, relationships or caring for an animal require their own circumstances and evidence.",
        "zh": "尝试是自愿的，不承诺提高社交技巧、关系质量或身心状态。犬系结果不提供配对百分比、招聘分数或职业推荐；真实的工作、关系或养犬选择，需要各自具体的条件与证据。"
      }
    ]
  },
  {
    "id": "privacy",
    "title": {
      "en": "Direct start, optional drafts and the public link",
      "zh": "直接开始、自愿草稿与公开链接"
    },
    "paragraphs": [
      {
        "en": "Start test opens question one directly, without an agreement checkbox, account, email or prerequisite test. Answers are counted in the current browser and are not included in the page URL or usage-event payloads. All twelve questions, every count and all matched reports are free.",
        "zh": "点击“开始测试”直接进入第一题，无需再勾选同意、注册、填写邮箱或先做其他测评。答案在当前浏览器计数，不进入网址或使用事件载荷。全部12题、所有计数与匹配报告均免费。"
      },
      {
        "en": "After starting, you may optionally save a draft for this tab. It can be resumed after a refresh or language change for up to 24 hours and clears on completion, retake or exit-and-clear. Copying a result shares breed names and a public link, not answers or raw counts. The public guide describes a result generally and does not recreate a private attempt.",
        "zh": "开始后可以主动保存本标签页草稿，最多24小时内在刷新或换语言后恢复；完成、重测或退出并清除时删除。复制结果分享犬种名称与公开链接，不含答案或原始计数。公开指南介绍通用结果，不会还原私人作答。"
      }
    ]
  }
];
export const dogBreedFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Does 6 / 8 mean I am a 75% breed match?",
      "zh": "6 / 8是不是75%的犬种匹配度？"
    },
    "answer": {
      "en": "No. It means six selections from eight appearances of that breed in the option set. The six counts total twelve. No calibrated similarity percentage or population rank is provided.",
      "zh": "不是。它表示该犬种在选项中出现八次、其中被选六次。六项计数总和为12，本页没有校准后的相似度百分比或人群排名。"
    }
  },
  {
    "question": {
      "en": "Why can six breeds tie but exactly five cannot?",
      "zh": "为什么可以六项并列，却不会恰好五项最高并列？"
    },
    "answer": {
      "en": "The counts are whole numbers totalling twelve. Five equal leaders would need at least three each to leave the sixth below them, already exceeding twelve; if the five had two each, the remaining two would make the sixth tie as well. Same-position answers give that six-way tie. This is a property of the counting design, not a psychological finding.",
      "zh": "计数是总和为12的整数。若五项各为2次，剩余2次会让第六项也并列；若五项各至少3次，总和又已经超过12。因此本题没有恰好五项最高并列，固定同一位置作答则可以六项各2次。这是计数设计的性质，不是心理学发现。"
    }
  },
  {
    "question": {
      "en": "How do Golden Retriever and Pug differ here?",
      "zh": "这里的金毛与巴哥有什么区别？"
    },
    "answer": {
      "en": "Golden Retriever options make joining and conversation easier; Pug options simplify demands and protect a comfortable pace. An easy gathering can involve both. Look at your reason rather than assuming one result is more sociable.",
      "zh": "金毛选项侧重让加入与对话更容易，巴哥选项侧重简化负担、保护舒服节奏。一次轻松聚会可以同时包含两者，要看实际理由，不能认定哪一项更合群。"
    }
  },
  {
    "question": {
      "en": "Does wanting practice make Border Collie a higher-ability result?",
      "zh": "喜欢练习，是否让边牧成为能力更高的结果？"
    },
    "answer": {
      "en": "No. The options ask about a preferred activity or approach, not whether you perform well. No IQ, skill or learning-speed task is administered. Enjoyment of practice and actual competence are different questions.",
      "zh": "不是。选项询问更愿意采用的活动或做法，没有检验表现是否出色，也没有智商、技能或学习速度任务。喜欢练习与实际能力是两个问题。"
    }
  },
  {
    "question": {
      "en": "Can a Chihuahua result describe aggression or an attachment type?",
      "zh": "吉娃娃结果能判断攻击性或依恋类型吗？"
    },
    "answer": {
      "en": "No. Its options concern stating needs, preferences and limits. They do not measure aggression, attachment, emotional stability or dangerousness. Clear expression can be calm and respectful.",
      "zh": "不能。相关选项关注说明需要、偏好和界限，不测攻击、依恋、情绪稳定性或危险程度。明确表达可以同时平静且尊重别人。"
    }
  },
  {
    "question": {
      "en": "Can I turn this into an MBTI or DISC result?",
      "zh": "可以把犬系结果换算为MBTI或DISC吗？"
    },
    "answer": {
      "en": "No supported conversion is provided. This quiz counts choices among six original themes; it does not administer the axes or scoring of another instrument. A shared breed metaphor on another website does not make the methods equivalent.",
      "zh": "本页没有提供有依据的换算。这份题组累计六种原创主题的选择次数，没有施测其他量表的维度或计分；其他网站使用同一犬种比喻，也不代表方法等价。"
    }
  },
  {
    "question": {
      "en": "Can a result tell me which pet to adopt?",
      "zh": "结果能告诉我该领养哪种犬吗？"
    },
    "answer": {
      "en": "No. Human leisure preferences do not establish the care needs or behaviour of an individual dog, or your practical capacity to meet them. Treat the breed name as this quiz’s metaphor and address actual pet decisions separately.",
      "zh": "不能。人的休闲偏好不能确定某只犬的照护需要与行为，也不能确定自己是否具备满足这些需要的现实条件。请把犬种名称当作本页比喻，另行考虑真实养犬问题。"
    }
  },
  {
    "question": {
      "en": "Is saving required before I can answer?",
      "zh": "必须先同意保存才能答题吗？"
    },
    "answer": {
      "en": "No. Start test opens the first question directly. Draft saving is an optional control after starting. Leaving it off does not limit the questions or full results, and storage denial does not prevent completion.",
      "zh": "不需要。点击“开始测试”直接打开第一题。草稿保存是开始后的自愿选项，不开启不会限制题目或完整结果，存储被禁用时仍可完成。"
    }
  }
];
export const dogBreedSummaries: Record<string, Text> = {
  "golden-retriever": {
    "en": "Welcoming contact: make joining easy without taking responsibility for everyone’s mood.",
    "zh": "欢迎参与：让交流容易接上，也给自己的时间与余力留界限。"
  },
  "border-collie": {
    "en": "Practice and challenge: give an interest a focus without making all leisure a performance task.",
    "zh": "练习挑战：给兴趣一个具体抓手，不把所有休闲都变成成绩任务。"
  },
  "husky": {
    "en": "Variety and autonomy: leave room to choose while making shared commitments clear.",
    "zh": "变化自主：保留选择空间，同时说清共同约定中哪些已经确定。"
  },
  "german-shepherd": {
    "en": "Agreements and follow-through: clarify one responsibility and when it needs renegotiating.",
    "zh": "约定落实：确认一项责任，也说明何时需要重新商量。"
  },
  "pug": {
    "en": "Manageable pace: simplify demands and describe the participation you can actually offer.",
    "zh": "轻松节奏：减少不必要的负担，说明自己实际愿意参与的部分。"
  },
  "chihuahua": {
    "en": "Clear expression: state one need and leave space for the other person’s response.",
    "zh": "明确表达：说清一项需要，并给对方回应与协商的空间。"
  }
};
