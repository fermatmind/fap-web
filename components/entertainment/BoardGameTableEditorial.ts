import type { Copy, FunFaq } from "@/lib/entertainment/types";
export const boardGameTableSections: {id:string;title:Copy;paragraphs:Copy[]}[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Board-game role quiz: what do you bring to a mixed-experience table?",
      "zh": "桌游同桌角色测试：你会给这一桌带来什么？"
    },
    "paragraphs": [
      {
        "en": "Six imagined game-night choices explore three contributions: explaining a usable turn, finding an interesting contest and welcoming different levels of experience. The setting is a friendly board game with no money at stake. You do not need to know a particular title or own any equipment.",
        "zh": "六个想象中的桌游夜选择，探索三种贡献：讲清可操作的回合、寻找有趣较量，以及接纳不同熟练度。场景是不涉及金钱的友好桌游，无需熟悉特定游戏或拥有设备。"
      },
      {
        "en": "Choose the action you would enjoy in each scene, rather than the one that sounds most impressive. Explaining, challenging and welcoming can all belong to the same person. The outcome summarises these six choices, not a permanent assignment to teach, win or look after the group.",
        "zh": "每个场景选自己会喜欢做的事，不必选听起来最出色的一项。同一个人可以解释、挑战，也可以照应别人。结果概括六次选择，不永久分配教学、获胜或照顾全桌的任务。"
      }
    ]
  },
  {
    "id": "explaining",
    "title": {
      "en": "Explain a turn without taking another player’s turn",
      "zh": "讲清一个回合，也把选择留给玩家"
    },
    "paragraphs": [
      {
        "en": "The explaining choices concern concrete examples, relevant rules and legal options. A short demonstration can show what an ordinary turn contains; it need not reveal every unusual interaction before anyone has tried the game. Ask what remains unclear instead of treating silence as proof of understanding.",
        "zh": "解释选项关注具体示例、相关规则与合法选项。短演示可以展示普通回合包含什么，不必在大家尚未尝试时穷尽所有特殊关联。可以问还有哪里不清楚，而非把沉默当作已经理解。"
      },
      {
        "en": "Showing two permitted actions is different from choosing the strategically best action for someone. Offer a suggestion when wanted, then let the player decide. A high explaining count describes a selected contribution; the quiz does not observe teaching accuracy or certify teaching ability.",
        "zh": "说明两种允许的动作，与替人决定哪步策略最好，是两件事。在对方希望时提供建议，再让其自己决定。解释次数较高描述选中的贡献，本测试没有观察教学准确性或认证教学能力。"
      }
    ]
  },
  {
    "id": "challenge",
    "title": {
      "en": "Seek an interesting contest, with an agreed level of intensity",
      "zh": "寻找有趣较量，先约好竞争程度"
    },
    "paragraphs": [
      {
        "en": "The challenge choices involve a comeback puzzle, a surprising interaction, a new opening or a constraint everybody accepts. Enjoying those choices does not necessarily mean wanting to win at all costs. An uncertain contest can be enjoyable even when your final score is lower.",
        "zh": "挑战选项涉及追赶的难题、意外关联、新开局或大家接受的限制。喜欢这些选择，不一定代表不惜代价求胜。即使最终分数较低，胜负未定的过程也可以有趣。"
      },
      {
        "en": "Before a rematch, ask whether the group wants practice, a close contest or a lighter finish. A new restriction becomes a shared variant only when everyone agrees; it is not automatically a published rule. The count cannot establish strategic expertise, intelligence, sportsmanship or likely win rate.",
        "zh": "重赛前可以问：大家想练习、认真较量，还是轻松收尾？新增限制经大家同意才成为共同采用的变体，不会自动成为正式规则。次数无法判定策略水平、智力、体育精神或预期胜率。"
      }
    ]
  },
  {
    "id": "welcoming",
    "title": {
      "en": "Welcome different experience levels without monitoring every mood",
      "zh": "让不同经验的人同桌，也给彼此留空间"
    },
    "paragraphs": [
      {
        "en": "Welcoming choices ask how much explanation, practice, thinking time or help somebody wants. A beginner may want a hint, two legal options or simply time to try. Asking makes these alternatives visible without assuming that every pause signals frustration.",
        "zh": "照应选项询问对方需要多少说明、练习、思考时间或帮助。新手可能想要提示、两种合法选项，或只是自己试一试。直接询问让这些选择可见，不把每次停顿都理解为受挫。"
      },
      {
        "en": "An agreed help signal can replace repeated check-ins. You can participate yourself, ask for a break or decline the host role. The welcoming portrait does not make you responsible for everybody’s mood, prove greater empathy or rank your value as a friend.",
        "zh": "约定一个求助信号，可以代替反复询问。你也可以投入游戏、提出休息，或不担任主持。照应画像不要求你负责所有人的心情，不证明共情更强，也不排列朋友价值。"
      }
    ]
  },
  {
    "id": "scoring",
    "title": {
      "en": "Six one-point choices, three totals and every highest tie",
      "zh": "六次单点选择、三项次数与全部最高并列"
    },
    "paragraphs": [
      {
        "en": "Each question offers one option for each portrait. Selecting an option adds one point to that portrait. After all six questions, each total lies between zero and six and the three totals add to six. There are no correct answers, hidden weights or random outcome draws.",
        "zh": "每题为三种画像各提供一个选项。选中某项，对应画像加1次。六题完成后，每项0至6次，三项合计6次。没有标准答案、隐藏权重或随机抽取结果。"
      },
      {
        "en": "Every portrait with the largest total appears. Explaining 3, challenging 3, welcoming 0 retains the first two; 2–2–2 retains all three. The explainer, challenger, welcomer order arranges explanations only. A one-point lead means one more choice here, not a statistically significant personal difference.",
        "zh": "所有达到最高次数的画像均显示。解释3、挑战3、照应0保留前两种；2—2—2保留三种。解释、挑战、照应顺序只安排说明。领先1次表示本题组多选1次，不表示个体差异达到统计显著。"
      }
    ]
  },
  {
    "id": "combinations",
    "title": {
      "en": "Read a combination as complementary actions, not a fixed team role",
      "zh": "把组合读成可以搭配的行动，而非固定团队角色"
    },
    "paragraphs": [
      {
        "en": "An explainer–challenger tie might suggest showing the available actions and then discussing a competitive tradeoff. An explainer–welcomer tie might suggest one demonstration followed by asking how much more help is wanted. These are optional illustrations, not extra measured traits.",
        "zh": "解释与挑战并列，可以联想到先展示可选动作，再讨论竞争走法的取舍；解释与照应并列，可以联想到演示一次后询问还想要多少帮助。这些是可选的说明例子，没有新增测得的特质。"
      },
      {
        "en": "Challenging and welcoming can coexist: agree on a practice round before trying a tougher rematch. A three-way tie retains all contributions without assigning equal real-world ability. A zero count means another offered action was chosen each time; it does not establish that a contribution is absent from your life.",
        "zh": "挑战与照应可以并存：先约练习局，再尝试更有挑战的重赛。三项并列保留所有贡献，不分配相等的现实能力。0次表示每次选了另一个给定动作，不证明生活中缺少该贡献。"
      }
    ]
  },
  {
    "id": "rules",
    "title": {
      "en": "Keep published rules, temporary rulings and strategy separate",
      "zh": "区分正式规则、临时判法与策略建议"
    },
    "paragraphs": [
      {
        "en": "For an actual game, use the publisher’s instructions for the title and edition on the table. Gigamic directs players to the supplied rulebook, game-page downloads and relevant instructional videos. Days of Wonder provides language-specific rulebooks and distinguishes older rules on its Ticket to Ride page. [1] [2]",
        "zh": "实际游戏应按桌上具体作品及版本核对出版商说明。Gigamic指向随盒规则书、游戏页下载与对应教学视频；Days of Wonder的《车票之旅》页面提供分语言规则书，并区分旧规则。[1] [2]"
      },
      {
        "en": "If a rule remains unclear, identify the disputed situation and agree whether to pause or use an explicitly temporary ruling. Settle the reference afterward. This is a suggested table practice, not a replacement rule for any named game; fair handling depends on the game and information already revealed.",
        "zh": "规则仍不清楚时，先说清争议情境，再共同决定暂停，或明确采用临时判法，之后核对依据。这是同桌协商建议，不替代任何具名游戏的规则；怎样处理合适，还取决于具体游戏与已经公开的信息。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "What player research can establish, and what this quiz actually records",
      "zh": "玩家研究可以说明什么，本测试实际记录什么"
    },
    "paragraphs": [
      {
        "en": "Quantic Foundry describes developing a board-game motivation inventory through item generation, participant recruitment and factor analysis, and discusses why tabletop genres needed separating. That is a different research programme with its own items and reference sample. It does not validate these six questions or make our three portraits interchangeable with its motivation scores. [3]",
        "zh": "Quantic Foundry说明了桌游动机题目生成、参与者招募与因素分析过程，也讨论了为何要区分不同桌面游戏类型。这是题目与参照样本均不同的研究，不能验证本站六题，也不能让三种画像与其动机分数互换。[3]"
      },
      {
        "en": "This is an original entertainment tally, without supplied reliability, validity or population norms. Reproducible arithmetic verifies how choices become counts; it does not prove stable personality measurement. No observed move quality, teaching performance, emotional skill or team outcome is tested, and no MBTI or EQ conversion is produced.",
        "zh": "本页是原创娱乐计数，不提供信度、效度或人群常模。算术可复现验证选择怎样形成次数，不证明稳定人格测量。本测试没有考察实际走法质量、教学表现、情绪技能或团队成果，也不换算MBTI或EQ。"
      }
    ]
  },
  {
    "id": "context",
    "title": {
      "en": "Use one table as the reference, then check a concrete example",
      "zh": "先以一桌游戏为参照，再核对具体经历"
    },
    "paragraphs": [
      {
        "en": "An unfamiliar rulebook, a familiar group, time pressure and a competitive tournament can invite different actions. Answer these friendly scenes on their own terms rather than switching between those settings to produce a preferred label. Little game experience is fine: you can answer imaginatively.",
        "zh": "陌生规则书、熟悉朋友、时间压力与竞技比赛，可能引出不同做法。请按这些友好场景本身作答，不必在多个情境间切换来获得喜欢的标签。没有多少桌游经验也没关系，可以凭想象选择。"
      },
      {
        "en": "After reading a portrait, recall one occasion that fits and one that does not. Ask a companion about a specific interaction instead of asking them to endorse your type. A different retest result can reflect changed selections or context; this short game cannot distinguish personality change from response variation.",
        "zh": "读完画像，可以回想一次符合、一次不符合的经历。问同伴某次具体互动如何，而非要求其认可你的类型。重测不同可能来自选择或情境变化，这个短游戏无法区分人格改变与作答波动。"
      }
    ]
  },
  {
    "id": "practice",
    "title": {
      "en": "Try one small contribution and keep participation voluntary",
      "zh": "自选一个小贡献，自主决定参与与分享"
    },
    "paragraphs": [
      {
        "en": "At the next casual game, choose one small action: demonstrate a turn, discuss one tradeoff after play, or ask once how help should be offered. Check whether it was useful and adjust. These prompts illustrate choices; they do not promise better cognition, closer friendships or a more successful group.",
        "zh": "下次休闲桌游可以自选一个小行动：演示一个回合、赛后讨论一个取舍，或问一次希望怎样获得帮助。再核对是否有用并调整。这些提示说明选择，不承诺提升认知、友谊或群体表现。"
      },
      {
        "en": "Start opens question one directly. Saving progress is optional and limited to this tab for up to twenty-four hours; completion, retake or exit-and-clear removes it. Copying shares leading portrait names and public guide links, excluding answers and counts. Another assessment is never required to finish.",
        "zh": "点击开始直接进入第一题。保存进度是自愿选择，只在本标签页保留最多二十四小时；完成、重测或退出清除即删除。复制分享最高画像名称与公开指南链接，不含答案与次数。完成本页不要求再做另一测评。"
      }
    ]
  }
];
export const boardGameTableFaq: FunFaq[] = [
  {
    "question": {
      "en": "Do I need board-game experience?",
      "zh": "需要桌游经验吗？"
    },
    "answer": {
      "en": "No. Imagine a friendly game with new and familiar players. You choose a contribution, without identifying a real game or solving a rules question.",
      "zh": "不需要。想象与新老玩家友好同桌，选择想做的贡献，不需要识别游戏或解答实际规则题。"
    }
  },
  {
    "question": {
      "en": "How long does it take, and what is free?",
      "zh": "需要多久，哪些内容免费？"
    },
    "answer": {
      "en": "Six three-option questions take about two minutes, without a time limit. All counts, highest ties and three full public portraits are free, with no registration.",
      "zh": "六道三选一约两分钟，不限时。全部次数、最高并列与三篇公开全文免费，无需注册。"
    }
  },
  {
    "question": {
      "en": "Why can I receive two or three portraits?",
      "zh": "为什么会得到两种或三种画像？"
    },
    "answer": {
      "en": "All totals tied at the highest value remain. A 3–3–0 result retains two; 2–2–2 retains three. Display order does not break the tie.",
      "zh": "同为最高的次数全部保留。3—3—0保留两种，2—2—2保留三种；显示顺序不破同分。"
    }
  },
  {
    "question": {
      "en": "Does a high challenger count mean I am the strongest player?",
      "zh": "挑战次数高，表示我是最强玩家吗？"
    },
    "answer": {
      "en": "No. It records challenge-related choices, not wins, legal-move accuracy or strategic performance. It provides neither a rating nor a prediction of success.",
      "zh": "次数记录挑战相关选择，没有记录胜场、走法正确率或策略表现，不提供等级或成功预测。"
    }
  },
  {
    "question": {
      "en": "Does explaining mean giving everyone the best move?",
      "zh": "解释就是告诉所有人最佳走法吗？"
    },
    "answer": {
      "en": "No. Explaining available legal actions can leave the decision with the player. Ask before offering strategic advice, and respect a request for time to try independently.",
      "zh": "解释允许的动作，也可以把决定留给玩家。提供策略建议前先询问，并尊重对方想独立尝试的时间。"
    }
  },
  {
    "question": {
      "en": "Must a welcoming player host or keep everybody happy?",
      "zh": "照应者必须主持或让所有人开心吗？"
    },
    "answer": {
      "en": "No. The portrait describes checking preferences, not a permanent responsibility. Agree on a help signal and allow yourself to enjoy the game or take a break.",
      "zh": "画像描述询问偏好，不分配永久责任。可以约求助信号，也允许自己享受游戏或休息。"
    }
  },
  {
    "question": {
      "en": "What if my result feels unlike me?",
      "zh": "结果不像自己怎么办？"
    },
    "answer": {
      "en": "Compare it with the six specific choices and your recent experience. Keep useful examples and set aside descriptions that do not fit; the outcome is not an identity you must accept.",
      "zh": "对照六次具体选择与近期经历，保留有用例子，不符合的描述可以放下；结果不是必须接受的身份。"
    }
  },
  {
    "question": {
      "en": "Is this a validated player-motivation scale?",
      "zh": "这是经过验证的玩家动机量表吗？"
    },
    "answer": {
      "en": "No. These original story choices have no supplied psychometric validation or norms. Research on another inventory cannot establish the quality of this one.",
      "zh": "不是。这些原创故事选择不提供心理测量验证或常模；另一题本的研究不能证明本题本的测量质量。"
    }
  },
  {
    "question": {
      "en": "Can the result recommend a particular game or teammate?",
      "zh": "结果可以推荐特定游戏或队友吗？"
    },
    "answer": {
      "en": "It does not calculate compatibility or rank products. Discuss actual interests, available time, experience and desired intensity together rather than assigning people by portrait.",
      "zh": "本页不计算契合度或排列产品。可以共同讨论真实兴趣、时间、经验与期望强度，不按画像分配同桌。"
    }
  },
  {
    "question": {
      "en": "Will starting require an agreement or another test?",
      "zh": "开始前需要勾选同意或做其他测试吗？"
    },
    "answer": {
      "en": "No. Start takes you directly to question one. Progress saving is optional during answering; all six questions and the complete result remain available without it.",
      "zh": "不需要。开始直接进入第一题，作答时可自愿保存进度；不保存也可完成六题并查看完整结果。"
    }
  },
  {
    "question": {
      "en": "What is saved or copied when I share?",
      "zh": "会保存什么，分享会复制什么？"
    },
    "answer": {
      "en": "Optional tab progress expires after twenty-four hours and clears on completion, retake or exit-and-clear. Copying includes leading portrait names and public links, not your six answers or counts.",
      "zh": "自愿保存的标签页进度二十四小时后失效，完成、重测或退出清除即删除。复制包含最高画像名称与公开链接，不含六条答案与次数。"
    }
  }
];
