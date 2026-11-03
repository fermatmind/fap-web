import type { Text, QuestionnaireSection } from "@/lib/questionnaires/types";
export const mythicalCreatureSections: QuestionnaireSection[] = [
  {
    "id": "purpose",
    "title": {
      "en": "What mythical creature are you? Six ways to approach an idea",
      "zh": "我是什么神话生物？从六种做法理解创作与交流"
    },
    "paragraphs": [
      {
        "en": "This mythical creature quiz uses eighteen original situations to compare what you would choose in creative activities and conversations. Dragon represents beginning a chosen direction, Phoenix revising an earlier attempt, Unicorn opening another possibility, Griffin clarifying shared agreements, Mermaid discussing feelings and Kraken organising thoughts privately. These are the six assignments used in this edition.",
        "zh": "这份神话生物测试通过18道原创情境，比较你在创作活动与交流中更愿意采用的做法。龙对应确定方向并开始，凤凰对应调整已有尝试，独角兽对应打开另一种可能，狮鹫对应确认共同约定，美人鱼对应交流感受，克拉肯对应私下整理想法。这些是本版采用的六种对应。"
      },
      {
        "en": "A result supplies language for discussing a choice, including its possible contribution and tradeoff. It does not require a belief in mythical creatures or knowledge of their stories. All six complete public guides are available before answering, and every highest-count result remains available after completion.",
        "zh": "结果为讨论一种选择提供语言，同时说明可能的帮助与取舍。作答不要求相信神话生物真实存在，也不考查传说知识。六份完整公开指南在作答前即可阅读，完成后所有最高计数对应的结果都完整保留。"
      }
    ]
  },
  {
    "id": "answering",
    "title": {
      "en": "Use recent situations rather than a favourite character",
      "zh": "参照近期情境，不必追求喜欢的角色"
    },
    "paragraphs": [
      {
        "en": "Think about starting a small project, returning to a paused hobby, sharing an unfinished idea or making room for someone in a creative activity. Choose the available response closest to what you would naturally do. Several may fit: choose the one that would come first, rather than the one that seems most impressive or produces a preferred creature.",
        "zh": "可以回想启动小计划、重拾暂停的爱好、分享未完成的想法，或在创作活动中为别人留空间的经历。选择现有选项里更接近自然做法的一项。多项符合时，选更先出现的一项，不必选听起来最出色或能得到喜欢角色的一项。"
      },
      {
        "en": "Each question offers four responses. There are no correct answers or time limit; about five minutes is a reading estimate. Complete all eighteen questions before viewing the six counts. The quiz does not ask for your birth date, MBTI code, personal history or an account.",
        "zh": "每题提供四种做法，没有正确答案或时间限制，约5分钟只是阅读用时估计。完成全部18题后才展示六项计数。本题不需要生日、MBTI代码、个人经历详情或账户。"
      }
    ]
  },
  {
    "id": "scoring",
    "title": {
      "en": "18 choices, six raw counts and twelve opportunities per creature",
      "zh": "18次选择、六项原始计数、每项十二次机会"
    },
    "paragraphs": [
      {
        "en": "Selecting an option adds one to its assigned creature. The six completed counts total eighteen. Each creature appears twelve times across the options, three times in each position; its possible count is therefore 0–12. The same complete responses produce the same counts without a random draw or hidden bonus.",
        "zh": "选中一个选项，对应生物的计数加1，完成后六项合计为18。每种生物在全部选项中出现12次，在四个位置各出现3次，因此单项范围为0—12。同样的完整答案始终产生相同计数，不使用抽签或隐藏加分。"
      },
      {
        "en": "These are relative choices among the alternatives on each question, not six independent ratings. Selecting an action leaves three other options unselected. A count of 6 / 12 records six selections from twelve appearances; it is not a 50% creature match, an ability score, a population percentile or a probability that a description is true.",
        "zh": "这些计数来自每题不同做法之间的相对选择，并非六个独立评分。选中一种做法，也意味着该题另外三项没有被选中。6 / 12记录十二次出现机会中被选六次，不是50%的生物匹配度、能力分数、人群百分位或描述成立的概率。"
      }
    ]
  },
  {
    "id": "ties",
    "title": {
      "en": "Read every highest tie and keep nearby counts in context",
      "zh": "完整阅读最高并列，在情境中理解近分"
    },
    "paragraphs": [
      {
        "en": "Every creature with the highest count receives its complete report. No list order, extra question or payment breaks a tie. Choosing the same answer position throughout gives all six creatures three selections each: 6 × 3 = 18. This reflects the balanced option layout, not proof of six equally strong personality traits.",
        "zh": "同为最高计数的生物均显示完整报告，不通过名单顺序、额外题目或付费破同分。每题固定选同一位置，会让六种生物各得3次，6 × 3 = 18。这反映选项布局的平衡，不证明六种人格特质程度相等。"
      },
      {
        "en": "A one-count gap means one extra selection in this set. No measurement-error estimate or meaningful-difference threshold has been established. You may compare nearby guides, but the system does not merge unequal counts or assign permanent primary and secondary types. A later result can differ when your answers or reference situation change.",
        "zh": "差1次表示在本题组里多选了一次，目前没有建立测量误差估计或有意义差异阈值。你可以比较近分指南，但系统不会合并不同计数，也不指定永久主型和次型。回答或参照情境改变时，之后的结果也可能不同。"
      }
    ]
  },
  {
    "id": "initiative",
    "title": {
      "en": "Dragon, Phoenix and Unicorn: begin, revise or reimagine",
      "zh": "龙、凤凰与独角兽：开始、修改与另想可能"
    },
    "paragraphs": [
      {
        "en": "For a small creative project, Dragon may mean naming a first step, Phoenix changing the conditions of a previous version, and Unicorn asking what would happen with another premise. One person can use all three in sequence. The useful distinction is what they want to do next, rather than which creature has greater power or talent.",
        "zh": "面对一个小创作，龙可能体现为确定第一步，凤凰体现为改变旧版本的条件，独角兽体现为追问换一种前提会怎样。同一个人可以先后使用三种做法；有用的区别是下一步想怎么做，而不是哪种生物更有力量或天赋。"
      },
      {
        "en": "Phoenix does not establish resilience, recovery from trauma or an obligation to restart. Unicorn does not measure creative ability, originality or rarity. Dragon does not certify leadership. These questions ask about preferred responses, not demonstrated performance or the life experiences behind them.",
        "zh": "凤凰不判断韧性、创伤恢复，也不要求必须重新开始；独角兽不测创造能力、原创水平或稀有程度；龙不认证领导力。题目询问更愿意采用的做法，没有检验实际表现或背后的人生经历。"
      }
    ]
  },
  {
    "id": "sharing",
    "title": {
      "en": "Griffin, Mermaid and Kraken: agreements, feelings and privacy",
      "zh": "狮鹫、美人鱼与克拉肯：约定、感受与私人空间"
    },
    "paragraphs": [
      {
        "en": "Before sharing a piece of work, Griffin may favour checking what everyone agreed to, Mermaid naming how sharing feels, and Kraken choosing what remains private for now. These concerns can coexist. A clear agreement does not require emotional disclosure, and listening to a feeling does not require taking responsibility for resolving it.",
        "zh": "分享一件作品前，狮鹫可能更想核对共同约定，美人鱼更想说清分享时的感受，克拉肯更想决定哪些部分暂时保留。这些关注可以共存。明确约定不要求公开内心，倾听感受也不要求承担解决它的责任。"
      },
      {
        "en": "Griffin does not rank loyalty or moral character. Mermaid does not establish emotional intelligence or accurate insight into another mind. Kraken does not imply introversion, social difficulty or hidden genius. Ask about an actual preference before using a result to describe yourself or someone else.",
        "zh": "狮鹫不评定忠诚或品格，美人鱼不判断情商或能否准确读懂他人，克拉肯不意味着内向、社交困难或隐藏天才。用结果描述自己或别人前，应先核对实际偏好。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Separate folklore, the counting rule and measurement evidence",
      "zh": "区分神话文化、计数规则与测量证据"
    },
    "paragraphs": [
      {
        "en": "Mythical creatures have different depictions across stories and traditions. The American Museum of Natural History illustrates differences between Asian and European unicorn imagery. Such cultural descriptions document stories; they do not establish a universal psychological meaning for a creature. The six human preference assignments here are editorial choices, not claims that every tradition shares them. [1]",
        "zh": "神话生物在不同故事与传统中有不同形象。美国自然历史博物馆以亚洲与欧洲的独角兽意象说明其中差异。这类文化介绍记录的是故事，不建立某种生物的通用心理学含义。这里的六种人类偏好对应属于创作设定，不声称各传统都采用这些含义。[1]"
      },
      {
        "en": "This original quiz has no established reliability, validity or population norms. A reproducible calculation verifies a rule, not the existence of six stable personality types. Supporting that interpretation would require studies of these exact items, languages and proposed uses. Neither folklore nor research on a different questionnaire supplies that validation.",
        "zh": "这份原创问卷尚未建立信度、效度或人群常模。可复算的计算验证的是规则，不是六种稳定人格类型的存在。要支持这种解释，需要研究这些具体题目、语言与拟定用途；神话资料和其他问卷的研究均不能替代本题本的验证。"
      }
    ]
  },
  {
    "id": "application",
    "title": {
      "en": "Try one small change and look for a counterexample",
      "zh": "尝试一项小调整，同时保留反例"
    },
    "paragraphs": [
      {
        "en": "Choose a low-stakes activity and turn one result into a concrete request: agree on a first step, revise one condition, imagine an alternative, confirm an agreement, name a feeling or reserve a private part. Ask the other person what works for them. Afterwards, check what helped and what did not, rather than whether you behaved like the creature.",
        "zh": "可以选一次低风险活动，把结果转成具体请求：约定第一步、修改一个条件、设想替代方案、核对约定、说明感受或保留私人部分。同时问对方怎样安排更合适。之后观察哪里有帮助、哪里没有，而不是看自己是否表现得像生物标签。"
      },
      {
        "en": "Keep an example that fits the guide and another that does not. A private sketchbook and an open group discussion can suit different moments. The optional experiment promises no improvement in creativity, relationships or wellbeing; creature results provide no career fit, compatibility percentage or psychological diagnosis.",
        "zh": "保留一个符合指南的例子，也保留一个不符合的反例。私人速写本与开放的小组讨论可以分别适合不同场合。自愿尝试不承诺改善创造力、关系或身心状态，生物结果不提供职业适配、配对百分比或心理诊断。"
      }
    ]
  },
  {
    "id": "privacy",
    "title": {
      "en": "Start directly; decide separately whether to save",
      "zh": "直接进入题目，另行自愿选择保存"
    },
    "paragraphs": [
      {
        "en": "Start test opens the first question without an agreement checkbox, email or prerequisite assessment. Answers are counted in the current browser and are not included in the page URL or usage-event payloads. All eighteen questions, raw counts and complete matched guides are free.",
        "zh": "点击“开始测试”直接进入第一题，无需勾选同意、填写邮箱或先做其他测评。答案在当前浏览器计数，不进入网址或使用事件载荷。全部18题、原始计数与完整匹配指南均免费。"
      },
      {
        "en": "After starting, draft saving is optional for this tab and lasts up to 24 hours. It supports refresh and language change, and clears on completion, retake or exit-and-clear. Sharing copies creature names and a public link, not your responses or counts. A public guide describes the result generally and does not recreate a private attempt.",
        "zh": "开始后可以主动保存本标签页草稿，最多保留24小时，支持刷新与换语言恢复，并在完成、重测或退出清除时删除。分享复制生物名称与公开链接，不包含回答或计数。公开指南介绍通用结果，不还原私人作答。"
      }
    ]
  }
];
export const mythicalCreatureFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Is this a mythology knowledge quiz?",
      "zh": "这是神话知识考试吗？"
    },
    "answer": {
      "en": "No. You choose responses to everyday creative and conversational situations. No creature facts are marked correct, and knowing more myths does not improve a score.",
      "zh": "不是。题目让你选择日常创作与交流中的做法，不判断神话知识是否正确，了解更多传说也不会提高得分。"
    }
  },
  {
    "question": {
      "en": "Does 6 / 12 mean a 50% match?",
      "zh": "6 / 12是不是50%的匹配度？"
    },
    "answer": {
      "en": "It means six selections from twelve appearances of that creature. The six counts total eighteen. It is not a calibrated similarity score or a population rank.",
      "zh": "它表示该生物在选项中出现十二次、被选六次。六项计数合计18，不是经过校准的相似度分数或人群排名。"
    }
  },
  {
    "question": {
      "en": "Can all six creatures share the highest count?",
      "zh": "六种生物可以同时最高吗？"
    },
    "answer": {
      "en": "Yes. Choosing the same position on all eighteen questions gives three selections to each creature. All six complete reports remain visible; the system does not choose one at random.",
      "zh": "可以。18题固定选择同一位置，六项会各得3次，六份完整报告均保留，不随机挑选一项。"
    }
  },
  {
    "question": {
      "en": "Does Phoenix mean I have overcome adversity?",
      "zh": "凤凰结果意味着我已经战胜逆境吗？"
    },
    "answer": {
      "en": "No. Its options concern revising or returning to an earlier attempt. The quiz does not assess adversity, trauma, recovery or resilience, and stopping an activity remains a possible real-life choice.",
      "zh": "不是。相关选项讨论修改或重新处理已有尝试，不评估逆境、创伤、恢复或韧性；在现实中停止一项活动仍然可以是自己的选择。"
    }
  },
  {
    "question": {
      "en": "Does a Mermaid result prove high EQ?",
      "zh": "美人鱼结果能证明情商高吗？"
    },
    "answer": {
      "en": "No. Choosing to discuss feelings does not demonstrate accurate emotion recognition, empathy or relationship skill. A creature count cannot be converted to an EQ scale.",
      "zh": "不能。愿意交流感受不证明情绪识别准确、共情或关系技巧出色，生物计数不能换算为EQ量表分数。"
    }
  },
  {
    "question": {
      "en": "Are these Jungian archetypes or MBTI types?",
      "zh": "这是荣格原型或MBTI类型吗？"
    },
    "answer": {
      "en": "No. The six assignments are original themes for these eighteen questions. The quiz does not administer a Jungian instrument, MBTI axes or Big Five traits, and provides no conversion between them.",
      "zh": "不是。这六种对应是这18题的原创主题，没有施测荣格相关量表、MBTI偏好轴或大五特质，也不提供相互换算。"
    }
  },
  {
    "question": {
      "en": "Is the least-selected creature a missing part of me?",
      "zh": "选得最少的生物意味着我缺少那一面吗？"
    },
    "answer": {
      "en": "No. It received fewer choices among the particular alternatives offered. A low count does not establish a deficit, a suppressed trait or something you need to develop. Compare actual situations instead.",
      "zh": "不是。它只是在给定选项之间较少被选中，低计数不证明缺陷、被压抑的特质或必须补足的部分，应回到具体情境比较。"
    }
  },
  {
    "question": {
      "en": "Must I agree to save before answering?",
      "zh": "答题前必须同意保存吗？"
    },
    "answer": {
      "en": "No. Start test opens question one directly. Saving is optional after starting, and blocked storage does not prevent completion or access to full results.",
      "zh": "不需要。开始测试直接打开第一题，保存是开始后的自愿选项，存储被禁用也不妨碍完成与查看完整结果。"
    }
  }
];
export const mythicalCreatureSummaries: Record<string, Text> = {
  "dragon": {
    "en": "Choose a direction and begin: make a first step discussable without treating initiative as authority.",
    "zh": "确定方向并开始：把第一步说具体，不让主动变成替别人决定。"
  },
  "phoenix": {
    "en": "Revise an earlier attempt: change one condition while keeping permission to pause or stop.",
    "zh": "调整已有尝试：修改一个条件，同时保留暂停或停止的选择。"
  },
  "unicorn": {
    "en": "Open another possibility: explore a different premise before deciding what to develop.",
    "zh": "打开另一种可能：先试着换一个前提，再决定哪些想法值得展开。"
  },
  "griffin": {
    "en": "Clarify shared agreements: check willingness and responsibility without taking over.",
    "zh": "确认共同约定：核对意愿与责任，不替别人包办。"
  },
  "mermaid": {
    "en": "Discuss feelings: leave room for mixed emotions without claiming to read another mind.",
    "zh": "交流感受：给复杂情绪留位置，不认定自己能读懂别人。"
  },
  "kraken": {
    "en": "Organise privately: decide what is ready to share and what can remain unfinished.",
    "zh": "私下整理：决定哪些已经愿意分享，哪些可以暂时未完成。"
  }
};
