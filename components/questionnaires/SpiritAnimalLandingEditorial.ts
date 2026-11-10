import type { Locale } from "@/lib/i18n/locales";
import type { Text, QuestionnaireSection } from "@/lib/questionnaires/types";

export const spiritAnimalSections: QuestionnaireSection[] = [
  {
    "id": "purpose",
    "title": {
      "en": "What does this spirit animal test explore?",
      "zh": "精神动物测试探索什么？"
    },
    "paragraphs": [
      {
        "en": "The Spirit Animal Test is an original symbolic choice quiz. Eighteen everyday scenarios compare nine ways of approaching shared commitments, information, alternatives, decisions, conversation, feelings, pace, purpose and play. Your result names the animal options you selected most often within this set; every highest tie remains visible.",
        "zh": "精神动物测试是一份原创动物比喻选择问卷。18道日常情境比较共同约定、信息依据、替代方法、行动决定、对话、感受、节奏、整体目的与共同玩乐九种切入点。结果表示你在这份题组中较常选择哪些动物对应的做法，所有最高并列均完整保留。"
      },
      {
        "en": "An inner animal personality test can be an enjoyable starting point for discussing a concrete experience. Here the animal is a name for the selected responses, not a measurement of an underlying animal identity. Read the explanation alongside what happened, what you needed and which other responses could also have fitted.",
        "zh": "内在动物人格测试可以成为讨论具体经历的趣味入口。这里的动物是所选做法的名称，不是对隐藏动物身份的测量。阅读时同时核对当时发生了什么、你需要什么，以及其他哪些做法也可能适用。"
      }
    ]
  },
  {
    "id": "answering",
    "title": {
      "en": "How to answer the 18 four-choice scenarios",
      "zh": "18道四选一怎样作答"
    },
    "paragraphs": [
      {
        "en": "Use a recent, ordinary situation you can recall. Choose the response closer to what you would actually do, rather than the animal you hope to receive or the response that sounds most admirable. When several fit, choose the one that would usually come first; when none fits exactly, choose the closest available response.",
        "zh": "参照一段能回想起来的近期日常经历，选择更接近实际做法的一项，不必追求某种动物或看起来最值得赞赏的回答。几项都符合时，选通常更先出现的做法；都不完全符合时，选择现有选项中最接近的一项。"
      },
      {
        "en": "Each scenario offers four possibilities rather than all nine themes. Complete all 18 to receive counts and full matched reports. There is no correct answer, time limit or pass mark. About four minutes is a reading estimate; take longer if you need to compare the choices.",
        "zh": "每个情境提供四种可能做法，不是把九个主题同时列出。完成全部18题后显示计数与匹配结果全文。题目没有正确答案、倒计时或通过线；约4分钟是阅读用时估计，可以按自己的速度比较选项。"
      }
    ]
  },
  {
    "id": "counts",
    "title": {
      "en": "Scoring: one selected option, one raw choice",
      "zh": "计分方法：选中一次，计数加一"
    },
    "paragraphs": [
      {
        "en": "Every option maps to one animal. Selecting it adds one to that animal and nothing to the others. The nine counts sum to 18 after completion. Each animal occurs eight times across the questionnaire, twice in each answer position, so its possible raw count is 0–8. The same complete answers always produce the same counts and matched animals.",
        "zh": "每个选项对应一种动物，选中后仅给该动物加1次。完成后九项计数总和为18。每种动物在整份题组中出现8次，在四个选项位置各出现2次，因此单项原始计数范围为0—8。同一份完整答案始终得到相同计数与匹配动物。"
      },
      {
        "en": "The count is relative to these particular alternatives. Choosing one response also means not choosing the other three on that question; a lower count is not an absence of a quality. A display such as 5 / 8 means five selections from eight offered opportunities, not 62.5% personality similarity, a percentile or an accuracy estimate.",
        "zh": "计数取决于这份题组所给的替代选项。选择一个做法，同时意味着该题另外三项未被选中；低计数不表示某种品质缺失。显示5 / 8表示八次出现机会中被选了五次，不是62.5%的性格相似度、人群百分位或准确率。"
      }
    ]
  },
  {
    "id": "ties",
    "title": {
      "en": "Highest ties, close counts and the nine-way example",
      "zh": "最高并列、近分与九项并列示例"
    },
    "paragraphs": [
      {
        "en": "All animals sharing the largest count receive their complete report. No list order, letter order or random draw selects a single winner. For a reproducible example, choosing the first option on every question gives all nine animals two selections each: 9 × 2 = 18. This is a valid nine-way tie under the counting rule, not evidence that someone has nine equal personality traits.",
        "zh": "计数同为最高的动物均获得完整报告，不使用名单顺序、选项字母或随机抽签挑一个赢家。一个可以复算的例子是：每题都选第一项，九种动物各得2次，9 × 2 = 18。它是按计数规则成立的九项并列，不是九种人格特质程度相等的证据。"
      },
      {
        "en": "One extra selection can change the highest set. The quiz has no established measurement error or threshold for a meaningful difference, and close counts are not automatically merged into ties. Read a close second animal if its examples help, while keeping the actual counts and exact ties separate.",
        "zh": "多选一次就可能改变最高集合。本题本尚未建立测量误差或有意义差异的阈值，也不会把近分自动合并为同分。可以参考计数接近的动物说明，但要分清实际计数、严格并列与自己对例子的理解。"
      }
    ]
  },
  {
    "id": "contrasts",
    "title": {
      "en": "Compare the reason for an action, not the animal stereotype",
      "zh": "比较行动理由，而不只看动物印象"
    },
    "paragraphs": [
      {
        "en": "Dolphin concerns connecting conversation and understanding views; Otter concerns voluntary shared play. A quiet game may fit Otter without much conversation, and a careful discussion may fit Dolphin without any game. Fox tries another route to test what works; playfulness alone does not identify Fox.",
        "zh": "海豚关注接上对话、理解想法，水獭关注自愿共同玩乐。安静的游戏也可能有水獭线索；认真讨论也可以没有任何游戏。狐狸关注换一条路试验是否可行，不能只凭好玩就认定是狐狸。"
      },
      {
        "en": "Wolf protects mutual commitments, whereas Bear protects a manageable pace. Owl asks what is known; Eagle asks what the activity is for. Lion makes the next decision explicit; Deer checks feelings and comfortable participation. One real action can serve several purposes, even though each quiz option has one counting assignment.",
        "zh": "狼重视共同约定，熊重视可维持的节奏；猫头鹰关注已知依据，鹰关注活动的整体目的；狮子明确下一步决定，鹿核对感受与参与是否舒服。现实中的同一个动作可以同时服务多个目的，尽管每个题目选项只对应一种计数。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Scientific interpretation: what is established here?",
      "zh": "科学性怎样判断：本页已知与未知"
    },
    "paragraphs": [
      {
        "en": "The rules make the result reproducible and inspectable. They do not establish reliability, construct validity or population norms. FermatMind has not established that these animal counts measure nine stable psychological traits, predict behaviour outside the questions or identify the best career or partner.",
        "zh": "明确规则让结果可以复算、可以检查，但不能据此建立信度、构念效度或人群常模。费马尚未证明这些动物计数测量九种稳定心理特质、预测题目之外的行为，或识别最合适的职业与伴侣。"
      },
      {
        "en": "Claims of psychological validity would require studies of this exact questionnaire, language and intended use, including how responses relate to the proposed interpretation and how results behave across occasions and groups. Naming a famous personality theory, publishing more animal profiles or recognising yourself in a flattering description cannot supply those studies.",
        "zh": "若要主张心理测量效度，需要围绕这份具体题本、语言和用途开展研究，包括作答与解释的关系，以及结果在不同时间和人群中的表现。引用知名人格理论、增加动物数量，或觉得一段正面描述很像自己，都不能代替这些研究。"
      }
    ]
  },
  {
    "id": "culture",
    "title": {
      "en": "Animal metaphor and cultural context",
      "zh": "动物比喻与文化语境"
    },
    "paragraphs": [
      {
        "en": "“Spirit animal” is a familiar search phrase, but this website uses it for original entertainment metaphors. Smithsonian’s National Museum of the American Indian explains that animal relationships and clan meanings belong to particular communities and should not be flattened into a classroom spirit-animal activity. Its guidance provides cultural context, not validation of this quiz. [1]",
        "zh": "“精神动物”是常见搜索用语，本页以它指代原创娱乐比喻。史密森尼学会美国印第安人国家博物馆指出，动物关系与氏族意义属于具体社群，不能简化为课堂中的精神动物配对活动。该资料帮助理解文化语境，不是对本题本的验证。[1]"
      },
      {
        "en": "The nine assignments here do not identify a clan, sacred guide, inherited tradition or a biological species within a person. They also do not infer animal behaviour from human answers. You may keep a useful example while declining the animal name; understanding a particular cultural practice requires sources from that community.",
        "zh": "这里的九种对应不识别氏族、神圣向导、文化传承或一个人内部的生物物种，也不从人的回答推断真实动物行为。可以保留有用的例子而不接受动物名称；了解某个具体文化实践时，应回到该社群的资料。"
      }
    ]
  },
  {
    "id": "reflection",
    "title": {
      "en": "Use a result to examine one real experience",
      "zh": "把结果用于核对一次真实经历"
    },
    "paragraphs": [
      {
        "en": "Choose one matched animal and recall an event that fits its description. Write what you did, what need it served and what it cost. Then recall a counterexample. For example, suggesting a shared game may have been about enjoyment, easing an awkward exchange or keeping a promise; the same outward action need not have the same reason.",
        "zh": "选一只匹配动物，回想一个符合描述的事件，写下自己做了什么、照顾了什么需要、付出了什么代价，再找一个不符合的反例。例如提议一起玩，可能为了享受过程、接上尴尬的对话，或履行先前约定；相似的外在动作未必出于相同理由。"
      },
      {
        "en": "If useful, try one small change in a low-stakes setting: ask before inviting others into play, give a proposal a clear next step, or check one missing fact. Evaluate what happened rather than whether you behaved like the animal. These are optional observation exercises, without a promised improvement in wellbeing, skill or relationships.",
        "zh": "如果有帮助，可以在低风险情境里尝试一个小调整：邀请玩乐前先问意愿、为提议补上明确下一步，或核对一个缺失事实。看实际发生了什么，而不是看自己是否更像那只动物。这些是自愿观察练习，不承诺改善健康、能力或关系。"
      }
    ]
  },
  {
    "id": "privacy",
    "title": {
      "en": "Free results, retaking and private sharing",
      "zh": "免费结果、重测与分享范围"
    },
    "paragraphs": [
      {
        "en": "Start test opens the first question directly. No agreement checkbox, email, birthday or previous test is required. Answers are counted in the current browser. The website may record bounded usage events, but question responses are not included in those events or the page URL.",
        "zh": "点击“开始测试”直接进入第一题，无需勾选同意、填写邮箱或生日，也无需先做其他测试。答案在当前浏览器计数；网站可能记录使用事件，但题目回答不进入这些事件或页面网址。"
      },
      {
        "en": "This question page does not save progress: refreshing, changing language or leaving it starts over. Retaking starts a new attempt without keeping a history of personal reports. Result copying includes animal names and a public link, not the answer sheet or raw counts. Opening that link does not recreate a private attempt.",
        "zh": "当前答题页不提供进度保存；刷新、切换语言或离开后会从头开始。重测开始新的作答，不保留历史个人报告。复制结果包含动物名称与公开链接，不含答卷或原始计数；打开该链接不会还原私人作答。"
      }
    ]
  }
];

export const spiritAnimalFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Does 5 / 8 mean a 62.5% animal match?",
      "zh": "5 / 8是不是62.5%的动物相似度？"
    },
    "answer": {
      "en": "No. It records five choices from eight opportunities for that animal. There is no calibrated similarity scale, reference population or accuracy percentage. All nine counts together total 18.",
      "zh": "不是。它记录该动物八次出现机会中有五次被选中。本页没有校准后的相似度量尺、人群参照或准确率百分比，九项计数合计为18。"
    }
  },
  {
    "question": {
      "en": "Why can all nine animals tie?",
      "zh": "为什么九种动物可以全部并列？"
    },
    "answer": {
      "en": "Every animal appears twice in each option position. Choosing the same position on all 18 questions therefore gives each animal two counts. All nine are then highest and all nine complete reports appear. This arithmetic does not establish nine equal human traits.",
      "zh": "每种动物在每个选项位置都出现两次，因此18题固定选择同一位置，会让每种动物各得2次。九项同为最高，就显示九份完整报告。这项算术关系不能证明人的九种特质相等。"
    }
  },
  {
    "question": {
      "en": "Do Dolphin and Otter describe the same thing?",
      "zh": "海豚和水獭是不是同一种结果？"
    },
    "answer": {
      "en": "No. In this questionnaire Dolphin options connect conversation and understanding; Otter options invite voluntary shared play. A conversation need not be playful, and a game need not involve much conversation. The profiles compare those specific reasons.",
      "zh": "不是。本题海豚选项侧重对话连接与理解，水獭选项侧重自愿共同玩乐。交谈不一定好玩，游戏也不一定需要很多交谈；报告比较的是这些具体理由。"
    }
  },
  {
    "question": {
      "en": "Does a low Owl or Lion count indicate low intelligence or leadership?",
      "zh": "猫头鹰或狮子计数低，是否表示智力或领导能力低？"
    },
    "answer": {
      "en": "No. The options concern checking information and taking a clear next step, respectively. Counts do not measure intelligence, competence, confidence or authority. A different choice can be useful in the same situation.",
      "zh": "不能。相关选项分别关注核对信息与明确下一步，计数不测智力、胜任力、自信或权威。同一情境下选择别的做法也可能有用。"
    }
  },
  {
    "question": {
      "en": "Can this identify a spiritual guide or cultural identity?",
      "zh": "它能识别精神向导或文化身份吗？"
    },
    "answer": {
      "en": "No. The animal assignments are FermatMind’s original entertainment choices. Cultural animal relationships and clan meanings are specific to communities; a website questionnaire cannot assign them. See the Smithsonian cultural-context resource below.",
      "zh": "不能。动物对应是费马原创的娱乐设定。文化中的动物关系与氏族意义属于具体社群，网页问卷不能分配这类身份；相关背景可阅读下方史密森尼博物馆资料。"
    }
  },
  {
    "question": {
      "en": "Can I convert an animal into MBTI, Big Five or DISC?",
      "zh": "可以把动物换算成MBTI、大五人格或DISC吗？"
    },
    "answer": {
      "en": "No supported conversion is provided. Those frameworks use different concepts and scoring. An animal name, a count or an appealing description cannot recover scores or a type from a separate instrument.",
      "zh": "本页没有提供有依据的换算。这些框架的概念与计分不同，动物名称、计数或一段贴合的描述不能还原另一项测评的分数或类型。"
    }
  },
  {
    "question": {
      "en": "Is this a therian identity or mental health test?",
      "zh": "这是动物认同或心理健康测试吗？"
    },
    "answer": {
      "en": "No. It records choices among ordinary scenarios and returns symbolic names. It cannot determine a personal identity, assess mental health or explain distress. You do not need to accept the symbolic label to use an example from a guide.",
      "zh": "不是。它记录日常情境中的选择，返回象征名称，不能确定个人身份、评估心理健康或解释痛苦经历。使用指南中的一个例子，也不需要接受动物标签。"
    }
  },
  {
    "question": {
      "en": "Do I have to agree to anything before starting?",
      "zh": "开始前必须再勾选同意吗？"
    },
    "answer": {
      "en": "No. Start test opens question one directly. This question page does not save progress; refreshing, changing language or leaving it starts over.",
      "zh": "不需要。点击“开始测试”直接打开第一题。当前答题页不提供进度保存；刷新、切换语言或离开后会从头开始。"
    }
  }
];

export const spiritAnimalSummaries: Record<string, Text> = {
  "wolf": {
    "en": "Shared commitments: compare keeping an agreement with carrying more than you agreed to.",
    "zh": "共同约定：分清履行承诺与承担超出约定的责任。"
  },
  "owl": {
    "en": "Evidence before action: compare checking a relevant gap with waiting for certainty.",
    "zh": "先核对依据：分清补足关键信息与等待完全确定。"
  },
  "fox": {
    "en": "Alternative routes: compare a small test of a changed approach with changing for its own sake.",
    "zh": "替代路线：分清小范围试验新方法与为了变化而变化。"
  },
  "lion": {
    "en": "A clear next step: compare stating a proposal with deciding for other people.",
    "zh": "明确下一步：分清提出清楚的行动建议与替别人做主。"
  },
  "dolphin": {
    "en": "Connecting conversation: invite views while leaving room for silence and disagreement.",
    "zh": "连接对话：邀请表达，同时给沉默和不同意见留空间。"
  },
  "deer": {
    "en": "Feelings and comfortable participation: check a need rather than assuming it.",
    "zh": "感受与舒服的参与：直接核对需要，而不是替人猜定。"
  },
  "bear": {
    "en": "A manageable pace: compare a repeatable step with a familiar method that needs updating.",
    "zh": "可维持的节奏：分清可靠的重复步骤与需要更新的旧方法。"
  },
  "eagle": {
    "en": "Wider purpose: connect a goal to a practical step and the people affected.",
    "zh": "整体目的：把目标与可行步骤及相关人的处境连起来。"
  },
  "otter": {
    "en": "Voluntary shared play: enjoy the process while making declining or stopping equally available.",
    "zh": "自愿共同玩乐：享受过程，也允许拒绝、旁观或随时结束。"
  }
};

/** Current answering flow; the accepted source questionnaire remains unchanged. */
export const spiritAnimalPrivacyAnswer = {
  zh: "18题、九份完整解释、并列结果均免费，无需注册或先做其他测评。当前答题页不提供进度保存；刷新、切换语言或离开后会从头开始。重测开始新的作答，不保留历史个人报告。复制分享只包含动物名称与公开入口／说明链接，不含答卷、原始计数或个人均分。",
  en: "All 18 questions, nine complete explanations and tied results are free, with no signup or prerequisite test. This question page does not save progress; refreshing, changing language or leaving it starts over. Retaking starts a new attempt without keeping a history of personal reports. Copying shares only animal names and a public entry or guide link, never answers, raw counts or personal means.",
};

export function spiritAnimalVisiblePrivacyAnswer(locale: Locale): string {
  return spiritAnimalPrivacyAnswer[locale];
}
