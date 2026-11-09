import type { Locale } from "@/lib/i18n/locales";
import type { Text, QuestionnaireSection } from "@/lib/questionnaires/types";
export const superpowerSections: QuestionnaireSection[] = [
  {
    "id": "purpose",
    "title": {
      "en": "What superpower would you have? Five everyday preference metaphors",
      "zh": "我会有什么超能力？从五种日常偏好开始"
    },
    "paragraphs": [
      {
        "en": "The Superpower Test compares how you prefer to approach ordinary plans, conversations and small tasks. Its twenty original questions use Telepathy for asking and checking understanding, Flight for another viewpoint, Time Control for pacing, Invisibility for private observation and Super Strength for a bounded practical contribution. These are the five meanings used by this questionnaire.",
        "zh": "超能力测试比较你在普通安排、交流与小任务中更愿意采用的做法。20道原创题目以心灵感应比喻询问与确认理解，以飞行比喻换视角，以时间控制比喻安排节奏，以隐身比喻私下观察，以超强力量比喻有范围的实际帮助。这是本题组采用的五种含义。"
      },
      {
        "en": "Your result follows your selected responses rather than the power you most want to own. All five complete guides can be read before answering. Each connects its metaphor to a situation, a possible contribution, a tradeoff, comparisons and one optional small experiment. The guides help discuss choices without ranking powers or people.",
        "zh": "结果依据实际选择产生，不按你最想拥有的能力分配。五份完整指南在作答前即可阅读，每份都将比喻放回具体情境，说明可能帮助、取舍、相近结果比较与一次自愿小尝试，用于讨论选择，不给超能力或人排高低。"
      }
    ]
  },
  {
    "id": "answering",
    "title": {
      "en": "Answer from a recent ordinary arrangement",
      "zh": "参照一次近期的普通安排作答"
    },
    "paragraphs": [
      {
        "en": "Recall a shared afternoon, an unfamiliar activity, a changed plan or a conversation that needs clarification. Choose the offered response closest to what you would naturally prefer in such a situation. If several fit, use a concrete example to decide what would come first; you do not need to infer which answer earns a particular power.",
        "zh": "可以回想共同度过一个下午、参加陌生活动、调整计划或澄清一次对话的经历。选更接近自己自然偏好的做法；几项都符合时，用一个具体例子判断哪一项更先出现，不必猜哪种回答能得到某项超能力。"
      },
      {
        "en": "Every question offers four alternatives, with no correct answer or time limit. About five minutes is a reading estimate. Complete all twenty questions before viewing the five counts. No birthday, MBTI result, email or account is required, and no agreement checkbox stands between Start test and question one.",
        "zh": "每题提供四种做法，没有正确答案或限时要求，约5分钟只是阅读用时估计。完成全部20题后才显示五项计数，不需要生日、MBTI结果、邮箱或账户，点击开始与第一题之间没有额外同意勾选。"
      }
    ]
  },
  {
    "id": "scoring",
    "title": {
      "en": "Twenty choices and sixteen appearances per power",
      "zh": "20次选择，每种能力出现16次"
    },
    "paragraphs": [
      {
        "en": "Each selected response adds one raw count to its assigned power. The five completed counts sum to twenty. Each power appears sixteen times, four times in each answer position, so its possible count is 0–16. The same complete responses always produce the same counts; there is no random selection, secret bonus or conversion from another test.",
        "zh": "每选中一个选项，对应能力的原始计数加1，完成后五项合计20。每种能力出现16次，在四个选项位置各出现4次，单项范围为0—16。同样的完整答案始终产生同样的计数，不使用随机抽取、隐藏加分或其他测试换算。"
      },
      {
        "en": "A count of 8 / 16 means eight selections from sixteen opportunities, not a 50% match or an ability level. Choosing one response leaves three others unselected, so the five numbers are relative choices within this set rather than independent trait ratings. They do not establish population ranks, rarity or probabilities of possessing a power.",
        "zh": "8 / 16表示十六次出现机会中被选八次，不是50%的匹配度或能力等级。选中一项也意味着该题另外三项没有被选中，因此五项是本题组内部的相对选择，而非独立的特质评分，不提供人群排名、稀有度或拥有超能力的概率。"
      }
    ]
  },
  {
    "id": "ties",
    "title": {
      "en": "All highest ties remain complete",
      "zh": "全部最高并列均完整保留"
    },
    "paragraphs": [
      {
        "en": "Every power sharing the highest count receives its full report, without a tiebreaker question, payment or preference for the first result in the list. Selecting the same option position throughout gives each power four selections: 5 × 4 = 20. Read this as a feature of the balanced layout, not proof of five equally developed abilities.",
        "zh": "同为最高计数的能力均显示完整报告，不增加破同分题、不要求付费，也不偏向名单第一项。每题固定选同一位置，会让五种能力各得4次，5 × 4 = 20。这来自选项布局的平衡，不证明五种能力发展程度相同。"
      },
      {
        "en": "A one-count difference records one more choice in these questions. No measurement-error estimate or meaningful-difference threshold has been established, and unequal counts are not automatically merged. Nearby guides may both be useful prompts, without becoming a permanent primary and secondary personality type.",
        "zh": "差1次记录的是在这些题目里多选一次，目前尚未建立测量误差估计或有意义差异阈值，也不会自动合并不同计数。近分指南都可以作为观察提示，不必据此形成永久主型和次型。"
      }
    ]
  },
  {
    "id": "understanding",
    "title": {
      "en": "Telepathy and Invisibility: ask, observe and leave room",
      "zh": "心灵感应与隐身：询问、观察和保留空间"
    },
    "paragraphs": [
      {
        "en": "Telepathy options favour checking an interpretation with the person involved. Invisibility options favour reviewing available details and choosing when to participate or share. You might first read an activity description privately, then ask one specific question. Neither response grants access to another person’s private information or makes an impression about them automatically correct.",
        "zh": "心灵感应选项更重视向当事人核对理解，隐身选项更重视先查看已有细节，并选择何时参与或分享。你可以先私下读活动说明，再问一个具体问题。两种做法都不赋予获取他人隐私的权利，也不让自己对别人的印象自动正确。"
      },
      {
        "en": "Research can inform this distinction without validating the quiz. In their 2018 experiments, Eyal, Steffel and Epley distinguished imagining another person’s perspective from obtaining information through conversation. Their reported findings caution against treating imagined understanding as accuracy; the final experiment found an accuracy benefit from conversation. That is background for checking assumptions, not evidence for a Telepathy score or a universal promise about every conversation. [1]",
        "zh": "研究可以帮助理解这种区别，但不能验证本题组。Eyal、Steffel与Epley在2018年的实验中区分了设想他人视角与通过对话获取信息。其报告结果提醒人们，设想理解不等于判断准确；最后一项实验发现对话有助于提高判断准确性。这为核对猜测提供背景，不是心灵感应计数的效度证据，也不保证每次对话都会产生相同效果。[1]"
      }
    ]
  },
  {
    "id": "arrangements",
    "title": {
      "en": "Flight, Time Control and Super Strength: different conditions for one plan",
      "zh": "飞行、时间控制与超强力量：同一安排的不同条件"
    },
    "paragraphs": [
      {
        "en": "Flight favours another route or perspective, Time Control attends to timing and buffers, and Super Strength offers one concrete contribution. For a gathering, those could mean suggesting another venue, agreeing on a finish or preparing a shared surface. All three can coexist; changing a plan does not establish unreliability, and keeping time in mind does not mean filling every minute.",
        "zh": "飞行关注替代路线或视角，时间控制关注时段与缓冲，超强力量关注一项具体协助。放在聚会中，可以分别是建议换地点、约定结束时间或准备共用桌面。三者能够共存，改变安排不证明不可靠，关注时间也不等于填满每一分钟。"
      },
      {
        "en": "Super Strength is not a fitness or skill result, and it creates no obligation to carry more work. Clarify what is wanted and what you can willingly offer. Time Control does not certify productivity or composure under pressure, and Flight does not measure risk-taking or creative ability. Those questions require evidence beyond a selected preference.",
        "zh": "超强力量不是体能或技能结果，也不产生多承担工作的义务。可以先确认对方需要什么，以及自己愿意提供什么。时间控制不认证效率或抗压表现，飞行不测冒险与创造能力，这些问题需要超出偏好选择的证据。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "What transparent scoring establishes—and what still needs research",
      "zh": "透明计分能说明什么，哪些解释仍需研究"
    },
    "paragraphs": [
      {
        "en": "This original entertainment questionnaire has no established reliability, validity or population norms. Reproducing the count checks whether the published rule was followed. It does not establish that five stable traits were measured or that the descriptions predict behaviour. Such interpretations would require studies of these exact items, languages and proposed uses.",
        "zh": "这份原创娱乐问卷尚未建立信度、效度或人群常模。复算计数可以核对公开规则是否得到执行，不能证明已经测得五种稳定特质，也不能证明说明能预测行为。要支持这些解释，需要研究具体题目、语言与拟定用途。"
      },
      {
        "en": "Liking a description or recognising one example is a reason to reflect, not a validation study. Look for a counterexample too: when did you prefer asking rather than observing, or preparation rather than another option? The page does not translate powers into MBTI, DISC, Big Five, EQ or a career-fit score. Shared words across websites do not make their methods equivalent.",
        "zh": "喜欢一段描述或认出一个例子可以引发思考，但不是效度研究。同时寻找反例：什么时候你更想询问而非观察，更想准备而非换个选项？本页不把能力名称换算为MBTI、DISC、大五、EQ或职业适配分数；网站之间使用相同词语，不代表方法等价。"
      }
    ]
  },
  {
    "id": "application",
    "title": {
      "en": "Turn a result into one bounded request",
      "zh": "把结果转成一项有范围的请求"
    },
    "paragraphs": [
      {
        "en": "Choose a low-stakes shared activity and describe a condition: one question to clarify, another workable option, a finish time, some private preparation or a small agreed task. Ask what the other person prefers and accept a different answer. Afterwards, compare the actual experience and demands, rather than checking whether you acted like your power.",
        "zh": "可以选一次低风险的共同活动，说清一个条件：需要澄清的一个问题、另一种可行选项、结束时间、一段私人准备或一项约定的小任务。问对方更希望怎样安排，并接受不同回答。之后比较实际感受与负担，而不是检查自己是否表现得像某项能力。"
      },
      {
        "en": "The experiment is optional and carries no promise of improved wellbeing, empathy, productivity or relationship quality. A result cannot assign a job, establish trustworthiness or determine how much someone owes a group. Decisions about a real task should use relevant skill, agreement, capacity and circumstances.",
        "zh": "尝试是自愿的，不承诺改善身心状态、共情、效率或关系质量。结果不能分配岗位、认定可信程度或决定一个人欠团队多少付出。实际任务应依据相关技能、共同约定、余力与具体条件安排。"
      }
    ]
  },
  {
    "id": "privacy",
    "title": {
      "en": "Starting, retaking and sharing a public link",
      "zh": "开始、重测与分享公开链接"
    },
    "paragraphs": [
      {
        "en": "Start test opens the first question directly. Your responses are counted in the current browser, without inclusion in the page URL or usage-event payloads. All twenty questions, every raw count and every highest-match report are free; registration and another assessment are not prerequisites.",
        "zh": "点击开始测试直接打开第一题。回答在当前浏览器计数，不进入网址或使用事件载荷。全部20题、所有原始计数与最高匹配报告均免费，注册与其他测评均不是前置要求。"
      },
      {
        "en": "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over. Copying a result shares power names and a public link, not responses or counts. The public guide does not reconstruct a private attempt.",
        "zh": "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。复制结果只分享能力名称与公开链接，不包含回答或计数，公开指南不会还原私人作答。"
      }
    ]
  }
];
const superpowerPrivacyAnswer: Text = {
  en: "Scoring runs in your browser. This quiz does not save your progress or keep a history of past attempts. Retaking starts a new attempt. The copied result includes power names and a public link, without answers, counts or internal IDs.",
  zh: "结果在浏览器内计算。这份测试不保存答题进度或历史记录，重测会开始一次新的作答。复制内容包含能力名称与公开链接，不含答案、计数或内部ID。",
};

export function superpowerVisibleFaqAnswer(faq: { question: Text; answer: Text }, locale: Locale) {
  return (faq.question.en === "Do drafts, retaking or sharing include my answers?" ? superpowerPrivacyAnswer : faq.answer)[locale];
}

export const superpowerFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Does 8 / 16 mean I have a 50% match?",
      "zh": "8 / 16代表50%的匹配度吗？"
    },
    "answer": {
      "en": "No. It records eight choices from sixteen appearances of that power. The five counts total twenty; they are not calibrated similarity percentages or ability levels.",
      "zh": "不是。它记录该能力出现十六次、被选八次，五项合计20，不是经过校准的相似度百分比或能力等级。"
    }
  },
  {
    "question": {
      "en": "Can all five powers tie?",
      "zh": "五种能力可以同时并列吗？"
    },
    "answer": {
      "en": "Yes. Choosing the same position on all twenty questions gives four counts to each power. All five complete reports are kept, without an extra question to select one.",
      "zh": "可以。20题固定选择同一位置，五项各得4次，五份完整报告都保留，不增加额外题目挑选一项。"
    }
  },
  {
    "question": {
      "en": "Does Telepathy mean accurate intuition or high EQ?",
      "zh": "心灵感应表示直觉准确或情商高吗？"
    },
    "answer": {
      "en": "No. The options favour asking and checking understanding. They do not test how accurately you identify emotions or predict thoughts. Check an impression with the person rather than treating the result as proof.",
      "zh": "不是。选项偏向询问和确认理解，没有检验情绪识别或预测想法的准确性。应向当事人核对印象，不把结果当成证明。"
    }
  },
  {
    "question": {
      "en": "Is Invisibility an introversion or social-anxiety score?",
      "zh": "隐身是内向或社交焦虑分数吗？"
    },
    "answer": {
      "en": "No. It concerns observing available information and choosing what to share. The questionnaire does not assess introversion, anxiety, loneliness or social skill.",
      "zh": "不是。它关注查看已有信息和选择分享范围，没有评估内外向、焦虑、孤独或社交技能。"
    }
  },
  {
    "question": {
      "en": "Does Time Control mean I am good at managing time?",
      "zh": "时间控制代表我善于管理时间吗？"
    },
    "answer": {
      "en": "Preferring buffers or clear timing does not establish actual scheduling performance. No timed task, productivity measure or assessment of punctuality is administered.",
      "zh": "偏好缓冲或清晰时段不证明实际排程表现，本题没有计时任务、产出测量或守时考查。"
    }
  },
  {
    "question": {
      "en": "Should a Super Strength result take on more responsibility?",
      "zh": "超强力量结果应该多承担责任吗？"
    },
    "answer": {
      "en": "No. It records a preference for a specific practical contribution, not a duty or proof of ability. Tasks still need agreement, relevant skill and realistic capacity.",
      "zh": "不需要。它记录愿意作出具体协助的偏好，不是义务或能力证明，任务仍需共同约定、相关技能与现实余力。"
    }
  },
  {
    "question": {
      "en": "Does a low count show a weakness I should fix?",
      "zh": "低计数表示需要补足的弱点吗？"
    },
    "answer": {
      "en": "No. It means fewer selections among the alternatives in this set. It does not establish a missing ability, a suppressed need or a development priority.",
      "zh": "不是。它表示在本题组的给定选项中较少被选中，不证明缺少能力、压抑需要或必须优先发展的方向。"
    }
  },
  {
    "question": {
      "en": "Can I pause and finish later?",
      "zh": "可以暂停，下次接着做吗？"
    },
    "answer": {
      "en": "You can pause while keeping the quiz open. If you refresh or leave, start again from question one.",
      "zh": "保持测试页面打开时，可以先停一会儿。刷新或离开后，需要从第一题重做。"
    }
  }
];
export const superpowerSummaries: Record<string, Text> = {
  "telepathy": {
    "en": "Ask and check: give another person room to explain or correct your interpretation.",
    "zh": "询问与确认：给对方说明或修正自己理解的空间。"
  },
  "flight": {
    "en": "Another viewpoint: try a workable alternative while making shared conditions clear.",
    "zh": "换个视角：尝试可行替代方案，同时说明共同条件。"
  },
  "time-control": {
    "en": "Pacing and buffers: clarify when an activity can begin, pause and finish.",
    "zh": "节奏与缓冲：确认一件事何时开始、暂停和结束。"
  },
  "invisibility": {
    "en": "Private observation: separate known details from guesses and choose what to share.",
    "zh": "私下观察：区分已知细节与猜测，并选择分享范围。"
  },
  "super-strength": {
    "en": "Bounded help: agree on one practical contribution that fits your willingness and capacity.",
    "zh": "有范围的帮助：商定一项符合自己意愿与余力的具体协助。"
  }
};
