import type { Questionnaire } from "@/lib/questionnaires/types";
export const wetonStorySections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "Weton stories: two ways to explore, with different inputs",
      "zh": "Weton故事：两种探索，使用不同输入"
    },
    "paragraphs": [
      {
        "en": "The story quiz asks what contribution or focus you would like to try in 35 fictional scenes. It compares seven original weekday roles and five original pasaran lenses. The optional date tool is a separate calendar reference: it reads a Gregorian date and your stated relation to local sunset, without using your story choices.",
        "zh": "故事问卷询问你在35个虚构场景中想尝试怎样的贡献或关注，比较七个原创星期角色与五个原创市日视角。可选日期工具则独立提供历法参考：读取公历日期及你明确提供的当地日落关系，不使用故事选择。"
      },
      {
        "en": "You can complete the quiz without a birthdate or use the calendar without completing the quiz. All 35 eight-section story guides are public in English and Chinese. A matching title is a reading route through original fiction, not evidence that a day of birth determines character.",
        "zh": "可以不提供生日完成问卷，也可以不做问卷直接使用历法。35篇八节故事指南均以中英文公开；匹配标题是阅读原创故事的入口，不证明出生日决定性格。"
      }
    ]
  },
  {
    "id": "culture",
    "title": {
      "en": "Seven weekdays, five pasaran and a 35-day cycle",
      "zh": "七个星期日、五个市日与35日循环"
    },
    "paragraphs": [
      {
        "en": "The Sonobudoyo Museum describes saptawara, a seven-day cycle, and pancawara, the five pasaran days. The cycles run alongside one another. A seven-day cycle and a five-day cycle return to the same pairing after 35 days; this arithmetic explains the size of a calendar pairing set, not a set of psychological types. [3]",
        "zh": "Sonobudoyo博物馆介绍了七日循环saptawara，以及由五个市日构成的pancawara，两者并行。七日与五日循环在35天后回到相同组合；这项算术解释历日组合集合的大小，不建立一套心理类型。[3]"
      },
      {
        "en": "This edition uses Senin through Minggu as indexes for Recorder, Mender, Host, Mapper, Storyteller, Maker and Broker. Legi, Pahing, Pon, Wage and Kliwon index Arrival, Agreement, Memory, Resources and Perspectives. These role and lens assignments are FermatMind inventions, not translations of traditional temperaments.",
        "zh": "本版以Senin至Minggu索引留存者、修补者、迎接者、联图者、叙事者、试作者与协商者；Legi、Pahing、Pon、Wage和Kliwon索引初来、约定、记忆、物用与众声。这些角色及视角配对是费马创作，不是传统性格的翻译。"
      }
    ]
  },
  {
    "id": "counts",
    "title": {
      "en": "Why the 21-choice and 14-choice banks stay separate",
      "zh": "为何21题与14题分别计数"
    },
    "paragraphs": [
      {
        "en": "The first 21 scenes each offer three scored role alternatives and an unscored option. Each of the seven roles appears nine times. The next 14 scenes each offer all five scored lenses and an unscored option; each lens appears fourteen times. One scored choice adds one count only to the selected key.",
        "zh": "前21个场景各提供三个计分角色选项及一个未评分选项，七个角色各出现九次。后14个场景各提供五个计分视角及一个未评分选项，五个视角各出现十四次。一次计分选择只给所选键增加一次。"
      },
      {
        "en": "With every answer scored, role counts add to 21 and lens counts add to 14. A role count of four means four selections among its nine appearances, not four personality points or a population percentile. The banks have different questions and opportunities, so their raw counts do not form one shared ranking.",
        "zh": "全部回答均计分时，角色次数合计21，视角次数合计14。某角色四次，表示它在九次出现机会中被选四次，不是四个人格点数或人群百分位。两组的问题和机会不同，原始次数不组成一份共同排名。"
      }
    ]
  },
  {
    "id": "ties",
    "title": {
      "en": "Every highest role pairs with every highest lens",
      "zh": "全部最高角色与全部最高视角交叉配对"
    },
    "paragraphs": [
      {
        "en": "If two roles share the highest count and three lenses share the highest count, all six role–lens pairings remain. A tie is not broken by display position, alphabet, birthdate or a random draw. The result opens each matching guide in full, including its scene, contrasting example and reading context.",
        "zh": "如果两个角色同为最高，三个视角同为最高，就保留全部六个角色与视角组合。并列不按显示位置、字母、生日或随机抽取打破；结果完整展开每份匹配指南，包括场景、反例及阅读背景。"
      },
      {
        "en": "The library contains 35 possible pairings, but one completed attempt cannot lead all 35 at once. All seven roles can tie at three choices each; all five lenses cannot tie for 14 integer choices, since 14 is not divisible by five. The largest attainable cross in this edition is seven roles by four lenses, or 28 complete guides.",
        "zh": "公开库有35种组合，但一次完整作答不能同时最高匹配全部35种。七角色可以各选三次并列；14次整数选择无法由五个视角等分，因此五视角不能全部并列。本版最大可实现交叉为七角色乘四视角，即28篇完整指南。"
      }
    ]
  },
  {
    "id": "unscored",
    "title": {
      "en": "An unscored choice preserves a genuine gap",
      "zh": "未评分保留真实缺口"
    },
    "paragraphs": [
      {
        "en": "Choose unscored when none of the alternatives fits or you do not want to choose. All 35 questions still need a response to finish. If even one response is unscored, this edition withholds every personal count, leader and match in both banks instead of filling the gap or ranking a partial bank.",
        "zh": "没有合适选项或不想选择时，可以选未评分。完成仍需回应全部35题；只要一题未评分，本版就暂不显示两组全部个人计数、最高键和匹配，不补齐缺口，也不按部分题组排名。"
      },
      {
        "en": "An all-unscored attempt may finish without a personal pairing. Every public guide remains readable without answering again. The absence of a match is not a statement about your identity, cultural belonging or ability to contribute. Alternatives shuffle after Start and retain the same order when you return to edit.",
        "zh": "全部未评分也可以完成，只是不产生个人配对；无需补答就能阅读全部公开指南。没有匹配不评价身份、文化归属或贡献能力。开始后选项打乱，返回修改时保持同一顺序。"
      }
    ]
  },
  {
    "id": "calendar",
    "title": {
      "en": "Date arithmetic and the local-sunset question",
      "zh": "日期运算与当地日落关系"
    },
    "paragraphs": [
      {
        "en": "The optional tool accepts Gregorian dates from 1900 through 2099. Known before sunset uses the entered civil date; known at or after sunset uses the following date. Unknown retains both possibilities. The cited Salatiga publication describes a sunset day boundary; the tool asks for that relation rather than guessing an astronomical sunset or device timezone. [5]",
        "zh": "可选工具接受1900至2099年的公历日期。明确在日落前时使用输入公历日，明确在日落或之后时使用后一天；未知就保留两种可能。所引Salatiga出版物描述日落日界；工具询问这一关系，不猜天文日落或设备时区。[5]"
      },
      {
        "en": "The historical reference 17 August 1945 is Jumat Legi. With the before-sunset convention it has the conventional sum 6 + 5 = 11; the following date gives Sabtu Pahing, 9 + 9 = 18. These are calendar labels and conventional sums, not better or worse outcomes. BMKG’s May 2026 table provides another date reference, such as 1 May: Jumat Pon. [1][2]",
        "zh": "历史参考1945年8月17日为Jumat Legi。按日落前口径，传统相加为6＋5＝11；后一天为Sabtu Pahing，9＋9＝18。这些是历日名称及传统加数，不代表结果更好或更坏。BMKG的2026年五月表提供另一日期参考，例如5月1日为Jumat Pon。[1][2]"
      }
    ]
  },
  {
    "id": "reading",
    "title": {
      "en": "Read an original scene and its contrasting example",
      "zh": "同时阅读原创场景与反例"
    },
    "paragraphs": [
      {
        "en": "A Senin Legi reading, for example, begins with a newcomer finding an unsigned label beside a borrowed lantern. Read what the scene invites you to notice, then the contrasting scene and the practical question. A preferred story contribution can vary with the imagined situation and need not describe your everyday behaviour.",
        "zh": "例如Senin Legi读法从新来者在借来灯笼旁发现未署名标签开始。可以先读场景邀请关注什么，再看反例与具体提问。喜欢的故事贡献会随想象情境变化，不必描述自己日常行为。"
      },
      {
        "en": "Compare a nearby guide because its story interests you, rather than treating a count difference as a measured personality distance. Calendar agreement does not confirm the story, and disagreement does not invalidate either task. Neither route predicts relationships, health, fortune, occupational ability or a personal lucky direction.",
        "zh": "可以因为故事有趣而比较相邻指南，不把次数差当成人格距离的测量。历法与故事相同不验证故事，不同也不使任何一项任务失效。两条路径都不预测关系、健康、运势、职业能力或个人吉利方位。"
      }
    ]
  },
  {
    "id": "evidence-privacy",
    "title": {
      "en": "Cultural evidence, mathematical checks and private inputs",
      "zh": "文化证据、运算核对与私人输入"
    },
    "paragraphs": [
      {
        "en": "Calendar tables and historical descriptions can support a named date, cycle or convention. Reproducible counting verifies what the website computes. Neither establishes that the original story assignments measure stable traits: this edition has no established psychometric norms, predictive validity or demonstrated English–Chinese measurement equivalence.",
        "zh": "历表与历史描述可以支持具体日期、循环或约定；可复算计数可以核对网站算了什么。两者都不建立原创故事配对测量稳定特质的证据：本版尚无心理测量常模、预测效度或验证过的中英文测量等值。"
      },
      {
        "en": "Answers and the optional date stay in current-page memory. There is no saved draft, quiz-flow analytics or private-result sharing; refreshing or changing language starts fresh. Retake and Exit and clear discard both the story answers and calendar inputs. You can use an example date instead of a birthday, and reading guides requires neither.",
        "zh": "答案与可选日期留在当前页面内存，不保存草稿、不作测试流程统计，也不分享私人结果；刷新或换语言重新开始。重测和退出清除同时丢弃故事回答与历法输入。可以用示例日代替生日，阅读指南则两者都不需要。"
      }
    ]
  }
];
export const wetonStoryFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Are the seven roles traditional weekday personalities?",
      "zh": "七角色是传统星期人格吗？"
    },
    "answer": {
      "en": "No. Recorder, Mender, Host, Mapper, Storyteller, Maker and Broker are original story roles assigned by FermatMind. Calendar names do not make them traditional or validated personality types.",
      "zh": "不是。留存者、修补者、迎接者、联图者、叙事者、试作者和协商者是费马原创故事角色；使用历日名称不使它们成为传统或验证过的人格类型。"
    }
  },
  {
    "question": {
      "en": "Can I use an example date without answering the quiz?",
      "zh": "能不做问卷只输入示例日期吗？"
    },
    "answer": {
      "en": "Yes. The calendar is optional and independent. Enter any valid supported date and choose a sunset relation only if known. It does not unlock or change a story result.",
      "zh": "可以。历法可选且独立，可以输入范围内任何有效日期；只在确知时选择日落关系。它不解锁或改变故事结果。"
    }
  },
  {
    "question": {
      "en": "Why are the denominators nine and fourteen?",
      "zh": "为什么分母分别为九与十四？"
    },
    "answer": {
      "en": "Each role is offered nine times in the first 21 questions; each lens appears in all 14 later questions. They describe different opportunities, not a common score scale.",
      "zh": "前21题每个角色出现九次，后14题每个视角都出现；两者描述不同的机会，不构成共同分数刻度。"
    }
  },
  {
    "question": {
      "en": "How many guides open for two highest roles and three highest lenses?",
      "zh": "两个最高角色与三个最高视角会展开几篇？"
    },
    "answer": {
      "en": "Six. The result keeps every role–lens cross and opens all six complete guides rather than choosing one favourite.",
      "zh": "六篇。结果保留每个角色与视角的交叉，完整展开六篇，不替你挑一个最喜欢的。"
    }
  },
  {
    "question": {
      "en": "Can all 35 guides be the highest matches in one attempt?",
      "zh": "一次能最高匹配全部35篇吗？"
    },
    "answer": {
      "en": "No. The library contains 35 pairings, but the 14 lens choices cannot divide equally among five lenses. The largest attainable cross for this edition is seven by four, giving 28 guides.",
      "zh": "不能。库中有35种配对，但14次视角选择不能由五视角等分。本版最大可实现交叉为七乘四，产生28篇指南。"
    }
  },
  {
    "question": {
      "en": "Does neptu 18 mean more ability than neptu 11?",
      "zh": "neptu为18比11更有能力吗？"
    },
    "answer": {
      "en": "No. Neptu adds conventional weekday and pasaran values. It is not an ability, health, energy or compatibility measurement, and it does not enter story scoring.",
      "zh": "不是。neptu相加传统星期与市日数值，不测能力、健康、能量或匹配，也不参与故事计分。"
    }
  },
  {
    "question": {
      "en": "Can the tool find sunset from my device or location?",
      "zh": "工具会用设备或位置计算日落吗？"
    },
    "answer": {
      "en": "No. It takes your explicit before, after or unknown relation. Unknown retains two date references; no fixed hour or timezone is substituted.",
      "zh": "不会。它接受明确提供的之前、之后或未知关系；未知保留两个历日参考，不代入固定钟点或时区。"
    }
  },
  {
    "question": {
      "en": "Is there an agreement step before the first scene?",
      "zh": "第一题前还有同意步骤吗？"
    },
    "answer": {
      "en": "No. Start opens the first fictional choice directly. There is no birthday requirement or agreement checkbox; all public guides can be read without taking the quiz.",
      "zh": "没有。点击开始直接进入第一道虚构选择，不要求生日或勾选同意；无需做问卷也能读全部公开指南。"
    }
  }
];
